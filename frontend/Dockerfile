# Sử dụng image Node.js
FROM node:18-alpine

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy package.json và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy toàn bộ mã nguồn frontend
COPY . .

# Expose port mặc định của Vite
EXPOSE 5173

# Chạy Vite dev server và expose ra ngoài network của container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]