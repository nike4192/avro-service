import * as utils from './utils';
import { isValidName } from './utils'

class JsonError {
  message: string;
  path: (string | number)[];

  constructor(message, path) {
    this.message = message;
    this.path = path;
  }
}

/*
declare namespace schema {
  export type AvroSchema = DefinedType | DefinedType[];
  type DefinedType = PrimitiveType | ComplexType | LogicalType | string;
  type PrimitiveType = 'null' | 'boolean' | 'int' | 'long' | 'float' | 'double' | 'bytes' | 'string';
  type ComplexType = NamedType | RecordType | EnumType | MapType | ArrayType | FixedType;
  type LogicalType = ComplexType & LogicalTypeExtension;

  interface NamedType {
    type: PrimitiveType
  }

  interface RecordType {
    type: "record" | "error";
    name: string;
    namespace?: string;
    doc?: string;
    aliases?: string[];
    fields: {
      name: string;
      doc?: string;
      type: AvroSchema;
      default?: any;
      order?: "ascending" | "descending" | "ignore";
    }[];
  }

  interface EnumType {
    type: "enum";
    name: string;
    namespace?: string;
    aliases?: string[];
    doc?: string;
    symbols: string[];
    default?: string;
  }

  interface ArrayType {
    type: "array";
    items: AvroSchema;
  }

  interface MapType {
    type: "map";
    values: AvroSchema;
  }

  interface FixedType {
    type: "fixed";
    name: string;
    aliases?: string[];
    size: number;
  }
  interface LogicalTypeExtension {
    logicalType: string;
    [param: string]: any;
  }
}
*/

/**
 * "Abstract" base Avro type.
 *
 * This class' constructor will register any named types to support recursive
 * schemas. All type values are represented in memory similarly to their JSON
 * representation, except for:
 *
 * + `bytes` and `fixed` which are represented as `Buffer`s.
 * + `union`s which will be "unwrapped" unless the `wrapUnions` option is set.
 *
 *  See individual subclasses for details.
 */
class Type {

  name: string;
  aliases: string;
  doc: string;

  constructor(schema?, opts?, path?) {
    // console.log(schema, path);
    let type;
    if (LOGICAL_TYPE) {
      type = LOGICAL_TYPE;
      UNDERLYING_TYPES.push([LOGICAL_TYPE, this]);
      LOGICAL_TYPE = null;
    } else {
      type = this;
    }

    // Lazily instantiated hash string. It will be generated the first time the
    // type's default fingerprint is computed (for example when using `equals`).
    // We use a mutable object since types are frozen after instantiation.
    // this._hash = new Hash();
    this.name = undefined;
    this.aliases = undefined;
    this.doc = (schema && schema.doc) ? '' + schema.doc : undefined;

    if (schema) {
      // This is a complex (i.e. non-primitive) type.
      let name = schema.name;
      const namespace = schema.namespace === undefined ?
        opts && opts.namespace :
        schema.namespace;
      if (name !== undefined) {
        // This isn't an anonymous type.
        name = maybeQualify(name, namespace, opts, path);
        if (isPrimitive(name)) {
          // Avro doesn't allow redefining primitive names.
          opts.errors.push(
            new JsonError(`cannot rename primitive type: ${name}`, path)
          )
        }
        const registry = opts && opts.registry;
        if (registry) {
          if (registry[name] !== undefined) {
            opts.errors.push(new JsonError(`duplicate type name: ${name}`, [...path, 'name']));
          }
          registry[name] = type;
        }
      } else if (opts && opts.noAnonymousTypes) {
        opts.errors.push(
          new JsonError(`missing name property in schema: ${schema}`, path)
        )
      }
      this.name = name;
      this.aliases = schema.aliases ?
        schema.aliases.map(function (s) { return maybeQualify(s, namespace, opts, path); }) :
        [];
    }
  }

  static createType(type, name = '') {
    if (PRIMITIVE_TYPES.includes(type)) {
      return { name, type };
    } else if (type === 'union') {
      return {
        name,
        type: ['null']
      }
    } else {
      const props: any = {};
      if (type === 'record') {
        props.fields = [];
      }
      if (type === 'map') {
        props.values = 'string';
      }
      if (type === 'enum') {
        props.symbols = [];
      }
      if (type === 'array') {
        props.items = 'null';
      }
      props.name = type;

      return {
        name,
        type: {
          name: '',
          type,
          ...props
        }
      };
    }
  }

