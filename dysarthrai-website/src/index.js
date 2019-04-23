import React from 'react';
import ReactDOM from 'react-dom';
import { About } from './scripts/About';
import { Albums } from './scripts/Albums';
import { Audios } from './scripts/Audios';
import { Team } from './scripts/Team';
import favicon from './images/favicon.png';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTab: '',
      selectedAlbum: ''
    }
    this.selectAlbum = this.selectAlbum.bind(this);
    this.selectTab = this.selectTab.bind(this);
  }

  selectAlbum(albumName) {
    this.setState({selectedAlbum: albumName});
  }

  resetAlbum() {
    this.setState({selectedAlbum: '', selectedTab: ''});
  }

  selectTab(tabName) {
    this.setState({selectedTab: tabName});
  }

  componentDidMount(){
    document.title = "DysarthrAI"
  }
  
  render() {
    return (
      <div>
        <TopNavBar resetAlbum={() => this.resetAlbum()}
                selectTab={(i) => this.selectTab(i)}
        />
        <div className="container">
          {this.state.selectedTab === '' && 
            <Translate selectAlbum={(i) => this.selectAlbum(i)}
                       resetAlbum={() => this.resetAlbum()}
                       selectedAlbum={this.state.selectedAlbum}
            />
          }
          {this.state.selectedTab === 'about' &&
            <About
            />
          }
          {this.state.selectedTab === 'team' &&
            <Team
            />
          }
        </div>
      </div>
    );
  }
}

class TopNavBar extends React.Component {
  render() {
    return (
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#" onClick={this.props.resetAlbum}>
          <img className="img-fluid mr-2" width="20" height="20" src={favicon} alt="DysarthrAI"/>
          <strong>DysarthrAI</strong>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mr-auto">
            <Nav.Link href="#translations" onClick={this.props.resetAlbum}>Get Translations</Nav.Link>
            <Nav.Link href="#about" onClick={() => this.props.selectTab('about')}>About</Nav.Link>
            <Nav.Link href="#team" onClick={() => this.props.selectTab('team')}>Team</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

class Translate extends React.Component {
  render() {
    return (
        <div>
          <br/>
          <h1> <img className="img-fluid" width="100" height="100" src={favicon} alt="DysarthrAI"/> DysarthrAI </h1>
          <h2>Communication assistant for people with Dysarthric speech</h2>
          {
            this.props.selectedAlbum === '' && 
            <Albums selectAlbum={(i) => this.props.selectAlbum(i)}/>
          }
          {
            this.props.selectedAlbum !== '' && 
            <Audios albumName={this.props.selectedAlbum}
                    resetAlbum={() => this.props.resetAlbum()}
            />
          }
          
        </div>
    );
  }
}

ReactDOM.render(
  <App />,
  document.getElementById('root')
  );