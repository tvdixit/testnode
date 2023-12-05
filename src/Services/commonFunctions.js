"use strict";

// Find common functionality.
const findDocuments = async (model, filter) => {
  try {
    const documents = await model.find(filter);
    return documents;
  } catch (error) {
    throw error;
  }
};

// FindOne common functionality.
const findOneDocument = async (model, filter) => {
  try {
    const document = await model.findOne(filter);
    return document;
  } catch (error) {
    throw error;
  }
};

// find function common functionality.
const findInquiriesByStatus = async (model, user_id, status) => {
  try {
    const inquiries = await model
      .find({ user_id, status })
      .select("total_person inquiry_date inquiry_time status review_status")
      .populate(
        "restaurant_id",
        "name image location_address averagerating restaurant_type"
      )
      .exec();

    return inquiries;
  } catch (error) {
    throw error;
  }
};

// status(200).
const sendSuccessResponse = (res, message, data) => {
  return res.status(200).json({ success: true, message, data });
};

// status(400).
const sendBadRequestResponse = (res, message) => {
  return res.status(400).json({ success: false, message });
};

// status(500).
const InternalErrorResponse = (res, error) => {
  return res.status(500).json({ success: false, error: error });
};

module.exports = {
  findDocuments,
  findOneDocument,
  findInquiriesByStatus,
  sendSuccessResponse,
  sendBadRequestResponse,
  InternalErrorResponse,
};
