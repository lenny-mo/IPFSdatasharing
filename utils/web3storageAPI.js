const { Web3Storage } = require('web3.storage');
const { File } = require('web3.storage');
const { config } = require('dotenv');
const fs = require('fs');
const path = require('path');

// read the .env file into the environment
config();

// getAccessToken Get the access token from the environment
function getAccessToken () {
  return process.env.WEB3STORAGE_TOKEN
}

// makeStorageClient returns a new client to the Web3 Storage service
function makeStorageClient () {
  return new Web3Storage({ token: getAccessToken() })
}

// readFile 
function readFile(filePath) {
  const fileName = path.basename(filePath);
  const fileContents = fs.readFileSync(filePath);
  return new File([fileContents], fileName);
}

// storeFile stores the given file using the Web3 Storage client
async function storeFile (file) {
  const client = makeStorageClient()
  const cid = await client.put([file])
  console.log('stored file with cid:', cid)
  return cid
}

// 导出模块 
module.exports = {
    storeFile,
    readFile,
  };