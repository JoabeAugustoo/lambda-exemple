const AWS = require("aws-sdk");
const guid = require("guid");

exports.reducerArrayInParts = (itens, maximo) => {
  return itens.reduce((acumulador, item, indice) => {
    const grupo = Math.floor(indice / maximo);
    acumulador[grupo] = [...(acumulador[grupo] || []), item];
    return acumulador;
  }, []);
};

exports.sendMessag = (queue, data) => {
  const sqs = new AWS.SQS({ region: "sa-east-1" });
  var message = {
    MessageBody: JSON.stringify(data),
    QueueUrl: queue,
  };
  return sqs.sendMessage(message).promise();
};

exports.logger = async (props) => {
  const { dataInicio, client, body, response, nameFunction } = props;
  const ddb = new AWS.DynamoDB({ region: "sa-east-1" });
  const params = {
    TableName: process.env.TABLE,
    Item: {
      id: { S: guid.raw() },
      funcao: { S: nameFunction },
      body: { S: JSON.stringify(body) },
      ip_client: { S: client },
      response: { S: JSON.stringify(response) },
      data_inicio_processamento: { S: dataInicio },
      data_fim_processamento: { S: new Date().toUTCString() },
    },
  };
  await ddb.putItem(params).promise();
};
