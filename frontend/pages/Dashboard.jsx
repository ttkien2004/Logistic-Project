import React from "react";
import {
	Row,
	Col,
	Card,
	Statistic,
	Typography,
	Button,
	Space,
	Divider,
} from "antd";
import {
	NodeIndexOutlined,
	EnvironmentOutlined,
	CarOutlined,
	ClockCircleOutlined,
	RiseOutlined,
	CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title, Paragraph, Text } = Typography;

export default function Dashboard() {
	const navigate = useNavigate();

	return (
		<div>
			<div style={{ marginBottom: "24px" }}>
				<Title level={2} style={{ margin: 0 }}>
					Tổng quan Hệ thống
				</Title>
				<Paragraph type="secondary">
					Chào mừng bạn đến với Hệ thống Điều phối và Tối ưu hóa Logistics
					(Last-mile Delivery).
				</Paragraph>
			</div>

			{/* --- HÀNG 1: CÁC CON SỐ THỐNG KÊ (KPIs) --- */}
			<Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
				<Col xs={24} sm={12} md={6}>
					<Card
						bordered={false}
						style={{
							boxShadow:
								"0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12)",
						}}
					>
						<Statistic
							title="Đơn hàng đang giao"
							value={128}
							prefix={<CarOutlined style={{ color: "#1890ff" }} />}
							valueStyle={{ color: "#1890ff", fontWeight: "bold" }}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<Card
						bordered={false}
						style={{
							boxShadow:
								"0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12)",
						}}
					>
						<Statistic
							title="Quãng đường tiết kiệm"
							value={34.5}
							precision={1}
							suffix="km"
							prefix={<RiseOutlined style={{ color: "#52c41a" }} />}
							valueStyle={{ color: "#52c41a", fontWeight: "bold" }}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<Card
						bordered={false}
						style={{
							boxShadow:
								"0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12)",
						}}
					>
						<Statistic
							title="Thời gian tối ưu"
							value={120}
							suffix="phút"
							prefix={<ClockCircleOutlined style={{ color: "#faad14" }} />}
							valueStyle={{ color: "#faad14", fontWeight: "bold" }}
						/>
					</Card>
				</Col>
				<Col xs={24} sm={12} md={6}>
					<Card
						bordered={false}
						style={{
							boxShadow:
								"0 1px 2px -2px rgba(0, 0, 0, 0.16), 0 3px 6px 0 rgba(0, 0, 0, 0.12)",
						}}
					>
						<Statistic
							title="Tỷ lệ giao thành công"
							value={98.2}
							precision={1}
							suffix="%"
							prefix={<CheckCircleOutlined style={{ color: "#722ed1" }} />}
							valueStyle={{ color: "#722ed1", fontWeight: "bold" }}
						/>
					</Card>
				</Col>
			</Row>

			<Divider />

			{/* --- HÀNG 2: LỐI TẮT ĐẾN CÁC TÍNH NĂNG CỐT LÕI --- */}
			<Title level={4} style={{ marginBottom: "16px" }}>
				Các phân hệ chính
			</Title>
			<Row gutter={[24, 24]}>
				{/* Phân hệ 1: Học thuật / Thuật toán */}
				<Col xs={24} md={12}>
					<Card
						hoverable
						style={{
							height: "100%",
							borderColor: "#e6f7ff",
							borderWidth: "2px",
						}}
						onClick={() => navigate("/algorithms")}
					>
						<div
							style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}
						>
							<div
								style={{
									fontSize: "32px",
									color: "#1890ff",
									padding: "12px",
									background: "#e6f7ff",
									borderRadius: "8px",
								}}
							>
								<NodeIndexOutlined />
							</div>
							<div>
								<Title level={4} style={{ marginTop: 0 }}>
									Algorithm Visualizer
								</Title>
								<Paragraph type="secondary" style={{ minHeight: "60px" }}>
									Phân hệ học thuật. Minh họa trực quan từng bước (step-by-step)
									cách hệ thống tìm đường đi ngắn nhất bằng các thuật toán
									Dijkstra và A* Search.
								</Paragraph>
								<Button type="primary" ghost icon={<NodeIndexOutlined />}>
									Khám phá Thuật toán
								</Button>
							</div>
						</div>
					</Card>
				</Col>

				{/* Phân hệ 2: Ứng dụng thực tế */}
				<Col xs={24} md={12}>
					<Card
						hoverable
						style={{
							height: "100%",
							borderColor: "#f6ffed",
							borderWidth: "2px",
						}}
						onClick={() => navigate("/logistics")}
					>
						<div
							style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}
						>
							<div
								style={{
									fontSize: "32px",
									color: "#52c41a",
									padding: "12px",
									background: "#f6ffed",
									borderRadius: "8px",
								}}
							>
								<EnvironmentOutlined />
							</div>
							<div>
								<Title level={4} style={{ marginTop: 0 }}>
									Logistics Map
								</Title>
								<Paragraph type="secondary" style={{ minHeight: "60px" }}>
									Phân hệ thực chiến. Đánh dấu các điểm giao hàng trên bản đồ
									thực tế và sử dụng Google OR-Tools để tối ưu hóa lộ trình khép
									kín (TSP).
								</Paragraph>
								<Button
									type="primary"
									style={{ background: "#52c41a", borderColor: "#52c41a" }}
									icon={<EnvironmentOutlined />}
								>
									Mở Bản đồ Giao hàng
								</Button>
							</div>
						</div>
					</Card>
				</Col>
			</Row>
		</div>
	);
}
