import { useGameStore } from './storage/game-store'
import { SetupScreen } from './ui/screens/SetupScreen'
import { FOSelectScreen } from './ui/screens/FOSelectScreen'
import { ShipSelectScreen } from './ui/screens/ShipSelectScreen'
import { CustomShipScreen } from './ui/screens/CustomShipScreen'
import { ScenarioScreen } from './ui/screens/ScenarioScreen'
import { ProvisioningScreen } from './ui/screens/ProvisioningScreen'
import { GameScreen } from './ui/screens/GameScreen'
import { RunEndScreen } from './ui/screens/RunEndScreen'

function App() {
  const phase = useGameStore((s) => s.phase)

  switch (phase) {
    case 'setup':
      return <SetupScreen />
    case 'fo_select':
      return <FOSelectScreen />
    case 'ship_select':
      return <ShipSelectScreen />
    case 'ship_custom':
      return <CustomShipScreen />
    case 'scenario_select':
      return <ScenarioScreen />
    case 'provisioning':
      return <ProvisioningScreen />
    case 'run_active':
      return <GameScreen />
    case 'run_end':
      return <RunEndScreen />
    case 'meta':
      return <RunEndScreen />
    default:
      return <SetupScreen />
  }
}

export default App
