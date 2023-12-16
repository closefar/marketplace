"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'
import AppContext from './AppContext';
import * as fcl from "@onflow/fcl"
import { Dropdown, Space, ConfigProvider, Button, Layout, Typography, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
const { Header } = Layout;
const { Text } = Typography;

import StyledComponentsRegistry from '../lib/AntdRegistry';

// TODO: fix
// export const metadata = {
//   title: 'Close Far',
//   description: 'So close, but yet so far away.',
// };

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

const RootLayout = ({ children }: React.PropsWithChildren) => {

  const router = useRouter()
  const [user, setUser] = useState();
  const isUserLoggedIn = () => (user && user.addr)

  useEffect(() => {
    fcl.currentUser().subscribe(setUser)
  }, [])

  const menuItems = {
    items: [
      {
        label: 'Admin',
        key: 'admin',
      },
      {
        label: 'Logout',
        key: 'logout',
      }
    ],
    onClick: (e) => {
      if (e.key === 'admin') {
        router.push('/admin')
      } else if (e.key === 'logout') {
        fcl.unauthenticate()
        router.push('/')
      }
    }
  }

  return (
    <html lang="en">
      <body>
        <AppContext.Provider value={user}>
          <ConfigProvider>
            <StyledComponentsRegistry>
            <Layout>
            <Header style={{ display: 'flex', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', padding: '20px' }}>
              {isUserLoggedIn() && 
                <>
                  <Dropdown menu={menuItems}>
                    <Space>
                      <Avatar style={{background: '#ddd'}}>
                        <UserOutlined />
                      </Avatar>
                    </Space>
                  </Dropdown>
                  <Text style={{color: "#fff"}}>{user.addr}</Text>
                </>
              }
              {!isUserLoggedIn() && 
                <Button onClick={() => fcl.authenticate()}>Connect Wallet</Button>
              }
            </Header>
              {children}
            </Layout>
            </StyledComponentsRegistry>
          </ConfigProvider>
        </AppContext.Provider>
      </body>
    </html>
  )
};

export default RootLayout;