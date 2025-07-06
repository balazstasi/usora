import { checkAndCollect } from './loan_repayment_check_once.js';

const AUTOMATION_REFRESH_INTERVAL = process.env.AUTOMATION_REFRESH_INTERVAL ? Number(process.env.AUTOMATION_REFRESH_INTERVAL) : 30 * 1000; // 30 seconds default

async function run() {
  try {
    await checkAndCollect();
  } catch (err) {
    console.error('Error in checkAndCollect:', err);
  }
}

setInterval(run, AUTOMATION_REFRESH_INTERVAL);

console.log(`Installment automation bot started with refresh interval ${AUTOMATION_REFRESH_INTERVAL / 1000} seconds.`);
run();
