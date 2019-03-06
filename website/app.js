var albumBucketName = 'capstone-dysarthrai-website-guest-upload';
var bucketRegion = 'us-east-1';
var IdentityPoolId = 'us-east-1:7259ba57-ba60-49fa-b786-13ef462028a5';
// var IdentityPoolId = '7259ba57-ba60-49fa-b786-13ef462028a5';

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

function listAlbums() {
  s3.listObjects({Delimiter: '/'}, function(err, data) {
    if (err) {
      return alert('There was an error listing your albums: ' + err.message);
    } else {
      var albums = data.CommonPrefixes.map(function(commonPrefix) {
        var prefix = commonPrefix.Prefix;
        var albumName = decodeURIComponent(prefix.replace('/', ''));
        return getHtml([
          '<tr>',
            '<th>',
              '<span onclick="deleteAlbum(\'' + albumName + '\')">X</span>',
            '</th>',
            '<th>',
              '<span onclick="viewAlbum(\'' + albumName + '\')">',
                albumName,
              '</span>',
            '</th>',
          '</tr>',
        ]);
      });
      var message = albums.length ?
        getHtml([
          '<p>Click on an album name to view it.</p>',
          '<p>Click on the X to delete the album.</p>'
        ]) :
        '<p>You do not have any albums. Please Create album.';
      var htmlTemplate = [
        '<h2>Albums</h2>',
        message,
        '<table>',
          getHtml(albums),
        '</table>',
        '<button onclick="createAlbum(prompt(\'Enter Album Name:\'))">',
          'Create New Album',
        '</button>'
      ]
      document.getElementById('app').innerHTML = getHtml(htmlTemplate);
    }
  });
}

function createAlbum(albumName) {
  albumName = albumName.trim();
  if (!albumName) {
    return alert('Album names must contain at least one non-space character.');
  }
  if (albumName.indexOf('/') !== -1) {
    return alert('Album names cannot contain slashes.');
  }
  var albumKey = encodeURIComponent(albumName) + '/';
  s3.headObject({Key: albumKey}, function(err, data) {
    if (!err) {
      return alert('Album already exists.');
    }
    if (err.code !== 'NotFound') {
      return alert('There was an error creating your album: ' + err.message);
    }
    s3.putObject({Key: albumKey}, function(err, data) {
      if (err) {
        return alert('There was an error creating your album: ' + err.message);
      }
      alert('Successfully created album.');
      viewAlbum(albumName);
    });
  });
}

function getTranslation(s3_url) {
  var params = {
    TableName: 'audio_translations',
    Key: {
      's3_file': {S: '0014.wav'}
    }
  };
  return dynamodb.getItem(params, function(err, data) {
    if (err) {
      console.log("Error", err);
    } else {
      console.log("Success", data.Item.translation.S);
      return data.Item.translation.S;
    }
  });
}

function viewAlbum(albumName) {
  var albumAudiosKey = encodeURIComponent(albumName) + '//';

  

  var audioSTR = getTranslation('0014.wav');

// https://api.dysarthrai.com/album?albumName=0014.wav

  console.log("1audiostr is", audioSTR.response)
  s3.listObjects({Prefix: albumAudiosKey}, function(err, data) {
    if (err) {
      return alert('There was an error viewing your album: ' + err.message);
    }
    // 'this' references the AWS.Response instance that represents the response
    var href = this.request.httpRequest.endpoint.href;
    var bucketUrl = href + albumBucketName + '/';

    var audios = data.Contents.map(function(audio) {
      var audioKey = audio.Key;
      var audioUrl = bucketUrl + encodeURIComponent(audioKey);
      return getHtml([
        '<tr>',
          '<th>',
            '<span onclick="deleteaudio(\'' + albumName + "','" + audioKey + '\')">',
              'X',
            '</span>',
          '</th>',
          '<th>',
            audioKey.replace(albumAudiosKey, ''),
          '</th>',
          '<th>',
            audioSTR,
          '</tr>'
        ]);
    });
    var message = audios.length ?
      '<p>Click on the X to delete the audio</p>' :
      '<p>You do not have any audios in this album. Please add audios.</p>';
    var htmlTemplate = [
      '<h2>',
        'Album: ' + albumName,
      '</h2>',
      message,
      '<div>',
        '<table>',
          getHtml(audios),
        '</table>',
      '</div>',
      '<input id="audioupload" type="file" accept="audio/*">',
      '<button id="addaudio" onclick="addaudio(\'' + albumName +'\')">',
        'Add audio',
      '</button>',
      '<button onclick="listAlbums()">',
        'Back To Albums',
      '</button>',
    ]
    document.getElementById('app').innerHTML = getHtml(htmlTemplate);
  });
}

function addaudio(albumName) {
  var files = document.getElementById('audioupload').files;
  if (!files.length) {
    return alert('Please choose a file to upload first.');
  }
  var file = files[0];
  var fileName = file.name;
  var albumAudiosKey = encodeURIComponent(albumName) + '//';

  var audioKey = albumAudiosKey + fileName;
  s3.upload({
    Key: audioKey,
    Body: file,
    ACL: 'public-read'
  }, function(err, data) {
    if (err) {
      return alert('There was an error uploading your audio: ', err.message);
    }
    alert('Successfully uploaded audio.');
    viewAlbum(albumName);
  });
}

function deleteaudio(albumName, audioKey) {
  s3.deleteObject({Key: audioKey}, function(err, data) {
    if (err) {
      return alert('There was an error deleting your audio: ', err.message);
    }
    alert('Successfully deleted audio.');
    viewAlbum(albumName);
  });
}

function deleteAlbum(albumName) {
  var albumKey = encodeURIComponent(albumName) + '/';
  s3.listObjects({Prefix: albumKey}, function(err, data) {
    if (err) {
      return alert('There was an error deleting your album: ', err.message);
    }
    var objects = data.Contents.map(function(object) {
      return {Key: object.Key};
    });
    s3.deleteObjects({
      Delete: {Objects: objects, Quiet: true}
    }, function(err, data) {
      if (err) {
        return alert('There was an error deleting your album: ', err.message);
      }
      alert('Successfully deleted album.');
      listAlbums();
    });
  });
}
