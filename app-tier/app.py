from s3 import S3
from sqs import SQS
import os
import time

def get_class(key):
    '''
    Gets the classification for a request on an image.
    '''
    
    # Call the classifier
    os.system("cd ~/classifier; python3 image_classification.py /tmp/input/" 
            + key + " > /tmp/output/" + key)
    f = open('/tmp/output/' + key, 'r')
    label = f.readline().split(',', 1)[1][:-1]

    # label = classify(key)
    result = { # update with real values
        'key':      key,
        'label':    label
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

def download_input_bucket_object(key):
    '''
    Downloads an object from S3 input bucket to /tmp/input/<key>
    Returns "success" if successful, else None.
    '''
    input_bucket = S3()
    response = input_bucket.download_input_bucket_object(key)
    return response

def download_output_bucket_object(key):
    '''
    Downloads an object from S3 output bucket to /tmp/output/<key>
    Returns "success" if successful, else None.
    '''
    output_bucket = S3()
    response = output_bucket.download_output_bucket_object(key)
    return response


def main():
    while True:
        try:
            time.sleep(2) # so we stay in free tier. cant query too much
            message = get_message()

            if message is not None: # We got a message from the queue!
                
                # Check if object is already classified in output bucket
                response = download_output_bucket_object(message['messagebody'])
                if response == "success": # we already have a classification for it
                    f = open('/tmp/output/' + message['messagebody'], 'r')
                    label = f.readline()
                    send_message({
                        'key': message['messagebody'],
                        'label': label
                        })

                else: # not classified yet       
                    # Get object from input bucket
                    response = download_input_bucket_object(message['messagebody'])
                    if response == "success": # input object downloaded successfully
                        # Classify the image
                        result = get_class(message['messagebody'])
                        # Put classification in output bucket
                        put_object(result)
                        # Send response message
                        send_message(result)

                # delete request message
                delete_message(message)
        except Exception as e:
            print(e)


if __name__=='__main__':
    main()
