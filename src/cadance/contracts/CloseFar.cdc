import NonFungibleToken from 0xNonFungibleToken

pub contract CloseFarNFT: NonFungibleToken {
  
  pub var totalSupply: UInt64

  pub event ContractInitialized()

  pub event Withdraw(id: UInt64, from: Address?)

  pub event Deposit(id: UInt64, to: Address?)

  pub let nftCollectionStoragePath: StoragePath
  
  pub let nftCollectionPublicPath: PublicPath

  pub let nftCollectionPrivatePath: PrivatePath

  pub resource NFT: NonFungibleToken.INFT {
    pub let id: UInt64
    pub let ipfsHash: String

    init(ipfsHash: String) {
      self.id = CloseFarNFT.totalSupply
      self.ipfsHash = ipfsHash
      CloseFarNFT.totalSupply = CloseFarNFT.totalSupply + 1
    }
  }

  pub resource interface CollectionPublic {
    pub fun deposit(token: @NonFungibleToken.NFT)
    pub fun getIDs(): [UInt64]
    pub fun idExists(id: UInt64): Bool
    pub fun borrowEntireNFT(id: UInt64): &NFT
  }

  pub resource Collection: CollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic {
    
    pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

    pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
      let nft <- self.ownedNFTs.remove(key: withdrawID) ?? panic("error 1")
      emit Withdraw(id: withdrawID, from: self.owner?.address)
      return <- nft
    }

    pub fun deposit(token: @NonFungibleToken.NFT) {
      emit Deposit(id: token.id, to: self.owner?.address)
      self.ownedNFTs[token.id] <-! token
    }

    pub fun getIDs(): [UInt64] {
      return self.ownedNFTs.keys
    }

    pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
      return (&self.ownedNFTs[id] as &NonFungibleToken.NFT?)!
    }

    pub fun borrowEntireNFT(id: UInt64): &NFT {
      let reference = (&self.ownedNFTs[id] as auth &NonFungibleToken.NFT?)!
      return reference as! &NFT
    }

    pub fun idExists(id: UInt64): Bool {
      return self.ownedNFTs[id] != nil
    }

    init() {
      self.ownedNFTs <- {}
    }

    destroy() {
      destroy self.ownedNFTs
    }
  }

  pub fun createEmptyCollection(): @NonFungibleToken.Collection {
    return <- create Collection()
  }

  pub fun createNFT(ipfsHash: String): @NFT {
    return <- create NFT(ipfsHash: ipfsHash)
  }

  init() {
    self.totalSupply = 0
    self.nftCollectionStoragePath = /storage/CloseFarNFTCollection
    self.nftCollectionPublicPath = /public/CloseFarNFTCollection
    self.nftCollectionPrivatePath = /private/CloseFarNFTCollection
    emit ContractInitialized()
  }
}
