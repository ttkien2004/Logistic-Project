import React from "react";
import { Layout, Menu } from "antd";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
	DashboardOutlined,
	NodeIndexOutlined,
	EnvironmentOutlined,
	InfoCircleOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

export default function MainLayout() {
	const navigate = useNavigate();
	const location = useLocation();

	// Cấu hình các mục trong Sidebar
	const menuItems = [
		{ key: "/about", icon: <InfoCircleOutlined />, label: "Giới thiệu Dự án" },
		{ key: "/dashboard", icon: <DashboardOutlined />, label: "Tổng quan" },
		{
			key: "/algorithms",
			icon: <NodeIndexOutlined />,
			label: "Demo Thuật toán",
		},
		{
			key: "/logistics",
			icon: <EnvironmentOutlined />,
			label: "Bản đồ Giao hàng",
		},
	];

	return (
		<Layout style={{ minHeight: "100vh" }}>
			{/* Cột Sidebar bên trái */}
			<Sider theme="dark" collapsible>
				<div
					style={{
						height: 64,
						margin: 16,
						color: "white",
						textAlign: "center",
						fontSize: "1.2rem",
						fontWeight: "bold",
					}}
				>
					Logistics App
				</div>
				<Menu
					theme="dark"
					mode="inline"
					selectedKeys={[location.pathname]}
					items={menuItems}
					onClick={(e) => navigate(e.key)} // Chuyển trang khi click
				/>
			</Sider>

			{/* Khu vực nội dung bên phải */}
			<Layout>
				{/* Thanh Header dùng chung */}
				<Header
					style={{
						background: "#fff",
						padding: "0 24px",
						fontSize: "1.2rem",
						fontWeight: "bold",
					}}
				>
					Hệ thống Tối ưu Đường Giao Hàng
				</Header>

				{/* Phần Content thay đổi theo từng trang */}
				<Content
					style={{
						margin: "24px",
						padding: 24,
						background: "#fff",
						borderRadius: 8,
					}}
				>
					{/* Nơi render các Pages (Dashboard, AlgorithmPage, LogisticsPage...) */}
					<Outlet />
				</Content>
			</Layout>
		</Layout>
	);
}
