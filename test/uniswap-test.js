import { uniswapV2 } from '../lib/common/uniswap/index.js';

console.log('Running Uniswap V2 Integration Tests\n');

let passed = 0;
let failed = 0;
const errors = [];

function assert(condition, message) {
    if (condition) {
        passed++;
        console.log(`✅ ${message}`);
    } else {
        failed++;
        errors.push(message);
        console.log(`❌ ${message}`);
    }
}

// Test data
const testData = {
    tokenA: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
    tokenB: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
    recipient: '0x742d35Cc6634C0532925a3b844C9db96C4b4d8b6',
    amount: '1000000000000000000', // 1 ETH/token
    deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
    path: [
        '0x6b175474e89094c44da98b954eedeac495271d0f',
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
    ]
};

console.log('--- Factory Functions ---');
try {
    // Test getPair encoding
    const getPairData = uniswapV2.factory.getPair(testData.tokenA, testData.tokenB);
    assert(getPairData.startsWith('0xe6a43905'), 'Factory getPair encoding works');
    
    // Test createPair encoding
    const createPairData = uniswapV2.factory.createPair(testData.tokenA, testData.tokenB);
    assert(createPairData.startsWith('0xc9c65396'), 'Factory createPair encoding works');
    
    // Test allPairs encoding
    const allPairsData = uniswapV2.factory.allPairs('0');
    assert(allPairsData.startsWith('0x1e3dd18b'), 'Factory allPairs encoding works');
} catch (error) {
    console.error('Factory test error:', error.message);
    assert(false, 'Factory functions');
}

console.log('\n--- Pair Functions ---');
try {
    // Test getReserves encoding
    const getReservesData = uniswapV2.pair.getReserves();
    assert(getReservesData.startsWith('0x0902f1ac'), 'Pair getReserves encoding works');
    
    // Test token0/token1 encoding
    const token0Data = uniswapV2.pair.token0();
    const token1Data = uniswapV2.pair.token1();
    assert(token0Data.startsWith('0x0dfe1681'), 'Pair token0 encoding works');
    assert(token1Data.startsWith('0xd21220a7'), 'Pair token1 encoding works');
    
    // Test swap encoding
    const swapData = uniswapV2.pair.swap(
        testData.amount,
        '0',
        testData.recipient,
        '0x'
    );
    assert(swapData.startsWith('0x022c0d9f'), 'Pair swap encoding works');
} catch (error) {
    console.error('Pair test error:', error.message);
    assert(false, 'Pair functions');
}

console.log('\n--- Router Functions ---');
try {
    // Test getAmountsOut encoding
    const getAmountsOutData = uniswapV2.router.getAmountsOut(
        testData.amount,
        testData.path
    );
    assert(getAmountsOutData.startsWith('0xd06ca61f'), 'Router getAmountsOut encoding works');
    
    // Test swapExactTokensForTokens encoding
    const swapExactTokensData = uniswapV2.router.swapExactTokensForTokens(
        testData.amount,
        '0',
        testData.path,
        testData.recipient,
        testData.deadline
    );
    assert(swapExactTokensData.startsWith('0x38ed1739'), 'Router swapExactTokensForTokens encoding works');
    
    // Test addLiquidity encoding
    const addLiquidityData = uniswapV2.router.addLiquidity(
        testData.tokenA,
        testData.tokenB,
        testData.amount,
        testData.amount,
        '0',
        '0',
        testData.recipient,
        testData.deadline
    );
    assert(addLiquidityData.startsWith('0xe8e33700'), 'Router addLiquidity encoding works');
} catch (error) {
    console.error('Router test error:', error.message);
    assert(false, 'Router functions');
}

console.log('\n--- Parameter Validation ---');
try {
    // Test invalid address validation
    let threw = false;
    try {
        uniswapV2.factory.getPair('invalid', testData.tokenB);
    } catch (e) {
        threw = true;
    }
    assert(threw, 'Invalid address validation works');
    
    // Test invalid amount validation
    threw = false;
    try {
        uniswapV2.router.swapExactTokensForTokens(
            'invalid',
            '0',
            testData.path,
            testData.recipient,
            testData.deadline
        );
    } catch (e) {
        threw = true;
    }
    assert(threw, 'Invalid amount validation works');
    
    // Test invalid path validation
    threw = false;
    try {
        uniswapV2.router.swapExactTokensForTokens(
            testData.amount,
            '0',
            ['invalid'],
            testData.recipient,
            testData.deadline
        );
    } catch (e) {
        threw = true;
    }
    assert(threw, 'Invalid path validation works');
} catch (error) {
    console.error('Validation test error:', error.message);
    assert(false, 'Parameter validation');
}

// Summary
console.log('\n=== Test Summary ===');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed > 0) {
    console.log('\nErrors:');
    errors.forEach(error => console.log(`  - ${error}`));
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
} else {
    console.log('\n🎉 All Uniswap V2 integration tests passed!');
    console.log('\n📊 Features Verified:');
    console.log('  - Factory functions (getPair, createPair, etc.)');
    console.log('  - Pair functions (getReserves, swap, etc.)');
    console.log('  - Router functions (getAmountsOut, swapExactTokensForTokens, etc.)');
    console.log('  - Parameter validation');
    console.log('  - Function selector generation');
    console.log('  - Error handling');
}
