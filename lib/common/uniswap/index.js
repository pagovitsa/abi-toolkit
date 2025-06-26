import { ABICodec } from '../../core/abi-codec.js';
import { UNISWAP_V2_FACTORY_ABI } from './factory-abi.js';
import { UNISWAP_V2_PAIR_ABI } from './pair-abi.js';
import { UNISWAP_V2_ROUTER_ABI } from './router-abi.js';

// Create singleton ABICodec instances for each contract type
const factoryCodec = new ABICodec(UNISWAP_V2_FACTORY_ABI);
const pairCodec = new ABICodec(UNISWAP_V2_PAIR_ABI);
const routerCodec = new ABICodec(UNISWAP_V2_ROUTER_ABI);

// Pre-compile address validation regex
const addressRegex = /^0x[0-9a-fA-F]{40}$/;

// Helper function to validate Ethereum address
const isValidAddress = (address) => {
    return typeof address === 'string' && addressRegex.test(address);
};

// Helper function to validate amount
const isValidAmount = (amount) => {
    return amount !== undefined && amount !== null && amount !== '';
};

// Helper function to validate deadline
const isValidDeadline = (deadline) => {
    return typeof deadline === 'string' || typeof deadline === 'number';
};

// Helper function to validate path array
const isValidPath = (path) => {
    return Array.isArray(path) && path.length >= 2 && path.every(isValidAddress);
};

// Optimized encoding functions with validation
const createEncoder = (codec, functionName, validator = () => true) => {
    return (...params) => {
        if (!validator(...params)) {
            throw new Error(`Invalid parameters for ${functionName}`);
        }
        return codec.encodeFunction(functionName, params);
    };
};

// =============================================================================
// UNISWAP V2 FACTORY FUNCTIONS
// =============================================================================

// Factory view functions
export const encodeGetPair = createEncoder(factoryCodec, 'getPair',
    (tokenA, tokenB) => isValidAddress(tokenA) && isValidAddress(tokenB));

export const encodeAllPairs = createEncoder(factoryCodec, 'allPairs',
    (index) => typeof index === 'string' || typeof index === 'number');

export const encodeAllPairsLength = createEncoder(factoryCodec, 'allPairsLength');

export const encodeFeeTo = createEncoder(factoryCodec, 'feeTo');

export const encodeFeeToSetter = createEncoder(factoryCodec, 'feeToSetter');

// Factory state-changing functions
export const encodeCreatePair = createEncoder(factoryCodec, 'createPair',
    (tokenA, tokenB) => isValidAddress(tokenA) && isValidAddress(tokenB));

export const encodeSetFeeTo = createEncoder(factoryCodec, 'setFeeTo',
    (feeTo) => isValidAddress(feeTo));

export const encodeSetFeeToSetter = createEncoder(factoryCodec, 'setFeeToSetter',
    (feeToSetter) => isValidAddress(feeToSetter));

// =============================================================================
// UNISWAP V2 PAIR FUNCTIONS
// =============================================================================

// Pair view functions
export const encodeToken0 = createEncoder(pairCodec, 'token0');
export const encodeToken1 = createEncoder(pairCodec, 'token1');
export const encodeGetReserves = createEncoder(pairCodec, 'getReserves');
export const encodeFactory = createEncoder(pairCodec, 'factory');
export const encodeKLast = createEncoder(pairCodec, 'kLast');
export const encodePrice0CumulativeLast = createEncoder(pairCodec, 'price0CumulativeLast');
export const encodePrice1CumulativeLast = createEncoder(pairCodec, 'price1CumulativeLast');

// Pair ERC20 functions
export const encodePairBalanceOf = createEncoder(pairCodec, 'balanceOf',
    (account) => isValidAddress(account));

export const encodePairTotalSupply = createEncoder(pairCodec, 'totalSupply');

export const encodePairAllowance = createEncoder(pairCodec, 'allowance',
    (owner, spender) => isValidAddress(owner) && isValidAddress(spender));

export const encodePairApprove = createEncoder(pairCodec, 'approve',
    (spender, amount) => isValidAddress(spender) && isValidAmount(amount));

export const encodePairTransfer = createEncoder(pairCodec, 'transfer',
    (to, amount) => isValidAddress(to) && isValidAmount(amount));

export const encodePairTransferFrom = createEncoder(pairCodec, 'transferFrom',
    (from, to, amount) => isValidAddress(from) && isValidAddress(to) && isValidAmount(amount));

// Pair liquidity functions
export const encodeMint = createEncoder(pairCodec, 'mint',
    (to) => isValidAddress(to));

export const encodeBurn = createEncoder(pairCodec, 'burn',
    (to) => isValidAddress(to));

export const encodeSwap = createEncoder(pairCodec, 'swap',
    (amount0Out, amount1Out, to, data) => 
        isValidAmount(amount0Out) && isValidAmount(amount1Out) && 
        isValidAddress(to) && typeof data === 'string');

