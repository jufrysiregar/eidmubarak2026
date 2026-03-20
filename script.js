document.addEventListener('DOMContentLoaded', function () {
    'use strict';
    document.addEventListener('touchstart', function () {}, true);

    const envelopeThr  = document.getElementById('envelopeThr');
    const paperContent = document.getElementById('paperContent');
    const backButton   = document.getElementById('backButton');
    const loadingToast = document.getElementById('loadingToast');
    const soundBtn     = document.getElementById('soundBtn');
    const soundIcon    = document.getElementById('soundIcon');
    const socialLinks  = document.querySelectorAll('.social-icons .icon');

    const countdownWrap   = document.getElementById('countdownWrap');
    const countdownNum    = document.getElementById('countdownNum');
    const countdownCircle = document.getElementById('countdownCircle');

    let isAnimating = false;
    let isMuted     = false;
    let bgStarted   = false;

    const bgMusic  = new Audio('eidmbrk.mp3');
    bgMusic.loop   = true;
    bgMusic.volume = 0.45;

    const splashScreen = document.getElementById('splashScreen');
    const splashBtn    = document.getElementById('splashBtn');

    const accessDeniedOverlay = document.createElement('div');
    accessDeniedOverlay.id = 'accessDeniedOverlay';
    accessDeniedOverlay.style.cssText = [
        'position:fixed',
        'inset:0',
        'z-index:9999',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'background:rgba(0,0,0,0.55)',
        'backdrop-filter:blur(4px)',
        '-webkit-backdrop-filter:blur(4px)',
        'opacity:0',
        'transition:opacity 0.3s ease',
        'pointer-events:none'
    ].join(';');

    const accessDeniedBox = document.createElement('div');
    accessDeniedBox.style.cssText = [
        'background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%)',
        'border:1.5px solid rgba(255,215,0,0.35)',
        'border-radius:16px',
        'padding:36px 44px',
        'text-align:center',
        'box-shadow:0 24px 60px rgba(0,0,0,0.7),0 0 0 1px rgba(255,215,0,0.08)',
        'transform:scale(0.78) translateY(24px)',
        'transition:transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275),opacity 0.3s ease',
        'opacity:0',
        'max-width:320px',
        'width:88vw'
    ].join(';');

    const deniedIcon = document.createElement('div');
    deniedIcon.style.cssText = 'font-size:42px;margin-bottom:14px;line-height:1;';
    deniedIcon.textContent = '🚫';

    const deniedText = document.createElement('p');
    deniedText.style.cssText = [
        'font-style:italic',
        'font-size:1.18rem',
        'font-weight:600',
        'color:#FFD700',
        'letter-spacing:0.04em',
        'margin:0 0 6px 0',
        'font-family:Georgia,serif'
    ].join(';');
    deniedText.textContent = 'Now, Access is denied';

    const deniedSub = document.createElement('p');
    deniedSub.style.cssText = [
        'font-size:0.78rem',
        'color:rgba(255,255,255,0.45)',
        'margin:10px 0 0 0',
        'letter-spacing:0.03em'
    ].join(';');
    deniedSub.textContent = 'Tap anywhere to close';

    accessDeniedBox.appendChild(deniedIcon);
    accessDeniedBox.appendChild(deniedText);
    accessDeniedBox.appendChild(deniedSub);
    accessDeniedOverlay.appendChild(accessDeniedBox);
    document.body.appendChild(accessDeniedOverlay);

    function showAccessDenied() {
        accessDeniedOverlay.style.pointerEvents = 'auto';
        accessDeniedOverlay.style.opacity = '1';
        accessDeniedBox.style.opacity = '1';
        accessDeniedBox.style.transform = 'scale(1) translateY(0)';
    }

    function hideAccessDenied() {
        accessDeniedBox.style.transform = 'scale(0.85) translateY(16px)';
        accessDeniedBox.style.opacity = '0';
        accessDeniedOverlay.style.opacity = '0';
        setTimeout(function () {
            accessDeniedOverlay.style.pointerEvents = 'none';
        }, 320);
    }

    accessDeniedOverlay.addEventListener('click', hideAccessDenied);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') hideAccessDenied();
    });

    function enterSite() {
        if (!isMuted && !bgStarted) {
            bgMusic.currentTime = 0;
            bgMusic.play().catch(function (err) {
                console.warn('MP3 gagal:', err, '— fallback Web Audio');
                scheduleMelody(getCtx().currentTime + 0.3);
            });
            bgStarted = true;
        }

        splashScreen.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        splashScreen.classList.add('hide');

        setTimeout(function () {
            splashScreen.style.display    = 'none';
            splashScreen.style.transition = '';
            splashScreen.style.opacity    = '';
            splashScreen.style.transform  = '';

            envelopeThr.style.display = 'block';
            envelopeThr.style.opacity = '0';
            envelopeThr.style.transform = 'scale(0.85) translateY(20px)';
            setTimeout(function () {
                envelopeThr.style.transition = 'all 0.5s cubic-bezier(0.175,0.885,0.32,1.275)';
                envelopeThr.style.opacity    = '1';
                envelopeThr.style.transform  = 'scale(1) translateY(0)';
            }, 30);

            if (countdownWrap) {
                countdownWrap.style.opacity = '1';
                countdownNum.textContent = '5';
                countdownCircle.style.strokeDashoffset = '0';
            }
            setTimeout(function () { startCountdown(); }, 600);
        }, 680);
    }

    if (splashBtn) {
        splashBtn.addEventListener('click', enterSite);
        splashBtn.addEventListener('touchend', function (e) {
            e.preventDefault(); enterSite();
        });
    }

    const TOTAL_DASH = 213.6;

    function startCountdown() {
        let sisa = 5;
        countdownNum.textContent = sisa;
        countdownCircle.style.strokeDashoffset = '0';

        const interval = setInterval(function () {
            sisa--;

            countdownNum.classList.add('tick');
            setTimeout(function () { countdownNum.classList.remove('tick'); }, 200);

            const progress = (5 - sisa) / 5;
            countdownCircle.style.strokeDashoffset = TOTAL_DASH * progress;

            if (sisa <= 0) {
                clearInterval(interval);
                countdownNum.textContent = '✦';
                setTimeout(function () { autoOpenEnvelope(); }, 400);
            } else {
                countdownNum.textContent = sisa;
            }
        }, 1000);
    }

    function autoOpenEnvelope() {
        if (isAnimating) return;
        isAnimating = true;

        const envBox       = document.getElementById('envBox');
        const envFlap      = document.getElementById('envFlap');
        const envPaperPeek = document.getElementById('envPaperPeek');

        if (navigator.vibrate) navigator.vibrate([15, 30, 15]);

        if (countdownWrap) {
            countdownWrap.style.transition = 'opacity .4s ease';
            countdownWrap.style.opacity    = '0';
        }

        setTimeout(function () {
            envelopeThr.style.transition = 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1)';
            envelopeThr.style.transform  = 'translateY(-12px) scale(1.03)';
        }, 250);

        setTimeout(function () {
            playSwoosh();
            if (envFlap) envFlap.classList.add('open');
            envelopeThr.style.transition = 'transform 0.5s ease';
            envelopeThr.style.transform  = 'translateY(0) scale(1)';
        }, 650);

        setTimeout(function () {
            if (envPaperPeek) envPaperPeek.classList.add('peek-out');
        }, 950);

        setTimeout(function () {
            envelopeThr.style.transition = 'filter 0.4s ease';
            envelopeThr.style.filter     = 'drop-shadow(0 0 18px rgba(255,215,0,0.7)) drop-shadow(0 8px 24px rgba(0,0,0,0.5))';
        }, 2000);
        setTimeout(function () {
            envelopeThr.style.filter = 'drop-shadow(0 16px 28px rgba(0,0,0,0.55))';
        }, 2400);

        setTimeout(function () {
            envelopeThr.style.transition = 'all 0.85s cubic-bezier(0.55, 0, 1, 0.45)';
            envelopeThr.style.transform  = 'translateY(60px) scale(0.88)';
            envelopeThr.style.opacity    = '0';
        }, 2600);

        setTimeout(function () {
            envelopeThr.style.display    = 'none';
            envelopeThr.style.opacity    = '1';
            envelopeThr.style.transform  = '';
            envelopeThr.style.filter     = '';
            envelopeThr.style.transition = '';
            if (envFlap)      envFlap.classList.remove('open');
            if (envPaperPeek) { 
                envPaperPeek.classList.remove('peek-out');
                envPaperPeek.style.transition = 'none';
                envPaperPeek.style.height = '0';
                setTimeout(function(){
                    envPaperPeek.style.transition = '';
                }, 50);
            }
            paperContent.style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            isAnimating = false;
        }, 3500);
    }

    function backToHome() {
        if (isAnimating) return;
        isAnimating = true;
        playClick();

        paperContent.style.transition = 'all 0.4s ease';
        paperContent.style.opacity    = '0';
        paperContent.style.transform  = 'translateY(30px)';

        setTimeout(function () {
            paperContent.style.display   = 'none';
            paperContent.style.opacity   = '1';
            paperContent.style.transform = 'translateY(0)';

            envelopeThr.style.display    = 'none';
            envelopeThr.style.opacity    = '1';
            envelopeThr.style.transform  = 'scale(1) translateY(0)';
            envelopeThr.style.transition = '';

            if (countdownWrap) {
                countdownWrap.style.opacity    = '1';
                countdownWrap.style.transition = '';
                countdownNum.textContent = '5';
                countdownCircle.style.strokeDashoffset = '0';
            }

            splashScreen.style.display = 'flex';
            splashScreen.style.opacity = '0';
            splashScreen.style.transform = 'scale(0.96)';
            splashScreen.classList.remove('hide');

            setTimeout(function () {
                splashScreen.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                splashScreen.style.opacity    = '1';
                splashScreen.style.transform  = 'scale(1)';
            }, 30);

            isAnimating = false;
        }, 420);
    }

    backButton.addEventListener('click', backToHome);

    let audioCtx       = null;
    let melodyTimeouts = [];
    let melodyLoop     = null;

    function getCtx() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        return audioCtx;
    }

    function playNote(freq, dur, type, vol, t) {
        const ctx = getCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(vol || 0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.start(t); osc.stop(t + dur + 0.05);
    }

    function buildMelody() {
        return [
            [659,1],[587,.5],[659,.5],[740,1],[659,.5],[587,.5],
            [554,1],[494,.5],[554,.5],[659,1.5],[659,.5],
            [587,1],[554,.5],[494,.5],[440,1],[494,.5],[440,.5],
            [494,1],[440,.5],[392,.5],[440,2],
            [659,1],[587,.5],[659,.5],[740,1],[831,.5],[740,.5],
            [659,1],[587,.5],[659,.5],[587,1],[554,.5],[494,.5],
            [554,1],[494,.5],[440,.5],[494,1],[440,.5],[392,.5],[440,3]
        ];
    }

    function scheduleMelody(startTime) {
        if (isMuted) return;
        const ctx = getCtx(); const beat = 0.35;
        const notes = buildMelody();
        let t = startTime; let total = 0;
        notes.forEach(function (n) {
            const freq = n[0]; const dur = n[1] * beat; total += dur;
            (function (f, st, d) {
                const id = setTimeout(function () {
                    if (!isMuted) {
                        playNote(f,       d * .85, 'sine',     0.13, ctx.currentTime);
                        playNote(f * 0.5, d * .8,  'triangle', 0.06, ctx.currentTime);
                    }
                }, Math.max(0, (st - ctx.currentTime) * 1000));
                melodyTimeouts.push(id);
            }(freq, t, dur));
            t += dur;
        });
        melodyLoop = setTimeout(function () {
            if (!isMuted) scheduleMelody(getCtx().currentTime);
        }, total * 1000 + 200);
    }

    function stopFallbackMelody() {
        melodyTimeouts.forEach(clearTimeout);
        melodyTimeouts = [];
        if (melodyLoop) { clearTimeout(melodyLoop); melodyLoop = null; }
    }

    function stopBgMusic() {
        bgMusic.pause();
        bgMusic.currentTime = 0;
        stopFallbackMelody();
        bgStarted = false;
    }

    function playSwoosh() {
        if (isMuted) return;
        const ctx = getCtx(); const now = ctx.currentTime;
        const osc = ctx.createOscillator(); const g = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + .3);
        osc.frequency.exponentialRampToValueAtTime(350, now + .6);
        g.gain.setValueAtTime(.28, now);
        g.gain.exponentialRampToValueAtTime(.0001, now + .65);
        osc.start(now); osc.stop(now + .7);
    }

    function playClick() {
        if (isMuted) return;
        const ctx = getCtx(); const now = ctx.currentTime;
        playNote(440, .12, 'sine',     .2,  now);
        playNote(330, .18, 'triangle', .15, now + .08);
    }

    function playTap() {
        if (isMuted) return;
        const ctx = getCtx(); const now = ctx.currentTime;
        playNote(880, .1, 'sine', .15, now);
        playNote(660, .1, 'sine', .1,  now + .06);
    }

    function showToast(msg) {
        if (!loadingToast) return;
        loadingToast.textContent = msg;
        loadingToast.classList.add('show');
        setTimeout(function () { loadingToast.classList.remove('show'); }, 1800);
    }

    soundBtn.addEventListener('click', function () {
        isMuted = !isMuted;
        if (isMuted) {
            stopBgMusic();
            soundIcon.className = 'fas fa-volume-mute';
            soundBtn.classList.add('muted');
            showToast('🔇 Musik dimatikan');
        } else {
            soundBtn.classList.remove('muted');
            soundIcon.className = 'fas fa-volume-up';
            bgStarted = false;
            bgMusic.play().catch(function () {
                scheduleMelody(getCtx().currentTime + 0.3);
            });
            bgStarted = true;
            showToast('🔊 Musik dinyalakan');
        }
    });

    const qrisOverlay = document.getElementById('qrisOverlay');
    const qrisClose   = document.getElementById('qrisClose');
    const danaIcon    = document.getElementById('danaIcon');

    function openQris() {
        playTap();
        qrisOverlay.classList.add('show');
    }
    function closeQris() {
        qrisOverlay.classList.remove('show');
    }

    if (danaIcon) {
        danaIcon.addEventListener('click', function (e) {
            e.preventDefault();
            openQris();
        });
        danaIcon.addEventListener('touchend', function (e) {
            e.preventDefault();
            openQris();
        });
    }
    if (qrisClose) {
        qrisClose.addEventListener('click', closeQris);
    }
    if (qrisOverlay) {
        qrisOverlay.addEventListener('click', function (e) {
            if (e.target === qrisOverlay) closeQris();
        });
    }
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeQris();
            hideAccessDenied();
        }
    });

    const whatsappIcon = document.getElementById('whatsappIcon');
    if (whatsappIcon) {
        whatsappIcon.addEventListener('click', function (e) {
            e.preventDefault();
            playTap();
            showAccessDenied();
        });
        whatsappIcon.addEventListener('touchend', function (e) {
            e.preventDefault();
            playTap();
            showAccessDenied();
        });
    }

    socialLinks.forEach(function (link) {
        link.addEventListener('touchstart', function () {
            this.classList.add('touched'); playTap();
        }, { passive: true });
        link.addEventListener('touchend', function () {
            const el = this;
            setTimeout(function () { el.classList.remove('touched'); }, 600);
        });
        link.addEventListener('touchcancel', function () { this.classList.remove('touched'); });
        link.addEventListener('click', function () {
            if (this.id === 'danaIcon') return;
            if (this.id === 'whatsappIcon') return;
            const label = this.getAttribute('data-label') || this.id.replace('Icon', '');
            showToast('Membuka ' + label + '…');
        });
        link.addEventListener('mouseenter', function () { playTap(); });
    });
});
