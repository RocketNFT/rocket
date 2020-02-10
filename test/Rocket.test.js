const { expectRevert } = require("@openzeppelin/test-helpers");

const { expect } = require("chai");

const Proxy = artifacts.require("Proxy");
const Rocket = artifacts.require("Rocket"); // Loads a compiled contract
const MyNFTContract = artifacts.require("NFToken");

contract("Rocket", accounts => {
  const owner = accounts[0];
  const receiver = accounts[1];
  let rocketLogic;
  let myBank;
  let myNFT;

  async function deploy() {
    myNFT = await MyNFTContract.new();
    rocketLogic = await Rocket.new();
    const rocketConstructCode = rocketLogic.contract.methods
      .initialize("Rocket")
      .encodeABI();
    const proxy = await Proxy.new(rocketConstructCode, rocketLogic.address);
    myBank = await Rocket.at(proxy.address);
    // console.log('Owner: ', owner);
    // console.log('MyNFT deployed at: ', myNFT.address);
    // console.log('rocketLogic deployed at: ', rocketLogic.address);
    // console.log('Proxy Rocket deployed at: ', myBank.address);
  }

  describe("Standard Deposit and Withdraw flow", function() {
    before(async function() {
      await deploy();
    });
    it("deployer is owner, mintToken", async function() {
      await myNFT.mintToken(owner, 0);
      // console.log(myNFT.balanceOf(owner));
      expect(await myNFT.ownerOf(0)).to.equal(owner);
    });

    it("should be able to transfer token to bank", async function() {
      await myNFT.safeTransferFrom(owner, myBank.address, 0, { from: owner });
      expect(await myNFT.ownerOf(0)).to.equal(myBank.address);
    });

    it("contract bank is owner", async function() {
      expect(await myNFT.ownerOf(0)).to.equal(myBank.address);
    });

    it("contract bank understands who is owner internally", async function() {
      expect(await myBank.ownerOf(myNFT.address, 0)).to.equal(owner);
    });

    it("original owner is owner in bank", async function() {
      expect(await myBank.ownerOf(myNFT.address, 0)).to.equal(owner);
    });

    it("should be able to transfer from bank to original contract", async function() {
      await myBank.safeTransferFrom(myNFT.address, owner, owner, 0, "0x0a", {
        from: owner
      }),
        expect(await myNFT.ownerOf(0)).to.equal(owner);
    });

    it("original owner is owner", async function() {
      expect(await myNFT.ownerOf(0)).to.equal(owner);
    });

    it("original owner is not owner after he has transferred it", async function() {
      expectRevert(
        myBank.ownerOf(myNFT.address, 0),
        "ERC721: owner query for nonexistent token"
      );
    });
  });

  describe("seize collateral scenario", function() {
    before(async function() {
      await deploy();
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
      await myNFT.safeTransferFrom(receiver, myBank.address, 0, {
        from: receiver
      });
      expect(await myNFT.ownerOf(0)).to.equal(myBank.address);
    });

    it("admin lock", async function() {
      await myBank.adminLock(myNFT.address, 0, { from: owner });
      expect(await myBank.isAdminLocked(myNFT.address, 0)).to.equal(true);
    });

    it("admin seize collateral", async function() {
      expect(await myNFT.ownerOf(0)).to.equal(myBank.address);
      expect(await myBank.ownerOf(myNFT.address, 0)).to.equal(receiver);
      await myBank.adminCollateralize(myNFT.address, owner, 0, "0x0a", {
        from: owner
      });
      // expect(await myBank.ownerOf(myNFT.address, 0)).to.equal(owner);
      expect(await myNFT.ownerOf(0)).to.equal(owner);
    });

    it("safe transfer from owner to owner", async function() {
      await myNFT.safeTransferFrom(owner, owner, 0, {
        from: owner
      }),
        expect(await myNFT.ownerOf(0)).to.equal(owner);
    });
  });

  describe("Admin Locks Token, Token Depositor Withdraw Fails", function() {
    before(async function() {
      await deploy();
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
      await myNFT.safeTransferFrom(receiver, myBank.address, 0, {
        from: receiver
      });
      expect(await myNFT.ownerOf(0)).to.equal(myBank.address);
    });

    it("admin lock", async function() {
      await myBank.adminLock(myNFT.address, 0, { from: owner });
      expect(await myBank.isAdminLocked(myNFT.address, 0)).to.equal(true);
    });

    it("withdraw should fail", async function() {
      expectRevert(
        myBank.safeTransferFrom(myNFT.address, receiver, receiver, 0, "0x0a", {
          from: receiver
        }),
        "administrator lock"
      );
    });
  });

  describe("Ownable functions openzepplin", function() {
    before(async function() {
      await deploy();
    });
    it("Owner Is Owner", async function() {
      expect(await myBank.isOwner({ from: owner })).to.equal(true);
    });
    it("reciever is not owner", async function() {
      expect(await myBank.isOwner({ from: receiver })).to.equal(false);
    });
    it("Owner owns contract", async function() {
      expect(await myBank.owner()).to.equal(owner);
    });
  });

  describe("Proxy upgrade", async function() {
    before(async function() {
      await deploy();
    });
    it("Upgrade security", async () => {
      // Test original logic contract
      await expectRevert(
        myBank.initialize("submarine", {
          from: owner
        }),
        "The library has already been initialized."
      );

      // Deploy new rocket logic/library contract
      newRocketLogic = await Rocket.new();

      // Try to perform upgrade from non-admin account
      await expectRevert(
        myBank.updateCode(newRocketLogic.address, {
          from: receiver
        }),
        "Ownable: caller is not the owner"
      );

      // Perform the upgrade
      await myBank.updateCode(newRocketLogic.address, {
        from: owner
      });

      // Try to call initialize after the upgrade
      await expectRevert(
        myBank.initialize("submarine", {
          from: owner
        }),
        "The library has already been initialized."
      );

      // Try to perform another upgrade from non-admin account
      await expectRevert(
        myBank.updateCode(rocketLogic.address, {
          from: receiver
        }),
        "Ownable: caller is not the owner"
      );
    });
  });
  describe("Test Non safe Recover", async function() {
    before(async function() {
      await deploy();
    });
    it("Deployer is owner, mint Token", async function() {
      await myNFT.mintToken(owner, 0);
      expect(await myNFT.ownerOf(0)).to.equal(owner);
    });
    it("transfer from owner to bank, non safe", async function() {
      await myNFT.transferFrom(owner, myBank.address, 0, { from: owner });
      expect(await myNFT.ownerOf(0)).to.equal(myBank.address);
      expectRevert(myBank.ownerOf(myNFT.address, 0), "ERC721: owner query for nonexistent token")
    });
    // it("check owner")
    it("Recover non safe transfer from bank", async function() {
      await myBank.recoverNonSafeTransferredERC721(myNFT.address, 0, owner, {from: owner});
      expect(await myNFT.ownerOf(0)).to.equal(owner);
    });
    // it("should be able to transfer token to bank", async function() {
    //   await myNFT.safeTransferFrom(owner, myBank.address, 0, { from: owner });
    //   expect(await myNFT.ownerOf(0)).to.equal(myBank.address);
    // });
  });
});
