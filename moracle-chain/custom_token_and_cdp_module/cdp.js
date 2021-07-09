const {codec, cryptography} = require("lisk-sdk");

const registeredCDPsSchema = {
  $id: "moracle/cdp/registeredCDPs",
  type: "object",
  required: ["registeredCDPs"],
  properties: {
    registeredCDPs: {
      type: "array",
      fieldNumber: 1,
      items: {
        type: "object",
        required: ["id", "borrower", "amountOfWrappedLiskDeposited", "expirationTime", "interestRate", "liskPriceAtCreation", "amountOfMUSDCreated", "hasBeenLiquidated"],
        properties: {
          id: {
            dataType: "bytes",
            fieldNumber: 1,
          },
          borrower: {
            dataType: "bytes",
            fieldNumber: 2,
          },
          amountOfWrappedLiskDeposited: {
            dataType: "uint64",
            fieldNumber: 3,
          },
          // JavaScript timestamp including milliseconds
          expirationTime: {
            dataType: "uint64",
            fieldNumber: 4,
          },
          interestRate: {
            // in basis points
            dataType: "sint32",
            fieldNumber: 5
          },
          liskPriceAtCreation: {
            // in cents
            dataType: "uint32",
            fieldNumber: 6
          },
          amountOfMUSDCreated: {
            // in beddows
            dataType: "uint64",
            fieldNumber: 7
          },
          hasBeenLiquidated: {
            dataType: "boolean",
            fieldNumber: 8
          },
          liquidatedBy: {
            dataType: "bytes",
            fieldNumber: 9
          },
        },
      },
    },
  },
};

const CHAIN_STATE_CDP_TOKENS = "cdp:registeredCDPs";

const createCDPToken = ({
                          nonce,
                          borrower,
                          amountOfWrappedLiskDeposited,
                          expirationTime,
                          interestRate,
                          liskPriceAtCreation,
                          amountOfMUSDCreated,
                          hasBeenLiquidated
                        }) => {
  const nonceBuffer = Buffer.alloc(8);
  nonceBuffer.writeBigInt64LE(nonce);
  const seed = Buffer.concat([borrower, nonceBuffer]);
  const id = cryptography.hash(seed);

  return {
    id,
    borrower,
    amountOfWrappedLiskDeposited,
    expirationTime,
    interestRate,
    liskPriceAtCreation,
    amountOfMUSDCreated,
    hasBeenLiquidated: false
  };
};

const getAllCDPTokens = async (stateStore) => {
  const registeredTokensBuffer = await stateStore.chain.get(
    CHAIN_STATE_CDP_TOKENS
  );
  if (!registeredTokensBuffer) {
    return [];
  }

  const registeredTokens = codec.decode(
    registeredCDPsSchema,
    registeredTokensBuffer
  );

  return registeredTokens.registeredCDPs;
};

const getAllCDPTokensAsJSON = async (dataAccess) => {
  const registeredTokensBuffer = await dataAccess.getChainState(
    CHAIN_STATE_CDP_TOKENS
  );

  if (!registeredTokensBuffer) {
    return [];
  }

  const registeredTokens = codec.decode(
    registeredCDPsSchema,
    registeredTokensBuffer
  );

  return codec.toJSON(registeredCDPsSchema, registeredTokens)
    .registeredCDPs;
};

const setAllCDPTokens = async (stateStore, CDPTokens) => {
  const registeredTokens = {
    registeredCDPs: CDPTokens.sort((a, b) => a.id.compare(b.id)),
  };

  await stateStore.chain.set(
    CHAIN_STATE_CDP_TOKENS,
    codec.encode(registeredCDPsSchema, registeredTokens)
  );
};

module.exports = {
  registeredCDPsSchema,
  CHAIN_STATE_CDP_TOKENS,
  getAllCDPTokens,
  setAllCDPTokens,
  getAllCDPTokensAsJSON,
  createCDPToken,
};
