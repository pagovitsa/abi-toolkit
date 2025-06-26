import pkg from 'js-sha3';
const { keccak_256 } = pkg;

/**
 * Convert a UTF-8 string to bytes (Uint8Array)
 * Replaces ethers.toUtf8Bytes
 */
export function toUtf8Bytes(str) {
    if (typeof str !== 'string') {
        throw new Error('Input must be a string');
    }
    return new TextEncoder().encode(str);
}

/**
 * Compute Keccak-256 hash of input data
 * Replaces ethers.keccak256
 */
export function keccak256(data) {
    let bytes;
    if (typeof data === 'string') {
        if (data.startsWith('0x')) {
            // Handle hex string
            const hex = data.slice(2);
            bytes = new Uint8Array(hex.length / 2);
            for (let i = 0; i < hex.length; i += 2) {
                bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
            }
        } else {
            // Handle regular string
            bytes = toUtf8Bytes(data);
        }
    } else if (data instanceof Uint8Array) {
        bytes = data;
    } else if (Array.isArray(data)) {
        bytes = new Uint8Array(data);
    } else {
        throw new Error('Invalid input type for keccak256');
    }
    
    return '0x' + keccak_256(bytes);
}
