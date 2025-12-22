import { useEffect, useState } from "react";
import { AdminUsersApi, type AdminUser } from "../api";
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  message,
  Descriptions,
  Typography,
  notification,
} from "antd";

type Props = {
  userId: number;
  onBack: () => void;
};

export function UserDetailPage({ userId, onBack }: Props) {
  const [api, contextHolder] = notification.useNotification();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalSessions, setTotalSessions] = useState(0);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<Record<
    string,
    any
  > | null>(null);
  const [form] = Form.useForm<AdminUser>();

  const toComparable = (data: Partial<AdminUser>) => ({
    username: data.username ?? "",
    email: data.email ?? "",
    title: data.title ?? "",
    rating:
      data.rating === null || data.rating === undefined
        ? null
        : Number(data.rating),
    bio: data.bio ?? "",
    chesscomUrl: data.chesscomUrl ?? "",
    lichessUrl: data.lichessUrl ?? "",
    isMaster: Boolean(data.isMaster),
  });

  const updateDirtyFlag = (values: Partial<AdminUser>) => {
    if (!lastSavedSnapshot) {
      setHasChanges(false);
      return;
    }
    setHasChanges(
      JSON.stringify(toComparable(values)) !== JSON.stringify(lastSavedSnapshot)
    );
  };

  const loadUser = async () => {
    setLoading(true);
    try {
      const data = await AdminUsersApi.get(userId);
      setUser(data);
      const snapshot = toComparable(data);
      setLastSavedSnapshot(snapshot);
      setHasChanges(false);
    } catch (err: any) {
      message.error(err.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async (p = page, ps = pageSize) => {
    try {
      const data = await AdminUsersApi.sessions(userId, {
        page: p,
        pageSize: ps,
      });
      setSessions(data.items);
      setTotalSessions(data.total);
      setPage(data.page);
      setPageSize(data.pageSize);
    } catch (err: any) {
      message.error(err.message || "Failed to load sessions");
    }
  };

  useEffect(() => {
    loadUser();
    loadSessions(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Keep form in sync once data is loaded to avoid "form not connected" warnings.
  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        ...user,
        rating: user.rating ?? undefined,
      } as any);
    }
  }, [user, form]);

  const handleSave = async (values: AdminUser) => {
    try {
      setSaving(true);
      const payload = {
        ...values,
        rating:
          values.rating === null || values.rating === undefined
            ? null
            : Number(values.rating),
      } as Partial<AdminUser>;
      const updated = await AdminUsersApi.update(userId, payload);
      setUser(updated);
      form.setFieldsValue(updated as any);
      const snapshot = toComparable(updated);
      setLastSavedSnapshot(snapshot);
      setHasChanges(false);
      api.success({
        message: "Changes saved",
        description: "User profile was updated successfully.",
        placement: "bottomRight",
        duration: 2.5,
      });
    } catch (err: any) {
      api.error({
        message: "Update failed",
        description: err.message || "Something went wrong while saving.",
        placement: "bottomRight",
        duration: 3.5,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      {contextHolder}
      <Button onClick={onBack} style={{ width: "fit-content" }}>
        ← Back to users
      </Button>

      <Card
        loading={loading}
        style={{ borderRadius: 12 }}
        bodyStyle={{ padding: 16 }}
      >
        {user ? (
          <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
              <Form
                layout="vertical"
                form={form}
                onFinish={handleSave}
                onValuesChange={(_, values) =>
                  updateDirtyFlag(values as Partial<AdminUser>)
                }
              >
                <Form.Item
                  label="Username"
                  name="username"
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item label="Email" name="email">
                  <Input type="email" />
                </Form.Item>
                <Form.Item label="Role">
                  <Input value={user.isMaster ? "Master" : "Normal"} disabled />
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
                <Space align="center">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={saving}
                    disabled={!hasChanges}
                  >
                    Save changes
                  </Button>
                  {hasChanges ? (
                    <Typography.Text type="secondary">
                      Unsaved changes
                    </Typography.Text>
                  ) : (
                    <Typography.Text type="secondary">
                      All changes saved
                    </Typography.Text>
                  )}
                </Space>
              </Form>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered style={{ borderRadius: 12 }}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Statistic
                    title="Role"
                    valueRender={() =>
                      user.isMaster ? (
                        <Tag color="blue">Master</Tag>
                      ) : (
                        <Tag>Normal</Tag>
                      )
                    }
                  />
                  <Statistic title="Rating" value={user.rating ?? "—"} />
                  <Statistic title="Title" value={user.title ?? "—"} />
                </Space>
              </Card>
            </Col>
          </Row>
        ) : null}
      </Card>

      <Card title="Sessions" style={{ borderRadius: 12 }}>
        <Table
          rowKey="id"
          dataSource={sessions}
          columns={[
            {
              title: "Start",
              dataIndex: "startTime",
              render: (v: string) => new Date(v).toLocaleString(),
            },
            {
              title: "End",
              dataIndex: "endTime",
              render: (v: string) => new Date(v).toLocaleString(),
            },
            {
              title: "Status",
              dataIndex: "status",
              render: (v: string) => <Tag>{v}</Tag>,
            },
            {
              title: "Master",
              dataIndex: ["master", "username"],
              render: (v: string | null) => v || "—",
            },
            {
              title: "Customer",
              dataIndex: ["customer", "username"],
              render: (v: string | null) => v || "—",
            },
          ]}
          pagination={{
            current: page,
            pageSize,
            total: totalSessions,
            showSizeChanger: true,
            onChange: (p, ps) => loadSessions(p, ps),
          }}
        />
      </Card>
    </Space>
  );
}
