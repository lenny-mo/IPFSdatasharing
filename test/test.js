const { expect } = require("chai");
const { encryptAndUploadFile, getEncryptedAESKey, getEncryptedInitVector, getOwnerAddr } = require('../utils/encrypt.js');

// Test group: "Check CID" can hold multiple tests related to the CIDStorageContract
describe("Check CID", function() {

    it("Should return the correct CID", async function() {
        // 合约的部署, 默认会在contracts目录下寻找Solidity合约文件
        const CIDStorageContract = await ethers.getContractFactory("StorageFile");
        const CIDStorage = await CIDStorageContract.deploy();

        // 上传本地的加密后文件CT，并且返回CID
        inputpath = './file4upload/test1';
        outputpath = './file4upload/test4.enc';
        const fileCID = await encryptAndUploadFile(inputpath, outputpath);

        // 获取 owner addr
        const CidOwnerAddr = await getOwnerAddr();
        console.log('Owner address: ', CidOwnerAddr);
        
        // 获取文件的AES key和initVector 
        const EncryptedAESKey = await getEncryptedAESKey();

        const EncryptedInitVector = await getEncryptedInitVector();

        // 存储 data owner addr, 文件的CID，AES key，AES initVector
        await CIDStorage.setCipherText(CidOwnerAddr, fileCID, EncryptedAESKey, EncryptedInitVector);
        console.log("setCipherText() is called");

        // 获取合约中存储的数据
        await CIDStorage.getCipherText(CidOwnerAddr, fileCID).then((result) => {
            let [uploadedAESKey, uploadedAESIV] = result;
            console.log('合约中存储的AES key: ', uploadedAESKey);  
            console.log(); 
            console.log('合约中存储的AES initVector: ', uploadedAESIV);
        });

    });
    
});


