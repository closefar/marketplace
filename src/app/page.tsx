"use client";

import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Layout, Divider, Button } from 'antd';
import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import GET_SALE_NFTS from '../cadance/scripts/get_sales.cdc'
import PURCHASE from '../cadance/transactions/purchase.cdc'

const { Content } = Layout;

const HomePage: React.FC = () => {

  // TODO: improvement needed.
  const address = "0x67478209263e46e6"
  const [saleNfts, setSaleNfts] = useState([]);

  useEffect(() => {
    getNFTsForSale()
  }, [])
  
  const getNFTsForSale = async () => {

    const result = await fcl.query({
      cadence: GET_SALE_NFTS,
      args: (arg, t) => [
        arg(address, t.Address)
      ],
    })
    setSaleNfts(result);
  }

  const purchase = async (ownerAddress, tokenID, price) => {
    try {
      const transactionId = await fcl.send([
        fcl.transaction(PURCHASE),
        fcl.args([
          fcl.arg(ownerAddress, t.Address),
          fcl.arg(tokenID, t.UInt64),
          fcl.arg(price, t.UFix64),
        ]),
        fcl.payer(fcl.authz),
        fcl.proposer(fcl.authz),
        fcl.authorizations([fcl.authz]),
        fcl.limit(9999)
      ]).then(fcl.decode);
  
      console.log("txId: ", transactionId);
      return fcl.tx(transactionId).onceSealed();
    } catch(error) {
      console.log('Error: ', error);
    }
  }

  return (
    <Content>
      <Divider orientation="left">New NFT's on Close Far for sale</Divider>
      <Row gutter={8} style={{padding: '15px'}}>
        {saleNfts.map(nft => {
          return <Col key={nft.nft.id} span={4}>
            <Card cover={<img alt="example" src={`https://ipfs.io/ipfs/${nft.nft.ipfsHash}`} />}>
              <Card.Meta title={`ID: ${nft.nft.id}`} />
              <Card.Meta title={`Price: ${nft.price}`} />
              <Divider />
              <Button type='primary' onClick={() => purchase(address, nft.nft.id, nft.price)}>Purchase</Button>
            </Card>
          </Col>
        })}
      </Row>
    </Content>
  );
};

export default HomePage;