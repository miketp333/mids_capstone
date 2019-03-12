import json
import boto3
import random
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError

# Helper class to convert a DynamoDB item to JSON.
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)

def lambda_handler(event, context):
    
    translations_list = ['what day is today',
    'how are you',
    'i am hungry',
    'i need to go to the bathroom',
    'i am tired',
    'i am happy',
    'i am sad',
    'the quick brown fox jumped over the lazy dog',
    'i want to go for a walk',
    'please turn on the tv'
        ]
    
    dynamodb = boto3.resource("dynamodb",
        region_name='us-east-1')
    translations_table = dynamodb.Table('audio_translations')
    
    for record in event['Records']:
        s3_key = record['s3']['object']['key']
        print('Found s3_key: '+s3_key)
        response = translations_table.put_item(
           Item={
                's3_file': s3_key,
                'translation': translations_list[random.randint(0,10)]
            }
        )
    
    return {
        'statusCode': 200,
        'body': json.dumps(response, indent=4, cls=DecimalEncoder)
    }
