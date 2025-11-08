const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    "string.empty": `"name" cannot be empty`,
    "string.min": `"name" should have at least {#limit} characters`,
    "any.required": `"name" is required`,
  }),
  email: Joi.string().email().required().messages({
    "string.email": `"email" must be a valid email address`,
    "string.empty": `"email" cannot be empty`,
    "any.required": `"email" is required`,
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": `"password" cannot be empty`,
    "string.min": `"password" should have at least {#limit} characters`,
    "any.required": `"password" is required`,
  }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": `"confirmPassword" must match "password"`,
    "any.required": `"confirmPassword" is required`,
  }),
  address: Joi.string().required().messages({
    "string.empty": `"address" cannot be empty`,
    "any.required": `"address" is required`,
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": `"email" must be a valid email address`,
    "string.empty": `"email" cannot be empty`,
    "any.required": `"email" is required`,
  }),
  password: Joi.string().min(6).required().messages({
    "string.empty": `"password" cannot be empty`,
    "string.min": `"password" should have at least {#limit} characters`,
    "any.required": `"password" is required`,
  }),
});

const updatePasswordSchema = Joi.object({
  oldPassword: Joi.string().min(6).required().messages({
    "string.empty": `"oldPassword" cannot be empty`,
    "string.min": `"oldPassword" should have at least {#limit} characters`,
    "any.required": `"oldPassword" is required`,
  }),
  newPassword: Joi.string().min(6).required().messages({
    "string.empty": `"newPassword" cannot be empty`,
    "string.min": `"newPassword" should have at least {#limit} characters`,
    "any.required": `"newPassword" is required`,
  }),
});

const verifyOtpSchema = Joi.object({
  userId: Joi.string().trim().required().messages({
    "string.empty": `User ID cannot be empty`,
    "any.required": `User ID is required`,
  }),

  otp: Joi.string()
    .trim()
    .length(6)
    .pattern(/^\d{6}$/)
    .required()
    .messages({
      "string.empty": `OTP cannot be empty`,
      "any.required": `OTP is required`,
      "string.length": `OTP must be exactly 6 digits`,
      "string.pattern.base": `OTP must contain only numbers`,
    }),
});

const resetPasswordLinkSchema = Joi.object({
  email: Joi.string()
    .email({ minDomainSegments: 2, tlds: { allow: ["com", "net", "org"] } })
    .required()
    .messages({
      "string.email": `"email" must be a valid email address`,
      "string.empty": `"email" cannot be empty`,
      "any.required": `"email" is required`,
    }),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required().messages({
    "string.empty": `"password" cannot be empty`,
    "string.min": `"password" should have at least {#limit} characters`,
    "any.required": `"password" is required`,
  }),
  confirm_password: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": `"confirm_password" must match "password"`,
      "any.required": `"confirm_password" is required`,
    }),
});
module.exports = {
  registerSchema,
  loginSchema,
  updatePasswordSchema,
  verifyOtpSchema,
  resetPasswordLinkSchema,
  resetPasswordSchema,
};
