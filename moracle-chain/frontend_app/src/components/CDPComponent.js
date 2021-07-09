import React, {useState} from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Link,
  Divider,
  Button,
} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {Link as RouterLink} from "react-router-dom";
import {transactions, cryptography, Buffer} from "@liskhq/lisk-client";

import LiquidateCDPDialog from "./dialogs/LiquidateCDPDialog";
import PayOffCDPDialog from "./dialogs/PayOffCDPDialog";
import TransferCustomTokenDialog from "./dialogs/TransferCustomTokenDialog";

const useStyles = makeStyles((theme) => ({
  propertyList: {
    listStyle: "none",

    "& li": {
      margin: theme.spacing(2, 0),
      borderBottomColor: theme.palette.divider,
      borderBottomStyle: "solid",
      borderBottomWidth: 1,

      "& dt": {
        display: "block",
        width: "100%",
        fontWeight: "bold",
        margin: theme.spacing(1, 0),
      },
      "& dd": {
        display: "block",
        width: "100%",
        margin: theme.spacing(1, 0),
      },
    },
  },
}));

export default function CDPComponent(props) {
  const classes = useStyles();
  const [openPurchase, setOpenPurchase] = useState(false);
  const [openPayOff, setOpenPayOff] = useState(false);
  const base32UIAddress = cryptography.getBase32AddressFromAddress(Buffer.from(props.item.borrower, "hex"), "lsk").toString("binary");
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">CDP {props.item.id.substr(0, 5)}</Typography>
        <Divider/>
        <dl className={classes.propertyList}>
          <li>
            <dt>CDP ID</dt>
            <dd>{props.item.id}</dd>
          </li>
          <li>
            <dt>Borrower</dt>
            <dd>{base32UIAddress}</dd>
          </li>
          <li>
            <dt>WLSK amount locked</dt>
            <dd>{transactions.convertBeddowsToLSK(props.item.amountOfWrappedLiskDeposited)}</dd>
          </li>
          <li>
            <dt>Expiration time</dt>
            <dd>{(new Date(parseInt(props.item.expirationTime))).toString()}</dd>
          </li>
          <li>
            <dt>Interest rate</dt>
            <dd>{props.item.interestRate} basis points</dd>
          </li>
          <li>
            <dt>Lisk price at creation</dt>
            <dd>${props.item.liskPriceAtCreation / 100}</dd>
          </li>
          <li>
            <dt>Amount of MUSD Created</dt>
            <dd>{transactions.convertBeddowsToLSK(props.item.amountOfMUSDCreated)}</dd>
          </li>
          <li>
            <dt>Has been liquidated?</dt>
            <dd>{props.item.hasBeenLiquidated ? "Yes" : "No"}</dd>
          </li>
          <li>
            <dt>Liquidated by</dt>
            <dd>{props.item.liquidatedBy}</dd>
          </li>
        </dl>
        {/*
          <Typography variant="h6">NFT History</Typography>
          <Divider />
        {props.item.tokenHistory.map((base32UIAddress) => (
          <dl className={classes.propertyList}>
          <li>
          <dd>
          <Link
          component={RouterLink}
          to={`/accounts/${base32UIAddress}`}
          >
        {base32UIAddress}
          </Link>
          </dd>
          </li>
          </dl>
          ))}
        */}

      </CardContent>
      <CardActions>

        {!props.item.hasBeenLiquidated && (
          <>
            <Button
              size="small"
              color="secondary"
              onClick={() => {
                setOpenPurchase(true);
              }}
            >
              Liquidate CDP
            </Button>
            <Button
              size="small"
              color="primary"
              onClick={() => {
                setOpenPayOff(true);
              }}
            >
              Pay off loan
            </Button>
            {<LiquidateCDPDialog
              open={openPurchase}
              handleClose={() => {
                setOpenPurchase(false);
              }}
              token={props.item}
            />}
            {<PayOffCDPDialog
              open={openPayOff}
              handleClose={() => {
                setOpenPayOff(false);
              }}
              token={props.item}
            />}
          </>
        )}

      </CardActions>
    </Card>
  );
}
