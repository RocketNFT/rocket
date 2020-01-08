const bank = artifacts.require("bank");
const NFToken = artifacts.require("NFToken");

module.exports = function(deployer) {
  deployer.deploy(bank);
  deployer.deploy(NFToken);
};

