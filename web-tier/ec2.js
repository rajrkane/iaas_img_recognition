require('dotenv').config()
const EC2 = require('aws-sdk/clients/ec2')

const access_key = process.env.AWS_ACCESS_KEY
const secret_key = process.env.AWS_SECRET_KEY
const ec2_region = process.env.REGION
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
		

// spin up app-tier-0 if it doesnt exist
function add_app_instance() {
	var params = {
		MaxCount: '1',
		MinCount: '1',
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
						Value: "app-tier-0" 
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

// add the max amount of app instances
function add_max_app_instances(running_or_pending_instances) {
	var params = {
		MaxCount: '1',
		MinCount: '1',
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
						Value: "APP NAME HERE"
					}
				]
			}
		]
	};

	// there is no way to make all the instances at once with different names, Ive looked at everything
	// Creating one at a time
	for (i=0; i<running_or_pending_instances.length; ++i) {
		if (running_or_pending_instances[i] != 1) { // If its not running or pending, we need to make it
			params["TagSpecifications"][0]["Tags"][0]["Value"] = 'app-tier-' + i.toString();
			ec2.runInstances(params).promise();
		}
	};
}

exports.add_app_instance = add_app_instance
exports.get_app_instances = get_app_instances
exports.terminate_app_instance = terminate_app_instance
exports.add_max_app_instances = add_max_app_instances
