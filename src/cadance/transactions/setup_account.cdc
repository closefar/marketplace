import FlowToken from 0xFlowToken
import FungibleToken from 0xFungibleToken
import NonFungibleToken from 0xNonFungibleToken
import CloseFarMarketplace from 0xCloseFarMarketplace
import CloseFarNFT from 0xCloseFarNFT

// Sign this with the `close-far-contracts`
// This transaction sets up account 0x01 for the marketplace tutorial
// by publishing a Vault reference and creating an empty NFT Collection.
transaction {
  prepare(acct: AuthAccount) {
    // store an empty NFT Collection in account storage
    acct.save<@NonFungibleToken.Collection>(<- CloseFarNFT.createEmptyCollection(), to: CloseFarNFT.CollectionStoragePath)
    // publish a capability to the Collection in storage
    // TODO: restrict the access
    let collectionCapability = acct.link<&CloseFarNFT.Collection>(CloseFarNFT.CollectionPublicPath, target: CloseFarNFT.CollectionStoragePath) ?? panic("faild to link")
    log("Created a new empty collection and published a reference")

    
    // Borrow a reference to the stored Vault
    let receiver = acct.getCapability<&{FungibleToken.Receiver}>(/public/flowTokenReceiver)
    // TODO: shall be private?
    // borrow a reference to the nft in storage
    // let collectionCapability = acct.getCapability<&CloseFarNFT.Collection>(CloseFarNFT.CollectionPublicPath)
    // Create a new Sale object,
    // initializing it with the reference to the owner's vault
    let sale <- CloseFarMarketplace.createSaleCollection(ownerCollection: collectionCapability, ownerVault: receiver)

    acct.save(<-sale, to: /storage/NFTSale)

    // TODO: restrict the access
    acct.link<&CloseFarMarketplace.SaleCollection>(/public/NFTSale, target: /storage/NFTSale)

    log("Created a new sale collection and published a reference")
  }
}
