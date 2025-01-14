import React, { useEffect } from 'react';
import { useRequest, Link } from 'ice';
import { Button, Icon, Table, Dialog } from '@alicloud/console-components';
import Actions, { LinkButton } from '@alicloud/console-components-actions';
import CreateOrg from './components/CreateOrg';
import TransferOrg from './components/TransferOrg';
import { listOrgs } from '@/services/user';
import { removeOrg } from '@/services/org';
import { Toast } from '@/components/ToastContainer';
import { get } from 'lodash';
import { ROLE } from '@/constants';
import store from '@/store';

function Orgs() {
  const { data, request, refresh, loading } = useRequest(listOrgs);
  const [userState] = store.useModel('user');
  const username = get(userState, 'userInfo.username');

  useEffect(() => {
    request();
  }, []);

  const handleDelete = (record) => {
    const dialog = Dialog.alert({
      title: `删除组织：${record.name}`,
      content: '您确定删除当前组织吗?',
      onOk: async () => {
        const { success } = await removeOrg({ orgName: record.name });
        if (success) {
          Toast.success('组织删除成功');
          refresh();
        }
        dialog.hide();
      },
    });
  };

  const columns = [
    {
      title: '组织名称',
      key: 'name',
      dataIndex: 'name',
      cell: (value, _index, record) => <Link to={`/${value}`}>{value}</Link>,
    },
    {
      title: '角色',
      key: 'role',
      dataIndex: 'role',
    },
    {
      title: '描述',
      key: 'description',
      dataIndex: 'description',
    },
    {
      title: '操作',
      cell: (value, _index, record) => (
        <Actions>
          <TransferOrg callback={refresh} dataSource={{ name: record.name }}>
            <LinkButton disabled={record.role !== ROLE.OWNER || record.name === username}>
              转让
            </LinkButton>
          </TransferOrg>
          <LinkButton
            type="primary"
            disabled={record.role !== ROLE.OWNER || record.name === username}
            onClick={() => handleDelete(record)}
          >
            删除
          </LinkButton>
        </Actions>
      ),
    },
  ];

  return (
    <div className="mt-16">
      <div className="flex-r mb-16">
        <CreateOrg callback={refresh}>
          <Button type="primary">创建组织</Button>
        </CreateOrg>
        <Button onClick={refresh}>
          <Icon type="refresh" />
        </Button>
      </div>
      <Table
        loading={loading}
        hasBorder={false}
        dataSource={get(data, 'result')}
        columns={columns}
      />
    </div>
  );
}
export default Orgs;
