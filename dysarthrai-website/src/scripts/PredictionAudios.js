import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';

class PredictionAudios extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputFile: {name: 'Choose file'}
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
              if (typeof data.Item.is_training === 'undefined') {
                  obj[audios[i]] = data.Item.pred_translation.S;
                  that.setState(obj);
              }
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

    var file = this.state.inputFile
    if (file.name === 'Choose file') {
      return alert('Please choose a file to upload first, and the filename should not be named "Choose file" :)')
    }
    var fileName = file.name;
    var albumAudiosKey = encodeURIComponent(this.props.albumName) + '//';

    var audioKey = albumAudiosKey + fileName;
    let that = this;
    s3.upload({
      Key: audioKey,
      Body: file,
      ACL: 'public-read'
    }, function(err, data) {
      if (err) {
        return alert('There was an error uploading your audio: ', err.message);
      }
      const Http = new XMLHttpRequest();
      const url = 'https://api.dysarthrai.com/translate/'+audioKey;
      Http.open('GET', url);
      Http.send();
      Http.onreadystatechange=function() {
        if(this.readyState === 4) {
          // console.log(Http.responseText);
          that.pullAudioNames();
        }
      }
      let obj = {};
      obj[audioKey] = 'Please wait for a translation...';
      that.setState(obj);
      alert('Successfully uploaded audio.');
    });
  }

  render() {
    return (
      <div>
        <PredictionAudiosList albumName={this.props.albumName}
                              translations={this.state}
                              deleteAudio={(i) => this.deleteAudio(i)}
        />
        <div className="row">
          <div className="custom-file col-8">
            <input type="file"
                   className="custom-file-input"
                   id="predaudioupload"
                   accept="audio/*" 
                   onChange={(event) => this.setState({inputFile: event.target.files[0]})} />
            <label className="custom-file-label"
                   htmlFor="predaudioupload"
                   id="predaudiouploadlabel">{this.state.inputFile.name}</label>
          </div>
          <div className="col">
            <button className="btn btn-info"
                    id="addpredaudio"
                    onClick={this.addAudio}>
              Add Prediction Audio
            </button>
          </div>
        </div>
      </div>
    )
  }
}

class PredictionAudiosList extends React.Component {
  render() {
    let albumAudiosKey = encodeURIComponent(this.props.albumName) + '//';
    let items = []
    for (let s3_key in this.props.translations) {
      if (s3_key !== 'inputFile' && typeof this.props.translations[s3_key] !== 'undefined') {
        items = [...items, s3_key]
      }
    } 
    return (
        <div>
          <h4>Audio Files for Prediction</h4>
          <p>{items.length ? 'Click on the X to delete the audio.' : 'You do not have any audios in this album. Please add audios.'}</p>
          <table className="table table-hover">
            <thead className="thead-light">
              <tr>
                <th scope="col">Delete</th>
                <th scope="col">File Name</th>
                <th scope="col">Predicted Translation</th>
              </tr>
            </thead>
            <tbody>
            {items.map(audioName =>
               <tr key={audioName.replace(albumAudiosKey, '')}>
                <td style={{cursor: 'pointer', width: '7%'}} onClick={() => this.props.deleteAudio(audioName)}><b>X</b></td>
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
  PredictionAudios
}