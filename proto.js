/* Protokolle (Werkstattauftrag, Prüfprotokoll, KSB-Inbetriebnahme) – gespeichert in der Gerätedatenbank (IndexedDB),
   je Protokoll ein Datensatz: {id,type,order,created,updated,meta:{kunde,nr,obj},state} */
(function(){
const DB='stundenbuch-proto',ST='p';
let dbp=null;
function db(){if(dbp)return dbp;dbp=new Promise((ok,no)=>{if(!window.indexedDB)return no(new Error('Keine Gerätedatenbank'));const r=indexedDB.open(DB,1);
  r.onupgradeneeded=()=>{const s=r.result.createObjectStore(ST,{keyPath:'id'});s.createIndex('order','order');};
  r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error);});return dbp;}
function tx(mode,fn){return db().then(d=>new Promise((ok,no)=>{const t=d.transaction(ST,mode),s=t.objectStore(ST),res=fn(s);t.oncomplete=()=>ok(res&&res.result!==undefined?res.result:res);t.onerror=()=>no(t.error);}));}
const P={
  TYPES:{wa:{n:'Werkstattauftrag',f:'werkstattauftrag.html',ic:'📋'},pp:{n:'Prüfprotokoll',f:'pruefprotokoll.html',ic:'⚡'},ibn:{n:'KSB-Inbetriebnahme',f:'ksb-ibn.html',ic:'💧'}},
  id:new URLSearchParams(location.search).get('id'),
  view:new URLSearchParams(location.search).get('view')==='1',
  get:id=>tx('readonly',s=>s.get(id)),
  all:()=>tx('readonly',s=>s.getAll()),
  put:rec=>tx('readwrite',s=>{s.put(rec);}),
  del:id=>tx('readwrite',s=>{s.delete(id);}),
  uid:()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7),
  /* neues Protokoll anlegen, liefert die id */
  create(type,order,state){const now=Date.now(),rec={id:P.uid(),type,order:order||null,created:now,updated:now,meta:{},state:state||null};return P.put(rec).then(()=>rec.id);},
  url(rec,view){return P.TYPES[rec.type].f+'?id='+encodeURIComponent(rec.id)+(view?'&view=1':'');},
  /* Formular-Anbindung: speichert verzögert, damit Tippen flüssig bleibt */
  _t:null,_rec:null,
  async load(){if(!P.id)return null;try{P._rec=await P.get(P.id);}catch(e){P._rec=null;}return P._rec;},
  save(state,meta,extra){if(!P.id||!P._rec)return;P._rec.state=state;P._rec.meta=Object.assign(P._rec.meta||{},meta||{});if(extra)Object.assign(P._rec,extra);P._rec.updated=Date.now();
    clearTimeout(P._t);const r=P._rec;P._t=setTimeout(()=>P.put(r).catch(e=>{const m=document.getElementById('msg')||document.getElementById('sbMsg');if(m)m.textContent='Speichern fehlgeschlagen: '+e.message;}),250);},
  flush(){if(P._t&&P._rec){clearTimeout(P._t);P._t=null;return P.put(P._rec);}return Promise.resolve();}
};
addEventListener('pagehide',()=>{if(P._t&&P._rec){clearTimeout(P._t);P.put(P._rec);}});
window.PROTO=P;
})();
