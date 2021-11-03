import fs from "fs-extra";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Wallet } from "@ethersproject/wallet";
import { GmCam__factory } from "../typechain";
import hre from "hardhat";
import "hardhat-change-network";

const aidropAddrs = [
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

async function start() {
  const args = require("minimist")(process.argv.slice(2));

  if (!args.chainId) {
    throw new Error("--chainId chain ID is required");
  }
  const chainId = args.chainId;

  const path = `${process.cwd()}/.env.${chainId}`;
  const env = require("dotenv").config({ path }).parsed;
  const provider = new JsonRpcProvider(env.RPC_ENDPOINT);
  const wallet = new Wallet(`0x${env.PRIVATE_KEY}`, provider);
  const addressesPath = `${process.cwd()}/addresses/${chainId}.json`;
  const addressBook = JSON.parse(
    await fs.readFileSync(addressesPath).toString()
  );

  hre.changeNetwork("mumbai");

  if (addressBook.gmCam)
    throw new Error(
      "This would overwrite the address book. Clear it first if you'd like to deploy new instances."
    );

  if (!addressBook.forwarder)
    throw new Error(
      "The forwarder address is required. Add it to the address book first."
    );

  if (!addressBook.gmCam) {
    console.log("Deploying gmCam...");
    const deployTx = await new GmCam__factory(wallet).deploy(
      addressBook.forwarder
    );
    console.log("Deploy TX: ", deployTx.deployTransaction.hash);
    await deployTx.deployed();
    console.log("gmCam deployed at ", deployTx.address);
    addressBook.gmCam = deployTx.address;
    await fs.writeFile(addressesPath, JSON.stringify(addressBook, null, 2));

    console.log("Verifying contract...");
    await deployTx.deployTransaction.wait(5);
    await hre.run("verify:verify", {
      address: addressBook.gmCam,
      constructorArguments: [addressBook.forwarder],
    });

    console.log("Airdropping....");
    const contract = GmCam__factory.connect(addressBook.gmCam, wallet);
    const drop = await contract.airdrop(aidropAddrs);
    console.log(drop.hash);
    // console.log(drop.)
    drop.wait(2);
    // contract.stopAirdrops();
    console.log("Airdrop complete");
  }

  console.log("Deployed!");
}

start().catch((e: Error) => {
  console.error(e);
  process.exit(1);
});
