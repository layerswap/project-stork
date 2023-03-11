// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "./dev/functions/FunctionsClient.sol";
// import "@chainlink/contracts/src/v0.8/dev/functions/FunctionsClient.sol"; // Once published
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@openzeppelin/contracts/metatx/ERC2771Context.sol";
import "@openzeppelin/contracts/metatx/MinimalForwarder.sol";

/**
 * @title Stork contract - ETHDenver Hackathon Project
 * @notice This contract is used for allowing users to send and claim assets trustlessly to/from twitter handles
 */
contract Stork is FunctionsClient, ConfirmedOwner, ERC2771Context {
  using Functions for Functions.Request;

  mapping(bytes32 => address) public requestAddresses;
  mapping(bytes32 => string) public requestExpectedTwitterHandles;
  mapping(bytes32 => bool) public requestClaimFundsImmediately;
  mapping(string => uint256) public twitterBalances;
  mapping(address => string) public addressTwitterHandles;

  uint64 internal constant SUBSCRIPTION_ID = 159;
  uint32 internal constant GAS_LIMIT = 300000;
  string internal constant FUNCTION_CODE =
    "const twitterAccessToken = secrets.accessToken;\n"
    "if (!twitterAccessToken) {\n"
    "  throw Error('AccessToken is required.');\n"
    "}\n"
    "const twitterRequest = {\n"
    "    identityByAccessToken: () =>\n"
    "      Functions.makeHttpRequest({\n"
    "        url: 'https://api.twitter.com/2/users/me',\n"
    "        headers: { Authorization: `Bearer ${twitterAccessToken}` },\n"
    "      }),\n"
    "  };\n"
    "const handleRes = await new Promise((resolve, reject) => {\n"
    "    twitterRequest.identityByAccessToken().then((res) => {\n"
    "      if (!res.error) {\n"
    "        resolve(res);\n"
    "      } else {\n"
    "        reject(res);\n"
    "      }\n"
    "    });\n"
    "  });\n"
    "  if (handleRes.error) {\n"
    "    throw Error('Twitter API error.');\n"
    "  }\n"
    "const twitterHandle = handleRes.data.data.username || null;\n"
    "if (!twitterHandle) {\n"
    "  throw Error('Username null.');\n"
    "}\n"
    "return Functions.encodeString(twitterHandle);\n";

  event OCRResponse(bytes32 indexed requestId, bytes result, bytes err);

  /**
   * @notice Executes once when a contract is created to initialize state variables
   *
   * @param oracle - The FunctionsOracle contract
   */
  constructor(address oracle, MinimalForwarder forwarder)
    FunctionsClient(oracle)
    ERC2771Context(address(forwarder))
    ConfirmedOwner(msg.sender) {}

  /**
   * @notice Callback that is invoked once the DON has resolved the request or hit an error
   *
   * @param requestId The request ID, returned by sendRequest()
   * @param response Aggregated response from the user code
   * @param err Aggregated error from the user code or from the execution pipeline
   * Either response or error parameter will be set, but never both
   */
  function fulfillRequest(
    bytes32 requestId,
    bytes memory response,
    bytes memory err
  ) internal override {
    emit OCRResponse(requestId, response, err);

    // Make sure that oracles returned the handle that user was expecting
    assert(keccak256(bytes(requestExpectedTwitterHandles[requestId])) == keccak256(response));

    string memory twitterHandle = string(response);
    addressTwitterHandles[requestAddresses[requestId]] = twitterHandle;

    uint256 balance = twitterBalances[twitterHandle];
    if (requestClaimFundsImmediately[requestId] && balance > 0) {
      twitterBalances[twitterHandle] = 0;
      payable(requestAddresses[requestId]).transfer(balance);
    }
  }

  /**
   * @notice Allows the Functions oracle address to be updated
   *
   * @param oracle New oracle address
   */
  function updateOracleAddress(address oracle) public onlyOwner {
    setOracle(oracle);
  }

  /**
   * @notice Sends funds to twitter handle
   *
   * @param handle Twitter handle to send funds to
   */
  function sendToTwitterHandle(string calldata handle) public payable {
    twitterBalances[handle] += msg.value;
  }

  /**
   * @notice Reads balance of Twitter handle
   *
   * @param handle Twitter handle to check balance.
   */
  function balanceOfTwitterHandle(string calldata handle) public view returns (uint256) {
    return twitterBalances[handle];
  }

  /**
   * @notice Reads claimed address of Twitter handle
   *
   * @param addr Address to check claimed Twitter handle.
   */
  function twitterHandleOfAddress(address addr) public view returns (string memory) {
    return addressTwitterHandles[addr];
  }

  /**
   * @notice Claims twitter handle to sender.
   *
   * @param expectedTwitterHandle Expected Twitter handle.
   * @param encryptedAccessToken OAuth2 User Context Twitter access token encrypted. In Chainlink Functions secret format.
   * @param claimFundsImmediately Should we claim funds immediately.
   */
  function claimTwitterHandle(
    string calldata expectedTwitterHandle,
    bytes calldata encryptedAccessToken,
    bool claimFundsImmediately
  ) public returns (bytes32) {

    assert(encryptedAccessToken.length > 0);

    Functions.Request memory req;
    req.initializeRequest(Functions.Location.Inline, Functions.CodeLanguage.JavaScript, FUNCTION_CODE);

    req.addInlineSecrets(encryptedAccessToken);

    bytes32 assignedReqID = sendRequest(req, SUBSCRIPTION_ID, GAS_LIMIT);

    requestAddresses[assignedReqID] = _msgSender();
    requestExpectedTwitterHandles[assignedReqID] = expectedTwitterHandle;
    requestClaimFundsImmediately[assignedReqID] = claimFundsImmediately;

    return assignedReqID;
  }

  /**
   * @notice Claim funds
   *
   */
  function claimFunds() public {
    uint256 balance = twitterBalances[addressTwitterHandles[_msgSender()]];
    assert(balance > 0);
    twitterBalances[addressTwitterHandles[_msgSender()]] = 0;
    payable(_msgSender()).transfer(balance);
  }
}
