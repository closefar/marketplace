import FungibleToken from 0xFungibleToken
import CloseFarNFT from 0xCloseFarNFT
import CloseFarMarketplace from 0xCloseFarMarketplace

transaction(tokenID: UInt64, price: UFix64) {

    prepare(acct: AuthAccount) {

      let accountCapability = acct.getCapability(/public/NFTSale)
  
      let saleCollection = accountCapability.borrow<&CloseFarMarketplace.SaleCollection>()
                    ?? panic("Can't get the User's sale collection.")

      saleCollection.listForSale(tokenID: tokenID, price: price)

      log("Sale Created for account.")
    }
}

