export type GetAccessTokenData = {
    isError: false
    token: string | undefined,
    userName: string | undefined,
    profile_image_url: string | undefined
} | { error: string, isError: true }
