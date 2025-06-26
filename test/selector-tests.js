import { selectorUtils, utils, ABICodec } from '../index.js';

// Test data
const TEST_FUNCTIONS = [
    {
        "inputs": [
            {"name": "to", "type": "address"},
            {"name": "amount", "type": "uint256"}
        ],
        "name": "transfer",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
    },
    {
        "inputs": [
            {"name": "spender", "type": "address"},
            {"name": "amount", "type": "uint256"}
        ],
        "name": "approve",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
    },
    {
        "inputs": [
            {"name": "owner", "type": "address"}
        ],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "type": "function"
    }
];

// Known selectors for validation
const KNOWN_SELECTORS = {
    'transfer(address,uint256)': '0xa9059cbb',
    'approve(address,uint256)': '0x095ea7b3',
    'balanceOf(address)': '0x70a08231',
    'name()': '0x06fdde03',
    'symbol()': '0x95d89b41',
    'decimals()': '0x313ce567',
    'totalSupply()': '0x18160ddd'
};

class SelectorTestRunner {
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
        console.log(`\n=== Selector Test Summary ===`);
        console.log(`Passed: ${this.passed}`);
        console.log(`Failed: ${this.failed}`);
        if (this.errors.length > 0) {
            console.log(`\nErrors:`);
            this.errors.forEach(error => console.log(`  - ${error}`));
        }
        return this.failed === 0;
    }
}

const runner = new SelectorTestRunner();

// Test 1: Function Selector from Signature
await runner.runTest('Function Selector from Signature', async () => {
    // Test known ERC20 function selectors
    for (const [signature, expectedSelector] of Object.entries(KNOWN_SELECTORS)) {
        const selector = selectorUtils.getFunctionSelectorFromSignature(signature);
        runner.assert(
            selector === expectedSelector,
            `${signature} -> ${selector} (expected: ${expectedSelector})`
        );
    }

    // Test complex function signatures
    const complexSignature = 'swapExactTokensForTokens(uint256,uint256,address[],address,uint256)';
    const complexSelector = selectorUtils.getFunctionSelectorFromSignature(complexSignature);
    runner.assert(
        complexSelector === '0x38ed1739',
        `Complex signature generates correct selector: ${complexSelector}`
    );

    // Test function with no parameters
    const noParamsSignature = 'pause()';
    const noParamsSelector = selectorUtils.getFunctionSelectorFromSignature(noParamsSignature);
    runner.assert(
        selectorUtils.validateFunctionSelector(noParamsSelector),
        `No-params function generates valid selector: ${noParamsSelector}`
    );
});

// Test 2: Error Handling for Invalid Signatures
await runner.runTest('Invalid Signature Error Handling', async () => {
    // Test invalid signature formats
    const invalidSignatures = [
        'invalidSignature',
        '',
        null,
        undefined,
        123,
        'functionName',
        'functionName(',
        'functionName)',
    ];

    for (const invalidSig of invalidSignatures) {
        try {
            selectorUtils.getFunctionSelectorFromSignature(invalidSig);
            runner.assert(false, `Should throw error for invalid signature: ${invalidSig}`);
        } catch (error) {
            runner.assert(
                error.message.includes('signature') || error.message.includes('string'),
                `Throws appropriate error for invalid signature: ${invalidSig}`
            );
        }
    }
});

// Test 3: Batch Selector Generation
await runner.runTest('Batch Selector Generation', async () => {
    // Test with ABI function objects
    const selectors = selectorUtils.generateSelectors(TEST_FUNCTIONS);
    
    runner.assert(
        Object.keys(selectors).length === TEST_FUNCTIONS.length,
        `Generated selectors for all ${TEST_FUNCTIONS.length} functions`
    );

    // Verify specific selectors
    runner.assert(
        selectors['transfer(address,uint256)'] === '0xa9059cbb',
        'Transfer function selector is correct'
    );
    
    runner.assert(
        selectors['approve(address,uint256)'] === '0x095ea7b3',
        'Approve function selector is correct'
    );
    
    runner.assert(
        selectors['balanceOf(address)'] === '0x70a08231',
        'BalanceOf function selector is correct'
    );

    // Test with raw signatures
    const rawSignatures = [
        'transfer(address,uint256)',
        'approve(address,uint256)',
        'balanceOf(address)'
    ];
    
    const rawSelectors = selectorUtils.generateSelectors(rawSignatures);
    runner.assert(
        Object.keys(rawSelectors).length === rawSignatures.length,
        'Generated selectors for raw signatures'
    );

    // Test mixed input (ABI objects and raw signatures)
    const mixedInput = [
        TEST_FUNCTIONS[0], // ABI object
        'name()', // Raw signature
        TEST_FUNCTIONS[1] // ABI object
    ];
    
    const mixedSelectors = selectorUtils.generateSelectors(mixedInput);
    runner.assert(
        Object.keys(mixedSelectors).length === 3,
        'Generated selectors for mixed input types'
    );
});

// Test 4: Selector Validation
await runner.runTest('Selector Validation', async () => {
    // Test valid selectors
    const validSelectors = [
        '0xa9059cbb',
        '0x095ea7b3',
        '0x70a08231',
        '0x00000000',
        '0xffffffff'
    ];

    for (const selector of validSelectors) {
        runner.assert(
            selectorUtils.validateFunctionSelector(selector),
            `Valid selector passes validation: ${selector}`
        );
    }

    // Test invalid selectors
    const invalidSelectors = [
        'a9059cbb', // Missing 0x
        '0xa9059cb', // Too short
        '0xa9059cbbb', // Too long
        '0xg9059cbb', // Invalid hex character
        '', // Empty string
        null, // Null
        undefined, // Undefined
        123, // Number
        '0x', // Just 0x
        '0xA9059CBB' // Valid but test case sensitivity
    ];

    for (const selector of invalidSelectors) {
        const isValid = selectorUtils.validateFunctionSelector(selector);
        if (selector === '0xA9059CBB') {
            // This should actually be valid (case insensitive)
            runner.assert(isValid, `Case insensitive selector should be valid: ${selector}`);
        } else {
            runner.assert(
                !isValid,
                `Invalid selector fails validation: ${selector}`
            );
        }
    }
});

