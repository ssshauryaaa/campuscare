const jwt = require('jsonwebtoken');

const forged = "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJpZCI6MywidXNlcm5hbWUiOiJzdHVkZW50MSIsInJvbGUiOiJhZG1pbiIsImVtYWlsIjoiYXJ5YW4ua0BzdHVkZW50LmxvY2FsIiwiZnVsbF9uYW1lIjoiQXJ5YW4gS3VtYXIiLCJpYXQiOjE3Nzc1NDQ4MzgsImV4cCI6MTc3NzYzMTIzOH0.";

const decodedUnsafe = jwt.decode(forged, { complete: true });
console.log(decodedUnsafe.header);

try {
  const res = jwt.verify(forged, "", { algorithms: ["none"] });
  console.log("Verified!", res);
} catch (e) {
  console.error("Error:", e.message);
}
