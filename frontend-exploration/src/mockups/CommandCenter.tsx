/**
 * MOCKUP: Command Center Layout
 *
 * HUD/Cockpit style with multiple persistent panels.
 * Status bar, nav panel, main display, and info panels visible at once.
 */

export function CommandCenterMockup() {
  return (
    <div className="h-screen bg-black font-mono p-2 flex flex-col gap-2">
      {/* Top Row */}
      <div className="flex gap-2 flex-1">
        {/* Nav Panel */}
        <div className="w-48 border-2 border-primary-500 flex flex-col">
          <div className="border-b-2 border-primary-500 px-3 py-2 bg-primary-950">
            <span className="text-primary-500 text-xs font-bold">◢ NAVIGATION</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-2 border-b border-primary-800">
              <div className="text-primary-600 text-xs mb-1">CHANNELS</div>
              <div className="text-primary-400 text-sm bg-primary-900 px-2 py-1 border-l-2 border-primary-400">
                # general
              </div>
              <div className="text-primary-500 text-sm px-2 py-1"># dev</div>
            </div>

            <div className="p-2 border-b border-primary-800">
              <div className="text-primary-600 text-xs mb-1">DMS</div>
              <div className="text-primary-500 text-sm px-2 py-1">@ CryptoWizard</div>
            </div>

            <div className="p-2">
              <div className="text-primary-600 text-xs mb-1">FOLLOWING</div>
              <div className="text-primary-500 text-sm px-2 py-1">@ BlockchainBob</div>
              <div className="text-primary-500 text-sm px-2 py-1">@ DeFiDave</div>
            </div>
          </div>
        </div>

        {/* Main Display */}
        <div className="flex-1 border-2 border-primary-500 flex flex-col">
          <div className="border-b-2 border-primary-500 px-3 py-2 bg-primary-950 flex items-center justify-between">
            <span className="text-primary-500 text-xs font-bold">◢ MAIN DISPLAY</span>
            <span className="text-primary-600 text-xs"># general</span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="text-sm">
              <span className="text-primary-700 text-xs">[12:34]</span>{' '}
              <span className="text-accent-400">CryptoWizard:</span>{' '}
              <span className="text-primary-300">Deployed new contract!</span>
            </div>
            <div className="text-sm">
              <span className="text-primary-700 text-xs">[12:35]</span>{' '}
              <span className="text-primary-500">BlockchainBob:</span>{' '}
              <span className="text-primary-300">What chain?</span>
            </div>
            <div className="text-sm">
              <span className="text-primary-700 text-xs">[12:36]</span>{' '}
              <span className="text-accent-400">CryptoWizard:</span>{' '}
              <span className="text-primary-300">Polkadot Asset Hub</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Status & Info */}
        <div className="w-56 flex flex-col gap-2">
          {/* User Status */}
          <div className="border-2 border-accent-500 flex flex-col">
            <div className="border-b-2 border-accent-500 px-3 py-2 bg-accent-950">
              <span className="text-accent-400 text-xs font-bold">◢ USER STATUS</span>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-primary-600">WALLET</span>
                <span className="text-accent-400">0x1234...5678</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-primary-600">BALANCE</span>
                <span className="text-green-400">2.45 PAS</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-primary-600">SESSION</span>
                <span className="text-yellow-400">0.05 PAS</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="border-2 border-primary-500 flex-1">
            <div className="border-b-2 border-primary-500 px-3 py-2 bg-primary-950">
              <span className="text-primary-500 text-xs font-bold">◢ NETWORK STATS</span>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-primary-600">FOLLOWING</span>
                <span className="text-primary-400">12</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-primary-600">FOLLOWERS</span>
                <span className="text-primary-400">48</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-primary-600">TIPS SENT</span>
                <span className="text-primary-400">1.2 PAS</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-primary-600">TIPS RECV</span>
                <span className="text-accent-400">3.8 PAS</span>
              </div>
            </div>
          </div>

          {/* News Feed Mini */}
          <div className="border-2 border-yellow-600 flex-1">
            <div className="border-b-2 border-yellow-600 px-3 py-2 bg-yellow-950">
              <span className="text-yellow-400 text-xs font-bold">◢ LIVE FEED</span>
            </div>
            <div className="p-2 space-y-1 text-xs">
              <div className="text-primary-500">
                <span className="text-yellow-500">●</span> Bob followed Alice
              </div>
              <div className="text-primary-500">
                <span className="text-green-500">●</span> Dave tipped 0.1 PAS
              </div>
              <div className="text-primary-500">
                <span className="text-accent-500">●</span> New channel #web3
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Command Line */}
      <div className="border-2 border-primary-500">
        <div className="flex">
          <span className="px-3 py-2 bg-primary-950 border-r-2 border-primary-500 text-primary-500 text-sm">
            COMMAND &gt;
          </span>
          <input
            type="text"
            placeholder="Enter message or /command..."
            className="flex-1 px-3 py-2 bg-black text-primary-400 placeholder-primary-700 text-sm"
          />
          <button className="px-4 py-2 bg-primary-900 border-l-2 border-primary-500 text-primary-400 text-sm font-bold">
            EXECUTE
          </button>
        </div>
      </div>

      {/* Paradigm Label */}
      <div className="absolute bottom-4 right-4 px-3 py-1 bg-green-900 border-2 border-green-500 text-green-400 text-xs font-bold">
        PARADIGM: COMMAND CENTER
      </div>
    </div>
  );
}
