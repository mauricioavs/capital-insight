import boto3
from collections import defaultdict
import json

endpoint = "http://172.17.0.1:4566"

dynamodb = boto3.resource(
    'dynamodb',
    endpoint_url=endpoint,
    region_name='us-east-1',
    aws_access_key_id='test',
    aws_secret_access_key='test')

table = dynamodb.Table('expenses')

def lambda_handler(event, context):
    response = table.scan()
    items = response['Items']

    summary = defaultdict(float)
    for item in items:
        summary[item['category']] += float(item['amount'])

    recommendations = []
    if summary['entertainment'] > 200:
        recommendations.append("Reduce entretenimiento a menos de $200 al mes")

    return {
        "statusCode": 200,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps({
            "summary": dict(summary),
            "recommendations": recommendations
        })
    }
