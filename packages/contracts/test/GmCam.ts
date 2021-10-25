import * as chai from 'chai';
import { BigNumber, Signer } from 'ethers';
import { expect } from 'chai';
import { GmCam } from '../typechain';
import dayjs, { Dayjs } from 'dayjs';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
//@ts-ignore
import hardhat, { ethers } from 'hardhat';

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
    await expect(gmData.originalOwner).to.equal(
      '0x0000000000000000000000000000000000000000'
    );
    await expect(
      Math.abs(
        gmData.expiresAt.toNumber() - deployTime.add(36500, 'day').unix()
      )
    )
      .to.be.lessThanOrEqual(5)
      .and.greaterThanOrEqual(0);

    await expect(gmData.ipfsHash).to.equal('');
    await expect(gmData.isCompleted).to.equal(false);
  });

  it('should allow the deployer to send a gm', async function () {
    // send a gm
    let timestamp = dayjs();
    await expect(gmCamContract.sendGM(1, addresses[1], 'photoA')).eventually
      .fulfilled;

    // ensure balances change correctly
    await expect(await gmCamContract.balanceOf(addresses[0])).to.equal(99);
    await expect(await gmCamContract.balanceOf(addresses[1])).to.equal(1);

    // ensure player 2 gets expected gm tokenId
    await expect(await gmCamContract.ownerOf(1)).to.equal(addresses[1]);

    // ensure gm state is as expected
    const gmData = await gmCamContract.gmData(1);
    await expect(gmData.originalOwner).to.equal(addresses[0]);

    // TODO: check expiration date more precisely?
    await expect(
      Math.abs(gmData.expiresAt.toNumber() - timestamp.add(1, 'day').unix())
    )
      .to.be.lessThanOrEqual(5)
      .and.greaterThanOrEqual(0);

    await expect(gmData.partnerTokenId).to.equal(0);

    await expect(gmData.ipfsHash).to.equal('photoA');
    await expect(gmData.isCompleted).to.equal(false);

    await expect(await gmCamContract.tokenURI(1)).to.equal('ipfs://photoA');
  });

  it('shouldnt allow someone to update or re-send an already sent gm', async function () {
    await expect(
      gmCamContract.connect(accounts[1]).sendGM(1, addresses[1], 'photoB')
    ).eventually.rejectedWith(makeVMErrorMessage('film already has been used'));
    await expect(await gmCamContract.tokenURI(1)).to.equal('ipfs://photoA');
  });

  it('should allow the receiver to reply to a gm', async function () {
    await expect(gmCamContract.connect(accounts[1]).sendGMBack(1, 'photoB')).to
      .eventually.fulfilled;

    await expect(await gmCamContract.balanceOf(addresses[0])).to.equal(100 + 5);
    await expect(await gmCamContract.balanceOf(addresses[1])).to.equal(1 + 5);

    await expect(await gmCamContract.ownerOf(101)).to.equal(addresses[0]);
    await expect(await gmCamContract.ownerOf(102)).to.equal(addresses[0]);
    await expect(await gmCamContract.ownerOf(103)).to.equal(addresses[1]);

    const gmData1 = await gmCamContract.gmData(1);
    const gmData101 = await gmCamContract.gmData(101);

    await expect(gmData1.originalOwner).to.equal(addresses[0]);
    await expect(gmData101.originalOwner).to.equal(addresses[1]);

    await expect(gmData1.partnerTokenId).to.equal(101);
    await expect(gmData101.partnerTokenId).to.equal(1);

    await expect(gmData1.isCompleted).to.equal(true);
    await expect(gmData101.isCompleted).to.equal(true);

    await expect(await gmCamContract.tokenURI(101)).to.equal('ipfs://photoB');
  });

  it('shouldnt allow anyone to send or reply to a completed gm', async function () {
    await expect(
      gmCamContract.sendGM(101, addresses[1], 'photoA')
    ).eventually.rejectedWith(makeVMErrorMessage('this film is completed'));
    await expect(
      gmCamContract.connect(accounts[1]).sendGMBack(1, 'photoC')
    ).eventually.rejectedWith(makeVMErrorMessage('this film is completed'));
  });

  it('shouldnt allow a non-owner to use a gm film token', async function () {
    await expect(
      gmCamContract.connect(accounts[2]).sendGM(2, addresses[3], 'photoA')
    ).eventually.rejectedWith(makeVMErrorMessage('you do not own this film'));
  });
  it('shouldnt allow someone to send themselves a gm', async function () {
    await expect(
      gmCamContract.sendGM(2, addresses[0], 'photoA')
    ).eventually.rejectedWith(makeVMErrorMessage('cant send to yourself'));
  });

  it('shouldnt allow a non-owner to reply to a gm token', async function () {
    await expect(gmCamContract.sendGM(2, addresses[1], 'photoA')).eventually
      .fulfilled;
    await expect(
      gmCamContract.connect(accounts[5]).sendGMBack(2, 'photoC')
    ).eventually.rejectedWith(makeVMErrorMessage('you do not own this film'));
  });

  it('shouldnt allow expired film to be used', async function () {
    await mineBlocks(24 * 60 * 60 + 1);
    await expect(
      gmCamContract.sendGM(102, addresses[1], 'photoA')
    ).eventually.rejectedWith(makeVMErrorMessage('this film is expired'));
  });
});

function makeVMErrorMessage(error: string): string {
  return `VM Exception while processing transaction: reverted with reason string \'${error}\'`;
}

async function mineBlocks(blockNumber: number) {
  while (blockNumber > 0) {
    blockNumber--;
    await hardhat.network.provider.request({
      method: 'evm_mine',
      params: []
    });
  }
}
