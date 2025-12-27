import { useState, useCallback, useEffect } from "react";
import FollowRegistryABI from "../contracts/FollowRegistry.json";
import {
  createReadContract,
  createWriteContract,
  type Provider,
  type Signer,
} from "../utils/contracts";

interface UseFollowRegistryProps {
  registryAddress: string | null;
  provider: Provider | null;
  userAddress: string | null;
  signer?: Signer | null;
  enabled?: boolean;
}

interface UseFollowRegistryReturn {
  // State
  following: string[];
  followers: string[];
  followingCount: number;
  followerCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  follow: (address: string) => Promise<void>;
  unfollow: (address: string) => Promise<void>;
  isFollowing: (address: string) => Promise<boolean>;
  isFollowingSync: (address: string) => boolean;

  // Refresh
  refresh: () => Promise<void>;
}

export function useFollowRegistry({
  registryAddress,
  provider,
  userAddress,
  signer,
  enabled = true,
}: UseFollowRegistryProps): UseFollowRegistryReturn {
  const [following, setFollowing] = useState<string[]>([]);
  const [followers, setFollowers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getReadContract = useCallback(() => {
    return createReadContract(
      registryAddress,
      FollowRegistryABI.abi,
      provider
    );
  }, [registryAddress, provider]);

  const getWriteContract = useCallback(async () => {
    return createWriteContract(
      registryAddress,
      FollowRegistryABI.abi,
      provider,
      signer ?? null
    );
  }, [registryAddress, provider, signer]);

  const loadFollowData = useCallback(async () => {
    if (!userAddress) {
      setFollowing([]);
      setFollowers([]);
      return;
    }

    const contract = getReadContract();
    if (!contract) return;

    try {
      setIsLoading(true);
      setError(null);

      const [followingList, followersList] = await Promise.all([
        contract.getFollowing(userAddress),
        contract.getFollowers(userAddress),
      ]);

      // Convert to plain arrays (ethers returns array-like objects)
      setFollowing([...followingList]);
      setFollowers([...followersList]);
    } catch (err) {
      console.error("Failed to load follow data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load follow data"
      );
    } finally {
      setIsLoading(false);
    }
  }, [userAddress, getReadContract]);

  useEffect(() => {
    if (enabled && registryAddress) {
      loadFollowData();
    }
  }, [enabled, userAddress, registryAddress, provider, loadFollowData]);

  const follow = useCallback(
    async (address: string): Promise<void> => {
      if (!enabled) throw new Error("Not enabled");
      const contract = await getWriteContract();
      if (!contract) throw new Error("Contract not available");

      // Optimistic update
      setFollowing((prev) => [...prev, address]);

      try {
        const tx = await contract.follow(address);
        await tx.wait();
        // Refresh from chain to ensure consistency
        await loadFollowData();
      } catch (err) {
        // Revert optimistic update on error
        setFollowing((prev) => prev.filter((a) => a.toLowerCase() !== address.toLowerCase()));
        throw err;
      }
    },
    [enabled, getWriteContract, loadFollowData]
  );

  const unfollow = useCallback(
    async (address: string): Promise<void> => {
      if (!enabled) throw new Error("Not enabled");
      const contract = await getWriteContract();
      if (!contract) throw new Error("Contract not available");

      // Optimistic update
      const previousFollowing = [...following];
      setFollowing((prev) => prev.filter((a) => a.toLowerCase() !== address.toLowerCase()));

      try {
        const tx = await contract.unfollow(address);
        await tx.wait();
        // Refresh from chain to ensure consistency
        await loadFollowData();
      } catch (err) {
        // Revert optimistic update on error
        setFollowing(previousFollowing);
        throw err;
      }
    },
    [enabled, getWriteContract, loadFollowData, following]
  );

  const isFollowingCheck = useCallback(
    async (address: string): Promise<boolean> => {
      if (!userAddress) return false;
      const contract = getReadContract();
      if (!contract) return false;

      return contract.isFollowing(userAddress, address);
    },
    [userAddress, getReadContract]
  );

  // Synchronous check against local state
  const isFollowingSync = useCallback(
    (address: string): boolean => {
      return following.some(
        (addr) => addr.toLowerCase() === address.toLowerCase()
      );
    },
    [following]
  );

  return {
    following,
    followers,
    followingCount: following.length,
    followerCount: followers.length,
    isLoading,
    error,
    follow,
    unfollow,
    isFollowing: isFollowingCheck,
    isFollowingSync,
    refresh: loadFollowData,
  };
}
