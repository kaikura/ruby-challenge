const fs = require('fs');
const path = require('path');

// Read and parse data.json
const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data.json'), 'utf8'));

const availabilities = [];
// Availabilities definition
data.periods.map(period => {
  const since = new Date(period.since);
  const until = new Date(period.until);
  const year = since.getFullYear();
  let totalDays = 0;
  let workdays = 0;
  let weekendDays = 0;
  let holidayDays = 0;

// Define Italian public holidays
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
//Availability Calc
  for (let day = since; day <= until; day.setDate(day.getDate() + 1)) {
    totalDays++;
  //split date and time
  const dayStr = day.toISOString().split('T')[0];
  const isNationalHoliday = nationalHolidays.includes(dayStr);  

  if (day.getDay() === 0 || day.getDay() === 6) {
    weekendDays++;
  } else if (isNationalHoliday) {
    holidayDays++;
  } else {
    workdays++;
  }
}
  availabilities.push( {
    period_id: period.id,
    total_days: totalDays,
    workdays: workdays,
    weekend_days: weekendDays,
    holidays: holidayDays
  });
});

// Write output.json
const output = { availabilities };
fs.writeFileSync(path.resolve(__dirname, 'output.json'), JSON.stringify(output, null, 2), 'utf8');