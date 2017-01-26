import React from 'react'
import Manager from './../manager'

export default class MapProperties extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mapData: Manager.state.mapData
    }
    this.getStates = ::this.getStates;
  }
  componentWillMount() {
    Manager.on('UPDATE_STATE', this.getStates);
  }
  componentWillUnmount() {
    Manager.remove('UPDATE_STATE', this.getStates);
  }
  getStates(newStates) {
    const { mapData } = newStates;
    this.setState({ mapData });
  }
  render() {
    if (!this.state.mapData) return null;
    const { width, height } = this.state.mapData;
    return (
      <div className='block' style={this.props.style}>
        <h1 className='header'>Map Properties</h1>
        <div className='props'>
          <div className='half'>
            Width
          </div>
          <div className='half'>
           { width }
          </div>
          <div className='half'>
            Height
          </div>
          <div className='half'>
            { height }
          </div>
        </div>
      </div>
    )
  }
}
