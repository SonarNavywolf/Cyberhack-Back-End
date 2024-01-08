const express = require('express');
const router = express.Router();

const {
    getAllUsers,
    getUserById,
    registerNewUser,
    updateExistingUser,
    deleteExistingUser,
    userAuthentication,
    createNewUserRole,
    resetUserPassword,
    getAllJobs
} = require('../controllers/userscontroller.js');

router.get('/', getAllUsers);
router.get('/jobs', getAllJobs);
router.get('/:user_id', getUserById);
router.post('/register', registerNewUser);
router.put('/:user_id', updateExistingUser);
router.delete('/:user_id', deleteExistingUser);
router.post('/login', userAuthentication);
router.post('/userroles', createNewUserRole);
router.post('/resetpassword', resetUserPassword);

module.exports = router;