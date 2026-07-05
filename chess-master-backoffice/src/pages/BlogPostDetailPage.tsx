import { useEffect, useState } from "react";
import { AdminBlogPostsApi, AdminImagesApi, MEDIA_URL } from "../api";
import { Button, Form, Input, Space, Typography, Upload, message } from "antd";
import type { UploadProps } from "antd";

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
  imageUrl: string | null;
};

function getImageSrc(imageUrl: string | null | undefined): string | undefined {
  if (!imageUrl) return undefined;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  return MEDIA_URL + imageUrl;
}

export function BlogPostDetailPage({ postId, onBack }: Props) {
  const isNew = postId === null;
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form] = Form.useForm<FormValues>();

  const imageUrl = Form.useWatch("imageUrl", form);

  useEffect(() => {
    if (isNew) {
      form.setFieldsValue({
        title: "",
        slug: "",
        contentHtml: "",
        imageUrl: null,
      });
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
          imageUrl: post.imageUrl ?? null,
        });
      })
      .catch((err: Error) => message.error(err.message || "Failed to load post"))
      .finally(() => setLoading(false));
  }, [form, isNew, postId]);

  const handleImageUpload: UploadProps["customRequest"] = async (options) => {
    const file = options.file as File;
    setUploading(true);
    try {
      const result = await AdminImagesApi.upload(file);
      form.setFieldValue("imageUrl", result.url);
      message.success("Image uploaded");
      options.onSuccess?.(result);
    } catch (err: any) {
      message.error(err.message || "Upload failed");
      options.onError?.(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (values: FormValues) => {
    setSaving(true);
    try {
      const payload = {
        title: values.title.trim(),
        slug: values.slug.trim() || undefined,
        contentHtml: values.contentHtml,
        imageUrl: values.imageUrl ?? null,
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

        <Form.Item label="Cover image" name="imageUrl">
          <div>
            {imageUrl && (
              <div style={{ marginBottom: 12 }}>
                <img
                  src={getImageSrc(imageUrl)}
                  alt="Cover preview"
                  style={{
                    maxWidth: 320,
                    maxHeight: 200,
                    objectFit: "cover",
                    borderRadius: 8,
                    border: "1px solid #d9d9d9",
                  }}
                />
              </div>
            )}
            <Space>
              <Upload
                accept="image/jpeg,image/png,image/webp"
                showUploadList={false}
                customRequest={handleImageUpload}
              >
                <Button loading={uploading}>
                  {imageUrl ? "Replace image" : "Upload image"}
                </Button>
              </Upload>
              {imageUrl && (
                <Button onClick={() => form.setFieldValue("imageUrl", null)}>
                  Remove
                </Button>
              )}
            </Space>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">JPEG, PNG or WebP. Max size 5MB.</Text>
            </div>
          </div>
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
