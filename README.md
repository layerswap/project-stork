# Stork - Alpha

:rocket: Leveraging Social Identity for Transacting Digital Assets

Stork is a project developed during the ETHDenver 2023 Hackathon that aims to enable anyone on Twitter to leverage their social identity for transacting digital assets. It utilizes newly released Chainlink Functions for Twitter identity verification and OpenZeppelin Meta transactions for gasless transfers. The latest contract is [deployed on Polygon Mumbai](https://mumbai.polygonscan.com/address/0xb4f9962c8D56eed88eF94Ae8A8c903c223EeFc21). The app is available at [storkapp.xyz](https://storkapp.xyz).

Stork's objective is to enable users to send digital assets to a Twitter handle that can be claimed by the owner of that handle in a trust-minimized and non-custodial manner. This is accomplished through the use of Chainlink Functions, which map the Twitter handle to an on-chain address.

>:warning: It is important to note that Stork is a project developed during a hackathon, where the main objective was to create a working product rapidly. Hence, the smart contracts used in the project have yet to be audited and are not intended for deployment in production environments.

:gift: StorkApp won Chainlink and OpenZeppelin bounties at ETHDenver23 Hackathon.

## Table of Contents

- [Stork - Alpha](#stork---alpha)
  - [Table of Contents](#table-of-contents)
  - [How it works?](#how-it-works)
    - [Summary](#summary)
  - [Gasless claims](#gasless-claims)
  - [Access Token privacy](#access-token-privacy)
  - [Access Token as a proof of ownership](#access-token-as-a-proof-of-ownership)
  - [DON Network's access to user's access token](#don-networks-access-to-users-access-token)
  - [Emmbeded JS code](#emmbeded-js-code)
  - [Architecture](#architecture)
  - [Demo](#demo)
  - [Conclusion](#conclusion)
  - [Roadmap](#roadmap)
  - [Run, deploy, and test](#run-deploy-and-test)
  - [Contracts and Scripts](#contracts-and-scripts)
  - [Contributors](#contributors)

## How it works?

[TL;DR;](#summary)


Bob wants to send `10 MATIC` to `@elonmusk`; however, it is not possible to send funds to a Twitter handle directly in a blockchain network. An external "authority" is needed to map the Twitter handle to an on-chain destination, that is, an address that can receive funds on the blockchain. This is where recently released ChainLink functions come into play:

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
 string calldata encryptedAccessToken,
 bool claimFundsImmediately) public
```

Upon calling the Stork contract, the associated [Javascript code](/chainlink-functions/stork-twitter.js) is sent to the DON - nodes independently execute the code (which class Twitter API to validate the access token and extracts the user's Twitter handle) and [write the result to the contract](/chainlink-functions/contracts/Stork.sol#L75). Through this process, the contract verifies that the `msg.Sender` owns the `@elonmusk` handle and establishes the mapping between the handle and the on-chain address.

Once this verification is complete, the user can claim the funds by calling the Stork contract.

[Stork.sol#L158](/chainlink-functions/contracts/Stork.sol#L158)
```solidity
function claimFunds() public
```

This function aims to determine if `msg.Sender` has an associated Twitter handle. If a handle is found, the function will release the previously locked funds to `msg.Sender`.

To prevent the need for multiple transactions, the `claimFundsImmediately` parameter can be set to `true` during the initial `claimTwitterHandle` call. Doing so will allow the funds to be claimed immediately after the Twitter handle is successfully verified and mapped to the on-chain address, without requiring any further interaction with the contract.

### Summary

The Stork contract is an intermediary between the sender and the receiver of digital assets. The sender initiates the transaction by providing the Twitter handle of the intended recipient to the Stork contract. The contract holds the funds in escrow until the receiver proves their ownership of the Twitter handle.

When the receiver wishes to claim the funds, they authorize in Twitter and provide an encrypted access token to the Chainlink decentralized oracle nodes (DON). The DON nodes independently verify the access token with the Twitter API and come to a consensus on the claim's validity. Once consensus is reached, the DON nodes write back to the Stork contract the Twitter handle of the user. This provides proof to the contract that the sender owns the Twitter handle and is entitled to receive the funds. At this point, the funds are released to the intended recipient.

## Gasless claims

The current process of claiming funds in the Stork system requires a minimum of one transaction, which necessitates paying gas fees. This approach presents a problem if the user has no `MATIC`. The issue is compounded as Stork is focused on making onboarding to crypto more accessible. To resolve this, [Meta transactions](https://docs.openzeppelin.com/contracts/4.x/api/metatx) and Relayers can be leveraged. Additionally, it is important to note that the beta version of Chainlink Functions only permits whitelisted addresses to call the DON network. Thankfully, with meta-transactions (because of Relayer), both problems can be addressed with a single solution.

> Gasless meta-transactions offer users a more seamless experience, and potentially one where they don’t have to spend as much money to engage with the blockchain. This method gives users the option to sign a transaction for free and have it securely executed by a third party, with that other party paying the gas to execute the transaction.
>
> A gasless meta-transaction relay can be easily and securely implemented using OpenZeppelin Defender by way of a Relayer. A Defender Relay allows you to send transactions easily and handles private key storage, transaction signing, nonce management, gas estimation, and automatic resubmissions if necessary.
>
> Check out [OpenZeppelin Meta Transactions Documentation](https://docs.openzeppelin.com/defender/guide-metatx).

This is how the process looks like with meta transactions:

1. The user will sign a transaction message.
2. The signed transaction message will be sent to the [Relayer](/ui/src/pages/api/relayTransaction.ts).
3. The Relayer will send the signed transaction to the `MinimalForwarder` and pay the gas fees on behalf of the user.
4. The `MinimalForwarder` will extract the signed transaction and call the actual Stork contract.
5. Stork contract will call the DON network ... and do the rest as explained above
...

Notice that Stork contract calls that involve DON interactions are called from Relayer and routed through the `MinimalForwarder`. As a result, we can request Chainlink to whitelist the `Relayer` address to enable its use for all users.

Currently, the Relayer covers the cost of gas fees for transactions. However, it is fairly easy to deduct these fees from the user who claims the funds and automatically transfer them to the Relayer.

## Access Token privacy

[Stork.sol#L137](/chainlink-functions/contracts/Stork.sol#L137)
```solidity
function claimTwitterHandle(
 >>> string calldata expectedTwitterHandle, <<<<
 >>> string calldata encryptedAccessToken, <<<<
 bool claimFundsImmediately) public
```

When passing an access token through a public network to Chainlink functions, privacy is at risk as it may expose users' personal information such as email and name. To mitigate this issue, an encryption solution has been implemented. This involves encrypting the access token with the DON Public Key before transmitting it over the network. The steps involved in this process are:

1. The user obtains an access token from Twitter API.
2. The access token is encrypted with the [DON Public Key](https://docs.chain.link/chainlink-functions/tutorials/api-use-secrets-offchain) using an [off-chain encryptor]((/ui/src/pages/api/encryptAccessToken.ts)).
3. The encrypted access token is then passed to the Stork contract to ensure that only DON Nodes can access it.
4. The Chainlink javascript function receives the encrypted access token, decrypts it, and calls Twitter to verify it.

It is important to note that anyone can run [their own encryptor](/ui/src/pages/api/encryptAccessToken.ts) and interact with the Stork contract as the encryption process only involves encrypting with the DON Public Key and Sender's signature. However, if a user does not run their own encryptor, there is a risk that the off-chain encryptor may forge the access token and input the wrong one. To prevent this, the claim transaction requires the user to provide the expected Twitter handle along with the access token. This provides a layer of protection as the DON network comes to a consensus on the actual Twitter handle associated with the access token, which is then checked against the expected handle. This eliminates any doubt the user may have about the DON network or off-chain encryptor unexpectedly deciding on the wrong Twitter handle.

## Access Token as a proof of ownership

We previously assumed that ownership of a Twitter handle could be proven by having the corresponding Access Token. However, it has come to light that this is not entirely accurate as third-party applications can also obtain access to these tokens and perform actions on behalf of the user, including claiming funds from Stork. This presents a security risk that needs to be addressed. To mitigate this issue, we have implemented an additional layer of protection that ensures the access token was issued by a specific application that is authorized to claim funds. These authorized apps can be added or removed in Stork contract by governance later.

The flow of this process is as follows:

1. The user obtains the access token through a Twitter 3rd party app.
2. The access token is then passed to an off-chain encryptor, which verifies that the access token was issued by the correct client (i.e., authorized app).
3. The access token is then encrypted and sent to the Stork.

In conclusion, the off-chain encryptor, access token client validator, and relayer will function as a single off-chain operator. This operator can be run by anyone, and the Stork contract will whitelist these operators based on governance decisions.

## DON Network's access to user's access token

Once the access token has been transmitted securely to the DON Network, it is crucial to ensure that malicious DON nodes cannot use the access token to remap Twitter handles to their own addresses. This can be addressed by considering the limited lifetime of the access token, which is valid for a fixed period (2 hours in the case of Twitter). A DON node attempting to exploit Stork using the access token will have a two-hour window to do so. However, after this time period, the access token will be invalid and cannot be used to claim assets.

To mitigate the risk of malicious DON nodes, we have implemented a [simple time lock](/chainlink-functions/contracts/Stork.sol#90) mechanism that prevents the remapping of msg.Sender with a new Twitter handle for two hours. This ensures that even if a malicious DON node has access to the access token, they cannot use it to exploit the system beyond the two-hour time period. The access token they had access to becomes invalid after the time lock, rendering it powerless.


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

## Architecture
![Stork Architecture](/assets/Stork-Architecture.png)

## Demo
Check out how simple is using Stork! [Watch on Youtube](https://www.youtube.com/watch?v=R1ZVhTwik2s).

## Conclusion

Stork is a promising project that aims to leverage social identity for transacting digital assets. While it is not ready for production use, it provides a solid foundation for further development and exploration of the use of Chainlink Functions for on-chain social identity verification. The project code can be found on the links provided below.

## Roadmap

- [x] Implement MVP (for ETHDenver Hackathon)
- [x] Make claim transactions gasless
- [x] Make AccessToken encrypted
- [x] Make a check for AccessToken to be from specific client-id
- [ ] Allow remmaping of twitter handle after 2 hours (ensuring access token is )
- [ ] Code cleanup, restructure repository
- [ ] Improve privacy of transactions
- [ ] Implement governence for Relayer/Encryptors
- [ ] Add support of ETH, ERC20 tokens
- [ ] Reclaim fees to relayer, that was paid for claim transaction
- [ ] Implement protocol fees
- [ ] Allow sender to reclaim sent funds
- [ ] Abstract awaiy smart contract to use different social identities
- [ ] Add support of other social identities (Reddit, Facebook, Mastordom ...)
- [ ] Initial Security review/audit
- [ ] Improve Relayer to have a queue of transactions
- [ ] Write and publish whitepaper
- [ ] Public Beta launch
- [ ] 
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
4. Add the newly created Stork contract as a functions consumer

```console
npx hardhat functions-sub-add --subid SUBSCRIPTION_ID --contract STORK_CONTRACT_ADDRESS --network mumbai
```

5. Send a request to deploy Stork contract

```console
npx hardhat stork-request --contract STORK_CONTRACT_ADDRESS --accesstoken TWITTER_ACCESS_TOKEN --network mumbai --twitterhandle TWITTER_HANDLE
```

6. Send request via Forwarder (Meta-transaction)

Configure your second account to only sign the transaction by adding `PRIVATE_KEY_2` to `.env` file. Then run:

```console
npx hardhat stork-forwarder-request --contract STORK_CONTRACT_ADDRESS --accesstoken TWITTER_ACCESS_TOKEN --network mumbai --twitterhandle TWITTER_HANDLE
```

Make sure you have `Forwarder` contract address configured in [network-config](chainlink-functions/network-config.js).

## Contracts and Scripts

- Stork Contract [chainlink-functions/contracts/Stork.sol](/chainlink-functions/contracts/Stork.sol)
- Stork Javascript Chainlink Function [chainlink-functions/stork-twitter.js](/chainlink-functions/stork-twitter.js)
- Access Token Encrypter [api/encryptAccessToken.ts](/ui/src/pages/api/encryptAccessToken.ts)
- Relayer [api/relayTransaction.ts](/ui/src/pages/api/relayTransaction.ts)
- Next.js [UI App](/ui/)
- Helping scripts 
  - [Deploy Stork](/chainlink-functions/tasks/Functions-client/deployClient.js#L54)
  - [Deploy MinimalForwarder](chainlink-functions/tasks/Functions-client/deployForwarder.js)
  - [Send Stork Request](/chainlink-functions/tasks/Functions-client/request.js#L220)
  - [Send Stork Request with Meta-Transaction](/chainlink-functions/tasks/Functions-client/request.js#L376)

## Contributors
- [Aram Kocharyan](https://twitter.com/bot_insane)
- [Babken Gevorgyan](https://twitter.com/babgev)
- [Anna Tantushyan](https://twitter.com/TantushyanAnna)
