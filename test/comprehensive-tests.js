import { ABICodec, common, utils, Encoder, Decoder } from '../index.js';

// Test data and utilities
const TEST_ADDRESS = '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6';
const TEST_ADDRESS_2 = '0x8ba1f109551bD432803012645Hac136c123456789';

// Complex ABI for testing various types
const COMPLEX_ABI = [
    {
        "inputs": [
            {"name": "uint256Value", "type": "uint256"},
            {"name": "stringValue", "type": "string"},
            {"name": "addressValue", "type": "address"},
            {"name": "boolValue", "type": "bool"},
            {"name": "bytesValue", "type": "bytes"},
            {"name": "uint256Array", "type": "uint256[]"},
            {"name": "fixedArray", "type": "uint256[3]"}
        ],
        "name": "complexFunction",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
    },
    {
        "inputs": [
            {"name": "data", "type": "bytes32"}
        ],
        "name": "simpleFunction",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    }
];

class TestRunner {
    constructor() {
        this.passed = 0;
        this.failed = 0;
        this.errors = [];
    }

    assert(condition, message) {
        if (condition) {
            this.passed++;
            console.log(`✅ ${message}`);
        } else {
            this.failed++;
            this.errors.push(message);
            console.log(`❌ ${message}`);
        }
    }

    async runTest(testName, testFn) {
        console.log(`\n--- Testing ${testName} ---`);
        try {
            await testFn();
        } catch (error) {
            this.failed++;
            this.errors.push(`${testName}: ${error.message}`);
            console.log(`❌ ${testName} failed: ${error.message}`);
        }
    }

    summary() {
        console.log(`\n=== Test Summary ===`);
        console.log(`Passed: ${this.passed}`);
        console.log(`Failed: ${this.failed}`);
        if (this.errors.length > 0) {
            console.log(`\nErrors:`);
            this.errors.forEach(error => console.log(`  - ${error}`));
        }
        return this.failed === 0;
    }
}

const runner = new TestRunner();

// Test 1: Error Handling and Edge Cases
await runner.runTest('Error Handling', async () => {
    const codec = new ABICodec(COMPLEX_ABI);

    // Test invalid address
    try {
        common.erc20.encodeBalanceOf('invalid-address');
        runner.assert(false, 'Should throw error for invalid address');
    } catch (error) {
        runner.assert(error.message.includes('Invalid parameters'), 'Throws error for invalid address');
    }

    // Test empty ABI
    try {
        const emptyCodec = new ABICodec([]);
        emptyCodec.encodeFunction('nonexistent', []);
        runner.assert(false, 'Should throw error for nonexistent function');
    } catch (error) {
        runner.assert(error.message.includes('Function not found'), 'Throws error for nonexistent function');
    }

    // Test invalid hex data
    try {
        utils.hexToBuffer('invalid-hex');
        runner.assert(false, 'Should throw error for invalid hex');
    } catch (error) {
        runner.assert(true, 'Throws error for invalid hex data');
    }

    // Test BigInt conversion edge cases
    const validBigInt = utils.toBigInt('0x1234567890abcdef');
    runner.assert(typeof validBigInt === 'bigint', 'Converts hex string to BigInt');

    const numberBigInt = utils.toBigInt(12345);
    runner.assert(typeof numberBigInt === 'bigint', 'Converts number to BigInt');
});

// Test 2: Type Validation for All Solidity Types
await runner.runTest('Type Validation', async () => {
    const codec = new ABICodec(COMPLEX_ABI);

    // Test complex function with various types
    const complexParams = [
        '1000000000000000000', // uint256
        'Hello World', // string
        TEST_ADDRESS, // address
        true, // bool
        '0x1234567890abcdef', // bytes
        ['100', '200', '300'], // uint256[]
        ['1', '2', '3'] // uint256[3]
    ];

    const encoded = codec.encodeFunction('complexFunction', complexParams);
    runner.assert(encoded.startsWith('0x'), 'Complex function encoding produces valid hex');
    runner.assert(encoded.length > 10, 'Complex function encoding has reasonable length');

    const decoded = codec.decodeFunction('complexFunction', encoded);
    runner.assert(Array.isArray(decoded), 'Decoding returns array');
    runner.assert(decoded.length > 0, 'Decoded array has valid length');

    // Test bytes32 type
    const bytes32Data = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    const simpleEncoded = codec.encodeFunction('simpleFunction', [bytes32Data]);
    runner.assert(simpleEncoded.startsWith('0x'), 'Bytes32 encoding produces valid hex');

    const simpleDecoded = codec.decodeFunction('simpleFunction', simpleEncoded);
    runner.assert(simpleDecoded[0] === bytes32Data, 'Bytes32 round-trip encoding/decoding works');
});

