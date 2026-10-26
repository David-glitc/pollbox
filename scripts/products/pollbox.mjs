export default {
 slug:'pollbox',vercel:'pollboxbot',assets:['BOT'],name:'Pollbox',repo:'pollbox',contract:'Pollbox',color:'#6CB8FF',eyebrow:'ONCHAIN POLLS',symbol:'☑',
 line:'Ask once. Count every wallet.',
 app:{title:'Ballot board',line:'One wallet, one vote. Results are public from the first ballot.',layout:'wall'},
 description:'Onchain polls for BOT Chain communities: one wallet, one vote, with live public results.',
 abis:['Pollbox'],
 contracts:['src/Pollbox.sol'],tests:['test/Pollbox.t.sol'],
 landing:{
  steps:[['Ask a question','Write the question, add two to eight options and pick a closing time.'],['Share the poll','Post the link in your community. Anyone with a BOT Chain wallet can vote.'],['Read the result','Every vote is counted onchain and visible as it happens.']],
  features:[['One wallet, one vote','Each address votes once per poll and cannot change it.'],['Live results','Counts update with every ballot; nothing is hidden or delayed.'],['Tamper-proof','Polls, options and votes cannot be edited after the fact.'],['Free to run','No fee; voters only pay BOT Chain gas.']],
  faq:[['Can people vote twice?','Not from the same wallet. Polls count wallets, so treat them as community signals, not identity-verified votes.'],['Can I edit a poll?','No. Create a new one if you need to change the question or options.'],['How long can a poll run?','From a few minutes up to 90 days.'],['Who can see my vote?','Everyone. Votes are public onchain.']],
 },
 async deploy({deploy}){await deploy('Pollbox');},
 async fork({c,write,read}){
  await write('Pollbox','create',['Fork poll',['Yes','No'],BigInt((await c.getBlock()).timestamp)+3600n]);const id=await read('Pollbox','pollCount')-1n;
  await write('Pollbox','vote',[id,0n]);
  return {flow:'create poll → vote',votes:String((await read('Pollbox','getPoll',[id]))[0].totalVotes)};
 },
};
