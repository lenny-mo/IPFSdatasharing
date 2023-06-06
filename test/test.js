const { expect } = require("chai");
const { encryptAndUploadFile, getAESKey, getInitVector } = require('../utils/encrypt.js');

// Test group: "Check CID"
describe("Check CID", function() {

    // Test case: "Should return the correct CID"
    // 测试智能合约是否存储了正确的CID
    it("Should return the correct CID", async function() {
        // 合约的部署
        const CIDStorageContract = await ethers.getContractFactory("CIDStorageContract");
        const CIDStorage = await CIDStorageContract.deploy();

        // 上传本地的加密后文件CT，并且返回CID
        inputpath = './file4upload/test1';
        outputpath = './file4upload/test3.enc';
        expectedCid = await encryptAndUploadFile(inputpath, outputpath, getAESKey());
        
        // 把CID存储到智能合约
        CIDStorage.setCID(expectedCid);
        
        // 使用智能合约public变量的默认get函数，从智能合约中读取CID
        const actualCid = await CIDStorage.uploadedCID();

        // 判断合约中存储的CID是否和本地上传的CID一致
        expect(actualCid).to.equal(expectedCid);
        
        // 在本地对AES密钥信息进行非对称加密，并且把加密后的信息CT‘ 存储进智能合约
        CIDStorage.setAESKey(getAESKey());
        CIDStorage.setInitVector(getInitVector());
        
        // 使用智能合约public变量的默认get函数，从智能合约中读取AES密钥信息
        
        
        
    });

    // TODO: 获取合约的CID，并且获取文件然后解密，判断解密后的文件是否和原文件一致
});
