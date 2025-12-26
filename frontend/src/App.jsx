import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import Categories from './pages/Categories';
import Menu from './pages/Menu';
import GuestMenu from './pages/GuestMenu';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route dành riêng cho khách (không có Sidebar) */}
        <Route path="/guest" element={<GuestMenu />} />

        {/* Layout cho Admin (có Sidebar) */}
        <Route
          path="/*"
          element={
            <div className="flex min-h-screen bg-muted/20">
              <Sidebar />
              <main className="flex-1 overflow-y-auto">
                <div className="p-8 max-w-7xl mx-auto">
                  <Routes>
                    <Route path="/" element={<Navigate to="/categories" replace />} />
                    <Route path="/categories" element={<Categories />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/dashboard" element={<div>Trang Dashboard (Đang phát triển)</div>} />
                    <Route path="/orders" element={<div>Trang Đơn hàng (Đang phát triển)</div>} />
                  </Routes>
                </div>
              </main>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;