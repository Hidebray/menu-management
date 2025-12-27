import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Pencil, Trash2 } from 'lucide-react'; 
import { toast } from 'sonner';

const Modifiers = () => {
    // Thay bằng UUID Nhà hàng của bạn
    const RESTAURANT_ID = 'c56a4180-65aa-42ec-a945-5fd21dec0538'; 
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [newGroup, setNewGroup] = useState({ name: '', selection_type: 'single' });
    const [newOption, setNewOption] = useState({ name: '', price: 0, groupId: null });

    // --- 1. LẤY DỮ LIỆU ---
    const fetchGroups = async () => {
        try {
            const res = await axiosClient.get(`/admin/menu/groups?restaurant_id=${RESTAURANT_ID}`);
            setGroups(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchGroups(); }, []);

    // --- 2. TẠO MỚI ---
    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/admin/menu/groups', {
                ...newGroup,
                restaurant_id: RESTAURANT_ID,
                is_required: false,
                min_selections: 0,
                max_selections: 1
            });
            toast.success('Tạo nhóm thành công!');
            setNewGroup({ name: '', selection_type: 'single' });
            fetchGroups();
        } catch (error) { alert('Lỗi: ' + error.message); }
    };

    const handleAddOption = async (e) => {
        e.preventDefault();
        if (!newOption.groupId) return;
        try {
            await axiosClient.post(`/admin/menu/groups/${newOption.groupId}/options`, {
                name: newOption.name,
                price_adjustment: Number(newOption.price)
            });
            toast.success('Thêm lựa chọn thành công!');
            setNewOption({ name: '', price: 0, groupId: null });
            fetchGroups();
        } catch (error) { alert('Lỗi: ' + error.message); }
    };

    // --- 3. XÓA & SỬA (LOGIC MỚI) ---
    
    // Xóa nhóm
    const handleDeleteGroup = async (groupId) => {
        if (!window.confirm("CẢNH BÁO: Xóa nhóm này sẽ xóa tất cả các tùy chọn bên trong và gỡ khỏi mọi món ăn đang dùng nó. Bạn chắc chắn chứ?")) return;
        try {
            await axiosClient.delete(`/admin/menu/groups/${groupId}`, {
                data: { restaurant_id: RESTAURANT_ID } // Gửi kèm ID nhà hàng để check quyền
            });
            toast.success('Đã xóa nhóm modifier');
            fetchGroups();
        } catch (error) {
            toast.error("Lỗi xóa nhóm: " + (error.response?.data?.message || error.message));
        }
    };

    // Sửa tên nhóm (Dùng prompt cho nhanh)
    const handleEditGroup = async (group) => {
        const newName = window.prompt("Nhập tên mới cho nhóm:", group.name);
        if (!newName || newName === group.name) return;

        try {
            await axiosClient.put(`/admin/menu/groups/${group.id}`, {
                ...group, // Giữ nguyên các thông tin cũ (type, min/max)
                restaurant_id: RESTAURANT_ID,
                name: newName
            });
            toast.success('Cập nhật tên thành công');
            fetchGroups();
        } catch (error) {
            toast.error("Lỗi cập nhật: " + error.message);
        }
    };

    // Xóa Option
    const handleDeleteOption = async (optionId) => {
        if (!window.confirm("Xóa lựa chọn này?")) return;
        try {
            await axiosClient.delete(`/admin/menu/options/${optionId}`);
            toast.success('Đã xóa option');
            fetchGroups();
        } catch (error) {
            toast.error("Lỗi xóa option: " + error.message);
        }
    };


    if (loading) return <div className="p-8 text-center">Đang tải dữ liệu...</div>;

    return (
        <div className="space-y-6 pb-10">
            {/* ... Nội dung UI ... */}
             <h2 className="text-2xl font-bold">Quản lý Modifier (Topping/Size)</h2>
             {/* ... Form tạo nhóm ... */}
             <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h3 className="font-semibold mb-4 text-lg">Thêm Nhóm Mới</h3>
                <form onSubmit={handleCreateGroup} className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="space-y-2 flex-1 w-full">
                        <label className="text-sm font-medium">Tên nhóm (VD: Size, Mức đường)</label>
                        <Input 
                            value={newGroup.name} 
                            onChange={e => setNewGroup({...newGroup, name: e.target.value})}
                            placeholder="Nhập tên nhóm..." required 
                        />
                    </div>
                    <div className="space-y-2 w-full md:w-[200px]">
                        <label className="text-sm font-medium">Loại chọn</label>
                        <Select value={newGroup.selection_type} onValueChange={v => setNewGroup({...newGroup, selection_type: v})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="single">Chọn 1 (Single)</SelectItem>
                                <SelectItem value="multiple">Chọn nhiều (Multiple)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit">Tạo Nhóm</Button>
                </form>
            </div>
            {/* ... List Groups ... */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groups.map(group => (
                    <Card key={group.id} className="relative group-card">
                        <CardHeader className="bg-muted/10 pb-3 flex flex-row items-center justify-between space-y-0">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-lg">{group.name}</CardTitle>
                                <span className="text-[10px] font-normal uppercase tracking-wider bg-white border px-2 py-0.5 rounded text-muted-foreground">
                                    {group.selection_type}
                                </span>
                            </div>
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => handleEditGroup(group)} title="Đổi tên">
                                    <Pencil className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDeleteGroup(group.id)} title="Xóa nhóm">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            <div className="space-y-1 bg-slate-50 p-2 rounded-md border">
                                {group.options.length === 0 ? <p className="text-xs text-muted-foreground italic text-center py-2">Chưa có lựa chọn nào</p> : null}
                                {group.options.map(opt => (
                                    <div key={opt.id} className="flex justify-between items-center text-sm bg-white p-2 rounded border border-transparent hover:border-slate-200 group/opt">
                                        <span>{opt.name}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium text-green-600">+{Number(opt.price).toLocaleString()}đ</span>
                                            <button className="text-slate-400 hover:text-red-500 opacity-0 group-hover/opt:opacity-100 transition-opacity" onClick={() => handleDeleteOption(opt.id)}>
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-2 border-t mt-2">
                                <p className="text-xs font-medium mb-2 text-muted-foreground">Thêm lựa chọn nhanh:</p>
                                <form onSubmit={handleAddOption} className="flex gap-2">
                                    <Input placeholder="Tên (VD: Lớn)" className="h-9 text-sm" value={newOption.groupId === group.id ? newOption.name : ''} onChange={e => setNewOption({ ...newOption, groupId: group.id, name: e.target.value })} />
                                    <Input type="number" placeholder="Giá" className="h-9 w-24 text-sm" value={newOption.groupId === group.id ? newOption.price : ''} onChange={e => setNewOption({ ...newOption, groupId: group.id, price: e.target.value })} />
                                    <Button type="submit" size="sm" className="h-9 bg-slate-800 hover:bg-slate-700">Thêm</Button>
                                </form>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Modifiers;