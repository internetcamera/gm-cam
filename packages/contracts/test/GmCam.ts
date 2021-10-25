import * as chai from 'chai';
import { BigNumber, Signer } from 'ethers';
import { expect } from 'chai';
import { GmCam, GmCam__factory } from '../typechain';
import dayjs, { Dayjs } from 'dayjs';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
//@ts-ignore
import { ethers } from 'hardhat';

describe('GmCam', function () {
  let accounts: Signer[] = [];
  let addresses: string[] = [];
  let gmCamContract: GmCam;
  let deployTime: Dayjs;

  this.beforeAll(async () => {
    accounts = await ethers.getSigners();
    addresses = await Promise.all(accounts.map(signer => signer.getAddress()));
    const GmCam = await ethers.getContractFactory('GmCam');
    gmCamContract = (await GmCam.deploy()) as GmCam;
    deployTime = dayjs();
    await gmCamContract.deployed();
  });

  // * CONSTRUCTOR * //
  it('should deploy and mint 100 film to deployer', async function () {
    await expect(await gmCamContract.owner()).to.equal(addresses[0]);
    await expect(await gmCamContract.balanceOf(addresses[0])).to.equal(100);
  });

  it('should have pre-constructed film default to empty data', async function () {
    const gmData = await gmCamContract.gmData(1);
    await expect(gmData[0]).to.equal(
      '0x0000000000000000000000000000000000000000'
    );
    await expect(
      Math.abs(gmData[1].toNumber() - deployTime.add(36500, 'day').unix())
    )
      .to.be.lessThanOrEqual(1)
      .and.greaterThanOrEqual(0);

    await expect(gmData[2]).to.equal('');
    await expect(gmData[3]).to.equal('');
    await expect(gmData[4]).to.equal(false);
  });

  it('should allow the deployer to send a gm', async function () {
    // send a gm
    let timestamp = dayjs();
    await expect(gmCamContract.sendGM(1, addresses[1], 'photoA', 'photoB'))
      .eventually.fulfilled;

    // ensure balances change correctly
    await expect(await gmCamContract.balanceOf(addresses[0])).to.equal(99);
    await expect(await gmCamContract.balanceOf(addresses[1])).to.equal(1);

    // ensure player 2 gets expected gm tokenId
    await expect(await gmCamContract.ownerOf(1)).to.equal(addresses[1]);

    // ensure gm state is as expected
    const gmData = await gmCamContract.gmData(1);
    await expect(gmData[0]).to.equal(addresses[0]);

    // TODO: check expiration date more precisely?
    await expect(
      Math.abs(gmData[1].toNumber() - timestamp.add(1, 'day').unix())
    )
      .to.be.lessThanOrEqual(1)
      .and.greaterThanOrEqual(0);

    await expect(gmData[2]).to.equal('photoA');
    await expect(gmData[3]).to.equal('photoB');
    await expect(gmData[4]).to.equal(false);
  });

  it('should allow the receiver to reply to a gm', async function () {});
});
