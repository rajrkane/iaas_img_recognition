cloud computing project

# S3 Setup

Create an S3 input images bucket and output classifications bucket.

# IAM Policies and user setups

1. Make an IAM policy for S3 allowing `DeleteObject`, `PutObject`, `GetObject`. Under resources of the policy, add the arn of the two S3 buckets above. Give a name to the policy.

2. Make an IAM police for SQS allowing `SendMessage` and `GetQueueAttributes`. Under resources of the policy, add the arn of the request-queue. Give a name to this policy.

3. Make an IAM policy for SQS allowing `ChangeMessageVisibility`, `DeleteMessage`, and `ReceiveMessage`. Under resources of this policy, add the arn of the request-queue. Give a name to this policy.

Create an IAM user for the web server and give it programmatic access. Under permissions, give this user the S3 policy from (1) above and the SQS policy from (2) above.

Create an IAM user for the app instance and give it programmatic access. Under permissions, give this user the S3 policy above from (1) and the SQS policy above from (3).

# Web server EC2 setup

Give the ec2 instance a security group with inbound rule allowing TCP in port 3000. In the web server EC2 instance:

Clone the repo and do the following commands.
```
sudo apt-get update

sudo apt-get upgrade

sudo apt install npm

npm install --save multer

npm install aws-sdk

npm i dotenv
```

The root directory of the repo should have a `.env` file in the following format:
```
S3_INPUT="<Input Images Bucket Name>"
S3_REGION="<S3 Region>"  (like "us-east-1")
AWS_ACCESS_KEY="<aws access key>"  (This is the access and secret key of the webserver IAM user.)
AWS_SECRET_KEY="<aws secret key>"
REQUEST_QUEUE_URL="<request queue url>"
SQS_REGION="<sqs region>"
EC2_REGION="<ec2 region>"
EC2_AMI="<app-tier ami>"
EC2_SSH_KEY_NAME="<app-tier ssh key name>"
EC2_APPTIER_SECURITYGROUPID="<app-tier security group id allowing ssh inbound>"
```

The root directory of the instance should have a `~/.aws/credentials` file with the following contents:
```
[default]
aws_access_key_id=<aws ec2 user access key>
aws_secret_access_key=<aws ec2 user secret key>
```

# Web server launch
To run the web server from the instance: `node ~/iaas_img_recognition/web-tier/server.js

# app-tier setup
Create an EC2 `app-tier-setup` instance from the `ami-0bb1040fdb5a076bc` AMI. Send the `app-tier/startup.sh` file to the `/home/ubuntu/` directory of this instance via SFTP. Do the command `chmod 755 startup.sh` to make the script executable. Do the command `crontab -e` (and possibly select an editor to open). At the end of the file add the line `@reboot sh /home/ubuntu/startup.sh &`. This will run the `startup.sh` file on reboot. Now, from the AWS console, create a new image from this instance. Now all ec2 instances from this image will run the script on startup.


# Client generate workload
On the client run the following command to create the workload:
`python3 workload_generator.py --num_request 1 --url 'http://<Public IPv4 DNS of EC2 instance>:3000' --image_folder "<relative path to pictures folder>"`
