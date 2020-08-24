const { processAndSendMessage, logger } = require("./util");

exports.process = async (event, context, validate, sanitize) => {
  const startDate = new Date().toUTCString();
  const { body, ...request } = event;
  const identity = request.requestContext.identity;
  const list = JSON.parse(body);
  let errors = [];

  console.log(
    `${context.functionName}: Quantity received items: ${list.length}`
  );

  if (list.length > process.env.MAX_ACCEPTABLE_INPUT_BATCHSIZE) {
    errors.push(
      `Quantity received items: ${list.length}. Maximum allowed: ${process.env.MAX_ACCEPTABLE_INPUT_BATCHSIZE}`
    );
  } else {
    const resultValidate =
      !!validate && typeof validate === "function" ? validate(list) : [];
    errors = [...errors, ...resultValidate];
    if (errors.length === 0) {
      const listSanitized =
        !!sanitize && typeof sanitize === "function" ? sanitize(list) : list;
      await processAndSendMessage(listSanitized);
    }
  }

  let response = {
    statusCode: 200,
    body: JSON.stringify({
      message: "todos os dados foram importados com sucesso",
    }),
  };

  if (errors.length > 0) {
    response = {
      statusCode: 400,
      body: JSON.stringify({ errors }),
    };
  }

  const log = {
    request: event,
    startDate,
    identity,
    response,
    context,
  };

  await logger(log);
  return response;
};
