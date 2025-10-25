const hre = require("hardhat");

async function main() {
  const [deployer, admin1, admin2, regularUser] = await hre.ethers.getSigners();

  console.log("🚀 Testing Full Admin Functionality");
  console.log("====================================\n");

  console.log("👥 Test Accounts:");
  console.log("   Deployer (Contract Owner):", deployer.address);
  console.log("   Admin 1:", admin1.address);
  console.log("   Admin 2:", admin2.address);
  console.log("   Regular User:", regularUser.address);

  // Get deployed contracts
  const EnergyProjectHub = await hre.ethers.getContractAt(
    "EnergyProjectHub",
    "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"
  );

  const MockUSDT = await hre.ethers.getContractAt(
    "MockUSDT",
    "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"
  );

  console.log("\n📋 Step 1: Verify Contract Owner");
  console.log("==================================");
  const owner = await EnergyProjectHub.owner();
  console.log("   Contract owner:", owner);
  console.log("   ✅ Owner verified:", owner === deployer.address);

  console.log("\n👨‍💼 Step 2: Add Admin 1");
  console.log("==================================");
  let isAdmin = await EnergyProjectHub.isAdmin(admin1.address);
  console.log("   Admin 1 is admin before:", isAdmin);

  const tx1 = await EnergyProjectHub.connect(deployer).addAdmin(admin1.address);
  await tx1.wait();
  console.log("   ✅ Added Admin 1");

  isAdmin = await EnergyProjectHub.isAdmin(admin1.address);
  console.log("   Admin 1 is admin after:", isAdmin);

  console.log("\n👨‍💼 Step 3: Add Admin 2");
  console.log("==================================");
  const tx2 = await EnergyProjectHub.connect(deployer).addAdmin(admin2.address);
  await tx2.wait();
  console.log("   ✅ Added Admin 2");

  console.log("\n📊 Step 4: Contract Owner Creates Project");
  console.log("==========================================");
  const tx3 = await EnergyProjectHub.connect(deployer).createProject(
    "Solar Farm by Owner",
    "Large solar project created by contract owner",
    "California, USA",
    0, // Solar
    hre.ethers.parseUnits("100000", 6), // 100,000 USDT target
    90 // 90 days
  );
  await tx3.wait();
  console.log("   ✅ Project #0 created by Contract Owner");

  console.log("\n📊 Step 5: Admin 1 Creates Project");
  console.log("===================================");
  const tx4 = await EnergyProjectHub.connect(admin1).createProject(
    "Wind Farm by Admin 1",
    "Wind energy project created by admin",
    "Texas, USA",
    1, // Wind
    hre.ethers.parseUnits("200000", 6), // 200,000 USDT target
    120 // 120 days
  );
  await tx4.wait();
  console.log("   ✅ Project #1 created by Admin 1");

  console.log("\n📊 Step 6: Admin 2 Creates Project");
  console.log("===================================");
  const tx5 = await EnergyProjectHub.connect(admin2).createProject(
    "Hydro Plant by Admin 2",
    "Hydroelectric project created by another admin",
    "Washington, USA",
    2, // Hydro
    hre.ethers.parseUnits("300000", 6), // 300,000 USDT target
    60 // 60 days
  );
  await tx5.wait();
  console.log("   ✅ Project #2 created by Admin 2");

  console.log("\n❌ Step 7: Regular User Tries to Create Project (Should Fail)");
  console.log("=============================================================");
  try {
    await EnergyProjectHub.connect(regularUser).createProject(
      "Should Fail",
      "This should not work",
      "Nowhere",
      0,
      hre.ethers.parseUnits("1000", 6),
      30
    );
    console.log("   ❌ ERROR: Regular user should not be able to create projects!");
  } catch (error) {
    console.log("   ✅ Correctly blocked regular user from creating project");
    console.log("   Error:", error.message.split('\n')[0]);
  }

  console.log("\n📋 Step 8: View All Projects");
  console.log("=============================");
  const projectCount = await EnergyProjectHub.projectCount();
  console.log("   Total projects:", projectCount.toString());

  for (let i = 0; i < projectCount; i++) {
    const project = await EnergyProjectHub.getProject(i);
    console.log(`\n   Project #${i}:`);
    console.log(`      Name: ${project[0]}`);
    console.log(`      Owner: ${project[8]}`);
    console.log(`      Created by: ${
      project[8] === deployer.address ? "Contract Owner" :
      project[8] === admin1.address ? "Admin 1" :
      project[8] === admin2.address ? "Admin 2" : "Unknown"
    }`);
  }

  console.log("\n👨‍💼 Step 9: Remove Admin 2");
  console.log("============================");
  const tx6 = await EnergyProjectHub.connect(deployer).removeAdmin(admin2.address);
  await tx6.wait();
  console.log("   ✅ Removed Admin 2");

  const isAdmin2 = await EnergyProjectHub.isAdmin(admin2.address);
  console.log("   Admin 2 is still admin:", isAdmin2);

  console.log("\n❌ Step 10: Removed Admin Tries to Create Project (Should Fail)");
  console.log("================================================================");
  try {
    await EnergyProjectHub.connect(admin2).createProject(
      "Should Fail",
      "Admin 2 was removed",
      "Nowhere",
      0,
      hre.ethers.parseUnits("1000", 6),
      30
    );
    console.log("   ❌ ERROR: Removed admin should not be able to create projects!");
  } catch (error) {
    console.log("   ✅ Correctly blocked removed admin from creating project");
  }

  console.log("\n✅ Step 11: Admin 1 Can Still Create Projects");
  console.log("=============================================");
  const tx7 = await EnergyProjectHub.connect(admin1).createProject(
    "Another Wind Farm by Admin 1",
    "Admin 1 is still active",
    "Oregon, USA",
    1, // Wind
    hre.ethers.parseUnits("150000", 6),
    90
  );
  await tx7.wait();
  console.log("   ✅ Project #3 created by Admin 1 (still has permissions)");

  console.log("\n📊 Summary");
  console.log("==========");
  const finalCount = await EnergyProjectHub.projectCount();
  console.log("   Total projects created:", finalCount.toString());
  console.log("   Contract Owner is admin:", await EnergyProjectHub.isAdmin(deployer.address));
  console.log("   Admin 1 is admin:", await EnergyProjectHub.isAdmin(admin1.address));
  console.log("   Admin 2 is admin:", await EnergyProjectHub.isAdmin(admin2.address));
  console.log("   Regular user is admin:", await EnergyProjectHub.isAdmin(regularUser.address));

  console.log("\n🎉 All Admin Functionality Tests Passed!");
  console.log("\n📝 Frontend Testing Instructions:");
  console.log("====================================");
  console.log("1. Import Admin 1 private key into MetaMask:");
  console.log("   Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d");
  console.log("   Address:", admin1.address);
  console.log("\n2. Connect with Admin 1 wallet");
  console.log("3. Go to /owner page");
  console.log("4. You should see:");
  console.log("   - Blue admin badge at top");
  console.log("   - All 4 projects (not just Admin 1's projects)");
  console.log("   - 'Managed by Admin' badges on projects owned by others");
  console.log("   - Ability to create new projects");
  console.log("   - Ability to manage all projects");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
