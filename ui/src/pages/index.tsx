import { GetClients } from "../lib/twitterClient";
import { Web3Button } from '@web3modal/react';
import { useRouter } from "next/router";
import { useState } from "react";

function getTwitterOauthUrlAndState() {
  let { authClient } = GetClients();

  let state = crypto.randomUUID();
  const authUrl = authClient.generateAuthURL({
    state: state,
    code_challenge_method: "plain",
    code_challenge: state
  });


  return { authUrl: authUrl, state: state };
}

export default function Home() {
  let router = useRouter();
  const [handle, setHandle] = useState<string>();

  return (
    <>

      <div className="relative bg-gray-50">
        <div className="absolute bottom-0 right-0 overflow-hidden lg:inset-y-0">
          <img className="w-auto h-full" src="https://d33wubrfki0l68.cloudfront.net/1e0fc04f38f5896d10ff66824a62e466839567f8/699b5/images/hero/3/background-pattern.png" alt="" />
        </div>

        <header className="relative py-4 md:py-6">
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
        </header>

        <section className="relative py-12 sm:py-16 lg:py-20 lg:pb-36">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="grid max-w-lg grid-cols-1 mx-auto lg:max-w-full lg:items-center lg:grid-cols-2 gap-y-12 lg:gap-x-8">
              <div>
                <div className="text-center lg:text-left">
                  <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl sm:leading-tight lg:leading-tight lg:text-6xl font-pj">Send $MATIC to anyone with a twitter handle</h1>
                  <p className="mt-2 text-lg text-gray-600 sm:mt-8 font-inter">Stork enables anyone on Twitter to leverage their social identity for transacting digital assets</p>

                  <form onSubmit={(e)=>{
                    e.preventDefault();
                    router.push(`/send?handle=${handle}`)
                  }} method="POST" className="mt-8 mb-2 sm:mt-10">
                    <div className="relative p-2 sm:border sm:border-gray-400 group sm:rounded-xl sm:focus-within:ring-1 sm:focus-within:ring-gray-900 sm:focus-within:border-gray-900">
                      <input
                        type="text"
                        name="handle"
                        onChange={(e) => {
                          setHandle(e.target.value);
                        }}
                        id="handle"
                        placeholder="@handle"
                        className="block w-full px-4 py-4 text-gray-900 placeholder-gray-500 bg-transparent border border-gray-400 outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 rounded-xl sm:border-none sm:focus:ring-0 sm:focus:border-transparent"
                      />
                      <div className="mt-4 sm:mt-0 sm:absolute sm:inset-y-0 sm:right-0 sm:flex sm:items-center sm:pr-2">
                        <button type="submit" className="inline-flex px-6 py-3 text-lg font-bold text-white transition-all duration-200 bg-gray-900 rounded-lg focus:outline-none focus:bg-gray-600 font-pj hover:bg-gray-600">Send</button>
                      </div>
                    </div>

                  </form>
                  <button
                    onClick={() => {
                      let { authUrl, state } = getTwitterOauthUrlAndState();
                      window.localStorage.setItem('OAUTH_STATE', state);
                      router.push(authUrl);

                    }}
                    title=""
                    className="inline-flex items-center justify-center w-full px-6 py-3 mt-4 text-lg font-bold text-gray-900 transition-all duration-200 border-2 border-gray-400 sm:w-auto sm:mt-0 rounded-xl font-pj focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-gray-900 focus:bg-gray-900 hover:text-white focus:text-white hover:border-gray-900 focus:border-gray-900"
                    role="button"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                    </svg>

                    Check your balance
                  </button>
                </div>

                <div className="flex items-center justify-center mt-10 space-x-6 lg:justify-start sm:space-x-8">
                  <div className="flex items-center">
                    <p className="text-3xl font-medium text-gray-900 sm:text-4xl font-pj">Fully</p>
                    <p className="ml-3 text-sm text-gray-900 font-pj">Non<br />Custodial</p>
                  </div>

                  <div className="hidden sm:block">
                    <svg className="text-gray-400" width="16" height="39" viewBox="0 0 16 39" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <line x1="0.72265" y1="10.584" x2="15.7226" y2="0.583975"></line>
                      <line x1="0.72265" y1="17.584" x2="15.7226" y2="7.58398"></line>
                      <line x1="0.72265" y1="24.584" x2="15.7226" y2="14.584"></line>
                      <line x1="0.72265" y1="31.584" x2="15.7226" y2="21.584"></line>
                      <line x1="0.72265" y1="38.584" x2="15.7226" y2="28.584"></line>
                    </svg>
                  </div>

                  <div className="flex items-center">
                    <p className="text-3xl font-medium text-gray-900 sm:text-4xl font-pj">$1M+</p>
                    <p className="ml-3 text-sm text-gray-900 font-pj">Transactions<br />Completed</p>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block">
                <img className="w-full" src="../heroimage.png" alt="" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </>)
};