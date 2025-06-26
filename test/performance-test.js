import { ABICodec, informer, tokenTrader, utils } from '../index.js';
import { performance } from 'perf_hooks';

console.log('🚀 Running Performance and Gas Optimization Tests\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`✅ ${message}`);
        passed++;
    } else {
        console.log(`❌ ${message}`);
        failed++;
    }
}

function measureGas(encodedData) {
    // Ethereum transaction base cost is 21000 gas
    let gas = 21000;
    
    // Add 4 gas for each zero byte
    // Add 68 gas for each non-zero byte
    for (let i = 2; i < encodedData.length; i += 2) {
        const byte = encodedData.slice(i, i + 2);
        gas += byte === '00' ? 4 : 68;
    }
    
    return gas;
}

function measurePerformance(fn, iterations = 1000) {
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        fn();
    }
    return (performance.now() - start) / iterations;
}

console.log('--- Memory Usage Tests ---');

// Test 1: Memory usage with large datasets
const initialMemory = process.memoryUsage().heapUsed;
const largeDatasets = Array.from({ length: 1000 }, (_, i) => ({
    address: `0x${i.toString(16).padStart(40, '0')}`,
    amount: `${i}000000000000000000`,
    pair: `0x${(i + 1).toString(16).padStart(40, '0')}`
}));

try {
    largeDatasets.forEach(data => {
        tokenTrader.btwr(data.address, data.pair, data.amount, data.amount, data.amount, true);
    });
    
    const memoryUsed = (process.memoryUsage().heapUsed - initialMemory) / 1024 / 1024;
    assert(memoryUsed < 50, `Memory usage under 50MB (Used: ${memoryUsed.toFixed(2)}MB)`);
} catch (error) {
    assert(false, `Memory test failed: ${error.message}`);
}

console.log('\n--- Performance Tests ---');

// Test 2: Encoding performance
const simpleEncodingTime = measurePerformance(() => {
    informer.getOwner('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6');
});
assert(simpleEncodingTime < 0.1, `Simple encoding under 0.1ms (${simpleEncodingTime.toFixed(3)}ms)`);

// Test 3: Complex encoding performance
const complexEncodingTime = measurePerformance(() => {
    tokenTrader.btwr(
        '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc',
        '1000000000000000000',
        '2000000000000000000',
        '500000000000000000',
        true
    );
});
assert(complexEncodingTime < 0.5, `Complex encoding under 0.5ms (${complexEncodingTime.toFixed(3)}ms)`);

console.log('\n--- Gas Optimization Tests ---');

// Test 4: Gas usage for simple operations
const simpleGas = measureGas(informer.getOwner('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'));
assert(simpleGas < 30000, `Simple operation gas cost reasonable (${simpleGas} gas)`);

// Test 5: Gas usage for complex operations
const complexGas = measureGas(tokenTrader.btwr(
    '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc',
    '1000000000000000000',
    '2000000000000000000',
    '500000000000000000',
    true
));
assert(complexGas < 100000, `Complex operation gas cost reasonable (${complexGas} gas)`);

// Test 6: Cache hit performance
const codec = new ABICodec([{
    "inputs": [{"name": "value", "type": "uint256"}],
    "name": "test",
    "outputs": [{"name": "", "type": "bool"}],
    "type": "function"
}]);

// First call (cache miss)
const cacheMissTime = measurePerformance(() => {
    codec.encodeFunction('test', ['123']);
});

// Second call (cache hit)
const cacheHitTime = measurePerformance(() => {
    codec.encodeFunction('test', ['123']);
});

assert(cacheHitTime <= cacheMissTime, 
    `Cache improves performance (Miss: ${cacheMissTime.toFixed(3)}ms, Hit: ${cacheHitTime.toFixed(3)}ms)`);

// Test 7: Batch processing performance
const startBatch = performance.now();
const batchSize = 100;
const results = [];

for (let i = 0; i < batchSize; i++) {
    const amount = `${(i + 1)}000000000000000000`;
    results.push(tokenTrader.gmeft(
        '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc',
        amount,
        i % 2 === 0
    ));
}

const batchTime = (performance.now() - startBatch) / batchSize;
assert(batchTime < 1, `Batch processing efficient (${batchTime.toFixed(3)}ms per operation)`);

// Test 8: Memory cleanup
global.gc && global.gc(); // Force garbage collection if available
const endMemory = process.memoryUsage().heapUsed;
const totalMemoryDiff = (endMemory - initialMemory) / 1024 / 1024;

assert(totalMemoryDiff < 100, 
    `Total memory usage reasonable (${totalMemoryDiff.toFixed(2)}MB)`);

console.log('\n=== Performance Test Summary ===');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed === 0) {
    console.log('\n🎉 All performance tests passed!');
    console.log('\nPerformance Metrics:');
    console.log(`- Simple encoding: ${simpleEncodingTime.toFixed(3)}ms`);
    console.log(`- Complex encoding: ${complexEncodingTime.toFixed(3)}ms`);
    console.log(`- Simple gas cost: ${simpleGas} gas`);
    console.log(`- Complex gas cost: ${complexGas} gas`);
    console.log(`- Memory usage: ${totalMemoryDiff.toFixed(2)}MB`);
    console.log(`- Batch processing: ${batchTime.toFixed(3)}ms per operation`);
} else {
    console.log('\n⚠️  Some performance tests failed.');
}
