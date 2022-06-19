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
const {handle_message} = require('./sqs');

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
	  const result = upload_image(req.file).then(function(res) {console.log("--------UPLOAD SUCCESS------------"); return res;}).catch((err) => console.log(err))

	  try{
		  fs.unlinkSync(req.file.path)
	  } catch(err) {
		  console.log(err)
	  }

		//const MSG = await handle_message(req.file.originalname)

	  handle_message(req.file.originalname)

		//const response_res = await receive_response_message()

	  res.end(req.file.originalname + ' uploaded, awaiting classification.');
  }  
});

const hostname = '0.0.0.0';
server.listen(PORT, hostname, () => {
    console.log(`Server running at http://${hostname}:${PORT}/`);
  });
