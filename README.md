# Stork Alpha

Stork is decentralized protocol to send crypto to Twitter accouns. Then those accounts can claim those funds, by proving that they are owner of that twitter handle.

The project is part of ETHDenver 2023 Hackathon. It is using newly realised Chainlink Functions for twitter identity verification.

Stark is deployed in Polygon Mumbai. 

> :exclamation: Attention! Stork Smart Contracts are not audited and not ment to run on production. They were just developed in couple of days during hackathon. Use at your own risks.

## Overview

Bob wants to send 10 Matic to @elonmusk. As we all know there is no such a thing @elonmusk in a blockchain. So in order to be able to define what is @elonmusk we need external "authority" who can map @elonmusk to onchain understandable destination, address. This is where newly released ChainLink functions come into play:

> Chainlink Functions provides your smart contracts with access to a trust-minimized compute infrastructure. Your smart contract sends your code to a Decentralized Oracle Network (DON), and each DON’s oracle runs the same code in a serverless environment. The DON aggregates all the independent runs and returns the final result to your smart contract. Your code can be anything from simple computation to fetching data from API providers. 
> 
> Check out [Chainlink Functions Official Documentation](https://docs.chain.link/chainlink-functions).


In short, we will develop simple vanila javascript code which is recieving Twitter access token from user, calling Twitter API, getting the twitter handle and returning it. We will send this javascript code to [DON (Decentralized oracle network)](https://docs.chain.link/chainlink-functions/resources/concepts/) where independent nodes, will run same code, recieve the twitter handle, come to consensus and write it back to our contract. With this construct we will be able to map twitter handle to blockchain address.

Back to story.  So Bob wants to send 10 MATIC to @elonmusk. Bob calls Stork contract, sends 10 MATIC and provides twitter handle.

```
sendToTwitterHandle(string calldata handle) public payable
```

We will store the sent amount and twitter handle.

Now @elonmusk wants to claim those assets. @elonmusk first have to prove that he/she owns the @elonmusk handle and link it to his/her onchain address. For this it calls Stork contract:

```
function claimTwitterHandle(string calldata expectedTwitterHandle, string calldata accessToken, bool claimFundsImmediately)
```

When this call is made, the javascript code is sent to TON and the result is written back to our Contract, so we know that `msg.Sender` owns `@elonmusk`.

Once this done, user can simply claim funds (if `claimFundsImmediately` was not set to true earlier) with simple call to Stork contract:

```
function claimFunds()
```

This function will check wether `msg.Sender` has associated Twitter handle, if yes it will release locked funds to it.


## AccessToken privacy

## Expected Twitter Handle

## Contract/Scripts links

