exports.sanitize = (list = []) => {
  const result = [];

  list.forEach((x) => {
    result.push({
      id: x.id_empresa,
      cnpj: x.nr_empresa_cnpj,
      razaoSocial: x.nm_empresa_razao_social,
    });
  });

  return result;
};
