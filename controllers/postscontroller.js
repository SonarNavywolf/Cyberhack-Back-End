const db = require('../models/db.js');

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

module.exports = {
    createNewPost,
    createNewUserPost,
    deletePost
};