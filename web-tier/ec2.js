require('dotenv').config()
const EC2 = require('aws-sdk/clients/ec2')

const access_key = process.env.AWS_ACCESS_KEY
const secret_key = process.env.AWS_SECRET_KEY
const ec2_region = process.env.EC2_REGION
const ec2_ami = process.env.EC2_AMI
const ec2_ssh_key_name = process.env.EC2_SSH_KEY_NAME
const ec2_apptier_securitygroupid = process.env.EC2_APPTIER_SECURITYGROUPID

const ec2 = new EC2({
	accessKeyId: access_key,
	secretAccessKey: secret_key,
	region: ec2_region
})

// get app-tier instances running or pending
async function get_app_instances() {
	
	var params = {
		Filters: [
			{
				Name: 'image-id',
				Values: [
					ec2_ami
				]
			}
		]
	};
	
	return ec2.describeInstances(params).promise();
}
		

// spin up number_of_instances instances
// number_of_instances must be of type String
function add_app_instances(number_of_instances) {
	var params = {
		MaxCount: number_of_instances,
		MinCount: number_of_instances,
		ImageId: ec2_ami,
		InstanceType: "t2.micro",
		KeyName: ec2_ssh_key_name,
		SecurityGroupIds: [
			ec2_apptier_securitygroupid
		],
		TagSpecifications: [
			{
				ResourceType: "instance",
				Tags: [
					{
						Key: "Name",
						// Change the value number to be dynamic later
						Value: "app-tier-5" 
					}
				]
			}
		]
	};

	return ec2.runInstances(params).promise();
}

// terminate the app instance with instanceid
function terminate_app_instance(instanceid) {
	var params = {InstanceIds: [instanceid]};
	return ec2.terminateInstances(params).promise();
}

exports.add_app_instances = add_app_instances
exports.get_app_instances = get_app_instances
exports.terminate_app_instance = terminate_app_instance
