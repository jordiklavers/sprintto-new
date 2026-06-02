console.log('testststst')

document.addEventListener("DOMContentLoaded", function () {
  gsap.registerPlugin(CustomEase, ScrollTrigger, Draggable, InertiaPlugin);

  initDetectScrollingDirectionCTA();
  initModalBasic();
  floatingVacatureCTA();
  initAccordionCSS();
  initVacatureHeroSwiper();
  initFlickCards();
  initBunnyPlayerBasic();
  initBunnyLightboxPlayer();
  initSwipers();
  initSliders();
  initMomentumBasedHover();
});

CustomEase.create("osmo-ease", "0.625, 0.05, 0, 1");

function initDetectScrollingDirectionCTA() {
  let lastScrollTop = 0;
  const threshold = 50; // Minimal scroll distance to switch to up/down
  const thresholdTop = 210; // Minimal scroll distance from top of window to start

  window.addEventListener("scroll", () => {
    const nowScrollTop = window.scrollY;

    if (Math.abs(lastScrollTop - nowScrollTop) >= threshold) {
      // Update Scroll Started
      const started = nowScrollTop > thresholdTop;
      document
        .querySelectorAll("[data-cta-scrolling-started]")
        .forEach((el) =>
          el.setAttribute(
            "data-cta-scrolling-started",
            started ? "true" : "false"
          )
        );

      // lastScrollTop = nowScrollTop;
    }
  });
}

function initModalBasic() {

  const modalGroup = document.querySelector('[data-modal-group-status]');
  const modals = document.querySelectorAll('[data-modal-name]');
  const modalTargets = document.querySelectorAll('[data-modal-target]');

  // Open modal
  modalTargets.forEach((modalTarget) => {
    modalTarget.addEventListener('click', function () {
      const modalTargetName = this.getAttribute('data-modal-target');

      // Close all modals
      modalTargets.forEach((target) => target.setAttribute('data-modal-status', 'not-active'));
      modals.forEach((modal) => modal.setAttribute('data-modal-status', 'not-active'));

      // Activate clicked modal
      document.querySelector(`[data-modal-target="${modalTargetName}"]`).setAttribute('data-modal-status', 'active');
      document.querySelector(`[data-modal-name="${modalTargetName}"]`).setAttribute('data-modal-status', 'active');

      // Set group to active
      if (modalGroup) {
        modalGroup.setAttribute('data-modal-group-status', 'active');
      }
    });
  });

  // Close modal
  document.querySelectorAll('[data-modal-close]').forEach((closeBtn) => {
    closeBtn.addEventListener('click', closeAllModals);
  });

  // Close modal on `Escape` key
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeAllModals();
    }
  });

  // Function to close all modals
  function closeAllModals() {
    modalTargets.forEach((target) => target.setAttribute('data-modal-status', 'not-active'));
    
    if (modalGroup) {
      modalGroup.setAttribute('data-modal-group-status', 'not-active');
    }
  }
}

function floatingVacatureCTA() {
  $('[data-vacature-cta="trigger"]').on("click", function () {
    console.log("click");
    if (
      $("[data-vacature-cta-status]").attr("data-vacature-cta-status") ===
      "open"
    ) {
      $("[data-vacature-cta-status]").attr(
        "data-vacature-cta-status",
        "closed"
      );
    } else {
      $("[data-vacature-cta-status]").attr("data-vacature-cta-status", "open");
    }
  });
}

function initAccordionCSS() {
  document
    .querySelectorAll("[data-accordion-css-init]")
    .forEach((accordion) => {
      const closeSiblings =
        accordion.getAttribute("data-accordion-close-siblings") === "true";

      accordion.addEventListener("click", (event) => {
        const toggle = event.target.closest("[data-accordion-toggle]");
        if (!toggle) return;

        const item = toggle.closest("[data-accordion-status]");
        if (!item) return;

        const isActive =
          item.getAttribute("data-accordion-status") === "active";

        // 1️⃣ Sluit siblings EERST
        if (closeSiblings && !isActive) {
          accordion
            .querySelectorAll('[data-accordion-status="active"]')
            .forEach((sibling) => {
              if (sibling !== item) {
                sibling.setAttribute("data-accordion-status", "not-active");
              }
            });
        }

        // 2️⃣ Meet positie na sluiten siblings
        const startTop = item.getBoundingClientRect().top;
        const startScroll = window.scrollY;

        // 3️⃣ Toggle huidige item
        item.setAttribute(
          "data-accordion-status",
          isActive ? "not-active" : "active"
        );

        // 4️⃣ Scrollcorrectie
        if (!isActive) {
          requestAnimationFrame(() => {
            const newTop = item.getBoundingClientRect().top;
            const diff = newTop - startTop;

            if (Math.abs(diff) > 1) {
              window.scrollTo({
                top: startScroll + diff,
                behavior: "smooth",
              });
            }
          });
        }
      });
    });
}

function initFlickCards() {
  const sliders = document.querySelectorAll("[data-flick-cards-init]");
  if (!sliders.length) return;

  sliders.forEach((slider) => {
    const list = slider.querySelector("[data-flick-cards-list]");
    if (!list) return;
    const cards = Array.from(list.querySelectorAll("[data-flick-cards-item]"));
    const total = cards.length;
    let activeIndex = 0;

    const sliderWidth = slider.offsetWidth;
    const threshold = 0.1;

    // Generate draggers inside each card and store references
    const draggers = [];
    cards.forEach((card) => {
      const dragger = document.createElement("div");
      dragger.setAttribute("data-flick-cards-dragger", "");
      card.appendChild(dragger);
      draggers.push(dragger);
    });

    // Set initial drag status
    slider.setAttribute("data-flick-drag-status", "grab");

    function getConfig(i, currentIndex) {
      let diff = i - currentIndex;
      if (diff > total / 2) diff -= total;
      else if (diff < -total / 2) diff += total;

      switch (diff) {
        case 0:
          return { x: 0, y: 0, rot: 0, s: 1, o: 1, z: 5 };
        case 1:
          return { x: 60, y: 1, rot: 0, s: 0.9, o: 1, z: 4 };
        case -1:
          return { x: -60, y: 1, rot: 0, s: 0.9, o: 1, z: 4 };
        default:
          const dir = diff > 0 ? 1 : -1;
          return { x: 55 * dir, y: 5, rot: 20 * dir, s: 0.6, o: 0, z: 2 };
      }
    }

    function renderCards(currentIndex) {
      cards.forEach((card, i) => {
        const cfg = getConfig(i, currentIndex);
        let status;

        if (cfg.x === 0) status = "active";
        else if (cfg.x === 60) status = "2-after";
        else if (cfg.x === -60) status = "2-before";
        else status = "hidden";

        card.setAttribute("data-flick-cards-item-status", status);
        card.style.zIndex = cfg.z;

        gsap.to(card, {
          duration: 0.6,
          ease: "elastic.out(1.2, 1)",
          xPercent: cfg.x,
          yPercent: cfg.y,
          rotation: cfg.rot,
          scale: cfg.s,
          opacity: cfg.o,
        });

        // Video control gebaseerd op active status
        const playerInCard = card.querySelector("[data-bunny-player-init]");
        if (playerInCard) {
          const video = playerInCard.querySelector("video");

          if (status === "active") {
            // Trigger play via control button (werkt met lazy loading)
            const playControl = playerInCard.querySelector(
              "[data-player-control='playpause'], [data-player-control='play']"
            );

            if (playControl) {
              // Kleine delay om GSAP animatie te laten beginnen
              setTimeout(() => {
                playControl.click();
              }, 100);
            } else if (video) {
              // Fallback: direct video play
              setTimeout(() => {
                video.play().catch(() => {});
              }, 100);
            }
          } else {
            // Pause video wanneer card niet actief is
            if (video && !video.paused) {
              video.pause();
            }
          }
        }
      });
    }

    renderCards(activeIndex);

    let pressClientX = 0;
    let pressClientY = 0;

    Draggable.create(draggers, {
      type: "x",
      edgeResistance: 0.9,
      bounds: { minX: -sliderWidth / 2, maxX: sliderWidth / 2 },
      inertia: false,

      onPress() {
        pressClientX = this.pointerEvent.clientX;
        pressClientY = this.pointerEvent.clientY;
        slider.setAttribute("data-flick-drag-status", "grabbing");
      },

      onDrag() {
        const rawProgress = this.x / sliderWidth;
        const progress = Math.min(1, Math.abs(rawProgress));
        const direction = rawProgress > 0 ? -1 : 1;
        const nextIndex = (activeIndex + direction + total) % total;

        cards.forEach((card, i) => {
          const from = getConfig(i, activeIndex);
          const to = getConfig(i, nextIndex);
          const mix = (prop) => from[prop] + (to[prop] - from[prop]) * progress;

          gsap.set(card, {
            xPercent: mix("x"),
            yPercent: mix("y"),
            rotation: mix("rot"),
            scale: mix("s"),
            opacity: mix("o"),
          });
        });
      },

      onRelease() {
        slider.setAttribute("data-flick-drag-status", "grab");

        const releaseClientX = this.pointerEvent.clientX;
        const releaseClientY = this.pointerEvent.clientY;
        const dragDistance = Math.hypot(
          releaseClientX - pressClientX,
          releaseClientY - pressClientY
        );

        const raw = this.x / sliderWidth;
        let shift = 0;
        if (raw > threshold) shift = -1;
        else if (raw < -threshold) shift = 1;

        if (shift !== 0) {
          activeIndex = (activeIndex + shift + total) % total;
          renderCards(activeIndex);
        } else {
          // Geen shift, maar render opnieuw om video state te checken
          renderCards(activeIndex);
        }

        gsap.to(this.target, {
          x: 0,
          duration: 0.3,
          ease: "power1.out",
        });

        if (dragDistance < 4) {
          // Temporarily allow clicks to pass through
          this.target.style.pointerEvents = "none";

          // Allow the DOM to register pointer-through
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const el = document.elementFromPoint(
                releaseClientX,
                releaseClientY
              );
              if (el) {
                const evt = new MouseEvent("click", {
                  view: window,
                  bubbles: true,
                  cancelable: true,
                });
                el.dispatchEvent(evt);
              }

              // Restore pointer events
              this.target.style.pointerEvents = "auto";
            });
          });
        }
      },
    });
  });
}

