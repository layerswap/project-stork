import { useState } from "react";
import { AccessTokenData } from "../models/getAccessTokenResponse";

export function useTwitterConnect() {
    const [data, setData] = useState<AccessTokenData>();
    let isConnected = data != undefined && data.token != undefined;
    if (data == undefined) {
        let storedData = window.localStorage.getItem("USER_CRED");
        let parsedData: AccessTokenData | null = storedData && JSON.parse(storedData);
        if (parsedData) {
            setData(parsedData);
        }
    }

    return { isConnected, data };
}