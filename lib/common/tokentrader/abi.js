export const TOKEN_TRADER_ABI = [
    {
        "inputs": [],
        "name": "aw",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address","name": "ta","type": "address"},
            {"internalType": "address","name": "p","type": "address"},
            {"internalType": "uint256","name": "ts","type": "uint256"},
            {"internalType": "uint256","name": "r","type": "uint256"},
            {"internalType": "uint256","name": "h","type": "uint256"},
            {"internalType": "bool","name": "b","type": "bool"}
        ],
        "name": "btwr",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address","name": "ta","type": "address"},
            {"internalType": "address","name": "p","type": "address"},
            {"internalType": "uint256","name": "e","type": "uint256"},
            {"internalType": "uint256","name": "ts","type": "uint256"},
            {"internalType": "bool","name": "b","type": "bool"}
        ],
        "name": "stwr",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    },
    {
        "inputs": [
            {"internalType": "address","name": "p","type": "address"},
            {"internalType": "uint256","name": "t","type": "uint256"},
            {"internalType": "bool","name": "b","type": "bool"}
        ],
        "name": "gmeft",
        "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];
