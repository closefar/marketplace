import CloseFarNFT from 0xCloseFarNFT
import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken

pub contract CloseFarMarketplace {
    
    pub event ForSale(id: UInt64, price: UFix64, owner: Address?)

    pub event PriceChanged(id: UInt64, newPrice: UFix64, owner: Address?)

    pub event TokenPurchased(id: UInt64, price: UFix64, seller: Address?, buyer: Address?)

    pub event SaleCanceled(id: UInt64, seller: Address?)

    pub let marketplaceCollectionStoragePath: StoragePath

    pub let marketplaceCollectionPublicPath: PublicPath

    pub struct SaleItem {

        pub let price: UFix64
        
        pub let nftRef: &CloseFarNFT.NFT
        
        init(price: UFix64, nftRef: &CloseFarNFT.NFT) {
            self.price = price
            self.nftRef = nftRef
        }
    }

    pub resource interface SaleCollectionPublic {
        pub fun purchase(tokenID: UInt64, recipient: Capability<&CloseFarNFT.Collection{CloseFarNFT.CollectionPublic}>, buyTokens: @FlowToken.Vault)
        pub fun idPrice(tokenID: UInt64): UFix64?
        pub fun getIDs(): [UInt64]
    }

    pub resource SaleCollection: SaleCollectionPublic {

        access(self) var prices: {UInt64: UFix64}

        access(self) var ownerCollection: Capability<&CloseFarNFT.Collection>

        access(account) let ownerVault: Capability<&FlowToken.Vault{FungibleToken.Receiver}>

        init (ownerCollection: Capability<&CloseFarNFT.Collection>, 
              ownerVault: Capability<&FlowToken.Vault{FungibleToken.Receiver}>) {

            pre {
                ownerCollection.check(): 
                    "Owner's NFT Collection Capability is invalid!"

                ownerVault.check(): 
                    "Owner's Receiver Capability is invalid!"
            }
            self.ownerCollection = ownerCollection
            self.ownerVault = ownerVault
            self.prices = {}
        }

        pub fun cancelSale(tokenID: UInt64) {
            self.prices.remove(key: tokenID)
            self.prices[tokenID] = nil
        }

        pub fun listForSale(tokenID: UInt64, price: UFix64) {
            pre {
                self.ownerCollection.borrow()!.idExists(id: tokenID):
                    "NFT to be listed does not exist in the owner's collection"
            }
            self.prices[tokenID] = price

            emit ForSale(id: tokenID, price: price, owner: self.owner?.address)
        }

        pub fun changePrice(tokenID: UInt64, newPrice: UFix64) {
            self.prices[tokenID] = newPrice

            emit PriceChanged(id: tokenID, newPrice: newPrice, owner: self.owner?.address)
        }

        pub fun purchase(tokenID: UInt64, recipient: Capability<&CloseFarNFT.Collection{CloseFarNFT.CollectionPublic}>, buyTokens: @FlowToken.Vault) {
            pre {
                self.prices[tokenID] != nil:
                    "No token matching this ID for sale!"
                buyTokens.balance >= (self.prices[tokenID] ?? 0.0):
                    "Not enough tokens to by the NFT!"
                recipient.borrow != nil:
                    "Invalid NFT receiver capability!"
            }

            let price = self.prices[tokenID]!

            self.prices[tokenID] = nil

            let vaultRef = self.ownerVault.borrow()
                ?? panic("Could not borrow reference to owner token vault")

            vaultRef.deposit(from: <-buyTokens)

            let receiverReference = recipient.borrow()!

            receiverReference.deposit(token: <-self.ownerCollection.borrow()!.withdraw(withdrawID: tokenID))

            emit TokenPurchased(id: tokenID, price: price, seller: self.owner?.address, buyer: receiverReference.owner?.address)
        }

        pub fun idPrice(tokenID: UInt64): UFix64? {
            return self.prices[tokenID]
        }

        pub fun getIDs(): [UInt64] {
            return self.prices.keys
        }
    }

    pub fun createSaleCollection(ownerCollection: Capability<&CloseFarNFT.Collection>, 
                                 ownerVault: Capability<&FlowToken.Vault{FungibleToken.Receiver}>): @SaleCollection {
        return <- create SaleCollection(ownerCollection: ownerCollection, ownerVault: ownerVault)
    }

    init() {
        self.marketplaceCollectionStoragePath = /storage/CloseFarMarketplaceCollection
        self.marketplaceCollectionPublicPath = /public/CloseFarMarketplaceCollection
    }
}
