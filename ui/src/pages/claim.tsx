import { Web3Button } from '@web3modal/react';
import { useContractRead, useAccount, usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi';
import { storkABI } from '@/lib/ABIs/Stork';
import { polygonMumbai } from 'wagmi/chains';
import { BigNumber } from 'ethers';

export default function Claim() {
    let userData = JSON.parse(window.localStorage.getItem("USER_CRED") || "") as { token: string, userName: string };

    const { isConnected } = useAccount()

    const { data, error: readError, isError: isReadError } = useContractRead({
        address: '0x87d02Da8e2E5Db38F34Af66F3C64d1F1245786d4',
        abi: storkABI,
        functionName: "balanceOfTwitter",
        chainId: polygonMumbai.id,
        args: [userData?.userName],
        enabled: Boolean(userData?.userName)
    });

    const {
        config,
        error: prepareError,
        isError: isPrepareError
    } = usePrepareContractWrite({
        address: "0x87d02Da8e2E5Db38F34Af66F3C64d1F1245786d4",
        abi: storkABI,
        functionName: 'prepareClaim',
        args: [userData?.token],
        enabled: Boolean(userData?.token),
        overrides: {
            gasLimit: BigNumber.from(1500000),
        }
    });

    const { data: writeData, write, error: writeError, isError: isWriteError } = useContractWrite(config)
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: writeData?.hash,
    });

    return (
        <>
            <div>
                <p>  Yo {userData.userName} token is {userData.token};</p>
                {isWriteError &&
                    `Couldn't fetch balance because of ${writeError}`
                }
                {data &&
                    `Your balance is ${data}`
                }
                {!isConnected &&
                    <p>Connect wallet to claim your balance.</p>
                }
                {isConnected &&
                    <button disabled={!write || isLoading} onClick={() => {
                        write?.();
                    }}>{isLoading ? 'Claiming...' : 'Claim'}</button>
                }
                {isSuccess && (
                    <div>
                        Successfully claimed!
                        <div>
                            <a href={`${polygonMumbai.blockExplorers.etherscan.url}/tx/${writeData?.hash}`}>Explorer</a>
                        </div>
                    </div>
                )}
                {(isPrepareError || isWriteError) && (
                    <div>WriteError: {(prepareError || writeError)?.message}</div>
                )}
                <Web3Button icon="show" label="Connect Wallet" balance="show" />
            </div>
        </>
    )
}