function initBunnyPlayerBasic() {
  document
    .querySelectorAll("[data-bunny-player-init]")
    .forEach(function (player) {
      var src = player.getAttribute("data-player-src");
      if (!src) return;

      var video = player.querySelector("video");
      if (!video) return;

      try {
        video.pause();
      } catch (_) {}
      try {
        video.removeAttribute("src");
        video.load();
      } catch (_) {}

      // Attribute helpers
      function setStatus(s) {
        if (player.getAttribute("data-player-status") !== s) {
          player.setAttribute("data-player-status", s);
        }
      }
      function setActivated(v) {
        player.setAttribute("data-player-activated", v ? "true" : "false");
      }
      if (!player.hasAttribute("data-player-activated")) setActivated(false);

      // Flags
      var updateSize = player.getAttribute("data-player-update-size"); // "true" | "cover" | null
      var lazyMode = player.getAttribute("data-player-lazy"); // "true" | "meta" | null
      var isLazyTrue = lazyMode === "true";
      var isLazyMeta = lazyMode === "meta";
      var autoplay = player.getAttribute("data-player-autoplay") === "true";

      // Used to suppress 'ready' flicker when user just pressed play in lazy modes
      var pendingPlay = false;

      // Autoplay forces muted + loop; IO will drive play/pause
      video.muted = !!autoplay;
      if (autoplay) video.loop = true;

      video.setAttribute("muted", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("webkit-playsinline", "");
      video.playsInline = true;
      if (typeof video.disableRemotePlayback !== "undefined")
        video.disableRemotePlayback = true;
      if (autoplay) video.autoplay = false;

      var isSafariNative = !!video.canPlayType("application/vnd.apple.mpegurl");
      var canUseHlsJs = !!(window.Hls && Hls.isSupported()) && !isSafariNative;

      // Minimal ratio fetch when requested (and not already handled by lazy meta)
      if (updateSize === "true" && !isLazyMeta) {
        if (isLazyTrue) {
          // Do nothing: no fetch, no <video> touch when lazy=true
        } else {
          var prev = video.preload;
          video.preload = "metadata";
          var onMeta2 = function () {
            setBeforeRatio(
              player,
              updateSize,
              video.videoWidth,
              video.videoHeight
            );
            video.removeEventListener("loadedmetadata", onMeta2);
            video.preload = prev || "";
          };
          video.addEventListener("loadedmetadata", onMeta2, { once: true });
          video.src = src;
        }
      }

      //  Lazy meta fetch (duration + aspect) without attaching playback
      function fetchMetaOnce() {
        getSourceMeta(src, canUseHlsJs).then(function (meta) {
          if (meta.width && meta.height)
            setBeforeRatio(player, updateSize, meta.width, meta.height);
          readyIfIdle(player, pendingPlay);
        });
      }

      // Attach media only once (for actual playback)
      var isAttached = false;
      var userInteracted = false;
      var lastPauseBy = ""; // 'io' | 'manual' | ''
      function attachMediaOnce() {
        if (isAttached) return;
        isAttached = true;

        if (player._hls) {
          try {
            player._hls.destroy();
          } catch (_) {}
          player._hls = null;
        }

        if (isSafariNative) {
          video.preload = isLazyTrue || isLazyMeta ? "auto" : video.preload;
          video.src = src;
          video.addEventListener(
            "loadedmetadata",
            function () {
              readyIfIdle(player, pendingPlay);
              if (updateSize === "true")
                setBeforeRatio(
                  player,
                  updateSize,
                  video.videoWidth,
                  video.videoHeight
                );
            },
            { once: true }
          );
        } else if (canUseHlsJs) {
          var hls = new Hls({ maxBufferLength: 10 });
          hls.attachMedia(video);
          hls.on(Hls.Events.MEDIA_ATTACHED, function () {
            hls.loadSource(src);
          });
          hls.on(Hls.Events.MANIFEST_PARSED, function () {
            readyIfIdle(player, pendingPlay);
            if (updateSize === "true") {
              var lvls = hls.levels || [];
              var best = bestLevel(lvls);
              if (best && best.width && best.height)
                setBeforeRatio(player, updateSize, best.width, best.height);
            }
          });
          player._hls = hls;
        } else {
          // Fallback if not HLS
          video.src = src;
        }
      }

      // Initialize based on lazy mode
      if (isLazyMeta) {
        if (updateSize === "true") fetchMetaOnce();
        video.preload = "none";
      } else if (isLazyTrue) {
        video.preload = "none";
      } else {
        attachMediaOnce();
      }

      // Toggle play/pause
      function togglePlay() {
        userInteracted = true;
        if (video.paused || video.ended) {
          if ((isLazyTrue || isLazyMeta) && !isAttached) attachMediaOnce();
          pendingPlay = true;
          lastPauseBy = "";
          setStatus("loading");
          safePlay(video);
        } else {
          lastPauseBy = "manual";
          video.pause();
        }
      }

      // Toggle mute
      function toggleMute() {
        video.muted = !video.muted;
        player.setAttribute(
          "data-player-muted",
          video.muted ? "true" : "false"
        );
      }

      // Controls (delegated)
      player.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-player-control]");
        if (!btn || !player.contains(btn)) return;
        var type = btn.getAttribute("data-player-control");
        if (type === "play" || type === "pause" || type === "playpause")
          togglePlay();
        else if (type === "mute") toggleMute();
      });

      // Media event wiring
      video.addEventListener("play", function () {
        setActivated(true);
        setStatus("playing");
      });
      video.addEventListener("playing", function () {
        pendingPlay = false;
        setStatus("playing");
      });
      video.addEventListener("pause", function () {
        pendingPlay = false;
        setStatus("paused");
      });
      video.addEventListener("waiting", function () {
        setStatus("loading");
      });
      video.addEventListener("canplay", function () {
        readyIfIdle(player, pendingPlay);
      });
      video.addEventListener("ended", function () {
        pendingPlay = false;
        setStatus("paused");
        setActivated(false);
      });

      // Ensure aspect ratio updates as soon as real dimensions exist (lazy=true path included)
      var ratioSet = false;
      function maybeSetRatioOnce() {
        if (ratioSet || updateSize !== "true") return;
        var before = player.querySelector("[data-player-before]");
        if (!before) return;
        if (video.videoWidth && video.videoHeight) {
          before.style.paddingTop =
            (video.videoHeight / video.videoWidth) * 100 + "%";
          ratioSet = true;
        }
      }
      video.addEventListener("loadedmetadata", function () {
        maybeSetRatioOnce();
      });
      video.addEventListener("loadeddata", function () {
        maybeSetRatioOnce();
      });
      video.addEventListener("playing", function () {
        maybeSetRatioOnce();
      });

      // Hover (basic: active on enter, idle on leave)
      function setHover(state) {
        if (player.getAttribute("data-player-hover") !== state) {
          player.setAttribute("data-player-hover", state);
        }
      }
      player.addEventListener("pointerenter", function () {
        setHover("active");
      });
      player.addEventListener("pointerleave", function () {
        setHover("idle");
      });

      // In-view auto play/pause (only when autoplay is true)
      if (autoplay) {
        var io = new IntersectionObserver(
          function (entries) {
            entries.forEach(function (entry) {
              var inView = entry.isIntersecting && entry.intersectionRatio > 0;
              if (inView) {
                if ((isLazyTrue || isLazyMeta) && !isAttached)
                  attachMediaOnce();
                if (
                  lastPauseBy === "io" ||
                  (video.paused && lastPauseBy !== "manual")
                ) {
                  setStatus("loading");
                  if (video.paused) togglePlay();
                  lastPauseBy = "";
                }
              } else {
                if (!video.paused && !video.ended) {
                  lastPauseBy = "io";
                  video.pause();
                }
              }
            });
          },
          { threshold: 0.1 }
        );
        io.observe(player);
      }
    });

  // Helper: Ready status guard
  function readyIfIdle(player, pendingPlay) {
    if (
      !pendingPlay &&
      player.getAttribute("data-player-activated") !== "true" &&
      player.getAttribute("data-player-status") === "idle"
    ) {
      player.setAttribute("data-player-status", "ready");
    }
  }

  // Helper: Ratio setter
  function setBeforeRatio(player, updateSize, w, h) {
    if (updateSize !== "true" || !w || !h) return;
    var before = player.querySelector("[data-player-before]");
    if (!before) return;
    before.style.paddingTop = (h / w) * 100 + "%";
  }
  function maybeSetRatioFromVideo(player, updateSize, video) {
    if (updateSize !== "true") return;
    var before = player.querySelector("[data-player-before]");
    if (!before) return;
    var hasPad = before.style.paddingTop && before.style.paddingTop !== "0%";
    if (!hasPad && video.videoWidth && video.videoHeight) {
      setBeforeRatio(player, updateSize, video.videoWidth, video.videoHeight);
    }
  }

  // Helper: best HLS level by resolution
  function bestLevel(levels) {
    if (!levels || !levels.length) return null;
    return levels.reduce(function (a, b) {
      return (b.width || 0) > (a.width || 0) ? b : a;
    }, levels[0]);
  }

  // Helper: safe programmatic play
  function safePlay(video) {
    var p = video.play();
    if (p && typeof p.then === "function") p.catch(function () {});
  }

  // Helper: simple URL resolver
  function resolveUrl(base, rel) {
    try {
      return new URL(rel, base).toString();
    } catch (_) {
      return rel;
    }
  }

  // Helper: unified meta fetch (hls.js or native fetch)
  function getSourceMeta(src, useHlsJs) {
    return new Promise(function (resolve) {
      if (useHlsJs && window.Hls && Hls.isSupported()) {
        try {
          var tmp = new Hls();
          var out = { width: 0, height: 0, duration: NaN };

          tmp.on(Hls.Events.MANIFEST_PARSED, function (e, data) {
            var lvls = (data && data.levels) || tmp.levels || [];
            var best = bestLevel(lvls);
            if (best && best.width && best.height) {
              out.width = best.width;
              out.height = best.height;
            }
          });
          tmp.on(Hls.Events.LEVEL_LOADED, function (e, data) {
            if (data && data.details && isFinite(data.details.totalduration)) {
              out.duration = data.details.totalduration;
            }
          });
          tmp.on(Hls.Events.ERROR, function () {
            try {
              tmp.destroy();
            } catch (_) {}
            resolve(out);
          });
          tmp.on(Hls.Events.LEVEL_LOADED, function () {
            try {
              tmp.destroy();
            } catch (_) {}
            resolve(out);
          });

          tmp.loadSource(src);
          return;
        } catch (_) {
          resolve({ width: 0, height: 0, duration: NaN });
          return;
        }
      }

      function parseMaster(masterText) {
        var lines = masterText.split(/\r?\n/);
        var bestW = 0,
          bestH = 0,
          firstMedia = null,
          lastInf = null;
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i];
          if (line.indexOf("#EXT-X-STREAM-INF:") === 0) {
            lastInf = line;
          } else if (lastInf && line && line[0] !== "#") {
            if (!firstMedia) firstMedia = line.trim();
            var m = /RESOLUTION=(\d+)x(\d+)/.exec(lastInf);
            if (m) {
              var w = parseInt(m[1], 10),
                h = parseInt(m[2], 10);
              if (w > bestW) {
                bestW = w;
                bestH = h;
              }
            }
            lastInf = null;
          }
        }
        return { bestW: bestW, bestH: bestH, media: firstMedia };
      }
      function sumDuration(mediaText) {
        var dur = 0,
          re = /#EXTINF:([\d.]+)/g,
          m;
        while ((m = re.exec(mediaText))) dur += parseFloat(m[1]);
        return dur;
      }

      fetch(src, { credentials: "omit", cache: "no-store" })
        .then(function (r) {
          if (!r.ok) throw new Error("master");
          return r.text();
        })
        .then(function (master) {
          var info = parseMaster(master);
          if (!info.media) {
            resolve({
              width: info.bestW || 0,
              height: info.bestH || 0,
              duration: NaN,
            });
            return;
          }
          var mediaUrl = resolveUrl(src, info.media);
          return fetch(mediaUrl, { credentials: "omit", cache: "no-store" })
            .then(function (r) {
              if (!r.ok) throw new Error("media");
              return r.text();
            })
            .then(function (mediaText) {
              resolve({
                width: info.bestW || 0,
                height: info.bestH || 0,
                duration: sumDuration(mediaText),
              });
            });
        })
        .catch(function () {
          resolve({ width: 0, height: 0, duration: NaN });
        });
    });
  }
}

