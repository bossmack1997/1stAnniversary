/* ==========================================
   ANNIVERSARY WEBSITE SETTINGS
   ========================================== */

/* =========================================
   EDITABLE ANNIVERSARY CONTENT
   ========================================== */

// EDIT: When our story became official (format: YYYY-MM-DD).
// The counter below counts the time we've shared since this date.
// Our 1st anniversary: October 8, 2026.
const storyStartDate = new Date("2025-10-08T00:00:00");

// Music preference is remembered in localStorage
const MUSIC_KEY = "love-music-state";

const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;

const $ = (id) => document.getElementById(id);

/* ==========================================
   RANDOMIZE MEMORY GALLERY
   (Shuffles photo order on every page load)
   ========================================== */

const gallery = $("gallery");

if (gallery) {
    const galleryItems = Array.from(gallery.children);

    for (let i = galleryItems.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [galleryItems[i], galleryItems[j]] = [galleryItems[j], galleryItems[i]];
    }

    galleryItems.forEach((item) => gallery.appendChild(item));
}

/* ==========================================
   INTRO / ENTER THE STORY
   ========================================== */

const enterButton = $("enterButton");
const introScreen = $("introScreen");
const mainContent = $("mainContent");
const siteNav = $("siteNav");

function enterStory() {
    if (!introScreen || !mainContent) return;

    introScreen.style.transition = "opacity 1s ease";
    introScreen.style.opacity = "0";

    setTimeout(() => {
        introScreen.classList.add("hidden");
        mainContent.classList.remove("hidden");

        if (siteNav) siteNav.classList.remove("hidden");

        window.scrollTo({ top: 0, behavior: "auto" });

        showMusicControl();

        // Resume music if the visitor chose it before
        if (localStorage.getItem(MUSIC_KEY) === "playing") {
            playMusic();
        }
    }, 900);
}

if (enterButton && introScreen && mainContent) {
    enterButton.addEventListener("click", () => {
        enterStory();
    });
}

/* ==========================================
   MUSIC (one global instance for the whole site)
   ========================================== */

const music = $("music");
const musicButton = $("musicButton");
const musicIcon = $("musicIcon");
const musicLabel = $("musicLabel");
const muteButton = $("muteButton");
const muteIcon = $("muteIcon");
const musicControl = $("musicControl");
const musicOverlay = $("musicOverlay");
const startMusicButton = $("startMusicButton");
const skipMusicButton = $("skipMusicButton");

let musicPlaying = false;
let musicAvailable = true;

function updateMusicUI() {
    if (!musicButton) return;
    if (musicIcon) musicIcon.textContent = musicPlaying ? "❚❚" : "🎵";
    if (musicLabel) musicLabel.textContent = musicPlaying ? "Pause" : "Music";
    musicButton.classList.toggle("playing", musicPlaying);
    musicButton.setAttribute(
        "aria-pressed",
        musicPlaying ? "true" : "false"
    );
    musicButton.setAttribute(
        "aria-label",
        musicPlaying ? "Pause music" : "Play music"
    );
}

function updateMuteUI() {
    if (!muteButton || !music) return;
    const muted = music.muted;
    if (muteIcon) muteIcon.textContent = muted ? "🔇" : "🔊";
    muteButton.classList.toggle("muted", muted);
    muteButton.setAttribute(
        "aria-pressed",
        muted ? "true" : "false"
    );
    muteButton.setAttribute(
        "aria-label",
        muted ? "Unmute music" : "Mute music"
    );
}

function showMusicControl() {
    if (!musicControl || !musicAvailable) return;
    musicControl.hidden = false;
}

function showMusicOverlay() {
    if (!musicOverlay) return;
    musicOverlay.classList.add("active");
    musicOverlay.setAttribute("aria-hidden", "false");
}

function hideMusicOverlay() {
    if (!musicOverlay) return;
    musicOverlay.classList.remove("active");
    musicOverlay.setAttribute("aria-hidden", "true");
}

async function playMusic() {
    if (!music || !musicAvailable) return;
    try {
        await music.play();
        musicPlaying = true;
        localStorage.setItem(MUSIC_KEY, "playing");
        updateMusicUI();
        showMusicControl();
    } catch (err) {
        console.log("Music could not start:", err);
    }
}

