// upload the file to IPFS and get the CID using the Web3 Storage client
const fs = require('fs');
const path = require('path');
const {readFile, storeFile} = require('./web3storageAPI.js');

// uploadfile 上传文件
function uploadFile(path) {
  const filePath = path;

  // If the file path is not specified, print an error message and exit
  if (!filePath) {
    console.error('file path is unavailable, you should check if the file exists');
    process.exit(1);
  } 

  // Read the file and store it
  const file = readFile(filePath);
  let cid = storeFile(file);
  console.log(`the file is stored with cid: ${cid}`);

  return cid; 
  
}

// UploadFile 导出函数，上传文件  
async function UploadFile2IPFS(filePath) {
  try {
    const cid = await uploadFile(filePath);
    console.log('文件上传完成');
    return cid;
  } catch (error) {
    console.error('文件上传失败', error);
    throw error;
  }
}

// 导出模块 
module.exports = {
  UploadFile2IPFS,
};




