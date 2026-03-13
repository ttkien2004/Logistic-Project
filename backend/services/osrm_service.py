import requests
import logging
import math

logger = logging.getLogger(__name__)

OSRM_BASE_URL = "http://router.project-osrm.org"

# --- HÀM TỰ TÍNH TOÁN (DỰ PHÒNG KHI OSRM SẬP) ---
def _haversine_distance(lat1, lon1, lat2, lon2):
    """Tính khoảng cách đường chim bay (mét) giữa 2 tọa độ"""
    R = 6371000 # Bán kính Trái Đất (mét)
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi/2)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2)**2
    return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

def _generate_fallback_matrix(coordinates):
    """Tạo ma trận giả lập nếu API thật bị lỗi"""
    logger.warning("Đang sử dụng Fallback Matrix (Đường chim bay) do OSRM sập.")
    size = len(coordinates)
    distance_matrix = [[0]*size for _ in range(size)]
    time_matrix = [[0]*size for _ in range(size)]
    
    for i in range(size):
        for j in range(size):
            if i != j:
                dist = _haversine_distance(
                    coordinates[i]['lat'], coordinates[i]['lng'],
                    coordinates[j]['lat'], coordinates[j]['lng']
                )
                distance_matrix[i][j] = dist
                # Giả sử xe đi với tốc độ 40km/h (~11.1 m/s)
                time_matrix[i][j] = dist / 11.1 
                
    return time_matrix, distance_matrix

# --- CÁC HÀM GỌI API CHÍNH ---

def get_distance_matrix(coordinates):
    coord_strings = [f"{pt['lng']},{pt['lat']}" for pt in coordinates]
    coord_param = ";".join(coord_strings)
    url = f"{OSRM_BASE_URL}/table/v1/driving/{coord_param}?annotations=duration,distance"
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        if data.get("code") == "Ok":
            return data["durations"], data["distances"]
            
        raise Exception("OSRM trả về lỗi logic.")
    except Exception as e:
        logger.error(f"Lỗi gọi OSRM Matrix: {e}")
        # THAY VÌ BÁO LỖI, TA TRẢ VỀ MA TRẬN TỰ TÍNH!
        return _generate_fallback_matrix(coordinates)

def get_route_geometry(coordinates):
    coord_strings = [f"{pt['lng']},{pt['lat']}" for pt in coordinates]
    coord_param = ";".join(coord_strings)
    url = f"{OSRM_BASE_URL}/route/v1/driving/{coord_param}?overview=full&geometries=geojson"
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        data = response.json()
        
        if data.get("code") == "Ok":
            route = data["routes"][0]
            geometry = [[pt[1], pt[0]] for pt in route["geometry"]["coordinates"]]
            return geometry, route["distance"], route["duration"]
            
        raise Exception("OSRM trả về lỗi logic.")
    except Exception as e:
        logger.error(f"Lỗi lấy route geometry: {e}")
        # DỰ PHÒNG: Trả về đường thẳng nối các điểm (đường chim bay)
        fallback_geometry = [[pt['lat'], pt['lng']] for pt in coordinates]
        
        # Tính tổng quãng đường/thời gian dự phòng
        time_matrix, dist_matrix = _generate_fallback_matrix(coordinates)
        total_dist = sum(dist_matrix[i][i+1] for i in range(len(coordinates)-1))
        total_time = sum(time_matrix[i][i+1] for i in range(len(coordinates)-1))
        
        return fallback_geometry, total_dist, total_time