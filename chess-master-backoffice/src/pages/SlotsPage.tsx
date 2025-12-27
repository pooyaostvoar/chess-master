import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminSlotsApi, type AdminSlot } from "../api";
import { DatePicker, Input, Select, Space, Table, Tag, Typography } from "antd";
import dayjs, { Dayjs } from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type Props = {
  onSelectSlot: (slot: AdminSlot) => void;
};

export function SlotsPage({ onSelectSlot }: Props) {
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);
  const [userId, setUserId] = useState<string>();
  const [status, setStatus] = useState<string>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const slotsQuery = useQuery({
    queryKey: ["admin-slots", { page, pageSize, dateRange, userId, status }],
    queryFn: () =>
      AdminSlotsApi.list({
        page,
        pageSize,
        startDate: dateRange[0]?.toISOString(),
        endDate: dateRange[1]?.toISOString(),
        userId,
        status,
      }),
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "free":
        return "green";
      case "reserved":
        return "gold";
      case "booked":
        return "red";
      default:
        return "default";
    }
  };

  const columns = useMemo(
    () => [
      {
        title: "Start Time",
        dataIndex: "startTime",
        key: "startTime",
        render: (val: string) => dayjs(val).format("MMM D, YYYY HH:mm"),
      },
      {
        title: "End Time",
        dataIndex: "endTime",
        key: "endTime",
        render: (val: string) => dayjs(val).format("MMM D, YYYY HH:mm"),
      },
      {
        title: "Master Email",
        key: "master",
        render: (_: unknown, record: AdminSlot) =>
          record.master?.username || "—",
      },
      {
        title: "Master Phone",
        key: "master",
        render: (_: unknown, record: AdminSlot) =>
          record.master?.phoneNumber || "—",
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (val: string) => <Tag color={getStatusColor(val)}>{val}</Tag>,
      },
      {
        title: "Title",
        dataIndex: "title",
        key: "title",
        render: (val: string | null) => val || "—",
      },
      {
        title: "Reserved By Email",
        key: "reservedBy",
        render: (_: unknown, record: AdminSlot) =>
          record.reservedBy?.username || "—",
      },
      {
        title: "Reserved By Phone",
        key: "reservedBy",
        render: (_: unknown, record: AdminSlot) =>
          record.reservedBy?.phoneNumber || "—",
      },
      {
        title: "Price",
        dataIndex: "price",
        key: "price",
        render: (val: number | null) => (val ? `$${val}` : "—"),
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
            Schedule Slots
          </Title>
          <Text type="secondary">
            Search, filter, and manage schedule slots.
          </Text>
        </div>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={(dates) => {
              setDateRange(dates as [Dayjs | null, Dayjs | null]);
              setPage(1);
            }}
            format="YYYY-MM-DD"
            style={{ width: 260 }}
          />
          <Input
            allowClear
            placeholder="User ID"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value.trim() || undefined);
              setPage(1);
            }}
            style={{ width: 140 }}
          />
          <Select
            allowClear
            placeholder="Status"
            style={{ width: 140 }}
            value={status}
            onChange={(val) => {
              setStatus(val as any);
              setPage(1);
            }}
            options={[
              { value: "free", label: "Free" },
              { value: "reserved", label: "Reserved" },
              { value: "booked", label: "Booked" },
            ]}
          />
        </Space>
      </div>

      <Table
        rowKey="id"
        loading={slotsQuery.isLoading}
        dataSource={slotsQuery.data?.items}
        columns={columns}
        onRow={(record) => ({
          onClick: () => onSelectSlot(record),
          style: { cursor: "pointer" },
        })}
        pagination={{
          current: page,
          pageSize,
          total: slotsQuery.data?.total || 0,
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
