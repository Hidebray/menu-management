const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const categoryRoutes = require('./routes/category.routes');
const menuRoutes = require('./routes/menu.routes');
const modifierRoutes = require('./routes/modifier.routes');
const guestRoutes = require('./routes/guest.routes');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/admin/menu/categories', categoryRoutes);
app.use('/api/admin/menu/items', menuRoutes);
app.use('/api/admin/menu', modifierRoutes);
app.use('/api/menu', guestRoutes);



app.get('/', (req, res) => {
  res.send('Smart Restaurant API is running!');
});

app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});

