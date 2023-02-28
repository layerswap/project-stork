const twitterAccessToken = args[0];

if (!twitterAccessToken) {
  throw Error('AccessToken is required.');
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
    throw Error('Twitter API error.');
  }

const twitterHandle = handleRes.data.data.username || null;

if (!twitterHandle) {
  throw Error('Username null.');
}

return Functions.encodeString(twitterHandle);