import React, { useState, useEffect } from "react";
import {
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	useMapEvents,
	Polyline,
} from "react-leaflet";
import {
	Button,
	Space,
	Typography,
	Card,
	List,
	Tag,
	Spin,
	Alert,
	Progress,
} from "antd";
import {
	DeleteOutlined,
	SendOutlined,
	PlayCircleOutlined,
	PauseCircleOutlined,
	StepForwardOutlined,
	StepBackwardOutlined,
} from "@ant-design/icons";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axiosClient from "../../../services/apiClients";

import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";

let DefaultIcon = L.icon({
	iconUrl: icon,
	shadowUrl: iconShadow,
	iconRetinaUrl: iconRetina,
	iconSize: [25, 41],
	iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;
const depotIcon = new L.Icon({
	iconUrl:
		"https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
	shadowUrl:
		"https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
	iconSize: [25, 41],
	iconAnchor: [12, 41],
	popupAnchor: [1, -34],
});

const { Title, Text } = Typography;

function MapClickHandler({ onMapClick }) {
	useMapEvents({
		click(e) {
			onMapClick(e.latlng);
		},
	});
	return null;
}

export default function MapAnimated() {
	const [markers, setMarkers] = useState([]);
	const [loading, setLoading] = useState(false);

	// State quản lý Animation
	const [stepsData, setStepsData] = useState([]);
	const [originalLocations, setOriginalLocations] = useState([]);
	const [currentStep, setCurrentStep] = useState(0);
	const [isPlaying, setIsPlaying] = useState(false);

	const defaultCenter = [10.762622, 106.660172];

	// --- LOGIC AUTO PLAY ---
	useEffect(() => {
		let timer;
		if (
			isPlaying &&
			stepsData.length > 0 &&
			currentStep < stepsData.length - 1
		) {
			timer = setTimeout(() => {
				setCurrentStep((prev) => prev + 1);
			}, 600); // 0.6 giây nhảy 1 bước
		} else if (currentStep >= stepsData.length - 1) {
			setIsPlaying(false); // Dừng khi đến bước cuối
		}
		return () => clearTimeout(timer);
	}, [isPlaying, currentStep, stepsData]);

	const handleMapClick = (latlng) => {
		const newMarker = {
			id: Date.now(),
			lat: latlng.lat,
			lng: latlng.lng,
			type: markers.length === 0 ? "depot" : "delivery",
		};
		setMarkers([...markers, newMarker]);
		resetAnimation();
	};

	const resetAnimation = () => {
		setStepsData([]);
		setCurrentStep(0);
		setIsPlaying(false);
	};

	const handleClearMarkers = () => {
		setMarkers([]);
		resetAnimation();
	};

	const handleRemoveMarker = (id) => {
		setMarkers(markers.filter((m) => m.id !== id));
		resetAnimation();
	};

	// GỌI API ĐỂ LẤY KỊCH BẢN (STEPS)
	const handleOptimizeRoute = async () => {
		if (markers.length < 3) {
			alert(
				"Cần ít nhất 3 điểm (1 Kho, 2 Khách) để thuật toán tháo gỡ đường đi.",
			);
			return;
		}
		try {
			setLoading(true);
			resetAnimation();
			const response = await axiosClient.post("/optimize/animated", {
				locations: markers,
			});

			if (response.success) {
				setOriginalLocations(response.original_locations);
				setStepsData(response.steps);
				setCurrentStep(0);
				setIsPlaying(true); // Tự động chạy ngay khi tải xong
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	// Lấy dữ liệu của bước hiện tại để vẽ
	const step = stepsData[currentStep];

	// Tạo mảng tọa độ nét đứt nối các điểm
	let straightLinePositions = [];
	if (step && originalLocations.length > 0) {
		straightLinePositions = step.route_indices.map((idx) => [
			originalLocations[idx].lat,
			originalLocations[idx].lng,
		]);
	}

	return (
		<div
			style={{ display: "flex", gap: "20px", height: "calc(100vh - 120px)" }}
		>
			{/* BẢN ĐỒ */}
			<div
				style={{
					flex: 1,
					borderRadius: "8px",
					overflow: "hidden",
					border: "1px solid #d9d9d9",
					position: "relative",
				}}
			>
				{loading && (
					<div
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							background: "rgba(255,255,255,0.7)",
							zIndex: 1000,
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						<Spin
							size="large"
							tip="Đang tính toán các bước tháo gỡ (2-Opt)..."
						/>
					</div>
				)}

				<MapContainer
					center={defaultCenter}
					zoom={13}
					style={{ height: "100%", width: "100%" }}
				>
					<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
					<MapClickHandler onMapClick={handleMapClick} />

					{/* Render Điểm */}
					{markers.map((marker, index) => (
						<Marker
							key={marker.id}
							position={[marker.lat, marker.lng]}
							icon={marker.type === "depot" ? depotIcon : DefaultIcon}
						>
							<Popup>
								<strong>
									{marker.type === "depot"
										? "Kho xuất phát"
										: `Khách hàng #${index}`}
								</strong>
							</Popup>
						</Marker>
					))}

					{/* VẼ ĐƯỜNG NÉT ĐỨT (TRONG LÚC ĐANG ANIMATION) */}
					{step && step.algorithm !== "DONE" && (
						<Polyline
							positions={straightLinePositions}
							color="#fa8c16"
							dashArray="10, 10"
							weight={3}
							opacity={0.8}
						/>
					)}

					{/* VẼ ĐƯỜNG NÉT LIỀN ĐƯỜNG PHỐ (KHI ĐÃ HOÀN THÀNH) */}
					{step && step.algorithm === "DONE" && step.geometry && (
						<Polyline
							positions={step.geometry}
							color="#1890ff"
							weight={6}
							opacity={0.8}
						/>
					)}
				</MapContainer>
			</div>

			{/* PANEL ĐIỀU KHIỂN */}
			<Card
				title="Quản lý & Giám sát"
				style={{ width: "400px", display: "flex", flexDirection: "column" }}
				bodyStyle={{
					flex: 1,
					overflowY: "auto",
					display: "flex",
					flexDirection: "column",
				}}
			>
				{/* KHU VỰC HIỂN THỊ TRẠNG THÁI ANIMATION */}
				{stepsData.length > 0 && (
					<div
						style={{
							background: "#f5f5f5",
							padding: "16px",
							borderRadius: "8px",
							marginBottom: "16px",
						}}
					>
						<Title level={5} style={{ margin: 0, color: "#1890ff" }}>
							{step?.algorithm}
						</Title>
						<Text type="secondary">{step?.message}</Text>

						<div style={{ marginTop: "12px", marginBottom: "12px" }}>
							<Text strong>Khoảng cách: {step?.current_distance} km</Text>
							{step?.algorithm === "DONE" && (
								<div>
									<Text strong>
										Thời gian lái xe: {step?.total_time_mins} phút
									</Text>
								</div>
							)}
						</div>

						<Progress
							percent={Math.round(((currentStep + 1) / stepsData.length) * 100)}
							status={step?.algorithm === "DONE" ? "success" : "active"}
						/>

						<Space
							style={{
								marginTop: "12px",
								display: "flex",
								justifyContent: "center",
							}}
						>
							<Button
								icon={<StepBackwardOutlined />}
								onClick={() => setCurrentStep((c) => Math.max(0, c - 1))}
								disabled={currentStep === 0 || isPlaying}
							/>
							<Button
								type="primary"
								icon={
									isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />
								}
								onClick={() => setIsPlaying(!isPlaying)}
								disabled={currentStep === stepsData.length - 1}
							>
								{isPlaying ? "Tạm dừng" : "Phát"}
							</Button>
							<Button
								icon={<StepForwardOutlined />}
								onClick={() =>
									setCurrentStep((c) => Math.min(stepsData.length - 1, c + 1))
								}
								disabled={currentStep === stepsData.length - 1 || isPlaying}
							/>
						</Space>
					</div>
				)}

				{stepsData.length === 0 && (
					<Alert
						message="Hướng dẫn"
						description="Click lên bản đồ để thêm ít nhất 3 điểm (1 Kho, 2 Khách hàng)."
						type="info"
						showIcon
						style={{ marginBottom: "16px" }}
					/>
				)}

				{/* DANH SÁCH ĐIỂM */}
				<List
					style={{ flex: 1, overflowY: "auto" }}
					size="small"
					bordered
					dataSource={markers}
					renderItem={(item, index) => (
						<List.Item
							actions={[
								<Button
									type="text"
									danger
									icon={<DeleteOutlined />}
									onClick={() => handleRemoveMarker(item.id)}
									disabled={isPlaying}
								/>,
							]}
						>
							<List.Item.Meta
								title={
									item.type === "depot" ? (
										<Tag color="red">Kho</Tag>
									) : (
										<Tag color="blue">Khách {index}</Tag>
									)
								}
							/>
						</List.Item>
					)}
				/>

				{/* NÚT THAO TÁC */}
				<div
					style={{
						marginTop: "16px",
						display: "flex",
						flexDirection: "column",
						gap: "10px",
					}}
				>
					<Button
						type="default"
						danger
						onClick={handleClearMarkers}
						disabled={markers.length === 0 || loading || isPlaying}
					>
						Xóa tất cả
					</Button>
					<Button
						type="primary"
						size="large"
						icon={<SendOutlined />}
						onClick={handleOptimizeRoute}
						disabled={markers.length < 3}
						loading={loading}
					>
						Chạy mô phỏng (TSP)
					</Button>
				</div>
			</Card>
		</div>
	);
}
