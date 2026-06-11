/**
 * local server entry file, for local development
 */
import app from './app.js';
import { calculateMonthlyStars, getLatestMonthlyStars } from './db.js';

/**
 * start server with port
 */
const PORT = process.env.PORT || 3002;

const server = app.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
  startMonthlyTask();
});

let lastRunYearMonth: string | null = null;

function startMonthlyTask() {
  const existing = getLatestMonthlyStars();
  if (existing) {
    lastRunYearMonth = `${existing.year}-${String(existing.month).padStart(2, '0')}`;
  }
  console.log('[ScheduledTask] 月度之星定时任务已启动');
  if (lastRunYearMonth) {
    console.log(`[ScheduledTask] 上次统计: ${lastRunYearMonth}`);
  }

  checkAndRun();
  setInterval(checkAndRun, 60 * 60 * 1000);
}

function checkAndRun() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;
  const day = now.getUTCDate();

  const lastMonth = month === 1 ? 12 : month - 1;
  const lastMonthYear = month === 1 ? year - 1 : year;
  const lastMonthYearMonth = `${lastMonthYear}-${String(lastMonth).padStart(2, '0')}`;

  if (day >= 1 && lastRunYearMonth !== lastMonthYearMonth) {
    console.log(`[ScheduledTask] 开始生成 ${lastMonthYear}年${lastMonth}月 月度之星...`);
    try {
      calculateMonthlyStars(lastMonthYear, lastMonth);
      lastRunYearMonth = lastMonthYearMonth;
      console.log(`[ScheduledTask] ${lastMonthYear}年${lastMonth}月 月度之星生成成功`);
    } catch (err) {
      console.error('[ScheduledTask] 月度之星生成失败:', err);
    }
  }
}

/**
 * close server
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;
