import { keccak256, toUtf8Bytes } from './crypto-utils.js';

// Cache for function and event selectors
const selectorCache = new Map();
const signatureCache = new Map();
const typeCache = new Map();

// Pre-compile regex patterns
const hexPattern = /^0x[0-9a-fA-F]*$/;
const arrayTypePattern = /^(.+)\[(\d*)\]$/;

// Parse and normalize ABI with caching
function parseABI(abi) {
  if (typeof abi === 'string') {
    const cacheKey = abi;
    if (typeCache.has(cacheKey)) {
      return typeCache.get(cacheKey);
    }
    const parsed = JSON.parse(abi);
    typeCache.set(cacheKey, parsed);
    return parsed;
  }
  return abi;
}

// Get function selector with caching
function getFunctionSelector(func) {
  const cacheKey = `${func.name}:${func.inputs.map(i => i.type).join(',')}`;
  if (selectorCache.has(cacheKey)) {
    return selectorCache.get(cacheKey);
  }

  const signature = getFunctionSignature(func);
  const hash = keccak256(toUtf8Bytes(signature));
  const selector = hash.slice(0, 10); // 0x + 8 hex chars = 4 bytes
  selectorCache.set(cacheKey, selector);
  return selector;
}

// Get event selector with caching
function getEventSelector(event) {
  const cacheKey = `${event.name}:${event.inputs.map(i => i.type).join(',')}`;
  if (selectorCache.has(cacheKey)) {
    return selectorCache.get(cacheKey);
  }

  const signature = getEventSignature(event);
  const selector = keccak256(toUtf8Bytes(signature));
  selectorCache.set(cacheKey, selector);
  return selector;
}

// Generate function signature string with caching
function getFunctionSignature(func) {
  const cacheKey = `${func.name}:${func.inputs.map(i => i.type).join(',')}`;
  if (signatureCache.has(cacheKey)) {
    return signatureCache.get(cacheKey);
  }

  const inputs = func.inputs.map(input => getCanonicalType(input)).join(',');
  const signature = `${func.name}(${inputs})`;
  signatureCache.set(cacheKey, signature);
  return signature;
}

// Generate event signature string with caching
function getEventSignature(event) {
  const cacheKey = `${event.name}:${event.inputs.map(i => i.type).join(',')}`;
  if (signatureCache.has(cacheKey)) {
    return signatureCache.get(cacheKey);
  }

  const inputs = event.inputs.map(input => getCanonicalType(input)).join(',');
  const signature = `${event.name}(${inputs})`;
  signatureCache.set(cacheKey, signature);
  return signature;
}

// Get canonical type string for ABI encoding with caching
function getCanonicalType(param) {
  const cacheKey = JSON.stringify(param);
  if (typeCache.has(cacheKey)) {
    return typeCache.get(cacheKey);
  }

  let result;
  if (param.type.includes('[')) {
    const match = arrayTypePattern.exec(param.type);
    if (match) {
      const baseType = match[1];
      const arrayPart = param.type.substring(baseType.length);
      result = getBaseCanonicalType(baseType) + arrayPart;
    } else {
      result = param.type;
    }
  } else {
    result = getBaseCanonicalType(param.type);
  }

  typeCache.set(cacheKey, result);
  return result;
}

// Optimized base type normalization
function getBaseCanonicalType(type) {
  switch (type) {
    case 'tuple':
      return 'tuple';
    case 'uint':
      return 'uint256';
    case 'int':
      return 'int256';
    case 'bytes':
      return type.includes('bytes') ? type : 'bytes';
    default:
      return type;
  }
}

// Optimized hex string utilities
function hexToBuffer(hex) {
  if (typeof hex !== 'string') {
    throw new Error('Invalid hex string: input must be a string');
  }
  
  if (hex.startsWith('0x')) hex = hex.slice(2);
  
  if (!/^[0-9a-fA-F]*$/.test(hex)) {
    throw new Error('Invalid hex string: contains non-hex characters');
  }
  
  return Buffer.from(hex, 'hex');
}

function bufferToHex(buffer) {
  return '0x' + buffer.toString('hex');
}

// Optimized padding functions with pre-allocated buffers
const ZERO_BUFFER = Buffer.alloc(32);

function padLeft(buffer, length = 32) {
  if (buffer.length >= length) return buffer;
  const result = Buffer.allocUnsafe(length);
  ZERO_BUFFER.copy(result, 0, 0, length - buffer.length);
  buffer.copy(result, length - buffer.length);
  return result;
}

function padRight(buffer, length = 32) {
  if (buffer.length >= length) return buffer;
  const result = Buffer.allocUnsafe(length);
  buffer.copy(result, 0);
  ZERO_BUFFER.copy(result, buffer.length, 0, length - buffer.length);
  return result;
}

// Fast hex validation using pre-compiled regex
function isHex(str) {
  return hexPattern.test(str);
}

// Optimized BigInt conversion with type checking
function toBigInt(value) {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'string') {
    return value.startsWith('0x') ? BigInt(value) : BigInt(value);
  }
  if (typeof value === 'number') {
    return BigInt(value);
  }
  throw new Error(`Cannot convert to BigInt: ${value}`);
}

export {
  parseABI,
  getFunctionSelector,
  getEventSelector,
  getFunctionSignature,
  getEventSignature,
  getCanonicalType,
  hexToBuffer,
  bufferToHex,
  padLeft,
  padRight,
  isHex,
  toBigInt
};
