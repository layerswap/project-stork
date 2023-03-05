import { Github, Twitter, User, Users } from 'lucide-react';
import React, { useState } from 'react';
import JuberJabber from './JuberJabber';

const Footer = () => {
    return (
        <footer className="pb-12 bg-white sm:pb-16 lg:pb-20">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="max-w-lg mx-auto text-center">
                    <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl xl:text-4xl font-pj">Let&apos;s connect!</h2>
                </div>

                <ul className="flex flex-col items-center justify-center mt-8 space-y-5 sm:mt-12 lg:mt-16 md:flex-row md:space-y-0 md:space-x-12">
                    <li>
                        <a href='https://twitter.com/storkappxyz' target='_blank' className="group hover:cursor-pointer px-4 py-3 rounded-lg flex items-center text-gray-900 transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:bg-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-gray-200">
                            <Twitter />
                            <span className="ml-3 text-lg font-bold font-pj group-hover:underline"> Tweet at us </span>
                        </a>
                    </li>
                    <li>
                        <a href='https://discord.com/invite/KhwYN35sHy' target='_blank' className="group hover:cursor-pointer px-4 py-3 rounded-lg flex items-center text-gray-900 transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:bg-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-gray-200">
                            <Users />
                            <span className="ml-3 text-lg font-bold font-pj group-hover:underline"> Share memes with us </span>
                        </a>
                    </li>
                    <li>
                        <a href='https://github.com/layerswap/project-stork' target='_blank' className="group hover:cursor-pointer px-4 py-3 rounded-lg flex items-center text-gray-900 transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:bg-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-gray-200">
                            <Github />
                            <span className="ml-3 text-lg font-bold font-pj group-hover:underline"> Fork us </span>
                        </a>
                    </li>
                </ul>

                <div className="mt-12">
                    <JuberJabber />
                </div>

                <p className="text-base font-normal text-center text-gray-600 mt-7 font-pj">Made by <a href='https://www.layerswap.io/' className='text-[#FF0093] underline'>Layerswap</a></p>
            </div>
        </footer>

    )
}
export default Footer;