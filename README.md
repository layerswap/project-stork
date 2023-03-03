# Stork - Alpha

:rocket: Leveraging Social Identity for Transacting Digital Assets

Stork is a project developed during the ETHDenver 2023 Hackathon that aims to enable anyone on Twitter to leverage their social identity for transacting digital assets. It utilizes newly released Chainlink Functions for Twitter identity verification and OpenZeppelin Meta transactions (with Defender Relayer) for gaseless transfers. The latest contract is [deployed on Polygon Mumbai](https://mumbai.polygonscan.com/address/0x9cCD94e7A3247b47E4dd4040Df96de3Ee632213b).

Stork's objective is to enable users to send digital assets to a Twitter handle that can be claimed by the owner of that handle in a trustless and non-custodial manner. This is accomplished through the use of Chainlink Functions, which map the Twitter handle to an on-chain address.

>:warning: It is important to note that Stork is a project developed during a hackathon, where the main objective was to rapidly create a working product. Hence, the smart contracts used in the project have not been audited and are not intended for deployment in production environments.

## Table of Contents

- [Stork - Alpha](#stork---alpha)
  - [Table of Contents](#table-of-contents)
  - [How it works?](#how-it-works)
  - [Gaseless claims](#gaseless-claims)
  - [AccessToken privacy](#accesstoken-privacy)
  - [Expected Twitter Handle](#expected-twitter-handle)
  - [Emmbeded JS code](#emmbeded-js-code)
  - [Run, deploy, and test](#run-deploy-and-test)
  - [Conclusion](#conclusion)
  - [Contracts and Scripts](#contracts-and-scripts)
  - [Afterword and Authors](#afterword-and-authors)

## How it works?

Bob wants to send `10 MATIC` to `@elonmusk`, however, it is not possible to send funds to a Twitter handle directly in a blockchain network. An external "authority" is needed to map the Twitter handle to an on-chain destination, that is, an address that can receive funds on the blockchain. This is where recently released ChainLink functions come into play:

> Chainlink Functions provides your smart contracts with access to a trust-minimized compute infrastructure. Your smart contract sends your code to a Decentralized Oracle Network (DON), and each DON’s oracle runs the same code in a serverless environment. The DON aggregates all the independent runs and returns the final result to your smart contract. Your code can be anything from simple computation to fetching data from API providers. 
> 
> Check out [Chainlink Functions Official Documentation](https://docs.chain.link/chainlink-functions).


We developed a [Javascript function](/chainlink-functions/stork-twitter.js) that requires the user's Twitter access token to call the Twitter API to retrieve the Twitter handle. The code will then be sent to the [Decentralized Oracle Network (DON)](https://docs.chain.link/chainlink-functions/resources/concepts/) for independent nodes to run the same code, obtain the Twitter handle, and reach a consensus before writing it back to the Stork contract. This construct will enable trust-minimized mapping of the Twitter handle to an on-chain address, thus facilitating the successful transfer to the intended recipient.

Returning to the scenario at hand, Bob aims to send `10 MATIC` to `@elonmusk`. To facilitate this transaction, Bob calls the Stork contract, providing `10 MATIC` and a Twitter handle associated with the intended recipient.

[Stork.sol#L105](chainlink-functions/contracts/Stork.sol#L105)
```solidity
sendToTwitterHandle(string calldata handle) public payable
```

To claim the assets transferred to the `@elonmusk` handle, `@elonmusk` must first prove ownership of the handle and link it to his/her on-chain address. This process involves calling the Stork contract, which verifies ownership and establishes the mapping between the handle and the on-chain address.

[Stork.sol#L137](/chainlink-functions/contracts/Stork.sol#L137)
```solidity
function claimTwitterHandle(
 string calldata expectedTwitterHandle,
 string calldata accessToken,
 bool claimFundsImmediately) public
```

Upon calling the Stork contract, the associated [Javascript code](/chainlink-functions/stork-twitter.js) is sent to the DON - nodes execute the code and [write the result to the contract](/chainlink-functions/contracts/Stork.sol#L75). Through this process, the contract verifies that the `msg.Sender` owns the `@elonmusk` handle and establishes the mapping between the handle and the on-chain address.

Once this verification is complete, the user can claim the funds by calling the Stork contract.

[Stork.sol#L158](/chainlink-functions/contracts/Stork.sol#L158)
```solidity
function claimFunds() public
```

The purpose of this function is to determine if `msg.Sender` has an associated Twitter handle. If a handle is found, the function will proceed to release the previously locked funds to the specified handle.

To prevent the need for multiple transactions, the `claimFundsImmediately` parameter can be set to `true` during the initial `claimTwitterHandle` call. Doing so will allow the funds to be claimed immediately after the Twitter handle is successfully verified and mapped to the on-chain address, without requiring any further interaction with the contract.

## Gaseless claims

The current process of claiming funds in the Stork system requires a minimum of one transaction, which necessitates paying gas fees. This approach presents a problem if the user has no `MATIC`. The issue is compounded as Stork is focused on making onboarding to crypto more accessible. To resolve this, [OpenZeppelin Defender Relayers](https://docs.openzeppelin.com/defender/relay) and [Meta transactions](https://docs.openzeppelin.com/contracts/4.x/api/metatx) can be leveraged. Additionally, it is important to note that the beta version of Chainlink Functions only permits whitelisted addresses to call DON network. Thankfully, with meta-transactions (because of Relayer), both problems can be addressed with a single solution.

> Gasless meta-transactions offer users a more seamless experience, and potentially one where they don’t have to spend as much money to engage with the blockchain. This method gives users the option to sign a transaction for free and have it securely executed by a third party, with that other party paying the gas to execute the transaction.
>
> A gasless meta-transaction relay can be easily and securely implemented using OpenZeppelin Defender by way of a Relayer. A Defender Relay allows you to send transactions easily and handles private key storage, transaction signing, nonce management, gas estimation, and automatic resubmissions if necessary.
>
> Check out [OpenZeppelin Meta Transactions Documentation](https://docs.openzeppelin.com/defender/guide-metatx).

This is how the process will look like with meta transactions:

1. The user will sign a transaction message.
2. The signed transaction message will be sent to the OpenZeppelin Defender Relayer.
3. The Relayer will send the signed transaction to the `MinimalForwarder` and pay the gas fees on behalf of the user.
4. The `MinimalForwarder` will extract the signed transaction and call the actual Stork contract.
5. Stork contract will call the DON network ... and do the rest as explained above
...

Notice that Stork contract calls that involve DON interactions are called from Relayer and routed through the `MinimalForwarder`. As a result, we can request Chainlink to whitelist the `Relayer` address to enable its use for all users.

Currently, the Relayer covers the cost of gas fees for transactions. However, it is fairly easy to deduct these fees from the user who claims the funds and automatically transfer them to the Relayer.

## AccessToken privacy

[Stork.sol#L137](/chainlink-functions/contracts/Stork.sol#L137)
```solidity
function claimTwitterHandle(
 string calldata expectedTwitterHandle,
 >>> string calldata accessToken, <<<<
 bool claimFundsImmediately) public
```

The current implementation passes the user's access token in plain text, which poses a significant security risk as the token is accessible to the public. While access tokens are only valid for a limited time and provide read-only access, this approach still exposes users' privacy.

To address this issue, we propose a solution that encrypts the access token before transmitting it over the network. This approach involves the following steps:

1. Stork generates a public/private key pair, with the private key shared between the DON nodes using [Offchain Secrets](https://docs.chain.link/chainlink-functions/tutorials/api-use-secrets-offchain).
2. The public key is publicly shared.
3. Whenever a user wants to interact with the Stork contract, they must encrypt the access token using the public key and transmit it over the network.
4. The Chainlink javascript function will receive the encrypted access token, as well as the off-chain secret private key, which can be used to decrypt the access token and call Twitter.
 
While this solution offers improved security, it is currently not possible to implement due to the beta status of Chainlink functions, which currently only support vanilla javascript functions. However, once basic cryptographic functionality is added, this solution can be implemented to enhance the security and privacy of users.

## Expected Twitter Handle

[Stork.sol#L137](/chainlink-functions/contracts/Stork.sol#L137)
```solidity
function claimTwitterHandle(
 >>> string calldata expectedTwitterHandle, <<<
 string calldata accessToken,
 bool claimFundsImmediately) public
```

The claim transaction requires the user to provide the expected Twitter handle along with the access token. This provides a layer of protection as once the DON network comes to a consensus on the actual Twitter handle associated with the access token, it is checked against the expected handle. This eliminates any doubt the user may have about the DON network unexpectedly deciding on the wrong Twitter handle.

## Emmbeded JS code

[Stork.sol#L23](/chainlink-functions/contracts/Stork.sol#L23)
```solidity
...
string internal constant FUNCTION_CODE =
 "const twitterAccessToken = args[0];\n"
 "if (!twitterAccessToken) {\n"
 " throw Error('AccessToken is required.');\n"
...
```

The DON network operates by having its nodes execute a provided JavaScript code. To make the interaction between users and the Stork contract more transparent, we have [embedded the JavaScript code](/chainlink-functions/contracts/Stork.sol#L23) inside the smart contract. This allows users to easily view the code that will be executed by the DON nodes.

## Run, deploy, and test

1. [Setup your environment](https://docs.chain.link/chainlink-functions/getting-started#set-up-your-environment)
2. Deploy a `MinimalForwarder` and update the forwarder contract address in [network-config](chainlink-functions/network-config.js)

```console
npx hardhat functions-deploy-forwarder --network mumbai
```

3. Deploy Stork Contract

```console
npx hardhat functions-deploy-stork --network mumbai --verify false
```

3. [Create a new subscription and fund it](https://docs.chain.link/chainlink-functions/getting-started#configure-your-on-chain-resources)
4. Add newly created Stork contract as functions consumer

```console
npx hardhat functions-sub-add --subid SUBSCRIPTION_ID --contract STORK_CONTRACT_ADDRESS --network mumbai
```

5. Send request to deployed Stork contract

```console
npx hardhat stork-request --contract STORK_CONTRACT_ADDRESS --accesstoken TWITTER_ACCESS_TOKEN --network mumbai --twitterhandle TWITTER_HANDLE
```

## Conclusion

Stork is a promising project that aims to leverage social identity for transacting digital assets. While it is not ready for production use, it provides a solid foundation for further development and exploration of the use of Chainlink Functions for on-chain social identity verification. The project code can be found on the links provided below.

## Contracts and Scripts

- Stork Contract [chainlink-functions/contracts/Stork.sol](/chainlink-functions/contracts/Stork.sol)
- Stork Javascript Chainlink Function [chainlink-functions/stork-twitter.js](/chainlink-functions/stork-twitter.js)
- Helping scripts [Deploy Stork](/chainlink-functions/tasks/Functions-client/deployClient.js#L54), [Deploy MinimalForwarder](chainlink-functions/tasks/Functions-client/deployForwarder.js), [Send Stork Request](/chainlink-functions/tasks/Functions-client/request.js#L220), [Send Stork Request with Meta-Transaction](/chainlink-functions/tasks/Functions-client/request.js#L376)

## Afterword and Authors
- [Aram Kocharyan](https://twitter.com/bot_insane)
- [Babken Gevorgyan](https://twitter.com/babgev)
- [Anna Tantushyan](https://twitter.com/TantushyanAnna)
