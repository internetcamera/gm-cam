import * as chai from "chai";
import { BigNumber, Signer } from "ethers";
import { expect } from "chai";
import { GmCam } from "../typechain";
import dayjs, { Dayjs } from "dayjs";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
//@ts-ignore
import hardhat, { ethers } from "hardhat";

const AIRDROP_ADDRS = [
  "0x7b905b74b64b9c9eea2a4fd8133ef27d617f00d7",
  "0x15d4f013ffa9a39769251d3e1bd28b2b09a069b9",
  "0x8663dc02812630b5aebad64da5285a7bd06fdab3",
  "0x292ff025168D2B51f0Ef49f164D281c36761BA2b",
  "0x40aD478FD10e1EedD07c8D686e5632ebE98735Fd",
  "0x489e3e846bb550cb7b023108ce071bb39fd23cd8",
  "0x2a2cd7400f922085b62ca9bd9ac0f16151f716ab",
  "0x5090c4Fead5Be112b643BC75d61bF42339675448",
  "0x7894d3eBFAb3ec41BA9779C7c6978C399bfC1209",
  "0xf1394045c1668f65b14952737fea75026824a441",
  "0x84ebc8e602ba6de85339b9928358a64b65f16ef6",
  "0xE26067c76fdbe877F48b0a8400cf5Db8B47aF0fE",
  "0x37ff7391f265f70be46539e654d962609da37d92",
  "0x7FbE45b151259B47b9E525c0C68b1d0241944d96",
  "0x6FeD43575ae278d4A14229566898e06a774A5289",
  "0xA8C7372dC993d7510C9c45425807d463967cbb12",
  "0x87641313E36e94E4422610A6703eF3e1a8Aca5fE",
  "0x2aCe5Eda1242badc322ce2A821eA9E309De63C53",
  "0x6a932F0AE2A7A49fb24B70C8Eef6Ec0808163345",
  "0xa3b0372BD1129235c4bdbd8217dEf8B8914B1405",
  "0x865fced9a4cef1673b95fdca3846babd4867ebf7",
  "0x085dD7FcFe86A1E3B2c9eda644a4cA1C5A67b2B2",
  "0x3397523A9e446B7018D9bD0e924aA85DeBADc6F1",
  "0xE12BB245AE1398568d007E82bAC622f555f2B07F",
  "0xeE620a0991D57f464aaD452789a4564Ba51245E8",
  "0x2afE4De9D1C679E42C03649D86FFDDDc07751AE6",
  "0x0c1d6798aef2AD22F24e755806E1d3274EB8df44",
  "0xb36ed58362f483EA8A8237889883f8049BaB8B3e",
  "0xe19558D2b3fAbb5c045DdF3b44dC15dE18E9Cd20",
  "0x6C7c3806B3CaE601b1D99c017E4592753ba8D41e",
  "0xE8B0016130A38f26c116576A7b13267c9FB11B59",
  "0x87E386cEdb82CF8F080b3505ADaE1eF699e65057",
  "0xcde3725B25D6d9bC78CF0941cC15Fd9710c764b9",
  "0x89B09F9aEf618cC154c0CaD9eE349bb2aE61B73D",
  "0x888c1B86000BbBDb2223A0b89E3c82AEc9D94297",
  "0x1aa55dcf805d9f652caf97157ea8065ef79119da",
  "0x2C90f88BE812349fdD5655c9bAd8288c03E7fB23",
  "0xDA048BED40d40B1EBd9239Cdf56ca0c2F018ae65",
  "0xd78cf5d20f414e2fd164ce908bea5149753bb293",
  "0xEBEbA6f37F21ce0Ce748B9626facB8D3c01BacA1",
  "0xae8F63591711ea84D961781d89c148958f899C95",
  "0x6FC438Ad14E4654893B6F642C627d45d2776De48",
  "0xbcb4ff1d84836f7d656272c22135c2b2e5bd379d",
  "0x32B1c4719496f425726e161E1E33480B68dc79E7",
  "0x6C8c8050a9C551B765aDBfe5bf02B8D8202Aa010",
  "0x9D4CF19fc992Aa92aCf46B2963a874A0fa618B91",
  "0xd72d710d3e30c15a8fefcc74de3c0d557df28b7c",
  "0x948820aCeF664AD0892555DBba70198a765850A2",
  "0xA2fE1d4145443EbC027F15C9F7ca27f7e9FD5F33",
  "0xc7A0D765C3aF6E2710bA05A56c5E2cA190C2E11e",
  "0x70A5d38b135482c89Cf540BC27Cf5C282C73c35C",
  "0x1d69d3CDEbB5c3E2B8b73cC4D49Aa145ecb7950F",
  "0xBe260B86e2eE35A406F9154107f242882aB00aEe",
  "0x7D0068d0D8fC2Aa15d897448B348Fa9B30f6d4c9",
  "0x38545d73E9f15e92D21f1ddc71A109E8a67f6291",
  "0xe734ab200f05e9c78b29747e1d4788a21d8c07c6",
  "0x471e9B5f89F827045E6d9Ec2083A310C27459157",
  "0x4664576712c2d51300f72BAe8C04Cbe833F03111",
  "0xeb54D707252Ee9E26E6a4073680Bf71154Ce7Ab5",
  "0xbAC1218fBe5b3f2e89932FC110450FCFF5743F4b",
  "0x323794C012DF58d68843D745c75eA536D870c7DA",
  "0xC6724e0A352570776BFe5fBD079F6Acc1765D759",
  "0xaf045Cb0dBC1225948482e4692Ec9dC7Bb3cD48b",
  "0x6C89E3A9df0d4be20CE685281C0096b05617fD8a",
  "0x3330777CC5270dB65E7dF1D738E989DC16Dd49f2",
  "0x80512349Bd9C9ebD6019e2b0cb1BD3EEa4fd7Ec6",
  "0x317Bc38b66566566529C41462bA774F489b4a63f",
  "0x0456FdB63a3Cc7Ec354435754E5CF30458105416",
  "0xB0623C91c65621df716aB8aFE5f66656B21A9108",
  "0xC6c41119Af1e0840357245c66baAf0e21B694D4d",
  "0x40FF52E1848660327F16ED96a307259Ec1D757eB",
  "0xD286064cc27514B914BAB0F2FaD2E1a89A91F314",
  "0x584D5315493B530572Ed2916e8D2b75C4d08c990",
  "0x1A7bE7dB3A050624Eb17b1a0e747FbaaF2b8A9cA",
  "0xcC61AaaFAAc195706ccB5E59E48FcBDE7AFec199",
  "0xF73FE15cFB88ea3C7f301F16adE3c02564ACa407",
  "0x440DAA861400Bf754B83121479Bf26895F1Df7C4",
  "0x9688948203067Cb54D6E8c26ce2e22DE2769ae87",
];

