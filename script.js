let yaAbrio = false;
let explosionActivada = false;
const circulosCompletados = [false, false, false];

// NUEVA URL DE GOOGLE APPS SCRIPT
const URL_GOOGLE_SCRIPT = "https://script.google.com/macros/s/AKfycbzJ4nJ5E2mWqQFT7M9mtyKBOwecvXc-Wymktr3oAHF46pkfM08doapnUV4BhsbQBrOX/exec";

function activarInvitacion() {
    if (yaAbrio) return;

    const videoSobre = document.getElementById('videoSobre');
    const intro = document.getElementById('contenedor-principal');
    const btnTexto = document.getElementById('btn-toca-abrir');
    const musica = document.getElementById('musicaInvitacion');
    const musicIcon = document.getElementById('music-toggle');

    if (btnTexto) {
        btnTexto.innerHTML = "ABRIENDO INVITACIÓN... 💌";
        btnTexto.style.opacity = "0.7";
    }

    if (musica) {
        musica.play().catch(e => console.log("Audio play err:", e));
    }
    if (musicIcon) musicIcon.style.display = 'flex';

    if (videoSobre) {
        videoSobre.currentTime = 0;
        let playPromise = videoSobre.play();

        const procederAInvitacion = () => {
            if (!yaAbrio) {
                yaAbrio = true;
                transicionAFinal(intro);
            }
        };

        if (playPromise !== undefined) {
            playPromise.then(() => {
                videoSobre.onended = procederAInvitacion;
            }).catch(() => {
                procederAInvitacion();
            });
        } else {
            videoSobre.onended = procederAInvitacion;
        }

        setTimeout(procederAInvitacion, 3500);
    } else {
        transicionAFinal(intro);
    }
}

function transicionAFinal(intro) {
    if (intro) {
        intro.style.transition = "opacity 0.8s ease";
        intro.style.opacity = '0';
    }
    setTimeout(() => {
        if (intro) intro.style.display = 'none';
        const seccionFinal = document.getElementById('seccion-final');

        if (seccionFinal) seccionFinal.classList.remove('oculto');

        window.scrollTo(0, 0);
        iniciarAnimacionesScroll();
        initScratchCircles();
        iniciarContador();
    }, 800);
}

function initScratchCircles() {
    const canvases = document.querySelectorAll('.circle-canvas');
    if (!canvases.length) return;

    canvases.forEach((canvas, idx) => {
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const size = 90;

        canvas.width = size * dpr;
        canvas.height = size * dpr;
        ctx.scale(dpr, dpr);

        const SCRATCH_COLOR = '#6b6d38';
        const label = canvas.getAttribute('data-label') || '';

        ctx.fillStyle = SCRATCH_COLOR;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = '400 9px "Cinzel", serif';
        ctx.textAlign = 'center';
        ctx.fillText('TOCÁ', size / 2, size / 2 - 2);

        ctx.fillStyle = '#f5e8d0';
        ctx.font = '400 8px "Montserrat", sans-serif';
        ctx.fillText(label, size / 2, size / 2 + 10);
    });
}

function revelarDirecto(idx) {
    const canvas = document.getElementById(`canvas-${idx}`);
    if (!canvas || canvas.style.display === 'none') return;

    canvas.style.opacity = '0';
    setTimeout(() => { 
        canvas.style.display = 'none'; 
    }, 500);

    circulosCompletados[idx] = true;

    if (circulosCompletados.every(Boolean) && !explosionActivada) {
        explosionActivada = true;
        lanzarPetalosDesdeCirculos();

        const countdown = document.getElementById('countdownCard');
        if (countdown) {
            setTimeout(() => {
                countdown.classList.add('revealed-done');
            }, 300);
        }
    }
}

