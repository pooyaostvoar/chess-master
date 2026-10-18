import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import { AdminCommentsApi, type AdminComment } from "../api";

const { Title } = Typography;

type CreateCommentForm = {
  comments: Array<{
    text: string;
    masterId: number;
    userId?: number;
    username?: string;
  }>;
};

export function CommentsPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const commentsQuery = useQuery({
    queryKey: ["admin-comments", { page, pageSize, q }],
    queryFn: () =>
      AdminCommentsApi.list({ page, pageSize, q: q || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => AdminCommentsApi.delete(id),
    onSuccess: () => {
      message.success("Comment deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
    },
    onError: (err: Error) => message.error(err.message || "Delete failed"),
  });

  const [createForm] = Form.useForm<CreateCommentForm>();

  const createMutation = useMutation({
    mutationFn: (comments: CreateCommentForm["comments"]) =>
      AdminCommentsApi.create(
        comments.map((comment) => ({
          text: comment.text.trim(),
          masterId: comment.masterId,
          ...(comment.userId ? { userId: comment.userId } : {}),
          ...(comment.username?.trim()
            ? { username: comment.username.trim() }
            : {}),
        }))
      ),
    onSuccess: (result) => {
      message.success(
        result.items.length === 1
          ? "Comment created"
          : `${result.items.length} comments created`
      );
      createForm.resetFields();
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
    },
    onError: (err: Error) => message.error(err.message || "Create failed"),
  });

  const columns = useMemo(
    () => [
      {
        title: "Comment",
        dataIndex: "text",
        key: "text",
        render: (val: string) => (
          <span style={{ whiteSpace: "pre-wrap" }}>{val}</span>
        ),
      },
      {
        title: "User",
        key: "user",
        render: (_: unknown, record: AdminComment) =>
          [record.user.title, record.user.username].filter(Boolean).join(" "),
      },
      {
        title: "Master",
        key: "master",
        render: (_: unknown, record: AdminComment) =>
          [record.master.title, record.master.username].filter(Boolean).join(" "),
      },
      {
        title: "Created",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (val: string) => new Date(val).toLocaleString(),
      },
      {
        title: "Updated",
        dataIndex: "updatedAt",
        key: "updatedAt",
        render: (val: string) => new Date(val).toLocaleString(),
      },
      {
        title: "Actions",
        key: "actions",
        render: (_: unknown, record: AdminComment) => (
          <Popconfirm
            title="Delete this comment?"
            onConfirm={() => deleteMutation.mutate(record.id)}
          >
            <Button size="small" danger loading={deleteMutation.isPending}>
              Delete
            </Button>
          </Popconfirm>
        ),
      },
    ],
    [deleteMutation]
  );

  return (
    <div>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
        wrap
      >
        <Title level={5} style={{ margin: 0 }}>
          Comments
        </Title>
        <Input.Search
          allowClear
          placeholder="Search text, user, or master"
          onSearch={(value) => {
            setQ(value.trim());
            setPage(1);
          }}
          style={{ width: 280 }}
        />
      </Space>

      <Card size="small" style={{ marginBottom: 16 }} title="New comments">
        <Form
          form={createForm}
          layout="vertical"
          initialValues={{
            comments: [{ text: "", masterId: undefined, username: "" }],
          }}
          onFinish={(values) => createMutation.mutate(values.comments)}
        >
          <Form.List name="comments">
            {(fields, { add, remove }) => (
              <Space direction="vertical" style={{ width: "100%" }} size="middle">
                {fields.map((field) => (
                  <Space key={field.key} align="start" wrap>
                    <Form.Item
                      label="Comment"
                      name={[field.name, "text"]}
                      rules={[{ required: true, message: "Comment is required" }]}
                    >
                      <Input.TextArea rows={2} style={{ width: 280 }} />
                    </Form.Item>
                    <Form.Item
                      label="Master id"
                      name={[field.name, "masterId"]}
                      rules={[{ required: true, message: "Master id is required" }]}
                    >
                      <InputNumber min={1} style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item label="User id" name={[field.name, "userId"]}>
                      <InputNumber min={1} style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item
                      label="Username"
                      name={[field.name, "username"]}
                      dependencies={[["comments", field.name, "userId"]]}
                      rules={[
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const userId = getFieldValue([
                              "comments",
                              field.name,
                              "userId",
                            ]);
                            if (userId || String(value || "").trim()) {
                              return Promise.resolve();
                            }
                            return Promise.reject(
                              new Error("User id or username is required")
                            );
                          },
                        }),
                      ]}
                    >
                      <Input placeholder="Creates a user if new" style={{ width: 200 }} />
                    </Form.Item>
                    {fields.length > 1 ? (
                      <Button
                        style={{ marginTop: 30 }}
                        onClick={() => remove(field.name)}
                      >
                        Remove
                      </Button>
                    ) : null}
                  </Space>
                ))}
                <Space>
                  <Button onClick={() => add({ text: "", username: "" })}>
                    Add another
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={createMutation.isPending}
                  >
                    Create comments
                  </Button>
                </Space>
              </Space>
            )}
          </Form.List>
        </Form>
      </Card>

      <Table
        rowKey="id"
        loading={commentsQuery.isLoading}
        columns={columns}
        dataSource={commentsQuery.data?.items ?? []}
        pagination={{
          current: page,
          pageSize,
          total: commentsQuery.data?.total ?? 0,
          showSizeChanger: true,
          onChange: (nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          },
        }}
      />
    </div>
  );
}
