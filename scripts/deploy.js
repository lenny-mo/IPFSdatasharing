// this file is used to deploy our contract
// 部署到mumbai 测试网上
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const ContractFactory = await hre.ethers.getContractFactory("YourContractName"); // 替换为您的合约名称
  const contract = await ContractFactory.deploy(); // 如果您的构造函数需要参数，请在此处添加

  console.log("Contract deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
    