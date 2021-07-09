const {BaseModule} = require("lisk-sdk");
const {getAllNFTTokensAsJSON} = require("./nft");

const CreateNFTAsset = require("./transactions/create_nft_asset");
const PurchaseNFTAsset = require("./transactions/purchase_nft_asset");
const TransferNFTAsset = require("./transactions/transfer_nft_asset");
const CreateCDPAsset = require("./transactions/create_cdp_asset");
const {getAllCDPTokensAsJSON} = require("./cdp");

// Extend base module to implement your custom module
class NFTModule extends BaseModule {
  name = "nft";
  id = 1024;
  accountSchema = {
    type: "object",
    required: ["ownTokens", "ownTokenBalances", "collateralizedDebtPositions", "collateralizedDebtPositionLiquidationStatus"],
    properties: {
      ownTokens: {
        type: "array",
        fieldNumber: 1,
        items: {
          dataType: "bytes",
        },
      },
      ownTokenBalances: {
        type: "array",
        fieldNumber: 2,
        items: {
          dataType: "uint64"
        }
      },

      collateralizedDebtPositions: {
        type: "array",
        fieldNumber: 3,
        items: {
          dataType: "bytes"
        }
      },
      collateralizedDebtPositionLiquidationStatus: {
        type: "array",
        fieldNumber: 4,
        items: {
          dataType: "boolean"
        }
      }

    },
    default: {
      ownTokens: [],
      ownTokenBalances: [],
      collateralizedDebtPositions: [],
      collateralizedDebtPositionLiquidationStatus: [],
    },
  };
  transactionAssets = [new CreateNFTAsset(), new PurchaseNFTAsset(), new TransferNFTAsset(), new CreateCDPAsset()];
  actions = {
    // get all the registered NFT tokens from blockchain
    getAllNFTTokens: async () => getAllNFTTokensAsJSON(this._dataAccess),
    getAllCDPTokens: async () => getAllCDPTokensAsJSON(this._dataAccess),
  };
}

module.exports = {NFTModule};
