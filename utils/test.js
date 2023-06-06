const {encryptAndUploadFile, getAESKey, getInitVector } = require('./encrypt.js');

// XXX: 使用项目绝对路径，否则相对路径会出错
encryptAndUploadFile('./file4upload/test1', './file4upload/test2.enc', getAESKey());

