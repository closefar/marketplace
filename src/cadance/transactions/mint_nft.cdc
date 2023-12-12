import CloseFarNFT from 0xCloseFarNFT

transaction(ipfsHash: String) {

  prepare(acct: AuthAccount) {
    let collection = acct.borrow<&CloseFarNFT.Collection>(from: CloseFarNFT.nftCollectionStoragePath)
                        ?? panic("the NFT collection does not exist!")

    let nft <- CloseFarNFT.createNFT(ipfsHash: ipfsHash)

    collection.deposit(token: <- nft)
  }

  execute {
    log("mint nft done!")
  }
}
