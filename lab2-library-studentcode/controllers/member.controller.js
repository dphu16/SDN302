const Member = require("../models/Member");

exports.createMember = async (req, res, next) => {
  try {
    const member = await Member.create(req.body);
    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
};

exports.getAllMembers = async (req, res, next) => {
  try {
    const members = await Member.find();
    res.status(200).json(members);
  } catch (err) {
    next(err);
  }
};

exports.getMemberById = async (req, res, next) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: "Member does not exist" });
    }
    res.status(200).json(member);
  } catch (err) {
    next(err);
  }
};

exports.updateMember = async (req, res, next) => {
  try {
    const updatedMember = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    if (!updatedMember) {
      return res.status(404).json({ message: "Member does not exist" });
    }
    res.status(200).json(updatedMember);
  } catch (err) {
    next(err);
  }
};

exports.deleteMember = async (req, res, next) => {
  try {
    const deletedMember = await Member.findByIdAndDelete(req.params.id);
    if (!deletedMember) {
      return res.status(404).json({ message: "Member does not exist" });
    }
    res.status(200).json({ message: "Member deleted successfully" });
  } catch (err) {
    next(err);
  }
};
