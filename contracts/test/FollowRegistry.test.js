import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("FollowRegistry", function () {
  let userRegistry;
  let followRegistry;
  let user1;
  let user2;
  let user3;
  let user4;
  let delegate;

  beforeEach(async function () {
    [user1, user2, user3, user4, delegate] = await ethers.getSigners();

    // Deploy UserRegistry first
    const UserRegistry = await ethers.getContractFactory("UserRegistry");
    userRegistry = await UserRegistry.deploy();

    // Deploy FollowRegistry with UserRegistry address
    const FollowRegistry = await ethers.getContractFactory("FollowRegistry");
    followRegistry = await FollowRegistry.deploy(await userRegistry.getAddress());
  });

  describe("Following", function () {
    it("Should allow a user to follow another user", async function () {
      await followRegistry.connect(user1).follow(user2.address);

      expect(await followRegistry.isFollowing(user1.address, user2.address)).to.be.true;
    });

    it("Should emit Followed event", async function () {
      await expect(followRegistry.connect(user1).follow(user2.address))
        .to.emit(followRegistry, "Followed")
        .withArgs(user1.address, user2.address);
    });

    it("Should reject following zero address", async function () {
      await expect(
        followRegistry.connect(user1).follow(ethers.ZeroAddress)
      ).to.be.revertedWith("Cannot follow zero address");
    });

    it("Should reject following yourself", async function () {
      await expect(
        followRegistry.connect(user1).follow(user1.address)
      ).to.be.revertedWith("Cannot follow yourself");
    });

    it("Should reject following the same user twice", async function () {
      await followRegistry.connect(user1).follow(user2.address);
      await expect(
        followRegistry.connect(user1).follow(user2.address)
      ).to.be.revertedWith("Already following");
    });

    it("Should allow following multiple users", async function () {
      await followRegistry.connect(user1).follow(user2.address);
      await followRegistry.connect(user1).follow(user3.address);
      await followRegistry.connect(user1).follow(user4.address);

      expect(await followRegistry.getFollowingCount(user1.address)).to.equal(3);
      expect(await followRegistry.isFollowing(user1.address, user2.address)).to.be.true;
      expect(await followRegistry.isFollowing(user1.address, user3.address)).to.be.true;
      expect(await followRegistry.isFollowing(user1.address, user4.address)).to.be.true;
    });

    it("Should update both following and followers lists", async function () {
      await followRegistry.connect(user1).follow(user2.address);

      const user1Following = await followRegistry.getFollowing(user1.address);
      const user2Followers = await followRegistry.getFollowers(user2.address);

      expect(user1Following).to.include(user2.address);
      expect(user2Followers).to.include(user1.address);
    });
  });

  describe("Unfollowing", function () {
    beforeEach(async function () {
      await followRegistry.connect(user1).follow(user2.address);
    });

    it("Should allow a user to unfollow another user", async function () {
      await followRegistry.connect(user1).unfollow(user2.address);

      expect(await followRegistry.isFollowing(user1.address, user2.address)).to.be.false;
    });

    it("Should emit Unfollowed event", async function () {
      await expect(followRegistry.connect(user1).unfollow(user2.address))
        .to.emit(followRegistry, "Unfollowed")
        .withArgs(user1.address, user2.address);
    });

    it("Should reject unfollowing someone you don't follow", async function () {
      await expect(
        followRegistry.connect(user1).unfollow(user3.address)
      ).to.be.revertedWith("Not following");
    });

    it("Should correctly handle unfollow in the middle of the list", async function () {
      // user1 follows user2, user3, user4
      await followRegistry.connect(user1).follow(user3.address);
      await followRegistry.connect(user1).follow(user4.address);

      expect(await followRegistry.getFollowingCount(user1.address)).to.equal(3);

      // Unfollow user3 (in the middle)
      await followRegistry.connect(user1).unfollow(user3.address);

      expect(await followRegistry.getFollowingCount(user1.address)).to.equal(2);
      expect(await followRegistry.isFollowing(user1.address, user2.address)).to.be.true;
      expect(await followRegistry.isFollowing(user1.address, user3.address)).to.be.false;
      expect(await followRegistry.isFollowing(user1.address, user4.address)).to.be.true;
    });

    it("Should correctly handle unfollow of first element", async function () {
      await followRegistry.connect(user1).follow(user3.address);

      await followRegistry.connect(user1).unfollow(user2.address);

      expect(await followRegistry.getFollowingCount(user1.address)).to.equal(1);
      expect(await followRegistry.isFollowing(user1.address, user2.address)).to.be.false;
      expect(await followRegistry.isFollowing(user1.address, user3.address)).to.be.true;
    });

    it("Should correctly handle unfollow of last element", async function () {
      await followRegistry.connect(user1).follow(user3.address);

      await followRegistry.connect(user1).unfollow(user3.address);

      expect(await followRegistry.getFollowingCount(user1.address)).to.equal(1);
      expect(await followRegistry.isFollowing(user1.address, user2.address)).to.be.true;
      expect(await followRegistry.isFollowing(user1.address, user3.address)).to.be.false;
    });

    it("Should update both following and followers lists on unfollow", async function () {
      await followRegistry.connect(user1).unfollow(user2.address);

      const user1Following = await followRegistry.getFollowing(user1.address);
      const user2Followers = await followRegistry.getFollowers(user2.address);

      expect(user1Following).to.not.include(user2.address);
      expect(user2Followers).to.not.include(user1.address);
    });

    it("Should allow re-following after unfollow", async function () {
      await followRegistry.connect(user1).unfollow(user2.address);
      await followRegistry.connect(user1).follow(user2.address);

      expect(await followRegistry.isFollowing(user1.address, user2.address)).to.be.true;
    });
  });

  describe("Query Functions", function () {
    beforeEach(async function () {
      // Setup: user1 follows user2 and user3
      await followRegistry.connect(user1).follow(user2.address);
      await followRegistry.connect(user1).follow(user3.address);
      // user2 follows user1
      await followRegistry.connect(user2).follow(user1.address);
    });

    it("Should return correct following list", async function () {
      const following = await followRegistry.getFollowing(user1.address);
      expect(following.length).to.equal(2);
      expect(following).to.include(user2.address);
      expect(following).to.include(user3.address);
    });

    it("Should return correct followers list", async function () {
      const followers = await followRegistry.getFollowers(user1.address);
      expect(followers.length).to.equal(1);
      expect(followers).to.include(user2.address);
    });

    it("Should return correct following count", async function () {
      expect(await followRegistry.getFollowingCount(user1.address)).to.equal(2);
      expect(await followRegistry.getFollowingCount(user2.address)).to.equal(1);
      expect(await followRegistry.getFollowingCount(user3.address)).to.equal(0);
    });

    it("Should return correct follower count", async function () {
      expect(await followRegistry.getFollowerCount(user1.address)).to.equal(1);
      expect(await followRegistry.getFollowerCount(user2.address)).to.equal(1);
      expect(await followRegistry.getFollowerCount(user3.address)).to.equal(1);
    });

    it("Should correctly report isFollowing status", async function () {
      expect(await followRegistry.isFollowing(user1.address, user2.address)).to.be.true;
      expect(await followRegistry.isFollowing(user1.address, user3.address)).to.be.true;
      expect(await followRegistry.isFollowing(user2.address, user1.address)).to.be.true;
      expect(await followRegistry.isFollowing(user3.address, user1.address)).to.be.false;
      expect(await followRegistry.isFollowing(user1.address, user4.address)).to.be.false;
    });

    it("Should return empty array for user with no following", async function () {
      const following = await followRegistry.getFollowing(user4.address);
      expect(following.length).to.equal(0);
    });

    it("Should return empty array for user with no followers", async function () {
      const followers = await followRegistry.getFollowers(user4.address);
      expect(followers.length).to.equal(0);
    });
  });

  describe("Mutual Following", function () {
    it("Should handle mutual follows correctly", async function () {
      await followRegistry.connect(user1).follow(user2.address);
      await followRegistry.connect(user2).follow(user1.address);

      expect(await followRegistry.isFollowing(user1.address, user2.address)).to.be.true;
      expect(await followRegistry.isFollowing(user2.address, user1.address)).to.be.true;

      expect(await followRegistry.getFollowingCount(user1.address)).to.equal(1);
      expect(await followRegistry.getFollowerCount(user1.address)).to.equal(1);
      expect(await followRegistry.getFollowingCount(user2.address)).to.equal(1);
      expect(await followRegistry.getFollowerCount(user2.address)).to.equal(1);
    });

    it("Should handle mutual unfollows correctly", async function () {
      await followRegistry.connect(user1).follow(user2.address);
      await followRegistry.connect(user2).follow(user1.address);

      await followRegistry.connect(user1).unfollow(user2.address);

      expect(await followRegistry.isFollowing(user1.address, user2.address)).to.be.false;
      expect(await followRegistry.isFollowing(user2.address, user1.address)).to.be.true;
    });
  });

  describe("Delegate Wallet Resolution", function () {
    beforeEach(async function () {
      // user1 creates a profile and adds delegate
      await userRegistry.connect(user1).createProfile("User1", "Bio");
      await userRegistry.connect(user1).addDelegate(delegate.address);
    });

    it("Should resolve delegate to profile owner when following", async function () {
      // delegate follows user2, but it should be stored as user1 following user2
      await followRegistry.connect(delegate).follow(user2.address);

      expect(await followRegistry.isFollowing(user1.address, user2.address)).to.be.true;
      expect(await followRegistry.isFollowing(delegate.address, user2.address)).to.be.false;
    });

    it("Should resolve delegate to profile owner when unfollowing", async function () {
      // delegate follows user2
      await followRegistry.connect(delegate).follow(user2.address);
      expect(await followRegistry.isFollowing(user1.address, user2.address)).to.be.true;

      // delegate unfollows user2
      await followRegistry.connect(delegate).unfollow(user2.address);
      expect(await followRegistry.isFollowing(user1.address, user2.address)).to.be.false;
    });

    it("Should allow delegate to follow same user that owner follows", async function () {
      // user1 follows user2 directly
      await followRegistry.connect(user1).follow(user2.address);

      // delegate tries to follow user2 - should fail since owner already follows
      await expect(
        followRegistry.connect(delegate).follow(user2.address)
      ).to.be.revertedWith("Already following");
    });

    it("Should store follows against owner address in following list", async function () {
      await followRegistry.connect(delegate).follow(user2.address);

      const user1Following = await followRegistry.getFollowing(user1.address);
      expect(user1Following).to.include(user2.address);

      // delegate's following list should be empty
      const delegateFollowing = await followRegistry.getFollowing(delegate.address);
      expect(delegateFollowing.length).to.equal(0);
    });

    it("Should store owner as follower in followee's list", async function () {
      await followRegistry.connect(delegate).follow(user2.address);

      const user2Followers = await followRegistry.getFollowers(user2.address);
      expect(user2Followers).to.include(user1.address);
      expect(user2Followers).to.not.include(delegate.address);
    });

    it("Should use caller address if not a delegate", async function () {
      // user3 has no profile, follows directly
      await followRegistry.connect(user3).follow(user2.address);

      expect(await followRegistry.isFollowing(user3.address, user2.address)).to.be.true;
    });

    it("Should emit events with resolved owner address", async function () {
      await expect(followRegistry.connect(delegate).follow(user2.address))
        .to.emit(followRegistry, "Followed")
        .withArgs(user1.address, user2.address);

      await expect(followRegistry.connect(delegate).unfollow(user2.address))
        .to.emit(followRegistry, "Unfollowed")
        .withArgs(user1.address, user2.address);
    });
  });
});
