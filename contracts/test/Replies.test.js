import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("Replies", function () {
  let userRegistry;
  let replies;
  let owner;
  let addr1;
  let addr2;
  let delegate;

  // Sample parent entity
  const ENTITY_TYPE = 0; // UserPost
  const ENTITY_INDEX = 1;
  let parentId;

  beforeEach(async function () {
    [owner, addr1, addr2, delegate] = await ethers.getSigners();

    // Deploy UserRegistry
    const UserRegistry = await ethers.getContractFactory("UserRegistry");
    userRegistry = await UserRegistry.deploy();

    // Deploy Replies
    const Replies = await ethers.getContractFactory("Replies");
    replies = await Replies.deploy(await userRegistry.getAddress());

    // Create profiles
    await userRegistry.connect(owner).createProfile("Owner", "Owner bio");
    await userRegistry.connect(addr1).createProfile("User1", "User1 bio");

    // Get parent ID
    parentId = await replies.getParentId(owner.address, ENTITY_TYPE, ENTITY_INDEX);
  });

  describe("Parent ID Generation", function () {
    it("Should generate consistent parent IDs", async function () {
      const id1 = await replies.getParentId(owner.address, 0, 1);
      const id2 = await replies.getParentId(owner.address, 0, 1);
      expect(id1).to.equal(id2);
    });

    it("Should generate different IDs for different entities", async function () {
      const id1 = await replies.getParentId(owner.address, 0, 1);
      const id2 = await replies.getParentId(owner.address, 0, 2);
      const id3 = await replies.getParentId(owner.address, 1, 1);
      expect(id1).to.not.equal(id2);
      expect(id1).to.not.equal(id3);
    });
  });

  describe("Reply Creation", function () {
    it("Should create a top-level reply successfully", async function () {
      const tx = await replies.addReply(
        owner.address,
        ENTITY_TYPE,
        ENTITY_INDEX,
        "Great post!",
        0 // Top-level
      );

      const receipt = await tx.wait();
      const event = receipt.logs.find(log => {
        try {
          return replies.interface.parseLog(log)?.name === "ReplyCreated";
        } catch { return false; }
      });

      expect(event).to.exist;

      const reply = await replies.getReply(0);
      expect(reply.profileOwner).to.equal(owner.address);
      expect(reply.content).to.equal("Great post!");
      expect(reply.depth).to.equal(0);
      expect(reply.parentReplyIndex).to.equal(0);
    });

    it("Should reject empty content", async function () {
      await expect(replies.addReply(owner.address, ENTITY_TYPE, ENTITY_INDEX, "", 0))
        .to.be.revertedWithCustomError(replies, "ContentEmpty");
    });

    it("Should reject content too long", async function () {
      const longContent = "a".repeat(2001);
      await expect(replies.addReply(owner.address, ENTITY_TYPE, ENTITY_INDEX, longContent, 0))
        .to.be.revertedWithCustomError(replies, "ContentTooLong");
    });

    it("Should reject if no profile exists", async function () {
      await expect(replies.connect(addr2).addReply(owner.address, ENTITY_TYPE, ENTITY_INDEX, "Reply", 0))
        .to.be.revertedWithCustomError(replies, "ProfileRequired");
    });

    it("Should allow delegate to reply for profile owner", async function () {
      await userRegistry.connect(owner).addDelegate(delegate.address);

      await replies.connect(delegate).addReply(owner.address, ENTITY_TYPE, ENTITY_INDEX, "Reply by delegate", 0);

      const reply = await replies.getReply(0);
      expect(reply.profileOwner).to.equal(owner.address);
      expect(reply.sender).to.equal(delegate.address);
    });
  });

  describe("Nested Replies", function () {
    beforeEach(async function () {
      // Create a top-level reply
      await replies.addReply(owner.address, ENTITY_TYPE, ENTITY_INDEX, "Top level reply", 0);
    });

    it("Should create a nested reply", async function () {
      // Reply to reply at index 0 (1-indexed: 1)
      await replies.connect(addr1).addReply(owner.address, ENTITY_TYPE, ENTITY_INDEX, "Nested reply", 1);

      const nestedReply = await replies.getReply(1);
      expect(nestedReply.content).to.equal("Nested reply");
      expect(nestedReply.depth).to.equal(1);
      expect(nestedReply.parentReplyIndex).to.equal(1);
    });

    it("Should create deeply nested replies", async function () {
      // Level 1
      await replies.addReply(owner.address, ENTITY_TYPE, ENTITY_INDEX, "Level 1", 1);
      // Level 2
      await replies.addReply(owner.address, ENTITY_TYPE, ENTITY_INDEX, "Level 2", 2);
      // Level 3
      await replies.addReply(owner.address, ENTITY_TYPE, ENTITY_INDEX, "Level 3", 3);

      const deepReply = await replies.getReply(3);
      expect(deepReply.depth).to.equal(3);
    });

    it("Should reject invalid parent reply index", async function () {
      await expect(replies.addReply(owner.address, ENTITY_TYPE, ENTITY_INDEX, "Reply", 99))
        .to.be.revertedWithCustomError(replies, "InvalidParentReply");
    });

    it("Should reject replying to deleted parent", async function () {
      await replies.deleteReply(0);

      await expect(replies.addReply(owner.address, ENTITY_TYPE, ENTITY_INDEX, "Reply", 1))
        .to.be.revertedWithCustomError(replies, "ParentReplyDeleted");
    });
  });

  describe("Reply Editing", function () {
    beforeEach(async function () {
      await replies.addReply(owner.address, ENTITY_TYPE, ENTITY_INDEX, "Original content", 0);
    });

    it("Should edit a reply successfully", async function () {
      await expect(replies.editReply(0, "Edited content"))
        .to.emit(replies, "ReplyEdited");

      const reply = await replies.getReply(0);
      expect(reply.content).to.equal("Edited content");
      expect(reply.editedAt).to.be.gt(0);
    });

    it("Should allow delegate to edit owner's reply", async function () {
      await userRegistry.connect(owner).addDelegate(delegate.address);

      await replies.connect(delegate).editReply(0, "Edited by delegate");

      const reply = await replies.getReply(0);
      expect(reply.content).to.equal("Edited by delegate");
    });

    it("Should reject editing others' replies", async function () {
      await expect(replies.connect(addr1).editReply(0, "Hacked"))
        .to.be.revertedWithCustomError(replies, "NotAuthorized");
    });

    it("Should reject editing non-existent reply", async function () {
      await expect(replies.editReply(99, "Content"))
        .to.be.revertedWithCustomError(replies, "ReplyNotFound");
    });
  });

  describe("Reply Deletion", function () {
    beforeEach(async function () {
      await replies.addReply(owner.address, ENTITY_TYPE, ENTITY_INDEX, "To be deleted", 0);
    });

    it("Should delete a reply successfully", async function () {
      await expect(replies.deleteReply(0))
        .to.emit(replies, "ReplyDeleted")
        .withArgs(0, owner.address);

      const reply = await replies.getReply(0);
      expect(reply.content).to.equal("");
      expect(reply.isDeleted).to.be.true;
    });

    it("Should allow delegate to delete owner's reply", async function () {
      await userRegistry.connect(owner).addDelegate(delegate.address);

      await replies.connect(delegate).deleteReply(0);

      const reply = await replies.getReply(0);
      expect(reply.isDeleted).to.be.true;
    });

    it("Should reject deleting others' replies", async function () {
      await expect(replies.connect(addr1).deleteReply(0))
        .to.be.revertedWithCustomError(replies, "NotAuthorized");
    });

    it("Should reject deleting already deleted reply", async function () {
      await replies.deleteReply(0);
      await expect(replies.deleteReply(0))
        .to.be.revertedWithCustomError(replies, "ReplyIsDeleted");
    });

    it("Should reject editing deleted reply", async function () {
      await replies.deleteReply(0);
      await expect(replies.editReply(0, "New content"))
        .to.be.revertedWithCustomError(replies, "ReplyIsDeleted");
    });
  });

  describe("Reply Retrieval", function () {
    beforeEach(async function () {
      // Create top-level replies
      await replies.addReply(owner.address, ENTITY_TYPE, ENTITY_INDEX, "Reply 1", 0);
      await replies.addReply(owner.address, ENTITY_TYPE, ENTITY_INDEX, "Reply 2", 0);
      await replies.addReply(owner.address, ENTITY_TYPE, ENTITY_INDEX, "Reply 3", 0);

      // Create nested replies to Reply 1 (index 0, 1-indexed: 1)
      await replies.connect(addr1).addReply(owner.address, ENTITY_TYPE, ENTITY_INDEX, "Child 1", 1);
      await replies.connect(addr1).addReply(owner.address, ENTITY_TYPE, ENTITY_INDEX, "Child 2", 1);
    });

    it("Should get top-level reply count", async function () {
      expect(await replies.getTopLevelReplyCount(parentId)).to.equal(3);
    });

    it("Should get top-level replies with pagination", async function () {
      const [replyList, indices] = await replies.getTopLevelReplies(parentId, 0, 2);
      expect(replyList.length).to.equal(2);
      expect(replyList[0].content).to.equal("Reply 1");
      expect(replyList[1].content).to.equal("Reply 2");
    });

    it("Should get latest top-level replies", async function () {
      const [replyList, indices] = await replies.getLatestTopLevelReplies(parentId, 2);
      expect(replyList.length).to.equal(2);
      // Returns in chronological order (oldest to newest in the latest batch)
      expect(replyList[0].content).to.equal("Reply 2");
      expect(replyList[1].content).to.equal("Reply 3");
    });

    it("Should get child reply count", async function () {
      expect(await replies.getChildReplyCount(0)).to.equal(2);
    });

    it("Should get child replies with pagination", async function () {
      const [childList, indices] = await replies.getChildReplies(0, 0, 10);
      expect(childList.length).to.equal(2);
      expect(childList[0].content).to.equal("Child 1");
      expect(childList[1].content).to.equal("Child 2");
    });

    it("Should handle pagination beyond bounds", async function () {
      const [replyList, indices] = await replies.getTopLevelReplies(parentId, 100, 10);
      expect(replyList.length).to.equal(0);
    });

    it("Should return total reply count", async function () {
      expect(await replies.getReplyCount()).to.equal(5);
    });
  });
});
