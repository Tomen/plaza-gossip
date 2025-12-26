// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./UserRegistry.sol";
import "./DMConversation.sol";

contract DMRegistry {

    // ============ State ============

    UserRegistry public immutable userRegistry;

    // user address → list of conversation addresses
    mapping(address => address[]) public userConversations;

    // sorted pair hash → conversation address (prevents duplicates)
    mapping(bytes32 => address) public conversationLookup;

    // ============ Events ============

    event ConversationCreated(
        address indexed conversation,
        address indexed participant1,
        address indexed participant2
    );

    // ============ Constructor ============

    constructor(address _userRegistry) {
        require(_userRegistry != address(0), "Invalid registry address");
        userRegistry = UserRegistry(_userRegistry);
    }

    // ============ Conversation Management ============

    /// @notice Create a new DM conversation with another user
    /// @param otherUser The address of the other participant
    /// @return conversationAddress The address of the created conversation
    function createConversation(address otherUser) external returns (address conversationAddress) {
        require(otherUser != address(0), "Invalid user address");
        require(otherUser != msg.sender, "Cannot DM yourself");

        // Check that conversation doesn't already exist
        bytes32 pairHash = _getPairHash(msg.sender, otherUser);
        require(conversationLookup[pairHash] == address(0), "Conversation already exists");

        // Create the conversation contract
        DMConversation conversation = new DMConversation(
            address(userRegistry),
            msg.sender,
            otherUser
        );
        conversationAddress = address(conversation);

        // Register the conversation
        conversationLookup[pairHash] = conversationAddress;
        userConversations[msg.sender].push(conversationAddress);
        userConversations[otherUser].push(conversationAddress);

        emit ConversationCreated(conversationAddress, msg.sender, otherUser);
    }

    // ============ Query Functions ============

    /// @notice Get all conversations for a user
    function getConversations(address user) external view returns (address[] memory) {
        return userConversations[user];
    }

    /// @notice Get the conversation count for a user
    function getConversationCount(address user) external view returns (uint256) {
        return userConversations[user].length;
    }

    /// @notice Get the conversation between two users (if exists)
    function getConversation(address user1, address user2) external view returns (address) {
        bytes32 pairHash = _getPairHash(user1, user2);
        return conversationLookup[pairHash];
    }

    /// @notice Check if a conversation exists between two users
    function conversationExists(address user1, address user2) external view returns (bool) {
        bytes32 pairHash = _getPairHash(user1, user2);
        return conversationLookup[pairHash] != address(0);
    }

    // ============ Internal Functions ============

    /// @notice Get a deterministic hash for a pair of addresses (order-independent)
    function _getPairHash(address a, address b) internal pure returns (bytes32) {
        // Sort addresses to ensure consistent hash regardless of order
        if (a < b) {
            return keccak256(abi.encodePacked(a, b));
        } else {
            return keccak256(abi.encodePacked(b, a));
        }
    }
}
