import { motion } from "framer-motion";
import { type } from "os";

const wrapStyles = {
    indeterminate: {
        x: ["-45%", "45%"],
        transition: {
            //ease: [0.35, 0, 0.2, 1],
            repeat: Infinity,
            repeatType: "reverse",
            duration: 1.5
        }
    }
};


const barStyles = {
    indeterminate: {
        width: ["10%", "50%", "10%"],
        transition: {
            // ease: [0.35, 0, 0.2, 1],
            repeat: Infinity,
            repeatType: "reverse",
            duration: 1.5
        }
    }
};

type infoCardType = 'wallet' | 'error';

const InformationCard = (props: { text: string | undefined | JSX.Element, type: infoCardType, isLoading: boolean }) => {
    return (
        <div className="flex items-end justify-center w-full h-full">
            <div className="relative w-full max-w-sm overflow-hidden bg-white rounded-lg shadow-lg">
                <div className="px-3 pt-3 pb-4">
                    <div className="flex items-center justify-start">
                        <div className="flex flex-col justify-start items-start">
                            {props.type == 'wallet' && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                            </svg>}
                            {props.type == 'error' && <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-red-400">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                            </svg>
                            }
                        </div>

                        <p className="ml-3 text-sm font-medium text-gray-900">{props.text}</p>
                    </div>
                </div>

                {props.isLoading && <div className="w-full h-0.5 bg-gray-200 absolute bottom-0 inset-x-0">
                    <motion.div animate={{ width: '100%' }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-y-0 bg-indigo-600"></motion.div>
                </div>}
            </div>
        </div>
    );
}

export default InformationCard;