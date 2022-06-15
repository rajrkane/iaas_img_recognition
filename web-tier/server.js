/**
 * @file server.js: handles concurrent requests
 */

// Server imports
const express = require('express');
const server = express();
const PORT = 3000;

// AWS imports
const {upload_image} = require('./s3');
const {send_request_message} = require('./sqs');

// Import background task that dynamically adds/removes app instances
const {job} = require('./backgroundtask.js');

// multer imports
// uploaded images are saved in the folder "/upload_images"
const upload = multer({dest: __dirname + '/upload_images'});
const multer = require('multer');


server.use(express.static('public'));

// Upload image to S3 input bucket and send message to the request SQS queue
server.post('/', upload.single('myfile'), async (req, res) => {
  // if (req.file) {
  //   console.log(req.file)
  // }

  // save the image locally
  var fs = require('fs');
  fs.rename(__dirname + '/upload_images/' + req.file.filename, __dirname + '/upload_images/' + req.file.originalname, function(err) {
    if ( err ) console.log('ERROR: ' + err);
  });

  const result = await upload_image(req.file)

  const result_sqs = await send_request_message(req.file.originalname)


  res.end(req.file.originalname + ' uploaded!');
});

const hostname = '0.0.0.0';
server.listen(PORT, hostname, () => {
    console.log(`Server running at http://${hostname}:${PORT}/`);
  });
