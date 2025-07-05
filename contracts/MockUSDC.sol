// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDC is ERC20 {
    uint8 private immutable _customDecimals;

    constructor(uint256 initialSupply) ERC20("USD Coin", "USDC") {
        _customDecimals = 6;
        _mint(msg.sender, initialSupply);
    }

    function decimals() public view override returns (uint8) {
        return _customDecimals;
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
