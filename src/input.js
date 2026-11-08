export function createInput() {
  const keys = new Set();
  const owned = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'ShiftLeft', 'ShiftRight', 'KeyJ', 'KeyH', 'KeyE'];
  let enabled = true;
  const clear = () => { keys.clear(); };
  window.addEventListener('keydown', e => {
    if (!enabled || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (owned.includes(e.code)) { e.preventDefault(); keys.add(e.code); }
  });
  window.addEventListener('keyup', e => keys.delete(e.code));
  window.addEventListener('blur', clear);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clear(); });
  document.querySelectorAll('[data-drive]').forEach(button => {
    const code = button.dataset.drive;
    button.addEventListener('pointerdown', e => {
      if (!enabled) return;
      e.preventDefault(); button.setPointerCapture(e.pointerId); keys.add(code);
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => button.addEventListener(type, () => keys.delete(code)));
  });
  return {
    read: () => ({
      throttle: Number(keys.has('KeyW') || keys.has('ArrowUp')) - Number(keys.has('KeyS') || keys.has('ArrowDown')),
      steering: Number(keys.has('KeyA') || keys.has('ArrowLeft')) - Number(keys.has('KeyD') || keys.has('ArrowRight')),
      brake: keys.has('Space'),
      boost: keys.has('ShiftLeft') || keys.has('ShiftRight'),
      jump: keys.has('KeyJ'),
      horn: keys.has('KeyH'),
      interact: keys.has('KeyE'),
    }),
    setEnabled(value) { enabled = value; clear(); },
    clear,
  };
}
