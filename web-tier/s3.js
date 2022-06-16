require('dotenv').config()
const fs = require('fs')
const S3 = require('aws-sdk/clients/s3')

const input_bucket = process.env.S3_INPUT
const region = process.env.REGION
const access_key = process.env.AWS_ACCESS_KEY
const secret_key = process.env.AWS_SECRET_KEY

const s3 = new S3({
  input_bucket,
  region,
  access_key,
  secret_key
})

// upload photo
function upload_image(file) {
	try {
		if (file) {
			if (fs.existsSync(file.path)) {
				const fileStream = fs.createReadStream(file.path)
				const uploadParams = {
					Bucket: input_bucket,
					Body: fileStream,
					Key: file.originalname
				}

				return s3.upload(uploadParams).promise().then((data) => data)
			}
		}
	} catch (err) {
		console.log(err)
	}
}

exports.upload_image = upload_image