function initBunnyLightboxPlayer() {
  console.log("initBunnyLightboxPlayer");
  var player = document.querySelector("[data-bunny-lightbox-init]");
  if (!player) return;

  var wrapper = player.closest("[data-bunny-lightbox-status]");
  if (!wrapper) return;

  var video = player.querySelector("video");
  if (!video) return;

  try {
    video.pause();
  } catch (_) {}
  try {
    video.removeAttribute("src");
    video.load();
  } catch (_) {}

  // Attribute helpers (collapsed)
  function setAttr(el, name, val) {
    var str = typeof val === "boolean" ? (val ? "true" : "false") : String(val);
    if (el.getAttribute(name) !== str) el.setAttribute(name, str);
  }
  function setStatus(s) {
    setAttr(player, "data-player-status", s);
  }
  function setMutedState(v) {
    video.muted = !!v;
    setAttr(player, "data-player-muted", video.muted);
  }
  function setFsAttr(v) {
    setAttr(player, "data-player-fullscreen", !!v);
  }
  function setActivated(v) {
    setAttr(player, "data-player-activated", !!v);
  }
  if (!player.hasAttribute("data-player-activated")) setActivated(false);

  // Elements
  var timeline = player.querySelector("[data-player-timeline]");
  var progressBar = player.querySelector("[data-player-progress]");
  var bufferedBar = player.querySelector("[data-player-buffered]");
  var handle = player.querySelector("[data-player-timeline-handle]");
  var timeDurationEls = player.querySelectorAll("[data-player-time-duration]");
  var timeProgressEls = player.querySelectorAll("[data-player-time-progress]");
  var playerPlaceholderImg = player.querySelector(
    "[data-bunny-lightbox-placeholder]"
  );

  // Flags
  var updateSize = player.getAttribute("data-player-update-size"); // "true" | "cover" | "false" | null
  var autoplay = player.getAttribute("data-player-autoplay") === "true";
  var initialMuted = player.getAttribute("data-player-muted") === "true";

  var pendingPlay = false;

  video.loop = false;
  setMutedState(initialMuted);

  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.playsInline = true;
  if (typeof video.disableRemotePlayback !== "undefined")
    video.disableRemotePlayback = true;
  if (autoplay) video.autoplay = false;

  var isSafariNative = !!video.canPlayType("application/vnd.apple.mpegurl");
  var canUseHlsJs = !!(window.Hls && Hls.isSupported()) && !isSafariNative;

  // Load/attach only when opened
  var isAttached = false;
  var currentSrc = "";
  var lastPauseBy = "";
  var rafId;
  var autoStartOnReady = false;

  // Clamp setup for [data-bunny-lightbox-calc-height]
  function setupLightboxClamp(player, wrapper, video, updateSize) {
    var calcBox = wrapper.querySelector("[data-bunny-lightbox-calc-height]");
    if (!calcBox) return;

    function getRatio() {
      if (updateSize === "cover") return null;

      if (updateSize === "true") {
        if (video.videoWidth && video.videoHeight)
          return video.videoWidth / video.videoHeight;
        var before = player.querySelector("[data-player-before]");
        if (before && before.style && before.style.paddingTop) {
          var pct = parseFloat(before.style.paddingTop);
          if (pct > 0) return 100 / pct;
        }
        var r = player.getBoundingClientRect();
        if (r.height > 0) return r.width / r.height;
        return 16 / 9;
      }

      var beforeFalse = player.querySelector("[data-player-before]");
      if (beforeFalse && beforeFalse.style && beforeFalse.style.paddingTop) {
        var pad = parseFloat(beforeFalse.style.paddingTop);
        if (pad > 0) return 100 / pad;
      }
      var rb = player.getBoundingClientRect();
      if (rb.height > 0) return rb.width / rb.height;
      return 16 / 9;
    }

    function applyClamp() {
      if (updateSize === "cover") {
        calcBox.style.maxWidth = "";
        calcBox.style.maxHeight = "";
        return;
      }

      var parent = wrapper;
      var cs = getComputedStyle(parent);
      var pt = parseFloat(cs.paddingTop) || 0;
      var pb = parseFloat(cs.paddingBottom) || 0;
      var pl = parseFloat(cs.paddingLeft) || 0;
      var pr = parseFloat(cs.paddingRight) || 0;

      var cw = parent.clientWidth - pl - pr;
      var ch = parent.clientHeight - pt - pb;
      if (cw <= 0 || ch <= 0) return;

      var ratio = getRatio();
      if (!ratio) {
        calcBox.style.maxWidth = "";
        calcBox.style.maxHeight = "";
        return;
      }

      var hIfFullWidth = cw / ratio;

      if (hIfFullWidth <= ch) {
        calcBox.style.maxWidth = "100%";
        calcBox.style.maxHeight = (hIfFullWidth / ch) * 100 + "%";
      } else {
        calcBox.style.maxHeight = "100%";
        calcBox.style.maxWidth = ((ch * ratio) / cw) * 100 + "%";
      }
    }

    var rafPending = false;
    function debouncedApply() {
      if (rafPending) return;
      if (wrapper.getAttribute("data-bunny-lightbox-status") !== "active")
        return;
      rafPending = true;
      requestAnimationFrame(function () {
        rafPending = false;
        applyClamp();
      });
    }

    var ro = new ResizeObserver(debouncedApply);
    ro.observe(wrapper);

    window.addEventListener("resize", debouncedApply);
    window.addEventListener("orientationchange", debouncedApply);

    if (updateSize === "true") {
      video.addEventListener("loadedmetadata", debouncedApply);
      video.addEventListener("loadeddata", debouncedApply);
      video.addEventListener("playing", debouncedApply);
    }

    player._applyClamp = debouncedApply;
    debouncedApply();
  }

  setupLightboxClamp(player, wrapper, video, updateSize);

  // Unified attach pipeline
  function withAttach(src, onReady) {
    if (isSafariNative) {
      video.preload = "auto";
      video.src = src;
      video.addEventListener("loadedmetadata", onReady, { once: true });
      return;
    }
    if (canUseHlsJs) {
      var hls = new Hls({ maxBufferLength: 10 });
      player._hls = hls;
      hls.attachMedia(video);
      hls.on(Hls.Events.MEDIA_ATTACHED, function () {
        hls.loadSource(src);
      });
      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        onReady();
      });
      hls.on(Hls.Events.LEVEL_LOADED, function (e, data) {
        if (
          data &&
          data.details &&
          isFinite(data.details.totalduration) &&
          timeDurationEls.length
        ) {
          setText(timeDurationEls, formatTime(data.details.totalduration));
        }
      });
      return;
    }
    video.preload = "auto";
    video.src = src;
    video.addEventListener("loadedmetadata", onReady, { once: true });
  }

  function attachMediaFor(src) {
    if (currentSrc === src && isAttached) return;
    if (player._hls) {
      try {
        player._hls.destroy();
      } catch (_) {}
      player._hls = null;
    }
    if (timeDurationEls.length) setText(timeDurationEls, "00:00");

    currentSrc = src;
    isAttached = true;

    withAttach(src, function onReady() {
      readyIfIdle(player, pendingPlay);
      updateBeforeRatioIOSSafe();
      if (typeof player._applyClamp === "function") player._applyClamp();
      if (timeDurationEls.length && video.duration)
        setText(timeDurationEls, formatTime(video.duration));

      if (
        autoStartOnReady &&
        wrapper.getAttribute("data-bunny-lightbox-status") === "active"
      ) {
        setStatus("loading");
        safePlay(video);
        autoStartOnReady = false;
      }
    });
  }

  function ensureOpenUI(isActive) {
    var state = isActive ? "active" : "not-active";
    if (wrapper.getAttribute("data-bunny-lightbox-status") !== state) {
      wrapper.setAttribute("data-bunny-lightbox-status", state);
    }
    if (isActive && typeof player._applyClamp === "function")
      player._applyClamp();
  }

  // Centralized open policy
  function isSameSrc(next) {
    return currentSrc && currentSrc === next;
  }
  function planOnOpen(next) {
    var same = isSameSrc(next);
    if (!same) {
      try {
        if (!video.paused && !video.ended) video.pause();
      } catch (_) {}
      if (player._hls) {
        try {
          player._hls.destroy();
        } catch (_) {}
        player._hls = null;
      }
      isAttached = false;
      currentSrc = "";
      if (timeDurationEls.length) setText(timeDurationEls, "00:00");
      setActivated(false);
      setStatus("idle");

      attachMediaFor(next);
      autoStartOnReady = !!autoplay;
      pendingPlay = !!autoplay;
      return;
    }
    autoStartOnReady = !!autoplay;
    if (autoplay) {
      setStatus("loading");
      safePlay(video);
    } else {
      try {
        if (!video.paused && !video.ended) video.pause();
      } catch (_) {}
      setActivated(false);
      setStatus("paused");
    }
  }

  // Open/Close API
  function openLightbox(src, placeholderUrl) {
    if (!src) return;

    function activate() {
      ensureOpenUI(true);
      planOnOpen(src);
    }

    if (playerPlaceholderImg && placeholderUrl) {
      var needsSwap =
        playerPlaceholderImg.getAttribute("src") !== placeholderUrl;
      if (
        needsSwap ||
        !playerPlaceholderImg.complete ||
        !playerPlaceholderImg.naturalWidth
      ) {
        playerPlaceholderImg.onload = function () {
          playerPlaceholderImg.onload = null;
          activate();
        };
        playerPlaceholderImg.onerror = function () {
          playerPlaceholderImg.onerror = null;
          activate();
        };
        if (needsSwap) playerPlaceholderImg.setAttribute("src", placeholderUrl);
        else playerPlaceholderImg.dispatchEvent(new Event("load"));
      } else {
        activate();
      }
    } else {
      activate();
    }
  }

  function togglePlay() {
    if (video.paused || video.ended) {
      pendingPlay = true;
      lastPauseBy = "";
      setStatus("loading");
      safePlay(video);
    } else {
      lastPauseBy = "manual";
      video.pause();
    }
  }
  function toggleMute() {
    setMutedState(!video.muted);
  }

  player.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-player-control]");
    if (!btn || !player.contains(btn)) return;
    var type = btn.getAttribute("data-player-control");
    if (type === "play" || type === "pause" || type === "playpause")
      togglePlay();
    else if (type === "mute") toggleMute();
    else if (type === "fullscreen") toggleFullscreen();
  });

  // Fullscreen helpers
  function isFsActive() {
    return !!(document.fullscreenElement || document.webkitFullscreenElement);
  }
  function enterFullscreen() {
    if (player.requestFullscreen) return player.requestFullscreen();
    if (video.requestFullscreen) return video.requestFullscreen();
    if (
      video.webkitSupportsFullscreen &&
      typeof video.webkitEnterFullscreen === "function"
    )
      return video.webkitEnterFullscreen();
  }
  function exitFullscreen() {
    if (document.exitFullscreen) return document.exitFullscreen();
    if (document.webkitExitFullscreen) return document.webkitExitFullscreen();
    if (
      video.webkitDisplayingFullscreen &&
      typeof video.webkitExitFullscreen === "function"
    )
      return video.webkitExitFullscreen();
  }
  function toggleFullscreen() {
    if (isFsActive() || video.webkitDisplayingFullscreen) exitFullscreen();
    else enterFullscreen();
  }
  document.addEventListener("fullscreenchange", function () {
    setFsAttr(isFsActive());
  });
  document.addEventListener("webkitfullscreenchange", function () {
    setFsAttr(isFsActive());
  });
  video.addEventListener("webkitbeginfullscreen", function () {
    setFsAttr(true);
  });
  video.addEventListener("webkitendfullscreen", function () {
    setFsAttr(false);
  });

  // Time text (not in rAF)
  function updateTimeTexts() {
    if (timeDurationEls.length)
      setText(timeDurationEls, formatTime(video.duration));
    if (timeProgressEls.length)
      setText(timeProgressEls, formatTime(video.currentTime));
  }
  video.addEventListener("timeupdate", updateTimeTexts);
  video.addEventListener("loadedmetadata", function () {
    updateTimeTexts();
    updateBeforeRatioIOSSafe();
  });
  video.addEventListener("loadeddata", function () {
    updateBeforeRatioIOSSafe();
  });
  video.addEventListener("playing", function () {
    updateBeforeRatioIOSSafe();
  });
  video.addEventListener("durationchange", updateTimeTexts);

  // rAF visuals (progress + handle only)
  function updateProgressVisuals() {
    if (!video.duration) return;
    var playedPct = (video.currentTime / video.duration) * 100;
    if (progressBar)
      progressBar.style.transform = "translateX(" + (-100 + playedPct) + "%)";
    if (handle) handle.style.left = pctClamp(playedPct) + "%";
  }
  function pctClamp(p) {
    return p < 0 ? 0 : p > 100 ? 100 : p;
  }
  function loop() {
    updateProgressVisuals();
    if (!video.paused && !video.ended) rafId = requestAnimationFrame(loop);
  }

  // Buffered bar (not in rAF)
  function updateBufferedBar() {
    if (!bufferedBar || !video.duration || !video.buffered.length) return;
    var end = video.buffered.end(video.buffered.length - 1);
    var buffPct = (end / video.duration) * 100;
    bufferedBar.style.transform = "translateX(" + (-100 + buffPct) + "%)";
  }
  video.addEventListener("progress", updateBufferedBar);
  video.addEventListener("loadedmetadata", updateBufferedBar);
  video.addEventListener("durationchange", updateBufferedBar);

  // Media event wiring
  video.addEventListener("play", function () {
    setActivated(true);
    cancelAnimationFrame(rafId);
    loop();
    setStatus("playing");
  });
  video.addEventListener("playing", function () {
    pendingPlay = false;
    setStatus("playing");
  });
  video.addEventListener("pause", function () {
    pendingPlay = false;
    cancelAnimationFrame(rafId);
    updateProgressVisuals();
    setStatus("paused");
  });
  video.addEventListener("waiting", function () {
    setStatus("loading");
  });
  video.addEventListener("canplay", function () {
    readyIfIdle(player, pendingPlay);
  });

  // Video ended
  video.addEventListener("ended", function () {
    pendingPlay = false;
    cancelAnimationFrame(rafId);
    updateProgressVisuals();
    setActivated(false);
    video.currentTime = 0;

    // Exit fullscreen if active
    if (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      video.webkitDisplayingFullscreen
    ) {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (video.webkitExitFullscreen) video.webkitExitFullscreen();
    }

    closeLightbox();
  });

  // Scrubbing (pointer events)
  if (timeline) {
    var dragging = false,
      wasPlaying = false,
      targetTime = 0,
      lastSeekTs = 0,
      seekThrottle = 180,
      rect = null;
    window.addEventListener("resize", function () {
      if (!dragging) rect = null;
    });
    function getFractionFromX(x) {
      if (!rect) rect = timeline.getBoundingClientRect();
      var f = (x - rect.left) / rect.width;
      if (f < 0) f = 0;
      if (f > 1) f = 1;
      return f;
    }
    function previewAtFraction(f) {
      if (!video.duration) return;
      var pct = f * 100;
      if (progressBar)
        progressBar.style.transform = "translateX(" + (-100 + pct) + "%)";
      if (handle) handle.style.left = pct + "%";
      if (timeProgressEls.length)
        setText(timeProgressEls, formatTime(f * video.duration));
    }
    function maybeSeek(now) {
      if (!video.duration) return;
      if (now - lastSeekTs < seekThrottle) return;
      lastSeekTs = now;
      video.currentTime = targetTime;
    }
    function onPointerDown(e) {
      if (!video.duration) return;
      dragging = true;
      wasPlaying = !video.paused && !video.ended;
      if (wasPlaying) video.pause();
      player.setAttribute("data-timeline-drag", "true");
      rect = timeline.getBoundingClientRect();
      var f = getFractionFromX(e.clientX);
      targetTime = f * video.duration;
      previewAtFraction(f);
      maybeSeek(performance.now());
      timeline.setPointerCapture && timeline.setPointerCapture(e.pointerId);
      window.addEventListener("pointermove", onPointerMove, { passive: false });
      window.addEventListener("pointerup", onPointerUp, { passive: true });
      e.preventDefault();
    }
    function onPointerMove(e) {
      if (!dragging) return;
      var f = getFractionFromX(e.clientX);
      targetTime = f * video.duration;
      previewAtFraction(f);
      maybeSeek(performance.now());
      e.preventDefault();
    }
    function onPointerUp() {
      if (!dragging) return;
      dragging = false;
      player.setAttribute("data-timeline-drag", "false");
      rect = null;
      video.currentTime = targetTime;
      if (wasPlaying) safePlay(video);
      else {
        updateProgressVisuals();
        updateTimeTexts();
      }
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    }
    timeline.addEventListener("pointerdown", onPointerDown, { passive: false });
    if (handle)
      handle.addEventListener("pointerdown", onPointerDown, { passive: false });
  }

  // Hover/idle detection (pointer-based)
  var hoverTimer;
  var hoverHideDelay = 3000;
  function setHover(state) {
    if (player.getAttribute("data-player-hover") !== state) {
      player.setAttribute("data-player-hover", state);
    }
  }
  function scheduleHide() {
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(function () {
      setHover("idle");
    }, hoverHideDelay);
  }
  function wakeControls() {
    setHover("active");
    scheduleHide();
  }
  player.addEventListener("pointerdown", wakeControls);
  document.addEventListener("fullscreenchange", wakeControls);
  document.addEventListener("webkitfullscreenchange", wakeControls);
  var trackingMove = false;
  function onPointerMoveGlobal(e) {
    var r = player.getBoundingClientRect();
    if (
      e.clientX >= r.left &&
      e.clientX <= r.right &&
      e.clientY >= r.top &&
      e.clientY <= r.bottom
    )
      wakeControls();
  }
  player.addEventListener("pointerenter", function () {
    wakeControls();
    if (!trackingMove) {
      trackingMove = true;
      window.addEventListener("pointermove", onPointerMoveGlobal, {
        passive: true,
      });
    }
  });
  player.addEventListener("pointerleave", function () {
    setHover("idle");
    clearTimeout(hoverTimer);
    if (trackingMove) {
      trackingMove = false;
      window.removeEventListener("pointermove", onPointerMoveGlobal);
    }
  });

  // Close Function
  function closeLightbox() {
    ensureOpenUI(false);

    var hasPlayed = false;
    try {
      if (video.played && video.played.length) {
        for (var i = 0; i < video.played.length; i++) {
          if (video.played.end(i) > 0) {
            hasPlayed = true;
            break;
          }
        }
      } else {
        hasPlayed = video.currentTime > 0;
      }
    } catch (_) {}

    try {
      if (!video.paused && !video.ended) video.pause();
    } catch (_) {}

    setActivated(false);
    setStatus(hasPlayed ? "paused" : "idle");
  }

  // Global open/close controls + ESC
  document.addEventListener("click", function (e) {
    var openBtn = e.target.closest('[data-bunny-lightbox-control="open"]');
    if (openBtn) {
      var src = openBtn.getAttribute("data-bunny-lightbox-src") || "";
      if (!src) return;
      var imgEl = openBtn.querySelector("[data-bunny-lightbox-placeholder]");
      var placeholderUrl = imgEl ? imgEl.getAttribute("src") : "";
      openLightbox(src, placeholderUrl);
      return;
    }
    var closeBtn = e.target.closest('[data-bunny-lightbox-control="close"]');
    if (closeBtn) {
      var closeInWrapper = closeBtn.closest("[data-bunny-lightbox-status]");
      if (closeInWrapper === wrapper) closeLightbox();
      return;
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });

  // Helper: time/text/meta/ratio utilities
  function pad2(n) {
    return (n < 10 ? "0" : "") + n;
  }
  function formatTime(sec) {
    if (!isFinite(sec) || sec < 0) return "00:00";
    var s = Math.floor(sec),
      h = Math.floor(s / 3600),
      m = Math.floor((s % 3600) / 60),
      r = s % 60;
    return h > 0 ? h + ":" + pad2(m) + ":" + pad2(r) : pad2(m) + ":" + pad2(r);
  }
  function setText(nodes, text) {
    nodes.forEach(function (n) {
      n.textContent = text;
    });
  }

  // Helper: Choose best HLS level by resolution --- */
  function bestLevel(levels) {
    if (!levels || !levels.length) return null;
    return levels.reduce(function (a, b) {
      return (b.width || 0) > (a.width || 0) ? b : a;
    }, levels[0]);
  }

  // Helper: Safe programmatic play
  function safePlay(video) {
    var p = video.play();
    if (p && typeof p.then === "function") p.catch(function () {});
  }

  // Helper: Ready status guard
  function readyIfIdle(player, pendingPlay) {
    if (
      !pendingPlay &&
      player.getAttribute("data-player-activated") !== "true" &&
      player.getAttribute("data-player-status") === "idle"
    ) {
      player.setAttribute("data-player-status", "ready");
    }
  }

  // Helper: Ratio Setter
  function setBeforeRatio(player, updateSize, w, h) {
    if (updateSize !== "true" || !w || !h) return;
    var before = player.querySelector("[data-player-before]");
    if (!before) return;
    before.style.paddingTop = (h / w) * 100 + "%";
  }
  function maybeSetRatioFromVideo(player, updateSize, video) {
    if (updateSize !== "true") return;
    var before = player.querySelector("[data-player-before]");
    if (!before) return;
    var hasPad = before.style.paddingTop && before.style.paddingTop !== "0%";
    if (!hasPad && video.videoWidth && video.videoHeight) {
      setBeforeRatio(player, updateSize, video.videoWidth, video.videoHeight);
    }
  }

  // Helper: robust ratio setter for iOS Safari (with HLS fallback)
  function updateBeforeRatioIOSSafe() {
    if (updateSize !== "true") return;
    var before = player.querySelector("[data-player-before]");
    if (!before) return;

    function apply(w, h) {
      if (!w || !h) return;
      before.style.paddingTop = (h / w) * 100 + "%";
      if (typeof player._applyClamp === "function") player._applyClamp();
    }

    if (video.videoWidth && video.videoHeight) {
      apply(video.videoWidth, video.videoHeight);
      return;
    }

    if (player._hls && player._hls.levels && player._hls.levels.length) {
      var lvls = player._hls.levels;
      var best = lvls.reduce(function (a, b) {
        return (b.width || 0) > (a.width || 0) ? b : a;
      }, lvls[0]);
      if (best && best.width && best.height) {
        apply(best.width, best.height);
        return;
      }
    }

    requestAnimationFrame(function () {
      if (video.videoWidth && video.videoHeight) {
        apply(video.videoWidth, video.videoHeight);
        return;
      }

      var master =
        typeof currentSrc === "string" && currentSrc ? currentSrc : "";
      if (!master || master.indexOf("blob:") === 0) {
        var attrSrc =
          player.getAttribute("data-bunny-lightbox-src") ||
          player.getAttribute("data-player-src") ||
          "";
        if (attrSrc && attrSrc.indexOf("blob:") !== 0) master = attrSrc;
      }
      if (!master || !/^https?:/i.test(master)) return;

      fetch(master, { credentials: "omit", cache: "no-store" })
        .then(function (r) {
          if (!r.ok) throw new Error();
          return r.text();
        })
        .then(function (txt) {
          var lines = txt.split(/\r?\n/);
          var bestW = 0,
            bestH = 0,
            last = null;
          for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (line.indexOf("#EXT-X-STREAM-INF:") === 0) {
              last = line;
            } else if (last && line && line[0] !== "#") {
              var m = /RESOLUTION=(\d+)x(\d+)/.exec(last);
              if (m) {
                var W = parseInt(m[1], 10),
                  H = parseInt(m[2], 10);
                if (W > bestW) {
                  bestW = W;
                  bestH = H;
                }
              }
              last = null;
            }
          }
          if (bestW && bestH) apply(bestW, bestH);
        })
        .catch(function () {});
    });
  }
}

