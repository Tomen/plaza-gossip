// ============ UserRegistry Types ============

export interface Link {
  name: string;
  url: string;
}

export interface Profile {
  owner: string;
  displayName: string;
  bio: string;
  exists: boolean;
}

// ============ ChatChannel Types ============

// On-chain posting mode (stored in contract)
export const PostingMode = {
  Open: 0,
  Permissioned: 1,
} as const;

export type PostingMode = (typeof PostingMode)[keyof typeof PostingMode];

// Channel type for creation UI (includes unlisted option)
export const ChannelType = {
  Open: 'open',           // Anyone can post, listed in registry
  Permissioned: 'permissioned',  // Only allowed posters, listed in registry
  Unlisted: 'unlisted',   // Anyone can post, NOT listed in registry
} as const;

export type ChannelType = (typeof ChannelType)[keyof typeof ChannelType];

export interface Message {
  profileOwner: string;
  sender: string;
  content: string;
  timestamp: bigint;
}

export interface FormattedMessage {
  profileOwner: string;
  sender: string;
  content: string;
  timestamp: number;
  formattedTime: string;
  displayName?: string;
}

export interface ChannelInfo {
  name: string;
  description: string;
  motd: string;
  owner: string;
  postingMode: PostingMode;
  messageCount: bigint;
}

// ============ ChannelRegistry Types ============

export interface RegisteredChannel {
  channelAddress: string;
  registeredBy: string;
  registeredAt: bigint;
}

// ============ App Wallet Types ============

export interface StoredWallet {
  privateKey: string;
  address: string;
  authorizedFor: string;
  createdAt: number;
}
