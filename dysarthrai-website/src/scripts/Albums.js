import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import '../product.css';

class Albums extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      newAlbumInput: '',
      albums: [],
      message: ''
    }
    this.createAlbum = this.createAlbum.bind(this);
    this.pullAlbumNames = this.pullAlbumNames.bind(this);
    this.pullAlbumNames();
  }

  createAlbum() {
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
    var albumName = this.state.newAlbumInput.trim();
    let that = this;
    if (!albumName) {
      return alert('Album names must contain at least one non-space character.')
    }
    if (albumName.indexOf('/') !== -1) {
      return alert('Album names cannot contain slashes.')
    }
    var albumKey = encodeURIComponent(albumName) + '/';
    s3.headObject({Key: albumKey}, function (err, data) {
      if (!err) {
        return alert('Album already exists.');
      }
      if (err.code !== 'NotFound') {
        return alert('There was an error creating your album: '+ err.message);
      }
      s3.putObject({Key: albumKey}, function(err, data) {
        if (err) {
          return alert('There was an error creating your album: ' + err.message);
        }
        alert('Successfully created album.');
        that.setState({newAlbumInput: ''});
        that.pullAlbumNames();
      });
    });
  }

  deleteAlbum(albumName) {
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
    var albumKey = encodeURIComponent(albumName) + '/';
    let that = this;
    s3.listObjects({Prefix: albumKey}, function(err, data) {
      if (err) {
        return alert('There was an error deleting your ablum: ', err.message);
      }
      var objects = data.Contents.map(function(object) {
        return {Key: object.Key};
      });
      s3.deleteObjects({
        Delete: {Objects: objects, Quiet: true}
      }, function (err, data) {
        if (err) {
          return alert('There was an error deleting your album: ', err.message);
        }
        alert('Successfully deleted album.');
        that.pullAlbumNames();
      })
    });
  }

  pullAlbumNames() {
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
    let that = this;
    s3.listObjects({Delimiter: '/'}, function (err, data) {
      if (err) {
        return alert('There was an error listing your albums: ' + err.message);
      } else {
        var albums = data.CommonPrefixes.map(function(commonPrefix) {
          var prefix = commonPrefix.Prefix;
          var albumName = decodeURIComponent(prefix.replace('/', ''));
          return albumName;
        })
        var message = albums.length ?
          'Click on an audio album name to view audio files, and click on the X to delete the album.' :
          'You do not have any albums. Please create album.'
        that.setState({
          albums: albums,
          message: message
        })
      }
    })
  }

  render() {
    return (
      <div>
        <ListAlbums albums={this.state.albums}
                    message={this.state.message}
                    deleteAlbum={(i) => this.deleteAlbum(i)}
                    selectAlbum={(i) => this.props.selectAlbum(i)}
        />
        <br />
        <div className="row">
          <div className="custom-file col-8">
            <input className="form-control"
                   type="text"
                   placeholder="New Album Name"
                   onChange={(event)=> this.setState({newAlbumInput: event.target.value})}
                   value={this.state.newAlbumInput}/>
          </div>
          <div className="col">
            <button className="btn btn-primary" onClick={this.createAlbum}>
              Create New Album
            </button>
          </div>
        </div>
      </div>
    );
  }
}

class ListAlbums extends React.Component {

  render() {
    return (
      <div>
        <h2>Audio Albums</h2>
        {this.props.message}
        <table className="table">
          <thead className="thead-light">
            <tr>
              <th scope="col">Delete</th>
              <th scope="col">Album Name</th>
            </tr>
          </thead>
          <tbody>
              {this.props.albums.map(albumName => 
                <tr key={albumName}>
                  <td onClick={() => this.props.deleteAlbum(albumName)}>X</td>
                  <td onClick={() => this.props.selectAlbum(albumName)}>{albumName}</td>
                </tr>
              )}
          </tbody>
        </table>
      </div>
    );
  }
}

export {
  Albums
}