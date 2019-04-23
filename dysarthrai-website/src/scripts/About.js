import React from 'react';
import favicon from '../images/favicon.png';
import frontend from '../images/frontend.png';
import backend from '../images/backend.png';
import webArchitecture from '../images/web_architecture.png';
import backgroundTable from '../images/background_table.png';
import MFCCs from '../images/MFCCs.png';
import DTW from '../images/DTW.png';
import shifting from '../images/shifting.png';
import 'bootstrap/dist/css/bootstrap.css';

class About extends React.Component {
  render() {
    return (
      <div>
        <br/>
        <h1> <img className="img-fluid" width="100" height="100" src={favicon} alt="DysarthrAI"/> DysarthrAI </h1>
        <h2>Communication assistant for people with Dysarthric speech</h2>

        <h3>About</h3>
        <p>
        Our mission is to improve the communication abilities of people with dysarthric speech. Dysarthria is a condition where muscles used for speech are weak and hard to control, resulting in slurred or slow speech that can be difficult to understand. Common causes of dysarthria include neurological disorders such as stroke, brain injury, brain tumors, and conditions that cause facial paralysis or tongue or throat muscle weakness.
        </p>
        <p>
        Our application, DysarthrAI, is a communication assistant for people with dysarthric speech. It enables these individuals to communicate phrases to others, regardless of their vocal abilities. The speaker-dependent model requires the user to store phrases they wish to communicate in the future, along with translations of those phrases. Once a phrase is saved, the user can speak the phrase into the app which will use our algorithm to provide a clear audio translation using text to speech.
        </p>

        <h4>Background</h4>
        <ul>
            <li>Dysarthria is a condition where muscles used for speech are weak and hard to control</li>
            <li>Results in slurred or slow speech that can be difficult to understand, or incomprehensible.</li>
            <li>Low-end estimates are that it affects:</li>
        </ul>
        <img className="img-fluid rounded mx-auto d-block" width="50%" height="auto" src={backgroundTable} alt="Background Table"/>
        <ul>
            <li>Typing is often difficult, and other communication tools are limited (alphabet or picture cards, trained mediator)</li>
            <li>Current automatic speech recognition (ASR) systems are trained on people who speak clearly, not people with impaired speech</li>
            <li>Typically result in word error rates (WER) of 50% or more when applied to dysarthric speech</li>
        </ul>
        <em>Project Goal:</em> Develop an ASR system that can recognize dysarthric speech
        <h4>Datasets</h4>
        <p>We used the TORGO dataset located <a href="http://www.cs.toronto.edu/~complingweb/data/TORGO/torgo.html" target="_blank" rel="noopener noreferrer">here</a>.</p>
        <p>
            The TORGO data is downloaded and unzipped to data/TORGO. This folder contains 8 folders, one for each person ("F01", "F03", etc.) - 3 females and 5 males. However, these directories are also added to the .gitignore file because they are also very large and would take up too much space within our repository.
        </p>
        <p>
            We performed a series of transformations and data cleaning as shown within the following notebooks:
        </p>
        <ol>
            <li>
                <a href="https://github.com/miketp333/mids_capstone/blob/master/0_load_dataset.ipynb" target="_blank" rel="noopener noreferrer">Download Dataset</a>
            </li>
            <li>
                <a href="https://github.com/miketp333/mids_capstone/blob/master/1_create_spectrograms.ipynb" target="_blank" rel="noopener noreferrer">Create Spectrograms</a>
            </li>
            <li>
                <a href="https://github.com/miketp333/mids_capstone/blob/master/2_create_index.ipynb" target="_blank" rel="noopener noreferrer">Create indexes</a>
            </li>
            <li>
                <a href="https://github.com/miketp333/mids_capstone/blob/master/4_create_MFCCs.ipynb" target="_blank" rel="noopener noreferrer">Create MFCCs</a>
            </li>
        </ol>
        <p>
            These notebooks also involve creating spectrograms and MFCCs so that we can further analyze the audio files and create models.
        </p>
        <p>
            We also ran our datasets on AWS Transcribe and the Google Translate API to see the accuracy of audio files from people with dysarthric speech. Our code is found within <a href="https://github.com/miketp333/mids_capstone/blob/master/3_compare_aws_google.ipynb" target="_blank" rel="noopener noreferrer">this notebook</a>.
        </p>

        <h4>Model Details</h4>
        <h5>MFCCs</h5>
        <p>Mel Frequency Cepstral Coefficients (MFCC's)</p>
        <ul>
            <li>Been found to outperform spectrograms in ASR systems</li>
            <li>Similar to log-scaled spectrogram with bucketing into distinct 'coefficients'</li>
            <li>Inspired by human hearing (we resolve sound in quasi-log frequency bands)</li>
        </ul>
        <img className="img-fluid rounded mx-auto d-block" width="50%" height="auto" src={MFCCs} alt="MFCCs"/>
        <h5>Dynamic Time Warping (DTW)</h5>
        <ul>
            <li>Measures similarity between two sequences, taking into account different production rates</li>
            <li>Does not require a lot of training data, unlike deep learning approaches such as CNN</li>
            <li>Dysarthric speech particularly prone to pauses or variable speed, making them good candidate for normalization using DTW</li>
            <li>The idea is to compare MFCC of input phrase to pre-recorded training examples using DTW to eliminate temporal distortion, then assigning the predicted label to the input phrase with the minimum difference.</li>
        </ul>
        <img className="img-fluid rounded mx-auto d-block" width="40%" height="auto" src={DTW} alt="DTW"/>
        <h5>DTW and "Shifting"</h5>
        <ul>
            <li>Review of examples the DTW algorithm gets wrong suggests an issue in the alignment of MFCC vectors.</li>
            <li>Even though the DTW algorithm is designed to handle sequences that are not perfectly aligned, it appears it can still sometimes struggle</li>
        </ul>
        <img className="img-fluid rounded mx-auto d-block" width="50%" height="auto" src={shifting} alt="DTW and Shifting"/>

        <h4>Website App Implementation</h4>
        <p>This website app allows a user to:
        <ul>
            <li>
                Upload audio files with translation label ("saved phrases") - one file for each phrase the user wishes the system to recognize
            </li>
            <li>
                Upload audio files without translation label ("requested phrase"), and request a translation from the system
            </li>
            <li>
                Provide translation validation (yes/no) back to the system
            </li>
        </ul>
        </p>
        <img className="img-fluid rounded mx-auto d-block" width="50%" height="auto" src={frontend} alt="Front End"/>
        <p>
            This allows us to run our model on new audio file datasets and gather more audio file training data to further improve our models.
        </p>
        <p>
            When an audio file with translation label (“saved phrase”) is added, the system will:
            <ul>
                <li>
                    Convert the audio to a MFCC vector, and store that vector in a database
                </li>
            </ul>
        </p>
        <p>
            When a “requested phrase” enters the system, the model will:
            <ul>
                <li>
                    Convert the audio to a MFCC vector
                </li>
                <li>
                    Calculate DTW distance between the vector and each "saved phrase" MFCC vector
                </li>
                <li>
                    Choose the “saved phrase” that is the closest match - minimum DTW distance
                </li>
                <li>
                    Display the translation label
                </li>
            </ul>
        </p>
        <img className="img-fluid rounded mx-auto d-block" width="50%" height="auto" src={backend} alt="Back End"/>
        <p>
            The website was created through various services from AWS:
        </p>
        <img className="img-fluid rounded mx-auto d-block" width="50%" height="auto" src={webArchitecture} alt="Website App Architecture"/>
        <h5>Backend for Model</h5>
        <p>
            The <a href="https://github.com/miketp333/mids_capstone/blob/master/models/dtw_dysarthric_speech_all-FINAL.ipynb" target="_blank" rel="noopener noreferrer">final model</a> that we've developed was implemented into a Docker container running a <a href="http://flask.pocoo.org/" target="_blank" rel="noopener noreferrer">Flask</a> application. This Flask application gathers the data from S3, runs the model, and updates the results in DynamoDB. Since Flask is written in Python, implementing the final model within our app became easier using Flask and Docker. The Docker container is then deployed to <a href="https://aws.amazon.com/fargate/" target="_blank" rel="noopener noreferrer">Fargate</a>, which allows us to run containers in the cloud without managing the infrastructure.
        </p>
        <h5>Frontend Website</h5>
        <p>
            The frontend website is built using <a href="https://reactjs.org/" target="_blank" rel="noopener noreferrer">React</a>, which is a javascript framework that helps build interactive applications. This website is then deployed to S3, which <a href="https://aws.amazon.com/route53/" target="_blank" rel="noopener noreferrer">Route 53</a> and <a href="https://aws.amazon.com/cloudfront/" target="_blank" rel="noopener noreferrer">Cloudfront</a> use to direct users whenever they access <i>dysarthrai.com</i>. This frontend website then uses S3 to upload, store, and manage audio files, DynamoDB to find and update audio labels, and Docker/Fargate to run the model that we've developed over the past couple of weeks.
        </p>
      </div>
    );
  }
}

export {
  About
}