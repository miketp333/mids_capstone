import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import '../product.css';
import { TrainingAudios } from './TrainingAudios';
import { PredictionAudios } from './PredictionAudios';

class Audios extends React.Component {
  render() {
    return (
      <div>
        <h3>Album: {this.props.albumName}</h3>
        <br />
        <TrainingAudios albumName={this.props.albumName} />
        <br />
        <PredictionAudios albumName={this.props.albumName} />
        <br />
        <div className="row">
          <button className="btn btn-primary" onClick={this.props.resetAlbum}>
            Back To Albums
          </button>
        </div>
      </div>
    );
  }
}

export {
  Audios
}