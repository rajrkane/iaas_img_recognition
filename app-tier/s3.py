import boto3
import os
import io
from dotenv import load_dotenv
import json

class S3:

    def __init__(self):
        self.params = {}
        self.client = None
        self.results = {'results': []}

        self.load_params()
        self.load_s3()

    def load_params(self):
        load_dotenv()
        self.params = {
            'input_bucket': os.getenv('S3_INPUT'),
            'output_bucket': os.getenv('S3_OUTPUT'),
            'region': os.getenv('REGION'),
            'access_key': os.getenv('AWS_ACCESS_KEY'),
            'secret_key': os.getenv('AWS_SECRET_KEY')
        }

    def load_s3(self):
        '''
        Loads an S3 client.
        '''

        s3_client = boto3.client(
            's3',
            region_name=self.params['region'],
            aws_access_key_id=self.params['access_key'],
            aws_secret_access_key=self.params['secret_key']
        )

        self.client = s3_client

    def put_object(self, classification):
        '''
        Saves a classification in the output bucket for persistence.
        '''

        key = classification['key']
        label = classification['label']
        
        # key is the name, label is the content
        with io.BytesIO() as f:
            f.write(str.encode(label))
            f.seek(0)
            self.client.upload_fileobj(f, self.params['output_bucket'], key)

    def download_input_bucket_object(self, key):
        '''
        Gets an object from the input bucket.
        If it downloads successfully, "success" is returned, else None
        '''
        if os.path.isdir('/tmp/input/') is False:
            os.mkdir('/tmp/input/')

        try:
            response = self.client.download_file(
                    Bucket=self.params['input_bucket'],
                    Key=key,
                    Filename='/tmp/input/' + key
                    )
            print(response)
            print("S3 input bucket file downloaded!")
            return "success"
        except Exception as e:
            print("Object doesnt exist!")
            return None

    def download_output_bucket_object(self, key):
        '''
        Gets an object from the output bucket.
        If it downloads successfully, "success" is returned, else None
        '''
        if os.path.isdir('/tmp/output/') is False:
            os.mkdir('/tmp/output/')
        try:
            response = self.client.download_file(
                    Bucket=self.params['output_bucket'],
                    Key=key,
                    Filename='/tmp/output/' + key
                    )
            print(response)
            print("S3 output bucket file downloaded!")
            return "success"
        except Exception as e:
            print("Object doesnt exist!")
            return None

