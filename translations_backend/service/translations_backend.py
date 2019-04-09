from flask import Flask
from flask_cors import CORS
import boto3
import json
from boto3.dynamodb.conditions import Key, Attr

import translation_model

identity_pool_id = 'us-east-1:7259ba57-ba60-49fa-b786-13ef462028a5'
identity = boto3.client('cognito-identity',
    region_name='us-east-1')
identity_response = identity.get_id(IdentityPoolId=identity_pool_id)
response = identity.get_credentials_for_identity(IdentityId=identity_response['IdentityId'])
access_key = response['Credentials']['AccessKeyId']
secret_key = response['Credentials']['SecretKey']
session_token = response['Credentials']['SessionToken']

session = boto3.Session(
    aws_access_key_id=access_key,
    aws_secret_access_key=secret_key,
    aws_session_token=session_token
)

app = Flask(__name__)
CORS(app)

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)

@app.route('/')
def index():
    return 'Translation Index Page, Version 1.1'

@app.route('/translate/<path:s3_key>')
def translate(s3_key):
    try:
        album_name = s3_key.split('/')[0]

        s3 = session.resource("s3")
        dynamodb = session.resource("dynamodb",
            region_name='us-east-1')
        translations_table = dynamodb.Table('audio_translations')

        training_s3_files = translations_table.scan(
            FilterExpression=Key('s3_file').begins_with(album_name+'/') & Attr('is_training').eq(True)
        )

        training_filenames = []
        y_train = []

        for i in training_s3_files['Items']:
            try:
                filename = './'+i['s3_file'].split('/')[2]
                s3.Bucket('capstone-dysarthrai-website-guest-upload').download_file(i['s3_file'], filename)
                training_filenames.append(filename)
                y_train.append(i['actual_translation'])
            except:
                pass

        assert len(training_filenames) == len(y_train)

        test_filename = './'+s3_key.split('/')[2]
        s3.Bucket('capstone-dysarthrai-website-guest-upload').download_file(s3_key, test_filename)
        test_s3_info = translations_table.query(KeyConditionExpression=Key('s3_file').eq(s3_key))

        x_train, x_test, train_len, test_len = translation_model.generate_mfcc_lists(training_filenames, [test_filename])

        assert len(x_train) == len(y_train)

        master_dist = translation_model.calc_dtw(x_train, x_test, train_len, test_len, radius=1)
        prediction = translation_model.prediction(master_dist, y_train, test_len)
    except:
        prediction = ['Unknown Phrase']

    response = translations_table.update_item(
        Key={
            's3_file': s3_key
        },
        UpdateExpression="SET pred_translation = :translation",
        ExpressionAttributeValues={
            ':translation': prediction[0],
        },
        ReturnValues="UPDATED_NEW"
        )

    return json.dumps(response, indent=4, cls=DecimalEncoder)

# Run the service on the local server it has been deployed to,
# listening on port 8080.
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)















