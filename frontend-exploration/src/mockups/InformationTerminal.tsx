/**
 * MOCKUP: Information Terminal Layout
 *
 * Single main view that switches between content types.
 * Sidebar has tabs for CHANNELS | DMS | PROFILES | NEWS
 */

export function InformationTerminalMockup() {
  return (
    <div className="h-screen bg-black flex flex-col font-mono">
      {/* Header */}
      <header className="border-b-2 border-primary-500 px-4 py-3 flex items-center justify-between">
        <h1 className="text-primary-500 text-shadow-neon font-bold">ON-CHAIN CHAT</h1>
        <div className="flex items-center gap-4">
          <span className="text-primary-600 text-xs">[0x1234...5678]</span>
          <button className="px-3 py-1 border-2 border-primary-500 text-primary-400 text-sm">
            ACCOUNT
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r-2 border-primary-500 flex flex-col">
          {/* Nav Tabs - 2x2 grid */}
          <div className="border-b-2 border-primary-700">
            <div className="grid grid-cols-2">
              <button className="py-2 text-xs font-bold text-primary-400 border-b-2 border-primary-400 bg-primary-950">
                CHANNELS
              </button>
              <button className="py-2 text-xs font-bold text-primary-700 hover:text-primary-500">
                DMS
              </button>
              <button className="py-2 text-xs font-bold text-primary-700 hover:text-primary-500">
                PROFILES
              </button>
              <button className="py-2 text-xs font-bold text-primary-700 hover:text-primary-500">
                NEWS
              </button>
            </div>
          </div>

          {/* Channel List */}
          <div className="flex-1 overflow-y-auto py-2">
            <button className="w-full text-left px-4 py-2 bg-primary-900 text-primary-300 border-l-2 border-primary-400">
              <span className="text-accent-500">#</span> general
            </button>
            <button className="w-full text-left px-4 py-2 text-primary-500 hover:bg-primary-950">
              <span className="text-accent-500">#</span> dev
            </button>
            <button className="w-full text-left px-4 py-2 text-primary-500 hover:bg-primary-950">
              <span className="text-yellow-500 text-xs">🔒</span> private
            </button>
          </div>

          {/* Following Section */}
          <div className="border-t-2 border-primary-700">
            <div className="p-3 text-primary-600 text-xs font-bold">FOLLOWING</div>
            <div className="pb-2">
              <button className="w-full text-left px-4 py-1.5 text-primary-500 hover:bg-primary-950 text-sm">
                <span className="text-primary-600">@</span> CryptoWizard
              </button>
              <button className="w-full text-left px-4 py-1.5 text-primary-500 hover:bg-primary-950 text-sm">
                <span className="text-primary-600">@</span> BlockchainBob
              </button>
            </div>
          </div>

          {/* Action Button */}
          <div className="p-4 border-t-2 border-primary-700">
            <button className="w-full py-2 bg-primary-900 border-2 border-primary-500 text-primary-400 text-sm">
              + NEW CHANNEL
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">
          {/* Content Header */}
          <div className="border-b-2 border-primary-500 p-4">
            <h2 className="text-primary-500 text-shadow-neon font-bold"># general</h2>
            <p className="text-primary-600 text-xs mt-1">Welcome to the general channel</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="text-sm">
              <span className="text-primary-600 text-xs">[ 12:34:56 ]</span>{' '}
              <span className="text-accent-400">CryptoWizard</span>
              <span className="text-primary-600"> : </span>
              <span className="text-primary-300">Hey everyone! Just deployed a new contract.</span>
            </div>
            <div className="text-sm">
              <span className="text-primary-600 text-xs">[ 12:35:12 ]</span>{' '}
              <span className="text-primary-500">BlockchainBob</span>
              <span className="text-primary-600"> : </span>
              <span className="text-primary-300">Nice work! What chain?</span>
            </div>
            <div className="text-sm">
              <span className="text-primary-600 text-xs">[ 12:35:45 ]</span>{' '}
              <span className="text-accent-400">CryptoWizard</span>
              <span className="text-primary-600"> : </span>
              <span className="text-primary-300">Polkadot Asset Hub testnet</span>
            </div>
          </div>

          {/* Input */}
          <div className="border-t-2 border-primary-500 p-4">
            <div className="flex gap-2">
              <div className="flex-1 flex">
                <span className="px-3 py-2 bg-primary-950 border-2 border-r-0 border-primary-500 text-primary-500">
                  &gt;
                </span>
                <input
                  type="text"
                  placeholder="[ENTER MESSAGE]"
                  className="flex-1 px-3 py-2 bg-black border-2 border-primary-500 text-primary-400 placeholder-primary-800"
                />
              </div>
              <button className="px-6 py-2 bg-primary-900 border-2 border-primary-500 text-primary-400 font-bold">
                ▶ SEND
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* Paradigm Label */}
      <div className="absolute bottom-4 right-4 px-3 py-1 bg-green-900 border-2 border-green-500 text-green-400 text-xs font-bold">
        PARADIGM: INFORMATION TERMINAL
      </div>
    </div>
  );
}
