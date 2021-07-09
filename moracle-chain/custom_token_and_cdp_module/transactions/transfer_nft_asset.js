const {BaseAsset, transactions, cryptography} = require("lisk-sdk");
const {getAllNFTTokens, setAllNFTTokens, createNFTToken} = require("../nft");

// 1.extend base asset to implement your custom asset
class TransferNFTAsset extends BaseAsset {
  // 2.define unique asset name and id
  name = "transferNFT";
  id = 2;
  // 3.define asset schema for serialization
  schema = {
    $id: "lisk/nft/transfer",
    type: "object",
    required: ["nftId", "recipient"],
    properties: {
      nftId: {
        dataType: "bytes",
        fieldNumber: 1,
      },
      recipient: {
        dataType: "bytes",
        fieldNumber: 2,
      },
      name: {
        dataType: "string",
        fieldNumber: 3,
      },
      amount: {
        dataType: "uint64",
        fieldNumber: 4,
      }
    },
  };

  async apply({asset, stateStore, reducerHandler, transaction}) {
    const nftTokens = await getAllNFTTokens(stateStore);
    const nftTokenIndex = nftTokens.findIndex((t) => t.id.equals(asset.nftId));

    console.log(asset);

    // verify the token exists
    if (nftTokenIndex < 0) {
      throw new Error("Token id not found");
    }

    const token = nftTokens[nftTokenIndex];
    const senderAddress = transaction.senderAddress;
    const senderAccount = await stateStore.account.get(senderAddress);
    const recipientAddress = asset.recipient;
    const recipientAccount = await stateStore.account.get(recipientAddress);

    const recipientIndex = recipientAccount.nft.ownTokens.findIndex((a) =>
      a.equals(token.id)
    );
    const senderIndex = senderAccount.nft.ownTokens.findIndex((a) =>
      a.equals(token.id)
    );

    if (senderAddress.toString('hex') === "66c1847c987bbd5b01a49d0c5abe5c36f01aaf7d") {
      // TODO: genesis account that should be removed, can send all custom tokens
      if (recipientIndex < 0) {
        // the recipient has never transacted in this token, add it to their account
        recipientAccount.nft.ownTokens.push(token.id);
        recipientAccount.nft.ownTokenBalances.push(asset.amount);

        await stateStore.account.set(recipientAddress, recipientAccount);

      } else {
        recipientAccount.nft.ownTokenBalances[recipientIndex] += BigInt(asset.amount);
        await stateStore.account.set(recipientAddress, recipientAccount);
      }
      return;
    }

    if (senderIndex < 0) {
      throw new Error("Sender has never transacted in this token");
    }

    if (
      senderAccount.nft.ownTokenBalances[senderIndex] < BigInt(asset.amount)
    ) {
      throw new Error("Sender does not have enough balance");
    }


    if (recipientIndex < 0) {
      // the recipient has never transacted in this token, add it to their account
      recipientAccount.nft.ownTokens.push(token.id);
      recipientAccount.nft.ownTokenBalances.push(asset.amount);
      senderAccount.nft.ownTokenBalances[senderIndex] -= BigInt(asset.amount);

      await stateStore.account.set(recipientAddress, recipientAccount);
      await stateStore.account.set(senderAddress, senderAccount);

    } else {
      recipientAccount.nft.ownTokenBalances[recipientIndex] += BigInt(asset.amount);
      senderAccount.nft.ownTokenBalances[senderIndex] -= BigInt(asset.amount);
      await stateStore.account.set(recipientAddress, recipientAccount);
    }


  }
}

module.exports = TransferNFTAsset;
