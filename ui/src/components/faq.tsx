import { Disclosure } from '@headlessui/react'
import { Minus, Plus } from 'lucide-react'

const faqs = [
    {
        question: "What is Stork?",
        answer:
            "Stork is a non-custodial solution that enables sending digital assets to anyone who has Twitter.",
    },
    {
        question: "How it works?",
        answer:
            <span>The sender connects a preferred wallet, inputs Twitter handle and sends crypto to the handle owner. To receive the funds, the account owner authenticates with Twitter, connects a wallet, and claims the assets.
                You can read the documentation for technical details <a className='text-indigo-600 underline' href='https://github.com/layerswap/project-stork'>here</a></span>,
    },
    {
        question: "Does Stork store my assets/private keys?",
        answer:
            <span>No. Read how: <a className='text-indigo-600 underline' href='https://github.com/layerswap/project-stork'>here</a></span>,
    },
    {
        question: "Do I have to create a new wallet?",
        answer:
            "No, you don't have to sign up to a new wallet to use the app. You can choose any wallet you like and connect it for sending and receiving crypto through Stork.",
    },
    {
        question: "How do I know if I have assets to claim?",
        answer:
            "The sender might tweet or send you a message about the transfer. But that's not required for claiming. You can check your balance any time by connecting your Twitter account and claim available assets by connecting a wallet.",
    },
    {
        question: "How secure is it?",
        answer:
            "We do our best to make sure the app doesn't have security risks. However, you should keep in mind that this is the alpha version, which was developed during a hackaton in a limited timeframe. The beta version will have more enhanced secruity and safety measures implemented.",
    },
    {
        question: "Which assets are supported?",
        answer: <span>Currently, only the testnet version is available - the contracts are deployed on Polygon Mumbai and you can test with $Matic. To get test tokens, you can visit <a className='text-indigo-600 underline' href='https://faucet.polygon.technology/'>https://faucet.polygon.technology/</a>.</span>
    },
    {
        question: "Can I send NFTs?",
        answer: "You'll be able to send and receive NFTs in the beta version of Stork."
    }

]

export default function Faq() {
    return (
        <div className="bg-white">
            <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
                <div className="mx-auto max-w-4xl divide-y divide-gray-900/10">
                    <h2 className="text-2xl text-center font-bold text-gray-900 sm:text-4xl xl:text-5xl font-pj">Frequently Asked Questions</h2>
                    <dl className="mt-20 space-y-6 divide-y divide-gray-900/10">
                        {faqs.map((faq) => (
                            <Disclosure as="div" key={faq.question} className="pt-6">
                                {({ open }) => (
                                    <>
                                        <dt>
                                            <Disclosure.Button className="flex w-full items-start justify-between text-left text-gray-900">
                                                <span className="text-base font-semibold leading-7">{faq.question}</span>
                                                <span className="ml-6 flex h-7 items-center">
                                                    {open ? (
                                                        <Minus className="h-6 w-6" aria-hidden="true" />
                                                    ) : (
                                                        <Plus className="h-6 w-6" aria-hidden="true" />
                                                    )}
                                                </span>
                                            </Disclosure.Button>
                                        </dt>
                                        <Disclosure.Panel as="dd" className="mt-2 pr-12">
                                            <p className="text-base leading-7 text-gray-600">{faq.answer}</p>
                                        </Disclosure.Panel>
                                    </>
                                )}
                            </Disclosure>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    )
}
