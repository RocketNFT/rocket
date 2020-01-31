pragma solidity ^0.5.10;

interface IERC721 {
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata _data
    ) external;
}
