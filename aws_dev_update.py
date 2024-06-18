import boto3
import os
import datetime

# Get current date and time in the format "YYYY_MM_DD_HH_MM_SS"
now = datetime.datetime.now().strftime("%Y_%m_%d_%H_%M_%S")

# Create the folder name with appended date and time
folder_name = "backup_" + now + "/"
bucket_name = 'chart-dev.density.exchange'
folder_path = './'  
key_name = 'index.html' 
folder_list = ['charting_library','src']
AWS_ACCESS_KEY_ID = os.getenv('AWS_ACCESS_KEY_ID')
AWS_SECRET_KEY_ID = os.getenv('AWS_SECRET_KEY_ID')

# Replace with your S3 bucket name and AWS credentials
s3 = boto3.client('s3', aws_access_key_id=AWS_ACCESS_KEY_ID,
                      aws_secret_access_key=AWS_SECRET_KEY_ID)

# create folder with current data and time 
try:
    s3.put_object(Bucket=bucket_name, Key=(folder_name))
except Exception as e:
    print("Error creating folder:", e)


try:
    s3.copy_object(Bucket=bucket_name, CopySource={'Bucket': bucket_name, 'Key': key_name}, Key=(folder_name + key_name))
    s3.delete_object(Bucket=bucket_name, Key=key_name)  
    print("File moved successfully!")
except Exception as e:
    print("Error moving file:", e)

for folder in folder_list:
    try:
        paginator = s3.get_paginator('list_objects_v2')
        page_iterator = paginator.paginate(Bucket=bucket_name, Prefix=folder)
        for page in page_iterator:
            if 'Contents' in page:
                for obj in page['Contents']:
                    # print (obj['Key'])
                    new_key = folder_name + obj['Key']
                    s3.copy_object(Bucket=bucket_name, CopySource={'Bucket': bucket_name, 'Key': obj['Key']},
                                Key=new_key)
                    s3.delete_object(Bucket=bucket_name, Key=obj['Key'])
        print("Objects from folder moved successfully!" , folder)

    except Exception as e:
        print("Error moving objects from folder:", folder, e)

print ("****************************************************************")
print ("starting upload")
try:
    for root, directories, files in os.walk(folder_path):
        for file in files:
            file_key = os.path.join(root, file).replace(folder_path, "")  # Maintain folder structure in S3
            s3.upload_file(os.path.join(root, file), bucket_name, file_key)
    print("Folder contents uploaded successfully!")
except Exception as e:
    print("Error uploading folder contents:", e)
