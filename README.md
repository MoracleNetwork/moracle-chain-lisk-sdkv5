# Moracle Stablecoin (Lisk SDK 5)

Moracle Chain featuring Wrapped Lisk and CDPs.

**This is not an oracle! This is a blockchain which implements CDPs in order to issue a stablecoin (MUSD). Oracle
integration coming soon.**

# Setup guide

The following accounts will be useful:

- Test account 1. `lsk97jdmr7pnvwunsg8mke3ev57drsv23qzya2hhp`
  , `place series grief pyramid potato similar deer exhaust deliver pulse wage scout`.
- Test account
  2. `lskwffqzr687du9p7svv73wazfkuhgpek7kejdvs2` `exclude never merry company trip hover crucial solid novel essay hamster jelly`
  .
- WLSK genesis account (can send unlimited amounts of WLSK, will be replaced with a real provider soon)
  . `hotel alter print warrior icon supply idle believe approve art together ignore`.

Starting the app:

```shell
# start the blockchain
cd moracle-chain
npm i
node index.js
# in a separate terminal, start the frontend.
cd moracle-chain/frontend_app
npm i
npm start
```

Step-by-step guide:

1. Send funds to the test account by pressing the + in the lower right, selecting "Transfer funds", and using the
   genesis account to send tokens.
2. Create the WLSK and MUSD custom tokens by pressing the + in the lower right and selecting "Create custom token".
3. Insert the custom tokens IDs into environment variables and start the blockchain as shown below. Also set LISK_PRICE
   to any value in cents.

```shell
LISK_PRICE='300' WLSK_ID='755c5de9b23552032c93c739c43a085d9216aadc46bc9c1069d28214c0b113a5' MUSD_ID='9312295c6d4066ef74750eb8e3a3102a8d8b85c162ae3c483e1ce2c47d187275' node index.js
```

4. Fund your test account with WLSK by using the "Transfer Tokens" button on the WLSK token and using the genesis account.
5. Experiment with creating CDPs by pressing the + and selecting "Create CDP".

# Features

## Wrapped Lisk

Wrapped Lisk is a custom token intended to be issued by a transparent third-party who exchanges mainchain LSK for
sidechain WLSK. This allows value to be transferred to sidechains. The process is inspired by
[Wrapped Bitcoin](https://wbtc.network/). This is a temporary measure until full interoperability becomes available.

## CDPs and MUSD stablecoin

This project allows users to lock up WLSK to take out loans of MUSD, a stablecoin that is pegged to the US dollar. This
process is inspired by
[MakerDao's DAI](https://developer.makerdao.com/dai/1/).

### Loans

If you want liquidity without selling your Lisk, you can deposit LSK with a WLSK provider and use your WLSK to take out
a loan of MUSD (at the moment there are no WLSK wrapping providers, so you'll have to use the genesis account to test).
Here's the process:

1. Lock up WLSK to create MUSD stablecoins that are collateralized 150% by your WLSK.
2. Spend/keep those MUSD.
3. Pay off your loan and reclaim your collateral.

### Liquidation

If your CDP falls below 150% collateral, your position will be eligible for liquidation. Anyone will be able to purchase
your collateral WLSK with MUSD at a discount. The MUSD are then burned keeping the collateral to stablecoin ratio
steady.

## TODOs

- [ ] Set up app to work with actual price oracle rather than controlling price via environment variable.
- [ ] Allow WLSK and MUSD asset IDs to be defined on-chain rather than via environment variable.