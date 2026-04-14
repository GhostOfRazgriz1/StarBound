import type { LLMProvider } from '../llm/providers/base'
import type { Scenario, GameAction, RunState, ShipClassId } from '../types/game'
import type { SectorPreview, PirateEncounter } from '../types/encounters'
import type { Equipment } from '../types/equipment'
import type { FOArchetype } from '../types/fo'
import { useGameStore } from '../storage/game-store'
import { loadFOMemory, saveFOMemory, saveRunToLifetimeStats, saveStandingOrders, saveArtifact } from '../storage/cross-run'
import { generateSectorPreviews, generateSector } from '../generation/sector'
import { generateArrivalNarration } from '../generation/narration'
import { resolveAction, resolveCombat } from '../generation/action-resolver'
import { compressSector } from '../generation/compressor'
import { generateCaptainAnalysis, type CaptainAnalysis } from '../generation/captain-profile'
import { createLLMProvider } from '../llm/client'
import { RETREAT_COSTS } from '../config'

function getProvider(): LLMProvider {
  const config = useGameStore.getState().llmConfig
  if (!config) throw new Error('No LLM config set')
  return createLLMProvider(config)
}

function getFOMemory() {
  return useGameStore.getState().foMemory
}

export async function initializeRun(
  scenario: Scenario,
  foArchetype: FOArchetype,
  shipClassId: ShipClassId,
  encounterDepth: 'standard' | 'deep',
  provisioning?: { fuel: number; supplies: number; credits: number },
): Promise<void> {
  const store = useGameStore.getState()

  // Load FO memory
  const foMemory = loadFOMemory(foArchetype)
  store.setFOMemory(foMemory)

  // Start the run
  store.startRun(scenario, foArchetype, shipClassId, encounterDepth)

  // Apply provisioning immediately (before async sector generation)
  if (provisioning) {
    const run = useGameStore.getState().run
    if (run) {
      useGameStore.setState({
        run: {
          ...run,
          ship: {
            ...run.ship,
            fuel: provisioning.fuel,
            supplies: provisioning.supplies,
            credits: provisioning.credits,
          },
        },
      })
    }
  }

  // Generate first sector options
  await generateAndSetSectorOptions()
}

export async function generateAndSetSectorOptions(): Promise<void> {
  const store = useGameStore.getState()
  const run = store.run
  if (!run) throw new Error('No active run')

  store.setLoading(true)
  store.setError(null)

  try {
    const provider = getProvider()
    const { previews, tokensUsed } = await generateSectorPreviews(provider, run)
    store.addTokensUsed(tokensUsed)
    store.setSectorOptions(previews)
  } catch (err) {
    store.setError(err instanceof Error ? err.message : 'Failed to generate sector options')
  } finally {
    store.setLoading(false)
  }
}

export async function selectSector(preview: SectorPreview): Promise<void> {
  const store = useGameStore.getState()
  const run = store.run
  if (!run) throw new Error('No active run')

  store.setLoading(true)
  store.setError(null)

  try {
    const provider = getProvider()
    const foMemory = getFOMemory()
    if (!foMemory) throw new Error('No FO memory')

    // Generate full sector data
    const { sector, tokensUsed: genTokens } = await generateSector(provider, preview, run)
    store.addTokensUsed(genTokens)
    store.enterSector(sector)

    // Generate arrival narration
    const updatedRun = useGameStore.getState().run!
    const { narration, foComment, actions, tokensUsed: narrTokens } = await generateArrivalNarration(
      provider,
      updatedRun,
      foMemory,
    )
    store.addTokensUsed(narrTokens)

    store.appendNarration(`${narration}\n\nFO: "${foComment}"`)
    store.setAvailableActions(actions.map((a) => ({
      ...a,
      type: a.type as 'explore' | 'combat' | 'dialogue' | 'trade' | 'navigate' | 'retreat' | 'special',
    })))
  } catch (err) {
    store.setError(err instanceof Error ? err.message : 'Failed to enter sector')
  } finally {
    store.setLoading(false)
  }
}

