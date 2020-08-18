const AWS = require("aws-sdk");
const Guid = require("guid");
const { reducerArrayInParts } = require("../../util/index");

const log = async (dataInicio, client, body, response) => {
  const ddb = new AWS.DynamoDB({ region: "sa-east-1" });
  const params = {
    TableName: process.env.TABLE,
    Item: {
      id: { S: Guid.raw() },
      funcao: { S: "getAllEmpresas" },
      body: { S: JSON.stringify(body) },
      ip_client: { S: client },
      response: { S: JSON.stringify(response) },
      data_inicio_processamento: { S: dataInicio },
      data_fim_processamento: { S: new Date().toUTCString() },
    },
  };
  await ddb.putItem(params).promise();
};

const sendMessag = async (data) => {
  const sqs = new AWS.SQS({ region: "sa-east-1" });
  var message = {
    MessageBody: JSON.stringify(data),
    QueueUrl: process.env.QUEUE,
  };
  await sqs.sendMessage(message).promise();
};

const validate = {
  nome: (nome) => {
    return !!nome;
  },
};

exports.index = async (event) => {
  const initRequest = new Date().toUTCString();
  const { data, client, ...rest } = event;
  const list = Array(...data);

  const erros = [];

  console.log(`TOTAL DE REGISTROS QUE CHEGARAM: ${list.length}`);

  if (list.length > 1000) {
    erros.push(
      `O maximo de registros permitidos é de 1000, a quantidade enviada foi de ${list.length}`
    );
  } else {
    list.forEach((item) => {
      if (!validate["nome"](item.nome)) {
        erros.push(`Registro com o id: ${item.id} está sem nome`);
      }
    });

    if (erros.length === 0) {
      const lotes = reducerArrayInParts(list, 200);
      for (const indice in lotes) {
        await sendMessag(lotes[indice]);
      }
    }
  }
  const response = {
    statusCode: erros.length === 0 ? 200 : 400,
    erros,
  };

  await log(initRequest, client, rest, response);
  return response;
};
