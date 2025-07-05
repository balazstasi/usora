import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const MockUSDCModule = buildModule('MockUSDCModule', (m) => {
  const initialSupply = m.getParameter("initialSupply", 1000000);
  const mockUSDC = m.contract('MockUSDC', [initialSupply]);

  return { mockUSDC };
});

export default MockUSDCModule;
