// https://umijs.org/config/
import { defineConfig } from 'umi';
export default defineConfig({
  plugins: [
    // https://github.com/zthxxx/react-dev-inspector
    'react-dev-inspector/plugins/umi/react-inspector',
  ],
  // https://github.com/zthxxx/react-dev-inspector#inspector-loader-props
  inspectorConfig: {
    exclude: [],
    babelPlugins: [],
    babelOptions: {},
  },
  define: {
    API_SERVER_9997: 'http://localhost:9997', // 接口服务器地址
    API_SERVER_9998: 'http://localhost:9998',
    PATH_PARENT: '\\', // 路径截取 本地==='\'   服务器==='/'
  },
});
