const AWS = require("aws-sdk");
const guid = require("guid");

exports.reducerArrayInParts = (itens, maximo) => {
  return itens.reduce((acumulador, item, indice) => {
    const grupo = Math.floor(indice / maximo);
    acumulador[grupo] = [...(acumulador[grupo] || []), item];
    return acumulador;
  }, []);
};

exports.processAndSendMessage = async (itens) => {
  const lots = this.reducerArrayInParts(itens, process.env.SQS_BATCHSIZE);
  const promises = lots.map((lot) => this.sendMessage(process.env.QUEUE, lot));
  await Promise.all(promises);
};

exports.sendMessage = (queue, data) => {
  const sqs = new AWS.SQS({ region: process.env.REGION });
  var message = {
    MessageBody: JSON.stringify(data),
    QueueUrl: queue,
  };
  return sqs.sendMessage(message).promise();
};

exports.logger = async (props) => {
  const now = new Date();
  const { startDate, identity, request, response, context } = props;
  const ddb = new AWS.DynamoDB({ region: process.env.REGION });
  const params = {
    TableName: process.env.TABLE,
    Item: {
      id: { S: guid.raw() },
      funcao: { S: context.functionName },
      partitionKey: {
        S: `${context.functionName}-${now.getFullYear()}-${
          now.getMonth() + 1
        }-${now.getDate()}`,
      },
      request: { S: JSON.stringify(request) },
      identity: { S: JSON.stringify(identity) },
      response: { S: JSON.stringify(response) },
      data_inicio_processamento: { S: startDate },
      data_fim_processamento: { S: now.toUTCString() },
    },
  };
  await ddb.putItem(params).promise();
};
