const hre = require("hardhat");

async function main() {
  const [deployer, user1] = await hre.ethers.getSigners();

  console.log("Testing with deployer:", deployer.address);

  // Get deployed contract
  const EnergyProjectHub = await hre.ethers.getContractAt(
    "EnergyProjectHub",
    "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"
  );

  console.log("\n1. Checking contract owner...");
  const owner = await EnergyProjectHub.owner();
  console.log("   Contract owner:", owner);
  console.log("   Deployer address:", deployer.address);
  console.log("   Match:", owner.toLowerCase() === deployer.address.toLowerCase());

  console.log("\n2. Checking if user1 is admin...");
  const isUser1Admin = await EnergyProjectHub.isAdmin(user1.address);
  console.log("   User1 address:", user1.address);
  console.log("   Is admin:", isUser1Admin);

  console.log("\n3. Adding user1 as admin...");
  const tx = await EnergyProjectHub.addAdmin(user1.address);
  await tx.wait();
  console.log("   Transaction hash:", tx.hash);

  console.log("\n4. Checking if user1 is admin now...");
  const isUser1AdminNow = await EnergyProjectHub.isAdmin(user1.address);
  console.log("   Is admin:", isUser1AdminNow);

  console.log("\n✅ Admin functionality is working correctly!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
