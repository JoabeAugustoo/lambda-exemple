const { processAndSendMessage, logger } = require("../../util/index");
const { validateFields } = require("../../validator/index");

exports.index = async (event, context) => {
  const startDate = new Date().toUTCString();
  const { body, ...request } = event;
  const identity = request.requestContext.identity;
  const list = JSON.parse(body);
  console.log();
  let errors = [];

  console.log(
    `${context.functionName}: Quantity received items: ${list.length}`
  );

  if (list.length > 1000) {
    errors.push(
      `Quantity received items: ${list.length}. Maximum allowed: ${process.env.MAX_ACCEPTABLE_INPUT_BATCHSIZE}`
    );
  } else {
    errors = validateFields(list, ["id int", "nr_cnpj", "nm_razao_social"]);

    if (errors.length === 0) {
      await processAndSendMessage(list);
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
