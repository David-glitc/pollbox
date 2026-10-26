// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Onchain polls: one wallet, one vote, results public at all times. No fee.
contract Pollbox {
    struct Poll {address creator; string question; string[] options; uint64 end; uint256 totalVotes;}
    Poll[] private polls;
    mapping(uint256=>uint256[]) private counts;
    /// @dev poll => voter => option index + 1 (0 = not voted)
    mapping(uint256=>mapping(address=>uint256)) public choiceOf;
    event PollCreated(uint256 indexed id,address indexed creator,string question,uint64 end);
    event Voted(uint256 indexed id,address indexed voter,uint256 option);

    function create(string calldata question,string[] calldata options,uint64 end) external returns(uint256 id) {
        require(bytes(question).length>0&&bytes(question).length<=200,"question 1-200 chars");
        require(options.length>=2&&options.length<=8,"2-8 options");
        for(uint256 i;i<options.length;i++)require(bytes(options[i]).length>0&&bytes(options[i]).length<=80,"option 1-80 chars");
        require(end>block.timestamp&&end<=block.timestamp+90 days,"bad end");
        id=polls.length; polls.push(Poll(msg.sender,question,options,end,0)); counts[id]=new uint256[](options.length);
        emit PollCreated(id,msg.sender,question,end);
    }
    function vote(uint256 id,uint256 option) external {
        require(id<polls.length,"no poll"); Poll storage p=polls[id];
        require(block.timestamp<p.end,"poll closed"); require(option<p.options.length,"bad option");
        require(choiceOf[id][msg.sender]==0,"already voted");
        choiceOf[id][msg.sender]=option+1; counts[id][option]++; p.totalVotes++; emit Voted(id,msg.sender,option);
    }
    function pollCount() external view returns(uint256){return polls.length;}
    function getPoll(uint256 id) external view returns(Poll memory poll,uint256[] memory votes){require(id<polls.length,"no poll");return (polls[id],counts[id]);}
}
