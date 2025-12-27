import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { DishesManagement } from '../components/DishesManagement';
import { toast } from 'sonner'; // [Import]

const Menu = () => {
    const RESTAURANT_ID = 'c56a4180-65aa-42ec-a945-5fd21dec0538';
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modifierGroups, setModifierGroups] = useState([]);

    // State bộ lọc
    const [filters, setFilters] = useState({
        search: '', category_id: '', status: '',
        sort_by: 'created_at', sort_order: 'desc',
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
            const params = new URLSearchParams({
                restaurant_id: RESTAURANT_ID, page: page, limit: LIMIT, ...filters
            });
            const res = await axiosClient.get(`/admin/menu/items?${params.toString()}`);
            setItems(res.data.data);
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    const fetchModifierGroups = async () => {
        try {
            const res = await axiosClient.get(`/admin/menu/groups?restaurant_id=${RESTAURANT_ID}`);
            setModifierGroups(res.data.data);
        } catch (error) { console.error(error); }
    };

    useEffect(() => { fetchCategories(); fetchModifierGroups(); }, []);
    useEffect(() => { fetchItems(); }, [page, filters]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1);
    };

    // --- HANDLERS VỚI TOAST ---
    const handleAddItem = async (data) => {
        try {
            const payload = {
                ...data,
                restaurant_id: RESTAURANT_ID,
                price: Number(data.price),
                prep_time_minutes: Number(data.prep_time_minutes)
            };
            await axiosClient.post('/admin/menu/items', payload);
            toast.success('Thêm món mới thành công!'); // [Toast Success]
            fetchItems();
        } catch (error) {
            console.error("Lỗi thêm món:", error.response?.data);
            toast.error('Lỗi: ' + (error.response?.data?.message || error.message)); // [Toast Error]
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
            toast.success('Đã cập nhật món ăn!');
            fetchItems();
        } catch (error) {
            toast.error('Lỗi cập nhật: ' + error.message);
        }
    };

    const handleDeleteItem = async (id) => {
        if (!window.confirm('Bạn chắc chắn muốn xóa?')) return;
        try {
            await axiosClient.delete(`/admin/menu/items/${id}`, { data: { restaurant_id: RESTAURANT_ID } });
            toast.success('Đã xóa món ăn');
            fetchItems();
        } catch (error) { toast.error('Lỗi xóa: ' + error.message); }
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
            toast.success('Upload ảnh thành công!');
            fetchItems();
        } catch (error) { 
            toast.error('Upload thất bại: ' + error.message);
            throw error; 
        }
    };

    const handleGetItemDetail = async (id) => {
        try {
            const res = await axiosClient.get(`/admin/menu/items/${id}`);
            return res.data.data;
        } catch (error) {
            toast.error('Lỗi tải chi tiết: ' + error.message);
            return null;
        }
    };

    const handleDeletePhoto = async (photoId) => {
        if (!window.confirm('Xóa ảnh này?')) return;
        try {
            await axiosClient.delete(`/admin/photos/${photoId}`);
            toast.success('Đã xóa ảnh');
            return true;
        } catch (error) {
            toast.error('Lỗi: ' + error.message);
            return false;
        }
    };

    const handleSetPrimaryPhoto = async (photoId) => {
        try {
            await axiosClient.put(`/admin/photos/${photoId}/primary`);
            toast.success('Đã đặt làm ảnh đại diện');
            fetchItems();
            return true;
        } catch (error) {
            toast.error('Lỗi: ' + error.message);
            return false;
        }
    };

    const handleAttachModifier = async (itemId, groupId) => {
        try {
            await axiosClient.post(`/admin/menu/items/${itemId}/modifiers`, { group_id: groupId });
            toast.success('Đã gắn nhóm modifier!');
            return true;
        } catch (error) {
            toast.error('Lỗi: ' + error.message);
            return false;
        }
    };

    const handleDetachModifier = async (itemId, groupId) => {
        if(!window.confirm("Bạn muốn gỡ nhóm này khỏi món ăn?")) return false;
        try {
            await axiosClient.delete(`/admin/menu/items/${itemId}/modifiers/${groupId}`);
            toast.success('Đã gỡ nhóm modifier!');
            return true;
        } catch (error) {
            toast.error('Lỗi: ' + error.message);
            return false;
        }
    };

    if (loading && items.length === 0) return <div className="p-8 text-center">Đang tải...</div>;

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
            onDetachModifier={handleDetachModifier}
        />
    );
};

export default Menu;