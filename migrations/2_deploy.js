const rocket = artifacts.require('Rocket');
const NFToken = artifacts.require('NFToken');

module.exports = function(deployer) {
  deployer.deploy(rocket);
  deployer.deploy(NFToken);
};
