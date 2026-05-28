const Joi = require('joi');

exports.registerSchema = Joi.object({
  username: Joi.string().required(),
  email:    Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  extra:    Joi.string().required(),        // studentId
  phone:    Joi.string().pattern(/^[0-9+]{9,15}$/).required(),
  address:  Joi.string().required()
});
exports.createStudentSchema = Joi.object({
  name:      Joi.string().required(),
  email:     Joi.string().email().required(),
  password:  Joi.string().min(8).required(),
  studentId: Joi.string().required(),
  phone:     Joi.string().pattern(/^[0-9+]{9,15}$/).required(),
  address:   Joi.string().required(),
  major:     Joi.string().required(),
  year:      Joi.number().integer().required()
});


