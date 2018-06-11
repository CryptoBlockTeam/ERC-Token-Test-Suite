
const assertRevert = require("./assertRevert");
const assertFail = require("./assertFail");
const evmError = require("./evmError");

const ERC20Token = artifacts.require("./ERC20Token.sol");

// @TODO: implement dynamic grab of decimals from the contract.
const oneToken = 1 * (10 ** 18);
const TOTAL_SUPPLY = 500000000 * oneToken;
const tenThousandsTokens = 10000 * oneToken;
const thousandTokens = 1000 * oneToken;
const hundredTokens = 100 * oneToken;
const fiftyTokens = 50 * oneToken;

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const SHORT_ADDRESS = '0xdb633765ee4ce0745f4582bae8be2b502cee897';

contract('ERC20Token', function (accounts) {

  let contract;

  const owner = accounts[0];
  const tom = accounts[1];
  const fin = accounts[2];
  const pipi = accounts[3];
  const pooh = accounts[4];
  const zero = accounts[5];  

  // Log contract details 
  // ERC20 token contract should have definitions for name, symbol, decimals.
  // Assigning the values defined in the contract
  // @TODO: otherwise defining them here. 
  before(async function () {
    contract = await ERC20Token.new();
    let name = await contract.name();
    let symbol = await contract.symbol();
    let decimals = await contract.decimals();

    var contractInfo = '';
    contractInfo ="  " + "-".repeat(40);
    contractInfo += "\n  " + "Current date is: " + new Date().toLocaleString("en-US", {timeZone: "UTC"});
    contractInfo += "\n  " + "-".repeat(40);

    contractInfo += "\n  Token Name: " + name;
    contractInfo += "\n  Token Symbol: " + symbol;
    contractInfo += "\n  Decimals: " + decimals;    
    contractInfo += "\n  " + "=".repeat(40);
    
    console.log(contractInfo);

  });

  beforeEach(async function deploy() {
		contract = await ERC20Token.new(); 
  });
  
  afterEach(async function reset() {
		contract = null; 
  });

  describe("Initial state:", function() {    

    // checks if the contract constructor is assigning a contract owner 
    it("should own contract", async function() {
      const ownerAddress = await contract.owner();
      assert.equal(ownerAddress, owner);
    });
  
    // checks if the contract constructor is assigning the total supply to contract owner
    it('should have correct total supply', async function() {
      const tokenCount = await contract.totalSupply();
      assert.equal(tokenCount.toNumber(), TOTAL_SUPPLY);
    });

    // checks that total supply is a constant - it does not change after trasnfer ot tokens from one account to another
    it('should return the correct total supply after transfer', async function () {
      await contract.transfer(tom, thousandTokens, { from: owner });
      const tokenCount = await contract.totalSupply();
      assert.equal(tokenCount.toNumber(), TOTAL_SUPPLY);
    });
  });

  describe("Balances:", function() {   

    // checks initial balances
    it('should have correct initial balances', async function () {
      const iBalances = [ [accounts[0], TOTAL_SUPPLY],
                          [accounts[1], 0], 
                          [accounts[2], 0], 
                          [accounts[3], 0], 
                          [accounts[4], 0]
                        ];
      for (let i = 0; i < iBalances.length; i++) {
        let address = iBalances[i][0];        
        let balance = iBalances[i][1];       
        assert.equal(await contract.balanceOf(address), balance);
      }
    });

    // checks for forrect balances of sender and receiver after transfer
    it('should return correct balance after transfer', async function () {
      await contract.transfer(fin, hundredTokens, { from: owner });
      const finBalance = await contract.balanceOf(fin);
      assert.equal(finBalance, hundredTokens);
    });
  });

  describe("Transfer:", function() {    
    
    // checks for successful transfer with valid parameters and avaialble funds
    it('should transfer to valid address having enough amount in sender address', async function () {
      await contract.transfer(fin, hundredTokens, { from: owner });

      const ownerBalance = await contract.balanceOf(owner);
      assert.equal(ownerBalance, TOTAL_SUPPLY - hundredTokens);

      const finBalance = await contract.balanceOf(fin);
      assert.equal(finBalance, hundredTokens);

      await contract.transfer(pipi, fiftyTokens, { from: fin });

      const finNewBalance = await contract.balanceOf(fin);
      assert.equal(finNewBalance, fiftyTokens);

      const pipiBalance = await contract.balanceOf(pipi);
      assert.equal(pipiBalance, fiftyTokens);      
    });

    // checks Transfer event
    it('emits transfer event', async function () {
      const { logs } = await contract.transfer(pipi, thousandTokens, { from: owner });

      assert.equal(logs.length, 1);
      assert.equal(logs[0].event, 'Transfer');
      assert.equal(logs[0].args.from, owner);
      assert.equal(logs[0].args.to, pipi);
      assert(logs[0].args.value.eq(thousandTokens));
    });

    // checks negative scenario - cannot transfer is there are insufficient funds
    it('should fail when the sender does not have enough balance', async function () {

      await assertRevert(contract.transfer(tom, oneToken, { from: zero }));
    
    });

    // checks negative scenario - cannot transfer to zero address
    it('should revert when recepient is the ZERO address', async function () {

      await assertRevert(contract.transfer(ZERO_ADDRESS, oneToken, { from: owner }));
    
    });

    // checks negative scenario - cannot transfer to short (invalid) address
    // if this test fails, it means you have not implemented a modifier to be applied
    // to Transfer function. Modifier should check for correct payload size. 
    // the sample contract in the repo has an example for implementaion 
    it('should fail when recepient is non valid address (covering SHORT ADDRESS attack protection)', async function () {

      await assertFail(contract.transfer(SHORT_ADDRESS, oneToken, { from: owner }));
    
    });
  
  });

  describe("Transfer total supply:", function() {
    
    // checks that owner cannot transfer more than total supply
    it('should fail on attemt to tranfer more than total supply from owner', async function () {
      
      await assertRevert(contract.transfer(tom, TOTAL_SUPPLY + tenThousandsTokens, { from: owner }));
    
    });    

    // checks that total supply can be transfered in total
    it('should allow to transfer total supply from owner to another address', async function () {

      await contract.transfer(pooh, TOTAL_SUPPLY, { from: owner });
      const poohBalance = await contract.balanceOf(pooh);
      assert.equal(poohBalance, TOTAL_SUPPLY);

    });

  });

  describe("Allowance:", function() {

    // checks that initial allowance is 0 
    // to check that the test works correctly, chnage one of the 0s to any uint
    it('should have initial allowance 0 for all addresses', async function () {

      const iAllowances = [ [accounts[0], accounts[1], 0],
                            [accounts[0], accounts[2], 0],
                            [accounts[0], accounts[3], 0]
                          ];
      for (let i = 0; i < iAllowances.length; i++) {
        let owner = iAllowances[i][0];        
        let spender = iAllowances[i][1];
        let expectedAllowance = iAllowances[i][2];
        assert.equal(await contract.allowance(owner, spender), expectedAllowance);
      }
    });

    it('should return correct allowance after approval', async function () {

      await contract.approve(tom, thousandTokens, { from: owner })
      await contract.approve(fin, hundredTokens, { from: tom })
      await contract.approve(pipi, oneToken, { from: tom })

      assert.equal(await contract.allowance(owner, tom), thousandTokens)
      assert.equal(await contract.allowance(tom, fin), hundredTokens)
      assert.equal(await contract.allowance(tom, pipi), oneToken)

    });

  });

  describe("Approval:", function() {    

    // need to reset approval to 0 before making new approval
    // it is good practice to implement Approval function to require allowance to be 0 to make an approval
    // thus, is approval is given once, it has to be reset to 0, before giving second approval for same address
    beforeEach(async function () {
      await contract.approve(tom, 0, { from: owner });
    });

    // it('emits an approval event', async function () {
    //   const { logs } = await contract.approve(tom, oneToken, { from: owner });

    //   assert.equal(logs.length, 1);
    //   assert.equal(logs[0].event, 'Approval');
    //   assert.equal(logs[0].args.owner, owner);
    //   assert.equal(logs[0].args.spender, tom);
    //   assert(logs[0].args.value.eq(oneToken));
    // });

    it('should approve requested amount', async function () {
      await contract.approve(pooh, tenThousandsTokens, { from: owner });

      const allowance = await contract.allowance(owner, pooh);
      assert.equal(allowance, tenThousandsTokens);
    });

    it('it reverts when spender has more than 0 amount from previuos approval', async function () {
      
      await contract.approve(pipi, fiftyTokens, { from: owner });
      
      const allowance = await contract.allowance(owner, pipi);
      assert.equal(allowance, fiftyTokens);

      await assertRevert(contract.approve(pipi, oneToken, { from: owner }));
    });
  });

  describe("Transfer from:", function() {

    it('should transfer to valid address when sender has enough balance', async function () {

      await contract.approve(pooh, tenThousandsTokens, { from: owner });
      await contract.transferFrom(owner, pipi, hundredTokens, { from: pooh });

      const poohBalance = await contract.balanceOf(owner);
      assert.equal(poohBalance, TOTAL_SUPPLY - hundredTokens);

      const pipiBalance = await contract.balanceOf(pipi);
      assert.equal(pipiBalance, hundredTokens);
    });

    it('should revert when trying to transfer more than available balance', async function () {

      await contract.approve(fin, thousandTokens, { from: owner });
      await assertRevert(contract.transferFrom(fin, pipi, tenThousandsTokens, { from: owner }));

    });

    it('should fail when recepient is non valid address (covering SHORT ADDRESS attack protection)', async function () {

      await contract.approve(tom, thousandTokens, { from: owner });
      await assertRevert(contract.transferFrom(tom, SHORT_ADDRESS, oneToken, { from: owner }));
    
    });

  });  

});