const { validate } = require("./validate");
const { sanitize } = require("./sanitize");
const { process } = require("../../base");

exports.index = async (event, context) => {
  const result = await process(event, context, validate, sanitize);
  return result;
};
