# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] - 2025-07-04

### Added
- Enhanced log decoder with pre-optimized common event signatures
- Manual optimization for Transfer events (3x performance improvement)
- Support for multiple input formats in log decoder (single receipt, array of receipts, array of logs)
- Pre-computed event signatures for instant recognition
- Codec caching for repeated event types
- Comprehensive metadata preservation in decoded logs

### Improved
- Log decoding performance: Transfer events now decode at ~100,000 ops/sec
- Memory efficiency in log decoder with zero-allocation address parsing
- Better error handling in log decoder with graceful fallback
- Updated README with comprehensive log decoder documentation

### Fixed
- Log decoder now properly handles edge cases and malformed logs
- Improved compatibility with different receipt formats

## [2.1.1] - 2025-07-03

### Added
- Initial log decoder implementation
- Common event ABI definitions
- Basic event categorization

### Fixed
- Various bug fixes and improvements

## [2.1.0] - 2025-07-02

### Added
- Core ABI encoding/decoding functionality
- ERC20 token utilities
- Uniswap V2 protocol support
- Informer and TokenTrader modules
- Comprehensive test suite

### Performance
- Lightweight package (18.7 kB)
- High-performance encoding/decoding
- Minimal dependencies (js-sha3 only)
