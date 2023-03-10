import { isMobile } from '@/lib/helpers/isMobile';
import { useTwitterConnect } from '@/lib/hooks/useTwitterConnect';
import { GetClients } from '@/lib/twitterClient';
import { LogOut, Twitter } from 'lucide-react';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './dropdown-menu';

export default function TwitterButton() {
    let { isConnected, data, logOut, logIn } = useTwitterConnect();

    return (
        <>
            {isConnected ?
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <button
                            type="button"
                            className="inline-flex p-1 items-center rounded-full shadow-sm bg-[#0000001a] border-[#e5e7eb] hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-700"
                        >
                            <Avatar>
                                <AvatarImage src={data?.profile_image_url?.replace('normal', 'bigger')} />
                                <AvatarFallback>{data?.userName?.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuLabel>@{data?.userName}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => logOut()}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log Out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                :
                <button
                    onClick={() => logIn()}
                    type="button"
                    className="inline-flex items-center gap-x-2 rounded-lg bg-indigo-600 py-2.5 px-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    <Twitter className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                    <span className='inline'>Connect</span>
                </button>}
        </>
    )
}