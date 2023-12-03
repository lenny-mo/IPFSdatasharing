const crypto = require('crypto');
const eccrypto = require('eccrypto');
const fs = require('fs');
const { UploadFile2IPFS } = require('./upload.js');
const ethUtil = require('ethereumjs-util');

const PRE = require('recrypt-js');     
const Proxy = require('recrypt-js').Proxy;

const ethers = require('ethers');

// ------------------------------------- 生成公私钥模块 ------------------------------------- //

/**
 * generate a key pair for requester
 *
 * @return {*} 
 */
function generate_key_pair () {
    return Proxy.generate_key_pair();
}

/**
 * generate a private key for requester
 *
 * @return {Object} key pair
 */
function generate_private_key (key_pair) {
    var private_key = Proxy.to_hex(key_pair.get_private_key().to_bytes());
    return private_key;
}   


/**
 * generate a public key for requester
 *
 * @param {*} key_pair
 * @return {Object} public key 
 */
function generate_public_key (key_pair) {
    var public_key = Proxy.to_hex(key_pair.get_public_key().to_bytes());
    return public_key;
}

// 根据公钥生成地址
function generate_address (public_key) {
    // 去掉前缀
    const trimmedPublicKey = public_key.slice(2);
    var addressBuffer = ethUtil.publicToAddress(Buffer.from(trimmedPublicKey, 'hex'));
    address = '0x' + addressBuffer.toString('hex');
    return address
}

// ------------------------------------- 加密解密模块 ------------------------------------- //

/**
 * encrypt file and write the ciphertext to the output file
 * 
 *
 * @param {*} inputFilePath 明文文件路径
 * @param {*} outputFilePath 密文文件路径
 * @param {*} publickey 加密所使用的公钥
 * @return {*} 加密文件所使用的对称密钥的capsule信息
 */
async function encryptFile(inputFilePath, outputFilePath, publickey) {
    return new Promise((resolve, reject) => {
        // 创建输入流
        const inputStream = fs.createReadStream(inputFilePath);

        // 使用 'utf8' 编码读取文件内容
        let fileData = '';
        inputStream.on('data', chunk => {
            fileData += chunk;
        });

        // 当文件读取完成后，使用对称密钥加密数据
        inputStream.on('end', () => {
            // 使用 AES 加密数据, obj {key, cipher}
            const obj = PRE.encryptData(publickey, fileData);
            const encryptedData = obj.cipher;

            // 使用 fs.writeFile 方法将加密后的数据（encryptedData）写入到指定的输出文件（outputFilePath）中
            fs.writeFile(outputFilePath, encryptedData, (err) => {
                // 这是 fs.writeFile 的回调函数，当 writeFile 方法完成后（无论成功还是失败），这个函数都会被调用
                if (err) {
                    // 如果出现错误，打印错误消息
                    console.log('Failed to write encrypted data to file');
                    // 并用这个错误作为参数调用 Promise 的 reject 函数，这将导致 Promise 被拒绝
                    reject(err);
                } else {
                    // 如果没有出现错误（即写入成功），打印成功的消息
                    console.log('encryptFile success');
                    // 当文件被成功写入后，使用 Promise 的 resolve 函数来处理 Promise
                    // 返回生成对称密钥的capsule信息
                    resolve(obj.key);
                }
            });
        });

        // 当文件读取失败时，使用 Promise 的 reject 函数来处理 Promise
        inputStream.on('error', (err) => {
            console.log('Failed to read input file, please check if the file exists', err);
            reject(err);
        });
    });
}


/**
 * 加密文件并上传到IPFS
 *
 * @param {*} inputFilePath
 * @param {*} outputFilePath
 * @param {*} publickey
 * @return {*} [cid, capsule] 存储在IPFS上的加密文件的CID, 加密文件使用的对称密钥的capsule信息
 */
