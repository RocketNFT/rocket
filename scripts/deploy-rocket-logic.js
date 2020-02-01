module.exports = async function(callback) {
  try {
    global.web3 = web3;

    let network = await web3.eth.net.getNetworkType();
    console.log('Current network:', network);

    const { web3tx } = require('@decentral.ee/web3-test-helpers');
    const Rocket = artifacts.require('Rocket');
    const rocketLogic = await web3tx(Rocket.new, 'Rocket.new')({
      gas: 5000000
    });
    console.log('Rocket logic deployed at: ', rocketLogic.address);

    callback();
  } catch (err) {
    callback(err);
  }
};
