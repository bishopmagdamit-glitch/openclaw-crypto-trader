// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PortfolioLedger {
  struct Trade {
    address tokenIn;
    address tokenOut;
    uint256 amountIn;
    uint256 amountOut;
    uint256 timestamp;
  }

  event TradeExecuted(address indexed caller, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);

  Trade[] public trades;

  function recordTrade(address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut) external {
    trades.push(Trade({
      tokenIn: tokenIn,
      tokenOut: tokenOut,
      amountIn: amountIn,
      amountOut: amountOut,
      timestamp: block.timestamp
    }));
    emit TradeExecuted(msg.sender, tokenIn, tokenOut, amountIn, amountOut);
  }

  function tradesCount() external view returns (uint256) {
    return trades.length;
  }
}
