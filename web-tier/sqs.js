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
	sqs.sendMessage(req_params).promise().then(() => {console.log('Sent request for ' + message_body)})
}

const poll_responses = (message_body, res) => {
	const sec = 1 
	const res_params = {
		QueueUrl: response_queue_url,
		MaxNumberOfMessages: 10,
	}

	// check for message in a batch 
	sqs.receiveMessage(res_params, (err, data) => {
		if (err) console.log(err)
		else if (data.Messages) {
			data.Messages.forEach(message => {
				let [key, label] = message.Body.split(',')
				if (key == message_body) { 
					// got correct response
					console.log('Got response `'+ label + '` for ' + key + '.')
					removeFromQueue(message_body, label, message, res)
					return
				}
				/*else {
					console.log('Thread for ' + message_body + ', got ' + key)
				}*/
			})
		}

		// if message not found, poll again
		const rndVal = Math.floor(Math.random() * (3000 - 2000 + 1) + 2000)
		setTimeout(() => {}, sec * rndVal)
		poll_responses(message_body, res)
	})
}

const removeFromQueue = (message_body, label, message, res) => {
	const del_params = {
		QueueUrl: response_queue_url,
		ReceiptHandle: message.ReceiptHandle
	}
	const msg_name = message.Body.split(',')[0].slice()
	sqs.deleteMessage(del_params, (err, data) => {
				if (err) console.log(err)
				else {
					console.log('Removed ' + msg_name + ' response.')
					//res.end(message_body + ' - ' + label)
				}
		})
	res.end(message_body + ' - ' + label)
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
exports.get_request_queue_length = get_request_queue_length
