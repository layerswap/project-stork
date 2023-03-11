export type EncryptedAccessTokenData = {
    encryptedAccessToken: string | undefined,
}

export type PostEncryptedAccessTokenData = (EncryptedAccessTokenData & { isError: false }) | { error: string, isError: true };
