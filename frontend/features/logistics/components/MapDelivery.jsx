import React, { useState, useEffect } from "react";
import {
	MapContainer,
	TileLayer,
	Marker,
	Popup,
	useMapEvents,
	Polyline,
} from "react-leaflet";
import { Button, Space, Typography, Card, List, Tag, Spin, Alert } from "antd";
import { DeleteOutlined, SendOutlined } from "@ant-design/icons";
import "leaflet/dist/leaflet.css"; // Bắt buộc phải có file CSS này
import L from "leaflet";

// --- FIX LỖI ICON MẶC ĐỊNH CỦA LEAFLET TRONG REACT ---
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import iconRetina from "leaflet/dist/images/marker-icon-2x.png";
import axiosClient from "../../../services/apiClients";

let DefaultIcon = L.icon({
	iconUrl: icon,
	shadowUrl: iconShadow,
	iconRetinaUrl: iconRetina,
	iconSize: [25, 41],
	iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Tạo icon riêng cho Kho xuất phát (Depot) - Màu đỏ
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

// Component phụ để bắt sự kiện click trên bản đồ
function MapClickHandler({ onMapClick }) {
	useMapEvents({
		click(e) {
			onMapClick(e.latlng);
		},
	});
	return null;
}

export default function MapDelivery() {
	const [markers, setMarkers] = useState([]);

	// Tọa độ trung tâm mặc định (Hồ Chí Minh: 10.762622, 106.660172)
	const defaultCenter = [10.762622, 106.660172];

	// Các state mới cho luồng Tối ưu
	const [loading, setLoading] = useState(false);
	const [routeData, setRouteData] = useState(null); // Lưu geometry, distance, time

	// Xử lý khi click vào bản đồ
	const handleMapClick = (latlng) => {
		const newMarker = {
			id: Date.now(),
			lat: latlng.lat,
			lng: latlng.lng,
			type: markers.length === 0 ? "depot" : "delivery",
		};
		setMarkers([...markers, newMarker]);
		setRouteData(null); // Ẩn route cũ
	};

	// Xóa toàn bộ điểm
	const handleClearMarkers = () => {
		setMarkers([]);
		setRouteData(null); // Ẩn route cũ
	};

	// Xóa 1 điểm cụ thể
	const handleRemoveMarker = (id) => {
		setMarkers(markers.filter((m) => m.id !== id));
		setRouteData(null); // Ẩn route cũ
	};

	// Nút gọi API tối ưu (sẽ làm ở bước sau)
	const handleOptimizeRoute = async () => {
		if (markers.length < 2) return;
		try {
			setLoading(true);
			const response = await axiosClient.post("/optimize/instant", {
				locations: markers,
			});

			if (response.success) {
				setRouteData({
					geometry: response.route_geometry,
					distance: response.total_distance_km,
					time: response.total_time_mins,
					orderedLocations: response.optimized_locations,
				});
			}
		} catch (error) {
			alert("Có lỗi xảy ra khi tối ưu lộ trình. Vui lòng kiểm tra console.");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			style={{ display: "flex", gap: "20px", height: "calc(100vh - 120px)" }}
		>
			{/* CỘT TRÁI: BẢN ĐỒ */}
			<div
				style={{
					flex: 1,
					borderRadius: "8px",
					overflow: "hidden",
					border: "1px solid #d9d9d9",
					position: "relative",
				}}
			>
				{/* Overlay Loading */}
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
							tip="Đang dùng A* và thuật toán Di truyền để tối ưu..."
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
										: `Điểm giao (Gốc: #${index})`}
								</strong>
							</Popup>
						</Marker>
					))}

					{/* Render Tuyến đường (Nếu có) */}
					{routeData && routeData.geometry && (
						<Polyline
							positions={routeData.geometry}
							color="#1890ff"
							weight={5}
							opacity={0.7}
						/>
					)}
				</MapContainer>
			</div>

			{/* CỘT PHẢI: ĐIỀU KHIỂN */}
			<Card
				title="Quản lý Lộ trình"
				style={{ width: "350px", display: "flex", flexDirection: "column" }}
				bodyStyle={{
					flex: 1,
					overflowY: "auto",
					display: "flex",
					flexDirection: "column",
				}}
			>
				{routeData && (
					<Alert
						message="Đã tối ưu lộ trình!"
						description={
							<div>
								<strong>Tổng quãng đường:</strong> {routeData.distance} km{" "}
								<br />
								<strong>Thời gian dự kiến:</strong> {routeData.time} phút
							</div>
						}
						type="success"
						showIcon
						style={{ marginBottom: "16px" }}
					/>
				)}

				<Text type="secondary">Click lên bản đồ để thêm điểm.</Text>

				<List
					style={{
						marginTop: "16px",
						marginBottom: "16px",
						flex: 1,
						overflowY: "auto",
					}}
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
								/>,
							]}
						>
							<List.Item.Meta
								title={
									item.type === "depot" ? (
										<Tag color="red">Kho xuất phát</Tag>
									) : (
										<Tag color="blue">Điểm giao {index}</Tag>
									)
								}
							/>
						</List.Item>
					)}
				/>

				<div
					style={{
						marginTop: "auto",
						display: "flex",
						flexDirection: "column",
						gap: "10px",
					}}
				>
					<Button
						type="default"
						danger
						onClick={handleClearMarkers}
						disabled={markers.length === 0 || loading}
					>
						Xóa tất cả điểm
					</Button>
					<Button
						type="primary"
						size="large"
						icon={<SendOutlined />}
						onClick={handleOptimizeRoute}
						disabled={markers.length < 2}
						loading={loading}
					>
						Tối ưu lộ trình (TSP)
					</Button>
				</div>
			</Card>
		</div>
	);
}
