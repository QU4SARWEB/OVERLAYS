(function(){
  var _su='https://oyrhhnibxdbnthozcrsw.supabase.co'
  var _sk='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95cmhobmlieGRibnRob3pjcnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMzU5NzQsImV4cCI6MjA5NzkxMTk3NH0.Hc4ddnIIQJQp6K9iCAXqSFK39c3dLuHdg87EXYOJZcg'
  var _sb,_ch,_int

  function $(i){return document.getElementById(i)}

  function fmt(s){
    var m=Math.floor(s/60),sec=s%60
    return (m<10?'0':'')+m+':'+(sec<10?'0':'')+sec
  }

  function render(d){
    var el=$('tdisplay'),lb=$('tlabel')
    lb.textContent=d.label||'TIEMPO RESTANTE'
    el.textContent=fmt(d.elapsed||0)
    el.className='timer-display'+(d.running?' running':'')
    var total=d.duration||300,elapsed=d.elapsed||0,remain=total-elapsed
    if(!d.running)el.className='timer-display'
    else if(remain<=30)el.className='timer-display critical'
    else if(remain<=60)el.className='timer-display warning'
    else el.className='timer-display running'
    if(d.running&&!_int){
      _int=setInterval(function(){
        var cur=parseInt(el.textContent.split(':')[0])*60+parseInt(el.textContent.split(':')[1])
        if(cur>0){cur--;el.textContent=fmt(cur)}
      },1000)
    }
    if(!d.running&&_int){clearInterval(_int);_int=null}
  }

  document.addEventListener('DOMContentLoaded',function(){
    try{_sb=supabase.createClient(_su,_sk)}catch(e){}
    if(!_sb)return
    _sb.from('timer_state').select('*').eq('match_id',(function(){
      var h=location.hash.replace(/^#/,'')
      return /^[0-9a-f-]+$/.test(h)?h:null
    })()).single().then(function(r){
      if(r.data)render(r.data)
    })
    _ch=_sb.channel('timer-sync')
    _ch.on('postgres_changes',{event:'*',schema:'public',table:'timer_state'},function(p){
      if(p.new)render(p.new)
    })
    _ch.subscribe()
  })
})()