import React, { Fragment, useContext, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  DialogActions,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { NodeInfoContext } from "../../context";
import { createNFTToken } from "../../utils/transactions/create_nft_token";
import * as api from "../../api";
import {createCDP} from "../../utils/transactions/create_cdp";

const useStyles = makeStyles((theme) => ({
  root: {
    "& .MuiTextField-root": {
      margin: theme.spacing(1),
    },
  },
}));

export default function CreateCDPDialog(props) {
  const nodeInfo = useContext(NodeInfoContext);
  const classes = useStyles();
  const [data, setData] = useState({
    amountOfWrappedLiskDeposited: "",
    interestRate: "",
    fee: "",
    passphrase: "",
  });

  const handleChange = (event) => {
    event.persist();
    setData({ ...data, [event.target.name]: event.target.value });
  };

  const handleSend = async (event) => {
    event.preventDefault();

    const res = await createCDP({
      ...data,
      networkIdentifier: nodeInfo.networkIdentifier,
      minFeePerByte: nodeInfo.minFeePerByte,
    });
    console.log(res);
    await api.sendTransactions(res.tx);
    props.handleClose();
  };

  return (
    <Fragment>
      <Dialog open={props.open} onBackdropClick={props.handleClose}>
        <DialogTitle id="alert-dialog-title">{"Create Collateralized Debt Position"}</DialogTitle>
        <DialogContent>
          <form className={classes.root} noValidate autoComplete="off">
            <TextField
              label="Amount ot WLSK to lock up."
              value={data.amountOfWrappedLiskDeposited}
              name="amountOfWrappedLiskDeposited"
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Interest Rate"
              value={data.interestRate}
              name="interestRate"
              onChange={handleChange}
              fullWidth
            />
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
          <Button onClick={handleSend}>Create CDP</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  );
}
