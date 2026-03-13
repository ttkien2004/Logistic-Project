import React, { useEffect, useRef, useState } from "react";
import { Network } from "vis-network";
import { Button, Space, Typography, Table, Row, Col, Spin, Alert } from "antd";
import {
	StepForwardOutlined,
	StepBackwardOutlined,
	UndoOutlined,
} from "@ant-design/icons";
import axiosClient from "../../../services/apiClients";

const { Title, Text } = Typography;

// --- Đồ thị gốc dùng chung cho cả 2 thuật toán ---
const initialGraph = {
	nodes: [
		{ id: "A", x: 0, y: 0 },
		{ id: "B", x: 150, y: -100 },
		{ id: "C", x: 150, y: 100 },
		{ id: "D", x: 300, y: 0 },
		{ id: "E", x: 450, y: -100 },
		{ id: "F", x: 450, y: 100 },
		{ id: "G", x: 600, y: 0 },
	],
	edges: [
		{ id: "A-B", from: "A", to: "B", label: "4", weight: 4 },
		{ id: "A-C", from: "A", to: "C", label: "3", weight: 3 },
		{ id: "B-C", from: "B", to: "C", label: "1", weight: 1 },
		{ id: "B-D", from: "B", to: "D", label: "2", weight: 2 },
		{ id: "C-D", from: "C", to: "D", label: "3", weight: 3 },
		{ id: "C-F", from: "C", to: "F", label: "6", weight: 6 },
		{ id: "D-E", from: "D", to: "E", label: "3", weight: 3 },
		{ id: "D-F", from: "D", to: "F", label: "1", weight: 1 },
		{ id: "E-G", from: "E", to: "G", label: "2", weight: 2 },
		{ id: "F-G", from: "F", to: "G", label: "5", weight: 5 },
	],
};

const options = {
	nodes: {
		shape: "circle",
		size: 30,
		font: { size: 16, color: "#333" },
		borderWidth: 2,
		shadow: true,
	},
	edges: {
		font: { size: 14, align: "middle" },
		color: { color: "#848484", highlight: "#000000" },
		smooth: { type: "dynamic" },
	},
	physics: false,
	interaction: { hover: true, dragNodes: true, zoomView: true, dragView: true },
};

