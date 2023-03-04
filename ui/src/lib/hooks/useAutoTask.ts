import useSWRMutation from 'swr/mutation'

// Calls Open Zeppelin Deffender autotask
async function autotaskFetcher(url: string, { arg }: { arg: string }) {
    let fetchresult = await fetch(url, {
        method: 'POST',
        body: arg,
        headers: { 'Content-Type': 'application/json' }
    });

    let jsonParsed: AutoTaskResult = await fetchresult.json();

    if (jsonParsed.message) {
        throw new Error(jsonParsed.message);
    }
    else if (jsonParsed.result == undefined || jsonParsed.result.length == 0) {
        throw new Error("TxHash was not present in autotask result.");
    }

    jsonParsed.parsedResult = JSON.parse(jsonParsed.result);

    console.log(jsonParsed.parsedResult);

    if (jsonParsed.parsedResult == undefined) {
        throw new Error(`Couldn't parse result from ${jsonParsed.result}`);
    }

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


/*
Example response
{
    "autotaskRunId": "3030cb45-df80-4518-b136-8dafd6b9a6f8",
    "autotaskId": "5b8a71cc-da8a-467f-ae96-b4c495e96448",
    "trigger": "webhook",
    "status": "success",
    "createdAt": "2023-03-04T05:18:49.879Z",
    "requestId": "9ed786f0-e11b-43cf-9899-b11b6baaa0e4",
    "encodedLogs": "QVVUT1RBU0sgU1RBUlQKMjAyMy0wMy0wNFQwNToxODo1MS41MjNaCUlORk8JUmVsYXlpbmcgewogIG5vbmNlOiAxNiwKICBkYXRhOiAnMHgwNzdjNTAwMTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwNjAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMGEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDY2MjYxNjI2NzY1NzYwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA1YjU1NTQ2Yzc5NjM0NTc0Njg0ZTMyNzAzNTRlNTczMDMyNGUzMTRkMzU2MTMwNjQ2OTU2MzI2ODU4NTk1NTUyNDQ1MjU2NTY2OTU0NTg2NDMwNGQ1MzMwNzg1NTQ3NzA0NjUzNTU2YzQ1NWE0NzM1NDI1OTZkNGE2ODRmNmE0NTMyNGU3YTYzMzU0ZDQ0NTkzNTRmNDQ0ZDM0NGU2YTZiMzY0ZDU0NmY3ODRmNmQ0NjMwNGY2YTQ1MDAwMDAwMDAwMCcsCiAgZnJvbTogJzB4MTY5ZEE5NmVlZjRjZTYwMkU4MTAxQ0Y1MjYxNTUzQTEyN2E0YTIxRCcsCiAgdG86ICcweDljQ0Q5NGU3QTMyNDdiNDdFNGRkNDA0MERmOTZkZTNFZTYzMjIxM2InLAogIGdhczogMTAwMDAwMCwKICB2YWx1ZTogMAp9CjIwMjMtMDMtMDRUMDU6MTg6NTQuNTA3WglJTkZPCVNlbnQgbWV0YS10eDogMHhlZGU4NThlZDZkZjY3ZWYzNzY1NzdjNDM2M2U5MzI5MjUzNzg4OTIzYmM1ZjM0NTc3MDEyNGU4NDU3OTY1YWE4CkVORCBSZXF1ZXN0SWQ6IDllZDc4NmYwLWUxMWItNDNjZi05ODk5LWIxMWI2YmFhYTBlNApBVVRPVEFTSyBDT01QTEVURQ==",
    
    "result": "{\"txHash\":\"0xede858ed6df67ef376577c4363e9329253788923bc5f345770124e8457965aa8\"}"
    or 
    "message": "Error message"
}
*/

export type AutoTaskResult = {
    autotaskRunId: string;
    autotaskId: string;
    trigger: string;
    status: string;
    createdAt: Date;
    requestId: string;
    encodedLogs: string;
    result: string | undefined;
    parsedResult: { txHash: string } | undefined
    message: string | undefined;
};