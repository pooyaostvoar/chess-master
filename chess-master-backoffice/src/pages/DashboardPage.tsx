import {
  Card,
  Col,
  Row,
  Space,
  Statistic,
  Typography,
  List,
  Tag,
  Skeleton,
  Empty,
  Timeline,
} from "antd";
import { useQuery } from "@tanstack/react-query";
import { AdminApi, type AdminStats, type AdminActivity } from "../api";

const { Title, Text } = Typography;

const statDefs: Array<{ key: keyof AdminStats; label: string }> = [
  { key: "totalUsers", label: "Total users" },
  { key: "totalMasters", label: "Masters" },
  { key: "upcomingSlots", label: "Upcoming sessions" },
  { key: "bookedSlots", label: "Booked/Reserved slots" },
  { key: "totalGames", label: "Games" },
];

export function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => AdminApi.stats(),
    staleTime: 30_000,
  });

  const activityQuery = useQuery({
    queryKey: ["admin-activity"],
    queryFn: () => AdminApi.activity(),
    staleTime: 30_000,
  });

  const renderStat = (def: { key: keyof AdminStats; label: string }) => (
    <Col key={def.key} xs={24} sm={12} md={8} lg={4}>
      <Card
        bordered
        style={{ borderRadius: 12, height: "100%", borderColor: "#e5e7ef" }}
        bodyStyle={{ padding: 16 }}
      >
        <Text type="secondary">{def.label}</Text>
        {isLoading ? (
          <Skeleton active paragraph={false} title={{ width: "40%" }} />
        ) : (
          <Statistic value={data ? (data[def.key] as number) : "—"} valueStyle={{ fontSize: 26 }} />
        )}
      </Card>
    </Col>
  );

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Card
        bordered={false}
        style={{ borderRadius: 14, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" }}
        bodyStyle={{ padding: 20 }}
      >
        <Title level={3} style={{ margin: 0 }}>
          Overview
        </Title>
        <Text type="secondary">Key metrics to keep you informed.</Text>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          {statDefs.map(renderStat)}
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={14}>
          <Card
            bordered={false}
            style={{ borderRadius: 14, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" }}
            bodyStyle={{ padding: 20 }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <Title level={4} style={{ margin: 0 }}>
                Activity
              </Title>
              <Text type="secondary">Recent signups, bookings, and games.</Text>
              {activityQuery.isLoading ? (
                <Skeleton active paragraph={{ rows: 4 }} />
              ) : activityQuery.data ? (
                <ActivityTimeline activity={activityQuery.data} />
              ) : (
                <Empty description="No activity yet" />
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={10}>
          <Card
            bordered={false}
            style={{ borderRadius: 14, boxShadow: "0 10px 30px rgba(15,23,42,0.08)" }}
            bodyStyle={{ padding: 20 }}
          >
            <Space direction="vertical" style={{ width: "100%" }}>
              <Title level={4} style={{ margin: 0 }}>
                Masters spotlight
              </Title>
              <Text type="secondary">Recent masters and their ratings.</Text>
              {isLoading ? (
                <Skeleton active paragraph={{ rows: 3 }} />
              ) : data && data.masters.length ? (
                <List
                  dataSource={data.masters}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={item.username}
                        description={
                          <Space>
                            {item.title ? <Tag color="blue">{item.title}</Tag> : null}
                            <Text type="secondary">
                              Rating: {item.rating !== null ? item.rating : "—"}
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty description="No masters yet" />
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}

function ActivityTimeline({ activity }: { activity: AdminActivity }) {
  const items: { label: string; color?: string }[] = [];

  activity.signups.forEach((s) =>
    items.push({
      label: `Signup: ${s.username} ${s.isMaster ? "(master)" : ""}${
        s.createdAt ? ` @ ${new Date(s.createdAt).toLocaleString()}` : ""
      }`,
      color: "green",
    })
  );

  activity.bookings.forEach((b) =>
    items.push({
      label: `Booking: ${b.master?.username ?? "Unknown master"} @ ${new Date(
        b.createdAt || b.startTime
      ).toLocaleString()}`,
      color: "blue",
    })
  );

  activity.games.forEach((g) =>
    items.push({
      label: `Game: ${g.id} ${g.finished ? "(finished)" : ""} @ ${new Date(
        g.createdAt
      ).toLocaleString()}`,
      color: "purple",
    })
  );

  if (!items.length) {
    return <Empty description="No activity yet" />;
  }

  return <Timeline items={items.map((i) => ({ color: i.color, children: i.label }))} />;
}
