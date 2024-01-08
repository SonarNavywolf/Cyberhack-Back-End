const { raw } = require('mysql2');
const db = require('../models/db.js');
// Require the upload middleware
const upload = require('../upload.js');
const { dateFormatter } = require("../utils.js");
const { clearResume } = require("../utils.js");
const fs = require("fs");
const path = require("path");

// Create a new post
const createNewPost = ((req, res)=>{
    const {post_header, post_body} = req.body;
        db.query('INSERT INTO posts (post_header, post_body) VALUES (?, ?)', [post_header, post_body], (err, result) => {
          if (err) throw err;
          res.json({ message: 'Post added successfully', id: result.insertId });
        });
});

// Create a new userpost
const createNewUserPost = ((req, res)=>{
  const {post_id, user_id, is_deleted} = req.body;
    db.query('INSERT INTO userposts (post_id, user_id, is_deleted) VALUES (?, ?, ?)', [post_id, user_id, is_deleted], (err, result) => {
      if (err) throw err;
      res.json({ message: 'Post added successfully', id: result.insertId });
    });
});

//delete user post
const deletePost = ((req, res)=>{
  const { post_id } = req.params;
    db.query('DELETE FROM posts WHERE post_id = ?', [post_id], (err) => {
      if (err) throw err;
      res.json({ message: 'Post deleted successfully' });
    });
});

// apply for job
//upload.single('file'),
const applyForJobs = ((req, res) =>{
  // Handle the uploaded file
  console.log('resume', req.file);
  console.log('body', req.body);
  
  if (!req.file) {
    const err = new Error("Resume not Found");
    err.statusCode = 422;
    throw err;
  }
  
  const jobId = req.body.jobId;
  const userId = req.body.userId;
  const providerId = req.body.providerId;
  const resume = req.file.path.replace("\\", "/");

  console.log('jobId', jobId);
  let status;
  let status_code;
  let message;

 //check if current user has already applied for the job
 db.query('SELECT job_id FROM job_application WHERE user_id=? AND job_id=? and is_deleted<>1', [userId, jobId], (err, result) => {
  if (err) throw err;
  if (result.length) {
    console.log('duplicate application', result);
    clearResume(resume);
    res.status(200).json({ message: "You have already applied for the job!" });
  }
  else{
    console.log('applying for new job');
    status = "Applied on " + dateFormatter();
    db.query('INSERT INTO job_application (job_id, user_id, resume, status, provider_id, is_deleted) VALUES (?, ?, ?, ?, ?, ?)', [jobId, userId, resume, status, providerId, "0"], (err, result) => {
      if (err) throw err;
      res.status(200).json({ message: 'Successfully applied for the job!', id: result.insertId });
    });
  }
});

});

// Get applied jobs
const getAppliedJobsByUserId = ((req, res)=>{
  const { user_id } = req.params;
  console.log('req.params', req.params);
  console.log('user_id', user_id);
  db.query('SELECT ja.job_id, ja.user_id, ja.resume, ja.status, ja.provider_id, j.title, j.description, j.category, j.start_date, j.end_date FROM job_application ja inner join jobs j on ja.job_id=j.job_id WHERE ja.user_id = ? and ja.is_deleted<>1 and j.is_deleted<>1', [user_id], (err, results) => {
    if (err) throw err;
    res.status(200).json({
      message: "Fetched the list of jobs",
      jobsApplied: results,
    });
  });
});


const getProviderDashboardStats = ((req, res) =>{
  let jobsCount = 0;
  let applicantsCount = 0;
  
  const { user_id } = req.params;
  console.log('userId', user_id);

 //check if current user has already applied for the job
 db.query('SELECT count(1) as job_count FROM jobs WHERE provider_id=? and is_deleted<>1', [user_id], (err, result) => {
  if (err) throw err;
  if (result.length) {
    console.log('result1', result);
    jobsCount = result[0].job_count;
    console.log('jobsCount', jobsCount);
  }
  db.query('select count(1) as applicant_count FROM job_application WHERE provider_id=? and is_deleted<>1', [user_id], (err, result) => {
    if (err) throw err;
    console.log('result2', result);
    applicantsCount = result[0].applicant_count;
    console.log('applicantsCount', applicantsCount);
    res.status(200).json({
      message: "Successfully fetched the stats",
      stats: { jobsCount, applicantsCount },
    });
  });
});

});

const getRecentlyAppliedJobs = ((req, res) =>{  
  const { user_id } = req.params;
  console.log('user_Id', user_id);

 //check if current user has already applied for the job
 db.query('SELECT j.job_id, j.title, j.description, j.category, j.start_date, j.end_date FROM jobs j WHERE j.provider_id = ? and j.is_deleted<>1 order by j.start_date desc', [user_id], (err, result) => {
  if (err) throw err;
  console.log('result3', result);
    res.status(200).json({
          message: "Successfully fetched the recent jobs",
          recentJobs: result,
        });
});

});

