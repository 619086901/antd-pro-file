import React, { useState } from 'react';
import { Button, message } from 'antd';
import { ModalForm, ProFormUploadDragger } from '@ant-design/pro-form';
import { PlusOutlined } from '@ant-design/icons';
import { getAccessToken } from '../../util/accessToken.js';

export default (props) => {
  const [type] = useState('ModalForm');
  const Components = {
    ModalForm,
  };
  const formRef = React.createRef();

  // 重置表单
  const resetFields = () => {
    formRef.current.resetFields();
  };
  // 文件上传请求
  const fetch_file = async (url, fileForm) => {
    let res = await fetch(url, {
      method: 'POST',
      body: fileForm,
    });
    let data = await res.json();
    // 状态码
    const { code, message: tishi } = data;
    switch (code) {
      case 200:
        message.success(tishi);
        // 刷新
        props.reload();
        break;
      case 400:
        message.error(tishi);
        break;
      default:
        message.error('保存失败');
        break;
    }
  };

  // 表单提交成功回调
  const onFinish = async (values) => {
    let fileForm = new FormData();
    for (let i = 0; i < values.dragger.length; i++) {
      fileForm.append('file', values.dragger[i].originFileObj);
      fileForm.append('userId', getAccessToken());
      await fetch_file(`${API_SERVER_9997}/upload`, fileForm);
      fileForm.delete('file');
    }
    // 重置
    resetFields();
    // 返回true会关闭表单
    return true;
  };

  const FormComponents = Components[type];
  if (type === 'ModalForm')
    return (
      <div
        style={{
          margin: 24,
        }}
      >
        <FormComponents
          trigger={
            <Button type="primary">
              <PlusOutlined />
              上传文件
            </Button>
          }
          onFinish={onFinish}
          formRef={formRef}
        >
          <ProFormUploadDragger
            max={4}
            label="文件"
            name="dragger"
            //配置antd的Form参数
            fieldProps={{
              multiple: true,
              // 通过覆盖默认的上传行为，可以自定义自己的上传实现
              customRequest: (options) => {
                //上传成功
                options.onSuccess();
                return true;
              },
            }}
          />
        </FormComponents>
      </div>
    );
};
