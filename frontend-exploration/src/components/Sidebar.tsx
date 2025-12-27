import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import type { RegisteredChannel } from '../types/contracts';
import { PostingMode } from '../types/contracts';
import type { ConversationInfo } from '../hooks/useDMRegistry';
import ChatChannelABI from '../contracts/ChatChannel.json';
import { truncateAddress } from '../utils/formatters';
import { FollowingList } from './FollowingList';

interface ChannelListItem {
  address: string;
  name: string;
  postingMode: number;
}

interface ConversationWithName extends ConversationInfo {
  displayName: string;
}

interface FollowedUser {
  address: string;
  displayName?: string;
  followedAt: number;
}

export type ViewMode = 'channels' | 'dms' | 'profile' | 'news';

interface SidebarProps {
  channels: RegisteredChannel[];
  selectedChannel: string | null;
  onSelectChannel: (address: string) => void;
  onCreateChannel: () => void;
  provider: ethers.BrowserProvider | ethers.JsonRpcProvider | null;
  isConnected: boolean;
  // DM-related props
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  dmConversations?: ConversationInfo[];
  selectedConversation?: string | null;
  onSelectConversation?: (address: string) => void;
  onNewDM?: () => void;
  dmLoading?: boolean;
  dmRegistryAvailable?: boolean;
  getDisplayName?: (address: string) => Promise<string>;
  // Following-related props (Prototype 1)
  following?: FollowedUser[];
  selectedProfileAddress?: string | null;
  onSelectProfile?: (address: string) => void;
  onUnfollow?: (address: string) => void;
}

