const Joi = require("joi");

const createPostSchema = Joi.object({
  title: Joi.string().min(3).max(200).required().messages({
    "string.empty": `"title" cannot be empty`,
    "string.min": `"title" should have at least {#limit} characters`,
    "any.required": `"title" is required`,
  }),
  subtitle: Joi.string().optional().allow("").messages({
    "string.base": `"subtitle" should be a string`,
  }),
  content: Joi.string().min(10).required().messages({
    "string.empty": `"content" cannot be empty`,
    "string.min": `"content" should have at least {#limit} characters`,
    "any.required": `"content" is required`,
  }),
});

const updatePostSchema = Joi.object({
  title: Joi.string().min(3).max(200).messages({
    "string.min": `"title" should have at least {#limit} characters`,
  }),
  subtitle: Joi.string(),
  content: Joi.string().min(10).messages({
    "string.min": `"content" should have at least {#limit} characters`,
  }),
}).or("title", "subtitle", "content");

module.exports = {
  createPostSchema,
  updatePostSchema,
};
