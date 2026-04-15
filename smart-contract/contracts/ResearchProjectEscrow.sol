// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ResearchProjectEscrow {
    address public owner;
    address public researcher;
    uint256 public totalDonated;

    struct Milestone {
        string title;
        uint256 amount;
        bool released;
    }

    Milestone[] private milestones;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _researcher) {
        require(_researcher != address(0), "Invalid researcher");

        owner = msg.sender;
        researcher = _researcher;
    }

    function addMilestone(string memory _title, uint256 _amount) external onlyOwner {
        require(bytes(_title).length > 0, "Title required");
        require(_amount > 0, "Amount must be greater than zero");

        milestones.push(
            Milestone({
                title: _title,
                amount: _amount,
                released: false
            })
        );
    }

    function donate() external payable {
        require(msg.value > 0, "Send ETH");
        totalDonated += msg.value;
    }

    receive() external payable {
        require(msg.value > 0, "Send ETH");
        totalDonated += msg.value;
    }

    function releaseMilestone(uint256 index) external onlyOwner {
        require(index < milestones.length, "Invalid milestone");

        Milestone storage milestone = milestones[index];

        require(!milestone.released, "Milestone already released");
        require(address(this).balance >= milestone.amount, "Insufficient contract balance");

        milestone.released = true;

        (bool success, ) = payable(researcher).call{value: milestone.amount}("");
        require(success, "Transfer failed");
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getMilestones() external view returns (Milestone[] memory) {
        return milestones;
    }

    function getMilestoneCount() external view returns (uint256) {
        return milestones.length;
    }
}