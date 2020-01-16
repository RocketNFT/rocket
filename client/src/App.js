import React, { Component } from "react";
import BankContract from "./contracts/bank.json";
import NFTContract from "./contracts/NFToken.json";
import ERC721Contract from "./contracts/ERC721.json";
import getWeb3 from "./getWeb3";

import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';

import "./App.css";

import Card from './components/Card'

const gas = 5000000
const ROPSTEN = 3 // network id

class App extends Component {
  state = {
    tokenId: 0,
    web3: null,
    accounts: null,
    contract: null,
    bankBalance: 0,
    ownerBalance: 0,
    ERC721ContractAddress: null
  };

  deployedNetworkIds = (id) => {
    if(ROPSTEN === id) {
      return {
        bankAddress: '0x0ab83D15191aF787E7A2ce0af48B008a93cda6A4',
        nftAddress: '0x4d60e17365a11207A21ebd854115E2c49769c553'
      }
    } else {
      return {
        bankAddress: BankContract.networks[id],
        nftAddress: NFTContract.networks[id]
      }
    }
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const bankAddress = this.deployedNetworkIds(networkId).bankAddress
      const nftAddress = this.deployedNetworkIds(networkId).nftAddress
    
      const BankInstance = new web3.eth.Contract(
        BankContract.abi,
        bankAddress,
      );
      const NFTInstance = new web3.eth.Contract(
        NFTContract.abi,
        nftAddress,
      );
      
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      const newState = { web3, accounts, BankInstance, NFTInstance, ERC721ContractAddress: nftAddress }
      console.log(newState)
      this.setState(newState);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  getNftBalanceOf = async (address) => {
    const { web3, ERC721ContractAddress } = this.state
    if(!web3.utils.isAddress(ERC721ContractAddress)) {
      alert('Invalid address '+ ERC721ContractAddress)
      return
    }
    
    const ERC721Instance = new web3.eth.Contract(
      ERC721Contract.abi,
      ERC721ContractAddress,
    );
    let result = null;
    try {
      result = await ERC721Instance.methods.balanceOf(address).call()
      console.log({address, balanceOf: result})
    } catch (error) {
      console.log(error)
    }
    return result
  }
  
  handleTokenIdInput = (event) => {
    this.setState({ tokenId: Number(event.target.value)})
  }

  handleERC721ContractAddress = (event) => {
    this.setState({ ERC721ContractAddress: event.target.value})
  }

  mintToken = async () => {
    const { NFTInstance, accounts, tokenId } = this.state
    const owner = accounts[0]
    try {
      const mintResponse = await NFTInstance.methods.mintToken(owner, tokenId).send({ from: owner, gas })
      console.log({mintResponse})
      // const safeTransferResponse = await ERC721Instance.methods.safeTransferFrom(owner, BankInstance._address, tokenId).send({ from: owner })
      // console.log({safeTransferResponse})
    } catch (error) {
      console.log(error)
    }
    this.updateTokenCount()
  }

  withdraw = async () => {
    const { BankInstance, accounts, tokenId, web3, ERC721ContractAddress } = this.state
    if(!web3.utils.isAddress(ERC721ContractAddress)) {
      alert('Invalid address '+ ERC721ContractAddress)
      return
    }

    const owner = accounts[0]
    const ERC721Instance = new web3.eth.Contract(
      ERC721Contract.abi,
      ERC721ContractAddress,
    );
    const bankResponse = await BankInstance.methods.safeTransferFrom(ERC721Instance._address, owner, owner, tokenId, '0x0a').send({ from: owner, gas })
    console.log({bankResponse})

    this.updateTokenCount()
  }

  deposit = async () => {
    const { BankInstance, accounts, tokenId, web3, ERC721ContractAddress } = this.state
    if(!web3.utils.isAddress(ERC721ContractAddress)) {
      alert('Invalid address '+ ERC721ContractAddress)
      return
    }
    
    const owner = accounts[0]
    const ERC721Instance = new web3.eth.Contract(
      ERC721Contract.abi,
      ERC721ContractAddress,
    );
    const safeTransferResponse = await ERC721Instance.methods.safeTransferFrom(owner, BankInstance._address, tokenId).send({ from: owner, gas })
    console.log({safeTransferResponse})

    this.updateTokenCount()
  }

  updateTokenCount = async () => {
    const { BankInstance, accounts } = this.state
    const owner = accounts[0]
    const bankBalance = await this.getNftBalanceOf(BankInstance._address)
    const ownerBalance = await this.getNftBalanceOf(owner)
    console.log({bankBalance, ownerBalance})
    this.setState({bankBalance, ownerBalance})
  }

  getIsAdminLocked = async () => {
    const { BankInstance, tokenId, web3, ERC721ContractAddress } = this.state
    if(!web3.utils.isAddress(ERC721ContractAddress)) {
      alert('Invalid address '+ ERC721ContractAddress)
      return
    }

    const isAdminLocked = await BankInstance.methods.isAdminLocked(ERC721ContractAddress, tokenId).cal()
    console.log({isAdminLocked})
    this.setState({ isAdminLocked })
  }
  
  getIsOwnerLocked = async () => {
    const { BankInstance, tokenId, web3, ERC721ContractAddress } = this.state
    if(!web3.utils.isAddress(ERC721ContractAddress)) {
      alert('Invalid address '+ ERC721ContractAddress)
      return
    }

    const getIsOwnerLocked = await BankInstance.methods.getIsOwnerLocked(ERC721ContractAddress, tokenId).cal()
    console.log({getIsOwnerLocked})
    this.setState({ getIsOwnerLocked })
  }

  lockUnlock = async (contractMethod) => {
    const { accounts, tokenId, web3, ERC721ContractAddress } = this.state
    if(!web3.utils.isAddress(ERC721ContractAddress)) {
      alert('Invalid address '+ ERC721ContractAddress)
      return
    }

    const owner = accounts[0]
    const lockUnlockResponse = await contractMethod(ERC721ContractAddress, tokenId).send({ from: owner, gas })
    console.log({lockUnlockResponse})
  }

  ownerLock = async () => {
    const { BankInstance } = this.state
    this.lockUnlock(BankInstance.methods.ownerLock)
  }

  ownerUnlock = async () => {
    const { BankInstance } = this.state
    this.lockUnlock(BankInstance.methods.ownerUnlock)
  }

  adminLock = async () => {
    const { BankInstance } = this.state
    this.lockUnlock(BankInstance.methods.adminLock)
  }

  adminUnlock = async () => {
    const { BankInstance } = this.state
    this.lockUnlock(BankInstance.methods.adminUnlock)
  }

  adminCollateralize = async (to) => {
    const { accounts, BankInstance, tokenId, web3, ERC721ContractAddress } = this.state
    if(!web3.utils.isAddress(ERC721ContractAddress)) {
      alert('Invalid address '+ ERC721ContractAddress)
      return
    }

    const owner = accounts[0]
    const adminCollateralizeResponse = await BankInstance.methods.adminCollateralize(ERC721ContractAddress, to,  tokenId, '0x0a').send({ from: owner, gas })
    console.log({adminCollateralizeResponse})
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }

    const AccountCardProps = {
      title: 'Personal Wallet',
      address: this.state.accounts[0],
      balance: this.state.ownerBalance
    }
    const NFTCardProps = {
      title: 'Dummy NFT(ERC721) Contract',
      address: this.state.NFTInstance._address,
      actions: [
        {
          value: 'Mint token',
          onClick: this.mintToken
        }
      ]
    }
    const bankCardProps = {
      title: 'Bank Contract',
      address: this.state.BankInstance._address,
      balance: this.state.bankBalance,
      actions: [
        {
          value: 'Deposit',
          onClick: this.deposit
        },
        {
          value: 'Withdraw',
          onClick: this.withdraw
        }
      ]
    }
    return (
      <div className="App">
        <h2>MVP Banking</h2>
        <p>
          Try changing the Token ID {this.state.tokenId} (number) and click mint, see Personal balance +1.
        </p>
        <p>
          Keep the same Token ID {this.state.tokenId} and click Deposit to deposit this NFT token on Bank contract.
        </p>
        <p>
          Last, click Withdraw to transfer NFT token {this.state.tokenId} from Bank contract to Personal wallet
        </p>
        <p>
          Editable field ERC721 Contract Address for third party contracts
        </p>
        <TextField
          id="filled-full-width"
          label="Token ID"
          style={{ margin: 8 }}
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          variant="filled"
          onChange={this.handleTokenIdInput}
          value={this.state.tokenId}
        />
        <TextField
          id="filled-full-width"
          label="ERC721 Contract Address"
          style={{ margin: 8 }}
          margin="normal"
          InputLabelProps={{
            shrink: true,
          }}
          variant="filled"
          onChange={this.handleERC721ContractAddress}
          value={this.state.ERC721ContractAddress}
        />
        <Grid container justify="center" spacing={2}>
          <Grid item>
            <Card {...AccountCardProps}/>
          </Grid>
          <Grid item>
            <Card {...NFTCardProps}/>
          </Grid>
          <Grid item>
            <Card {...bankCardProps}/>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default App;
