import { Web3Button } from "@web3modal/react";

export default function Navbar() {
    return (<header className="relative py-4 md:py-6">
        <div className="container px-4 mx-auto sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
                <div className="flex-shrink-0">
                    <a href="#" title="" className="flex">
                        <p className="w-auto h-8 font-extrabold text-3xl">Stork</p>
                    </a>
                </div>
                <div className="ml-auto flex items-center">
                    <Web3Button icon="show" label="Connect Wallet" balance="show" />
                </div>
            </div>
        </div>
    </header>)
}