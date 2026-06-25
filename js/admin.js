(function(){
  var _su='https://oyrhhnibxdbnthozcrsw.supabase.co'
  var _sk='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95cmhobmlieGRibnRob3pjcnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMzU5NzQsImV4cCI6MjA5NzkxMTk3NH0.Hc4ddnIIQJQp6K9iCAXqSFK39c3dLuHdg87EXYOJZcg'
  var _sb,_mid=''

  function $(i){return document.getElementById(i)}

  function gs(){
    return{
      title:$('mt').value||'',serie:$('ms').value||'BO3',map:$('mm').value||'',
      team1_name:$('t1n').value||'QU4SAR',team1_score:parseInt($('t1s').value,10)||0,team1_logo:$('pr1').src||'',
      team2_name:$('t2n').value||'OPPONENT',team2_score:parseInt($('t2s').value,10)||0,team2_logo:$('pr2').src||'',
      wing_width:parseInt($('ww').value,10)||110
    }
  }

  function save(cb){
    if(!_mid){_log('No hay partida activa');return}
    var d=gs()
    _sb.from('matches').update(d).eq('id',_mid).then(function(r){
      if(r.error)_log('Error: '+r.error.message)
      else{if(cb)cb();_log('Guardado')}
    })
  }

  function load(mid){
    if(!mid)return
    _mid=mid
    _sb.from('matches').select('*').eq('id',_mid).single().then(function(r){
      if(r.data){apply(r.data);loadOverlays()}
    })
  }

  function loadOverlays(){
    _sb.from('timer_state').select('*').eq('match_id',_mid).single().then(function(r){
      if(r.data){$('tmLbl').value=r.data.label||'';$('tmDur').value=r.data.duration||300}
      else{_sb.from('timer_state').insert({match_id:_mid,label:'TIEMPO RESTANTE',duration:300,elapsed:0,running:false}).select().single().then(function(ir){if(ir.data){$('tmLbl').value=ir.data.label;$('tmDur').value=ir.data.duration}})}
    })
    _sb.from('lower_third').select('*').eq('match_id',_mid).single().then(function(r){
      if(r.data){$('ltTitle').value=r.data.title||'';$('ltSubtitle').value=r.data.subtitle||''}
      else{_sb.from('lower_third').insert({match_id:_mid,title:'',subtitle:'',visible:false}).select().single()}
    })
    _sb.from('mvp_state').select('*').eq('match_id',_mid).single().then(function(r){
      if(r.data){$('mvpPlayer').value=r.data.player_name||'';$('mvpTeam').value=r.data.team_name||'';$('mvpStat').value=r.data.stat_line||''}
      else{_sb.from('mvp_state').insert({match_id:_mid,player_name:'',team_name:'',stat_line:'',visible:false}).select().single()}
    })
    _sb.from('break_screen').select('*').eq('match_id',_mid).single().then(function(r){
      if(r.data){$('brkTitle').value=r.data.title||'';$('brkSubtitle').value=r.data.subtitle||'';$('brkTimer').value=r.data.timer_seconds||120}
      else{_sb.from('break_screen').insert({match_id:_mid,title:'BREAK',subtitle:'Volvemos en un momento',visible:false,timer_running:false,timer_seconds:120}).select().single()}
    })
    _sb.from('players').select('*').eq('match_id',_mid).order('sort_order').then(function(r){
      if(r.data)renderPlayers(r.data)
    })
  }

  function saveTimer(cb){
    if(!_mid)return
    var d={label:$('tmLbl').value,duration:parseInt($('tmDur').value,10)||300}
    _sb.from('timer_state').update(d).eq('match_id',_mid).then(function(r){
      if(r.error)_log('Error timer: '+r.error.message);else{if(cb)cb();_log('Timer guardado')}
    })
  }

  function saveLowerThird(d,cb){
    if(!_mid)return
    _sb.from('lower_third').update(d).eq('match_id',_mid).then(function(r){
      if(r.error)_log('Error lower: '+r.error.message);else{if(cb)cb();_log('Lower third actualizado')}
    })
  }

  function saveMvp(d,cb){
    if(!_mid)return
    _sb.from('mvp_state').update(d).eq('match_id',_mid).then(function(r){
      if(r.error)_log('Error MVP: '+r.error.message);else{if(cb)cb();_log('MVP actualizado')}
    })
  }

  function saveBreak(d,cb){
    if(!_mid)return
    _sb.from('break_screen').update(d).eq('match_id',_mid).then(function(r){
      if(r.error)_log('Error Break: '+r.error.message);else{if(cb)cb();_log('Break actualizado')}
    })
  }

  function renderPlayers(players){
    var lists=[$('p1list'),$('p2list')]
    lists[0].innerHTML='';lists[1].innerHTML=''
    var teams=[[],[]]
    players.forEach(function(p){if(p.team===1)teams[0].push(p);else teams[1].push(p)})
    for(var t=0;t<2;t++){
      for(var i=0;i<5;i++){
        var p=teams[t][i]||{name:'',kills:0,deaths:0,assists:0,acs:0,id:''}
        var div=document.createElement('div')
        div.style.cssText='display:flex;gap:8px;align-items:center;margin-bottom:6px'
        div.innerHTML='<input type="text" placeholder="Nombre" style="flex:1;min-width:0" value="'+p.name+'"><input type="number" placeholder="K" style="width:44px" value="'+p.kills+'"><input type="number" placeholder="D" style="width:44px" value="'+p.deaths+'"><input type="number" placeholder="A" style="width:44px" value="'+p.assists+'"><input type="number" placeholder="ACS" style="width:52px" value="'+p.acs+'">'
        div.dataset.team=t+1
        div.dataset.idx=i
        div.dataset.pid=p.id||''
        div.addEventListener('change',function(){upsertPlayer(this.dataset.team,this.dataset.idx,this.dataset.pid)})
        div.addEventListener('keyup',function(){upsertPlayer(this.dataset.team,this.dataset.idx,this.dataset.pid)})
        lists[t].appendChild(div)
      }
    }
  }

  function upsertPlayer(team,idx,pid){
    if(!_mid)return
    var div=$('p'+team+'list').children[idx]
    if(!div)return
    var inputs=div.querySelectorAll('input')
    var d={match_id:_mid,team:parseInt(team,10),sort_order:parseInt(idx,10),name:inputs[0].value,kills:parseInt(inputs[1].value,10)||0,deaths:parseInt(inputs[2].value,10)||0,assists:parseInt(inputs[3].value,10)||0,acs:parseInt(inputs[4].value,10)||0}
    if(pid){_sb.from('players').update(d).eq('id',pid).then(function(r){if(r.error)_log('Error player: '+r.error.message);else _log('Jugador guardado')})}
    else{_sb.from('players').insert(d).select().single().then(function(r){if(r.data)div.dataset.pid=r.data.id})}
  }

  function apply(d){
    if(!d)return
    $('mt').value=d.title||''
    $('ms').value=d.serie||'BO3'
    $('mm').value=d.map||''
    $('t1n').value=d.team1_name||'QU4SAR'
    $('t1s').value=d.team1_score||0
    $('t2n').value=d.team2_name||'OPPONENT'
    $('t2s').value=d.team2_score||0
    $('ww').value=d.wing_width||110
    $('wwv').textContent=d.wing_width||110
    if(d.team1_logo)$('pr1').src=d.team1_logo
    if(d.team2_logo)$('pr2').src=d.team2_logo
    upv(d)
  }

  function upv(d){
    if(!d)d=gs()
    $('pv-mt').textContent=d.title||$('mt').placeholder
    $('pv-ms').textContent=[d.serie||$('ms').value,d.map||$('mm').value].filter(Boolean).join(' | ')
    $('pv-tn1').textContent=d.team1_name||'QU4SAR'
    $('pv-tn2').textContent=d.team2_name||'OPPONENT'
    $('pv-sc1').textContent=d.team1_score||0
    $('pv-sc2').textContent=d.team2_score||0
    $('pv-tn1').style.color=(d.team1_score||0)>(d.team2_score||0)?'#BB86FC':'rgba(255,255,255,0.7)'
    $('pv-tn2').style.color=(d.team2_score||0)>(d.team1_score||0)?'#E74C3C':'rgba(255,255,255,0.7)'
  }

  function _log(m){
    var e=$('status'),c=$('createStatus')
    if(e&&e.offsetParent!==null){e.textContent=m;e.className='st ok';clearTimeout(e._t);e._t=setTimeout(function(){e.textContent='';e.className='st'},2000)}
    if(c){c.textContent=m;c.className='st ok';clearTimeout(c._t);c._t=setTimeout(function(){c.textContent='';c.className='st'},2000)}
  }

  function uploadLogo(file,team,cb){
    var rd=new FileReader()
    rd.onload=function(ev){
      var img=new Image()
      img.onload=function(){
        var max=200,c=document.createElement('canvas'),ctx=c.getContext('2d')
        var w=img.width,h=img.height
        if(w>max||h>max){if(w>h){c.width=max;c.height=Math.round(h*(max/w))}else{c.height=max;c.width=Math.round(w*(max/h))}}
        else{c.width=w;c.height=h}
        ctx.drawImage(img,0,0,c.width,c.height)
        var dataUrl=c.toDataURL('image/webp',0.85)
        var blobBin=atob(dataUrl.split(',')[1]),arr=[]
        for(var i=0;i<blobBin.length;i++)arr.push(blobBin.charCodeAt(i))
        var blob=new Blob([new Uint8Array(arr)],{type:'image/webp'})
        var path=_mid+'/team'+team+'.webp'
        _sb.storage.from('logos').upload(path,blob,{upsert:true}).then(function(r){
          if(r.error){_log('Error logo: '+r.error.message);return}
          var pub=_sb.storage.from('logos').getPublicUrl(path).data.publicUrl
          $('pr'+team).src=pub
          save()
          if(cb)cb()
        })
      }
      img.src=ev.target.result
    }
    rd.readAsDataURL(file)
  }

  document.addEventListener('DOMContentLoaded',function(){
    try{_sb=supabase.createClient(_su,_sk)}catch(e){}

    var h=location.hash.replace(/^#/,'')
    if(h&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(h)&&_sb){
      $('createScreen').style.display='none'
      $('adminPanel').style.display='block'
      if(typeof lucide!=='undefined')lucide.createIcons()
      load(h)
    }else{
      $('createScreen').style.display='flex'
      $('adminPanel').style.display='none'
    }

    $('createBtn').addEventListener('click',function(){
      if(!_sb){_log('Supabase no disponible');return}
      var title=$('createTitle').value||'SCRIM OFICIAL'
      _sb.from('matches').insert({title:title,team1_name:'QU4SAR',team2_name:'OPPONENT',active:true}).select().then(function(r){
        if(r.error){_log('Error: '+r.error.message);return}
        if(r.data&&r.data[0]){
          location.hash=r.data[0].id
          $('createScreen').style.display='none'
          $('adminPanel').style.display='block'
          if(typeof lucide!=='undefined')lucide.createIcons()
          load(r.data[0].id)
        }
      })
    })

    var tabMap={teams:'tab-teams',match:'tab-match',timer:'tab-timer',players:'tab-players',lowerthird:'tab-lowerthird',mvp:'tab-mvp',break:'tab-break',tools:'tab-tools'}
    document.querySelectorAll('.tab').forEach(function(t){
      t.addEventListener('click',function(){
        document.querySelectorAll('.tab').forEach(function(x){x.classList.remove('act')})
        document.querySelectorAll('.tab-content').forEach(function(x){x.classList.remove('act')})
        this.classList.add('act')
        var id=tabMap[this.dataset.tab]
        if(id&&$(id))$(id).classList.add('act')
      })
    })

    document.querySelectorAll('.sc-ctrl button,.qbtns button').forEach(function(b){
      b.addEventListener('click',function(){
        var t=this.dataset.t,d=parseInt(this.dataset.d,10),inp=$('t'+t+'s'),v=parseInt(inp.value,10)||0
        inp.value=Math.max(0,v+d);save()
      })
    })

    document.querySelectorAll('.logo-upload input[type=file]').forEach(function(inp){
      inp.addEventListener('change',function(e){
        var f=e.target.files[0];if(!f||!_mid)return
        uploadLogo(f,inp.dataset.t)
      })
    })

    document.querySelectorAll('input,select').forEach(function(el){
      el.addEventListener('change',function(){save(upv)})
      el.addEventListener('keyup',function(){save(upv)})
    })

    $('ww').addEventListener('input',function(){
      $('wwv').textContent=this.value
    })
    $('ww').addEventListener('change',function(){
      $('wwv').textContent=this.value
      save()
    })

    $('saveBtn').addEventListener('click',function(){save(upv)})
    $('resetBtn').addEventListener('click',function(){
      $('t1s').value='0';$('t2s').value='0';save()
    })
    $('exportBtn').addEventListener('click',function(){
      var d=gs(),bl=new Blob([JSON.stringify(d,null,2)],{type:'application/json'}),u=URL.createObjectURL(bl)
      var a=document.createElement('a');a.href=u;a.download='qu4sar-scoreboard.json';a.click()
      URL.revokeObjectURL(u);_log('JSON exportado')
    })
    $('importBtn').addEventListener('click',function(){$('importFile').click()})
    $('openOverlayBtn').addEventListener('click',function(){
      var u='https://qu4sarweb.github.io/OVERLAYS/overlay.html'
      _ow=window.open(u,'qu4sar_overlay')
    })
    $('shareBtn').addEventListener('click',function(){
      var u='https://qu4sarweb.github.io/OVERLAYS/overlay.html'
      try{navigator.clipboard.writeText(u).then(function(){_log('Link copiado')})}catch(e){
        var inp=document.createElement('input');inp.value=u;document.body.appendChild(inp);inp.select();document.execCommand('copy');document.body.removeChild(inp);_log('Link copiado')
      }
    })
    $('tmStart').addEventListener('click',function(){
      if(!_mid)return
      _sb.from('timer_state').update({running:true,elapsed:0,duration:parseInt($('tmDur').value,10)||300}).eq('match_id',_mid).then(function(r){if(r.error)_log('Error: '+r.error.message);else _log('Timer iniciado')})
    })
    $('tmPause').addEventListener('click',function(){
      if(!_mid)return
      _sb.from('timer_state').update({running:false}).eq('match_id',_mid).then(function(r){if(r.error)_log('Error: '+r.error.message);else _log('Timer pausado')})
    })
    $('tmReset').addEventListener('click',function(){
      if(!_mid)return
      _sb.from('timer_state').update({running:false,elapsed:0,duration:parseInt($('tmDur').value,10)||300}).eq('match_id',_mid).then(function(r){if(r.error)_log('Error: '+r.error.message);else _log('Timer reseteado')})
    })
    $('tmLbl').addEventListener('change',function(){saveTimer()})
    $('tmDur').addEventListener('change',function(){saveTimer()})

    $('ltShow').addEventListener('click',function(){
      saveLowerThird({title:$('ltTitle').value,subtitle:$('ltSubtitle').value,visible:true})
    })
    $('ltHide').addEventListener('click',function(){
      saveLowerThird({visible:false})
    })
    $('ltTitle').addEventListener('keyup',function(){
      saveLowerThird({title:this.value,subtitle:$('ltSubtitle').value,visible:true})
    })
    $('ltSubtitle').addEventListener('keyup',function(){
      saveLowerThird({title:$('ltTitle').value,subtitle:this.value,visible:true})
    })

    $('mvpShow').addEventListener('click',function(){
      saveMvp({player_name:$('mvpPlayer').value,team_name:$('mvpTeam').value,stat_line:$('mvpStat').value,visible:true})
    })
    $('mvpHide').addEventListener('click',function(){
      saveMvp({visible:false})
    })
    $('mvpPlayer').addEventListener('keyup',function(){
      saveMvp({player_name:this.value,team_name:$('mvpTeam').value,stat_line:$('mvpStat').value,visible:true})
    })
    $('mvpTeam').addEventListener('keyup',function(){
      saveMvp({player_name:$('mvpPlayer').value,team_name:this.value,stat_line:$('mvpStat').value,visible:true})
    })
    $('mvpStat').addEventListener('keyup',function(){
      saveMvp({player_name:$('mvpPlayer').value,team_name:$('mvpTeam').value,stat_line:this.value,visible:true})
    })

    $('brkShow').addEventListener('click',function(){
      saveBreak({title:$('brkTitle').value,subtitle:$('brkSubtitle').value,timer_seconds:parseInt($('brkTimer').value,10)||120,visible:true,timer_running:false})
    })
    $('brkHide').addEventListener('click',function(){
      saveBreak({visible:false,timer_running:false})
    })
    $('brkTimerStart').addEventListener('click',function(){
      if(!_mid)return
      _sb.from('break_screen').update({timer_running:true,timer_seconds:parseInt($('brkTimer').value,10)||120}).eq('match_id',_mid).then(function(r){if(r.error)_log('Error: '+r.error.message);else _log('Timer iniciado')})
    })
    $('brkTimerStop').addEventListener('click',function(){
      if(!_mid)return
      _sb.from('break_screen').update({timer_running:false}).eq('match_id',_mid).then(function(r){if(r.error)_log('Error: '+r.error.message);else _log('Timer detenido')})
    })

    $('importFile').addEventListener('change',function(e){
      var f=e.target.files[0];if(!f)return
      var rd=new FileReader()
      rd.onload=function(ev){try{var d=JSON.parse(ev.target.result);apply(d);save()}catch(e){var st=$('status');st.textContent='JSON inv\u00e1lido';st.className='st err'}}
      rd.readAsText(f)
    })
  })
})();
