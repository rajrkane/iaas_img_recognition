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

const handle_message = (message_body) =>  {
	const req_params = {
		MessageBody: message_body,
		QueueUrl: request_queue_url
	};

	const sec = 1
	const res_params = {
		QueueUrl: response_queue_url,
		MaxNumberOfMessages: 1,
		VisibilityTimeout: sec, // lock message from other threads for X seconds
		WaitTimeSeconds: 0
	}

	// send request message
	sqs.sendMessage(req_params).promise().then(() => {
		console.log('sent ' + message_body)
	})
	
	// poll response queue
	poll_responses(res_params, message_body, sec)	
}

const poll_responses = (res_params, message_body, sec) => {
	console.log('polling')
	sqs.receiveMessage(res_params, (err, data) => {
		if (err) console.log(err)
		if (data.Messages) {
			//console.log('thread for ' + message_body + ', got ' + data.Messages[0].Body)
			for (let i = 0; i < data.Messages.length; i++) {
				let message = data.Messages[i]
				let key = message.Body.split(',')[0]
				//console.log('received ' + key)
				if (key == message_body) {
					removeFromQueue(message)
					return
				} else {
					setTimeout(() => {}, sec * 1200) // wait to release message
					poll_responses(res_params, message_body, sec) // poll again
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

exports.handle_message = handle_message
//exports.receive_response_message = receive_response_message
exports.get_request_queue_length = get_request_queue_length
