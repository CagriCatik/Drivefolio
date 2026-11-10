// This overlay never captures input: driving and world interactions stay on canvas.
export function createWorldHoverFeedback(canvas){
 const badge=document.createElement('div');badge.className='world-hover-badge';badge.hidden=true;badge.setAttribute('aria-hidden','true');
 const dot=document.createElement('span');dot.className='world-hover-dot';const text=document.createElement('strong');badge.append(dot,text);document.body.append(badge);
 let x=0,y=0,over=false;
 canvas.addEventListener('pointermove',event=>{over=event.pointerType!=='touch';x=event.clientX;y=event.clientY;},{passive:true});
 canvas.addEventListener('pointerleave',()=>{over=false;badge.hidden=true;});
 window.addEventListener('blur',()=>{over=false;badge.hidden=true;});
 return {update(title){const active=over&&!!title;badge.hidden=!active;canvas.classList.toggle('neon-target-hovered',active);if(!active)return;text.textContent=title;badge.style.left=`${Math.max(10,Math.min(x+24,window.innerWidth-badge.offsetWidth-12))}px`;badge.style.top=`${Math.max(10,Math.min(y+20,window.innerHeight-badge.offsetHeight-12))}px`;}};
}
