import { GetClients } from "../lib/twitterClient";
import { useRouter } from "next/router";
import { useState } from "react";
import Navbar from "@/components/navbar";
import { useTwitterConnect } from "@/lib/hooks/useTwitterConnect";
import { isMobile } from "@/lib/helpers/isMobile";
import Link from "next/link";
import { Dialog, DialogContent, DialogTrigger } from "@/components/dialog";
import TwitterButton from "@/components/twitterButton";
import Background from "@/components/background";
import { Wallet, ChevronRight } from "lucide-react"

export default function Home() {
  let router = useRouter();
  const [handle, setHandle] = useState<string>();
  const [dialogIsOpen, setDialogIsOpen] = useState<boolean>();

  let { isConnected } = useTwitterConnect(undefined, () => {
    dialogIsOpen && router.push('/claim');
  });

  return (
    <>
      <Background>
        <Navbar />
        <Dialog open={dialogIsOpen} onOpenChange={setDialogIsOpen}>
          <DialogContent className="bg-gradient-to-br from-blue-50 to-white">
            <div className="flex flex-col items-center mx-12">
              <p className="w-auto h-8 text-black font-extrabold text-2xl sm:text-3xl">Stork</p>
              <h1 className="text-2xl mt-4 font-bold text-gray-800 sm:text-xl lg:text-4xl">
                Check your balance
              </h1>
              <h1 className="text-md mt-1 mb-8 font-bold text-gray-600">
                Build your on-chain wealth
              </h1>
              <TwitterButton />
            </div>
          </DialogContent>
        </Dialog>
        <div className="relative">
          <section className="py-12 sm:py-16 lg:py-20 lg:pb-36">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
              <div className="max-w-2xl mx-auto text-center">
                <p className="mt-5 text-4xl font-bold leading-tight text-gray-900 sm:leading-tight sm:text-5xl lg:text-6xl lg:leading-tight font-pj">
                  Send $MATIC to
                  <span className="relative inline-flex sm:inline">
                    <span className="bg-gradient-to-r from-[#44BCFF] via-[#FF44EC] to-[#FF675E] blur-lg filter opacity-30 w-full h-full absolute inset-0"></span>
                    <span className="relative"> anyone </span>
                  </span>
                  with a twitter handle
                </p>

                <div className="px-8 sm:items-center sm:justify-center sm:px-0 sm:space-x-5 sm:flex mt-9">
                  <Link
                    href="/send"
                    title=""
                    className="inline-flex items-center justify-center w-full px-8 py-3 text-lg font-bold text-white transition-all duration-200 bg-gray-900 border-2 border-transparent sm:w-auto rounded-xl font-pj hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                    role="button"
                  >
                    Send to @anyone
                  </Link>

                  <button
                    onClick={() => {
                      if (isConnected) {
                        router.push('/claim');
                      }
                      else {
                        setDialogIsOpen(true);
                      }
                    }}
                    title=""
                    className="gap-x-2 inline-flex items-center justify-center w-full px-6 py-3 mt-4 text-lg font-bold text-gray-900 transition-all duration-200 border-2 border-gray-400 sm:w-auto sm:mt-0 rounded-xl font-pj focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-gray-900 focus:bg-gray-900 hover:text-white focus:text-white hover:border-gray-900 focus:border-gray-900"
                    role="button"
                  >
                    <Wallet />
                    Check your balance
                  </button>
                </div>

                <p className="mt-8 text-base text-gray-500 font-inter">Stork enables anyone on Twitter to leverage their social identity for transacting digital assets</p>
              </div>

              <div className="pb-1">
                <div className="relative">
                  <div className="absolute inset-0 h-2/3"></div>
                  <div className="relative mx-auto">
                    <div className="lg:max-w-6xl lg:mx-auto">
                      <img className="transform scale-110" src="https://cdn.rareblocks.xyz/collection/clarity/images/hero/2/illustration.png" alt="" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </Background>
    </>)
};