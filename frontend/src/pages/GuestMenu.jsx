import { useEffect, useState } from 'react';
import ImageWithFallback from '../components/ui/image-fallback';
import axiosClient from '../api/axiosClient';
import { toast } from 'sonner';
import { ShoppingCart, Plus } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';

const GuestMenu = () => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null); // Để hiện popup chi tiết

  // State cho Tìm kiếm và Lọc
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // UUID Nhà hàng của bạn
  const RESTAURANT_ID = 'c56a4180-65aa-42ec-a945-5fd21dec0538';
  const BASE_URL = 'http://localhost:3000';

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        // Thêm delay giả 0.5s để bạn kịp nhìn thấy hiệu ứng Skeleton (xóa đi khi chạy thật nếu muốn)
        // await new Promise(resolve => setTimeout(resolve, 800)); 
        const res = await axiosClient.get(`/menu?restaurant_id=${RESTAURANT_ID}`);
        setMenu(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const handleItemClick = async (itemId) => {
    try {
      const res = await axiosClient.get(`/menu/items/${itemId}`);
      setSelectedItem(res.data.data);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleAddToCart = (item, e) => {
    e?.stopPropagation(); // Ngăn sự kiện click lan ra ngoài (để không mở modal)
    toast.success(`Đã thêm "${item.name}" vào giỏ!`, {
      icon: '🛒',
      duration: 2000,
    });
  };

  // --- LOGIC LỌC MENU ---
  // Chúng ta sẽ tính toán danh sách hiển thị dựa trên search và category đang chọn
  const filteredMenu = menu.map(category => {
    // 1. Nếu đang chọn danh mục cụ thể mà không phải danh mục này -> Bỏ qua
    if (activeCategory !== 'all' && category.id !== activeCategory) return null;

    // 2. Lọc món ăn theo từ khóa tìm kiếm
    const filteredItems = category.items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 3. Nếu danh mục này không còn món nào thỏa mãn -> Ẩn luôn danh mục
    if (filteredItems.length === 0) return null;

    // 4. Trả về danh mục mới với danh sách món đã lọc
    return { ...category, items: filteredItems };
  }).filter(Boolean); // Loại bỏ các giá trị null

  if (loading) {
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', background: '#f9fafb', minHeight: '100vh', paddingBottom: '80px' }}>
        {/* Fake Header */}
        <div className="bg-white sticky top-0 z-50 shadow-sm pb-4">
          <div className="h-[60px] bg-[#ff6b6b] flex flex-col justify-center px-5 mb-3">
            <div className="h-4 w-32 bg-white/20 rounded animate-pulse mb-2"></div>
            <div className="h-3 w-20 bg-white/20 rounded animate-pulse"></div>
          </div>
          <div className="px-4 space-y-4">
            <Skeleton className="h-10 w-full rounded-full" />
            <div className="flex gap-2 overflow-hidden">
              <Skeleton className="h-8 w-20 rounded-full flex-shrink-0" />
              <Skeleton className="h-8 w-24 rounded-full flex-shrink-0" />
              <Skeleton className="h-8 w-20 rounded-full flex-shrink-0" />
              <Skeleton className="h-8 w-24 rounded-full flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Fake List */}
        <div className="p-4 space-y-6">
          {[1, 2].map((cat) => (
            <div key={cat}>
              <Skeleton className="h-6 w-32 mb-4 rounded" />
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex gap-3 p-3 bg-white rounded-xl shadow-sm border border-transparent">
                    <Skeleton className="h-20 w-20 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <div className="flex justify-between items-end pt-1">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-6 w-6 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', background: '#f9fafb', minHeight: '100vh', paddingBottom: '80px' }}>

      {/* HEADER & SEARCH AREA */}
      <div style={{ background: '#fff', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
        <header style={{ background: '#ff6b6b', color: '#fff', padding: '15px 20px' }}>
          <h2 style={{ margin: 0, fontSize: '18px' }}>Smart Restaurant 🍜</h2>
          <p style={{ margin: '2px 0 0', opacity: 0.9, fontSize: '12px' }}>Quét QR - Gọi món nhanh</p>
        </header>

        <div style={{ padding: '10px 15px' }}>
          {/* Thanh tìm kiếm */}
          <input
            type="text"
            placeholder="🔍 Tìm món ăn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '10px 15px', borderRadius: '20px',
              border: '1px solid #ddd', outline: 'none', background: '#f3f4f6'
            }}
          />
        </div>

        {/* Thanh danh mục (Scroll ngang) */}
        <div style={{
          display: 'flex', overflowX: 'auto', gap: '10px', padding: '0 15px 15px',
          whiteSpace: 'nowrap', scrollbarWidth: 'none'
        }}>
          <button
            onClick={() => setActiveCategory('all')}
            style={{
              padding: '6px 16px', borderRadius: '20px', border: 'none', fontSize: '13px',
              background: activeCategory === 'all' ? '#333' : '#eee',
              color: activeCategory === 'all' ? '#fff' : '#333',
              flexShrink: 0
            }}
          >
            Tất cả
          </button>
          {menu.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '6px 16px', borderRadius: '20px', border: 'none', fontSize: '13px',
                background: activeCategory === cat.id ? '#333' : '#eee',
                color: activeCategory === cat.id ? '#fff' : '#333',
                flexShrink: 0
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* BODY - LIST MÓN */}
      <div style={{ padding: '15px' }}>
        {filteredMenu.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', marginTop: '50px' }}>Không tìm thấy món nào.</div>
        ) : (
          filteredMenu.map(category => (
            <div key={category.id} style={{ marginBottom: '25px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#444', marginBottom: '12px', paddingLeft: '5px', borderLeft: '4px solid #ff6b6b' }}>{category.name}</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {category.items.map(item => (
                  <div
                    key={item.id} onClick={() => handleItemClick(item.id)}
                    style={{
                      display: 'flex', gap: '12px', padding: '10px', background: '#fff', borderRadius: '12px', cursor: 'pointer',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.03)', opacity: item.status === 'sold_out' ? 0.6 : 1,
                      pointerEvents: item.status === 'sold_out' ? 'none' : 'auto'
                    }}
                  >
                    {/* Dùng ImageWithFallback */}
                    <ImageWithFallback
                      src={item.image_url ? (item.image_url.startsWith('http') ? item.image_url : `${BASE_URL}${item.image_url}`) : null}
                      className="w-20 h-20 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                    />

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h4 style={{ margin: '0', fontSize: '15px', fontWeight: '600' }}>{item.name}</h4>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#666', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.description}
                        </p>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
                        <span style={{ fontWeight: 'bold', color: '#ff6b6b', fontSize: '15px' }}>{Number(item.price).toLocaleString()}đ</span>

                        {item.status === 'sold_out' ? (
                          <span style={{ fontSize: '10px', background: '#fee2e2', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>HẾT HÀNG</span>
                        ) : (
                          // Nút thêm vào giỏ có sự kiện click riêng
                          <button
                            onClick={(e) => handleAddToCart(item, e)}
                            style={{ background: '#ff6b6b', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          >
                            <Plus size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL CHI TIẾT MÓN */}
      {selectedItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(2px)' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '480px', margin: '0 auto', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', padding: '20px', maxHeight: '85vh', overflowY: 'auto', animation: 'slideUp 0.3s', display: 'flex', flexDirection: 'column' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px' }}>{selectedItem.name}</h3>
                <span style={{ color: '#ff6b6b', fontWeight: 'bold', fontSize: '16px' }}>{Number(selectedItem.price).toLocaleString()}đ</span>
              </div>
              <button onClick={() => setSelectedItem(null)} style={{ border: 'none', background: '#f3f4f6', borderRadius: '50%', width: '30px', height: '30px', fontSize: '14px' }}>✕</button>
            </div>

            <p style={{ color: '#666', fontSize: '14px', fontStyle: 'italic', marginBottom: '20px' }}>{selectedItem.description}</p>

            <div style={{ flex: 1 }}>
              {selectedItem.modifier_groups && selectedItem.modifier_groups.map(group => (
                <div key={group.id} style={{ marginBottom: '20px' }}>
                  <h4 style={{ background: '#f8f9fa', padding: '8px 10px', borderRadius: '6px', marginBottom: '8px', fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                    {group.name} {group.required ? <span style={{ color: 'red', fontSize: '11px' }}>* Bắt buộc</span> : <span style={{ color: '#888', fontSize: '11px' }}>Tùy chọn</span>}
                  </h4>
                  {group.options.map(opt => (
                    <label key={opt.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input type={group.type === 'single' ? 'radio' : 'checkbox'} name={group.id} style={{ transform: 'scale(1.2)' }} />
                        <span style={{ fontSize: '14px' }}>{opt.name}</span>
                      </div>
                      <span style={{ fontSize: '14px', color: '#555' }}>+{Number(opt.price).toLocaleString()}đ</span>
                    </label>
                  ))}
                </div>
              ))}
            </div>

            {/* Nút Thêm vào giỏ ở Modal */}
            <button
              onClick={() => {
                handleAddToCart(selectedItem);
                setSelectedItem(null); // Đóng modal sau khi thêm
              }}
              style={{ width: '100%', padding: '15px', background: '#ff6b6b', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: 'bold', marginTop: '20px', boxShadow: '0 4px 10px rgba(255, 107, 107, 0.3)' }}
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestMenu;