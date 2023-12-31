const db = require('../models/db.js');
const jwt = require("jsonwebtoken");

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
    const {email, first_name, last_name, password, is_active, role_name } = req.body;
    console.log('body', req.body);
    db.query('INSERT INTO users (email, first_name, last_name, password, is_active) VALUES (?, ?, ?, ?, ?)', [email, first_name, last_name, password, is_active], (err, result) => {
      if (err) throw err;
      res.json({ message: 'User added successfully', id: result.insertId });
    });
    db.query('insert into userroles (user_id, role_id, is_active) select u.user_id, (select role_id from roles where role_name= ? ), ? as is_active from users u where u.email=?', [role_name, is_active, email], (err, result) => {});
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
    console.log('user input', req.body);
    const data = {
        email: req.body.email,
        password: req.body.password
    };
    db.query('SELECT u.user_id, u.email, u.first_name, u.last_name, r.role_name from users u inner join userroles ur on u.user_id=ur.user_id inner join roles r on ur.role_id=r.role_id WHERE u.email=? AND u.password=? AND u.is_active=1', [data.email, data.password],function(err, results){
        if(err) throw err;
        if(results.length){
            /*
            res.json({
                message: `User ${results[0].email} authenticated successfully`,
            });
            */
            console.log('result', results[0]);
            const token = jwt.sign(
              {
                user_id: results[0].user_id,
                email: results[0].email,
                role_name: results[0].role_name
              },
              "thisistooconfidential",
              { expiresIn: "1h" }
            );
      
            res.status(200).json({
              message: "Login Successful",
              token: token,
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