  static getType(schema) {
    let type = null;

    if (schema) {
      if (typeof schema === 'string') {
        type = schema;
      } else if (Array.isArray(schema)) {
        type = 'union';
      } else {
        type = schema.type;
      }
    }

    return TYPE_NAMES.includes(type) ? type : null;
  }

  static isType = function (any, ...params) {
    const l = arguments.length;
    if (!l) {
      return false;
    }

    if (
      !any ||
      !(any instanceof Type)
      // typeof any._update != 'function' ||
      // typeof any.fingerprint != 'function'
    ) {
      // Not fool-proof, but most likely good enough.
      return false;
    }

    if (l === 1) {
      // No type names specified, we are done.
      return true;
    }

    // We check if at least one of the prefixes matches.
    const typeName = (any as any).typeName;
    for (let i = 1; i < l; i++) {
      if (typeName.indexOf(arguments[i]) === 0) {
        return true;
      }
    }
    return false;
  };

  static validate(schema: any) {
    const errors = [];
    try {
      const opts = { errors: [] };
      Type.forSchema(schema, opts);
      if (opts.errors && opts.errors.length) {
        errors.push(...opts.errors);
      }
    } catch (e) {
      errors.push(e);
    }

    return errors;
  }

  static forSchema(schema: any, opts?, path?) {
    opts = opts ?? {};
    opts.errors = opts.errors ?? [];
    opts.registry = opts.registry ?? {};
    path = path ?? ['$'];

    let UnionType:
      (new (...args: any[]) => WrappedUnionType) |
      (new (...args: any[]) => UnwrappedUnionType) |
      undefined = (function (wrapUnions) {
      if (wrapUnions === true) {
        wrapUnions = 'always';
      } else if (wrapUnions === false) {
        wrapUnions = 'never';
      } else if (wrapUnions === undefined) {
        wrapUnions = 'auto';
      } else if (typeof wrapUnions == 'string') {
        wrapUnions = wrapUnions.toLowerCase();
      }
      switch (wrapUnions) {
        case 'always':
          return WrappedUnionType;
        case 'never':
          return UnwrappedUnionType;
        case 'auto':
          return undefined; // Determined dynamically later on.
        default:
          opts.errors.push(
            new JsonError(`invalid wrap unions option: ${wrapUnions}`, path)
          )
      }
    })(opts.wrapUnions);

    if (schema === null) {
      // Let's be helpful for this common error.
      opts.errors.push(
        new JsonError('invalid type: null (did you mean "null"?)', path)
      )
    }

    if (schema === undefined || schema === null) {
      return;
    }

    if (Type.isType(schema)) {
      return schema;
    }

    let type: any;
    if (typeof schema == 'string') { // Type reference.
      schema = maybeQualify(schema, opts.namespace, opts, path);
      type = opts.registry[schema];
      if (type) {
        // Type was already defined, return it.
        return type;
      }
      if (isPrimitive(schema)) {
        // Reference to a primitive type. These are also defined names by default
        // so we create the appropriate type and it to the registry for future
        // reference.
        return opts.registry[schema] = Type.forSchema({type: schema}, opts, [...path, 'type']);
      }
      opts.errors.push(
        new JsonError(`undefined type name: ${schema}`, path)
      )
    }

    if (schema.logicalType && opts.logicalTypes && !LOGICAL_TYPE) {
      const DerivedType = opts.logicalTypes[schema.logicalType];
      if (DerivedType) {
        const namespace = opts.namespace;
        const registry = { ...opts.registry };
        try {
          // debug('instantiating logical type for %s', schema.logicalType);
          return new DerivedType(schema, opts);
        } catch (err) {
          // debug('failed to instantiate logical type for %s', schema.logicalType);
          if (opts.assertLogicalTypes) {
            // The spec mandates that we fall through to the underlying type if
            // the logical type is invalid. We provide this option to ease
            // debugging.
            throw err;
          }
          LOGICAL_TYPE = null;
          opts.namespace = namespace;
          opts.registry = registry;
        }
      }
    }

    if (Array.isArray(schema)) { // Union.
      // We temporarily clear the logical type since we instantiate the branch's
      // types before the underlying union's type (necessary to decide whether the
      // union is ambiguous or not).
      const logicalType = LOGICAL_TYPE;
      LOGICAL_TYPE = null;
      const types = schema.map(function (obj, i) {
        return Type.forSchema(obj, opts, [...path, i]);
      });
      if (!UnionType) {
        UnionType = isAmbiguous(types) ? WrappedUnionType : UnwrappedUnionType;
      }
      LOGICAL_TYPE = logicalType;
      type = new UnionType(types, opts, path);
    } else { // New type definition.
      type = (function (typeName) {
        const Type = TYPES[typeName];
        if (Type === undefined) {
          opts.errors.push(
            new JsonError(`unknown type: ${typeName}`, path)
          )
          return;
        }
        return new Type(schema, opts, path);
      })(schema.type);
    }
    return type;
  }

