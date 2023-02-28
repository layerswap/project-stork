import { Web3Button } from '@web3modal/react';
import { useContractRead, useAccount, usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi';
import { storkABI } from '@/lib/ABIs/Stork';
import { polygonMumbai } from 'wagmi/chains';
import { BigNumber } from 'ethers';
import { STORK_CONTRACT_ADDRESS } from '@/lib/constants';

let prepareClaimFunds = (handleOfAddressData: string | undefined, userData: { token: string, userName: string }) => usePrepareContractWrite({
    address: STORK_CONTRACT_ADDRESS,
    abi: storkABI,
    functionName: 'claimFunds',
    enabled: Boolean(userData?.token) && handleOfAddressData == userData?.userName,
    overrides: {
        gasLimit: BigNumber.from(1500000),
        type: 0
    }
});

let prepareClaimTwitterHandle = (handleOfAddressData: string | undefined, userData: { token: string, userName: string }) => usePrepareContractWrite({
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

function prepareClaim(userData: { token: string; userName: string; }, handleOfAddressData: string | undefined): ReturnType<typeof prepareClaimTwitterHandle | typeof prepareClaimFunds> {
    // If twitter account not associated, associate the handle and claim funds in one tx
    if (handleOfAddressData !== userData?.userName)
    {
        return prepareClaimTwitterHandle(handleOfAddressData, userData);
    }
    // If Twitter handle is already associated with the account, just call claim
    else{
        return prepareClaimFunds(handleOfAddressData, userData);
    }
}

function writeClaim(prepare: ReturnType<typeof prepareClaim>)
{
    // Shitty trick, think of a better one
    if (prepare.config.functionName == 'claimFunds'){
        return useContractWrite(prepare.config);
    }
    else{
        return useContractWrite(prepare.config);
    }
}

export default function Claim() {
    let userData = JSON.parse(window.localStorage.getItem("USER_CRED") || "") as { token: string, userName: string };

    const { isConnected, address } = useAccount()
    const { data, error: readError, isError: isReadError } = useReadBalance(userData?.userName);

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
        isError: isPrepareClaimFundsError
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

    const { data: writeClaimFundsData, write: writeClaimFunds, error: writeClaimFundsError, isError: isWriteClaimFundsError } = useContractWrite(prepareClaimFundsConfig)
    const { isLoading: isClaimFundsLoading, isSuccess: isClaimFundsSuccess } = useWaitForTransaction({
        hash: writeClaimFundsData?.hash,
    });

    // If twitter account not associated, associate the handle and claim funds in one tx
    const {
        config: prepareClaimHandleConfig,
        error: prepareClaimHandleError,
        isError: isPrepareClaimHandleError
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

    const prepareClaimC =  prepareClaim(userData, handleOfAddressData);
    const { data: writeData, write, isError, error }= writeClaim(prepareClaimC);
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: writeData?.hash,
    });
    
    const { data: writeClaimHandleData, write: writeClaimHandle, error: writeClaimHandleError, isError: isWriteClaimHandleError } = useContractWrite(prepareClaimHandleConfig)
    const { isLoading: isClaimHandleLoading, isSuccess: isClaimHandleSuccess } = useWaitForTransaction({
        hash: writeClaimHandleData?.hash,
    });

    let isClaimSuccess = (isClaimHandleSuccess || isClaimFundsSuccess);
    let isClaimLoading = (isClaimHandleLoading || isClaimFundsLoading);
    let claimTxHash = writeClaimHandleData?.hash || writeClaimFundsData?.hash;
    let isClaimError = isPrepareClaimHandleError || isWriteClaimHandleError || isPrepareClaimFundsError || isWriteClaimFundsError;
    let claimError = prepareClaimHandleError || writeClaimHandleError || prepareClaimFundsError || writeClaimFundsError;
    let canClaim = (Boolean(writeClaimFunds) || Boolean(writeClaimHandle)) && !isClaimLoading;

    return (
        <>
            <div>
                <p>  Yo {userData.userName} token is {userData.token};</p>
                {isWriteClaimHandleError &&
                    `Couldn't fetch balance because of ${writeClaimHandleError}`
                }
                {data &&
                    `Your balance is ${data}`
                }
                {!isConnected &&
                    <p>Connect wallet to claim your balance.</p>
                }
                {Boolean(handleOfAddressData) && handleOfAddressData !== userData?.userName &&
                    <p>Address was connected to another handle ({handleOfAddressData}) by continuing you'll connect this address to the new handle.</p>
                }
                {isConnected &&
                    <button disabled={!canClaim} onClick={() => {
                        if (handleOfAddressData !== userData?.userName)
                        {
                            writeClaimHandle?.();
                        }
                        else {
                            writeClaimFunds?.();
                        }
                    }}>{isClaimLoading ? 'Claiming...' : 'Claim'}</button>
                }
                {isClaimSuccess && (
                    <div>
                        Successfully claimed!
                        <div>
                            <a href={`${polygonMumbai.blockExplorers.etherscan.url}/tx/${claimTxHash}`}>Explorer</a>
                        </div>
                    </div>
                )}
                {isClaimError && (
                    <div>WriteError: {claimError?.message}</div>
                )}
                <Web3Button icon="show" label="Connect Wallet" balance="show" />
            </div>
        </>
    )
}

function useReadBalance(userName: string | undefined): { data: any; error: any; isError: any; } {
    return useContractRead({
        address: STORK_CONTRACT_ADDRESS,
        abi: storkABI,
        functionName: "balanceOfTwitterHandle",
        chainId: polygonMumbai.id,
        args: [userName!],
        enabled: Boolean(userName)
    });
}
