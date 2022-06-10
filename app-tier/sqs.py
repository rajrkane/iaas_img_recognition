import boto3
import os
from dotenv import load_dotenv

class SQS:

    def __init__(self):
        self.params = {}
        self.client = None

        self.load_params()
        self.load_sqs()

    def load_params(self):
        load_dotenv()
        self.params = {
            'response_queue': os.getenv('SQS_RESPONSES_URL'),
            'region': os.getenv('REGION'),
            'access_key': os.getenv('AWS_ACCESS_KEY'),
            'secret_key': os.getenv('AWS_SECRET_KEY')
        }

    def load_sqs(self):
        '''
        Loads an SQS resource.
        '''

        sqs_client = boto3.client(
            'sqs',
            region_name=self.params['region'],
            aws_access_key_id=self.params['access_key'],
            aws_secret_access_key=self.params['secret_key']
        )

        self.client = sqs_client

    def send_message(self, msg):
        ''' 
        Sends a message to the SQS response queue.
        '''

        print(self.params)
        response = self.client.send_message(
            QueueUrl=self.params['response_queue'],
            MessageAttributes={
                'Name': {
                    'DataType': 'String',
                    'StringValue': msg['name']
                }
            },
            MessageBody=msg['body']
        )

        print('sent message')