function lanzarPetalosDesdeCirculos() {
    const c = document.getElementById('petalsCanvas');
    const circlesWrap = document.getElementById('circlesWrapper');
    if (!c) return;
    const ctx = c.getContext('2d');
    
    c.width = window.innerWidth;
    c.height = window.innerHeight;

    let originX = c.width / 2;
    let originY = c.height / 2;

    if (circlesWrap) {
        const rect = circlesWrap.getBoundingClientRect();
        originX = rect.left + rect.width / 2;
        originY = rect.top + rect.height / 2;
    }

    const hojas = [];
    const numHojas = 60;
    const paletaVerdes = ['#6b6d38', '#4a5d3e', '#889c6b', '#526742', '#a3b18a'];

    for (let i = 0; i < numHojas; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 9 + 4;

        hojas.push({
            x: originX,
            y: originY,
            size: Math.random() * 12 + 10,
            speedX: Math.cos(angle) * speed,
            speedY: Math.sin(angle) * speed - 2,
            gravity: 0.08,
            rotation: Math.random() * 360,
            rotSpeed: Math.random() * 6 - 3,
            color: paletaVerdes[Math.floor(Math.random() * paletaVerdes.length)],
            opacity: 1
        });
    }

    let duracion = 0;
    function animar() {
        ctx.clearRect(0, 0, c.width, c.height);
        
        hojas.forEach(h => {
            ctx.save();
            ctx.translate(h.x, h.y);
            ctx.rotate((h.rotation * Math.PI) / 180);
            ctx.globalAlpha = h.opacity;

            ctx.fillStyle = h.color;
            ctx.beginPath();
            ctx.moveTo(0, -h.size);
            ctx.quadraticCurveTo(h.size * 0.65, 0, 0, h.size);
            ctx.quadraticCurveTo(-h.size * 0.65, 0, 0, -h.size);
            ctx.fill();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, -h.size * 0.8);
            ctx.lineTo(0, h.size * 0.8);
            ctx.stroke();

            ctx.restore();

            h.x += h.speedX;
            h.y += h.speedY;
            h.speedY += h.gravity;
            h.speedX *= 0.98;
            h.rotation += h.rotSpeed;

            if (duracion > 60) {
                h.opacity -= 0.015;
            }
        });

        duracion++;
        if (duracion < 180) {
            requestAnimationFrame(animar);
        } else {
            ctx.clearRect(0, 0, c.width, c.height);
        }
    }
    animar();
}

function iniciarContador() {
    const targetDate = new Date('2026-10-03T20:00:00').getTime();

    function actualizar() {
        const now = new Date().getTime();
        const diff = targetDate - now;

        if (diff <= 0) {
            document.getElementById('cd-days').innerText = '00';
            document.getElementById('cd-hours').innerText = '00';
            document.getElementById('cd-mins').innerText = '00';
            document.getElementById('cd-secs').innerText = '00';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        document.getElementById('cd-days').innerText = String(days).padStart(2, '0');
        document.getElementById('cd-hours').innerText = String(hours).padStart(2, '0');
        document.getElementById('cd-mins').innerText = String(mins).padStart(2, '0');
        document.getElementById('cd-secs').innerText = String(secs).padStart(2, '0');
    }

    actualizar();
    setInterval(actualizar, 1000);
}

function toggleMusic() {
    const musica = document.getElementById('musicaInvitacion');
    const icon = document.getElementById('music-toggle');
    if (!musica || !icon) return;
    
    if (musica.paused) {
        musica.play();
        icon.innerHTML = '<i class="fa-solid fa-music"></i>';
    } else {
        musica.pause();
        icon.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
    }
}

function iniciarAnimacionesScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function toggleGiftModal() {
  const modal = document.getElementById('gift-modal');
  modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
}

function copyAlias(ci, titular) {
  navigator.clipboard.writeText(ci);
  mostrarToast(`¡C.I. ${ci} (${titular}) copiada al portapapeles! 📋✨`);
}

function sugerirCancion(e) {
  e.preventDefault();
  const input = document.getElementById('song-input');
  const cancion = input ? input.value.trim() : '';

  if (cancion !== '') {
    mostrarToast('Enviando sugerencia... 🎵');

    const urlFinal = URL_GOOGLE_SCRIPT + "?cancion=" + encodeURIComponent(cancion);

    fetch(urlFinal, {
      method: 'GET',
      mode: 'no-cors'
    })
    .then(() => {
      mostrarToast('¡Sugerencia guardada en la playlist! 🎵✨');
      if (input) input.value = '';
    })
    .catch(err => {
      console.error(err);
      mostrarToast('¡Sugerencia enviada! 🎵✨');
      if (input) input.value = '';
    });
  }
}

function mostrarToast(txt) {
  const toast = document.getElementById('toast');
  if (toast) {
    toast.innerText = txt;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
    const seccionFinal = document.getElementById('seccion-final');
    if (seccionFinal && !seccionFinal.classList.contains('oculto')) {
        initScratchCircles();
        iniciarContador();
    }
});