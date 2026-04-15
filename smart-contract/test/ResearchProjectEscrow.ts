import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("ResearchProjectEscrow", function () {
  it("should deploy with valid owner and researcher", async function () {
    const [, researcher] = await ethers.getSigners();
    const escrow = await ethers.deployContract("ResearchProjectEscrow", [
      researcher.address,
    ]);

    expect(await escrow.owner()).to.equal((await ethers.getSigners())[0].address);
    expect(await escrow.researcher()).to.equal(researcher.address);
  });

  it("should allow donating and releasing a milestone to the researcher", async function () {
    const [, researcher, donor] = await ethers.getSigners();
    const escrow = await ethers.deployContract("ResearchProjectEscrow", [
      researcher.address,
    ]);
    const milestoneAmount = ethers.parseEther("1");
    const donationAmount = ethers.parseEther("2");

    await escrow.addMilestone("Milestone 1", milestoneAmount);
    await escrow.connect(donor).donate({ value: donationAmount });

    expect(await escrow.totalDonated()).to.equal(donationAmount);
    expect(await escrow.getContractBalance()).to.equal(donationAmount);
    expect(await escrow.getMilestoneCount()).to.equal(1n);

    const balanceBefore = await ethers.provider.getBalance(researcher.address);

    await escrow.releaseMilestone(0);

    const balanceAfter = await ethers.provider.getBalance(researcher.address);
    const milestones = await escrow.getMilestones();

    expect(balanceAfter - balanceBefore).to.equal(milestoneAmount);
    expect(milestones[0].released).to.equal(true);
    expect(await escrow.getContractBalance()).to.equal(
      donationAmount - milestoneAmount,
    );
  });

  it("should reject restricted or invalid release flows", async function () {
    const [, researcher, donor] = await ethers.getSigners();
    const escrow = await ethers.deployContract("ResearchProjectEscrow", [
      researcher.address,
    ]);
    const milestoneAmount = ethers.parseEther("1");

    await expect(
      escrow.connect(donor).addMilestone("Milestone 1", milestoneAmount),
    ).to.be.revertedWith("Only owner");

    await escrow.addMilestone("Milestone 1", milestoneAmount);

    await expect(escrow.connect(donor).releaseMilestone(0)).to.be.revertedWith(
      "Only owner",
    );
    await expect(escrow.releaseMilestone(0)).to.be.revertedWith(
      "Insufficient contract balance",
    );
  });
});