function ensureMinimumSlides(swiperWrapper, minSlides = 6) {

  let slides = swiperWrapper.querySelectorAll(".swiper-slide");

  while (slides.length < minSlides) {

    slides.forEach((slide) => {
      const clone = slide.cloneNode(true);
      swiperWrapper.appendChild(clone);
    });

    slides = swiperWrapper.querySelectorAll(".swiper-slide");
  }
}

function initVacatureHeroSwiper() {

  const swiperEl = document.querySelector(".swiper.is-vacature-hero-slider");
  if (!swiperEl) return;

  const swiperWrapper = swiperEl.querySelector(".swiper-wrapper");
  if (!swiperWrapper) return;

  const isMobile = window.innerWidth < 768;

  // Alleen desktop video toevoegen
  if (!isMobile) {

    const bunnyPlayer = document.querySelector(".vacature-header_bunny-player");

    if (bunnyPlayer) {

      const slide = document.createElement("div");
      slide.classList.add(
        "swiper-slide",
        "is-vacature-hero-slider",
        "w-dyn-item"
      );

      const centeredWrapper = document.createElement("div");
      centeredWrapper.classList.add("centered-slider-wrapper");

      centeredWrapper.prepend(bunnyPlayer);
      slide.prepend(centeredWrapper);

      swiperWrapper.prepend(slide);
    }
  }

  // Forceer genoeg slides voor loop
  ensureMinimumSlides(swiperWrapper, 6);

  startSwiper();
}