export async function performAction(
  actionId: string,
  actionLabel: string,
  freeTextInput?: string,
): Promise<void> {
  const store = useGameStore.getState()
  const run = store.run
  if (!run) throw new Error('No active run')

  const foMemory = getFOMemory()
  if (!foMemory) throw new Error('No FO memory')

  // Handle navigation/departure
  if (actionId === 'move_on' || actionId === 'depart' || actionId === 'leave_sector') {
    await departCurrentSector()
    return
  }

  // Handle retreat
  if (actionId === 'retreat' || actionId === 'flee') {
    await handleRetreat()
    return
  }

  // Handle trade — open UI instead of calling LLM
  if (actionId === 'trade' || actionId === 'open_trade' || actionId === 'browse_wares' || actionLabel.toLowerCase().includes('trade') || actionLabel.toLowerCase().includes('browse')) {
    const encounter = run.currentSector?.encounter
    if (encounter?.type === 'trader') {
      store.openTrade(encounter.name, encounter.stock)
      return
    }
  }

  store.setLoading(true)
  store.setError(null)

  try {
    const provider = getProvider()

    // Track captain's decision traits
    const traits: Record<string, boolean> = {}
    const actionType = run.availableActions.find((a) => a.id === actionId)?.type
    if (actionType === 'combat') traits.riskAppetite = true
    if (actionType === 'dialogue' || actionType === 'trade') traits.diplomatic = true
    if (actionType === 'explore') traits.curiosity = true
    if (actionType === 'retreat') traits.riskAppetite = false
    store.trackDecision(traits)

    // Check if this is a combat action against a pirate
    const currentEncounter = run.currentSector?.encounter
    if (currentEncounter?.type === 'pirate' && (run.phase === 'combat' || actionType === 'combat')) {
      const { result, tokensUsed } = await resolveCombat(
        provider,
        run,
        foMemory,
        currentEncounter as PirateEncounter,
        actionLabel,
        freeTextInput,
      )
      store.addTokensUsed(tokensUsed)

      store.appendNarration(`${result.narration}\n\nFO: "${result.foComment}"`)
      applyStateChanges(result.stateChanges)

      // Handle equipment gains
      if (result.stateChanges.equipmentGained) {
        for (const eq of result.stateChanges.equipmentGained) {
          const equipment: Equipment = {
            id: crypto.randomUUID(),
            name: eq.name,
            slot: eq.slot as Equipment['slot'],
            rarity: eq.rarity as Equipment['rarity'],
            origin: eq.origin,
            effect: eq.effect,
            flavor: eq.flavor,
          }
          store.equipItem(equipment)
          saveArtifact({
            equipment,
            foundInRun: run.id,
            foundInSector: run.currentSectorNumber,
            timestamp: Date.now(),
          })
        }
      }

      if (!result.combatContinues) {
        // Combat ended — show result with depart option
        const r = useGameStore.getState().run!
        useGameStore.setState({ run: { ...r, phase: 'sector_active' } })
        store.setAvailableActions([
          ...handleEquipmentGains(result.stateChanges, run),
          { id: 'depart', label: 'Continue to next sector', description: 'Leave this sector and move on.', type: 'navigate' as const },
        ])
      } else {
        handleEquipmentGains(result.stateChanges, run)
        store.setAvailableActions(result.newActions.map((a) => ({
          ...a,
          type: a.type as 'explore' | 'combat' | 'dialogue' | 'trade' | 'navigate' | 'retreat' | 'special',
        })))
      }
    } else {
      // Regular action
      const { result, tokensUsed } = await resolveAction(
        provider,
        run,
        foMemory,
        actionId,
        actionLabel,
        freeTextInput,
      )
      store.addTokensUsed(tokensUsed)

      store.appendNarration(`${result.narration}\n\nFO: "${result.foComment}"`)
      applyStateChanges(result.stateChanges)
      handleEquipmentGains(result.stateChanges, run)

      if (result.combatTriggered) {
        const r = useGameStore.getState().run!
        useGameStore.setState({ run: { ...r, phase: 'combat' } })
      }

      if (!result.encounterContinues) {
        // Encounter ended — show result with depart option instead of auto-departing
        store.setAvailableActions([
          { id: 'depart', label: 'Continue to next sector', description: 'Leave this sector and move on.', type: 'navigate' as const },
        ])
      } else {
        store.setAvailableActions(result.newActions.map((a) => ({
          ...a,
          type: a.type as 'explore' | 'combat' | 'dialogue' | 'trade' | 'navigate' | 'retreat' | 'special',
        })))
      }
    }

    // Check for ship destruction
    const updatedShip = useGameStore.getState().run?.ship
    if (updatedShip && updatedShip.hull <= 0) {
      store.endRun()
    }
  } catch (err) {
    store.setError(err instanceof Error ? err.message : 'Failed to resolve action')
  } finally {
    store.setLoading(false)
  }
}

async function departCurrentSector(): Promise<void> {
  const store = useGameStore.getState()
  const run = store.run
  if (!run) return

  store.setLoading(true)

  try {
    const provider = getProvider()
    const { summary, arcUpdate, tokensUsed } = await compressSector(provider, run)
    store.addTokensUsed(tokensUsed)

    // Apply arc updates
    if (arcUpdate) {
      if (arcUpdate.stageAdvance) store.advanceArc()
      if (arcUpdate.motivationRevealed) store.setArcMotivation(arcUpdate.motivationRevealed)
      if (arcUpdate.targetRevealed) store.setArcTarget(arcUpdate.targetRevealed)
    }

    store.departsector(summary)

    // Check if run is over
    const updatedPhase = useGameStore.getState().phase
    if (updatedPhase === 'run_end') {
      await finalizeRun()
    } else {
      await generateAndSetSectorOptions()
    }
  } catch (err) {
    store.setError(err instanceof Error ? err.message : 'Failed to depart sector')
  } finally {
    store.setLoading(false)
  }
}

