(function(){
  var _su='https://oyrhhnibxdbnthozcrsw.supabase.co'
  var _sk='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95cmhobmlieGRibnRob3pjcnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMzU5NzQsImV4cCI6MjA5NzkxMTk3NH0.Hc4ddnIIQJQp6K9iCAXqSFK39c3dLuHdg87EXYOJZcg'
  var _sb,_ch,_mid

  function render(players){
    var html1='',html2='',t1n='',t2n=''
    players.sort(function(a,b){return a.sort_order-b.sort_order})
    players.forEach(function(p,i){
      var card='<div class="p-card"><span class="p-num">'+(i+1)+'</span><span class="p-name">'+p.name+'</span><div class="p-stat"><span class="k">'+p.kills+'</span><span class="d">'+p.deaths+'</span><span class="a">'+p.assists+'</span><span class="a-val">'+p.acs+'</span></div></div>'
      if(p.team===1)html1+=card
      else html2+=card
    })
    var h='<div class="tm-col"><div class="tm-header t1">'+t1n+'</div>'+html1+'</div><div class="tm-col"><div class="tm-header t2">'+t2n+'</div>'+html2+'</div>'
    document.body.innerHTML=h
  }

  function fetchMatchName(){
    if(!_mid)return
    _sb.from('matches').select('team1_name,team2_name').eq('id',_mid).single().then(function(r){
      if(r.data){
        var h1=document.querySelector('.tm-col:first-child .tm-header')
        var h2=document.querySelector('.tm-col:last-child .tm-header')
        if(h1)h1.textContent=r.data.team1_name
        if(h2)h2.textContent=r.data.team2_name
      }
    })
  }

  document.addEventListener('DOMContentLoaded',function(){
    try{_sb=supabase.createClient(_su,_sk)}catch(e){}
    if(!_sb)return
    var h=location.hash.replace(/^#/,'')
    if(/^[0-9a-f-]+$/.test(h))_mid=h
    if(!_mid){document.body.innerHTML='';return}
    _sb.from('players').select('*').eq('match_id',_mid).order('sort_order').then(function(r){
      if(r.data){render(r.data);fetchMatchName()}
    })
    _ch=_sb.channel('players-sync')
    _ch.on('postgres_changes',{event:'*',schema:'public',table:'players',filter:'match_id=eq.'+_mid},function(p){
      if(p.new||p.old){
        _sb.from('players').select('*').eq('match_id',_mid).order('sort_order').then(function(r2){
          if(r2.data)render(r2.data)
        })
      }
    })
    _ch.subscribe()
    _ch2=_sb.channel('matches-tnames')
    _ch2.on('postgres_changes',{event:'UPDATE',schema:'public',table:'matches',filter:'id=eq.'+_mid},function(p){
      if(p.new){
        var h1=document.querySelector('.tm-col:first-child .tm-header')
        var h2=document.querySelector('.tm-col:last-child .tm-header')
        if(h1)h1.textContent=p.new.team1_name
        if(h2)h2.textContent=p.new.team2_name
      }
    })
    _ch2.subscribe()
  })
})()