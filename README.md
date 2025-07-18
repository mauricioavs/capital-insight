# Capital Insight - Serverless App

A simple serverless application to analyze personal expenses, featuring a backend built with AWS Lambda and DynamoDB, and a frontend developed using React and Vite.

## Features

- Simulate upload CSV files to Amazon S3.
- Automatic processing triggered by AWS Lambda.
- Store expenses inside DynamoDB.
- Retrieve information.

## Technologies

- Python 3.11
- AWS Lambda (with AWS SAM)  
- DynamoDB (LocalStack)

## Steps to test locally

1. Run LocalStack to emulate AWS services locally:

`docker run -d --name localstack -p 4566:4566 -p 4571:4571 localstack/localstack`

Or initialize current one:

`docker start localstack`

2. Create a DynamoDB table in LocalStack:

```
aws --endpoint-url=http://localhost:4566 dynamodb create-table \
  --table-name expenses \
  --attribute-definitions AttributeName=user_id,AttributeType=S AttributeName=date,AttributeType=S \
  --key-schema AttributeName=user_id,KeyType=HASH AttributeName=date,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
  ```

Example output:
```
{
    "TableDescription": {
        "AttributeDefinitions": [
            {
                "AttributeName": "user_id",
                "AttributeType": "S"
            },
            {
                "AttributeName": "timestamp",
                "AttributeType": "S"
            }
        ],
        "TableName": "expenses",
        "KeySchema": [
            {
                "AttributeName": "user_id",
                "KeyType": "HASH"
            },
            {
                "AttributeName": "timestamp",
                "KeyType": "RANGE"
            }
        ],
        "TableStatus": "ACTIVE",
        "CreationDateTime": "2025-07-16T00:31:09.171000-06:00",
        "ProvisionedThroughput": {
            "LastIncreaseDateTime": "1969-12-31T18:00:00-06:00",
            "LastDecreaseDateTime": "1969-12-31T18:00:00-06:00",
            "NumberOfDecreasesToday": 0,
            "ReadCapacityUnits": 0,
            "WriteCapacityUnits": 0
        },
        "TableSizeBytes": 0,
        "ItemCount": 0,
        "TableArn": "arn:aws:dynamodb:us-east-1:000000000000:table/expenses",
        "TableId": "0776fb6e-d958-4aff-813e-3d8481929703",
        "BillingModeSummary": {
            "BillingMode": "PAY_PER_REQUEST",
            "LastUpdateToPayPerRequestDateTime": "2025-07-16T00:31:09.171000-06:00"
        },
        "DeletionProtectionEnabled": false
    }
}
```

3. Build your SAM application after any code changes:

```
sam build
```

4. Run the local API gateway to expose your Lambdas as REST endpoints:

```
sam local start-api
```

5. Install node version 20:

```
nvm install 20
nvm use 20
```

6. Install dependencies in package.json:
```
cd frontend
npm install
```

7. Run node server

```
npm run dev
```


# DynamoDB useful commands

1. Delete DynamoDB table:

```
aws --endpoint-url=http://localhost:4566 dynamodb delete-table --table-name expenses
```

8. Verify that the data was inserted into the DynamoDB table:

```
aws dynamodb scan --table-name expenses   --endpoint-url=http://localhost:4566
```

```
Example output:

{
    "Items": [
        {
            "amount": {
                "N": "20.5"
            },
            "category": {
                "S": "food"
            },
            "user_id": {
                "S": "demo-user"
            },
            "timestamp": {
                "S": "2024-07-01"
            }
        },
        {
            "amount": {
                "N": "15"
            },
            "category": {
                "S": "transport"
            },
            "user_id": {
                "S": "demo-user"
            },
            "timestamp": {
                "S": "2024-07-02"
            }
        },
        {
            "amount": {
                "N": "12.3"
            },
            "category": {
                "S": "food"
            },
            "user_id": {
                "S": "demo-user"
            },
            "timestamp": {
                "S": "2024-07-03"
            }
        }
    ],
    "Count": 3,
    "ScannedCount": 3,
    "ConsumedCapacity": null
}
```


# SAM useful commands

1. Invoke the SAM function locally to summary the data inside DynamoDB:

```
sam local invoke GetSummaryFunction
```

Example output:

```
No current session found, using default AWS::AccountId                                                                                                                                        
Invoking handler.lambda_handler (python3.11)                                                                                                                                                  
Local image is up-to-date                                                                                                                                                                     
Using local image: public.ecr.aws/lambda/python:3.11-rapid-x86_64.                                                                                                                            
                                                                                                                                                                                              
Mounting /home/mauricio/Desktop/capital-insight/.aws-sam/build/GetSummaryFunction as /var/task:ro,delegated, inside runtime container                                                         
START RequestId: 0d4549a3-8d20-4a0f-9f4e-78e9b8dfa720 Version: $LATEST
END RequestId: e1708faa-71eb-4150-b817-0b1d052b8ffd
REPORT RequestId: e1708faa-71eb-4150-b817-0b1d052b8ffd	Init Duration: 0.03 ms	Duration: 194.63 ms	Billed Duration: 195 ms	Memory Size: 128 MB	Max Memory Used: 128 MB	
{"statusCode": 200, "headers": {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type"}, "body": "[{\"user_id\": \"user_2\", \"total_expenses\": 80.75, \"num_records\": 2}, {\"user_id\": \"user_3\", \"total_expenses\": 215.0, \"num_records\": 2}, {\"user_id\": \"user_1\", \"total_expenses\": 200.7, \"num_records\": 3}]"}
```

2. (Optional) Run the local API gateway to expose your Lambdas as REST endpoints:

```
sam local start-api
```

3. Query the summary endpoint from your local API:

```
curl http://127.0.0.1:3000/summary
```