function pauseMusic() {
    if (!music) return;
    music.pause();
    musicPlaying = false;
    localStorage.setItem(MUSIC_KEY, "paused");
    updateMusicUI();
}

if (musicButton) {
    musicButton.addEventListener("click", () => {
        if (musicPlaying) {
            pauseMusic();
        } else {
            playMusic();
        }
    });
}

if (muteButton) {
    muteButton.addEventListener("click", () => {
        if (!music) return;
        music.muted = !music.muted;
        updateMuteUI();
    });
}

// Activation overlay: start the music, then continue the story
if (startMusicButton) {
    startMusicButton.addEventListener("click", () => {
        hideMusicOverlay();
        playMusic();
        enterStory();
    });
}

if (skipMusicButton) {
    skipMusicButton.addEventListener("click", () => {
        hideMusicOverlay();
        localStorage.setItem(MUSIC_KEY, "paused");
    });
}

if (music) {
    // Comfortable listening volume
    music.volume = 0.7;

    // The audio file could not be loaded — hide every music
    // control and never show the activation overlay
    const musicFailed = () => {
        musicAvailable = false;
        hideMusicOverlay();
        if (musicControl) musicControl.hidden = true;
    };

    music.addEventListener("error", musicFailed);
    const musicSource = music.querySelector("source");
    if (musicSource) musicSource.addEventListener("error", musicFailed);

    // Attempt autoplay immediately (browsers may block it)
    const preference = localStorage.getItem(MUSIC_KEY);

    if (preference !== "paused") {
        music.play().then(() => {
            musicPlaying = true;
            localStorage.setItem(MUSIC_KEY, "playing");
            updateMusicUI();
            showMusicControl();
        }).catch((err) => {
            // Autoplay blocked — invite the visitor to start
            // the music with a single tap
            if (err.name === "NotAllowedError") {
                showMusicOverlay();
            }
        });
    }
}

/* ==========================================
   NAVIGATION
   ========================================== */

const navToggle = $("navToggle");
const navLinks = $("navLinks");

function closeMobileMenu() {
    if (!navLinks || !navToggle) return;
    navLinks.classList.remove("open");
    navToggle.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("no-scroll");
}

if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
        const open = navLinks.classList.toggle("open");
        navToggle.classList.toggle("open", open);
        navToggle.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.classList.toggle("no-scroll", open);
    });

    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMobileMenu);
    });
}

// Stronger nav background after scrolling
if (siteNav) {
    window.addEventListener(
        "scroll",
        () => {
            siteNav.classList.toggle("scrolled", window.scrollY > 40);
        },
        { passive: true }
    );
}

// Highlight the active section in the nav
const navLinkMap = {};
document.querySelectorAll("[data-nav]").forEach((link) => {
    const target = link.getAttribute("href");
    if (target && target.startsWith("#")) {
        navLinkMap[target.slice(1)] = link;
    }
});

const sectionObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            document
                .querySelectorAll(".nav-links a")
                .forEach((a) => a.classList.remove("active"));
            const link = navLinkMap[entry.target.id];
            if (link) link.classList.add("active");
        });
    },
    { rootMargin: "-40% 0px -55% 0px"
    }
);

document
    .querySelectorAll("main section[id]")
    .forEach((section) => sectionObserver.observe(section));

/* ==========================================
   ANNIVERSARY COUNTER
   ========================================== */

function updateCounter() {
    const now = new Date();

    if (storyStartDate > now) return;

    let years = now.getFullYear() - storyStartDate.getFullYear();
    let months = now.getMonth() - storyStartDate.getMonth();
    let days = now.getDate() - storyStartDate.getDate();

    if (days < 0) {
        months--;
        const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += previousMonth.getDate();
    }

    if (months < 0) {
        years--;
        months += 12;
    }

    const totalHours = Math.floor(
        (now - storyStartDate) / (1000 * 60 * 60)
    );

    const elYears = $("years");
    const elMonths = $("months");
    const elDays = $("days");
    const elHours = $("hours");
    const elStart = $("storyStartDisplay");

    if (elYears) elYears.textContent = String(years);
    if (elMonths) elMonths.textContent = String(months);
    if (elDays) elDays.textContent = String(days);
    if (elHours) elHours.textContent = totalHours.toLocaleString("en-US");
    if (elStart) {
        elStart.textContent = storyStartDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }
}

