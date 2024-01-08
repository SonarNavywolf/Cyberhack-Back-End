const db = require('../models/db.js');
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator");

// Get all Jobs
const getAllJobs = ((req,res)=>{
  db.query('SELECT job_id, title, description, category, start_date, end_date, provider_id FROM jobs where is_deleted<>1', (err, results) => {
      if (err) throw err;
      res.status(200).json({
        message: "Fetched the list of Jobs",
        jobs: results,
      });
  });
});

// Get all users
const getAllUsers = ((req,res)=>{
    db.query('SELECT user_id, first_name, last_name, email, is_active FROM users where is_active=1', (err, results) => {
        if (err) throw err;
        return res.status(200).json({
          message: "Fetched the list of Users",
          users: results,
        });
    });
  });
  
// Get a user by ID
const getUserById = ((req, res)=>{
    const { user_id } = req.params;
    db.query('select r.role_name, u.user_id, u.email, u.first_name, u.last_name, u.is_active, u.password from users u inner join userroles ur on u.user_id=ur.user_id inner join roles r on r.role_id=ur.role_id where u.is_active=1 and u.user_id=?', [user_id], (err, results) => {
      if (err) throw err;
      return res.status(200).json({
        message: "Successfully fetched the users",
        user: results[0],
      });
    });
  });
  
  // Create a new user
  const registerNewUser = ((req, res)=>{
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("Validation failed");
      error.statusCode = 422;
      error.data = errors.array();
      throw error;
    }

    
    const {email, first_name, last_name, is_active, role_name } = req.body;

    const saltRounds = 12;
    const password_plain = req.body.password;

    bcryptjs
    .hash(password_plain, saltRounds)
    .then((hashedPw) => {
      //register user
      db.query('INSERT INTO users (email, first_name, last_name, password, is_active) VALUES (?, ?, ?, ?, ?)', [email, first_name, last_name, hashedPw, is_active], (err, result) => {
        if (err) throw err;
        res.json({ message: 'User added successfully', id: result.insertId });
      });
      db.query('insert into userroles (user_id, role_id, is_active) select u.user_id, (select role_id from roles where role_name= ? ), ? as is_active from users u where u.email=?', [role_name, is_active, email], (err, result) => {});
    })
    .then((user) => {
      //res.status(201).json({ message: "Registered Successfully!" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
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
    console.log('inside deleteExistingUser');
    const { user_id } = req.params;

    db.query('select u.user_id, r.role_name from users u inner join userroles ur on u.user_id=ur.user_id inner join roles r on r.role_id=ur.role_id where u.is_active=1 and r.role_name=? and u.user_id=?', ["admin", user_id], (err, results) => {
      if (err) throw err;
        // check if its an admin
        if(results.length){
          //check if its the last admin
          db.query('select u.user_id,u.email,r.role_name from users u inner join userroles ur on u.user_id=ur.user_id inner join roles r on ur.role_id=r.role_id WHERE u.is_active=1 and r.role_name=?', [results[0].role_name], (err, users) => {
            if (err) throw err;
            if(users.length > 1){
              db.query('UPDATE users SET is_active = 0 WHERE user_id = ?', [user_id], (err) => {
                if (err) throw err;
                res.json({ message: 'User deleted successfully' });
              });
            }
            else{
              res.json({ message: 'Last admin account cannot be deleted.' });
            }
          });
        }
        else{
          db.query('UPDATE users SET is_active = 0 WHERE user_id = ?', [user_id], (err) => {
            if (err) throw err;
            res.json({ message: 'User deleted successfully' });
          });
        }
    });
  });

  // User authentication
  const userAuthentication = ((req, res)=>{

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation Failed");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

    console.log('user input', req.body);
    const data = {
        email: req.body.email,
        password: req.body.password
    };
    db.query('SELECT u.user_id, u.email, u.password, u.first_name, u.last_name, r.role_name from users u inner join userroles ur on u.user_id=ur.user_id inner join roles r on ur.role_id=r.role_id WHERE u.email=? AND u.is_active=1', [data.email],function(err, results){
        if(err) throw err;
        if(results.length){
            console.log('result', results[0]);
            const isEqual = bcryptjs.compare(data.password, results[0].password);
            if (!isEqual) {
              const error = new Error("Incorrect Password");
              error.statusCode = 401;
              throw error;
            }
            const token = jwt.sign(
              {
                user_id: results[0].user_id,
                email: results[0].email,
                role_name: results[0].role_name,
                first_name: results[0].first_name,
                last_name: results[0].last_name
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
      console.log('resetpass values', req.body);
      const { oldPassword, newPassword, passwordConfirmation, user_id } = req.body;
      const saltRounds = 12;

      db.query('SELECT u.user_id, u.email, u.password, u.first_name, u.last_name from users u WHERE u.user_id=? AND u.is_active=1', [user_id],function(err, results){
        if(err) throw err;
        if(results.length){
            console.log('result', results[0]);
            const isEqual = bcryptjs.compare(oldPassword, results[0].password);
            if (!isEqual) {
              const error = new Error("Incorrect Old Password");
              error.statusCode = 401;
              throw error;
            }
            /*
            const token = jwt.sign(
              {
                user_id: results[0].user_id,
                email: results[0].email,
                role_name: results[0].role_name,
                first_name: results[0].first_name,
                last_name: results[0].last_name
              },
              "thisistooconfidential",
              { expiresIn: "1h" }
            );
            */

            //
            bcryptjs
            .hash(newPassword, saltRounds)
            .then((hashedPw) => {
              //change password for user
              db.query('UPDATE users SET password = ? WHERE user_id = ? and email = ?', [hashedPw, results[0].user_id, results[0].email], (err) => {
                res.status(200).json({
                  message: "Password updated Successfuly!",
                });
              });
              
            })
            .then((user) => {
              //res.status(201).json({ message: "Registered Successfully!" });
            })
            .catch((err) => {
              if (!err.statusCode) {
                err.statusCode = 500;
              }
              next(err);
            });
            //
        }
        else{
            res.json({
                message: 'Unable to retrieve user!',
            });
        }
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
    resetUserPassword,
    getAllJobs
  };