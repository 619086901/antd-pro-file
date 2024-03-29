import {
  AlipayCircleOutlined,
  LockOutlined,
  MobileOutlined,
  TaobaoCircleOutlined,
  UserOutlined,
  WeiboCircleOutlined,
} from '@ant-design/icons';
import { Alert, message, Tabs } from 'antd';
import {
  // React,
  useState,
} from 'react';
import {
  //ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
  LoginForm,
} from '@ant-design/pro-form';
import { useIntl, history, FormattedMessage, SelectLang, useModel } from 'umi';
import Footer from '@/components/Footer';
import { login } from '@/services/ant-design-pro/api';
//import { getFakeCaptcha } from '@/services/ant-design-pro/login';
import styles from './index.less';

import { getAccessToken, setAccessToken } from '@/util/accessToken';

const LoginMessage = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);
let timer;
let timerFoller;

const Login = () => {
  const [userLoginState, setUserLoginState] = useState({});
  const [type, setType] = useState('account');
  const { initialState, setInitialState } = useModel('@@initialState');
  const intl = useIntl();

  const fetchUserInfo = async () => {
    console.log(1);
    const userInfo = await initialState?.fetchUserInfo?.(getAccessToken());
    console.log(userInfo);
    if (userInfo) {
      await setInitialState((s) => ({ ...s, currentUser: userInfo }));
    }
  };

  const [state, setState] = useState({
    src: '',
  });

  const WXgetAccessToken = async () => {
    const res = await fetch('http://106.15.206.129:9996/wechatAccessToken');
    const data = await res.json();
    return data;
  };

  const getCode = async () => {
    const res = await fetch('http://106.15.206.129:9996/wechatCode', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account: '15158305800',
        client: '123456',
        regionCode: '101',
      }),
    });
    const data = await res.json();
    return data;
  };

  const getFoller = async () => {
    const res = await fetch('http://106.15.206.129:9996/wechatFoller', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        account: '15158305800',
        client: '123456',
        regionCode: '101',
      }),
    });
    const data = await res.json();
    return data;
  };

  const func = () => {
    getCode().then((data) => {
      let code = data.code;
      let ticket = data.data?.ticket;
      switch (code) {
        case 200:
          setState(() => {
            return {
              src: `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${ticket}`,
            };
          });
          //message.success('获取成功');
          break;
        case 400:
          message.error('获取二维码失败');
          break;

        default:
          break;
      }
    });
  };

  const but_timer = () => {
    timer && clearInterval(timer);
    timer = setInterval(() => {
      func();
    }, 60000);
  };

  const handleSubmit = async (values) => {
    try {
      switch (type) {
        case 'account':
          // 登录
          const msg = await login({ ...values, type });
          if (msg.code === 200) {
            const defaultLoginSuccessMessage = intl.formatMessage({
              id: 'pages.login.success',
              defaultMessage: '登录成功！',
            });
            setAccessToken(values.username);
            message.success(defaultLoginSuccessMessage);
            await fetchUserInfo();
            /** 此方法会跳转到 redirect 参数所在的位置 */
            if (!history) return;
            const { query } = history.location;
            const { redirect } = query;
            history.push(redirect || '/');
            return;
          }
          console.log(msg); // 如果失败去设置用户错误信息
          setUserLoginState(msg);
          break;
        case 'mobile':
          if (true) {
            func();
            but_timer();
            timerFoller && clearInterval(timerFoller);
            timerFoller = setInterval(() => {
              getFoller().then((data) => {
                let follow = data.data[0]?.follow;
                if (follow === 1) {
                  message.success('已关注');
                } else if (follow === 0) {
                  message.error('未关注');
                } else {
                  message.error('网络异常');
                }
              });
            }, 5000);
            console.log('微信扫码');
          }
          break;

        default:
          break;
      }
    } catch (error) {
      const defaultLoginFailureMessage = intl.formatMessage({
        id: 'pages.login.failure',
        defaultMessage: '登录失败，请重试！',
      });
      message.error(defaultLoginFailureMessage);
    }
  };

  const { code } = userLoginState;
  return (
    <div className={styles.container}>
      <div className={styles.lang} data-lang>
        {SelectLang && <SelectLang />}
      </div>
      <div className={styles.content}>
        <LoginForm
          logo={<img alt="logo" src="/logo.svg" />}
          title="Ant Design"
          subTitle={intl.formatMessage({
            id: 'pages.layouts.userLayout.title',
          })}
          initialValues={{
            autoLogin: true,
          }}
          actions={
            [
              // <FormattedMessage
              //   key="loginWith"
              //   id="pages.login.loginWith"
              //   defaultMessage="其他登录方式"
              // />,
              // <AlipayCircleOutlined key="AlipayCircleOutlined" className={styles.icon} />,
              // <TaobaoCircleOutlined key="TaobaoCircleOutlined" className={styles.icon} />,
              // <WeiboCircleOutlined key="WeiboCircleOutlined" className={styles.icon} />,
            ]
          }
          onFinish={async (values) => {
            await handleSubmit(values);
          }}
        >
          <Tabs activeKey={type} onChange={setType}>
            <Tabs.TabPane
              key="account"
              tab={intl.formatMessage({
                id: 'pages.login.accountLogin.tab',
                defaultMessage: '账户密码登录',
              })}
            />
            <Tabs.TabPane
              key="mobile"
              tab={intl.formatMessage({
                id: 'pages.login.wechatLogin.tab',
                defaultMessage: '微信扫码登录',
              })}
            />
          </Tabs>

          {code === 400 && type === 'account' && <LoginMessage content="错误的用户名和密码" />}
          {type === 'account' && (
            <>
              <ProFormText
                name="username"
                fieldProps={{
                  size: 'large',
                  prefix: <UserOutlined className={styles.prefixIcon} />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.username.placeholder',
                  defaultMessage: '用户名',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.username.required"
                        defaultMessage="请输入用户名!"
                      />
                    ),
                  },
                ]}
              />
              <ProFormText.Password
                name="password"
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.password.placeholder',
                  defaultMessage: '密码',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.password.required"
                        defaultMessage="请输入密码！"
                      />
                    ),
                  },
                ]}
              />
            </>
          )}

          {type === 'mobile' && (
            <>
              <img src={state.src} alt="二维码加载中" />
            </>
          )}

          {/* {status === 'error' && loginType === 'mobile' && <LoginMessage content="验证码错误" />}
          {type === 'mobile' && (
            <>
              <ProFormText
                fieldProps={{
                  size: 'large',
                  prefix: <MobileOutlined className={styles.prefixIcon} />,
                }}
                name="mobile"
                placeholder={intl.formatMessage({
                  id: 'pages.login.phoneNumber.placeholder',
                  defaultMessage: '手机号',
                })}
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.required"
                        defaultMessage="请输入手机号！"
                      />
                    ),
                  },
                  {
                    pattern: /^1\d{10}$/,
                    message: (
                      <FormattedMessage
                        id="pages.login.phoneNumber.invalid"
                        defaultMessage="手机号格式错误！"
                      />
                    ),
                  },
                ]}
              />
              <ProFormCaptcha
                fieldProps={{
                  size: 'large',
                  prefix: <LockOutlined className={styles.prefixIcon} />,
                }}
                captchaProps={{
                  size: 'large',
                }}
                placeholder={intl.formatMessage({
                  id: 'pages.login.captcha.placeholder',
                  defaultMessage: '请输入验证码',
                })}
                captchaTextRender={(timing, count) => {
                  if (timing) {
                    return `${count} ${intl.formatMessage({
                      id: 'pages.getCaptchaSecondText',
                      defaultMessage: '获取验证码',
                    })}`;
                  }

                  return intl.formatMessage({
                    id: 'pages.login.phoneLogin.getVerificationCode',
                    defaultMessage: '获取验证码',
                  });
                }}
                name="captcha"
                rules={[
                  {
                    required: true,
                    message: (
                      <FormattedMessage
                        id="pages.login.captcha.required"
                        defaultMessage="请输入验证码！"
                      />
                    ),
                  },
                ]}
                onGetCaptcha={async (phone) => {
                  const result = await getFakeCaptcha({
                    phone,
                  });

                  if (result === false) {
                    return;
                  }

                  message.success('获取验证码成功！验证码为：1234');
                }}
              />
            </>
          )} */}
          <div
            style={{
              marginBottom: 24,
            }}
          >
            <ProFormCheckbox noStyle name="autoLogin">
              <FormattedMessage id="pages.login.rememberMe" defaultMessage="自动登录" />
            </ProFormCheckbox>
            <a
              style={{
                float: 'right',
              }}
            >
              {/* <FormattedMessage id="pages.login.forgotPassword" defaultMessage="忘记密码" /> */}
            </a>
          </div>
        </LoginForm>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
