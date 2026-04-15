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

// Initialize Lucide Icons
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
});

// Trigger scroll check on load
window.dispatchEvent(new Event('scroll'));

// Modal Logic
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.querySelector('.modal-overlay');
  const openModalBtns = document.querySelectorAll('.consult-btn, .btn-outline, .btn-primary'); // Add more selectors if needed
  const closeModalBtn = document.querySelector('.modal-close');
  const modalContent = document.querySelector('.modal-content');
  const consultationForm = document.getElementById('consultationForm');

  const openModal = () => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
  };

  // Find all buttons that say "立即咨询" or matches relevant classes
  const allBtns = document.querySelectorAll('.btn, .icon-btn');
  allBtns.forEach(btn => {
    if (btn.textContent.includes('立即咨询') || btn.classList.contains('consult-btn')) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    }
  });

  // Floating action button
  const fab = document.querySelector('.floating-btn');
  if (fab) {
    fab.addEventListener('click', openModal);
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // Handle Form Submission
  if (consultationForm) {
    consultationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(consultationForm);
      const data = Object.fromEntries(formData.entries());
      
      const submitBtn = consultationForm.querySelector('.submit-btn');
      const originalBtnText = submitBtn.textContent;
      submitBtn.textContent = '提交中...';
      submitBtn.disabled = true;

      fetch('/api/consult', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('网络请求错误');
        }
        return response.json();
      })
      .then(result => {
        alert(result.message || '提交成功！我们将尽快为您回电。');
        consultationForm.reset();
        closeModal();
      })
      .catch(error => {
        console.error('Error:', error);
        alert('提交失败，请稍后重试或直接拨打我们的电话。');
      })
      .finally(() => {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
      });
    });
  }
});
