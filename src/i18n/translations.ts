export type TranslationKey =
  // Setup screen
  | 'setup.title'
  | 'setup.subtitle'
  | 'setup.captainName'
  | 'setup.captainNamePlaceholder'
  | 'setup.llmProvider'
  | 'setup.apiKey'
  | 'setup.apiKeyHint'
  | 'setup.model'
  | 'setup.continue'
  | 'setup.byokNote'
  | 'setup.errorNoName'
  | 'setup.errorNoKey'

  // FO Select screen
  | 'fo.title'
  | 'fo.subtitle'
  | 'fo.backToSetup'

  // Ship Select screen
  | 'ship.title'
  | 'ship.subtitle'
  | 'ship.buildCustom'
  | 'ship.backToFO'

  // Custom Ship screen
  | 'custom.title'
  | 'custom.subtitle'
  | 'custom.spent'
  | 'custom.budget'
  | 'custom.unspent'
  | 'custom.hullDesc'
  | 'custom.fuelDesc'
  | 'custom.suppliesDesc'
  | 'custom.balancedRef'
  | 'custom.confirmShip'
  | 'custom.backToPresets'

  // Scenario screen
  | 'scenario.title'
  | 'scenario.subtitle'
  | 'scenario.standard'
  | 'scenario.deep'
  | 'scenario.backToShip'

  // Provisioning screen
  | 'provision.title'
  | 'provision.subtitle'
  | 'provision.budgetLabel'
  | 'provision.provisionsLabel'
  | 'provision.creditsLabel'
  | 'provision.baseAllocation'
  | 'provision.extraFuel'
  | 'provision.extraSupplies'
  | 'provision.overBudget'
  | 'provision.launchMission'
  | 'provision.launching'
  | 'provision.back'
  | 'provision.min'
  | 'provision.free'
  | 'provision.max'

  // Game screen
  | 'game.firstOfficer'
  | 'game.sectorOf'
  | 'game.arcStage'
  | 'game.combat'
  | 'game.scanning'
  | 'game.processing'
  | 'game.dismiss'

  // Run End screen
  | 'end.missionComplete'
  | 'end.shipDestroyed'
  | 'end.survivedText'
  | 'end.destroyedText'
  | 'end.analyzing'
  | 'end.missionReport'
  | 'end.sectorsExplored'
  | 'end.retreats'
  | 'end.finalHull'
  | 'end.creditsRemaining'
  | 'end.firstOfficer'
  | 'end.foAgreement'
  | 'end.sectorsVisited'
  | 'end.strengths'
  | 'end.blindSpots'
  | 'end.copyToShare'
  | 'end.copied'
  | 'end.newMission'
  | 'end.settings'

  // Ship Status
  | 'status.shipStatus'
  | 'status.hull'
  | 'status.fuel'
  | 'status.supplies'
  | 'status.morale'
  | 'status.credits'

  // Equipment
  | 'equip.title'
  | 'equip.weapons'
  | 'equip.shields'
  | 'equip.engine'
  | 'equip.special'
  | 'equip.standardIssue'

  // Cargo
  | 'cargo.title'
  | 'cargo.empty'
  | 'cargo.replaces'
  | 'cargo.equip'
  | 'cargo.drop'

  // Action Bar
  | 'action.placeholder'
  | 'action.send'

  // Sector Select
  | 'sector.sectorOf'
  | 'sector.chooseDestination'
  | 'sector.sensorsDetected'
  | 'sector.risk'
  | 'sector.interest'

  // Trade Panel
  | 'trade.title'
  | 'trade.done'
  | 'trade.buy'
  | 'trade.sell'
  | 'trade.nothingInStock'
  | 'trade.nothingInCargo'
  | 'trade.full'
  | 'trade.needCredits'
  | 'trade.buyFor'
  | 'trade.sellFor'
  | 'trade.equipment'
  | 'trade.intel'

  // Cost Indicator
  | 'cost.tokens'
  | 'cost.estCost'

export type Translations = Record<TranslationKey, string>

