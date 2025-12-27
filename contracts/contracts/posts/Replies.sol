// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../UserRegistry.sol";

/**
 * @title Replies
 * @notice Shared threaded reply system for any entity
 * @dev Used by UserPosts, Feed items, Forum threads, etc.
 *
 * Parent entities are identified by a bytes32 hash calculated as:
 * keccak256(abi.encodePacked(contractAddress, entityType, entityId))
 *
 * Entity types:
 * 0 = UserPost
 * 1 = FeedItem
 * 2 = ForumThread
 * 3 = Reply (for nested replies)
 */
contract Replies {
    struct Reply {
        bytes32 parentId;           // Hash of the parent entity
        address profileOwner;       // Author's profile owner
        address sender;             // Actual tx signer (could be delegate)
        string content;             // Reply text
        uint256 timestamp;
        uint256 editedAt;           // 0 if never edited
        bool isDeleted;
        uint256 parentReplyIndex;   // 0 for top-level, or 1-indexed parent reply
        uint256 depth;              // Nesting level (0 = top-level)
    }

    Reply[] public replies;

    // parentId => array of reply indices (top-level replies only)
    mapping(bytes32 => uint256[]) public repliesByParent;

    // replyIndex => array of child reply indices
    mapping(uint256 => uint256[]) public childReplies;

    UserRegistry public immutable userRegistry;

    uint256 public constant MAX_CONTENT_LENGTH = 2000;

    event ReplyCreated(
        bytes32 indexed parentId,
        address indexed profileOwner,
        address sender,
        uint256 indexed replyIndex,
        uint256 parentReplyIndex,
        uint256 depth,
        uint256 timestamp
    );
    event ReplyEdited(
        uint256 indexed replyIndex,
        address indexed profileOwner,
        uint256 editedAt
    );
    event ReplyDeleted(
        uint256 indexed replyIndex,
        address indexed profileOwner
    );

    error ContentTooLong();
    error ContentEmpty();
    error ProfileRequired();
    error ReplyNotFound();
    error ReplyIsDeleted();
    error NotAuthorized();
    error InvalidParentReply();
    error ParentReplyDeleted();

    constructor(address _userRegistry) {
        userRegistry = UserRegistry(_userRegistry);
    }

    /**
     * @notice Calculate parent ID from contract address, type, and index
     * @param contractAddress The contract containing the parent entity
     * @param entityType The type of entity (0=UserPost, 1=FeedItem, 2=ForumThread, 3=Reply)
     * @param entityIndex The index of the entity in its contract
     */
    function getParentId(
        address contractAddress,
        uint8 entityType,
        uint256 entityIndex
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(contractAddress, entityType, entityIndex));
    }

    /**
     * @notice Add a reply to a parent entity
     * @param contractAddress The contract containing the parent entity
     * @param entityType The type of parent entity
     * @param entityIndex The index of the parent entity
     * @param _content The reply content
     * @param _parentReplyIndex 0 for top-level reply, or 1-indexed parent reply index
     */
    function addReply(
        address contractAddress,
        uint8 entityType,
        uint256 entityIndex,
        string calldata _content,
        uint256 _parentReplyIndex
    ) external returns (uint256) {
        if (bytes(_content).length == 0) revert ContentEmpty();
        if (bytes(_content).length > MAX_CONTENT_LENGTH) revert ContentTooLong();

        // Resolve sender to profile owner
        address profileOwner = _resolveSender(msg.sender);
        if (!userRegistry.hasProfile(profileOwner)) revert ProfileRequired();

        bytes32 parentId = getParentId(contractAddress, entityType, entityIndex);
        uint256 depth = 0;

        // Validate parent reply if specified
        if (_parentReplyIndex > 0) {
            uint256 parentIdx = _parentReplyIndex - 1; // Convert to 0-indexed
            if (parentIdx >= replies.length) revert InvalidParentReply();
            Reply storage parentReply = replies[parentIdx];
            if (parentReply.isDeleted) revert ParentReplyDeleted();
            if (parentReply.parentId != parentId) revert InvalidParentReply();
            depth = parentReply.depth + 1;
        }

        uint256 replyIndex = replies.length;
        replies.push(Reply({
            parentId: parentId,
            profileOwner: profileOwner,
            sender: msg.sender,
            content: _content,
            timestamp: block.timestamp,
            editedAt: 0,
            isDeleted: false,
            parentReplyIndex: _parentReplyIndex,
            depth: depth
        }));

        // Index the reply
        if (_parentReplyIndex == 0) {
            // Top-level reply
            repliesByParent[parentId].push(replyIndex);
        } else {
            // Nested reply
            childReplies[_parentReplyIndex - 1].push(replyIndex);
        }

        emit ReplyCreated(
            parentId,
            profileOwner,
            msg.sender,
            replyIndex,
            _parentReplyIndex,
            depth,
            block.timestamp
        );

        return replyIndex;
    }

    /**
     * @notice Edit a reply
     * @param _replyIndex The index of the reply to edit
     * @param _newContent The new content
     */
    function editReply(uint256 _replyIndex, string calldata _newContent) external {
        if (_replyIndex >= replies.length) revert ReplyNotFound();
        if (bytes(_newContent).length == 0) revert ContentEmpty();
        if (bytes(_newContent).length > MAX_CONTENT_LENGTH) revert ContentTooLong();

        Reply storage reply = replies[_replyIndex];
        if (reply.isDeleted) revert ReplyIsDeleted();

        // Check authorization
        if (!userRegistry.canActAs(msg.sender, reply.profileOwner)) {
            revert NotAuthorized();
        }

        reply.content = _newContent;
        reply.editedAt = block.timestamp;

        emit ReplyEdited(_replyIndex, reply.profileOwner, block.timestamp);
    }

    /**
     * @notice Delete a reply (soft delete)
     * @param _replyIndex The index of the reply to delete
     */
    function deleteReply(uint256 _replyIndex) external {
        if (_replyIndex >= replies.length) revert ReplyNotFound();

        Reply storage reply = replies[_replyIndex];
        if (reply.isDeleted) revert ReplyIsDeleted();

        // Check authorization
        if (!userRegistry.canActAs(msg.sender, reply.profileOwner)) {
            revert NotAuthorized();
        }

        reply.content = "";
        reply.isDeleted = true;

        emit ReplyDeleted(_replyIndex, reply.profileOwner);
    }

    // Read functions

    /**
     * @notice Get a single reply
     * @param _replyIndex The index of the reply
     */
    function getReply(uint256 _replyIndex) external view returns (Reply memory) {
        if (_replyIndex >= replies.length) revert ReplyNotFound();
        return replies[_replyIndex];
    }

    /**
     * @notice Get total reply count
     */
    function getReplyCount() external view returns (uint256) {
        return replies.length;
    }

    /**
     * @notice Get top-level reply count for a parent entity
     * @param parentId The parent entity ID
     */
    function getTopLevelReplyCount(bytes32 parentId) external view returns (uint256) {
        return repliesByParent[parentId].length;
    }

    /**
     * @notice Get top-level replies for a parent entity (paginated)
     * @param parentId The parent entity ID
     * @param startIndex Start index in the reply list
     * @param count Maximum number of replies to return
     */
    function getTopLevelReplies(
        bytes32 parentId,
        uint256 startIndex,
        uint256 count
    ) external view returns (Reply[] memory, uint256[] memory) {
        uint256[] storage indices = repliesByParent[parentId];
        uint256 total = indices.length;

        if (startIndex >= total) {
            return (new Reply[](0), new uint256[](0));
        }

        uint256 endIndex = startIndex + count;
        if (endIndex > total) {
            endIndex = total;
        }

        uint256 resultCount = endIndex - startIndex;
        Reply[] memory result = new Reply[](resultCount);
        uint256[] memory replyIndices = new uint256[](resultCount);

        for (uint256 i = 0; i < resultCount; i++) {
            uint256 replyIndex = indices[startIndex + i];
            result[i] = replies[replyIndex];
            replyIndices[i] = replyIndex;
        }

        return (result, replyIndices);
    }

    /**
     * @notice Get child reply count for a reply
     * @param _replyIndex The parent reply index
     */
    function getChildReplyCount(uint256 _replyIndex) external view returns (uint256) {
        return childReplies[_replyIndex].length;
    }

    /**
     * @notice Get child replies for a reply (paginated)
     * @param _replyIndex The parent reply index
     * @param startIndex Start index in the child list
     * @param count Maximum number of replies to return
     */
    function getChildReplies(
        uint256 _replyIndex,
        uint256 startIndex,
        uint256 count
    ) external view returns (Reply[] memory, uint256[] memory) {
        uint256[] storage indices = childReplies[_replyIndex];
        uint256 total = indices.length;

        if (startIndex >= total) {
            return (new Reply[](0), new uint256[](0));
        }

        uint256 endIndex = startIndex + count;
        if (endIndex > total) {
            endIndex = total;
        }

        uint256 resultCount = endIndex - startIndex;
        Reply[] memory result = new Reply[](resultCount);
        uint256[] memory replyIndices = new uint256[](resultCount);

        for (uint256 i = 0; i < resultCount; i++) {
            uint256 replyIndex = indices[startIndex + i];
            result[i] = replies[replyIndex];
            replyIndices[i] = replyIndex;
        }

        return (result, replyIndices);
    }

    /**
     * @notice Get latest top-level replies for a parent entity
     * @param parentId The parent entity ID
     * @param count Maximum number of replies to return
     */
    function getLatestTopLevelReplies(
        bytes32 parentId,
        uint256 count
    ) external view returns (Reply[] memory, uint256[] memory) {
        uint256[] storage indices = repliesByParent[parentId];
        uint256 total = indices.length;

        if (total == 0 || count == 0) {
            return (new Reply[](0), new uint256[](0));
        }

        uint256 resultCount = count > total ? total : count;
        uint256 startIndex = total - resultCount;

        Reply[] memory result = new Reply[](resultCount);
        uint256[] memory replyIndices = new uint256[](resultCount);

        for (uint256 i = 0; i < resultCount; i++) {
            uint256 replyIndex = indices[startIndex + i];
            result[i] = replies[replyIndex];
            replyIndices[i] = replyIndex;
        }

        return (result, replyIndices);
    }

    // Internal functions

    function _resolveSender(address sender) internal view returns (address) {
        address delegatingOwner = userRegistry.delegateToOwner(sender);
        if (delegatingOwner != address(0)) {
            return delegatingOwner;
        }
        return sender;
    }
}
