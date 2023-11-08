import { computed } from 'vue'
import { COMPLEX_TYPES, PRIMITIVE_TYPES, Type } from '~shared/avro/types.ts'

function getErrorAttrs(error) {
  if (error) {
    return {
      error: true,
      message: error.message,
    }
  } else {
    return {};
  }
}

function getType(schema: any) {
  if (schema) {
    if (typeof schema === 'string') {
      return schema;  //  !== 'null' ? schema : null
    } else if (typeof schema === 'object') {
      if (Array.isArray(schema)) {
        return schema.map(getType).join('|');
      } else {
        const type = schema.type;
        if (typeof type === 'string') {
          if (type === 'array') {
            return getType(schema.items) + "[]";
          } else {
            return type;
          }
        }
        return getType(type);
      }
    }
  }
}

function removeRecord(schema, record) {
  if (schema && schema.fields) {
    let indexOf = -1;
    for (let i = 0; i < schema.fields.length; i++) {
      const field = schema.fields[i];
      if (field.type) {
        if (Array.isArray(field.type)) {
          for (let j = 0; j < field.type.length; j++) {
            const type = field.type[j];
            if (type === record) {
              indexOf = i;
              break;
            }
            removeRecord(type, record);
          }
          if (indexOf !== -1) {
            break;
          }
        } else if (typeof field.type === 'object') {
          if (field.type === record) {
            indexOf = i;
            break;
          }
          removeRecord(field.type, record);
        }
      }
    }
    if (indexOf !== -1) {
      schema.fields.splice(indexOf, 1);
    }
  }
}

function walkThroughComplexTypes(schema, cb, path = ['$']) {
  if (schema) {
    const typeName = Type.getType(schema);

    if (COMPLEX_TYPES.includes(typeName)) {
      cb(schema, path);
    }

    switch (typeName) {
      case 'array':
        walkThroughComplexTypes(schema.items, cb, [...path, 'items']);
        break;
      case 'union':
        for (let j = 0; j < schema.length; j++) {
          const type = schema[j];
          if (type !== 'null') {
            if (!Type.getType(type) && Type.getType(type.type)) {
              walkThroughComplexTypes(type.type, cb, [...path, j, 'type']);
            } else {
              walkThroughComplexTypes(type, cb, [...path, j]);
            }
          }
        }
        break;
      case 'record':
        for (let i = 0; i < schema.fields.length; i++) {
          const field = schema.fields[i];
          if (field.type) {
            walkThroughComplexTypes(field.type, cb, [...path, 'fields', i, 'type']);
          }
        }
        break;
    }
  }
}

const closureTypeGetterSetter = (type: any) => {
  return computed({
    get: () => {
      return getType(type);
    },
    set: (value) => {
      if (
        type &&
        typeof type.type === 'string' &&
        typeof value === 'string' &&
        PRIMITIVE_TYPES.includes(value)
      ) {
        type.type = value;
      }
    }
  })
}

export {
  getErrorAttrs,
  getType,
  removeRecord,
  walkThroughComplexTypes,
  closureTypeGetterSetter,
}
