import { Web3Button } from '@web3modal/react';
import { useContractRead, useAccount, usePrepareContractWrite, useContractWrite, useWaitForTransaction, useContract, useSigner } from 'wagmi';
import { forwarderAbi, storkABI } from '@/lib/ABIs/Stork';
import { polygonMumbai } from 'wagmi/chains';
import { BigNumber, ethers } from 'ethers';
import { DEFENDER_URL, STORK_CONTRACT_ADDRESS, STORK_FORWARDER_CONTRACT_ADDRESS } from '@/lib/constants';
import { useSignTypedData } from 'wagmi'
import Navbar from '@/components/navbar';
import { useUSDprice } from '@/lib/hooks/usePrice';
import InformationCard from '@/components/informationCard';

const types = {
    ForwardRequest: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'gas', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'data', type: 'bytes' },
    ],
} as const

export default function Claim() {
    let { price: maticPrice } = useUSDprice('MATIC');
    let userData = JSON.parse(window.localStorage.getItem("USER_CRED") || "") as { token: string, userName: string, profile_image_url: string | undefined };

    const { isConnected, address } = useAccount()
    const { data: balance, error: readBalanceError, isError: isReadBalanceError } = useReadBalance(userData?.userName);
    const balanceInEth = balance != undefined ? ethers.utils.formatEther(balance.toString()) : '0';
    const balanceInUsd = Number.parseFloat(balanceInEth) * maticPrice;

    const contract = useContract({
        abi: storkABI,
        address: STORK_CONTRACT_ADDRESS,
    });

    const { data: forwarderNonce } = useContractRead({
        abi: forwarderAbi,
        address: STORK_FORWARDER_CONTRACT_ADDRESS,
        functionName: "getNonce",
        chainId: polygonMumbai.id,
        args: [address!],
        enabled: Boolean(address) && isConnected
    });

    const { data, isError, isLoading, isSuccess, signTypedData, variables } =
        useSignTypedData({
            domain: {
                chainId: polygonMumbai.id,
                name: 'MinimalForwarder',
                version: '0.0.1',
                verifyingContract: STORK_FORWARDER_CONTRACT_ADDRESS,
            },
            types,
            value: {
                nonce: forwarderNonce!,
                data: contract?.interface.encodeFunctionData('claimTwitterHandle', [userData.userName, userData.token, true])! as `0x${string}`,
                from: address!,
                to: STORK_CONTRACT_ADDRESS,
                gas: BigNumber.from(1000000),
                value: BigNumber.from(0)
            },
            onSuccess: (data, variable) => {
                fetch(DEFENDER_URL, {
                    method: 'POST',
                    body: JSON.stringify({
                        signature: data,
                        request: {
                            nonce: forwarderNonce?.toNumber(),
                            data: contract?.interface.encodeFunctionData('claimTwitterHandle', [userData.userName, userData.token, true])! as `0x${string}`,
                            from: address!,
                            to: STORK_CONTRACT_ADDRESS,
                            gas: 1000000,
                            value: 0
                        }
                    }),
                    headers: { 'Content-Type': 'application/json' },
                }).then(x => x.json().then(c => console.log(c)).catch(x => console.log(x)));
            }
        });

    const { data: handleOfAddressData } = useContractRead({
        address: STORK_CONTRACT_ADDRESS,
        abi: storkABI,
        functionName: "twitterHandleOfAddress",
        chainId: polygonMumbai.id,
        args: [address!],
        enabled: isConnected && Boolean(address)
    });

    // If Twitter handle is already associated with the account, just call claim
    const {
        config: prepareClaimFundsConfig,
        error: prepareClaimFundsError,
        isError: isPrepareClaimFundsError,
        isLoading: isPrepareClaimFundsLoading
    } = usePrepareContractWrite({
        address: STORK_CONTRACT_ADDRESS,
        abi: storkABI,
        functionName: 'claimFunds',
        enabled: Boolean(userData?.token) && handleOfAddressData == userData?.userName,
        overrides: {
            gasLimit: BigNumber.from(1500000),
            type: 0
        }
    });

    const { data: writeClaimFundsData, write: writeClaimFunds, error: writeClaimFundsError, isError: isWriteClaimFundsError, isLoading: isWriteClaimFundsLoading } = useContractWrite(prepareClaimFundsConfig)
    const { isLoading: isClaimFundsLoading, isSuccess: isClaimFundsSuccess } = useWaitForTransaction({
        hash: writeClaimFundsData?.hash,
    });

    // If twitter account not associated, associate the handle and claim funds in one tx
    const {
        config: prepareClaimHandleConfig,
        error: prepareClaimHandleError,
        isError: isPrepareClaimHandleError,
        isLoading: isPrepareClaimHandleLoading
    } = usePrepareContractWrite({
        address: STORK_CONTRACT_ADDRESS,
        abi: storkABI,
        functionName: 'claimTwitterHandle',
        args: [userData?.userName, userData?.token, true],
        enabled: Boolean(userData?.token) && handleOfAddressData !== userData?.userName,
        overrides: {
            gasLimit: BigNumber.from(1500000),
            type: 0
        }
    });

    const { data: writeClaimHandleData, write: writeClaimHandle, error: writeClaimHandleError, isError: isWriteClaimHandleError, isLoading: isWriteClaimHandleLoading } = useContractWrite(prepareClaimHandleConfig)
    const { isLoading: isClaimHandleLoading, isSuccess: isClaimHandleSuccess } = useWaitForTransaction({
        hash: writeClaimHandleData?.hash,
    });


    let isClaimSuccess = (isClaimHandleSuccess || isClaimFundsSuccess);
    let isWriteClaimLoading = (isWriteClaimFundsLoading || isWriteClaimHandleLoading);
    let isPrepareClaimLoading = (isPrepareClaimHandleLoading || isPrepareClaimFundsLoading);
    let claimTxHash = writeClaimHandleData?.hash || writeClaimFundsData?.hash;
    let isClaimError = isPrepareClaimHandleError || isWriteClaimHandleError || isPrepareClaimFundsError || isWriteClaimFundsError;
    let claimError = prepareClaimHandleError || writeClaimHandleError || prepareClaimFundsError || writeClaimFundsError;
    let canClaim = (Boolean(writeClaimFunds) || Boolean(writeClaimHandle)) && !isWriteClaimLoading && balance?.gt(0);

    return (
        <>
            <Navbar />
            <section className="py-12 sm:py-16 lg:pb-20">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="max-w-md mx-auto mt-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
                            <span>Hey 👋 </span>
                            <span> @{userData.userName}</span>
                        </h1>
                        <p className="mt-4 text-base font-medium text-gray-500 lg:text-lg">Welcome to Stork</p>
                    </div>
                    {
                        balance &&
                        <div className="max-w-sm mx-auto mt-10 overflow-hidden text-center bg-gray-900 rounded-xl">
                            <div className="p-6">
                                <p className="mt-4 text-base font-medium text-gray-500 lg:text-lg">You have:</p>

                                <div className="flex items-center justify-center px-1 space-x-3 lg:space-x-6">
                                    <div>
                                        <p className="text-4xl font-bold text-white">{balanceInEth} MATIC</p>
                                        <p className="mt-1 text-xl font-medium text-gray-400">${balanceInUsd}</p>
                                    </div>
                                </div>
                                {balance?.gt(0) &&
                                    <div className="mt-5">
                                        <button
                                            disabled={!canClaim}
                                            className="inline-flex items-center justify-center w-full px-6 py-4 text-xs font-bold tracking-widest text-white uppercase transition-all duration-200 border border-transparent rounded-lg bg-rose-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-600 hover:bg-rose-600"
                                            onClick={() => {
                                                signTypedData?.();
                                                // if (handleOfAddressData !== userData?.userName) {
                                                //     writeClaimHandle?.();
                                                // }
                                                // else {
                                                //     writeClaimFunds?.();
                                                // }
                                            }}>
                                            {isWriteClaimLoading ? 'Claiming' : isConnected ? 'Claim' : 'Connect a wallet to claim'}
                                        </button>
                                    </div>
                                }
                            </div>
                        </div>
                    }
                </div>
            </section>
            <div className='max-w-sm mx-auto mt-5 overflow-hidden bg-white shadow rounded-xl'>
                {(isWriteClaimLoading || isPrepareClaimLoading) &&
                    <InformationCard isLoading={true} text={isPrepareClaimLoading ? 'Confirm transaction with your wallet' : (isWriteClaimLoading ? 'Transaction in progress' : '')} type='wallet' />
                }
                {(isClaimError) && (
                    <InformationCard isLoading={false} text={(claimError)?.message} type='error' />
                )}
                {isReadBalanceError &&
                    <InformationCard isLoading={false} text={(readBalanceError)?.message} type='error' />
                }
                {isClaimSuccess && (
                    <InformationCard isLoading={false} text={
                        <span>
                            Successfully claimed!&nbsp;
                            <span>
                                <a className='underline hover:underline-offset-4' href={`${polygonMumbai.blockExplorers.etherscan.url}/tx/${claimTxHash}`}>View in Explorer</a>
                            </span>
                        </span>
                    } type='wallet' />
                )}
            </div>
        </>
    )
}

function useReadBalance(userName: string | undefined): typeof data {
    let data = useContractRead({
        address: STORK_CONTRACT_ADDRESS,
        abi: storkABI,
        functionName: "balanceOfTwitterHandle",
        chainId: polygonMumbai.id,
        args: [userName!],
        enabled: Boolean(userName)
    });

    return data;
}
