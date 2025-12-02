import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminUsersApi, type AdminUser } from "../api";
import {
  Button,
  Divider,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";

const { Title, Text } = Typography;

export function UsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"master" | "user" | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form] = Form.useForm<AdminUser>();

  const usersQuery = useQuery({
    queryKey: ["admin-users", { page, pageSize, search, role }],
    queryFn: () => AdminUsersApi.list({ page, pageSize, q: search || undefined, role }),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<AdminUser>) => {
      if (!selectedUser) throw new Error("No user selected");
      return AdminUsersApi.update(selectedUser.id, payload);
    },
    onSuccess: (updated) => {
      message.success("User updated");
      setSelectedUser(updated);
      form.setFieldsValue(updated as any);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (err: any) => {
      message.error(err.message || "Update failed");
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
      {
        title: "Actions",
        key: "actions",
        render: (_: unknown, record: AdminUser) => (
          <Button
            size="small"
            onClick={() => {
              setSelectedUser(record);
              form.setFieldsValue(record as any);
              setDrawerOpen(true);
            }}
          >
            Edit
          </Button>
        ),
      },
    ],
    [form]
  );

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        updateMutation.mutate(values);
      })
      .catch(() => {});
  };

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

      <Drawer
        title={selectedUser ? `Edit ${selectedUser.username}` : "Edit user"}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={420}
        destroyOnClose
        footer={
          <Space style={{ justifyContent: "flex-end", width: "100%" }}>
            <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={handleSave} loading={updateMutation.isPending}>
              Save
            </Button>
          </Space>
        }
      >
        <Form layout="vertical" form={form} initialValues={selectedUser as any}>
          <Form.Item label="Username" name="username" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input type="email" />
          </Form.Item>
          <Form.Item label="Role" name="isMaster">
            <Select
              options={[
                { value: true, label: "Master" },
                { value: false, label: "Normal user" },
              ]}
            />
          </Form.Item>
          <Divider />
          <Form.Item label="Title" name="title">
            <Input />
          </Form.Item>
          <Form.Item label="Rating" name="rating">
            <Input type="number" />
          </Form.Item>
          <Form.Item label="Bio" name="bio">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item label="Chess.com URL" name="chesscomUrl">
            <Input />
          </Form.Item>
          <Form.Item label="Lichess URL" name="lichessUrl">
            <Input />
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
