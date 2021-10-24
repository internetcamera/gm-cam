import * as chai from 'chai';
import { BigNumber, Signer } from 'ethers';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
import { GmCam, GmCam__factory } from '../typechain';
chai.use(chaiAsPromised);
//@ts-ignore
import { ethers } from 'hardhat';

describe('gmCam', function () {
  let accounts: Signer[] = [];
  let addresses: string[] = [];
  let gmCamContract: GmCam;

  this.beforeAll(async () => {
    accounts = await ethers.getSigners();
    addresses = await Promise.all(accounts.map(signer => signer.getAddress()));
    const GmCam = await ethers.getContractFactory('GmCam');
    gmCamContract = (await GmCam.deploy()) as GmCam;
    await gmCamContract.deployed();
  });

  // * CONSTRUCTOR * //
  it('should deploy ', async function () {
    await expect(await gmCamContract.owner()).to.equal(addresses[0]);
  });
});
