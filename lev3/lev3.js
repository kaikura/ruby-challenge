const fs = require('fs');
const path = require('path');

// Read and parse data.json
const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data.json'), 'utf8'));


const availabilities = [];

data.developers.forEach(developer => {
  data.projects.forEach(period => {
    const since = new Date(period.since);
    const until = new Date(period.until);
    const year = since.getFullYear();
    let totalDays = 0;
    let workdays = 0;
    let weekendDays = 0;
    let holidayDays = 0;

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

    for (let day = new Date(since); day <= until; day.setDate(day.getDate() + 1)) {
      totalDays++;
      const dayStr = day.toISOString().split('T')[0];
      const isNationalHoliday = nationalHolidays.includes(dayStr);
      const isLocalHoliday = data.local_holidays.some(h => h.day === dayStr);
      const isBirthday = dayStr.slice(5) === developer.birthday.slice(5);
      


      if (day.getDay() === 0 || day.getDay() === 6) {
        weekendDays++;
      } else if (isNationalHoliday || isBirthday || isLocalHoliday) {
        holidayDays++;
      } else {
        workdays++;
      }
    }

    availabilities.push({
      developer_id: developer.id,
      period_id: period.id,
      total_days: totalDays,
      workdays: workdays,
      weekend_days: weekendDays,
      holidays: holidayDays
    });
  });
});

const totalWorkdaysPerPeriod = new Map();

// Iterate over each availability entry
availabilities.forEach(availability => {
    // If the period_id is not in the map, initialize it with 0
    if (!totalWorkdaysPerPeriod.has(availability.period_id)) {
      totalWorkdaysPerPeriod.set(availability.period_id, 0);
    }
  // Add the workdays of the current availability entry to the total workdays of the corresponding period_id
  totalWorkdaysPerPeriod.set(availability.period_id, totalWorkdaysPerPeriod.get(availability.period_id) + availability.workdays);
});

// Create an array to store the results
const results = [];

// Iterate over the entries in the map and push them to the results array
totalWorkdaysPerPeriod.forEach((totalWorkdays, period_id) => {
  results.push({
    project: period_id,
    total_workdays: totalWorkdays
  });
});

// Write output.json
const output = { availabilities };
console.log(results);
fs.writeFileSync(path.resolve(__dirname, 'output.json'), JSON.stringify(output, null, 2), 'utf8');

console.log('Output written to output.json');
