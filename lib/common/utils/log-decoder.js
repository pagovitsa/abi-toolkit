import { ABICodec } from '../../core/abi-codec.js';

// Pre-defined common event ABIs for performance
const COMMON_EVENT_ABIS = {
    ERC20_TRANSFER: [{
        "anonymous": false,
        "inputs": [
            {"indexed": true, "name": "from", "type": "address"},
            {"indexed": true, "name": "to", "type": "address"},
            {"indexed": false, "name": "value", "type": "uint256"}
        ],
        "name": "Transfer",
        "type": "event"
    }],
    
    UNISWAP_V2_MINT: [{
        "anonymous": false,
        "inputs": [
            {"indexed": true, "name": "sender", "type": "address"},
            {"indexed": false, "name": "amount0", "type": "uint256"},
            {"indexed": false, "name": "amount1", "type": "uint256"}
        ],
        "name": "Mint",
        "type": "event"
    }],
    
    UNISWAP_V2_PAIR_CREATED: [{
        "anonymous": false,
        "inputs": [
            {"indexed": true, "name": "token0", "type": "address"},
            {"indexed": true, "name": "token1", "type": "address"},
            {"indexed": false, "name": "pair", "type": "address"},
            {"indexed": false, "name": "", "type": "uint256"}
        ],
        "name": "PairCreated",
        "type": "event"
    }]
};

// Pre-computed event signatures for fast lookup
const EVENT_SIGNATURES = {
    TRANSFER: '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
    MINT: '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f',
    PAIR_CREATED: '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9'
};

// Create codec instances for common events
const codecCache = new Map();
const getCodec = (eventType) => {
    if (!codecCache.has(eventType)) {
        codecCache.set(eventType, new ABICodec(COMMON_EVENT_ABIS[eventType]));
    }
    return codecCache.get(eventType);
};

// Optimized log decoder class
class LogDecoder {
    constructor() {
        this.customCodecs = new Map();
        this.signatureToType = new Map([
            [EVENT_SIGNATURES.TRANSFER, 'ERC20_TRANSFER'],
            [EVENT_SIGNATURES.MINT, 'UNISWAP_V2_MINT'],
            [EVENT_SIGNATURES.PAIR_CREATED, 'UNISWAP_V2_PAIR_CREATED']
        ]);
    }

    // Add custom ABI for decoding
    addABI(abi, name) {
        this.customCodecs.set(name, new ABICodec(abi));
    }

    // Decode logs with performance optimizations
    decodeLogs(receipts) {
        const decodedLogs = {
            transfers: [],
            mints: [],
            pairCreated: [],
            custom: []
        };

        // Handle both single receipt and array
        const receiptArray = Array.isArray(receipts) ? receipts : [receipts];

        for (const receipt of receiptArray) {
            if (!receipt?.logs) continue;

            for (const log of receipt.logs) {
                try {
                    const topic0 = log.topics?.[0];
                    if (!topic0) continue;

                    const eventType = this.signatureToType.get(topic0);
                    
                    if (eventType) {
                        const decoded = this._decodeCommonEvent(eventType, log);
                        if (decoded) {
                            this._categorizeDecodedLog(decoded, decodedLogs);
                        }
                    } else {
                        // Try custom codecs
                        const customDecoded = this._tryCustomCodecs(log);
                        if (customDecoded) {
                            decodedLogs.custom.push(customDecoded);
                        }
                    }
                } catch (error) {
                    // Skip logs that can't be decoded
                    continue;
                }
            }
        }

        return decodedLogs;
    }

    // Decode specific event types
    decodeTransferLogs(receipts) {
        return this.decodeLogs(receipts).transfers;
    }

    decodeMintLogs(receipts) {
        return this.decodeLogs(receipts).mints;
    }

    decodePairCreatedLogs(receipts) {
        return this.decodeLogs(receipts).pairCreated;
    }

    // Private methods for optimization
    _decodeCommonEvent(eventType, log) {
        const codec = getCodec(eventType);
        const decoded = codec.decodeLog(log.data, log.topics);
        
        return {
            ...decoded,
            contractAddress: log.address,
            blockNumber: log.blockNumber,
            transactionHash: log.transactionHash,
            logIndex: log.logIndex,
            removed: log.removed
        };
    }

    _tryCustomCodecs(log) {
        for (const [name, codec] of this.customCodecs) {
            try {
                const decoded = codec.decodeLog(log.data, log.topics);
                return {
                    ...decoded,
                    codecName: name,
                    contractAddress: log.address,
                    blockNumber: log.blockNumber,
                    transactionHash: log.transactionHash,
                    logIndex: log.logIndex,
                    removed: log.removed
                };
            } catch (error) {
                continue;
            }
        }
        return null;
    }

    _categorizeDecodedLog(decoded, decodedLogs) {
        switch (decoded.name) {
            case 'Transfer':
                decodedLogs.transfers.push({
                    type: 'Transfer',
                    contractAddress: decoded.contractAddress,
                    from: decoded.args.from,
                    to: decoded.args.to,
                    value: decoded.args.value,
                    blockNumber: decoded.blockNumber,
                    transactionHash: decoded.transactionHash,
                    logIndex: decoded.logIndex
                });
                break;
            case 'Mint':
                decodedLogs.mints.push({
                    type: 'Mint',
                    contractAddress: decoded.contractAddress,
                    sender: decoded.args.sender,
                    amount0: decoded.args.amount0,
                    amount1: decoded.args.amount1,
                    blockNumber: decoded.blockNumber,
                    transactionHash: decoded.transactionHash,
                    logIndex: decoded.logIndex
                });
                break;
            case 'PairCreated':
                decodedLogs.pairCreated.push({
                    type: 'PairCreated',
                    contractAddress: decoded.contractAddress,
                    token0: decoded.args.token0,
                    token1: decoded.args.token1,
                    pair: decoded.args.pair,
                    pairIndex: decoded.args[3],
                    blockNumber: decoded.blockNumber,
                    transactionHash: decoded.transactionHash,
                    logIndex: decoded.logIndex
                });
                break;
        }
    }
}

// Create singleton instance
const logDecoder = new LogDecoder();

// Export functions
export const decodeLogs = (receipts) => logDecoder.decodeLogs(receipts);
export const decodeTransferLogs = (receipts) => logDecoder.decodeTransferLogs(receipts);
export const decodeMintLogs = (receipts) => logDecoder.decodeMintLogs(receipts);
export const decodePairCreatedLogs = (receipts) => logDecoder.decodePairCreatedLogs(receipts);
export const addCustomABI = (abi, name) => logDecoder.addABI(abi, name);

// Export event signatures
export const getEventSignature = (eventType) => EVENT_SIGNATURES[eventType.toUpperCase()];

// Export the class for advanced usage
export { LogDecoder };
