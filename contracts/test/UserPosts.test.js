import { expect } from "chai";
import hre from "hardhat";
const { ethers } = hre;

describe("UserPosts", function () {
  let userRegistry;
  let userPosts;
  let owner;
  let addr1;
  let addr2;
  let delegate;

  beforeEach(async function () {
    [owner, addr1, addr2, delegate] = await ethers.getSigners();

    // Deploy UserRegistry
    const UserRegistry = await ethers.getContractFactory("UserRegistry");
    userRegistry = await UserRegistry.deploy();

    // Deploy UserPosts
    const UserPosts = await ethers.getContractFactory("UserPosts");
    userPosts = await UserPosts.deploy(await userRegistry.getAddress());

    // Create profiles
    await userRegistry.connect(owner).createProfile("Owner", "Owner bio");
    await userRegistry.connect(addr1).createProfile("User1", "User1 bio");
  });

  describe("Post Creation", function () {
    it("Should create a post successfully", async function () {
      await expect(userPosts.createPost("Hello world!"))
        .to.emit(userPosts, "PostCreated");

      const post = await userPosts.getPost(0);
      expect(post.profileOwner).to.equal(owner.address);
      expect(post.sender).to.equal(owner.address);
      expect(post.content).to.equal("Hello world!");
      expect(post.isDeleted).to.be.false;
      expect(post.timestamp).to.be.gt(0);
    });

    it("Should reject empty content", async function () {
      await expect(userPosts.createPost(""))
        .to.be.revertedWithCustomError(userPosts, "ContentEmpty");
    });

    it("Should reject content too long", async function () {
      const longContent = "a".repeat(2001);
      await expect(userPosts.createPost(longContent))
        .to.be.revertedWithCustomError(userPosts, "ContentTooLong");
    });

    it("Should reject if no profile exists", async function () {
      await expect(userPosts.connect(addr2).createPost("Hello"))
        .to.be.revertedWithCustomError(userPosts, "ProfileRequired");
    });

    it("Should allow delegate to post for profile owner", async function () {
      // Add delegate
      await userRegistry.connect(owner).addDelegate(delegate.address);

      // Delegate creates post
      await expect(userPosts.connect(delegate).createPost("Posted by delegate"))
        .to.emit(userPosts, "PostCreated");

      const post = await userPosts.getPost(0);
      expect(post.profileOwner).to.equal(owner.address);
      expect(post.sender).to.equal(delegate.address);
      expect(post.timestamp).to.be.gt(0);
    });

    it("Should track multiple posts per user", async function () {
      await userPosts.createPost("Post 1");
      await userPosts.createPost("Post 2");
      await userPosts.createPost("Post 3");

      expect(await userPosts.getUserPostCount(owner.address)).to.equal(3);
      expect(await userPosts.getPostCount()).to.equal(3);
    });
  });

  describe("Post Editing", function () {
    beforeEach(async function () {
      await userPosts.createPost("Original content");
    });

    it("Should edit a post successfully", async function () {
      await expect(userPosts.editPost(0, "Edited content"))
        .to.emit(userPosts, "PostEdited");

      const post = await userPosts.getPost(0);
      expect(post.content).to.equal("Edited content");
      expect(post.editedAt).to.be.gt(0);
    });

    it("Should allow delegate to edit owner's post", async function () {
      await userRegistry.connect(owner).addDelegate(delegate.address);

      await userPosts.connect(delegate).editPost(0, "Edited by delegate");

      const post = await userPosts.getPost(0);
      expect(post.content).to.equal("Edited by delegate");
    });

    it("Should reject editing others' posts", async function () {
      await expect(userPosts.connect(addr1).editPost(0, "Hacked"))
        .to.be.revertedWithCustomError(userPosts, "NotAuthorized");
    });

    it("Should reject editing non-existent post", async function () {
      await expect(userPosts.editPost(99, "Content"))
        .to.be.revertedWithCustomError(userPosts, "PostNotFound");
    });

    it("Should reject empty edited content", async function () {
      await expect(userPosts.editPost(0, ""))
        .to.be.revertedWithCustomError(userPosts, "ContentEmpty");
    });
  });

  describe("Post Deletion", function () {
    beforeEach(async function () {
      await userPosts.createPost("To be deleted");
    });

    it("Should delete a post successfully", async function () {
      await expect(userPosts.deletePost(0))
        .to.emit(userPosts, "PostDeleted")
        .withArgs(owner.address, 0);

      const post = await userPosts.getPost(0);
      expect(post.content).to.equal("");
      expect(post.isDeleted).to.be.true;
    });

    it("Should allow delegate to delete owner's post", async function () {
      await userRegistry.connect(owner).addDelegate(delegate.address);

      await userPosts.connect(delegate).deletePost(0);

      const post = await userPosts.getPost(0);
      expect(post.isDeleted).to.be.true;
    });

    it("Should reject deleting others' posts", async function () {
      await expect(userPosts.connect(addr1).deletePost(0))
        .to.be.revertedWithCustomError(userPosts, "NotAuthorized");
    });

    it("Should reject deleting already deleted post", async function () {
      await userPosts.deletePost(0);
      await expect(userPosts.deletePost(0))
        .to.be.revertedWithCustomError(userPosts, "PostAlreadyDeleted");
    });

    it("Should reject editing deleted post", async function () {
      await userPosts.deletePost(0);
      await expect(userPosts.editPost(0, "New content"))
        .to.be.revertedWithCustomError(userPosts, "PostAlreadyDeleted");
    });
  });

  describe("Post Retrieval", function () {
    beforeEach(async function () {
      // Create posts from different users
      await userPosts.connect(owner).createPost("Owner post 1");
      await userPosts.connect(owner).createPost("Owner post 2");
      await userPosts.connect(addr1).createPost("User1 post 1");
      await userPosts.connect(owner).createPost("Owner post 3");
    });

    it("Should get user posts with pagination", async function () {
      const [posts, indices] = await userPosts.getUserPosts(owner.address, 0, 2);
      expect(posts.length).to.equal(2);
      expect(posts[0].content).to.equal("Owner post 1");
      expect(posts[1].content).to.equal("Owner post 2");
      expect(indices[0]).to.equal(0);
      expect(indices[1]).to.equal(1);
    });

    it("Should get latest user posts", async function () {
      const [posts, indices] = await userPosts.getLatestUserPosts(owner.address, 2);
      expect(posts.length).to.equal(2);
      // Newest first
      expect(posts[0].content).to.equal("Owner post 3");
      expect(posts[1].content).to.equal("Owner post 2");
    });

    it("Should get global latest posts", async function () {
      const posts = await userPosts.getLatestPosts(3);
      expect(posts.length).to.equal(3);
      // Newest first
      expect(posts[0].content).to.equal("Owner post 3");
      expect(posts[1].content).to.equal("User1 post 1");
      expect(posts[2].content).to.equal("Owner post 2");
    });

    it("Should handle pagination beyond bounds", async function () {
      const [posts, indices] = await userPosts.getUserPosts(owner.address, 100, 10);
      expect(posts.length).to.equal(0);
    });
  });

  // Helper to get current block timestamp
  async function getTimestamp() {
    const block = await ethers.provider.getBlock("latest");
    return block.timestamp;
  }
});
