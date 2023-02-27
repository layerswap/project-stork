import { Client, auth } from "twitter-api-sdk";

const TWITTER_CLIENT_ID = "QmplSzVSekg4SWlsdk9HM3dvV1Q6MTpjaQ";

const authClient = new auth.OAuth2User({
    client_id: TWITTER_CLIENT_ID as string,
    callback: "http://www.localhost:3000/salon",
    scopes: ["tweet.read", "users.read"],
});

const client = new Client(authClient);

export { client, authClient };