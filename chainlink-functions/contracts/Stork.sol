// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "./dev/functions/FunctionsClient.sol";
// import "@chainlink/contracts/src/v0.8/dev/functions/FunctionsClient.sol"; // Once published
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

/**
 * @title Stork contract
 * @notice This contract is used for allowing users to send assets to twitter handles, then those users can claim those assets back
 */
contract Stork is FunctionsClient, ConfirmedOwner {
  using Functions for Functions.Request;

  mapping(bytes32 => address) public requestAddresses;
  mapping(string => uint256) public twitterBalances;
  mapping(address => string) public addressTwitterHandles;

  uint64 internal constant SUBSCRIPTION_ID = 159;
  uint32 internal constant GAS_LIMIT = 100000;
  string internal constant FUNCTION_CODE =
    "const twitterAccessToken = args[0];\n"
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
  constructor(address oracle) FunctionsClient(oracle) ConfirmedOwner(msg.sender) {}

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
    addressTwitterHandles[requestAddresses[requestId]] = string(response);
    emit OCRResponse(requestId, response, err);
  }

  /**
   * @notice Allows the Functions oracle address to be updated
   *
   * @param oracle New oracle address
   */
  function updateOracleAddress(address oracle) public onlyOwner {
    setOracle(oracle);
  }

  function sendToTwitter(string calldata handle) public payable {
    twitterBalances[handle] += msg.value;
  }

  function balanceOfTwitter(string calldata handle) public view returns (uint256) {
    return twitterBalances[handle];
  }

  function twitterAddress(address userAddress) public view returns (string memory) {
    return addressTwitterHandles[userAddress];
  }

  function claimTwitter(string calldata accessToken) public returns (bytes32) {
    Functions.Request memory req;
    req.initializeRequest(Functions.Location.Inline, Functions.CodeLanguage.JavaScript, FUNCTION_CODE);
    string[] memory args = new string[](1);
    args[0] = accessToken;
    req.addArgs(args);
    bytes32 assignedReqID = sendRequest(req, SUBSCRIPTION_ID, GAS_LIMIT);
    requestAddresses[assignedReqID] = msg.sender;
    return assignedReqID;
  }

  function claim() public {
    uint256 balance = twitterBalances[addressTwitterHandles[msg.sender]];
    if (balance > 0) {
      twitterBalances[addressTwitterHandles[msg.sender]] = 0;
      payable(msg.sender).transfer(balance);
    }
  }
}
