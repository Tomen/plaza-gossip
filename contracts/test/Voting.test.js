import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("Voting", function () {
  let userRegistry;
  let voting;
  let owner;
  let addr1;
  let addr2;
  let delegate;

  // Constants for vote types
  const VoteType = {
    None: 0,
    Up: 1,
    Down: 2
  };

  // Sample entity ID
  let entityId;

  beforeEach(async function () {
    [owner, addr1, addr2, delegate] = await ethers.getSigners();

    // Deploy UserRegistry
    const UserRegistry = await ethers.getContractFactory("UserRegistry");
    userRegistry = await UserRegistry.deploy();

    // Deploy Voting
    const Voting = await ethers.getContractFactory("Voting");
    voting = await Voting.deploy(await userRegistry.getAddress());

    // Create profiles
    await userRegistry.connect(owner).createProfile("Owner", "Owner bio");
    await userRegistry.connect(addr1).createProfile("User1", "User1 bio");
    await userRegistry.connect(addr2).createProfile("User2", "User2 bio");

    // Generate a sample entity ID
    entityId = await voting.getEntityId(owner.address, 0, 1);
  });

  describe("Entity ID Generation", function () {
    it("Should generate consistent entity IDs", async function () {
      const id1 = await voting.getEntityId(owner.address, 0, 1);
      const id2 = await voting.getEntityId(owner.address, 0, 1);
      expect(id1).to.equal(id2);
    });

    it("Should generate different IDs for different entities", async function () {
      const id1 = await voting.getEntityId(owner.address, 0, 1);
      const id2 = await voting.getEntityId(owner.address, 0, 2);
      const id3 = await voting.getEntityId(owner.address, 1, 1);
      expect(id1).to.not.equal(id2);
      expect(id1).to.not.equal(id3);
    });
  });

  describe("Voting", function () {
    it("Should upvote successfully", async function () {
      await expect(voting.vote(entityId, VoteType.Up))
        .to.emit(voting, "Voted")
        .withArgs(entityId, owner.address, VoteType.Up, 1);

      const [upvotes, downvotes] = await voting.getTally(entityId);
      expect(upvotes).to.equal(1);
      expect(downvotes).to.equal(0);
      expect(await voting.getScore(entityId)).to.equal(1);
    });

    it("Should downvote successfully", async function () {
      await expect(voting.vote(entityId, VoteType.Down))
        .to.emit(voting, "Voted")
        .withArgs(entityId, owner.address, VoteType.Down, -1);

      const [upvotes, downvotes] = await voting.getTally(entityId);
      expect(upvotes).to.equal(0);
      expect(downvotes).to.equal(1);
      expect(await voting.getScore(entityId)).to.equal(-1);
    });

    it("Should reject VoteType.None", async function () {
      await expect(voting.vote(entityId, VoteType.None))
        .to.be.revertedWithCustomError(voting, "InvalidVoteType");
    });

    it("Should reject voting without profile", async function () {
      await expect(voting.connect(delegate).vote(entityId, VoteType.Up))
        .to.be.revertedWithCustomError(voting, "ProfileRequired");
    });

    it("Should accumulate votes from multiple users", async function () {
      await voting.connect(owner).vote(entityId, VoteType.Up);
      await voting.connect(addr1).vote(entityId, VoteType.Up);
      await voting.connect(addr2).vote(entityId, VoteType.Down);

      const [upvotes, downvotes] = await voting.getTally(entityId);
      expect(upvotes).to.equal(2);
      expect(downvotes).to.equal(1);
      expect(await voting.getScore(entityId)).to.equal(1);
    });
  });

  describe("Changing Votes", function () {
    it("Should change upvote to downvote", async function () {
      await voting.vote(entityId, VoteType.Up);
      await voting.vote(entityId, VoteType.Down);

      const [upvotes, downvotes] = await voting.getTally(entityId);
      expect(upvotes).to.equal(0);
      expect(downvotes).to.equal(1);
    });

    it("Should change downvote to upvote", async function () {
      await voting.vote(entityId, VoteType.Down);
      await voting.vote(entityId, VoteType.Up);

      const [upvotes, downvotes] = await voting.getTally(entityId);
      expect(upvotes).to.equal(1);
      expect(downvotes).to.equal(0);
    });
  });

  describe("Removing Votes", function () {
    it("Should remove upvote successfully", async function () {
      await voting.vote(entityId, VoteType.Up);
      await expect(voting.removeVote(entityId))
        .to.emit(voting, "VoteRemoved")
        .withArgs(entityId, owner.address, 0);

      const [upvotes, downvotes] = await voting.getTally(entityId);
      expect(upvotes).to.equal(0);
      expect(downvotes).to.equal(0);
    });

    it("Should remove downvote successfully", async function () {
      await voting.vote(entityId, VoteType.Down);
      await voting.removeVote(entityId);

      const [upvotes, downvotes] = await voting.getTally(entityId);
      expect(upvotes).to.equal(0);
      expect(downvotes).to.equal(0);
    });

    it("Should reject removing non-existent vote", async function () {
      await expect(voting.removeVote(entityId))
        .to.be.revertedWithCustomError(voting, "NotVoted");
    });
  });

  describe("Vote Queries", function () {
    it("Should return user's vote type", async function () {
      expect(await voting.getUserVote(entityId, owner.address)).to.equal(VoteType.None);

      await voting.vote(entityId, VoteType.Up);
      expect(await voting.getUserVote(entityId, owner.address)).to.equal(VoteType.Up);

      await voting.vote(entityId, VoteType.Down);
      expect(await voting.getUserVote(entityId, owner.address)).to.equal(VoteType.Down);
    });

    it("Should check if user has voted", async function () {
      expect(await voting.hasVoted(entityId, owner.address)).to.be.false;

      await voting.vote(entityId, VoteType.Up);
      expect(await voting.hasVoted(entityId, owner.address)).to.be.true;

      await voting.removeVote(entityId);
      expect(await voting.hasVoted(entityId, owner.address)).to.be.false;
    });
  });

  describe("Delegate Support", function () {
    beforeEach(async function () {
      await userRegistry.connect(owner).addDelegate(delegate.address);
    });

    it("Should allow delegate to vote for profile owner", async function () {
      await voting.connect(delegate).vote(entityId, VoteType.Up);

      // Vote should be counted under the profile owner
      expect(await voting.getUserVote(entityId, owner.address)).to.equal(VoteType.Up);
      expect(await voting.hasVoted(entityId, delegate.address)).to.be.true;
    });

    it("Should not allow double voting via delegate", async function () {
      await voting.connect(owner).vote(entityId, VoteType.Up);

      // Delegate voting should change the owner's vote, not add a new one
      await voting.connect(delegate).vote(entityId, VoteType.Down);

      const [upvotes, downvotes] = await voting.getTally(entityId);
      expect(upvotes).to.equal(0);
      expect(downvotes).to.equal(1);
    });
  });
});