async function encryptAndUploadFile(inputFilePath, outputFilePath, publickey) {

    try {
        // const capsule = await encryptFile(inputFilePath, outputFilePath, publickey);
        const capsule = await encryptFile(inputFilePath, outputFilePath, publickey);

        const cid = await UploadFile2IPFS(outputFilePath);
        console.log('加密并上传文件完成, CID: ', cid);
        return [cid, capsule];
    } catch (error) {
        console.error('加密并上传文件失败', error);
        throw error;
    }
}

/**
 * 解密文件，需要从IPFS上下载加密文件，然后从区块链上获取对称密钥的capsule
 * 
 * @param {*} outputFilePath 解密文件输出路径
 * @param {*} inputFilePath 需要把加密文件下载到本地
 * @param {*} capsule   对称密钥的capsule 16进制字符串
 * @param {*} privatekey
 */
async function decryptFile(outputFilePath, inputFilePath, capsule, privatekey) {
    // 从inputFilePath 读取加密文件 
    return new Promise((resolve, reject) => {
        // 创建输入流
        const inputStream = fs.createReadStream(inputFilePath);

        // 使用 'utf8' 编码读取文件内容
        let fileData = '';
        inputStream.on('data', chunk => {fileData += chunk;});

        // 如果读取文件成功
        inputStream.on('end', () => {
            console.log('读取文件成功，开始解密文件');
            
            const obj = {key: capsule, cipher: fileData};   // 把fileData和capsule组成obj {key, cipher}格式
            
            const decryptedData = PRE.decryptData(privatekey, obj);  // 使用PRE解密数据
            // 使用 fs.writeFile 方法将解密后的数据（decryptedData）写入到指定的输出文件（outputFilePath）中
            fs.writeFile(outputFilePath, decryptedData, (err) => {
                // 这是 fs.writeFile 的回调函数，当 writeFile 方法完成后（无论成功还是失败），这个函数都会被调用
                if (err) {
                    // 如果出现错误，打印错误消息
                    console.log('Failed to write decrypted data to file');
                    // 并用这个错误作为参数调用 Promise 的 reject 函数，这将导致 Promise 被拒绝
                    reject(err);
                } else {
                    // 如果没有出现错误（即写入成功），打印成功的消息
                    console.log('decryptFile success');
                    // 当文件被成功写入后，使用 Promise 的 resolve 函数来处理 Promise
                    resolve();
                }
            });
        });

        // 当文件读取失败时，使用 Promise 的 reject 函数来处理 Promise
        inputStream.on('error', (err) => {
            console.log('Failed to read input file, please check if the file exists', err);
            reject(err);
        });
    });
}

// 
/**
 * 把capsule的16进制字符串切分成E，V，S, 只适用于没经过重加密的capsule
 *
 * @param {*} capsule
 * @return {*} 
 */
function capsule_to_EVS_hex_string(capsule) {
    // capsule的字节序列, 长度为162
    const capsule_bytes = capsule_hex_to_bytes(capsule);

    // 把capsule的字节序列切分成E，V，S 字节数组
    const E = capsule_bytes.slice(0, 65);   // E的长度为65
    const V = capsule_bytes.slice(65, 130); // V的长度为65
    const S = capsule_bytes.slice(130, 162);    // S的长度为32
    const E_hex_string = Buffer.from(E).toString('hex');    // E 转换成16进制字符串, length 130
    const V_hex_string = Buffer.from(V).toString('hex');    // V 转换成16进制字符串
    const S_hex_string = Buffer.from(S).toString('hex');    // S 转换成16进制字符串, length 64

    return [E_hex_string, V_hex_string, S_hex_string];
}

// 将16进制字符串转化为可以在智能合约中被接收的 BigNumber
function hexStringToBigNumber(hexString) {
    if (!hexString.startsWith('0x')) {
        hexString = '0x' + hexString;
    }
    return ethers.BigNumber.from(hexString);
}

// 根据x和y坐标的16进制字符串构造公钥
function constructPublicKey(x, y) {
    return "04" + x + y;
}

