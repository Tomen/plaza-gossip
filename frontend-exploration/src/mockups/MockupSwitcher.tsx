import { useState } from 'react';
import { InformationTerminalMockup } from './InformationTerminal';
import { CommandCenterMockup } from './CommandCenter';
import { Windows311Mockup } from './Windows311';
import { NortonCommanderMockup } from './NortonCommander';
import { NotionStyleMockup } from './NotionStyle';

type MockupType = 'terminal' | 'command-center' | 'windows311' | 'norton' | 'notion' | 'current';

interface MockupInfo {
  id: MockupType;
  name: string;
  description: string;
}

const mockups: MockupInfo[] = [
  {
    id: 'current',
    name: 'Current App',
    description: 'The live application as it exists today',
  },
  {
    id: 'terminal',
    name: 'Information Terminal',
    description: 'Full-screen view switching, one thing at a time',
  },
  {
    id: 'command-center',
    name: 'Command Center',
    description: 'HUD/cockpit style with multiple persistent panels',
  },
  {
    id: 'windows311',
    name: 'Windows 3.11',
    description: 'Overlapping draggable windows with taskbar',
  },
  {
    id: 'norton',
    name: 'Norton Commander',
    description: 'Two-panel layout, keyboard-driven',
  },
  {
    id: 'notion',
    name: 'Notion Style',
    description: 'Collapsible tree sidebar, profile-centric',
  },
];

interface MockupSwitcherProps {
  children: React.ReactNode; // The current app
}

export function MockupSwitcher({ children }: MockupSwitcherProps) {
  const [activeMockup, setActiveMockup] = useState<MockupType>('current');

  return (
    <div className="h-screen flex flex-col">
      {/* Mockup Selector Bar */}
      <div className="bg-gray-900 border-b-2 border-gray-700 px-4 py-2 flex items-center gap-4 flex-shrink-0">
        <span className="text-gray-400 font-mono text-sm font-bold">
          UI EXPLORATION:
        </span>
        <div className="flex gap-2">
          {mockups.map((mockup) => (
            <button
              key={mockup.id}
              onClick={() => setActiveMockup(mockup.id)}
              className={`px-3 py-1 font-mono text-xs border-2 transition-all ${
                activeMockup === mockup.id
                  ? 'bg-green-900 border-green-500 text-green-400'
                  : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500'
              }`}
              title={mockup.description}
            >
              {mockup.name}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <span className="text-gray-600 font-mono text-xs">
          {mockups.find((m) => m.id === activeMockup)?.description}
        </span>
      </div>

      {/* Active Mockup */}
      <div className="flex-1 overflow-hidden">
        {activeMockup === 'current' && children}
        {activeMockup === 'terminal' && <InformationTerminalMockup />}
        {activeMockup === 'command-center' && <CommandCenterMockup />}
        {activeMockup === 'windows311' && <Windows311Mockup />}
        {activeMockup === 'norton' && <NortonCommanderMockup />}
        {activeMockup === 'notion' && <NotionStyleMockup />}
      </div>
    </div>
  );
}
