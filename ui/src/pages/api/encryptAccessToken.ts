import { PostEncryptedAccessTokenData } from '@/lib/models/encryptAccessTokenResponse';
import { Client } from "twitter-api-sdk";
import type { NextApiRequest, NextApiResponse } from 'next'
const eth_crypto_1 = require('eth-crypto');
const ethers = require("ethers");

const OracleAbi = [{"inputs":[],"name":"AlreadySet","type":"error"},{"inputs":[],"name":"CannotSelfTransfer","type":"error"},{"inputs":[],"name":"EmptyBillingRegistry","type":"error"},{"inputs":[],"name":"EmptyPublicKey","type":"error"},{"inputs":[],"name":"EmptyRequestData","type":"error"},{"inputs":[],"name":"EmptySendersList","type":"error"},{"inputs":[],"name":"InconsistentReportData","type":"error"},{"inputs":[],"name":"InvalidRequestID","type":"error"},{"inputs":[],"name":"NotAllowedToSetSenders","type":"error"},{"inputs":[],"name":"NotProposedOwner","type":"error"},{"inputs":[],"name":"OnlyCallableByOwner","type":"error"},{"inputs":[],"name":"OwnerMustBeSet","type":"error"},{"inputs":[],"name":"ReportInvalid","type":"error"},{"inputs":[],"name":"UnauthorizedPublicKeyChange","type":"error"},{"inputs":[],"name":"UnauthorizedSender","type":"error"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"AuthorizedSendersActive","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address[]","name":"senders","type":"address[]"},{"indexed":false,"internalType":"address","name":"changedBy","type":"address"}],"name":"AuthorizedSendersChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"AuthorizedSendersDeactive","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint32","name":"previousConfigBlockNumber","type":"uint32"},{"indexed":false,"internalType":"bytes32","name":"configDigest","type":"bytes32"},{"indexed":false,"internalType":"uint64","name":"configCount","type":"uint64"},{"indexed":false,"internalType":"address[]","name":"signers","type":"address[]"},{"indexed":false,"internalType":"address[]","name":"transmitters","type":"address[]"},{"indexed":false,"internalType":"uint8","name":"f","type":"uint8"},{"indexed":false,"internalType":"bytes","name":"onchainConfig","type":"bytes"},{"indexed":false,"internalType":"uint64","name":"offchainConfigVersion","type":"uint64"},{"indexed":false,"internalType":"bytes","name":"offchainConfig","type":"bytes"}],"name":"ConfigSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint8","name":"version","type":"uint8"}],"name":"Initialized","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"requestId","type":"bytes32"},{"indexed":false,"internalType":"address","name":"requestingContract","type":"address"},{"indexed":false,"internalType":"address","name":"requestInitiator","type":"address"},{"indexed":false,"internalType":"uint64","name":"subscriptionId","type":"uint64"},{"indexed":false,"internalType":"address","name":"subscriptionOwner","type":"address"},{"indexed":false,"internalType":"bytes","name":"data","type":"bytes"}],"name":"OracleRequest","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"requestId","type":"bytes32"}],"name":"OracleResponse","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"OwnershipTransferRequested","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"bytes32","name":"configDigest","type":"bytes32"},{"indexed":false,"internalType":"uint32","name":"epoch","type":"uint32"}],"name":"Transmitted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"requestId","type":"bytes32"},{"indexed":false,"internalType":"string","name":"reason","type":"string"}],"name":"UserCallbackError","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"requestId","type":"bytes32"},{"indexed":false,"internalType":"bytes","name":"lowLevelData","type":"bytes"}],"name":"UserCallbackRawError","type":"event"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"activateAuthorizedReceiver","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"senders","type":"address[]"}],"name":"addAuthorizedSenders","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"authorizedReceiverActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"deactivateAuthorizedReceiver","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"node","type":"address"}],"name":"deleteNodePublicKey","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint64","name":"subscriptionId","type":"uint64"},{"internalType":"bytes","name":"data","type":"bytes"},{"internalType":"uint32","name":"gasLimit","type":"uint32"},{"internalType":"uint256","name":"gasPrice","type":"uint256"}],"name":"estimateCost","outputs":[{"internalType":"uint96","name":"","type":"uint96"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllNodePublicKeys","outputs":[{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"bytes[]","name":"","type":"bytes[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAuthorizedSenders","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getDONPublicKey","outputs":[{"internalType":"bytes","name":"","type":"bytes"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getRegistry","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"","type":"bytes"},{"components":[{"internalType":"uint64","name":"subscriptionId","type":"uint64"},{"internalType":"address","name":"client","type":"address"},{"internalType":"uint32","name":"gasLimit","type":"uint32"},{"internalType":"uint256","name":"gasPrice","type":"uint256"}],"internalType":"struct FunctionsBillingRegistryInterface.RequestBilling","name":"","type":"tuple"}],"name":"getRequiredFee","outputs":[{"internalType":"uint96","name":"","type":"uint96"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"initialize","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"sender","type":"address"}],"name":"isAuthorizedSender","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"latestConfigDetails","outputs":[{"internalType":"uint32","name":"configCount","type":"uint32"},{"internalType":"uint32","name":"blockNumber","type":"uint32"},{"internalType":"bytes32","name":"configDigest","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"latestConfigDigestAndEpoch","outputs":[{"internalType":"bool","name":"scanLogs","type":"bool"},{"internalType":"bytes32","name":"configDigest","type":"bytes32"},{"internalType":"uint32","name":"epoch","type":"uint32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address[]","name":"senders","type":"address[]"}],"name":"removeAuthorizedSenders","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint64","name":"subscriptionId","type":"uint64"},{"internalType":"bytes","name":"data","type":"bytes"},{"internalType":"uint32","name":"gasLimit","type":"uint32"}],"name":"sendRequest","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"_signers","type":"address[]"},{"internalType":"address[]","name":"_transmitters","type":"address[]"},{"internalType":"uint8","name":"_f","type":"uint8"},{"internalType":"bytes","name":"_onchainConfig","type":"bytes"},{"internalType":"uint64","name":"_offchainConfigVersion","type":"uint64"},{"internalType":"bytes","name":"_offchainConfig","type":"bytes"}],"name":"setConfig","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes","name":"donPublicKey","type":"bytes"}],"name":"setDONPublicKey","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"node","type":"address"},{"internalType":"bytes","name":"publicKey","type":"bytes"}],"name":"setNodePublicKey","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"registryAddress","type":"address"}],"name":"setRegistry","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32[3]","name":"reportContext","type":"bytes32[3]"},{"internalType":"bytes","name":"report","type":"bytes"},{"internalType":"bytes32[]","name":"rs","type":"bytes32[]"},{"internalType":"bytes32[]","name":"ss","type":"bytes32[]"},{"internalType":"bytes32","name":"rawVs","type":"bytes32"}],"name":"transmit","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"transmitters","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"typeAndVersion","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"pure","type":"function"}];

