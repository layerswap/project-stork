import { Client, auth } from "twitter-api-sdk";
import { TWITTER_CLIENT_ID } from "./constants";

let authClient: auth.OAuth2User | null;
let client: Client | null;

export function GetClients(): { client: Client, authClient: auth.OAuth2User } {
    authClient = new auth.OAuth2User({
        client_id: TWITTER_CLIENT_ID as string,
        callback: typeof window !== 'undefined' ? `${window.location.origin}/salon` : `${process.env.APP_URL!}/salon`,
        scopes: ["tweet.read", "users.read"],
    });

    client = new Client(authClient);

    return { client, authClient };
}