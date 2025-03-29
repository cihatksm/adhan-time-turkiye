const moment = require('moment-hijri');
require('moment/locale/tr');

const months = [
  { number: '1', name: 'Muharrem' },
  { number: '2', name: 'Safar' },
  { number: '3', name: 'Rebiülevvel' },
  { number: '4', name: 'Rebiülahir' },
  { number: '5', name: 'Cemaziyelevvel' },
  { number: '6', name: 'Cemaziyelahir' },
  { number: '7', name: 'Recep' },
  { number: '8', name: 'Şaban' },
  { number: '9', name: 'Ramazan' },
  { number: '10', name: 'Şevval' },
  { number: '11', name: 'Zilkade' },
  { number: '12', name: 'Zilhicce' },
]

/**
 * 
 * @returns {date: string, day: number, month: string, year: number}
 */
module.exports = () => {
  const day = moment().locale('tr').format('iDD');
  const month = months.find(f => f.number == moment().locale('tr').format('iM')).name;
  const year = moment().locale('tr').format('iYYYY');

  return {
    date: `${day} ${month} ${year}`,
    day, month, year
  }
}