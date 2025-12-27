/**
 * MOCKUP: Notion-Style Sidebar
 *
 * Collapsible tree/list structure instead of tabs.
 * Sections: News, Channels, DMs, Following
 * Clicking items opens content in main area.
 */

import { useState } from 'react';

type ContentType =
  | { type: 'news' }
  | { type: 'channel'; name: string }
  | { type: 'dm'; name: string }
  | { type: 'profile'; name: string };

export function NotionStyleMockup() {
  const [expanded, setExpanded] = useState({
    channels: true,
    dms: true,
    following: true,
  });

  const [activeContent, setActiveContent] = useState<ContentType>({ type: 'channel', name: 'general' });

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

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
        {/* Notion-style Sidebar */}
        <aside className="w-64 border-r-2 border-primary-500 flex flex-col overflow-y-auto">
          {/* News - Top level item */}
          <button
            onClick={() => setActiveContent({ type: 'news' })}
            className={`w-full text-left px-4 py-2 flex items-center gap-2 text-sm transition-all ${
              activeContent.type === 'news'
                ? 'bg-primary-900 text-primary-300 border-l-2 border-primary-400'
                : 'text-primary-500 hover:bg-primary-950'
            }`}
          >
            <span className="text-yellow-500">◆</span>
            News
          </button>

          {/* Channels Section */}
          <div className="border-t border-primary-800">
            <button
              onClick={() => toggleSection('channels')}
              className="w-full text-left px-4 py-2 flex items-center gap-2 text-sm text-primary-600 hover:bg-primary-950"
            >
              <span className={`text-xs transition-transform ${expanded.channels ? 'rotate-90' : ''}`}>
                ▶
              </span>
              <span className="font-bold">Channels</span>
              <span className="text-primary-700 text-xs ml-auto">3</span>
            </button>

            {expanded.channels && (
              <div className="pl-4">
                <button
                  onClick={() => setActiveContent({ type: 'channel', name: 'general' })}
                  className={`w-full text-left px-4 py-1.5 flex items-center gap-2 text-sm transition-all ${
                    activeContent.type === 'channel' && activeContent.name === 'general'
                      ? 'bg-primary-900 text-primary-300 border-l-2 border-primary-400'
                      : 'text-primary-500 hover:bg-primary-950'
                  }`}
                >
                  <span className="text-accent-500">#</span>
                  general
                </button>
                <button
                  onClick={() => setActiveContent({ type: 'channel', name: 'dev' })}
                  className={`w-full text-left px-4 py-1.5 flex items-center gap-2 text-sm transition-all ${
                    activeContent.type === 'channel' && activeContent.name === 'dev'
                      ? 'bg-primary-900 text-primary-300 border-l-2 border-primary-400'
                      : 'text-primary-500 hover:bg-primary-950'
                  }`}
                >
                  <span className="text-accent-500">#</span>
                  dev
                </button>
                <button
                  onClick={() => setActiveContent({ type: 'channel', name: 'trading' })}
                  className={`w-full text-left px-4 py-1.5 flex items-center gap-2 text-sm transition-all ${
                    activeContent.type === 'channel' && activeContent.name === 'trading'
                      ? 'bg-primary-900 text-primary-300 border-l-2 border-primary-400'
                      : 'text-primary-500 hover:bg-primary-950'
                  }`}
                >
                  <span className="text-yellow-500">🔒</span>
                  trading
                </button>
              </div>
            )}
          </div>

          {/* DMs Section */}
          <div className="border-t border-primary-800">
            <button
              onClick={() => toggleSection('dms')}
              className="w-full text-left px-4 py-2 flex items-center gap-2 text-sm text-primary-600 hover:bg-primary-950"
            >
              <span className={`text-xs transition-transform ${expanded.dms ? 'rotate-90' : ''}`}>
                ▶
              </span>
              <span className="font-bold">DMs</span>
              <span className="text-primary-700 text-xs ml-auto">1</span>
            </button>

            {expanded.dms && (
              <div className="pl-4">
                <button
                  onClick={() => setActiveContent({ type: 'dm', name: 'Timothy McMasters' })}
                  className={`w-full text-left px-4 py-1.5 flex items-center gap-2 text-sm transition-all ${
                    activeContent.type === 'dm' && activeContent.name === 'Timothy McMasters'
                      ? 'bg-accent-900 text-accent-300 border-l-2 border-accent-400'
                      : 'text-primary-500 hover:bg-primary-950'
                  }`}
                >
                  <span className="text-accent-400">@</span>
                  Timothy McMasters
                </button>
              </div>
            )}
          </div>

          {/* Following Section */}
          <div className="border-t border-primary-800">
            <button
              onClick={() => toggleSection('following')}
              className="w-full text-left px-4 py-2 flex items-center gap-2 text-sm text-primary-600 hover:bg-primary-950"
            >
              <span className={`text-xs transition-transform ${expanded.following ? 'rotate-90' : ''}`}>
                ▶
              </span>
              <span className="font-bold">Following</span>
              <span className="text-primary-700 text-xs ml-auto">2</span>
            </button>

            {expanded.following && (
              <div className="pl-4">
                <button
                  onClick={() => setActiveContent({ type: 'profile', name: 'Timothy McMasters' })}
                  className={`w-full text-left px-4 py-1.5 flex items-center gap-2 text-sm transition-all ${
                    activeContent.type === 'profile' && activeContent.name === 'Timothy McMasters'
                      ? 'bg-accent-900 text-accent-300 border-l-2 border-accent-400'
                      : 'text-primary-500 hover:bg-primary-950'
                  }`}
                >
                  <span className="text-primary-600">●</span>
                  Timothy McMasters
                </button>
                <button
                  onClick={() => setActiveContent({ type: 'profile', name: 'Full Pouch' })}
                  className={`w-full text-left px-4 py-1.5 flex items-center gap-2 text-sm transition-all ${
                    activeContent.type === 'profile' && activeContent.name === 'Full Pouch'
                      ? 'bg-accent-900 text-accent-300 border-l-2 border-accent-400'
                      : 'text-primary-500 hover:bg-primary-950'
                  }`}
                >
                  <span className="text-primary-600">●</span>
                  Full Pouch
                </button>
              </div>
            )}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Quick Actions */}
          <div className="p-3 border-t border-primary-800 space-y-2">
            <button className="w-full py-1.5 text-xs text-primary-600 hover:text-primary-400 hover:bg-primary-950 text-left px-2">
              + New Channel
            </button>
            <button className="w-full py-1.5 text-xs text-primary-600 hover:text-primary-400 hover:bg-primary-950 text-left px-2">
              + New DM
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">
          {/* Render based on active content */}
          {activeContent.type === 'news' && <NewsContent />}
          {activeContent.type === 'channel' && <ChannelContent name={activeContent.name} />}
          {activeContent.type === 'dm' && <DMContent name={activeContent.name} />}
          {activeContent.type === 'profile' && <ProfileContent name={activeContent.name} />}
        </main>
      </div>

      {/* Paradigm Label */}
      <div className="absolute bottom-4 right-4 px-3 py-1 bg-green-900 border-2 border-green-500 text-green-400 text-xs font-bold">
        PARADIGM: NOTION-STYLE TREE
      </div>
    </div>
  );
}

