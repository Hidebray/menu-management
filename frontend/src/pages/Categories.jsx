import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { CategoryManagement } from '../components/CategoryManagement';
import { toast } from 'sonner'; // [1] Import toast

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const RESTAURANT_ID = 'c56a4180-65aa-42ec-a945-5fd21dec0538';

    const fetchCategories = async () => {
        try {
            const res = await axiosClient.get(`/admin/menu/categories?restaurant_id=${RESTAURANT_ID}`);
            setCategories(res.data.data);
        } catch (error) {
            console.error("Lỗi tải danh mục:", error);
            toast.error("Không thể tải danh sách danh mục"); // [2] Báo lỗi nhẹ nhàng
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
            toast.success("Tạo danh mục thành công!"); // [3] Thông báo thành công
            fetchCategories();
        } catch (error) {
            toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleUpdateCategory = async (id, updatedData) => {
        try {
            const payload = {
                ...updatedData,
                restaurant_id: RESTAURANT_ID,
                display_order: updatedData.display_order || 0
            };
            await axiosClient.put(`/admin/menu/categories/${id}`, payload);
            toast.success("Cập nhật thành công!");
            fetchCategories();
        } catch (error) {
            toast.error('Lỗi: ' + error.message);
        }
    };

    const handleDeleteCategory = async (id) => {
        if (!window.confirm("Bạn chắc chắn muốn xóa danh mục này?")) return;
        try {
            await axiosClient.delete(`/admin/menu/categories/${id}`, {
                data: { restaurant_id: RESTAURANT_ID }
            });
            toast.success("Đã xóa danh mục!");
            fetchCategories();
        } catch (error) {
            toast.error('Lỗi: ' + (error.response?.data?.message || error.message));
        }
    };

    if (loading) return <div className="flex h-[50vh] items-center justify-center">Loading...</div>;

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