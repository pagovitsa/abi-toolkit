import { decodeLogs } from '../lib/common/utils/log-decoder.js';

// Test data with multiple Transfer logs that should have different values
const testLogs = [
    {
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        topics: [
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
            '0x000000000000000000000000a69babef1ca67a37ffaf7a485dfff3382056e78c',
            '0x000000000000000000000000f0a12fefa78181a3749474db31d09524fa87b1f7'
        ],
        data: '0x00000000000000000000000000000000000000000000000000000000215faf07',
        blockNumber: 22846725,
        transactionHash: '0x2c68d702c7b06259e22f360d2ce77383989a4000e6a37c58ec2cd6fb61bab515',
        logIndex: 0
    },
    {
        address: '0x1e8e148055cbd5a02ea75eed79da7ce4b91108b9',
        topics: [
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
            '0x000000000000000000000000dd0f36f295c9d0fc57a09f7303925b1ba1d9ef10',
            '0x000000000000000000000000f0a12fefa78181a3749474db31d09524fa87b1f7'
        ],
        data: '0x00000000000000000000000000000000000000000000000000010b5b4b5b5b00',
        blockNumber: 22846725,
        transactionHash: '0x2c68d702c7b06259e22f360d2ce77383989a4000e6a37c58ec2cd6fb61bab515',
        logIndex: 1
    },
    {
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        topics: [
            '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
            '0x000000000000000000000000c123d2049a677c1ceb1c8d50546451143458f9d8',
            '0x0000000000000000000000003762a79b34dfb6774cfd45dbf5fd9a2780873783'
        ],
        data: '0x00000000000000000000000000000000000000000000000000000000028a1122',
        blockNumber: 22846725,
        transactionHash: '0x2c68d702c7b06259e22f360d2ce77383989a4000e6a37c58ec2cd6fb61bab515',
        logIndex: 2
    }
];

console.log('Testing log decoder fix...');

// Test the fix
const decodedLogs = decodeLogs(testLogs);

console.log('Decoded transfers:', decodedLogs.transfers.length);

// Verify each transfer has unique values
const transfers = decodedLogs.transfers;

console.log('\nVerifying unique values:');
for (let i = 0; i < transfers.length; i++) {
    const transfer = transfers[i];
    console.log(`Transfer ${i + 1}:`);
    console.log(`  Contract: ${transfer.contractAddress}`);
    console.log(`  From: ${transfer.from}`);
    console.log(`  To: ${transfer.to}`);
    console.log(`  Value: ${transfer.value}`);
    console.log(`  LogIndex: ${transfer.logIndex}`);
}

// Check that values are different
const uniqueContracts = new Set(transfers.map(t => t.contractAddress));
const uniqueValues = new Set(transfers.map(t => t.value));
const uniqueFroms = new Set(transfers.map(t => t.from));

console.log('\nUniqueness check:');
console.log(`Unique contracts: ${uniqueContracts.size} (expected: 3)`);
console.log(`Unique values: ${uniqueValues.size} (expected: 3)`);
console.log(`Unique from addresses: ${uniqueFroms.size} (expected: 3)`);

if (uniqueContracts.size === 3 && uniqueValues.size === 3 && uniqueFroms.size === 3) {
    console.log('\n✅ TEST PASSED: All transfers have unique values');
} else {
    console.log('\n❌ TEST FAILED: Transfers have duplicate values');
}
