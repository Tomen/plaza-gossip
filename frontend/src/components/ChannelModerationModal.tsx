import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { PostingMode } from '../types/contracts';
import type { ChannelInfo } from '../types/contracts';

interface ChannelModerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  channelInfo: ChannelInfo | null;
  currentUserAddress: string | null;
  // Moderation actions
  addAllowedPoster: (address: string) => Promise<void>;
  removeAllowedPoster: (address: string) => Promise<void>;
  promoteAdmin: (address: string) => Promise<void>;
  demoteAdmin: (address: string) => Promise<void>;
  transferOwnership: (newOwner: string) => Promise<void>;
  setPostingMode: (mode: PostingMode) => Promise<void>;
}

type Tab = 'posters' | 'admins' | 'settings';

export function ChannelModerationModal({
  isOpen,
  onClose,
  channelInfo,
  currentUserAddress,
  addAllowedPoster,
  removeAllowedPoster,
  promoteAdmin,
  demoteAdmin,
  transferOwnership,
  setPostingMode,
}: ChannelModerationModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('posters');
  const [isUserOwner, setIsUserOwner] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form inputs
  const [posterAddress, setPosterAddress] = useState('');
  const [adminAddress, setAdminAddress] = useState('');
  const [newOwnerAddress, setNewOwnerAddress] = useState('');

  useEffect(() => {
    if (!currentUserAddress || !channelInfo) {
      setIsUserOwner(false);
      return;
    }

    setIsUserOwner(channelInfo.owner.toLowerCase() === currentUserAddress.toLowerCase());
  }, [isOpen, currentUserAddress, channelInfo]);

  if (!isOpen || !channelInfo) return null;

  const isPermissioned = channelInfo.postingMode === PostingMode.Permissioned;

  const handleAddPoster = async () => {
    if (!posterAddress.trim()) {
      toast.error('Please enter an address');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Adding allowed poster...');
    try {
      await addAllowedPoster(posterAddress.trim());
      toast.success('Poster added!', { id: toastId });
      setPosterAddress('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add poster', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemovePoster = async () => {
    if (!posterAddress.trim()) {
      toast.error('Please enter an address');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Removing allowed poster...');
    try {
      await removeAllowedPoster(posterAddress.trim());
      toast.success('Poster removed!', { id: toastId });
      setPosterAddress('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove poster', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePromoteAdmin = async () => {
    if (!adminAddress.trim()) {
      toast.error('Please enter an address');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Promoting to admin...');
    try {
      await promoteAdmin(adminAddress.trim());
      toast.success('Admin promoted!', { id: toastId });
      setAdminAddress('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to promote admin', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoteAdmin = async () => {
    if (!adminAddress.trim()) {
      toast.error('Please enter an address');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Demoting admin...');
    try {
      await demoteAdmin(adminAddress.trim());
      toast.success('Admin demoted!', { id: toastId });
      setAdminAddress('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to demote admin', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTransferOwnership = async () => {
    if (!newOwnerAddress.trim()) {
      toast.error('Please enter an address');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Transferring ownership...');
    try {
      await transferOwnership(newOwnerAddress.trim());
      toast.success('Ownership transferred!', { id: toastId });
      setNewOwnerAddress('');
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to transfer ownership', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetPostingMode = async (mode: PostingMode) => {
    setIsSubmitting(true);
    const modeName = mode === PostingMode.Open ? 'Open' : 'Permissioned';
    const toastId = toast.loading(`Setting posting mode to ${modeName}...`);
    try {
      await setPostingMode(mode);
      toast.success(`Posting mode set to ${modeName}!`, { id: toastId });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to set posting mode', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPosterAddress('');
    setAdminAddress('');
    setNewOwnerAddress('');
    onClose();
  };

  const tabClass = (tab: Tab) =>
    `px-4 py-2 font-mono text-sm border-b-2 transition-colors ${
      activeTab === tab
        ? 'border-primary-500 text-primary-400'
        : 'border-transparent text-gray-500 hover:text-primary-500'
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-80" onClick={handleClose} />

      <div className="relative z-10 w-full max-w-lg mx-4 border-2 border-primary-500 bg-black">
        {/* Header */}
        <div className="p-4 border-b border-primary-800">
          <h2 className="text-xl font-bold text-primary-500 text-shadow-neon font-mono">
            CHANNEL MODERATION
          </h2>
          <p className="text-xs text-primary-600 font-mono mt-1">
            #{channelInfo.name}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-primary-800">
          <button className={tabClass('posters')} onClick={() => setActiveTab('posters')}>
            POSTERS
          </button>
          <button className={tabClass('admins')} onClick={() => setActiveTab('admins')}>
            ADMINS
          </button>
          {isUserOwner && (
            <button className={tabClass('settings')} onClick={() => setActiveTab('settings')}>
              SETTINGS
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
          {/* Posters Tab */}
          {activeTab === 'posters' && (
            <div className="space-y-4">
              {!isPermissioned ? (
                <div className="p-3 bg-gray-900 border border-gray-700">
                  <p className="text-gray-400 font-mono text-sm">
                    This channel uses OPEN posting mode. All registered users can post.
                  </p>
                  {isUserOwner && (
                    <button
                      onClick={() => handleSetPostingMode(PostingMode.Permissioned)}
                      disabled={isSubmitting}
                      className="mt-2 px-3 py-1 bg-primary-900 hover:bg-primary-800 text-primary-400 border border-primary-500 font-mono text-xs disabled:opacity-50"
                    >
                      SWITCH TO PERMISSIONED
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="p-3 bg-yellow-950 border border-yellow-600">
                    <p className="text-yellow-400 font-mono text-sm">
                      PERMISSIONED mode - Only allowed posters can post messages.
                    </p>
                  </div>

                  <div>
                    <label className="block text-primary-400 font-mono text-sm mb-1">
                      WALLET ADDRESS
                    </label>
                    <input
                      type="text"
                      value={posterAddress}
                      onChange={(e) => setPosterAddress(e.target.value)}
                      placeholder="0x..."
                      disabled={isSubmitting}
                      className="w-full px-3 py-2 bg-black border-2 border-primary-500 text-primary-400 font-mono text-sm focus:outline-none focus:border-primary-400 disabled:opacity-50"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleAddPoster}
                      disabled={isSubmitting || !posterAddress.trim()}
                      className="flex-1 py-2 bg-green-900 hover:bg-green-800 text-green-400 border-2 border-green-500 font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ADD POSTER
                    </button>
                    <button
                      onClick={handleRemovePoster}
                      disabled={isSubmitting || !posterAddress.trim()}
                      className="flex-1 py-2 bg-red-900 hover:bg-red-800 text-red-400 border-2 border-red-500 font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      REMOVE POSTER
                    </button>
                  </div>

                  {isUserOwner && (
                    <button
                      onClick={() => handleSetPostingMode(PostingMode.Open)}
                      disabled={isSubmitting}
                      className="w-full px-3 py-1 bg-gray-900 hover:bg-gray-800 text-gray-400 border border-gray-600 font-mono text-xs disabled:opacity-50"
                    >
                      SWITCH TO OPEN MODE
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Admins Tab */}
          {activeTab === 'admins' && (
            <div className="space-y-4">
              <div className="p-3 bg-gray-900 border border-gray-700">
                <p className="text-gray-400 font-mono text-sm">
                  Admins can manage allowed posters in permissioned channels.
                </p>
              </div>

              <div>
                <label className="block text-primary-400 font-mono text-sm mb-1">
                  WALLET ADDRESS
                </label>
                <input
                  type="text"
                  value={adminAddress}
                  onChange={(e) => setAdminAddress(e.target.value)}
                  placeholder="0x..."
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 bg-black border-2 border-primary-500 text-primary-400 font-mono text-sm focus:outline-none focus:border-primary-400 disabled:opacity-50"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handlePromoteAdmin}
                  disabled={isSubmitting || !adminAddress.trim() || !isUserOwner}
                  className="flex-1 py-2 bg-green-900 hover:bg-green-800 text-green-400 border-2 border-green-500 font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  PROMOTE
                </button>
                <button
                  onClick={handleDemoteAdmin}
                  disabled={isSubmitting || !adminAddress.trim() || !isUserOwner}
                  className="flex-1 py-2 bg-red-900 hover:bg-red-800 text-red-400 border-2 border-red-500 font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  DEMOTE
                </button>
              </div>

              {!isUserOwner && (
                <p className="text-xs text-gray-500 font-mono">
                  Only the channel owner can promote/demote admins.
                </p>
              )}
            </div>
          )}

          {/* Settings Tab (Owner only) */}
          {activeTab === 'settings' && isUserOwner && (
            <div className="space-y-4">
              <div className="p-3 bg-red-950 border border-red-600">
                <p className="text-red-400 font-mono text-sm">
                  These actions are irreversible. Use with caution.
                </p>
              </div>

              <div>
                <label className="block text-primary-400 font-mono text-sm mb-1">
                  CURRENT OWNER
                </label>
                <p className="text-xs text-accent-400 font-mono break-all">
                  {channelInfo.owner}
                </p>
              </div>

              <div>
                <label className="block text-primary-400 font-mono text-sm mb-1">
                  TRANSFER OWNERSHIP TO
                </label>
                <input
                  type="text"
                  value={newOwnerAddress}
                  onChange={(e) => setNewOwnerAddress(e.target.value)}
                  placeholder="0x..."
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 bg-black border-2 border-primary-500 text-primary-400 font-mono text-sm focus:outline-none focus:border-primary-400 disabled:opacity-50"
                />
              </div>

              <button
                onClick={handleTransferOwnership}
                disabled={isSubmitting || !newOwnerAddress.trim()}
                className="w-full py-2 bg-red-900 hover:bg-red-800 text-red-400 border-2 border-red-500 font-mono text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                TRANSFER OWNERSHIP
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-primary-800">
          <button
            onClick={handleClose}
            className="w-full py-2 bg-gray-900 hover:bg-gray-800 border-2 border-gray-600 text-gray-400 font-mono text-sm"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
