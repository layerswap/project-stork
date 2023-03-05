import { isMobile } from "@/lib/helpers/isMobile";
import { useTwitterConnect } from "@/lib/hooks/useTwitterConnect";
import { cn } from "@/lib/utils";
import { Web3Button } from "@web3modal/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAccount } from "wagmi";
import TwitterButton from "./twitterButton";

export default function Navbar() {
    let mobile = isMobile();

    let { isConnected: walletConnected } = useAccount();
    let { isConnected: twitterConnected } = useTwitterConnect();
    let router = useRouter();
    let showConnects = walletConnected || twitterConnected || router.asPath != '/';
    let showConnectWallet = router.asPath != '/';

    return (<header className="relative py-4 md:py-6">
        <div className={cn(!showConnects ? "" : "shadow-md rounded-lg bg-white/60 ", "container px-4 mx-auto sm:px-6 lg:px-8 sm:bg-transparent sm:shadow-none")}>
            <div className={cn(showConnects ? "justify-between" : "justify-center", " flex items-center")}>
                <div className="flex-shrink-0">
                    <Link href="/" title="" className="flex">
                        <p className="w-auto h-8 font-extrabold text-3xl">Stork</p>
                    </Link>
                </div>

                {showConnects &&
                    <div className="ml-auto flex items-center space-x-2 sm:bg-white/60 sm:shadow-md rounded-lg py-3 px-5">
                        {(showConnectWallet || walletConnected) && <Web3Button icon={mobile ? 'hide' : 'show'} label="Connect Wallet" balance={mobile ? 'hide' : 'show'} />}
                        {twitterConnected && <TwitterButton />}
                    </div>
                }
            </div>
        </div>
    </header>)
}