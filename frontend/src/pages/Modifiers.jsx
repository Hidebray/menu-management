import { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const Modifiers = () => {
    const RESTAURANT_ID = 'c56a4180-65aa-42ec-a945-5fd21dec0538'; // Same ID as before
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [newGroup, setNewGroup] = useState({ name: '', selection_type: 'single' });
    const [newOption, setNewOption] = useState({ name: '', price: 0, groupId: null });

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

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('/admin/menu/groups', {
                ...newGroup,
                restaurant_id: RESTAURANT_ID,
                is_required: false, // Default
                min_selections: 0,
                max_selections: 1
            });
            alert('Tạo nhóm thành công!');
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
            alert('Thêm option thành công!');
            setNewOption({ name: '', price: 0, groupId: null });
            fetchGroups();
        } catch (error) { alert('Lỗi: ' + error.message); }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Quản lý Modifier (Topping/Size)</h2>
            
            {/* Create Group Form */}
            <div className="bg-muted/20 p-4 rounded-lg border">
                <h3 className="font-semibold mb-3">1. Tạo Nhóm Mới (VD: Size, Độ ngọt)</h3>
                <form onSubmit={handleCreateGroup} className="flex gap-4 items-end">
                    <div className="space-y-1">
                        <label className="text-sm">Tên nhóm</label>
                        <Input 
                            value={newGroup.name} 
                            onChange={e => setNewGroup({...newGroup, name: e.target.value})}
                            placeholder="VD: Size ly" required 
                        />
                    </div>
                    <div className="space-y-1 w-[200px]">
                        <label className="text-sm">Loại chọn</label>
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

            {/* List Groups & Add Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groups.map(group => (
                    <Card key={group.id}>
                        <CardHeader className="bg-muted/10 pb-2">
                            <CardTitle className="text-lg flex justify-between">
                                {group.name}
                                <span className="text-xs font-normal bg-white border px-2 py-1 rounded">
                                    {group.selection_type}
                                </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                            {/* Option List */}
                            <div className="space-y-1">
                                {group.options.length === 0 ? <p className="text-sm text-muted-foreground italic">Chưa có lựa chọn nào</p> : null}
                                {group.options.map(opt => (
                                    <div key={opt.id} className="flex justify-between text-sm border-b py-2 last:border-0">
                                        <span>{opt.name}</span>
                                        <span className="font-medium">+{Number(opt.price).toLocaleString()}đ</span>
                                    </div>
                                ))}
                            </div>

                            {/* Add Option Form */}
                            <div className="pt-2 border-t mt-2">
                                <p className="text-xs font-medium mb-2 text-muted-foreground">Thêm lựa chọn:</p>
                                <form onSubmit={handleAddOption} className="flex gap-2">
                                    <Input 
                                        placeholder="Tên (VD: Lớn)" 
                                        className="h-8 text-sm"
                                        value={newOption.groupId === group.id ? newOption.name : ''}
                                        onChange={e => setNewOption({ ...newOption, groupId: group.id, name: e.target.value })}
                                    />
                                    <Input 
                                        type="number" placeholder="Giá (+)" 
                                        className="h-8 w-20 text-sm"
                                        value={newOption.groupId === group.id ? newOption.price : ''}
                                        onChange={e => setNewOption({ ...newOption, groupId: group.id, price: e.target.value })}
                                    />
                                    <Button type="submit" size="sm" className="h-8">Thêm</Button>
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