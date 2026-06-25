(function(){
  var K='qu4sar_scoreboard';
  var C='qu4sar_channel';
  var D={t1n:'QU4SAR',t1s:0,t1l:'assets/logos/team1.svg',t2n:'OPPONENT',t2s:0,t2l:'assets/logos/team2.svg',mt:'SCRIM OFICIAL',ms:'BO3',mm:'',ww:110};
  var P={t1s:-1,t2s:-1};
  var _PL=false;

  function $(i){return document.getElementById(i)}

  function gp(n){var r=new RegExp('[?&]'+n+'=([^&]*)').exec(location.search);return r?decodeURIComponent(r[1]):null}

  function load(){
    try{
      if(!_PL&&gp('t1n')){
        _PL=true
        var h={
          t1n:gp('t1n'),t1s:parseInt(gp('t1s'))||0,t1l:D.t1l,
          t2n:gp('t2n'),t2s:parseInt(gp('t2s'))||0,t2l:D.t2l,
          mt:gp('mt')||D.mt,ms:gp('ms')||D.ms,mm:gp('mm')||D.mm,
          ww:parseInt(gp('ww'))||D.ww
        }
        localStorage.setItem(K,JSON.stringify(h));return h
      }
      var r=localStorage.getItem(K);return r?JSON.parse(r):null
    }catch(e){return null}
  }

  function render(d){
    if(!d)return

    if(P.t1s!==d.t1s){$('sc1').classList.remove('ch');void $('sc1').offsetWidth;$('sc1').classList.add('ch')}
    if(P.t2s!==d.t2s){$('sc2').classList.remove('ch');void $('sc2').offsetWidth;$('sc2').classList.add('ch')}

    if(P.t1l!==d.t1l){$('wl1').classList.remove('ch');void $('wl1').offsetWidth;$('wl1').classList.add('ch')}
    if(P.t2l!==d.t2l){$('wl2').classList.remove('ch');void $('wl2').offsetWidth;$('wl2').classList.add('ch')}

    if(P.t1n!==d.t1n){$('tn1').classList.remove('ch');void $('tn1').offsetWidth;$('tn1').classList.add('ch')
      var t1=$('tn1');t1.style.transition='none';t1.textContent=d.t1n;void t1.offsetWidth;t1.style.transition=''}
    if(P.t2n!==d.t2n){$('tn2').classList.remove('ch');void $('tn2').offsetWidth;$('tn2').classList.add('ch')
      var t2=$('tn2');t2.style.transition='none';t2.textContent=d.t2n;void t2.offsetWidth;t2.style.transition=''}

    $('tn1').textContent=d.t1n;$('tn2').textContent=d.t2n
    $('sc1').textContent=d.t1s;$('sc2').textContent=d.t2s
    $('mt').textContent=d.mt
    $('ms').innerHTML=(d.ms||'')+(d.mm?'<span class="dot">|</span>'+d.mm:'')

    if(d.t1l&&$('wl1').src!==d.t1l){$('wl1').src=d.t1l;$('wl1').style.opacity='1'}
    if(d.t2l&&$('wl2').src!==d.t2l){$('wl2').src=d.t2l;$('wl2').style.opacity='1'}

    var w1=d.t1s>d.t2s,w2=d.t2s>d.t1s
    $('tn1').classList.toggle('win',w1);$('tn2').classList.toggle('win',w2)

    var ww=d.ww||110
    $('wg1').style.flexBasis=ww+'px';$('wg2').style.flexBasis=ww+'px'

    var total=(d.t1s||0)+(d.t2s||0),stars=$('stars')
    stars.innerHTML=''
    for(var i=0;i<Math.min(total,8);i++){var s=document.createElement('span');s.className='star';s.textContent='\u2726';stars.appendChild(s)}

    P={t1s:d.t1s,t2s:d.t2s,t1n:d.t1n,t2n:d.t2n,t1l:d.t1l,t2l:d.t2l}
  }

  function refresh(){var d=load()||D;render(d)}

  document.addEventListener('DOMContentLoaded',function(){
    $('wl1').addEventListener('load',function(){this.style.opacity='1'})
    $('wl2').addEventListener('load',function(){this.style.opacity='1'})
    render(D)
    refresh()
    setInterval(refresh,1200)
    window.addEventListener('storage',function(e){if(e.key===K)refresh()})
    try{var bc=new BroadcastChannel(C);bc.onmessage=function(e){
      if(e.data&&e.data.type==='update'){localStorage.setItem(K,JSON.stringify(e.data.data));render(e.data.data)}
    }}catch(e){}
    window.addEventListener('message',function(e){
      if(e.data&&e.data.type==='update'){localStorage.setItem(K,JSON.stringify(e.data.data));render(e.data.data)}
    })

    var iz=$('importZone')
    document.addEventListener('dragover',function(e){e.preventDefault();iz.classList.add('show')})
    document.addEventListener('dragleave',function(e){if(!e.relatedTarget||e.relatedTarget===document.documentElement)iz.classList.remove('show')})
    document.addEventListener('drop',function(e){
      e.preventDefault();iz.classList.remove('show')
      var f=e.dataTransfer.files[0];if(!f||!f.name.endsWith('.json'))return
      var r=new FileReader()
      r.onload=function(ev){try{var d=JSON.parse(ev.target.result);localStorage.setItem(K,JSON.stringify(d));refresh()}catch(e){}}
      r.readAsText(f)
    })
  })
})();
