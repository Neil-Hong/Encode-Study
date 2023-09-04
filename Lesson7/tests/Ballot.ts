import { ethers } from "hardhat";
import { expect } from "chai";
import { Ballot } from "../typechain-types";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

const PROPOSALS = ["Proposal 1", "Proposal 2", "Proposal 3"];

function convertStringArrayToBytes32(array: string[]) {
  const byte32Array = [];
  for (let index = 0; index < array.length; index++) {
    byte32Array.push(ethers.encodeBytes32String(array[index]));
  }
  return byte32Array;
}

async function deployContract() {
  const ballotFactory = await ethers.getContractFactory("Ballot");
  const ballotContract = await ballotFactory.deploy(
    convertStringArrayToBytes32(PROPOSALS)
  );
  await ballotContract.waitForDeployment();
  return ballotContract;
}

describe("Ballot", () => {
  describe("When the contract is deployed", async () => {
    let ballotContract: Ballot;
    let accounts: HardhatEthersSigner[];
    beforeEach(async () => {
      ballotContract = await loadFixture(deployContract);
    });
    it("has the provided proposals", async () => {
      const ballotFactory = await ethers.getContractFactory("Ballot");
      const ballotContract = await ballotFactory.deploy(
        convertStringArrayToBytes32(PROPOSALS)
      );
      await ballotContract.waitForDeployment();
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        // expect(ethers.decodeBytes32String(proposal[0])).to.eq(PROPOSALS[index]);
        expect(proposal).to.eq(PROPOSALS[index]);
      }
    });
    it("has zero votes for all proposals", async () => {
      for (let index = 0; index < PROPOSALS.length; index++) {
        const proposal = await ballotContract.proposals(index);
        expect(proposal.voteCount).to.eq(0);
      }
    });
    it("sets the voting weight for the chairman as 1", async () => {
      const deployAddress = accounts[0].address;
      const chairpersonVoter = await ballotContract.voters(deployAddress);
      expect(chairpersonVoter.weight).to.eq(1);
    });
    it("sets the developer address as chairperson", async () => {
      const accounts = await ethers.getSigners();
      const deployAddress = accounts[0].address;
      const ballotFactory = await ethers.getContractFactory("Ballot");
      const ballotContract = await ballotFactory.deploy(
        convertStringArrayToBytes32(PROPOSALS)
      );
      await ballotContract.waitForDeployment();
      const chairperson = await ballotContract.chairperson();
      expect(chairperson).to.eq(deployAddress);
    });
  });
});
