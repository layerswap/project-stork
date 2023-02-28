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
function claimTwitterHandle(
    string calldata expectedTwitterHandle,
    string calldata accessToken,
    bool claimFundsImmediately) public
```

When this call is made, the javascript code is sent to TON and the result is written back to our Contract, so we know that `msg.Sender` owns `@elonmusk`.

Once this done, user can simply claim funds (if `claimFundsImmediately` was not set to true earlier) with simple call to Stork contract:

```
function claimFunds() public
```

This function will check wether `msg.Sender` has associated Twitter handle, if yes it will release locked funds to it.


## AccessToken privacy

As you can see from overview AccessToken is passed in a plain text. Which means that it is accessable to public. Access tokens are valid only for 2 hours and are providing only read-only access, but in anycase this is heavlity exposing privacy. So we propose following schema, where the access token is not transmited in unecrypted way:

1. Stork generates RSA Public/Private Key. Private Key is shared beetwin DON nodes with [Offchain Secrets](https://docs.chain.link/chainlink-functions/tutorials/api-use-secrets-offchain)
2. Public Key is publicaly shared.
3. Whenever use wants to interact with Stork Contract, they has to encrypt the access token with Public Key and then sent it over network.
4. Chainlink javascript function will recieve encrypted acces token as well as will recieve offchain secret Private key, which will allow to descrypt access token and call Twitter.

This is not possible to implement yet, because Chainlink functions are in Beta and they just support javascript vanila functions. Once they implement basic crypto libraries, this solution can be implemented.

## Expected Twitter Handle

```
function claimTwitterHandle(
    string calldata expectedTwitterHandle,
    string calldata accessToken,
    bool claimFundsImmediately) public
```

## Contract/Scripts links

- Stork Contract [chainlink-functions/contracts/Stork.sol](/chainlink-functions/contracts/Stork.sol)
- Stork Javascript Chainlink Function [chainlink-functions/stork-twitter.js](/chainlink-functions/stork-twitter.js)
- Helping scripts [Deploy Stork](/chainlink-functions/tasks/Functions-client/deployClient.js#L54), [Send Stork Request](/chainlink-functions/tasks/Functions-client/request.js#L220)