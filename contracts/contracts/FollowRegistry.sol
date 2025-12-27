// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IUserRegistry {
    function resolveToOwner(address addr) external view returns (address);
}

contract FollowRegistry {

    // ============ State ============

    IUserRegistry public immutable userRegistry;

    // user => list of addresses they follow
    mapping(address => address[]) private _following;
    // user => followee => index+1 in _following array (0 means not following)
    mapping(address => mapping(address => uint256)) private _followingIndex;

    // followee => list of their followers
    mapping(address => address[]) private _followers;
    // followee => follower => index+1 in _followers array (0 means not a follower)
    mapping(address => mapping(address => uint256)) private _followerIndex;

    // ============ Events ============

    event Followed(address indexed follower, address indexed followee);
    event Unfollowed(address indexed follower, address indexed followee);

    // ============ Constructor ============

    constructor(address _userRegistry) {
        userRegistry = IUserRegistry(_userRegistry);
    }

    // ============ Internal ============

    /// @dev Resolve caller to their profile owner (supports delegate wallets)
    function _resolveFollower() internal view returns (address) {
        address resolved = userRegistry.resolveToOwner(msg.sender);
        return resolved == address(0) ? msg.sender : resolved;
    }

    // ============ Follow Management ============

    /// @notice Follow a user
    /// @param user The address to follow
    function follow(address user) external {
        address follower = _resolveFollower();
        require(user != address(0), "Cannot follow zero address");
        require(user != follower, "Cannot follow yourself");
        require(_followingIndex[follower][user] == 0, "Already following");

        // Add to following list
        _following[follower].push(user);
        _followingIndex[follower][user] = _following[follower].length; // index+1

        // Add to followers list
        _followers[user].push(follower);
        _followerIndex[user][follower] = _followers[user].length; // index+1

        emit Followed(follower, user);
    }

    /// @notice Unfollow a user
    /// @param user The address to unfollow
    function unfollow(address user) external {
        address follower = _resolveFollower();
        require(_followingIndex[follower][user] != 0, "Not following");

        // Remove from following list (swap and pop)
        uint256 followingIdx = _followingIndex[follower][user] - 1;
        uint256 lastFollowingIdx = _following[follower].length - 1;

        if (followingIdx != lastFollowingIdx) {
            address lastFollowing = _following[follower][lastFollowingIdx];
            _following[follower][followingIdx] = lastFollowing;
            _followingIndex[follower][lastFollowing] = followingIdx + 1;
        }
        _following[follower].pop();
        _followingIndex[follower][user] = 0;

        // Remove from followers list (swap and pop)
        uint256 followerIdx = _followerIndex[user][follower] - 1;
        uint256 lastFollowerIdx = _followers[user].length - 1;

        if (followerIdx != lastFollowerIdx) {
            address lastFollower = _followers[user][lastFollowerIdx];
            _followers[user][followerIdx] = lastFollower;
            _followerIndex[user][lastFollower] = followerIdx + 1;
        }
        _followers[user].pop();
        _followerIndex[user][follower] = 0;

        emit Unfollowed(follower, user);
    }

    // ============ View Functions ============

    /// @notice Get list of addresses a user is following
    /// @param user The address to query
    /// @return Array of addresses the user follows
    function getFollowing(address user) external view returns (address[] memory) {
        return _following[user];
    }

    /// @notice Get list of followers for a user
    /// @param user The address to query
    /// @return Array of addresses that follow the user
    function getFollowers(address user) external view returns (address[] memory) {
        return _followers[user];
    }

    /// @notice Check if one user follows another
    /// @param follower The potential follower
    /// @param followee The potential followee
    /// @return True if follower follows followee
    function isFollowing(address follower, address followee) external view returns (bool) {
        return _followingIndex[follower][followee] != 0;
    }

    /// @notice Get the number of users someone is following
    /// @param user The address to query
    /// @return The count of followed users
    function getFollowingCount(address user) external view returns (uint256) {
        return _following[user].length;
    }

    /// @notice Get the number of followers for a user
    /// @param user The address to query
    /// @return The count of followers
    function getFollowerCount(address user) external view returns (uint256) {
        return _followers[user].length;
    }
}
