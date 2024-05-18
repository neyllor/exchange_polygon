// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract DREX is ERC20, Ownable {

    constructor(address initialOwner) Ownable(initialOwner) ERC20("Real", "BRT"){}

    function deposit(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }

    function withdraw(uint amount) public onlyOwner{
        require(balanceOf(msg.sender) >=amount);
        _burn(msg.sender, amount);

        payable(msg.sender).transfer(amount);
    }
}