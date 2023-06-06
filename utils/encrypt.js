const crypto = require('crypto');
const fs = require('fs');
const { UploadFile2IPFS } = require('./upload.js');


// owner public key
const owner_public_key = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// TODO: 下面的aes key 需要使用ECC进行加密，形成CT'，然后存储到智能合约中
// AES key 生成 32 字节的密钥
const AES_key = crypto.randomBytes(32); 

// initVector 加密操作中被使用，以确保相同的明文在加密后产生不同的密文
const initVector = crypto.randomBytes(16); 

function getAESKey() {
    return AES_key;
}

function getOwnerPublicKey() {
    return owner_public_key;
}

function getInitVector() {
    return initVector;
}

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
        const cipher = crypto.createCipheriv('aes-256-ctr', key, initVector);

        // 写入初始向量到输出流
        outputStream.write(initVector);

        // 管道连接输入和输出流，并通过加密器进行加密
        inputStream.pipe(cipher).pipe(outputStream);

        outputStream.on('finish', () => {
        console.log('文件加密完成');
        resolve(outputFilePath);
        });

    });
}

// encryptAndUploadFile 加密并上传文件
async function encryptAndUploadFile(inputFilePath, outputFilePath, key) {
    try {
        const encryptedFilePath = await encryptFile(inputFilePath, outputFilePath, key);
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
    getAESKey,
    getInitVector,
  };