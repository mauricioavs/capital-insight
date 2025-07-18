import boto3
import os
from boto3.dynamodb.conditions import Key
from decimal import Decimal
import json

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
    path_params = event.get("pathParameters")
    user_id = None

    if path_params is not None:
        user_id = path_params.get("user_id")
        
    if user_id:
        return get_summary_for_user(user_id)
    else:
        return get_summary_for_all()

def get_summary_for_user(user_id):
    response = table.query(
        KeyConditionExpression=Key('user_id').eq(user_id)
    )
    items = response.get("Items", [])

    total_expenses = 0
    records = []

    for item in items:
        amount = float(item.get("amount", 0))
        total_expenses += amount
        records.append({
            "date": item.get("date"),
            "amount": amount,
            "category": item.get("category"),
            "description": item.get("description"),
        })

    summary = {
        "user_id": user_id,
        "total_expenses": total_expenses,
        "num_records": len(items),
        "records": records,
    }

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",  # CORS
            "Access-Control-Allow-Methods": "POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": json.dumps(summary)
    }

def get_summary_for_all():
    response = table.scan()
    items = response.get("Items", [])

    summary = {}
    for item in items:
        uid = item["user_id"]
        amount = float(item.get("amount", 0))

        if uid not in summary:
            summary[uid] = {
                "user_id": uid,
                "total_expenses": 0,
                "num_records": 0
            }

        summary[uid]["total_expenses"] += amount
        summary[uid]["num_records"] += 1

    return {
        "statusCode": 200,
        "headers": {
            "Access-Control-Allow-Origin": "*",  # CORS
            "Access-Control-Allow-Methods": "POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        "body": json.dumps(list(summary.values()))
    }
