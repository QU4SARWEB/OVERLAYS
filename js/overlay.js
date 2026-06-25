(function(){
  var D={team1_name:'QU4SAR',team1_score:0,team1_logo:'assets/logos/team1.svg',team2_name:'OPPONENT',team2_score:0,team2_logo:'assets/logos/team2.svg',title:'SCRIM OFICIAL',serie:'BO3',map:'',wing_width:110}
  var P={team1_score:-1,team2_score:-1}
  var _su='https://oyrhhnibxdbnthozcrsw.supabase.co'
  var _sk='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95cmhobmlieGRibnRob3pjcnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMzU5NzQsImV4cCI6MjA5NzkxMTk3NH0.Hc4ddnIIQJQp6K9iCAXqSFK39c3dLuHdg87EXYOJZcg'
  var _sb,_ch

  function $(i){return document.getElementById(i)}

  function render(d){
    if(!d)return
    if(P.team1_score!==d.team1_score){$('sc1').classList.remove('ch');void $('sc1').offsetWidth;$('sc1').classList.add('ch')}
    if(P.team2_score!==d.team2_score){$('sc2').classList.remove('ch');void $('sc2').offsetWidth;$('sc2').classList.add('ch')}
    if(P.team1_logo!==d.team1_logo){$('wl1').classList.remove('ch');void $('wl1').offsetWidth;$('wl1').classList.add('ch')}
    if(P.team2_logo!==d.team2_logo){$('wl2').classList.remove('ch');void $('wl2').offsetWidth;$('wl2').classList.add('ch')}
    if(P.team1_name!==d.team1_name){$('tn1').classList.remove('ch');void $('tn1').offsetWidth;$('tn1').classList.add('ch')
      var t1=$('tn1');t1.style.transition='none';t1.textContent=d.team1_name;void t1.offsetWidth;t1.style.transition=''}
    if(P.team2_name!==d.team2_name){$('tn2').classList.remove('ch');void $('tn2').offsetWidth;$('tn2').classList.add('ch')
      var t2=$('tn2');t2.style.transition='none';t2.textContent=d.team2_name;void t2.offsetWidth;t2.style.transition=''}
    $('tn1').textContent=d.team1_name;$('tn2').textContent=d.team2_name
    $('sc1').textContent=d.team1_score;$('sc2').textContent=d.team2_score
    $('mt').textContent=d.title||''
    $('ms').innerHTML=(d.serie||'')+(d.map?'<span class="dot">|</span>'+d.map:'')
    if(d.team1_logo&&$('wl1').src!==d.team1_logo){$('wl1').src=d.team1_logo;$('wl1').style.opacity='1'}
    if(d.team2_logo&&$('wl2').src!==d.team2_logo){$('wl2').src=d.team2_logo;$('wl2').style.opacity='1'}
    var w1=(d.team1_score||0)>(d.team2_score||0),w2=(d.team2_score||0)>(d.team1_score||0)
    $('tn1').classList.toggle('win',w1);$('tn2').classList.toggle('win',w2)
    var ww=d.wing_width||110
    $('wg1').style.flexBasis=ww+'px';$('wg2').style.flexBasis=ww+'px'
    var total=(d.team1_score||0)+(d.team2_score||0),stars=$('stars')
    stars.innerHTML=''
    for(var i=0;i<Math.min(total,8);i++){var s=document.createElement('span');s.className='star';s.textContent='\u2726';stars.appendChild(s)}
    P={team1_score:d.team1_score,team2_score:d.team2_score,team1_name:d.team1_name,team2_name:d.team2_name,team1_logo:d.team1_logo,team2_logo:d.team2_logo}
  }

  function init(){
    render(D)
    try{
      _sb=supabase.createClient(_su,_sk)
      _sb.from('matches').select('*').eq('active',true).single().then(function(r){
        if(r.data)render(r.data)
      })
      _ch=_sb.channel('matches-sync')
      _ch.on('postgres_changes',{event:'*',schema:'public',table:'matches'},function(p){
        if(p.new&&p.new.active)render(p.new)
      })
      _ch.subscribe()
    }catch(e){}
  }

  document.addEventListener('DOMContentLoaded',function(){
    $('wl1').addEventListener('load',function(){this.style.opacity='1'})
    $('wl2').addEventListener('load',function(){this.style.opacity='1'})
    init()
  })
})();
