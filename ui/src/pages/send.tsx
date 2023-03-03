import { useWeb3Modal, Web3Button } from '@web3modal/react';
import { useAccount, usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi';
import { storkABI } from '@/lib/ABIs/Stork';
import { polygonMumbai } from 'wagmi/chains';
import { BigNumber, ethers } from 'ethers';
import { useEffect, useRef, useState } from 'react';
import { STORK_CONTRACT_ADDRESS } from '@/lib/constants';
import Navbar from '@/components/navbar';
import { motion, useAnimation, useInView } from 'framer-motion';
import MotionCharacter from '@/components/motionCharacter';
import InformationCard from '@/components/informationCard';
import TweetPrompt from '@/components/tweetPrompt';
import { useRouter } from 'next/router';

export default function Send() {
    const router = useRouter();
    const [handle, setHandle] = useState<string>();
    const [amount, setAmount] = useState<number>();
    const [handleChanged, setHandleChanged] = useState<boolean>();

    const { handle: handleQuery } = router.query;

    useEffect(() => {
        if (Boolean(handleQuery) && typeof handleQuery == 'string') {
            setHandle(handleQuery)
            setHandleChanged(true);
        }

    }, [handleQuery])

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
        enabled: Boolean(handle) && isConnected && amount != undefined && amount > 0,
        overrides: {
            value: amount?.toString() != undefined ? ethers.utils.parseEther(amount?.toString()) : BigNumber.from(0),
            gasLimit: BigNumber.from(1500000)
        }
    });

    const { data: writeData, write, error: writeError, isError: isWriteError, isLoading: isWriteLoading } = useContractWrite(config)
    const { isLoading: isTransactionPending, isSuccess, data } = useWaitForTransaction({
        hash: writeData?.hash,
        onSuccess: (d) => {
            router.push(`/sent?txId=${d.transactionHash}&handle=${handle}&amount=${amount}`);
        }
    });

    return (
        <>
            <Navbar />
            <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
                <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
                    <div className="text-center">
                        <motion.h2 layout transition={{
                            type: "spring",
                            stiffness: 350,
                            damping: 25,
                        }} className="text-3xl font-bold text-gray-900">
                            Send
                            {amount != undefined && amount > 0 && <span>&nbsp;
                                {
                                    amount?.toString().split('').map((item, index) => <MotionCharacter key={index.toString()} text={item} />)}
                            </span>
                            }
                            <span>&nbsp;$MATIC</span>
                            <br />
                            {handleChanged && <span>to @{handle}</span>}
                        </motion.h2>
                    </div>
                    <div className="max-w-xs mx-auto mt-10 overflow-hidden bg-white shadow rounded-xl">
                        <div className="p-6 sm:p-8">
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                write?.();
                            }}>
                                <div className="space-y-5">

                                    <div className="flex flex-col">
                                        <label htmlFor='amount' className="text-base font-medium text-gray-900">
                                            Amount:
                                        </label>

                                        <div className="relative flex">
                                            <input step="0.000000001" onChange={e => {
                                                let parsedValue = Number.parseFloat(e.target.value);
                                                if (isNaN(parsedValue) || parsedValue < 0) {
                                                    parsedValue = 0;
                                                }

                                                setAmount(parsedValue)
                                            }} type="number" name="amount" id="amount" placeholder="4.20" className="text-base font-medium text-gray-900 border flex-1 block w-full min-w-0 py-3 pl-4 pr-16 placeholder-gray-500 border-gray-300 rounded-lg focus:ring-1 focus:outline-none focus:ring-gray-800 focus:border-gray-800 sm:text-sm caret-gray-800" />
                                            <div className="absolute inset-y-0 text-base font-medium right-0 flex items-center pr-4 text-gray-400 rounded-r-lg pointer-events-none sm:text-sm">MATIC</div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <label htmlFor='handle' className="text-base font-medium text-gray-900">
                                            To:
                                        </label>

                                        <input value={handle} onBlur={(e) => setHandleChanged(Boolean(e.target.value))} onChange={e => {
                                            let value = e.target.value;
                                            value = value.replace('@', '');
                                            setHandle(value);
                                        }} type="text" name="handle" id="handle" placeholder="@username" className="text-base font-medium text-gray-900 border flex-1 block w-full min-w-0 py-3 pl-4 pr-16 placeholder-gray-500 border-gray-300 rounded-lg focus:ring-1 focus:outline-none focus:ring-gray-800 focus:border-gray-800 sm:text-sm caret-gray-800" />
                                    </div>
                                    <button type='submit' disabled={!Boolean(handle) || amount == undefined || amount <= 0 || isWriteLoading || isTransactionPending} onClick={(e) => {
                                        if (!isConnected) {
                                            e.preventDefault();
                                            open?.();
                                        }
                                    }}
                                        className="inline-flex items-center justify-center w-full px-6 py-4 text-xs font-bold tracking-widest text-white uppercase transition-all duration-200 bg-gray-900 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-gray-700 disabled:hover:bg-slate-700 disabled:bg-slate-700"
                                    >{!Boolean(handle) ? 'Enter handle' : (!Boolean(amount) ? 'Enter amount' : (!isConnected ? 'Connect wallet' : 'Send'))}</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className='max-w-xs mx-auto mt-5 overflow-hidden bg-white shadow rounded-xl'>
                        {(isWriteLoading || isTransactionPending) &&
                            <InformationCard isLoading={true} text={isWriteLoading ? 'Confirm transaction with your wallet' : (isTransactionPending ? 'Transaction in progress' : '')} type='wallet' />
                        }
                        {(isPrepareError || isWriteError) && (
                            <InformationCard isLoading={false} text={(prepareError || writeError)?.message} type='error' />
                        )}
                        {isSuccess && (
                            <InformationCard isLoading={false} text={
                                <span>
                                    Successfully sent!&nbsp;
                                    <span>
                                        <a className='underline hover:underline-offset-4' href={`${polygonMumbai.blockExplorers.etherscan.url}/tx/${writeData?.hash}`}>View in Explorer</a>
                                    </span>
                                </span>
                            } type='wallet' />
                        )}
                    </div>
                </div>
            </section>
        </>
        // <>
        //     <div hidden={isWriteLoading || isTransactionPending || isSuccess}>
        //         <form onSubmit={(e) => {
        //             e.preventDefault();
        //             write?.();
        //         }}>
        //             <input name='handle' placeholder='handle' onChange={e => setHandle(e.target.value)}></input>
        //             <div><input name='amount' type='number' step="0.000000001" onChange={e => setAmount(e.target.value)}></input>Matic</div>
        //             <button disabled={!Boolean(handle) || !Boolean(amount)} onClick={(e) => {
        //                 if (!isConnected) {
        //                     e.preventDefault();
        //                     open?.();
        //                 }
        //             }}>{!Boolean(handle) ? 'Enter handle' : (!Boolean(amount) ? 'Enter amount' : (!isConnected ? 'Connect wallet' : 'Send'))}</button>
        //         </form>
        //         <Web3Button icon="show" label="Connect Wallet" balance="show" />
        //     </div>
        //     <p hidden={!isWriteLoading}>Send in progress</p>
        //     <p hidden={!isTransactionPending}>Transaction publishing</p>
        //     {isSuccess && (
        //         <div>
        //             Successfully sent!
        //             <div>
        //                 <a href={`${polygonMumbai.blockExplorers.etherscan.url}/tx/${writeData?.hash}`}>Explorer</a>
        //             </div>
        //         </div>
        //     )}
        // </>
    )
}