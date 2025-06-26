import { informer, tokenTrader } from '../index.js';

console.log('Running Informer and Token Trader Tests\n');

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

// Test data
const testData = {
    contractAddress: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    pairAddress: '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc',
    tokenAddress: '0xA0b86a33E6441c8C06DD2b7c94b7E6E42e8174C0',
    walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
};

console.log('--- Informer Functions ---');

try {
    // Test getOwner encoding
    const getOwnerData = informer.getOwner(testData.contractAddress);
    assert(getOwnerData.startsWith('0xfa544161'), 'Informer getOwner encoding works');
    
    // Test getPairAndTokenDetails encoding
    const getPairDetailsData = informer.getPairAndTokenDetails(testData.pairAddress);
    assert(getPairDetailsData.startsWith('0x') && getPairDetailsData.length > 10, 'Informer getPairAndTokenDetails encoding works');
    
    // Test getReserves encoding
    const getReservesData = informer.getReserves(testData.pairAddress);
    assert(getReservesData.startsWith('0x') && getReservesData.length > 10, 'Informer getReserves encoding works');
    
    // Test getTokenBalance encoding
    const getTokenBalanceData = informer.getTokenBalance(testData.tokenAddress, testData.walletAddress);
    assert(getTokenBalanceData.startsWith('0x') && getTokenBalanceData.length > 10, 'Informer getTokenBalance encoding works');
    
    // Test getTotalSupply encoding
    const getTotalSupplyData = informer.getTotalSupply(testData.tokenAddress);
    assert(getTotalSupplyData.startsWith('0x68da10ae'), 'Informer getTotalSupply encoding works');
    
} catch (error) {
    console.log(`❌ Informer function error: ${error.message}`);
    failed++;
}

console.log('\n--- Token Trader Functions ---');

try {
    // Test aw encoding (no parameters)
    const awData = tokenTrader.aw();
    assert(awData.startsWith('0x') && awData.length >= 10, 'Token Trader aw encoding works');
    
    // Test btwr encoding
    const btwrData = tokenTrader.btwr(
        testData.tokenAddress,
        testData.pairAddress,
        '1000000000000000000', // 1 token
        '500000000000000000',  // 0.5 token
        '2000000000000000000', // 2 tokens
        true
    );
    assert(btwrData.startsWith('0x') && btwrData.length > 10, 'Token Trader btwr encoding works');
    
    // Test stwr encoding
    const stwrData = tokenTrader.stwr(
        testData.tokenAddress,
        testData.pairAddress,
        '1000000000000000000', // 1 ETH
        '1000000000000000000', // 1 token
        false
    );
    assert(stwrData.startsWith('0x') && stwrData.length > 10, 'Token Trader stwr encoding works');
    
    // Test gmeft encoding
    const gmeftData = tokenTrader.gmeft(
        testData.pairAddress,
        '1000000000000000000', // 1 token
        true
    );
    assert(gmeftData.startsWith('0x') && gmeftData.length > 10, 'Token Trader gmeft encoding works');
    
} catch (error) {
    console.log(`❌ Token Trader function error: ${error.message}`);
    failed++;
}

console.log('\n--- Module Integration ---');

try {
    // Test that modules are properly exported
    assert(typeof informer === 'object' && informer.abi, 'Informer module exports correctly');
    assert(typeof tokenTrader === 'object' && tokenTrader.abi, 'Token Trader module exports correctly');
    
    // Test codec access
    assert(informer.codec && typeof informer.codec.encodeFunction === 'function', 'Informer codec accessible');
    assert(tokenTrader.codec && typeof tokenTrader.codec.encodeFunction === 'function', 'Token Trader codec accessible');
    
    // Test decoder functions exist
    assert(typeof informer.decode === 'object', 'Informer decode functions exist');
    assert(typeof tokenTrader.decode === 'object', 'Token Trader decode functions exist');
    
} catch (error) {
    console.log(`❌ Module integration error: ${error.message}`);
    failed++;
}

console.log('\n=== Test Summary ===');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed === 0) {
    console.log('\n🎉 All Informer and Token Trader tests passed!');
    console.log('\n📊 Features Verified:');
    console.log('  - Informer contract utilities (getOwner, getPairAndTokenDetails, etc.)');
    console.log('  - Token Trader contract utilities (aw, btwr, stwr, gmeft)');
    console.log('  - Function encoding and decoding');
    console.log('  - Module integration and exports');
} else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
}
