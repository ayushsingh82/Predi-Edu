// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TradingToken is ERC20, ReentrancyGuard, Ownable {
    // Trading fee in basis points (1% = 100)
    uint16 public tradingFee = 100; // 1% fee
    uint16 public constant MAX_FEE = 1000; // 10% maximum fee

    // Address where trading fees are collected
    address public feeCollector;

    // Trading status
    bool public tradingEnabled = false;

    // Events
    event TradingEnabled(bool enabled);
    event FeeUpdated(uint16 newFee);
    event FeeCollectorUpdated(address newCollector);
    event TokensSold(
        address indexed seller,
        uint256 amount,
        uint256 ethReceived
    );
    event TokensBought(address indexed buyer, uint256 amount, uint256 ethSpent);

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * 10 ** decimals());
        feeCollector = msg.sender;
    }

    // Modifiers
    modifier tradingIsEnabled() {
        require(tradingEnabled, "Trading is not enabled");
        _;
    }

    // Owner functions
    function enableTrading(bool _enabled) external onlyOwner {
        tradingEnabled = _enabled;
        emit TradingEnabled(_enabled);
    }

    function setFeeCollector(address _feeCollector) external onlyOwner {
        require(_feeCollector != address(0), "Invalid fee collector address");
        feeCollector = _feeCollector;
        emit FeeCollectorUpdated(_feeCollector);
    }

    function setTradingFee(uint16 _fee) external onlyOwner {
        require(_fee <= MAX_FEE, "Fee exceeds maximum");
        tradingFee = _fee;
        emit FeeUpdated(_fee);
    }

    // Trading functions
    function buyTokens() external payable tradingIsEnabled nonReentrant {
        require(msg.value > 0, "Must send ETH");

        // Calculate tokens to mint (1 ETH = 1000 tokens)
        uint256 tokenAmount = (msg.value * 1000) / (1 ether);
        require(tokenAmount > 0, "Amount too small");

        // Calculate fee
        uint256 feeAmount = (tokenAmount * tradingFee) / 10000;
        uint256 finalAmount = tokenAmount - feeAmount;

        // Mint tokens
        _mint(msg.sender, finalAmount);
        if (feeAmount > 0) {
            _mint(feeCollector, feeAmount);
        }

        emit TokensBought(msg.sender, finalAmount, msg.value);
    }

    function sellTokens(uint256 amount) external tradingIsEnabled nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");

        // Calculate ETH to return (1000 tokens = 1 ETH)
        uint256 ethAmount = (amount * 1 ether) / 1000;
        require(
            address(this).balance >= ethAmount,
            "Insufficient ETH in contract"
        );

        // Calculate fee
        uint256 feeAmount = (ethAmount * tradingFee) / 10000;
        uint256 finalAmount = ethAmount - feeAmount;

        // Burn tokens and send ETH
        _burn(msg.sender, amount);

        // Send ETH
        (bool success, ) = msg.sender.call{value: finalAmount}("");
        require(success, "ETH transfer failed");

        if (feeAmount > 0) {
            (bool feeSuccess, ) = feeCollector.call{value: feeAmount}("");
            require(feeSuccess, "Fee transfer failed");
        }

        emit TokensSold(msg.sender, amount, finalAmount);
    }

    // ETH withdrawal function for owner
    function withdrawETH() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");

        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "ETH transfer failed");
    }

    // To receive ETH
    receive() external payable {}
}