describe("GmCam", function () {
  let accounts: Signer[] = [];
  let addresses: string[] = [];
  let gmCamContract: GmCam;
  let deployTime: Dayjs;
  let airdropTo: string[] = [];

  this.beforeAll(async () => {
    accounts = await ethers.getSigners();
    addresses = await Promise.all(
      accounts.map((signer) => signer.getAddress())
    );
    const GmCam = await ethers.getContractFactory("GmCam");
    gmCamContract = (await GmCam.deploy(
      "0x0000000000000000000000000000000000000000"
    )) as GmCam;
    deployTime = dayjs();
    await gmCamContract.deployed();

    airdropTo = [addresses[0], ...AIRDROP_ADDRS].map((addr) =>
      addr.toLowerCase()
    );
  });

  // * CONSTRUCTOR * //
  it("should airdrop to all addresses", async function () {
    await gmCamContract.airdrop(airdropTo);

    const checkAirdrop = airdropTo.map(async (addr, i) => {
      const gmData = await gmCamContract.gmData(i + 1);
      await expect(gmData.originalOwner.toLowerCase()).to.equal(addr);
      await expect(
        Math.abs(
          gmData.expiresAt.toNumber() - deployTime.add(36500, "day").unix()
        )
      )
        .to.be.lessThanOrEqual(5)
        .and.greaterThanOrEqual(0);
      await expect(gmData.ipfsHash).to.equal("");
      await expect(gmData.isCompleted).to.equal(false);
      await expect(await gmCamContract.filmBalances(addr)).to.equal(1);
    });

    await Promise.all(checkAirdrop);
  });

  it("shouldnt allow airdrops after they've been stopped", async function () {
    await gmCamContract.stopAirdrops();

    await expect(gmCamContract.airdrop(AIRDROP_ADDRS)).eventually.rejectedWith(
      makeVMErrorMessage("Airdropping has been stopped")
    );
  });

  it("should have pre-constructed film default to empty data", async function () {
    const gmData = await gmCamContract.gmData(1);
  });

  it("should allow the deployer to send a gm", async function () {
    // send a gm
    let timestamp = dayjs();
    await expect(gmCamContract.sendGM(1, addresses[1], "photoA")).eventually
      .fulfilled;

    // ensure balances change correctly
    await expect(await gmCamContract.filmBalances(addresses[0])).to.equal(0); // FILM
    await expect(await gmCamContract.filmBalances(addresses[1])).to.equal(0); // FILM
    await expect(await gmCamContract.balanceOf(addresses[1])).to.equal(1); // ERC721

    // ensure player 2 gets expected gm tokenId
    await expect(await gmCamContract.ownerOf(1)).to.equal(addresses[1]);

    // ensure gm state is as expected
    const gmData = await gmCamContract.gmData(1);
    await expect(gmData.originalOwner).to.equal(addresses[0]);

    // TODO: check expiration date more precisely?
    await expect(
      Math.abs(gmData.expiresAt.toNumber() - timestamp.add(1, "day").unix())
    )
      .to.be.lessThanOrEqual(5)
      .and.greaterThanOrEqual(0);

    await expect(gmData.partnerTokenId).to.equal(0);

    await expect(gmData.ipfsHash).to.equal("photoA");
    await expect(gmData.isCompleted).to.equal(false);

    await expect(await gmCamContract.tokenURI(1)).to.equal("ipfs://photoA");
  });

  it("shouldnt allow someone to update or re-send an already sent gm", async function () {
    await expect(
      gmCamContract.connect(accounts[1]).sendGM(1, addresses[1], "photoB")
    ).eventually.rejectedWith(makeVMErrorMessage("token already minted"));
    await expect(await gmCamContract.tokenURI(1)).to.equal("ipfs://photoA");
  });

  it("should allow the receiver to reply to a gm", async function () {
    await expect(gmCamContract.connect(accounts[1]).sendGMBack(1, "photoB")).to
      .eventually.fulfilled;

    await expect(await gmCamContract.filmBalances(addresses[0])).to.equal(2); // FILM
    await expect(await gmCamContract.balanceOf(addresses[0])).to.equal(1); // ERC721
    await expect(await gmCamContract.filmBalances(addresses[1])).to.equal(2); // FILM
    await expect(await gmCamContract.balanceOf(addresses[1])).to.equal(1); // ERC721

    await expect(
      await (
        await gmCamContract.gmData(1 + airdropTo.length)
      ).originalOwner
    ).to.equal(addresses[1]);
    await expect(await (await gmCamContract.gmData(1)).originalOwner).to.equal(
      addresses[0]
    );
    await expect(
      await (
        await gmCamContract.gmData(2 + airdropTo.length)
      ).originalOwner
    ).to.equal(addresses[0]);
    await expect(
      await (
        await gmCamContract.gmData(3 + airdropTo.length)
      ).originalOwner
    ).to.equal(addresses[1]);
    await expect(
      await (
        await gmCamContract.gmData(4 + airdropTo.length)
      ).originalOwner
    ).to.equal(addresses[0]);
    await expect(
      await (
        await gmCamContract.gmData(5 + airdropTo.length)
      ).originalOwner
    ).to.equal(addresses[1]);

    const gmData1 = await gmCamContract.gmData(1);
    const gmData101 = await gmCamContract.gmData(airdropTo.length + 1);

    await expect(gmData1.originalOwner).to.equal(addresses[0]);
    await expect(gmData101.originalOwner).to.equal(addresses[1]);

    await expect(gmData1.partnerTokenId).to.equal(airdropTo.length + 1);
    await expect(gmData101.partnerTokenId).to.equal(1);

    await expect(gmData1.isCompleted).to.equal(true);
    await expect(gmData101.isCompleted).to.equal(true);

    await expect(await gmCamContract.tokenURI(airdropTo.length + 1)).to.equal(
      "ipfs://photoB"
    );
  });

  it("shouldnt allow anyone to send or reply to a completed gm", async function () {
    await expect(
      gmCamContract.sendGM(airdropTo.length + 1, addresses[1], "photoA")
    ).eventually.rejectedWith(makeVMErrorMessage("token already minted"));
    await expect(
      gmCamContract.connect(accounts[1]).sendGMBack(1, "photoC")
    ).eventually.rejectedWith(makeVMErrorMessage("this film is completed"));
  });

  it("shouldnt allow a non-owner to use a gm film token", async function () {
    await expect(
      gmCamContract.connect(accounts[2]).sendGM(2, addresses[3], "photoA")
    ).eventually.rejectedWith(makeVMErrorMessage("you do not own this film"));
  });

  it("shouldnt allow someone to send themselves a gm", async function () {
    await expect(
      gmCamContract.sendGM(airdropTo.length + 2, addresses[0], "photoA")
    ).eventually.rejectedWith(makeVMErrorMessage("cant send to yourself"));
  });

  it("shouldnt allow a non-owner to reply to a gm token", async function () {
    await expect(
      gmCamContract.sendGM(airdropTo.length + 2, addresses[1], "photoA")
    ).eventually.fulfilled;
    await expect(
      gmCamContract
        .connect(accounts[5])
        .sendGMBack(airdropTo.length + 2, "photoC")
    ).eventually.rejectedWith(makeVMErrorMessage("you do not own this gm"));
  });

  it("shouldnt allow address to overspend", async function () {
    for (var i = 0; i < 2; i++) {
      await expect(
        gmCamContract
          .connect(accounts[1])
          .sendGM(airdropTo.length + 3 + i * 2, addresses[i + 10], "photo")
      ).eventually.fulfilled;
    }
    await expect(await gmCamContract.filmBalances(addresses[1])).to.equal(0);
    await expect(gmCamContract.sendGM(113, addresses[11], "photoA")).eventually
      .rejected;
  });

  it("shouldnt allow expired film to be used", async function () {
    await mineBlocks(24 * 60 * 60 + 1);
    await expect(
      gmCamContract.sendGM(airdropTo.length + 4, addresses[1], "photoA")
    ).eventually.rejectedWith(makeVMErrorMessage("this film is expired"));
  });

  it("should allow burning of expired film", async function () {
    await expect(
      gmCamContract.burnExpired([
        1,
        airdropTo.length + 2,
        airdropTo.length + 3,
        airdropTo.length + 4,
      ])
    ).eventually.fulfilled;
    await expect(await gmCamContract.ownerOf(1)).to.equal(addresses[1]);
    await expect(
      gmCamContract.ownerOf(airdropTo.length + 2)
    ).eventually.rejectedWith(
      makeVMErrorMessage("ERC721: owner query for nonexistent token")
    );
    await expect(
      (
        await gmCamContract.gmData(airdropTo.length + 2)
      ).originalOwner
    ).to.equal("0x0000000000000000000000000000000000000000");
  });
});

function makeVMErrorMessage(error: string): string {
  return `VM Exception while processing transaction: reverted with reason string \'${error}\'`;
}

async function mineBlocks(blockNumber: number) {
  while (blockNumber > 0) {
    blockNumber--;
    await hardhat.network.provider.request({
      method: "evm_mine",
      params: [],
    });
  }
}
