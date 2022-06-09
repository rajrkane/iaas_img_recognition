cloud computing project

# S3 Setup

Create an S3 input images bucket and output classifications bucket.

# IAM Policies and user setups

Make an IAM policy for S3 allowing `DeleteObject`, `PutObject`, `GetObject`. Under resources of the policy, add the arn of the two S3 buckets above. Give a name to the policy.

Create an IAM user for the web server and give it programmatic access. Under permissions, give this user the policy made above.

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
```

The root directory of the instance should have a `~/.aws/credentials` file with the following contents:
```
[default]
aws_access_key_id=<aws ec2 user access key>
aws_secret_access_key=<aws ec2 user secret key>
```

# Web server launch
To run the web server from the instance: `node ~/iaas_img_recognition/web-tier/server.js`

# Client generate workload
On the client run the following command to create the workload:
`python3 workload_generator.py --num_request 1 --url 'http://<Public IPv4 DNS of EC2 instance>:3000/images' --image_folder "<relative path to pictures folder>"`