  get branchName () {
    const type = Type.isType(this, 'logical') ? this.underlyingType : this;
    if (type.name) {
      return type.name;
    }
    if (Type.isType(type, 'abstract')) {
      return type._concreteTypeName;
    }
    return Type.isType(type, 'union') ? undefined : type.typeName;
  }

  get underlyingType () {
    // if (this._underlyingType) {
    //   return this._underlyingType;
    // }
    // If the field wasn't present, it means the logical type isn't complete
    // yet: we're waiting on its underlying type to be fully instantiated. In
    // this case, it will be present in the `UNDERLYING_TYPES` array.
    let i, l, arr;
    for (i = 0, l = UNDERLYING_TYPES.length; i < l; i++) {
      arr = UNDERLYING_TYPES[i];
      if (arr[0] === this) {
        return arr[1];
      }
    }
  }
}

/**
 * Base primitive Avro type.
 *
 * Most of the primitive types share the same cloning and resolution
 * mechanisms, provided by this class. This class also lets us conveniently
 * check whether a type is a primitive using `instanceof`.
 */
class PrimitiveType extends Type {
  typeName: string;
}

/** Booleans. */
class BooleanType extends PrimitiveType {
  typeName = 'boolean';
}

/**
 * Bytes.
 *
 * These are represented in memory as `Buffer`s rather than binary-encoded
 * strings. This is more efficient (when decoding/encoding from bytes, the
 * common use-case), idiomatic, and convenient.
 *
 * Note the coercion in `_copy`.
 */
class BytesType extends PrimitiveType {
  typeName = 'bytes';
}

/** Doubles. */
class DoubleType extends PrimitiveType {
  typeName = 'double';
}

/** Floats. */
class FloatType extends PrimitiveType {
  typeName = 'float';
}

/** Integers. */
class IntType extends PrimitiveType {
  typeName = 'int';
}

/**
 * Longs.
 *
 * We can't capture all the range unfortunately since JavaScript represents all
 * numbers internally as `double`s, so the default implementation plays safe
 * and throws rather than potentially silently change the data. See `__with` or
 * `AbstractLongType` below for a way to implement a custom long type.
 */
class LongType extends PrimitiveType {
  typeName = 'long';
}

/** Nulls. */
class NullType extends PrimitiveType {
  typeName = 'null';
}

/** Strings. */
class StringType extends PrimitiveType {
  typeName = 'string';
}


/**
 * Avro enum type.
 *
 * Represented as strings (with allowed values from the set of symbols). Using
 * integers would be a reasonable option, but the performance boost is arguably
 * offset by the legibility cost and the extra deviation from the JSON encoding
 * convention.
 *
 * An integer representation can still be used (e.g. for compatibility with
 * TypeScript `enum`s) by overriding the `EnumType` with a `LongType` (e.g. via
 * `parse`'s registry).
 */
class EnumType extends Type {
  typeName = 'enum';
  symbols: any[];
  _indices: any;
  default: any;

  constructor(schema, opts, path) {
    super(schema, opts, path);

    if (!Array.isArray(schema.symbols) || !schema.symbols.length) {
      opts.errors.push(
        new JsonError(`invalid enum symbols: ${schema.symbols}`, path)
      );
    }
    this.symbols = schema.symbols.slice();
    this._indices = {};
    this.symbols.forEach(function (symbol, i) {
      if (!utils.isValidName(symbol)) {
        opts.errors.push(
          new JsonError(`invalid ${this.name} symbol: ${symbol}`, [...path, 'symbols', i])
        )
      }
      if (this._indices[symbol] !== undefined) {
        opts.errors.push(
          new JsonError(`duplicate ${this.name} symbol: ${symbol}`, [...path, 'symbols', i])
        )
      }
      this._indices[symbol] = i;
    }, this);
    this.default = schema.default;
    if (this.default !== undefined && this._indices[this.default] === undefined) {
      opts.errors.push(
        new JsonError(`invalid ${this} default: ${this.default}`, path)
      )
    }
    // this._branchConstructor = this._createBranchConstructor();
    // Object.freeze(this);
  }
}

