const crypto = require('crypto');
const eccrypto = require('eccrypto');
const fs = require('fs');
const { UploadFile2IPFS } = require('./upload.js');
const ethUtil = require('ethereumjs-util');

// ------------------------------------- 以下是生成AESkey ------------------------------------- //

// AES key 生成 32 字节的密钥
const AES_key = crypto.randomBytes(32); 

// initVector 加密操作中被使用，以确保相同的明文在加密后产生不同的密文
const AES_initVector = crypto.randomBytes(16); 

function getAESKey() {
    return AES_key;
}

function getInitVector() {
    return AES_initVector;
}

// ------------------------------------- 以下是生成用户地址 ------------------------------------- //

// 生成一对公钥和私钥, 这里的公钥暂时不用于非对称加密
const OwnerPrivateKey = crypto.randomBytes(32);
const OwnerPublicKey = ethUtil.privateToPublic(OwnerPrivateKey);

// 生成一个以太坊兼容的地址作为Owner address
const OwnerAddress = ethUtil.publicToAddress(OwnerPublicKey, true);

function getOwnerAddr() {
    return ethUtil.bufferToHex(OwnerAddress);
}

// getECPublicKey 暂时理解为owner 的公钥地址
function getPublicKey() {
    return OwnerPublicKey.toString('hex'); 
}


// ------------------------------------- 以下是非对称加密AESkey ------------------------------------- //


// eccrypto生成一对公钥和私钥, 用于非对称加密AES密钥和initVector, 同时，在代理重加密的时候，也会用到
const ECprivateKey = eccrypto.generatePrivate();
const ECpublicKey = eccrypto.getPublic(ECprivateKey);

function getECpublicKey() {
    return ECpublicKey;
}

// getEncryptedAESKey 获取加密后的AES密钥的16进制编码
async function getEncryptedAESKey() {
    const result = await eccrypto.encrypt(getECpublicKey(), getAESKey());
    return JSON.stringify(result);
}

// getEncryptedInitVector 获取加密后的AES initVector的16进制编码
async function getEncryptedInitVector() {
    const result =  await eccrypto.encrypt(getECpublicKey(), getInitVector());
    return JSON.stringify(result);
}

// ------------------------------------- 以下是加密和上传文件的函数 ------------------------------------- //

// encryptFile 加密文件
// @inputFilePath 输入文件路径
// @outputFilePath 输出文件路径
// @key AES密钥
function encryptFile(inputFilePath, outputFilePath, key, initVector) {
    return new Promise((resolve, reject) => {
        // 创建输入和输出流
        const inputStream = fs.createReadStream(inputFilePath);
        const outputStream = fs.createWriteStream(outputFilePath);

        // 创建加密器
        const cipher = crypto.createCipheriv('aes-256-ctr', key, initVector);

        // 写入初始向量到输出流
        outputStream.write(getInitVector());

        // 管道连接输入和输出流，并通过加密器进行加密 明文 16byte -> 密文 16byte
        inputStream.pipe(cipher).pipe(outputStream);

        outputStream.on('finish', () => {
        console.log('文件加密完成');
        resolve(outputFilePath);
        });

    });
}

// encryptAndUploadFile 加密并上传文件
async function encryptAndUploadFile(inputFilePath, outputFilePath) {
    
    try {
        const encryptedFilePath = await encryptFile(inputFilePath, outputFilePath, getAESKey(), getInitVector());
        const cid = await UploadFile2IPFS(encryptedFilePath);
        console.log('加密并上传文件完成, CID: ', cid);
        return cid;
    } catch (error) {
        console.error('加密并上传文件失败', error);
        throw error;
    }
}


// 导出模块 
module.exports = {
    encryptAndUploadFile,
    getEncryptedAESKey,
    getEncryptedInitVector,
    getOwnerAddr,
};