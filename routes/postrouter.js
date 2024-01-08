const express = require('express');
const router = express.Router();
const upload = require('../upload.js');

const {
    createNewPost, 
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
} = require('../controllers/postscontroller.js');

router.post('/addpost', createNewPost);
router.post('/userposts',createNewPost);
router.delete('/:id', deletePost);
router.post('/apply', upload.single('resume'), applyForJobs);
router.get('/jobsapplied/:user_id', getAppliedJobsByUserId);
router.get('/dashboard-stats/:user_id', getProviderDashboardStats);
router.get('/dashboard-recents/:user_id', getRecentlyAppliedJobs);
router.get('/provider/jobs/:user_id', getJobsByProviderId);
router.get('/provider/view-applicants/:user_id/:job_id', getApplicantsForJob);
router.get('/provider/view-shortlists/:user_id/:job_id', getShortListsForJob);
router.get('/provider/shortlist/:user_id/:provider_id/:job_id', shortlistApplicant);
router.get('/provider/reject/:user_id/:provider_id/:job_id', rejectApplicant);
router.get('/provider/jobs/delete/:job_id/:provider_id', deleteJobs);
router.get('/provider/jobs/fetch/:job_id', getJobsByJobId);
router.put('/provider/edit-job/:job_id', editJobs);
router.post('/provider/add-job', addJobs);
router.get('/provider/view-resume/:user_id/:provider_id/:job_id', getApplicantResume);

module.exports = router;