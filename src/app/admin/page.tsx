"use client";

import React, { useContext, useEffect, useState } from 'react';
import { Skeleton, Menu, Input, Upload, Card, Col, Row, Button, Layout, Divider } from 'antd';
import type { UploadProps } from 'antd';
import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import GET_NFTS from '../../cadance/scripts/get_nfts.cdc'
import GET_SALE_NFTS from '../../cadance/scripts/get_sales.cdc'
import SETUP_ACCOUNT from '../../cadance/transactions/setup_account.cdc'
import MINT_NFT from '../../cadance/transactions/mint_nft.cdc'
import LIST_FOR_SALE from '../../cadance/transactions/list_for_sale.cdc'
import UNLIST_FROM_SALE from '../../cadance/transactions/unlist_from_sale.cdc'
import AppContext from '../AppContext';
import { useRouter } from 'next/navigation';

const { Content } = Layout;

const Admin: React.FC = () => {

  const user = useContext(AppContext)
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState('')
  const [ipfsHash, setIpfsHash] = useState('');
  const [nfts, setNfts] = useState([]);
  const [saleNfts, setSaleNfts] = useState([]);
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
    if (!user) {
      return;
    }
    if (user.loggedIn !== true) {
      router.push('/')
    } else {
      setIsLoading(false)
    }
  }, [user]) 

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
        fcl.transaction(SETUP_ACCOUNT),
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

  const onMenuClick = (e) => {
    setSelectedMenu(e.key)
    switch(e.key) {
      case 'setup_account': {
        setupAccount()
      }
      case 'mint_nft': {

      }
      case 'list_nfts': {
        listNfts()
      }
      case 'sale_list_nfts': {
        getSaleNfts()
      }
    }
  }

  const menuItems = [
    {
      label: 'Setup account',
      key: 'setup_account',
    },
    {
      label: 'My NFTs',
      key: 'list_nfts',
    },
    {
      label: 'My NFTs for sale',
      key: 'sale_list_nfts',
    }
  ]

  return (
    <Content>
      <Skeleton loading={isLoading}>
        <Row gutter={16} style={{padding: '15px'}}>
          <Col span={24}>
            <Card title="Create NFT">
              <Upload {...uploadProps}>
                <Button type='primary'>Upload Image/Video</Button>
              </Upload>
            </Card>
          </Col>
        </Row>
        <Row gutter={16} style={{padding: '15px'}}>
          <Col span={4}>
            <Menu
              onClick={onMenuClick}
              mode="inline"
              items={menuItems}
            />
          </Col>
          <Col span={20}>
            
            {selectedMenu === 'list_nfts' &&
              <>
                <Divider>My NFT's</Divider>
                <Row gutter={8} style={{padding: '0px 15px'}}>
                  {nfts.map(nft => {
                    return <Col key={nft.id} span={6}>
                      <Card cover={<img alt="example" src={`https://ipfs.io/ipfs/${nft.ipfsHash}`} />}>
                        <Card.Meta title={`ID: ${nft.id}`} />
                        <Divider />
                        <Card.Meta style={{padding: '8px 0px'}} title={`Sell?`} />
                        <Input placeholder="Price"  onChange={(e) => setPriceState(e.target.value)}/>
                        <div style={{padding: '6px'}}></div>
                        <Button type='primary' onClick={() => listForSale(nft.id, priceState)}>List it For Sale</Button>
                      </Card>
                    </Col>
                  })}
                </Row>
              </>
            }

            {selectedMenu === 'sale_list_nfts' &&
              <>
                <Divider>My NFT's for sale</Divider>
                <Row gutter={8} style={{padding: '0px 15px'}}>
                  {saleNfts.map(nft => {
                    return <Col key={nft.nft.id} span={6}>
                      <Card cover={<img alt="example" src={`https://ipfs.io/ipfs/${nft.nft.ipfsHash}`} />}>
                        <Card.Meta title={`ID: ${nft.nft.id}`} />
                        <Card.Meta title={`Price: ${nft.price}`} />
                        <Divider />
                        <Button type='primary' onClick={() => unlist(nft.nft.id)}>Remove it from sale list</Button>
                      </Card>
                    </Col>
                  })}
                </Row>
              </>
            }


          </Col>
        </Row>
      </Skeleton>
    </Content>
  );
};

export default Admin;