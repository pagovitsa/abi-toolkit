import { ABICodec } from '../../core/abi-codec.js';
import { ERC20_ABI } from './abi.js';

// Create singleton ABICodec instance with the ERC20 ABI
const abiCoder = new ABICodec(ERC20_ABI);

// Pre-compile address validation regex
const addressRegex = /^0x[0-9a-fA-F]{40}$/;

// Cache for function selectors
const functionSelectors = new Map();

// Helper function to validate Ethereum address with regex
const isValidAddress = (address) => {
    return typeof address === 'string' && addressRegex.test(address);
};

// Helper function to get cached function selector
const getFunctionSelector = (functionName) => {
    if (!functionSelectors.has(functionName)) {
        const abi = ERC20_ABI.find(item => item.name === functionName);
        if (!abi) throw new Error(`Function not found: ${functionName}`);
        functionSelectors.set(functionName, abi);
    }
    return functionSelectors.get(functionName);
};

// Optimized encoding functions
const createEncoder = (functionName, validateParams = () => true) => {
    return (...params) => {
        if (!validateParams(...params)) {
            throw new Error(`Invalid parameters for ${functionName}`);
        }
        return abiCoder.encodeFunction(functionName, params);
    };
};

// Optimized decoding functions
const createDecoder = (functionName) => {
    return (data) => abiCoder.decodeFunction(functionName, data);
};

// Create optimized encoding functions
export const encodeBalanceOf = createEncoder('balanceOf', 
    (account) => isValidAddress(account));

export const encodeAllowance = createEncoder('allowance',
    (owner, spender) => isValidAddress(owner) && isValidAddress(spender));

export const encodeTotalSupply = createEncoder('totalSupply');
export const encodeName = createEncoder('name');
export const encodeSymbol = createEncoder('symbol');
export const encodeDecimals = createEncoder('decimals');

export const encodeApprove = createEncoder('approve',
    (spender, amount) => isValidAddress(spender) && amount !== undefined);

export const encodeTransfer = createEncoder('transfer',
    (to, amount) => isValidAddress(to) && amount !== undefined);

export const encodeTransferFrom = createEncoder('transferFrom',
    (from, to, amount) => isValidAddress(from) && isValidAddress(to) && amount !== undefined);

// Create optimized decoding functions
export const decodeBalanceOf = createDecoder('balanceOf');
export const decodeAllowance = createDecoder('allowance');
export const decodeTotalSupply = createDecoder('totalSupply');
export const decodeName = createDecoder('name');
export const decodeSymbol = createDecoder('symbol');
export const decodeDecimals = createDecoder('decimals');
export const decodeApprove = createDecoder('approve');
export const decodeTransfer = createDecoder('transfer');
export const decodeTransferFrom = createDecoder('transferFrom');

// Optimized result decoding functions
const createResultDecoder = (functionName) => {
    return (data) => abiCoder.decodeFunctionResult(functionName, data);
};

export const decodeUint256Result = createResultDecoder;
export const decodeStringResult = createResultDecoder;
export const decodeUint8Result = createResultDecoder;
export const decodeBoolResult = createResultDecoder;

// Optimized helper functions with error handling
const createContractCall = (encodeFn, decodeFn, errorMsg) => {
    return async (provider, tokenAddress, ...params) => {
        if (!provider) throw new Error('Provider is required');
        if (!isValidAddress(tokenAddress)) throw new Error('Invalid token address');
        
        try {
            const txData = encodeFn(...params);
            const response = await provider.call(tokenAddress, txData);
            if (!response) throw new Error('No response from contract');
            
            const decoded = decodeFn(response);
            if (!decoded || !Array.isArray(decoded) || decoded.length === 0) {
                throw new Error('Invalid response format');
            }
            
            return decoded[0];
        } catch (error) {
            console.error(`Error ${errorMsg}:`, error.message);
            throw error;
        }
    };
};

// Create optimized contract interaction functions
export const getBalanceOf = createContractCall(
    encodeBalanceOf,
    decodeUint256Result('balanceOf'),
    'getting token balance'
);

export const getAllowance = createContractCall(
    encodeAllowance,
    decodeUint256Result('allowance'),
    'getting allowance'
);

export const getTokenTotalSupply = createContractCall(
    encodeTotalSupply,
    decodeUint256Result('totalSupply'),
    'getting total supply'
);

export const getTokenName = createContractCall(
    encodeName,
    decodeStringResult('name'),
    'getting token name'
);

export const getTokenSymbol = createContractCall(
    encodeSymbol,
    decodeStringResult('symbol'),
    'getting token symbol'
);

export const getTokenDecimals = createContractCall(
    encodeDecimals,
    decodeUint8Result('decimals'),
    'getting token decimals'
);

// Transaction data generators
export const approve = (spender, amount) => encodeApprove(spender, amount);
export const transfer = (to, amount) => encodeTransfer(to, amount);
export const transferFrom = (from, to, amount) => encodeTransferFrom(from, to, amount);

// Export ABI
export { ERC20_ABI } from './abi.js';
