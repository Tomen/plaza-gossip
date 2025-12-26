// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./UserRegistry.sol";

contract DMConversation {

    // ============ Data Structures ============

    struct EncryptedMessage {
        address senderOwner;       // Profile owner who sent the message
        address senderAddress;     // Actual tx signer (could be delegate)
        bytes encryptedContent;    // ECDH-encrypted payload
        uint256 timestamp;
    }

    // ============ State ============

    UserRegistry public immutable userRegistry;

    address public immutable participant1;
    address public immutable participant2;

    EncryptedMessage[] public messages;

    // ============ Events ============

    event MessagePosted(
        address indexed senderOwner,
        address indexed senderAddress,
        uint256 indexed index,
        uint256 timestamp
    );

    // ============ Constructor ============

    constructor(
        address _userRegistry,
        address _participant1,
        address _participant2
    ) {
        require(_userRegistry != address(0), "Invalid registry address");
        require(_participant1 != address(0), "Invalid participant1");
        require(_participant2 != address(0), "Invalid participant2");
        require(_participant1 != _participant2, "Participants must be different");

        userRegistry = UserRegistry(_userRegistry);
        participant1 = _participant1;
        participant2 = _participant2;
    }

    // ============ Modifiers ============

    modifier onlyParticipants() {
        address sender = _resolveSender(msg.sender);
        require(
            sender == participant1 || sender == participant2,
            "Not a participant"
        );
        _;
    }

    // ============ Messaging ============

    /// @notice Post an encrypted message to the conversation
    /// @param encryptedContent The ECDH-encrypted message content
    function postMessage(bytes calldata encryptedContent) external onlyParticipants returns (uint256 index) {
        require(encryptedContent.length > 0, "Message cannot be empty");
        require(encryptedContent.length <= 2000, "Message too long"); // Encrypted messages are larger

        address senderOwner = _resolveSender(msg.sender);

        index = messages.length;
        messages.push(EncryptedMessage({
            senderOwner: senderOwner,
            senderAddress: msg.sender,
            encryptedContent: encryptedContent,
            timestamp: block.timestamp
        }));

        emit MessagePosted(senderOwner, msg.sender, index, block.timestamp);
    }

    // ============ Query Functions ============

    /// @notice Get the total message count
    function getMessageCount() external view returns (uint256) {
        return messages.length;
    }

    /// @notice Get a specific message by index
    function getMessage(uint256 index) external view returns (EncryptedMessage memory) {
        require(index < messages.length, "Message does not exist");
        return messages[index];
    }

    /// @notice Get messages in a range
    function getMessages(uint256 startIndex, uint256 count) external view returns (EncryptedMessage[] memory) {
        uint256 totalMessages = messages.length;
        if (startIndex >= totalMessages) {
            return new EncryptedMessage[](0);
        }

        uint256 endIndex = startIndex + count;
        if (endIndex > totalMessages) {
            endIndex = totalMessages;
        }

        uint256 resultCount = endIndex - startIndex;
        EncryptedMessage[] memory result = new EncryptedMessage[](resultCount);

        for (uint256 i = 0; i < resultCount; i++) {
            result[i] = messages[startIndex + i];
        }

        return result;
    }

    /// @notice Get the latest N messages
    function getLatestMessages(uint256 count) external view returns (EncryptedMessage[] memory) {
        uint256 totalMessages = messages.length;
        if (count > totalMessages) {
            count = totalMessages;
        }

        if (count == 0) {
            return new EncryptedMessage[](0);
        }

        EncryptedMessage[] memory result = new EncryptedMessage[](count);
        uint256 startIndex = totalMessages - count;

        for (uint256 i = 0; i < count; i++) {
            result[i] = messages[startIndex + i];
        }

        return result;
    }

    /// @notice Get conversation info
    function getConversationInfo() external view returns (
        address _participant1,
        address _participant2,
        uint256 _messageCount
    ) {
        return (participant1, participant2, messages.length);
    }

    /// @notice Check if an address is a participant (directly or as delegate)
    function isParticipant(address addr) external view returns (bool) {
        address resolved = _resolveSender(addr);
        return resolved == participant1 || resolved == participant2;
    }

    // ============ Internal Functions ============

    /// @notice Resolve sender to profile owner (handles delegates)
    function _resolveSender(address sender) internal view returns (address) {
        // Check if sender is a delegate
        address delegatingOwner = userRegistry.delegateToOwner(sender);
        if (delegatingOwner != address(0)) {
            return delegatingOwner;
        }
        return sender;
    }
}