function startSwiper() {

  new Swiper(".swiper.is-vacature-hero-slider", {
    spaceBetween: 24,
    loop: true,

    breakpoints: {
      0: {
        slidesPerView: 1.75,
        centeredSlides: true,
      },

      768: {
        slidesPerView: 2,
      },

      1024: {
        slidesPerView: 3.25,
      },
    },
  });
}

function initSwipers() {
  const stappenSwiper = new Swiper(".swiper.is-vacature-stappen", {
    createElements: true,
    slidesOffsetBefore: 16,
    slidesOffsetAfter: 16,
    slideToClickedSlide: true,
    pagination: true,
    breakpoints: {
      0: {
        slidesPerView: 1.05,
        spaceBetween: 16,
      },
    },
  });

  // const heroImgSwiper = new Swiper(".swiper.is-vacature-hero-img", {
  //   slidesPerView: 4.5,
  //   centeredSlides: true,
  //   spaceBetween: 16,
  //   loop: true,
  //   autoplay: {
  //     delay: 2500,
  //     disableOnInteraction: false,
  //   },
  //   loop: true,
  // });
}

function initSliders() {
  const sliderWrappers = gsap.utils.toArray(
    document.querySelectorAll('[data-centered-slider="wrapper"]')
  );

  sliderWrappers.forEach((sliderWrapper) => {
    const slides = gsap.utils.toArray(
      sliderWrapper.querySelectorAll('[data-centered-slider="slide"]')
    );
    const bullets = gsap.utils.toArray(
      sliderWrapper.querySelectorAll('[data-centered-slider="bullet"]')
    );
    const prevButton = sliderWrapper.querySelector(
      '[data-centered-slider="prev-button"]'
    );
    const nextButton = sliderWrapper.querySelector(
      '[data-centered-slider="next-button"]'
    );

    let activeElement;
    let activeBullet;
    let currentIndex = 0;
    let autoplay;

    // Autoplay is now enabled/disabled via a boolean attribute.
    const autoplayEnabled =
      sliderWrapper.getAttribute("data-slider-autoplay") === "true";

    // If enabled, get the autoplay duration (in seconds) from the separate attribute.
    const autoplayDuration = autoplayEnabled
      ? parseFloat(
          sliderWrapper.getAttribute("data-slider-autoplay-duration")
        ) || 0
      : 0;

    // Dynamically assign unique IDs to slides
    slides.forEach((slide, i) => {
      slide.setAttribute("id", `slide-${i}`);
    });

    // Set ARIA attributes on bullets if they exist
    if (bullets && bullets.length > 0) {
      bullets.forEach((bullet, i) => {
        bullet.setAttribute("aria-controls", `slide-${i}`);
        bullet.setAttribute(
          "aria-selected",
          i === currentIndex ? "true" : "false"
        );
      });
    }

    const loop = horizontalLoop(slides, {
      paused: true,
      draggable: true,
      center: true,
      onChange: (element, index) => {
        currentIndex = index;

        if (activeElement) activeElement.classList.remove("active");
        element.classList.add("active");
        activeElement = element;

        if (bullets && bullets.length > 0) {
          if (activeBullet) activeBullet.classList.remove("active");
          if (bullets[index]) {
            bullets[index].classList.add("active");
            activeBullet = bullets[index];
          }
          bullets.forEach((bullet, i) => {
            bullet.setAttribute(
              "aria-selected",
              i === index ? "true" : "false"
            );
          });
        }
      },
    });

    // On initialization, center the slider
    loop.toIndex(2, { duration: 0.01 });

    function startAutoplay() {
      if (autoplayDuration > 0 && !autoplay) {
        const repeat = () => {
          loop.next({ ease: "osmo-ease", duration: 0.725 });
          autoplay = gsap.delayedCall(autoplayDuration, repeat);
        };
        autoplay = gsap.delayedCall(autoplayDuration, repeat);
      }
    }

    function stopAutoplay() {
      if (autoplay) {
        autoplay.kill();
        autoplay = null;
      }
    }

    // Start/stop autoplay based on viewport visibility via ScrollTrigger
    ScrollTrigger.create({
      trigger: sliderWrapper,
      start: "top bottom",
      end: "bottom top",
      onEnter: startAutoplay,
      onLeave: stopAutoplay,
      onEnterBack: startAutoplay,
      onLeaveBack: stopAutoplay,
    });

    // Pause autoplay on mouse hover over the slider
    sliderWrapper.addEventListener("mouseenter", stopAutoplay);
    sliderWrapper.addEventListener("mouseleave", () => {
      if (ScrollTrigger.isInViewport(sliderWrapper)) startAutoplay();
    });

    // Slide click event for direct navigation
    slides.forEach((slide, i) => {
      slide.addEventListener("click", () => {
        loop.toIndex(i, { ease: "osmo-ease", duration: 0.725 });
      });
    });

    // Bullets click event for direct navigation (if available)
    if (bullets && bullets.length > 0) {
      bullets.forEach((bullet, i) => {
        bullet.addEventListener("click", () => {
          loop.toIndex(i, { ease: "osmo-ease", duration: 0.725 });
          if (activeBullet) activeBullet.classList.remove("active");
          bullet.classList.add("active");
          activeBullet = bullet;
          bullets.forEach((b, j) => {
            b.setAttribute("aria-selected", j === i ? "true" : "false");
          });
        });
      });
    }

    // Prev/Next button listeners (if the buttons exist)
    if (prevButton) {
      prevButton.addEventListener("click", () => {
        let newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = slides.length - 1;
        loop.toIndex(newIndex, { ease: "osmo-ease", duration: 0.725 });
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", () => {
        let newIndex = currentIndex + 1;
        if (newIndex >= slides.length) newIndex = 0;
        loop.toIndex(newIndex, { ease: "osmo-ease", duration: 0.725 });
      });
    }
  });
}

