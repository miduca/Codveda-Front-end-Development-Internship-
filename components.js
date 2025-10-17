(function(){
  // Accessible modal utilities with focus trapping and ESC/backdrop close
  const openButtons = document.querySelectorAll('[data-open-modal]');
  const CLOSE_SELECTOR = '[data-close-modal], .modal';

  const trapFocus = (container) => {
    const focusable = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    function onKey(e){
      if(e.key === 'Tab'){
        if(e.shiftKey && document.activeElement === first){
          e.preventDefault(); last && last.focus();
        } else if(!e.shiftKey && document.activeElement === last){
          e.preventDefault(); first && first.focus();
        }
      }
      if(e.key === 'Escape'){
        closeModal(container.closest('.modal'));
      }
    }
    container.addEventListener('keydown', onKey);
    return () => container.removeEventListener('keydown', onKey);
  };

  const state = new Map(); // modal -> cleanup

  function openModal(modal){
    if(!modal) return;
    modal.hidden = false;
    const dialog = modal.querySelector('.modal-dialog');
    const cleanup = trapFocus(dialog);
    state.set(modal, cleanup);
    modal._returnFocus = document.activeElement;
    const first = dialog.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    (first || dialog).focus();
    modal.addEventListener('click', onBackdrop);
  }

  function onBackdrop(e){
    if(e.target.classList.contains('modal')){
      closeModal(e.currentTarget);
    }
  }

  function closeModal(modal){
    if(!modal) return;
    modal.hidden = true;
    modal.removeEventListener('click', onBackdrop);
    const cleanup = state.get(modal);
    if(cleanup){ cleanup(); state.delete(modal); }
    if(modal._returnFocus && typeof modal._returnFocus.focus === 'function'){
      modal._returnFocus.focus();
    }
  }

  openButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const sel = btn.getAttribute('data-open-modal');
      const modal = document.querySelector(sel);
      openModal(modal);
    });
  });

  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest(CLOSE_SELECTOR);
    if(!closeBtn) return;
    const modal = e.target.closest('.modal');
    if(modal){
      if(e.target.matches('[data-close-modal]')){
        closeModal(modal);
      }
    }
  });
})();
