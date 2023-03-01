import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { GetAccessTokenData } from '../lib/models/getAccessTokenResponse';

export default function Salon() {
    const router = useRouter();

    useEffect(() => {
        let { state, code } = router.query;
        if (Boolean(state) && Boolean(code)) {
            let storedState = window.localStorage.getItem("OAUTH_STATE");
            if (state != storedState) {
                throw new Error("States didn't match.");
            }
            const fetchData = async () => {
                let response = await fetch(`${window.location.origin}/api/getAccessToken?code=${code}&state=${state}&redirectBaseUrl=${window.location.origin}`)
                let json = await response.json();
                let responseParsed : GetAccessTokenData = json;

                if (responseParsed.isError)
                {
                    console.log(`Response error ${responseParsed.error}`);
                }else{
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
                <p>  Yo</p>
            </div>
        </>
    )
}

// export const getServerSideProps: GetServerSideProps<{ token: string | undefined, userName: string | undefined }> = async (context) => {
//     let { authClient, client } = GetClients();
//     const STATE = "my-state";

//     authClient.generateAuthURL({
//         state: STATE,
//         code_challenge_method: "plain",
//         code_challenge: "challenge"
//     });

//     const { state, code } = context.query;

//     if (state !== STATE) {
//         console.log("State didn't match");
//     }
//     else {
//         await authClient.requestAccessToken(code as string);
//     }

//     const token = authClient.token?.access_token;
//     const user = await client.users.findMyUser();
//     const userName = user?.data?.username;

//     return {
//         props: {
//             token,
//             userName
//         },
//     }
// }