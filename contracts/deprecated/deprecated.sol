// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "hardhat/console.sol";

// 废弃合约
contract deprecated {
    // @uploadedCID: 是一个 string类型，默认为 storage 类型, public 默认生成一个get方法，比如getuploadedCID()   
    string public uploadedCID;  
    
    // TODO: 修改下面的变量名 encryptedAESKEY, 定义一个结构体存储CT‘和对应的CID
    // data owner 使用自己的private key 进行ECC加密之后的结果
    // CT' owner 专属
    string public uploadedAESKey;
    string public uploadedAESIV;
    
    // @cid: 是一个 string类型，声明为 calldata，意味着在函数中不能被修改
    // public 可以被外部调用
    function setCID(string calldata cid) public {
        uploadedCID = cid;
        console.log("this message come from CIDStorageContract contract: uploadedCID: ", uploadedCID);
    }

    // @aesKey: 是一个 string类型，声明为 calldata
    function setAESKey(string calldata aesKey) public {
        uploadedAESKey = aesKey;
        console.log("this message come from CIDStorageContract contract: uploadedAESKey: ", uploadedAESKey);
    }

    // @aesIV: 是一个 string类型，声明为 calldata
    function setAESIV(string calldata aesIV) public {
        uploadedAESIV = aesIV;
        console.log("this message come from CIDStorageContract contract: uploadedAESIV: ", uploadedAESIV);
    }

    //TODO: 增加一个接口，让其他合约可以根据 owner addr 和 CID获取到对应的CT'
    // owner 根据自己的公钥地址addr 和 CID 获取到CT‘ (这个功能由CIDStorageContract合约提供)



}

