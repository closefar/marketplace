"use client";

import React, { useEffect, useState } from 'react';
import { Avatar, Card, Col, Row, Layout, Typography, Divider, Button } from 'antd';
import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import PURCHASE from '../../cadance/transactions/purchase.cdc'
import GET_SALE_NFTS from '../../cadance/scripts/get_sales.cdc'

const { Content } = Layout;
const { Text } = Typography;

const Account = ({ params }) => {

    const [saleNfts, setSaleNfts] = useState([]);
    
    useEffect(() => {
      getNFTsForSale()
    }, [])

    const getNFTsForSale = async () => {
      const result = await fcl.query({
        cadence: GET_SALE_NFTS,
        args: (arg, t) => [
          arg(params.account, t.Address)
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
        <Row gutter={8} style={{padding: '50px 15px 20px 15px'}}>
          <Col span={8} style={{textAlign:'center'}}>
            <Avatar size={180}>Morteza pashaie</Avatar>
          </Col>
          <Col span={16}>
            <div><Text>Artist: Morteza Pashaei</Text></div>
            <div><Text>Joined close far at: march 2016</Text></div>
            <Divider></Divider> 
            <div><Text>About Morteza:</Text></div>
            <div>
              <Text>
                Born and raised in Tehran, Pashaei studied graphic design and was interested in music since his childhood, when he began playing guitar. Less than two decades later, he was diagnosed with stomach cancer in 2013 and hospitalized at Tehran's Bahman Hospital on 3 November 2014
              </Text>
            </div>
          </Col>
        </Row>
        <Divider orientation='left'>Listing for sale from Morteza ({params.account})</Divider> 
        <Row gutter={8} style={{padding: '15px'}}>
          {saleNfts.map(nft => {
            return <Col key={nft.nft.id} span={4}>
              <Card cover={<img alt="example" src={`https://ipfs.io/ipfs/${nft.nft.ipfsHash}`} />}>
                <Card.Meta title={`ID: ${nft.nft.id}`} />
                <Card.Meta title={`Price: ${nft.price}`} />
                <Divider />
                <Button type='primary' onClick={() => purchase(params.account, nft.nft.id, nft.price)}>Purchase</Button>
              </Card>
            </Col>
          })}
        </Row>
      </Content>
    )
}

export default Account