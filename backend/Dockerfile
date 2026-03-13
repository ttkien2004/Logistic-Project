# Sử dụng image Python nhẹ
FROM python:3.11-slim

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy file requirements và cài đặt thư viện
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ mã nguồn backend vào container
COPY . .

# Expose port 8000 cho FastAPI
EXPOSE 8000

# Lệnh chạy server khi container khởi động
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]