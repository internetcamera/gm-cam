// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./utils/TrustedForwarderRecipient.sol";

contract GmCam is ERC721, Ownable, TrustedForwarderRecipient {
    // * MODELS * //
    struct TokenData {
        address originalOwner;
        uint256 expiresAt;
        uint256 partnerTokenId;
        string ipfsHash;
        bool isCompleted;
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
    event GMBurned(uint256 indexed tokenId);

    // * STORAGE * //
    uint256 private _tokenIdCounter;
    mapping(uint256 => TokenData) public gmData;
    mapping(address => uint256) public filmBalances;
    mapping(address => bool) private _unsubscribed;
    bool private _canAirdrop;

    // * CONSTRUCTOR * //
    constructor(address trustedForwarderAddress_)
        ERC721("GMPhotos", "GM")
        TrustedForwarderRecipient(trustedForwarderAddress_)
    {
        _tokenIdCounter = 0;
        _canAirdrop = true;
    }

    function stopAirdrops() public onlyOwner {
        _canAirdrop = false;
    }

    function airdrop(address[] calldata addrs) public onlyOwner {
        require(_canAirdrop, "Airdropping has been stopped");

        for (uint256 i = 0; i < addrs.length; i++) {
            _tokenIdCounter++;
            address addr = addrs[i];
            gmData[_tokenIdCounter].originalOwner = addr;
            gmData[_tokenIdCounter].expiresAt =
                block.timestamp +
                (100 * 365 days);
            filmBalances[addr] += 1;
            emit FilmCreated(
                gmData[_tokenIdCounter].originalOwner,
                _tokenIdCounter,
                gmData[_tokenIdCounter].expiresAt
            );
        }
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
        require(_unsubscribed[to] != true, "recipient has unsubscribed");

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
        require(
            _unsubscribed[gmData[senderGmTokenId].originalOwner] != true,
            "recipient has unsubscribed"
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

    function setSubscriptionState(bool subscribed) public {
        _unsubscribed[_msgSender()] = subscribed;
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

    function burnExpired(uint256[] calldata tokenIds) public onlyOwner {
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            if (
                gmData[tokenId].expiresAt <= block.timestamp &&
                gmData[tokenId].isCompleted != true
            ) {
                gmData[tokenId].originalOwner = address(0);
                if (_exists(tokenId)) _burn(tokenId);
                emit GMBurned(tokenId);
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
