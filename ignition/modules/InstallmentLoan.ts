import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

const InstallmentLoanModule = buildModule('InstallmentLoanModule', (m) => {
  const installmentLoan = m.contract('InstallmentLoan', []);

  return { installmentLoan };
});

export default InstallmentLoanModule;
