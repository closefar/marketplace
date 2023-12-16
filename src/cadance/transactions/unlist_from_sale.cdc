import CloseFarNFT from 0xCloseFarNFT
import CloseFarMarketplace from 0xCloseFarMarketplace

transaction(tokenID: UInt64) {

    prepare(acct: AuthAccount) {
        let saleCollection = acct.borrow<&CloseFarMarketplace.SaleCollection>(from: /storage/NFTSale)
                            ?? panic("This SaleCollection does not exist")

        saleCollection.cancelSale(tokenID: tokenID)
    }

    execute {
        log("A user unlisted an NFT for Sale")
    }
}
