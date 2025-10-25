import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deployContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy Mock USDT Token (for testing)
  const mockUSDT = await deploy("MockUSDT", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  console.log("MockUSDT deployed to:", mockUSDT.address);

  // Deploy Energy Project Hub
  const energyProjectHub = await deploy("EnergyProjectHub", {
    from: deployer,
    args: [mockUSDT.address],
    log: true,
    autoMine: true,
  });

  console.log("EnergyProjectHub deployed to:", energyProjectHub.address);
};

export default deployContracts;
deployContracts.tags = ["MockUSDT", "EnergyProjectHub"];
