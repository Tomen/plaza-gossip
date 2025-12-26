import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("DMConversation", function () {
  let userRegistry;
  let dmRegistry;
  let conversation;
  let owner;
  let user1;
  let user2;
  let user3;
  let delegate1;

  beforeEach(async function () {
    [owner, user1, user2, user3, delegate1] = await ethers.getSigners();

    // Deploy UserRegistry
    const UserRegistry = await ethers.getContractFactory("UserRegistry");
    userRegistry = await UserRegistry.deploy();

    // Deploy DMRegistry
    const DMRegistry = await ethers.getContractFactory("DMRegistry");
    dmRegistry = await DMRegistry.deploy(await userRegistry.getAddress());

    // Create profiles for users
    await userRegistry.connect(user1).createProfile("User1", "Bio 1");
    await userRegistry.connect(user2).createProfile("User2", "Bio 2");

    // Create a conversation
    const tx = await dmRegistry.connect(user1).createConversation(user2.address);
    const receipt = await tx.wait();
    const event = receipt.logs.find(
      (log) => log.fragment && log.fragment.name === "ConversationCreated"
    );
    const conversationAddress = event.args.conversation;

    const DMConversation = await ethers.getContractFactory("DMConversation");
    conversation = DMConversation.attach(conversationAddress);
  });

  describe("Deployment", function () {
    it("Should set the correct participants", async function () {
      expect(await conversation.participant1()).to.equal(user1.address);
      expect(await conversation.participant2()).to.equal(user2.address);
    });

    it("Should set the correct UserRegistry", async function () {
      expect(await conversation.userRegistry()).to.equal(
        await userRegistry.getAddress()
      );
    });

    it("Should start with zero messages", async function () {
      expect(await conversation.getMessageCount()).to.equal(0);
    });

    it("Should reject invalid constructor parameters", async function () {
      const DMConversation = await ethers.getContractFactory("DMConversation");

      await expect(
        DMConversation.deploy(ethers.ZeroAddress, user1.address, user2.address)
      ).to.be.revertedWith("Invalid registry address");

      await expect(
        DMConversation.deploy(await userRegistry.getAddress(), ethers.ZeroAddress, user2.address)
      ).to.be.revertedWith("Invalid participant1");

      await expect(
        DMConversation.deploy(await userRegistry.getAddress(), user1.address, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid participant2");

      await expect(
        DMConversation.deploy(await userRegistry.getAddress(), user1.address, user1.address)
      ).to.be.revertedWith("Participants must be different");
    });
  });

  describe("Message Posting", function () {
    const encryptedContent = ethers.toUtf8Bytes("encrypted message content");

    it("Should allow participant1 to post a message", async function () {
      await expect(conversation.connect(user1).postMessage(encryptedContent))
        .to.emit(conversation, "MessagePosted")
        .withArgs(user1.address, user1.address, 0, (timestamp) => timestamp > 0);
    });

    it("Should allow participant2 to post a message", async function () {
      await expect(conversation.connect(user2).postMessage(encryptedContent))
        .to.emit(conversation, "MessagePosted")
        .withArgs(user2.address, user2.address, 0, (timestamp) => timestamp > 0);
    });

    it("Should reject message from non-participant", async function () {
      await expect(
        conversation.connect(user3).postMessage(encryptedContent)
      ).to.be.revertedWith("Not a participant");
    });

    it("Should reject empty message", async function () {
      await expect(
        conversation.connect(user1).postMessage(new Uint8Array(0))
      ).to.be.revertedWith("Message cannot be empty");
    });

    it("Should reject message that is too long", async function () {
      const longMessage = ethers.randomBytes(2001);
      await expect(
        conversation.connect(user1).postMessage(longMessage)
      ).to.be.revertedWith("Message too long");
    });

    it("Should allow message at max length", async function () {
      const maxMessage = ethers.randomBytes(2000);
      await expect(conversation.connect(user1).postMessage(maxMessage))
        .to.emit(conversation, "MessagePosted");
    });

    it("Should increment message count", async function () {
      await conversation.connect(user1).postMessage(encryptedContent);
      expect(await conversation.getMessageCount()).to.equal(1);

      await conversation.connect(user2).postMessage(encryptedContent);
      expect(await conversation.getMessageCount()).to.equal(2);
    });

    it("Should store message data correctly", async function () {
      await conversation.connect(user1).postMessage(encryptedContent);

      const msg = await conversation.getMessage(0);
      expect(msg.senderOwner).to.equal(user1.address);
      expect(msg.senderAddress).to.equal(user1.address);
      expect(msg.encryptedContent).to.equal(ethers.hexlify(encryptedContent));
      expect(msg.timestamp).to.be.gt(0);
    });

    it("Should return correct message index", async function () {
      const tx1 = await conversation.connect(user1).postMessage(encryptedContent);
      const receipt1 = await tx1.wait();
      const event1 = receipt1.logs.find(
        (log) => log.fragment && log.fragment.name === "MessagePosted"
      );
      expect(event1.args.index).to.equal(0);

      const tx2 = await conversation.connect(user2).postMessage(encryptedContent);
      const receipt2 = await tx2.wait();
      const event2 = receipt2.logs.find(
        (log) => log.fragment && log.fragment.name === "MessagePosted"
      );
      expect(event2.args.index).to.equal(1);
    });
  });

  describe("Delegate Posting", function () {
    const encryptedContent = ethers.toUtf8Bytes("encrypted message");

    beforeEach(async function () {
      // Add delegate1 as a delegate for user1
      await userRegistry.connect(user1).addDelegate(delegate1.address);
    });

    it("Should allow delegate to post on behalf of participant", async function () {
      await expect(conversation.connect(delegate1).postMessage(encryptedContent))
        .to.emit(conversation, "MessagePosted")
        .withArgs(user1.address, delegate1.address, 0, (timestamp) => timestamp > 0);
    });

    it("Should record correct senderOwner for delegate post", async function () {
      await conversation.connect(delegate1).postMessage(encryptedContent);

      const msg = await conversation.getMessage(0);
      expect(msg.senderOwner).to.equal(user1.address);
      expect(msg.senderAddress).to.equal(delegate1.address);
    });

    it("Should reject delegate of non-participant", async function () {
      // Create profile for user3 and add delegate
      await userRegistry.connect(user3).createProfile("User3", "Bio 3");
      const delegateForUser3 = (await ethers.getSigners())[5];
      await userRegistry.connect(user3).addDelegate(delegateForUser3.address);

      await expect(
        conversation.connect(delegateForUser3).postMessage(encryptedContent)
      ).to.be.revertedWith("Not a participant");
    });
  });

  describe("Query Functions", function () {
    beforeEach(async function () {
      // Post some messages
      for (let i = 0; i < 5; i++) {
        const content = ethers.toUtf8Bytes(`message ${i}`);
        if (i % 2 === 0) {
          await conversation.connect(user1).postMessage(content);
        } else {
          await conversation.connect(user2).postMessage(content);
        }
      }
    });

    it("Should get a specific message", async function () {
      const msg = await conversation.getMessage(2);
      expect(msg.senderOwner).to.equal(user1.address);
    });

    it("Should reject getting non-existent message", async function () {
      await expect(conversation.getMessage(10)).to.be.revertedWith(
        "Message does not exist"
      );
    });

    it("Should get messages in a range", async function () {
      const messages = await conversation.getMessages(1, 3);
      expect(messages.length).to.equal(3);
    });

    it("Should handle range exceeding total messages", async function () {
      const messages = await conversation.getMessages(3, 10);
      expect(messages.length).to.equal(2); // Only messages 3 and 4 exist
    });

    it("Should return empty array for out-of-range start", async function () {
      const messages = await conversation.getMessages(10, 5);
      expect(messages.length).to.equal(0);
    });

    it("Should get latest messages", async function () {
      const messages = await conversation.getLatestMessages(3);
      expect(messages.length).to.equal(3);
      // Should be messages 2, 3, 4 (last 3)
    });

    it("Should handle getting more latest messages than exist", async function () {
      const messages = await conversation.getLatestMessages(100);
      expect(messages.length).to.equal(5);
    });

    it("Should return empty array for zero latest messages", async function () {
      const messages = await conversation.getLatestMessages(0);
      expect(messages.length).to.equal(0);
    });

    it("Should get conversation info", async function () {
      const info = await conversation.getConversationInfo();
      expect(info._participant1).to.equal(user1.address);
      expect(info._participant2).to.equal(user2.address);
      expect(info._messageCount).to.equal(5);
    });
  });

  describe("Participant Checks", function () {
    it("Should identify participant1 as participant", async function () {
      expect(await conversation.isParticipant(user1.address)).to.be.true;
    });

    it("Should identify participant2 as participant", async function () {
      expect(await conversation.isParticipant(user2.address)).to.be.true;
    });

    it("Should identify non-participant", async function () {
      expect(await conversation.isParticipant(user3.address)).to.be.false;
    });

    it("Should identify delegate as participant", async function () {
      await userRegistry.connect(user1).addDelegate(delegate1.address);
      expect(await conversation.isParticipant(delegate1.address)).to.be.true;
    });

    it("Should not identify delegate of non-participant as participant", async function () {
      await userRegistry.connect(user3).createProfile("User3", "Bio 3");
      await userRegistry.connect(user3).addDelegate(delegate1.address);
      expect(await conversation.isParticipant(delegate1.address)).to.be.false;
    });
  });

  describe("Edge Cases", function () {
    it("Should handle conversation with no messages", async function () {
      const messages = await conversation.getMessages(0, 10);
      expect(messages.length).to.equal(0);

      const latest = await conversation.getLatestMessages(10);
      expect(latest.length).to.equal(0);

      expect(await conversation.getMessageCount()).to.equal(0);
    });

    it("Should handle large encrypted content", async function () {
      const largeContent = ethers.randomBytes(1500);
      await conversation.connect(user1).postMessage(largeContent);

      const msg = await conversation.getMessage(0);
      expect(msg.encryptedContent).to.equal(ethers.hexlify(largeContent));
    });
  });
});
