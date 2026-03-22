// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TrustLance {
    enum Status {
        Open,
        InProgress,
        Submitted,
        Completed,
        Disputed
    }

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

    function createJob(string memory description) public payable {
        require(msg.value > 0, "Amount must be greater than zero");
        
        jobCount++;
        jobs[jobCount] = Job({
            client: msg.sender,
            freelancer: address(0),
            amount: msg.value,
            description: description,
            workLink: "",
            status: Status.Open
        });

        emit JobCreated(jobCount, msg.sender, msg.value);
    }

    function acceptJob(uint256 jobId) public {
        Job storage job = jobs[jobId];
        require(job.status == Status.Open, "Job is not open");
        require(msg.sender != job.client, "Client cannot accept their own job");

        job.freelancer = msg.sender;
        job.status = Status.InProgress;

        emit JobAccepted(jobId, msg.sender);
    }

    function submitWork(uint256 jobId, string memory link) public {
        Job storage job = jobs[jobId];
        require(msg.sender == job.freelancer, "Only freelancer can submit work");
        require(job.status == Status.InProgress, "Job is not in progress");

        job.workLink = link;
        job.status = Status.Submitted;

        emit WorkSubmitted(jobId, link);
    }

    function approveWork(uint256 jobId) public {
        Job storage job = jobs[jobId];
        require(msg.sender == job.client, "Only client can approve work");
        require(job.status == Status.Submitted, "Work not submitted yet");

        job.status = Status.Completed;
        
        uint256 amount = job.amount;
        address freelancer = job.freelancer;
        
        payable(freelancer).transfer(amount);

        emit PaymentReleased(jobId, freelancer, amount);
    }

    function raiseDispute(uint256 jobId) public {
        Job storage job = jobs[jobId];
        require(msg.sender == job.client || msg.sender == job.freelancer, "Only client or freelancer can raise dispute");
        require(job.status == Status.InProgress || job.status == Status.Submitted, "Cannot raise dispute in current status");

        job.status = Status.Disputed;

        emit DisputeRaised(jobId);
    }

    // Function to get job details
    function getJob(uint256 jobId) public view returns (
        address client,
        address freelancer,
        uint256 amount,
        string memory description,
        string memory workLink,
        Status status
    ) {
        Job storage job = jobs[jobId];
        return (
            job.client,
            job.freelancer,
            job.amount,
            job.description,
            job.workLink,
            job.status
        );
    }
}
