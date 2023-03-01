const { types } = require("hardhat/config")
const { VERIFICATION_BLOCK_CONFIRMATIONS, networkConfig } = require("../../network-config")

task("functions-deploy-forwarder", "Deploys the Forwarder contract")
  .setAction(async (taskArgs) => {
    if (network.name === "hardhat") {
      throw Error(
        'This command cannot be used on a local hardhat chain.  Specify a valid network or simulate an FunctionsConsumer request locally with "npx hardhat functions-simulate".'
      )
    }

    console.log(`Deploying Forwarder contract to ${network.name}`)

    console.log("\n__Compiling Contracts__")
    await run("compile")

    const forwaderFactory = await ethers.getContractFactory("MinimalForwarder")
    const forwarderContract = await forwaderFactory.deploy()

    console.log(
      `\nWaiting ${VERIFICATION_BLOCK_CONFIRMATIONS} blocks for transaction ${forwarderContract.deployTransaction.hash} to be confirmed...`
    )
    await forwarderContract.deployTransaction.wait(VERIFICATION_BLOCK_CONFIRMATIONS)

    console.log(`\Forwarder contract deployed to ${forwarderContract.address} on ${network.name}`)
  })