export const translations: Record<string, Translations> = {
  en: {
    // Setup
    'setup.title': 'STARBOUND',
    'setup.subtitle': 'A text-based space exploration game powered by AI',
    'setup.captainName': 'Captain Name',
    'setup.captainNamePlaceholder': 'What should the crew call you?',
    'setup.llmProvider': 'LLM Provider',
    'setup.apiKey': 'API Key',
    'setup.apiKeyHint': 'Your key is stored locally and never sent to our servers.',
    'setup.model': 'Model',
    'setup.continue': 'Continue',
    'setup.byokNote': 'BYOK — You bring your own API key. All LLM calls are made directly from your browser.',
    'setup.errorNoName': 'What should we call you, Captain?',
    'setup.errorNoKey': 'Please enter your API key',

    // FO Select
    'fo.title': 'Choose Your First Officer',
    'fo.subtitle': 'Your FO advises, remembers, and grows alongside you.',
    'fo.backToSetup': 'Back to setup',

    // Ship Select
    'ship.title': 'Choose Your Ship',
    'ship.subtitle': 'Each vessel has different strengths — pick the one that matches your playstyle.',
    'ship.buildCustom': 'Or build a custom ship...',
    'ship.backToFO': 'Back to FO selection',

    // Custom Ship
    'custom.title': 'Build Custom Ship',
    'custom.subtitle': 'Allocate {budget} points across your ship\'s systems. No starting equipment.',
    'custom.spent': 'spent',
    'custom.budget': 'budget',
    'custom.unspent': 'unspent',
    'custom.hullDesc': 'How much damage your ship can take',
    'custom.fuelDesc': 'How far you can travel between refueling',
    'custom.suppliesDesc': 'Crew sustenance and repair materials',
    'custom.balancedRef': 'Balanced (Explorer) = 100 / 100 / 100',
    'custom.confirmShip': 'Confirm Ship',
    'custom.backToPresets': 'Back to Presets',

    // Scenario
    'scenario.title': 'Select Mission',
    'scenario.subtitle': 'Each mission shapes the encounters and story you\'ll experience.',
    'scenario.standard': 'Standard (faster, cheaper)',
    'scenario.deep': 'Deep (richer, more tokens)',
    'scenario.backToShip': 'Back to ship selection',

    // Provisioning
    'provision.title': 'Provision Your Ship',
    'provision.subtitle': 'Allocate your {budget} credit budget between fuel, supplies, and spending money.',
    'provision.budgetLabel': 'Budget',
    'provision.provisionsLabel': 'Provisions',
    'provision.creditsLabel': 'Credits',
    'provision.baseAllocation': 'Base allocation (free): {fuel} fuel + {supplies} supplies',
    'provision.extraFuel': 'Extra fuel: {amount} units = {cost}cr',
    'provision.extraSupplies': 'Extra supplies: {amount} units = {cost}cr',
    'provision.overBudget': 'Over budget! Reduce fuel or supplies.',
    'provision.launchMission': 'Launch Mission',
    'provision.launching': 'Launching...',
    'provision.back': 'Back',
    'provision.min': '{value} (min)',
    'provision.free': '{value} (free)',
    'provision.max': '{value} (max)',

    // Game
    'game.firstOfficer': 'First Officer',
    'game.sectorOf': 'Sector {current} of {total}',
    'game.arcStage': 'Arc: Stage {stage} — {antagonist}',
    'game.combat': 'Combat',
    'game.scanning': 'Scanning nearby sectors...',
    'game.processing': 'Processing...',
    'game.dismiss': 'dismiss',

    // Run End
    'end.missionComplete': 'Mission Complete',
    'end.shipDestroyed': 'Ship Destroyed',
    'end.survivedText': 'You made it back to Federation space.',
    'end.destroyedText': 'The void claims another explorer.',
    'end.analyzing': 'Analyzing your command style...',
    'end.missionReport': 'Mission Report',
    'end.sectorsExplored': 'Sectors explored',
    'end.retreats': 'Retreats',
    'end.finalHull': 'Final hull',
    'end.creditsRemaining': 'Credits remaining',
    'end.firstOfficer': 'First Officer',
    'end.foAgreement': 'FO agreement rate',
    'end.sectorsVisited': 'Sectors Visited',
    'end.strengths': 'Strengths',
    'end.blindSpots': 'Blind Spots',
    'end.copyToShare': 'Copy to share',
    'end.copied': 'Copied!',
    'end.newMission': 'New Mission',
    'end.settings': 'Settings',

    // Ship Status
    'status.shipStatus': 'Ship Status',
    'status.hull': 'Hull',
    'status.fuel': 'Fuel',
    'status.supplies': 'Supplies',
    'status.morale': 'Morale',
    'status.credits': 'Credits',

    // Equipment
    'equip.title': 'Equipment',
    'equip.weapons': 'Weapons',
    'equip.shields': 'Shields',
    'equip.engine': 'Engine',
    'equip.special': 'Special',
    'equip.standardIssue': 'standard issue',

    // Cargo
    'cargo.title': 'Cargo',
    'cargo.empty': 'Empty',
    'cargo.replaces': 'Replaces: {name}',
    'cargo.equip': 'Equip',
    'cargo.drop': 'Drop',

    // Action Bar
    'action.placeholder': 'Or type your own action...',
    'action.send': 'Send',

    // Sector Select
    'sector.sectorOf': 'Sector {current} of {total}',
    'sector.chooseDestination': 'Choose Your Next Destination',
    'sector.sensorsDetected': 'Long-range sensors have detected the following:',
    'sector.risk': 'Risk',
    'sector.interest': 'Interest',

    // Trade
    'trade.title': 'Trade',
    'trade.done': 'Done',
    'trade.buy': 'Buy',
    'trade.sell': 'Sell',
    'trade.nothingInStock': 'Nothing left in stock',
    'trade.nothingInCargo': 'Nothing in cargo',
    'trade.full': 'Full',
    'trade.needCredits': 'Need {amount}cr',
    'trade.buyFor': 'Buy — {price}cr',
    'trade.sellFor': 'Sell — {price}cr',
    'trade.equipment': 'Equipment',
    'trade.intel': 'Intel',

    // Cost
    'cost.tokens': 'Tokens: {count}',
    'cost.estCost': 'Est. cost: {cost}',
  },

  zh: {
    // Setup
    'setup.title': 'STARBOUND',
    'setup.subtitle': '一款由AI驱动的文字太空探索游戏',
    'setup.captainName': '舰长名称',
    'setup.captainNamePlaceholder': '船员应该怎么称呼你？',
    'setup.llmProvider': 'LLM 提供商',
    'setup.apiKey': 'API 密钥',
    'setup.apiKeyHint': '你的密钥仅存储在本地，不会发送至我们的服务器。',
    'setup.model': '模型',
    'setup.continue': '继续',
    'setup.byokNote': 'BYOK — 自带API密钥。所有LLM调用均直接从你的浏览器发出。',
    'setup.errorNoName': '舰长，我们该怎么称呼你？',
    'setup.errorNoKey': '请输入你的API密钥',

    // FO Select
    'fo.title': '选择你的副官',
    'fo.subtitle': '你的副官会提供建议、记录经历，并与你共同成长。',
    'fo.backToSetup': '返回设置',

    // Ship Select
    'ship.title': '选择你的飞船',
    'ship.subtitle': '每艘飞船各有所长——选择最适合你风格的那一艘。',
    'ship.buildCustom': '或自定义建造飞船...',
    'ship.backToFO': '返回副官选择',

    // Custom Ship
    'custom.title': '自定义建造飞船',
    'custom.subtitle': '将{budget}点分配到飞船的各个系统。无初始装备。',
    'custom.spent': '已用',
    'custom.budget': '预算',
    'custom.unspent': '未用',
    'custom.hullDesc': '飞船能承受多少伤害',
    'custom.fuelDesc': '两次加油之间能飞多远',
    'custom.suppliesDesc': '船员给养和维修材料',
    'custom.balancedRef': '均衡（探索者）= 100 / 100 / 100',
    'custom.confirmShip': '确认飞船',
    'custom.backToPresets': '返回预设',

    // Scenario
    'scenario.title': '选择任务',
    'scenario.subtitle': '每个任务决定你将遇到的事件和故事。',
    'scenario.standard': '标准（更快，更省）',
    'scenario.deep': '深度（更丰富，更多token）',
    'scenario.backToShip': '返回飞船选择',

    // Provisioning
    'provision.title': '补给你的飞船',
    'provision.subtitle': '将你的{budget}信用点预算分配给燃料、补给和备用资金。',
    'provision.budgetLabel': '预算',
    'provision.provisionsLabel': '补给费',
    'provision.creditsLabel': '信用点',
    'provision.baseAllocation': '基础配给（免费）：{fuel}燃料 + {supplies}补给',
    'provision.extraFuel': '额外燃料：{amount}单位 = {cost}cr',
    'provision.extraSupplies': '额外补给：{amount}单位 = {cost}cr',
    'provision.overBudget': '超出预算！请减少燃料或补给。',
    'provision.launchMission': '启动任务',
    'provision.launching': '正在启动...',
    'provision.back': '返回',
    'provision.min': '{value}（最低）',
    'provision.free': '{value}（免费）',
    'provision.max': '{value}（最高）',

    // Game
    'game.firstOfficer': '副官',
    'game.sectorOf': '第{current}区 / 共{total}区',
    'game.arcStage': '剧情：第{stage}阶段 — {antagonist}',
    'game.combat': '战斗',
    'game.scanning': '正在扫描附近星区...',
    'game.processing': '处理中...',
    'game.dismiss': '关闭',

    // Run End
    'end.missionComplete': '任务完成',
    'end.shipDestroyed': '飞船损毁',
    'end.survivedText': '你已返回联邦空间。',
    'end.destroyedText': '虚空又吞噬了一位探索者。',
    'end.analyzing': '正在分析你的指挥风格...',
    'end.missionReport': '任务报告',
    'end.sectorsExplored': '已探索星区',
    'end.retreats': '撤退次数',
    'end.finalHull': '最终船体',
    'end.creditsRemaining': '剩余信用点',
    'end.firstOfficer': '副官',
    'end.foAgreement': '副官认同率',
    'end.sectorsVisited': '已访问星区',
    'end.strengths': '优势',
    'end.blindSpots': '盲点',
    'end.copyToShare': '复制分享',
    'end.copied': '已复制！',
    'end.newMission': '新任务',
    'end.settings': '设置',

    // Ship Status
    'status.shipStatus': '飞船状态',
    'status.hull': '船体',
    'status.fuel': '燃料',
    'status.supplies': '补给',
    'status.morale': '士气',
    'status.credits': '信用点',

    // Equipment
    'equip.title': '装备',
    'equip.weapons': '武器',
    'equip.shields': '护盾',
    'equip.engine': '引擎',
    'equip.special': '特殊',
    'equip.standardIssue': '标准配置',

    // Cargo
    'cargo.title': '货舱',
    'cargo.empty': '空',
    'cargo.replaces': '替换：{name}',
    'cargo.equip': '装备',
    'cargo.drop': '丢弃',

    // Action Bar
    'action.placeholder': '或输入自定义行动...',
    'action.send': '发送',

    // Sector Select
    'sector.sectorOf': '第{current}区 / 共{total}区',
    'sector.chooseDestination': '选择下一个目的地',
    'sector.sensorsDetected': '远程传感器检测到以下信息：',
    'sector.risk': '风险',
    'sector.interest': '兴趣',

    // Trade
    'trade.title': '交易',
    'trade.done': '完成',
    'trade.buy': '购买',
    'trade.sell': '出售',
    'trade.nothingInStock': '库存已空',
    'trade.nothingInCargo': '货舱无物品',
    'trade.full': '已满',
    'trade.needCredits': '需要{amount}cr',
    'trade.buyFor': '购买 — {price}cr',
    'trade.sellFor': '出售 — {price}cr',
    'trade.equipment': '装备',
    'trade.intel': '情报',

    // Cost
    'cost.tokens': 'Token：{count}',
    'cost.estCost': '预估费用：{cost}',
  },

  ja: {
    // Setup
    'setup.title': 'STARBOUND',
    'setup.subtitle': 'AIが生成するテキストベースの宇宙探索ゲーム',
    'setup.captainName': '艦長名',
    'setup.captainNamePlaceholder': 'クルーに何と呼ばれたいですか？',
    'setup.llmProvider': 'LLMプロバイダー',
    'setup.apiKey': 'APIキー',
    'setup.apiKeyHint': 'キーはローカルに保存され、サーバーには送信されません。',
    'setup.model': 'モデル',
    'setup.continue': '続ける',
    'setup.byokNote': 'BYOK — 自分のAPIキーを使用。すべてのLLM呼び出しはブラウザから直接行われます。',
    'setup.errorNoName': '艦長、お名前を教えてください。',
    'setup.errorNoKey': 'APIキーを入力してください',

    // FO Select
    'fo.title': '副官を選ぶ',
    'fo.subtitle': '副官はアドバイスし、記憶し、あなたと共に成長します。',
    'fo.backToSetup': 'セットアップに戻る',

    // Ship Select
    'ship.title': '船を選ぶ',
    'ship.subtitle': '各船にはそれぞれの強みがあります — プレイスタイルに合った船を選びましょう。',
    'ship.buildCustom': 'またはカスタム船を建造...',
    'ship.backToFO': '副官選択に戻る',

    // Custom Ship
    'custom.title': 'カスタム船を建造',
    'custom.subtitle': '{budget}ポイントを船のシステムに配分します。初期装備はありません。',
    'custom.spent': '使用済み',
    'custom.budget': '予算',
    'custom.unspent': '未使用',
    'custom.hullDesc': '船が耐えられるダメージ量',
    'custom.fuelDesc': '補給なしで航行できる距離',
    'custom.suppliesDesc': 'クルーの食料と修理資材',
    'custom.balancedRef': 'バランス型（エクスプローラー）= 100 / 100 / 100',
    'custom.confirmShip': '船を確定',
    'custom.backToPresets': 'プリセットに戻る',

    // Scenario
    'scenario.title': 'ミッション選択',
    'scenario.subtitle': '各ミッションが遭遇やストーリーの内容を決定します。',
    'scenario.standard': 'スタンダード（高速・低コスト）',
    'scenario.deep': 'ディープ（豊富・高トークン）',
    'scenario.backToShip': '船選択に戻る',

    // Provisioning
    'provision.title': '船に補給する',
    'provision.subtitle': '{budget}クレジットの予算を燃料・物資・手持ち資金に配分します。',
    'provision.budgetLabel': '予算',
    'provision.provisionsLabel': '補給費',
    'provision.creditsLabel': 'クレジット',
    'provision.baseAllocation': '基本配給（無料）：燃料{fuel} + 物資{supplies}',
    'provision.extraFuel': '追加燃料：{amount}ユニット = {cost}cr',
    'provision.extraSupplies': '追加物資：{amount}ユニット = {cost}cr',
    'provision.overBudget': '予算超過！燃料または物資を減らしてください。',
    'provision.launchMission': 'ミッション開始',
    'provision.launching': '起動中...',
    'provision.back': '戻る',
    'provision.min': '{value}（最小）',
    'provision.free': '{value}（無料）',
    'provision.max': '{value}（最大）',

    // Game
    'game.firstOfficer': '副官',
    'game.sectorOf': 'セクター{current} / {total}',
    'game.arcStage': 'アーク：ステージ{stage} — {antagonist}',
    'game.combat': '戦闘',
    'game.scanning': '近隣セクターをスキャン中...',
    'game.processing': '処理中...',
    'game.dismiss': '閉じる',

    // Run End
    'end.missionComplete': 'ミッション完了',
    'end.shipDestroyed': '船体崩壊',
    'end.survivedText': '連邦宙域に帰還しました。',
    'end.destroyedText': '虚空がまた一人の探索者を飲み込んだ。',
    'end.analyzing': '指揮スタイルを分析中...',
    'end.missionReport': 'ミッションレポート',
    'end.sectorsExplored': '探索済みセクター',
    'end.retreats': '撤退回数',
    'end.finalHull': '最終船体値',
    'end.creditsRemaining': '残りクレジット',
    'end.firstOfficer': '副官',
    'end.foAgreement': '副官同意率',
    'end.sectorsVisited': '訪問済みセクター',
    'end.strengths': '強み',
    'end.blindSpots': '死角',
    'end.copyToShare': 'コピーして共有',
    'end.copied': 'コピーしました！',
    'end.newMission': '新しいミッション',
    'end.settings': '設定',

    // Ship Status
    'status.shipStatus': '船体状況',
    'status.hull': '船体',
    'status.fuel': '燃料',
    'status.supplies': '物資',
    'status.morale': '士気',
    'status.credits': 'クレジット',

    // Equipment
    'equip.title': '装備',
    'equip.weapons': '武装',
    'equip.shields': 'シールド',
    'equip.engine': 'エンジン',
    'equip.special': '特殊',
    'equip.standardIssue': '標準装備',

    // Cargo
    'cargo.title': '貨物',
    'cargo.empty': '空',
    'cargo.replaces': '交換対象：{name}',
    'cargo.equip': '装着',
    'cargo.drop': '廃棄',

    // Action Bar
    'action.placeholder': 'または独自のアクションを入力...',
    'action.send': '送信',

    // Sector Select
    'sector.sectorOf': 'セクター{current} / {total}',
    'sector.chooseDestination': '次の目的地を選択',
    'sector.sensorsDetected': '長距離センサーが以下を検出しました：',
    'sector.risk': 'リスク',
    'sector.interest': '関心度',

    // Trade
    'trade.title': '取引',
    'trade.done': '完了',
    'trade.buy': '購入',
    'trade.sell': '売却',
    'trade.nothingInStock': '在庫なし',
    'trade.nothingInCargo': '貨物なし',
    'trade.full': '満タン',
    'trade.needCredits': '{amount}cr必要',
    'trade.buyFor': '購入 — {price}cr',
    'trade.sellFor': '売却 — {price}cr',
    'trade.equipment': '装備',
    'trade.intel': '情報',

    // Cost
    'cost.tokens': 'トークン：{count}',
    'cost.estCost': '推定コスト：{cost}',
  },

  ko: {
    // Setup
    'setup.title': 'STARBOUND',
    'setup.subtitle': 'AI가 만드는 텍스트 기반 우주 탐험 게임',
    'setup.captainName': '함장 이름',
    'setup.captainNamePlaceholder': '승무원들이 뭐라고 부르면 좋을까요?',
    'setup.llmProvider': 'LLM 제공자',
    'setup.apiKey': 'API 키',
    'setup.apiKeyHint': '키는 로컬에만 저장되며 서버로 전송되지 않습니다.',
    'setup.model': '모델',
    'setup.continue': '계속',
    'setup.byokNote': 'BYOK — 자신의 API 키를 사용합니다. 모든 LLM 호출은 브라우저에서 직접 이루어집니다.',
    'setup.errorNoName': '함장님, 이름을 알려주세요.',
    'setup.errorNoKey': 'API 키를 입력해 주세요',

    // FO Select
    'fo.title': '부관 선택',
    'fo.subtitle': '부관은 조언하고, 기억하며, 당신과 함께 성장합니다.',
    'fo.backToSetup': '설정으로 돌아가기',

    // Ship Select
    'ship.title': '함선 선택',
    'ship.subtitle': '각 함선마다 장점이 다릅니다 — 플레이 스타일에 맞는 것을 고르세요.',
    'ship.buildCustom': '또는 커스텀 함선 건조...',
    'ship.backToFO': '부관 선택으로 돌아가기',

    // Custom Ship
    'custom.title': '커스텀 함선 건조',
    'custom.subtitle': '{budget}포인트를 함선 시스템에 배분합니다. 초기 장비 없음.',
    'custom.spent': '사용',
    'custom.budget': '예산',
    'custom.unspent': '미사용',
    'custom.hullDesc': '함선이 견딜 수 있는 피해량',
    'custom.fuelDesc': '재급유 없이 항해할 수 있는 거리',
    'custom.suppliesDesc': '승무원 식량 및 수리 자재',
    'custom.balancedRef': '균형형 (익스플로러) = 100 / 100 / 100',
    'custom.confirmShip': '함선 확정',
    'custom.backToPresets': '프리셋으로 돌아가기',

    // Scenario
    'scenario.title': '임무 선택',
    'scenario.subtitle': '각 임무는 조우와 스토리의 방향을 결정합니다.',
    'scenario.standard': '스탠다드 (빠름, 저비용)',
    'scenario.deep': '딥 (풍부함, 토큰 많음)',
    'scenario.backToShip': '함선 선택으로 돌아가기',

    // Provisioning
    'provision.title': '함선 보급',
    'provision.subtitle': '{budget}크레딧 예산을 연료, 보급품, 비상금에 배분하세요.',
    'provision.budgetLabel': '예산',
    'provision.provisionsLabel': '보급비',
    'provision.creditsLabel': '크레딧',
    'provision.baseAllocation': '기본 배급 (무료): 연료 {fuel} + 보급품 {supplies}',
    'provision.extraFuel': '추가 연료: {amount}유닛 = {cost}cr',
    'provision.extraSupplies': '추가 보급품: {amount}유닛 = {cost}cr',
    'provision.overBudget': '예산 초과! 연료 또는 보급품을 줄이세요.',
    'provision.launchMission': '임무 시작',
    'provision.launching': '발진 중...',
    'provision.back': '뒤로',
    'provision.min': '{value} (최소)',
    'provision.free': '{value} (무료)',
    'provision.max': '{value} (최대)',

    // Game
    'game.firstOfficer': '부관',
    'game.sectorOf': '섹터 {current} / {total}',
    'game.arcStage': '아크: 스테이지 {stage} — {antagonist}',
    'game.combat': '전투',
    'game.scanning': '인근 섹터 스캔 중...',
    'game.processing': '처리 중...',
    'game.dismiss': '닫기',

    // Run End
    'end.missionComplete': '임무 완료',
    'end.shipDestroyed': '함선 파괴',
    'end.survivedText': '연방 우주로 귀환했습니다.',
    'end.destroyedText': '허공이 또 한 명의 탐험가를 삼켰다.',
    'end.analyzing': '지휘 스타일 분석 중...',
    'end.missionReport': '임무 보고서',
    'end.sectorsExplored': '탐사 섹터',
    'end.retreats': '후퇴 횟수',
    'end.finalHull': '최종 선체',
    'end.creditsRemaining': '잔여 크레딧',
    'end.firstOfficer': '부관',
    'end.foAgreement': '부관 동의율',
    'end.sectorsVisited': '방문 섹터',
    'end.strengths': '강점',
    'end.blindSpots': '약점',
    'end.copyToShare': '복사하여 공유',
    'end.copied': '복사 완료!',
    'end.newMission': '새 임무',
    'end.settings': '설정',

    // Ship Status
    'status.shipStatus': '함선 상태',
    'status.hull': '선체',
    'status.fuel': '연료',
    'status.supplies': '보급품',
    'status.morale': '사기',
    'status.credits': '크레딧',

    // Equipment
    'equip.title': '장비',
    'equip.weapons': '무기',
    'equip.shields': '방어막',
    'equip.engine': '엔진',
    'equip.special': '특수',
    'equip.standardIssue': '기본 지급품',

    // Cargo
    'cargo.title': '화물',
    'cargo.empty': '비어 있음',
    'cargo.replaces': '교체 대상: {name}',
    'cargo.equip': '장착',
    'cargo.drop': '버리기',

    // Action Bar
    'action.placeholder': '또는 직접 행동을 입력하세요...',
    'action.send': '보내기',

    // Sector Select
    'sector.sectorOf': '섹터 {current} / {total}',
    'sector.chooseDestination': '다음 목적지를 선택하세요',
    'sector.sensorsDetected': '장거리 센서가 다음을 감지했습니다:',
    'sector.risk': '위험',
    'sector.interest': '관심도',

    // Trade
    'trade.title': '거래',
    'trade.done': '완료',
    'trade.buy': '구매',
    'trade.sell': '판매',
    'trade.nothingInStock': '재고 없음',
    'trade.nothingInCargo': '화물 없음',
    'trade.full': '가득 참',
    'trade.needCredits': '{amount}cr 필요',
    'trade.buyFor': '구매 — {price}cr',
    'trade.sellFor': '판매 — {price}cr',
    'trade.equipment': '장비',
    'trade.intel': '정보',

    // Cost
    'cost.tokens': '토큰: {count}',
    'cost.estCost': '예상 비용: {cost}',
  },

  es: {
    // Setup
    'setup.title': 'STARBOUND',
    'setup.subtitle': 'Un juego de exploración espacial basado en texto impulsado por IA',
    'setup.captainName': 'Nombre del capitán',
    'setup.captainNamePlaceholder': '¿Cómo debería llamarte la tripulación?',
    'setup.llmProvider': 'Proveedor LLM',
    'setup.apiKey': 'Clave API',
    'setup.apiKeyHint': 'Tu clave se almacena localmente y nunca se envía a nuestros servidores.',
    'setup.model': 'Modelo',
    'setup.continue': 'Continuar',
    'setup.byokNote': 'BYOK — Tú traes tu propia clave API. Todas las llamadas LLM se hacen directamente desde tu navegador.',
    'setup.errorNoName': '¿Cómo deberíamos llamarte, capitán?',
    'setup.errorNoKey': 'Por favor, introduce tu clave API',

    // FO Select
    'fo.title': 'Elige a tu primer oficial',
    'fo.subtitle': 'Tu primer oficial aconseja, recuerda y crece a tu lado.',
    'fo.backToSetup': 'Volver a la configuración',

    // Ship Select
    'ship.title': 'Elige tu nave',
    'ship.subtitle': 'Cada nave tiene diferentes fortalezas — elige la que se adapte a tu estilo de juego.',
    'ship.buildCustom': 'O construye una nave personalizada...',
    'ship.backToFO': 'Volver a selección de oficial',

    // Custom Ship
    'custom.title': 'Construir nave personalizada',
    'custom.subtitle': 'Asigna {budget} puntos a los sistemas de tu nave. Sin equipo inicial.',
    'custom.spent': 'gastado',
    'custom.budget': 'presupuesto',
    'custom.unspent': 'sin gastar',
    'custom.hullDesc': 'Cuánto daño puede soportar tu nave',
    'custom.fuelDesc': 'Hasta dónde puedes viajar entre reabastecimientos',
    'custom.suppliesDesc': 'Sustento de la tripulación y materiales de reparación',
    'custom.balancedRef': 'Equilibrado (Explorador) = 100 / 100 / 100',
    'custom.confirmShip': 'Confirmar nave',
    'custom.backToPresets': 'Volver a predefinidos',

    // Scenario
    'scenario.title': 'Seleccionar misión',
    'scenario.subtitle': 'Cada misión define los encuentros y la historia que experimentarás.',
    'scenario.standard': 'Estándar (más rápido, más barato)',
    'scenario.deep': 'Profundo (más rico, más tokens)',
    'scenario.backToShip': 'Volver a selección de nave',

    // Provisioning
    'provision.title': 'Aprovisiona tu nave',
    'provision.subtitle': 'Asigna tu presupuesto de {budget} créditos entre combustible, suministros y dinero de bolsillo.',
    'provision.budgetLabel': 'Presupuesto',
    'provision.provisionsLabel': 'Provisiones',
    'provision.creditsLabel': 'Créditos',
    'provision.baseAllocation': 'Asignación base (gratis): {fuel} combustible + {supplies} suministros',
    'provision.extraFuel': 'Combustible extra: {amount} unidades = {cost}cr',
    'provision.extraSupplies': 'Suministros extra: {amount} unidades = {cost}cr',
    'provision.overBudget': '¡Presupuesto excedido! Reduce combustible o suministros.',
    'provision.launchMission': 'Lanzar misión',
    'provision.launching': 'Lanzando...',
    'provision.back': 'Atrás',
    'provision.min': '{value} (mín)',
    'provision.free': '{value} (gratis)',
    'provision.max': '{value} (máx)',

    // Game
    'game.firstOfficer': 'Primer oficial',
    'game.sectorOf': 'Sector {current} de {total}',
    'game.arcStage': 'Arco: Fase {stage} — {antagonist}',
    'game.combat': 'Combate',
    'game.scanning': 'Escaneando sectores cercanos...',
    'game.processing': 'Procesando...',
    'game.dismiss': 'cerrar',

    // Run End
    'end.missionComplete': 'Misión completada',
    'end.shipDestroyed': 'Nave destruida',
    'end.survivedText': 'Has regresado al espacio de la Federación.',
    'end.destroyedText': 'El vacío reclama a otro explorador.',
    'end.analyzing': 'Analizando tu estilo de mando...',
    'end.missionReport': 'Informe de misión',
    'end.sectorsExplored': 'Sectores explorados',
    'end.retreats': 'Retiradas',
    'end.finalHull': 'Casco final',
    'end.creditsRemaining': 'Créditos restantes',
    'end.firstOfficer': 'Primer oficial',
    'end.foAgreement': 'Tasa de acuerdo con el oficial',
    'end.sectorsVisited': 'Sectores visitados',
    'end.strengths': 'Fortalezas',
    'end.blindSpots': 'Puntos ciegos',
    'end.copyToShare': 'Copiar para compartir',
    'end.copied': '¡Copiado!',
    'end.newMission': 'Nueva misión',
    'end.settings': 'Configuración',

    // Ship Status
    'status.shipStatus': 'Estado de la nave',
    'status.hull': 'Casco',
    'status.fuel': 'Combustible',
    'status.supplies': 'Suministros',
    'status.morale': 'Moral',
    'status.credits': 'Créditos',

    // Equipment
    'equip.title': 'Equipo',
    'equip.weapons': 'Armas',
    'equip.shields': 'Escudos',
    'equip.engine': 'Motor',
    'equip.special': 'Especial',
    'equip.standardIssue': 'equipo estándar',

    // Cargo
    'cargo.title': 'Carga',
    'cargo.empty': 'Vacío',
    'cargo.replaces': 'Reemplaza: {name}',
    'cargo.equip': 'Equipar',
    'cargo.drop': 'Soltar',

    // Action Bar
    'action.placeholder': 'O escribe tu propia acción...',
    'action.send': 'Enviar',

    // Sector Select
    'sector.sectorOf': 'Sector {current} de {total}',
    'sector.chooseDestination': 'Elige tu próximo destino',
    'sector.sensorsDetected': 'Los sensores de largo alcance han detectado lo siguiente:',
    'sector.risk': 'Riesgo',
    'sector.interest': 'Interés',

    // Trade
    'trade.title': 'Comercio',
    'trade.done': 'Listo',
    'trade.buy': 'Comprar',
    'trade.sell': 'Vender',
    'trade.nothingInStock': 'Sin existencias',
    'trade.nothingInCargo': 'Sin carga',
    'trade.full': 'Lleno',
    'trade.needCredits': 'Faltan {amount}cr',
    'trade.buyFor': 'Comprar — {price}cr',
    'trade.sellFor': 'Vender — {price}cr',
    'trade.equipment': 'Equipo',
    'trade.intel': 'Información',

    // Cost
    'cost.tokens': 'Tokens: {count}',
    'cost.estCost': 'Costo est.: {cost}',
  },

  fr: {
    // Setup
    'setup.title': 'STARBOUND',
    'setup.subtitle': 'Un jeu d\'exploration spatiale textuel propulsé par l\'IA',
    'setup.captainName': 'Nom du capitaine',
    'setup.captainNamePlaceholder': 'Comment l\'équipage devrait-il vous appeler ?',
    'setup.llmProvider': 'Fournisseur LLM',
    'setup.apiKey': 'Clé API',
    'setup.apiKeyHint': 'Votre clé est stockée localement et jamais envoyée à nos serveurs.',
    'setup.model': 'Modèle',
    'setup.continue': 'Continuer',
    'setup.byokNote': 'BYOK — Vous apportez votre propre clé API. Tous les appels LLM sont faits directement depuis votre navigateur.',
    'setup.errorNoName': 'Comment devrions-nous vous appeler, capitaine ?',
    'setup.errorNoKey': 'Veuillez entrer votre clé API',

    // FO Select
    'fo.title': 'Choisissez votre second',
    'fo.subtitle': 'Votre second conseille, se souvient et évolue à vos côtés.',
    'fo.backToSetup': 'Retour à la configuration',

    // Ship Select
    'ship.title': 'Choisissez votre vaisseau',
    'ship.subtitle': 'Chaque vaisseau a des forces différentes — choisissez celui qui correspond à votre style.',
    'ship.buildCustom': 'Ou construire un vaisseau personnalisé...',
    'ship.backToFO': 'Retour à la sélection du second',

    // Custom Ship
    'custom.title': 'Construire un vaisseau personnalisé',
    'custom.subtitle': 'Répartissez {budget} points entre les systèmes de votre vaisseau. Pas d\'équipement initial.',
    'custom.spent': 'dépensé',
    'custom.budget': 'budget',
    'custom.unspent': 'restant',
    'custom.hullDesc': 'Combien de dégâts votre vaisseau peut encaisser',
    'custom.fuelDesc': 'Distance parcourue entre deux ravitaillements',
    'custom.suppliesDesc': 'Nourriture de l\'équipage et matériaux de réparation',
    'custom.balancedRef': 'Équilibré (Explorateur) = 100 / 100 / 100',
    'custom.confirmShip': 'Confirmer le vaisseau',
    'custom.backToPresets': 'Retour aux modèles',

    // Scenario
    'scenario.title': 'Sélectionner la mission',
    'scenario.subtitle': 'Chaque mission façonne les rencontres et l\'histoire que vous vivrez.',
    'scenario.standard': 'Standard (plus rapide, moins cher)',
    'scenario.deep': 'Approfondi (plus riche, plus de tokens)',
    'scenario.backToShip': 'Retour à la sélection du vaisseau',

    // Provisioning
    'provision.title': 'Ravitailler votre vaisseau',
    'provision.subtitle': 'Répartissez votre budget de {budget} crédits entre carburant, provisions et argent de poche.',
    'provision.budgetLabel': 'Budget',
    'provision.provisionsLabel': 'Provisions',
    'provision.creditsLabel': 'Crédits',
    'provision.baseAllocation': 'Allocation de base (gratuit) : {fuel} carburant + {supplies} provisions',
    'provision.extraFuel': 'Carburant supplémentaire : {amount} unités = {cost}cr',
    'provision.extraSupplies': 'Provisions supplémentaires : {amount} unités = {cost}cr',
    'provision.overBudget': 'Hors budget ! Réduisez le carburant ou les provisions.',
    'provision.launchMission': 'Lancer la mission',
    'provision.launching': 'Lancement...',
    'provision.back': 'Retour',
    'provision.min': '{value} (min)',
    'provision.free': '{value} (gratuit)',
    'provision.max': '{value} (max)',

    // Game
    'game.firstOfficer': 'Second',
    'game.sectorOf': 'Secteur {current} sur {total}',
    'game.arcStage': 'Arc : Phase {stage} — {antagonist}',
    'game.combat': 'Combat',
    'game.scanning': 'Scan des secteurs proches...',
    'game.processing': 'Traitement...',
    'game.dismiss': 'fermer',

    // Run End
    'end.missionComplete': 'Mission accomplie',
    'end.shipDestroyed': 'Vaisseau détruit',
    'end.survivedText': 'Vous êtes revenu dans l\'espace de la Fédération.',
    'end.destroyedText': 'Le vide réclame un autre explorateur.',
    'end.analyzing': 'Analyse de votre style de commandement...',
    'end.missionReport': 'Rapport de mission',
    'end.sectorsExplored': 'Secteurs explorés',
    'end.retreats': 'Retraites',
    'end.finalHull': 'Coque finale',
    'end.creditsRemaining': 'Crédits restants',
    'end.firstOfficer': 'Second',
    'end.foAgreement': 'Taux d\'accord avec le second',
    'end.sectorsVisited': 'Secteurs visités',
    'end.strengths': 'Points forts',
    'end.blindSpots': 'Angles morts',
    'end.copyToShare': 'Copier pour partager',
    'end.copied': 'Copié !',
    'end.newMission': 'Nouvelle mission',
    'end.settings': 'Paramètres',

    // Ship Status
    'status.shipStatus': 'État du vaisseau',
    'status.hull': 'Coque',
    'status.fuel': 'Carburant',
    'status.supplies': 'Provisions',
    'status.morale': 'Moral',
    'status.credits': 'Crédits',

    // Equipment
    'equip.title': 'Équipement',
    'equip.weapons': 'Armes',
    'equip.shields': 'Boucliers',
    'equip.engine': 'Moteur',
    'equip.special': 'Spécial',
    'equip.standardIssue': 'équipement standard',

    // Cargo
    'cargo.title': 'Cargaison',
    'cargo.empty': 'Vide',
    'cargo.replaces': 'Remplace : {name}',
    'cargo.equip': 'Équiper',
    'cargo.drop': 'Larguer',

    // Action Bar
    'action.placeholder': 'Ou tapez votre propre action...',
    'action.send': 'Envoyer',

    // Sector Select
    'sector.sectorOf': 'Secteur {current} sur {total}',
    'sector.chooseDestination': 'Choisissez votre prochaine destination',
    'sector.sensorsDetected': 'Les capteurs longue portée ont détecté ce qui suit :',
    'sector.risk': 'Risque',
    'sector.interest': 'Intérêt',

    // Trade
    'trade.title': 'Commerce',
    'trade.done': 'Terminé',
    'trade.buy': 'Acheter',
    'trade.sell': 'Vendre',
    'trade.nothingInStock': 'Plus rien en stock',
    'trade.nothingInCargo': 'Cargaison vide',
    'trade.full': 'Plein',
    'trade.needCredits': '{amount}cr requis',
    'trade.buyFor': 'Acheter — {price}cr',
    'trade.sellFor': 'Vendre — {price}cr',
    'trade.equipment': 'Équipement',
    'trade.intel': 'Renseignement',

    // Cost
    'cost.tokens': 'Tokens : {count}',
    'cost.estCost': 'Coût est. : {cost}',
  },

  de: {
    // Setup
    'setup.title': 'STARBOUND',
    'setup.subtitle': 'Ein textbasiertes Weltraum-Erkundungsspiel mit KI',
    'setup.captainName': 'Kapitänsname',
    'setup.captainNamePlaceholder': 'Wie soll die Crew dich nennen?',
    'setup.llmProvider': 'LLM-Anbieter',
    'setup.apiKey': 'API-Schlüssel',
    'setup.apiKeyHint': 'Dein Schlüssel wird lokal gespeichert und nie an unsere Server gesendet.',
    'setup.model': 'Modell',
    'setup.continue': 'Weiter',
    'setup.byokNote': 'BYOK — Bring deinen eigenen API-Schlüssel mit. Alle LLM-Aufrufe erfolgen direkt aus deinem Browser.',
    'setup.errorNoName': 'Wie sollen wir dich nennen, Kapitän?',
    'setup.errorNoKey': 'Bitte gib deinen API-Schlüssel ein',

    // FO Select
    'fo.title': 'Wähle deinen Ersten Offizier',
    'fo.subtitle': 'Dein Erster Offizier berät, erinnert sich und wächst an deiner Seite.',
    'fo.backToSetup': 'Zurück zur Einrichtung',

    // Ship Select
    'ship.title': 'Wähle dein Schiff',
    'ship.subtitle': 'Jedes Schiff hat unterschiedliche Stärken — wähle das, das zu deinem Spielstil passt.',
    'ship.buildCustom': 'Oder ein eigenes Schiff bauen...',
    'ship.backToFO': 'Zurück zur Offiziersauswahl',

    // Custom Ship
    'custom.title': 'Eigenes Schiff bauen',
    'custom.subtitle': 'Verteile {budget} Punkte auf die Systeme deines Schiffes. Keine Startausrüstung.',
    'custom.spent': 'ausgegeben',
    'custom.budget': 'Budget',
    'custom.unspent': 'übrig',
    'custom.hullDesc': 'Wie viel Schaden dein Schiff aushalten kann',
    'custom.fuelDesc': 'Wie weit du zwischen Betankungen reisen kannst',
    'custom.suppliesDesc': 'Verpflegung der Crew und Reparaturmaterialien',
    'custom.balancedRef': 'Ausgewogen (Explorer) = 100 / 100 / 100',
    'custom.confirmShip': 'Schiff bestätigen',
    'custom.backToPresets': 'Zurück zu Vorlagen',

    // Scenario
    'scenario.title': 'Mission auswählen',
    'scenario.subtitle': 'Jede Mission bestimmt die Begegnungen und die Geschichte, die du erleben wirst.',
    'scenario.standard': 'Standard (schneller, günstiger)',
    'scenario.deep': 'Tiefgehend (reichhaltiger, mehr Tokens)',
    'scenario.backToShip': 'Zurück zur Schiffsauswahl',

    // Provisioning
    'provision.title': 'Schiff ausrüsten',
    'provision.subtitle': 'Verteile dein Budget von {budget} Credits auf Treibstoff, Vorräte und Bargeld.',
    'provision.budgetLabel': 'Budget',
    'provision.provisionsLabel': 'Versorgung',
    'provision.creditsLabel': 'Credits',
    'provision.baseAllocation': 'Grundausstattung (gratis): {fuel} Treibstoff + {supplies} Vorräte',
    'provision.extraFuel': 'Zusätzlicher Treibstoff: {amount} Einheiten = {cost}cr',
    'provision.extraSupplies': 'Zusätzliche Vorräte: {amount} Einheiten = {cost}cr',
    'provision.overBudget': 'Budget überschritten! Reduziere Treibstoff oder Vorräte.',
    'provision.launchMission': 'Mission starten',
    'provision.launching': 'Starte...',
    'provision.back': 'Zurück',
    'provision.min': '{value} (Min)',
    'provision.free': '{value} (gratis)',
    'provision.max': '{value} (Max)',

    // Game
    'game.firstOfficer': 'Erster Offizier',
    'game.sectorOf': 'Sektor {current} von {total}',
    'game.arcStage': 'Handlung: Phase {stage} — {antagonist}',
    'game.combat': 'Kampf',
    'game.scanning': 'Scanne nahe Sektoren...',
    'game.processing': 'Verarbeitung...',
    'game.dismiss': 'schließen',

    // Run End
    'end.missionComplete': 'Mission abgeschlossen',
    'end.shipDestroyed': 'Schiff zerstört',
    'end.survivedText': 'Du bist in den Föderationsraum zurückgekehrt.',
    'end.destroyedText': 'Die Leere fordert einen weiteren Entdecker.',
    'end.analyzing': 'Analysiere deinen Führungsstil...',
    'end.missionReport': 'Missionsbericht',
    'end.sectorsExplored': 'Erkundete Sektoren',
    'end.retreats': 'Rückzüge',
    'end.finalHull': 'Endhülle',
    'end.creditsRemaining': 'Verbleibende Credits',
    'end.firstOfficer': 'Erster Offizier',
    'end.foAgreement': 'Übereinstimmung mit dem Offizier',
    'end.sectorsVisited': 'Besuchte Sektoren',
    'end.strengths': 'Stärken',
    'end.blindSpots': 'Blinde Flecken',
    'end.copyToShare': 'Zum Teilen kopieren',
    'end.copied': 'Kopiert!',
    'end.newMission': 'Neue Mission',
    'end.settings': 'Einstellungen',

    // Ship Status
    'status.shipStatus': 'Schiffsstatus',
    'status.hull': 'Hülle',
    'status.fuel': 'Treibstoff',
    'status.supplies': 'Vorräte',
    'status.morale': 'Moral',
    'status.credits': 'Credits',

    // Equipment
    'equip.title': 'Ausrüstung',
    'equip.weapons': 'Waffen',
    'equip.shields': 'Schilde',
    'equip.engine': 'Antrieb',
    'equip.special': 'Spezial',
    'equip.standardIssue': 'Standardausrüstung',

    // Cargo
    'cargo.title': 'Fracht',
    'cargo.empty': 'Leer',
    'cargo.replaces': 'Ersetzt: {name}',
    'cargo.equip': 'Ausrüsten',
    'cargo.drop': 'Abwerfen',

    // Action Bar
    'action.placeholder': 'Oder gib eine eigene Aktion ein...',
    'action.send': 'Senden',

    // Sector Select
    'sector.sectorOf': 'Sektor {current} von {total}',
    'sector.chooseDestination': 'Wähle dein nächstes Ziel',
    'sector.sensorsDetected': 'Langstreckensensoren haben Folgendes erfasst:',
    'sector.risk': 'Risiko',
    'sector.interest': 'Interesse',

    // Trade
    'trade.title': 'Handel',
    'trade.done': 'Fertig',
    'trade.buy': 'Kaufen',
    'trade.sell': 'Verkaufen',
    'trade.nothingInStock': 'Nichts mehr auf Lager',
    'trade.nothingInCargo': 'Keine Fracht vorhanden',
    'trade.full': 'Voll',
    'trade.needCredits': '{amount}cr nötig',
    'trade.buyFor': 'Kaufen — {price}cr',
    'trade.sellFor': 'Verkaufen — {price}cr',
    'trade.equipment': 'Ausrüstung',
    'trade.intel': 'Informationen',

    // Cost
    'cost.tokens': 'Tokens: {count}',
    'cost.estCost': 'Gesch. Kosten: {cost}',
  },

  pt: {
    // Setup
    'setup.title': 'STARBOUND',
    'setup.subtitle': 'Um jogo de exploração espacial baseado em texto movido por IA',
    'setup.captainName': 'Nome do capitão',
    'setup.captainNamePlaceholder': 'Como a tripulação deve te chamar?',
    'setup.llmProvider': 'Provedor LLM',
    'setup.apiKey': 'Chave API',
    'setup.apiKeyHint': 'Sua chave é armazenada localmente e nunca enviada aos nossos servidores.',
    'setup.model': 'Modelo',
    'setup.continue': 'Continuar',
    'setup.byokNote': 'BYOK — Você traz sua própria chave API. Todas as chamadas LLM são feitas diretamente do seu navegador.',
    'setup.errorNoName': 'Como devemos te chamar, capitão?',
    'setup.errorNoKey': 'Por favor, insira sua chave API',

    // FO Select
    'fo.title': 'Escolha seu imediato',
    'fo.subtitle': 'Seu imediato aconselha, lembra e cresce ao seu lado.',
    'fo.backToSetup': 'Voltar à configuração',

    // Ship Select
    'ship.title': 'Escolha sua nave',
    'ship.subtitle': 'Cada nave tem forças diferentes — escolha a que combina com seu estilo de jogo.',
    'ship.buildCustom': 'Ou construa uma nave personalizada...',
    'ship.backToFO': 'Voltar à seleção de imediato',

    // Custom Ship
    'custom.title': 'Construir nave personalizada',
    'custom.subtitle': 'Distribua {budget} pontos entre os sistemas da nave. Sem equipamento inicial.',
    'custom.spent': 'gasto',
    'custom.budget': 'orçamento',
    'custom.unspent': 'restante',
    'custom.hullDesc': 'Quanto dano sua nave pode suportar',
    'custom.fuelDesc': 'Até onde você pode viajar entre reabastecimentos',
    'custom.suppliesDesc': 'Sustento da tripulação e materiais de reparo',
    'custom.balancedRef': 'Equilibrado (Explorador) = 100 / 100 / 100',
    'custom.confirmShip': 'Confirmar nave',
    'custom.backToPresets': 'Voltar aos modelos',

    // Scenario
    'scenario.title': 'Selecionar missão',
    'scenario.subtitle': 'Cada missão molda os encontros e a história que você vivenciará.',
    'scenario.standard': 'Padrão (mais rápido, mais barato)',
    'scenario.deep': 'Profundo (mais rico, mais tokens)',
    'scenario.backToShip': 'Voltar à seleção de nave',

    // Provisioning
    'provision.title': 'Abasteça sua nave',
    'provision.subtitle': 'Distribua seu orçamento de {budget} créditos entre combustível, suprimentos e dinheiro extra.',
    'provision.budgetLabel': 'Orçamento',
    'provision.provisionsLabel': 'Provisões',
    'provision.creditsLabel': 'Créditos',
    'provision.baseAllocation': 'Alocação base (grátis): {fuel} combustível + {supplies} suprimentos',
    'provision.extraFuel': 'Combustível extra: {amount} unidades = {cost}cr',
    'provision.extraSupplies': 'Suprimentos extras: {amount} unidades = {cost}cr',
    'provision.overBudget': 'Acima do orçamento! Reduza combustível ou suprimentos.',
    'provision.launchMission': 'Iniciar missão',
    'provision.launching': 'Iniciando...',
    'provision.back': 'Voltar',
    'provision.min': '{value} (mín)',
    'provision.free': '{value} (grátis)',
    'provision.max': '{value} (máx)',

    // Game
    'game.firstOfficer': 'Imediato',
    'game.sectorOf': 'Setor {current} de {total}',
    'game.arcStage': 'Arco: Fase {stage} — {antagonist}',
    'game.combat': 'Combate',
    'game.scanning': 'Escaneando setores próximos...',
    'game.processing': 'Processando...',
    'game.dismiss': 'fechar',

    // Run End
    'end.missionComplete': 'Missão concluída',
    'end.shipDestroyed': 'Nave destruída',
    'end.survivedText': 'Você voltou ao espaço da Federação.',
    'end.destroyedText': 'O vazio reclama mais um explorador.',
    'end.analyzing': 'Analisando seu estilo de comando...',
    'end.missionReport': 'Relatório de missão',
    'end.sectorsExplored': 'Setores explorados',
    'end.retreats': 'Retiradas',
    'end.finalHull': 'Casco final',
    'end.creditsRemaining': 'Créditos restantes',
    'end.firstOfficer': 'Imediato',
    'end.foAgreement': 'Taxa de concordância do imediato',
    'end.sectorsVisited': 'Setores visitados',
    'end.strengths': 'Pontos fortes',
    'end.blindSpots': 'Pontos cegos',
    'end.copyToShare': 'Copiar para compartilhar',
    'end.copied': 'Copiado!',
    'end.newMission': 'Nova missão',
    'end.settings': 'Configurações',

    // Ship Status
    'status.shipStatus': 'Status da nave',
    'status.hull': 'Casco',
    'status.fuel': 'Combustível',
    'status.supplies': 'Suprimentos',
    'status.morale': 'Moral',
    'status.credits': 'Créditos',

    // Equipment
    'equip.title': 'Equipamento',
    'equip.weapons': 'Armas',
    'equip.shields': 'Escudos',
    'equip.engine': 'Motor',
    'equip.special': 'Especial',
    'equip.standardIssue': 'equipamento padrão',

    // Cargo
    'cargo.title': 'Carga',
    'cargo.empty': 'Vazio',
    'cargo.replaces': 'Substitui: {name}',
    'cargo.equip': 'Equipar',
    'cargo.drop': 'Descartar',

    // Action Bar
    'action.placeholder': 'Ou digite sua própria ação...',
    'action.send': 'Enviar',

    // Sector Select
    'sector.sectorOf': 'Setor {current} de {total}',
    'sector.chooseDestination': 'Escolha seu próximo destino',
    'sector.sensorsDetected': 'Sensores de longo alcance detectaram o seguinte:',
    'sector.risk': 'Risco',
    'sector.interest': 'Interesse',

    // Trade
    'trade.title': 'Comércio',
    'trade.done': 'Pronto',
    'trade.buy': 'Comprar',
    'trade.sell': 'Vender',
    'trade.nothingInStock': 'Nada em estoque',
    'trade.nothingInCargo': 'Nada na carga',
    'trade.full': 'Cheio',
    'trade.needCredits': 'Precisa {amount}cr',
    'trade.buyFor': 'Comprar — {price}cr',
    'trade.sellFor': 'Vender — {price}cr',
    'trade.equipment': 'Equipamento',
    'trade.intel': 'Informação',

    // Cost
    'cost.tokens': 'Tokens: {count}',
    'cost.estCost': 'Custo est.: {cost}',
  },
}