/**
 * Avro record.
 *
 * Values are represented as instances of a programmatically generated
 * constructor (similar to a "specific record"), available via the
 * `getRecordConstructor` method. This "specific record class" gives
 * significant speedups over using generics objects.
 *
 * Note that vanilla objects are still accepted as valid as long as their
 * fields match (this makes it much more convenient to do simple things like
 * update nested records).
 *
 * This type is also used for errors (similar, except for the extra `Error`
 * constructor call) and for messages (see comment below).
 */
class RecordType extends Type {
  _fieldsByName: any;
  fields: any;
  _isError: any;

  constructor(schema, opts, path) {
    // Force creation of the options object in case we need to register this
    // record's name.
    opts = opts || {};

    // Save the namespace to restore it as we leave this record's scope.
    const namespace = opts.namespace;
    if (schema.namespace !== undefined) {
      opts.namespace = schema.namespace;
    } else if (schema.name) {
      // Fully qualified names' namespaces are used when no explicit namespace
      // attribute was specified.
      const ns = utils.impliedNamespace(schema.name);
      if (ns !== undefined) {
        opts.namespace = ns;
      }
    }
    super(schema, opts, path);

    if (!Array.isArray(schema.fields)) {
      opts.errors.push(
        new JsonError(`non-array record fields: ${schema.fields}`, path)
      )
    }
    if (utils.hasDuplicates(schema.fields, function (f) { return f.name; })) {
      const duplicateNames = utils.findDuplicates(schema.fields.map(f => f.name));
      for (let name of duplicateNames) {
        const fieldIndex = schema.fields.findLastIndex(f => f.name === name);
        const field = schema.fields[fieldIndex];
        opts.errors.push(
          new JsonError(`duplicate field name: ${field.name}`, [...path, 'fields', fieldIndex, 'name'])
        )
      }
    }
    this._fieldsByName = {};
    this.fields = schema.fields.map(function (f, i) {
      const field = new Field(f, opts, [...path, 'fields', i]);
      this._fieldsByName[field.name] = field;
      return field;
    }, this);
    // this._branchConstructor = this._createBranchConstructor();
    this._isError = schema.type === 'error';
    // this.recordConstructor = this._createConstructor(
    //   opts.errorStackTraces,
    //   opts.omitRecordMethods
    // );
    // this._read = this._createReader();
    // this._skip = this._createSkipper();
    // this._write = this._createWriter();
    // this._check = this._createChecker();

    opts.namespace = namespace;
    // Object.freeze(this);
  }

  get typeName() {
    return this._isError ? 'error' : 'record';
  }
}

/** A record field. */
class Field {
  name: any;
  type: any;
  aliases: any;
  doc: any;
  _order: any;
  // defaultValue: any;

  constructor(schema, opts, path) {
    const name = schema.name;
    if (typeof name != 'string' || !utils.isValidName(name)) {
      opts.errors.push(
        new JsonError(`invalid field name: ${name}`, [...path, 'name'])
      )
    }

    this.name = name;
    this.type = Type.forSchema(schema.type, opts, [...path, 'type']);
    this.aliases = schema.aliases || [];
    this.doc = schema.doc !== undefined ? '' + schema.doc : undefined;

    this._order = (function (order) {
      switch (order) {
        case 'ascending':
          return 1;
        case 'descending':
          return -1;
        case 'ignore':
          return 0;
        default:
          opts.errors.push(
            new JsonError(`invalid order: ${order}`, path)
          )
      }
    })(schema.order === undefined ? 'ascending' : schema.order);

/*
    const value = schema['default'];
    if (value !== undefined) {
      // We need to convert defaults back to a valid format (unions are
      // disallowed in default definitions, only the first type of each union is
      // allowed instead).
      // http://apache-avro.679487.n3.nabble.com/field-union-default-in-Java-td1175327.html
      const type = this.type;
      let val;
      try {
        val = type._copy(value, {coerce: 2, wrap: 2});
      } catch (err) {
        let msg = `incompatible field default ${value} (${err.message})`;
        if (Type.isType(type, 'union')) {
          msg += `, union defaults must match the first branch\'s type (${type.types[0]})`;
        }
        throw new Error(msg);
      }
      // The clone call above will throw an error if the default is invalid.
      if (isPrimitive(type.typeName) && type.typeName !== 'bytes') {
        // These are immutable.
        this.defaultValue = function () { return val; };
      } else {
        this.defaultValue = function () { return type._copy(val); };
      }
    }
*/

    // Object.freeze(this);
  }
}

