import { useState } from "react";

const TweetPrompt = (props: { tweetText: string | undefined }) => {
    const [text, setText] = useState(props.tweetText);
    let tweetHref = `http://twitter.com/share?text=${props.tweetText} %0ATo Claim&url=https://layerswap.io&hashtags=storkApp`
    return (
        <div className="flex items-end justify-center w-full h-full">
            <div className="p-6 sm:p-8">
                <form action="#" method="POST" className="space-y-5">
                    <div>
                        <textarea value={props.tweetText} name="tweetText" id="tweetText"
                            className="block w-full px-3 py-2 text-base text-gray-900 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none" />
                    </div>
                    <a href={tweetHref}
                        target='_blank'
                        className="inline-flex items-center justify-center w-full px-6 py-4 text-xs font-bold tracking-widest text-white uppercase transition-all duration-200 bg-[#1DA1F2] border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 hover:bg-[#1DA1F2]/80 disabled:hover:bg-slate-700 disabled:bg-slate-700">
                        Tweet
                    </a>
                </form>

                <p className="mt-5 text-sm font-normal text-center text-gray-500">
                    Tweet to let them know how to claim
                </p>
            </div>
        </div>
    );
};

export default TweetPrompt;