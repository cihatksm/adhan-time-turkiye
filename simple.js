const prayer = require('./prayer.js');

(async () => {
    const data = await prayer.times({ plate: 41 });
    console.log(data);
})();