/** Avro fixed type. Represented simply as a `Buffer`. */
class FixedType extends Type {
  typeName = 'fixed';
  size: number;

  constructor(schema, opts, path) {
    super(schema, opts, path);
    if (schema.size !== (schema.size | 0) || schema.size < 0) {
      opts.errors.push(
        new JsonError(`invalid size`, path)
      )
    }
    this.size = schema.size | 0;
    // this._branchConstructor = this._createBranchConstructor();
    // Object.freeze(this);
  }
}


/** Avro array. Represented as vanilla arrays. */
class ArrayType extends Type {
  typeName = 'array';
  itemsType: any;
  // _branchConstructor: any;

  constructor(schema, opts, path) {
    super(schema, opts, path);

    if (!schema.items) {
      opts.errors.push(
        new JsonError(`missing array items: ${schema}`, path)
      )
    }
    this.itemsType = Type.forSchema(schema.items, opts, path);
    // this._branchConstructor = this._createBranchConstructor();
  }
}

/** Avro map. Represented as vanilla objects. */
class MapType extends Type {
  typeName = 'map';
  valuesType: any;

  constructor(schema, opts, path) {
    super(schema, opts, path);

    if (!schema.values) {
      opts.errors.push(
        new JsonError(`missing map values: ${schema.name}`, [...path, 'values'])
      )
    }
    this.valuesType = Type.forSchema(schema.values, opts, path);
    // this._branchConstructor = this._createBranchConstructor();
    // Object.freeze(this);
  }
}

// All non-union concrete (i.e. non-logical) Avro types.
const TYPES = {
  'array': ArrayType,
  'boolean': BooleanType,
  'bytes': BytesType,
  'double': DoubleType,
  'enum': EnumType,
  'error': RecordType,
  'fixed': FixedType,
  'float': FloatType,
  'int': IntType,
  'long': LongType,
  'map': MapType,
  'null': NullType,
  'record': RecordType,
  'string': StringType
};

const PRIMITIVE_TYPES = Object.keys(TYPES)
  .filter(k => Object.getPrototypeOf(TYPES[k]) === PrimitiveType);

const COMPLEX_TYPES = Object.keys(TYPES)
  .filter(k => Object.getPrototypeOf(TYPES[k]) !== PrimitiveType)
  .concat('union');

const TYPE_NAMES: string[] = [...PRIMITIVE_TYPES, ...COMPLEX_TYPES];

// Currently active logical type, used for name redirection.
let LOGICAL_TYPE = null;

// Underlying types of logical types currently being instantiated. This is used
// to be able to reference names (i.e. for branches) during instantiation.
const UNDERLYING_TYPES = [];

class UnionType extends Type {

  types: any[];
  _branchIndices: any;

  constructor(schema, opts, path) {
    super(schema, opts, path);

    if (!Array.isArray(schema)) {
      opts.errors.push(
        new JsonError(`non-array union schema: ${schema}`, path)
      )
    }
    if (!schema.length) {
      opts.errors.push(
        new JsonError('empty union', path)
      )
    }
    this.types = schema.map(function (obj, i) {
      return Type.forSchema(obj, opts, [...path, i]);
    });

    this._branchIndices = {};
    this.types.forEach(function (type, i) {
      if (Type.isType(type, 'union')) {
        opts.errors.push(
          new JsonError('unions cannot be directly nested', path)
        )
      }
      const branch = type.branchName;
      if (this._branchIndices[branch] !== undefined) {
        opts.errors.push(
          new JsonError(`duplicate union branch name: ${branch}`, path)
        )
      }
      this._branchIndices[branch] = i;
    }, this);
  }
}

