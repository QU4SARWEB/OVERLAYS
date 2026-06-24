(function(){
  var K='qu4sar_scoreboard';
  var C='qu4sar_channel';
  var D={t1n:'QU4SAR',t1s:0,t1l:'assets/logos/team1.svg',t2n:'OPPONENT',t2s:0,t2l:'assets/logos/team2.svg',mt:'SCRIM OFICIAL',ms:'BO3',mm:'',ww:110};

  var _bc;
  var _ow;

  function $(i){return document.getElementById(i)}

  function load(){try{var r=localStorage.getItem(K);return r?JSON.parse(r):null}catch(e){return null}}

  function broadcast(d){
    if(!_bc)try{_bc=new BroadcastChannel(C)}catch(e){}
    if(_bc)try{_bc.postMessage({type:'update',data:d})}catch(e){}
    if(_ow&&!_ow.closed)try{_ow.postMessage({type:'update',data:d},'*')}catch(e){}
  }

  function save(d){
    localStorage.setItem(K,JSON.stringify(d))
    broadcast(d)
  }

  function gs(){
    return{
      t1n:$('t1n').value||D.t1n, t1s:parseInt($('t1s').value,10)||0, t1l:$('pr1').src||D.t1l,
      t2n:$('t2n').value||D.t2n, t2s:parseInt($('t2s').value,10)||0, t2l:$('pr2').src||D.t2l,
      mt:$('mt').value||D.mt, ms:$('ms').value||D.ms, mm:$('mm').value||D.mm,
      ww:parseInt($('ww').value,10)||D.ww
    }
  }

  function apply(d){
    if(!d)return
    $('t1n').value=d.t1n;$('t1s').value=d.t1s
    $('t2n').value=d.t2n;$('t2s').value=d.t2s
    $('mt').value=d.mt;$('ms').value=d.ms;$('mm').value=d.mm
    if(d.t1l&&!d.t1l.startsWith('http'))$('pr1').src=d.t1l
    if(d.t2l&&!d.t2l.startsWith('http'))$('pr2').src=d.t2l
    if(d.ww){$('ww').value=d.ww;$('wwv').textContent=d.ww}
    upv(d)
  }

  function upv(d){
    if(!d)d=gs()
    $('pv-mt').textContent=d.mt
    $('pv-ms').textContent=[d.ms,d.mm].filter(Boolean).join(' | ')
    $('pv-tn1').textContent=d.t1n;$('pv-tn2').textContent=d.t2n
    $('pv-sc1').textContent=d.t1s;$('pv-sc2').textContent=d.t2s
    $('pv-tn1').style.color= d.t1s>d.t2s?'#BB86FC':'rgba(255,255,255,0.7)'
    $('pv-tn2').style.color= d.t2s>d.t1s?'#E74C3C':'rgba(255,255,255,0.7)'
  }

  function autosave(){var d=gs();save(d);upv(d);_log('Auto-guardado')}

  function _log(m){var e=$('status');e.textContent=m;e.className='st ok';
    clearTimeout(e._t);e._t=setTimeout(function(){e.textContent='';e.className='st'},2000)}

  document.addEventListener('DOMContentLoaded',function(){
    var d=load()||D;apply(d);upv(d)
    if(typeof lucide!=='undefined')lucide.createIcons()

    document.querySelectorAll('.tab').forEach(function(t){
      t.addEventListener('click',function(){
        document.querySelectorAll('.tab').forEach(function(x){x.classList.remove('act')})
        document.querySelectorAll('.tab-content').forEach(function(x){x.classList.remove('act')})
        this.classList.add('act')
        var id=this.dataset.tab
        if(id==='teams'){$('tab-teams').classList.add('act')}
        else if(id==='match'){$('tab-match').classList.add('act')}
        else if(id==='tools'){$('tab-tools').classList.add('act')}
      })
    })

    document.querySelectorAll('.sc-ctrl button,.qbtns button').forEach(function(b){
      b.addEventListener('click',function(){
        var t=this.dataset.t,d=parseInt(this.dataset.d,10),inp=$('t'+t+'s'),v=parseInt(inp.value,10)||0
        inp.value=Math.max(0,v+d);autosave()
      })
    })

    document.querySelectorAll('.logo-upload input[type=file]').forEach(function(inp){
      inp.addEventListener('change',function(e){
        var f=e.target.files[0];if(!f)return
        var rd=new FileReader(),pid=inp.dataset.p
        rd.onload=function(ev){
          var du=ev.target.result
          $(''+pid).src=du
          autosave()
        }
        rd.readAsDataURL(f)
      })
    })

    document.querySelectorAll('input,select').forEach(function(el){
      el.addEventListener('change',autosave)
      el.addEventListener('keyup',autosave)
    })

    $('ww').addEventListener('input',function(){
      $('wwv').textContent=this.value
    })
    $('ww').addEventListener('change',function(){
      $('wwv').textContent=this.value
      autosave()
    })

    $('saveBtn').addEventListener('click',autosave)
    $('resetBtn').addEventListener('click',function(){
      $('t1s').value='0';$('t2s').value='0';autosave()
    })
    $('exportBtn').addEventListener('click',function(){
      var d=gs(),bl=new Blob([JSON.stringify(d,null,2)],{type:'application/json'}),u=URL.createObjectURL(bl)
      var a=document.createElement('a');a.href=u;a.download='qu4sar-scoreboard.json';a.click()
      URL.revokeObjectURL(u);_log('JSON exportado')
    })
    $('importBtn').addEventListener('click',function(){$('importFile').click()})
    $('openOverlayBtn').addEventListener('click',function(){
      _ow=window.open('overlay.html'+location.search+(location.search?'&':'?')+'t1s='+$('t1s').value+'&t2s='+$('t2s').value,'qu4sar_overlay')
      _log('Overlay abierto')
      var d=gs();save(d)
    })
    $('shareBtn').addEventListener('click',function(){
      var d=gs()
      var url='overlay.html?t1n='+encodeURIComponent(d.t1n)+'&t1s='+d.t1s+'&t2n='+encodeURIComponent(d.t2n)+'&t2s='+d.t2s+'&mt='+encodeURIComponent(d.mt)+'&ms='+encodeURIComponent(d.ms)+'&mm='+encodeURIComponent(d.mm)+'&ww='+d.ww
      try{navigator.clipboard.writeText(url).then(function(){_log('Link copiado')})}catch(e){
        var inp=document.createElement('input');inp.value=url;document.body.appendChild(inp);inp.select();document.execCommand('copy');document.body.removeChild(inp);_log('Link copiado')
      }
    })
    $('importFile').addEventListener('change',function(e){
      var f=e.target.files[0];if(!f)return
      var rd=new FileReader()
      rd.onload=function(ev){try{var d=JSON.parse(ev.target.result);apply(d);autosave();_log('Importado')}catch(e){var st=$('status');st.textContent='JSON inv\u00e1lido';st.className='st err'}}
      rd.readAsText(f)
    })
  })
})();
