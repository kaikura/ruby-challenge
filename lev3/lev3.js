const fs = require('fs');
const path = require('path');

// Read and parse data.json
const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data.json'), 'utf8'));

const availabilities = [];

data.projects.forEach(project => {
  const since = new Date(project.since);
  const until = new Date(project.until);
  const year = since.getFullYear();
  // Define Italian public holidays for 2017
const nationalHolidays = [
  `${year}-01-01`, // New Year's Day
  `${year}-01-06`, // Epiphany
  `${year}-04-17`, // Easter Monday// Libreria esterna per pascqua date-easter?
  `${year}-04-25`, // Liberation Day
  `${year}-05-01`, // Labour Day
  `${year}-06-02`, // Republic Day
  `${year}-08-15`, // Assumption of Mary
  `${year}-11-01`, // All Saints' Day
  `${year}-12-08`, // Immaculate Conception
  `${year}-12-25`, // Christmas Day
  `${year}-12-26`  // St. Stephen's Day
];

  let totalDays = 0;
  let workdays = 0;
  let weekendDays = 0;
  let holidays = 0;

  for (let day = new Date(since); day <= until; day.setDate(day.getDate() + 1)) {
    totalDays++;
    const dayStr = day.toISOString().split('T')[0];
    const isNationalHoliday = nationalHolidays.includes(dayStr);
    const isLocalHoliday = data.local_holidays.some(h => h.day === dayStr);
    const isBirthday = data.developers.some(dev => dayStr.slice(5) === dev.birthday.slice(5));

    if (day.getDay() === 0 || day.getDay() === 6) {
      weekendDays++;
    } else if (isNationalHoliday || isLocalHoliday || isBirthday) {
      holidays++;
    } else {
      workdays++;
    }
  }

  const totalWorkdaysAvailable = workdays * data.developers.length;
  const feasibility = totalWorkdaysAvailable >= project.effort_days;

  availabilities.push({
    period_id: project.id,
    total_days: totalDays,
    workdays: totalWorkdaysAvailable,
    weekend_days: weekendDays,
    holidays: holidays,
    feasibility: feasibility
  });
});

// Write output.json
const output = { availabilities };
fs.writeFileSync(path.resolve(__dirname, 'output.json'), JSON.stringify(output, null, 2), 'utf8');

console.log('Output written to output.json');
