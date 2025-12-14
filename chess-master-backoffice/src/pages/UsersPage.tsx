import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminUsersApi, type AdminUser } from "../api";
import { Input, Select, Space, Table, Tag, Typography } from "antd";

const { Title, Text } = Typography;

type Props = {
  onSelectUser: (user: AdminUser) => void;
};

export function UsersPage({ onSelectUser }: Props) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"master" | "user" | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const usersQuery = useQuery({
    queryKey: ["admin-users", { page, pageSize, search, role }],
    queryFn: () => AdminUsersApi.list({ page, pageSize, q: search || undefined, role }),
  });

  const columns = useMemo(
    () => [
      {
        title: "Username",
        dataIndex: "username",
        key: "username",
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        render: (val: string | null) => val || "—",
      },
      {
        title: "Role",
        key: "role",
        render: (_: unknown, record: AdminUser) =>
          record.isMaster ? <Tag color="blue">Master</Tag> : <Tag>Normal</Tag>,
      },
      {
        title: "Rating",
        dataIndex: "rating",
        key: "rating",
        render: (val: number | null) => (val ? val : "—"),
      },
      {
        title: "Title",
        dataIndex: "title",
        key: "title",
        render: (val: string | null) => val || "—",
      },
    ],
    []
  );

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="eyebrow">Backoffice</div>
          <Title level={2} style={{ margin: 0 }}>
            Users
          </Title>
          <Text type="secondary">Search, filter, and edit users.</Text>
        </div>
        <Space>
          <Input.Search
            allowClear
            placeholder="Search username or email"
            onSearch={(v) => {
              setPage(1);
              setSearch(v.trim());
            }}
            style={{ width: 260 }}
            loading={usersQuery.isFetching}
          />
          <Select
            allowClear
            placeholder="Role"
            style={{ width: 140 }}
            value={role}
            onChange={(val) => {
              setRole(val as any);
              setPage(1);
            }}
            options={[
              { value: "master", label: "Masters" },
              { value: "user", label: "Normal users" },
            ]}
          />
        </Space>
      </div>

      <Table
        rowKey="id"
        loading={usersQuery.isLoading}
        dataSource={usersQuery.data?.items}
        columns={columns}
        onRow={(record) => ({
          onClick: () => onSelectUser(record),
          style: { cursor: "pointer" },
        })}
        pagination={{
          current: page,
          pageSize,
          total: usersQuery.data?.total || 0,
          showSizeChanger: true,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
      />

    </div>
  );
}
