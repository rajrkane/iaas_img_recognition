# Group + Tasks

### 1. **Raj Kane**:
  * Repo management
  * Final testing + debugging
  * Nodejs setup
  * PDF Report
  * Handle responses
  * Logging
  * S3:
    - Class setup on web server side
    - Upload image to S3
  * SQS:
    - Class setup on web server side
    - Send message to request queue
    - Get message from response queue
    - Delete message from response queue
  * EC2:
    - Class setup on web server side

### 2. **Trey Manuszak**:
  * Web tier system service setup
  * AWS user + credential management
  * Final testing and debugging
  * README
  * S3:
    - Get image from S3 input
    - Send classification to S3 output
  * SQS: 
    - Get request queue length
    - Get message from request queue
    - Delete message from request queue
    - Send message to response queue
  * EC2:
    - Class setup on web server side
    - Programmed background task for dynamic app spin up and down
    - Python cronjob script on startup 
    - Get number of running and pending instances

# Credentials

The SSH key for access to the app and webserver instances is the `web-server test instance key.pem` file and the credentials for managing the resources are in the `CSE546Group_accessKeys.csv` file.

# Resouce Names:

## EC2

Web server URL: `http://52.54.218.30:3000`

Web servername: `web-server`

App instances: `app-tier-<# of app tier>`

App tier ami: `ami-06daa736cc26fdd1d`

## S3

Input Bucket: `cse546group-images-input`

Output bucket: `cse546group-output-classifications`

## SQS

Request queue name: `cse546-request-queue`

Response queue name: `cse546-response-queue`

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

1. Clone the repo: `git clone https://github.com/rajrkane/iaas_img_recognition.git`.
2. Install dependencies: `sudo bash setup.sh`.

The root directory of the repo should have a `.env` file in the following format:
```
S3_INPUT="<Input Images Bucket Name>"
S3_OUTPUT = "<output bucket name>"
REGION="<Region>"  (e.g. "ap-northeast-2")
AWS_ACCESS_KEY="<aws access key>"  (This is the access and secret key of the webserver IAM user.)
AWS_SECRET_KEY="<aws secret key>"
SQS_REQUEST_URL = "<sqs request queue url>" (e.g. "https://sqs.ap-northeast-2.amazonaws.com/604512611165/clouderson546-requests")
SQS_RESPONSES_URL = "<sqs response queue url>" (e.g. "https://sqs.ap-northeast-2.amazonaws.com/604512611165/clouderson546-responses")
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
Use sudo to copy the `web-tier/web-tier.service` file to the `/etc/systemd/system/` directory. 

To run the web-tier server as a service use the command `sudo systemctl start web-tier.service`.

To enable the web-tier server to start immediately and start after any reboot, use the command `sudo systemctl enable --now web-tier.service`.

To stop the service use the command `sudo systemctl stop web-tier.service`.

To see the status of the service use the command `sudo systemctl status web-tier.service`.

To see the logs generated by the web-tier service, use the command `journalctl -f -u web-tier.service`.

# app-tier setup
Create an EC2 `app-tier-setup` instance from the `ami-0bb1040fdb5a076bc` AMI. 

Send the `app-tier/startup.sh` file to the `/home/ubuntu/` directory of this instance via SFTP. 

Do the command `chmod 755 startup.sh` to make the script executable. 

Use pip to install the `boto3` and `python-dotenv` packages.

Do the command `crontab -e` (and possibly select an editor to open). At the end of the file add the line `@reboot sh /home/ubuntu/startup.sh &`. This will run the `startup.sh` file on reboot. 

Now, from the AWS console, create a new image from this instance. Now all ec2 instances from this image will run the script on startup.


# Client generate workload
On the client run the following command to create the workload:
`python3 workload_generator.py --num_request 1 --url 'http://<Public IPv4 DNS of EC2 instance>:3000' --image_folder "<relative path to pictures folder>"`
