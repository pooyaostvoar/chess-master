import { useEffect, useState } from "react";
import { AdminBlogPostsApi } from "../api";
import { Button, Form, Input, Space, Typography, message } from "antd";

const { Title, Text } = Typography;
const { TextArea } = Input;

type Props = {
  postId: number | null;
  onBack: () => void;
};

type FormValues = {
  title: string;
  slug: string;
  contentHtml: string;
};

export function BlogPostDetailPage({ postId, onBack }: Props) {
  const isNew = postId === null;
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    if (isNew) {
      form.setFieldsValue({ title: "", slug: "", contentHtml: "" });
      setLoading(false);
      return;
    }

    setLoading(true);
    AdminBlogPostsApi.get(postId)
      .then((post) => {
        form.setFieldsValue({
          title: post.title,
          slug: post.slug,
          contentHtml: post.contentHtml,
        });
      })
      .catch((err: Error) => message.error(err.message || "Failed to load post"))
      .finally(() => setLoading(false));
  }, [form, isNew, postId]);

  const handleSave = async (values: FormValues) => {
    setSaving(true);
    try {
      const payload = {
        title: values.title.trim(),
        slug: values.slug.trim() || undefined,
        contentHtml: values.contentHtml,
      };

      if (isNew) {
        const created = await AdminBlogPostsApi.create(payload);
        message.success("Post created");
        onBack();
        return created;
      }

      await AdminBlogPostsApi.update(postId!, payload);
      message.success("Post saved");
      onBack();
    } catch (err: any) {
      message.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={onBack}>Back</Button>
        <Title level={5} style={{ margin: 0 }}>
          {isNew ? "New blog post" : "Edit blog post"}
        </Title>
      </Space>

      <Form
        form={form}
        layout="vertical"
        disabled={loading}
        onFinish={handleSave}
        style={{ maxWidth: 900 }}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Title is required" }]}
        >
          <Input placeholder="Post title" />
        </Form.Item>

        <Form.Item
          label="Slug"
          name="slug"
          extra={
            <Text type="secondary">
              Leave blank to use the title as the slug on create.
            </Text>
          }
        >
          <Input placeholder="myBlogPost" />
        </Form.Item>

        <Form.Item label="Content (HTML)" name="contentHtml">
          <TextArea
            rows={16}
            placeholder="<p>Write your post HTML here…</p>"
            style={{ fontFamily: "monospace" }}
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" loading={saving}>
              {isNew ? "Create post" : "Save changes"}
            </Button>
            <Button onClick={onBack}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
};
