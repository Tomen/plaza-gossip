import { useState, useEffect } from 'react';
import { truncateAddress } from '../utils/formatters';

// Activity types for the news feed
type ActivityType = 'message' | 'follow' | 'tip' | 'profile_update' | 'channel_create';

interface Activity {
  id: string;
  type: ActivityType;
  actor: {
    address: string;
    displayName?: string;
  };
  target?: {
    address?: string;
    displayName?: string;
    channelName?: string;
  };
  content?: string;
  amount?: string;
  timestamp: number;
}

interface NewsFeedProps {
  onSelectUser?: (address: string) => void;
  onSelectChannel?: (address: string) => void;
}

// Mock data generator
function generateMockActivities(): Activity[] {
  const mockUsers = [
    { address: '0x1234567890abcdef1234567890abcdef12345678', displayName: 'CryptoWizard' },
    { address: '0xabcdef1234567890abcdef1234567890abcdef12', displayName: 'BlockchainBob' },
    { address: '0x9876543210fedcba9876543210fedcba98765432', displayName: 'DeFiDave' },
    { address: '0xfedcba9876543210fedcba9876543210fedcba98', displayName: 'NFTNinja' },
    { address: '0x5678901234abcdef5678901234abcdef56789012' }, // No display name
  ];

  const mockChannels = [
    { address: '0xchannel1', name: '#general' },
    { address: '0xchannel2', name: '#dev' },
    { address: '0xchannel3', name: '#trading' },
  ];

  const now = Math.floor(Date.now() / 1000);

  return [
    {
      id: '1',
      type: 'message',
      actor: mockUsers[0],
      target: { channelName: mockChannels[0].name },
      content: 'Just deployed my first smart contract!',
      timestamp: now - 120,
    },
    {
      id: '2',
      type: 'follow',
      actor: mockUsers[1],
      target: mockUsers[2],
      timestamp: now - 300,
    },
    {
      id: '3',
      type: 'tip',
      actor: mockUsers[2],
      target: mockUsers[0],
      amount: '0.5 PAS',
      timestamp: now - 600,
    },
    {
      id: '4',
      type: 'message',
      actor: mockUsers[3],
      target: { channelName: mockChannels[1].name },
      content: 'Anyone working on L2 solutions?',
      timestamp: now - 900,
    },
    {
      id: '5',
      type: 'profile_update',
      actor: mockUsers[4],
      timestamp: now - 1200,
    },
    {
      id: '6',
      type: 'channel_create',
      actor: mockUsers[1],
      target: { channelName: '#web3-dev' },
      timestamp: now - 1800,
    },
    {
      id: '7',
      type: 'follow',
      actor: mockUsers[0],
      target: mockUsers[3],
      timestamp: now - 2400,
    },
    {
      id: '8',
      type: 'message',
      actor: mockUsers[2],
      target: { channelName: mockChannels[2].name },
      content: 'Market looking bullish today 📈',
      timestamp: now - 3000,
    },
  ];
}

function formatTimeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getActivityIcon(type: ActivityType): string {
  switch (type) {
    case 'message': return '💬';
    case 'follow': return '👤';
    case 'tip': return '💰';
    case 'profile_update': return '✏️';
    case 'channel_create': return '📢';
    default: return '●';
  }
}

function getActivityText(activity: Activity): React.ReactNode {
  const actorName = activity.actor.displayName || truncateAddress(activity.actor.address);
  const targetName = activity.target?.displayName ||
    (activity.target?.address ? truncateAddress(activity.target.address) : null);

  switch (activity.type) {
    case 'message':
      return (
        <>
          <span className="text-accent-400">{actorName}</span>
          {' posted in '}
          <span className="text-primary-400">{activity.target?.channelName}</span>
        </>
      );
    case 'follow':
      return (
        <>
          <span className="text-accent-400">{actorName}</span>
          {' followed '}
          <span className="text-accent-400">{targetName}</span>
        </>
      );
    case 'tip':
      return (
        <>
          <span className="text-accent-400">{actorName}</span>
          {' tipped '}
          <span className="text-accent-400">{targetName}</span>
          {' '}
          <span className="text-yellow-400">{activity.amount}</span>
        </>
      );
    case 'profile_update':
      return (
        <>
          <span className="text-accent-400">{actorName}</span>
          {' updated their profile'}
        </>
      );
    case 'channel_create':
      return (
        <>
          <span className="text-accent-400">{actorName}</span>
          {' created channel '}
          <span className="text-primary-400">{activity.target?.channelName}</span>
        </>
      );
    default:
      return 'Unknown activity';
  }
}

export function NewsFeed({ onSelectUser, onSelectChannel }: NewsFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setActivities(generateMockActivities());
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black p-8">
        <div className="text-primary-500 font-mono text-center">
          <div className="text-2xl mb-4 terminal-cursor">...</div>
          <div className="text-sm text-shadow-neon-sm">LOADING FEED...</div>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black p-8">
        <div className="text-center">
          <div className="text-primary-600 font-mono text-lg mb-2">
            [EMPTY FEED]
          </div>
          <div className="text-primary-700 font-mono text-sm">
            No activity to show
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-black">
      {/* Header */}
      <div className="border-b-2 border-primary-500 p-4">
        <h1 className="text-xl font-bold text-primary-500 text-shadow-neon font-mono">
          ▄▄▄ NEWS FEED ▄▄▄
        </h1>
        <p className="text-primary-700 font-mono text-xs mt-1">
          [MOCK DATA - FOR EXPLORATION]
        </p>
      </div>

      {/* Activity list */}
      <div className="p-4 space-y-3">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="border-2 border-primary-700 p-3 bg-primary-950 hover:border-primary-600 transition-all"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <span className="text-lg flex-shrink-0">
                {getActivityIcon(activity.type)}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-primary-400 font-mono text-sm">
                  {getActivityText(activity)}
                </p>

                {/* Message preview if available */}
                {activity.content && (
                  <p className="mt-2 text-primary-600 font-mono text-xs italic truncate">
                    "{activity.content}"
                  </p>
                )}

                {/* Timestamp */}
                <p className="mt-2 text-primary-700 font-mono text-xs">
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t-2 border-primary-700">
        <p className="text-primary-700 font-mono text-xs text-center">
          [END OF FEED]
        </p>
      </div>
    </div>
  );
}
