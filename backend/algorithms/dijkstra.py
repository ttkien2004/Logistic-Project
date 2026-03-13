import networkx as nx
import heapq

def dijkstra_step_by_step(graph: nx.Graph, start_node, end_node):
    # graph: là đồ thị NetworkX, chứa thông tin cạnh và trọng số
    
    # Bảng khoảng cách: ban đầu mọi node là vô cực, ngoại trừ node bắt đầu
    distances = {node: float('inf') for node in graph.nodes()}
    distances[start_node] = 0
    
    # Hàng đợi ưu tiên (Priority Queue): để luôn lấy node có khoảng cách nhỏ nhất
    # Lưu dưới dạng (khoảng cách, tên_node)
    pq = [(0, start_node)]
    
    # Bảng lưu vết: để khôi phục lại đường đi thực tế
    # Ví dụ: {'B': 'A'} nghĩa là từ A đi đến B là ngắn nhất
    predecessors = {node: None for node in graph.nodes()}
    
    # Tập hợp các node đã được "chốt" khoảng cách ngắn nhất
    visited = set()

    # --- Bước 1: Khởi tạo ---
    # `yield` phát ra trạng thái đầu tiên
    yield {
        "status": "INIT",
        "message": f"Khởi tạo: Bắt đầu từ đỉnh {start_node}",
        "current_node": start_node,
        "distances": {node: str(distances[node]) for node in distances},
        "visited": list(visited),
        "highlight_edges": [], # Chưa có cạnh nào được chốt
        "predecessors": {node: (predecessors[node] if predecessors[node] is not None else "-") for node in predecessors},
    }

    while pq:
        # Lấy node có khoảng cách nhỏ nhất ra khỏi hàng đợi
        current_distance, current_node = heapq.heappop(pq)
        
        # Nếu đã tìm thấy đường đến node đích, ta có thể dừng (tùy chọn)
        # Hoặc tiếp tục để tìm đường đến TẤT CẢ các node. Ở đây ta tiếp tục.

        # Nếu node này đã được chốt, bỏ qua
        if current_node in visited:
            continue
            
        # Chốt node này
        visited.add(current_node)
        
        # --- Bước 2: Đang xét đỉnh ---
        yield {
            "status": "VISITING",
            "message": f"Đang xét đỉnh {current_node}. Nó có khoảng cách nhỏ nhất: {current_distance}",
            "current_node": current_node,
            "distances": {node: str(distances[node]) for node in distances},
            "visited": list(visited),
            # Lấy danh sách cạnh để tô đậm đường đi ngắn nhất đã tìm được
            "highlight_edges": _get_all_shortest_edges(predecessors, visited),
            "predecessors": {node: (predecessors[node] if predecessors[node] is not None else "-") for node in predecessors},
        }

        # Duyệt qua các node hàng xóm
        neighbors_being_updated = []
        for neighbor, weight_data in graph[current_node].items():
            weight = weight_data['weight']
            
            # Nếu hàng xóm chưa được chốt
            if neighbor not in visited:
                new_distance = current_distance + weight
                
                # Nếu tìm được đường đi ngắn hơn đến hàng xóm
                if new_distance < distances[neighbor]:
                    distances[neighbor] = new_distance
                    predecessors[neighbor] = current_node
                    heapq.heappush(pq, (new_distance, neighbor))
                    neighbors_being_updated.append(neighbor)
        
        # --- Bước 3: Cập nhật xong các đỉnh kề ---
        if neighbors_being_updated:
            yield {
                "status": "UPDATED_NEIGHBORS",
                "message": f"Đã cập nhật khoảng cách cho các đỉnh kề: {', '.join(neighbors_being_updated)}",
                "current_node": current_node,
                "distances": {node: str(distances[node]) for node in distances},
                "visited": list(visited),
                "neighbors_updated": neighbors_being_updated,
                "highlight_edges": _get_all_shortest_edges(predecessors, visited),
                "predecessors": {node: (predecessors[node] if predecessors[node] is not None else "-") for node in predecessors},
            }

    # --- Bước cuối: Tìm thấy đường đi ngắn nhất đến đích ---
    path = []
    curr = end_node
    while curr is not None:
        path.append(curr)
        curr = predecessors[curr]
    path.reverse() # Đảo ngược lại để có thứ tự: start -> ... -> end
    
    # `yield` phát ra trạng thái cuối cùng
    yield {
        "status": "DONE",
        "message": f"Đã tìm thấy đường đi ngắn nhất từ {start_node} đến {end_node}: {path}",
        "final_path": path,
        "distances": {node: str(distances[node]) for node in distances},
        "highlight_edges": _get_path_edges(path),
        "predecessors": {node: (predecessors[node] if predecessors[node] is not None else "-") for node in predecessors},
    }

# --- Hàm helper để lấy danh sách cạnh cần tô đậm ---

def _get_all_shortest_edges(predecessors, visited):
    """Lấy tất cả các cạnh đã chốt thuộc 'cây đường đi ngắn nhất'"""
    edges = []
    for node, pred in predecessors.items():
        # Nếu node và pred của nó đều đã chốt, thì cạnh này là chốt
        if pred is not None and node in visited:
            edges.append({'from': pred, 'to': node})
    return edges

def _get_path_edges(path):
    """Lấy các cạnh của một đường đi cụ thể (ví dụ: đường đi cuối cùng)"""
    edges = []
    for i in range(len(path) - 1):
        edges.append({'from': path[i], 'to': path[i+1]})
    return edges