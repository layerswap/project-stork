
import useSWR from 'swr'

const fetcher = (input: RequestInfo | URL, init?: RequestInit) => fetch(input, init).then(res => res.json())

type coingecoAssets = 'MATIC';

export function useUSDprice (asset: coingecoAssets) {
    const { data, error, isLoading } = useSWR(`https://api.coingecko.com/api/v3/simple/price?ids=matic-network&vs_currencies=USD`, fetcher)
   
    return {
      price: data ? Number.parseFloat(data['matic-network']['usd']) : 0,
      isLoading,
      isError: error
    }
  }