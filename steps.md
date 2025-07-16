# steps to test locally

1. Run LocalStack to emulate AWS services locally:

docker run -d --name localstack -p 4566:4566 -p 4571:4571 localstack/localstack

2. Create an S3 bucket in LocalStack:

aws --endpoint-url=http://localhost:4566 s3 mb s3://my-local-bucket

Example output:

make_bucket: my-local-bucket

3. Create a DynamoDB table in LocalStack:

aws --endpoint-url=http://localhost:4566 dynamodb create-table \
  --table-name expenses \
  --attribute-definitions AttributeName=user_id,AttributeType=S AttributeName=timestamp,AttributeType=S \
  --key-schema AttributeName=user_id,KeyType=HASH AttributeName=timestamp,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST

Example output:

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

4. Build your SAM application after any code changes:

sam build

5. Upload the CSV file to the S3 bucket:

aws --endpoint-url=http://localhost:4566 s3 cp sample_data/expenses.csv s3://my-local-bucket/

Example output:

upload: sample_data/expenses.csv to s3://my-local-bucket/expenses.csv

6. Create the S3 event JSON file (s3_event.json) simulating the file upload event:

{
  "Records": [
    {
      "s3": {
        "bucket": {
          "name": "my-local-bucket"
        },
        "object": {
          "key": "expenses.csv"
        }
      }
    }
  ]
}


7. Invoke the SAM function locally to process the CSV and insert data into DynamoDB:

sam local invoke ProcessCSVFunction -e s3_event.json

Example output:

No current session found, using default AWS::AccountId                                                                                                                                  
Invoking handler.lambda_handler (python3.11)                                                                                                                                            
Local image is up-to-date                                                                                                                                                               
Using local image: public.ecr.aws/lambda/python:3.11-rapid-x86_64.                                                                                                                      
                                                                                                                                                                                        
Mounting /home/mauricio/Desktop/capital-insight/.aws-sam/build/ProcessCSVFunction as /var/task:ro,delegated, inside runtime container                                                   
START RequestId: 96c5f266-b03e-4a2f-8278-7e7e657e15b9 Version: $LATEST
END RequestId: ccfac705-edd1-4f94-8d73-65e1ad2942e5
REPORT RequestId: ccfac705-edd1-4f94-8d73-65e1ad2942e5	Init Duration: 0.04 ms	Duration: 437.29 ms	Billed Duration: 438 ms	Memory Size: 128 MB	Max Memory Used: 128 MB	
{"statusCode": 200, "message": "Archivo procesado"}


8. Verify that the data was inserted into the DynamoDB table:

aws dynamodb scan --table-name expenses   --endpoint-url=http://localhost:4566

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


9. Invoke the SAM function locally to summary the data inside DynamoDB:

sam local invoke GetSummaryFunction

Example output:

No current session found, using default AWS::AccountId                                                                                                                                  
Invoking handler.lambda_handler (python3.11)                                                                                                                                            
Local image is up-to-date                                                                                                                                                               
Using local image: public.ecr.aws/lambda/python:3.11-rapid-x86_64.                                                                                                                      
                                                                                                                                                                                        
Mounting /home/mauricio/Desktop/capital-insight/.aws-sam/build/GetSummaryFunction as /var/task:ro,delegated, inside runtime container                                                   
START RequestId: 63478984-0953-4895-8093-1bfd5c0ef61d Version: $LATEST
END RequestId: 50bacbe3-da18-4ed2-aca1-8348208f1b62
REPORT RequestId: 50bacbe3-da18-4ed2-aca1-8348208f1b62	Init Duration: 0.03 ms	Duration: 284.24 ms	Billed Duration: 285 ms	Memory Size: 128 MB	Max Memory Used: 128 MB	
{"statusCode": 200, "headers": {"Content-Type": "application/json"}, "body": "{\"summary\": {\"food\": 32.8, \"transport\": 15.0, \"entertainment\": 0.0}, \"recommendations\": []}"}

10. (Optional) Run the local API gateway to expose your Lambdas as REST endpoints:

sam local start-api

11. Query the summary endpoint from your local API:

curl http://127.0.0.1:3000/summary
