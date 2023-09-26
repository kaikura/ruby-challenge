const fs = require('fs');
const path = require('path');

// Read and parse data.json
const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'data.json'), 'utf8'));

const availabilities = [];

data.projects.forEach(project => {
  let totalDays = 0;
  let workdays = 0;
  let devworkdays = 0;
  let weekendDays = 0;
  let holidayDays = 0;
  const since = new Date(project.since);
  const until = new Date(project.until);
  const year = since.getFullYear();

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
  //split date and time
    const dayStr = day.toISOString().split('T')[0];
    const isNationalHoliday = nationalHolidays.includes(dayStr);
    const isLocalHoliday = data.local_holidays.some(h => h.day === dayStr);  

    if (day.getDay() === 0 || day.getDay() === 6) {
      weekendDays++;
    } else if (isNationalHoliday || isLocalHoliday) {
      holidayDays++;
    } else {
      workdays++;
    }
  }

  data.developers.forEach(developer => {

    for (let devday = new Date(since); devday <= until; devday.setDate(devday.getDate() + 1)) {
      const dayStr = devday.toISOString().split('T')[0];
      const isNationalHoliday = nationalHolidays.includes(dayStr);
      const isLocalHoliday = data.local_holidays.some(h => h.day === dayStr);
      const isBirthday = dayStr.slice(5) === developer.birthday.slice(5);
      if (devday.getDay() != 0 && devday.getDay() != 6 && !isNationalHoliday && !isBirthday && !isLocalHoliday) {
        devworkdays++;
      }
    
    }
  });
  availabilities.push({
    project_id: project.id,
    total_days: totalDays,
    workdays: workdays,
    weekend_days: weekendDays,
    holidays: holidayDays,
    devworkdays :devworkdays,
    effort_days : project.effort_days,
    feasibility: devworkdays >= project.effort_days
  });
});
// Write output.json
const output = { availabilities };
fs.writeFileSync(path.resolve(__dirname, 'output.json'), JSON.stringify(output, null, 2), 'utf8');

console.log('Output written to output.json');