// Test 5: Integration with Existing Utils
await runner.runTest('Integration with Existing Utils', async () => {
    // Test that new utilities work with existing ones
    const testFunction = TEST_FUNCTIONS[0]; // transfer function
    
    // Get selector using existing utils
    const existingSelector = utils.getFunctionSelector(testFunction);
    
    // Get selector using new utilities via signature
    const signature = utils.getFunctionSignature(testFunction);
    const newSelector = selectorUtils.getFunctionSelectorFromSignature(signature);
    
    runner.assert(
        existingSelector === newSelector,
        `Existing and new utilities produce same selector: ${existingSelector} === ${newSelector}`
    );

    // Test with ABICodec integration
    const codec = new ABICodec(TEST_FUNCTIONS);
    const encodedData = codec.encodeFunction('transfer', ['0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6', '1000']);
    
    // Verify the encoded data starts with the correct selector
    const dataSelector = encodedData.slice(0, 10);
    runner.assert(
        dataSelector === existingSelector,
        `ABICodec uses correct selector: ${dataSelector}`
    );
    
    runner.assert(
        selectorUtils.validateFunctionSelector(dataSelector),
        'ABICodec generated selector passes validation'
    );
});

// Test 6: Performance and Caching
await runner.runTest('Performance and Caching', async () => {
    const testSignature = 'transfer(address,uint256)';
    const iterations = 10000;
    
    // Test performance of selector generation
    const start = process.hrtime.bigint();
    for (let i = 0; i < iterations; i++) {
        selectorUtils.getFunctionSelectorFromSignature(testSignature);
    }
    const end = process.hrtime.bigint();
    
    const timeMs = Number(end - start) / 1000000;
    runner.assert(
        timeMs < 1000, // Should complete in less than 1 second
        `Performance test: ${iterations} selector generations in ${timeMs.toFixed(2)}ms`
    );

    // Test batch generation performance
    const batchStart = process.hrtime.bigint();
    for (let i = 0; i < 1000; i++) {
        selectorUtils.generateSelectors(TEST_FUNCTIONS);
    }
    const batchEnd = process.hrtime.bigint();
    
    const batchTimeMs = Number(batchEnd - batchStart) / 1000000;
    runner.assert(
        batchTimeMs < 500, // Should complete in less than 500ms
        `Batch generation performance: 1000 batches in ${batchTimeMs.toFixed(2)}ms`
    );
});

// Test 7: Edge Cases and Complex Types
await runner.runTest('Edge Cases and Complex Types', async () => {
    // Test complex function signatures
    const complexSignatures = [
        'multicall(bytes[])',
        'safeTransferFrom(address,address,uint256,bytes)',
        'swapExactETHForTokensSupportingFeeOnTransferTokens(uint256,address[],address,uint256)',
        'addLiquidityETH(address,uint256,uint256,uint256,address,uint256)',
        'getAmountsOut(uint256,address[])',
        'factory()',
        'WETH9()'
    ];

    for (const signature of complexSignatures) {
        const selector = selectorUtils.getFunctionSelectorFromSignature(signature);
        runner.assert(
            selectorUtils.validateFunctionSelector(selector),
            `Complex signature generates valid selector: ${signature} -> ${selector}`
        );
    }

    // Test tuple types
    const tupleSignature = 'exactInputSingle((address,address,uint24,address,uint256,uint256,uint256,uint160))';
    const tupleSelector = selectorUtils.getFunctionSelectorFromSignature(tupleSignature);
    runner.assert(
        selectorUtils.validateFunctionSelector(tupleSelector),
        `Tuple signature generates valid selector: ${tupleSelector}`
    );

    // Test array types
    const arraySignature = 'batchTransfer(address[],uint256[])';
    const arraySelector = selectorUtils.getFunctionSelectorFromSignature(arraySignature);
    runner.assert(
        selectorUtils.validateFunctionSelector(arraySelector),
        `Array signature generates valid selector: ${arraySelector}`
    );
});

// Test 8: Error Handling for Batch Generation
await runner.runTest('Batch Generation Error Handling', async () => {
    // Test invalid input types
    const invalidInputs = [
        null,
        undefined,
        'not an array',
        123,
        {},
        [null],
        [undefined],
        [{}], // Object without required properties
        [{ name: 'test' }], // Missing inputs
        [{ inputs: [] }] // Missing name
    ];

    for (const invalidInput of invalidInputs) {
        try {
            selectorUtils.generateSelectors(invalidInput);
            runner.assert(false, `Should throw error for invalid input: ${JSON.stringify(invalidInput)}`);
        } catch (error) {
            runner.assert(
                error.message.includes('array') || error.message.includes('Invalid') || error.message.includes('Expected'),
                `Throws appropriate error for invalid input: ${error.message}`
            );
        }
    }
});

// Run summary
const success = runner.summary();

if (success) {
    console.log('\n🎉 All selector tests passed! Function selector utilities are working correctly.');
} else {
    console.log('\n⚠️  Some selector tests failed. Please review the errors above.');
    process.exit(1);
}
