const { processAndSendMessage, logger } = require("../../util/index");
const { validateFields } = require("../../validator/index");

exports.index = async (event) => {
  const startDate = new Date().toUTCString();
  const { data, client, ...rest } = event;
  const list = Array(...data);

  let errors = [];

  console.log(`${process.env.FUNCTION_NAME}: Quantity received items: ${list.length}`);

  if (list.length > 1000) {
    errors.push(
      `Quantity received items: ${list.length}. Maximum allowed: ${process.env.MAX_ACCEPTABLE_INPUT_BATCHSIZE}`
    );
  } else {
    errors = validateFields(list, [
      'id_unidade_negocio long',
      'id_tipo_produto long',
      'id_produto long',
      'id_contrato long',
      'id_empresa long',
      'id_fatura long',
      'id_item_fatura long',
      'id_item_cobranca long',
      'id_rubrica long',
      'id_formacao_preco long',
      'id_precificacao long',
      'id_tipo_preco long',
      'id_tipo_plano long',
      'nr_associado',
      'nr_cpf',
      'nm_beneficiario',
      'dt_nascimento_beneficiario',
      'nm_mae',
      'cd_parentesco',
      'dt_inicio_beneficio',
      'dt_competencia_mensalidade',
      'dt_competencia_fatura',
      'dt_vencimento_fatura',
      'dt_pagamento_fatura',
      'nr_proporcional_dias long',
      'vl_fatura decimal',
      'vl_custo_fatura decimal',
      'ds_rede_atendimento_plano',
      'ds_abrangencia',
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
    functionName: process.env.FUNCTION_NAME,
    body: rest,
    startDate,
    client,
    response,
  };

  await logger(log);
  return response;
};