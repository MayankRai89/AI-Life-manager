import { body, validationResult } from "express-validator";

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    return res.status(400).json({
      status: "fail",
      message: "Validation failed",
      errors: formattedErrors,
    });
  }

  next();
};

export const validate = (validations) => {
  return async (req, res, next) => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }
    return handleValidationErrors(req, res, next);
  };
};


export const registerValidationRules = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage(
      "Username can only contain alphanumeric characters, dots, underscores, and dashes"
    ),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("phoneNumber")
    .optional({ values: "falsy" })
    .trim()
    .matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/)
    .withMessage("Please provide a valid phone number"),

  body("age")
    .optional({ values: "falsy" })
    .isInt({ min: 1, max: 120 })
    .withMessage("Age must be a number between 1 and 120"),

  body("gender")
    .optional({ values: "falsy" })
    .isIn(["male", "female", "other", "prefer_not_to_say"])
    .withMessage("Gender must be 'male', 'female', 'other', or 'prefer_not_to_say'"),

  body("timezone")
    .optional({ values: "falsy" })
    .isString()
    .trim()
    .withMessage("Timezone must be a valid string"),

  body("schedule.wakeTime")
    .optional()
    .isString()
    .withMessage("Wake time must be a valid time string (e.g. 07:00)"),

  body("schedule.sleepTime")
    .optional()
    .isString()
    .withMessage("Sleep time must be a valid time string (e.g. 23:00)"),

  body("schedule.workingHours.start")
    .optional()
    .isString()
    .withMessage("Working hours start must be a valid time string"),

  body("schedule.workingHours.end")
    .optional()
    .isString()
    .withMessage("Working hours end must be a valid time string"),

  body("medicalReport")
    .optional()
    .isObject()
    .withMessage("Medical report must be an object"),
];


export const loginValidationRules = [
  body("identifier")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Identifier cannot be empty"),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address"),

  body("username")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Username cannot be empty"),

  body().custom((value, { req }) => {
    if (!req.body.identifier && !req.body.email && !req.body.username) {
      throw new Error("Please provide your username or email");
    }
    return true;
  }),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

export default {
  handleValidationErrors,
  validate,
  registerValidationRules,
  loginValidationRules,
};