const OracleAddress = "0xeA6721aC65BCeD841B8ec3fc5fEdeA6141a0aDE4";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PostEncryptedAccessTokenData>
) {
  const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY as string;
  const endpoint = process.env.ENDPOINT as string;
  const provider = new ethers.providers.JsonRpcProvider(endpoint);

  let { refreshToken } = req.body;

  let formData = new URLSearchParams();
  formData.append('grant_type', 'refresh_token');
  formData.append('refresh_token', refreshToken);
  formData.append('client_id', 'QmplSzVSekg4SWlsdk9HM3dvV1Q6MTpjaQ'); // Allow only StorkApp access tokens.
  let refreshAccessTokenResult = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: 'POST',
    body: formData
  });

  let newTokens = await refreshAccessTokenResult.json();
  const accessToken = newTokens.access_token;
  refreshToken = newTokens.refresh_token;

  // Verify that we recieved access token
  const client = new Client(accessToken);
  const user = await client.users.findMyUser();

  if (!user.data?.id) {
    res.status(500).json({ error: "Wrong access token to encrypt.", isError: true });
  }

  // Get DONPublicKey
  const oracle = new ethers.Contract(OracleAddress, OracleAbi, provider);
  const DONPublicKeyWithx = await oracle.getDONPublicKey();
  const DONPublicKey = DONPublicKeyWithx.slice(2); //remove 0x

  var encryptedAccessToken = "0x" +
    (await encryptWithSignature(
      relayerPrivateKey,
      DONPublicKey,
      JSON.stringify({
        accessToken
      })
    ));

  // Return encrypted message
  res.status(200).json({
    refreshToken,
    accessToken,
    encryptedAccessToken,
    isError: false
  });
}

const encryptWithSignature = async (signerPrivateKey: any, readerPublicKey: any, message: any) => {
  const signature = eth_crypto_1.default.sign(signerPrivateKey, eth_crypto_1.default.hash.keccak256(message))
  const payload = {
    message,
    signature,
  }
  return await encrypt(readerPublicKey, JSON.stringify(payload))
}
const encrypt = async (readerPublicKey: any, message: any) => {
  const encrypted = await eth_crypto_1.default.encryptWithPublicKey(readerPublicKey, message)
  return eth_crypto_1.default.cipher.stringify(encrypted)
}