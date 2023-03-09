const { getDecodedResultLog, getRequestConfig } = require("../../FunctionsSandboxLibrary")
const { generateRequest } = require("./buildRequestJSON")
const { VERIFICATION_BLOCK_CONFIRMATIONS, networkConfig } = require("../../network-config")
const { signMetaTxRequest } = require("./../signer")
const readline = require("readline-promise").default
const encryptSecrets_1 = require("./../../FunctionsSandboxLibrary/encryptSecrets")


task("functions-request", "Initiates a request from an Functions client contract")
  .addParam("contract", "Address of the client contract to call")
  .addParam("subid", "Billing subscription ID used to pay for the request")
  .addOptionalParam(
    "simulate",
    "Flag indicating if simulation should be run before making an on-chain request",
    true,
    types.boolean
  )
  .addOptionalParam(
    "gaslimit",
    "Maximum amount of gas that can be used to call fulfillRequest in the client contract",
    100000,
    types.int
  )
  .addOptionalParam("requestgas", "Gas limit for calling the executeRequest function", 1_500_000, types.int)
  .setAction(async (taskArgs, hre) => {
    // A manual gas limit is required as the gas limit estimated by Ethers is not always accurate
    const overrides = {
      gasLimit: taskArgs.requestgas,
    }

    if (network.name === "hardhat") {
      throw Error(
        'This command cannot be used on a local development chain.  Specify a valid network or simulate an Functions request locally with "npx hardhat functions-simulate".'
      )
    }

    // Get the required parameters
    const contractAddr = taskArgs.contract
    const subscriptionId = taskArgs.subid
    const gasLimit = taskArgs.gaslimit
    if (gasLimit > 300000) {
      throw Error("Gas limit must be less than or equal to 300,000")
    }

    // Attach to the required contracts
    const clientContractFactory = await ethers.getContractFactory("FunctionsConsumer")
    const clientContract = clientContractFactory.attach(contractAddr)
    const OracleFactory = await ethers.getContractFactory("contracts/dev/functions/FunctionsOracle.sol:FunctionsOracle")
    const oracle = await OracleFactory.attach(networkConfig[network.name]["functionsOracleProxy"])
    const registryAddress = await oracle.getRegistry()
    const RegistryFactory = await ethers.getContractFactory(
      "contracts/dev/functions/FunctionsBillingRegistry.sol:FunctionsBillingRegistry"
    )
    const registry = await RegistryFactory.attach(registryAddress)

    const unvalidatedRequestConfig = require("../../Functions-request-config.js")
    const requestConfig = getRequestConfig(unvalidatedRequestConfig)

    const request = await generateRequest(requestConfig, taskArgs)

    // Check that the subscription is valid
    let subInfo
    try {
      subInfo = await registry.getSubscription(subscriptionId)
    } catch (error) {
      if (error.errorName === "InvalidSubscription") {
        throw Error(`Subscription ID "${subscriptionId}" is invalid or does not exist`)
      }
      throw error
    }
    // Validate the client contract has been authorized to use the subscription
    const existingConsumers = subInfo[2].map((addr) => addr.toLowerCase())
    if (!existingConsumers.includes(contractAddr.toLowerCase())) {
      throw Error(`Consumer contract ${contractAddr} is not registered to use subscription ${subscriptionId}`)
    }

    // Estimate the cost of the request
    const { lastBaseFeePerGas, maxPriorityFeePerGas } = await hre.ethers.provider.getFeeData()
    const estimatedCostJuels = await clientContract.estimateCost(
      [
        0, // Inline
        0, // Inline
        0, // JavaScript
        request.source,
        request.secrets ?? [],
        request.args ?? [],
      ],
      subscriptionId,
      gasLimit,
      maxPriorityFeePerGas.add(lastBaseFeePerGas)
    )
    // Ensure the subscription has a sufficent balance
    const linkBalance = subInfo[0]
    if (subInfo[0].lt(estimatedCostJuels)) {
      throw Error(
        `Subscription ${subscriptionId} does not have sufficient funds. The estimated cost is ${estimatedCostJuels} Juels LINK, but has balance of ${linkBalance}`
      )
    }

    // Print the estimated cost of the request
    console.log(
      `\nIf all ${gasLimit} callback gas is used, this request is estimated to cost ${hre.ethers.utils.formatUnits(
        estimatedCostJuels,
        18
      )} LINK`
    )
    // Ask for confirmation before initiating the request on-chain
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    let cont = false
    const q2answer = await rl.questionAsync("Continue? (y) Yes / (n) No\n")
    rl.close()
    if (q2answer.toLowerCase() !== "y" && q2answer.toLowerCase() !== "yes") {
      process.exit(1)
    }

    // Use a promise to wait & listen for the fulfillment event before returning
    await new Promise(async (resolve, reject) => {
      let requestId

      // Initiate the listeners before making the request
      // Listen for fulfillment errors
      oracle.on("UserCallbackError", async (eventRequestId, msg) => {
        if (requestId == eventRequestId) {
          console.log("Error in client contract callback function")
          console.log(msg)
        }
      })
      oracle.on("UserCallbackRawError", async (eventRequestId, msg) => {
        if (requestId == eventRequestId) {
          console.log("Raw error in client contract callback function")
          console.log(Buffer.from(msg, "hex").toString())
        }
      })
      // Listen for successful fulfillment
      let billingEndEventReceived = false
      let ocrResponseEventReceived = false
      clientContract.on("OCRResponse", async (eventRequestId, result, err) => {
        // Ensure the fulfilled requestId matches the initiated requestId to prevent logging a response for an unrelated requestId
        if (eventRequestId !== requestId) {
          return
        }

        console.log(`Request ${requestId} fulfilled!`)
        if (result !== "0x") {
          console.log(
            `Response returned to client contract represented as a hex string: ${result}\n${getDecodedResultLog(
              require("../../Functions-request-config"),
              result
            )}`
          )
        }
        if (err !== "0x") {
          console.log(`Error message returned to client contract: "${Buffer.from(err.slice(2), "hex")}"\n`)
        }
        ocrResponseEventReceived = true
        if (billingEndEventReceived) {
          return resolve()
        }
      })
      // Listen for the BillingEnd event, log cost breakdown & resolve
      registry.on(
        "BillingEnd",
        async (
          eventRequestId,
          eventSubscriptionId,
          eventSignerPayment,
          eventTransmitterPayment,
          eventTotalCost,
          eventSuccess
        ) => {
          if (requestId == eventRequestId) {
            // Check for a successful request & log a mesage if the fulfillment was not successful
            console.log(`Transmission cost: ${hre.ethers.utils.formatUnits(eventTransmitterPayment, 18)} LINK`)
            console.log(`Base fee: ${hre.ethers.utils.formatUnits(eventSignerPayment, 18)} LINK`)
            console.log(`Total cost: ${hre.ethers.utils.formatUnits(eventTotalCost, 18)} LINK\n`)
            if (!eventSuccess) {
              console.log(
                "Error encountered when calling fulfillRequest in client contract.\n" +
                  "Ensure the fulfillRequest function in the client contract is correct and the --gaslimit is sufficient."
              )
              return resolve()
            }
            billingEndEventReceived = true
            if (ocrResponseEventReceived) {
              return resolve()
            }
          }
        }
      )
      // Initiate the on-chain request after all listeners are initialized
      console.log(`\nRequesting new data for FunctionsConsumer contract ${contractAddr} on network ${network.name}`)
      const requestTx = await clientContract.executeRequest(
        request.source,
        request.secrets ?? [],
        requestConfig.secretsLocation,
        request.args ?? [],
        subscriptionId,
        gasLimit,
        overrides
      )
      // If a response is not received within 5 minutes, the request has failed
      setTimeout(
        () =>
          reject(
            "A response not received within 5 minutes of the request being initiated and has been canceled. Your subscription was not charged. Please make a new request."
          ),
        300_000
      )
      console.log(
        `Waiting ${VERIFICATION_BLOCK_CONFIRMATIONS} blocks for transaction ${requestTx.hash} to be confirmed...`
      )

      const requestTxReceipt = await requestTx.wait(VERIFICATION_BLOCK_CONFIRMATIONS)
      requestId = requestTxReceipt.events[2].args.id
      console.log(`\nRequest ${requestId} initiated`)
      console.log(`Waiting for fulfillment...\n`)
    })
  })

  task("stork-request", "Initiates a request from an Functions client contract")
  .addParam("contract", "Address of the client contract to call")
  .addParam("accesstoken", "Twitter oAuth Access token")
  .addParam("twitterhandle", "Expected Twitter handle")
  .addOptionalParam(
    "claimfunds",
    "Flag indicating if funds should be claimed as well",
    true,
    types.boolean
  )
  .setAction(async (taskArgs, hre) => {
    if (network.name === "hardhat") {
      throw Error(
        'This command cannot be used on a local development chain.  Specify a valid network or simulate an Functions request locally with "npx hardhat functions-simulate".'
      )
    }

    // Get the required parameters
    const contractAddr = taskArgs.contract
    const accessToken = taskArgs.accesstoken
    const expectedTwitterHandle = taskArgs.twitterhandle
    const claimFundsImmediately = taskArgs.claimfunds

    // Attach to the required contracts
    const clientContractFactory = await ethers.getContractFactory("Stork")
    const clientContract = clientContractFactory.attach(contractAddr)
    const OracleFactory = await ethers.getContractFactory("contracts/dev/functions/FunctionsOracle.sol:FunctionsOracle")
    const oracle = await OracleFactory.attach(networkConfig[network.name]["functionsOracleProxy"])
    const registryAddress = await oracle.getRegistry()
    const RegistryFactory = await ethers.getContractFactory(
      "contracts/dev/functions/FunctionsBillingRegistry.sol:FunctionsBillingRegistry"
    )
    const registry = await RegistryFactory.attach(registryAddress)

    const overrides = {
      gasLimit: 1500000,
    }

    const unvalidatedRequestConfig = require("../../Functions-request-config.js")
    const requestConfig = getRequestConfig(unvalidatedRequestConfig)
    const DONPublicKey = await oracle.getDONPublicKey()
    // Remove the preceding 0x from the DON public key
    requestConfig.DONPublicKey = DONPublicKey.slice(2)

    // Check that the subscription is valid
    let subInfo
    try {
      subInfo = await registry.getSubscription(159)
    } catch (error) {
      if (error.errorName === "InvalidSubscription") {
        throw Error(`Subscription ID "${subscriptionId}" is invalid or does not exist`)
      }
      throw error
    }

    // Validate the client contract has been authorized to use the subscription
    const existingConsumers = subInfo[2].map((addr) => addr.toLowerCase())
    if (!existingConsumers.includes(contractAddr.toLowerCase())) {
      throw Error(`Consumer contract ${contractAddr} is not registered to use subscription ${subscriptionId}`)
    }

    // Use a promise to wait & listen for the fulfillment event before returning
    await new Promise(async (resolve, reject) => {
      let requestId

      // Initiate the listeners before making the request
      // Listen for fulfillment errors
      oracle.on("UserCallbackError", async (eventRequestId, msg) => {
        if (requestId == eventRequestId) {
          console.log("Error in client contract callback function")
          console.log(msg)
        }
      })
      oracle.on("UserCallbackRawError", async (eventRequestId, msg) => {
        if (requestId == eventRequestId) {
          console.log("Raw error in client contract callback function")
          console.log(Buffer.from(msg, "hex").toString())
        }
      })
      // Listen for successful fulfillment
      let billingEndEventReceived = false
      let ocrResponseEventReceived = false
      clientContract.on("OCRResponse", async (eventRequestId, result, err) => {
        // Ensure the fulfilled requestId matches the initiated requestId to prevent logging a response for an unrelated requestId
        if (eventRequestId !== requestId) {
          return
        }

        console.log(`Request ${requestId} fulfilled!`)
        if (result !== "0x") {
          console.log(
            `Response returned to client contract represented as a hex string: ${result}\n${getDecodedResultLog(
              require("../../Functions-request-config"),
              result
            )}`
          )
        }
        if (err !== "0x") {
          console.log(`Error message returned to client contract: "${Buffer.from(err.slice(2), "hex")}"\n`)
        }
        ocrResponseEventReceived = true
        if (billingEndEventReceived) {
          return resolve()
        }
      })
      // Listen for the BillingEnd event, log cost breakdown & resolve
      registry.on(
        "BillingEnd",
        async (
          eventRequestId,
          eventSubscriptionId,
          eventSignerPayment,
          eventTransmitterPayment,
          eventTotalCost,
          eventSuccess
        ) => {
          if (requestId == eventRequestId) {
            // Check for a successful request & log a mesage if the fulfillment was not successful
            console.log(`Transmission cost: ${hre.ethers.utils.formatUnits(eventTransmitterPayment, 18)} LINK`)
            console.log(`Base fee: ${hre.ethers.utils.formatUnits(eventSignerPayment, 18)} LINK`)
            console.log(`Total cost: ${hre.ethers.utils.formatUnits(eventTotalCost, 18)} LINK\n`)
            if (!eventSuccess) {
              console.log(
                "Error encountered when calling fulfillRequest in client contract.\n" +
                  "Ensure the fulfillRequest function in the client contract is correct and the --gaslimit is sufficient."
              )
              return resolve()
            }
            billingEndEventReceived = true
            if (ocrResponseEventReceived) {
              return resolve()
            }
          }
        }
      )
      
      console.log(requestConfig);
        
      var encryptedAccessToken = "0x" +
        (await (0, encryptSecrets_1.encryptWithSignature)(
          requestConfig.walletPrivateKey,
          requestConfig.DONPublicKey,
          JSON.stringify({
            accessToken
          })
        ));

        var encryptedAccessToken2 = "0x43b0a069e1cf8b41e8d14f1ae37c397b02656dd9bb06a5365a3228e11efeed29c5339dbd523dc9e12804ec0baf1625ee57153f5e393ac77b60e9282c616b9cb3bdc14fa293e4a3ffe90186438693d95bb79a1b034e7f58d8e3c2f901d1c1033067416d077fe9a342a19b5ea0c4e1a5039c60296a473d16711be739a235105da95a783c4d65f5de5d052626dce5743504fa436aef0845b43b5f3c1e9417d1a8fc040693a76fd58946dd97a3fb426a41a170ea6c5ae60b0687d260c33324523e2704e1d08be74cee2d26850f8301d8a209eda1c73c1e61790e4a8d2b7fe7f57f67b57c38158f51941beb185c19f3a548a8507b00f1de5aa57ff609fd0327a143fb2647baf139da5ebd51e4091a8cae92e1c536395e0c6483030bc8719d0d3b1d5863a951b43043ad3e05ae7e0a0bf44e1a5677deceaa84c20c07cd30f566764baa059cd50dbfcbbf97e25d0181c3c0bfb531848595096f524777a28a54f806e4af5a25d246a54083e18da9135d97c8ad26cf";

      //var encryptedAccessToken = "0x5df5962e547a75f623b0a1432f322e5f02d0ca882d0b33dd409e8c7e435b8dc62166841e0ca5c149d7952dc72c7b67ea4721123b19bfa6947b62fc56ef99d693d4f64f523c297284dcf4784513e3f8184270d8dccdf88c01fa260220ef7acf0d89d04846c35e1701166e53f31226295a0c1f4b8d8a92bc94fb8994cf781b2e6cc9bb252886acb07eef8f9dfeb47f6bd31c0dbe457e360a3d7bdf8316d844d4d037579ae9ffa9f085f76cabd57cbcaed32066907ea4603dca3f9f47992d27d90f37d37a1f646ea282b712fc84a0d084eee0673e86b210af5aa033b394157802f707e707ab7578501225e4cb72313e6b3a19afaa7576552eda20e24bffa76d0ed491e825ba486afb2261e178e2157d6f611b5a2c5d60cd24c031603a468eec1345154959d2bdcd223a9f976594d9d6dd10da4b9d2e455d64cb8b5c65500cfb893231c1449b9dbc704984c5a7a44189125c3e1b4a43160ffa0581e3f24669efb217c1";

      // Initiate the on-chain request after all listeners are initialized
      console.log(`\nRequesting new data for Stork contract ${contractAddr} on network ${network.name}`)
      const requestTx = await clientContract.claimTwitterHandle(
        expectedTwitterHandle,
        encryptedAccessToken2,
        claimFundsImmediately,
        overrides
      )
      // If a response is not received within 5 minutes, the request has failed
      setTimeout(
        () =>
          reject(
            "A response not received within 5 minutes of the request being initiated and has been canceled. Your subscription was not charged. Please make a new request."
          ),
        300_000
      )
      console.log(
        `Waiting ${VERIFICATION_BLOCK_CONFIRMATIONS} blocks for transaction ${requestTx.hash} to be confirmed...`
      )

      const requestTxReceipt = await requestTx.wait(VERIFICATION_BLOCK_CONFIRMATIONS)
      requestId = requestTxReceipt.events[2].args.id
      console.log(`\nRequest ${requestId} initiated`)
    })
  })

  task("stork-forwarder-request", "Initiates a request from an Functions client contract")
  .addParam("contract", "Address of the Stork contract to call")
  .addParam("accesstoken", "Twitter oAuth Access token")
  .addParam("twitterhandle", "Expected Twitter handle")
  .addOptionalParam(
    "claimfunds",
    "Flag indicating if funds should be claimed as well",
    true,
    types.boolean
  )
  .setAction(async (taskArgs, hre) => {
    if (network.name === "hardhat") {
      throw Error(
        'This command cannot be used on a local development chain.  Specify a valid network or simulate an Functions request locally with "npx hardhat functions-simulate".'
      )
    }

    // Get the required parameters
    const contractAddr = taskArgs.contract
    const accessToken = taskArgs.accesstoken
    const expectedTwitterHandle = taskArgs.twitterhandle
    const claimFundsImmediately = taskArgs.claimfunds

    // Attach to the required contracts
    const clientContractFactory = await ethers.getContractFactory("Stork")
    const clientContract = clientContractFactory.attach(contractAddr)
    const forwarderContractFactory = await ethers.getContractFactory("MinimalForwarder")
    const forwarderContract = forwarderContractFactory.attach(networkConfig[network.name]["forwarder"])

    const OracleFactory = await ethers.getContractFactory("contracts/dev/functions/FunctionsOracle.sol:FunctionsOracle")
    const oracle = await OracleFactory.attach(networkConfig[network.name]["functionsOracleProxy"])
    const registryAddress = await oracle.getRegistry()
    const RegistryFactory = await ethers.getContractFactory(
      "contracts/dev/functions/FunctionsBillingRegistry.sol:FunctionsBillingRegistry"
    )
    const registry = await RegistryFactory.attach(registryAddress)

    const unvalidatedRequestConfig = require("../../Functions-request-config.js")
    const requestConfig = getRequestConfig(unvalidatedRequestConfig)
    const DONPublicKey = await oracle.getDONPublicKey()
    // Remove the preceding 0x from the DON public key
    requestConfig.DONPublicKey = DONPublicKey.slice(2)

    // Use a promise to wait & listen for the fulfillment event before returning
    await new Promise(async (resolve, reject) => {
      let requestId

      // Initiate the listeners before making the request
      // Listen for fulfillment errors
      oracle.on("UserCallbackError", async (eventRequestId, msg) => {
        if (requestId == eventRequestId) {
          console.log("Error in client contract callback function")
          console.log(msg)
        }
      })
      oracle.on("UserCallbackRawError", async (eventRequestId, msg) => {
        if (requestId == eventRequestId) {
          console.log("Raw error in client contract callback function")
          console.log(Buffer.from(msg, "hex").toString())
        }
      })
      
      var encryptedAccessToken = "0x" +
      (await (0, encryptSecrets_1.encryptWithSignature)(
        requestConfig.walletPrivateKey,
        requestConfig.DONPublicKey,
        JSON.stringify({
          accessToken
        })
      ));

      const accounts = await ethers.getSigners();
      const signer = accounts[1];

      console.log(`\nPreparing meta transaction request for ${signer.address}.`)
      const { request, signature } = await signMetaTxRequest(signer.provider, forwarderContract, {
        from: signer.address,
        to: clientContract.address,
        data: clientContract.interface.encodeFunctionData('claimTwitterHandle', [expectedTwitterHandle, encryptedAccessToken, claimFundsImmediately]),
      });

      const overrides = {
        gasLimit: 10000000,
      }
      const requestTx = await forwarderContract.execute(request, signature, overrides);
      
      // If a response is not received within 5 minutes, the request has failed
      setTimeout(
        () =>
          reject(
            "A response not received within 5 minutes of the request being initiated and has been canceled. Your subscription was not charged. Please make a new request."
          ),
        300_000
            )

      console.log(
        `Waiting ${VERIFICATION_BLOCK_CONFIRMATIONS} blocks for transaction ${requestTx.hash} to be confirmed...`
      )

      const requestTxReceipt = await requestTx.wait(VERIFICATION_BLOCK_CONFIRMATIONS)
      console.log(`\Transaction ${requestTxReceipt.Hash} succesffully published.`)
    })
  })