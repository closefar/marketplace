import CloseFarNFT from 0xCloseFarNFT
import NonFungibleToken from 0xNonFungibleToken
import CloseFarMarketplace from 0xCloseFarMarketplace
import FlowToken from 0xFlowToken

transaction(account: Address, id: UInt64) {

  prepare(acct: AuthAccount) {
    let saleCollection = getAccount(account).getCapability(CloseFarMarketplace.marketplaceCollectionPublicPath)
                        .borrow<&CloseFarMarketplace.SaleCollection{CloseFarMarketplace.SaleCollectionPublic}>()
                        ?? panic("Could not borrow the user's SaleCollection")

    let recipientCollection = getAccount(acct.address).getCapability(CloseFarNFT.nftCollectionPublicPath) 
                    .borrow<&CloseFarNFT.Collection{NonFungibleToken.CollectionPublic}>()
                    ?? panic("Can't get the User's collection.")

    let price = saleCollection.getPrice(id: id)

    let payment <- acct.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)!.withdraw(amount: price) as! @FlowToken.Vault

    saleCollection.purchase(tokenID: id, recipient: recipientCollection, buyTokens: <- payment)
  }

  execute {
    log("A user purchased an NFT")
  }
}