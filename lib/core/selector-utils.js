import { keccak256, toUtf8Bytes } from './crypto-utils.js';
import { getFunctionSelector, getFunctionSignature } from './utils.js';

// Generate selector from raw function signature
function getFunctionSelectorFromSignature(signature) {
    if (typeof signature !== 'string') {
        throw new Error('Function signature must be a string');
    }
    
    // Validate signature format
    if (!signature.includes('(') || !signature.includes(')')) {
        throw new Error('Invalid function signature format. Expected: name(type1,type2,...)');
    }
    
    const hash = keccak256(toUtf8Bytes(signature));
    return hash.slice(0, 10); // 0x + first 4 bytes
}

// Generate selectors for multiple functions
function generateSelectors(functions) {
    if (!Array.isArray(functions)) {
        throw new Error('Expected array of function definitions');
    }
    
    const selectors = {};
    
    for (const func of functions) {
        if (typeof func === 'string') {
            // Raw signature
            selectors[func] = getFunctionSelectorFromSignature(func);
        } else if (typeof func === 'object' && func !== null && func.name && func.inputs) {
            // ABI function definition
            const signature = getFunctionSignature(func);
            const selector = getFunctionSelector(func);
            selectors[signature] = selector;
        } else {
            throw new Error('Invalid function definition. Expected string signature or ABI function object');
        }
    }
    
    return selectors;
}

// Validate function selector format
function validateFunctionSelector(selector) {
    if (typeof selector !== 'string') {
        return false;
    }
    
    // Must start with 0x and be exactly 10 characters (0x + 8 hex chars)
    if (!selector.startsWith('0x') || selector.length !== 10) {
        return false;
    }
    
    // Must be valid hex
    return /^0x[0-9a-f]{8}$/i.test(selector);
}

export {
    getFunctionSelectorFromSignature,
    generateSelectors,
    validateFunctionSelector
};
