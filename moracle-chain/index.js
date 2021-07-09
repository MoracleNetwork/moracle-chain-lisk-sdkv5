// 1.Import lisk sdk to create the blockchain application
const {
  Application,
  configDevnet,
  genesisBlockDevnet,
  HTTPAPIPlugin,
  utils,
  cryptography
} = require('lisk-sdk');

// 2.Import NFT module and Plugin
const {NFTModule} = require('./custom_token_and_cdp_module');
const {NFTAPIPlugin} = require('./custom_token_and_cdp_api_plugin');

// 3.Update the genesis block accounts to include NFT module attributes
genesisBlockDevnet.header.timestamp = 1605699440;
genesisBlockDevnet.header.asset.accounts = genesisBlockDevnet.header.asset.accounts.map(
  (a) =>
    utils.objects.mergeDeep({}, a, {
      nft: {
        ownTokens: [],
        ownTokenBalances: [],
        collateralizedDebtPositions: [],
        collateralizedDebtPositionLiquidationStatus: []
      },
    }),
);

// 4.Update application config to include unique label
// and communityIdentifier to mitigate transaction replay
const appConfig = utils.objects.mergeDeep({}, configDevnet, {
  label: 'moracle-chain',
  genesisConfig: {communityIdentifier: 'MoracleChain'}, //In order to have a unique networkIdentifier
  logger: {
    consoleLogLevel: 'info',
  },
  plugins: {
    httpApi: {
      port: 4000,
      whiteList: ['127.0.0.1'],
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT'],
      },
      limits: {
        max: 0,
        delayMs: 0,
        delayAfter: 0,
        windowMs: 60000,
        headersTimeout: 5000,
        serverSetTimeout: 20000,
      },
    },
  }
});

// 5.Initialize the application with genesis block and application config
const app = Application.defaultApplication(genesisBlockDevnet, appConfig);

// 6.Register custom NFT Module and Plugins
app.registerModule(NFTModule);
app.registerPlugin(HTTPAPIPlugin);
app.registerPlugin(NFTAPIPlugin);

// 7.Run the application
app
  .run()
  .then(() => console.info('WLSK anc CDP Blockchain running....'))
  .catch(console.error);
