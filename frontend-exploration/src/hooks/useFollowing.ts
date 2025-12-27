import { useState, useEffect, useCallback } from 'react';

interface FollowedUser {
  address: string;
  displayName?: string;
  followedAt: number;
}

interface UseFollowingReturn {
  following: FollowedUser[];
  isFollowing: (address: string) => boolean;
  follow: (address: string, displayName?: string) => void;
  unfollow: (address: string) => void;
  updateDisplayName: (address: string, displayName: string) => void;
  isLoading: boolean;
}

const STORAGE_KEY = 'plaza-gossip-following';

function loadFromStorage(): FollowedUser[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load following list from storage:', e);
  }
  return [];
}

function saveToStorage(following: FollowedUser[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(following));
  } catch (e) {
    console.error('Failed to save following list to storage:', e);
  }
}

export function useFollowing(): UseFollowingReturn {
  const [following, setFollowing] = useState<FollowedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = loadFromStorage();
    setFollowing(stored);
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever following changes
  useEffect(() => {
    if (!isLoading) {
      saveToStorage(following);
    }
  }, [following, isLoading]);

  const isFollowingAddress = useCallback(
    (address: string): boolean => {
      return following.some(
        (user) => user.address.toLowerCase() === address.toLowerCase()
      );
    },
    [following]
  );

  const follow = useCallback((address: string, displayName?: string) => {
    setFollowing((prev) => {
      // Don't add if already following
      if (prev.some((user) => user.address.toLowerCase() === address.toLowerCase())) {
        return prev;
      }

      return [
        ...prev,
        {
          address,
          displayName,
          followedAt: Date.now(),
        },
      ];
    });
  }, []);

  const unfollow = useCallback((address: string) => {
    setFollowing((prev) =>
      prev.filter((user) => user.address.toLowerCase() !== address.toLowerCase())
    );
  }, []);

  const updateDisplayName = useCallback((address: string, displayName: string) => {
    setFollowing((prev) =>
      prev.map((user) =>
        user.address.toLowerCase() === address.toLowerCase()
          ? { ...user, displayName }
          : user
      )
    );
  }, []);

  return {
    following,
    isFollowing: isFollowingAddress,
    follow,
    unfollow,
    updateDisplayName,
    isLoading,
  };
}
