const { processAndSendMessage, logger } = require("../../util/index");
const { validateFields } = require("../../validator/index");

exports.index = async (event) => {
  const startDate = new Date().toUTCString();
  console.log(event);
  const body = event.body;
  const { data, client, ...rest } = JSON.parse(body);
  console.log(data);
  console.log(client);
  console.log(rest);

  const list = Array(...data);

  let errors = [];

  console.log(`${process.env.FUNCTION_NAME}: Quantity received items: ${list.length}`);

  if (list.length > 1000) {
    errors.push(
      `Quantity received items: ${list.length}. Maximum allowed: ${process.env.MAX_ACCEPTABLE_INPUT_BATCHSIZE}`
    );
  } else {
    errors = validateFields(list, [
      'id int',
      'nr_cnpj',
      'nm_razao_social'
    ]);

    if (errors.length === 0) {
      await processAndSendMessage(list);
    }
  }

  const response = {
    statusCode: errors.length === 0 ? 200 : 400,
    body: errors.length === 0 ? true : errors,
  };

  const log = {
    body: rest,
    startDate,
    client,
    response,
  };

  await logger(log);
  return response;
};
