from requests_toolbelt.multipart import decoder
import boto3
import csv
from io import StringIO
from decimal import Decimal
import base64

endpoint = "http://172.17.0.1:4566"

dynamodb = boto3.resource(
    'dynamodb',
    endpoint_url=endpoint,
    region_name='us-east-1',
    aws_access_key_id='test',
    aws_secret_access_key='test',
)

table = dynamodb.Table('expenses')

def lambda_handler(event, context):
    body = event.get('body', '')
    if event.get('isBase64Encoded', False):
        body = base64.b64decode(body)
    else:
        body = body.encode('utf-8')

    content_type = event['headers'].get('Content-Type') or event['headers'].get('content-type')
    multipart_data = decoder.MultipartDecoder(body, content_type)

    for part in multipart_data.parts:
        # Aquí cada part es un fragmento, busca el que tenga filename, etc
        disposition = part.headers.get(b'Content-Disposition', b'').decode()
        if 'filename=' in disposition:
            csv_content = part.content.decode('utf-8')
            csv_reader = csv.DictReader(StringIO(csv_content))
    
            for row in csv_reader:
                print("Fila recibida:", row)
                table.put_item(Item={
                    'user_id': row['user_id'],
                    'date': row['date'],
                    'amount': Decimal(row['amount']),
                    'category': row['category'],
                    'description': row['description']
                })

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",  # CORS
            "Access-Control-Allow-Methods": "POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": "Archivo procesado"
    }
