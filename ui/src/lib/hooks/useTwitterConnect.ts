import { useState } from "react";
import { LSK_USER_CRED } from "../constants";
import { AccessTokenData } from "../models/getAccessTokenResponse";
import useEventListener from "./useEventListener";

export function useTwitterConnect(onDataUpdate?: (() => void) | undefined) {
    const [data, setData] = useState<AccessTokenData>();

    if (data == undefined) {
        updateLocalData();
    }

    useEventListener('storage', (se) => {
        if (se.key == LSK_USER_CRED) {
            updateLocalData();
            onDataUpdate?.();
        }
    });

    let logOut = () => {
        window.localStorage.removeItem(LSK_USER_CRED);
        setData(undefined);
    };

    return { isConnected: data != undefined && data.token != undefined, data, logOut };

    function updateLocalData() {
        let storedData = window.localStorage.getItem(LSK_USER_CRED);
        let parsedData: AccessTokenData | null = storedData && JSON.parse(storedData);
        if (parsedData) {
            setData(parsedData);
        }
    }
}