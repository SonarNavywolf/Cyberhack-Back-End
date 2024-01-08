const express = require('express');
const router = express.Router();
const upload = require('../upload.js');

const {
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
} = require('../controllers/admincontroller.js');

router.get('/admin/dashboard-stats/:user_id', getAdminDashboardStats);
router.get('/admin/dashboard-recents/:user_id', getRecent);
router.get('/admin/:user_id', getAllUsersByUserId);
router.put('/admin/users/:user_id', deleteUserByUserId);
router.post('/admin/add-user', addUser);
router.put('/admin/edit-user/:user_id', editUser);
router.put('/admin/edit-job/:job_id', editJobs);
router.post('/admin/add-job', addJob);
router.delete('/admin/jobs/:job_id', deleteJob);
router.get('/admin/jobs', getJobs);

module.exports = router;