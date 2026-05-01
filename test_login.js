const http = require('http');
const data = JSON.stringify({ username: "student1'--", password: "123" });
const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
}, res => {
  console.log('HEADERS:', res.headers);
  res.on('data', d => process.stdout.write(d));
});
req.write(data);
req.end();
