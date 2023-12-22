const db = require('../models/db.js');

// Get all users
const getAllUsers = ((req,res)=>{
    db.query('SELECT first_name, last_name, email, is_active FROM users', (err, results) => {
        if (err) throw err;
        res.json(results);
    });
  });
  
// Get a user by ID
const getUserById = ((req, res)=>{
    const { user_id } = req.params;
    db.query('SELECT first_name, last_name, email, is_active FROM users WHERE user_id = ?', [user_id], (err, results) => {
      if (err) throw err;
      res.json(results[0]);
    });
  });
  
  // Create a new user
  const registerNewUser = ((req, res)=>{
    const {email, first_name, last_name, password, is_active } = req.body;
    db.query('INSERT INTO users (email, first_name, last_name, password, is_active) VALUES (?, ?, ?, ?, ?)', [email, first_name, last_name, password, is_active], (err, result) => {
      if (err) throw err;
      res.json({ message: 'User added successfully', id: result.insertId });
    });
  });
  
  // Update a user
  const updateExistingUser = ((req, res)=>{
    const { user_id } = req.params;
    const { first_name, last_name, email } = req.body;
    db.query('UPDATE users SET first_name = ?,last_name = ?, email = ? WHERE user_id = ?', [first_name,last_name, email, user_id], (err) => {
      if (err) throw err;
      res.json({ message: 'User updated successfully' });
    });
  });
  
  // Delete a user
  const deleteExistingUser = ((req, res)=>{
    const { user_id } = req.params;
    db.query('DELETE FROM users WHERE user_id = ?', [user_id], (err) => {
      if (err) throw err;
      res.json({ message: 'User deleted successfully' });
    });
  });

  // User authentication
  const userAuthentication = ((req, res)=>{
    const data = {
        email: req.body.email,
        password: req.body.password
    };
    db.query('SELECT first_name, last_name, email from users WHERE email=? AND password=? AND is_active=1', [data.email, data.password],function(err, results){
        if(err) throw err;
        if(results.length){
            res.json({
                message: `User ${results[0].email} authenticated successfully`,
            });
        }
        else{
            res.json({
                message: 'Unable to authenticate user',
            });
        }
    });
  });

    // Create a new userroles entry
    const createNewUserRole = ((req, res)=>{
      const {role_id, user_id, is_active } = req.body;
      db.query('INSERT INTO userroles (role_id, user_id, is_active) VALUES (?, ?, ?)', [role_id, user_id, is_active], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Post added successfully', id: result.insertId });
      });
    });

    // reset password
    const resetUserPassword = ((req, res)=>{
      const { first_name, last_name, email, password } = req.body;
      db.query('UPDATE users SET password = ? WHERE first_name = ?, last_name = ?, email = ?', [password, first_name, last_name, email], (err) => {
        if (err) throw err;
        res.json({ message: 'User updated successfully' });
      });
    });

  module.exports = {
    getAllUsers,
    getUserById,
    registerNewUser,
    deleteExistingUser,
    updateExistingUser,
    userAuthentication,
    createNewUserRole,
    resetUserPassword
  };