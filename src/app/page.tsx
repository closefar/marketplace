"use client";

import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Layout, Divider } from 'antd';
import * as fcl from "@onflow/fcl"
import GET_SALE_NFTS from '../cadance/scripts/get_sales.cdc'

const { Content } = Layout;

const HomePage: React.FC = () => {

  const [saleNfts, setSaleNfts] = useState([]);

  useEffect(() => {
    getNFTsForSale()
  }, [])
  
  const getNFTsForSale = async () => {

    // TODO: improvement needed.
    const address = "0x67478209263e46e6";
    const result = await fcl.query({
      cadence: GET_SALE_NFTS,
      args: (arg, t) => [
        arg(address, t.Address)
      ],
    })
    setSaleNfts(result);
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
            </Card>
          </Col>
        })}
      </Row>
    </Content>
  );
};

export default HomePage;