import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminUsersApi, type AdminUser } from "../api";
import { Input, Select, Space, Table, Tag, Typography, message } from "antd";

const { Title, Text } = Typography;

type Props = {
  onSelectUser: (user: AdminUser) => void;
};

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "disabled", label: "Disabled" },
] as const;

export function UsersPage({ onSelectUser }: Props) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"master" | "user" | undefined>();
  const [status, setStatus] = useState<"active" | "disabled" | "all">("active");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  const usersQuery = useQuery({
    queryKey: ["admin-users", { page, pageSize, search, role, status }],
    queryFn: () =>
      AdminUsersApi.list({
        page,
        pageSize,
        q: search || undefined,
        role,
        status,
      }),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      userId,
      nextStatus,
    }: {
      userId: number;
      nextStatus: "active" | "disabled";
    }) => AdminUsersApi.update(userId, { status: nextStatus }),
    onMutate: ({ userId }) => {
      setUpdatingUserId(userId);
    },
    onSuccess: () => {
      message.success("User status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: Error) => {
      message.error(err.message || "Failed to update user status");
    },
    onSettled: () => {
      setUpdatingUserId(null);
    },
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
        title: "Phone Number",
        dataIndex: "phoneNumber",
        key: "phoneNumber",
        render: (val: string | null) => val || "—",
      },
      {
        title: "Role",
        key: "role",
        render: (_: unknown, record: AdminUser) =>
          record.isMaster ? <Tag color="blue">Master</Tag> : <Tag>Normal</Tag>,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (val: string, record: AdminUser) => (
          <div onClick={(e) => e.stopPropagation()}>
            <Select
              size="small"
              style={{ width: 120 }}
              value={val === "disabled" ? "disabled" : "active"}
              loading={updatingUserId === record.id}
              disabled={updatingUserId === record.id}
              options={[...STATUS_OPTIONS]}
              onChange={(nextStatus) => {
                if (nextStatus === val) return;
                statusMutation.mutate({
                  userId: record.id,
                  nextStatus,
                });
              }}
            />
          </div>
        ),
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
    [statusMutation, updatingUserId]
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
          <Select
            placeholder="Status"
            style={{ width: 140 }}
            value={status}
            onChange={(val) => {
              setStatus(val);
              setPage(1);
            }}
            options={[
              { value: "active", label: "Active" },
              { value: "disabled", label: "Disabled" },
              { value: "all", label: "All" },
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
