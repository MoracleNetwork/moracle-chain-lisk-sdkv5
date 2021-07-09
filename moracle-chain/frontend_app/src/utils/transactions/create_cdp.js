/* global BigInt */

import {transactions, codec, cryptography} from "@liskhq/lisk-client";
import {getFullAssetSchema, calcMinTxFee} from "../common";
import {fetchAccountInfo} from "../../api";

export const createCDPSchema = {
  $id: "moracle/cdp/create",
  type: "object",
  required: ["amountOfWrappedLiskDeposited", "expirationTime", "interestRate"],
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

export const createCDP = async ({
                                  amountOfWrappedLiskDeposited,
                                  interestRate,
                                  passphrase,
                                  fee,
                                  networkIdentifier,
                                  minFeePerByte,
                                }) => {
  const {publicKey} = cryptography.getPrivateAndPublicKeyFromPassphrase(
    passphrase
  );
  const address = cryptography.getAddressFromPassphrase(passphrase).toString("hex");

  const {
    sequence: {nonce},
  } = await fetchAccountInfo(address);

  const {id, ...rest} = transactions.signTransaction(
    createCDPSchema,
    {
      moduleID: 1024,
      assetID: 3,
      nonce: BigInt(nonce),
      fee: BigInt(transactions.convertLSKToBeddows(fee)),
      senderPublicKey: publicKey,
      asset: {
        amountOfWrappedLiskDeposited: BigInt(transactions.convertLSKToBeddows(amountOfWrappedLiskDeposited)),
        expirationTime: BigInt(Date.now() + 5184000000), // 60 days
        interestRate: parseInt(interestRate),
      },
    },
    Buffer.from(networkIdentifier, "hex"),
    passphrase
  );

  return {
    id: id.toString("hex"),
    tx: codec.codec.toJSON(getFullAssetSchema(createCDPSchema), rest),
    minFee: calcMinTxFee(createCDPSchema, minFeePerByte, rest),
  };
};
