const express = require('express');
const router = express.Router();

const {
    createNewPost, deletePost
} = require('../controllers/postscontroller.js');

router.post('/addpost', createNewPost);
router.post('/userposts',createNewPost);
router.delete('/:id', deletePost);

module.exports = router;