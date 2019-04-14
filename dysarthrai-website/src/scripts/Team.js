import React from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import favicon from '../images/favicon.png';
import rich_img from '../images/rich.jpeg';
import mike_img from '../images/mike.jpeg';
import simon_img from '../images/simon.jpeg';
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLinkedin } from '@fortawesome/free-brands-svg-icons';

library.add(faLinkedin)

class Team extends React.Component {
  render () {
    return (
      <div>
        <br/>
        <h1> <img className="img-fluid" width="100" height="100" src={favicon} alt="DysarthrAI"/> DysarthrAI </h1>
        <h2>Communication Assistant for Dysarthric Speech</h2>
        <h3>The Team</h3>
        <br/>
        <p>The DysarthrAI team is comprised of three members from the capstone course within UC Berkeley's Master of Information and Data Science Capstone Course:</p>
        <br/>
        <div className="row">
          <div className="col">
            <img src={ simon_img }
                 style={{ height: 'auto', width: '200px' }}
                 className="rounded-circle mx-auto d-block"
                 alt="Simon Hodgkinson" />
            <br/>
            <h5 className="font-weight-bold text-center">Simon Hodgkinson</h5>
            <a href="https://www.linkedin.com/in/simon-hodgkinson/"
               target="_blank"
               rel="noopener noreferrer">
              <FontAwesomeIcon icon={ faLinkedin }
                               style={{height: 'auto', 'width': '25px', color: '#007bb6'}}
                               className="mx-auto d-block" />
            </a>
          </div>
          <div className="col">
            <img src={ mike_img }
                 style={{ height: 'auto', width: '200px' }}
                 className="rounded-circle mx-auto d-block"
                 alt="Michael Powers" />
            <br/>
            <h5 className="font-weight-bold text-center">Michael Powers</h5>
            <a href="https://www.linkedin.com/in/michael-powers-0552204b/"
               target="_blank"
               rel="noopener noreferrer">
              <FontAwesomeIcon icon={ faLinkedin }
                               style={{height: 'auto', 'width': '25px', color: '#007bb6'}}
                               className="mx-auto d-block" />
            </a>
          </div>
          <div className="col">
            <img src={ rich_img }
                 style={{ height: 'auto', width: '200px' }}
                 className="rounded-circle mx-auto d-block"
                 alt="Rich Ung" />
            <br/>
            <h5 className="font-weight-bold text-center">Rich Ung</h5>
            <a href="https://www.linkedin.com/in/ungrich/"
               target="_blank"
               rel="noopener noreferrer">
              <FontAwesomeIcon icon={ faLinkedin }
                               style={{height: 'auto', 'width': '25px', color: '#007bb6'}}
                               className="mx-auto d-block" />
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export {
  Team
}