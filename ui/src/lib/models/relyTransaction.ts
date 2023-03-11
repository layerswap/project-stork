export type RelyTransactionData = {
    txHash: string | undefined,
}

export type PostRelyTransactionData = (RelyTransactionData & { isError: false }) | { error: string, isError: true };
