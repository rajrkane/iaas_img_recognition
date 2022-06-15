/**
 * @file server.js: handles concurrent requests
 */

const express = require('express');
const multer = require('multer');
const server = express();
const cronjob = require('cron').CronJob;
const PORT = 3000;

const {upload_image} = require('./s3');
const {send_request_message, get_request_queue_length} = require('./sqs');
const {add_app_instance, get_app_instances, terminate_app_instance, add_max_app_instances} = require('./ec2');

// uploaded images are saved in the folder "/upload_images"
const upload = multer({dest: __dirname + '/upload_images'});

// maximum number of app-tier instances allowed at once
const max_app_instances_allowed = 19; 

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
		/////// VARIABLES ///////////
		let request_queue_length = 0;

		// Make an array of length 19 (most amout of ec2 app instances while staying free)
		// running_or_pending_instances[5] = 1 means app-tier-5 is pending or running
		// otherwise it does not exist
		let running_or_pending_instances = new Array(max_app_instances_allowed); 
		for (let i=0; i<max_app_instances_allowed; ++i) running_or_pending_instances[i] = 0;
		
		////////// Get number of messages in request queue ////////////
		try {
			let result = await get_request_queue_length();
			request_queue_length = parseInt(result["Attributes"]["ApproximateNumberOfMessages"]);
		} catch (err) {
			console.log(err);
		}

		///////// Get number of ec2 instances ////////////
		try {
			
			// get instances
			var app_instances_dump = await get_app_instances();
			
			// Fill in the app tier instances that are running or pending
			app_instances_dump["Reservations"].forEach((reservation) => {
				reservation["Instances"].forEach((instance) => {
					let instance_state = instance["State"]["Name"];
					if (instance_state === 'running' || instance_state === 'pending') {
						instance_number = parseInt(instance["Tags"][0]["Value"].split('app-tier-').pop());
						running_or_pending_instances[instance_number] = 1;
					}
				});
			});

		} catch (err) {
			console.log("EC2 get instances error:");
			console.log(err);
		}
		

		//////////// Dynamically adding/removing app instances as needed ///////////////////////
		try {
			// Destroy app instances if queue length is less than 5 and we have more than 1 app instance
			if (request_queue_length < 5 && running_or_pending_instances.filter(v => v === 1).length > 1) {
				let last_app_number = running_or_pending_instances.lastIndexOf(1);
				let last_app_instanceid = "";
				
				// getting the instance id of "app-tier-<last_app_number>"
				app_instances_dump["Reservations"].forEach((reservation) => {
					reservation["Instances"].forEach((instance) => {
						let instance_state = instance["State"]["Name"];
						if (parseInt(instance["Tags"][0]["Value"].split('app-tier-').pop()) === last_app_number
							&& (instance_state === 'running' || instance_state === 'pending')) {
							last_app_instanceid = instance["InstanceId"]
						}
					});
				});

				await terminate_app_instance(last_app_instanceid);
				console.log("--------- TERMINATED app-tier-" + last_app_number.toString() + " ----------------");
			} 
			
			// If we have at least 5 messages in the queue and less than max instances, create max amount of instances
			else if (request_queue_length >= 5 && running_or_pending_instances.filter(v => v === 1).length < max_app_instances_allowed) {
				await add_max_app_instances(running_or_pending_instances);	
				console.log("--------ADDED MAX INSTANCES-------------");
			}

			// if there are no app-tier instances, add one
			else if (running_or_pending_instances.filter(v => v === 1).length === 0) {
				await add_app_instance();
				console.log("------------ ADDED ONE APP INSTANCE -----------------");
			}
			
		} catch(err) {
			console.log(err)
		}

		// Spinning one app tier up for testing
		// var result = add_app_instances("1").promise()
		

	},
	null,
	true
);
