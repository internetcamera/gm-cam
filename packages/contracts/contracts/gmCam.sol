// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GMCam is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    uint256 private _tokenIdCounter;
    
    // TODO: handle intermediary owners (player3/different wallet situation)
    
    struct TokenData {
        address originalOwner;
        uint256 expiresAt;
        // uint256 partnerTokenId; // player1 <-> player2
        string pendingPhotoIpfsHash;
        string completedPhotoIpfsHash;
        bool isCompleted; // tokenUri will be conditional on this
    }
    
    mapping(uint256 => TokenData) public gmData;

    constructor() ERC721("GMPhotos", "GM") {
        for (uint256 i = 1; i <= 100; i++) {
            _mint(msg.sender, i);
            gmData[i].expiresAt = block.timestamp + (100 * 365 days);
        }
        _tokenIdCounter = 100;
    }   

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function sendGM(
        uint256 gmTokenId, 
        address to, 
        string calldata pendingPhotoIpfsHash, 
        string calldata completedPhotoIpfsHash
    ) public {
        require(_exists(gmTokenId), "film does not exist");
        require(ownerOf(gmTokenId) == msg.sender, "you do not own this film");
        
        // check expiriation
        require(gmData[gmTokenId].expiresAt > block.timestamp, 
            "this film is expired"
        );
        
        require(gmData[gmTokenId].isCompleted != true, "this film is completed");
        //TODO: require(gmData[gmTokenId].pendingPhotoIpfsHash.length() == 0, "film already contains a photo");
        
        gmData[gmTokenId].pendingPhotoIpfsHash = pendingPhotoIpfsHash;
        gmData[gmTokenId].completedPhotoIpfsHash = completedPhotoIpfsHash;
        gmData[gmTokenId].expiresAt = block.timestamp + 1 days;
        gmData[gmTokenId].originalOwner = msg.sender;
        
        safeTransferFrom(
            ownerOf(gmTokenId),
            to,
            gmTokenId,
            ""
        );
    }
    
    function sendGMBack(
        uint256 senderGmTokenId, 
        string calldata replyIpfsHash
    ) public {
        require(_exists(senderGmTokenId), "film does not exist");
        require(gmData[senderGmTokenId].isCompleted != true, "this film is completed");
        require(gmData[senderGmTokenId].expiresAt > block.timestamp, 
            "this film is expired"
        );
        
        address player1 = gmData[senderGmTokenId].originalOwner;
        address player2 = msg.sender;
        
        _tokenIdCounter++;
        _safeMint(gmData[senderGmTokenId].originalOwner, _tokenIdCounter);
        gmData[_tokenIdCounter].completedPhotoIpfsHash = replyIpfsHash;
        gmData[_tokenIdCounter].isCompleted = true;
        
        gmData[senderGmTokenId].isCompleted = true;
        
        // send 5 gms to each player
        for (uint256 i = 0; i < 5; i++) {
            _tokenIdCounter++;
            _safeMint(player1, _tokenIdCounter);
            
            gmData[_tokenIdCounter].expiresAt = block.timestamp + 1 days;
        }
        
        for (uint256 i = 0; i < 5; i++) {
            _tokenIdCounter++;
            _safeMint(player2, _tokenIdCounter);
            
            gmData[_tokenIdCounter].expiresAt = block.timestamp + 1 days;
        }
    }
}