// GSAP Helper function to create a looping slider
// Read more: https://gsap.com/docs/v3/HelperFunctions/helpers/seamlessLoop
function horizontalLoop(items, config) {
  let timeline;
  items = gsap.utils.toArray(items);
  config = config || {};
  gsap.context(() => {
    let onChange = config.onChange,
      lastIndex = 0,
      tl = gsap.timeline({
        repeat: config.repeat,
        onUpdate:
          onChange &&
          function () {
            let i = tl.closestIndex();
            if (lastIndex !== i) {
              lastIndex = i;
              onChange(items[i], i);
            }
          },
        paused: config.paused,
        defaults: { ease: "none" },
        onReverseComplete: () =>
          tl.totalTime(tl.rawTime() + tl.duration() * 100),
      }),
      length = items.length,
      startX = items[0].offsetLeft,
      times = [],
      widths = [],
      spaceBefore = [],
      xPercents = [],
      curIndex = 0,
      indexIsDirty = false,
      center = config.center,
      pixelsPerSecond = (config.speed || 1) * 100,
      snap =
        config.snap === false ? (v) => v : gsap.utils.snap(config.snap || 1),
      timeOffset = 0,
      container =
        center === true
          ? items[0].parentNode
          : gsap.utils.toArray(center)[0] || items[0].parentNode,
      totalWidth,
      getTotalWidth = () =>
        items[length - 1].offsetLeft +
        (xPercents[length - 1] / 100) * widths[length - 1] -
        startX +
        spaceBefore[0] +
        items[length - 1].offsetWidth *
          gsap.getProperty(items[length - 1], "scaleX") +
        (parseFloat(config.paddingRight) || 0),
      populateWidths = () => {
        let b1 = container.getBoundingClientRect(),
          b2;
        items.forEach((el, i) => {
          widths[i] = parseFloat(gsap.getProperty(el, "width", "px"));
          xPercents[i] = snap(
            (parseFloat(gsap.getProperty(el, "x", "px")) / widths[i]) * 100 +
              gsap.getProperty(el, "xPercent")
          );
          b2 = el.getBoundingClientRect();
          spaceBefore[i] = b2.left - (i ? b1.right : b1.left);
          b1 = b2;
        });
        gsap.set(items, {
          xPercent: (i) => xPercents[i],
        });
        totalWidth = getTotalWidth();
      },
      timeWrap,
      populateOffsets = () => {
        timeOffset = center
          ? (tl.duration() * (container.offsetWidth / 2)) / totalWidth
          : 0;
        center &&
          times.forEach((t, i) => {
            times[i] = timeWrap(
              tl.labels["label" + i] +
                (tl.duration() * widths[i]) / 2 / totalWidth -
                timeOffset
            );
          });
      },
      getClosest = (values, value, wrap) => {
        let i = values.length,
          closest = 1e10,
          index = 0,
          d;
        while (i--) {
          d = Math.abs(values[i] - value);
          if (d > wrap / 2) {
            d = wrap - d;
          }
          if (d < closest) {
            closest = d;
            index = i;
          }
        }
        return index;
      },
      populateTimeline = () => {
        let i, item, curX, distanceToStart, distanceToLoop;
        tl.clear();
        for (i = 0; i < length; i++) {
          item = items[i];
          curX = (xPercents[i] / 100) * widths[i];
          distanceToStart = item.offsetLeft + curX - startX + spaceBefore[0];
          distanceToLoop =
            distanceToStart + widths[i] * gsap.getProperty(item, "scaleX");
          tl.to(
            item,
            {
              xPercent: snap(((curX - distanceToLoop) / widths[i]) * 100),
              duration: distanceToLoop / pixelsPerSecond,
            },
            0
          )
            .fromTo(
              item,
              {
                xPercent: snap(
                  ((curX - distanceToLoop + totalWidth) / widths[i]) * 100
                ),
              },
              {
                xPercent: xPercents[i],
                duration:
                  (curX - distanceToLoop + totalWidth - curX) / pixelsPerSecond,
                immediateRender: false,
              },
              distanceToLoop / pixelsPerSecond
            )
            .add("label" + i, distanceToStart / pixelsPerSecond);
          times[i] = distanceToStart / pixelsPerSecond;
        }
        timeWrap = gsap.utils.wrap(0, tl.duration());
      },
      refresh = (deep) => {
        let progress = tl.progress();
        tl.progress(0, true);
        populateWidths();
        deep && populateTimeline();
        populateOffsets();
        deep && tl.draggable
          ? tl.time(times[curIndex], true)
          : tl.progress(progress, true);
      },
      onResize = () => refresh(true),
      proxy;
    gsap.set(items, { x: 0 });
    populateWidths();
    populateTimeline();
    populateOffsets();
    window.addEventListener("resize", onResize);
    function toIndex(index, vars) {
      vars = vars || {};
      Math.abs(index - curIndex) > length / 2 &&
        (index += index > curIndex ? -length : length); // always go in the shortest direction
      let newIndex = gsap.utils.wrap(0, length, index),
        time = times[newIndex];
      if (time > tl.time() !== index > curIndex && index !== curIndex) {
        // if we're wrapping the timeline's playhead, make the proper adjustments
        time += tl.duration() * (index > curIndex ? 1 : -1);
      }
      if (time < 0 || time > tl.duration()) {
        vars.modifiers = { time: timeWrap };
      }
      curIndex = newIndex;
      vars.overwrite = true;
      gsap.killTweensOf(proxy);
      return vars.duration === 0
        ? tl.time(timeWrap(time))
        : tl.tweenTo(time, vars);
    }
    tl.toIndex = (index, vars) => toIndex(index, vars);
    tl.closestIndex = (setCurrent) => {
      let index = getClosest(times, tl.time(), tl.duration());
      if (setCurrent) {
        curIndex = index;
        indexIsDirty = false;
      }
      return index;
    };
    tl.current = () => (indexIsDirty ? tl.closestIndex(true) : curIndex);
    tl.next = (vars) => toIndex(tl.current() + 1, vars);
    tl.previous = (vars) => toIndex(tl.current() - 1, vars);
    tl.times = times;
    tl.progress(1, true).progress(0, true); // pre-render for performance
    if (config.reversed) {
      tl.vars.onReverseComplete();
      tl.reverse();
    }
    if (config.draggable && typeof Draggable === "function") {
      proxy = document.createElement("div");
      let wrap = gsap.utils.wrap(0, 1),
        ratio,
        startProgress,
        draggable,
        dragSnap,
        lastSnap,
        initChangeX,
        wasPlaying,
        align = () =>
          tl.progress(
            wrap(startProgress + (draggable.startX - draggable.x) * ratio)
          ),
        syncIndex = () => tl.closestIndex(true);
      typeof InertiaPlugin === "undefined" &&
        console.warn(
          "InertiaPlugin required for momentum-based scrolling and snapping. https://greensock.com/club"
        );
      draggable = Draggable.create(proxy, {
        trigger: items[0].parentNode,
        type: "x",
        // INERTIA TUNING
        inertia: true,
        throwResistance: 4000, // default ≈ 1000 – hoger = sneller afremmen
        minDuration: 0.2, // minimaal 0.2s
        maxDuration: 0.6, // maximaal 0.6s "doorschieten"
        onPressInit() {
          let x = this.x;
          gsap.killTweensOf(tl);
          wasPlaying = !tl.paused();
          tl.pause();
          startProgress = tl.progress();
          refresh();
          ratio = 0.5 / totalWidth;
          initChangeX = startProgress / -ratio - x;
          gsap.set(proxy, { x: startProgress / -ratio });
        },
        onDrag: align,
        onThrowUpdate: align,
        overshootTolerance: 0,
        inertia: true,
        snap(value) {
          if (Math.abs(startProgress / -ratio - this.x) < 10) {
            return lastSnap + initChangeX;
          }
          let time = -(value * ratio) * tl.duration(),
            wrappedTime = timeWrap(time),
            snapTime = times[getClosest(times, wrappedTime, tl.duration())],
            dif = snapTime - wrappedTime;
          Math.abs(dif) > tl.duration() / 2 &&
            (dif += dif < 0 ? tl.duration() : -tl.duration());
          lastSnap = (time + dif) / tl.duration() / -ratio;
          return lastSnap;
        },
        onRelease() {
          syncIndex();
          draggable.isThrowing && (indexIsDirty = true);
        },
        onThrowComplete: () => {
          syncIndex();
          wasPlaying && tl.play();
        },
      })[0];
      tl.draggable = draggable;
    }
    tl.closestIndex(true);
    lastIndex = curIndex;
    onChange && onChange(items[curIndex], curIndex);
    timeline = tl;
    return () => window.removeEventListener("resize", onResize);
  });
  return timeline;
}

