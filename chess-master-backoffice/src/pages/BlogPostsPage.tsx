import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminBlogPostsApi, type AdminBlogPost } from "../api";
import { Button, Input, Popconfirm, Space, Table, Typography, message } from "antd";

const { Title } = Typography;

type Props = {
  onSelectPost: (post: AdminBlogPost | null) => void;
};

export function BlogPostsPage({ onSelectPost }: Props) {
  const queryClient = useQueryClient();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const postsQuery = useQuery({
    queryKey: ["admin-blog-posts", { page, pageSize, q }],
    queryFn: () => AdminBlogPostsApi.list({ page, pageSize, q: q || undefined }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => AdminBlogPostsApi.delete(id),
    onSuccess: () => {
      message.success("Post deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
    },
    onError: (err: Error) => message.error(err.message || "Delete failed"),
  });

  const columns = useMemo(
    () => [
      {
        title: "Title",
        dataIndex: "title",
        key: "title",
      },
      {
        title: "Slug",
        dataIndex: "slug",
        key: "slug",
        render: (val: string) => (
          <span style={{ fontFamily: "monospace", fontSize: 12 }}>{val}</span>
        ),
      },
      {
        title: "Actions",
        key: "actions",
        render: (_: unknown, record: AdminBlogPost) => (
          <Space>
            <Button size="small" onClick={() => onSelectPost(record)}>
              Edit
            </Button>
            <Popconfirm
              title="Delete this post?"
              onConfirm={() => deleteMutation.mutate(record.id)}
            >
              <Button size="small" danger loading={deleteMutation.isPending}>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        ),
      },
    ],
    [deleteMutation, onSelectPost]
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
          Blog posts
        </Title>
        <Space wrap>
          <Input.Search
            allowClear
            placeholder="Search title or slug"
            onSearch={(value) => {
              setQ(value.trim());
              setPage(1);
            }}
            style={{ width: 260 }}
          />
          <Button type="primary" onClick={() => onSelectPost(null)}>
            New post
          </Button>
        </Space>
      </Space>

      <Table
        rowKey="id"
        loading={postsQuery.isLoading}
        columns={columns}
        dataSource={postsQuery.data?.items ?? []}
        pagination={{
          current: page,
          pageSize,
          total: postsQuery.data?.total ?? 0,
          showSizeChanger: true,
          onChange: (nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          },
        }}
      />
    </div>
  );
};
