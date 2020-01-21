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
    ERC721ContractAddress: null,
    isAdminLocked: false,
    isOwnerLocked: false,
    isBankAdmin: false,
    isERC721Owner: false
  }

  deployedNetworkIds = (id) => {
    if(ROPSTEN === id) {
      return {
        bankAddress: '0xDC8f79324b4f40c5c93A0D6969FFd204C0650C11',
        nftAddress: '0xfeca45c514F52e43d0171b4a755EDB5f2E6AF445'
      }
    } else {
      return {
        bankAddress: BankContract.networks[id].address,
        nftAddress: NFTContract.networks[id].address
      }
    }
  }

  /**
   * Instanciate new contracts like Dummy NFT & BANK
   */
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

      const bankAdminAddress = await BankInstance.methods._owner().call()
      const isBankAdmin = bankAdminAddress === accounts[0]

      let nftOwnerAddress = ''
      try {
        nftOwnerAddress = await BankInstance.methods.ownerOf(nftAddress, this.state.tokenId).call()
      } catch (error) {
        console.log({error})
      }
      const isERC721Owner = nftOwnerAddress === accounts[0]

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      const newState = { web3, accounts, BankInstance, NFTInstance, ERC721ContractAddress: nftAddress, bankAdminAddress, isBankAdmin, isERC721Owner }
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

  getERC721Owner = async () => {
    const { web3, BankInstance, ERC721ContractAddress, tokenId } = this.state
    if(!web3.utils.isAddress(ERC721ContractAddress)) {
      alert('Invalid address '+ ERC721ContractAddress)
      return
    }

    let result = null;
    try {
      result = await BankInstance.methods.ownerOf(ERC721ContractAddress, tokenId).call()
      console.log({ownerAddress: result, tokenId})
    } catch (error) {
      console.log(error)
    }
    return result
  }

  /**
   * dynamically fetch how many NFTs current wallet account has
   */
  getERC721BalanceOf = async (address) => {
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
    this.setState({ tokenId: Number(event.target.value)}, () => {
      this.updateNFTBankStatus()
    })
  }

  handleERC721ContractAddress = (event) => {
    this.setState({ ERC721ContractAddress: event.target.value})
  }

  /**
   * Example for minting a token for deposit it later in bank
   */
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
    this.updateNFTBankStatus()
  }

  /**
   * Withdraw NFT token from bank contract
   */
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

    this.updateNFTBankStatus()
  }

  /**
   * Bank deposit NFT token from provided contract address
   */
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

    this.updateNFTBankStatus()
  }

  /**
   * Update UI balance number
   */
  updateTokenCount = async () => {
    const { BankInstance, accounts } = this.state
    const owner = accounts[0]
    const bankBalance = await this.getERC721BalanceOf(BankInstance._address)
    const ownerBalance = await this.getERC721BalanceOf(owner)
    console.log({bankBalance, ownerBalance})
    this.setState({bankBalance, ownerBalance})
  }

  /**
   * SC Bank - check if admin locked
   */
  getIsAdminLocked = async () => {
    const { BankInstance, tokenId, web3, ERC721ContractAddress } = this.state
    if(!web3.utils.isAddress(ERC721ContractAddress)) {
      alert('Invalid address '+ ERC721ContractAddress)
      return
    }
    
    const isAdminLocked = await BankInstance.methods.isAdminLocked(ERC721ContractAddress, tokenId).call()
    console.log({isAdminLocked, tokenId})
    return isAdminLocked
  }
  
  /**
   * SC Bank - check if owneer locked
   */
  getIsOwnerLocked = async () => {
    const { BankInstance, tokenId, web3, ERC721ContractAddress } = this.state
    if(!web3.utils.isAddress(ERC721ContractAddress)) {
      alert('Invalid address '+ ERC721ContractAddress)
      return
    }

    const isOwnerLocked = await BankInstance.methods.isOwnerLocked(ERC721ContractAddress, tokenId).call()
    console.log({isOwnerLocked, tokenId})
    return isOwnerLocked
  }
  
  updateNFTBankStatus = async () => {
    this.updateTokenCount()
    const isAdminLocked = await this.getIsAdminLocked()
    const isOwnerLocked = await this.getIsOwnerLocked()
    const erc721Owner = await this.getERC721Owner()
    const isERC721Owner = erc721Owner === this.state.accounts[0]
    
    this.setState({ isAdminLocked, isOwnerLocked, isERC721Owner })
  }

  /**
   * Refactored function to call a Bank method. only works for lock & unlock features
   */
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

  /**
   * New owner lock token feature
   * - owner locks
   * - later admin locks
   */
  ownerLock = async () => {
    const { BankInstance } = this.state
    await this.lockUnlock(BankInstance.methods.ownerLock)
    this.updateNFTBankStatus()
  }

  ownerUnlock = async () => {
    const { BankInstance } = this.state
    await this.lockUnlock(BankInstance.methods.ownerUnlock)
    this.updateNFTBankStatus()
  }

  /**
   * New admin lock token feature
   * - owner locks
   * - later admin locks
   */
  adminLock = async () => {
    const { BankInstance } = this.state
    await this.lockUnlock(BankInstance.methods.adminLock)
    this.updateNFTBankStatus()
  }

  adminUnlock = async () => {
    const { BankInstance } = this.state
    await this.lockUnlock(BankInstance.methods.adminUnlock)
    this.updateNFTBankStatus()
  }

  /**
   * With this SC bank admin can withdraw NFTs in case of defaulting
   */
  adminCollateralize = async (to) => {
    const { accounts, BankInstance, tokenId, web3, ERC721ContractAddress } = this.state
    if(!web3.utils.isAddress(ERC721ContractAddress)) {
      alert('Invalid address '+ ERC721ContractAddress)
      return
    }

    const owner = accounts[0]
    const adminCollateralizeResponse = await BankInstance.methods.adminCollateralize(ERC721ContractAddress, to,  tokenId, '0x0a').send({ from: owner, gas })
    console.log({adminCollateralizeResponse})
    this.updateNFTBankStatus()
  }

  render() {
    const { web3, tokenId, isAdminLocked, isOwnerLocked, bankAdminAddress, isBankAdmin, isERC721Owner } = this.state
    if (!web3) {
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

    const BankCardProps = {
      title: 'Rocket Contract',
      address: this.state.BankInstance._address,
      balance: this.state.bankBalance,
      erc721Status: { isAdminLocked, isOwnerLocked },
      actions: [
        {
          value: 'Deposit',
          onClick: this.deposit
        },
        {
          value: 'Withdraw',
          onClick: this.withdraw
        },
        isERC721Owner ? {
          value: isOwnerLocked ? `Cancel loan process Id: ${tokenId}` : `Start a loan process Id: ${tokenId}`,
          disclaimer: isOwnerLocked ? '' : 'by clicking this button, you agree to lock your NFT(s)',
          onClick: isOwnerLocked ? this.ownerUnlock : this.ownerLock
        } : null
      ].filter(Boolean)
    }

    const AdminCardProps = {
      title: 'Rocket Admin',
      address: bankAdminAddress,
      actions: [
        {
          value: isAdminLocked ? `Admin Unlock Id: ${tokenId}` : `Admin lock Id: ${tokenId}`,
          onClick: isAdminLocked ? this.adminUnlock : this.adminLock
        }
      ]
    }

    return (
      <div className="App">
        <h2>MVP Rocket</h2>
        <p>
          Try changing the Token ID {this.state.tokenId} (number) and click mint, see Personal balance +1.
        </p>
        <p>
          Keep the same Token ID {this.state.tokenId} and click Deposit to deposit this NFT token on Rocket contract.
        </p>
        <p>
          Last, click Withdraw to transfer NFT token {this.state.tokenId} from Rocket contract to Personal wallet
        </p>
        <p>
          Editable field ERC721 Contract Address for third party contracts
        </p>
        <p>
          After deposit, start a loan process with NFT token on Rocket contract, then admin will lock your token
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
            <Card {...BankCardProps}/>
          </Grid>
          {
            isBankAdmin ? 
            <Grid item>
              <Card {...AdminCardProps}/>
            </Grid>
            : null
          }
        </Grid>
      </div>
    );
  }
}

export default App;
