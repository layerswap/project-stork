const twitterAccessToken = secrets.twitterAccessToken;
const ethereumAddress = args[0];

if (!twitterAccessToken || !ethereumAddress) {
  throw Error('Twitter username or Ethereum address is empty');
}

const twitterRequest = {
    identityByAccessToken: () =>
      Functions.makeHttpRequest({
        url: 'https://api.twitter.com/2/users/me',
        headers: { Authorization: `Bearer ${twitterAccessToken}` },
      }),
  };

const handleRes = await new Promise((resolve, reject) => {
    twitterRequest.identityByAccessToken().then((res) => {
      if (!res.error) {
        resolve(res);
      } else {
        reject(res);
      }
    });
  });
  
  if (handleRes.error) {
    throw Error('Twitter API request failed - coult not get user id');
  }

const twitterHandle = handleRes.data.data.username || null;

if (!twitterHandle) {
  throw Error('Twitter API request failed - user id is null');
}

return Functions.encodeString(
    `${twitterHandle}|${ethereumAddress}`,
  );
