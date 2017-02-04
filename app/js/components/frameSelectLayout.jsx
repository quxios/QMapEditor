import React from 'react'
import { ipcRenderer } from 'electron'

export default class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: props.height,
      selected: props.index
    }
  }
  componentDidMount() {
    window.onresize = ::this.onResize;
  }
  onResize() {
    this.setState({ height: window.innerHeight })
  }
  getImgPath() {
    let filePath = this.props.data.filePath.split('\\');
    let file = filePath.pop().split('.');
    file[0] = encodeURIComponent(file[0]);
    file = file.join('.');
    filePath.push(file);
    filePath = filePath.join('\\');
    return this.props.data.projectPath + '\\' + filePath;
  }
  makeFrames() {
    let divs = [];
    const max = this.props.data.cols * this.props.data.rows;
    const w = this.props.data.width;
    const h = this.props.data.height;
    for (let i = 0; i < max; i++) {
      const x = i % this.props.data.cols;
      const y = Math.floor(i / this.props.data.cols);
      let style = {
        width: w - 2,
        height: h - 2,
        border: '1px solid #EEEEEE',
        position: 'absolute',
        top: y * h,
        left: x * w
      }
      if (i === this.state.selected) {
        style.border = '1px solid #29B6F6';
      }
      divs.push((
        <div style={style} key={i} onClick={this.onClick.bind(this, i)}/>
      ))
    }
    return divs;
  }
  onClick(index) {
    this.setState({ selected: index });
  }
  onOk() {
    ipcRenderer.sendSync('setFrameIndex', this.state.selected);
    window.close();
  }
  render() {
    const height = this.state.height - 35;
    const frames = this.makeFrames();
    return (
      <div>
        <div className='frameSelect' style={{ height, position: 'relative'}}>
          <img src={this.getImgPath()}/>
          { frames }
        </div>
        <div className='fixedRight'>
          <button onClick={::this.onOk}>
            Ok
          </button>
          <button onClick={window.close}>
            Cancel
          </button>
        </div>
      </div>
    )
  }
}
