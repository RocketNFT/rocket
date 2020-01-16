pragma solidity ^0.5.12;

import "./erc165.sol";

interface IERC721  {
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata _data) external;
}

contract Escrow is ERC165 {

    constructor()public {
        _registerInterface(_ERC721_RECEIVED);
        _owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == _owner);
        _;
    }
    
    bytes4 private constant _ERC721_RECEIVED = 0x150b7a02;
    
    address public _owner;


    // Owner approving locking token as collateral 
    mapping(address => mapping(uint256 => bool)) public isOwnerlocked;

    // admin locking token as collateral 
    mapping(address => mapping(uint256 => bool)) public isAdminlocked;

    // smart contract where the NFT is stored, and who deposited it
    mapping(address => mapping(uint256 => address)) public _tokenOwner;

    function isAdminLocked(address contractAddress, uint256 tokenId) public view returns (bool) {
        return isAdminlocked[contractAddress][tokenId];
    }

    function isOwnerLocked(address contractAddress, uint256 tokenId) public view returns (bool) {
        return isOwnerlocked[contractAddress][tokenId];
    }

    function ownerLock(address contractAddress, uint256 tokenId) public returns (bool) {
        require(msg.sender == ownerOf(contractAddress, tokenId), 'not owner');
        require(isOwnerLocked(contractAddress, tokenId) == false, 'isOwnerLocked');
        isOwnerlocked[contractAddress][tokenId] = true;
    }

    /**
    * @dev Allows the owner to unlock their token if the administrator has not locked it
     */
    function ownerUnlock(address contractAddress, uint256 tokenId) public {
        require(msg.sender == ownerOf(contractAddress, tokenId), 'not owner');
        require(isOwnerLocked(contractAddress, tokenId) == true, 'isOwnerLocked');
        require(isAdminLocked(contractAddress, tokenId) == false, 'isAdminLocked');
        
        isOwnerlocked[contractAddress][tokenId] = false;
    }

    function adminLock(address contractAddress, uint256 tokenId) public onlyOwner {
        require(isOwnerLocked(contractAddress, tokenId) == true, 'isOwnerLocked');

        isAdminlocked[contractAddress][tokenId] = true;
    }

    /**
    * @dev Allows the admin to unlock their token if the administrator has locked it
     */
    function adminUnlock(address contractAddress, uint256 tokenId) public onlyOwner {
        require(isOwnerLocked(contractAddress, tokenId) == true, 'isOwnerLocked');
        require(isAdminLocked(contractAddress, tokenId) == true, 'isAdminLocked');
        
        isAdminlocked[contractAddress][tokenId] = false;
    }




    /**
     * @dev Gets the owner of the specified token ID at specified smart contract address.
     * @param tokenId uint256 ID of the token to query the owner of
     * @param contractAddress address of the smart contract to query the owner of given token
     * @return address currently marked as the owner of the given token ID
     */
    function ownerOf(address contractAddress, uint256 tokenId) public view returns (address) {
        address owner = _tokenOwner[contractAddress][tokenId];
        require(owner != address(0), "ERC721: owner query for nonexistent token");

        return owner;
    }

    mapping(address => mapping(uint256 => address)) public escrowExpiration;


    /**
    * @dev When someone sends us a token record it so that we have an internal record of who owns what
     */
    function onERC721Received(
        address operator, 
        address from, 
        uint256 tokenId, 
        bytes calldata data
        ) external returns (bytes4) {
        _tokenOwner[msg.sender][tokenId] = from;
        return _ERC721_RECEIVED;
    }
}

