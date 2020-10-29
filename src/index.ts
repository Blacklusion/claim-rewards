import { logger } from "./common";
import { Api, JsonRpc, RpcError } from "eosjs";
import { JsSignatureProvider } from "eosjs/dist/eosjs-jssig";
import fetch from "node-fetch";
import * as config from "config";

let claimIntervalMs;
let chains = [];
let chainSettings;

main();
/**
 * Read Config and trigger cron based execution
 * @return if not all settings were specified
 */
function main() {
  let allVariablesSet = true;

  // Read Cron Pattern from local.toml
  try {
    claimIntervalMs = config.get("general.claimIntervalMs");
  } catch (e) {
    logger.error("No claim Interval was provided");
    allVariablesSet = false;
  }

  // Read activated chains from local.toml
  try {
    chains = config.get("general.chains");

    if (chains.length == 0) {
      logger.error("general.chains setting was provided. But it did not contain any entries!");
      allVariablesSet = false;
    }
  } catch (e) {
    logger.error("No general.chains was provided");
    allVariablesSet = false;
  }

  // Read chain Setings from local.toml
  try {
    chainSettings = config.get("chains");
  } catch (e) {
    logger.error("No chains sections was provided");
    allVariablesSet = false;
  }

  // Test if for every specified chain all necessary settings are set
  for (let chainId of chains) {
    const chain = chainSettings[chainId];
    try {
      if (!chain["apiUrl"]) {
        logger.error("No apiUrl was provided for " + chainId);
        allVariablesSet = false;
      }

      if (!chain["producerName"]) {
        logger.error("No producerName was provided for " + chainId);
        allVariablesSet = false;
      }

      if (!chain["permissionName"]) {
        logger.error('No permissionName (e.g. "claimrewards" or "active") was provided for ' + chainId);
        allVariablesSet = false;
      }

      if (!chain["privateKey"]) {
        logger.error("No privateKey was provided for " + chainId);
        allVariablesSet = false;
      }
    } catch (e) {
      logger.error("Could not read settings for " + chainId + ":", e);
      allVariablesSet = false;
    }
  }

  // Stop execution if some settings are missing
  if (!allVariablesSet) {
    logger.fatal("Not all variables were set. Aborting execution!");
    return 1;
  }

  logger.info("++++++++++++++++++++++++++++++ STARTUP COMPLETE ++++++++++++++++++++++++++++++");
  logger.info("Claiming Rewards every " + claimIntervalMs + "ms for " + chains.toString().replace(",", ", "));
  logger.info("Current Date: " + new Date());
  logger.info("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");

  /**
   * Claim rewards
   */
  claimRewardsAllChains();
  setInterval(claimRewardsAllChains, claimIntervalMs);
}

/**
 * Claims rewards for all activated chains
 */
function claimRewardsAllChains() {
  console.log("\n");
  logger.info("--------------- PERFORMING REWARD CLAIM ---------------");
  for (const chainId of chains) {
    claimRewardsSingleChain(chainSettings, chainId);
  }
}

/**
 * Claims rewards for the specified chain ONCE
 * @param chains = all settings for all chains as specified under the chains section in local.toml
 * @param chainId = name of the chain for which the rewards shall be claimed (must match name in local.toml)
 */
async function claimRewardsSingleChain(chains: any, chainId: any) {
  // Eos js settings
  const chain = chains[chainId];
  const rpc = new JsonRpc(chain["apiUrl"], { fetch });
  const api = new Api({
    rpc: rpc,
    signatureProvider: new JsSignatureProvider([chain["privateKey"]]),
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder(),
  });

  /**
   * Perform Claim
   */
  try {
    const response = await api.transact(
      {
        actions: [
          {
            account: "eosio",
            name: "claimrewards",
            authorization: [
              {
                actor: chain["producerName"],
                permission: chain["permissionName"],
              },
            ],
            data: {
              owner: chain["producerName"],
            },
          },
        ],
      },
      {
        broadcast: true,
        blocksBehind: 3,
        expireSeconds: 60,
        sign: true,
      }
    );

    // Claim successful
    logger.info(chainId + " => Successfully claimed rewards!");
    logger.debug(response);
  } catch (e) {
    // Claim failed
    logger.error(chainId + " => Failed to claim rewards: " + e.message);

    // Set logger to debug in common.ts to see the message (default = info)
    if (e instanceof RpcError) logger.debug(JSON.stringify(e.json, null, 2));
  }
}
