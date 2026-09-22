const express = require('express');
const donorController = require('../controllers/donorController');
const { authenticate, authorize } = require('../middleware/auth');
const { donorRules, handleValidation } = require('../utils/validators');

const router = express.Router();

router.use(authenticate);

router.post('/', donorRules, handleValidation, donorController.createDonor);
router.get('/', donorController.listDonors);
router.get('/:id', donorController.getDonor);
router.put('/:id', donorRules, handleValidation, donorController.updateDonor);
router.delete('/:id', authorize('admin'), donorController.deleteDonor);

module.exports = router;
