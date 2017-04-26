import React from 'react'
import { ipcRenderer } from 'electron'

export default class Layout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: props.height,
      selected: props.data.index
    }
  }
  componentDidMount() {
    window.onresize = ::this.onResize;
  }
  onResize() {
    this.setState({ height: window.innerHeight });
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
    const w = this.props.data.width / this.props.data.cols;
    const h = this.props.data.height / this.props.data.rows;
    for (let i = 0; i < max; i++) {
      const x = i % this.props.data.cols;
      const y = Math.floor(i / this.props.data.cols);
      let style = {
        width: w,
        height: h,
        top: y * h,
        left: x * w
      }
      let clss = 'index';
      if (i === this.state.selected) {
        clss += ' selected'
      }
      divs.push((
        <div
          key={i}
          className={clss}
          style={style}
          onClick={this.onClick.bind(this, i)}
        />
      ))
    }
    return divs;
  }
  onClick(index) {
    this.setState({ selected: index });
  }
  onOk = () => {
    ipcRenderer.sendSync('setFrameIndex', this.state.selected);
    window.close();
  }
  render() {
    const frames = this.makeFrames();
    const style = {
      height: this.state.height - 35,
      position: 'relative'
    }
    return (
      <div>
        <div className='frameSelect' style={style}>
          <img src={this.getImgPath()}/>
          { frames }
        </div>
        <div className='fixedRight'>
          <button onClick={this.onOk}>
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
