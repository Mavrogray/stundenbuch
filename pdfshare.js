/* PDF aus den Bogen-Seiten erzeugen und teilen – offline (pdf-lib, MIT) */
(function(){
function loadLib(){return window.PDFLib?Promise.resolve():new Promise((ok,no)=>{const s=document.createElement('script');s.src='pdf-lib.min.js';s.onload=ok;s.onerror=()=>no(new Error('pdf-lib.min.js fehlt'));document.head.appendChild(s);});}
function css(){return [...document.querySelectorAll('style')].map(s=>s.textContent).join('\n');}
async function pageToJpeg(page,scale){
  const W=794,Hh=1123,c=page.cloneNode(true);c.classList.remove('green');c.style.transform='none';c.style.boxShadow='none';c.style.background='#fff';c.style.margin='0';
  const st=css()+'\n.page{--paper:#fff!important;background:#fff!important}';
  const body=new XMLSerializer().serializeToString(c);
  const html=`<div xmlns="http://www.w3.org/1999/xhtml" style="width:${W}px;height:${Hh}px;background:#fff"><style><![CDATA[${st.replace(/]]>/g,'')}]]></style>${body}</div>`;
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Hh}"><foreignObject x="0" y="0" width="100%" height="100%">${html}</foreignObject></svg>`;
  const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await img.decode();
  const cv=document.createElement('canvas');cv.width=Math.round(W*scale);cv.height=Math.round(Hh*scale);const g=cv.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,cv.width,cv.height);g.scale(scale,scale);g.drawImage(img,0,0);
  return await new Promise(r=>cv.toBlob(b=>b.arrayBuffer().then(r),'image/jpeg',0.9));}
window.makePdf=async function(pages,scale){await loadLib();const doc=await PDFLib.PDFDocument.create();
  for(const p of pages){const jpg=await doc.embedJpg(await pageToJpeg(p,scale||2.5));const pg=doc.addPage([595.28,841.89]);pg.drawImage(jpg,{x:0,y:0,width:595.28,height:841.89});}
  return await doc.save();};
window.sharePdf=async function(pages,name,title){const bytes=await window.makePdf(pages);const file=new File([bytes],name,{type:'application/pdf'});
  if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title});return 'geteilt';}catch(e){if(e.name==='AbortError')return 'abgebrochen';}}
  const a=document.createElement('a');a.href=URL.createObjectURL(file);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},2000);return 'gespeichert';};
})();
