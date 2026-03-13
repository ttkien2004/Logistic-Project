import { Tag } from "antd";
import BaseVisualizer from "./BaseVisualizer";

// 1. Cấu hình nhãn cho Node
const formatNodeLabel = (nodeId, step) => {
	const distance = step.distances?.[nodeId];
	const distLabel = distance === "inf" ? "∞" : distance;
	return `${nodeId}\n(${distLabel})`;
};

// 2. Cấu hình dữ liệu cho Bảng
const formatTableData = (nodes, step) => {
	return nodes.map((node) => {
		const id = node.id;
		let status = "Chưa xét";
		let tagColor = "default";
		if (step.visited?.includes(id)) {
			status = "Đã chốt";
			tagColor = "success";
		} else if (step.current_node === id) {
			status = "Đang chọn";
			tagColor = "processing";
		} else if (step.neighbors_updated?.includes(id)) {
			status = "Vừa cập nhật";
			tagColor = "warning";
		}

		return {
			key: id,
			node: id,
			distance:
				step.distances?.[id] === "inf" ? "∞" : step.distances?.[id] || "∞",
			predecessor: step.predecessors?.[id] || "-",
			statusTag: <Tag color={tagColor}>{status}</Tag>,
		};
	});
};

// 3. Cấu hình Cột của Bảng
const tableColumns = [
	{
		title: "Đỉnh",
		dataIndex: "node",
		key: "node",
		align: "center",
		render: (text) => <strong>{text}</strong>,
	},
	{
		title: "Khoảng cách",
		dataIndex: "distance",
		key: "distance",
		align: "center",
	},
	{
		title: "Đỉnh trước",
		dataIndex: "predecessor",
		key: "predecessor",
		align: "center",
	},
	{
		title: "Trạng thái",
		dataIndex: "statusTag",
		key: "statusTag",
		align: "center",
	},
];
export default function DijkstraVisualizer() {
	return (
		<BaseVisualizer
			title="Dijkstra (A → G)"
			apiEndpoint="/dijkstra"
			tableColumns={tableColumns}
			formatNodeLabel={formatNodeLabel}
			formatTableData={formatTableData}
		/>
	);
}