export const encodeSkim = createEncoder(pairCodec, 'skim',
    (to) => isValidAddress(to));

export const encodeSync = createEncoder(pairCodec, 'sync');

// Pair permit function
export const encodePermit = createEncoder(pairCodec, 'permit',
    (owner, spender, value, deadline, v, r, s) =>
        isValidAddress(owner) && isValidAddress(spender) && 
        isValidAmount(value) && isValidDeadline(deadline) &&
        typeof v === 'string' && typeof r === 'string' && typeof s === 'string');

// =============================================================================
// UNISWAP V2 ROUTER FUNCTIONS
// =============================================================================

// Router view functions
export const encodeWETH = createEncoder(routerCodec, 'WETH');
export const encodeRouterFactory = createEncoder(routerCodec, 'factory');

// Quote functions
export const encodeQuote = createEncoder(routerCodec, 'quote',
    (amountA, reserveA, reserveB) => 
        isValidAmount(amountA) && isValidAmount(reserveA) && isValidAmount(reserveB));

export const encodeGetAmountOut = createEncoder(routerCodec, 'getAmountOut',
    (amountIn, reserveIn, reserveOut) =>
        isValidAmount(amountIn) && isValidAmount(reserveIn) && isValidAmount(reserveOut));

export const encodeGetAmountIn = createEncoder(routerCodec, 'getAmountIn',
    (amountOut, reserveIn, reserveOut) =>
        isValidAmount(amountOut) && isValidAmount(reserveIn) && isValidAmount(reserveOut));

export const encodeGetAmountsOut = createEncoder(routerCodec, 'getAmountsOut',
    (amountIn, path) => isValidAmount(amountIn) && isValidPath(path));

export const encodeGetAmountsIn = createEncoder(routerCodec, 'getAmountsIn',
    (amountOut, path) => isValidAmount(amountOut) && isValidPath(path));

// Liquidity functions
export const encodeAddLiquidity = createEncoder(routerCodec, 'addLiquidity',
    (tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin, to, deadline) =>
        isValidAddress(tokenA) && isValidAddress(tokenB) &&
        isValidAmount(amountADesired) && isValidAmount(amountBDesired) &&
        isValidAmount(amountAMin) && isValidAmount(amountBMin) &&
        isValidAddress(to) && isValidDeadline(deadline));

export const encodeAddLiquidityETH = createEncoder(routerCodec, 'addLiquidityETH',
    (token, amountTokenDesired, amountTokenMin, amountETHMin, to, deadline) =>
        isValidAddress(token) && isValidAmount(amountTokenDesired) &&
        isValidAmount(amountTokenMin) && isValidAmount(amountETHMin) &&
        isValidAddress(to) && isValidDeadline(deadline));

export const encodeRemoveLiquidity = createEncoder(routerCodec, 'removeLiquidity',
    (tokenA, tokenB, liquidity, amountAMin, amountBMin, to, deadline) =>
        isValidAddress(tokenA) && isValidAddress(tokenB) &&
        isValidAmount(liquidity) && isValidAmount(amountAMin) && isValidAmount(amountBMin) &&
        isValidAddress(to) && isValidDeadline(deadline));

export const encodeRemoveLiquidityETH = createEncoder(routerCodec, 'removeLiquidityETH',
    (token, liquidity, amountTokenMin, amountETHMin, to, deadline) =>
        isValidAddress(token) && isValidAmount(liquidity) &&
        isValidAmount(amountTokenMin) && isValidAmount(amountETHMin) &&
        isValidAddress(to) && isValidDeadline(deadline));

// Swap functions
export const encodeSwapExactTokensForTokens = createEncoder(routerCodec, 'swapExactTokensForTokens',
    (amountIn, amountOutMin, path, to, deadline) =>
        isValidAmount(amountIn) && isValidAmount(amountOutMin) &&
        isValidPath(path) && isValidAddress(to) && isValidDeadline(deadline));

export const encodeSwapTokensForExactTokens = createEncoder(routerCodec, 'swapTokensForExactTokens',
    (amountOut, amountInMax, path, to, deadline) =>
        isValidAmount(amountOut) && isValidAmount(amountInMax) &&
        isValidPath(path) && isValidAddress(to) && isValidDeadline(deadline));

export const encodeSwapExactETHForTokens = createEncoder(routerCodec, 'swapExactETHForTokens',
    (amountOutMin, path, to, deadline) =>
        isValidAmount(amountOutMin) && isValidPath(path) &&
        isValidAddress(to) && isValidDeadline(deadline));

export const encodeSwapTokensForExactETH = createEncoder(routerCodec, 'swapTokensForExactETH',
    (amountOut, amountInMax, path, to, deadline) =>
        isValidAmount(amountOut) && isValidAmount(amountInMax) &&
        isValidPath(path) && isValidAddress(to) && isValidDeadline(deadline));

