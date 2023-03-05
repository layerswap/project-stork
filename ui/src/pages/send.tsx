import { useWeb3Modal, Web3Button } from '@web3modal/react';
import { useAccount, usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi';
import { storkABI } from '@/lib/ABIs/Stork';
import { polygonMumbai } from 'wagmi/chains';
import { BigNumber, ethers } from 'ethers';
import { useEffect, useRef, useState } from 'react';
import { STORK_CONTRACT_ADDRESS } from '@/lib/constants';
import Navbar from '@/components/navbar';
import { motion, useAnimation, useInView } from 'framer-motion';
import InformationCard from '@/components/informationCard';
import { useRouter } from 'next/router';
import FlipNumbers from 'react-flip-numbers';
import { ArrowUpDown } from 'lucide-react';
import { useUSDprice } from '@/lib/hooks/swr/usePrice';
import Background from '@/components/background';

export default function Send() {
    const router = useRouter();
    const [handle, setHandle] = useState<string>();
    const [amount, setAmount] = useState<string>();
    const [handleChanged, setHandleChanged] = useState<boolean>();
    const [amountIsInUSD, setAmountInUSD] = useState<boolean>();
    const usdPriceData = useUSDprice('MATIC');
    const { handle: handleQuery } = router.query;
    const [amountChangedAfterConv, setAmountChangedAfterConf] = useState<boolean>(false);
    const [amountBeforeConv, setAmountBeforeConf] = useState<string>();
    const numericAmount = amount != undefined ? Number.parseFloat(amount) : 0;

    useEffect(() => {
        if (Boolean(handleQuery) && typeof handleQuery == 'string') {
            setHandle(handleQuery.replace('@', ''))
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
        enabled: Boolean(handle) && isConnected && numericAmount > 0,
        overrides: {
            value: numericAmount > 0 ? ethers.utils.parseEther((amountIsInUSD ? usdToAsset(numericAmount, usdPriceData.price) : numericAmount)?.toString()) : BigNumber.from(0),
            gasLimit: BigNumber.from(1500000)
        }
    });

    const { data: writeData, write, error: writeError, isError: isWriteError, isLoading: isWriteLoading } = useContractWrite(config)
    const { isLoading: isTransactionPending, isSuccess, data } = useWaitForTransaction({
        hash: writeData?.hash,
        onSuccess: (d) => {
            router.push(`/sent?txId=${d.transactionHash}&handle=${handle}&amount=${numericAmount}`);
        }
    });

    return (
        <Background>
            <Navbar />
            <section className="py-12">
                <div className="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[-20rem]">
                    <svg
                        className="relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem]"
                        viewBox="0 0 1155 678"
                    >
                        <path
                            fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
                            fillOpacity=".3"
                            d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
                        />
                        <defs>
                            <linearGradient
                                id="45de2b6b-92d5-4d68-a6a0-9b9b2abad533"
                                x1="1155.49"
                                x2="-78.208"
                                y1=".177"
                                y2="474.645"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop stopColor="#9089FC" />
                                <stop offset={1} stopColor="#FF80B5" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
                    <div className="text-center">
                        <motion.div
                            key={handleChanged ? "withoutHandle" : "withHandle"}
                            animate={{ opacity: 1 }}
                            initial={{ opacity: 0 }}
                            transition={{ delay: 0.1 }} className="text-4xl font-bold text-slate-700 flex flex-col items-center justify-center">
                            <div className='flex items-center'>
                                <span>Send&nbsp;</span>
                                {numericAmount > 0 &&
                                    <FlipNumbers height={32} width={22} color="black" duration={1} background="transparent" play numbers={numericAmount.toString()} />
                                }
                                <span>{numericAmount > 0 && <span>&nbsp;</span>}{amountIsInUSD ? 'USD' : 'MATIC'}</span>
                            </div>
                            <div className={handleChanged ? 'inline' : 'hidden'}><span className='font-semibold'>to&nbsp;</span><span className='text-black'>@{handle}</span></div>
                        </motion.div>
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
                                            <input value={amount ?? ''}
                                                pattern="^[0-9]*[.,]?[0-9]*$"
                                                inputMode='decimal'
                                                onInput={(event: React.ChangeEvent<HTMLInputElement>) => { replaceComma(event); limitDecimalPlaces(event, 4) }}
                                                onChange={e => {
                                                    if (/^[0-9]*[.,]?[0-9]*$/.test(e.target.value)) {
                                                        setAmount(e.target.value);
                                                        setAmountChangedAfterConf(true);
                                                    }
                                                }}
                                                type="text" name="amount" id="amount" placeholder="4.20" className="text-base font-medium text-gray-900 border flex-1 block w-full min-w-0 py-3 pl-4 pr-16 placeholder-gray-500 border-gray-300 rounded-l-lg ring-inset focus:ring-1 focus:outline-none focus:ring-gray-800 focus:border-gray-800 sm:text-sm caret-gray-800" />
                                            <motion.button
                                                layout
                                                transition={{
                                                    duration: 0.1
                                                }}
                                                onClick={() => {
                                                    setAmountBeforeConf(amount);

                                                    if (!amountChangedAfterConv && amountBeforeConv != undefined && Number.parseFloat(amountBeforeConv) > 0) {
                                                        setAmount(amountBeforeConv);
                                                    }
                                                    else {
                                                        if (amount && usdPriceData?.price) {
                                                            if (amountIsInUSD) {
                                                                setAmount(usdToAsset(numericAmount, usdPriceData.price).toString())
                                                            }
                                                            else {
                                                                setAmount(assetToUsd(numericAmount, usdPriceData.price).toString())
                                                            }
                                                        }

                                                    }

                                                    setAmountInUSD(!amountIsInUSD);
                                                    setAmountChangedAfterConf(false);
                                                }}
                                                type="button"
                                                className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-lg px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                            >
                                                <ArrowUpDown height={18} width={18} />
                                                {amountIsInUSD ? 'USD' : 'MATIC'}
                                            </motion.button>
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
                                    <button type='submit' disabled={!Boolean(handle) || numericAmount <= 0 || isWriteLoading || isTransactionPending} onClick={(e) => {
                                        if (!isConnected) {
                                            e.preventDefault();
                                            open?.();
                                        }
                                    }}
                                        className="inline-flex items-center justify-center w-full px-6 py-4 text-xs font-bold tracking-widest text-white uppercase transition-all duration-200 bg-gray-900 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-gray-700 disabled:hover:bg-slate-700 disabled:bg-slate-700"
                                    >{!Boolean(handle) ? 'Enter handle' : (numericAmount <= 0 ? 'Enter amount' : (!isConnected ? 'Connect wallet' : isWriteLoading || isTransactionPending ? 'Sending...' : 'Send'))}</button>
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
        </Background>
    )
}

function assetToUsd(amount: number, usdPrice: number) {
    return Number.parseFloat((Number.parseFloat(amount.toPrecision(4)) / usdPrice).toFixed(4));
}

function usdToAsset(amount: number, usdPrice: number) {
    return Number.parseFloat((Number.parseFloat(amount.toPrecision(4)) * usdPrice).toFixed(4));
}

function limitDecimalPlaces(e: React.ChangeEvent<HTMLInputElement>, count: number) {
    if (e.target.value.indexOf('.') == -1) { return; }
    if ((e.target.value.length - e.target.value.indexOf('.')) > count) {
        e.target.value = ParseFloat(e.target.value, count).toString();
    }
}

function ParseFloat(str: string, val: number) {
    str = str.toString();
    str = str.slice(0, (str.indexOf(".")) + val + 1);
    return Number(str);
}

function replaceComma(e: React.ChangeEvent<HTMLInputElement>) {
    var val = e.target.value;
    if (val.match(/\,/)) {
        val = val.replace(/\,/g, '.');
        e.target.value = val;
    }
}