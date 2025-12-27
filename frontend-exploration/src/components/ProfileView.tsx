import { useState, useEffect } from 'react';
import { truncateAddress } from '../utils/formatters';
import type { Profile, Link } from '../types/contracts';

interface ProfileViewProps {
  userAddress: string;
  currentUserAddress?: string | null;
  getProfile: (address: string) => Promise<Profile>;
  getLinks: (address: string) => Promise<Link[]>;
  onSendDM?: (address: string) => void;
  onFollow?: (address: string) => void;
  onUnfollow?: (address: string) => void;
  isFollowing?: boolean;
  dmRegistryAvailable?: boolean;
}

export function ProfileView({
  userAddress,
  currentUserAddress,
  getProfile,
  getLinks,
  onSendDM,
  onFollow,
  onUnfollow,
  isFollowing = false,
  dmRegistryAvailable = false,
}: ProfileViewProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const isOwnProfile = userAddress.toLowerCase() === currentUserAddress?.toLowerCase();

  useEffect(() => {
    if (!userAddress) return;

    setIsLoading(true);
    setError(null);

    Promise.all([
      getProfile(userAddress),
      getLinks(userAddress).catch(() => [] as Link[]),
    ])
      .then(([profileData, linksData]) => {
        setProfile(profileData);
        setLinks(linksData);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [userAddress, getProfile, getLinks]);

  const handleCopyAddress = async () => {
    await navigator.clipboard.writeText(userAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black p-8">
        <div className="text-primary-500 font-mono text-center">
          <div className="text-2xl mb-4 terminal-cursor">...</div>
          <div className="text-sm text-shadow-neon-sm">LOADING PROFILE...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black p-8">
        <div className="text-center">
          <div className="text-red-500 font-mono text-lg mb-2">ERROR</div>
          <div className="text-red-400 font-mono text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (!profile || !profile.exists) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black p-8">
        <div className="text-center max-w-md">
          <div className="text-primary-600 font-mono text-lg mb-4">
            [NO PROFILE FOUND]
          </div>
          <div className="text-primary-700 font-mono text-sm mb-4">
            This user hasn't created a profile yet.
          </div>
          <div className="text-accent-400 font-mono text-xs">
            {truncateAddress(userAddress)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-black">
      {/* Profile Header */}
      <div className="border-b-2 border-primary-500 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Avatar placeholder + Name */}
          <div className="flex items-start gap-6">
            {/* Avatar placeholder */}
            <div className="w-24 h-24 border-2 border-primary-500 bg-primary-950 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-500 font-mono text-3xl">
                {profile.displayName?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-primary-500 text-shadow-neon font-mono truncate">
                {profile.displayName || '(unnamed)'}
              </h1>

              <button
                onClick={handleCopyAddress}
                className="mt-1 text-accent-400 font-mono text-sm hover:text-accent-300 transition-all"
              >
                {copied ? '✓ COPIED' : truncateAddress(userAddress)}
              </button>

              {/* Stats row - placeholder for future */}
              <div className="mt-4 flex gap-6 font-mono text-xs">
                <div>
                  <span className="text-primary-600">FOLLOWING:</span>
                  <span className="text-primary-400 ml-2">0</span>
                </div>
                <div>
                  <span className="text-primary-600">FOLLOWERS:</span>
                  <span className="text-primary-400 ml-2">0</span>
                </div>
                <div>
                  <span className="text-primary-600">TIPS:</span>
                  <span className="text-accent-400 ml-2">0 PAS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {!isOwnProfile && (
            <div className="mt-6 flex gap-3">
              {dmRegistryAvailable && onSendDM && (
                <button
                  onClick={() => onSendDM(userAddress)}
                  className="px-6 py-2 bg-accent-950 hover:bg-accent-900 border-2 border-accent-500 text-accent-400 font-mono text-sm hover:border-accent-400 transition-all uppercase tracking-wider"
                >
                  SEND DM
                </button>
              )}

              {isFollowing ? (
                <button
                  onClick={() => onUnfollow?.(userAddress)}
                  className="px-6 py-2 bg-gray-900 hover:bg-gray-800 border-2 border-gray-600 text-gray-400 font-mono text-sm hover:border-gray-500 transition-all uppercase tracking-wider"
                >
                  UNFOLLOW
                </button>
              ) : (
                <button
                  onClick={() => onFollow?.(userAddress)}
                  className="px-6 py-2 bg-primary-900 hover:bg-primary-800 border-2 border-primary-500 text-primary-400 font-mono text-sm hover:border-primary-400 transition-all uppercase tracking-wider"
                >
                  FOLLOW
                </button>
              )}

              <button
                disabled
                className="px-6 py-2 bg-primary-950 border-2 border-primary-700 text-primary-600 font-mono text-sm uppercase tracking-wider cursor-not-allowed opacity-50"
                title="Coming soon"
              >
                TIP
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Bio Section */}
          {profile.bio && (
            <div>
              <h2 className="text-sm font-bold text-accent-400 font-mono mb-3">
                BIO
              </h2>
              <div className="border-2 border-primary-700 p-4 bg-primary-950">
                <p className="text-primary-300 font-mono text-sm whitespace-pre-wrap">
                  {profile.bio}
                </p>
              </div>
            </div>
          )}

          {/* Links Section (Link-tree style) */}
          {links.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-accent-400 font-mono mb-3">
                LINKS
              </h2>
              <div className="space-y-2">
                {links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full p-4 border-2 border-primary-500 bg-primary-950 hover:bg-primary-900 hover:border-primary-400 transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-primary-400 font-mono text-sm group-hover:text-primary-300">
                        {link.name}
                      </span>
                      <span className="text-primary-600 font-mono text-xs group-hover:text-primary-500">
                        ▶
                      </span>
                    </div>
                    <div className="mt-1 text-primary-700 font-mono text-xs truncate">
                      {link.url}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Empty state for links */}
          {links.length === 0 && (
            <div>
              <h2 className="text-sm font-bold text-accent-400 font-mono mb-3">
                LINKS
              </h2>
              <div className="border-2 border-primary-700 p-4 bg-primary-950 text-center">
                <p className="text-primary-600 font-mono text-sm">
                  No links added yet
                </p>
              </div>
            </div>
          )}

          {/* Activity Section - placeholder */}
          <div>
            <h2 className="text-sm font-bold text-accent-400 font-mono mb-3">
              RECENT ACTIVITY
            </h2>
            <div className="border-2 border-primary-700 p-4 bg-primary-950 text-center">
              <p className="text-primary-600 font-mono text-sm">
                [ACTIVITY FEED COMING SOON]
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
