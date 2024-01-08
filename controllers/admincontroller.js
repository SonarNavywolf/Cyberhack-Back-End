const { raw } = require('mysql2');
const db = require('../models/db.js');
// Require the upload middleware
const upload = require('../upload.js');
const { dateFormatter } = require("../utils.js");
const { clearResume } = require("../utils.js");
const bcryptjs = require("bcryptjs");
const { validationResult } = require("express-validator");

const getAdminDashboardStats = ((req, res) =>{
    let providerCount = 0;
    let jobCount = 0;
    let applicantCount = 0;
    let seekerCount = 0;
    
    const { user_id } = req.params;
    console.log('userId', user_id);
    const ngo_role_name = "ngo";
    const cyber_security_role_name = "cyber_security_expert";
  
   // 1. fetch all job provider count - in this case NGO's
   db.query('select count(1) as provider_count from users u inner join userroles ur on u.user_id = ur.user_id inner join roles r on ur.role_id=r.role_id where r.role_name=? and u.is_active=1', [ngo_role_name], (err, result) => {
    if (err) throw err;
    if (result.length) {
      console.log('result1', result);
      providerCount = result[0].provider_count;
      console.log('providerCount', providerCount);
    }
    // 2. fetch all job count posted by provider NGO
    db.query('select count(1) as job_count FROM jobs j inner join userroles ur on j.provider_id=ur.user_id inner join roles r on r.role_id=ur.role_id WHERE r.role_name=? and j.is_deleted<>1', [ngo_role_name], (err, result) => {
      if (err) throw err;
      console.log('result2', result);
      jobCount = result[0].job_count;
      console.log('jobCount', jobCount);
    });
    // 3. fetch all job seeker count
    db.query('select count(1) as seeker_count FROM users u inner join userroles ur on u.user_id=ur.user_id inner join roles r on r.role_id=ur.role_id WHERE u.is_active=1 and r.role_name<>?', ["admin"], (err, result) => {
      if (err) throw err;
      console.log('result3', result);
      seekerCount = result[0].seeker_count;
      console.log('seekerCount', seekerCount);
    });
  
    // 4. fetch all applicants count
    db.query('select count(1) as applicant_count FROM (select distinct ja.user_id FROM job_application ja inner join userroles ur on ja.provider_id=ur.user_id inner join roles r on r.role_id=ur.role_id inner join users u on u.user_id=ur.user_id WHERE r.role_name=? and ja.is_deleted<>1 and u.is_active=1)t', [ngo_role_name], (err, result) => {
      if (err) throw err;
      console.log('result4', result);
      applicantCount = result[0].applicant_count;
      console.log('applicantsCount', applicantCount);
      res.status(200).json({
        message: "Successfully fetched the stats",
        stats: { providerCount, jobCount, seekerCount, applicantCount},
      });
    });
  });
  
  });
  
  
  const getRecent = ((req, res) =>{  
    const { user_id } = req.params;
    console.log('user_Id', user_id);
  
    let recentUsers = [];
    let recentJobs = [];
    const ngo_role_name = "ngo";
   //fetch recently posted jobs
   db.query('SELECT j.job_id, j.title, j.description, j.category, j.start_date, j.end_date, j.provider_id FROM jobs j WHERE j.is_deleted<>1 order by j.start_date desc', (err, result) => {
    if (err) throw err;
    if(result.length){
      //console.log('result1', result);
      recentJobs = result;
      console.log('recentJobs', recentJobs);
    }
    // fetch users who have recently applied for jobs
    /*
    db.query('select u.user_id, u.email, u.first_name, u.last_name, u.is_active from users u where u.is_active=? and u.user_id<>?', ["1", user_id], (err, result) => {
      if (err) throw err;
      //console.log('result2', result);
      recentUsers = result;
      console.log('recentUsers', recentUsers);
      res.status(200).json({
        message: "Successfully fetched recent stats",
        recentUsers: recentUsers,
        recentJobs: recentJobs,
      });
    });
    */

    db.query('select r.role_name, u.user_id, u.email, u.first_name, u.last_name, u.is_active from users u inner join userroles ur on u.user_id=ur.user_id inner join roles r on r.role_id=ur.role_id where u.is_active=? and u.user_id<>?', ["1", user_id], (err, result) => {
      if (err) throw err;
      //console.log('result2', result);
      recentUsers = result;
      console.log('recentUsers', recentUsers);
      res.status(200).json({
        message: "Successfully fetched recent stats",
        recentUsers: recentUsers,
        recentJobs: recentJobs,
      });
    });
    
  });
  
  });

