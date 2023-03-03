import { Signer } from "ethers";


const EIP712Domain = [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' }
];

const ForwardRequest = [
    { name: 'from', type: 'address' },
    { name: 'to', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'gas', type: 'uint256' },
    { name: 'nonce', type: 'uint256' },
    { name: 'data', type: 'bytes' },
];

export function getMetaTxTypeData(chainId: string, verifyingContract: string) {
    return {
        types: {
            EIP712Domain,
            ForwardRequest,
        },
        domain: {
            name: 'MinimalForwarder',
            version: '0.0.1',
            chainId,
            verifyingContract,
        },
        primaryType: 'ForwardRequest',
    }
};

export async function signTypedData(signer:Signer, from, data) {

    // Otherwise, send the signTypedData RPC call
    // Note that hardhatvm and metamask require different EIP712 input
    const isHardhat = data.domain.chainId == 31337;
    const [method, argData] = isHardhat
        ? ['eth_signTypedData', data]
        : ['eth_signTypedData_v4', JSON.stringify(data)]
    return await signer.sen .send(method, [from, argData]);
}

async function buildRequest(forwarder, input) {
    const nonce = await forwarder.getNonce(input.from).then(nonce => nonce.toString());
    return { value: 0, gas: 1e6, nonce, ...input };
}

async function buildTypedData(forwarder, request) {
    const chainId = await forwarder.provider.getNetwork().then(n => n.chainId);
    const typeData = getMetaTxTypeData(chainId, forwarder.address);
    return { ...typeData, message: request };
}

async function signMetaTxRequest(signer, forwarder, input) {
    const request = await buildRequest(forwarder, input);
    const toSign = await buildTypedData(forwarder, request);
    const signature = await signTypedData(signer, input.from, toSign);
    return { signature, request };
}
