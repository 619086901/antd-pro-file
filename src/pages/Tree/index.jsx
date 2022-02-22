import { Tree } from 'antd';
import { Component } from 'react';
import styles from './index.less';

function lastIndex(path) {
  return path.lastIndexOf('\\') + 1;
}

function getPath(path) {
  return path.slice(lastIndex(path), path.length);
}

const getFetch = async (url) => {
  let res = await fetch(url);
  let data = await res.json();
  return data;
};

let treeData = [
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

  fn = () => {
    getFetch(`http://localhost:9997/select_ls`).then((data) => {
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
      console.log(getItem);
      treeData = getItem;
      this.setState({
        hidden: true,
      });
    });
  };

  treeRightClick = (e) => {
    console.log(e);
    this.setState({
      display: 'block',
      rightClickNodeTreeItem: {
        pageX: e.event.pageX,
        pageY: e.event.pageY,
        folder: e.node.parent,
        name: e.node.title,
      },
    });
  };

  getTreeRightClickMenu = () => {
    const { pageX, pageY, id } = { ...this.state.rightClickNodeTreeItem };

    const tmpState = {
      position: 'absolute',
      left: `${pageX - 60}px`,
      top: `${pageY - 60}px`,
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
    const res = await fetch(`http://localhost:9997/download`, {
      method: 'POST',
      body: JSON.stringify({
        name: key,
      }),
      headers: new Headers({
        'Content-Type': 'application/json',
      }),
    });
    const data = await res.blob();
    const blobUrl = window.URL.createObjectURL(data);
    this.down(blobUrl, key.name);
  };

  down = (blobUrl, key) => {
    let a = document.createElement('a');
    a.download = `${key}`;
    a.href = blobUrl;
    a.click();
    window.open();
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
        <Tree
          style={{ 'max-height': 'none' }}
          treeData={treeData}
          height={233}
          onRightClick={this.treeRightClick}
          onClick={this.DropFn}
        />
        {this.getTreeRightClickMenu()}
      </div>
    ) : (
      <div>
        <Tree />
      </div>
    );
  }
}

export default TreeC;
