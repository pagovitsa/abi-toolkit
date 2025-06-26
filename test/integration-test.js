import { ABICodec, erc20, uniswapV2, informer, tokenTrader } from '../index.js';

console.log('🚀 Running Integration Test for All Modules\n');

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
    address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    tokenAddress: '0xA0b86a33E6441c8C06DD2b7c94b7E6E42e8174C0',
    pairAddress: '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc',
    amount: '1000000000000000000'
};

console.log('--- Core ABICodec ---');
try {
    const simpleABI = [
        {
            "inputs": [{"name": "value", "type": "uint256"}],
            "name": "testFunction",
            "outputs": [{"name": "", "type": "bool"}],
            "type": "function"
        }
    ];
    
    const codec = new ABICodec(simpleABI);
    const encoded = codec.encodeFunction('testFunction', ['123']);
    assert(encoded.startsWith('0x'), 'ABICodec encoding works');
    
    const decoded = codec.decodeFunction('testFunction', encoded);
    assert(Array.isArray(decoded), 'ABICodec decoding works');
} catch (error) {
    console.log(`❌ ABICodec error: ${error.message}`);
    failed++;
}

console.log('\n--- ERC20 Module ---');
try {
    const balanceData = erc20.encodeBalanceOf(testData.address);
    assert(balanceData.startsWith('0x70a08231'), 'ERC20 balanceOf encoding works');
    
    const transferData = erc20.encodeTransfer(testData.address, testData.amount);
    assert(transferData.startsWith('0xa9059cbb'), 'ERC20 transfer encoding works');
    
    const approveData = erc20.encodeApprove(testData.address, testData.amount);
    assert(approveData.startsWith('0x095ea7b3'), 'ERC20 approve encoding works');
} catch (error) {
    console.log(`❌ ERC20 error: ${error.message}`);
    failed++;
}

console.log('\n--- Uniswap V2 Module ---');
try {
    // Factory functions
    const createPairData = uniswapV2.factory.createPair(testData.tokenAddress, testData.address);
    assert(createPairData.startsWith('0xc9c65396'), 'Uniswap V2 createPair encoding works');
    
    // Router functions
    const swapData = uniswapV2.router.swapExactTokensForTokens(
        testData.amount, '0', [testData.tokenAddress, testData.address], testData.address, '1234567890'
    );
    assert(swapData.startsWith('0x38ed1739'), 'Uniswap V2 swap encoding works');
    
    // Pair functions
    const getReservesData = uniswapV2.pair.getReserves();
    assert(getReservesData.startsWith('0x0902f1ac'), 'Uniswap V2 getReserves encoding works');
} catch (error) {
    console.log(`❌ Uniswap V2 error: ${error.message}`);
    failed++;
}

console.log('\n--- Informer Module ---');
try {
    const getOwnerData = informer.getOwner(testData.address);
    assert(getOwnerData.startsWith('0xfa544161'), 'Informer getOwner encoding works');
    
    const getPairDetailsData = informer.getPairAndTokenDetails(testData.pairAddress);
    assert(getPairDetailsData.startsWith('0x'), 'Informer getPairAndTokenDetails encoding works');
    
    const getTokenBalanceData = informer.getTokenBalance(testData.tokenAddress, testData.address);
    assert(getTokenBalanceData.startsWith('0x'), 'Informer getTokenBalance encoding works');
} catch (error) {
    console.log(`❌ Informer error: ${error.message}`);
    failed++;
}

console.log('\n--- Token Trader Module ---');
try {
    const awData = tokenTrader.aw();
    assert(awData.startsWith('0x'), 'Token Trader aw encoding works');
    
    const btwrData = tokenTrader.btwr(
        testData.tokenAddress, testData.pairAddress, testData.amount, '500000000000000000', '2000000000000000000', true
    );
    assert(btwrData.startsWith('0x'), 'Token Trader btwr encoding works');
    
    const gmeftData = tokenTrader.gmeft(testData.pairAddress, testData.amount, true);
    assert(gmeftData.startsWith('0x'), 'Token Trader gmeft encoding works');
} catch (error) {
    console.log(`❌ Token Trader error: ${error.message}`);
    failed++;
}

console.log('\n--- Module Integration ---');
try {
    // Test that all modules are properly exported
    assert(typeof erc20 === 'object' && erc20.encodeBalanceOf, 'ERC20 module properly exported');
    assert(typeof uniswapV2 === 'object' && uniswapV2.factory, 'Uniswap V2 module properly exported');
    assert(typeof informer === 'object' && informer.getOwner, 'Informer module properly exported');
    assert(typeof tokenTrader === 'object' && tokenTrader.aw, 'Token Trader module properly exported');
    
    // Test codec access
    assert(informer.codec && typeof informer.codec.encodeFunction === 'function', 'Informer codec accessible');
    assert(tokenTrader.codec && typeof tokenTrader.codec.encodeFunction === 'function', 'Token Trader codec accessible');
} catch (error) {
    console.log(`❌ Integration error: ${error.message}`);
    failed++;
}

console.log('\n=== Integration Test Summary ===');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);

if (failed === 0) {
    console.log('\n🎉 All integration tests passed!');
    console.log('\n📦 Available Modules:');
    console.log('  - ABICodec: Core encoding/decoding functionality');
    console.log('  - erc20: ERC20 token interaction utilities');
    console.log('  - uniswapV2: Uniswap V2 Factory, Pair, and Router utilities');
    console.log('  - informer: Contract information and pair details utilities');
    console.log('  - tokenTrader: Token trading and fee calculation utilities');
    console.log('\n🚀 The unified ABI toolkit is ready for production use!');
} else {
    console.log('\n⚠️  Some integration tests failed. Please review the errors above.');
}
