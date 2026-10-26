// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {Test} from "forge-std/Test.sol";
import {Pollbox} from "../src/Pollbox.sol";

contract PollboxTest is Test {
    Pollbox p;
    function setUp() public {p=new Pollbox();}
    function _options(uint256 n) internal pure returns(string[] memory o){o=new string[](n);for(uint256 i;i<n;i++)o[i]=string(abi.encodePacked("Option ",bytes1(uint8(65+i))));}
    function test_oneWalletOneVote() public {
        uint256 id=p.create("Next community call?",_options(3),uint64(block.timestamp+1 days));
        vm.prank(address(1));p.vote(id,0);vm.prank(address(2));p.vote(id,2);vm.prank(address(3));p.vote(id,2);
        vm.prank(address(1));vm.expectRevert(bytes("already voted"));p.vote(id,1);
        (Pollbox.Poll memory poll,uint256[] memory votes)=p.getPoll(id);
        assertEq(poll.totalVotes,3);assertEq(votes[0],1);assertEq(votes[2],2);assertEq(p.choiceOf(id,address(2)),3);
        vm.warp(block.timestamp+1 days);vm.prank(address(4));vm.expectRevert(bytes("poll closed"));p.vote(id,0);
    }
    function test_rejectsBadPolls() public {
        vm.expectRevert(bytes("2-8 options"));p.create("Q",_options(1),uint64(block.timestamp+1 days));
        vm.expectRevert(bytes("bad end"));p.create("Q",_options(2),uint64(block.timestamp+91 days));
        uint256 id=p.create("Q",_options(2),uint64(block.timestamp+1 days));
        vm.expectRevert(bytes("bad option"));p.vote(id,2);
    }
}