// 将提供的公钥十六进制字符串切分为 x 和 y 坐标的bigNumber
function split_PubKey_to_BN(publicKeyHex) {
    // 切分字符串的起始索引是2，因为 "04" 是椭圆曲线公钥的前缀，表示公钥是未压缩的
    const startIndex = 2;

    // 我们知道未压缩的公钥由 04（2个十六进制字符）+ x（64个十六进制字符）+ y（64个十六进制字符）组成
    // 因此，我们可以通过字符长度将公钥切分为 x 和 y 坐标
    const xCoordHex = publicKeyHex.slice(startIndex, startIndex + 64);
    const yCoordHex = publicKeyHex.slice(startIndex + 64, startIndex + 128);

    const x_big_number = hexStringToBigNumber(xCoordHex);
    const y_big_number = hexStringToBigNumber(yCoordHex);

    return [x_big_number, y_big_number];
}

// 把bigNumber转化为16进制字符串
function bigNumber_to_hex_string(bigNumber) {
    let hexString = bigNumber.toHexString();
    
    // Remove the "0x" prefix if it exists
    if (hexString.startsWith("0x")) {
        hexString = hexString.slice(2);
    }

    return hexString;
}


/**
 * 把capsule的16进制字符串切分成 [E_x, E_y, V_x, V_y, S_hex_string]
 *
 * @param {*} capsule
 * @return {*} 
 */
function split_capsule(capsule) {
    // 把capsule 16进制字符串分解成E, V, S, 格式是16进制字符串, length 130, 130, 64
    const [E_hex_string, V_hex_string, S_hex_string] = capsule_to_EVS_hex_string(capsule);    // [E_hex_string, V_hex_string, S_hex_string]

    // 把E_hex_string, V_hex_string 分别切分成x, y坐标，而且是大数形式
    const [E_x, E_y] = split_PubKey_to_BN(E_hex_string);
    const [V_x, V_y] = split_PubKey_to_BN(V_hex_string);
    
    return [E_x, E_y, V_x, V_y, S_hex_string];
}


/**
 * 把Ex, Ey, Vx, Vy, S_hex_string合并成一个capsule的16进制字符串, 长度为324
 * 没有经过重加密的capsule
 *
 * @param {*} Ex
 * @param {*} Ey
 * @param {*} Vx
 * @param {*} Vy
 * @param {*} S_hex_string
 * @return {*} 
 */
function combine_capsule(Ex, Ey, Vx, Vy, S) {
    // 把Ex, Ey, Vx, Vy转换成16进制字符串
    const Ex_hex_string = bigNumber_to_hex_string(Ex);
    const Ey_hex_string = bigNumber_to_hex_string(Ey);
    const Vx_hex_string = bigNumber_to_hex_string(Vx);
    const Vy_hex_string = bigNumber_to_hex_string(Vy);

    // 把Ex, Ey 拼接成一个椭圆曲线公钥
    const E_16_string = constructPublicKey(Ex_hex_string, Ey_hex_string);
    const V_16_string = constructPublicKey(Vx_hex_string, Vy_hex_string);

    // 把E_16_string, V_16_string, S 拼接成capsule_hex_string, 16进制字符串, length 324
    const capsule_hex_string = E_16_string + V_16_string + S;

    return capsule_hex_string;
}

/**
 * 把Ex, Ey, Vx, Vy, S XGx, XGy 合并成一个capsule的16进制字符串, 长度为454
 * 经过重加密的capsule
 *
 * @param {*} Ex
 * @param {*} Ey
 * @param {*} Vx
 * @param {*} Vy
 * @param {*} S
 * @param {*} XGx
 * @param {*} XGy
 * @return {*} 
 */
