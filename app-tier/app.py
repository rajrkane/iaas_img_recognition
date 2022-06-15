from s3 import S3
from sqs import SQS

def get_class(request=None):
    '''
    Gets the classification for a request on an image.
    '''
    
    # TODO: remove default None from argument
    # TODO: call the classifier here
    # label = classify(key)
    result = { # update with real values
        'key':      'FOO',
        'label':    'BAR'
    }

    return result

def put_object(obj):
    '''
    Stores classification result into output bucket for persistence.
    '''

    bucket = S3()
    bucket.put_object(obj)
    print("Put object into output bucket!")

def send_message(msg):
    '''
    Sends message of classification to response queue.
    '''

    response_queue = SQS()
    response_queue.send_message(msg)
    print("Sent message to response queue!")

def main():
    result = get_class() # TODO: pass in a request
    put_object(result)
    send_message(result)

if __name__=='__main__':
    main()
