(function(){
 const S=()=>window.PIMStore.state, data=(n)=>S().payload?.data?.[n]||[], active=(r)=>!window.PIM_CONFIG.INACTIVE.includes(r.status||r.statusKehadiran||r.statusPenumpang||'');
 const by=(n,id)=>S().index?.[n]?.[id]||null;
 function name(n,id,field){const r=by(n,id);return r?(r[field]||'Data terkait belum tersedia'):'Data terkait belum tersedia';}
 function guestTravel(id){return data('PERJALANAN').filter(r=>r.idTamu===id&&active(r)).sort((a,b)=>(a.urutanSegmen||0)-(b.urutanSegmen||0));}
 function guestLO(id){return data('PENUGASAN_LO').filter(r=>r.idTamu===id&&active(r)).map(a=>({...a,lo:by('LO',a.idLo)}));}
 function guestAccommodation(id){return data('PENUGASAN_AKOMODASI').filter(r=>r.idTamu===id&&active(r)).map(a=>({...a,unit:by('AKOMODASI',a.idAkomodasi)}));}
 function guestVehicles(id){return data('PENUGASAN_KENDARAAN').filter(r=>r.idTamu===id&&active(r)).map(a=>({...a,vehicle:by('KENDARAAN',a.idKendaraan)}));}
 function guests(){return data('TAMU').filter(active).map(g=>({...g,organisasi:name('ORGANISASI',g.idOrganisasi,'namaResmi'),travel:guestTravel(g.idTamu),lo:guestLO(g.idTamu),accommodation:guestAccommodation(g.idTamu),vehicles:guestVehicles(g.idTamu)}));}
 function localTravel(g){const t=g.travel||[];return t.some(x=>x.moda==='Local'||x.statusPenumpang==='Not Required');}
 function travelLabel(g,type){if(localTravel(g))return 'Lokal · Tidak perlu penerbangan';const t=(g.travel||[]).find(x=>x.tipe===type);if(!t)return 'TBC';const dt=t.efektifBerangkat||t.efektifTiba;return `${t.statusPenumpang==='Confirmed'?'Flight Manifest':'Estimasi'} ${type} · ${fmtDateTime(dt)}`;}
 function fmtDateTime(v){if(!v)return 'TBC';const d=new Date(v);return isNaN(d)?String(v).replace('T',' · '):new Intl.DateTimeFormat('id-ID',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Jakarta'}).format(d).replace(',', ' ·');}
 function headcounts(){return data('HEADCOUNT_ACARA').filter(active);}
 function headcount(id){return by('HEADCOUNT_ACARA',id);}
 function dashboard(){const hc=Object.fromEntries(headcounts().map(x=>[x.idHeadcount,x]));const vehicles=data('KENDARAAN').filter(active);return {vip:hc['HC-003']?.nilaiEfektif||65,raker:hc['HC-001']?.nilaiEfektif||236,plenary:hc['HC-002']?.nilaiEfektif||500,capacity:hc['HC-011']?.nilaiEfektif||110,occupied:hc['HC-010']?.nilaiEfektif||72,tbc:hc['HC-012']?.nilaiEfektif||15,vehicles:vehicles.length,minPI:vehicles.filter(x=>x.sumberPenyediaan==='Minimum PI').length,addPIM:vehicles.filter(x=>x.sumberPenyediaan==='Tambahan PIM').length,validation:S().payload?.validation||{errors:0,warnings:0},issues:data('ISSUES').filter(active),impacts:data('IMPACT_REVIEW').filter(x=>['Open','Action Required','Reviewed'].includes(x.statusReview))};}
 function readiness(){return data('ACARA').filter(x=>x.idAcara!=='EVT-000').map(e=>{const rows=data('CHECKLIST').filter(x=>x.idAcara===e.idAcara&&active(x)&&x.status!=='N/A');return {event:e.namaSingkat||e.namaResmi,total:rows.length,progress:rows.length?Math.round(rows.reduce((s,x)=>s+Number(x.progress||0),0)/rows.length):0,blocked:rows.filter(x=>x.status==='Blocked').length};});}
 function sourceFor(record){
  if(!record)return null;let id=record.idSumber||record.idSumberTerakhir;
  if(!id&&record.idKonsumsi){const h=headcount(record.idHeadcount);id=h?.idSumber;}
  if(!id&&record.idAkomodasi)id='SRC-009';
  if(!id&&(record.idLo||record.idPenugasanLo))id='SRC-008';
  if(!id&&record.idChecklist)id='SRC-004';
  if(!id&&(record.idKendaraan||record.idPenugasanKendaraan||record.idRundown))id='SRC-001';
  const s=by('SUMBER_DATA',id);if(!s)return null;
  return {...s,method:record.idHeadcount?'Nilai efektif dari HEADCOUNT_ACARA dan basis aktif':record.idKonsumsi?'Jumlah dasar × buffer, dibulatkan ke atas':'Join data berdasarkan ID permanen',filters:'Record aktif; Cancelled, Replaced, Removed, Superseded, dan Inactive tidak ditampilkan secara umum',comparison:record.idHeadcount?`Referensi ${record.referensiPi??'—'} · Workbook ${record.hitungWorkbook??'—'}`:'Tidak menggunakan pencocokan nama'};
}
 window.PIMSelectors={data,by,name,guests,travelLabel,fmtDateTime,headcounts,headcount,dashboard,readiness,sourceFor,active};
})();
