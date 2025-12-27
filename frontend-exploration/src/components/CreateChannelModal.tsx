import { useState } from 'react';
import toast from 'react-hot-toast';
import { PostingMode, ChannelType } from '../types/contracts';

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description: string, postingMode: PostingMode) => Promise<{ channelAddress: string }>;
  onCreateUnlisted: (name: string, description: string) => Promise<{ channelAddress: string }>;
}

export function CreateChannelModal({ isOpen, onClose, onCreate, onCreateUnlisted }: CreateChannelModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [channelType, setChannelType] = useState<ChannelType>(ChannelType.Open);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdUnlistedAddress, setCreatedUnlistedAddress] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Channel name is required');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Creating channel...');

    try {
      let result: { channelAddress: string };

      if (channelType === ChannelType.Unlisted) {
        result = await onCreateUnlisted(name.trim(), description.trim());
        toast.success('Unlisted channel created!', { id: toastId });
        // Show the address so user can save it
        setCreatedUnlistedAddress(result.channelAddress);
      } else {
        const postingMode = channelType === ChannelType.Permissioned
          ? PostingMode.Permissioned
          : PostingMode.Open;
        result = await onCreate(name.trim(), description.trim(), postingMode);
        toast.success('Channel created!', { id: toastId });
        setName('');
        setDescription('');
        setChannelType(ChannelType.Open);
        onClose();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create channel', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setChannelType(ChannelType.Open);
    setCreatedUnlistedAddress(null);
    onClose();
  };

  const handleCopyAddress = () => {
    if (createdUnlistedAddress) {
      navigator.clipboard.writeText(createdUnlistedAddress);
      toast.success('Address copied!');
    }
  };

  const handleCopyUrl = () => {
    if (createdUnlistedAddress) {
      const url = `${window.location.origin}${window.location.pathname}?channel=${createdUnlistedAddress}`;
      navigator.clipboard.writeText(url);
      toast.success('URL copied!');
    }
  };

  // Show success screen for unlisted channel
  if (createdUnlistedAddress) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-80" onClick={handleClose} />
        <div className="relative z-10 w-full max-w-md mx-4 border-2 border-accent-500 bg-black p-6">
          <h2 className="text-xl font-bold text-accent-500 text-shadow-neon mb-4 font-mono">
            ▄▄▄ UNLISTED CHANNEL CREATED ▄▄▄
          </h2>

          <div className="space-y-4">
            <div className="p-3 bg-yellow-950 border-2 border-yellow-600">
              <p className="text-yellow-400 font-mono text-sm">
                ⚠️ This channel is NOT saved in the registry. Save the address or URL below!
              </p>
            </div>

            <div>
              <label className="block text-primary-400 font-mono text-sm mb-1">
                CHANNEL ADDRESS
              </label>
              <div className="flex">
                <input
                  type="text"
                  readOnly
                  value={createdUnlistedAddress}
                  className="flex-1 px-3 py-2 bg-black border-2 border-primary-500 text-accent-400 font-mono text-xs"
                />
                <button
                  onClick={handleCopyAddress}
                  className="px-3 py-2 bg-primary-900 border-2 border-l-0 border-primary-500 text-primary-400 font-mono text-sm hover:bg-primary-800"
                >
                  COPY
                </button>
              </div>
            </div>

            <button
              onClick={handleCopyUrl}
              className="w-full py-2 bg-accent-900 hover:bg-accent-800 text-accent-400 border-2 border-accent-500 font-mono text-sm"
            >
              COPY FULL URL
            </button>

            <button
              onClick={handleClose}
              className="w-full py-2 bg-gray-900 hover:bg-gray-800 border-2 border-gray-600 text-gray-400 font-mono text-sm"
            >
              DONE
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-80"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 border-2 border-primary-500 bg-black p-6">
        <h2 className="text-xl font-bold text-primary-500 text-shadow-neon mb-4 font-mono">
          ▄▄▄ CREATE CHANNEL ▄▄▄
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-primary-400 font-mono text-sm mb-1">
              CHANNEL NAME *
            </label>
            <div className="flex">
              <span className="px-3 py-2 bg-primary-950 border-2 border-r-0 border-primary-500 text-accent-400 font-mono">
                #
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                disabled={isSubmitting}
                className="flex-1 px-3 py-2 bg-black border-2 border-primary-500 text-primary-400 font-mono text-sm focus:outline-none focus:border-primary-400 disabled:border-gray-700 disabled:text-gray-600"
                placeholder="general"
              />
            </div>
          </div>

          <div>
            <label className="block text-primary-400 font-mono text-sm mb-1">
              DESCRIPTION
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={2}
              disabled={isSubmitting}
              className="w-full px-3 py-2 bg-black border-2 border-primary-500 text-primary-400 font-mono text-sm focus:outline-none focus:border-primary-400 disabled:border-gray-700 disabled:text-gray-600 resize-none"
              placeholder="What's this channel about?"
            />
          </div>

          <div>
            <label className="block text-primary-400 font-mono text-sm mb-2">
              CHANNEL TYPE
            </label>
            <div className="space-y-2">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="channelType"
                  checked={channelType === ChannelType.Open}
                  onChange={() => setChannelType(ChannelType.Open)}
                  disabled={isSubmitting}
                  className="accent-primary-500 mt-1"
                />
                <div>
                  <span className="text-primary-400 font-mono text-sm">OPEN</span>
                  <p className="text-xs text-primary-600 font-mono">Anyone with a profile can post</p>
                </div>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="channelType"
                  checked={channelType === ChannelType.Permissioned}
                  onChange={() => setChannelType(ChannelType.Permissioned)}
                  disabled={isSubmitting}
                  className="accent-primary-500 mt-1"
                />
                <div>
                  <span className="text-primary-400 font-mono text-sm">PERMISSIONED</span>
                  <p className="text-xs text-primary-600 font-mono">Only approved users can post</p>
                </div>
              </label>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="channelType"
                  checked={channelType === ChannelType.Unlisted}
                  onChange={() => setChannelType(ChannelType.Unlisted)}
                  disabled={isSubmitting}
                  className="accent-primary-500 mt-1"
                />
                <div>
                  <span className="text-primary-400 font-mono text-sm">UNLISTED</span>
                  <p className="text-xs text-primary-600 font-mono">Anyone can post, not shown in sidebar</p>
                </div>
              </label>
            </div>

            {channelType === ChannelType.Unlisted && (
              <div className="mt-3 p-2 bg-yellow-950 border border-yellow-600">
                <p className="text-yellow-400 font-mono text-xs">
                  ⚠️ Unlisted channels are not saved anywhere. You must save the URL!
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 py-2 bg-gray-900 hover:bg-gray-800 border-2 border-gray-600 text-gray-400 font-mono text-sm hover:border-gray-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="flex-1 py-2 bg-primary-900 hover:bg-primary-800 text-primary-400 border-2 border-primary-500 font-mono text-sm disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'CREATING...' : 'CREATE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