contract bank is ERC165, Escrow {

event Transfer(
    address indexed _from,
    address indexed _to,
    uint256 indexed _tokenId
  );


    // which can be also obtained as `IERC721Receiver(0).onERC721Received.selector`
    bytes4 private constant _ERC721_RECEIVED = 0x150b7a02;

    /*
     *     bytes4(keccak256('balanceOf(address)')) == 0x70a08231
     *     bytes4(keccak256('ownerOf(uint256)')) == 0x6352211e
     *     bytes4(keccak256('approve(address,uint256)')) == 0x095ea7b3
     *     bytes4(keccak256('getApproved(uint256)')) == 0x081812fc
     *     bytes4(keccak256('setApprovalForAll(address,bool)')) == 0xa22cb465
     *     bytes4(keccak256('isApprovedForAll(address,address)')) == 0xe985e9c5
     *     bytes4(keccak256('transferFrom(address,address,uint256)')) == 0x23b872dd
     *     bytes4(keccak256('safeTransferFrom(address,address,uint256)')) == 0x42842e0e
     *     bytes4(keccak256('safeTransferFrom(address,address,uint256,bytes)')) == 0xb88d4fde
     *
     *     => 0x70a08231 ^ 0x6352211e ^ 0x095ea7b3 ^ 0x081812fc ^
     *        0xa22cb465 ^ 0xe985e9c ^ 0x23b872dd ^ 0x42842e0e ^ 0xb88d4fde == 0x80ac58cd
     */
    bytes4 private constant _INTERFACE_ID_ERC721 = 0x80ac58cd;

    constructor () public {
        // register the supported interfaces to conform to ERC721 via ERC165
        _registerInterface(_INTERFACE_ID_ERC721);
    }

    /**
     * @dev Safely transfers the ownership of a given token ID to another address
     * If the target address is a contract, it must implement {IERC721Receiver-onERC721Received},
     * which is called upon a safe transfer, and return the magic value
     * `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`; otherwise,
     * the transfer is reverted.
     * Requires the _msgSender() to be the owner, approved, or operator
     * @param from current owner of the token
     * @param to address to receive the ownership of the given token ID
     * @param tokenId uint256 ID of the token to be transferred
     * @param _data bytes data to send along with a safe transfer check
     */
    function safeTransferFrom(address smartContract, address from, address to, uint256 tokenId, bytes memory _data) public {
        require(msg.sender == ownerOf(smartContract, tokenId), 'must be owner');
        require(isAdminLocked(smartContract, tokenId) == false, 'administrator lock');
        require(isOwnerLocked(smartContract, tokenId) == false, 'owner lock');
        
        _safeTransferFrom(smartContract, from, to, tokenId, _data);
    }

     function adminCollateralize(address smartContract, address to, uint256 tokenId, bytes memory _data) public onlyOwner {
        require(isAdminLocked(smartContract, tokenId) == true, 'administrator lock');
        require(isOwnerLocked(smartContract, tokenId) == true, 'owner lock');
        
        _safeTransferFrom(smartContract, ownerOf(smartContract, tokenId), to, tokenId, _data);
    }

    /**
     * @dev Safely transfers the ownership of a given token ID to another address
     * If the target address is a contract, it must implement `onERC721Received`,
     * which is called upon a safe transfer, and return the magic value
     * `bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"))`; otherwise,
     * the transfer is reverted.
     * Requires the msg.sender to be the owner, approved, or operator
     * @param from current owner of the token
     * @param to address to receive the ownership of the given token ID
     * @param tokenId uint256 ID of the token to be transferred
     * @param _data bytes data to send along with a safe transfer check
     */
    function _safeTransferFrom(address smartContract,address from, address to, uint256 tokenId, bytes memory _data) internal {
        _transferFrom(smartContract,from, to, tokenId);
        require(_checkOnERC721Received(from, to, tokenId, _data), "ERC721: transfer to non ERC721Receiver implementer");
    }

    /**
     * @dev Returns whether the specified token exists.
     * @param tokenId uint256 ID of the token to query the existence of
     * @return bool whether the token exists
     */
    function _exists(uint256 tokenId, address smartContract) internal view returns (bool) {
        address owner = _tokenOwner[smartContract][tokenId];
        return owner != address(0);
    }

    /**
     * @dev Returns whether the given spender can transfer a given token ID.
     * @param tokenId uint256 ID of the token to be transferred
     * @return bool whether the msg.sender is approved for the given token ID,
     * is an operator of the owner, or is the owner of the token
     */
    function _isApprovedOrOwner(address smartContract, uint256 tokenId) internal view returns (bool) {
        require(_exists(tokenId, smartContract), "ERC721: operator query for nonexistent token");
        address owner = ownerOf(smartContract, tokenId);
        return msg.sender == ownerOf(smartContract, tokenId);
    }
    
 
    /**
     * @dev Internal function to transfer ownership of a given token ID to another address.
     * As opposed to {transferFrom}, this imposes no restrictions on msg.sender.
     * @param from current owner of the token
     * @param to address to receive the ownership of the given token ID
     * @param tokenId uint256 ID of the token to be transferred
     */
    function _transferFrom(address smartContract, address from, address to, uint256 tokenId) internal {
        require(ownerOf(smartContract, tokenId) == from, "ERC721: transfer of token that is not own");
        require(to != address(0), "ERC721: transfer to the zero address");

        IERC721(smartContract).safeTransferFrom(address(this), to, tokenId, '');
       _tokenOwner[smartContract][tokenId] = address(0);
        emit Transfer(from, to, tokenId);
    }
    
    function isContract(address account) internal view returns (bool) {
        // This method relies in extcodesize, which returns 0 for contracts in
        // construction, since the code is only stored at the end of the
        // constructor execution.

        // According to EIP-1052, 0x0 is the value returned for not-yet created accounts
        // and 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470 is returned
        // for accounts without code, i.e. `keccak256('')`
        bytes32 codehash;
        bytes32 accountHash = 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470;
        // solhint-disable-next-line no-inline-assembly
        assembly { codehash := extcodehash(account) }
        return (codehash != 0x0 && codehash != accountHash);
    }

    /**
     * @dev Internal function to invoke {IERC721Receiver-onERC721Received} on a target address.
     * The call is not executed if the target address is not a contract.
     *
     * This is an internal detail of the `ERC721` contract and its use is deprecated.
     * @param from address representing the previous owner of the given token ID
     * @param to target address that will receive the tokens
     * @param tokenId uint256 ID of the token to be transferred
     * @param _data bytes optional data to send along with the call
     * @return bool whether the call correctly returned the expected magic value
     */
    function _checkOnERC721Received(address from, address to, uint256 tokenId, bytes memory _data)
        internal returns (bool)
    {
        if (!isContract(to)) {
            return true;
        }

        bytes4 retval = Escrow(to).onERC721Received(msg.sender, from, tokenId, _data);
        return (retval == _ERC721_RECEIVED);
    }

}