import { Tree, message } from 'antd';
import { Component } from 'react';
import styles from './index.less';
import { fetchSelectLs, fetchDownload } from '../../api/index.js';

function lastIndex(path) {
  return path.lastIndexOf(`${PATH_PARENT}`) + 1;
}

function getPath(path) {
  return path.slice(lastIndex(path), path.length);
}

let resData = [
  {
    key: 'upload',
    title: '1',
    children: [
      {
        key: 'jpeg',
        title: '1',
      },
    ],
  },
];

class Data {
  constructor(props) {
    this.title = props.title;
    this.key = getPath(props.path);
    this.parent = getPath(props.path.slice(0, lastIndex(props.path) - 1));
  }
}

class TreeC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hidden: false,
      display: 'none',
      rightClickNodeTreeItem: {
        pageX: '',
        pageY: '',
        id: '',
        categoryName: '',
      },
    };
    this.fn();
  }

  fn = async () => {
    const res = await fetchSelectLs();
    const data = await res.json();
    let getItem = [];
    data.forEach((items) => {
      let item = new Data(items);
      function callback(item, children) {
        for (let value of children.values()) {
          let h = new Data(value);
          //是否是文件
          if (value.type === 'file') {
            item.children = [...item.children, h];
          } else {
            h.children = [];
            item.children = [...item.children, h];
            //文件夹
            callback(item.children[item.children.length - 1], value.children);
          }
        }
      }
      if (items.children) {
        item.children = [];
      }
      callback(item, items.children);
      getItem.push(item);
    });
    resData = getItem;
    this.setState({
      hidden: true,
    });
  };

  treeRightClick = (e) => {
    this.DropFn();
    if (e.node.parent === 'upload' || e.node.parent === 'nodeFileUpload') {
      message.error('请选择文件下载');
    } else {
      this.setState({
        display: 'block',
        rightClickNodeTreeItem: {
          pageX: e.event.currentTarget.offsetLeft + e.event.currentTarget.clientWidth,
          pageY: e.event.currentTarget.offsetTop + e.event.currentTarget.clientHeight,
          folder: e.node.parent,
          name: e.node.title,
        },
      });
    }
  };

  getTreeRightClickMenu = () => {
    const { pageX, pageY } = { ...this.state.rightClickNodeTreeItem };

    const tmpState = {
      position: 'absolute',
      left: `${pageX}px`,
      top: `${pageY}px`,
      display: this.state.display,
    };

    const menu = (
      <div style={tmpState} className={styles.tree}>
        <div
          onClick={() => this.download(this.state.rightClickNodeTreeItem)}
          className={styles.item}
        >
          下载
        </div>
      </div>
    );
    return this.state.rightClickNodeTreeItem == null ? '' : menu;
  };

  //下载文件
  download = async (key) => {
    const res = await fetchDownload(key);
    const data = await res.blob();
    const blobUrl = window.URL.createObjectURL(data);
    this.down(blobUrl, key.name);
  };

  down = (blobUrl, name) => {
    const a = document.createElement('a');
    a.download = `${name}`;
    a.href = blobUrl;
    a.click();
  };

  DropFn = () => {
    if (this.state.display !== 'none')
      this.setState({
        display: 'none',
      });
  };

  render() {
    const { hidden } = this.state;
    return hidden ? (
      <div onClick={this.DropFn}>
        <Tree treeData={resData} onRightClick={this.treeRightClick} onClick={this.DropFn} />
        {this.getTreeRightClickMenu()}
      </div>
    ) : (
      <div>
        <Tree treeData={resData} />
      </div>
    );
  }
}

export default TreeC;
