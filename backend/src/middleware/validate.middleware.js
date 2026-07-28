function validate(schema) {
  return (req, res, next) => {
    const isFullReqSchema =
      schema.shape &&
      (schema.shape.body || schema.shape.query || schema.shape.params);

    const dataToValidate = isFullReqSchema
      ? { body: req.body, query: req.query, params: req.params }
      : req.body;

    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues.map((issue) => ({
          field:
            issue.path.filter((p) => p !== "body").join(".") ||
            issue.path.join("."),
          message: issue.message,
        })),
      });
    }

    if (isFullReqSchema) {
      if (result.data.body) req.body = result.data.body;
      if (result.data.query) req.query = result.data.query;
      if (result.data.params) req.params = result.data.params;
    } else {
      req.body = result.data;
    }

    next();
  };
}

module.exports = validate;

