// retarded idea like super retarded
document.addEventListener('DOMContentLoaded', () => {
  const proxsel = document.getElementById('proxysel'); 

  let scr = 'getajob.js';
  const lastprox = localStorage.getItem('sproxy'); 

  if (lastprox === 'envade') {
    scr = 'g.js';
  }


  const s = document.createElement('script');
  s.src = scr;

  document.body.appendChild(s);

  if (proxsel) {
    proxsel.addEventListener('change', (e) => {
      const sel = e.target.value;
      localStorage.setItem('sproxy', sel);
      location.reload();
    });
  }
});
