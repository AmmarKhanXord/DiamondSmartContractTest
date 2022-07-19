// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TeslaFacet {
    function companyName() external view returns(string memory) {
        return "Tesla";
    }
}
