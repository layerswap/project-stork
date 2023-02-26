// Get the arguments from the request config
const twitterAccessToken = secrets.twitterAccessToken;
const ethereumAddress = args[0];

// Don't even try if the username or address is empty
if (!twitterAccessToken || !ethereumAddress) {
  throw Error('Twitter username or Ethereum address is empty');
}

// Prepare the API requests
const twitterRequest = {
    // Get the user id from the provided username
    identityByAccessToken: () =>
      Functions.makeHttpRequest({
        url: 'https://api.twitter.com/1.1/account/verify_credentials.json',
        headers: { Authorization: `Bearer ${twitterAccessToken}` },
      }),
  };

// Request twitter handle
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

// Grab the tw itter handle
const twitterHandle = handleRes.data.screen_name || null;

// Let's be extra careful and make sure that tweeter handle is not null
if (!twitterHandle) {
  throw Error('Twitter API request failed - user id is null');
}

return Functions.encodeString(
    `${twitterUsername}|${ethereumAddress}`,
  );