// Content Components

function NewsContent() {
  return (
    <>
      <div className="border-b-2 border-primary-500 p-4">
        <h2 className="text-primary-500 text-shadow-neon font-bold flex items-center gap-2">
          <span className="text-yellow-500">◆</span> News
        </h2>
        <p className="text-primary-600 text-xs mt-1">Activity feed from your network</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <div className="border-2 border-primary-700 p-3 bg-primary-950">
          <div className="flex items-start gap-3">
            <span className="text-lg">💬</span>
            <div>
              <p className="text-primary-400 text-sm">
                <span className="text-accent-400">CryptoWizard</span> posted in <span className="text-primary-300">#general</span>
              </p>
              <p className="text-primary-600 text-xs mt-1 italic">"Just deployed a new contract!"</p>
              <p className="text-primary-700 text-xs mt-2">2m ago</p>
            </div>
          </div>
        </div>
        <div className="border-2 border-primary-700 p-3 bg-primary-950">
          <div className="flex items-start gap-3">
            <span className="text-lg">👤</span>
            <div>
              <p className="text-primary-400 text-sm">
                <span className="text-accent-400">Full Pouch</span> started following you
              </p>
              <p className="text-primary-700 text-xs mt-2">15m ago</p>
            </div>
          </div>
        </div>
        <div className="border-2 border-primary-700 p-3 bg-primary-950">
          <div className="flex items-start gap-3">
            <span className="text-lg">💰</span>
            <div>
              <p className="text-primary-400 text-sm">
                <span className="text-accent-400">Timothy McMasters</span> tipped you <span className="text-yellow-400">0.5 PAS</span>
              </p>
              <p className="text-primary-700 text-xs mt-2">1h ago</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ChannelContent({ name }: { name: string }) {
  return (
    <>
      <div className="border-b-2 border-primary-500 p-4">
        <h2 className="text-primary-500 text-shadow-neon font-bold"># {name}</h2>
        <p className="text-primary-600 text-xs mt-1">Welcome to #{name}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="text-sm">
          <span className="text-primary-600 text-xs">[ 12:34:56 ]</span>{' '}
          <span className="text-accent-400 hover:underline cursor-pointer">CryptoWizard</span>
          <span className="text-primary-600"> : </span>
          <span className="text-primary-300">Hey everyone! Just deployed a new contract.</span>
        </div>
        <div className="text-sm">
          <span className="text-primary-600 text-xs">[ 12:35:12 ]</span>{' '}
          <span className="text-primary-500 hover:underline cursor-pointer">BlockchainBob</span>
          <span className="text-primary-600"> : </span>
          <span className="text-primary-300">Nice work! What chain?</span>
        </div>
        <div className="text-sm">
          <span className="text-primary-600 text-xs">[ 12:35:45 ]</span>{' '}
          <span className="text-accent-400 hover:underline cursor-pointer">CryptoWizard</span>
          <span className="text-primary-600"> : </span>
          <span className="text-primary-300">Polkadot Asset Hub testnet</span>
        </div>
      </div>
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
    </>
  );
}

function DMContent({ name }: { name: string }) {
  return (
    <>
      <div className="border-b-2 border-accent-500 p-4 bg-accent-950">
        <h2 className="text-accent-400 text-shadow-neon font-bold flex items-center gap-2">
          <span>@</span> {name}
        </h2>
        <p className="text-accent-600 text-xs mt-1">🔒 Encrypted conversation</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        <div className="text-sm">
          <span className="text-primary-600 text-xs">[ 11:20:00 ]</span>{' '}
          <span className="text-accent-400">{name}</span>
          <span className="text-primary-600"> : </span>
          <span className="text-primary-300">Hey! Saw your post about the new contract</span>
        </div>
        <div className="text-sm">
          <span className="text-primary-600 text-xs">[ 11:21:30 ]</span>{' '}
          <span className="text-accent-400">You</span>
          <span className="text-primary-600"> : </span>
          <span className="text-primary-300">Thanks! Yeah, it's a simple NFT marketplace</span>
        </div>
      </div>
      <div className="border-t-2 border-accent-500 p-4">
        <div className="flex gap-2">
          <div className="flex-1 flex">
            <span className="px-3 py-2 bg-accent-950 border-2 border-r-0 border-accent-500 text-accent-500">
              &gt;
            </span>
            <input
              type="text"
              placeholder="[ENCRYPTED MESSAGE]"
              className="flex-1 px-3 py-2 bg-black border-2 border-accent-500 text-accent-400 placeholder-accent-800"
            />
          </div>
          <button className="px-6 py-2 bg-accent-900 border-2 border-accent-500 text-accent-400 font-bold">
            ▶ SEND
          </button>
        </div>
      </div>
    </>
  );
}

function ProfileContent({ name }: { name: string }) {
  return (
    <>
      <div className="border-b-2 border-primary-500 p-6">
        <div className="max-w-2xl mx-auto flex items-start gap-6">
          <div className="w-20 h-20 border-2 border-primary-500 bg-primary-950 flex items-center justify-center text-primary-500 text-2xl">
            {name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-primary-500 text-shadow-neon">{name}</h1>
            <p className="text-accent-400 text-sm mt-1">0x7890...abcd</p>
            <div className="mt-3 flex gap-4 text-xs">
              <span><span className="text-primary-600">FOLLOWING:</span> <span className="text-primary-400">24</span></span>
              <span><span className="text-primary-600">FOLLOWERS:</span> <span className="text-primary-400">156</span></span>
              <span><span className="text-primary-600">TIPS:</span> <span className="text-accent-400">12.5 PAS</span></span>
            </div>
            <div className="mt-4 flex gap-2">
              <button className="px-4 py-1.5 bg-accent-900 border-2 border-accent-500 text-accent-400 text-sm">
                SEND DM
              </button>
              <button className="px-4 py-1.5 bg-gray-900 border-2 border-gray-600 text-gray-400 text-sm">
                UNFOLLOW
              </button>
              <button className="px-4 py-1.5 bg-primary-900 border-2 border-primary-500 text-primary-400 text-sm">
                TIP
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h3 className="text-sm font-bold text-accent-400 mb-2">BIO</h3>
            <div className="border-2 border-primary-700 p-4 bg-primary-950">
              <p className="text-primary-300 text-sm">
                Smart contract developer. Building on Polkadot. DeFi enthusiast.
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-accent-400 mb-2">LINKS</h3>
            <div className="space-y-2">
              <a href="#" className="block p-3 border-2 border-primary-500 bg-primary-950 hover:bg-primary-900 hover:border-primary-400">
                <div className="flex justify-between items-center">
                  <span className="text-primary-400 text-sm">Twitter</span>
                  <span className="text-primary-600">▶</span>
                </div>
                <p className="text-primary-700 text-xs mt-1">twitter.com/cryptowiz</p>
              </a>
              <a href="#" className="block p-3 border-2 border-primary-500 bg-primary-950 hover:bg-primary-900 hover:border-primary-400">
                <div className="flex justify-between items-center">
                  <span className="text-primary-400 text-sm">GitHub</span>
                  <span className="text-primary-600">▶</span>
                </div>
                <p className="text-primary-700 text-xs mt-1">github.com/cryptowiz</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
