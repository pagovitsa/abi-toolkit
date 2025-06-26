import { hexToBuffer, bufferToHex, padLeft, padRight, toBigInt, isHex } from './utils.js';

class Decoder {
  constructor() {
    // Cache for commonly decoded values and type checks
    this.cache = new Map();
    this.typeCache = new Map();
    
    // Pre-compile common type patterns for performance
    this.uintRegex = /^uint(\d+)?$/;
    this.intRegex = /^int(\d+)?$/;
    this.bytesRegex = /^bytes(\d+)$/;
    this.arrayRegex = /^(.+)\[(\d*)\]$/;
  }

  // Main decoding function for parameters
  decodeParameters(types, data) {
    if (!data || data === '0x') {
      return types.length === 0 ? [] : new Array(types.length).fill(null);
    }

    const buffer = hexToBuffer(data);
    const results = [];
    let staticOffset = 0;

    // First pass: handle static types and collect dynamic offsets
    for (let i = 0; i < types.length; i++) {
      const currentType = types[i];
      const typeStr = typeof currentType === 'string' ? currentType : currentType.type;
      
      if (this.isDynamicType(currentType)) {
        // Dynamic type: read offset from static section
        const offsetResult = this.decodeUint(buffer, staticOffset);
        const dataOffset = Number(offsetResult.value);
        const { value } = this.decodeParameter(currentType, buffer, dataOffset);
        results.push(value);
      } else {
        // Static type: decode directly
        const { value } = this.decodeParameter(currentType, buffer, staticOffset);
        results.push(value);
      }
      staticOffset += 32; // Each parameter takes 32 bytes in static section
    }

    return results;
  }

