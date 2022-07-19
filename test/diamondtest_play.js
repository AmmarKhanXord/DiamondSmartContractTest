/* global describe it before ethers */

const {
    getSelectors,
    FacetCutAction,
    removeSelectors,
    findAddressPositionInFacets
  } = require('../scripts/libraries/diamond.js')
  
  const { deployDiamond } = require('../scripts/deploy.js')
  
  const { assert } = require('chai')
  
  describe('DiamondTest', async function () {
    let TeslaFacet;
    let HondaFacet;
    let diamondAddress
    let diamondCutFacet
    let diamondLoupeFacet
    let ownershipFacet
    let tx
    let receipt
    let result
    const addresses = []
  
    before(async function () {
      diamondAddress = await deployDiamond()
      diamondCutFacet = await ethers.getContractAt('DiamondCutFacet', diamondAddress)
      diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamondAddress)
      ownershipFacet = await ethers.getContractAt('OwnershipFacet', diamondAddress)
    })
    it('should have three facets -- call to facetAddresses function', async () => {
        for (const address of await diamondLoupeFacet.facetAddresses()) {
        addresses.push(address)
        }

        assert.equal(addresses.length, 3)
    })
    it('facets should have the right function selectors -- call to facetFunctionSelectors function', async () => {
      let selectors = getSelectors(diamondCutFacet)
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0])
      assert.sameMembers(result, selectors)
      selectors = getSelectors(diamondLoupeFacet)
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[1])
      assert.sameMembers(result, selectors)
      selectors = getSelectors(ownershipFacet)
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[2])
      assert.sameMembers(result, selectors)
    })
    it('should add Honda functions', async () => {
        
        const HondFacet = await ethers.getContractFactory('HondaFacet')
        HondaFacet = await HondFacet.deploy()
        await HondaFacet.deployed()
        addresses.push(HondaFacet.address)
        const selectors = getSelectors(HondaFacet)
        tx = await diamondCutFacet.diamondCut(
            [{
            facetAddress: HondaFacet.address,
            action: FacetCutAction.Add,
            functionSelectors: selectors
            }],
            ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
        receipt = await tx.wait()
        if (!receipt.status) {
            throw Error(`Diamond upgrade failed: ${tx.hash}`)
        }
        result = await diamondLoupeFacet.facetFunctionSelectors(HondaFacet.address)
        assert.sameMembers(result, selectors)
    })
  
    it('should not get Honda state variable function call', async () => {
      const hondaFacet = await ethers.getContractAt('HondaFacet', diamondAddress)
      var comp = await hondaFacet.companyName();
      console.log(comp);
    });
    it('should add variable for Honda', async () => {
        const hondaFacet = await ethers.getContractAt('HondaFacet', diamondAddress)
        await hondaFacet.setCompanyName("Honda")
        var comp = await hondaFacet.companyName();
        console.log(comp);
    });
    it('should change variable for Honda', async () => {
        const hondaFacet = await ethers.getContractAt('HondaFacet', diamondAddress)
        await hondaFacet.setCompanyName("Civic")
        var comp = await hondaFacet.companyName();
        console.log(comp);
    });
      it('should replace companyName function', async () => {
            const HondaFacetSelectors = getSelectors(HondaFacet).remove(['setCompanyName(string)','carPower()'])

            const TesFaet = await ethers.getContractFactory('TeslaFacet')
            TeslaFacet = await TesFaet.deploy()
            await TeslaFacet.deployed()

            const selectors = getSelectors(TeslaFacet).get(['companyName()'])
            // const testFacetAddress = TeslaFacet.address
            tx = await diamondCutFacet.diamondCut(
              [{
                facetAddress: ethers.constants.AddressZero,
                action: FacetCutAction.Remove,
                functionSelectors: HondaFacetSelectors
              },
              {
                facetAddress: TeslaFacet.address,
                action: FacetCutAction.Add,
                functionSelectors: selectors
              },
            ],
              ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
            receipt = await tx.wait()
            if (!receipt.status) {
              throw Error(`Diamond upgrade failed: ${tx.hash}`)
            }
          })    
    it('should get TeslaFacet function call', async () => {
        const hondaFacet = await ethers.getContractAt('HondaFacet', diamondAddress)
        var comp = await hondaFacet.companyName();
        console.log(comp);
      });
})
  