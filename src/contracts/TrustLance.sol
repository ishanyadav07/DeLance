// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title TrustLance
 * @dev A decentralized escrow smart contract for freelancing platforms using stablecoins.
 */
contract TrustLance {
    using SafeERC20 for IERC20;

    enum Status { OPEN, IN_PROGRESS, REVIEWING, COMPLETED, DISPUTED, REFUNDED }

    struct Job {
        address client;
        address freelancer;
        uint256 amount;
        string description;
        string workLink;
        Status status;
        address token; // The stablecoin address (e.g., USDC, USDT)
    }

    uint256 public jobCount;
    mapping(uint256 => Job) public jobs;
    
    // Allowed stablecoins
    mapping(address => bool) public allowedTokens;

    event JobCreated(uint256 jobId, address client, uint256 amount, address token);
    event JobAccepted(uint256 jobId, address freelancer);
    event WorkSubmitted(uint256 jobId, string workLink);
    event PaymentReleased(uint256 jobId, address freelancer, uint256 amount);
    event DisputeRaised(uint256 jobId);
    event Refunded(uint256 jobId, uint256 amount);

    constructor(address[] memory _tokens) {
        for (uint i = 0; i < _tokens.length; i++) {
            allowedTokens[_tokens[i]] = true;
        }
    }

    // Modifiers for access control
    modifier onlyClient(uint256 _jobId) {
        require(msg.sender == jobs[_jobId].client, "Only client can call this");
        _;
    }

    modifier onlyFreelancer(uint256 _jobId) {
        require(msg.sender == jobs[_jobId].freelancer, "Only freelancer can call this");
        _;
    }

    modifier inState(uint256 _jobId, Status _status) {
        require(jobs[_jobId].status == _status, "Invalid job state for this action");
        _;
    }

    /**
     * @dev Client creates a job and deposits the stablecoin into escrow.
     * Requires client to have called approve() on the token contract first.
     */
    function createJob(string memory _description, uint256 _amount, address _token) external {
        require(allowedTokens[_token], "Token not allowed");
        require(_amount > 0, "Amount must be greater than 0");

        // Transfer tokens from client to this contract
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);

        jobCount++;
        jobs[jobCount] = Job({
            client: msg.sender,
            freelancer: address(0),
            amount: _amount,
            description: _description,
            workLink: "",
            status: Status.OPEN,
            token: _token
        });

        emit JobCreated(jobCount, msg.sender, _amount, _token);
    }

    /**
     * @dev Freelancer accepts an open job.
     */
    function acceptJob(uint256 _jobId) external inState(_jobId, Status.OPEN) {
        require(jobs[_jobId].client != msg.sender, "Client cannot accept their own job");
        
        jobs[_jobId].freelancer = msg.sender;
        jobs[_jobId].status = Status.IN_PROGRESS;

        emit JobAccepted(_jobId, msg.sender);
    }

    /**
     * @dev Freelancer submits their completed work.
     */
    function submitWork(uint256 _jobId, string memory _link) 
        external 
        onlyFreelancer(_jobId) 
        inState(_jobId, Status.IN_PROGRESS) 
    {
        jobs[_jobId].workLink = _link;
        jobs[_jobId].status = Status.REVIEWING;

        emit WorkSubmitted(_jobId, _link);
    }

    /**
     * @dev Client approves the work and releases the escrowed funds.
     */
    function approveWork(uint256 _jobId) 
        external 
        onlyClient(_jobId) 
        inState(_jobId, Status.REVIEWING) 
    {
        Job storage job = jobs[_jobId];
        job.status = Status.COMPLETED;

        // Transfer funds to the freelancer
        IERC20(job.token).safeTransfer(job.freelancer, job.amount);

        emit PaymentReleased(_jobId, job.freelancer, job.amount);
    }

    /**
     * @dev Client can refund the payment if the job is still OPEN or in DISPUTE.
     */
    function refund(uint256 _jobId) 
        external 
        onlyClient(_jobId) 
    {
        Job storage job = jobs[_jobId];
        require(
            job.status == Status.OPEN || job.status == Status.DISPUTED, 
            "Cannot refund at this stage"
        );

        uint256 amountToRefund = job.amount;
        job.amount = 0;
        job.status = Status.REFUNDED;

        IERC20(job.token).safeTransfer(job.client, amountToRefund);

        emit Refunded(_jobId, amountToRefund);
    }

    /**
     * @dev Either party can raise a dispute.
     */
    function raiseDispute(uint256 _jobId) external {
        Job storage job = jobs[_jobId];
        require(
            msg.sender == job.client || msg.sender == job.freelancer, 
            "Only involved parties can dispute"
        );
        require(
            job.status == Status.IN_PROGRESS || job.status == Status.REVIEWING, 
            "Cannot dispute at this stage"
        );

        job.status = Status.DISPUTED;
        emit DisputeRaised(_jobId);
    }
}
