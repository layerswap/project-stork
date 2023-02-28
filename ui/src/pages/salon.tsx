import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { authClient, client } from "../lib/twitterClient";
import {useRouter} from 'next/router';

export default function Salon(userCreds: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const router = useRouter();
    window.localStorage.setItem("USER_CRED", JSON.stringify(userCreds));
    router.push('/claim');

    return (
        <>
            <div>
                <p>  Yo {userCreds.userName} token is {userCreds.token}</p>
            </div>
        </>
    )
}

export const getServerSideProps: GetServerSideProps<{ token: string | undefined, userName: string | undefined }> = async (context) => {
    const STATE = "my-state";

    authClient.generateAuthURL({
        state: STATE,
        code_challenge_method: "plain",
        code_challenge: "challenge"
    });

    const { state, code } = context.query;

    if (state !== STATE) {
        console.log("State didn't match");
    }
    else {
        await authClient.requestAccessToken(code as string);
    }

    const token = authClient.token?.access_token;
    const user = await client.users.findMyUser();
    const userName = user?.data?.username;

    return {
        props: {
            token,
            userName
        },
    }
}