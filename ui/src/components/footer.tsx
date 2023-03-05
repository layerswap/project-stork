import { Github, Twitter, User, Users } from 'lucide-react';
import React, { useState } from 'react';

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
                    <svg className="w-auto h-4 mx-auto text-gray-300" viewBox="0 0 172 16" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 11 1)" />
                        <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 46 1)" />
                        <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 81 1)" />
                        <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 116 1)" />
                        <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 151 1)" />
                        <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 18 1)" />
                        <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 53 1)" />
                        <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 88 1)" />
                        <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 123 1)" />
                        <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 158 1)" />
                        <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 25 1)" />
                        <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 60 1)" />
                        <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 95 1)" />
                        <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 130 1)" />
                        <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 165 1)" />
                        <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 32 1)" />
                        <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 67 1)" />
                        <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 102 1)" />
                        <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 137 1)" />
                        <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 172 1)" />
                        <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 39 1)" />
                        <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 74 1)" />
                        <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 109 1)" />
                        <line y1="-0.5" x2="18.0278" y2="-0.5" transform="matrix(-0.5547 0.83205 0.83205 0.5547 144 1)" />
                    </svg>
                </div>

                <p className="text-base font-normal text-center text-gray-600 mt-7 font-pj">Made by <a href='https://www.layerswap.io/' className='text-[#FF0093] underline'>Layerswap</a></p>
            </div>
        </footer>

    )
}
export default Footer;