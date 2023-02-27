import { GetServerSideProps, InferGetServerSidePropsType } from 'next';
import { Client, auth } from "twitter-api-sdk";
import {authClient, client} from "../lib/twitterClient";

export default function Salon({ token, userName }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    return (
        <>
                <div>
                    <p>  Yo {userName} token is {token};</p>
                    <p>Connect wallet to claim your balance.</p>
                </div>
        </>
    )
}

export const getServerSideProps: GetServerSideProps<{token: string | undefined, userName: string | undefined}> = async (context) => {

    const STATE = "my-state";

    authClient.generateAuthURL({
        state: STATE,
        code_challenge_method: "plain",
        code_challenge: "challenge"
      });

    const { state, code } = context.query;

    if (state !== STATE){
        console.log("State didn't match");
    }
    else{
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