function combine_capsule_PRE(Ex, Ey, Vx, Vy, S, XGx, XGy) {
    // 把Ex, Ey, Vx, Vy, XGx, XGy转换成16进制字符串
    const Ex_hex_string = bigNumber_to_hex_string(Ex);
    const Ey_hex_string = bigNumber_to_hex_string(Ey);
    const Vx_hex_string = bigNumber_to_hex_string(Vx);
    const Vy_hex_string = bigNumber_to_hex_string(Vy);
    const XGx_hex_string = bigNumber_to_hex_string(XGx);
    const XGy_hex_string = bigNumber_to_hex_string(XGy);

    // 把Ex, Ey 拼接成一个椭圆曲线公钥
    const E_16_string = constructPublicKey(Ex_hex_string, Ey_hex_string);
    const V_16_string = constructPublicKey(Vx_hex_string, Vy_hex_string);
    const XG_16_string = constructPublicKey(XGx_hex_string, XGy_hex_string);

    // 把E_16_string, V_16_string, XG_16_string, S 拼接成capsule_hex_string, 16进制字符串, length 454
    const capsule_hex_string = E_16_string + V_16_string + S + XG_16_string;

    return capsule_hex_string;
}

// ------------------------------------- 重加密模块 ------------------------------------- //


/**
 * 返回Re_key的两个部分，re_key和internal_public_key
 *
 * @param {*} privatekey 
 * @param {*} publickey 
 * @return {*} get_re_key() 是big number, get_internal_public_key() 是EC point
 */
function generateReKey (privatekey, publickey) {
    // 生成16进制字符串的re_key
    let re_key = PRE.generateReEncrytionKey(privatekey, publickey);
    return re_key;
}


/**
 * 把16进制字符串的re_key切分成scalar和ecpoint的x, y坐标
 *
 * @param {*} re_key
 * @return {*} [bigNumber, bigNumber, bigNumber]
 */
function split_re_key(re_key) {
    // 把16进制字符串的re_key切分成scalar和ecpoint
    const part1 = re_key.slice(0, 64);
    const part2 = re_key.slice(64);

    const part1_bn = hexStringToBigNumber(part1);
    const [x, y] = split_PubKey_to_BN(part2);

    return [part1_bn, x, y];
}


// 16进制字符串的re_key转化为bytes
function re_key_hex_to_bytes(re_key) {
    return Proxy.from_hex(re_key);
}

// 把re_key的16进制字符串切分成scalar和ecpoint 类型都是byte数组
function rekey_to_sc_ec(re_key) {
    // 把re_key 16进制字符串转换成re_key_bytes, length 32 + 65
    const re_key_bytes = re_key_hex_to_bytes(re_key);
    
    // 把re_key 切分成 scalar 和 ecpoint
    const re_key_scalar = re_key_bytes.slice(0, 32);    
    const re_key_ecpoint = re_key_bytes.slice(32, 32 + 65);

    return [re_key_scalar, re_key_ecpoint];
}

/**
 * 去掉capsule的前两位，返回capsule的16进制字符串
 *
 * @param {*} bytes
 * @return {*} 
 */
function capsule_hex_from_bytes(bytes) {
    return Proxy.to_hex(bytes);
}

/**
 * 根据capsule的16进制字符串生成capsule的bytes信息
 *
 * @param {*} capsule
 * @return {*} 
 */
function capsule_hex_to_bytes(capsule) {

    let capsule_bytes =  Proxy.from_hex(capsule);
    return capsule_bytes;
}

// 接受一个长度为454的16进制字符串，并将其切分为长度为130，130，64，130的四个部分
function splitHexString(hexString) {
    if (hexString.length !== 454) {
        throw new Error('Input hex string must be of length 454.');
    }

    const part1 = hexString.slice(0, 130);
    const part2 = hexString.slice(130, 260);
    const part3 = hexString.slice(260, 324);
    const part4 = hexString.slice(324, 454);

    return [part1, part2, part3, part4];
}

// ------------------------------------- 导出模块 ------------------------------------- //

module.exports = {
    generate_key_pair,
    generate_private_key,
    generate_public_key,
    generate_address,
    encryptAndUploadFile,
    decryptFile,
    generateReKey,
    capsule_hex_from_bytes,
    capsule_hex_to_bytes,
    re_key_hex_to_bytes,
    rekey_to_sc_ec,
    split_PubKey_to_BN,
    bigNumber_to_hex_string,
    constructPublicKey,
    split_capsule,
    combine_capsule,
    split_re_key,
    combine_capsule_PRE,
};
