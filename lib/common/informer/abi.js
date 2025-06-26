export const INFORMER_ABI = [
    {
        "inputs": [{"internalType": "address","name": "contractAddress","type": "address"}],
        "name": "getOwner",
        "outputs": [{"internalType": "address","name": "","type": "address"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address","name": "pairAddress","type": "address"}],
        "name": "getPairAndTokenDetails",
        "outputs": [{
            "components": [
                {"internalType": "address","name": "pairAddress","type": "address"},
                {"internalType": "string","name": "name","type": "string"},
                {"internalType": "uint8","name": "decimals","type": "uint8"},
                {"internalType": "string","name": "symbol","type": "string"},
                {"internalType": "uint256","name": "totalSupply","type": "uint256"},
                {
                    "components": [
                        {"internalType": "address","name": "tokenAddress","type": "address"},
                        {"internalType": "string","name": "name","type": "string"},
                        {"internalType": "uint8","name": "decimals","type": "uint8"},
                        {"internalType": "string","name": "symbol","type": "string"},
                        {"internalType": "uint256","name": "totalSupply","type": "uint256"}
                    ],
                    "internalType": "struct UniswapPairTokenDetails.TokenDetails",
                    "name": "token0Details",
                    "type": "tuple"
                },
                {
                    "components": [
                        {"internalType": "address","name": "tokenAddress","type": "address"},
                        {"internalType": "string","name": "name","type": "string"},
                        {"internalType": "uint8","name": "decimals","type": "uint8"},
                        {"internalType": "string","name": "symbol","type": "string"},
                        {"internalType": "uint256","name": "totalSupply","type": "uint256"}
                    ],
                    "internalType": "struct UniswapPairTokenDetails.TokenDetails",
                    "name": "token1Details",
                    "type": "tuple"
                }
            ],
            "internalType": "struct UniswapPairTokenDetails.PairDetails",
            "name": "pairDetails",
            "type": "tuple"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address","name": "pairAddress","type": "address"}],
        "name": "getReserves",
        "outputs": [{
            "components": [
                {"internalType": "uint112","name": "reserve0","type": "uint112"},
                {"internalType": "uint112","name": "reserve1","type": "uint112"},
                {"internalType": "uint256","name": "blockNumber","type": "uint256"}
            ],
            "internalType": "struct UniswapPairTokenDetails.Reserves",
            "name": "reserves",
            "type": "tuple"
        }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"internalType": "address","name": "tokenAddress","type": "address"},
            {"internalType": "address","name": "walletAddress","type": "address"}
        ],
        "name": "getTokenBalance",
        "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address","name": "tokenAddress","type": "address"}],
        "name": "getTotalSupply",
        "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];
