import { useState } from "react";
import { LSK_USER_CRED } from "../constants";
import { AccessTokenData } from "../models/getAccessTokenResponse";
import useEventListener from "./useEventListener";

export function useTwitterConnect(onDataUpdate?: (() => void) | undefined) {
    const [data, setData] = useState<AccessTokenData>();

    useEventListener('storage', (se) => {
        if (se.key == LSK_USER_CRED) {
            fetchData();
            onDataUpdate?.();
        }
    });

    let isConnected = data != undefined && data.token != undefined;
    if (data == undefined) {
        fetchData();
    }

    return { isConnected, data };

    function fetchData() {
        let storedData = window.localStorage.getItem(LSK_USER_CRED);
        let parsedData: AccessTokenData | null = storedData && JSON.parse(storedData);
        if (parsedData) {
            setData(parsedData);
        }
    }
}