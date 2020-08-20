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
  const queue = await this.getUrlQueue(process.env.QUEUE);
  const promises = lots.map((lot) => this.sendMessage(queue.QueueUrl, lot));
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

exports.getUrlQueue = async (name) => {
  var params = { QueueName: name };
  const sqs = new AWS.SQS({ region: process.env.REGION });
  let url;
  try {
    url = await sqs.getQueueUrl(params).promise();
  } catch {
    url = await sqs.createQueue(params).promise();
  }
  return url;
};

exports.logger = async (props) => {
  const now = new Date();
  const { startDate, client, body, response } = props;
  const ddb = new AWS.DynamoDB({ region: process.env.REGION });
  const functionName = process.env.FUNCTION_NAME;
  const params = {
    TableName: functionName,
    Item: {
      id: { S: guid.raw() },
      funcao: { S: functionName },
      partitionKey: {
        S: `${functionName}-${now.getFullYear()}-${
          now.getMonth() + 1
        }-${now.getDate()}`,
      },
      body: { S: JSON.stringify(body) },
      ip_client: { S: client },
      response: { S: JSON.stringify(response) },
      data_inicio_processamento: { S: startDate },
      data_fim_processamento: { S: now.toUTCString() },
    },
  };
  await ddb.putItem(params).promise();
};