// Get all users by user id
const getAllUsersByUserId = ((req,res)=>{
  console.log('Inside getAllUsersByUserId');
    const { user_id } = req.params;
    db.query('select r.role_name, u.password, u.user_id, u.email, u.first_name, u.last_name, u.is_active from users u inner join userroles ur on u.user_id=ur.user_id inner join roles r on r.role_id=ur.role_id where u.is_active=1 and u.user_id<>?',[user_id], (err, results) => {
        if (err) throw err;
        //console.log('users',results);
        res.status(200).json({
          message: "Fetched the list of Users",
          users: results,
        });
    });
  });

  const deleteUserByUserId= ((req,res)=>{
    const { user_id } = req.params;
    db.query('UPDATE users set is_active=0 WHERE user_id=? and is_active <> 0',[user_id], (err, results) => {
        if (err) throw err;
        res.status(200).json({
          message: "Deleted user syccessfully!",
        });
    });
  });

    // add a new user
    const addUser = ((req, res)=>{
      console.log('inside add user method');
      /*
      console.log('body', req.body);
      
      const {email, first_name, last_name, password, is_active, role_name } = req.body;
      db.query('INSERT INTO users (email, first_name, last_name, password, is_active) VALUES (?, ?, ?, ?, ?)', [email, first_name, last_name, password, is_active], (err, result) => {
        if (err) throw err;
        res.json({ message: 'User added successfully', id: result.insertId });
      });
      db.query('insert into userroles (user_id, role_id, is_active) select u.user_id, (select role_id from roles where role_name= ? ), ? as is_active from users u where u.email=?', [role_name, is_active, email], (err, result) => {});
      */
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


    const editUser = ((req, res)=>{
      console.log('inside editUser method')
      const { user_id } = req.params;
      console.log('req.params', req.params);
      console.log('req.body', req.body);
      console.log('req.body.first_name', req.body.first_name);
      console.log('user_id', user_id);
      
      db.query('SELECT user_id, first_name, last_name, email FROM users WHERE user_id=? AND is_active=1', [user_id], (err, results) => {
        if (err) throw err;
        if (!results.length) {
          console.log('--users', results);
          res.status(200).json({ message: "User not found" });
        }
        else{
          console.log('--users--', results);
          console.log('req.body.email',req.body.email);
          db.query('UPDATE users SET email = ?, first_name=?, last_name=?, password=? WHERE user_id = ? AND is_active=1', [req.body.email, req.body.first_name, req.body.last_name, req.body.password, user_id], (err) => {
            if (err) throw err;
            res.status(200).json({ message: "User edited successfully!" });
          });
        }
      });
      
    });



const editJobs = ((req, res)=>{
  const { job_id } = req.params;
  const provider_id = req.body.provider_id;
  console.log('edit req.params', req.params);
  console.log('req.body.provider_id', req.body.provider_id);
  console.log('edit req.body.title', req.body.title);
  console.log('edit req.body.job_id', req.body.job_id);
  console.log('edit req.body.description', req.body.description);
  console.log('edit req.body.category', req.body.category);
  console.log('edit req.body.start_date', req.body.start_date);
  console.log('edit req.body.end_date', req.body.end_date);
  console.log('provider_id',provider_id);
  db.query('SELECT j.job_id, j.title, j.description, j.category, j.start_date, j.end_date, j.provider_id FROM jobs j WHERE j.job_id=? AND j.is_deleted<>1', [job_id], (err, results) => {
    if (err) throw err;
    if (!results.length) {
      return res.status(200).json({ message: "Job not found" });
    }
    /*
    if (provider_id.toString() !== results[0].provider_id.toString()) {
      const error = new Error("You are unauthorized to do the action!");
      error.statusCode = 401;
      throw error;
    }
    */
    else{
      console.log('jobs', results);
      db.query('UPDATE jobs SET title = ?, description=?, category=?, start_date=?, end_date=? WHERE provider_id = ? and job_id = ? AND is_deleted<>1 ', [req.body.title, req.body.description, req.body.category, req.body.start_date, req.body.end_date, results[0].provider_id, results[0].job_id], (err) => {
        if (err) throw err;
        res.status(200).json({ message: "Job edited successfully!" });
      });
    }
  });
});


 // add a new user
 const addJob = ((req, res)=>{
  console.log('adding a new job');
  console.log('body', req.body);
  console.log('req.user_id',req.user_id);
  const title = req.body.title;
  const description = req.body.description;
  const category = req.body.category;
  const start_date = req.body.start_date;
  const end_date = req.body.end_date;
  const provider_id = req.body.provider_id;
  const is_deleted = "0";
  //check if current user has already applied for the job
    db.query('INSERT INTO jobs (title, description, category, start_date, end_date, provider_id, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?)', [title, description, category, start_date, end_date, provider_id, is_deleted], (err, result) => {
      if (err) throw err;
      res.status(200).json({ message: 'Successfully added the job!', id: result.insertId });
    });
});

const deleteJob = ((req, res)=>{
  const { job_id } = req.params;
  console.log('req.params', req.params);

  db.query('SELECT j.job_id, j.title, j.description, j.category, j.start_date, j.end_date, j.provider_id FROM jobs j WHERE j.job_id=? and j.is_deleted<>1', [job_id], (err, results) => {
    if (err) throw err;
    if (!results.length) {
      return res.status(200).json({ message: "Job not found" });
    }
    else{
      console.log('jobs', results);
      db.query('UPDATE jobs SET is_deleted = ? WHERE job_id = ? AND is_deleted<>1 ', ["1", results[0].job_id], (err) => {
        if (err) throw err;
        res.status(200).json({ message: "Job deleted successfully!" });
      });
    }
  });
});

// Get jobs by provider Id
const getJobs = ((req, res)=>{
  //const { user_id } = req.params;
  //console.log('req.params', req.params);
  //console.log('user_id', user_id);
  console.log('inside getJobs');
  db.query('SELECT j.job_id, j.title, j.description, j.category, j.start_date, j.end_date, j.provider_id FROM jobs j WHERE j.is_deleted<>1', (err, results) => {
    if (err) throw err;
    console.log('job result', results);
    res.status(200).json({
      message: "Fetched the list of jobs",
      jobs: results,
    });
  });
});

  module.exports = {
    getAdminDashboardStats,
    getRecent,
    getAllUsersByUserId,
    deleteUserByUserId,
    addUser,
    editUser,
    editJobs,
    addJob,
    deleteJob,
    getJobs
};