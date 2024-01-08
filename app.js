require('dotenv').config();
const express = require('express');
const cors = require('cors');
const user_routes = require('./routes/userrouter.js');
const post_routes = require('./routes/postrouter.js');
const admin_routes = require('./routes/adminrouter.js');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.use('/api/users', user_routes);
app.use('/api/posts', post_routes);
app.use('/api', admin_routes);