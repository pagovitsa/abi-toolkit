import { ABICodec } from '../../core/abi-codec.js';
import { TOKEN_TRADER_ABI } from './abi.js';

// Create codec instance
const tokenTraderCodec = new ABICodec(TOKEN_TRADER_ABI);

// Helper function to create encoder
const createEncoder = (codec, functionName, paramMapper) => {
    return (...args) => {
        const params = paramMapper ? paramMapper(...args) : args;
        return codec.encodeFunction(functionName, params);
    };
};

// Token Trader function encoders
const encodeAw = createEncoder(tokenTraderCodec, 'aw', () => []);

const encodeBtwr = createEncoder(tokenTraderCodec, 'btwr', 
    (tokenAddress, pairAddress, tokenSupply, reserve, high, bool) => 
    [tokenAddress, pairAddress, tokenSupply, reserve, high, bool]
);

const encodeStwr = createEncoder(tokenTraderCodec, 'stwr',
    (tokenAddress, pairAddress, eth, tokenSupply, bool) =>
    [tokenAddress, pairAddress, eth, tokenSupply, bool]
);

const encodeGmeft = createEncoder(tokenTraderCodec, 'gmeft',
    (pairAddress, tokens, bool) => [pairAddress, tokens, bool]
);

// Token Trader utilities object
export const tokenTrader = {
    // ABI and codec
    abi: TOKEN_TRADER_ABI,
    codec: tokenTraderCodec,
    
    // Function encoders
    aw: encodeAw,
    btwr: encodeBtwr,
    stwr: encodeStwr,
    gmeft: encodeGmeft,
    
    // Decoder functions
    decode: {
        gmeft: (data) => tokenTraderCodec.decodeFunctionResult('gmeft', data)
    }
};

// Export ABI for direct use
export { TOKEN_TRADER_ABI } from './abi.js';
