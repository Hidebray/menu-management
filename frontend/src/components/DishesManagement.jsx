import { useState } from 'react';
import { Plus, Pencil, Trash2, Image as ImageIcon, Search, Utensils } from 'lucide-react';
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

export function DishesManagement({
  items,
  categories,
  filters,
  onFilterChange,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onUploadPhoto,
  pagination,
  onPageChange
}) {
  // --- STATE QUẢN LÝ MODAL ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItemForUpload, setSelectedItemForUpload] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Form Data cho Thêm/Sửa
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category_id: '',
    description: '',
    prep_time_minutes: 15,
    status: 'available',
    is_chef_recommended: false
  });

  // --- XỬ LÝ SỰ KIỆN FORM ITEM ---
  const handleOpenDialog = (item) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        price: item.price,
        category_id: item.category_id,
        description: item.description || '',
        prep_time_minutes: item.prep_time_minutes || 0,
        status: item.status,
        is_chef_recommended: item.is_chef_recommended || false
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '', price: '', category_id: '', description: '',
        prep_time_minutes: 15, status: 'available', is_chef_recommended: false
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      onUpdateItem(editingItem.id, formData);
    } else {
      onAddItem(formData);
    }
    setIsDialogOpen(false);
  };

  // --- XỬ LÝ UPLOAD ẢNH ---
  const handleOpenUpload = (item) => {
    setSelectedItemForUpload(item);
    setIsUploadDialogOpen(true);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    const files = e.target.photos.files;
    if (!files || files.length === 0) return alert("Chưa chọn file!");
    
    setUploading(true);
    await onUploadPhoto(selectedItemForUpload.id, files);
    setUploading(false);
    setIsUploadDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & FILTERS */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Quản lý Món ăn</h2>
          <p className="text-sm text-muted-foreground">
            Danh sách món ăn, giá cả và tùy chỉnh thực đơn.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="w-4 h-4 mr-2" /> Thêm Món Mới
        </Button>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center bg-muted/20 p-4 rounded-lg border">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên món..."
            className="pl-8 bg-background"
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
        </div>
        <div className="w-full md:w-[200px]">
          <Select value={filters.category_id} onValueChange={(val) => onFilterChange('category_id', val === 'all' ? '' : val)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-[180px]">
          <Select value={filters.status} onValueChange={(val) => onFilterChange('status', val === 'all' ? '' : val)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="available">Đang bán</SelectItem>
              <SelectItem value="sold_out">Hết hàng</SelectItem>
              <SelectItem value="unavailable">Ngừng bán</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* TABLE */}
      <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Ảnh</TableHead>
              <TableHead>Tên Món</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Giá bán</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                  Không tìm thấy món ăn nào.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center overflow-hidden border">
                       {/* Nếu có URL ảnh thì hiện (cần backend join bảng photos). Tạm thời hiện icon */}
                       <Utensils className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">{item.description}</div>
                  </TableCell>
                  <TableCell>{item.category_name}</TableCell>
                  <TableCell className="font-semibold text-primary">
                    {Number(item.price).toLocaleString()}đ
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === 'available' ? 'default' : item.status === 'sold_out' ? 'destructive' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenUpload(item)} title="Upload Ảnh">
                        <ImageIcon className="w-4 h-4 text-purple-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(item)} title="Sửa">
                        <Pencil className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDeleteItem(item.id)} title="Xóa">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* PAGINATION */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Trang {pagination.page}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => onPageChange(pagination.page - 1)} disabled={pagination.page <= 1}>
            Trước
          </Button>
          <Button variant="outline" size="sm" onClick={() => onPageChange(pagination.page + 1)} disabled={items.length < pagination.limit}>
            Sau
          </Button>
        </div>
      </div>

      {/* --- MODAL THÊM / SỬA --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Sửa Món Ăn' : 'Thêm Món Mới'}</DialogTitle>
            <DialogDescription>Điền chi tiết thông tin món ăn và giá bán.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tên món *</Label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Giá bán (VNĐ) *</Label>
                <Input type="number" required min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Danh mục *</Label>
                <Select value={formData.category_id} onValueChange={val => setFormData({...formData, category_id: val})}>
                  <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Thời gian chuẩn bị (phút)</Label>
                <Input type="number" min="0" value={formData.prep_time_minutes} onChange={e => setFormData({...formData, prep_time_minutes: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select value={formData.status} onValueChange={val => setFormData({...formData, status: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Đang bán</SelectItem>
                  <SelectItem value="sold_out">Hết hàng</SelectItem>
                  <SelectItem value="unavailable">Ngừng kinh doanh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mô tả chi tiết</Label>
              <Textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
              <Button type="submit">{editingItem ? 'Cập nhật' : 'Tạo mới'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- MODAL UPLOAD ẢNH --- */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Ảnh món ăn</DialogTitle>
            <DialogDescription>Chọn ảnh định dạng JPG/PNG để tải lên.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-4 text-sm text-muted-foreground">Chọn ảnh cho món: <strong>{selectedItemForUpload?.name}</strong></p>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <Input type="file" name="photos" multiple accept="image/*" />
              <div className="text-xs text-muted-foreground">Hỗ trợ: .jpg, .png, .webp (Tối đa 5MB)</div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Đóng</Button>
                <Button type="submit" disabled={uploading}>{uploading ? 'Đang tải lên...' : 'Bắt đầu Upload'}</Button>
              </DialogFooter>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}