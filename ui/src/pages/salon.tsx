import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { GetAccessTokenData } from '../lib/models/getAccessTokenResponse';

export default function Salon() {
    const router = useRouter();

    useEffect(() => {
        let { state, code } = router.query;
        if (Boolean(state) && Boolean(code)) {

            const fetchData = async () => {
                let response = await fetch(`${window.location.origin}/api/getAccessToken?code=${code}&state=${state}&redirectBaseUrl=${window.location.origin}`)
                let json = await response.json();
                let responseParsed: GetAccessTokenData = json;

                if (responseParsed.isError) {
                    console.log(`Response error ${responseParsed.error}`);
                } else {
                    window.localStorage.setItem("USER_CRED", JSON.stringify(json));
                    router.push('/claim');
                }
            };

            fetchData()
                .catch(x => console.log(x));
        }
    }, [router.query]);


    return (
        <>
            <div>
                <p>Connecting to Twitter. You will be redirected soon.</p>
            </div>
        </>
    )
}