/**
 * "Natural" union type.
 *
 * This representation doesn't require a wrapping object and is therefore
 * simpler and generally closer to what users expect. However it cannot be used
 * to represent all Avro unions since some lead to ambiguities (e.g. if two
 * number types are in the union).
 *
 * Currently, this union supports at most one type in each of the categories
 * below:
 *
 * + `null`
 * + `boolean`
 * + `int`, `long`, `float`, `double`
 * + `string`, `enum`
 * + `bytes`, `fixed`
 * + `array`
 * + `map`, `record`
 */
class UnwrappedUnionType extends UnionType {

  typeName = 'union:unwrapped';
  _dynamicBranches: any;
  _bucketIndices: any;

  constructor(schema, opts, path) {
    super(schema, opts, path);

    this._dynamicBranches = null;
    this._bucketIndices = {};
    this.types.forEach(function (type, index) {
      if (Type.isType(type, 'abstract', 'logical')) {
        if (!this._dynamicBranches) {
          this._dynamicBranches = [];
        }
        this._dynamicBranches.push({index: index, type: type});
      } else {
        const bucket = getTypeBucket(type);
        if (this._bucketIndices[bucket] !== undefined) {
          opts.errors.push(
            new JsonError(`ambiguous unwrapped union: ${this}`, path)
          )
        }
        this._bucketIndices[bucket] = index;
      }
    }, this);

    // Object.freeze(this);
  }
}


/**
 * Compatible union type.
 *
 * Values of this type are represented in memory similarly to their JSON
 * representation (i.e. inside an object with single key the name of the
 * contained type).
 *
 * This is not ideal, but is the most efficient way to unambiguously support
 * all unions. Here are a few reasons why the wrapping object is necessary:
 *
 * + Unions with multiple number types would have undefined behavior, unless
 *   numbers are wrapped (either everywhere, leading to large performance and
 *   convenience costs; or only when necessary inside unions, making it hard to
 *   understand when numbers are wrapped or not).
 * + Fixed types would have to be wrapped to be distinguished from bytes.
 * + Using record's constructor names would work (after a slight change to use
 *   the fully qualified name), but would mean that generic objects could no
 *   longer be valid records (making it inconvenient to do simple things like
 *   creating new records).
 */
class WrappedUnionType extends UnionType {
  typeName = 'union:wrapped';

  constructor(schema, opts, path) {
    super(schema, opts, path);
    // Object.freeze(this);
  }
}

/**
 * Check whether a collection of types leads to an ambiguous union.
 *
 * @param types {Array} Array of types.
 */
function isAmbiguous(types) {
  const buckets = {};
  let i, l, bucket, type;
  for (i = 0, l = types.length; i < l; i++) {
    type = types[i];
    if (!Type.isType(type, 'logical')) {
      bucket = getTypeBucket(type);
      if (buckets[bucket]) {
        return true;
      }
      buckets[bucket] = true;
    }
  }
  return false;
}

/**
 * Get a type's bucket when included inside an unwrapped union.
 *
 * @param type {Type} Any type.
 */
function getTypeBucket(type) {
  const typeName = type.typeName;
  switch (typeName) {
    case 'double':
    case 'float':
    case 'int':
    case 'long':
      return 'number';
    case 'bytes':
    case 'fixed':
      return 'buffer';
    case 'enum':
      return 'string';
    case 'map':
    case 'error':
    case 'record':
      return 'object';
    default:
      return typeName;
  }
}

function maybeQualify(name, ns, opts, path) {
  const unqualified = utils.unqualify(name);
  // Primitives are always in the global namespace.

  // TODO: Fix if it bug
  ns.split('.').forEach(function (part) {
    if (part && !isValidName(part)) {
      throw new JsonError(`invalid namespace: ${ns}`, [...path, 'namespace'])
    }
  });

  try {
    return isPrimitive(unqualified) ? unqualified : utils.qualify(name, ns);
  } catch (e) {
    opts.errors.push(new JsonError(e.message, [...path, 'name']));
  }
}

function isPrimitive(typeName) {
  // Since we use this module's own `TYPES` object, we can use `instanceof`.
  const type = TYPES[typeName];
  return type && type.prototype instanceof PrimitiveType;
}

export { JsonError, TYPES, PRIMITIVE_TYPES, COMPLEX_TYPES, TYPE_NAMES, Type };
