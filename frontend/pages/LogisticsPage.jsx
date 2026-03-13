import React from "react";
import { Typography, Tabs } from "antd";
import MapDelivery from "../features/logistics/components/MapDelivery";
import MapAnimated from "../features/logistics/components/MapAnimated"; // Đây là file có chứa hiệu ứng gỡ đường chéo
import { ThunderboltOutlined, VideoCameraOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

export default function LogisticsPage() {
	const items = [
		{
			key: "instant",
			label: (
				<span>
					<ThunderboltOutlined /> Chế độ Ứng dụng (Tốc độ)
				</span>
			),
			children: <MapDelivery />,
		},
		{
			key: "animate",
			label: (
				<span>
					<VideoCameraOutlined /> Chế độ Mô phỏng (Algorithm)
				</span>
			),
			children: <MapAnimated />,
		},
	];

	return (
		<div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
			<div style={{ marginBottom: "16px" }}>
				<Title level={2} style={{ margin: 0 }}>
					Tối ưu đường giao hàng (VRP/TSP)
				</Title>
				<Paragraph style={{ margin: 0, color: "#595959" }}>
					Chọn chế độ Mô phỏng để xem thuật toán hoạt động, hoặc chế độ Ứng dụng
					để lấy kết quả tức thì bằng Google OR-Tools.
				</Paragraph>
			</div>

			{/* Thuộc tính destroyInactiveTabPane rất quan trọng để khi chuyển tab, bản đồ bên kia bị reset, không bị lỗi bộ nhớ */}
			<Tabs
				defaultActiveKey="instant"
				items={items}
				type="card"
				size="large"
				destroyInactiveTabPane={true}
			/>
		</div>
	);
}
