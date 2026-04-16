import "dotenv/config";
import { network } from "hardhat";

const { ethers, networkName } = await network.connect();

const researcherAddress = process.env.RESEARCHER_ADDRESS;

if (!researcherAddress) {
  throw new Error("RESEARCHER_ADDRESS não definido");
}

console.log(`Deployando em ${networkName}...`);

const contract = await ethers.deployContract(
  "ResearchProjectEscrow",
  [researcherAddress]
);

await contract.waitForDeployment();

console.log("Contract address:", await contract.getAddress());
console.log("Deployment tx:", contract.deploymentTransaction()?.hash);