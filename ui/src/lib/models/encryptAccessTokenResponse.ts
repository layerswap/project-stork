export type EncryptedAccessTokenData = {
    encryptedAccessToken: string | undefined,
    accessToken: string | undefined,
    refreshToken: string | undefined,
}

export type PostEncryptedAccessTokenData = (EncryptedAccessTokenData & { isError: false }) | { error: string, isError: true };
