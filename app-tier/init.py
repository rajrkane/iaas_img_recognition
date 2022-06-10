from s3 import S3
from sqs import SQS

bucket = S3() 
response_queue = SQS()

# for each result, send message to queue
for res in bucket.results['results']:
    msg = {
        'name': res['key'],
        'body': res['body']
    }
    response_queue.send_message(msg)