export function Sidebar({
  channels,
  selectedChannel,
  onSelectChannel,
  onCreateChannel,
  provider,
  isConnected,
  viewMode,
  onViewModeChange,
  dmConversations = [],
  selectedConversation,
  onSelectConversation,
  onNewDM,
  dmLoading = false,
  dmRegistryAvailable = false,
  getDisplayName,
  following = [],
  selectedProfileAddress,
  onSelectProfile,
  onUnfollow,
}: SidebarProps) {
  const [channelNames, setChannelNames] = useState<ChannelListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationsWithNames, setConversationsWithNames] = useState<ConversationWithName[]>([]);
  const [loadingDMNames, setLoadingDMNames] = useState(false);

  // Load channel names
  useEffect(() => {
    if (!provider || channels.length === 0) {
      setChannelNames([]);
      return;
    }

    const loadChannelNames = async () => {
      setIsLoading(true);
      try {
        const names = await Promise.all(
          channels.map(async (ch) => {
            try {
              const contract = new ethers.Contract(
                ch.channelAddress,
                ChatChannelABI.abi,
                provider
              );
              const [name, postingMode] = await Promise.all([
                contract.name(),
                contract.postingMode(),
              ]);
              return { address: ch.channelAddress, name, postingMode: Number(postingMode) };
            } catch {
              return { address: ch.channelAddress, name: 'Unknown', postingMode: 0 };
            }
          })
        );
        setChannelNames(names);
      } finally {
        setIsLoading(false);
      }
    };

    loadChannelNames();
  }, [channels, provider]);

  // Load DM conversation display names
  useEffect(() => {
    if (dmConversations.length === 0 || !getDisplayName) {
      setConversationsWithNames([]);
      return;
    }

    setLoadingDMNames(true);
    Promise.all(
      dmConversations.map(async (conv) => {
        const displayName = await getDisplayName(conv.otherParticipant);
        return { ...conv, displayName };
      })
    )
      .then(setConversationsWithNames)
      .finally(() => setLoadingDMNames(false));
  }, [dmConversations, getDisplayName]);

  return (
    <div className="w-64 border-r-2 border-primary-500 bg-black flex flex-col">
      {/* Tab Header - Prototype 1: Four view modes */}
      <div className="border-b-2 border-primary-700">
        <div className="grid grid-cols-2 gap-0">
          <button
            onClick={() => onViewModeChange('channels')}
            className={`py-2 font-mono text-xs font-bold transition-all border-b-2 ${
              viewMode === 'channels'
                ? 'text-primary-400 border-primary-400 bg-primary-950'
                : 'text-primary-700 border-transparent hover:text-primary-500 hover:bg-primary-950'
            }`}
          >
            CHANNELS
          </button>
          <button
            onClick={() => onViewModeChange('dms')}
            className={`py-2 font-mono text-xs font-bold transition-all border-b-2 ${
              viewMode === 'dms'
                ? 'text-accent-400 border-accent-400 bg-accent-950'
                : 'text-primary-700 border-transparent hover:text-primary-500 hover:bg-primary-950'
            }`}
          >
            DMS
          </button>
          <button
            onClick={() => onViewModeChange('profile')}
            className={`py-2 font-mono text-xs font-bold transition-all border-b-2 ${
              viewMode === 'profile'
                ? 'text-accent-400 border-accent-400 bg-accent-950'
                : 'text-primary-700 border-transparent hover:text-primary-500 hover:bg-primary-950'
            }`}
          >
            PROFILES
          </button>
          <button
            onClick={() => onViewModeChange('news')}
            className={`py-2 font-mono text-xs font-bold transition-all border-b-2 ${
              viewMode === 'news'
                ? 'text-yellow-400 border-yellow-400 bg-yellow-950'
                : 'text-primary-700 border-transparent hover:text-primary-500 hover:bg-primary-950'
            }`}
          >
            NEWS
          </button>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'channels' ? (
        <>
          {/* Channel list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-primary-600 font-mono text-sm">
                Loading channels...
              </div>
            ) : channelNames.length === 0 ? (
              <div className="p-4 text-primary-700 font-mono text-sm">
                No channels found
              </div>
            ) : (
              <div className="py-2">
                {channelNames.map((ch) => (
                  <button
                    key={ch.address}
                    onClick={() => onSelectChannel(ch.address)}
                    className={`w-full text-left px-4 py-2 font-mono text-sm transition-all ${
                      selectedChannel === ch.address
                        ? 'bg-primary-900 text-primary-300 border-l-2 border-primary-400'
                        : 'bg-black text-primary-500 hover:bg-primary-950 hover:text-primary-400'
                    }`}
                  >
                    <span className="inline-block w-4 text-center text-sm leading-none">
                      {ch.postingMode === PostingMode.Permissioned ? (
                        <span className="text-yellow-500 text-xs">&#x1F512;</span>
                      ) : (
                        <span className="text-accent-500">#</span>
                      )}
                    </span>{' '}
                    {ch.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Create channel button */}
          {isConnected && (
            <div className="p-4 border-t-2 border-primary-700">
              <button
                onClick={onCreateChannel}
                className="w-full py-2 bg-primary-900 hover:bg-primary-800 text-primary-400 border-2 border-primary-500 hover:border-primary-400 font-mono text-sm transition-all"
              >
                + NEW CHANNEL
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* DM conversation list */}
          <div className="flex-1 overflow-y-auto">
            {dmLoading || loadingDMNames ? (
              <div className="p-4 text-primary-600 font-mono text-sm animate-pulse">
                Loading conversations...
              </div>
            ) : conversationsWithNames.length === 0 ? (
              <div className="p-4">
                <p className="text-primary-700 font-mono text-sm mb-4">
                  No conversations yet
                </p>
                {isConnected && onNewDM && (
                  <button
                    onClick={onNewDM}
                    className="w-full py-2 text-sm font-mono text-accent-400 border border-accent-500 hover:bg-accent-950 transition-colors"
                  >
                    Start a conversation
                  </button>
                )}
              </div>
            ) : (
              <div className="py-2">
                {conversationsWithNames.map((conv) => (
                  <button
                    key={conv.address}
                    onClick={() => onSelectConversation?.(conv.address)}
                    className={`w-full text-left px-4 py-3 font-mono transition-all ${
                      selectedConversation === conv.address
                        ? 'bg-accent-950 text-accent-300 border-l-2 border-accent-400'
                        : 'bg-black text-primary-500 hover:bg-primary-950 hover:text-primary-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">
                          {conv.displayName || truncateAddress(conv.otherParticipant)}
                        </p>
                        {conv.displayName && (
                          <p className="text-xs text-primary-700 mt-0.5 truncate">
                            {truncateAddress(conv.otherParticipant)}
                          </p>
                        )}
                      </div>
                      {conv.messageCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-primary-900 text-primary-500 text-xs rounded">
                          {conv.messageCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* New DM button */}
          {isConnected && onNewDM && (
            <div className="p-4 border-t-2 border-primary-700">
              <button
                onClick={onNewDM}
                className="w-full py-2 bg-accent-900 hover:bg-accent-800 text-accent-400 border-2 border-accent-500 hover:border-accent-400 font-mono text-sm transition-all"
              >
                + NEW DM
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
