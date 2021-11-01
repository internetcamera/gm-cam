import { BigInt } from '@graphprotocol/graph-ts';
import { store } from '@graphprotocol/graph-ts';
import {
  GmCam,
  FilmCreated,
  GMCreated,
  GMCompleted
} from '../generated/GmCam/GmCam';
import { GM, GMFilm, GMPair, Wallet } from '../generated/schema';

export function handleFilmCreated(event: FilmCreated): void {
  let gmFilm = new GMFilm(event.params.tokenId.toString());
  gmFilm.expiresAt = event.params.expiresAt;
  let wallet = new Wallet(event.params.player.toHexString());
  gmFilm.owner = wallet.id;
  gmFilm.expiresAt = event.params.expiresAt;
  gmFilm.save();
  wallet.save();
}

export function handleGMCreated(event: GMCreated): void {
  store.remove('GMFilm', event.params.tokenId.toString());

  let gm = new GM(event.params.tokenId.toString());
  let contract = GmCam.bind(event.address);
  let gmData = contract.gmData(event.params.tokenId);

  let sender = new Wallet(gmData.value0.toHexString());
  sender.save();
  gm.sender = sender.id;

  let recipient = new Wallet(
    contract.ownerOf(event.params.tokenId).toHexString()
  );
  recipient.save();
  gm.recipient = recipient.id;

  gm.expiresAt = gmData.value1;
  gm.ipfsHash = gmData.value3;
  gm.createdAt = event.block.timestamp;
  gm.state = 'INITIATED';
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
  let gm2Sender = new Wallet(gm2Data.value0.toHexString());
  gm2.sender = gm2Sender.id;
  gm2Sender.save();

  let gm2Recipient = new Wallet(
    contract.ownerOf(event.params.gm2TokenId).toHexString()
  );
  gm2Recipient.save();
  gm2.recipient = gm2Recipient.id;

  gm2.expiresAt = gm2Data.value1;
  gm2.partner = gm1.id;
  gm2.partner = gm2.ipfsHash = gm2Data.value3;
  gm2.ipfsHash = gm2Data.value3;
  gm2.createdAt = event.block.timestamp;

  gm1.partner = gm2.id;
  gmPair.gm2 = gm2.id;
  gmPair.isCompleted = true;
  gm1.state = 'COMPLETED';
  gm2.state = 'COMPLETED';
  gm1.save();
  gm2.save();
  gmPair.save();
}
