import sys
import requests
import os
import argparse

def send_one_request(url, image_path):
    # define http payload
    file = {"image": open(image_path,'rb')}

    r = requests.post(url, files=file)
    if r.status_code != 200:
        print('sendErr: '+r.url)
    else :
        image_msg = image_path.split('/')[1] + ' uploaded!'
        msg = image_msg + '\n' + 'Classification result: ' + r.text
        print(msg)

def send_requests(args):
    num_request = args.num_request
    url = args.url
    image_folder = args.image_folder
    # Iterate through all the images in your local folder
    for i, name in enumerate(os.listdir(image_folder)):
        if i == num_request:
            break
        image_path = image_folder + name
        send_one_request(url, image_path)

def main():
    parser = argparse.ArgumentParser(description='Upload images')
    parser.add_argument('--num_request', type=int, help='one image per request')
    parser.add_argument('--url', type=str, help='URL of your backend server, e.g. http://3.86.108.221:3000')
    parser.add_argument('--image_folder', type=str, help='the path of the folder where images are saved on your local machine')
    args = parser.parse_args()
    send_requests(args)

if __name__=="__main__":
    main()
