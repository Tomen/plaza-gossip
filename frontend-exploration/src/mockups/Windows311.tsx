/**
 * MOCKUP: Windows 3.11 Style Layout
 *
 * Overlapping draggable windows, maximize/minimize, taskbar.
 * Retro desktop metaphor with cyberpunk styling.
 */

export function Windows311Mockup() {
  return (
    <div className="h-screen bg-black font-mono flex flex-col">
      {/* Menu Bar */}
      <div className="border-b-2 border-primary-500 px-2 py-1 flex items-center gap-4 bg-primary-950">
        <button className="text-primary-400 text-sm hover:bg-primary-800 px-2 py-0.5">
          File
        </button>
        <button className="text-primary-400 text-sm hover:bg-primary-800 px-2 py-0.5">
          Windows
        </button>
        <button className="text-primary-400 text-sm hover:bg-primary-800 px-2 py-0.5">
          Help
        </button>
        <div className="flex-1" />
        <span className="text-primary-600 text-xs">ON-CHAIN CHAT v0.1</span>
      </div>

      {/* Desktop Area */}
      <div className="flex-1 relative overflow-hidden p-4">
        {/* Window 1: Chat (larger, back) */}
        <div
          className="absolute border-2 border-primary-500 bg-black flex flex-col"
          style={{ top: '20px', left: '20px', width: '500px', height: '350px' }}
        >
          {/* Title Bar */}
          <div className="border-b-2 border-primary-500 px-2 py-1 bg-primary-900 flex items-center justify-between cursor-move">
            <span className="text-primary-300 text-sm font-bold"># general</span>
            <div className="flex gap-1">
              <button className="w-5 h-5 border border-primary-500 text-primary-500 text-xs hover:bg-primary-800">
                _
              </button>
              <button className="w-5 h-5 border border-primary-500 text-primary-500 text-xs hover:bg-primary-800">
                □
              </button>
              <button className="w-5 h-5 border border-red-500 text-red-500 text-xs hover:bg-red-900">
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 text-sm">
            <div>
              <span className="text-primary-600 text-xs">[12:34]</span>{' '}
              <span className="text-accent-400">CryptoWizard:</span>{' '}
              <span className="text-primary-300">Hey everyone!</span>
            </div>
            <div>
              <span className="text-primary-600 text-xs">[12:35]</span>{' '}
              <span className="text-primary-500">BlockchainBob:</span>{' '}
              <span className="text-primary-300">What's up?</span>
            </div>
          </div>

          {/* Input */}
          <div className="border-t-2 border-primary-500 p-2 flex gap-2">
            <input
              type="text"
              placeholder="> message"
              className="flex-1 px-2 py-1 bg-black border border-primary-500 text-primary-400 text-sm"
            />
            <button className="px-3 py-1 bg-primary-900 border border-primary-500 text-primary-400 text-sm">
              Send
            </button>
          </div>
        </div>

        {/* Window 2: Profile (overlapping) */}
        <div
          className="absolute border-2 border-accent-500 bg-black flex flex-col"
          style={{ top: '80px', left: '300px', width: '280px', height: '300px' }}
        >
          <div className="border-b-2 border-accent-500 px-2 py-1 bg-accent-900 flex items-center justify-between cursor-move">
            <span className="text-accent-300 text-sm font-bold">@ CryptoWizard</span>
            <div className="flex gap-1">
              <button className="w-5 h-5 border border-accent-500 text-accent-500 text-xs hover:bg-accent-800">
                _
              </button>
              <button className="w-5 h-5 border border-accent-500 text-accent-500 text-xs hover:bg-accent-800">
                □
              </button>
              <button className="w-5 h-5 border border-red-500 text-red-500 text-xs hover:bg-red-900">
                ×
              </button>
            </div>
          </div>

          <div className="flex-1 p-3 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 border-2 border-accent-500 bg-accent-950 flex items-center justify-center text-accent-400 text-xl">
                C
              </div>
              <div>
                <div className="text-accent-400 font-bold">CryptoWizard</div>
                <div className="text-primary-600 text-xs">0x1234...5678</div>
              </div>
            </div>

            <div className="text-primary-400 text-sm">
              Smart contract developer. Building on Polkadot.
            </div>

            <div className="border-t border-primary-700 pt-2 space-y-1">
              <div className="text-primary-500 text-xs hover:text-accent-400 cursor-pointer">
                → twitter.com/cryptowiz
              </div>
              <div className="text-primary-500 text-xs hover:text-accent-400 cursor-pointer">
                → github.com/cryptowiz
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button className="flex-1 py-1 bg-accent-900 border border-accent-500 text-accent-400 text-xs">
                FOLLOW
              </button>
              <button className="flex-1 py-1 bg-primary-900 border border-primary-500 text-primary-400 text-xs">
                DM
              </button>
            </div>
          </div>
        </div>

        {/* Window 3: News (smaller, front) */}
        <div
          className="absolute border-2 border-yellow-500 bg-black flex flex-col"
          style={{ top: '200px', left: '100px', width: '250px', height: '180px' }}
        >
          <div className="border-b-2 border-yellow-500 px-2 py-1 bg-yellow-900 flex items-center justify-between cursor-move">
            <span className="text-yellow-300 text-sm font-bold">News Feed</span>
            <div className="flex gap-1">
              <button className="w-5 h-5 border border-yellow-500 text-yellow-500 text-xs hover:bg-yellow-800">
                _
              </button>
              <button className="w-5 h-5 border border-red-500 text-red-500 text-xs hover:bg-red-900">
                ×
              </button>
            </div>
          </div>

          <div className="flex-1 p-2 space-y-1 text-xs overflow-y-auto">
            <div className="text-primary-400">
              <span className="text-yellow-500">●</span> Bob followed you
            </div>
            <div className="text-primary-400">
              <span className="text-green-500">●</span> Alice tipped 0.5 PAS
            </div>
            <div className="text-primary-400">
              <span className="text-accent-500">●</span> New channel #trading
            </div>
            <div className="text-primary-400">
              <span className="text-primary-500">●</span> Dave updated profile
            </div>
          </div>
        </div>
      </div>

      {/* Taskbar */}
      <div className="border-t-2 border-primary-500 px-2 py-1 bg-primary-950 flex items-center gap-2">
        <button className="px-3 py-1 bg-primary-800 border border-primary-500 text-primary-400 text-sm font-bold">
          START
        </button>
        <div className="h-6 border-l border-primary-600" />
        <button className="px-3 py-1 bg-primary-900 border border-primary-600 text-primary-400 text-xs">
          # general
        </button>
        <button className="px-3 py-1 bg-accent-900 border border-accent-600 text-accent-400 text-xs">
          @ CryptoWizard
        </button>
        <button className="px-3 py-1 bg-yellow-900 border border-yellow-600 text-yellow-400 text-xs">
          News Feed
        </button>
        <div className="flex-1" />
        <span className="text-primary-600 text-xs">12:36:42</span>
      </div>

      {/* Paradigm Label */}
      <div className="absolute bottom-12 right-4 px-3 py-1 bg-green-900 border-2 border-green-500 text-green-400 text-xs font-bold">
        PARADIGM: WINDOWS 3.11
      </div>
    </div>
  );
}
