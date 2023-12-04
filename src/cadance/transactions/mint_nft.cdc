import CloseFar from 0xCloseFar

transaction(ipfsHash: String) {

  prepare(acct: AuthAccount) {
    let collection = acct.borrow<&CloseFar.Collection>(from: /storage/NFTCollection)
                        ?? panic("the NFT collection does not exist!")

    let nft <- CloseFar.createNFT(ipfsHash: ipfsHash)

    collection.deposit(token: <- nft)
  }

  execute {
    log("mint nft done!")
  }
}
