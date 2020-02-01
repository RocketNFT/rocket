const { promisify } = require('util');
const readline = require('readline');

// promisify the readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
// Prepare readline.question for promisification
rl.question[promisify.custom] = question => {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
};

module.exports = async function(callback) {
  try {
    global.web3 = web3;

    let network = await web3.eth.net.getNetworkType();
    console.log('Current network:', network);

    const { web3tx } = require('@decentral.ee/web3-test-helpers');
    const Rocket = artifacts.require('Rocket');
    const Proxy = artifacts.require('Proxy');

    let rocketLogicAddress = await promisify(rl.question)(
      'Specify a deployed Rocket logic contract (deploy a new one if blank): '
    );
    let rocketLogic;
    if (!rocketLogicAddress) {
      rocketLogic = await web3tx(Rocket.new, 'rocketLogic.new')({
        gas: 5000000
      });
      console.log('Rocket logic deployed at: ', rocketLogic.address);
    } else {
      rocketLogic = await Rocket.at(rocketLogicAddress);
    }

    const rocketConstructCode = rocketLogic.contract.methods
      .initialize('Rocket')
      .encodeABI();
    console.log(
      `rocketConstructCode rocketLogic.initialize(${rocketConstructCode})`
    );
    const proxy = await web3tx(Proxy.new, 'Proxy.new')(
      rocketConstructCode,
      rocketLogic.address,
      {
        gas: 1000000
      }
    );
    console.log('proxy deployed at: ', proxy.address);

    callback();
  } catch (err) {
    callback(err);
  }
};
