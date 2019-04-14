import React from 'react';
import favicon from '../images/favicon.png';
import 'bootstrap/dist/css/bootstrap.css';

class About extends React.Component {
  render() {
    return (
      <div>
        <br/>
        <h1> <img className="img-fluid" width="100" height="100" src={favicon} alt="DysarthrAI"/> DysarthrAI </h1>
        <h2>Communication Assistant for Dysarthric Speech</h2>
        <h3>About</h3>
        <p>
        Our mission is to improve the communication abilities of people with dysarthric speech. Dysarthria is a condition where muscles used for speech are weak and hard to control, resulting in slurred or slow speech that can be difficult to understand. Common causes of dysarthria include neurological disorders such as stroke, brain injury, brain tumors, and conditions that cause facial paralysis or tongue or throat muscle weakness.
        </p>
        <p>
        Our application, DysarthrAI, is a communication assistant for people with dysarthric speech. It enables these individuals to communicate phrases to others, regardless of their vocal disabilities. The speaker-dependent model requires the user to store phrases they wish to communicate in the future, along with translations of those phrases. Once a phrase is saved, the user can speak the phrase into the app which will use our algorithm to provide a clear audio translation using text to speech.Our application, DysarthrAI, is a communication assistant for people with dysarthric speech. It enables these individuals to communicate phrases to others, regardless of their vocal disabilities. The speaker-dependent model requires the user to store phrases they wish to communicate in the future, along with translations of those phrases. Once a phrase is saved, the user can speak the phrase into the app which will use our algorithm to provide a clear audio translation using text to speech.
        </p>
      </div>
    );
  }
}

export {
  About
}