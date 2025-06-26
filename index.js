// Core functionality
export { ABICodec } from './lib/core/abi-codec.js';
export { default as Encoder } from './lib/core/encoder.js';
export { default as Decoder } from './lib/core/decoder.js';
export * as utils from './lib/core/utils.js';
export * as selectorUtils from './lib/core/selector-utils.js';

// Individual exports for convenience
export * as erc20 from './lib/common/erc20/index.js';
export { uniswapV2 } from './lib/common/uniswap/index.js';
export { informer } from './lib/common/informer/index.js';
export { tokenTrader } from './lib/common/tokentrader/index.js';

// Common utilities
import * as erc20 from './lib/common/erc20/index.js';
import * as uniswapV2 from './lib/common/uniswap/index.js';
import * as informer from './lib/common/informer/index.js';
import * as tokenTrader from './lib/common/tokentrader/index.js';
import * as logDecoder from './lib/common/utils/log-decoder.js';

// Import for default export
import { ABICodec } from './lib/core/abi-codec.js';
import Encoder from './lib/core/encoder.js';
import Decoder from './lib/core/decoder.js';
import * as utils from './lib/core/utils.js';
import * as selectorUtils from './lib/core/selector-utils.js';

// Organized exports
export const common = {
    erc20,
    uniswapV2,
    informer,
    tokenTrader,
    decoder: logDecoder
};

// Default export with all functionality
export default {
    ABICodec,
    Encoder,
    Decoder,
    utils,
    selectorUtils,
    common
};
