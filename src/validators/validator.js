const Validator = require("fastest-validator");
const { User } = require("../../models/");
const v = new Validator();

const schema = {
  email: { type: "email", unique: true },
  password: {
    type: "string",
    min: 8,
    max: 255,
    unique: true,
    pattern: /^[^\s]+$/,
  },
};

const check = v.compile(schema);

async function validateUser(userInput) {
  const validationResult = check(userInput);

  if (validationResult !== true) {
    return { error: validationResult };
  }

  const { email, password } = userInput;

  if (!email) {
    return { error: "Email is required" };
  }

  const existingEmailUser = await User.findOne({ where: { email } });

  if (existingEmailUser) {
    return { error: "Email already in use" };
  }

  if (!password) {
    return { error: "Password is required" };
  }

  return { isValid: true };
}

async function validateEmail(email) {
  const existingEmailUser = await User.findOne({ where: { email } });

  if (existingEmailUser) {
    return { error: "Email already in use" };
  }

  return { isValid: true };
}

module.exports = { validateUser, validateEmail };
