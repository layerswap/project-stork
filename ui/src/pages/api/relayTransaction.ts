import { PostRelyTransactionData } from '@/lib/models/relyTransaction'
import type { NextApiRequest, NextApiResponse } from 'next'
const ethers = require("ethers");

const ForwarderAbi = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "inputs": [{ "components": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "uint256", "name": "gas", "type": "uint256" }, { "internalType": "uint256", "name": "nonce", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "internalType": "struct MinimalForwarder.ForwardRequest", "name": "req", "type": "tuple" }, { "internalType": "bytes", "name": "signature", "type": "bytes" }], "name": "execute", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }, { "internalType": "bytes", "name": "", "type": "bytes" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }], "name": "getNonce", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "components": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "value", "type": "uint256" }, { "internalType": "uint256", "name": "gas", "type": "uint256" }, { "internalType": "uint256", "name": "nonce", "type": "uint256" }, { "internalType": "bytes", "name": "data", "type": "bytes" }], "internalType": "struct MinimalForwarder.ForwardRequest", "name": "req", "type": "tuple" }, { "internalType": "bytes", "name": "signature", "type": "bytes" }], "name": "verify", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }];
const ForwarderAddress = "0x91303F36Fda85AaED2c12AdB9C2EE0A91f8CAb9F";

async function relay(forwarder: any, request: any, signature: string) {
  // Validate request on the forwarder contract
  const valid = await forwarder.verify(request, signature);
  if (!valid) throw new Error(`Invalid request`);

  // Send meta-tx through relayer to the forwarder contract
  const gasLimit = (500_000).toString();
  return await forwarder.execute(request, signature, { gasLimit });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PostRelyTransactionData>
) {
  const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY as string;
  const endpoint = process.env.ENDPOINT as string;

  const provider = new ethers.providers.JsonRpcProvider(endpoint);
  const signer = new ethers.Wallet(relayerPrivateKey, provider);

  const { request, signature } = req.body;

  // Initialize Relayer provider and signer, and forwarder contract
  const forwarder = new ethers.Contract(ForwarderAddress, ForwarderAbi, signer);

  // Validate request on the forwarder contract
  const valid = await forwarder.verify(request, signature);
  if (!valid) res.status(500).json({ error: "Invalid request.", isError: true });


  // Send meta-tx through relayer to the forwarder contract
  const gasLimit = (500_000).toString();
  const tx = await forwarder.execute(request, signature, { gasLimit });

  // Return encrypted message
  res.status(200).json({
    txHash: tx.hash,
    isError: false
  });
}