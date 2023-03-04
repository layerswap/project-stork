import { isMobile } from "@/lib/helpers/isMobile";
import { Web3Button } from "@web3modal/react";
import Link from "next/link";
import TwitterButton from "./twitterButton";

export default function Navbar() {
    let mobile = isMobile();

    return (<header className="relative py-4 md:py-6 z-20">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
                <div className="flex-shrink-0">
                    <Link href="/" title="" className="flex">
                        <p className="w-auto h-8 font-extrabold text-2xl sm:text-3xl">Stork</p>
                    </Link>
                </div>
                <div className="ml-auto flex items-center space-x-2">
                    <Web3Button icon={mobile ? 'hide' : 'show'} label="Connect Wallet" balance={mobile ? 'hide' : 'show'} />
                    <TwitterButton />
                </div>
            </div>
        </div>
    </header>)
}