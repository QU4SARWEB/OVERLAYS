(function(){
  var _su='https://oyrhhnibxdbnthozcrsw.supabase.co'
  var _sk='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95cmhobmlieGRibnRob3pjcnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMzU5NzQsImV4cCI6MjA5NzkxMTk3NH0.Hc4ddnIIQJQp6K9iCAXqSFK39c3dLuHdg87EXYOJZcg'
  var _sb,_ch,_mid

  function $(i){return document.getElementById(i)}

  function render(d){
    $('mvpPlayer').textContent=d.player_name||''
    $('mvpTeam').textContent=d.team_name||''
    $('mvpStat').textContent=d.stat_line||''
    $('mvpWrap').className='mvp-wrap'+(d.visible?'':' hidden')
  }

  document.addEventListener('DOMContentLoaded',function(){
    try{_sb=supabase.createClient(_su,_sk)}catch(e){}
    if(!_sb)return
    var h=location.hash.replace(/^#/,'')
    if(/^[0-9a-f-]+$/.test(h))_mid=h
    if(!_mid)return
    _sb.from('mvp_state').select('*').eq('match_id',_mid).single().then(function(r){
      if(r.data)render(r.data)
    })
    _ch=_sb.channel('mvp-sync')
    _ch.on('postgres_changes',{event:'*',schema:'public',table:'mvp_state',filter:'match_id=eq.'+_mid},function(p){
      if(p.new)render(p.new)
    })
    _ch.subscribe()
  })
})()