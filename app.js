(function(){
  const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];

  // 流れる帯の複製
  $$('[data-dup]').forEach(t=>{t.innerHTML+=t.innerHTML;});

  // reveal
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target);}}),{threshold:.15});
  $$('.rv,.pills,.shout__big').forEach(el=>io.observe(el));
  $$('.pills li').forEach((li,i)=>li.style.setProperty('--i',i));

  // 叫び見出しの文字分割
  $$('.shout__big').forEach(el=>{
    let i=0;
    const walk=n=>{[...n.childNodes].forEach(c=>{
      if(c.nodeType===3){const f=document.createDocumentFragment();[...c.textContent].forEach(ch=>{const s=document.createElement('span');s.className='ch';s.style.setProperty('--i',i++);s.textContent=ch;f.appendChild(s);});c.replaceWith(f);}
      else if(c.tagName!=='BR') walk(c);
    });};
    walk(el);
  });

  // count up
  const cio=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting)return;cio.unobserve(e.target);
    const el=e.target,to=+el.dataset.count,t0=performance.now(),d=1000;
    const step=t=>{const p=Math.min(1,(t-t0)/d);el.textContent=Math.round(to*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(step);};
    requestAnimationFrame(step);
  }),{threshold:.5});
  $$('[data-count]').forEach(el=>cio.observe(el));

  // before/after slider
  const cmp=$('#cmp');
  if(cmp){
    const range=$('.cmp__range',cmp),before=$('.cmp__before',cmp),handle=$('.cmp__handle',cmp);
    const set=v=>{before.style.setProperty('--x',v+'%');before.style.setProperty('--xr',v/100||.001);handle.style.setProperty('--x',v+'%');};
    range.addEventListener('input',()=>set(+range.value));
    set(50);
    const demo=new IntersectionObserver(es=>es.forEach(e=>{
      if(!e.isIntersecting)return;demo.disconnect();
      let t0=performance.now();
      const anim=t=>{const p=Math.min(1,(t-t0)/1400);const v=50+Math.sin(p*Math.PI*2)*22*(1-p);set(v);range.value=v;if(p<1)requestAnimationFrame(anim);};
      requestAnimationFrame(anim);
    }),{threshold:.6});
    demo.observe(cmp);
  }

  // toc sync
  const links=$$('.toc a'), secs=$$('[data-index]');
  const sio=new IntersectionObserver(es=>es.forEach(e=>{
    if(!e.isIntersecting)return;
    const id=e.target.id;links.forEach(a=>a.classList.toggle('is-current',a.getAttribute('href')==='#'+id));
  }),{rootMargin:'-35% 0px -55% 0px'});
  secs.forEach(s=>sio.observe(s));

  // sticky cta (after FV)
  const fv=$('.fv'),st=$('.stick');
  const onScroll=()=>{if(fv&&st)st.classList.toggle('is-on',fv.getBoundingClientRect().bottom<0);};
  addEventListener('scroll',onScroll,{passive:true});onScroll();

  // 叫び区画の動画は見えたら再生(速度対策)
  const lv=$('[data-lazyplay]');
  if(lv){const vio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){lv.play().catch(()=>{});}else{lv.pause();}}),{threshold:.3});vio.observe(lv);}

  // お問い合わせフォーム: 本番の /api/contact (Cloudflare Pages Functions) へ送信。営業ガードは現行LPと同じ(判定語2語以上で送信しない)
  const form=$('#cform');
  if(form){
    const btn=$('#contact-submit-btn',form),status=$('#contact-status',form),API='/api/contact';
    const salesWords=['ご提案','突然のご連絡','配信停止','無料相談','資料請求','導入実績','代表取締役','代表を務め','協業','営業代行','助成金','ホームページを拝見','集客支援','口コミ','お打ち合わせの時間','ご返信いただけますと幸い','無料でさせていただ','お力になれ','貴社のサービス','サービスのご案内'];
    const isSales=t=>salesWords.filter(w=>t.indexOf(w)!==-1).length>=2;
    const showSalesNg=()=>{let ng=$('#bh-noeigyo-ng');if(!ng){ng=document.createElement('div');ng.id='bh-noeigyo-ng';ng.className='form__salesng';ng.innerHTML='営業・勧誘と判断される内容のため送信できません。当フォームでは営業のご連絡を受け付けておりません。<br>営業目的で送信された場合、対応手数料として1件あたり5,500円(税込)を請求いたします。<br>サービスのご利用に関するご用件でこの表示が出た場合は、お手数ですが各ツール画面の「ご要望・不具合」からお知らせください。';form.parentNode.insertBefore(ng,form);}ng.style.display='block';ng.scrollIntoView({block:'center'});};
    const setStatus=(cls,msg)=>{status.className='form__status'+(cls?' '+cls:'');status.textContent=msg;};
    form.addEventListener('submit',async e=>{
      e.preventDefault();setStatus('','');
      const email=(form.email.value||'').trim(),message=(form.message.value||'').trim();
      if(isSales(message)){showSalesNg();return;}
      if(!email||!email.includes('@')){setStatus('is-ng','メールアドレスをご確認ください。');form.email.focus();return;}
      if(!message||message.length<5){setStatus('is-ng','お問い合わせ内容を 5 文字以上ご入力ください。');form.message.focus();return;}
      if(!form.consent.checked){setStatus('is-ng','プライバシーポリシーへの同意にチェックを入れてください。');return;}
      const data={name:form.name.value||'',email,company:form.company.value||'',type:form.type.value||'',message,source:'lp-v3',website:(form.website&&form.website.value)||''};
      btn.disabled=true;btn.classList.add('is-busy');const label=btn.querySelector('span');const orig=label.textContent;label.textContent='送信中...';
      try{
        const res=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
        const json=await res.json().catch(()=>({}));
        if(res.ok&&json.ok){setStatus('is-ok','お問い合わせを受け付けました。1〜2 営業日以内にご返信いたします。');form.reset();try{if(window.gtag)gtag('event','contact_submit',{source:'lp-v3'});}catch(_){}}
        else{setStatus('is-ng',(json&&json.error&&json.error.message)||'送信に失敗しました。お手数ですが再度お試しください。');}
      }catch(err){setStatus('is-ng','ネットワークエラー: '+(err.message||String(err)));}
      finally{btn.disabled=false;btn.classList.remove('is-busy');label.textContent=orig;}
    });
  }
})();
