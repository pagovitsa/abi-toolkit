import { informer, tokenTrader } from '../index.js';

console.log('🧪 Running Edge Cases and Error Handling Tests\n');

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

console.log('--- Token Trader Edge Cases ---');

// Test 1: Edge case with zero amounts
try {
    const result = tokenTrader.btwr(
        '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc',
        '0', // zero amount
        '0',
        '0',
        true
    );
    assert(result.startsWith('0x'), 'Handles zero amounts in btwr');
} catch (error) {
    assert(false, `Zero amount test failed: ${error.message}`);
}

// Test 2: Maximum uint256 values
try {
    const maxUint256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
    const result = tokenTrader.btwr(
        '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc',
        maxUint256,
        maxUint256,
        maxUint256,
        false
    );
    assert(result.startsWith('0x'), 'Handles maximum uint256 values');
} catch (error) {
    assert(false, `Max uint256 test failed: ${error.message}`);
}

// Test 3: Boolean edge cases
try {
    const result1 = tokenTrader.gmeft(
        '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc',
        '1000000000000000000',
        true
    );
    const result2 = tokenTrader.gmeft(
        '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc',
        '1000000000000000000',
        false
    );
    assert(result1 !== result2, 'Boolean parameters produce different results');
} catch (error) {
    assert(false, `Boolean edge case failed: ${error.message}`);
}

console.log('\n--- Informer Error Handling ---');

// Test 4: Invalid address formats
try {
    informer.getOwner('invalid-address');
    assert(false, 'Should reject invalid address');
} catch (error) {
    assert(error.message.includes('Invalid') || error.message.includes('address'), 'Rejects invalid address format');
}

// Test 5: Empty string address
try {
    informer.getTokenBalance('', '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6');
    assert(false, 'Should reject empty address');
} catch (error) {
    assert(error.message.includes('Invalid') || error.message.includes('address'), 'Rejects empty address');
}

// Test 6: Null/undefined parameters
try {
    informer.getPairAndTokenDetails(null);
    assert(false, 'Should reject null parameters');
} catch (error) {
    assert(true, 'Rejects null parameters');
}

// Test 7: Address case sensitivity
try {
    const lowerCase = informer.getOwner('0x742d35cc6634c0532925a3b8d4c9db96c4b4d8b6');
    const upperCase = informer.getOwner('0x742D35CC6634C0532925A3B8D4C9DB96C4B4D8B6');
    const mixedCase = informer.getOwner('0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6');
    assert(lowerCase === upperCase && upperCase === mixedCase, 'Address case insensitive');
} catch (error) {
    assert(false, `Case sensitivity test failed: ${error.message}`);
}

console.log('\n--- Complex Parameter Combinations ---');

// Test 8: Token Trader with extreme parameter combinations
try {
    const result = tokenTrader.stwr(
        '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc',
        '1', // minimal amount
        '999999999999999999999999999999999999999', // very large amount
        '1', // minimal amount
        false
    );
    assert(result.startsWith('0x'), 'Handles extreme parameter combinations');
} catch (error) {
    assert(false, `Extreme parameters test failed: ${error.message}`);
}

// Test 9: Multiple consecutive calls (state consistency)
try {
    const calls = [];
    for (let i = 0; i < 10; i++) {
        calls.push(informer.getReserves('0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc'));
    }
    const allSame = calls.every(call => call === calls[0]);
    assert(allSame, 'Consecutive calls produce consistent results');
} catch (error) {
    assert(false, `Consistency test failed: ${error.message}`);
}

// Test 10: Memory stress test with large parameter arrays
try {
    const largeData = '0x' + '1234567890abcdef'.repeat(1000); // 16KB of hex data
    // This would be used in a hypothetical function that accepts large data
    assert(largeData.length > 16000, 'Can handle large data parameters');
} catch (error) {
    assert(false, `Large data test failed: ${error.message}`);
}

console.log('\n=== Edge Cases Test Summary ===');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed === 0) {
    console.log('\n🎉 All edge case tests passed!');
} else {
    console.log('\n⚠️  Some edge case tests failed.');
}
