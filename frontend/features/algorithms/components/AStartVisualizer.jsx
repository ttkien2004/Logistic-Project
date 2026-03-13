import React from "react";
import { Tag } from "antd";
import BaseVisualizer from "./BaseVisualizer";

// 1. Cấu hình nhãn cho Node (hiển thị f thay vì distance)
const formatNodeLabel = (nodeId, step) => {
	const fValue = step.f_scores?.[nodeId];
	const fLabel = fValue === "inf" ? "∞" : fValue;
	return `${nodeId}\n(f:${fLabel})`;
};

// 2. Cấu hình dữ liệu cho Bảng (tính f = g + h)
const formatTableData = (nodes, step) => {
	return nodes.map((node) => {
		const id = node.id;
		const g = step.g_scores?.[id] || "∞";
		const h = step.heuristics?.[id] || 0;
		const f = step.f_scores?.[id] || "∞";

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
			calculation: f === "inf" ? "∞" : `${g} + ${h} = ${f}`,
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
		title: "Chi phí: f(n) = g(n) + h(n)",
		dataIndex: "calculation",
		key: "calculation",
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
export default function AStarVisualizer() {
	return (
		<BaseVisualizer
			title="A* Search (A → G)"
			apiEndpoint="/astar"
			tableColumns={tableColumns}
			formatNodeLabel={formatNodeLabel}
			formatTableData={formatTableData}
		/>
	);
}
