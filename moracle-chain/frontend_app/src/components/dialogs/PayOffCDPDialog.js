import React, {Fragment, useContext, useState} from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  DialogActions,
} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import {NodeInfoContext} from "../../context";
import {purchaseNFTToken} from "../../utils/transactions/purchase_nft_token";
import * as api from "../../api";
import {transactions} from "@liskhq/lisk-client";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
    },
  },
}));

export default function LiquidateCDPDialog(props) {
  const nodeInfo = useContext(NodeInfoContext);
  const classes = useStyles();


  const [data, setData] = useState({
    cdpId: props.token.id,
    fee: "",
    passphrase: "",
  });

  const handleChange = (event) => {
    event.persist();
    setData({...data, [event.target.name]: event.target.value});
  };

  const handleSend = async (event) => {
    event.preventDefault();
    console.log(data);

    const res = await purchaseNFTToken({
      ...data,
      networkIdentifier: nodeInfo.networkIdentifier,
      minFeePerByte: nodeInfo.minFeePerByte,
    });
    await api.sendTransactions(res.tx);
    props.handleClose();
  };

  return (
    <Fragment>
      <Dialog open={props.open} onBackdropClick={props.handleClose}>
        <DialogTitle id="alert-dialog-title">
          {"Pay off Collateralized Debt Position"}
        </DialogTitle>
        <DialogContent>
          <p>This CDP was created at Lisk value of <b>${props.token.liskPriceAtCreation / 100}</b> and
            is backed
            by <b>{transactions.convertBeddowsToLSK(props.token.amountOfWrappedLiskDeposited)} WLSK</b> creating a total
            of <b>{transactions.convertBeddowsToLSK(props.token.amountOfMUSDCreated)} MUSD.</b></p>
          <p>If at the current price of
            Lisk, <b>{transactions.convertBeddowsToLSK(props.token.amountOfWrappedLiskDeposited)} WLSK</b> is worth less
            than <b>${transactions.convertBeddowsToLSK(props.token.amountOfMUSDCreated) * 1.5}</b> (150% of the amount of MUSD issued), this position will be eligible for liquidation.
          </p>
          <p>Submit this modal to attempt to pay off this loan (will only work if sent from the borrower's account).</p>
          <form className={classes.root} noValidate autoComplete="off">
            <TextField
              label="Fee"
              value={data.fee}
              name="fee"
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Passphrase"
              value={data.passphrase}
              name="passphrase"
              onChange={handleChange}
              fullWidth
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSend}>Pay off</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}
