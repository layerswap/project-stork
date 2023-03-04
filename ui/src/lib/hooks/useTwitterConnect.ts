import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { LSK_USER_CRED } from "../constants";
import { isMobile } from "../helpers/isMobile";
import { AccessTokenData } from "../models/getAccessTokenResponse";
import { GetClients } from "../twitterClient";
import useEventListener from "./useEventListener";

function getTwitterOauthUrl() {
    let { authClient } = GetClients();

    let state = crypto.randomUUID();
    const authUrl = authClient.generateAuthURL({
        state: state,
        code_challenge_method: "plain",
        code_challenge: state
    });


    return authUrl;
}

export function useTwitterConnect(onDataUpdate?: (() => void) | undefined, onLoggedIn?: (() => void) | undefined) {
    const [data, setData] = useState<AccessTokenData>();
    const [isConnected, setIsConnected] = useState<boolean>();
    const [authWindow, setAuthWindow] = useState<Window | null>()
    let router = useRouter();
    let ismobile = isMobile();

    if (data == undefined) {
        updateLocalData();
    }

    useEffect(() => {
        setIsConnected(data != undefined && data.token != undefined);
    }, [data]);

    useEventListener('storage', (se) => {
        if (se.key == LSK_USER_CRED) {
            if (se.newValue == null && se.oldValue != null) {
                setData(undefined);
            }
            else if (se.newValue != null && se.oldValue == null) {
                onLoggedIn?.();
            }

            updateLocalData();
            onDataUpdate?.();
        }
    });

    let logOut = () => {
        window.localStorage.removeItem(LSK_USER_CRED);
        setData(undefined);
    };

    let logIn = () => {
        if (ismobile) {
            router.push(getTwitterOauthUrl());
        }
        else {
            authWindow?.close();
            let childWindow = window.open(getTwitterOauthUrl(), '_blank', 'width=420,height=720');
            setAuthWindow(childWindow);
        }
    }

    return { isConnected, data, logOut, logIn };

    function updateLocalData() {
        let storedData = window.localStorage.getItem(LSK_USER_CRED);
        let parsedData: AccessTokenData | null = storedData && JSON.parse(storedData);
        if (parsedData) {
            setData(parsedData);
        }
    }
}