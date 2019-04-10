import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import '../product.css';

class TrainingAudios extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputFile: {name: 'Choose file'},
      inputText: ''
    }
    this.pullAudioNames = this.pullAudioNames.bind(this);
    this.addAudio = this.addAudio.bind(this);
    this.pullAudioNames();
  }

  pullAudioNames() {
    var albumBucketName = 'capstone-dysarthrai-website-guest-upload';
    var bucketRegion = 'us-east-1';
    var IdentityPoolId = 'us-east-1:7259ba57-ba60-49fa-b786-13ef462028a5';
    var AWS = require('aws-sdk');
    AWS.config.update({
      region: bucketRegion,
      credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IdentityPoolId
      })
    });
    var s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      params: {Bucket: albumBucketName}
    });
    var dynamodb = new AWS.DynamoDB({
      apiVersion: '2012-08-10'
    });
    let that = this;
    var albumAudiosKey = encodeURIComponent(this.props.albumName) + '//';
    s3.listObjects({Prefix: albumAudiosKey}, function(err, data) {
      if (err) {
        return alert('There was an error viewing your album: ' + err.message);
      }
      // 'this' references the AWS.Response instance that represents the response
      var audios = data.Contents.map(function(audio) {
        var audioKey = audio.Key;
        return audioKey;
      });
      for (let i = 0; i < audios.length; i++) {
        let params = {
          TableName: 'audio_translations',
          Key: {
            's3_file': {S: audios[i]}
          }
        };
        dynamodb.getItem(params, function(err, data) {
          if (err) {
            console.log("Error", err);
          } else {
            try {
              let obj = {};
              obj[audios[i]] = data.Item.actual_translation.S;
              that.setState(obj);
            }
            catch(err) {
              let obj = {};
              obj[audios[i]] = 'Audio File Uploaded...'
            }
          }
        });
      }
    })
  }

  deleteAudio(audioName) {
    var albumBucketName = 'capstone-dysarthrai-website-guest-upload';
    var bucketRegion = 'us-east-1';
    var IdentityPoolId = 'us-east-1:7259ba57-ba60-49fa-b786-13ef462028a5';
    var AWS = require('aws-sdk');
    AWS.config.update({
      region: bucketRegion,
      credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IdentityPoolId
      })
    });
    var s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      params: {Bucket: albumBucketName}
    });
    var dynamodb = new AWS.DynamoDB({
      apiVersion: '2012-08-10'
    });

    let that = this;

    let params = {
      TableName: 'audio_translations',
      Key: {
        's3_file': {S: audioName}
      }
    }

    dynamodb.deleteItem(params, function(err, data) {
      if (err) {
        return alert('There was an error deleting the audio log: ', err.message);
      } else {
        s3.deleteObject({Key: audioName}, function(err, data) {
          if (err) {
            return alert('There was an error deleting your audio: ', err.message);
          }
          alert('Successfully deleted audio.');
          let obj = {}
          obj[audioName] = undefined
          that.setState(obj)
          that.pullAudioNames();
        });
      }
    });
  }

  addAudio() {
    var albumBucketName = 'capstone-dysarthrai-website-guest-upload';
    var bucketRegion = 'us-east-1';
    var IdentityPoolId = 'us-east-1:7259ba57-ba60-49fa-b786-13ef462028a5';
    var AWS = require('aws-sdk');
    AWS.config.update({
      region: bucketRegion,
      credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: IdentityPoolId
      })
    });
    var s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      params: {Bucket: albumBucketName}
    });
    var dynamodb = new AWS.DynamoDB({
      apiVersion: '2012-08-10'
    });

    var file = this.state.inputFile
    if (file.name === 'Choose file') {
      return alert('Please choose a file to upload first, and the filename should not be named "Choose file" :)')
    }
    var fileName = file.name;
    var albumAudiosKey = encodeURIComponent(this.props.albumName) + '//';
    var audioKey = albumAudiosKey + fileName;
    let that = this;

    let params = {
      TableName: 'audio_translations',
      Item: {
        's3_file': {S: audioKey},
        'album_name': {S: this.props.albumName},
        'actual_translation': {S: this.state.inputText},
        'is_training': {BOOL: true}
      }
    };

    console.log(params)

    dynamodb.putItem(params, function(err, data) {
      if (err) {
        return alert('There was an error logging your audio: ', err.message);
      } else {
        s3.upload({
          Key: audioKey,
          Body: file,
          ACL: 'public-read'
        }, function(err, data) {
          if (err) {
            return alert('There was an error uploading your audio: ', err.message);
          }
          let obj = {};
          obj[audioKey] = 'Audio File Uploaded...';
          that.setState(obj);
          alert('Successfully uploaded audio.');
          that.pullAudioNames();
        });
      }
    });
  }

  render() {
    return (
      <div>
        <TrainingAudiosList albumName={this.props.albumName}
                            translations={this.state}
                            deleteAudio={(i) => this.deleteAudio(i)} />
        <div className="row">
          <div className="container">
            <div className="custom-file">
              <input type="file"
                     className="custom-file-input"
                     id="trainaudioupload"
                     accept="audio/*"
                     onChange={(event) => this.setState({inputFile: event.target.files[0]})}
              />
              <label className="custom-file-label"
                     htmlFor="trainaudioupload"
                     id="trainaudiouploadlabel">{this.state.inputFile.name}</label>
            </div>
          </div>
        </div>
        <br />
        <div className="row">
          <div className="custom-file col-8">
            <input className="form-control"
                   type="text"
                   placeholder="Insert Actual Translation"
                   onChange={(event)=> this.setState({inputText: event.target.value})}
                   value={this.state.inputText}/>
          </div>
          <div className="col">
            <button className="btn btn-info"
                    id="addtrainaudio"
                    onClick={this.addAudio} >
              Add Training Audio
            </button>
          </div>
        </div>
      </div>
    );
  }
}

class TrainingAudiosList extends React.Component {
  render() {
    var clickStyle = {  
      cursor: 'pointer'
    };

    let albumAudiosKey = encodeURIComponent(this.props.albumName) + '//';
    let items = []
    for (let s3_key in this.props.translations) {
      if (s3_key !== 'inputFile'
          && s3_key !== 'inputText'
          && typeof this.props.translations[s3_key] !== 'undefined') {
        items = [...items, s3_key]
      }
    } 
    return (
        <div>
          <h4>Audio Files for Training</h4>
          <p>{items.length ? 'Click on the X to delete the audio.' : 'You do not have any audios in this album. Please add audios.'}</p>
          <table className="table table-hover">
            <thead className="thead-light">
              <tr>
                <th scope="col">Delete</th>
                <th scope="col">File Name</th>
                <th scope="col">Actual Translation</th>
              </tr>
            </thead>
            <tbody>
              {items.map(audioName =>
                 <tr key={audioName.replace(albumAudiosKey, '')}>
                  <td style={clickStyle} onClick={() => this.props.deleteAudio(audioName)}><b>X</b></td>
                  <td>{audioName.replace(albumAudiosKey, '')}</td>
                  <td>{this.props.translations[audioName]}</td>
                 </tr>           
              )}
            </tbody>
          </table>
        </div>
      )
  }
}

export {
  TrainingAudios
}