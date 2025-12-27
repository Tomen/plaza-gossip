// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../UserRegistry.sol";

/**
 * @title Voting
 * @notice Shared voting system for upvotes/downvotes on any entity
 * @dev Used by Forum threads, Feed items, Replies, etc.
 *
 * Entities are identified by a bytes32 hash calculated as:
 * keccak256(abi.encodePacked(contractAddress, entityType, entityId))
 *
 * Entity types:
 * 0 = UserPost
 * 1 = FeedItem
 * 2 = ForumThread
 * 3 = Reply
 */
contract Voting {
    enum VoteType { None, Up, Down }

    struct VoteTally {
        uint256 upvotes;
        uint256 downvotes;
    }

    // entityId => VoteTally
    mapping(bytes32 => VoteTally) public tallies;

    // entityId => user => VoteType
    mapping(bytes32 => mapping(address => VoteType)) public userVotes;

    UserRegistry public immutable userRegistry;

    event Voted(
        bytes32 indexed entityId,
        address indexed voter,
        VoteType voteType,
        int256 newScore
    );
    event VoteRemoved(
        bytes32 indexed entityId,
        address indexed voter,
        int256 newScore
    );

    error ProfileRequired();
    error AlreadyVoted();
    error NotVoted();
    error InvalidVoteType();

    constructor(address _userRegistry) {
        userRegistry = UserRegistry(_userRegistry);
    }

    /**
     * @notice Calculate entity ID from contract address, type, and index
     * @param contractAddress The contract containing the entity
     * @param entityType The type of entity (0=UserPost, 1=FeedItem, 2=ForumThread, 3=Reply)
     * @param entityIndex The index of the entity in its contract
     */
    function getEntityId(
        address contractAddress,
        uint8 entityType,
        uint256 entityIndex
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(contractAddress, entityType, entityIndex));
    }

    /**
     * @notice Vote on an entity
     * @param entityId The entity to vote on
     * @param voteType Up or Down vote
     */
    function vote(bytes32 entityId, VoteType voteType) external {
        if (voteType == VoteType.None) revert InvalidVoteType();

        // Resolve sender to profile owner (delegate support)
        address voter = _resolveVoter(msg.sender);
        if (!userRegistry.hasProfile(voter)) revert ProfileRequired();

        VoteType existingVote = userVotes[entityId][voter];

        if (existingVote != VoteType.None) {
            // User is changing their vote
            _removeVote(entityId, voter, existingVote);
        }

        // Add new vote
        if (voteType == VoteType.Up) {
            tallies[entityId].upvotes++;
        } else {
            tallies[entityId].downvotes++;
        }

        userVotes[entityId][voter] = voteType;

        emit Voted(entityId, voter, voteType, getScore(entityId));
    }

    /**
     * @notice Remove a vote from an entity
     * @param entityId The entity to remove vote from
     */
    function removeVote(bytes32 entityId) external {
        address voter = _resolveVoter(msg.sender);
        VoteType existingVote = userVotes[entityId][voter];

        if (existingVote == VoteType.None) revert NotVoted();

        _removeVote(entityId, voter, existingVote);
        userVotes[entityId][voter] = VoteType.None;

        emit VoteRemoved(entityId, voter, getScore(entityId));
    }

    /**
     * @notice Get the score of an entity (upvotes - downvotes)
     * @param entityId The entity to get score for
     */
    function getScore(bytes32 entityId) public view returns (int256) {
        VoteTally storage tally = tallies[entityId];
        return int256(tally.upvotes) - int256(tally.downvotes);
    }

    /**
     * @notice Get the full vote tally for an entity
     * @param entityId The entity to get tally for
     */
    function getTally(bytes32 entityId) external view returns (uint256 upvotes, uint256 downvotes) {
        VoteTally storage tally = tallies[entityId];
        return (tally.upvotes, tally.downvotes);
    }

    /**
     * @notice Get a user's vote on an entity
     * @param entityId The entity
     * @param user The user address
     */
    function getUserVote(bytes32 entityId, address user) external view returns (VoteType) {
        // Resolve to profile owner for consistent lookup
        address voter = userRegistry.delegateToOwner(user);
        if (voter == address(0)) {
            voter = user;
        }
        return userVotes[entityId][voter];
    }

    /**
     * @notice Check if a user has voted on an entity
     * @param entityId The entity
     * @param user The user address
     */
    function hasVoted(bytes32 entityId, address user) external view returns (bool) {
        address voter = userRegistry.delegateToOwner(user);
        if (voter == address(0)) {
            voter = user;
        }
        return userVotes[entityId][voter] != VoteType.None;
    }

    // Internal functions

    function _removeVote(bytes32 entityId, address, VoteType voteType) internal {
        if (voteType == VoteType.Up) {
            tallies[entityId].upvotes--;
        } else if (voteType == VoteType.Down) {
            tallies[entityId].downvotes--;
        }
    }

    function _resolveVoter(address sender) internal view returns (address) {
        address delegatingOwner = userRegistry.delegateToOwner(sender);
        if (delegatingOwner != address(0)) {
            return delegatingOwner;
        }
        return sender;
    }
}
