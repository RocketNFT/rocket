pragma solidity ^0.5.12;

contract RocketStorage {
    /* WARNING: NEVER RE-ORDER VARIABLES! Always double-check that new variables are added APPEND-ONLY. Re-ordering variables can permanently BREAK your deployed proxy contract.*/
    address public _owner;
    string public name;
    bool public initialized;
    /**
     * @dev Mapping of interface ids to whether or not it's supported.
     */
    mapping(bytes4 => bool) public _supportedInterfaces;

    // admin locking token as collateral
    mapping(address => mapping(uint256 => bool)) public isAdminlocked;

    // smart contract where the NFT is stored, and who deposited it
    mapping(address => mapping(uint256 => address)) public _tokenOwner;
}
