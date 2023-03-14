import { GetAccessTokenData } from '@/lib/models/getAccessTokenResponse';
import { GetClients } from '@/lib/twitterClient';
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GetAccessTokenData>
) {
  const { state, code, redirectBaseUrl, } = req.query;

  if (!Boolean(state) || !Boolean(code) || !Boolean(redirectBaseUrl)) {
    res.status(500).json({ error: "One of arguments was null.", isError: true });
  }

  let { authClient, client } = GetClients(redirectBaseUrl as string | undefined);

  authClient.generateAuthURL({
    state: state as string,
    code_challenge_method: "plain",
    code_challenge: state as string
  });

  await authClient.requestAccessToken(code as string);

  const token = authClient.token?.access_token;
  const user = await client.users.findMyUser({ "user.fields": ['profile_image_url', 'username'] });
  const userName = user?.data?.username;
  const imageUrl = user?.data?.profile_image_url;

  res.status(200).json({
    refreshToken: authClient.token?.refresh_token,
    token: token,
    userName: userName,
    isError: false,
    profile_image_url: imageUrl ?? ''
  });
}
