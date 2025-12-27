/**
 * MOCKUP: Norton Commander Style Layout
 *
 * Two-panel layout, keyboard-driven, file-manager aesthetic.
 * Function key bar at bottom, blue background classic look.
 */

export function NortonCommanderMockup() {
  return (
    <div className="h-screen bg-blue-950 font-mono flex flex-col">
      {/* Main Two-Panel Area */}
      <div className="flex-1 flex">
        {/* Left Panel - Navigation */}
        <div className="flex-1 border-2 border-cyan-400 m-1 flex flex-col bg-blue-900">
          {/* Panel Header */}
          <div className="border-b-2 border-cyan-400 px-2 py-1 bg-cyan-700 text-black text-center text-sm font-bold">
            ◄ CHANNELS & DMS ►
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Channels Section */}
            <div className="border-b border-cyan-600">
              <div className="px-2 py-1 bg-blue-800 text-cyan-300 text-xs">
                ─── CHANNELS ───
              </div>
              <div className="bg-cyan-600 text-black px-2 py-0.5 text-sm font-bold">
                {'>'} # general
              </div>
              <div className="text-cyan-300 px-2 py-0.5 text-sm hover:bg-blue-800">
                {'  '} # dev
              </div>
              <div className="text-cyan-300 px-2 py-0.5 text-sm hover:bg-blue-800">
                {'  '} # trading
              </div>
              <div className="text-yellow-300 px-2 py-0.5 text-sm hover:bg-blue-800">
                {'  '} 🔒 private
              </div>
            </div>

            {/* DMs Section */}
            <div className="border-b border-cyan-600">
              <div className="px-2 py-1 bg-blue-800 text-cyan-300 text-xs">
                ─── DIRECT MESSAGES ───
              </div>
              <div className="text-cyan-300 px-2 py-0.5 text-sm hover:bg-blue-800">
                {'  '} @ CryptoWizard
              </div>
              <div className="text-cyan-300 px-2 py-0.5 text-sm hover:bg-blue-800">
                {'  '} @ BlockchainBob
              </div>
            </div>

            {/* Following Section */}
            <div>
              <div className="px-2 py-1 bg-blue-800 text-cyan-300 text-xs">
                ─── FOLLOWING ───
              </div>
              <div className="text-cyan-300 px-2 py-0.5 text-sm hover:bg-blue-800">
                {'  '} @ DeFiDave
              </div>
              <div className="text-cyan-300 px-2 py-0.5 text-sm hover:bg-blue-800">
                {'  '} @ NFTNinja
              </div>
              <div className="text-cyan-300 px-2 py-0.5 text-sm hover:bg-blue-800">
                {'  '} @ Web3Wendy
              </div>
            </div>
          </div>

          {/* Panel Footer */}
          <div className="border-t-2 border-cyan-400 px-2 py-1 bg-blue-800 text-cyan-300 text-xs flex justify-between">
            <span>3 channels</span>
            <span>2 DMs</span>
            <span>3 following</span>
          </div>
        </div>

        {/* Right Panel - Content View */}
        <div className="flex-1 border-2 border-cyan-400 m-1 flex flex-col bg-blue-900">
          {/* Panel Header */}
          <div className="border-b-2 border-cyan-400 px-2 py-1 bg-cyan-700 text-black text-center text-sm font-bold">
            ◄ # general ►
          </div>

          {/* Content - Messages */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <div className="text-sm">
              <span className="text-cyan-500">[12:34:56]</span>{' '}
              <span className="text-yellow-300">CryptoWizard:</span>{' '}
              <span className="text-cyan-100">Hey everyone! Just deployed a new contract.</span>
            </div>
            <div className="text-sm">
              <span className="text-cyan-500">[12:35:12]</span>{' '}
              <span className="text-green-300">BlockchainBob:</span>{' '}
              <span className="text-cyan-100">Nice work! What chain?</span>
            </div>
            <div className="text-sm">
              <span className="text-cyan-500">[12:35:45]</span>{' '}
              <span className="text-yellow-300">CryptoWizard:</span>{' '}
              <span className="text-cyan-100">Polkadot Asset Hub testnet</span>
            </div>
            <div className="text-sm">
              <span className="text-cyan-500">[12:36:02]</span>{' '}
              <span className="text-magenta-300 text-pink-300">DeFiDave:</span>{' '}
              <span className="text-cyan-100">Can you share the repo?</span>
            </div>
            <div className="text-sm">
              <span className="text-cyan-500">[12:36:30]</span>{' '}
              <span className="text-yellow-300">CryptoWizard:</span>{' '}
              <span className="text-cyan-100">Sure! github.com/cryptowiz/plaza</span>
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t-2 border-cyan-400 p-2">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400">&gt;</span>
              <input
                type="text"
                placeholder="Type message..."
                className="flex-1 bg-blue-800 text-cyan-100 px-2 py-1 border border-cyan-600 placeholder-cyan-700"
              />
            </div>
          </div>

          {/* Panel Footer */}
          <div className="border-t-2 border-cyan-400 px-2 py-1 bg-blue-800 text-cyan-300 text-xs flex justify-between">
            <span>5 messages</span>
            <span>3 users active</span>
            <span>OPEN</span>
          </div>
        </div>
      </div>

      {/* Function Key Bar */}
      <div className="border-t-2 border-cyan-400 bg-black flex">
        <button className="flex-1 py-1 text-center hover:bg-cyan-800 border-r border-cyan-700">
          <span className="text-cyan-300 text-xs">1</span>
          <span className="text-cyan-100 text-sm ml-1">Help</span>
        </button>
        <button className="flex-1 py-1 text-center hover:bg-cyan-800 border-r border-cyan-700">
          <span className="text-cyan-300 text-xs">2</span>
          <span className="text-cyan-100 text-sm ml-1">NewDM</span>
        </button>
        <button className="flex-1 py-1 text-center hover:bg-cyan-800 border-r border-cyan-700">
          <span className="text-cyan-300 text-xs">3</span>
          <span className="text-cyan-100 text-sm ml-1">Profile</span>
        </button>
        <button className="flex-1 py-1 text-center hover:bg-cyan-800 border-r border-cyan-700">
          <span className="text-cyan-300 text-xs">4</span>
          <span className="text-cyan-100 text-sm ml-1">News</span>
        </button>
        <button className="flex-1 py-1 text-center hover:bg-cyan-800 border-r border-cyan-700">
          <span className="text-cyan-300 text-xs">5</span>
          <span className="text-cyan-100 text-sm ml-1">Follow</span>
        </button>
        <button className="flex-1 py-1 text-center hover:bg-cyan-800 border-r border-cyan-700">
          <span className="text-cyan-300 text-xs">6</span>
          <span className="text-cyan-100 text-sm ml-1">Tip</span>
        </button>
        <button className="flex-1 py-1 text-center hover:bg-cyan-800 border-r border-cyan-700">
          <span className="text-cyan-300 text-xs">7</span>
          <span className="text-cyan-100 text-sm ml-1">NewCh</span>
        </button>
        <button className="flex-1 py-1 text-center hover:bg-cyan-800 border-r border-cyan-700">
          <span className="text-cyan-300 text-xs">8</span>
          <span className="text-cyan-100 text-sm ml-1">Delete</span>
        </button>
        <button className="flex-1 py-1 text-center hover:bg-cyan-800 border-r border-cyan-700">
          <span className="text-cyan-300 text-xs">9</span>
          <span className="text-cyan-100 text-sm ml-1">Wallet</span>
        </button>
        <button className="flex-1 py-1 text-center hover:bg-cyan-800">
          <span className="text-cyan-300 text-xs">10</span>
          <span className="text-cyan-100 text-sm ml-1">Quit</span>
        </button>
      </div>

      {/* Paradigm Label */}
      <div className="absolute bottom-12 right-4 px-3 py-1 bg-green-900 border-2 border-green-500 text-green-400 text-xs font-bold">
        PARADIGM: NORTON COMMANDER
      </div>
    </div>
  );
}
