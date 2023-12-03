const { expect } = require("chai");


const {
    generate_key_pair,
    generate_private_key,
    generate_public_key,
    generate_address,
    encryptAndUploadFile,
    decryptFile,
    split_capsule,
    combine_capsule,
    generateReKey,
    capsule_hex_from_bytes,
    capsule_hex_to_bytes,
    re_key_hex_to_bytes,
    rekey_to_sc_ec,
    split_PubKey_to_BN,
    bigNumber_to_hex_string,
    constructPublicKey,
    split_re_key,
    combine_capsule_PRE,
} = require('../utils/encrypt.js')

const { downloadFile } = require('../utils/web3storageAPI.js');

const PRE = require('recrypt-js');     
const Proxy = require('recrypt-js').Proxy;

// Test group: "Check CID" can hold multiple tests related to the CIDStorageContract
describe("File Shareing Test", function() {

    // 没有代理重加密的情况下，测试加密解密
    // it("Encrypt and Decrypt File without PRE", async function() {

    //     // StorageFile合约的部署, 默认会在contracts目录下寻找Solidity合约文件
    //     const StorageCIDandCapsule = await ethers.getContractFactory("StoreCIDandCapsule");
    //     const store_cid_capsule = await StorageCIDandCapsule.deploy();

    //     inputFilePath = '../file4upload/test1';  // 明文文件路径
    //     outputFilePath = '../file4upload/test1.enc'; // 密文文件路径
    //     downloadPath = '../file4upload/downloadFromIPFS.enc';   // 从IPFS下载加密文件
    //     decryptedFilePath = '../file4upload/decrypt_by_owner.dec'; // 解密后的文件路径

    //     // 生成owner的公私钥对
    //     const owner_key_pair = generate_key_pair();
    //     const owner_private_key = generate_private_key(owner_key_pair);
    //     const owner_public_key = generate_public_key(owner_key_pair);

    //     // 生成owner的地址
    //     const owner_address = generate_address(owner_public_key);
        
    //     // 加密文件并且上传到IPFS，获取CID和对称密钥的capsule, 16进制字符串, capsule的长度为324
    //     const [cid, capsule] = await encryptAndUploadFile(inputFilePath, outputFilePath, owner_public_key);

    //     // 把capsule 16进制字符串分解成E, V, S, 格式是16进制字符串, length 130, 130, 64
    //     const [E_x, E_y, V_x, V_y, S_hex_string] = split_capsule(capsule);

    //     // 存储CID和E, V, S到智能合约
    //     await store_cid_capsule.setCipherText(owner_address, cid, E_x, E_y, V_x, V_y, S_hex_string);

    //     // 从智能合约获取Ex, Ey, Vx, Vy, S, 其中x, y坐标是大数形式，S是16进制字符串
    //     const [Ex, Ey, Vx, Vy, S] = await store_cid_capsule.getCipherText(owner_address, cid);

    //     // 把Ex, Ey, Vx, Vy, S 合并成capsule, 16进制字符串
    //     const capsule_hex_string = combine_capsule(Ex, Ey, Vx, Vy, S);
        
    //     await downloadFile(cid, downloadPath);

    //     // 解密文件
    //     await decryptFile(decryptedFilePath, downloadPath, capsule_hex_string, owner_private_key);

    // });

    // 有代理重加密的情况下，测试加密解密
    it("Encrypt and Decrypt File with PRE", async function() {
        // StorageFile合约的部署, 默认会在contracts目录下寻找Solidity合约文件
        const StorageCIDandCapsule = await ethers.getContractFactory("StoreCIDandCapsule");
        const store_cid_capsule = await StorageCIDandCapsule.deploy();

        const ShareFile = await ethers.getContractFactory("ShareFile");
        const share_file = await ShareFile.deploy(store_cid_capsule.address);   // 传入StorageCIDandCapsule合约的地址

        inputFilePath = '../file4upload/file1.txt';  // 明文文件路径
        outputFilePath = '../file4upload/test2.enc'; // 密文文件路径
        downloadPath = '../file4upload/downloadFromIPFS.enc';   // 从IPFS下载加密文件
        decryptedFilePath = '../file4upload/decrypt_by_requester.dec'; // 解密后的文件路径
        console.log("inputFilePath: ", inputFilePath);
    
        // 生成owner的公私钥对
        const owner_key_pair = generate_key_pair();
        const owner_private_key = generate_private_key(owner_key_pair);
        const owner_public_key = generate_public_key(owner_key_pair);

        // 生成owner的地址
        const owner_address = generate_address(owner_public_key);

        // 生成requester的公私钥对
        const requester_key_pair = generate_key_pair();
        const requester_private_key = generate_private_key(requester_key_pair);
        const requester_public_key = generate_public_key(requester_key_pair);

        // 生成requester的地址
        const requester_address = generate_address(requester_public_key);

        // owner加密文件并且上传到IPFS，获取CID和对称密钥的capsule, 此处的capsule是16进制的字符串
        const [cid, capsule] = await encryptAndUploadFile(inputFilePath, outputFilePath, owner_public_key);

        // 把capsule 16进制字符串分解成E, V, S, 格式是16进制字符串, length 130, 130, 64
        const [E_x, E_y, V_x, V_y, S_hex_string] = split_capsule(capsule);

        // 存储CID和E, V, S到智能合约
        // 存储CID和 capsule到智能合约所需要的gas
        const tx1 = await store_cid_capsule.setCipherText(owner_address, cid, E_x, E_y, V_x, V_y, S_hex_string);
        const receipt1 = await tx1.wait();
        const gasUsed1 = receipt1.gasUsed;
        console.log(`Store CID and capsule Gas Used: ${gasUsed1.toString()}`);

        // ------------------- 代理重加密 -------------------
        // rquester 发送数据共享请求给owner, owner同意
        // 生成re_key
        const re_key = generateReKey(owner_private_key, requester_public_key);

        // 把re_key切分成3个bigNumber: scalar, x, y
        const [scalar, x, y] = split_re_key(re_key);

        // 把re_key信息传递给智能合约
        // 计算新的capsule并且存储到智能合约的gas
        const tx2 = await share_file.setCapsule(owner_address, requester_address, cid, scalar, x, y);
        const receipt2 = await tx2.wait();
        const gasUsed2 = receipt2.gasUsed;
        console.log(`Calculate and Store new capsule Used: ${gasUsed2.toString()}`);

        // requester从智能合约获取capsule信息，只读操作不消耗gas
        const [Ex_, Ey_, Vx_, Vy_, XGx_, XGy_, S_, isReEncrypted] = await share_file.getCapsule(requester_address, cid);

        // 把Ex_, Ey_, Vx_, Vy_, XGx_, XGy_, S_, isReEncrypted合并成capsule, 16进制字符串
        const capsule_hex_string_ = combine_capsule_PRE(Ex_, Ey_, Vx_, Vy_, S_, XGx_, XGy_);

        await downloadFile(cid, downloadPath);
        
        // 解密文件
        await decryptFile(decryptedFilePath, downloadPath, capsule_hex_string_, requester_private_key);
    
    });
});