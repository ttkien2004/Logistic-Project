import axios from "axios";

const axiosClient = axios.create({
	// URL của Backend FastAPI chạy qua Docker (hoặc localhost)
	baseURL: "http://localhost:8000/api",
	headers: {
		"Content-Type": "application/json",
	},
	timeout: 60000,
});

// Interceptor cho Request: Can thiệp trước khi gửi API đi
axiosClient.interceptors.request.use(
	(config) => {
		// Ví dụ: Lấy token từ localStorage và gắn vào header nếu có
		// const token = localStorage.getItem('token');
		// if (token) {
		//   config.headers.Authorization = `Bearer ${token}`;
		// }
		return config;
	},
	(error) => {
		return Promise.reject(error);
	},
);

// Interceptor cho Response: Can thiệp sau khi nhận kết quả từ Backend
axiosClient.interceptors.response.use(
	(response) => {
		// Nếu API trả về thành công, chỉ lấy phần data
		return response.data;
	},
	(error) => {
		// Xử lý lỗi chung toàn hệ thống (VD: Hiện thông báo lỗi)
		console.error("API Error:", error.response?.data || error.message);
		// Có thể dispatch một action thông báo lỗi UI ở đây
		return Promise.reject(error);
	},
);

export default axiosClient;