// Get jobs by provider Id
const getJobsByProviderId = ((req, res)=>{
  const { user_id } = req.params;
  console.log('req.params', req.params);
  console.log('user_id', user_id);
  db.query('SELECT j.job_id, j.title, j.description, j.category, j.start_date, j.end_date, j.provider_id FROM jobs j WHERE j.provider_id = ? and j.is_deleted<>1', [user_id], (err, results) => {
    if (err) throw err;
    res.status(200).json({
      message: "Fetched the list of jobs",
      jobs: results,
    });
  });
});

const getApplicantsForJob = ((req, res)=>{
  const { user_id } = req.params;
  const { job_id } = req.params;
  console.log('req.params', req.params);
  console.log('user_id', user_id);
  db.query('SELECT u.user_id, u.first_name, u.last_name, ja.job_id, ja.user_id, ja.resume, ja.status, ja.provider_id, j.title, j.description, j.category, j.start_date, j.end_date FROM job_application ja inner join jobs j on ja.job_id=j.job_id inner join users u on ja.user_id=u.user_id WHERE ja.provider_id = ? and ja.job_id = ? AND ja.is_deleted<>1 AND ja.status LIKE ?', [user_id, job_id, "Applied%"], (err, results) => {
    if (err) throw err;
    if (!results.length) {
      return res
        .status(200)
        .json({ message: "Looks like no one has applied yet!" });
    }
    return res.status(200).json({
      message: "Successfully fetched the applicants",
      applicants: results,
    });
  });
});


const getShortListsForJob = ((req, res)=>{
  const { user_id } = req.params;
  const { job_id } = req.params;
  console.log('req.params', req.params);
  console.log('user_id', user_id);
  db.query('SELECT u.user_id, u.email, u.first_name, u.last_name, ja.job_id, ja.user_id, ja.resume, ja.status, ja.provider_id, j.title, j.description, j.category, j.start_date, j.end_date FROM job_application ja inner join jobs j on ja.job_id=j.job_id inner join users u on ja.user_id=u.user_id WHERE ja.provider_id = ? and ja.job_id = ?  AND j.is_deleted<>1 AND ja.is_deleted<>1 AND ja.status LIKE ?', [user_id, job_id, "Shortlisted%"], (err, results) => {
    if (err) throw err;
    if (!results.length) {
      return res
        .status(200)
        .json({ message: "Looks like no one has been shortlisted yet" });
    }
    return res.status(200).json({
      message: "Successfully fetched the applicants",
      shortlists: results,
    });
  });
});

const shortlistApplicant = ((req, res)=>{
  const { user_id } = req.params;
  const { provider_id } = req.params;
  const { job_id } = req.params;
  console.log('req.params', req.params);
  const status = "Shortlisted";
  db.query('SELECT u.user_id, u.first_name, u.last_name, ja.job_id, ja.user_id, ja.resume, ja.status, ja.provider_id, j.title, j.description, j.category, j.start_date, j.end_date FROM job_application ja inner join jobs j on ja.job_id=j.job_id inner join users u on ja.user_id=u.user_id WHERE ja.user_id=? and ja.provider_id=? and ja.job_id=? AND ja.is_deleted<>1 AND j.is_deleted<>1', [user_id, provider_id, job_id], (err, results) => {
    if (err) throw err;
    if (!results.length) {
      return res.status(200).json({ message: "Applicant not found" });
    }
    console.log('results', results);
    if (provider_id.toString() !== results[0].provider_id.toString()) {
      const error = new Error("You are unauthorized to do the action!");
      error.statusCode = 401;
      throw error;
    }
    if (results.status === "Shortlisted") {
      return res.status(200).json({ message: "Already shortlisted!" });
    }
    else{
      db.query('UPDATE job_application SET status = ? WHERE user_id = ? and provider_id = ? and job_id = ? and is_deleted<>1', [status, user_id, provider_id, results[0].job_id], (err) => {
        if (err) throw err;
        res.status(200).json({ message: "Shortlisted the candidate!" });
      });
    }
  });
});


const getApplicantResume = ((req, res)=>{
  const { user_id } = req.params;
  const { provider_id } = req.params;
  const { job_id } = req.params;
  console.log('req.params', req.params);

  db.query('SELECT u.user_id, u.first_name, u.last_name, ja.job_id, ja.user_id, ja.resume, ja.status, ja.provider_id, j.title, j.description, j.category, j.start_date, j.end_date FROM job_application ja inner join jobs j on ja.job_id=j.job_id inner join users u on ja.user_id=u.user_id WHERE ja.user_id=? and ja.provider_id=? and ja.job_id=? AND ja.is_deleted<>1 AND j.is_deleted<>1', [user_id, provider_id, job_id], (err, results) => {
    if (err) throw err;
    if (!results.length) {
      return res.status(200).json({ message: "Applicant not found" });
    }
    console.log('results', results);
    if (provider_id.toString() !== results[0].provider_id.toString()) {
      const error = new Error("You are unauthorized to do the action!");
      error.statusCode = 401;
      throw error;
    }
    else{
      const resumeFile = results[0].resume;
      const resumePath = path.join(resumeFile);
      fs.readFile(resumePath, (err, data) => {
        if (err) {
          return next(err);
        }
        res.setHeader("Content-type", "application/pdf");
        res.send(data);
      });
    }
  });
});