function initMomentumBasedHover() {
  // If this device can’t hover with a fine pointer, stop here
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    return;
  }

  // Configuration (tweak these for feel)
  const xyMultiplier = 15; // multiplies pointer velocity for x/y movement
  const rotationMultiplier = 10; // multiplies normalized torque for rotation speed
  const inertiaResistance = 400; // higher = stops sooner

  // Pre-build clamp functions for performance
  const clampXY = gsap.utils.clamp(-1080, 1080);
  const clampRot = gsap.utils.clamp(-60, 60);

  // Initialize each root container
  document.querySelectorAll("[data-momentum-hover-init]").forEach((root) => {
    let prevX = 0,
      prevY = 0;
    let velX = 0,
      velY = 0;
    let rafId = null;

    // Track pointer velocity (throttled to RAF)
    root.addEventListener("mousemove", (e) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        velX = e.clientX - prevX;
        velY = e.clientY - prevY;
        prevX = e.clientX;
        prevY = e.clientY;
        rafId = null;
      });
    });

    // Attach hover inertia to each child element
    root.querySelectorAll("[data-momentum-hover-element]").forEach((el) => {
      el.addEventListener("mouseenter", (e) => {
        const target = el.querySelector("[data-momentum-hover-target]");
        if (!target) return;

        // Compute offset from center to pointer
        const { left, top, width, height } = target.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        const offsetX = e.clientX - centerX;
        const offsetY = e.clientY - centerY;

        // Compute raw torque (px²/frame)
        const rawTorque = offsetX * velY - offsetY * velX;

        // Normalize torque so rotation ∝ pointer speed (deg/sec)
        const leverDist = Math.hypot(offsetX, offsetY) || 1;
        const angularForce = rawTorque / leverDist;

        // Calculate and clamp velocities
        const velocityX = clampXY(velX * xyMultiplier);
        const velocityY = clampXY(velY * xyMultiplier);
        const rotationVelocity = clampRot(angularForce * rotationMultiplier);

        // Apply GSAP inertia tween
        gsap.to(target, {
          inertia: {
            x: { velocity: velocityX, end: 0 },
            y: { velocity: velocityY, end: 0 },
            rotation: { velocity: rotationVelocity, end: 0 },
            resistance: inertiaResistance,
          },
        });
      });
    });
  });
}
