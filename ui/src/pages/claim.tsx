import { Web3Button } from '@web3modal/react';
import { useContractRead } from 'wagmi';
import { storkABI } from '@/lib/ABIs/Stork';
import { polygonMumbai } from 'wagmi/chains';

export default function Claim() {
    let userData = JSON.parse(window.localStorage.getItem("USER_CRED") || "") as { token: string, userName: string };

    const {data, error, isFetching} = useContractRead({
        address: '0x87d02Da8e2E5Db38F34Af66F3C64d1F1245786d4',
        abi: storkABI,
        functionName: "balanceOfTwitter",
        chainId: polygonMumbai.id,
        args: [userData?.userName],
        enabled: userData?.userName !== undefined
    });

    return (
        <>
            <div>
                <p>  Yo {userData.userName} token is {userData.token};</p>
                {data && `Your balance is ${data}`}
                <p>Connect wallet to claim your balance.</p>
                <Web3Button icon="show" label="Connect Wallet" balance="show" />
            </div>
        </>
    )
}