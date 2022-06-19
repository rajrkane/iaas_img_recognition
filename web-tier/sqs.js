require('dotenv').config()
const SQS = require('aws-sdk/clients/sqs');

const request_queue_url = process.env.SQS_REQUEST_URL
const response_queue_url = process.env.SQS_RESPONSES_URL
const sqs_region = process.env.REGION
const access_key = process.env.AWS_ACCESS_KEY
const secret_key = process.env.AWS_SECRET_KEY

const sqs = new SQS({
	accessKeyId: access_key, 
	secretAccessKey: secret_key,
	region: sqs_region
})

const send_request_message = (message_body) =>  {
	const req_params = {
		MessageBody: message_body,
		QueueUrl: request_queue_url
	};


	// send request message
	sqs.sendMessage(req_params).promise().then(() => {
		//console.log('sent ' + message_body)
	})
	
	// poll response queue
	// return poll_responses(message_body)	
}

async function poll_responses (message_body, res) {
	//console.log('polling')
	const sec = 1 
	const res_params = {
		QueueUrl: response_queue_url,
		MaxNumberOfMessages: 1,
		VisibilityTimeout: sec, // lock message from other threads for X seconds
		WaitTimeSeconds: 0
	}
	sqs.receiveMessage(res_params, (err, data) => {
		if (err) console.log(err)
		if (data.Messages) {
			for (let i = 0; i < data.Messages.length; i++) {
				let message = data.Messages[i]
				let key = message.Body.split(',')[0]
				let label = message.Body.split(',')[1]
				if (key == message_body) { // got correct response
					removeFromQueue(message)
					res.end(message_body + label)
				} else {
					setTimeout(() => {}, sec * 80) // wait to release message
					poll_responses(message_body, res)// poll again
				}
			}	
		}
	})
}

const removeFromQueue = (message) => {
	const msg_name = message.Body.split(',')[0].slice()
	sqs.deleteMessage({
		QueueUrl: response_queue_url,
		ReceiptHandle: message.ReceiptHandle
	}, (err, data) => {
			if (err) {
				console.log(err)
			} else {
					console.log('removed ' + msg_name)
			}
	})
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
exports.poll_responses = poll_responses
//exports.receive_response_message = receive_response_message
exports.get_request_queue_length = get_request_queue_length
