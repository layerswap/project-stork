import useSWRMutation from 'swr/mutation'

// Calls Open Zeppelin Deffender autotask
async function autotaskFetcher(url: string, { arg }: { arg: string }) {
    let fetchresult = await fetch(url, {
        method: 'POST',
        body: arg,
        headers: { 'Content-Type': 'application/json' }
    });

    let jsonParsed: AutoTaskResult = await fetchresult.json();

    return jsonParsed;
}

export function useAutoTask(url: string) {
    let { data, error, isMutating, reset, trigger } = useSWRMutation(url, autotaskFetcher);

    return {
        data,
        isError: error != undefined,
        error: { message: error?.message ?? error },
        isLoading: isMutating,
        isSuccess: error == undefined && data != undefined,
        call: trigger
    }
}

export type AutoTaskResult = {
    txHash: string,
    encryptedAccessToken: string
    accessToken: string,
    refreshToken: string
};