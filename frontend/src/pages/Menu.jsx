import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { DishesManagement } from '../components/DishesManagement';

const Menu = () => {
    // Thay bằng UUID Nhà hàng của bạn
    const RESTAURANT_ID = 'c56a4180-65aa-42ec-a945-5fd21dec0538';

    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modifierGroups, setModifierGroups] = useState([]);

    // State bộ lọc và phân trang
    const [filters, setFilters] = useState({
        search: '',
        category_id: '',
        status: '',
    });
    const [page, setPage] = useState(1);
    const LIMIT = 10;

    // --- API CALLS ---
    const fetchCategories = async () => {
        try {
            const res = await axiosClient.get(`/admin/menu/categories?restaurant_id=${RESTAURANT_ID}`);
            setCategories(res.data.data);
        } catch (error) { console.error(error); }
    };

    const fetchItems = async () => {
        try {
            setLoading(true);
            // Tạo query params từ filters và page
            const params = new URLSearchParams({
                restaurant_id: RESTAURANT_ID,
                page: page,
                limit: LIMIT,
                ...filters
            });

            const res = await axiosClient.get(`/admin/menu/items?${params.toString()}`);
            setItems(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchModifierGroups = async () => {
    try {
        const res = await axiosClient.get(`/admin/menu/groups?restaurant_id=${RESTAURANT_ID}`);
        setModifierGroups(res.data.data);
    } catch (error) { console.error(error); }
};

    // Load danh mục 1 lần đầu
    useEffect(() => { 
        fetchCategories();
        fetchModifierGroups();
    }, []);

    // Load items mỗi khi filters hoặc page thay đổi (Debounce search nếu cần)
    useEffect(() => {
        // Reset về trang 1 khi filter thay đổi (trừ khi chính page thay đổi)
        fetchItems();
    }, [page, filters]);

    // --- HANDLERS ---
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1); // Reset về trang 1 khi lọc
    };

    const handleAddItem = async (data) => {
        try {
            // Ép kiểu số cho price và prep_time_minutes trước khi gửi
            const payload = {
                ...data,
                restaurant_id: RESTAURANT_ID,
                price: Number(data.price),               // <--- Quan trọng: Ép sang số
                prep_time_minutes: Number(data.prep_time_minutes) // <--- Quan trọng
            };

            await axiosClient.post('/admin/menu/items', payload);
            alert('Thêm món thành công!');
            fetchItems();
        } catch (error) {
            // Hiển thị lỗi chi tiết từ backend để dễ debug
            console.error("Lỗi thêm món:", error.response?.data);
            alert('Lỗi: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleUpdateItem = async (id, data) => {
        try {
            const payload = {
                ...data,
                restaurant_id: RESTAURANT_ID,
                price: Number(data.price),
                prep_time_minutes: Number(data.prep_time_minutes)
            };

            await axiosClient.put(`/admin/menu/items/${id}`, payload);

            alert('Cập nhật thành công!');
            fetchItems();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm('Bạn chắc chắn muốn xóa?')) return;
        try {
            await axiosClient.delete(`/admin/menu/items/${id}`, { data: { restaurant_id: RESTAURANT_ID } });
            fetchItems();
        } catch (error) { alert('Lỗi xóa: ' + error.message); }
    };

    const handleUploadPhoto = async (itemId, fileList) => {
        try {
            const formData = new FormData();
            for (let i = 0; i < fileList.length; i++) {
                formData.append('photos', fileList[i]);
            }
            await axiosClient.post(`/admin/menu/items/${itemId}/photos`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Upload ảnh thành công!');
            fetchItems();
        } catch (error) { throw error; }
    };

    if (loading && items.length === 0 && categories.length === 0) return <div className="p-8 text-center">Đang tải...</div>;

    const handleGetItemDetail = async (id) => {
        try {
            const res = await axiosClient.get(`/admin/menu/items/${id}`);
            return res.data.data;
        } catch (error) {
            console.error(error);
            alert('Lỗi tải chi tiết món: ' + error.message);
            return null;
        }
    };

    const handleDeletePhoto = async (photoId) => {
        if (!window.confirm('Xóa ảnh này?')) return;
        try {
            await axiosClient.delete(`/admin/photos/${photoId}`);
            alert('Đã xóa ảnh');
            return true;
        } catch (error) {
            alert('Lỗi: ' + error.message);
            return false;
        }
    };

    const handleSetPrimaryPhoto = async (photoId) => {
        try {
            await axiosClient.put(`/admin/photos/${photoId}/primary`);
            alert('Đã đặt làm ảnh đại diện');
            fetchItems(); // Refresh list to show new thumbnail
            return true;
        } catch (error) {
            alert('Lỗi: ' + error.message);
            return false;
        }
    };

    const handleAttachModifier = async (itemId, groupId) => {
    try {
        await axiosClient.post(`/admin/menu/items/${itemId}/modifiers`, { group_id: groupId });
        alert('Đã gắn nhóm modifier thành công!');
        return true;
    } catch (error) {
        alert('Lỗi: ' + error.message);
        return false;
    }
};

    return (
        <DishesManagement
            items={items}
            categories={categories}
            filters={filters}
            onFilterChange={handleFilterChange}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onUploadPhoto={handleUploadPhoto}
            onGetItemDetail={handleGetItemDetail}
            onDeletePhoto={handleDeletePhoto}
            onSetPrimaryPhoto={handleSetPrimaryPhoto}
            pagination={{ page, limit: LIMIT }}
            onPageChange={setPage}
            modifierGroups={modifierGroups}    
            onAttachModifier={handleAttachModifier} 
        />
    );
};

export default Menu;