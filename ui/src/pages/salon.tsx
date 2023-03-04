import { LSK_USER_CRED } from '@/lib/constants';
import useTimeout from '@/lib/hooks/useTimeout';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { GetAccessTokenData } from '../lib/models/getAccessTokenResponse';

export default function Salon() {
    const router = useRouter();
    const [error, setError] = useState<string>();

    useEffect(() => {
        let { state, code, error } = router.query;
        if (Boolean(state) && Boolean(code)) {

            const fetchData = async () => {
                let response = await fetch(`${window.location.origin}/api/getAccessToken?code=${code}&state=${state}&redirectBaseUrl=${window.location.origin}`)
                let json = await response.json();
                let responseParsed: GetAccessTokenData = json;

                if (responseParsed.isError) {
                    console.log(`Response error ${responseParsed.error}`);
                } else {
                    window.localStorage.setItem(LSK_USER_CRED, JSON.stringify(json));
                    window.close();
                }
            };

            fetchData()
                .catch(x => console.log(x));
        }
        if (error != undefined) {
            setError(error.toString());
        }
    }, [router.query]);


    return (
        <>
            <div>
                <p>
                    {error ? `Something went wrong, please try again: ${error}` :
                        'Connecting to Twitter. You will be redirected soon.'
                    }
                </p>
            </div>
        </>
    )
}