const modifierService = require('../services/modifier.service');
const pool = require('../config/db'); // Needed for listing

const createGroup = async (req, res) => {
  try {
    const { restaurant_id, ...data } = req.body;
    // Basic validation could be done here or in service
    const group = await modifierService.createGroup(restaurant_id, data);
    res.status(201).json({ success: true, data: group });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const addOption = async (req, res) => {
  try {
    const { groupId } = req.params;
    const option = await modifierService.createOption(groupId, req.body);
    res.status(201).json({ success: true, data: option });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const attachToItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { group_id } = req.body;
    const result = await modifierService.attachGroupToItem(itemId, group_id);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// --- Add this LIST function for the Frontend ---
const listGroups = async (req, res) => {
    try {
        const { restaurant_id } = req.query;
        // Simple query to get all groups and their options
        const query = `
            SELECT 
                g.id as group_id, g.name as group_name, g.selection_type,
                o.id as option_id, o.name as option_name, o.price_adjustment
            FROM modifier_groups g
            LEFT JOIN modifier_options o ON g.id = o.group_id
            WHERE g.restaurant_id = $1
            ORDER BY g.created_at DESC, o.price_adjustment ASC;
        `;
        const result = await pool.query(query, [restaurant_id]);
        
        // Transform flat list to nested object
        const groupsMap = {};
        result.rows.forEach(row => {
            if (!groupsMap[row.group_id]) {
                groupsMap[row.group_id] = {
                    id: row.group_id,
                    name: row.group_name,
                    selection_type: row.selection_type,
                    options: []
                };
            }
            if (row.option_id) {
                groupsMap[row.group_id].options.push({
                    id: row.option_id,
                    name: row.option_name,
                    price: row.price_adjustment
                });
            }
        });
        
        res.json({ success: true, data: Object.values(groupsMap) });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { createGroup, addOption, attachToItem, listGroups };