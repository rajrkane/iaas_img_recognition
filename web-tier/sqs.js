require('dotenv').config()
const SQS = require('aws-sdk/clients/sqs');

const request_queue_url = process.env.REQUEST_QUEUE_URL
const sqs_region = process.env.SQS_REGION
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
	return sqs.sendMessage(params).promise()
}

exports.send_request_message = send_request_message