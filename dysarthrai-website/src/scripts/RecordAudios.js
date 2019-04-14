import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import recordStream from './RecordStream';

const mediaSource = new MediaSource();
mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
let mediaRecorder;
let recordedBlobs;
let sourceBuffer;

function handleSourceOpen(event) {
  console.log('MediaSource opened');
  sourceBuffer = mediaSource.addSourceBuffer('audio/webm');
  console.log('Source buffer: ', sourceBuffer);
}

function handleDataAvailable(event) {
  if (event.data && event.data.size > 0) {
    recordedBlobs.push(event.data);
  }
}

class RecordAudios extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recordPrompt: 'Start Recording'
    }
    this.startRecording = this.startRecording.bind(this);
    this.recordAction = this.recordAction.bind(this);
  }

  // async function init(constraints) {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia(constraints);
  //     handleSuccess(stream);
  //   } catch (e) {
  //     console.error('navigator.getUserMedia error:', e);
  //     errorMsgElement.innerHTML = `navigator.getUserMedia error:${e.toString()}`;
  //   }
  // }

  // handleSourceOpen(event) {
  //   console.log('MediaSource opened');
  //   sourceBuffer = mediaSource.addSourceBuffer('audio/webm');
  //   console.log('Source buffer: ', sourceBuffer);
  // }

  // handleDataAvailable(event) {
  //   if (event.data && event.data.size > 0) {
  //     recordedBlobs.push(event.data);
  //   }
  // }

  // handleSuccess(stream) {
  //   recordButton.disabled = false;
  //   console.log('getUserMedia() got stream:', stream);
  //   window.stream = stream;

  //   const gumVideo = document.querySelector('video#gum');
  //   gumVideo.srcObject = stream;
  // }

  recordAction() {
    if (this.state.recordPrompt === 'Start Recording') {
      this.startRecording();
    }
    else if (this.state.recordPrompt === 'Stop Recording') {
      this.stopRecording();
    }
  }

  startRecording() {
    recordedBlobs = [];
    let options = {mimeType: 'audio/webm'};
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.error(`${options.mimeType} is not Supported`);
      options = {mimeType: ''};
    }
    try {
      mediaRecorder = new MediaRecorder(recordStream, options);
    } catch(e) {
      console.error('Exception while creating MediaRecorder: ', e);
      return;
    }
    console.log('Created MediaRecorder', mediaRecorder, 'with options', options);
    this.setState({recordPrompt: 'Stop Recording'});
    mediaRecorder.onstop = (event) => {
      console.log('Recorder stopped: ', event);
    }
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start(10);
    console.log('MediaRecorder started', mediaRecorder);
  }

  stopRecording() {
    mediaRecorder.stop();
    console.log('Recorded Blobs: ', recordedBlobs);
  }

  render() {
    return (
      <div>
        <button className="btn btn-info"
                id="addCustomAudio"
                onClick={this.recordAction}>
          { this.state.recordPrompt }
        </button>
      </div>
    );
  }
}

export {
	RecordAudios
}