export default function BaseVisualizer({
	title, // VD: "Dijkstra (A → G)"
	apiEndpoint, // VD: "/dijkstra"
	tableColumns, // Cấu hình cột của bảng
	formatNodeLabel, // Hàm xử lý text hiển thị trên Node
	formatTableData, // Hàm xử lý dữ liệu truyền vào Bảng
}) {
	const networkRef = useRef(null);
	const [network, setNetwork] = useState(null);
	const [currentStep, setCurrentStep] = useState(0);
	const [stepsData, setStepsData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// 1. GỌI API DÙNG CHUNG
	useEffect(() => {
		const fetchSteps = async () => {
			try {
				setLoading(true);
				const response = await axiosClient.get(apiEndpoint);
				setStepsData(response.steps);
			} catch (err) {
				setError(`Lỗi kết nối đến server. Không thể lấy dữ liệu ${title}.`);
			} finally {
				setLoading(false);
			}
		};
		fetchSteps();
	}, [apiEndpoint, title]);

	// 2. KHỞI TẠO ĐỒ THỊ
	useEffect(() => {
		if (loading || error || !networkRef.current) return;

		const newNetwork = new Network(networkRef.current, initialGraph, options);
		setNetwork(newNetwork);

		return () => {
			newNetwork.destroy();
			setNetwork(null); // Quan trọng: Đặt lại thành null sau khi destroy
		};
	}, [loading, error]);

	// 3. CẬP NHẬT TRẠNG THÁI ĐỒ THỊ MỖI BƯỚC
	useEffect(() => {
		// Quan trọng: Phải kiểm tra network.body để chắc chắn đồ thị chưa bị destroy bởi React
		if (!network || !network.body || stepsData.length === 0) return;

		const step = stepsData[currentStep];
		if (!step) return;

		const updatedNodes = initialGraph.nodes.map((node) => {
			let color = "#97C2FC";
			let fontColor = "#000";

			if (node.id === step.current_node && step.status !== "DONE") {
				color = "#ffeb3b";
			} else if (step.visited?.includes(node.id)) {
				color = "#4caf50";
				fontColor = "#fff";
			} else if (step.neighbors_updated?.includes(node.id)) {
				color = "#81d4fa";
			}

			const newLabel = formatNodeLabel(node.id, step);
			return {
				...node,
				label: newLabel,
				color: { background: color, border: "#2b7ce9" },
				font: { color: fontColor },
			};
		});

		const updatedEdges = initialGraph.edges.map((edge) => {
			let width = 1;
			let color = "#848484";
			const shouldHighlight = step.highlight_edges?.some(
				(hEdge) =>
					(hEdge.from === edge.from && hEdge.to === edge.to) ||
					(hEdge.from === edge.to && hEdge.to === edge.from),
			);
			if (shouldHighlight) {
				width = 3;
				color = "#000000";
			}
			return { ...edge, width, color: { color: color } };
		});

		network.setData({ nodes: updatedNodes, edges: updatedEdges });
	}, [network, currentStep, stepsData, formatNodeLabel]);

	// 4. HÀM ĐIỀU KHIỂN
	const handleNext = () =>
		currentStep < stepsData.length - 1 && setCurrentStep(currentStep + 1);
	const handlePrev = () => currentStep > 0 && setCurrentStep(currentStep - 1);
	const handleReset = () => setCurrentStep(0);

	// 5. RENDER UI
	if (loading)
		return (
			<div style={{ textAlign: "center", padding: "50px" }}>
				<Spin size="large" tip={`Đang tải dữ liệu ${title}...`} />
			</div>
		);
	if (error)
		return <Alert message="Lỗi" description={error} type="error" showIcon />;

	const step = stepsData[currentStep] || {};
	// Gọi hàm prop formatTableData để lấy dữ liệu bảng riêng biệt
	const tableData = formatTableData(initialGraph.nodes, step);

	return (
		<div
			style={{ padding: "24px", background: "#f5f5f5", borderRadius: "8px" }}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "16px",
				}}
			>
				<Title level={4} style={{ margin: 0 }}>
					{title}
				</Title>
				<Space>
					<Button
						icon={<StepBackwardOutlined />}
						onClick={handlePrev}
						disabled={currentStep === 0}
					>
						Trước
					</Button>
					<Button
						icon={<StepForwardOutlined />}
						onClick={handleNext}
						disabled={currentStep === stepsData.length - 1}
					>
						Tiếp
					</Button>
					<Button icon={<UndoOutlined />} onClick={handleReset}>
						Reset
					</Button>
					<Text strong>
						Bước: {currentStep + 1} / {stepsData.length || 1}
					</Text>
				</Space>
			</div>

			<div
				style={{
					background: "#fff",
					padding: "16px",
					borderRadius: "4px",
					marginBottom: "16px",
					border: "1px solid #d9d9d9",
				}}
			>
				<Text>
					<strong>Giải thích:</strong> {step.message || "..."}
				</Text>
			</div>

			<Row gutter={24}>
				<Col span={14}>
					<div style={{ fontWeight: "bold", marginBottom: "8px" }}>
						Đồ thị mạng lưới
					</div>
					<div
						ref={networkRef}
						style={{
							height: "450px",
							border: "1px solid #d9d9d9",
							borderRadius: "4px",
							background: "#fff",
						}}
					/>
				</Col>
				<Col span={10}>
					<div style={{ fontWeight: "bold", marginBottom: "8px" }}>
						Bảng cập nhật số liệu
					</div>
					<Table
						dataSource={tableData}
						columns={tableColumns}
						pagination={false}
						size="small"
						bordered
						style={{ background: "#fff" }}
					/>
				</Col>
			</Row>
		</div>
	);
}
