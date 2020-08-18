exports.reducerArrayInParts = (itens, maximo) => {
    return itens.reduce((acumulador, item, indice) => {
      const grupo = Math.floor(indice / maximo);
      acumulador[grupo] = [...(acumulador[grupo] || []), item];
      return acumulador;
    }, []);
  };