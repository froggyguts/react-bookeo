import React from 'react'
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom'
import Spinner from 'react-spinner'


const DEFAULT_WAIT_MESSAGE = "Loading in progress..."

const Loading = ({ waitMessage }) => (
  <div>
    <div>{waitMessage}</div>
    <br />
    <Spinner />
  </div>
)

const containerStyle = {
  textAlign: 'center',
  margin: '2em auto'
}

const loadScript = (url, cb, timeout=1000) => {
  const script = document.createElement("script")
  script.type = "text/javascript"
  script.src = url
  script.onload = () => setTimeout(() => {
    // ensure bookeo started
    var bookeoContentLoaded = typeof axiomct_div !== "undefined" && axiomct_div && axiomct_div.querySelectorAll('iframe').length;
    if(!bookeoContentLoaded && axiomct_spinner === null) {
      // axiomct_spinner is null when lib already loaded but onload not triggered
      axiomct_onload()
    }
    if(cb) {
      cb()
    }
  }, timeout)
  return script;
}

class BookeoWidget extends React.Component {
  state = {
    loading: true
  }
  componentDidMount() {
    this.loadBookeo()
  }
  componentWillUnmount() {
    this.cleanup()
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.url !== nextProps.url) {
      // reload only if different widget url
      this.cleanup()
      this.setState({ loading: true }, this.loadBookeo)
    }
  }
  cleanup = () => {
    // cleanup scripts
    ReactDOM.findDOMNode(this).querySelectorAll("script[src*='bookeo.com']").forEach(node => node.parentElement.removeChild(node));
    if (typeof axiomct_div !== 'undefined') {
      axiomct_div.parentElement.removeChild(axiomct_div)
      axiomct_div = undefined;
    }
    if (typeof axiomct_project !== 'undefined') {
      axiomct_project = undefined;
    }
    if (typeof axiomct_loadStarted !== 'undefined') {
      axiomct_loadStarted = false;
    }
  }
  loadBookeo = () => {
    const script = loadScript(this.props.url, () => {
      this.setState({
        loading: false
      });
    });
    ReactDOM.findDOMNode(this).appendChild(script)
  }
  render() {
    return (
      <div style={ containerStyle }>
        { this.state.loading && <Loading waitMessage={ this.props.waitMessage || DEFAULT_WAIT_MESSAGE } /> }
      </div>
    )
  }
}

BookeoWidget.propTypes = {
  // widget url, as defined in bookeo parameters
  url: PropTypes.string.isRequired,
  waitMessage: PropTypes.string
}

export default BookeoWidget