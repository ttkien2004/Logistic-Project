from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
import logging

logger = logging.getLogger(__name__)

def solve_tsp(cost_matrix):
    """
    Hàm giải quyết bài toán Người chào hàng (TSP) bằng Google OR-Tools.
    
    :param cost_matrix: Ma trận chi phí (thời gian hoặc khoảng cách) NxN.
                        Lưu ý: OR-Tools yêu cầu dữ liệu đầu vào là số nguyên (int).
    :return: Mảng chứa thứ tự các node tối ưu. VD: [0, 3, 1, 2]
    """
    
    # 1. Ép kiểu ma trận về số nguyên (vì API OSRM đôi khi trả về float)
    int_matrix = []
    for row in cost_matrix:
        int_matrix.append([int(val) for val in row])

    # 2. Khởi tạo dữ liệu mô hình
    data = {}
    data['distance_matrix'] = int_matrix
    data['num_vehicles'] = 1  # TSP chỉ có 1 shipper. Nếu >1 thì là bài toán VRP.
    data['depot'] = 0         # Điểm xuất phát luôn là điểm đầu tiên trong mảng (Kho)

    # 3. Khởi tạo Routing Index Manager và Routing Model
    # Manager quản lý việc ánh xạ giữa Node ID (chỉ số mảng) và Index bên trong OR-Tools
    manager = pywrapcp.RoutingIndexManager(
        len(data['distance_matrix']), 
        data['num_vehicles'], 
        data['depot']
    )
    routing = pywrapcp.RoutingModel(manager)

    # 4. Tạo hàm Callback để OR-Tools lấy khoảng cách giữa 2 điểm bất kỳ
    def distance_callback(from_index, to_index):
        # Chuyển đổi từ Routing Index sang Node ID của chúng ta
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return data['distance_matrix'][from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(distance_callback)

    # Báo cho OR-Tools biết chi phí đi lại giữa các điểm chính là hàm callback trên
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)

    # 5. CẤU HÌNH CÁC THUẬT TOÁN TÌM KIẾM (ĐÂY LÀ LÚC KIẾN THỨC CỦA BẠN TỎA SÁNG)
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    
    # --- THUẬT TOÁN TẠO LỘ TRÌNH THÔ BAN ĐẦU (First Solution Strategy) ---
    # PATH_CHEAPEST_ARC hoạt động tương tự như Nearest Neighbor (Tham lam)
    search_parameters.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )

    # --- THUẬT TOÁN TỐI ƯU HÓA (Metaheuristics / Local Search) ---
    # GUIDED_LOCAL_SEARCH là một dạng metaheuristic cực mạnh (mạnh hơn 2-Opt),
    # nó tự động thoát khỏi tối ưu cục bộ để tìm kết quả toàn cục tốt nhất.
    search_parameters.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    
    # Giới hạn thời gian chạy (quan trọng với GUIDED_LOCAL_SEARCH vì nó chạy vô hạn)
    # Tối đa 3 giây tính toán là quá đủ cho Last-mile delivery (dưới 100 điểm)
    search_parameters.time_limit.seconds = 3

    # 6. Bắt đầu giải bài toán
    logger.info("Đang chạy OR-Tools để tìm lộ trình tối ưu...")
    solution = routing.SolveWithParameters(search_parameters)

    # 7. Trích xuất kết quả
    if solution:
        optimized_route = []
        index = routing.Start(0) # Bắt đầu từ Kho
        
        while not routing.IsEnd(index):
            optimized_route.append(manager.IndexToNode(index))
            index = solution.Value(routing.NextVar(index))
            
        # Không bắt buộc: Nếu muốn hiển thị đường quay về kho, mở comment dòng dưới
        # optimized_route.append(manager.IndexToNode(index)) 
        
        logger.info(f"Đã tìm thấy lộ trình: {optimized_route}")
        return optimized_route
    else:
        logger.error("OR-Tools không thể tìm được giải pháp!")
        return None