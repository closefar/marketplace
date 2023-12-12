import CloseFarNFT from 0xCloseFarNFT
import CloseFarMarketplace from 0xCloseFarMarketplace
import NonFungibleToken from 0xNonFungibleToken

pub fun main(account: Address): [CloseFarMarketplace.SaleItem] {
    let saleRef = getAccount(account).getCapability(CloseFarMarketplace.marketplaceCollectionPublicPath)
                       .borrow<&AnyResource{CloseFarMarketplace.SaleCollectionPublic}>()
                       ?? panic("Could not borrow acct2 nft sale reference")

    let collection = getAccount(account).getCapability(CloseFarNFT.nftCollectionPublicPath) 
                    .borrow<&CloseFarNFT.Collection{NonFungibleToken.CollectionPublic, CloseFarNFT.CollectionPublic}>()
                    ?? panic("Can't get the User's collection.")

    let returnVals: [CloseFarMarketplace.SaleItem] = []
    let saleIDs = saleRef.getIDs()

    for saleID in saleIDs {
        let price = saleRef.idPrice(tokenID: saleID)
        let nftRef = collection.borrowEntireNFT(id: saleID)
        returnVals.append(CloseFarMarketplace.SaleItem(price: price!, nftRef: nftRef))
    }

    return returnVals
}
