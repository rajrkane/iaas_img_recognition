import boto3
import os 
from dotenv import load_dotenv
import json

class S3:

    def __init__(self):
        self.params = {}
        self.resource = None
        self.results = {'objects': []}

        self.load_params()
        self.load_s3()
        self.get_results()

    def load_params(self):
        load_dotenv()
        self.params = {
            'output_bucket': os.getenv('S3_OUTPUT'),
            'region': os.getenv('S3_REGION'),
            'access_key': os.getenv('AWS_ACCESS_KEY'),
            'secret_key': os.getenv('AWS_SECRET_KEY')
        }

    def load_s3(self):
        '''
        Loads an S3 resource.
        '''

        s3_resource = boto3.resource(
            's3',
            region_name=self.params['region'],
            aws_access_key_id=self.params['access_key'],
            aws_secret_access_key=self.params['secret_key']
        )

        self.resource = s3_resource

    def get_results(self):
        '''
        Builds a dictionary mapping key to body for objects in the S3 output bucket.       
        '''

        bucket = self.resource.Bucket(self.params['output_bucket'])
        for obj in bucket.objects.all():
            key = obj.key 
            body = obj.get()['Body'].read().decode('UTF-8').strip()
            self.results['objects'].append({key: body}) 


def main():
    s3 = S3()

if __name__=="__main__":
    main()