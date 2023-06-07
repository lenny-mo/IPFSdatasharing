const crypto = require('crypto');
const eccrypto = require('eccrypto');
const fs = require('fs');
const { UploadFile2IPFS } = require('./upload.js');


// owner public key
// const Owner_public_key = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

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

// 生成ECC的公钥和私钥
// FIXME: 这里的私钥应该是owner的私钥，而不是随机生成的私钥
const ECprivateKey = eccrypto.generatePrivate();
const ECpublicKey = eccrypto.getPublic(ECprivateKey);

function getECPublicKey() {
    return ECpublicKey; 
}

// getEncryptedAESKey 获取加密后的AES密钥的base64编码
function getEncryptedAESKey() {
    // 使用
    const encryptedAesKey =  eccrypto.encrypt(getECPublicKey(), getAESKey());
    return encryptedAesKey.toString('base64')
}

// getEncryptedInitVector 获取加密后的AES initVector的base64编码
function getEncryptedInitVector() {
    const encryptedAesIV =  eccrypto.encrypt(getECPublicKey(), getInitVector());
    return encryptedAesIV.toString('base64')
}

// ------------------------------------- 以下是加密和上传文件的函数 ------------------------------------- //

// encryptFile 加密文件
// @inputFilePath 输入文件路径
// @outputFilePath 输出文件路径
// @key AES密钥
function encryptFile(inputFilePath, outputFilePath, key) {
    return new Promise((resolve, reject) => {
        // 创建输入和输出流
        const inputStream = fs.createReadStream(inputFilePath);
        const outputStream = fs.createWriteStream(outputFilePath);

        // 创建加密器
        const cipher = crypto.createCipheriv('aes-256-ctr', key, getInitVector());

        // 写入初始向量到输出流
        outputStream.write(getInitVector());

        // 管道连接输入和输出流，并通过加密器进行加密
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
        const encryptedFilePath = await encryptFile(inputFilePath, outputFilePath, getAESKey());
        const cid = await UploadFile2IPFS(encryptedFilePath);
        console.log('加密并上传文件完成');
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
};