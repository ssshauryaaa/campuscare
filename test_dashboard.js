const match = ["", "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJpZCI6MywidXNlcm5hbWUiOiJzdHVkZW50MSIsInJvbGUiOiJhZG1pbiIsImVtYWlsIjoiYXJ5YW4ua0BzdHVkZW50LmxvY2FsIiwiZnVsbF9uYW1lIjoiQXJ5YW4gS3VtYXIiLCJpYXQiOjE3Nzc1NDQ4MzgsImV4cCI6MTc3NzYzMTIzOH0."];

try {
  const payloadStr = match[1].split(".")[1];
  // Fix base64url decoding padding issues
  const base64 = payloadStr.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, "=");
  const u = JSON.parse(Buffer.from(padded, 'base64').toString());
  console.log(u);
} catch (e) {
  console.error("Dashboard logic failed", e);
}
