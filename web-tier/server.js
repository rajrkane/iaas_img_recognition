/**
 * @file server.js: handles concurrent requests
 */

const express = require('express');
const multer = require('multer');
const server = express();
const PORT = 3000;

const {upload_image} = require('./s3')
const {send_request_message} = require('./sqs')
const {add_app_instances} = require('./ec2')

// uploaded images are saved in the folder "/upload_images"
const upload = multer({dest: __dirname + '/upload_images'});

server.use(express.static('public'));

server.post('/', upload.single('myfile'), async (req, res) => {
  // if (req.file) {
  //   console.log(req.file)
  // }

  // save the image locally
  // var fs = require('fs');
  // fs.rename(__dirname + '/upload_images/' + req.file.filename, __dirname + '/upload_images/' + req.file.originalname, function(err) {
  //   if ( err ) console.log('ERROR: ' + err);
  // });

  // const result = await upload_image(req.file)

  // const result_sqs = await send_request_message(req.file.originalname)

  var result = await add_app_instances("1")
  console.log("EC2 RESPONSE:")
  console.log(result)

  res.end(req.file.originalname + ' uploaded!');
});

const hostname = '0.0.0.0';
server.listen(PORT, hostname, () => {
    console.log(`Server running at http://${hostname}:${PORT}/`);
  });