async function handleRetreat(): Promise<void> {
  const store = useGameStore.getState()
  const run = store.run
  if (!run) return

  // Apply retreat costs
  store.applyStateChanges({
    fuel: -RETREAT_COSTS.fuel,
    morale: -RETREAT_COSTS.morale,
  })

  store.trackDecision({ riskAppetite: false })
  store.appendNarration('**You retreat from the sector, burning extra fuel in the emergency maneuver.**')

  // Mark as retreated in sector summary
  const sectorSummary = {
    sectorNumber: run.currentSectorNumber,
    type: run.currentSector?.encounterType ?? 'unknown',
    summary: `Retreated from ${run.currentSector?.name ?? 'unknown sector'}`,
    retreated: true,
  }

  const nextSectorNumber = run.currentSectorNumber + 1
  const isLastSector = nextSectorNumber > run.totalSectors

  useGameStore.setState({
    run: {
      ...useGameStore.getState().run!,
      sectorMap: [...run.sectorMap, sectorSummary],
      currentSector: null,
      sectorHistory: [],
      currentSectorNumber: nextSectorNumber,
      availableActions: [],
      phase: 'sector_select',
    },
    phase: isLastSector ? 'run_end' : 'run_active',
  })

  if (!isLastSector) {
    await generateAndSetSectorOptions()
  } else {
    await finalizeRun()
  }
}

async function finalizeRun(): Promise<void> {
  const store = useGameStore.getState()
  const run = store.run
  if (!run) return

  // Save run stats
  saveRunToLifetimeStats({
    id: run.id,
    scenario: run.scenario,
    fo: run.foArchetype,
    sectorsExplored: run.sectorMap.length,
    survived: run.ship.hull > 0,
    stats: {
      sectorsExplored: run.sectorMap.length,
      encountersSurvived: run.sectorMap.filter((s) => !s.retreated).length,
      retreats: run.sectorMap.filter((s) => s.retreated).length,
      artifactsFound: 0, // TODO: track properly
      creditsEarned: 0,
      creditsSpent: 0,
      foAgreementRate: run.captainProfile.followsFOAdvice,
      combatEncounters: run.sectorMap.filter((s) => s.type === 'pirate').length,
      combatsWon: 0,
      civilizationsContacted: run.sectorMap.filter((s) => s.type === 'civilization').length,
    },
    timestamp: Date.now(),
  })

  // Update FO cross-run memory
  const foMemory = getFOMemory()
  if (foMemory) {
    const updatedMemory = { ...foMemory }
    updatedMemory.runsTogether++

    // Derive captain archetype from profile
    const p = run.captainProfile
    const traits: string[] = []
    if (p.riskAppetite > 0.6) traits.push('bold')
    else if (p.riskAppetite < 0.4) traits.push('cautious')
    if (p.diplomatic > 0.6) traits.push('diplomat')
    if (p.curiosity > 0.6) traits.push('explorer')
    if (p.crewPriority > 0.6) traits.push('protective')
    updatedMemory.captainArchetype = traits.join(', ') || 'unpredictable'

    // TODO: generate memorable moments via LLM
    updatedMemory.relationshipState = p.followsFOAdvice > 0.6 ? 'warm' : p.followsFOAdvice < 0.3 ? 'tense' : 'professional'

    saveFOMemory(updatedMemory)
    store.setFOMemory(updatedMemory)
  }

  // Save standing orders
  saveStandingOrders(run.standingOrders)

  store.setPhase('run_end')

  // Generate captain analysis in background (non-blocking)
  generateCaptainProfile(run)
}

async function generateCaptainProfile(run: RunState): Promise<void> {
  const store = useGameStore.getState()
  try {
    const provider = getProvider()
    const { analysis, tokensUsed } = await generateCaptainAnalysis(provider, run)
    store.addTokensUsed(tokensUsed)
    store.setCaptainAnalysis(analysis as unknown as Record<string, unknown>)
  } catch {
    // Non-critical — don't block run end if this fails
  }
}

function applyStateChanges(changes: Record<string, unknown> | object): void {
  const numericChanges: Record<string, number> = {}
  for (const [key, val] of Object.entries(changes)) {
    if (typeof val === 'number') {
      numericChanges[key] = val
    }
  }
  if (Object.keys(numericChanges).length > 0) {
    useGameStore.getState().applyStateChanges(numericChanges)
  }
}

function handleEquipmentGains(stateChanges: Record<string, unknown> | object, run: RunState): GameAction[] {
  const store = useGameStore.getState()
  const gained = (stateChanges as { equipmentGained?: Array<{ name: string; slot: string; rarity: string; origin: string; effect: string; flavor: string }> }).equipmentGained

  if (gained && Array.isArray(gained)) {
    for (const eq of gained) {
      const equipment: Equipment = {
        id: crypto.randomUUID(),
        name: eq.name,
        slot: eq.slot as Equipment['slot'],
        rarity: eq.rarity as Equipment['rarity'],
        origin: eq.origin,
        effect: eq.effect,
        flavor: eq.flavor,
      }
      store.addToCargo(equipment)
      saveArtifact({
        equipment,
        foundInRun: run.id,
        foundInSector: run.currentSectorNumber,
        timestamp: Date.now(),
      })
    }
  }
  return []
}