  // Decode single parameter with performance optimizations
  decodeParameter(type, buffer, offset) {
    // Check cache first for performance
    const cacheKey = `${JSON.stringify(type)}:${offset}:${buffer.length}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Handle ABI object format
    let typeStr, components;
    if (typeof type === 'object' && type.type) {
      typeStr = type.type;
      components = type.components;
    } else {
      typeStr = type;
      components = null;
    }

    let result;

    // Handle arrays first
    if (typeStr.includes('[')) {
      result = this.decodeArray(typeStr, buffer, offset);
    }
    // Handle tuple (struct)
    else if (typeStr.startsWith('tuple')) {
      result = this.decodeTuple(type, buffer, offset);
    }
    // Handle basic types with optimized pattern matching
    else {
      result = this._decodeBasicType(typeStr, buffer, offset);
    }

    // Cache result for future use (limit cache size)
    if (this.cache.size < 1000) {
      this.cache.set(cacheKey, result);
    }

    return result;
  }

  // Optimized basic type decoding
  _decodeBasicType(typeStr, buffer, offset) {
    switch (typeStr) {
      case 'bool':
        return this.decodeBool(buffer, offset);
      case 'address':
        return this.decodeAddress(buffer, offset);
      case 'bytes':
        return this.decodeBytes(buffer, offset);
      case 'string':
        return this.decodeString(buffer, offset);
      default:
        // Use pre-compiled regex for better performance
        let match = this.uintRegex.exec(typeStr);
        if (match) {
          const bits = parseInt(match[1]) || 256;
          return this.decodeUint(buffer, offset, bits);
        }
        
        match = this.intRegex.exec(typeStr);
        if (match) {
          const bits = parseInt(match[1]) || 256;
          return this.decodeInt(buffer, offset, bits);
        }
        
        match = this.bytesRegex.exec(typeStr);
        if (match) {
          const size = parseInt(match[1]);
          return this.decodeFixedBytes(buffer, offset, size);
        }
        
        throw new Error(`Unsupported type: ${typeStr}`);
    }
  }

  // Type decoders
  decodeBool(buffer, offset) {
    const value = buffer.readUInt8(offset + 31) !== 0;
    return { value, nextOffset: offset + 32 };
  }

  decodeUint(buffer, offset, bits = 256) {
    const slice = buffer.slice(offset, offset + 32);
    let value = 0n;
    
    // Fast path for common sizes
    if (bits <= 64) {
      // Use readBigUInt64BE for performance when possible
      const high = buffer.readUInt32BE(offset + 24);
      const low = buffer.readUInt32BE(offset + 28);
      value = (BigInt(high) << 32n) | BigInt(low);
    } else {
      // General case: convert full 32-byte slice
      const hex = slice.toString('hex');
      value = hex ? BigInt('0x' + hex) : 0n;
    }

    // Validate range
    const maxValue = (1n << BigInt(bits)) - 1n;
    if (value > maxValue) {
      throw new Error(`Value too large for uint${bits}: ${value}`);
    }

    // Return as string instead of BigInt
    return { value: value.toString(), nextOffset: offset + 32 };
  }

  decodeInt(buffer, offset, bits = 256) {
    const slice = buffer.slice(offset, offset + 32);
    const hex = slice.toString('hex');
    let value = BigInt('0x' + hex);

    // Handle two's complement for negative values
    const signBit = 1n << (BigInt(bits) - 1n);
    if (value >= signBit) {
      const maxUint = 1n << BigInt(bits);
      value = value - maxUint;
    }

    // Validate range
    const minValue = -(1n << (BigInt(bits) - 1n));
    const maxValue = (1n << (BigInt(bits) - 1n)) - 1n;
    if (value < minValue || value > maxValue) {
      throw new Error(`Value out of range for int${bits}: ${value}`);
    }

    // Return as string instead of BigInt
    return { value: value.toString(), nextOffset: offset + 32 };
  }

  decodeAddress(buffer, offset) {
    // Address is in the last 20 bytes of the 32-byte word
    const addressBytes = buffer.slice(offset + 12, offset + 32);
    // Ensure consistent case (lowercase) for addresses
    const value = '0x' + addressBytes.toString('hex').toLowerCase();
    return { value, nextOffset: offset + 32 };
  }

  decodeFixedBytes(buffer, offset, size) {
    const slice = buffer.slice(offset, offset + size);
    const value = '0x' + slice.toString('hex');
    return { value, nextOffset: offset + 32 };
  }

  decodeBytes(buffer, offset) {
    // For dynamic bytes, we expect the data to be stored with length prefix
    return this.decodeBytesAt(buffer, offset);
  }

  decodeBytesAt(buffer, offset) {
    // Read length first
    const length = Number(this.decodeUint(buffer, offset).value);
    const dataOffset = offset + 32;
    
    // Read the actual bytes
    const value = '0x' + buffer.slice(dataOffset, dataOffset + length).toString('hex');
    
    // Calculate next offset (data is padded to 32-byte boundary)
    const paddedLength = Math.ceil(length / 32) * 32;
    const nextOffset = dataOffset + paddedLength;
    
    return { value, nextOffset };
  }

  decodeString(buffer, offset) {
    // String is encoded like bytes but interpreted as UTF-8
    const bytesResult = this.decodeBytes(buffer, offset);
    const hex = bytesResult.value.slice(2); // Remove 0x
    let value = Buffer.from(hex, 'hex').toString('utf8');
    
    // Clean up null bytes and control characters
    value = value.replace(/\0/g, '').trim();
    
    return { value, nextOffset: bytesResult.nextOffset };
  }

  decodeArray(type, buffer, offset) {
    // Parse array type
    const bracketIndex = type.indexOf('[');
    const baseType = type.slice(0, bracketIndex);
    const arraySpec = type.slice(bracketIndex);
    
    const isFixedSize = arraySpec !== '[]';
    const fixedSize = isFixedSize ? parseInt(arraySpec.slice(1, -1)) : null;

    let currentOffset = offset;
    let arrayLength;

    if (this.isDynamicType(type)) {
      // Dynamic array: read offset first
      const dataOffset = Number(this.decodeUint(buffer, offset).value);
      currentOffset = dataOffset;
    }

    if (isFixedSize) {
      arrayLength = fixedSize;
    } else {
      // Dynamic array: read length
      const lengthResult = this.decodeUint(buffer, currentOffset);
      arrayLength = Number(lengthResult.value);
      currentOffset = lengthResult.nextOffset;
    }

    const results = [];
    
    if (this.isDynamicType(baseType)) {
      // Dynamic element type: elements are stored with offsets
      const staticOffset = currentOffset;
      
      for (let i = 0; i < arrayLength; i++) {
        const elementOffset = Number(this.decodeUint(buffer, staticOffset + i * 32).value);
        const absoluteOffset = (this.isDynamicType(type) ? 
          Math.floor(offset / 32) * 32 : 0) + elementOffset;
        const { value } = this.decodeParameter(baseType, buffer, absoluteOffset);
        results.push(value);
      }
      
      // Calculate next offset (this is complex for dynamic arrays)
      const nextOffset = currentOffset + arrayLength * 32;
      return { value: results, nextOffset };
    } else {
      // Static element type: elements are stored sequentially
      for (let i = 0; i < arrayLength; i++) {
        const { value, nextOffset } = this.decodeParameter(baseType, buffer, currentOffset);
        results.push(value);
        currentOffset = nextOffset;
      }
      
      return { value: results, nextOffset: currentOffset };
    }
  }

  decodeTuple(type, buffer, offset) {
    let components;
    
    // Handle ABI object format
    if (typeof type === 'object' && type.components) {
      components = type.components;
    } else if (typeof type === 'string') {
      // Parse tuple type to extract components
      // Expected format: tuple(type1,type2,...) or tuple(type1 name1,type2 name2,...)
      const match = type.match(/^tuple\((.+)\)$/);
      if (!match) {
        throw new Error(`Invalid tuple type format: ${type}`);
      }
      
      const componentStr = match[1];
      components = this.parseTupleComponents(componentStr);
    } else {
      throw new Error(`Invalid tuple type: ${JSON.stringify(type)}`);
    }
    
    const result = {};
    let currentOffset = offset;
    const dynamicOffsets = [];
    
    // First pass: decode static types and collect dynamic offsets
    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      const fieldName = component.name || `field${i}`;
      
      if (this.isDynamicType(component)) {
        // Read offset pointer for dynamic types (relative to tuple start)
        const offsetResult = this.decodeUint(buffer, currentOffset);
        const relativeOffset = Number(offsetResult.value);
        const absoluteOffset = offset + relativeOffset;
        
        dynamicOffsets.push({ 
          index: i, 
          offset: absoluteOffset, 
          fieldName, 
          component: component 
        });
        currentOffset += 32;
      } else {
        // Decode static types directly
        const decoded = this.decodeParameter(component, buffer, currentOffset);
        result[fieldName] = decoded.value;
        currentOffset = decoded.nextOffset;
      }
    }
    
    // Second pass: decode dynamic types
    for (const dynamicInfo of dynamicOffsets) {
      const decoded = this.decodeParameter(dynamicInfo.component, buffer, dynamicInfo.offset);
      result[dynamicInfo.fieldName] = decoded.value;
    }
    
    return { value: result, nextOffset: currentOffset };
  }

  parseTupleComponents(componentStr) {
    const components = [];
    let depth = 0;
    let current = '';
    let inType = true;
    let currentName = '';
    
    for (let i = 0; i < componentStr.length; i++) {
      const char = componentStr[i];
      
      if (char === '(' || char === '[') {
        depth++;
        current += char;
      } else if (char === ')' || char === ']') {
        depth--;
        current += char;
      } else if (char === ',' && depth === 0) {
        // End of component
        const trimmed = current.trim();
        if (trimmed) {
          const parts = trimmed.split(/\s+/);
          const type = parts[0];
          const name = parts[1] || `field${components.length}`;
          components.push({ type, name });
        }
        current = '';
      } else if (char === ' ' && depth === 0 && current.trim() && inType) {
        // Space after type name
        inType = false;
        currentName = '';
      } else {
        current += char;
      }
    }
    
    // Handle last component
    if (current.trim()) {
      const parts = current.trim().split(/\s+/);
      const type = parts[0];
      const name = parts[1] || `field${components.length}`;
      components.push({ type, name });
    }
    
    return components;
  }

  isDynamicType(type) {
    let typeStr;
    if (typeof type === 'object' && type.type) {
      typeStr = type.type;
    } else {
      typeStr = type;
    }
    
    if (typeStr === 'string' || typeStr === 'bytes') return true;
    if (typeStr.includes('[]')) return true;
    if (typeStr.startsWith('tuple')) {
      // For ABI objects, check components
      if (typeof type === 'object' && type.components) {
        return type.components.some(comp => this.isDynamicType(comp));
      }
      // Parse tuple and check if any component is dynamic
      const match = typeStr.match(/^tuple\((.+)\)$/);
      if (match) {
        const components = this.parseTupleComponents(match[1]);
        return components.some(comp => this.isDynamicType(comp.type));
      }
    }
    return false;
  }

  // Decode event log
  decodeLog(eventAbi, data, topics) {
    const result = { name: eventAbi.name, args: {} };
    
    // Separate indexed and non-indexed parameters
    const indexedParams = eventAbi.inputs.filter(input => input.indexed);
    const nonIndexedParams = eventAbi.inputs.filter(input => !input.indexed);
    
    // Decode indexed parameters from topics (skip topic[0] which is event signature)
    for (let i = 0; i < indexedParams.length; i++) {
      const param = indexedParams[i];
      const topic = topics[i + 1];
      
      if (!topic) continue;
      
      // For dynamic types, topics contain the hash, not the actual value
      if (this.isDynamicType(param.type)) {
        result.args[param.name] = topic; // Store the hash
      } else {
        // Decode the topic as the actual value
        const topicBuffer = hexToBuffer(topic);
        const { value } = this.decodeParameter(param.type, topicBuffer, 0);
        result.args[param.name] = value;
      }
    }
    
    // Decode non-indexed parameters from data
    if (nonIndexedParams.length > 0 && data && data !== '0x') {
      const types = nonIndexedParams.map(param => param.type);
      const decodedData = this.decodeParameters(types, data);
      
      for (let i = 0; i < nonIndexedParams.length; i++) {
        result.args[nonIndexedParams[i].name] = decodedData[i];
      }
    }
    
    return result;
  }
}

export default Decoder;
