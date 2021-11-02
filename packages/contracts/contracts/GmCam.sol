// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./utils/TrustedForwarderRecipient.sol";

contract GmCam is ERC721, Ownable, TrustedForwarderRecipient {
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
    event GMCreated(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 expiresAt
    );
    event GMCompleted(uint256 indexed gm1TokenId, uint256 indexed gm2TokenId);

    // * STORAGE * //
    uint256 private _tokenIdCounter;
    mapping(uint256 => TokenData) public gmData;
    mapping(address => uint256) public filmBalances;
    bool private _canAirdrop;

    // * CONSTRUCTOR * //
    constructor(address trustedForwarderAddress_)
        ERC721("GMPhotos", "GM")
        TrustedForwarderRecipient(trustedForwarderAddress_)
    {
        address msgSender = _msgSender();
        // for (uint256 i = 1; i <= 100; i++) {
        //     gmData[i].originalOwner = msgSender;
        //     gmData[i].expiresAt = block.timestamp + (100 * 365 days);
        //     filmBalances[msgSender] += 1;
        //     emit FilmCreated(gmData[i].originalOwner, i, gmData[i].expiresAt);
        // }
        _tokenIdCounter = 1;
        _canAirdrop = true;
    }

    function stopAirdrops() public onlyOwner {
        _canAirdrop = false;
    }

    function airdropTo(address addr) public onlyOwner {
        require(_canAirdrop, "Cannot airdrop");
        gmData[i].originalOwner = addr;
        gmData[i].expiresAt = block.timestamp + (100 * 365 days);
        filmBalances[addr] += 1;
        _tokenIdCounter += 1;
        emit FilmCreated(gmData[i].originalOwner, i, gmData[i].expiresAt);
    }

    // * PUBLIC GM FUNCTIONS * //
    function sendGM(
        uint256 gmTokenId,
        address to,
        string calldata ipfsHash
    ) public {
        address msgSender = _msgSender();
        require(!_exists(gmTokenId), "token already minted");
        require(
            gmData[gmTokenId].originalOwner == msgSender,
            "you do not own this film"
        );
        require(
            gmData[gmTokenId].isCompleted != true,
            "this film is completed"
        );
        require(bytes(ipfsHash).length > 0, "ipfsHash cant be blank");
        require(to != msgSender, "cant send to yourself");
        require(
            gmData[gmTokenId].expiresAt > block.timestamp,
            "this film is expired"
        );

        gmData[gmTokenId].ipfsHash = ipfsHash;
        gmData[gmTokenId].expiresAt = block.timestamp + 1 days;
        gmData[gmTokenId].originalOwner = msgSender;
        filmBalances[msgSender] -= 1;

        _safeMint(to, gmTokenId);
        emit GMCreated(gmTokenId, msgSender, to, gmData[gmTokenId].expiresAt);
    }

    function sendGMBack(uint256 senderGmTokenId, string calldata ipfsHash)
        public
    {
        address msgSender = _msgSender();
        require(_exists(senderGmTokenId), "gm does not exist");
        require(
            ownerOf(senderGmTokenId) == msgSender,
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
        address player2 = msgSender;

        _tokenIdCounter++;
        _safeMint(player1, _tokenIdCounter);

        gmData[_tokenIdCounter].ipfsHash = ipfsHash;
        gmData[_tokenIdCounter].originalOwner = msgSender;
        gmData[_tokenIdCounter].partnerTokenId = senderGmTokenId;
        gmData[_tokenIdCounter].isCompleted = true;

        gmData[senderGmTokenId].partnerTokenId = _tokenIdCounter;
        gmData[senderGmTokenId].isCompleted = true;
        emit GMCompleted(senderGmTokenId, _tokenIdCounter);

        // send 2 gms to each player
        for (uint256 i = 0; i < 2; i++) {
            _tokenIdCounter++;
            gmData[_tokenIdCounter].originalOwner = player1;
            gmData[_tokenIdCounter].expiresAt = block.timestamp + 1 days;
            filmBalances[player1] += 1;
            emit FilmCreated(
                player1,
                _tokenIdCounter,
                gmData[_tokenIdCounter].expiresAt
            );
            _tokenIdCounter++;
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

    // * Overrides for Context / Trusted Forwarder * //
    function _msgSender()
        internal
        view
        override(Context, TrustedForwarderRecipient)
        returns (address)
    {
        return super._msgSender();
    }

    function _msgData()
        internal
        view
        override(Context, TrustedForwarderRecipient)
        returns (bytes memory ret)
    {
        return super._msgData();
    }
}
