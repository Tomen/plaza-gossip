import type { ChannelInfo } from '../types/contracts';
import { PostingMode } from '../types/contracts';

interface ChannelHeaderProps {
  channelInfo: ChannelInfo | null;
  isLoading: boolean;
  canManage?: boolean;
  onManageClick?: () => void;
}

export function ChannelHeader({ channelInfo, isLoading, canManage, onManageClick }: ChannelHeaderProps) {
  if (isLoading) {
    return (
      <div className="border-b-2 border-primary-500 bg-primary-950 bg-opacity-30 px-4 py-3">
        <div className="font-mono text-primary-600 text-sm">Loading channel...</div>
      </div>
    );
  }

  if (!channelInfo) {
    return null;
  }

  return (
    <div className="border-b-2 border-primary-500 bg-primary-950 bg-opacity-30 px-4 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-primary-500 font-mono flex items-center gap-2">
            <span className="text-accent-400">#</span>
            {channelInfo.name}
            {channelInfo.postingMode === PostingMode.Permissioned && (
              <span className="text-xs bg-yellow-900 text-yellow-400 px-2 py-0.5 border-2 border-yellow-600">
                PERMISSIONED
              </span>
            )}
          </h2>
          {channelInfo.description && (
            <p className="text-xs text-primary-600 font-mono mt-1">
              {channelInfo.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {canManage && onManageClick && (
            <button
              onClick={onManageClick}
              className="px-3 py-1 bg-primary-900 hover:bg-primary-800 text-primary-400 border-2 border-primary-500 font-mono text-xs"
            >
              MANAGE
            </button>
          )}
          <div className="text-right font-mono text-xs text-primary-600">
            <div>{channelInfo.messageCount.toString()} messages</div>
          </div>
        </div>
      </div>

      {channelInfo.motd && (
        <div className="mt-2 px-3 py-2 bg-accent-950 bg-opacity-50 border-2 border-accent-700">
          <span className="text-accent-500 font-mono text-xs">MOTD:</span>
          <span className="text-accent-400 font-mono text-xs ml-2">{channelInfo.motd}</span>
        </div>
      )}
    </div>
  );
}
