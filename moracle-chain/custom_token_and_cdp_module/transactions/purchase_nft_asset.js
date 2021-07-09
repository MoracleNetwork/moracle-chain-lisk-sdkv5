const {setAllCDPTokens} = require("../cdp");
const {getAllCDPTokens} = require("../cdp");
const {BaseAsset} = require("lisk-sdk");
const {getAllNFTTokens, setAllNFTTokens} = require("../nft");

// TODO: Rename to liquidate CDP. This is actually the liquidate / pay off (close out) CDP transaction.

// 1.extend base asset to implement your custom asset
class PurchaseNFTAsset extends BaseAsset {
  // 2.define unique asset name and id
  name = "purchaseNFT";
  id = 1;
  // 3.define asset schema for serialization
  schema = {
    $id: "lisk/nft/purchase",
    type: "object",
    required: ["nftId"],
    properties: {
      cdpId: {
        dataType: "bytes",
        fieldNumber: 1,
      },
    },
  };

  async apply({asset, stateStore, reducerHandler, transaction}) {
    const cdpTokens = await getAllCDPTokens(stateStore);
    const cdpTokenIndex = cdpTokens.findIndex((t) => t.id.equals(asset.cdpId));
    if (cdpTokenIndex < 0) {
      throw new Error("Token id not found");
    }

    const cdp = cdpTokens[cdpTokenIndex];
    console.log(cdp);

    if (cdp.hasBeenLiquidated) {
      throw new Error("This CDP has already been liquidated.");
    }

    const LISK_PRICE = parseInt(process.env.LISK_PRICE);

    const senderAddress = transaction.senderAddress;
    const senderAccount = await stateStore.account.get(senderAddress);
    const requiredCollateral = (cdp.amountOfMUSDCreated * BigInt(15)) / BigInt(10);
    const currentValueOfCollateral = (cdp.amountOfWrappedLiskDeposited * BigInt(LISK_PRICE)) / BigInt(100);


    const senderWLSKIndex = senderAccount.nft.ownTokens.findIndex((a) =>
      a.equals(Buffer.from(process.env.WLSK_ID, "hex"))
    );
    const senderMUSDIndex = senderAccount.nft.ownTokens.findIndex((a) =>
      a.equals(Buffer.from(process.env.MUSD_ID, "hex"))
    );

    if (senderMUSDIndex < 0 || senderWLSKIndex < 0) {
      throw new Error("Liquidator must have WLSK and MUSD accounts.");
    }

    if (senderAccount.nft.ownTokenBalances[senderMUSDIndex] < cdp.amountOfMUSDCreated) {
      throw new Error("Liquidator does not have enough MUSD to purchase the collateral.")
    }


    if (senderAddress.toString("hex") === cdp.borrower.toString("hex")) {
      // TODO: add interest calculation.
      console.log("Attempted liquidation by borrower. Treating as pay-off event.");
      console.log("Debiting liquidator MUSD.")
      senderAccount.nft.ownTokenBalances[senderMUSDIndex] -= cdp.amountOfMUSDCreated;
      console.log("Crediting liquidator WLSK.");
      senderAccount.nft.ownTokenBalances[senderWLSKIndex] += cdp.amountOfWrappedLiskDeposited;

      await stateStore.account.set(senderAddress, senderAccount);

      console.log("Zeroing out CDP.");
      cdp.hasBeenLiquidated = true;
      cdp.amountOfWrappedLiskDeposited = BigInt(0);
      cdp.amountOfMUSDCreated = BigInt(0);
      await setAllCDPTokens(stateStore, cdpTokens);

      return;
    }


    if (currentValueOfCollateral < requiredCollateral) {
      console.log("CDP " + cdp.id.toString("hex") + " is eligible for liquidation");


      console.log("Debiting liquidator MUSD.")
      senderAccount.nft.ownTokenBalances[senderMUSDIndex] -= cdp.amountOfMUSDCreated;
      console.log("Crediting liquidator WLSK.");
      senderAccount.nft.ownTokenBalances[senderWLSKIndex] += cdp.amountOfWrappedLiskDeposited;

      await stateStore.account.set(senderAddress, senderAccount);


      console.log("Setting status of CDP to liquidated.");
      cdp.hasBeenLiquidated = true;
      cdp.liquidatedBy = senderAddress;
      await setAllCDPTokens(stateStore, cdpTokens);


      return;
    } else {
      throw new Error("This CDP is not eligible for liquidation.");
    }


    const token = nftTokens[nftTokenIndex];
    const tokenOwner = await stateStore.account.get(token.ownerAddress);
    const tokenOwnerAddress = tokenOwner.address;

    // 5.verify if minimum nft purchasing condition met
    if (token && token.minPurchaseMargin === 0) {
      throw new Error("This NFT token can not be purchased");
    }

    const tokenCurrentValue = token.value;
    const tokenMinPurchaseValue =
      tokenCurrentValue +
      (tokenCurrentValue * BigInt(token.minPurchaseMargin)) / BigInt(100);
    const purchaseValue = asset.purchaseValue;

    if (tokenMinPurchaseValue > purchaseValue) {
      throw new Error("Token can not be purchased. Purchase value is too low. Minimum value: " + tokenMinPurchaseValue);
    }

    const purchaserAddress = transaction.senderAddress;
    const purchaserAccount = await stateStore.account.get(purchaserAddress);

    // 6.remove nft from owner account
    const ownerTokenIndex = tokenOwner.nft.ownTokens.findIndex((a) =>
      a.equals(token.id)
    );
    tokenOwner.nft.ownTokens.splice(ownerTokenIndex, 1);
    await stateStore.account.set(tokenOwnerAddress, tokenOwner);

    // 7.add nft to purchaser account
    purchaserAccount.nft.ownTokens.push(token.id);
    await stateStore.account.set(purchaserAddress, purchaserAccount);

    token.ownerAddress = purchaserAddress;
    token.value = purchaseValue;
    nftTokens[nftTokenIndex] = token;
    await setAllNFTTokens(stateStore, nftTokens);

    // 8.debit LSK tokens from purchaser account
    await reducerHandler.invoke("token:debit", {
      address: purchaserAddress,
      amount: purchaseValue,
    });

    // 9.credit LSK tokens to purchaser account
    await reducerHandler.invoke("token:credit", {
      address: tokenOwnerAddress,
      amount: purchaseValue,
    });
  }
}

module.exports = PurchaseNFTAsset;
