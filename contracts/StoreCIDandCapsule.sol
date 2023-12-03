// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "hardhat/console.sol";

// StorageFile 存储用户上传的加密文件
// 存储形式为两层mapping，如下图所示:
// 
// key: owner addr1 0x1234567890
// | 
// | ---------------> key: CID1
// |                     | ---------------> CT' capsule
// | ---------------> key: CID2
// |                     | ---------------> CT' capsule
// | ---------------> key: CID3
// |                     | ---------------> CT' capsule
//
// key: owner addr2 0x8901234567
// |
// | ---------------> key: CID21
// |                     | ---------------> CT' capsule
// | ---------------> key: CID22
// |                     | ---------------> CT' capsule
contract StoreCIDandCapsule {
    
    address public ownerAddr;                   // 合约部署者 地址

    // CipherText_Owner == CT‘, 存储owner 的capsule信息
    struct Capsule {
        uint256 Ex;   
        uint256 Ey;
        uint256 Vx;
        uint256 Vy;   
        string S;   
    }

    // owner addr -> CID -> CT'
    mapping(address => mapping(string => Capsule)) owners;

    // getCipherText 根据给定的 owner 地址和 CID，查找对应的 capsule
    function getCipherText(
        address owner, 
        string calldata CID) 
        public view returns (uint256, uint256, uint256, uint256, string memory) {
        // 根据给定的 owner 地址和 CID，查找对应的 capsule
        Capsule memory ct = owners[owner][CID];

        return (ct.Ex, ct.Ey, ct.Vx, ct.Vy, ct.S);
    }

    // setCipherText 根据给定的 owner 地址和 CID，存储对应的 capsule
    function setCipherText(
        address owner, 
        string memory CID, 
        uint256 Ex_,
        uint256 Ey_,
        uint256 Vx_,
        uint256 Vy_,
        string memory S_
    ) public {
        Capsule memory ct;
        ct.Ex = Ex_;
        ct.Ey = Ey_;
        ct.Vx = Vx_;
        ct.Vy = Vy_;
        ct.S = S_;

        owners[owner][CID] = ct;
    }
}