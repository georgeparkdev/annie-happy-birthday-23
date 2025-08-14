/* Lightweight console analytics */
(function(){
  const ns = '[bday23]';
  const log = (...args) => console.log(ns, ...args);
  const warn = (...args) => console.warn(ns, ...args);
  const error = (...args) => console.error(ns, ...args);

  // Public minimal API
  window.Tracker = {
    log, warn, error,
    event: (name, data={}) => log('event:', name, data),
    sectionView: (id) => log('section-view:', id),
    quizSelect: (qid, choice) => log('quiz-select:', { qid, choice }),
    complete: () => log('complete')
  };

  // IntersectionObserver for reveal + section view logging
  const supportsIO = 'IntersectionObserver' in window;
  if(supportsIO){
    const io = new IntersectionObserver((entries)=>{
      for(const entry of entries){
        if(entry.isIntersecting){
          entry.target.classList.add('in-view');
          const id = entry.target.getAttribute('id');
          if(id) window.Tracker.sectionView(id);
          io.unobserve(entry.target);
        }
      }
    }, { threshold: 0.25 });

    document.querySelectorAll('section.chapter').forEach((sec)=>{
      sec.classList.add('reveal');
      io.observe(sec);
    });
  } else {
    log('IntersectionObserver not supported; skipping reveal');
  }
})();
