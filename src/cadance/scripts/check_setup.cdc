import FungibleToken from 0xFungibleToken
import FlowToken from 0xFlowToken
import NonFungibleToken from 0xNonFungibleToken
import CloseFarNFT from 0xCloseFarNFT

// This script checks that the accounts are set up correctly for the marketplace tutorial.
pub fun main(address: Address) {

    // Get the accounts' public account objects
    let acct = getAccount(address)

    // Get references to the account's receivers
    // by getting their public capability
    // and borrowing a reference from the capability
    let acctReceiverRef = acct.getCapability(/public/flowTokenBalance)
                          .borrow<&FlowToken.Vault{FungibleToken.Balance}>()
                          ?? panic("Could not borrow acct vault reference")

    // Log the Vault balance of both accounts and ensure they are
    // the correct numbers.
    log("Account Balance")
    log(acctReceiverRef.balance)

    // Find the public Receiver capability for their Collections
    let acctCapability = acct.getCapability(CloseFarNFT.CollectionPublicPath)

    // borrow references from the capabilities
    let nft1Ref = acctCapability.borrow<&{CloseFarNFT.CollectionPublic}>()
        ?? panic("Could not borrow acct nft collection reference")

    // Print both collections as arrays of IDs
    log("Account NFTs")
    log(nft1Ref.getIDs())
}
