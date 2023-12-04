"use client";

import React, { useEffect, useState } from 'react';
import { Upload, Card, Col, Row, ConfigProvider, Button, Layout, Typography, Divider } from 'antd';
import type { UploadProps } from 'antd';
import * as fcl from '@onflow/fcl'

const { Header, Content } = Layout;
const { Text } = Typography;

fcl.config({
  "app.detail.title": "Close far",
  "accessNode.api": "https://rest-testnet.onflow.org",
  "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
  "0xNonFungibleToken": "0x631e88ae7f1d7c20",
  "0xCloseFar": "",
})

const HomePage: React.FC = () => {

  const [user, setUser] = useState();
  const isUserLoggedIn = () => (user && user.addr)

  const uploadProps: UploadProps = {
    showUploadList: false,
    onChange(info) {
      console.log(info.file)
    },
  };

  useEffect(() => {
    fcl.currentUser().subscribe(setUser)
  }, [])

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
              <Row style={{padding: '0px 15px'}}>
                <Col span={4}>
                  <Card title="Create NFT">
                    <Upload {...uploadProps}>
                      <Button type='primary'>Upload Image/Video</Button>
                    </Upload>
                  </Card>
                </Col>
              </Row>
            </>
          }
          <Divider>Listing</Divider>
          {isUserLoggedIn() && 
            <>
              <Row style={{padding: '0px 15px'}}>
                <Col span={4}></Col>
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