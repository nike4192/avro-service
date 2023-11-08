
// Valid (field, type, and symbol) name regex.
const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_]*$/;

/**
 * Return the namespace implied by a name.
 *
 * @param name {String} Full or short name. If short, the returned namespace
 *  will be empty.
 */
function impliedNamespace(name) {
  const match = /^(.*)\.[^.]+$/.exec(name);
  return match ? match[1] : undefined;
}

/**
 * Check whether an array has duplicates.
 *
 * @param arr {Array} The array.
 * @param fn {Function} Optional function to apply to each element.
 */
function hasDuplicates(arr, fn) {
  const obj = {};
  let i, l, elem;
  for (i = 0, l = arr.length; i < l; i++) {
    elem = arr[i];
    if (fn) {
      elem = fn(elem);
    }
    if (obj[elem]) {
      return true;
    }
    obj[elem] = true;
  }
  return false;
}

/* https://stackoverflow.com/a/840808 */
function findDuplicates(arr) {
  const obj = {};

  let results = [];
  for (let i = 0; i < arr.length; i++) {
    const val = arr[i];
    if (obj[val] && !results.includes(val)) {
      results.push(val);
    } else {
      obj[val] = true;
    }
  }

  return results;
}

/**
 * Check whether a string is a valid Avro identifier.
 */
function isValidName(str) { return NAME_PATTERN.test(str); }

/**
 * Verify and return fully qualified name.
 *
 * @param name {String} Full or short name. It can be prefixed with a dot to
 * force global namespace.
 * @param namespace {String} Optional namespace.
 */
function qualify(name, namespace) {
  if (~name.indexOf('.')) {
    name = name.replace(/^\./, ''); // Allow absolute referencing.
  } else if (namespace) {
    name = namespace + '.' + name;
  }
  name.split('.').forEach(function (part) {
    if (!isValidName(part)) {
      throw new Error(`invalid name: ${name}`);
    }
  });
  return name;
}

/**
 * Remove namespace from a name.
 *
 * @param name {String} Full or short name.
 */
function unqualify(name) {
  const parts = name.split('.');
  return parts[parts.length - 1];
}


function findError(errors, path) {
  const pathString = path.join('.');
  return errors.find(e => e.path.join('.') === pathString);
}

export {
  impliedNamespace,
  hasDuplicates,
  findDuplicates,
  isValidName,
  unqualify,
  qualify,
  findError
}