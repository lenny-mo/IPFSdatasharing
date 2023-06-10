// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "hardhat/console.sol";

contract CIDStorageContract {
    // @uploadedCID: 是一个 string类型，默认为 storage 类型, public 默认生成一个get方法，比如getuploadedCID()   
    string public uploadedCID;  
    // TODO: 修改下面的变量名 encryptedAESKEY 
    string public uploadedAESKey;
    string public uploadedAESIV;
    
    // TODO: 增加两个变量，用于存储代理重加密之后的AESkey 
    string public reEncryptedAESkey;


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

}

