import { truncateAddress } from '../utils/formatters';

interface FollowedUser {
  address: string;
  displayName?: string;
  followedAt: number;
}

interface FollowingListProps {
  following: FollowedUser[];
  selectedAddress?: string | null;
  onSelectUser: (address: string) => void;
  onUnfollow?: (address: string) => void;
  isLoading?: boolean;
}

export function FollowingList({
  following,
  selectedAddress,
  onSelectUser,
  onUnfollow,
  isLoading = false,
}: FollowingListProps) {
  if (isLoading) {
    return (
      <div className="py-4 px-4">
        <div className="text-primary-600 font-mono text-sm animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (following.length === 0) {
    return (
      <div className="py-4 px-4">
        <div className="text-primary-700 font-mono text-xs text-center">
          Not following anyone yet
        </div>
      </div>
    );
  }

  return (
    <div className="py-2">
      {following.map((user) => {
        const isSelected = user.address.toLowerCase() === selectedAddress?.toLowerCase();
        const displayIdentifier = user.displayName || truncateAddress(user.address);

        return (
          <div
            key={user.address}
            className={`group flex items-center ${
              isSelected
                ? 'bg-primary-900 border-l-2 border-primary-400'
                : 'hover:bg-primary-950'
            }`}
          >
            <button
              onClick={() => onSelectUser(user.address)}
              className="flex-1 px-4 py-2 flex items-center gap-2 text-left font-mono text-sm"
            >
              {/* Status indicator */}
              <span className={isSelected ? 'text-accent-400' : 'text-primary-600'}>
                @
              </span>

              {/* Name */}
              <span
                className={isSelected ? 'text-primary-300' : 'text-primary-500'}
                title={user.address}
              >
                {displayIdentifier}
              </span>
            </button>

            {/* Unfollow button (visible on hover) */}
            {onUnfollow && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUnfollow(user.address);
                }}
                className="px-2 py-1 mr-2 opacity-0 group-hover:opacity-100 text-primary-700 hover:text-red-500 font-mono text-xs transition-all"
                title="Unfollow"
              >
                ×
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
