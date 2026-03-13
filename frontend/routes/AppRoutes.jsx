import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import AlgorithmPage from "../pages/AlgorithmPage";
import LogisticsPage from "../pages/LogisticsPage";
import Dashboard from "../pages/Dashboard";
import AboutPage from "../pages/AboutPage";

export default function AppRoutes() {
	return (
		<BrowserRouter>
			<Routes>
				{/* Bao bọc các route con bằng MainLayout */}
				<Route path="/" element={<MainLayout />}>
					{/* Redirect từ root '/' sang '/dashboard' */}
					<Route index element={<Navigate to="/dashboard" replace />} />

					{/* Các trang con sẽ được nhúng vào vị trí của <Outlet /> trong MainLayout */}
					<Route path="dashboard" element={<Dashboard />} />
					<Route path="algorithms" element={<AlgorithmPage />} />
					<Route path="logistics" element={<LogisticsPage />} />
					<Route path="about" element={<AboutPage />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}
