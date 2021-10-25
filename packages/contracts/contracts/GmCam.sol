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
    event FilmCreated(
        address indexed player,
        uint256 indexed tokenId,
        uint256 expiresAt
    );

    // * STORAGE * //
    uint256 private _tokenIdCounter;
    mapping(uint256 => TokenData) public gmData;
    mapping(address => uint256) public filmBalances;

    // * CONSTRUCTOR * //
    constructor() ERC721("GMPhotos", "GM") {
        for (uint256 i = 1; i <= 100; i++) {
            gmData[i].originalOwner = msg.sender;
            gmData[i].expiresAt = block.timestamp + (100 * 365 days);
            filmBalances[msg.sender] += 1;
            emit FilmCreated(gmData[i].originalOwner, i, gmData[i].expiresAt);
        }
        _tokenIdCounter = 100;
    }

    // * PUBLIC GM FUNCTIONS * //
    function sendGM(
        uint256 gmTokenId,
        address to,
        string calldata ipfsHash
    ) public {
        require(!_exists(gmTokenId), "token already minted");
        require(
            gmData[gmTokenId].originalOwner == msg.sender,
            "you do not own this film"
        );
        require(
            gmData[gmTokenId].isCompleted != true,
            "this film is completed"
        );
        require(bytes(ipfsHash).length > 0, "ipfsHash cant be blank");
        require(to != msg.sender, "cant send to yourself");
        require(
            gmData[gmTokenId].expiresAt > block.timestamp,
            "this film is expired"
        );

        gmData[gmTokenId].ipfsHash = ipfsHash;
        gmData[gmTokenId].expiresAt = block.timestamp + 1 days;
        gmData[gmTokenId].originalOwner = msg.sender;
        filmBalances[msg.sender] -= 1;

        // safeTransferFrom(ownerOf(gmTokenId), to, gmTokenId, "");
        _safeMint(to, gmTokenId);
    }

    function sendGMBack(uint256 senderGmTokenId, string calldata ipfsHash)
        public
    {
        require(_exists(senderGmTokenId), "gm does not exist");
        require(
            ownerOf(senderGmTokenId) == msg.sender,
            "you do not own this gm"
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
            // _safeMint(player1, _tokenIdCounter);
            gmData[_tokenIdCounter].originalOwner = player1;
            gmData[_tokenIdCounter].expiresAt = block.timestamp + 1 days;
            filmBalances[player1] += 1;
            emit FilmCreated(
                player1,
                _tokenIdCounter,
                gmData[_tokenIdCounter].expiresAt
            );
            _tokenIdCounter++;
            // _safeMint(player2, _tokenIdCounter);
            gmData[_tokenIdCounter].originalOwner = player2;
            gmData[_tokenIdCounter].expiresAt = block.timestamp + 1 days;
            filmBalances[player2] += 1;
            emit FilmCreated(
                player2,
                _tokenIdCounter,
                gmData[_tokenIdCounter].expiresAt
            );
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

    function burnExpired(uint256[] calldata tokenIds) public onlyOwner {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            if (
                gmData[tokenId].expiresAt <= block.timestamp &&
                gmData[tokenId].isCompleted != true
            ) {
                gmData[tokenId].originalOwner = address(0);
                if (_exists(tokenId)) _burn(tokenId);
            }
        }
    }
}
