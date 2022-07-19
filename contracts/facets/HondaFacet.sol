// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HondaFacet {
    string company = "Honda";
    constructor(){
        company = "Hondav2";
    }
    function companyName() external view returns(string memory) {
        return company;
    }
    function setCompanyName(string memory newCompany) external{
        company = newCompany;
    }
    function carPower() external pure returns(uint){
        return 1000;
    }
}
