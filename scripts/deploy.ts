import { ethers } from 'hardhat';

async function main() {
  const Ledger = await ethers.getContractFactory('PortfolioLedger');
  const ledger = await Ledger.deploy();
  await ledger.waitForDeployment();
  console.log('LEDGER_ADDRESS=', await ledger.getAddress());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
