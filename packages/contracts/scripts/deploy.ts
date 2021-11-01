import fs from 'fs-extra';
import { JsonRpcProvider } from '@ethersproject/providers';
import { Wallet } from '@ethersproject/wallet';
import { GmCam__factory } from '../typechain';
import hre from 'hardhat';
import 'hardhat-change-network';

async function start() {
  const args = require('minimist')(process.argv.slice(2));

  if (!args.chainId) {
    throw new Error('--chainId chain ID is required');
  }
  const chainId = args.chainId;

  const path = `${process.cwd()}/.env.${chainId}`;
  const env = require('dotenv').config({ path }).parsed;
  const provider = new JsonRpcProvider(env.RPC_ENDPOINT);
  const wallet = new Wallet(`0x${env.PRIVATE_KEY}`, provider);
  const addressesPath = `${process.cwd()}/addresses/${chainId}.json`;
  const addressBook = JSON.parse(
    await fs.readFileSync(addressesPath).toString()
  );

  hre.changeNetwork('mumbai');

  if (addressBook.gmCam)
    throw new Error(
      "This would overwrite the address book. Clear it first if you'd like to deploy new instances."
    );

  if (!addressBook.forwarder)
    throw new Error(
      'The forwarder address is required. Add it to the address book first.'
    );

  if (!addressBook.gmCam) {
    console.log('Deploying gmCam...');
    const deployTx = await new GmCam__factory(wallet).deploy(
      addressBook.forwarder
    );
    console.log('Deploy TX: ', deployTx.deployTransaction.hash);
    await deployTx.deployed();
    console.log('gmCam deployed at ', deployTx.address);
    addressBook.gmCam = deployTx.address;
    await fs.writeFile(addressesPath, JSON.stringify(addressBook, null, 2));

    console.log('Verifying contract...');
    await hre.run('verify:verify', {
      address: addressBook.gmCam,
      constructorArguments: [addressBook.forwarder]
    });
  }

  console.log('Deployed!');
}

start().catch((e: Error) => {
  console.error(e);
  process.exit(1);
});
