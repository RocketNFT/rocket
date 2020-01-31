pragma solidity ^0.5.12;

import {ERC165} from "./ERC165.sol";
import {RocketStorage} from "./RocketStorage.sol";

contract Escrow is RocketStorage, ERC165 {
    constructor() public {
        _registerInterface(_ERC721_RECEIVED);
        _owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == _owner);
        _;
    }

    bytes4 private constant _ERC721_RECEIVED = 0x150b7a02;

    function isAdminLocked(address contractAddress, uint256 tokenId)
        public
        view
        returns (bool)
    {
        return isAdminlocked[contractAddress][tokenId];
    }

    function adminLock(address contractAddress, uint256 tokenId)
        public
        onlyOwner
    {
        isAdminlocked[contractAddress][tokenId] = true;
    }

    /**
  * @dev Allows the admin to unlock their token if the administrator has locked it
   */
    function adminUnlock(address contractAddress, uint256 tokenId)
        public
        onlyOwner
    {
        require(
            isAdminLocked(contractAddress, tokenId) == true,
            "isAdminLocked"
        );

        isAdminlocked[contractAddress][tokenId] = false;
    }

    /**
   * @dev Gets the owner of the specified token ID at specified smart contract address.
   * @param tokenId uint256 ID of the token to query the owner of
   * @param contractAddress address of the smart contract to query the owner of given token
   * @return address currently marked as the owner of the given token ID
   */
    function ownerOf(address contractAddress, uint256 tokenId)
        public
        view
        returns (address)
    {
        address owner = _tokenOwner[contractAddress][tokenId];
        require(
            owner != address(0),
            "ERC721: owner query for nonexistent token"
        );

        return owner;
    }

    /**
  * @dev When someone sends us a token record it so that we have an internal record of who owns what
   */
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4) {
        operator = operator;
        bytes memory data1 = data;
        _tokenOwner[msg.sender][tokenId] = from;
        return _ERC721_RECEIVED;
    }
}
