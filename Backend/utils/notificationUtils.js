import Leave from '../Models/leave.js';

export const recommendLeaveDays = async (email) => {
  const leaves = await Leave.find({ email });
  const calendar = Array(30).fill(0).map((_, i) => ({ date: new Date(2025, 4, i + 1), workload: Math.random() }));
  leaves.forEach(leave => {
    const start = leave.oneDay ? new Date(leave.from).getDate() - 1 : new Date(leave.from).getDate() - 1;
    const end = leave.oneDay ? start : new Date(leave.to).getDate() - 1;
    for (let i = start; i <= end; i++) if (i >= 0 && i < 30) calendar[i].workload += 1;
  });
  return calendar.filter(day => day.workload < 1).map(day => day.date).slice(0, 3);
};

export const analyzeLeavePatterns = async (email) => {
  const leaves = await Leave.find({ email });
  const monthlyCounts = Array(12).fill(0);
  leaves.forEach(leave => {
    const month = new Date(leave.from).getMonth();
    const days = leave.oneDay ? 1 : (new Date(leave.to) - new Date(leave.from)) / (1000 * 60 * 60 * 24);
    if (month >= 0 && month < 12) monthlyCounts[month] += days;
  });
  return monthlyCounts.map((count, i) => ({ month: i + 1, days: Math.round(count) }));
};