export const encodeSwapExactTokensForETH = createEncoder(routerCodec, 'swapExactTokensForETH',
    (amountIn, amountOutMin, path, to, deadline) =>
        isValidAmount(amountIn) && isValidAmount(amountOutMin) &&
        isValidPath(path) && isValidAddress(to) && isValidDeadline(deadline));

export const encodeSwapETHForExactTokens = createEncoder(routerCodec, 'swapETHForExactTokens',
    (amountOut, path, to, deadline) =>
        isValidAmount(amountOut) && isValidPath(path) &&
        isValidAddress(to) && isValidDeadline(deadline));

// Fee-on-transfer token support
export const encodeSwapExactTokensForTokensSupportingFeeOnTransferTokens = createEncoder(
    routerCodec, 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
    (amountIn, amountOutMin, path, to, deadline) =>
        isValidAmount(amountIn) && isValidAmount(amountOutMin) &&
        isValidPath(path) && isValidAddress(to) && isValidDeadline(deadline));

export const encodeSwapExactETHForTokensSupportingFeeOnTransferTokens = createEncoder(
    routerCodec, 'swapExactETHForTokensSupportingFeeOnTransferTokens',
    (amountOutMin, path, to, deadline) =>
        isValidAmount(amountOutMin) && isValidPath(path) &&
        isValidAddress(to) && isValidDeadline(deadline));

export const encodeSwapExactTokensForETHSupportingFeeOnTransferTokens = createEncoder(
    routerCodec, 'swapExactTokensForETHSupportingFeeOnTransferTokens',
    (amountIn, amountOutMin, path, to, deadline) =>
        isValidAmount(amountIn) && isValidAmount(amountOutMin) &&
        isValidPath(path) && isValidAddress(to) && isValidDeadline(deadline));

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

// High-level convenience functions for common operations
export const uniswapV2 = {
    // Factory operations
    factory: {
        getPair: encodeGetPair,
        createPair: encodeCreatePair,
        allPairs: encodeAllPairs,
        allPairsLength: encodeAllPairsLength,
        feeTo: encodeFeeTo,
        feeToSetter: encodeFeeToSetter,
        setFeeTo: encodeSetFeeTo,
        setFeeToSetter: encodeSetFeeToSetter
    },

    // Pair operations
    pair: {
        // Token info
        token0: encodeToken0,
        token1: encodeToken1,
        getReserves: encodeGetReserves,
        factory: encodeFactory,
        
        // ERC20 functions
        balanceOf: encodePairBalanceOf,
        totalSupply: encodePairTotalSupply,
        allowance: encodePairAllowance,
        approve: encodePairApprove,
        transfer: encodePairTransfer,
        transferFrom: encodePairTransferFrom,
        
        // Liquidity functions
        mint: encodeMint,
        burn: encodeBurn,
        swap: encodeSwap,
        skim: encodeSkim,
        sync: encodeSync,
        permit: encodePermit
    },

    // Router operations
    router: {
        // View functions
        WETH: encodeWETH,
        factory: encodeRouterFactory,
        
        // Quote functions
        quote: encodeQuote,
        getAmountOut: encodeGetAmountOut,
        getAmountIn: encodeGetAmountIn,
        getAmountsOut: encodeGetAmountsOut,
        getAmountsIn: encodeGetAmountsIn,
        
        // Liquidity functions
        addLiquidity: encodeAddLiquidity,
        addLiquidityETH: encodeAddLiquidityETH,
        removeLiquidity: encodeRemoveLiquidity,
        removeLiquidityETH: encodeRemoveLiquidityETH,
        
        // Swap functions
        swapExactTokensForTokens: encodeSwapExactTokensForTokens,
        swapTokensForExactTokens: encodeSwapTokensForExactTokens,
        swapExactETHForTokens: encodeSwapExactETHForTokens,
        swapTokensForExactETH: encodeSwapTokensForExactETH,
        swapExactTokensForETH: encodeSwapExactTokensForETH,
        swapETHForExactTokens: encodeSwapETHForExactTokens,
        
        // Fee-on-transfer support
        swapExactTokensForTokensSupportingFeeOnTransferTokens: encodeSwapExactTokensForTokensSupportingFeeOnTransferTokens,
        swapExactETHForTokensSupportingFeeOnTransferTokens: encodeSwapExactETHForTokensSupportingFeeOnTransferTokens,
        swapExactTokensForETHSupportingFeeOnTransferTokens: encodeSwapExactTokensForETHSupportingFeeOnTransferTokens
    }
};

// Export ABIs for direct use
export { UNISWAP_V2_FACTORY_ABI } from './factory-abi.js';
export { UNISWAP_V2_PAIR_ABI } from './pair-abi.js';
export { UNISWAP_V2_ROUTER_ABI } from './router-abi.js';
