export type GetAccessTokenData = {
    isError: false
    token: string | undefined,
    userName: string | undefined,
} | { error: string, isError: true }
