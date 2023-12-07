"use client";

import React, { useEffect, useState } from 'react';
import { Upload, Card, Col, Row, ConfigProvider, Button, Layout, Typography, Divider } from 'antd';
import type { UploadProps } from 'antd';
import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import GET_NFTS from '../cadance/scripts/get_nfts.cdc'
import SETUP_USER from '../cadance/transactions/setup_user.cdc'
import MINT_NFT from '../cadance/transactions/mint_nft.cdc'

const { Header, Content } = Layout;
const { Text } = Typography;

fcl.config({
  "app.detail.title": process.env.NEXT_PUBLIC_FLOW_APP_NAME,
  "accessNode.api": process.env.NEXT_PUBLIC_FLOW_ACCESS_NODE_API,
  "discovery.wallet": process.env.NEXT_PUBLIC_FLOW_WALLET_DISCOVERY,
  "0xNonFungibleToken": process.env.NEXT_PUBLIC_FLOW_NON_FUNGIBLE_TOKEN,
  "0xCloseFar": process.env.NEXT_PUBLIC_FLOW_CLOSE_FAR,
})

const HomePage: React.FC = () => {

  const [user, setUser] = useState();
  const [ipfsHash, setIpfsHash] = useState('');
  const [nfts, setNfts] = useState([]);
  const isUserLoggedIn = () => (user && user.addr)

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
          <Divider>Listing</Divider>
          {isUserLoggedIn() && 
            <>
              <Row gutter={8} style={{padding: '0px 15px'}}>
                {nfts.map(nft => {
                  return <Col key={nft.id} span={4}>
                    <Card cover={<img alt="example" src={`https://ipfs.io/ipfs/${nft.ipfsHash}`} />}>
                      <Card.Meta title={`ID: ${nft.id}`} />
                    </Card>
                  </Col>
                })}
              </Row>
            </>
          }
          <Divider />
        </Content>
      </Layout>
    </ConfigProvider>
  );
};

export default HomePage;