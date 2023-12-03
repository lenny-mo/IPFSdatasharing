const {
    generate_key_pair,
    generate_private_key,
    generate_public_key,
    generate_address,
    encryptAndUploadFile,
    decryptFile,
    capsule_hex_from_bytes,
    capsule_hex_to_bytes,
    generateReKey,
    re_key_hex_to_bytes,
    rekey_to_sc_ec,
    split_re_key,
} = require('./encrypt.js')

const PRE = require('recrypt-js');     
const Proxy = require('recrypt-js').Proxy;


const ethers = require('ethers');

const { downloadFile } = require('./web3storageAPI.js');

const key_pair = generate_key_pair();
const private_key = generate_private_key(key_pair);
const public_key = generate_public_key(key_pair);

// 生成新的key pair
const key_pair2 = generate_key_pair();
const private_key2 = generate_private_key(key_pair2);
const public_key2 = generate_public_key(key_pair2);

var capsule = null;

inputFilePath = '../file4upload/test1';
outputFilePath = '../file4upload/test1.enc';
decryptedFilePath = '../file4upload/test1.dec';



// 测试加密函数
// 测试sc_size 和 ge_size
async function testEncryptFile() {
    // 
    try {
        // 加密文件
        // capsule = await encryptFile(inputFilePath, outputFilePath, public_key);
        const [cid, capsule] = await encryptAndUploadFile(inputFilePath, outputFilePath, public_key);

        const capsule_bytes = capsule_hex_to_bytes(capsule);

        // 把capsule的字节序列切分成E，V，S 字节数组
        const E = capsule_bytes.slice(0, 65);   // E的长度为65
        
        console.log('E:', E);
        const [x, y] = byteArray2Point(E); 

        console.log('x:', x);
        console.log('y:', y);
        
    } catch (err) {
        console.error('Failed to encrypt file:', err);
    }
}

// testEncryptFile();

function testre_key() {
    const text = 'hello world';
    // 加密text
    const encrypted = PRE.encryptData(public_key, text);
    // 生成re_key
    const re_key = generateReKey(private_key, public_key2);
    // 重加密
    PRE.reEncryption(re_key, encrypted);
    // 解密
    const decrypted = PRE.decryptData(private_key2, encrypted);
    console.log('decrypted:', decrypted);
}

testre_key();
console.log('testEncryptFile success');