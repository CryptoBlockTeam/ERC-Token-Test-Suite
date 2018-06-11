/** 
 * ERC20 Standard Token Smart Contract implementation.
 * 
 * Copyright © 2018 by New Crypto Block.
 * 
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * 
 * Unless required by applicable law or agreed to in writing, software 
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND (express or implied).
 */ 

pragma solidity ^0.4.23;

import "../lib/SafeMath.sol";

/** 
* ERC20 standard token interface
*/ 
contract ERC20Interface {
    
    using SafeMath for uint256;
    
    /** 
     * Get total number of tokens in circulation.
     */
    uint256 public totalSupply;
    
    /**
     * @dev  Get number of tokens currently belonging to given owner.
     * 
     * @param  _owner address to get number of tokens currently belonging to the owner of the address
     * @return  number of tokens currently belonging to the owner of given address 
     */ 
    function balanceOf(address _owner) constant public returns (uint256 balance); 

    /**
     * @dev  Transfer given number of tokens from message sender to given recipient.
     * 
     * @param  _to address to transfer tokens to the owner of that address
     * @param  _value number of tokens to transfer to the owner of given address
     * @return  true if tokens were transferred successfully, false otherwise
     */
    function transfer(address _to, uint256 _value) public returns (bool success);
    
    /**
     * @dev  Transfer given number of tokens from given owner to given recipient.  
     *  
     * @param  _from address to transfer tokens from the owner of that address
     * @param  _to address to transfer tokens to the owner of that address
     * @param  _value number of tokens to transfer from given owner to given recipient  
     * @return  true if tokens were transferred successfully, false otherwise  
     */  
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success);  
    
    /**  
     * @dev  Allow given spender to transfer given number of tokens from message sender.  
     *  
     * @param  _spender address to allow the owner of that address to transfer tokens from message sender  
     * @param  _value number of tokens to allow to transfer  
     * @return  true if token transfer was successfully approved, false otherwise  
     */  
    function approve(address _spender, uint256 _value) public returns (bool success);  
    
    /**  
     * @dev  Tell how many tokens given spender is currently allowed to transfer from  
     * given owner.  
     *  
     * @param  _owner address to get number of tokens allowed to be transferred from the owner of  
     * @param  _spender address to get number of tokens allowed to be transferred by the owner of  
     * @return  number of tokens given spender is currently allowed to transfer from given owner  
     */  
    function allowance(address _owner, address _spender) constant public returns (uint256 remaining);  
    
    /**  
     * @dev  Logged when tokens were transferred from one owner to another.  
     *  
     * @param  _from address of the owner, tokens were transferred from  
     * @param  _to address of the owner, tokens were transferred to  
     * @param  _value number of tokens transferred  
     */  
    event Transfer(address indexed _from, address indexed _to, uint256 _value);  
    
    /**  
     * @dev  Logged when owner approved his tokens to be transferred by some spender.  
     *  
     * @param  _owner owner who approved his tokens to be transferred  
     * @param  _spender spender who were allowed to transfer the tokens belonging to the owner  
     * @param  _value number of tokens belonging to the owner, approved to be transferred by the spender  
     */  
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);  
}

// contract Ownable {
    // address public owner;

    // event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);


    /**
    * @dev The Ownable constructor sets the original `owner` of the contract to the sender
    * account.
    */
    // constructor() public {
    //     owner = msg.sender;
    // }

    /**
    * @dev Throws if called by any account other than the owner.
    */

    // modifier onlyOwner() {
    //     require(msg.sender == owner);
    //     _;
    // }

    /**
    * @dev Allows the current owner to transfer control of the contract to a newOwner.
    * @param newOwner The address to transfer ownership to.
    */

    // function transferOwnership(address newOwner) public onlyOwner {
    //     require(newOwner != address(0));
    //     emit OwnershipTransferred(owner, newOwner);
    //     owner = newOwner;
    // }
// }

    
/**  
* Standard Token Smart Contract that implements ERC20 token interface  
*/  

contract ERC20Token is ERC20Interface {      
    
    address public owner;
    
    // Set the token name
    string public constant name = "ERC20 Token";

    // Set the token symbol
    string public constant symbol = "NCB";

    // Define token decimals
    // 18 decimals is the strongly suggested default, avoid changing it 
    uint8 public constant decimals = 18;

    // Define the total token supply
    uint256 public constant TOTAL_SUPPLY = 500000000 * (10 ** uint256(decimals));

    // Token version
    string public version = "1.0";
    
     // This creates an array with all balances  
    mapping (address => uint256) public balances;  
    mapping (address => mapping (address => uint256)) public allowed;  
        
    // Events
    // This generates a public event on the blockchain that will notify clients  
    event Transfer(address indexed from, address indexed to, uint256 value);  
    
    /**
    * @dev Throws if called by any account other than the owner.
    */
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    /**  
    * Protection against short address attack  
    */  
    modifier onlyPayloadSize(uint numwords) {  
        assert(msg.data.length == numwords * 32 + 4);  
        _;  
    }
    
    /**  
    * Constructor function  
    *  
    * Initializes contract with initial supply tokens to the creator of the contract  
    */  
    
    constructor() public {
        // Set token supply
        totalSupply = TOTAL_SUPPLY;

        // Set contract owner
        owner = msg.sender;

        // Transfer all tokens to the owner
        balances[msg.sender] = TOTAL_SUPPLY;

        // Emit transfer event
        emit Transfer(0x0, msg.sender, TOTAL_SUPPLY);
    }

    /**  
    * Transfer sender's tokens to a given address  
    */  
    function transfer(address _to, uint256 _value)  onlyPayloadSize(2) public returns (bool success) {
        
        require(_to != address(0));
        require(_value <= balances[msg.sender]);

        // SafeMath.sub will throw if there is not enough balance.
        balances[msg.sender] = balances[msg.sender].sub(_value);
        balances[_to] = balances[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;         
    }  
        
    /**  
    * Transfer _from's tokens to _to's address  
    */  
    function transferFrom(address _from, address _to, uint256 _value) onlyPayloadSize(3) public returns (bool success) {

        require(_to != address(0));
        require(_value <= balances[_from]);
        require(_value <= allowed[_from][msg.sender]);

        // SafeMath.sub will throw if there is not enough balance.
        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
        emit Transfer(_from, _to, _value);
        return true;
  
    }  
        
    /**  
    * Returns number of tokens owned by given address.  
    */  
    function balanceOf(address _owner) constant public returns (uint256 balance) {  
        return balances[_owner];  
    }  
        
    /**  
    * Sets approved amount of tokens for spender.  
    */  
    function approve(address _spender, uint256 _value) public returns (bool success) {  
        require(_value == 0 || allowed[msg.sender][_spender] == 0);  
        allowed[msg.sender][_spender] = _value;  
        emit Approval(msg.sender, _spender, _value);  
        return true;  
    }            
    
    /**  
    * Returns number of allowed tokens for given address.  
    */  
    function allowance(address _owner, address _spender) onlyPayloadSize(2) constant public returns (uint256 remaining) {  
        return allowed[_owner][_spender];  
    }    

}  