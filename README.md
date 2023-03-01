# Stork Alpha

Leveraging Social Identity for Transacting Digital Assets

Stork Alpha is a project developed during the ETHDenver 2023 Hackathon that aims to enable anyone on Twitter to leverage their social identity for transacting digital assets. It utilizes newly released Chainlink Functions for Twitter identity verification and is deployed on Polygon Mumbai.

The goal of Stork Alpha is to allow users to send digital assets to a Twitter handle. To achieve this, Stork Alpha uses Chainlink Functions to map the Twitter handle to an on-chain address.

> :exclamation: Attention! Stork Alpha is a hackathon project, and its smart contracts are not audited and are not meant to run on production. Users should use Stork at their own risk.

## Table of Contents

- [Stork Alpha](#stork-alpha)
  - [Table of Contents](#table-of-contents)
  - [How it works?](#how-it-works)
  - [AccessToken privacy](#accesstoken-privacy)
  - [Expected Twitter Handle](#expected-twitter-handle)
  - [Emmbeding JS code in Smart Contract](#emmbeding-js-code-in-smart-contract)
  - [Conclusion](#conclusion)
  - [Contract/Scripts links](#contractscripts-links)

## How it works?

Bob wants to send 10 Matic to @elonmusk. As we all know there is no such thing @elonmusk in a blockchain. So to be able to define what is @elonmusk we need an external "authority" who can map @elonmusk to an on-chain understandable destination, and address. This is where newly released ChainLink functions come into play:

> Chainlink Functions provides your smart contracts with access to a trust-minimized compute infrastructure. Your smart contract sends your code to a Decentralized Oracle Network (DON), and each DON’s oracle runs the same code in a serverless environment. The DON aggregates all the independent runs and returns the final result to your smart contract. Your code can be anything from simple computation to fetching data from API providers. 
> 
> Check out [Chainlink Functions Official Documentation](https://docs.chain.link/chainlink-functions).


In short, we will develop a simple javascript code which is receiving a Twitter access token from the user, calls Twitter API, gets the Twitter handle, and returns it. We will send this javascript code to [DON (Decentralized oracle network)](https://docs.chain.link/chainlink-functions/resources/concepts/) where independent nodes, will run the same code, receive the Twitter handle, come to a consensus, and write it back to Stork contract. With this construct, we will be able to map the Twitter handle to the blockchain address.

Back to the story. So Bob wants to send 10 MATIC to @elonmusk. Bob calls Stork contract, sends 10 MATIC, and provides a Twitter handle.

```
sendToTwitterHandle(string calldata handle) public payable
```

Now @elonmusk wants to claim those assets. @elonmusk first has to prove that he/she owns the @elonmusk handle and then link it to his/her on-chain address. This it calls the Stork contract:

```
function claimTwitterHandle(
 string calldata expectedTwitterHandle,
 string calldata accessToken,
 bool claimFundsImmediately) public
```

When this call is made, the javascript code is sent to TON and the result is written back to our Contract, so we know that `msg.Sender` owns `@elonmusk`.

Once this is done, the user can simply claim funds (if `claimFundsImmediately` was not set to true earlier) with a simple call to the Stork contract:

```
function claimFunds() public
```

This function will check whether `msg.Sender` has an associated Twitter handle, if yes it will release locked funds to it.


## AccessToken privacy

```
function claimTwitterHandle(
 string calldata expectedTwitterHandle,
 string calldata accessToken,
 bool claimFundsImmediately) public
```

As you can see is user's Access token is passed in plain text. Which means that it is accessible to the public. Access tokens are valid only for 2 hours and are providing read-only access, but in any case, this is heavily exposing users' privacy. To address this issue, we propose the following schema, where the access token is not transmitted in an unencrypted way:

1. Stork generates Public/Private keys. Private Key is shared between DON nodes with [Offchain Secrets](https://docs.chain.link/chainlink-functions/tutorials/api-use-secrets-offchain)
2. Public Key is publicly shared.
3. Whenever a user wants to interact with Stork Contract, they have to encrypt the access token with Public Key and then sent it over the network.
4. Chainlink javascript function will receive an encrypted access token as well as will receive off-chain secret Private key, which will allow to decrypt of the access token and call Twitter.

This is not possible to implement yet, because Chainlink functions are in Beta and only vanilla javascript functions are supported. Once basic crypto functionality is added, this solution can be implemented.

## Expected Twitter Handle

```
function claimTwitterHandle(
 string calldata expectedTwitterHandle,
 string calldata accessToken,
 bool claimFundsImmediately) public
```

The claim transaction requires user to pass in the expected twitter handle along side with access token. This create one layer of protection, once DON network comes to consesus what is the twitter handle of the access token, its is checked against expected twitter handle. User has no doubt about his/her twitter handle, and with this solution it even doesnt need to trust DON network, because even in a case when unexpectingly DON network decides wrong twitter handle, Stork will attach wrong identity.


## Emmbeding JS code in Smart Contract
DON nodes receive a source code of JS to run. Even tho it was not documented, we thought that it should be nice to embed JS inside a smart contract. In a perfect world users who want to interact with the Stork contract, can easily see (what is the JS code)[/chainlink-functions/contracts/Stork.sol#L23] that DON nodes are going to execute.

## Conclusion

Stork is a promising project that aims to leverage social identity for transacting digital assets. While it is not ready for production use, it provides a solid foundation for further development and exploration of the use of Chainlink Functions for on-chain identity verification. The project code can be found on the links provided below.

## Contract/Scripts links

- Stork Contract [chainlink-functions/contracts/Stork.sol](/chainlink-functions/contracts/Stork.sol)
- Stork Javascript Chainlink Function [chainlink-functions/stork-twitter.js](/chainlink-functions/stork-twitter.js)
- Helping scripts [Deploy Stork](/chainlink-functions/tasks/Functions-client/deployClient.js#L54), [Send Stork Request](/chainlink-functions/tasks/Functions-client/request.js#L220)
