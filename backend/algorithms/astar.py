import networkx as nx
import heapq

def astar_step_by_step(graph: nx.Graph, start_node, end_node, heuristics):
    # g_score: Khoảng cách thực tế từ nguồn (giống Dijkstra)
    g_scores = {node: float('inf') for node in graph.nodes()}
    g_scores[start_node] = 0
    
    # f_score = g_score + heuristic (Chi phí tổng)
    f_scores = {node: float('inf') for node in graph.nodes()}
    f_scores[start_node] = heuristics[start_node]
    
    # Priority queue lưu (f_score, node)
    pq = [(f_scores[start_node], start_node)]
    predecessors = {node: None for node in graph.nodes()}
    visited = set()

    yield {
        "status": "INIT",
        "message": f"Khởi tạo A*: Bắt đầu từ {start_node}. f({start_node}) = g(0) + h({heuristics[start_node]})",
        "current_node": start_node,
        "g_scores": {n: str(g_scores[n]) for n in graph.nodes()},
        "f_scores": {n: str(f_scores[n]) for n in graph.nodes()},
        "heuristics": heuristics,
        "predecessors": {n: (predecessors[n] or "-") for n in predecessors},
        "visited": list(visited),
        "highlight_edges": []
    }

    while pq:
        current_f, current_node = heapq.heappop(pq)

        if current_node in visited:
            continue
            
        visited.add(current_node)

        # Trạng thái đang xét
        yield {
            "status": "VISITING",
            "message": f"Xét đỉnh {current_node} với f({current_node}) nhỏ nhất là {current_f}",
            "current_node": current_node,
            "g_scores": {n: str(g_scores[n]) for n in graph.nodes()},
            "f_scores": {n: str(f_scores[n]) for n in graph.nodes()},
            "heuristics": heuristics,
            "predecessors": {n: (predecessors[n] or "-") for n in predecessors},
            "visited": list(visited),
            "highlight_edges": _get_all_shortest_edges(predecessors, visited)
        }

        # Nếu đã pop được đích ra khỏi PQ -> Tìm thấy đường ngắn nhất!
        if current_node == end_node:
            break

        neighbors_updated = []
        for neighbor, weight_data in graph[current_node].items():
            if neighbor in visited:
                continue

            weight = weight_data['weight']
            tentative_g = g_scores[current_node] + weight

            if tentative_g < g_scores[neighbor]:
                predecessors[neighbor] = current_node
                g_scores[neighbor] = tentative_g
                f_scores[neighbor] = tentative_g + heuristics[neighbor]
                heapq.heappush(pq, (f_scores[neighbor], neighbor))
                neighbors_updated.append(neighbor)

        if neighbors_updated:
            yield {
                "status": "UPDATED_NEIGHBORS",
                "message": f"Cập nhật f(n)=g(n)+h(n) cho: {', '.join(neighbors_updated)}",
                "current_node": current_node,
                "g_scores": {n: str(g_scores[n]) for n in graph.nodes()},
                "f_scores": {n: str(f_scores[n]) for n in graph.nodes()},
                "heuristics": heuristics,
                "predecessors": {n: (predecessors[n] or "-") for n in predecessors},
                "visited": list(visited),
                "neighbors_updated": neighbors_updated,
                "highlight_edges": _get_all_shortest_edges(predecessors, visited)
            }

    # Traceback đường đi
    path = []
    curr = end_node
    while curr is not None:
        path.append(curr)
        curr = predecessors[curr]
    path.reverse()

    yield {
        "status": "DONE",
        "message": f"Đã đến đích {end_node}! Lộ trình: {' -> '.join(path)}",
        "final_path": path,
        "g_scores": {n: str(g_scores[n]) for n in graph.nodes()},
        "f_scores": {n: str(f_scores[n]) for n in graph.nodes()},
        "heuristics": heuristics,
        "predecessors": {n: (predecessors[n] or "-") for n in predecessors},
        "highlight_edges": _get_path_edges(path)
    }

def _get_all_shortest_edges(predecessors, visited):
    return [{'from': p, 'to': n} for n, p in predecessors.items() if p and n in visited]

def _get_path_edges(path):
    return [{'from': path[i], 'to': path[i+1]} for i in range(len(path)-1)]