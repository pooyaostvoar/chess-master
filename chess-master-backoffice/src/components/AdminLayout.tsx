import { ReactNode } from "react";
import { Layout, Menu, Button, Typography } from "antd";
import type { Admin } from "../api";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

type NavItem = {
  key: string;
  label: string;
};

type Props = {
  admin: Admin;
  children: ReactNode;
  activeKey: string;
  onNavigate: (key: string) => void;
  onLogout: () => void;
};

const navItems: NavItem[] = [{ key: "users", label: "Users" }];

export function AdminLayout({ admin, children, activeKey, onNavigate, onLogout }: Props) {
  return (
    <Layout className="ant-shell">
      <Sider width={240} className="ant-sider">
        <div className="brand">Chess Master Backoffice</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeKey]}
          items={navItems.map((item) => ({ key: item.key, label: item.label }))}
          onClick={({ key }) => onNavigate(key)}
        />
        <div className="sidebar-footer">
          Signed in as <strong>{admin.username}</strong>
          <br />
          <Button type="link" size="small" onClick={onLogout}>
            Logout
          </Button>
        </div>
      </Sider>
      <Layout>
        <Header className="ant-header">
          <div className="eyebrow">Backoffice</div>
          <Title level={4} style={{ color: "#0f172a", margin: 0 }}>
            User Management
          </Title>
        </Header>
        <Content className="ant-content">{children}</Content>
      </Layout>
    </Layout>
  );
}
