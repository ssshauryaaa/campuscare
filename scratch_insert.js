const db = require('better-sqlite3')('campus.db');

db.exec(`
  INSERT INTO flags (flag_name, flag_value, difficulty, points, hint) 
  VALUES ('idor_notice', 'BREACH{1d0r_n0t1c3_m4g1c}', 'easy', 50, 'Can you find the hidden notice ID?');

  INSERT INTO notices (title, content, author, is_hidden) 
  VALUES ('[Teachers Only] System Update', 'Please check ?id=60 for the new staff portal module. Do not share this ID with students.', 'admin', 0);
`);
console.log('Inserted successfully');
