const express = require('express');
const {
  listEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
  updateEnquiryNotes,
  assignDriver,
  assignVehicle,
  assignRoom,
  assignPackage,
  updateQuote,
  archiveEnquiry,
  updateEnquiry,
} = require('../controllers/bookingController');
const { protectAdmin } = require('../middleware/authMiddleware');
const {
  validateAdminStatusUpdate,
  validateAdminNotesUpdate,
  validateAssignmentPayload,
  validateQuotePayload,
} = require('../middleware/enquiryValidation');

const router = express.Router();

router.use(protectAdmin);

router.get('/', listEnquiries);
router.get('/:id', getEnquiryById);
router.patch('/:id/status', validateAdminStatusUpdate, updateEnquiryStatus);
router.patch('/:id/notes', validateAdminNotesUpdate, updateEnquiryNotes);
router.patch('/:id/assign-driver', validateAssignmentPayload('driver_id'), assignDriver);
router.patch('/:id/assign-vehicle', validateAssignmentPayload('vehicle_id'), assignVehicle);
router.patch('/:id/assign-room', validateAssignmentPayload('room_id', 'hotel_option'), assignRoom);
router.patch('/:id/assign-package', validateAssignmentPayload('package_id'), assignPackage);
router.patch('/:id/quote', validateQuotePayload, updateQuote);
router.patch('/:id/archive', archiveEnquiry);
router.patch('/:id/enquiry', updateEnquiry);

module.exports = router;
