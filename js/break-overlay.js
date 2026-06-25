(function(){
  var _su='https://oyrhhnibxdbnthozcrsw.supabase.co'
  var _sk='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95cmhobmlieGRibnRob3pjcnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMzU5NzQsImV4cCI6MjA5NzkxMTk3NH0.Hc4ddnIIQJQp6K9iCAXqSFK39c3dLuHdg87EXYOJZcg'
  var _sb,_ch,_mid,_int

  function $(i){return document.getElementById(i)}

  function fmt(s){
    var m=Math.floor(s/60),sec=s%60
    return (m<10?'0':'')+m+':'+(sec<10?'0':'')+sec
  }

  function render(d){
    $('brkTitle').textContent=d.title||''
    $('brkSubtitle').textContent=d.subtitle||''
    $('brkTimer').textContent=fmt(d.timer_seconds||0)
    $('brkWrap').className='brk-wrap'+(d.visible?'':' hidden')
    if(d.timer_running&&!_int){
      _int=setInterval(function(){
        var el=$('brkTimer'),parts=el.textContent.split(':')
        var sec=parseInt(parts[0])*60+parseInt(parts[1])
        if(sec>0){sec--;el.textContent=fmt(sec)}
      },1000)
    }
    if(!d.timer_running&&_int){clearInterval(_int);_int=null}
  }

  document.addEventListener('DOMContentLoaded',function(){
    try{_sb=supabase.createClient(_su,_sk)}catch(e){}
    if(!_sb)return
    var h=location.hash.replace(/^#/,'')
    if(/^[0-9a-f-]+$/.test(h))_mid=h
    if(!_mid)return
    _sb.from('break_screen').select('*').eq('match_id',_mid).single().then(function(r){
      if(r.data)render(r.data)
    })
    _ch=_sb.channel('break-sync')
    _ch.on('postgres_changes',{event:'*',schema:'public',table:'break_screen',filter:'match_id=eq.'+_mid},function(p){
      if(p.new)render(p.new)
    })
    _ch.subscribe()
  })
})()