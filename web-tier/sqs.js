require('dotenv').config()
const SQS = require('aws-sdk/clients/sqs');

const request_queue_url = process.env.SQS_REQUEST_URL
const sqs_region = process.env.REGION
const access_key = process.env.AWS_ACCESS_KEY
const secret_key = process.env.AWS_SECRET_KEY

const sqs = new SQS({
	accessKeyId: access_key, 
	secretAccessKey: secret_key,
	region: sqs_region
})

// send request message to SQS Request queue. 
function send_request_message(message_body) {
	var params = {
		MessageBody: message_body,
		QueueUrl: request_queue_url
	};
	return sqs.sendMessage(params).promise().then((data) => data)
}

// get request queue attributes
function get_request_queue_length() {
	var params = {
		QueueUrl: request_queue_url,
		AttributeNames: ["ApproximateNumberOfMessages"]
	};

	return sqs.getQueueAttributes(params).promise().then((data) => data)
}

exports.send_request_message = send_request_message
exports.get_request_queue_length = get_request_queue_length
