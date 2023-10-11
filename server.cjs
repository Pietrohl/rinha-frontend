const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  // Get the file path from the request URL
  const filePath = path.join(__dirname, 'public', req.url);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File does not exist, return 404 error
      res.statusCode = 404;
      res.end('File not found');
      return;
    }

    // File exists, read and serve it
    fs.readFile(filePath, (err, data) => {
      if (err) {
        // Error reading file, return 500 error
        res.statusCode = 500;
        res.end('Error reading file');
        return;
      }

      // Set the content type based on the file extension
      const ext = path.extname(filePath);
      let contentType = 'text/plain';
      switch (ext) {
        case '.html':
          contentType = 'text/html';
          break;
        case '.css':
          contentType = 'text/css';
          break;
        case '.js':
          contentType = 'text/javascript';
          break;
        case '.json':
          contentType = 'application/json';
          break;
        case '.png':
          contentType = 'image/png';
          break;
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg';
          break;
      }
      res.setHeader('Content-Type', contentType);

      // Serve the file
      res.statusCode = 200;
      res.end(data);
    });
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});