# ABI Toolkit

## Overview

ABI Toolkit is a comprehensive, production-ready npm package designed for Ethereum smart contract interactions. It merges the functionalities of the `abi-common` and `abi-coder` repositories into a unified, efficient, and extensible toolkit. The package supports encoding and decoding of contract calls, event logs, and provides enhanced utilities for DeFi protocols such as Uniswap and ERC20 tokens.

## Features

- **Modular ABI Encoding/Decoding:** Supports encoding and decoding of Ethereum contract function calls and event logs with high performance.
- **Enhanced Router Functionality:** Supports call, send, and estimate modes for contract interactions.
- **Fee-on-Transfer Token Support:** Handles tokens with transfer fees seamlessly.
- **Comprehensive Validation:** Validates inputs and outputs to prevent errors.
- **DeFi Protocol Support:** Includes ABIs and utilities for Uniswap V2 factory, pair, and router contracts.
- **Informer Module:** Provides utilities to fetch and decode contract state information.
- **Token Trader Module:** Facilitates complex token trade call data generation.
- **Performance Optimized:** Low memory footprint and fast encoding/decoding.
- **Extensive Testing:** Includes integration, edge case, and performance tests.

## Installation

```bash
npm install @bcoders.gr/abi-toolkit
```

## Usage

```js
import { informer, tokenTrader, erc20, uniswap } from '@bcoders.gr/abi-toolkit';

// Example: Get owner of a contract
const ownerCallData = informer.getOwner('0xContractAddress');

// Example: Generate token trade call data
const tradeData = tokenTrader.btwr(
  '0xFromAddress',
  '0xPairAddress',
  '1000000000000000000', // amountIn
  '2000000000000000000', // amountOutMin
  '500000000000000000',  // deadline
  true                   // some boolean flag
);
```

## Modules

- **Core ABI Codec:** Encoding and decoding core functions.
- **Common Modules:** ERC20, Uniswap V2 (factory, pair, router), Informer, Token Trader.
- **Utilities:** Log decoder, selector utils, and other helpers.

## Testing

The package includes comprehensive tests covering:

- Integration of all modules.
- Edge cases and error handling.
- Performance and gas optimization.

Run tests with:

```bash
npm test
```

## Contributing

Contributions are welcome! Please fork the repository and submit pull requests.

## License

MIT License

---

This README provides a detailed analytical overview of the ABI Toolkit package, its features, usage, and testing instructions.
