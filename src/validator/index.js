 exports.validateFields = (request = [], fields = [], singleErrorStopValidation = false) => {
  const errors = [];

  for (var i = 0; i < request.length; i++) {

    const item = request[i];

    if (singleErrorStopValidation && errors.length > 0)
      break;

    for (field of fields) {

      let error = validateTypeFields(item, field);
      
      if (error) {
        errors.push(`Index item ${i}: ${error}`);
        if (singleErrorStopValidation)
          break;
      }
      
    }

  }

  return errors;
};

const validateTypeFields = (item, fieldStructure = '') => {

  const split = fieldStructure.split(' ');
  const fieldName = split[0];
  const fieldType = split.length > 1 ? split[1].toLowerCase() : null;
  const value = item[fieldName];
  const stringValue = value ? value.toString() : null;

  if (value == undefined || value == null || stringValue === '')
    return `Field ${fieldName} empty`;

  switch(fieldType) {
    case 'string':
    case 'text':
    case 'texto':
      // ja tratado
      break;

    case 'int':
    case 'long':
    case 'number':
    case 'decimal':
    case 'float':
      if (isNaN(+value))
        return `Field ${fieldName} (${stringValue}) is not a valid Number`;
      //ToDo: verificar, quando necessário, se número é maior que zero
      break;

    case 'date':
    case 'datetime':
    case 'data':
      if (value instanceof Date) {
          if (!isNaN(value.getTime())) {
              return null;
          }
      }
      return `Field ${fieldName} (${stringValue}) is not a valid Date`;

    case 'bool':
    case 'boolean':
    case 'booleano':
      if (typeof value === "boolean") {
        return null;
      }
      return `Field ${fieldName} (${stringValue}) is not a valid boolean`;
  }

  return null;
}