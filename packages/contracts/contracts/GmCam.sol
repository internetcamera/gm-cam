// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GmCam is ERC721, Ownable {
    // * MODELS * //
    struct TokenData {
        address originalOwner; // this allows sendGMBack to send back to the original owner
        uint256 expiresAt;
        uint256 partnerTokenId; // player1 <-> player2
        string ipfsHash;
        bool isCompleted; // tokenUri will be conditional on this
    }

    // * STORAGE * //
    uint256 private _tokenIdCounter;
    mapping(uint256 => TokenData) public gmData;

    // * CONSTRUCTOR * //
    constructor() ERC721("GMPhotos", "GM") {
        for (uint256 i = 1; i <= 100; i++) {
            _mint(msg.sender, i);
            gmData[i].expiresAt = block.timestamp + (100 * 365 days);
        }
        _tokenIdCounter = 100;
    }

    // * PUBLIC GM FUNCTIONS * //
    function sendGM(
        uint256 gmTokenId,
        address to,
        string calldata ipfsHash
    ) public {
        require(_exists(gmTokenId), "film does not exist");
        require(ownerOf(gmTokenId) == msg.sender, "you do not own this film");
        require(
            gmData[gmTokenId].isCompleted != true,
            "this film is completed"
        );
        require(bytes(ipfsHash).length > 0, "ipfsHash cant be blank");
        require(
            bytes(gmData[gmTokenId].ipfsHash).length == 0,
            "film already has been used"
        );
        require(to != msg.sender, "cant send to yourself");
        require(
            gmData[gmTokenId].expiresAt > block.timestamp,
            "this film is expired"
        );

        gmData[gmTokenId].ipfsHash = ipfsHash;
        gmData[gmTokenId].expiresAt = block.timestamp + 1 days;
        gmData[gmTokenId].originalOwner = msg.sender;

        safeTransferFrom(ownerOf(gmTokenId), to, gmTokenId, "");
    }

    function sendGMBack(uint256 senderGmTokenId, string calldata ipfsHash)
        public
    {
        require(_exists(senderGmTokenId), "film does not exist");
        require(
            ownerOf(senderGmTokenId) == msg.sender,
            "you do not own this film"
        );
        require(
            gmData[senderGmTokenId].isCompleted != true,
            "this film is completed"
        );
        require(
            gmData[senderGmTokenId].expiresAt > block.timestamp,
            "this film is expired"
        );

        address player1 = gmData[senderGmTokenId].originalOwner;
        address player2 = msg.sender;

        _tokenIdCounter++;
        _safeMint(player1, _tokenIdCounter);

        gmData[_tokenIdCounter].ipfsHash = ipfsHash;
        gmData[_tokenIdCounter].originalOwner = msg.sender;
        gmData[_tokenIdCounter].partnerTokenId = senderGmTokenId;
        gmData[_tokenIdCounter].isCompleted = true;

        gmData[senderGmTokenId].partnerTokenId = _tokenIdCounter;
        gmData[senderGmTokenId].isCompleted = true;

        // send 5 gms to each player
        for (uint256 i = 0; i < 5; i++) {
            _tokenIdCounter++;
            _safeMint(player1, _tokenIdCounter);
            gmData[_tokenIdCounter].expiresAt = block.timestamp + 1 days;
            _tokenIdCounter++;
            _safeMint(player2, _tokenIdCounter);
            gmData[_tokenIdCounter].expiresAt = block.timestamp + 1 days;
        }
    }

    // * ERC721 OVERRIDES * //
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return string(abi.encodePacked("ipfs://", gmData[tokenId].ipfsHash));
    }

    // TODO?: override beforeTokenTransfer to update originalOwner ?

    function getTime() public view returns (uint256) {
        return block.timestamp;
    }

    function getBlockNumber() public view returns (uint256) {
        return block.number;
    }
}
