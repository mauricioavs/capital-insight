import boto3
import csv
from io import StringIO
from decimal import Decimal

endpoint = "http://172.17.0.1:4566"

s3 = boto3.client(
    's3',
    endpoint_url=endpoint,
    region_name='us-east-1',
    aws_access_key_id='test',
    aws_secret_access_key='test',
)

dynamodb = boto3.resource(
    'dynamodb',
    endpoint_url=endpoint,
    region_name='us-east-1',
    aws_access_key_id='test',
    aws_secret_access_key='test',
)

table = dynamodb.Table('expenses')

def lambda_handler(event, context):
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']

    response = s3.get_object(Bucket=bucket, Key=key)
    content = response['Body'].read().decode('utf-8')
    csv_reader = csv.DictReader(StringIO(content))

    for row in csv_reader:
        table.put_item(Item={
            'user_id': 'demo-user',
            'timestamp': row['date'],
            'category': row['category'],
            'amount': Decimal(row['amount']),
        })

    return {"statusCode": 200, "message": "Archivo procesado"}