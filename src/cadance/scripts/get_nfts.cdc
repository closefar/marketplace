import CloseFarNFT from 0xCloseFarNFT
import NonFungibleToken from 0xNonFungibleToken

pub fun main(account: Address): [&CloseFarNFT.NFT] {
  let collection = getAccount(account).getCapability(CloseFarNFT.nftCollectionPublicPath)
                    .borrow<&CloseFarNFT.Collection{NonFungibleToken.CollectionPublic, CloseFarNFT.CollectionPublic}>()
                    ?? panic("Can't get the User's collection.")

  let returnVals: [&CloseFarNFT.NFT] = []

  let ids = collection.getIDs()
  for id in ids {
    returnVals.append(collection.borrowEntireNFT(id: id))
  }

  return returnVals
}
