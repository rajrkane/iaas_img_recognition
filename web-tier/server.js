/**
 * @file server.js: handles concurrent requests
 */

// Server imports
const fs = require('fs');
const express = require('express');
const server = express();
const PORT = 3000;

// AWS imports
const {upload_image} = require('./s3');
const {send_request_message, poll_responses} = require('./sqs');

// Import background task that dynamically adds/removes app instances
const {job} = require('./backgroundtask.js');

// multer imports
// uploaded images are saved in the folder "/upload_images"
const multer = require('multer');
const upload = multer({dest: __dirname + '/upload_images'});

server.use(express.static('public'));

// Upload image to S3 input bucket and send message to the request SQS queue
server.post('/', upload.single('myfile'), async (req, res) => {

  if (req.file) {	
	  const result = upload_image(req.file).then(function(res) {console.log('Uploaded ' + req.file.originalname); return res}).catch((err) => console.log(err))

	  try{
		  fs.unlinkSync(req.file.path)
	  } catch(err) {
		  console.log(err)
	  }


		send_request_message(req.file.originalname)
		poll_responses(req.file.originalname, res)
  }  
});

const hostname = '0.0.0.0';
server.listen(PORT, hostname, () => {
    console.log(`Server running at http://${hostname}:${PORT}/`);
  });

