import { Client, auth } from "twitter-api-sdk";
import { TWITTER_CLIENT_ID } from "./constants";

let vercelURL = process.env.VERCEL_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL;
let homeURL = vercelURL ? 'https://' + vercelURL : 'http://localhost3000'   
let authClient = new auth.OAuth2User({
    client_id: TWITTER_CLIENT_ID as string,
    callback: `${homeURL}/salon`,
    scopes: ["tweet.read", "users.read"],
});

const client = new Client(authClient);

export { client, authClient };