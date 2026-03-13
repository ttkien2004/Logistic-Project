from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import networkx as nx
from pydantic import BaseModel
from typing import List

# Import hàm thuật toán bạn đã viết
from algorithms.dijkstra import dijkstra_step_by_step
from algorithms.astar import astar_step_by_step
# Import service OSRM vừa tạo
from services.osrm_service import get_distance_matrix, get_route_geometry
from services.tsp_solver import solve_tsp
from services.tsp_visualizer import tsp_step_by_step

app = FastAPI(title="Delivery Optimization API")

# --- CẤU HÌNH CORS ---
# Rất quan trọng: Giúp Frontend (React) có quyền gọi API từ Backend mà không bị trình duyệt chặn
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Trong thực tế nên để ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- KHỞI TẠO ĐỒ THỊ MẪU ---
# Đồ thị này phải khớp chính xác với cấu trúc graph ở frontend để hình ảnh đồng bộ
def create_demo_graph():
    G = nx.Graph()
    # Thêm các cạnh kèm trọng số (weight)
    edges = [
        ('A', 'B', 4), ('A', 'C', 3),
        ('B', 'C', 1), ('B', 'D', 2),
        ('C', 'D', 3), ('C', 'F', 6),
        ('D', 'E', 3), ('D', 'F', 1),
        ('E', 'G', 2), ('F', 'G', 5)
    ]
    for u, v, w in edges:
        G.add_edge(u, v, weight=w)
    return G

# --- ĐỊNH NGHĨA API ENDPOINT ---
@app.get("/api/dijkstra")
def run_dijkstra_demo():
    """
    API chạy thuật toán Dijkstra và trả về danh sách các bước trạng thái.
    """
    # 1. Tạo đồ thị
    graph = create_demo_graph()
    
    # 2. Chạy thuật toán. 
    # Vì hàm dijkstra_step_by_step dùng từ khóa `yield` (Generator),
    # ta dùng list() để chạy toàn bộ vòng lặp và gom các kết quả vào một mảng.
    steps_list = list(dijkstra_step_by_step(graph, start_node='A', end_node='G'))
    
    # 3. Trả dữ liệu về cho Frontend dưới dạng JSON
    return {
        "success": True,
        "total_steps": len(steps_list),
        "steps": steps_list
    }

@app.get("/api/astar")
def run_astar_demo():
    graph = create_demo_graph()
    # Heuristic (h): Khoảng cách đường chim bay ước lượng từ mỗi đỉnh đến G
    heuristics = {
        'A': 8, 'B': 6, 'C': 5, 
        'D': 3, 'E': 2, 'F': 4, 'G': 0
    }
    steps_list = list(astar_step_by_step(graph, 'A', 'G', heuristics))
    return {
        "success": True,
        "total_steps": len(steps_list),
        "steps": steps_list
    }

# Định nghĩa cấu trúc dữ liệu Frontend gửi lên
class Coordinate(BaseModel):
    id: int
    lat: float
    lng: float
    type: str  # 'depot' hoặc 'delivery'

class OptimizeRequest(BaseModel):
    locations: List[Coordinate]

@app.post("/api/optimize/instant")
def optimize_delivery_route(request: OptimizeRequest):
    locations = request.locations
    if len(locations) < 2:
        raise HTTPException(status_code=400, detail="Cần ít nhất 2 điểm.")

    try:
        # 1. Chuyển object thành dict
        coords_list = [{"lat": loc.lat, "lng": loc.lng, "id": loc.id, "type": loc.type} for loc in locations]
        
        # 2. Gọi OSRM lấy Ma trận thời gian
        time_matrix, _ = get_distance_matrix(coords_list)
        
        # 3. Chạy OR-Tools để giải TSP
        optimized_indices = solve_tsp(time_matrix)
        
        if not optimized_indices:
            raise HTTPException(status_code=500, detail="Không thể tìm ra lộ trình tối ưu.")
            
        # 4. Sắp xếp lại danh sách điểm theo thứ tự tối ưu
        optimized_coords = [coords_list[i] for i in optimized_indices]
        
        # Vì giao hàng xong thường phải về kho, ta nối điểm kho (index 0) vào cuối lộ trình
        # optimized_coords.append(coords_list[optimized_indices[0]])
        
        # 5. Gọi OSRM lấy hình dáng tuyến đường (Geometry)
        geometry, total_dist, total_time = get_route_geometry(optimized_coords)
        
        # Trả toàn bộ dữ liệu sạch sẽ về cho Frontend
        return {
            "success": True,
            "optimized_indices": optimized_indices,
            "optimized_locations": optimized_coords,
            "route_geometry": geometry,
            "total_distance_km": round(total_dist / 1000, 2), # Đổi mét ra km
            "total_time_mins": round(total_time / 60, 2)      # Đổi giây ra phút
        }
        
    except Exception as e:
        print("Lỗi backend:", e) # Print ra terminal để dễ debug
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/optimize/animated")
def optimize_delivery_route(request: OptimizeRequest):
    locations = request.locations
    # TSP cần ít nhất 3 điểm (1 kho + 2 khách) thì mới có sự chéo nhau để gỡ
    if len(locations) < 3: 
        raise HTTPException(status_code=400, detail="Cần ít nhất 3 điểm (1 Kho, 2 Điểm giao) để xem quá trình tối ưu.")

    try:
        coords_list = [{"lat": loc.lat, "lng": loc.lng, "id": loc.id, "type": loc.type} for loc in locations]
        
        # 1. Gọi OSRM lấy Ma trận
        time_matrix, dist_matrix = get_distance_matrix(coords_list)
        
        # 2. Chạy thuật toán tự viết, lưu toàn bộ các bước (yield) vào một list
        # Ta dùng dist_matrix (ma trận khoảng cách) để tính toán cho trực quan
        steps_generator = tsp_step_by_step(dist_matrix)
        steps = list(steps_generator)
        
        # 3. Ở bước cuối cùng (DONE), ta gọi OSRM để lấy Geometry (hình dáng đường thật)
        final_step = steps[-1]
        final_indices = final_step["route_indices"]
        optimized_coords = [coords_list[i] for i in final_indices]
        
        geometry, total_dist, total_time = get_route_geometry(optimized_coords)
        
        # Gắn thêm dữ liệu vào bước cuối cùng
        final_step["geometry"] = geometry
        final_step["total_time_mins"] = round(total_time / 60, 2)
        final_step["current_distance"] = round(total_dist / 1000, 2) # Đổi ra km
        
        # Đối với các bước trước đó, đổi đơn vị distance ra km cho dễ nhìn
        for step in steps[:-1]:
            step["current_distance"] = round(step["current_distance"] / 1000, 2)

        return {
            "success": True,
            "original_locations": coords_list, # Gửi kèm tọa độ gốc để React tự nối nét đứt
            "total_steps": len(steps),
            "steps": steps
        }
        
    except Exception as e:
        print("Lỗi backend:", e)
        raise HTTPException(status_code=500, detail=str(e))
# API Test sức khỏe server
@app.get("/api/health")
def health_check():
    return {"status": "ok"}