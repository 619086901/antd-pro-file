import { useIntl } from 'umi';
import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-layout';

const Footer = () => {
  const intl = useIntl();
  const defaultMessage = intl.formatMessage({
    id: 'app.copyright.produced',
    defaultMessage: '',
  });
  const currentYear = new Date().getFullYear();
  return (
    <DefaultFooter
      copyright={`${currentYear} 浙江师范大学行知学院范建峰本科论文`}
      links={[
        {
          key: 'fjfdraw',
          title: '个人博客',
          href: 'https://fjfdraw.tk',
          blankTarget: true,
        },
        {
          key: 'github',
          title: <GithubOutlined />,
          href: 'https://github.com/619086901',
          blankTarget: true,
        },
      ]}
    />
  );
};

export default Footer;