updateCounter();
setInterval(updateCounter, 60000);

/* ==========================================
   REASONS WHY I LOVE YOU
   ========================================== */

// EDIT: Your reasons here
const reasons = [
    "I love the way you make ordinary days feel a little more special.",
    "I love your smile, especially when you don't even realize you're smiling.",
    "I love how comfortable it feels when I'm with you.",
    "I love all the little things that make you, you.",
    "I love the memories we've already created together.",
    "I love how you can make me laugh even on difficult days.",
    "I love knowing that I have someone I can share my world with.",
    "I love the way our story keeps growing.",
    "I love every version of us — the happy days and the challenging ones.",
    "And most importantly, I love you simply because you're you."
];

let currentReason = 0;
const reasonButton = $("reasonButton");
const reasonText = $("reasonText");
const reasonNumber = $("reasonNumber");

if (reasonButton && reasonText && reasonNumber) {
    reasonButton.addEventListener("click", () => {
        currentReason = (currentReason + 1) % reasons.length;

        reasonText.style.opacity = "0";
        reasonText.style.transform = "translateY(10px)";

        setTimeout(() => {
            reasonText.textContent = reasons[currentReason];
            reasonNumber.textContent = String(currentReason + 1).padStart(
                2,
                "0"
            );

            reasonText.style.transition = "0.4s ease";
            reasonText.style.opacity = "1";
            reasonText.style.transform = "translateY(0)";
        }, 250);
    });
}

/* ==========================================
   SCROLL REVEAL
   ========================================== */

const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);

document
    .querySelectorAll(".reveal")
    .forEach((el) => revealObserver.observe(el));

/* ==========================================
   LETTER REVEAL (slow, readable)
   ========================================== */

const letterCard = $("letterCard");

if (letterCard) {
    const letterObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    letterObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.25 }
    );
    letterObserver.observe(letterCard);
}

/* ==========================================
   ONE YEAR MILESTONE REVEAL
   ========================================== */

const milestone = $("milestone");

if (milestone) {
    const milestoneObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    milestoneObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.3 }
    );
    milestoneObserver.observe(milestone);
}

// Reduced motion (or no IntersectionObserver): show everything
if (reducedMotion || !("IntersectionObserver" in window)) {
    document
        .querySelectorAll(
            ".reveal, .letter, .milestone, .timeline-item, .closing-lines"
        )
        .forEach((el) => el.classList.add("visible"));
}

/* ==========================================
   LIGHTBOX
   ========================================== */

const lightbox = $("lightbox");
const lightboxImg = $("lightboxImg");
const lightboxClose = $("lightboxClose");
const lightboxPrev = $("lightboxPrev");
const lightboxNext = $("lightboxNext");

const lightboxItems = [];

document.querySelectorAll(".photo").forEach((photo) => {
    const img = photo.querySelector("img");
    if (!img) return;

    lightboxItems.push({
        src: img.src,
        alt: img.alt || ""
    });
});

let lightboxIndex = 0;

function renderLightbox() {
    const item = lightboxItems[lightboxIndex];
    if (!item) return;

    if (item.src) {
        lightboxImg.src = item.src;
        lightboxImg.alt = item.alt;
        lightboxImg.style.display = "block";
    }
}

function openLightbox(index) {
    if (!lightbox || lightboxItems.length === 0) return;
    lightboxIndex = index;
    renderLightbox();
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
}

function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
}

function stepLightbox(direction) {
    if (lightboxItems.length === 0) return;
    lightboxIndex =
        (lightboxIndex + direction + lightboxItems.length) %
        lightboxItems.length;
    renderLightbox();
}

document.querySelectorAll(".photo").forEach((photo, index) => {
    photo.addEventListener("click", () => openLightbox(index));
});

if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
if (lightboxPrev) lightboxPrev.addEventListener("click", () => stepLightbox(-1));
if (lightboxNext) lightboxNext.addEventListener("click", () => stepLightbox(1));

