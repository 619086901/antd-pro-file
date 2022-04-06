import { useRef } from 'react';
import { message } from 'antd';
import ProTable from '@ant-design/pro-table';
import Index from './index';
import './index.less';
import { fetchDownload, fetchEditable, fetchSelect } from '../../api/index.js';

export default () => {
  const ref = useRef();
  // 手动刷新
  const reload = () => {
    ref.current.reload();
  };
  // 数据
  let filterDataSource = [];

  const columns = [
    {
      title: '文件名称',
      dataIndex: 'name',
      copyable: true,
      // 在编辑表格中是否可编辑
      ellipsis: true,
      tip: '标题过长会自动收缩',
      width: '20%',
      formItemProps: {
        rules: [
          {
            required: true,
            message: '此项为必填项',
          },
        ],
      },
    },
    {
      title: '时间',
      dataIndex: 'time',
      tip: '标题过长会自动收缩',
      width: '20%',
      search: false,
      sorter: (a, b) => a.time.replace(/[^0-9]/gi, '') - b.time.replace(/[^0-9]/gi, ''),
      // 不允许编辑
      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: '文件大小',
      dataIndex: 'size',
      tip: '标题过长会自动收缩',
      width: '10%',
      search: false,
      // 不允许编辑
      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: '文件夹',
      dataIndex: 'folder',
      tip: '标题过长会自动收缩',
      width: '10%',
      search: false,
      // 不允许编辑
      editable: (text, record, index) => {
        return false;
      },
    },
    {
      title: '操作',
      valueType: 'option',
      tip: '标题过长会自动收缩',
      width: '10%',
      render: (text, record, _, action) => [
        <a
          onClick={() => {
            preview(record);
          }}
        >
          预览
        </a>,
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.key);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={() => {
            download(filterDataSource.find((item) => item.key == record.key));
            reload();
          }}
        >
          下载
        </a>,
      ],
    },
  ];

  // 预览
  const preview = (data) => {
    let { folder, leftFileName, rightFileName } = data;
    window.open(`http://106.15.206.129:801/${folder}/${leftFileName}.${rightFileName}`);
  };
  // 对通过 request 获取的数据进行处理
  const postData = (data) => {
    return data;
  };

  const request = async (
    params = {
      pageSize: 10,
    },
    sorter,
    filter,
  ) => {
    const res = await fetchSelect();
    const json = await res.json();
    const dataSource = json.map((item, index) => {
      return {
        time: item.time,
        name: item.leftFileName,
        size: item.size,
        folder: item.folder,
        leftFileName: item.leftFileName,
        rightFileName: item.rightFileName,
        key: index, //给表单项设置唯一key
      };
    });

    //筛选
    if (params.name !== undefined) {
      const regex = new RegExp(params.name);
      filterDataSource = dataSource.filter((item) => {
        return regex.test(item.name);
      });
    } else {
      filterDataSource = dataSource;
    }

    // 返回数据
    const result = {
      data: filterDataSource,
      success: true,
      total: filterDataSource.length,
    };
    return Promise.resolve(result);
  };
  // 保存一行的时候触发;
  const onSave = async (index, newItem, Item, i) => {
    const param = {
      newName: `${newItem.name}.${newItem.rightFileName}`, // 新名称
      name: `${Item.name}.${Item.rightFileName}`, // 旧名称
      folder: Item.folder, //文件类型
    };
    const req = await fetchEditable(param);
    const data = await req.json();
    const { code, message: tishi } = data;
    switch (code) {
      case 200:
        message.success(tishi);
        break;
      case 400:
        message.error(tishi);
        break;
      default:
        message.error('保存失败');
        break;
    }
    reload();
  };

  // 下载
  /**
   *
   * @param {*} key 下载文件
   */
  const download = async (key) => {
    let item = key;
    item.name = `${key.name}.${key.rightFileName}`;

    const res = await fetchDownload(key);
    const data = await res.blob();
    const blobUrl = window.URL.createObjectURL(data);
    down(blobUrl, item.name);
  };

  //流下载
  function down(blobUrl, name) {
    const a = document.createElement('a');
    a.download = `${name}`;
    a.href = blobUrl;
    a.click();
  }

  return (
    <ProTable
      columns={columns}
      request={request}
      postData={postData}
      actionRef={ref}
      defaultData={filterDataSource}
      editable={{
        // 可编辑表格类型单行
        type: 'single',
        onSave: onSave,
        actionRender: (row, config, dom) => [dom.save, dom.cancel],
      }}
      onRequestError={() => message.error('数据加载失败')}
      search={{
        // 搜索表单的配置
        labelwidth: 'auto', // 标签的宽度
      }}
      // antd form的配置
      form={{
        ignoreRules: false,
      }}
      rowKey={(record) => record.key} // 设置item的key值
      pagination={{
        pageSize: 10,
      }}
      dateFormatter="string"
      headerTitle="文件上传系统"
      toolBarRender={() => [<Index reload={reload} />]}
    />
  );
};
