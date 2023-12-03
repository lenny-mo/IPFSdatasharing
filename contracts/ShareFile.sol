// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./StoreCIDandCapsule.sol";
import "./EllipticCurve.sol";

// 存储requester获取到的加密文件以及对应的CT''
// 存储形式为两层mapping，如下图所示:
// 
// key: requeter addr1 0x1234567890
// | 
// | ---------------> key: CID1
// |                     | ---------------> CT'' new capsule
// | ---------------> key: CID2
// |                     | ---------------> CT'' new capsule
// | ---------------> key: CID3
// |                     | ---------------> CT'' new capsule
// 
// key: requeter addr2 0x8901234567
// |
// | ---------------> key: CID21
// |                     | ---------------> CT'' new capsule
// | ---------------> key: CID22
// |                     | ---------------> CT'' new capsule
contract ShareFile {

    address public ownerAddr;                               // 本合约owener 地址
    StoreCIDandCapsule public StoreCIDandCapsuleInstance;   // CIDStorageContract 合约实例
    
    // ----------------------- 构造函数 -----------------------
    constructor(address _CIDStorageContractAddr) {
        StoreCIDandCapsuleInstance = StoreCIDandCapsule(_CIDStorageContractAddr);
    }


    // ---------------------- 结构体声明 ----------------------

    // CT'' data requester对CT‘重加密之后的结果
    struct Capsule {
        uint256 Ex;   
        uint256 Ey;
        uint256 Vx;
        uint256 Vy;   
        uint256 internal_public_key_x;
        uint256 internal_public_key_y;
        bool isReEncrypted;
        string S; 
    }

    // mapping requester addr -> CID -> CT''
    mapping(address => mapping(string => Capsule)) requesters;

    // ---------------------- secp256k1 常量声明 ----------------------
    
    uint256 public constant AA = 0; 
    uint256 public constant BB = 7;
    uint256 public constant PP = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEFFFFFC2F;

    // ---------------------- 对外的接口函数 ----------------------

    // getCapsuleFromOwner 根据给定的 owner 地址，和CID，获取对应的 capsule的E，V，S
    function getCapsuleFromOwner (
        address owner,
        string memory CID
    ) public view returns (uint256, uint256, uint256, uint256, string memory) {
        return StoreCIDandCapsuleInstance.getCipherText(owner, CID);
    }

    // 根据capsule和re_key, 计算出新的capsule
    function setCapsule(
        address owner,
        address requester,
        string memory CID,
        uint256 rekey_scalar,       // big number
        uint256 rekey_ecpoint_x,    // x big number
        uint256 rekey_ecpoint_y     // y big number
        ) public {

        // 1. 从StoreCIDandCapsule合约中获取owner对应的E, V, S 变量
        (uint256 Ex, uint256 Ey, uint256 Vx, uint256 Vy, string memory S) = getCapsuleFromOwner(owner, CID);
        
        // 2. 把新的E 和 V点，以及原来的S, internal_public_key, 以及true, 重新组合成新的capsule
        Capsule memory newCapsule = calculateNewCapsule(Ex, Ey, Vx, Vy, S, rekey_scalar, rekey_ecpoint_x, rekey_ecpoint_y);

        // 3. 根据requester地址和CID，存储这个新的capsule
        requesters[requester][CID] = newCapsule;
    }


    // getCipherText 根据给定的 owner 地址和 CID，查找重加密之后的 capsule
    function getCapsule(
        address requester, 
        string memory CID) 
        public view returns (uint256, uint256, uint256, uint256, uint256, uint256, string memory, bool) {
            Capsule memory ct = requesters[requester][CID];
            return (ct.Ex, ct.Ey, ct.Vx, ct.Vy, ct.internal_public_key_x, ct.internal_public_key_y, ct.S, ct.isReEncrypted);
    }
    
    // -------------------------- 内部函数 --------------------------

    // calculateNewCapsuleAndReKey 根据capsule和re_key, 计算出新的capsule
    function calculateNewCapsule(
        uint256 Ex,  
        uint256 Ey,
        uint256 Vx,
        uint256 Vy, 
        string memory S_str,
        uint256 rekey_scalar,       // big number
        uint256 rekey_ecpoint_x,    // x big number
        uint256 rekey_ecpoint_y     // y big number
        ) internal pure returns (Capsule memory) {        

        // 3. 根据re_key_bn，计算出新的E和V
        (uint256 E_new_x, uint256 E_new_y) = pointMul(Ex, Ey, rekey_scalar);
        (uint256 V_new_x, uint256 V_new_y) = pointMul(Vx, Vy, rekey_scalar);

        Capsule memory newCapsule = createNewCapsule(E_new_x, E_new_y, V_new_x, V_new_y, S_str, rekey_ecpoint_x, rekey_ecpoint_y);

        return newCapsule;
    }


    function createNewCapsule(
        uint256 E_new_x,   
        uint256 E_new_y,
        uint256 V_new_x,
        uint256 V_new_y, 
        string memory S_not_new,
        uint256 internal_public_key_x,
        uint256 internal_public_key_y
    ) internal pure returns (Capsule memory) {
        Capsule memory newCapsule;
        newCapsule.Ex = E_new_x;
        newCapsule.Ey = E_new_y;
        newCapsule.Vx = V_new_x;
        newCapsule.Vy = V_new_y;
        newCapsule.internal_public_key_x = internal_public_key_x;
        newCapsule.internal_public_key_y = internal_public_key_y;
        newCapsule.isReEncrypted = true;
        newCapsule.S = S_not_new;

        return newCapsule;
    }


    // pointMul 根据给定的椭圆曲线上的点，和一个大数，计算出新的点, 返回的是新的点的bytes
    function pointMul(uint256 x, uint256 y, uint256 bn) internal pure returns (uint256, uint256) {
        (uint256 x_new, uint256 y_new) = EllipticCurve.ecMul(bn, x, y, AA, PP);
        return (x_new, y_new);
    }
}