import { useWeb3Modal, Web3Button } from '@web3modal/react';
import { useContractRead, useAccount, usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi';
import { storkABI } from '@/lib/ABIs/Stork';
import { polygonMumbai } from 'wagmi/chains';
import { BigNumber, ethers } from 'ethers';
import { useState } from 'react';
import { STORK_CONTRACT_ADDRESS } from '@/lib/constants';

export default function Send() {
    const [handle, setHandle] = useState<string>();
    const [amount, setAmount] = useState<string>();
    const { isConnected } = useAccount()
    const { open } = useWeb3Modal();

    const {
        config,
        error: prepareError,
        isError: isPrepareError
    } = usePrepareContractWrite({
        address: STORK_CONTRACT_ADDRESS,
        abi: storkABI,
        functionName: 'sendToTwitterHandle',
        args: [handle!],
        enabled: Boolean(handle) && Boolean(amount) && isConnected,
        overrides: {
            value: Boolean(amount) ? ethers.utils.parseEther(amount!) : BigNumber.from(0),
            gasLimit: BigNumber.from(1500000)
        }
    });

    const { data: writeData, write, error: writeError, isError: isWriteError, isLoading: isWriteLoading } = useContractWrite(config)
    const { isLoading: isTransactionPending, isSuccess, data } = useWaitForTransaction({
        hash: writeData?.hash,
    });

    return (
        <>
            <div hidden={isWriteLoading || isTransactionPending || isSuccess}>
                <p>Connect wallet and enter handle to send.</p>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    write?.();
                }}>
                    <input name='handle' placeholder='handle' onChange={e => setHandle(e.target.value)}></input>
                    <div><input name='amount' type='number' step="0.000000001" placeholder='amount' onChange={e => setAmount(e.target.value)}></input>Matic</div>
                    <button disabled={!Boolean(handle) || !Boolean(amount)} onClick={(e) => {
                        if (!isConnected) {
                            e.preventDefault();
                            open?.();
                        }
                    }}>{!Boolean(handle) ? 'Enter handle' : (!Boolean(amount) ? 'Enter amount' : (!isConnected ? 'Connect wallet' : 'Send'))}</button>
                </form>
                <Web3Button icon="show" label="Connect Wallet" balance="show" />
                {(isPrepareError || isWriteError) && (
                    <div>WriteError: {(prepareError || writeError)?.message}</div>
                )}
            </div>
            <p hidden={!isWriteLoading}>Send in progress</p>
            <p hidden={!isTransactionPending}>Transaction publishing</p>
            {isSuccess && (
                <div>
                    Successfully sent!
                    <div>
                        <a href={`${polygonMumbai.blockExplorers.etherscan.url}/tx/${writeData?.hash}`}>Explorer</a>
                    </div>
                </div>
            )}
        </>
    )
}