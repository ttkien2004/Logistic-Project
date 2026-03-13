import React, { useState, useEffect } from "react";
import { Spin, Alert, Typography, Tabs } from "antd";
import axiosClient from "../services/apiClients";
import DijkstraVisualizer from "../features/algorithms/components/DijkstraVisualizer";
import AStarVisualizer from "../features/algorithms/components/AStartVisualizer";

const { Title, Paragraph } = Typography;

export default function AlgorithmPage() {
	const [stepsData, setStepsData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// useEffect(() => {
	// 	// Hàm gọi API lấy dữ liệu các bước của thuật toán
	// 	const fetchAlgorithmSteps = async () => {
	// 		try {
	// 			setLoading(true);
	// 			// Gọi endpoint /dijkstra từ FastAPI backend
	// 			const response = await axiosClient.get("/dijkstra");

	// 			// Cập nhật state với mảng dữ liệu trả về
	// 			setStepsData(response.steps);
	// 			setError(null);
	// 		} catch (err) {
	// 			console.error("Lỗi khi tải dữ liệu thuật toán:", err);
	// 			setError(
	// 				"Không thể kết nối đến máy chủ tính toán. Vui lòng kiểm tra lại Backend.",
	// 			);
	// 		} finally {
	// 			setLoading(false);
	// 		}
	// 	};

	// 	fetchAlgorithmSteps();
	// }, []); // [] đảm bảo API chỉ gọi 1 lần khi trang được render

	const items = [
		{
			key: "dijkstra",
			label: "Dijkstra",
			children: <DijkstraVisualizer />, // Chứa logic fetch API /api/dijkstra và vẽ đồ thị
		},
		{
			key: "astar",
			label: "A* Search",
			children: <AStarVisualizer />, // Chứa logic fetch API /api/astar và vẽ đồ thị
		},
	];

	return (
		<div>
			<Title level={2}>Trực quan hóa Thuật toán Tìm đường</Title>
			<Paragraph>
				Chọn tab bên dưới để xem cách từng thuật toán quét qua mạng lưới đồ thị.
			</Paragraph>

			<Tabs
				defaultActiveKey="dijkstra"
				items={items}
				type="card"
				size="large"
			/>
		</div>
	);
}
