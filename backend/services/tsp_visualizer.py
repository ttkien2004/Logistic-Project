def calculate_total_distance(route_indices, distance_matrix):
    total = 0
    for i in range(len(route_indices) - 1):
        total += distance_matrix[route_indices[i]][route_indices[i+1]]
    return total

def tsp_step_by_step(distance_matrix):
    num_nodes = len(distance_matrix)
    
    # --- BƯỚC 1: NEAREST NEIGHBOR (TẠO LỘ TRÌNH THÔ) ---
    unvisited = set(range(1, num_nodes))
    current_node = 0 # Luôn bắt đầu từ Kho (Index 0)
    route = [0]
    
    while unvisited:
        # Tìm đỉnh chưa thăm gần nhất
        next_node = min(unvisited, key=lambda node: distance_matrix[current_node][node])
        route.append(next_node)
        unvisited.remove(next_node)
        current_node = next_node
        
    route.append(0) # Quay về kho tạo thành vòng khép kín
    
    # YIELD BƯỚC 1: Trả về kết quả của Nearest Neighbor
    yield {
        "algorithm": "Nearest Neighbor",
        "message": "Hoàn thành lộ trình thô bằng thuật toán Tham lam.",
        "route_indices": route.copy(),
        "current_distance": calculate_total_distance(route, distance_matrix)
    }

    # --- BƯỚC 2: 2-OPT (TỐI ƯU HÓA CỤC BỘ) ---
    improved = True
    step_count = 0
    
    while improved:
        improved = False
        # Duyệt qua các cặp cạnh để tìm đoạn chéo nhau
        for i in range(1, len(route) - 2):
            for j in range(i + 1, len(route) - 1):
                if j - i == 1: continue # Bỏ qua các đỉnh liền kề
                
                # Chi phí cũ (nối i-1 với i, và j với j+1)
                old_cost = distance_matrix[route[i-1]][route[i]] + distance_matrix[route[j]][route[j+1]]
                # Chi phí mới nếu đảo ngược đoạn từ i đến j
                new_cost = distance_matrix[route[i-1]][route[j]] + distance_matrix[route[i]][route[j+1]]
                
                if new_cost < old_cost - 0.01:
                    # Đảo ngược đoạn đường từ i đến j (Gỡ chéo)
                    route[i:j+1] = reversed(route[i:j+1])
                    improved = True
                    step_count += 1
                    
                    # YIELD BƯỚC 2: Trả về trạng thái mỗi lần gỡ được 1 đoạn chéo
                    yield {
                        "algorithm": "2-Opt Local Search",
                        "message": f"Bước {step_count}: Đảo cạnh ({route[i-1]}->{route[j]}) và ({route[i]}->{route[j+1]}).",
                        "route_indices": route.copy(),
                        "current_distance": calculate_total_distance(route, distance_matrix)
                    }
                    
    # YIELD BƯỚC 3: Kết thúc
    yield {
        "algorithm": "DONE",
        "message": "Không thể tối ưu thêm. Đã tìm ra lộ trình tốt nhất!",
        "route_indices": route.copy(),
        "current_distance": calculate_total_distance(route, distance_matrix)
    }