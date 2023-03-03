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
import { ParsedUrlQuery } from 'querystring';
import ConfettiExplosion, { ConfettiProps } from 'react-confetti-explosion';

interface CompletedTxnInfo extends ParsedUrlQuery {
    txId: `0x${string}`,
    amount: string,
    handle: string
}

const largeProps: ConfettiProps = {
    force: 0.8,
    duration: 3000,
    particleCount: 300,
    width: 1600,
    colors: ['#041E43', '#1471BF', '#5BB4DC', '#FC027B', '#66D805'],
};

export default function Sent() {
    const router = useRouter();
    let info = router.query as CompletedTxnInfo;

    return (
        <>
            <Navbar />
            <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
                <div className="px-4 mx-auto sm:px-6 lg:px-8 max-w-7xl">
                    <div className="text-center flex items-center flex-col">
                        <h2 className="text-3xl font-bold text-gray-900">
                            Yay!
                        </h2>
                        <p className="mt-4 text-base font-medium text-gray-500">
                            <span>
                                <a target='_blank' className='underline hover:underline-offset-4' href={`${polygonMumbai.blockExplorers.etherscan.url}/tx/${info.txId}`}>View in Explorer</a>
                            </span>
                        </p>
                        <div className='items-center flex'>
                            <ConfettiExplosion {...largeProps} />
                        </div>
                    </div>

                    {info &&
                        <section className='max-w-xs mx-auto mt-5 overflow-hidden bg-white shadow rounded-xl'>
                            {
                                <TweetPrompt handle={info.handle} amount={info.amount} />
                            }
                        </section>
                    }

                </div>
            </section>
        </>
    )
}