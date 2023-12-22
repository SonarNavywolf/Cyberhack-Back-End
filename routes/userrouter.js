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
    resetUserPassword
} = require('../controllers/userscontroller.js');

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/register', registerNewUser);
router.put('/:id', updateExistingUser);
router.delete('/:id', deleteExistingUser);
router.post('/login', userAuthentication);
router.post('/userroles', createNewUserRole);
router.post('resetpassword', resetUserPassword);

module.exports = router;