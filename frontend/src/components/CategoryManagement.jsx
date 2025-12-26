import { useState } from 'react';
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from './ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from './ui/table';

export function CategoryManagement({
    categories,
    onAddCategory,
    onUpdateCategory,
    onDeleteCategory,
}) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    // State form
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'active',
    });

    // Mở Dialog (nếu có category -> chế độ sửa, không có -> chế độ thêm)
    const handleOpenDialog = (category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                description: category.description || '',
                status: category.status,
            });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', description: '', status: 'active' });
        }
        setIsDialogOpen(true);
    };

    // Đóng Dialog và reset form
    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '', status: 'active' });
    };

    // Xử lý Submit
    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingCategory) {
            onUpdateCategory(editingCategory.id, formData);
        } else {
            onAddCategory(formData);
        }
        handleCloseDialog();
    };

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight">Quản lý Danh mục</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Tạo và quản lý các nhóm món ăn (Khai vị, Món chính...)
                    </p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm Danh mục
                </Button>
            </div>

            {/* DANH SÁCH (TABLE) */}
            {categories.length === 0 ? (
                <div className="border border-dashed rounded-lg p-12 text-center bg-muted/10">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
                            <FolderOpen className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold text-lg">Chưa có danh mục nào</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            Hãy tạo danh mục đầu tiên để bắt đầu thêm món ăn vào thực đơn của bạn.
                        </p>
                        <Button onClick={() => handleOpenDialog()} className="mt-4" variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Tạo Danh mục Ngay
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="border rounded-lg bg-card shadow-sm">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">STT</TableHead>
                                <TableHead>Tên Danh mục</TableHead>
                                <TableHead>Mô tả</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.map((category, index) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">{index + 1}</TableCell>
                                    <TableCell className="font-semibold">{category.name}</TableCell>
                                    <TableCell className="text-muted-foreground max-w-[300px] truncate">
                                        {category.description || '—'}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
                                            {category.status === 'active' ? 'Hoạt động' : 'Ẩn'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenDialog(category)}
                                            >
                                                <Pencil className="w-4 h-4 text-blue-600" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onDeleteCategory(category.id)}
                                            >
                                                <Trash2 className="w-4 h-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* MODAL THÊM / SỬA */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCategory ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục Mới'}
                        </DialogTitle>
                        <DialogDescription>
                            Nhập thông tin danh mục món ăn bên dưới.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Tên Danh mục <span className="text-red-500">*</span></Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="VD: Đồ uống, Món nướng..."
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Mô tả ngắn về nhóm món ăn này..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Trạng thái</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => setFormData({ ...formData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Hoạt động (Hiện trên Menu)</SelectItem>
                                    <SelectItem value="inactive">Ẩn (Tạm khóa)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={handleCloseDialog}>
                                Hủy bỏ
                            </Button>
                            <Button type="submit">
                                {editingCategory ? 'Lưu thay đổi' : 'Tạo mới'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}