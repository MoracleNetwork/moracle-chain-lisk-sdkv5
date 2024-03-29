/* global BigInt */

import {transactions, codec, cryptography} from "@liskhq/lisk-client";
import {getFullAssetSchema, calcMinTxFee} from "../common";
import {fetchAccountInfo} from "../../api";

export const purchaseNFTTokenSchema = {
    $id: "lisk/nft/purchase",
    type: "object",
    required: ["cdpId"],
    properties: {
      cdpId: {
        dataType: "bytes",
        fieldNumber: 1,
      },
    }
};

export const purchaseNFTToken = async ({
                                           cdpId,
                                           passphrase,
                                           fee,
                                           networkIdentifier,
                                           minFeePerByte,
                                       }) => {
    const {publicKey} = cryptography.getPrivateAndPublicKeyFromPassphrase(
        passphrase
    );
    const address = cryptography.getAddressFromPassphrase(passphrase);
    const {
        sequence: {nonce},
    } = await fetchAccountInfo(address.toString("hex"));


    const {id, ...rest} = transactions.signTransaction(
        purchaseNFTTokenSchema,
        {
            moduleID: 1024,
            assetID: 1,
            nonce: BigInt(nonce),
            fee: BigInt(transactions.convertLSKToBeddows(fee)),
            senderPublicKey: publicKey,
            asset: {
                cdpId: Buffer.from(cdpId, "hex"),
            },
        },
        Buffer.from(networkIdentifier, "hex"),
        passphrase
    );

    return {
        id: id.toString("hex"),
        tx: codec.codec.toJSON(getFullAssetSchema(purchaseNFTTokenSchema), rest),
        minFee: calcMinTxFee(purchaseNFTTokenSchema, minFeePerByte, rest),
    };
};
