import FlowToken from 0xFlowToken
import CloseFarNFT from 0xCloseFarNFT
import NonFungibleToken from 0xNonFungibleToken
import FungibleToken from 0xFungibleToken
import CloseFarMarketplace from 0xCloseFarMarketplace

// This transaction uses the signers Vault tokens to purchase an NFT
// from the Sale collection of account 0x01.
transaction(address: Address, tokenID: UInt64, price: UFix64) {

    // Capability to the buyer's NFT collection where they
    // will store the bought NFT
    let collectionCapability: Capability<&AnyResource{NonFungibleToken.Receiver}>

    // Vault that will hold the tokens that will be used to
    // but the NFT
    let temporaryVault: @FungibleToken.Vault

    prepare(acct: AuthAccount) {

        // get the references to the buyer's fungible token Vault and NFT Collection Receiver
        self.collectionCapability = acct.getCapability<&AnyResource{NonFungibleToken.Receiver}>(CloseFarNFT.CollectionPublicPath)

        let vaultRef = acct.borrow<&FlowToken.Vault>(from: /storage/flowTokenVault)
            ?? panic("Could not borrow owner's vault reference")

        // withdraw tokens from the buyers Vault
        self.temporaryVault <- vaultRef.withdraw(amount: price)
    }

    execute {
        // get the read-only account storage of the seller
        let seller = getAccount(address)

        // get the reference to the seller's sale
        let saleRef = seller.getCapability(/public/NFTSale)
                            .borrow<&AnyResource{CloseFarMarketplace.SalePublic}>()
                            ?? panic("Could not borrow seller's sale reference")

        // purchase the NFT the the seller is selling, giving them the capability
        // to your NFT collection and giving them the tokens to buy it
        saleRef.purchase(tokenID: tokenID, recipient: self.collectionCapability, buyTokens: <-self.temporaryVault)
        
        log("TokenID has been bought from `address` by account signer!")
    }
}

