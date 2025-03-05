const api = require('./api');

/**
 * 
 * @param {Object} data Searching data. Example "{ place: 'Kocaeli' }", "{ plate: 41 }"
 * @returns {Promise<Object>}
 */
module.exports.times = async (data) => await api(data);