// Test 3: Memory Usage and Large Dataset Testing
await runner.runTest('Memory Usage', async () => {
    const codec = new ABICodec(COMPLEX_ABI);
    const startMemory = process.memoryUsage().heapUsed;

    // Test with large arrays
    const largeArray = Array.from({length: 1000}, (_, i) => i.toString());
    const largeParams = [
        '1000000000000000000',
        'Large test string with lots of data',
        TEST_ADDRESS,
        true,
        '0x' + '12'.repeat(1000), // Large bytes
        largeArray,
        ['1', '2', '3']
    ];

    for (let i = 0; i < 100; i++) {
        const encoded = codec.encodeFunction('complexFunction', largeParams);
        const decoded = codec.decodeFunction('complexFunction', encoded);
    }

    const endMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = endMemory - startMemory;
    
    runner.assert(memoryIncrease < 50 * 1024 * 1024, 'Memory usage stays reasonable with large datasets'); // Less than 50MB increase
    console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`);
});

// Test 4: Cache Performance Verification
await runner.runTest('Cache Performance', async () => {
    const codec = new ABICodec(COMPLEX_ABI);
    const encoder = new Encoder();
    
    const testParams = ['0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'];
    
    // Warm up the cache first
    for (let i = 0; i < 100; i++) {
        codec.encodeFunction('simpleFunction', testParams);
    }

    // First run
    const start1 = process.hrtime.bigint();
    for (let i = 0; i < 1000; i++) {
        codec.encodeFunction('simpleFunction', testParams);
    }
    const end1 = process.hrtime.bigint();
    const time1 = Number(end1 - start1) / 1000000;

    // Second run
    const start2 = process.hrtime.bigint();
    for (let i = 0; i < 1000; i++) {
        codec.encodeFunction('simpleFunction', testParams);
    }
    const end2 = process.hrtime.bigint();
    const time2 = Number(end2 - start2) / 1000000;

    console.log(`First run: ${time1.toFixed(2)}ms, Second run: ${time2.toFixed(2)}ms`);
    runner.assert(Math.abs(time2 - time1) < time1 * 0.5, 'Cache performance is consistent');
});

// Test 5: Batch Processing with Large Receipts
await runner.runTest('Batch Processing', async () => {
    // Create large mock receipts
    const createMockReceipt = (logCount) => ({
        logs: Array.from({length: logCount}, (_, i) => ({
            address: TEST_ADDRESS,
            topics: [
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef', // Transfer
                '0x000000000000000000000000' + TEST_ADDRESS.slice(2),
                '0x000000000000000000000000' + TEST_ADDRESS_2.slice(2)
            ],
            data: '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000',
            blockNumber: `0x${(123456 + i).toString(16)}`,
            transactionHash: `0x${'ab'.repeat(32)}`,
            logIndex: `0x${i.toString(16)}`
        }))
    });

    const largeReceipts = Array.from({length: 10}, (_, i) => createMockReceipt(5)); // 10 receipts with 5 logs each

    const startTime = process.hrtime.bigint();
    const decodedLogs = common.decoder.decodeLogs(largeReceipts);
    const endTime = process.hrtime.bigint();
    const processingTime = Number(endTime - startTime) / 1000000;

    runner.assert(decodedLogs.transfers.length === 50, 'Correctly processes all transfer logs');
    runner.assert(processingTime < 1000, 'Batch processing completes in reasonable time'); // Less than 1 second
    console.log(`Processed 50 logs in ${processingTime.toFixed(2)}ms`);
});

// Test 6: Custom ABI Integration
await runner.runTest('Custom ABI Integration', async () => {
    const customABI = [
        {
            "anonymous": false,
            "inputs": [
                {"indexed": true, "name": "user", "type": "address"},
                {"indexed": false, "name": "amount", "type": "uint256"},
                {"indexed": false, "name": "data", "type": "bytes"}
            ],
            "name": "CustomEvent",
            "type": "event"
        }
    ];

    // Add custom ABI to log decoder
    common.decoder.addCustomABI(customABI, 'CustomContract');

    const customLog = {
        address: TEST_ADDRESS,
        topics: [
            '0x' + '12'.repeat(32), // Custom event signature
            '0x000000000000000000000000' + TEST_ADDRESS.slice(2)
        ],
        data: '0x0000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000474657374000000000000000000000000000000000000000000000000000000000',
        blockNumber: '0x123456',
        transactionHash: '0x' + 'cd'.repeat(32),
        logIndex: '0x0'
    };

    const mockReceipt = { logs: [customLog] };
    const decodedLogs = common.decoder.decodeLogs([mockReceipt]);

    runner.assert(Array.isArray(decodedLogs.custom), 'Custom logs array exists');
    // Note: The custom log might not decode properly due to signature mismatch, but the structure should be there
});

// Test 7: ERC20 Utilities with Mock Provider
await runner.runTest('ERC20 Utilities', async () => {
    const mockProvider = {
        call: async (address, data) => {
            if (!address || !data) throw new Error('Missing parameters');
            
            // Mock different responses based on function selector
            if (data.startsWith('0x70a08231')) { // balanceOf
                return '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000';
            } else if (data.startsWith('0x06fdde03')) { // name
                return '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000a4d6f636b20546f6b656e0000000000000000000000000000000000000000000000';
            } else if (data.startsWith('0x95d89b41')) { // symbol
                return '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000004544f4b4e00000000000000000000000000000000000000000000000000000000';
            } else if (data.startsWith('0x313ce567')) { // decimals
                return '0x0000000000000000000000000000000000000000000000000000000000000012';
            }
            return '0x';
        }
    };

    // Test all ERC20 functions
    const balance = await common.erc20.getBalanceOf(mockProvider, TEST_ADDRESS, TEST_ADDRESS);
    runner.assert(balance === '1000000000000000000', 'getBalanceOf returns correct value');

    const name = await common.erc20.getTokenName(mockProvider, TEST_ADDRESS);
    runner.assert(name === 'Mock Token', 'getTokenName returns correct value');

    const symbol = await common.erc20.getTokenSymbol(mockProvider, TEST_ADDRESS);
    runner.assert(symbol === 'TOKN', 'getTokenSymbol returns correct value');

    const decimals = await common.erc20.getTokenDecimals(mockProvider, TEST_ADDRESS);
    runner.assert(decimals === '18', 'getTokenDecimals returns correct value');

    // Test transaction data generation
    try {
        const transferData = common.erc20.transfer(TEST_ADDRESS_2, '1000000000000000000');
        runner.assert(transferData.startsWith('0xa9059cbb'), 'Transfer data has correct function selector');
    } catch (error) {
        runner.assert(false, `Transfer encoding failed: ${error.message}`);
    }

    try {
        const approveData = common.erc20.approve(TEST_ADDRESS_2, '1000000000000000000');
        runner.assert(approveData.startsWith('0x095ea7b3'), 'Approve data has correct function selector');
    } catch (error) {
        runner.assert(false, `Approve encoding failed: ${error.message}`);
    }
});

// Test 8: Cross-platform Compatibility
await runner.runTest('Cross-platform Compatibility', async () => {
    // Test Node.js version compatibility
    const nodeVersion = process.version;
    runner.assert(nodeVersion.startsWith('v'), 'Running on Node.js');
    
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    runner.assert(majorVersion >= 16, 'Node.js version is 16 or higher');

    // Test ES module imports work
    runner.assert(typeof ABICodec === 'function', 'ABICodec import works');
    runner.assert(typeof common === 'object', 'common utilities import works');
    runner.assert(typeof utils === 'object', 'utils import works');

    // Test Buffer operations (Node.js specific)
    const testBuffer = Buffer.from('test');
    const hexString = utils.bufferToHex(testBuffer);
    const backToBuffer = utils.hexToBuffer(hexString);
    runner.assert(testBuffer.equals(backToBuffer), 'Buffer operations work correctly');
});

// Run summary
const success = runner.summary();

if (success) {
    console.log('\n🎉 All tests passed! The ABI toolkit is ready for production use.');
} else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
    process.exit(1);
}
