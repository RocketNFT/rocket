const { accounts, contract } = require("@openzeppelin/test-environment");
const { expectRevert } = require("@openzeppelin/test-helpers");

const [owner, receiver] = accounts;

const { expect } = require("chai");

const MyBankContract = contract.fromArtifact("rocket"); // Loads a compiled contract
const MyNFTContract = contract.fromArtifact("NFToken");

let mybank;
let myNFT;

describe("MyContract", function() {
  before(async function() {
    this.timeout(50000);
    mybank = await MyBankContract.new({ from: owner });
    myNFT = await MyNFTContract.new({ from: owner });
  });

  it("deployer is owner, mintToken", async function() {
    await myNFT.mintToken(owner, 0);
    expect(await myNFT.ownerOf(0)).to.equal(owner);
  });

  it("should be able to transfer token to bank", async function() {
    await myNFT.safeTransferFrom(owner, mybank.address, 0, { from: owner });
    expect(await myNFT.ownerOf(0)).to.equal(mybank.address);
  });

  it("contract bank is owner", async function() {
    expect(await myNFT.ownerOf(0)).to.equal(mybank.address);
  });

  it("contract bank understands who is owner internally", async function() {
    expect(await mybank.ownerOf(myNFT.address, 0)).to.equal(owner);
  });

  it("original owner is owner in bank", async function() {
    expect(await mybank.ownerOf(myNFT.address, 0)).to.equal(owner);
  });

  it("should be able to transfer from bank to original contract", async function() {
    await mybank.safeTransferFrom(myNFT.address, owner, owner, 0, "0x0a", {
      from: owner
    }),
      expect(await myNFT.ownerOf(0)).to.equal(owner);
  });

  it("original owner is owner", async function() {
    expect(await myNFT.ownerOf(0)).to.equal(owner);
  });

  it("original owner is not owner after he has transferred it", async function() {
    expectRevert(
      mybank.ownerOf(myNFT.address, 0),
      "ERC721: owner query for nonexistent token"
    );
  });
  describe("seize collateral scenario", function() {
    before(async function() {
      this.timeout(50000);
      mybank = await MyBankContract.new({ from: owner });
      myNFT = await MyNFTContract.new({ from: owner });
    });

    it("Deployer is owner, mint Token", async function() {
      await myNFT.mintToken(owner, 0);
      expect(await myNFT.ownerOf(0)).to.equal(owner);
    });
    it("transfer from owner to reciever", async function() {
      await myNFT.safeTransferFrom(owner, receiver, 0, { from: owner });
      expect(await myNFT.ownerOf(0)).to.equal(receiver);
    });

    it("transfer from reciever to bank", async function() {
      await myNFT.safeTransferFrom(receiver, mybank.address, 0, {
        from: receiver
      });
      expect(await myNFT.ownerOf(0)).to.equal(mybank.address);
    });

    it("admin lock", async function() {
      await mybank.adminLock(myNFT.address, 0, { from: owner });
      expect(await mybank.isAdminLocked(myNFT.address, 0)).to.equal(true);
    });

    it("admin seize collateral", async function() {
      await mybank.adminCollateralize(myNFT.address, owner, 0, "0x0a", {
        from: owner
      });
      // expect(await mybank.ownerOf(myNFT.address, 0)).to.equal(owner);
      expect(await myNFT.ownerOf(0)).to.equal(owner);
    });

    it("safe transfer from owner to owner", async function() {
      await myNFT.safeTransferFrom(owner, owner, 0, {
        from: owner
      }),
        expect(await myNFT.ownerOf(0)).to.equal(owner);
    });
  });
  describe("failing test", function() {
    before(async function() {
      this.timeout(50000);
      mybank = await MyBankContract.new({ from: owner });
      myNFT = await MyNFTContract.new({ from: owner });
    });

    it("Deployer is owner, mint Token", async function() {
      await myNFT.mintToken(owner, 0);
      expect(await myNFT.ownerOf(0)).to.equal(owner);
    });

    it("transfer from owner to reciever", async function() {
      await myNFT.safeTransferFrom(owner, receiver, 0, { from: owner });
      expect(await myNFT.ownerOf(0)).to.equal(receiver);
    });

    it("transfer from reciever to bank", async function() {
      await myNFT.safeTransferFrom(receiver, mybank.address, 0, {
        from: receiver
      });
      expect(await myNFT.ownerOf(0)).to.equal(mybank.address);
    });

    it("admin lock", async function() {
      await mybank.adminLock(myNFT.address, 0, { from: owner });
      expect(await mybank.isAdminLocked(myNFT.address, 0)).to.equal(true);
    });

    // it("withdraw should fail", async function() {
    //   await mybank.safeTransferFrom(
    //     myNFT.address,
    //     receiver,
    //     receiver,
    //     0,
    //     "0x0a",
    //     {
    //       from: owner
    //     }
    //   ),
    //     expect(await myNFT.ownerOf(0)).to.equal(receiver);
    // });
  });
});
