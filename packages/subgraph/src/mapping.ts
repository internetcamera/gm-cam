import { BigInt } from '@graphprotocol/graph-ts';
import {
  GmCam,
  FilmCreated,
  GMCreated,
  GMCompleted
} from '../generated/GmCam/GmCam';
import { GM, GMPair, Wallet } from '../generated/schema';

export function handleFilmCreated(event: FilmCreated): void {
  let gm = new GM(event.params.tokenId.toString());
  gm.expiresAt = event.params.expiresAt;
  let wallet = new Wallet(event.params.player.toHexString());
  gm.originalOwner = wallet.id;
  gm.expiresAt = event.params.expiresAt;
  gm.save();
  wallet.save();
}

export function handleGMCreated(event: GMCreated): void {
  let gm = GM.load(event.params.tokenId.toString());
  let contract = GmCam.bind(event.address);
  let gmData = contract.gmData(event.params.tokenId);
  let originalOwner = new Wallet(gmData.value0.toHexString());
  originalOwner.save();
  gm.originalOwner = originalOwner.id;
  gm.expiresAt = gmData.value1;
  gm.ipfsHash = gmData.value3;
  gm.createdAt = event.block.timestamp;
  gm.save();

  let gmPair = new GMPair(gm.id);
  gmPair.gm1 = gm.id;
  gmPair.isCompleted = false;
  gmPair.save();
}

export function handleGMCompleted(event: GMCompleted): void {
  let contract = GmCam.bind(event.address);
  let gm1 = GM.load(event.params.gm1TokenId.toString());
  let gm2 = new GM(event.params.gm2TokenId.toString());
  let gmPair = GMPair.load(gm1.id);

  let gm2Data = contract.gmData(event.params.gm2TokenId);
  let gm2OriginalOwner = new Wallet(gm2Data.value0.toHexString());
  gm2.originalOwner = gm2OriginalOwner.id;
  gm2OriginalOwner.save();
  gm2.expiresAt = gm2Data.value1;
  gm2.partner = gm1.id;
  gm2.partner = gm2.ipfsHash = gm2Data.value3;
  gm2.ipfsHash = gm2Data.value3;
  gm2.createdAt = event.block.timestamp;

  gm1.partner = gm2.id;
  gmPair.gm2 = gm2.id;
  gmPair.isCompleted = true;
  gm1.save();
  gm2.save();
  gmPair.save();
}
