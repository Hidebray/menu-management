import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { CategoryManagement } from '../components/CategoryManagement';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // UUID Nhà hàng (Thay bằng ID thật của bạn)
    const RESTAURANT_ID = 'c56a4180-65aa-42ec-a945-5fd21dec0538';

    // --- API ACTIONS ---

    const fetchCategories = async () => {
        try {
            // Gọi API lấy danh sách
            const res = await axiosClient.get(`/admin/menu/categories?restaurant_id=${RESTAURANT_ID}`);
            setCategories(res.data.data);
        } catch (error) {
            console.error("Lỗi tải danh mục:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = async (newCategoryData) => {
        try {
            await axiosClient.post('/admin/menu/categories', {
                ...newCategoryData,
                restaurant_id: RESTAURANT_ID,
                display_order: categories.length + 1
            });
            // Load lại sau khi thêm
            fetchCategories();
        } catch (error) {
            alert('Lỗi: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleUpdateCategory = async (id, updatedData) => {
        try {
            const payload = {
                ...updatedData,
                restaurant_id: RESTAURANT_ID,
                // Giữ nguyên display_order cũ nếu form không gửi lên, hoặc gửi mặc định
                display_order: updatedData.display_order || 0
            };
            await axiosClient.put(`/admin/menu/categories/${id}`, payload);
            alert('Cập nhật thành công!');
            fetchCategories()
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("Bạn chắc chắn muốn xóa danh mục này?")) return;
        try {
            await axiosClient.delete(`/admin/menu/categories/${id}`, {
                data: { restaurant_id: RESTAURANT_ID }
            });

            alert('Đã xóa thành công!');
            fetchCategories();
        } catch (error) {
            alert('Lỗi: ' + (error.response?.data?.message || error.message));
        }
    };

    if (loading) return (
        <div className="flex h-[50vh] items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <CategoryManagement
                categories={categories}
                onAddCategory={handleAddCategory}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
            />
        </div>
    );
};

export default Categories;