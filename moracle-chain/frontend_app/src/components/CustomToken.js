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

export default function CustomToken(props) {
    const classes = useStyles();
    const [openPurchase, setOpenPurchase] = useState(false);
    const [openTransfer, setOpenTransfer] = useState(false);
    const base32UIAddress = cryptography.getBase32AddressFromAddress(Buffer.from(props.item.ownerAddress, "hex"), "lsk").toString("binary");
    return (
        <Card>
            <CardContent>
                <Typography variant="h6">{props.item.name}</Typography>
                <Divider/>
                <dl className={classes.propertyList}>
                    {!props.item.name.startsWith("CDP") && <li>
                        <dt>Token ID</dt>
                        <dd>{props.item.id}</dd>
                    </li>}
                    {!props.minimum && (
                        <li>
                            <dt>Issuing account</dt>
                            <dd>
                                <Link
                                    component={RouterLink}
                                    to={`/accounts/${base32UIAddress}`}
                                >
                                    {base32UIAddress}
                                </Link>
                            </dd>
                        </li>
                    )}
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
                {!props.item.name.startsWith("CDP") && (
                    <>
                        <Button
                            size="small"
                            color="primary"
                            onClick={() => {
                                setOpenTransfer(true);
                            }}
                        >
                            Transfer Tokens
                        </Button>
                        <TransferCustomTokenDialog
                            open={openTransfer}
                            handleClose={() => {
                                setOpenTransfer(false);
                            }}
                            token={props.item}
                        />
                    </>)}
                {props.item.name.startsWith("CDP") ? (
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
                        <LiquidateCDPDialog
                            open={openPurchase}
                            handleClose={() => {
                                setOpenPurchase(false);
                            }}
                            token={props.item}
                        />
                    </>
                ) : (
                    <div></div>
                )}
            </CardActions>
        </Card>
    );
}
