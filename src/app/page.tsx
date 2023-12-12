"use client";

import React, { useEffect, useState } from 'react';
import { Input, Upload, Card, Col, Row, ConfigProvider, Button, Layout, Typography, Divider } from 'antd';
import type { UploadProps } from 'antd';
import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import GET_NFTS from '../cadance/scripts/get_nfts.cdc'
import GET_SALE_NFTS from '../cadance/scripts/get_sale_nfts.cdc'
import SETUP_USER from '../cadance/transactions/setup_user.cdc'
import PURCHASE from '../cadance/transactions/purchase.cdc'
import MINT_NFT from '../cadance/transactions/mint_nft.cdc'
import LIST_FOR_SALE from '../cadance/transactions/list_for_sale.cdc'
import UNLIST_FROM_SALE from '../cadance/transactions/unlist_from_sale.cdc'

const { Header, Content } = Layout;
const { Text } = Typography;

fcl.config({
  "app.detail.title": process.env.NEXT_PUBLIC_FLOW_APP_NAME,
  "accessNode.api": process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE_API,
  "discovery.wallet": process.env.NEXT_PUBLIC_FLOW_WALLET_DISCOVERY,
  "0xNonFungibleToken": process.env.NEXT_PUBLIC_FLOW_NON_FUNGIBLE_TOKEN,
  "0xCloseFarNFT": process.env.NEXT_PUBLIC_FLOW_CLOSE_FAR_NFT,
  "0xCloseFarMarketplace": process.env.NEXT_PUBLIC_FLOW_CLOSE_FAR_MARKETPLACE,
  "0xFlowToken": process.env.NEXT_PUBLIC_FLOW_FLOW_TOKEN,
  "0xFungibleToken": process.env.NEXT_PUBLIC_FLOW_FUNGIBLE_TOKEN,
})

const HomePage: React.FC = () => {

  const [user, setUser] = useState();
  const [ipfsHash, setIpfsHash] = useState('');
  const [nfts, setNfts] = useState([]);
  const [saleNfts, setSaleNfts] = useState([]);
  const isUserLoggedIn = () => (user && user.addr)

  const [priceState, setPriceState] = useState('');

  const uploadProps: UploadProps = {
    name: 'file',
    showUploadList: false,
    async onChange(info) {
      const hash = await uploadFile(info.file.originFileObj)
      setIpfsHash(hash)
    },
  };

  useEffect(() => {
    fcl.currentUser().subscribe(setUser)
  }, [])

  useEffect(() => {
    
    if (ipfsHash === "") {
      return
    }

    const mintNft = async () => {
      try {
        const transactionId = await fcl.send([
          fcl.transaction(MINT_NFT),
          fcl.args([
            fcl.arg(ipfsHash, t.String)
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
 
    mintNft()

  }, [ipfsHash])

  const setupAccount = async () => {
    try {
      const transactionId = await fcl.send([
        fcl.transaction(SETUP_USER),
        fcl.args([]),
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

  const listNfts = async () => {

    const result = await fcl.query({
      cadence: GET_NFTS,
      args: (arg, t) => [
        arg(user.addr, t.Address)
      ],
    })

    setNfts(result)
    console.log(result)
  }

  const listForSale = async (tokenID, price) => {
    try {
      const transactionId = await fcl.send([
        fcl.transaction(LIST_FOR_SALE),
        fcl.args([
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

  
  const getSaleNfts = async () => {

    const result = await fcl.query({
      cadence: GET_SALE_NFTS,
      args: (arg, t) => [
        arg(user.addr, t.Address)
      ],
    })
    setSaleNfts(result);
    console.log(result)
  }


  const unlist = async (tokenID) => {
    try {
      const transactionId = await fcl.send([
        fcl.transaction(UNLIST_FROM_SALE),
        fcl.args([
          fcl.arg(tokenID, t.UInt64),
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

  const purchase = async (tokenID) => {
    try {
      const transactionId = await fcl.send([
        fcl.transaction(PURCHASE),
        fcl.args([
          fcl.arg(user.addr, t.Address),
          fcl.arg(tokenID, t.UInt64),
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

  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      return data.IpfsHash
    } catch (error) {
      return ""
    }
  }

  return (
    <ConfigProvider>
      <Layout>
        <Header style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', padding: '20px' }}>
          {isUserLoggedIn() && 
            <>
              <Button onClick={() => fcl.unauthenticate()}>Logout</Button>
              <Text style={{ color: '#fff' }}>{user.addr}</Text>
            </>
          }
          {!isUserLoggedIn() && 
            <Button onClick={() => fcl.authenticate()}>Connect Wallet</Button>
          }
        </Header>
        <Content>
          {isUserLoggedIn() && 
            <>
              <Divider />
              <Row gutter={16} style={{padding: '0px 15px'}}>
                <Col span={4}>
                  <Card title="Account">
                    <Button type="primary" onClick={() => setupAccount()}>Setup account</Button>
                  </Card>
                </Col>
                <Col span={4}>
                  <Card title="Create NFT">
                    <Upload {...uploadProps}>
                      <Button type='primary'>Upload Image/Video</Button>
                    </Upload>
                  </Card>
                </Col>
                <Col span={4}>
                  <Card title="Listing">
                    <Button type='primary' onClick={() => listNfts()}>Get my NFT list</Button>
                  </Card>
                </Col>
              </Row>
            </>
          }

          <Row gutter={16} style={{padding: '15px'}}>
            <Col span={4}>
              <Card title="get the sale list">
                <Button type='primary' onClick={() => getSaleNfts()}>list of sale NFTs</Button>
              </Card>
            </Col>
          </Row>

          <Divider>Listing</Divider>
          {isUserLoggedIn() && 
            <>
              <Row gutter={8} style={{padding: '0px 15px'}}>
                {nfts.map(nft => {
                  return <Col key={nft.id} span={4}>
                    <Card cover={<img alt="example" src={`https://ipfs.io/ipfs/${nft.ipfsHash}`} />}>
                      <Card.Meta title={`ID: ${nft.id}`} />
                      <Divider />
                      <Input placeholder="Price"  onChange={(e) => setPriceState(e.target.value)}/>
                      <div style={{padding: '6px'}}></div>
                      <Button type='primary' onClick={() => listForSale(nft.id, priceState)}>List For Sale</Button>
                    </Card>
                  </Col>
                })}
              </Row>
            </>
          }
          <Divider>Listing for sale</Divider>
          {isUserLoggedIn() && 
            <>
              <Row gutter={8} style={{padding: '0px 15px'}}>
                {saleNfts.map(nft => {
                  return <Col key={nft.nftRef.id} span={4}>
                    <Card cover={<img alt="example" src={`https://ipfs.io/ipfs/${nft.nftRef.ipfsHash}`} />}>
                      <Card.Meta title={`ID: ${nft.nftRef.id}`} />
                      <Card.Meta title={`Price: ${nft.price}`} />
                      <Divider />
                      <Button type='primary' onClick={() => unlist(nft.nftRef.id)}>Unlist</Button>
                      <Divider />
                      <Button type='primary' onClick={() => purchase(nft.nftRef.id)}>Purchase</Button>
                    </Card>
                  </Col>
                })}
              </Row>
            </>
          }
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default HomePage;