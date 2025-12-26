import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';

const GuestMenu = () => {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null); // Để hiện popup chi tiết

  // UUID Nhà hàng của bạn
  const RESTAURANT_ID = 'c56a4180-65aa-42ec-a945-5fd21dec0538'; 
  // Base URL ảnh (nếu lưu ảnh local)
  const BASE_URL = 'http://localhost:3000';

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        // Gọi API Guest (không cần token admin)
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

  // Hàm gọi API lấy chi tiết món (kèm modifiers) khi click
  const handleItemClick = async (itemId) => {
    try {
      const res = await axiosClient.get(`/menu/items/${itemId}`);
      setSelectedItem(res.data.data);
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>Đang tải thực đơn...</div>;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', background: '#fff', minHeight: '100vh', boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}>
      {/* HEADER */}
      <header style={{ background: '#ff6b6b', color: '#fff', padding: '20px', textAlign: 'center' }}>
        <h2 style={{ margin: 0 }}>Smart Restaurant 🍜</h2>
        <p style={{ margin: '5px 0 0', opacity: 0.9 }}>Quét QR - Gọi món - Thanh toán</p>
      </header>

      {/* BODY */}
      <div style={{ padding: '15px' }}>
        {menu.map(category => (
          <div key={category.id} style={{ marginBottom: '30px' }}>
            <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', color: '#333' }}>
              {category.name}
            </h3>
            
            {/* ITEM LIST */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {category.items.length === 0 && <p style={{color:'#999', fontStyle:'italic'}}>Chưa có món nào.</p>}
              
              {category.items.map(item => (
                <div 
                  key={item.id} 
                  onClick={() => handleItemClick(item.id)}
                  style={{ 
                    display: 'flex', gap: '15px', padding: '10px', 
                    border: '1px solid #eee', borderRadius: '8px', cursor: 'pointer',
                    background: item.status === 'sold_out' ? '#f9f9f9' : '#fff',
                    opacity: item.status === 'sold_out' ? 0.6 : 1
                  }}
                >
                  {/* Ảnh đại diện */}
                  <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: '#eee', flexShrink: 0 }}>
                    {item.image_url ? (
                      <img 
                        src={item.image_url.startsWith('http') ? item.image_url : `${BASE_URL}${item.image_url}`} 
                        alt={item.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px' }}>🍽️</div>
                    )}
                  </div>

                  {/* Thông tin */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <h4 style={{ margin: '0 0 5px', fontSize: '16px' }}>{item.name}</h4>
                      <span style={{ fontWeight: 'bold', color: '#ff6b6b' }}>{Number(item.price).toLocaleString()}đ</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: '#666', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.description || 'Chưa có mô tả'}
                    </p>
                    {item.status === 'sold_out' && <span style={{fontSize:'12px', color:'red', fontWeight:'bold'}}>HẾT HÀNG</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CHI TIẾT MÓN (HIỆN MODIFIERS) */}
      {selectedItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end'
        }}>
          <div style={{ 
            background: '#fff', width: '100%', maxWidth: '480px', margin: '0 auto', 
            borderTopLeftRadius: '20px', borderTopRightRadius: '20px', padding: '20px',
            maxHeight: '80vh', overflowY: 'auto', animation: 'slideUp 0.3s'
          }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
              <h3 style={{margin:0}}>{selectedItem.name}</h3>
              <button onClick={() => setSelectedItem(null)} style={{border:'none', background:'transparent', fontSize:'20px'}}>✕</button>
            </div>
            
            <p style={{color:'#666'}}>{selectedItem.description}</p>
            <h2 style={{color: '#ff6b6b'}}>{Number(selectedItem.price).toLocaleString()}đ</h2>

            {/* HIỂN THỊ MODIFIERS (Size, Topping...) */}
            {selectedItem.modifier_groups && selectedItem.modifier_groups.map(group => (
              <div key={group.id} style={{ marginTop: '20px' }}>
                <h4 style={{background:'#f8f9fa', padding:'10px', borderRadius:'4px', marginBottom:'10px'}}>
                  {group.name} {group.required && <span style={{color:'red', fontSize:'12px'}}>(Bắt buộc)</span>}
                </h4>
                {group.options.map(opt => (
                  <label key={opt.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                    <span>
                      <input 
                        type={group.type === 'single' ? 'radio' : 'checkbox'} 
                        name={group.id} 
                      /> {opt.name}
                    </span>
                    <span>+{Number(opt.price).toLocaleString()}đ</span>
                  </label>
                ))}
              </div>
            ))}

            <button style={{
              width: '100%', padding: '15px', background: '#ff6b6b', color: '#fff', 
              border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', marginTop: '20px'
            }}>
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestMenu;