const { reducerArrayInParts, sendMessag, logger } = require("../../util/index");

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
      const promisses = [];
      lotes.forEach((lotes) =>
        promisses.push(sendMessag(process.env.QUEUE, lotes))
      );
      await Promise.all(promisses);
    }
  }
  const response = {
    statusCode: erros.length === 0 ? 200 : 400,
    erros,
  };

  const log = {
    dataInicio: initRequest,
    client,
    body: rest,
    response,
    nameFunction: 'getAllEmpresasCNU'
  };

  await logger(log);
  return response;
};
