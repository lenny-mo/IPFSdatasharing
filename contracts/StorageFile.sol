// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "hardhat/console.sol";

// StorageFile 存储用户上传的加密文件
// 存储形式为两层mapping，如下图所示:
// 
// key: owner addr1 0x1234567890
// | 
// | ---------------> key: CID1
// |                     | ---------------> CT'{aesKey, aesIV}
// | ---------------> key: CID2
// |                     | ---------------> CT'{aesKey, aesIV}
// | ---------------> key: CID3
// |                     | ---------------> CT'{aesKey, aesIV}
//
// key: owner addr2 0x8901234567
// |
// | ---------------> key: CID21
// |                     | ---------------> CT'{aesKey, aesIV}
// | ---------------> key: CID22
// |                     | ---------------> CT'{aesKey, aesIV}
contract StorageFile {
    
    address public ownerAddr;                   // 本合约owener 地址

    // CipherText_Owner == CT‘, 存储owner 使用自己的private key 加密之后的结果
    struct CipherText_Owner {
        string  uploadedAESKey;
        string  uploadedAESIV;
    }
    
    // CID_CipherText 内部存储了一个mapping结构，根据CID可以找到对应的CT'
    struct CID_CipherText {
        // 声明一个CID和CT'的映射
        mapping(string => CipherText_Owner) files;

    }

    // owner addr -> CID -> CT'
    // owner的地址对应一个mapping 结构，根据CID 可以找到 CipherText
    // 使用教程：
    // 假设owner addr = 0x1234567890, CID = "QmZCQ9Z1Z2Z3Z4Z5Z6Z7Z8Z9Z"
    // owners[0x1234567890].files["QmZCQ9Z1Z2Z3Z4Z5Z6Z7Z8Z9Z"].uploadedAESKey
    mapping(address => CID_CipherText) owners;

    

    // getCipherText 根据给定的 owner 地址和 CID，查找对应的 ciphertext
    function getCipherText(
        address owner, 
        string calldata CID) 
        public view returns (string memory, string memory) {
        // 根据给定的 owner 地址和 CID，查找对应的 ciphertext
        CipherText_Owner memory cipherText = owners[owner].files[CID];
        
        // 返回查找到的 ciphertext 数据
        return (cipherText.uploadedAESKey, cipherText.uploadedAESIV);
    }


    // setCipherText 根据给定的 owner 地址和 CID，存储对应的 ciphertext
    function setCipherText(
        address owner, 
        string memory CID, 
        string memory uploadedAESKey, 
        string memory uploadedAESIV
    ) public {
        // 创建一个 CipherText_Owner 结构体实例
        CipherText_Owner memory cipherText;
        cipherText.uploadedAESKey = uploadedAESKey;
        cipherText.uploadedAESIV = uploadedAESIV;

        // 将新创建的 CipherText_Owner 结构体实例存储在对应的 mapping 中
        owners[owner].files[CID] = cipherText;
    }
}