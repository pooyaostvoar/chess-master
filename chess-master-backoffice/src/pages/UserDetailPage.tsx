import { useEffect, useState } from "react";
import { AdminUsersApi, type AdminUser } from "../api";
import { Button, Card, Col, Divider, Form, Input, Modal, Row, Space, Statistic, Table, Tag, message, Descriptions } from "antd";

type Props = {
  userId: number;
  onBack: () => void;
};

export function UserDetailPage({ userId, onBack }: Props) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalSessions, setTotalSessions] = useState(0);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<AdminUser>();

  const loadUser = async () => {
    setLoading(true);
    try {
      const data = await AdminUsersApi.get(userId);
      setUser(data);
      form.setFieldsValue(data as any);
    } catch (err: any) {
      message.error(err.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = async (p = page, ps = pageSize) => {
    try {
      const data = await AdminUsersApi.sessions(userId, { page: p, pageSize: ps });
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

  const handleSave = () => {
    Modal.confirm({
      title: "Confirm update",
      content: "Are you sure you want to update this user?",
      onOk: async () => {
        try {
          setSaving(true);
          const values = await form.validateFields();
          const updated = await AdminUsersApi.update(userId, values);
          setUser(updated);
          form.setFieldsValue(updated as any);
          message.success("User updated");
        } catch (err: any) {
          message.error(err.message || "Update failed");
        } finally {
          setSaving(false);
        }
      },
    });
  };

  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <Button onClick={onBack} style={{ width: "fit-content" }}>
        ← Back to users
      </Button>

      <Card loading={loading} style={{ borderRadius: 12 }} bodyStyle={{ padding: 16 }}>
        {user ? (
          <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
              <Form layout="vertical" form={form}>
                <Form.Item label="Username" name="username" rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="Email" name="email">
                  <Input type="email" />
                </Form.Item>
                <Form.Item label="Role" name="isMaster">
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
                <Space>
                  <Button type="primary" onClick={handleSave} loading={saving}>
                    Save changes
                  </Button>
                </Space>
              </Form>
            </Col>
            <Col xs={24} md={8}>
              <Card bordered style={{ borderRadius: 12 }}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <Statistic title="Role" valueRender={() => (user.isMaster ? <Tag color="blue">Master</Tag> : <Tag>Normal</Tag>)} />
                  <Statistic title="Rating" value={user.rating ?? "—"} />
                  <Statistic title="Title" value={user.title ?? "—"} />
                </Space>
                {user.isMaster && user.pricing ? (
                  <>
                    <Divider />
                    <Descriptions title="Pricing" column={1} size="small" bordered>
                      <Descriptions.Item label="5 min">{user.pricing.price5min ?? "—"}</Descriptions.Item>
                      <Descriptions.Item label="10 min">{user.pricing.price10min ?? "—"}</Descriptions.Item>
                      <Descriptions.Item label="15 min">{user.pricing.price15min ?? "—"}</Descriptions.Item>
                      <Descriptions.Item label="30 min">{user.pricing.price30min ?? "—"}</Descriptions.Item>
                      <Descriptions.Item label="45 min">{user.pricing.price45min ?? "—"}</Descriptions.Item>
                      <Descriptions.Item label="60 min">{user.pricing.price60min ?? "—"}</Descriptions.Item>
                    </Descriptions>
                  </>
                ) : null}
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
            { title: "Start", dataIndex: "startTime", render: (v: string) => new Date(v).toLocaleString() },
            { title: "End", dataIndex: "endTime", render: (v: string) => new Date(v).toLocaleString() },
            { title: "Status", dataIndex: "status", render: (v: string) => <Tag>{v}</Tag> },
            { title: "Master", dataIndex: ["master", "username"], render: (v: string | null) => v || "—" },
            { title: "Customer", dataIndex: ["customer", "username"], render: (v: string | null) => v || "—" },
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
