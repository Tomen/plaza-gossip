import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("DMRegistry", function () {
  let userRegistry;
  let dmRegistry;
  let owner;
  let user1;
  let user2;
  let user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();

    // Deploy UserRegistry
    const UserRegistry = await ethers.getContractFactory("UserRegistry");
    userRegistry = await UserRegistry.deploy();

    // Deploy DMRegistry
    const DMRegistry = await ethers.getContractFactory("DMRegistry");
    dmRegistry = await DMRegistry.deploy(await userRegistry.getAddress());

    // Create profiles for users
    await userRegistry.connect(user1).createProfile("User1", "Bio 1");
    await userRegistry.connect(user2).createProfile("User2", "Bio 2");
  });

  describe("Deployment", function () {
    it("Should set the correct UserRegistry address", async function () {
      expect(await dmRegistry.userRegistry()).to.equal(
        await userRegistry.getAddress()
      );
    });

    it("Should reject zero address for UserRegistry", async function () {
      const DMRegistry = await ethers.getContractFactory("DMRegistry");
      await expect(
        DMRegistry.deploy(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid registry address");
    });
  });

  describe("Conversation Creation", function () {
    it("Should create a conversation between two users", async function () {
      const tx = await dmRegistry.connect(user1).createConversation(user2.address);
      const receipt = await tx.wait();

      // Find the ConversationCreated event
      const event = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === "ConversationCreated"
      );
      expect(event).to.not.be.undefined;

      const conversationAddress = event.args.conversation;
      expect(conversationAddress).to.not.equal(ethers.ZeroAddress);
    });

    it("Should emit ConversationCreated event with correct parameters", async function () {
      await expect(dmRegistry.connect(user1).createConversation(user2.address))
        .to.emit(dmRegistry, "ConversationCreated")
        .withArgs(
          (addr) => addr !== ethers.ZeroAddress, // conversation address
          user1.address,
          user2.address
        );
    });

    it("Should reject creating conversation with zero address", async function () {
      await expect(
        dmRegistry.connect(user1).createConversation(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid user address");
    });

    it("Should reject creating conversation with yourself", async function () {
      await expect(
        dmRegistry.connect(user1).createConversation(user1.address)
      ).to.be.revertedWith("Cannot DM yourself");
    });

    it("Should reject duplicate conversation", async function () {
      await dmRegistry.connect(user1).createConversation(user2.address);
      await expect(
        dmRegistry.connect(user1).createConversation(user2.address)
      ).to.be.revertedWith("Conversation already exists");
    });

    it("Should reject duplicate conversation from other party", async function () {
      await dmRegistry.connect(user1).createConversation(user2.address);
      await expect(
        dmRegistry.connect(user2).createConversation(user1.address)
      ).to.be.revertedWith("Conversation already exists");
    });

    it("Should allow multiple conversations with different users", async function () {
      await userRegistry.connect(user3).createProfile("User3", "Bio 3");

      await dmRegistry.connect(user1).createConversation(user2.address);
      await dmRegistry.connect(user1).createConversation(user3.address);

      const conversations = await dmRegistry.getConversations(user1.address);
      expect(conversations.length).to.equal(2);
    });
  });

  describe("Query Functions", function () {
    beforeEach(async function () {
      await dmRegistry.connect(user1).createConversation(user2.address);
    });

    it("Should return conversations for a user", async function () {
      const user1Convs = await dmRegistry.getConversations(user1.address);
      const user2Convs = await dmRegistry.getConversations(user2.address);

      expect(user1Convs.length).to.equal(1);
      expect(user2Convs.length).to.equal(1);
      expect(user1Convs[0]).to.equal(user2Convs[0]);
    });

    it("Should return correct conversation count", async function () {
      expect(await dmRegistry.getConversationCount(user1.address)).to.equal(1);
      expect(await dmRegistry.getConversationCount(user2.address)).to.equal(1);
      expect(await dmRegistry.getConversationCount(user3.address)).to.equal(0);
    });

    it("Should get conversation between two users", async function () {
      const conv = await dmRegistry.getConversation(user1.address, user2.address);
      expect(conv).to.not.equal(ethers.ZeroAddress);
    });

    it("Should get conversation regardless of address order", async function () {
      const conv1 = await dmRegistry.getConversation(user1.address, user2.address);
      const conv2 = await dmRegistry.getConversation(user2.address, user1.address);
      expect(conv1).to.equal(conv2);
    });

    it("Should return zero address for non-existent conversation", async function () {
      const conv = await dmRegistry.getConversation(user1.address, user3.address);
      expect(conv).to.equal(ethers.ZeroAddress);
    });

    it("Should check if conversation exists", async function () {
      expect(await dmRegistry.conversationExists(user1.address, user2.address)).to.be.true;
      expect(await dmRegistry.conversationExists(user2.address, user1.address)).to.be.true;
      expect(await dmRegistry.conversationExists(user1.address, user3.address)).to.be.false;
    });

    it("Should return empty array for user with no conversations", async function () {
      const convs = await dmRegistry.getConversations(user3.address);
      expect(convs.length).to.equal(0);
    });
  });

  describe("Conversation Contract Verification", function () {
    it("Should create a valid DMConversation contract", async function () {
      const tx = await dmRegistry.connect(user1).createConversation(user2.address);
      const receipt = await tx.wait();

      const event = receipt.logs.find(
        (log) => log.fragment && log.fragment.name === "ConversationCreated"
      );
      const conversationAddress = event.args.conversation;

      // Attach to the created conversation
      const DMConversation = await ethers.getContractFactory("DMConversation");
      const conversation = DMConversation.attach(conversationAddress);

      // Verify participants
      const info = await conversation.getConversationInfo();
      expect(info._participant1).to.equal(user1.address);
      expect(info._participant2).to.equal(user2.address);
      expect(info._messageCount).to.equal(0);
    });
  });
});