const rejectApplicant = ((req, res)=>{
  const { user_id } = req.params;
  const { provider_id } = req.params;
  const { job_id } = req.params;
  console.log('req.params', req.params);

  db.query('SELECT u.user_id, u.first_name, u.last_name, ja.job_id, ja.user_id, ja.resume, ja.status, ja.provider_id, j.title, j.description, j.category, j.start_date, j.end_date FROM job_application ja inner join jobs j on ja.job_id=j.job_id inner join users u on ja.user_id=u.user_id WHERE ja.user_id=? and ja.provider_id=? and ja.job_id=? AND ja.is_deleted<>1 AND j.is_deleted<>1', [user_id, provider_id, job_id], (err, results) => {
    if (err) throw err;
    if (!results.length) {
      return res.status(200).json({ message: "Applicant not found" });
    }
    console.log('results', results);
    if (provider_id.toString() !== results[0].provider_id.toString()) {
      const error = new Error("You are unauthorized to do the action!");
      error.statusCode = 401;
      throw error;
    }
    else{
      clearResume(results[0].resume);
      db.query('UPDATE job_application SET is_deleted = ? WHERE user_id = ? and provider_id = ? and job_id = ? AND is_deleted<>1 ', ["1", user_id, provider_id, results[0].job_id], (err) => {
        if (err) throw err;
        res.status(200).json({ message: "Applicant rejected successfully!" });
      });
    }
  });
});


const deleteJobs = ((req, res)=>{
  const { job_id } = req.params;
  const { provider_id } = req.params;
  console.log('delete req.params', req.params);

  db.query('SELECT j.job_id, j.title, j.description, j.category, j.start_date, j.end_date, j.provider_id FROM jobs j WHERE j.job_id=? and j.provider_id=? AND j.is_deleted<>1', [job_id, provider_id], (err, results) => {
    if (err) throw err;
    if (!results.length) {
      return res.status(200).json({ message: "Job not found" });
    }
    console.log('jobs', results);
    if (provider_id.toString() !== results[0].provider_id.toString()) {
      const error = new Error("You are unauthorized to do the action!");
      error.statusCode = 401;
      throw error;
    }
    else{
      db.query('UPDATE jobs SET is_deleted = ? WHERE provider_id = ? and job_id = ? AND is_deleted<>1 ', ["1", provider_id, results[0].job_id], (err) => {
        if (err) throw err;
        res.status(200).json({ message: "Job deleted successfully!" });
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
    console.log('jobs', results);
    if (provider_id.toString() !== results[0].provider_id.toString()) {
      const error = new Error("You are unauthorized to do the action!");
      error.statusCode = 401;
      throw error;
    }
    else{
      db.query('UPDATE jobs SET title = ?, description=?, category=?, start_date=?, end_date=? WHERE provider_id = ? and job_id = ? AND is_deleted<>1 ', [req.body.title, req.body.description, req.body.category, req.body.start_date, req.body.end_date, results[0].provider_id, results[0].job_id], (err) => {
        if (err) throw err;
        res.status(200).json({ message: "Job edited successfully!" });
      });
    }
  });
});

// Get jobs by job_Id
const getJobsByJobId = ((req, res)=>{
  const { job_id } = req.params;
  console.log('req.params', req.params);

  db.query('SELECT j.job_id, j.title, j.description, j.category, j.start_date, j.end_date FROM jobs j WHERE j.job_id=? AND j.is_deleted<>1', [job_id], (err, results) => {
    if (err) throw err;
    res.status(200).json({
      message: "Fetched the list of jobs",
      job: results[0],
    });
  });
});

//add job function
const addJobs = ((req, res) =>{
  console.log('body', req.body);
  const title = req.body.title;
  const description = req.body.description;
  const category = req.body.category;
  const start_date = req.body.start_date;
  const end_date = req.body.end_date;
  const provider_id = req.body.provider_id;
  const is_deleted = "0";
  //check if current user has already applied for the job
    console.log('adding a new job');
    db.query('INSERT INTO jobs (title, description, category, start_date, end_date, provider_id, is_deleted) VALUES (?, ?, ?, ?, ?, ?, ?)', [title, description, category, start_date, end_date, provider_id, is_deleted], (err, result) => {
      if (err) throw err;
      res.status(200).json({ message: 'Successfully added the job!', id: result.insertId });
    });

});

module.exports = {
    createNewPost,
    createNewUserPost,
    deletePost,
    applyForJobs,
    getAppliedJobsByUserId,
    getProviderDashboardStats,
    getRecentlyAppliedJobs,
    getJobsByProviderId,
    getApplicantsForJob,
    getShortListsForJob,
    shortlistApplicant,
    rejectApplicant,
    deleteJobs,
    getJobsByJobId,
    editJobs,
    addJobs,
    getApplicantResume
};