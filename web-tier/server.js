/**
 * @file server.js: handles concurrent requests
 */

const express = require('express');
const multer = require('multer');
const server = express();
const cronjob = require('cron').CronJob;
const PORT = 3000;

const {upload_image} = require('./s3')
const {send_request_message} = require('./sqs')
const {add_app_instances} = require('./ec2')
const {get_app_instances} = require('./ec2')

// uploaded images are saved in the folder "/upload_images"
const upload = multer({dest: __dirname + '/upload_images'});

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

// Background job dynamically adding/removing app-tier instances
// Runs every 10 seconds:
var job = new cronjob(
	'0-59/10 * * * * *',
	async function() {	
		let request_queue_length = 0;

		// Make an array of length 19 (most amout of ec2 app instances while staying free)
		// running_or_pending_instances[5] = 1 means app-tier-5 is pending or running
		// otherwise it does not exist.
		// let running_or_pending_instances = new Array(19); for (let i=0; i<19; ++i) running_or_pending_instances[i] = 0;
		let running_or_pending_instances = new Array(19); for (let i=0; i<19; ++i) running_or_pending_instances[i] = 0;
		
		// console.log('Youll see this message every 10 seconds.');
		// var result = add_app_instances("1").promise()

		// getting number of ec2 instances
		try {
			
			// get instances
			var result = await get_app_instances();
			
			// Fill in the app tier instances that are running or pending
			result["Reservations"].forEach((reservation) => {
				reservation["Instances"].forEach((instance) => {
					let instance_state = instance["State"]["Name"];
					if (instance_state === 'running' || instance_state === 'pending') {
						instance_number = parseInt(instance["Tags"][0]["Value"].split('app-tier-').pop());
						running_or_pending_instances[instance_number] = 1;
					}
				});
			});
			// console.log("EC2 Get Apps RESPONSE:")
			// console.log(running_or_pending_instances);

		} catch (err) {
			console.log("EC2 get instances error:");
			console.log(err);
		}
	},
	null,
	true
);
