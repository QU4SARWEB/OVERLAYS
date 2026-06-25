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
      if(r.data)apply(r.data)
    })
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

    document.querySelectorAll('.tab').forEach(function(t){
      t.addEventListener('click',function(){
        document.querySelectorAll('.tab').forEach(function(x){x.classList.remove('act')})
        document.querySelectorAll('.tab-content').forEach(function(x){x.classList.remove('act')})
        this.classList.add('act')
        var id=this.dataset.tab
        if(id==='teams')$('tab-teams').classList.add('act')
        else if(id==='match')$('tab-match').classList.add('act')
        else if(id==='tools')$('tab-tools').classList.add('act')
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
    $('importFile').addEventListener('change',function(e){
      var f=e.target.files[0];if(!f)return
      var rd=new FileReader()
      rd.onload=function(ev){try{var d=JSON.parse(ev.target.result);apply(d);save()}catch(e){var st=$('status');st.textContent='JSON inv\u00e1lido';st.className='st err'}}
      rd.readAsText(f)
    })
  })
})();
