require('dotenv').config()
const EC2 = require('aws-sdk/clients/ec2')

const access_key = process.env.AWS_ACCESS_KEY
const secret_key = process.env.AWS_SECRET_KEY
const ec2_region = process.env.EC2_REGION
const ec2_ami = process.env.EC2_AMI
const ec2_ssh_key_name = process.env.EC2_SSH_KEY_NAME

const ec2 = new EC2({
	accessKeyId: access_key,
	secretAccessKey: secret_key,
	region: ec2_region
})

// spin up number_of_instances instances
// number_of_instances must be of type String
function add_app_instances(number_of_instances) {
	// Check we arent addinng more than 20
	var params = {
		MaxCount: number_of_instances,
		MinCount: number_of_instances,
		ImageId: ec2_ami,
		InstanceType: "t2.micro",
		KeyName: ec2_ssh_key_name,
		TagSpecifications: [
			{
				ResourceType: "instance",
				Tags: [
					{
						Key: "Name",
						// Change the value number to be dynamic later
						Value: "app-tier-1" 
					}
				]
			}
		]
		// UserData: "<script>" to run script on startup
	};

	return ec2.runInstances(params).promise()
}

exports.add_app_instances = add_app_instances
