window.addEventListener('scroll', () => {
  const header = document.querySelector('header');
  const progressBar = document.getElementById('progress-bar');
  const scrollPosition = window.scrollY;
  const totalHeight = document.body.scrollHeight - window.innerHeight;

  // Header Background
  if (scrollPosition > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  // Progress Bar
  const progress = (scrollPosition / totalHeight) * 100;
  progressBar.style.width = progress + '%';

  // Reveal Sections
  const reveals = document.querySelectorAll('.reveal');
  reveals.forEach(reveal => {
    const windowHeight = window.innerHeight;
    const revealTop = reveal.getBoundingClientRect().top;
    const revealPoint = 150;

    if (revealTop < windowHeight - revealPoint) {
      reveal.classList.add('active');
    }
  });
});

// Trigger scroll check on load
window.dispatchEvent(new Event('scroll'));
