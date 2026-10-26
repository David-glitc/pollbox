import {$,state,esc,link,button,field,form,read,tx,chainTime,start} from '../core.js';
const when=t=>new Date(Number(t)*1000).toLocaleString(undefined,{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
const tally={polls:0,open:0,votes:0n};
function controls(){
 $('list-title').textContent='Polls';
 $('controls').innerHTML='<div class="section-head"><h2>Ask your community</h2><span class="tiny">One wallet, one vote. Polls cannot be edited after you post them.</span></div>'
  +form('poll',`<div class="f wide">${field('question','Question','','text','maxlength="200" placeholder="When should we hold the next community call?"')}</div><div class="f">${field('hours','Open for (hours)','48','number','min="1" max="2160"')}</div><div class="f full"><label for="options">Options, one per line (2 to 8)</label><textarea id="options" name="options" required placeholder="Thursday 18:00 UTC&#10;Saturday 14:00 UTC&#10;Sunday 20:00 UTC"></textarea></div>`,
   'Post poll',async f=>{const options=f.options.split('\n').map(s=>s.trim()).filter(Boolean);if(options.length<2||options.length>8)throw Error('Add 2 to 8 options, one per line.');if(options.some(o=>o.length>80))throw Error('Keep each option to 80 characters.');
    await tx('Pollbox','create',[f.question.trim(),options,BigInt(await chainTime()+Math.round(Number(f.hours)*3600))]);});
 $('rules').innerHTML='<ul><li>Each wallet votes once per poll and cannot change its vote.</li><li>Votes are public onchain and results are live.</li><li>Polls run from one hour to 90 days.</li><li>Polls count wallets, not people. Treat results as a community signal.</li></ul>';
}
async function card(id,now){
 const [p,votes]=await read('Pollbox','getPoll',[BigInt(id)]);const open=now<Number(p.end);tally.votes+=p.totalVotes;if(open)tally.open++;
 const mineChoice=state.account?Number(await read('Pollbox','choiceOf',[BigInt(id),state.account])):0,total=Number(p.totalVotes);
 const top=Math.max(...votes.map(Number));
 const rows=p.options.map((o,k)=>{const n=Number(votes[k]),pct=total?Math.round(n*1000/total)/10:0;
  return `<div class="row"><span>${esc(o)}${mineChoice===k+1?' <span class="badge live">Your vote</span>':''}${!open&&n===top&&n>0?' <span class="badge">Leading</span>':''}</span><strong>${n} · ${pct}%</strong></div><div class="meter" aria-hidden="true"><i style="width:${pct}%"></i></div>${open&&!mineChoice?`<div class="actions">${button(`Vote: ${o.length>28?o.slice(0,27)+'…':o}`,()=>tx('Pollbox','vote',[BigInt(id),BigInt(k)]))}</div>`:''}`;}).join('');
 return `<article class="shot"><div class="shot-frame"><span class="badge${open?' live':''}">${open?'Open':'Closed'}</span><div class="amount">${total} vote${total===1?'':'s'}</div></div><h3>${esc(p.question)}</h3><p class="tiny">#${id} · by ${link(p.creator)} · ${open?'closes':'closed'} ${when(p.end)}</p>${rows}</article>`;
}
async function render(){
 const count=Number(await read('Pollbox','pollCount')),now=await chainTime();Object.assign(tally,{polls:count,open:0,votes:0n});
 const ids=[];for(let id=count-1;id>=Math.max(0,count-30);id--)ids.push(id);
 const cards=await Promise.all(ids.map(id=>card(id,now)));
 return cards.length?`<div class="wall">${cards.join('')}</div>`:'<p class="empty">No polls yet. Ask the first question above.</p>';
}
function stats(empty){return [['Polls',empty?'—':String(tally.polls)],['Open now',empty?'—':String(tally.open)],['Votes cast',empty?'—':String(tally.votes)]];}
start({controls,render,stats});
