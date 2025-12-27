import { useState } from 'react';
import { Plus, Pencil, Trash2, Image as ImageIcon, Search, Utensils, List } from 'lucide-react';
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
  onGetItemDetail,
  onDeletePhoto,
  onSetPrimaryPhoto,
  modifierGroups,
  onAttachModifier,
  pagination,
  onPageChange
}) {
  // --- STATE QUẢN LÝ MODAL ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const [isModifierDialogOpen, setIsModifierDialogOpen] = useState(false);
  const [selectedItemForModifiers, setSelectedItemForModifiers] = useState(null);
  const [selectedGroupId, setSelectedGroupId] = useState('');

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
  const handleOpenUpload = async (item) => {
    const detailedItem = await onGetItemDetail(item.id);
    if (detailedItem) {
      setSelectedItemForUpload(detailedItem);
      setIsUploadDialogOpen(true);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    const files = e.target.photos.files;
    if (!files || files.length === 0) return alert("Chưa chọn file!");

    setUploading(true);
    await onUploadPhoto(selectedItemForUpload.id, files);

    // Refresh the dialog data to show new photos immediately
    const updatedItem = await onGetItemDetail(selectedItemForUpload.id);
    setSelectedItemForUpload(updatedItem);

    setUploading(false);
    // Remove this line so the dialog stays open for management
    // setIsUploadDialogOpen(false); 
    e.target.reset(); // Clear file input
  };

  const handleOpenModifiers = async (item) => {
    // Fetch full detail to see currently attached groups
    const detail = await onGetItemDetail(item.id);
    if (detail) {
      setSelectedItemForModifiers(detail);
      setIsModifierDialogOpen(true);
    }
  };

  const handleAddGroupToItem = async () => {
    if (!selectedGroupId) return;
    const success = await onAttachModifier(selectedItemForModifiers.id, selectedGroupId);
    if (success) {
      // Refresh data to show the new group in the list
      const updated = await onGetItemDetail(selectedItemForModifiers.id);
      setSelectedItemForModifiers(updated);
      setSelectedGroupId('');
    }
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
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModifiers(item)} title="Cấu hình Modifier">
                        <List className="w-4 h-4 text-orange-600" />
                      </Button>
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
                <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Giá bán (VNĐ) *</Label>
                <Input type="number" required min="0" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Danh mục *</Label>
                <Select value={formData.category_id} onValueChange={val => setFormData({ ...formData, category_id: val })}>
                  <SelectTrigger><SelectValue placeholder="Chọn danh mục" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Thời gian chuẩn bị (phút)</Label>
                <Input type="number" min="0" value={formData.prep_time_minutes} onChange={e => setFormData({ ...formData, prep_time_minutes: e.target.value })} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Trạng thái</Label>
              <Select value={formData.status} onValueChange={val => setFormData({ ...formData, status: val })}>
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
              <Textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
              <Button type="submit">{editingItem ? 'Cập nhật' : 'Tạo mới'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* --- MODAL QUẢN LÝ ẢNH --- */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quản lý Ảnh: {selectedItemForUpload?.name}</DialogTitle>
            <DialogDescription>Tải lên, xóa hoặc chọn ảnh đại diện.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* 1. List Existing Photos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {selectedItemForUpload?.photos?.map((photo) => (
                <div key={photo.id} className="relative group border rounded-lg overflow-hidden">
                  <img
                    src={`http://localhost:3000${photo.url}`}
                    alt="Dish"
                    className="w-full h-32 object-cover"
                  />
                  {/* Status Badge */}
                  {photo.is_primary && (
                    <div className="absolute top-1 left-1 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                      Main
                    </div>
                  )}

                  {/* Actions Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    {!photo.is_primary && (
                      <Button
                        size="sm" variant="secondary" className="h-7 text-xs"
                        onClick={async () => {
                          await onSetPrimaryPhoto(photo.id);
                          const updated = await onGetItemDetail(selectedItemForUpload.id);
                          setSelectedItemForUpload(updated);
                        }}
                      >
                        Set Main
                      </Button>
                    )}
                    <Button
                      size="sm" variant="destructive" className="h-7 text-xs"
                      onClick={async () => {
                        await onDeletePhoto(photo.id);
                        const updated = await onGetItemDetail(selectedItemForUpload.id);
                        setSelectedItemForUpload(updated);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Tải ảnh mới</h4>
              <form onSubmit={handleUploadSubmit} className="flex gap-2 items-end">
                <Input type="file" name="photos" multiple accept="image/*" className="flex-1" />
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-1">Hỗ trợ JPG, PNG. Tối đa 5MB.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- MODAL QUẢN LÝ MODIFIER --- */}
      <Dialog open={isModifierDialogOpen} onOpenChange={setIsModifierDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cấu hình Modifier: {selectedItemForModifiers?.name}</DialogTitle>
            <DialogDescription>Gắn các nhóm tùy chọn (Size, Topping) vào món này.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* SECTION 1: ADD NEW GROUP */}
            <div className="flex gap-2 items-end border-b pb-4">
                <div className="flex-1 space-y-1">
                    <Label>Chọn nhóm để gắn thêm:</Label>
                    <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                        <SelectTrigger><SelectValue placeholder="Chọn nhóm (VD: Size)..." /></SelectTrigger>
                        <SelectContent>
                            {modifierGroups?.map(g => (
                                <SelectItem key={g.id} value={g.id}>
                                    {g.name} ({g.options?.length || 0} lựa chọn)
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={handleAddGroupToItem} disabled={!selectedGroupId}>
                    Gắn
                </Button>
            </div>

            {/* SECTION 2: LIST ATTACHED GROUPS */}
            <div>
                <h4 className="font-medium mb-2">Các nhóm đang áp dụng:</h4>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {selectedItemForModifiers?.modifier_groups?.length === 0 && (
                        <p className="text-sm text-muted-foreground italic text-center py-4 border border-dashed rounded">
                            Chưa có nhóm nào được gắn.
                        </p>
                    )}
                    
                    {selectedItemForModifiers?.modifier_groups?.map((group, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-muted/30 p-3 rounded border">
                            <div>
                                <div className="font-semibold text-sm">{group.name}</div>
                                <div className="text-xs text-muted-foreground flex gap-2 mt-1">
                                    <Badge variant="secondary" className="text-[10px] h-5">{group.type}</Badge>
                                    <span className="flex items-center">{group.options?.length} options</span>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Đã gắn
                            </Badge>
                        </div>
                    ))}
                </div>
            </div>
          </div>
          
          <DialogFooter>
             <Button variant="outline" onClick={() => setIsModifierDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}