if (lightbox) {
    lightbox.addEventListener("click", (event) => {
        if (event.target === lightbox) closeLightbox();
    });

    // Mobile swipe navigation
    let touchStartX = 0;

    lightbox.addEventListener(
        "touchstart",
        (event) => {
            touchStartX = event.changedTouches[0].screenX;
        },
        { passive: true }
    );

    lightbox.addEventListener(
        "touchend",
        (event) => {
            const delta = event.changedTouches[0].screenX - touchStartX;
            if (Math.abs(delta) > 50) {
                stepLightbox(delta > 0 ? -1 : 1);
            }
        },
        { passive: true }
    );
}

/* ==========================================
   VIDEO SECTION FALLBACK
   (Shown only when the video file fails)
   ========================================== */

const storyVideo = $("storyVideo");
const videoFallback = $("videoFallback");

if (storyVideo) {
    const failVideo = () => {
        storyVideo.style.display = "none";
        if (videoFallback) videoFallback.hidden = false;
    };

    const source = storyVideo.querySelector("source");
    if (source) source.addEventListener("error", failVideo);
    storyVideo.addEventListener("error", failVideo);
}

/* ==========================================
   REPLAY OUR STORY
   (Returns to the cinematic opening.
   The music keeps playing — it is a single
   global instance and is never restarted.)
   ========================================== */

const replayButton = $("replayButton");

if (replayButton && introScreen && mainContent) {
    replayButton.addEventListener("click", () => {
        mainContent.classList.add("hidden");

        if (siteNav) siteNav.classList.add("hidden");

        introScreen.classList.remove("hidden");
        introScreen.style.transition = "none";
        introScreen.style.opacity = "0";

        requestAnimationFrame(() => {
            introScreen.style.transition = "opacity 1s ease";
            introScreen.style.opacity = "1";
        });

        // Restart the opening entrance animations
        document.querySelectorAll(".intro-content > *").forEach((el) => {
            el.style.animation = "none";
            void el.offsetWidth;
            el.style.animation = "";
        });

        window.scrollTo({ top: 0, behavior: "auto" });
    });
}

/* ==========================================
   AMBIENT PARTICLES (lightweight canvas)
   ========================================== */

(function initParticles() {
    if (reducedMotion) return;

    const canvas = $("particles");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles = [];
    let running = true;
    let rafId = null;

    const COUNT = Math.min(48, Math.max(18, Math.floor(window.innerWidth / 30)));

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function makeParticle() {
        return {
            x: Math.random() * width,
            y: Math.random() * height,
            r: Math.random() * 1.7 + 0.4,
            speed: Math.random() * 0.22 + 0.05,
            drift: Math.random() * Math.PI * 2,
            baseAlpha: Math.random() * 0.4 + 0.12,
            twinkle: Math.random() * Math.PI * 2,
            heart: Math.random() < 0.1
        };
    }

    function draw() {
        if (!running) return;

        ctx.clearRect(0, 0, width, height);

        particles.forEach((p) => {
            p.y -= p.speed;
            p.drift += 0.008;
            p.x += Math.sin(p.drift) * 0.18;
            p.twinkle += 0.02;

            const alpha = p.baseAlpha * (0.55 + 0.45 * Math.sin(p.twinkle));

            if (p.y < -20) {
                p.y = height + 20;
                p.x = Math.random() * width;
            }

            if (p.heart) {
                ctx.font = `${8 + p.r * 4}px serif`;
                ctx.fillStyle = `rgba(255, 140, 175, ${alpha})`;
                ctx.fillText("♥", p.x, p.y);
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 226, 238, ${alpha})`;
                ctx.fill();
            }
        });

        rafId = requestAnimationFrame(draw);
    }

    function start() {
        if (running) return;
        running = true;
        draw();
    }

    function stop() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
    }

    resize();
    particles = Array.from({ length: COUNT }, makeParticle);
    draw();

    window.addEventListener("resize", () => {
        resize();
        particles = Array.from({ length: COUNT }, makeParticle);
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) stop();
        else start();
    });
})();

/* ==========================================
   KEYBOARD SUPPORT
   ========================================== */

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeLightbox();
        closeMobileMenu();
    }

    if (lightbox && lightbox.classList.contains("active")) {
        if (event.key === "ArrowLeft") stepLightbox(-1);
        if (event.key === "ArrowRight") stepLightbox(1);
    }
});
