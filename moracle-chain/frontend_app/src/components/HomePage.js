import React, {Fragment, useEffect, useState} from "react";
import CustomToken from "./CustomToken";
import {Grid} from "@material-ui/core";
import {fetchAllCDPTokens, fetchAllNFTTokens} from "../api";
import CDPComponent from "./CDPComponent";

function HomePage() {
  const [NFTAccounts, setNFTAccounts] = useState([]);
  const [CDPs, setCDPs] = useState([]);

  useEffect(() => {
    async function fetchData() {
      setNFTAccounts(await fetchAllNFTTokens());
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      setCDPs(await fetchAllCDPTokens());
    }

    fetchData();
  }, []);


  return (
    <Fragment>
      <p style={{fontSize: 18}}>
        <a target="_blank" href={"http://localhost:4000/api/accounts/6bb9a2c9c438af03efef2d2c8b096ed4b62c22a0"}>View
          test account 1</a> <a target="_blank"
                                href={"http://localhost:4000/api/accounts/bfbd50494f76a0d23b6213917c83d4877e4b51d4"}>View
        test account 2</a>
      </p>
      <h1>Tokens</h1>
      <Grid container spacing={4}>
        {NFTAccounts.map((item) => (
          <Grid item md={4}>
            <CustomToken item={item} key={item.id}/>
          </Grid>
        ))}
      </Grid>
      <h1>Collateralized Debt Positions</h1>
      <Grid container spacing={4}>
        {CDPs.map(item => (
          <Grid item md={4}>
            <CDPComponent item={item} key={item.id}>

            </CDPComponent>
          </Grid>
        ))}
      </Grid>
    </Fragment>
  );
}

export default HomePage;
