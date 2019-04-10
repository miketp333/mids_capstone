import React from 'react';
import ReactDOM from 'react-dom';
import { About } from './scripts/About';
import { Albums } from './scripts/Albums';
import { Audios } from './scripts/Audios';
import favicon from './images/favicon.png';

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
        <NavBar resetAlbum={() => this.resetAlbum()}
                selectTab={(i) => this.selectTab(i)}
        />
        <div className="container">
          {this.state.selectedTab == '' && 
          <Translate selectAlbum={(i) => this.selectAlbum(i)}
                     resetAlbum={() => this.resetAlbum()}
                     selectedAlbum={this.state.selectedAlbum}
          />}
          {this.state.selectedTab == 'about' &&
          <About
          />
          }
        </div>
      </div>
    );
  }
}

class NavBar extends React.Component {
  render() {
    return (
      <nav className="site-header sticky-top py-1">
        <div className="container d-flex flex-column flex-md-row justify-content-between">
          <a href="#" onClick={this.props.resetAlbum} className="navbar-brand d-flex align-items-center">
            <img className="img-fluid mr-2" width="20" height="20" src={favicon} />
            <strong>DysarthrAI</strong>
          </a>
          <a className="py-2 d-none d-md-inline-block" href="#" onClick={() => this.props.selectTab('')}>Get Translations</a>
          <a className="py-2 d-none d-md-inline-block" href="#" onClick={() => this.props.selectTab('about')}>About</a>
          <a className="py-2 d-none d-md-inline-block" href="#">Members</a>
        </div>
      </nav>
    );
  }
}

class Translate extends React.Component {
  render() {
    return (
        <div>
          <br/>
          <h1>DysarthrAI</h1>
          <h2>Communication Assistant for Dysarthric Speech</h2>
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