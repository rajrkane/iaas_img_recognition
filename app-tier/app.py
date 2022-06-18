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

def get_message():
    '''
    Gets a message from the request SQS queue
    '''

    request_queue = SQS()
    message = request_queue.get_message()
    return message

def delete_message(msg):
    '''
    Deletes a message from the SQS request queue
    '''

    request_queue = SQS()
    request_queue.delete_message(msg)
    print("Message deleted from SQS request queue!")

def main():
    message = get_message()
    if message is not None: # We got a message from the queue!
        # Check if object is already classified in output bucket
        # Get object from input bucket
        # Classify the image
        # Put classification in output bucket
        # Send response message
        # delete request message
        delete_message(message)

    # result = get_class() # TODO: pass in a request
    # put_object(result)
    # send_message(result)

if __name__=='__main__':
    main()
