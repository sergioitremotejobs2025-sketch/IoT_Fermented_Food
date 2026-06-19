const microcontrollers = require('../microcontrollers.json');

module.exports = {
  createConnection: url => {
    return {
      connect: cb => { if (cb) cb(null); },
      on: (event, cb) => { },
      query: (query, values, cb) => {
        // SELECT by measure
        if (query.startsWith('SELECT * FROM microcontrollers WHERE measure =')) {
          const [measure] = values;
          cb(null, microcontrollers.filter(m => m.measure === measure));
          return;
        }
        // SELECT by username
        if (query.startsWith('SELECT * FROM microcontrollers WHERE username =')) {
          const [username] = values;
          cb(null, microcontrollers.filter(m => m.username === username));
          return;
        }
        // INSERT microcontroller
        if (query.startsWith('INSERT INTO microcontrollers')) {
          const exists = microcontrollers.some(m => m.ip === values[0] && m.measure === values[1]);
          // Simulate duplicate IP -> 0 affected rows
          if (query.includes('192.168.1.350')) {
            cb(null, { affectedRows: 0 });
          } else {
            cb(null, { affectedRows: exists ? 0 : 1 });
          }
          return;
        }
        // UPDATE microcontroller
        if (query.startsWith('UPDATE microcontrollers SET')) {
          const [ip, measure, sensor, username, thresholdMin, thresholdMax, old_ip, old_measure] = values;
          const exists = microcontrollers.some(m => m.ip === old_ip && m.measure === old_measure);
          // Simulate bad update -> 0 affected rows
          if (ip === '192.168.1.350') {
            cb(null, { affectedRows: 0 });
          } else {
            cb(null, { affectedRows: exists ? 1 : 0 });
          }
          return;
        }
        // DELETE microcontroller
        if (query.startsWith('DELETE FROM microcontrollers')) {
          const [ip, measure] = values;
          const affected = microcontrollers.filter(m => m.ip === ip && m.measure === measure).length === 1 ? 1 : 0;
          cb(null, { affectedRows: affected });
          return;
        }
        // Unknown query
        cb(new Error('Unknown query ' + query));
      }
    };
  }
};
