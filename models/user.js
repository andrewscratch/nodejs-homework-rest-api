const {Schema, model } = require('mongoose');
const { handleSaveErrors } = require('../helpers')
const joi = require("joi");

const emailFormat = /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;

const userSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Set name for user'],
  },
    password: {
        type: String,
        required: [true, 'Set password for user'],
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        match: emailFormat,
        unique: true,
    },
    subscription: {
        type: String,
        enum: ["starter", "pro", "business"],
        default: "starter"
    },
    token: {
      type: String,
      default: "",
    },
    avatarURL: {
      type: String,
      required: true,
  },
  verify: {
    type: Boolean,
    default: false,
  },
  verificationCode: {
    type: String,
    default: "",
    required: [true, 'Verify token is required'],
  }
}, { versionKey: false, timestamps: true });

userSchema.post("save", handleSaveErrors);

 const registerSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().pattern(emailFormat).required(),
    password: joi.string().min(6).required(),

  })

  const loginSchema = joi.object({
    email: joi.string().pattern(emailFormat).required(),
    password: joi.string().min(6).required(),
  })

const emailSchema = joi.object({
  email: joi.string().pattern(emailFormat).required(),
})

  const schemas = {
    registerSchema,
    loginSchema,
    emailSchema
  }

  const User = model("user", userSchema);

  module.exports = {
    schemas,
    User
  }