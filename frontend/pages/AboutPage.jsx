import React from "react";
import {
	Typography,
	Card,
	Row,
	Col,
	Timeline,
	Tag,
	Divider,
	Space,
} from "antd";
import {
	CodeOutlined,
	RocketOutlined,
	ApiOutlined,
	CheckCircleOutlined,
	ShareAltOutlined,
} from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

export default function AboutPage() {
	return (
		<div
			style={{ maxWidth: "1000px", margin: "0 auto", paddingBottom: "24px" }}
		>
			{/* HEADER SECTION */}
			<div style={{ textAlign: "center", marginBottom: "40px" }}>
				<Title level={1} style={{ color: "#1890ff", marginBottom: "8px" }}>
					Last-mile Delivery Optimization
				</Title>
				<Text type="secondary" style={{ fontSize: "1.2rem" }}>
					Hệ thống trực quan hóa giải thuật và tối ưu hóa tuyến đường giao hàng
					thực tế.
				</Text>
			</div>

			{/* BỐI CẢNH & BÀI TOÁN */}
			<Card
				title={
					<>
						<RocketOutlined /> Bài toán Nghiệp vụ
					</>
				}
				bordered={false}
				style={{ marginBottom: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
			>
				<Paragraph style={{ fontSize: "1.1rem", lineHeight: "1.8" }}>
					Trong lĩnh vực Logistics, "Last-mile delivery" (Giao hàng chặng cuối)
					là khâu tốn kém và phức tạp nhất, chiếm đến 53% tổng chi phí vận
					chuyển. Khi một shipper cần giao hàng cho nhiều người dùng khác nhau —
					một bài toán cực kỳ phổ biến trong các mô hình thương mại điện tử hoặc
					các sàn giao dịch C2C kết nối người mua và người bán — việc tìm ra thứ
					tự giao hàng tối ưu không chỉ giúp giảm lượng nhiên liệu tiêu thụ mà
					còn rút ngắn đáng kể thời gian chờ đợi.
				</Paragraph>
				<Paragraph style={{ fontSize: "1.1rem", lineHeight: "1.8" }}>
					Dự án này được xây dựng nhằm hai mục đích:
				</Paragraph>
				<ul>
					<li>
						<Text strong>Học thuật:</Text> Trực quan hóa các thuật toán tìm
						đường kinh điển (Dijkstra, A*), tạo nền tảng vững chắc cho tư duy
						giải thuật và cấu trúc dữ liệu tối ưu.
					</li>
					<li>
						<Text strong>Thực tiễn:</Text> Tích hợp dữ liệu bản đồ thực
						(OpenStreetMap) và thuật toán tối ưu tổ hợp (TSP) để giải quyết bài
						toán định tuyến thực tế trên đường phố.
					</li>
				</ul>
			</Card>

			{/* PIPELINE HỆ THỐNG */}
			<Card
				title={
					<>
						<ApiOutlined /> Luồng xử lý Hệ thống (Pipeline)
					</>
				}
				bordered={false}
				style={{ marginBottom: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
			>
				<Timeline
					mode="left"
					items={[
						{
							color: "blue",
							children: (
								<>
									<Text strong style={{ fontSize: "1.1rem" }}>
										1. Thu thập Tọa độ (Frontend)
									</Text>
									<Paragraph type="secondary">
										Người dùng tương tác với bản đồ Leaflet để chọn Kho xuất
										phát và các điểm giao hàng. Dữ liệu (Lat/Lng) được gửi xuống
										Backend.
									</Paragraph>
								</>
							),
						},
						{
							color: "green",
							children: (
								<>
									<Text strong style={{ fontSize: "1.1rem" }}>
										2. Lấy Ma trận Khoảng cách (OSRM API)
									</Text>
									<Paragraph type="secondary">
										Backend giao tiếp với Open Source Routing Machine. OSRM sử
										dụng thuật toán <Text code>A* Search</Text> ngầm để quét qua
										mạng lưới đường giao thông, tính toán khoảng cách và thời
										gian lái xe thực tế giữa mọi cặp điểm (Distance Matrix).
									</Paragraph>
								</>
							),
						},
						{
							color: "orange",
							children: (
								<>
									<Text strong style={{ fontSize: "1.1rem" }}>
										3. Tối ưu Tổ hợp - TSP (Google OR-Tools)
									</Text>
									<Paragraph type="secondary">
										Ma trận chi phí được đưa vào engine OR-Tools. Hệ thống sử
										dụng thuật toán <Text code>Nearest Neighbor</Text> để lấy lộ
										trình thô, sau đó áp dụng Metaheuristics (
										<Text code>Guided Local Search / 2-Opt</Text>) để gỡ các nút
										thắt, tìm ra thứ tự ghé thăm tối ưu nhất.
									</Paragraph>
								</>
							),
						},
						{
							color: "red",
							children: (
								<>
									<Text strong style={{ fontSize: "1.1rem" }}>
										4. Hiển thị Kết quả (GeoJSON)
									</Text>
									<Paragraph type="secondary">
										Backend lấy dữ liệu Polyline của tuyến đường tối ưu và trả
										về cho React. Bản đồ hiển thị vòng lặp khép kín hoàn hảo kèm
										thông số tiết kiệm.
									</Paragraph>
								</>
							),
						},
					]}
				/>
			</Card>

			{/* TECH STACK */}
			<Title level={4} style={{ marginTop: "32px", marginBottom: "16px" }}>
				<CodeOutlined /> Công nghệ Sử dụng
			</Title>
			<Row gutter={[16, 16]}>
				<Col xs={24} md={12}>
					<Card size="small" title="Frontend (Giao diện)" bordered={true}>
						<Space size={[0, 8]} wrap>
							<Tag color="cyan">React.js</Tag>
							<Tag color="blue">Ant Design</Tag>
							<Tag color="green">React-Leaflet (OSM)</Tag>
							<Tag color="purple">Vis-Network (Đồ thị)</Tag>
							<Tag color="magenta">Axios</Tag>
						</Space>
					</Card>
				</Col>
				<Col xs={24} md={12}>
					<Card
						size="small"
						title="Backend (Máy chủ & Tính toán)"
						bordered={true}
					>
						<Space size={[0, 8]} wrap>
							<Tag color="gold">Python</Tag>
							<Tag color="volcano">FastAPI</Tag>
							<Tag color="red">Google OR-Tools</Tag>
							<Tag color="lime">NetworkX</Tag>
							<Tag color="geekblue">OSRM Routing API</Tag>
						</Space>
					</Card>
				</Col>
			</Row>

			<Divider />

			<div style={{ textAlign: "center" }}>
				<Text type="secondary">
					<CheckCircleOutlined /> Thiết kế kiến trúc module hóa giúp dễ dàng mở
					rộng sang bài toán VRP (Nhiều Shipper) trong tương lai.
				</Text>
			</div>
		</div>
	);
}
