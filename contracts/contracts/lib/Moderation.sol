// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Moderation
 * @notice Library for managing owner/admin/allowed poster permissions
 * @dev Extracted from ChatChannel pattern for reuse across Feed, Forum, etc.
 */
library Moderation {
    struct Permissions {
        address owner;
        mapping(address => bool) admins;
        mapping(address => bool) allowedPosters;
    }

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event AdminPromoted(address indexed admin);
    event AdminDemoted(address indexed admin);
    event PosterAdded(address indexed poster);
    event PosterRemoved(address indexed poster);

    error NotOwner();
    error NotAdmin();
    error NotAuthorized();
    error ZeroAddress();
    error AlreadyAdmin();
    error NotAnAdmin();
    error AlreadyAllowed();
    error NotAllowed();

    /**
     * @notice Initialize permissions with an owner
     */
    function initialize(Permissions storage self, address _owner) internal {
        if (_owner == address(0)) revert ZeroAddress();
        self.owner = _owner;
    }

    /**
     * @notice Check if address is the owner
     */
    function isOwner(Permissions storage self, address user) internal view returns (bool) {
        return self.owner == user;
    }

    /**
     * @notice Check if address is an admin
     */
    function isAdmin(Permissions storage self, address user) internal view returns (bool) {
        return self.admins[user];
    }

    /**
     * @notice Check if address is an allowed poster
     */
    function isAllowedPoster(Permissions storage self, address user) internal view returns (bool) {
        return self.allowedPosters[user];
    }

    /**
     * @notice Check if user can moderate (is owner or admin)
     */
    function canModerate(Permissions storage self, address user) internal view returns (bool) {
        return self.owner == user || self.admins[user];
    }

    /**
     * @notice Check if user can post (is owner, admin, or allowed poster)
     */
    function canPost(Permissions storage self, address user) internal view returns (bool) {
        return self.owner == user || self.admins[user] || self.allowedPosters[user];
    }

    /**
     * @notice Transfer ownership to a new address
     * @dev Only callable by current owner
     */
    function transferOwnership(Permissions storage self, address newOwner, address caller) internal {
        if (caller != self.owner) revert NotOwner();
        if (newOwner == address(0)) revert ZeroAddress();

        address oldOwner = self.owner;
        self.owner = newOwner;

        emit OwnershipTransferred(oldOwner, newOwner);
    }

    /**
     * @notice Promote an address to admin
     * @dev Only callable by owner
     */
    function promoteAdmin(Permissions storage self, address admin, address caller) internal {
        if (caller != self.owner) revert NotOwner();
        if (admin == address(0)) revert ZeroAddress();
        if (self.admins[admin]) revert AlreadyAdmin();

        self.admins[admin] = true;

        emit AdminPromoted(admin);
    }

    /**
     * @notice Demote an admin
     * @dev Only callable by owner
     */
    function demoteAdmin(Permissions storage self, address admin, address caller) internal {
        if (caller != self.owner) revert NotOwner();
        if (!self.admins[admin]) revert NotAnAdmin();

        self.admins[admin] = false;

        emit AdminDemoted(admin);
    }

    /**
     * @notice Add an allowed poster
     * @dev Callable by owner or admin
     */
    function addAllowedPoster(Permissions storage self, address poster, address caller) internal {
        if (!canModerate(self, caller)) revert NotAdmin();
        if (poster == address(0)) revert ZeroAddress();
        if (self.allowedPosters[poster]) revert AlreadyAllowed();

        self.allowedPosters[poster] = true;

        emit PosterAdded(poster);
    }

    /**
     * @notice Remove an allowed poster
     * @dev Callable by owner or admin
     */
    function removeAllowedPoster(Permissions storage self, address poster, address caller) internal {
        if (!canModerate(self, caller)) revert NotAdmin();
        if (!self.allowedPosters[poster]) revert NotAllowed();

        self.allowedPosters[poster] = false;

        emit PosterRemoved(poster);
    }
}
