const express = require("express");
const router = express.Router();
const memberController = require("../controllers/member.controller");
const { validateMember } = require("../middlewares/validateRequest");

router.post("/", validateMember, memberController.createMember);
router.get("/", memberController.getAllMembers);
router.get("/:id", memberController.getMemberById);
router.put("/:id", validateMember, memberController.updateMember);
router.delete("/:id", memberController.deleteMember);

module.exports = router;
