import CloseFarNFT from 0xCloseFarNFT
import NonFungibleToken from 0xNonFungibleToken

pub fun main(account: Address): [&CloseFarNFT.NFT] {

  let accountCapability = getAccount(account).getCapability(CloseFarNFT.CollectionPublicPath)
  
  let collection = accountCapability.borrow<&{CloseFarNFT.CollectionPublic}>()
                    ?? panic("Can't get the User's collection.")

  let returnVals: [&CloseFarNFT.NFT] = []

  let ids = collection.getIDs()
  for id in ids {
    returnVals.append(collection.borrowEntireNFT(id: id))
  }

  return returnVals
}
