/**
 * @file server.js: handles concurrent requests
 */

const express = require('express');
const multer = require('multer');
const server = express();
const PORT = 3000;

const {upload_image} = require('./s3')

// uploaded images are saved in the folder "/upload_images"
const upload = multer({dest: __dirname + '/upload_images'});

server.use(express.static('public'));

// "myfile" is the key of the http payload
server.post('/', upload.single('myfile'), async (req, res) => {
  if (req.file) {
    console.log('REQUEST:')
    console.log(req.file)
  }

  // save the image
  // var fs = require('fs');
  // fs.rename(__dirname + '/upload_images/' + req.file.filename, __dirname + '/upload_images/' + req.file.originalname, function(err) {
  //   if ( err ) console.log('ERROR: ' + err);
  // });
  const result = await upload_image(req.file)

  //console.log(result)
  res.end(req.file.originalname + ' uploaded!');
});

// You need to configure node.js to listen on 0.0.0.0 so it will be able to accept connections on all the IPs of your machine
const hostname = '0.0.0.0';
server.listen(PORT, hostname, () => {
    console.log(`Server running at http://${hostname}:${PORT}/`);
  });
