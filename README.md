# ERC-Token-Test-Suite
ERC20, ERC223, ERC621, ERC721 and ERC827 automated test suites

This is work in progress...

The package will allow you to test different ERC token implementations from truffle projects.

Current version has unit tests for ERC20 standard token contract. 

Tests implement security checks for short address attack. Those particular tests will fail against your contract implementation if it does not take care of short address protection. 

Easiest way to setup your environment for the tests:
- clone the repo;
- rename your contract t0 "ERC20Token.sol" and overwrite the sample contract in the repo which has the same name (shortest path);
- second option is to open testSuite.js and replace all occurrences of "ERC20Token" with the name of your contract and then overwrite the sample contract "ERC20Token.sol" with your contract.