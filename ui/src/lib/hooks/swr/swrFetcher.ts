export const swrFetcher = (input: RequestInfo | URL, init?: RequestInit) => fetch(input, init).then(res => res.json())