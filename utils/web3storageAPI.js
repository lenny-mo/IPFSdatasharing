const { Web3Storage } = require('web3.storage');
const { File } = require('web3.storage');
// const { config } = require('dotenv');
const fs = require('fs');
const path = require('path');

// read the .env file into the environment
// config();

// getAccessToken Get the access token from the environment
function getAccessToken () {
  return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDFiMzg5MGI5OTY5Y0Q4QzQzZTA0Yzk3NzU2ZDVBODY4NTcyNzU1NzQiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2ODU0MjIzNDk3NTgsIm5hbWUiOiJmaXJzdF90b2tlbiJ9.Hzw6KVDJXeU3LPTtTguSw5o-di9iQWAPNV3zrfpwSmM"
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
  return cid
}


/**
 * 从IPFS上下载文件
 *
 * @param {*} cid
 * @param {*} outputPath
 */
async function downloadFile(cid, outputPath) {
  const client = makeStorageClient()
  const res = await client.get(cid)
  console.log(`Got a response! [${res.status}] ${res.statusText}`)
  if (!res.ok) {
    throw new Error(`failed to get ${cid} - [${res.status}] ${res.statusText}`)
  }

  // unpack File objects from the response
  const files = await res.files()
  for (const file of files) {
    console.log(`${file.cid} -- ${file.path} -- ${file.size}`)
    // Convert the file content to a buffer
    const fileContent = await file.arrayBuffer()
    const buffer = Buffer.from(fileContent)
    // Write the buffer to a local file
    fs.writeFileSync(outputPath, buffer)
  }
}

// 导出模块 
module.exports = {
    storeFile,
    readFile,
    downloadFile,
};