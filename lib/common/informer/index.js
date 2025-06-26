import { ABICodec } from '../../core/abi-codec.js';
import { INFORMER_ABI } from './abi.js';

// Create codec instance
const informerCodec = new ABICodec(INFORMER_ABI);

// Helper function to create encoder
const createEncoder = (codec, functionName, paramMapper) => {
    return (...args) => {
        const params = paramMapper ? paramMapper(...args) : args;
        return codec.encodeFunction(functionName, params);
    };
};

// Informer function encoders
const encodeGetOwner = createEncoder(informerCodec, 'getOwner', (contractAddress) => [contractAddress]);

const encodeGetPairAndTokenDetails = createEncoder(informerCodec, 'getPairAndTokenDetails', (pairAddress) => [pairAddress]);

const encodeGetReserves = createEncoder(informerCodec, 'getReserves', (pairAddress) => [pairAddress]);

const encodeGetTokenBalance = createEncoder(informerCodec, 'getTokenBalance', (tokenAddress, walletAddress) => [tokenAddress, walletAddress]);

const encodeGetTotalSupply = createEncoder(informerCodec, 'getTotalSupply', (tokenAddress) => [tokenAddress]);

// Informer utilities object
export const informer = {
    // ABI and codec
    abi: INFORMER_ABI,
    codec: informerCodec,
    
    // Function encoders
    getOwner: encodeGetOwner,
    getPairAndTokenDetails: encodeGetPairAndTokenDetails,
    getReserves: encodeGetReserves,
    getTokenBalance: encodeGetTokenBalance,
    getTotalSupply: encodeGetTotalSupply,
    
    // Decoder functions
    decode: {
        getOwner: (data) => informerCodec.decodeFunctionResult('getOwner', data),
        getPairAndTokenDetails: (data) => informerCodec.decodeFunctionResult('getPairAndTokenDetails', data),
        getReserves: (data) => informerCodec.decodeFunctionResult('getReserves', data),
        getTokenBalance: (data) => informerCodec.decodeFunctionResult('getTokenBalance', data),
        getTotalSupply: (data) => informerCodec.decodeFunctionResult('getTotalSupply', data)
    }
};

// Export ABI for direct use
export { INFORMER_ABI } from './abi.js';
