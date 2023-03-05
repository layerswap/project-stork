import { Github, Twitter, User, Users } from 'lucide-react';
import React, { useState } from 'react';
import JuberJabber from './JuberJabber';

const links = [
    {
        link: "https://twitter.com/storkappxyz",
        icon: <Twitter />,
        text: "Tweet @ us",
    },
    {
        link: "https://discord.com/invite/KhwYN35sHy",
        icon: <Users />,
        text: "Chat with us",
    },
    {
        link: "https://github.com/layerswap/project-stork",
        icon: <Github />,
        text: "Fork us",
    },
]

const Footer = () => {
    return (
        <footer className="pb-12 bg-white sm:pb-16 lg:pb-20">
            <div className="px-4 mx-auto max-w-5xl sm:px-6 lg:px-8">
                <div className="max-w-lg mx-auto text-center">
                    <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl xl:text-4xl font-pj">Let&apos;s connect!</h2>
                </div>

                <ul className="grid md:grid-rows-1 md:grid-cols-3 gap-y-3 md:gap-x-5 items-center px-8 md:justify-center mt-8">
                    {
                        links.map((link) => (

                            <li key={link.text} className='flex justify-around bg-gray-100 group transition-all duration-200 hover:bg-gray-300 focus:outline-none focus:bg-gray-200 focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 rounded-lg hover:cursor-pointer'>
                                <a href={link.link} target='_blank' className="px-4 py-3 flex items-center text-gray-900">
                                    {link.icon}
                                    <span className="ml-3 text-lg font-bold font-pj group-hover:underline">{link.text}</span>
                                </a>
                            </li>
                        ))
                    }
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