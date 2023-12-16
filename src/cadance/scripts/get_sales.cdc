import CloseFarMarketplace from 0xCloseFarMarketplace
import CloseFarNFT from 0xCloseFarNFT 

// This script prints the NFTs that account 0x01 has for sale.
pub fun main(address: Address): [CloseFarMarketplace.SaleItem] {
    // Get the public account object for account 0x01
    let account = getAccount(address)

    // Find the public Sale reference to their Collection
    let acct = account.getCapability(/public/NFTSale)
                       .borrow<&AnyResource{CloseFarMarketplace.SalePublic}>()
                       ?? panic("Could not borrow acct nft sale reference")

    let accountCapability = account.getCapability(CloseFarNFT.CollectionPublicPath)
  
    let collection = accountCapability.borrow<&{CloseFarNFT.CollectionPublic}>()
                    ?? panic("Can't get the User's collection.")

    let returnVals: [CloseFarMarketplace.SaleItem] = []

    let ids = acct.getIDs()

    for id in ids {
        var saleItem = CloseFarMarketplace.SaleItem(price: acct.idPrice(tokenID: id)!, nft: collection.borrowEntireNFT(id: id))
        returnVals.append(saleItem)
    }

    return returnVals
}
