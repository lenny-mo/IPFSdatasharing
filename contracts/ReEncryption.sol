// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// 存储代理重加密之后的结果
contract DataShare {

    address public ownerAddr;                   // 本合约owener 地址
    address public CIDStorageContractAddr;      // CIDStorageContract 合约地址
    
    // 构造函数，初始化合约owner 和 CIDStorageContractAddr
    // 后续我们需要使用CIDStorageContractAddr来调用CIDStorageContract合约中的函数
    constructor(address _CIDStorageContractAddr) {
        ownerAddr = msg.sender;
        CIDStorageContractAddr = _CIDStorageContractAddr;
    }

    // 自定义一个结构体，用于存储和CT''相关的信息，包括data owner的地址、加密文件CID
    struct ReEncryptionResult {
        address dataOwner;      // 记录数据拥有者的地址
        string fileCID; 
        string reEncryptedAESKey;
        string reEncryptedAESIV;
    }

    // 每一个data requester addr 对应一个动态数组；
    // 动态数组的元素是ReEncryptionResult结构体
    mapping(address => ReEncryptionResult[]) private dataRequester;

    
    // TODO: 在这个函数中传入代理重加密的函数体，作为source发送给oracle 智能合约
    // @sourceCode: 我们要求chainlink 进行计算的逻辑代码, 目前支持使用js代码进行编写, 通过这个参数传入代码
    // @args: 传入需要代理重加密的CT' and R_key
    function executeRequest(string calldata sourceCode, string[] calldata args) public {
    }

    //TODO: 回填代理重加密之后的结果
    function fulfillRequest() public {
        
    }
    
    
}