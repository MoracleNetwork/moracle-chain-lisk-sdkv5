const {setAllCDPTokens} = require("../cdp");
const {getAllCDPTokens} = require("../cdp");
const {BaseAsset} = require("lisk-sdk");

const {createCDPToken} = require("../cdp");

// 1.extend base asset to implement your custom asset
class CreateCDPAsset extends BaseAsset {
  // 2.define unique asset name and id
  name = "createCDP";
  id = 3;
  // 3.define asset schema for serialization
  schema = {
    $id: "moracle/cdp/create",
    type: "object",
    required: ["amountOfWrappedLiskDeposited", "expirationTime", "interestRate", "liskPriceAtCreation", "amountOfMUSDCreated", "hasBeenLiquidated"],
    properties: {
      amountOfWrappedLiskDeposited: {
        dataType: "uint64",
        fieldNumber: 1,
      },
      // JavaScript timestamp including milliseconds
      expirationTime: {
        dataType: "uint64",
        fieldNumber: 2,
      },
      interestRate: {
        // in basis points
        dataType: "sint32",
        fieldNumber: 3
      },
      liskPriceAtCreation: {
        // in cents
        dataType: "uint32",
        fieldNumber: 4
      },
      amountOfMUSDCreated: {
        // in beddows
        dataType: "uint64",
        fieldNumber: 5
      },
      hasBeenLiquidated: {
        dataType: "boolean",
        fieldNumber: 6
      },
      liquidatedBy: {
        dataType: "bytes",
        fieldNumber: 7
      },
    },
  };

  validate({asset}) {
    if (asset.amountOfWrappedLiskDeposited <= 0) {
      throw new Error("Deposit amount too low.");
    }
  };

  async apply({asset, stateStore, reducerHandler, transaction}) {
    // 4.verify if sender has enough balance
    const senderAddress = transaction.senderAddress;
    const senderAccount = await stateStore.account.get(senderAddress);

    // TODO: Remove and replace with an on-chain designation for the current WLSK asset. This should not be used in production.
    const senderWLSKIndex = senderAccount.nft.ownTokens.findIndex((a) =>
      a.equals(Buffer.from(process.env.WLSK_ID, "hex"))
    );


    if (senderWLSKIndex < 0) {
      throw new Error("Sender does not have a WLSK balance");
    }
    if (senderAccount.nft.ownTokenBalances[senderWLSKIndex] < BigInt(asset.amountOfWrappedLiskDeposited)) {
      throw new Error("Sender does not have enough WLSK balance");
    }

    const LISK_PRICE = parseInt(process.env.LISK_PRICE);
    const EFFECTIVE_LISK_PRICE = parseInt(process.env.LISK_PRICE / 1.6); // to ensure the collateral is over 150% of the value;

    const amountOfMUSDCreated = BigInt(asset.amountOfWrappedLiskDeposited * BigInt(EFFECTIVE_LISK_PRICE)) / BigInt(100);

    console.log(amountOfMUSDCreated)
    const cdpToken = createCDPToken({
      nonce: transaction.nonce,
      borrower: senderAddress,
      amountOfWrappedLiskDeposited: BigInt(asset.amountOfWrappedLiskDeposited),
      expirationTime: BigInt(asset.expirationTime),
      interestRate: asset.interestRate,
      liskPriceAtCreation: LISK_PRICE,
      amountOfMUSDCreated: amountOfMUSDCreated,
      hasBeenLiquidated: false,
    });
    // debit WLSK
    senderAccount.nft.ownTokenBalances[senderWLSKIndex] -= BigInt(asset.amountOfWrappedLiskDeposited);


    const allTokens = await getAllCDPTokens(stateStore);
    allTokens.push(cdpToken);
    await setAllCDPTokens(stateStore, allTokens);


    // credit MUSD
    const senderMUSDIndex = senderAccount.nft.ownTokens.findIndex((a) =>
      a.equals(Buffer.from(process.env.MUSD_ID, "hex"))
    );
    if (senderMUSDIndex < 0) {
      // create MUSD account
      senderAccount.nft.ownTokens.push(Buffer.from(process.env.MUSD_ID, "hex"));
      senderAccount.nft.ownTokenBalances.push(amountOfMUSDCreated);
      await stateStore.account.set(senderAddress, senderAccount);
    } else {

      senderAccount.nft.ownTokenBalances[senderMUSDIndex] += BigInt(amountOfMUSDCreated);
    }


    await stateStore.account.set(senderAddress, senderAccount);


  }
}

module.exports = CreateCDPAsset;
