const { isIntegerAndNotNull, isStringAndNotNull } = require("../../validator");

exports.validate = (list) => {
  const errors = [];
  list.forEach((x) => {
    const errosForId = { id_empresa: x.id_empresa, erros: [] };
    if (!isIntegerAndNotNull(x.id_empresa)) {
      errosForId.erros.push(
        `id_empresa deve ser um numero inteiro  e não nulo e está com o valor: ${x.id_empresa}`
      );
    }
    if (!isStringAndNotNull(x.nr_empresa_cnpj)) {
      errosForId.erros.push(
        `nr_empresa_cnpj deve ser um string e não nulo e está com o valor: ${x.nr_empresa_cnpj}`
      );
    }
    if (!isStringAndNotNull(x.nm_empresa_razao_social)) {
      errosForId.erros.push(
        `nm_empresa_razao_social deve ser um string e não nulo e está com o valor: ${x.nm_empresa_razao_social}`
      );
    }
    if (errosForId.erros.length > 0) {
      errors.push(errosForId);
    }
  });
  return errors;
};
