# ABI Toolkit

A comprehensive, production-ready Ethereum ABI toolkit for smart contract interactions. This lightweight toolkit provides high-performance encoding/decoding capabilities along with extensive utilities for DeFi protocols, without heavy dependencies like ethers.js.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Architecture](#architecture)
- [Core Modules](#core-modules)
- [Common Modules](#common-modules)
- [Utilities](#utilities)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Performance](#performance)
- [Security](#security)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

## Features

- **Lightweight & Fast**
  - No heavy dependencies (no ethers.js required)
  - Only 18.7 kB package size
  - Uses efficient js-sha3 for cryptographic operations
  - Optimized for minimal memory footprint

- **High-Performance ABI Encoding/Decoding**
  - Fast encoding and decoding operations
  - Support for all Solidity types
  - Batch operation support
  - Caching for improved performance

- **Comprehensive Protocol Support**
  - ERC20 token interactions
  - Uniswap V2 integration (Factory, Pair, Router)
  - Custom protocol support via extensible architecture

- **Advanced Features**
  - Fee-on-transfer token handling
  - Gas optimization utilities
  - Comprehensive input validation
  - Event log decoding
  - Function selector utilities

- **Production-Ready**
  - Extensive test coverage
  - Error handling and validation
  - TypeScript-friendly
  - Well-documented API

## Installation

```bash
npm install @bcoders.gr/abi-toolkit
```

**Why choose this toolkit?**
- ✅ Lightweight: Only 18.7 kB vs 1MB+ with ethers.js
- ✅ Zero ethers dependency - uses efficient js-sha3 instead
- ✅ Same functionality, better performance
- ✅ Drop-in replacement for ethers-based ABI operations

Requires Node.js >= 16.0.0

## Architecture

The toolkit is organized into three main layers:

1. **Core Layer**
   - ABICodec: Main encoding/decoding engine
   - Encoder: Low-level ABI encoding
   - Decoder: Low-level ABI decoding
   - Selector Utils: Function signature handling

2. **Common Modules Layer**
   - Protocol-specific implementations
   - Standardized interfaces
   - Reusable components

3. **Utility Layer**
   - Helper functions
   - Validation utilities
   - Log handling

## Core Modules

### ABICodec

The primary interface for encoding and decoding Ethereum contract calls.

```javascript
import { ABICodec } from '@bcoders.gr/abi-toolkit';

const codec = new ABICodec(contractABI);

// Encode function call
const encoded = codec.encodeFunction('transfer', ['0x123...', '1000000000']);

// Decode function result
const decoded = codec.decodeFunctionResult('balanceOf', '0x000....');
```

### Encoder/Decoder

Low-level encoding and decoding utilities.

```javascript
import { Encoder, Decoder } from '@bcoders.gr/abi-toolkit';

// Encode parameters
const encoded = Encoder.encodeParameters(['address', 'uint256'], ['0x123...', '1000']);

// Decode parameters
const decoded = Decoder.decodeParameters(['string', 'bool'], '0x...');
```

## Common Modules

### ERC20

Utilities for ERC20 token interactions.

```javascript
import { erc20 } from '@bcoders.gr/abi-toolkit';

// Generate transfer call data
const transferData = erc20.transfer(recipientAddress, amount);

// Generate approve call data
const approveData = erc20.approve(spenderAddress, amount);

// Get token balance
const balanceData = erc20.balanceOf(accountAddress);
```

### Uniswap V2

Complete Uniswap V2 protocol support.

```javascript
import { uniswapV2 } from '@bcoders.gr/abi-toolkit';

// Factory interactions
const createPairData = uniswapV2.factory.createPair(token0, token1);
const getPairData = uniswapV2.factory.getPair(token0, token1);

// Router interactions
const swapData = uniswapV2.router.swapExactTokensForTokens(
  amountIn,
  amountOutMin,
  path,
  to,
  deadline
);

// Pair interactions
const reservesData = uniswapV2.pair.getReserves();
```

### Informer

Contract state information utilities.

```javascript
import { informer } from '@bcoders.gr/abi-toolkit';

// Get contract owner
const ownerData = informer.getOwner(contractAddress);

// Decode owner response
const owner = informer.decode.owner(responseData);
```

### TokenTrader

Advanced token trading utilities.

```javascript
import { tokenTrader } from '@bcoders.gr/abi-toolkit';

// Generate trade data
const tradeData = tokenTrader.btwr(
  fromAddress,
  pairAddress,
  amountIn,
  amountOutMin,
  deadline,
  flag
);
```

## Utilities

### Log Decoder

Decode event logs from transaction receipts.

```javascript
import { LogDecoder } from '@bcoders.gr/abi-toolkit';

// Decode transfer events
const transfers = LogDecoder.decodeTransferLogs(txReceipt);

// Add custom ABI for decoding
LogDecoder.addCustomABI(customABI, 'CustomContract');
```

### Selector Utils

Function selector utilities.

```javascript
import { selectorUtils } from '@bcoders.gr/abi-toolkit';

// Generate function selector
const selector = selectorUtils.getFunctionSelectorFromSignature('transfer(address,uint256)');

// Validate selector
const isValid = selectorUtils.validateFunctionSelector('0xa9059cbb');
```

## Performance

The toolkit is optimized for performance and size:

- **Package Size**: Only 18.7 kB (vs 1MB+ with ethers.js)
- **Dependencies**: Just js-sha3 for cryptographic operations
- **Memory**: Minimal allocation and efficient buffer handling
- **Speed**: Optimized encoding/decoding algorithms with caching

Benchmarks show:
- Function encoding: ~50,000 ops/sec
- Parameter decoding: ~40,000 ops/sec
- Log decoding: ~30,000 ops/sec
- Package install time: 90% faster than ethers-based alternatives

## Security

Security best practices implemented:

- Input validation for all parameters
- Safe buffer handling
- Protection against integer overflow
- Proper error handling
- No unsafe type coercion

## Testing

Comprehensive test suite covering:

```bash
# Run all tests
npm test

# Run specific test suite
node test/integration-test.js
node test/performance-test.js
node test/edge-cases-test.js
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup

```bash
git clone https://github.com/yourusername/abi-toolkit.git
cd abi-toolkit
npm install
npm test
```

## License

MIT License - see the [LICENSE](LICENSE) file for details.

---

For more information, bug reports, or feature requests, please visit the [GitHub repository](https://github.com/pagovitsa/abi-toolkit).
