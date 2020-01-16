const { accounts, contract } = require('@openzeppelin/test-environment');
const { expectRevert } = require('@openzeppelin/test-helpers');

const [ owner, receiver ] = accounts;

const { expect } = require('chai');

const MyBankContract = contract.fromArtifact('bank'); // Loads a compiled contract
const MyNFTContract = contract.fromArtifact('NFToken'); 

let mybank
let myNFT

describe('MyContract', function () {

    before(async function() {
      this.timeout(50000); 
      mybank = await MyBankContract.new({ from: owner });
      myNFT = await MyNFTContract.new({ from: owner });
    });
    

  it('deployer is owner, mintToken', async function () {
    await myNFT.mintToken(owner, 0) 
    expect(await myNFT.ownerOf(0)).to.equal(owner);
  });

  it('should be able to transfer token to bank', async function () {
    await myNFT.safeTransferFrom(owner, mybank.address, 0,{ from: owner }) 
    expect(await myNFT.ownerOf(0)).to.equal(mybank.address);
  });

  it('contract bank is owner', async function () {
    expect(await myNFT.ownerOf(0)).to.equal(mybank.address);
  });

  it('contract bank understands who is owner internally', async function () {
    expect(await mybank.ownerOf(myNFT.address, 0)).to.equal(owner);
  });

  it('original owner is owner in bank', async function () {
    expect(await mybank.ownerOf(myNFT.address, 0)).to.equal(owner);
  });


  it('should be able to transfer from bank to original contract', async function () {
    await mybank.safeTransferFrom(myNFT.address, owner, owner, 0, '0x0a', { from: owner }),
    expect(await myNFT.ownerOf(0)).to.equal(owner);
  });

  it('original owner is owner', async function () {
    expect(await myNFT.ownerOf(0)).to.equal(owner);
  });

  it('original owner is not owner after he has transferred it', async function () {
    expectRevert(
        mybank.ownerOf(myNFT.address, 0),
        "ERC721: owner query for nonexistent token",
    );
  });
  
});