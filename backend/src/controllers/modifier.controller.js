const modifierService = require('../services/modifier.service');
const { z } = require('zod');

// Schema Validate
const createGroupSchema = z.object({
  name: z.string().min(1),
  selection_type: z.enum(['single', 'multiple']),
  is_required: z.boolean().optional(),
  min_selections: z.number().int().optional(),
  max_selections: z.number().int().optional(),
  restaurant_id: z.string().uuid() // Tạm lấy từ body
});

const createOptionSchema = z.object({
  name: z.string().min(1),
  price_adjustment: z.number().min(0)
});

const createGroup = async (req, res) => {
  try {
    const validatedData = createGroupSchema.parse(req.body);
    const { restaurant_id, ...groupData } = validatedData;
    
    const newGroup = await modifierService.createGroup(restaurant_id, groupData);
    res.status(201).json({ success: true, data: newGroup });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const addOption = async (req, res) => {
  try {
    const { groupId } = req.params;
    const validatedData = createOptionSchema.parse(req.body);
    
    const newOption = await modifierService.createOption(groupId, validatedData);
    res.status(201).json({ success: true, data: newOption });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const attachToItem = async (req, res) => {
  try {
    const { itemId } = req.params; // Lấy từ URL
    const { group_id } = req.body; // Lấy từ body
    
    if (!group_id) throw new Error('Missing group_id');
    
    await modifierService.attachGroupToItem(itemId, group_id);
    res.json({ success: true, message: 'Attached modifier group to item' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { createGroup, addOption, attachToItem };