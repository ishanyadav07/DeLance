// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title TrustLance
 * @dev A decentralized escrow smart contract for freelancing platforms.
 */
contract TrustLance {
    enum Status { OPEN, IN_PROGRESS, REVIEWING, COMPLETED, DISPUTED }

    struct Job {
        address client;
        address freelancer;
        uint256 amount;
        string description;
        string workLink;
        Status status;
    }

    uint256 public jobCount;
    mapping(uint256 => Job) public jobs;

    event JobCreated(uint256 jobId, address client, uint256 amount);
    event JobAccepted(uint256 jobId, address freelancer);
    event WorkSubmitted(uint256 jobId, string workLink);
    event PaymentReleased(uint256 jobId, address freelancer, uint256 amount);
    event DisputeRaised(uint256 jobId);

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
     * @dev Client creates a job and deposits the payment into escrow.
     */
    function createJob(string memory _description) external payable {
        require(msg.value > 0, "Payment amount must be greater than 0");

        jobCount++;
        jobs[jobCount] = Job({
            client: msg.sender,
            freelancer: address(0),
            amount: msg.value,
            description: _description,
            workLink: "",
            status: Status.OPEN
        });

        emit JobCreated(jobCount, msg.sender, msg.value);
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
     * @dev Freelancer submits their completed work (e.g., a GitHub link or Google Drive URL).
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
     * @dev Client approves the work and releases the escrowed funds to the freelancer.
     */
    function approveWork(uint256 _jobId) 
        external 
        onlyClient(_jobId) 
        inState(_jobId, Status.REVIEWING) 
    {
        Job storage job = jobs[_jobId];
        job.status = Status.COMPLETED;

        // Transfer funds to the freelancer
        (bool success, ) = payable(job.freelancer).call{value: job.amount}("");
        require(success, "Transfer failed");

        emit PaymentReleased(_jobId, job.freelancer, job.amount);
    }

    /**
     * @dev Either party can raise a dispute if something goes wrong.
     * Note: In a production app, an admin/arbitrator would resolve this.
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
