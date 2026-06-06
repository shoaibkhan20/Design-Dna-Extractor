
(function () {
  'use strict';

  // ─── Utility helpers ───────────────────────────────────────────────

  function hexFromRgb(rgb) {
    if (!rgb || rgb === 'transparent' || rgb === 'none') return null;
    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!match) return null;
    const r = parseInt(match[1]), g = parseInt(match[2]), b = parseInt(match[3]);
    if (r === 0 && g === 0 && b === 0) return null;
    if (r === 255 && g === 255 && b === 255) return null;
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  function getLuminance(hex) {
    if (!hex) return 0;
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  function truncate(str, len) {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) + '…' : str;
  }

  // ─── 1. Library & Framework Detection ──────────────────────────────

  function extractLibraries() {
    const detected = [];

    // ── Script src scanning ──
    const scriptSrcs = Array.from(document.querySelectorAll('script[src]'))
      .map(s => s.src.toLowerCase());
    const scriptInline = Array.from(document.querySelectorAll('script:not([src])'))
      .map(s => s.textContent.substring(0, 2000).toLowerCase());
    const allScriptText = scriptInline.join(' ');

    // ── Link href scanning ──
    const linkHrefs = Array.from(document.querySelectorAll('link[rel="stylesheet"], link[href]'))
      .map(l => (l.href || '').toLowerCase());

    // ── Meta generator ──
    const generator = document.querySelector('meta[name="generator"]')?.content || '';

    // ── Class-name sampling ──
    const allClasses = Array.from(document.querySelectorAll('[class]'))
      .slice(0, 500)
      .flatMap(el => (typeof el.className === 'string' ? el.className : '').split(/\s+/));
    const classSet = new Set(allClasses);
    const classStr = allClasses.join(' ');

    // Helper
    function srcMatch(pattern) { return scriptSrcs.some(s => s.includes(pattern)); }
    function linkMatch(pattern) { return linkHrefs.some(l => l.includes(pattern)); }
    function classMatch(patterns) { return patterns.some(p => classSet.has(p)); }
    function hasDataAttr(attr) { return document.querySelector(`[${attr}]`) !== null; }

    // ── Animation / Interaction Libraries ──

    // GSAP
    if (srcMatch('gsap') || srcMatch('tweenmax') || srcMatch('greensock') || allScriptText.includes('gsap.')) {
      const plugins = [];
      if (srcMatch('scrolltrigger') || allScriptText.includes('scrolltrigger')) plugins.push('ScrollTrigger');
      if (srcMatch('scrollto') || allScriptText.includes('scrollto')) plugins.push('ScrollTo');
      if (srcMatch('draggable') || allScriptText.includes('draggable')) plugins.push('Draggable');
      if (srcMatch('motionpath') || allScriptText.includes('motionpath')) plugins.push('MotionPath');
      if (srcMatch('splittext') || allScriptText.includes('splittext')) plugins.push('SplitText');
      if (srcMatch('flip') || allScriptText.includes('gsap.flip') || allScriptText.includes('flip.')) plugins.push('Flip');
      detected.push({
        name: 'GSAP',
        category: 'animation',
        usage: `Professional animation library${plugins.length ? '. Plugins: ' + plugins.join(', ') : ''}`,
        plugins
      });
    }

    // AOS (Animate on Scroll)
    if (srcMatch('aos') || linkMatch('aos') || hasDataAttr('data-aos')) {
      const aosEls = document.querySelectorAll('[data-aos]');
      const aosTypes = new Set(Array.from(aosEls).map(el => el.getAttribute('data-aos')));
      detected.push({
        name: 'AOS (Animate on Scroll)',
        category: 'scroll-animation',
        usage: `Scroll reveal library. ${aosEls.length} animated elements detected. Animations used: ${Array.from(aosTypes).join(', ')}`,
        dataAttributes: ['data-aos', 'data-aos-delay', 'data-aos-duration', 'data-aos-easing', 'data-aos-offset']
      });
    }

    // Locomotive Scroll
    if (srcMatch('locomotive') || hasDataAttr('data-scroll') || classMatch(['has-scroll-smooth', 'locomotive-scroll'])) {
      const scrollEls = document.querySelectorAll('[data-scroll]');
      detected.push({
        name: 'Locomotive Scroll',
        category: 'scroll-animation',
        usage: `Smooth scroll + parallax library. ${scrollEls.length} scroll-animated elements. Provides data-scroll, data-scroll-speed, data-scroll-direction attributes`,
        dataAttributes: ['data-scroll', 'data-scroll-speed', 'data-scroll-direction', 'data-scroll-sticky', 'data-scroll-section']
      });
    }

    // Lenis
    if (srcMatch('lenis') || allScriptText.includes('lenis')) {
      detected.push({ name: 'Lenis', category: 'scroll', usage: 'Smooth scroll library for buttery scroll experiences' });
    }

    // ScrollMagic
    if (srcMatch('scrollmagic') || allScriptText.includes('scrollmagic')) {
      detected.push({ name: 'ScrollMagic', category: 'scroll-animation', usage: 'Scroll interaction library for pinning, tweening on scroll' });
    }

    // Anime.js
    if (srcMatch('anime') || allScriptText.includes('anime(') || allScriptText.includes('anime.')) {
      detected.push({ name: 'Anime.js', category: 'animation', usage: 'Lightweight JS animation library for DOM, SVG, CSS, and object animations' });
    }

    // Framer Motion (React)
    if (allScriptText.includes('framer-motion') || allScriptText.includes('motion.div')) {
      detected.push({ name: 'Framer Motion', category: 'animation', usage: 'React animation library for declarative animations, layout transitions, and gestures' });
    }

    // Barba.js
    if (srcMatch('barba') || allScriptText.includes('barba') || hasDataAttr('data-barba')) {
      detected.push({ name: 'Barba.js', category: 'transitions', usage: 'Page transition library for smooth navigation between pages' });
    }

    // ── 3D / Visual Libraries ──

    // Three.js
    if (srcMatch('three') || allScriptText.includes('three.') || allScriptText.includes('threejs')) {
      const canvases = document.querySelectorAll('canvas');
      detected.push({
        name: 'Three.js',
        category: '3d',
        usage: `WebGL 3D rendering library. ${canvases.length} canvas element(s) found. Used for 3D scenes, models, particles, and effects`
      });
    }

    // Spline
    if (document.querySelector('spline-viewer') || srcMatch('spline') || allScriptText.includes('spline')) {
      detected.push({ name: 'Spline', category: '3d', usage: '3D design tool viewer — embeds interactive 3D scenes via <spline-viewer> element' });
    }

    // PixiJS
    if (srcMatch('pixi') || allScriptText.includes('pixi.')) {
      detected.push({ name: 'PixiJS', category: '2d-webgl', usage: '2D WebGL renderer for high-performance graphics, particle effects, and interactive visuals' });
    }

    // p5.js
    if (srcMatch('p5') || allScriptText.includes('createcanvas') || allScriptText.includes('p5.')) {
      detected.push({ name: 'p5.js', category: '2d', usage: 'Creative coding library for generative art and interactive graphics' });
    }

    // Lottie
    if (srcMatch('lottie') || document.querySelector('lottie-player, dotlottie-player') || allScriptText.includes('lottie')) {
      detected.push({ name: 'Lottie', category: 'animation', usage: 'Renders After Effects animations as lightweight JSON. Look for <lottie-player> elements or .json animation files' });
    }

    // ── Slider / Carousel Libraries ──

    // Swiper
    if (srcMatch('swiper') || linkMatch('swiper') || classMatch(['swiper', 'swiper-container', 'swiper-slide'])) {
      detected.push({ name: 'Swiper', category: 'slider', usage: 'Touch-enabled slider/carousel. Uses .swiper-container, .swiper-slide classes' });
    }

    // Splide
    if (srcMatch('splide') || linkMatch('splide') || classMatch(['splide', 'splide__slide'])) {
      detected.push({ name: 'Splide', category: 'slider', usage: 'Lightweight slider/carousel library' });
    }

    // Slick
    if (srcMatch('slick') || linkMatch('slick') || classMatch(['slick-slider', 'slick-slide'])) {
      detected.push({ name: 'Slick', category: 'slider', usage: 'jQuery-based carousel/slider' });
    }

    // ── CSS Frameworks ──

    // Tailwind CSS
    const tailwindPatterns = ['flex', 'items-center', 'justify-center', 'px-4', 'py-2', 'text-lg', 'bg-white', 'rounded-lg', 'gap-4', 'grid-cols-3', 'hover:bg-', 'md:flex', 'lg:grid'];
    const tailwindScore = tailwindPatterns.filter(p => classStr.includes(p)).length;
    if (tailwindScore >= 5 || linkMatch('tailwind') || srcMatch('tailwind')) {
      detected.push({
        name: 'Tailwind CSS',
        category: 'css-framework',
        usage: 'Utility-first CSS framework. Classes are applied directly in HTML for styling. Responsive prefixes: sm:, md:, lg:, xl:. State prefixes: hover:, focus:, active:'
      });
    }

    // Bootstrap
    const bootstrapPatterns = ['container', 'row', 'col-', 'btn-primary', 'navbar', 'modal', 'card-body', 'form-control'];
    const bootstrapScore = bootstrapPatterns.filter(p => classStr.includes(p)).length;
    if (bootstrapScore >= 4 || linkMatch('bootstrap') || srcMatch('bootstrap')) {
      detected.push({ name: 'Bootstrap', category: 'css-framework', usage: 'Component-based CSS framework with grid system (container > row > col-*), pre-built components, and utility classes' });
    }

    // Material UI / MUI
    if (classMatch(['MuiButton-root', 'MuiBox-root', 'MuiTypography-root']) || classStr.includes('Mui')) {
      detected.push({ name: 'Material UI (MUI)', category: 'css-framework', usage: 'React component library following Material Design. Uses Mui* prefixed class names' });
    }

    // Chakra UI
    if (classStr.includes('chakra-') || classMatch(['chakra-button', 'chakra-text'])) {
      detected.push({ name: 'Chakra UI', category: 'css-framework', usage: 'React component library with chakra-* class prefix' });
    }

    // ── JS Frameworks ──

    if (document.querySelector('[data-reactroot], [data-react-helmet]') || document.getElementById('__next') || allScriptText.includes('react')) {
      const isNext = document.getElementById('__next') || srcMatch('next') || generator.toLowerCase().includes('next');
      detected.push({
        name: isNext ? 'Next.js (React)' : 'React',
        category: 'js-framework',
        usage: isNext ? 'React meta-framework with SSR/SSG, file-based routing, and server components' : 'Component-based UI library for building interactive interfaces'
      });
    }

    if (document.getElementById('__nuxt') || document.querySelector('[data-v-]') || allScriptText.includes('vue')) {
      const isNuxt = document.getElementById('__nuxt') || srcMatch('nuxt');
      detected.push({
        name: isNuxt ? 'Nuxt.js (Vue)' : 'Vue.js',
        category: 'js-framework',
        usage: isNuxt ? 'Vue meta-framework with SSR/SSG and file-based routing' : 'Progressive JS framework for building UIs with reactive data binding'
      });
    }

    if (document.querySelector('[_nghost], [_ngcontent], [ng-version]')) {
      detected.push({ name: 'Angular', category: 'js-framework', usage: 'Full-featured framework with TypeScript, dependency injection, and RxJS' });
    }

    // Svelte / SvelteKit
    if (document.querySelector('[data-sveltekit]') || generator.toLowerCase().includes('svelte') || allScriptText.includes('svelte')) {
      detected.push({ name: 'SvelteKit', category: 'js-framework', usage: 'Svelte meta-framework with compile-time optimization, SSR, and file-based routing' });
    }

    // Astro
    if (document.querySelector('[data-astro-cid]') || generator.toLowerCase().includes('astro') || document.querySelector('astro-island')) {
      detected.push({ name: 'Astro', category: 'js-framework', usage: 'Content-focused framework that ships zero JS by default. Uses islands architecture for partial hydration' });
    }

    // ── Utility Libraries ──

    // jQuery
    if (srcMatch('jquery') || allScriptText.includes('jquery') || allScriptText.includes('$(')) {
      detected.push({ name: 'jQuery', category: 'utility', usage: 'DOM manipulation and AJAX library. Uses $() selector syntax' });
    }

    // Alpine.js
    if (srcMatch('alpine') || hasDataAttr('x-data') || hasDataAttr('x-show')) {
      detected.push({ name: 'Alpine.js', category: 'utility', usage: 'Lightweight reactive framework using x-data, x-show, x-bind HTML directives' });
    }

    // ── Icon Libraries ──
    if (linkMatch('font-awesome') || linkMatch('fontawesome') || classStr.includes('fa-') || classStr.includes('fas ') || classStr.includes('fab ')) {
      detected.push({ name: 'Font Awesome', category: 'icons', usage: 'Icon library using <i class="fa-*"> or <svg> icons' });
    }

    if (classStr.includes('material-icons') || linkMatch('material+icons') || linkMatch('material-icons')) {
      detected.push({ name: 'Material Icons', category: 'icons', usage: 'Google Material Design icon set' });
    }

    if (document.querySelector('svg use, svg symbol') || classStr.includes('icon')) {
      const svgIcons = document.querySelectorAll('svg').length;
      if (svgIcons > 5) {
        detected.push({ name: 'Inline SVG Icons', category: 'icons', usage: `${svgIcons} inline SVG elements detected. Uses SVG sprites or individual inline SVGs` });
      }
    }

    return detected;
  }

  // ─── 2. Website Overview ───────────────────────────────────────────

  function extractWebsiteOverview() {
    const sections = document.querySelectorAll('section, [class*="section"], [class*="block"]');
    const nav = document.querySelector('nav, header nav, [role="navigation"], [class*="navbar"]');
    const hero = document.querySelector('section:first-of-type, .hero, [class*="hero"], [class*="banner"]');
    const footer = document.querySelector('footer, [class*="footer"]');
    const sidebar = document.querySelector('aside, .sidebar, [class*="sidebar"]');
    const forms = document.querySelectorAll('form');
    const videos = document.querySelectorAll('video, iframe[src*="youtube"], iframe[src*="vimeo"]');
    const canvases = document.querySelectorAll('canvas');
    const modals = document.querySelectorAll('[class*="modal"], [role="dialog"]');
    const cards = document.querySelectorAll('.card, [class*="card"], article');
    const ctas = document.querySelectorAll('[class*="cta"], .cta, [class*="call-to-action"]');
    const testimonials = document.querySelectorAll('[class*="testimonial"], [class*="review"], [class*="quote"]');
    const pricing = document.querySelectorAll('[class*="pricing"], [class*="plan"]');
    const faq = document.querySelectorAll('[class*="faq"], [class*="accordion"], details');

    // Determine theme
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    const bodyBgHex = hexFromRgb(bodyBg);
    const isDark = bodyBgHex ? getLuminance(bodyBgHex) < 0.2 : false;
    const isLight = bodyBgHex ? getLuminance(bodyBgHex) > 0.7 : true;

    // Determine page type
    let pageType = 'website';
    if (document.querySelector('[class*="blog"], article.post, .post-content')) pageType = 'blog';
    else if (document.querySelector('[class*="product"], [class*="shop"], [class*="cart"]')) pageType = 'e-commerce';
    else if (document.querySelector('[class*="dashboard"], [class*="admin"]')) pageType = 'dashboard';
    else if (document.querySelector('[class*="portfolio"], [class*="gallery"], [class*="showcase"]')) pageType = 'portfolio';
    else if (sections.length >= 3 && hero) pageType = 'landing page';
    else if (document.querySelector('[class*="docs"], [class*="documentation"]')) pageType = 'documentation';

    // Nav style
    let navStyle = 'none';
    if (nav) {
      const navCs = window.getComputedStyle(nav);
      if (navCs.position === 'fixed' || navCs.position === 'sticky') navStyle = 'fixed/sticky';
      else navStyle = 'static';
      if (navCs.backdropFilter && navCs.backdropFilter !== 'none') navStyle += ' with glassmorphism';
    }

    // Hero analysis
    let heroDesc = '';
    if (hero) {
      const heroCs = window.getComputedStyle(hero);
      const hasBgImage = heroCs.backgroundImage && heroCs.backgroundImage !== 'none';
      const hasGradient = heroCs.backgroundImage && heroCs.backgroundImage.includes('gradient');
      const hasVideo = hero.querySelector('video');
      const hasCanvas = hero.querySelector('canvas');
      heroDesc = 'Hero section with ';
      const heroFeatures = [];
      if (hasVideo) heroFeatures.push('video background');
      if (hasCanvas) heroFeatures.push('canvas/3D background');
      if (hasGradient) heroFeatures.push('gradient background');
      else if (hasBgImage) heroFeatures.push('background image');
      if (hero.querySelector('h1')) heroFeatures.push('headline');
      if (hero.querySelector('p')) heroFeatures.push('subtext');
      if (hero.querySelector('button, .btn, [class*="cta"]')) heroFeatures.push('CTA button');
      heroDesc += heroFeatures.join(', ') || 'content';
    }

    // Build overview paragraph
    const parts = [];
    parts.push(`This is a ${isDark ? 'dark-themed' : isLight ? 'light-themed' : 'mixed-theme'} ${pageType}`);

    if (sections.length > 0) parts.push(`with ${sections.length} distinct sections`);

    if (navStyle !== 'none') parts.push(`a ${navStyle} navigation bar`);

    if (heroDesc) parts.push(heroDesc.toLowerCase());

    if (cards.length > 0) parts.push(`${cards.length} card components`);
    if (testimonials.length > 0) parts.push('a testimonials section');
    if (pricing.length > 0) parts.push('a pricing section');
    if (faq.length > 0) parts.push('an FAQ/accordion section');
    if (forms.length > 0) parts.push(`${forms.length} form(s)`);
    if (videos.length > 0) parts.push(`${videos.length} video embed(s)`);
    if (canvases.length > 0) parts.push(`${canvases.length} canvas element(s) for 2D/3D graphics`);
    if (footer) parts.push('a footer');
    if (sidebar) parts.push('a sidebar layout');

    const overview = parts[0] + (parts.length > 1 ? ' featuring ' + parts.slice(1).join(', ') : '') + '.';

    // Structure map
    const structureMap = [];
    if (nav) structureMap.push({ type: 'Navigation', position: navStyle });
    if (hero) structureMap.push({ type: 'Hero', description: heroDesc });

    Array.from(sections).slice(0, 15).forEach((sec, i) => {
      const cs = window.getComputedStyle(sec);
      const heading = sec.querySelector('h1, h2, h3');
      const bg = hexFromRgb(cs.backgroundColor);
      structureMap.push({
        type: `Section ${i + 1}`,
        heading: heading ? heading.textContent.trim().substring(0, 60) : null,
        background: bg,
        padding: cs.paddingTop + ' / ' + cs.paddingBottom,
        classes: typeof sec.className === 'string' ? sec.className.substring(0, 80) : ''
      });
    });

    if (footer) {
      const footerCs = window.getComputedStyle(footer);
      structureMap.push({ type: 'Footer', background: hexFromRgb(footerCs.backgroundColor) });
    }

    return {
      overview,
      pageType,
      theme: isDark ? 'dark' : isLight ? 'light' : 'mixed',
      sectionCount: sections.length,
      navStyle,
      hasHero: !!hero,
      heroDescription: heroDesc,
      hasFooter: !!footer,
      hasSidebar: !!sidebar,
      cardCount: cards.length,
      formCount: forms.length,
      videoCount: videos.length,
      canvasCount: canvases.length,
      structureMap
    };
  }

  // ─── 3. Scroll Animations ──────────────────────────────────────────

  function extractScrollAnimations() {
    const scrollAnimations = {
      techniques: [],
      aosAnimations: [],
      locomotiveElements: 0,
      scrollSnap: [],
      stickyElements: [],
      parallaxElements: [],
      revealPatterns: [],
      scrollBehavior: null,
      intersectionPatterns: []
    };

    // CSS scroll-behavior
    const htmlCs = window.getComputedStyle(document.documentElement);
    if (htmlCs.scrollBehavior === 'smooth') {
      scrollAnimations.scrollBehavior = 'smooth';
      scrollAnimations.techniques.push('CSS smooth scrolling (scroll-behavior: smooth)');
    }

    // AOS elements
    const aosEls = document.querySelectorAll('[data-aos]');
    if (aosEls.length) {
      const aosData = [];
      const aosTypes = {};
      aosEls.forEach(el => {
        const type = el.getAttribute('data-aos');
        aosTypes[type] = (aosTypes[type] || 0) + 1;
        if (aosData.length < 6) {
          aosData.push({
            animation: type,
            delay: el.getAttribute('data-aos-delay') || '0',
            duration: el.getAttribute('data-aos-duration') || 'default',
            easing: el.getAttribute('data-aos-easing') || 'default',
            offset: el.getAttribute('data-aos-offset') || 'default',
            once: el.getAttribute('data-aos-once') || 'false'
          });
        }
      });
      scrollAnimations.aosAnimations = aosData;
      scrollAnimations.techniques.push(`AOS library — ${aosEls.length} elements with animations: ${Object.entries(aosTypes).map(([k, v]) => `${k} (×${v})`).join(', ')}`);
    }

    // Locomotive Scroll elements
    const locoEls = document.querySelectorAll('[data-scroll]');
    if (locoEls.length) {
      scrollAnimations.locomotiveElements = locoEls.length;
      const speeds = new Set();
      const directions = new Set();
      locoEls.forEach(el => {
        const speed = el.getAttribute('data-scroll-speed');
        const dir = el.getAttribute('data-scroll-direction');
        if (speed) speeds.add(speed);
        if (dir) directions.add(dir);
      });
      scrollAnimations.techniques.push(
        `Locomotive Scroll — ${locoEls.length} elements. Speeds: ${Array.from(speeds).join(', ') || 'default'}. Directions: ${Array.from(directions).join(', ') || 'default'}`
      );
    }

    // GSAP ScrollTrigger markers
    const gsapTriggerEls = document.querySelectorAll('[data-gsap], [class*="scroll-trigger"], .pin-spacer');
    if (gsapTriggerEls.length || document.querySelector('.pin-spacer')) {
      scrollAnimations.techniques.push('GSAP ScrollTrigger — scroll-linked animations with pinning and scrubbing');
    }

    // Scroll-snap
    const allEls = document.querySelectorAll('*');
    const snapLimit = Math.min(allEls.length, 500);
    for (let i = 0; i < snapLimit; i++) {
      const cs = window.getComputedStyle(allEls[i]);
      if (cs.scrollSnapType && cs.scrollSnapType !== 'none') {
        scrollAnimations.scrollSnap.push({
          element: allEls[i].tagName + (allEls[i].className ? '.' + (typeof allEls[i].className === 'string' ? allEls[i].className.split(' ')[0] : '') : ''),
          type: cs.scrollSnapType
        });
        if (scrollAnimations.scrollSnap.length >= 4) break;
      }
    }
    if (scrollAnimations.scrollSnap.length) {
      scrollAnimations.techniques.push(`CSS scroll-snap — ${scrollAnimations.scrollSnap.length} containers with snap scrolling`);
    }

    // Sticky elements
    for (let i = 0; i < snapLimit; i++) {
      const cs = window.getComputedStyle(allEls[i]);
      if (cs.position === 'sticky') {
        scrollAnimations.stickyElements.push({
          element: allEls[i].tagName + (allEls[i].className ? '.' + (typeof allEls[i].className === 'string' ? allEls[i].className.split(' ')[0] : '') : ''),
          top: cs.top
        });
        if (scrollAnimations.stickyElements.length >= 6) break;
      }
    }
    if (scrollAnimations.stickyElements.length) {
      scrollAnimations.techniques.push(`CSS position: sticky — ${scrollAnimations.stickyElements.length} sticky elements`);
    }

    // Parallax detection
    const parallaxEls = document.querySelectorAll('[data-parallax], [class*="parallax"], [data-speed], [data-scroll-speed]');
    if (parallaxEls.length) {
      scrollAnimations.parallaxElements = Array.from(parallaxEls).slice(0, 6).map(el => ({
        element: el.tagName,
        classes: typeof el.className === 'string' ? el.className.substring(0, 60) : '',
        speed: el.getAttribute('data-speed') || el.getAttribute('data-scroll-speed') || null
      }));
      scrollAnimations.techniques.push(`Parallax scrolling — ${parallaxEls.length} elements with depth-based scroll movement`);
    }

    // Reveal / fade-in class patterns
    const revealClasses = ['reveal', 'fade-in', 'slide-in', 'animate-in', 'scroll-reveal', 'in-view', 'is-visible', 'appear', 'show-on-scroll'];
    const foundReveal = revealClasses.filter(cls => classStr_global.includes(cls));
    if (foundReveal.length) {
      scrollAnimations.revealPatterns = foundReveal;
      scrollAnimations.techniques.push(`CSS class-based reveals — uses classes: ${foundReveal.join(', ')}`);
    }

    return scrollAnimations;
  }

  // ─── 4. CSS Animation & Transition Extraction ─────────────────────

  function extractAnimationPatterns() {
    const patterns = {
      keyframes: [],
      transitions: [],
      animatedElements: [],
      hoverEffects: [],
      timingFunctions: new Set()
    };

    // Extract @keyframes from stylesheets
    try {
      Array.from(document.styleSheets).forEach(sheet => {
        try {
          const rules = sheet.cssRules || sheet.rules;
          if (!rules) return;
          Array.from(rules).forEach(rule => {
            if (rule instanceof CSSKeyframesRule) {
              const keyframeSteps = [];
              Array.from(rule.cssRules).forEach(kf => {
                keyframeSteps.push({
                  offset: kf.keyText,
                  properties: kf.style.cssText.substring(0, 200)
                });
              });
              patterns.keyframes.push({
                name: rule.name,
                steps: keyframeSteps
              });
            }
          });
        } catch (e) { /* cross-origin stylesheet */ }
      });
    } catch (e) { }

    // Scan elements for transitions and animations
    const allEls = document.querySelectorAll('*');
    const limit = Math.min(allEls.length, 600);

    for (let i = 0; i < limit; i++) {
      const el = allEls[i];
      const cs = window.getComputedStyle(el);

      // Transitions
      if (cs.transitionProperty && cs.transitionProperty !== 'all' && cs.transitionProperty !== 'none' &&
          cs.transitionDuration && cs.transitionDuration !== '0s') {
        const key = `${cs.transitionProperty}|${cs.transitionDuration}|${cs.transitionTimingFunction}`;
        if (!patterns.transitions.some(t => t.key === key)) {
          patterns.transitions.push({
            key,
            property: cs.transitionProperty,
            duration: cs.transitionDuration,
            timingFunction: cs.transitionTimingFunction,
            delay: cs.transitionDelay !== '0s' ? cs.transitionDelay : null,
            element: el.tagName + (el.className ? '.' + (typeof el.className === 'string' ? el.className.split(' ')[0] : '') : '')
          });
          patterns.timingFunctions.add(cs.transitionTimingFunction);
        }
      }

      // Active animations
      if (cs.animationName && cs.animationName !== 'none') {
        patterns.animatedElements.push({
          element: el.tagName + (el.className ? '.' + (typeof el.className === 'string' ? el.className.split(' ')[0] : '') : ''),
          animationName: cs.animationName,
          duration: cs.animationDuration,
          timingFunction: cs.animationTimingFunction,
          iterationCount: cs.animationIterationCount,
          direction: cs.animationDirection,
          fillMode: cs.animationFillMode
        });
      }
    }

    // Deduplicate transitions, keep top 10
    patterns.transitions = patterns.transitions.slice(0, 10);
    patterns.animatedElements = patterns.animatedElements.slice(0, 10);
    patterns.keyframes = patterns.keyframes.slice(0, 12);
    patterns.timingFunctions = Array.from(patterns.timingFunctions).slice(0, 6);

    return patterns;
  }

  // ─── 5. Colors ─────────────────────────────────────────────────────

  function extractColors() {
    const colorMap = {};
    const elements = document.querySelectorAll('*');
    const limit = Math.min(elements.length, 800);

    for (let i = 0; i < limit; i++) {
      const el = elements[i];
      const cs = window.getComputedStyle(el);
      const props = [
        cs.backgroundColor, cs.color, cs.borderTopColor,
        cs.outlineColor, cs.fill, cs.stroke
      ];
      props.forEach(c => {
        const hex = hexFromRgb(c);
        if (hex) colorMap[hex] = (colorMap[hex] || 0) + 1;
      });
    }

    return Object.entries(colorMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 24)
      .map(([hex, count]) => ({
        hex,
        count,
        luminance: getLuminance(hex).toFixed(2),
        role: getLuminance(hex) > 0.6 ? 'light' : getLuminance(hex) < 0.12 ? 'dark' : 'accent'
      }));
  }

  // ─── 6. Typography ─────────────────────────────────────────────────

  function extractTypography() {
    const fonts = {};
    const sizes = new Set();
    const weights = new Set();
    const lineHeights = new Set();
    const letterSpacings = new Set();
    const textTransforms = new Set();

    const selectors = ['h1', 'h2', 'h3', 'h4', 'p', 'a', 'button', 'span', 'li', 'label', 'input', 'nav a', '.btn', '.cta'];
    const collected = [];

    selectors.forEach(sel => {
      const els = document.querySelectorAll(sel);
      Array.from(els).slice(0, 3).forEach(el => {
        const cs = window.getComputedStyle(el);
        const ff = cs.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
        const fs = cs.fontSize;
        const fw = cs.fontWeight;
        const lh = cs.lineHeight;
        const ls = cs.letterSpacing;
        const tt = cs.textTransform;

        if (ff) fonts[ff] = (fonts[ff] || 0) + 1;
        if (fs && fs !== '0px') sizes.add(fs);
        if (fw) weights.add(fw);
        if (lh && lh !== 'normal') lineHeights.add(lh);
        if (ls && ls !== 'normal' && ls !== '0px') letterSpacings.add(ls);
        if (tt && tt !== 'none') textTransforms.add(tt);

        if (el.tagName.match(/^H[1-4]$/i) || sel === 'button') {
          collected.push({
            element: sel,
            fontFamily: ff,
            fontSize: fs,
            fontWeight: fw,
            lineHeight: lh,
            letterSpacing: ls,
            textTransform: tt,
            color: hexFromRgb(cs.color)
          });
        }
      });
    });

    const sortedFonts = Object.entries(fonts).sort((a, b) => b[1] - a[1]).map(([f]) => f);

    return {
      primaryFont: sortedFonts[0] || 'system-ui',
      secondaryFont: sortedFonts[1] || null,
      monoFont: sortedFonts.find(f => /mono|courier|code|console/i.test(f)) || null,
      googleFonts: sortedFonts.filter(f => !/(system|sans|serif|monospace|-apple)/i.test(f)),
      scale: Array.from(sizes).sort((a, b) => parseFloat(b) - parseFloat(a)).slice(0, 10),
      weights: Array.from(weights).sort(),
      lineHeights: Array.from(lineHeights).slice(0, 5),
      letterSpacings: Array.from(letterSpacings).slice(0, 5),
      textTransforms: Array.from(textTransforms),
      specimens: collected.slice(0, 8)
    };
  }

  // ─── 7. Spacing ────────────────────────────────────────────────────

  function extractSpacing() {
    const gaps = new Set();
    const paddings = new Set();
    const margins = new Set();
    const borderRadii = new Set();

    const els = document.querySelectorAll('section, .container, .card, .btn, button, header, nav, footer, [class*="wrap"], [class*="section"]');
    Array.from(els).slice(0, 60).forEach(el => {
      const cs = window.getComputedStyle(el);
      ['paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'].forEach(p => {
        const v = cs[p];
        if (v && v !== '0px') paddings.add(v);
      });
      ['marginTop', 'marginBottom'].forEach(m => {
        const v = cs[m];
        if (v && v !== '0px' && v !== 'auto') margins.add(v);
      });
      const br = cs.borderRadius;
      if (br && br !== '0px') borderRadii.add(br);
      const gap = cs.gap;
      if (gap && gap !== 'normal') gaps.add(gap);
    });

    return {
      gaps: Array.from(gaps).sort((a, b) => parseFloat(a) - parseFloat(b)).slice(0, 8),
      paddings: Array.from(paddings).sort((a, b) => parseFloat(a) - parseFloat(b)).slice(0, 10),
      margins: Array.from(margins).sort((a, b) => parseFloat(a) - parseFloat(b)).slice(0, 8),
      borderRadii: Array.from(borderRadii).slice(0, 8)
    };
  }

  // ─── 8. Layout ─────────────────────────────────────────────────────

  function extractLayout() {
    const containers = document.querySelectorAll('.container, [class*="container"], [class*="wrapper"], [class*="layout"], main, .max-w, [class*="max-w"]');
    const maxWidths = new Set();
    const gridLayouts = [];

    Array.from(containers).slice(0, 20).forEach(el => {
      const cs = window.getComputedStyle(el);
      if (cs.maxWidth && cs.maxWidth !== 'none') maxWidths.add(cs.maxWidth);
    });

    const allEls = document.querySelectorAll('*');
    const limit = Math.min(allEls.length, 500);
    for (let i = 0; i < limit; i++) {
      const cs = window.getComputedStyle(allEls[i]);
      if (cs.display === 'grid') {
        gridLayouts.push({
          element: allEls[i].tagName + (allEls[i].className ? '.' + (typeof allEls[i].className === 'string' ? allEls[i].className.split(' ')[0] : '') : ''),
          columns: cs.gridTemplateColumns,
          rows: cs.gridTemplateRows,
          gap: cs.gap
        });
        if (gridLayouts.length >= 8) break;
      }
    }

    const heroEl = document.querySelector('section:first-of-type, .hero, [class*="hero"], header');
    const heroStyle = heroEl ? window.getComputedStyle(heroEl) : null;

    return {
      maxWidths: Array.from(maxWidths).slice(0, 5),
      gridLayouts: gridLayouts.map(g => ({
        element: g.element,
        columns: g.columns,
        gap: g.gap
      })),
      heroHeight: heroStyle ? heroStyle.minHeight || heroStyle.height : null,
      hasSticky: !!document.querySelector('[style*="sticky"], .sticky, [class*="sticky"]'),
      hasSidebar: !!document.querySelector('aside, .sidebar, [class*="sidebar"]')
    };
  }

  // ─── 9. Visual Effects & 3D ────────────────────────────────────────

  function extractEffects() {
    const effects = {
      shadows: new Set(),
      backdropFilters: new Set(),
      filters: new Set(),
      gradients: new Set(),
      glassmorphism: false,
      neumorphism: false,
      has3D: false,
      hasParallax: false,
      hasVideoBackground: false,
      hasCanvas: false,
      hasWebGL: false,
      blendModes: new Set(),
      clipPaths: new Set(),
      perspective: new Set(),
      transformStyle: new Set(),
      transforms3D: [],
      customProperties: []
    };

    const els = document.querySelectorAll('*');
    const limit = Math.min(els.length, 600);

    for (let i = 0; i < limit; i++) {
      const el = els[i];
      const cs = window.getComputedStyle(el);

      if (cs.boxShadow && cs.boxShadow !== 'none') effects.shadows.add(cs.boxShadow.split('),')[0] + ')');
      if (cs.backdropFilter && cs.backdropFilter !== 'none') {
        effects.backdropFilters.add(cs.backdropFilter);
        effects.glassmorphism = true;
      }
      if (cs.filter && cs.filter !== 'none') effects.filters.add(cs.filter);
      if (cs.transform && cs.transform !== 'none') {
        if (cs.transform.includes('matrix3d') || cs.perspective !== 'none') {
          effects.has3D = true;
          effects.transforms3D.push({
            element: el.tagName + (el.className ? '.' + (typeof el.className === 'string' ? el.className.split(' ')[0] : '') : ''),
            transform: cs.transform.substring(0, 100),
            perspective: cs.perspective,
            transformStyle: cs.transformStyle
          });
        }
      }
      if (cs.perspective && cs.perspective !== 'none') {
        effects.perspective.add(cs.perspective);
        effects.has3D = true;
      }
      if (cs.transformStyle === 'preserve-3d') {
        effects.transformStyle.add('preserve-3d');
        effects.has3D = true;
      }
      if (cs.backgroundImage && cs.backgroundImage.includes('gradient')) {
        effects.gradients.add(cs.backgroundImage.substring(0, 150));
      }
      if (cs.mixBlendMode && cs.mixBlendMode !== 'normal') effects.blendModes.add(cs.mixBlendMode);
      if (cs.clipPath && cs.clipPath !== 'none') effects.clipPaths.add(cs.clipPath.substring(0, 100));
      if (cs.boxShadow && cs.boxShadow.includes('inset')) effects.neumorphism = true;
    }

    effects.hasVideoBackground = !!document.querySelector('video');
    effects.hasCanvas = !!document.querySelector('canvas');
    effects.hasWebGL = !!document.querySelector('canvas');
    effects.hasParallax = !!document.querySelector('[data-parallax], [class*="parallax"], [data-scroll-speed], [data-speed]');

    // Extract CSS custom properties (design tokens)
    try {
      const rootStyles = window.getComputedStyle(document.documentElement);
      const sheets = Array.from(document.styleSheets);
      sheets.forEach(sheet => {
        try {
          Array.from(sheet.cssRules || []).forEach(rule => {
            if (rule.selectorText === ':root' || rule.selectorText === ':root, :host') {
              const text = rule.cssText;
              const varMatches = text.match(/--[\w-]+:\s*[^;]+/g);
              if (varMatches) {
                effects.customProperties = varMatches.slice(0, 30).map(v => v.trim());
              }
            }
          });
        } catch (e) { }
      });
    } catch (e) { }

    return {
      shadows: Array.from(effects.shadows).slice(0, 6),
      backdropFilters: Array.from(effects.backdropFilters).slice(0, 4),
      filters: Array.from(effects.filters).slice(0, 4),
      gradients: Array.from(effects.gradients).slice(0, 6),
      blendModes: Array.from(effects.blendModes),
      clipPaths: Array.from(effects.clipPaths).slice(0, 4),
      glassmorphism: effects.glassmorphism,
      neumorphism: effects.neumorphism,
      has3D: effects.has3D,
      hasParallax: effects.hasParallax,
      hasVideoBackground: effects.hasVideoBackground,
      hasCanvas: effects.hasCanvas,
      hasWebGL: effects.hasWebGL,
      perspective: Array.from(effects.perspective),
      transforms3D: effects.transforms3D.slice(0, 6),
      customProperties: effects.customProperties
    };
  }

  // ─── 10. Image Frames ──────────────────────────────────────────────

  function extractImageFrames() {
    const frames = [];
    const imgs = document.querySelectorAll('img, picture, figure, [class*="image"], [class*="img"], [style*="background-image"]');

    Array.from(imgs).slice(0, 20).forEach(el => {
      const cs = window.getComputedStyle(el);
      const frame = {
        tag: el.tagName,
        objectFit: cs.objectFit,
        objectPosition: cs.objectPosition,
        borderRadius: cs.borderRadius,
        border: cs.border !== '0px none rgb(0, 0, 0)' ? cs.border : null,
        boxShadow: cs.boxShadow !== 'none' ? cs.boxShadow.substring(0, 100) : null,
        filter: cs.filter !== 'none' ? cs.filter : null,
        aspectRatio: cs.aspectRatio !== 'auto' ? cs.aspectRatio : null,
        transform: cs.transform !== 'none' ? cs.transform : null,
        overflow: cs.overflow,
        width: cs.width,
        height: cs.height,
        classes: typeof el.className === 'string' ? el.className.substring(0, 80) : ''
      };
      if (Object.values(frame).some(v => v && v !== 'auto' && v !== 'visible' && v !== 'fill' && v !== 'none' && v !== '0px none rgb(0, 0, 0)')) {
        frames.push(frame);
      }
    });
    return frames;
  }

  // ─── 11. UI Components ─────────────────────────────────────────────

  function extractComponents() {
    const components = {};

    const navEl = document.querySelector('nav, header nav, [class*="nav"], [role="navigation"]');
    if (navEl) {
      const cs = window.getComputedStyle(navEl);
      components.navigation = {
        position: cs.position,
        background: hexFromRgb(cs.backgroundColor),
        backdropFilter: cs.backdropFilter,
        height: cs.height,
        borderBottom: cs.borderBottom,
        boxShadow: cs.boxShadow !== 'none' ? cs.boxShadow : null
      };
    }

    const btnEls = document.querySelectorAll('button, .btn, a.btn, [class*="button"], [class*="cta"]');
    if (btnEls.length) {
      const cs = window.getComputedStyle(btnEls[0]);
      components.primaryButton = {
        background: cs.background.substring(0, 120),
        color: hexFromRgb(cs.color),
        borderRadius: cs.borderRadius,
        border: cs.border !== '0px none rgb(0, 0, 0)' ? cs.border : 'none',
        padding: cs.padding,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        letterSpacing: cs.letterSpacing,
        textTransform: cs.textTransform,
        boxShadow: cs.boxShadow !== 'none' ? cs.boxShadow : null,
        transition: cs.transition !== 'all 0s ease 0s' ? cs.transition.substring(0, 100) : null
      };
    }

    const cardEls = document.querySelectorAll('.card, [class*="card"], article, .feature, [class*="feature"]');
    if (cardEls.length) {
      const cs = window.getComputedStyle(cardEls[0]);
      components.card = {
        background: hexFromRgb(cs.backgroundColor),
        borderRadius: cs.borderRadius,
        border: cs.border !== '0px none rgb(0, 0, 0)' ? cs.border : 'none',
        padding: cs.padding,
        boxShadow: cs.boxShadow !== 'none' ? cs.boxShadow : null,
        backdropFilter: cs.backdropFilter !== 'none' ? cs.backdropFilter : null,
        overflow: cs.overflow,
        transition: cs.transition !== 'all 0s ease 0s' ? cs.transition.substring(0, 100) : null
      };
    }

    const inputEls = document.querySelectorAll('input[type="text"], input[type="email"], textarea');
    if (inputEls.length) {
      const cs = window.getComputedStyle(inputEls[0]);
      components.input = {
        background: hexFromRgb(cs.backgroundColor),
        border: cs.border,
        borderRadius: cs.borderRadius,
        padding: cs.padding,
        fontSize: cs.fontSize
      };
    }

    return components;
  }

  // ─── 12. Metadata ──────────────────────────────────────────────────

  function extractMetadata() {
    const title = document.title;
    const description = document.querySelector('meta[name="description"]')?.content || '';
    const themeColor = document.querySelector('meta[name="theme-color"]')?.content || '';

    const bodyCs = window.getComputedStyle(document.body);

    return {
      title,
      description,
      url: window.location.href,
      themeColor,
      bodyBackground: hexFromRgb(bodyCs.backgroundColor),
      bodyColor: hexFromRgb(bodyCs.color)
    };
  }

  // ─── Build class string for scroll detection (module-level) ────────

  const allClassElements = Array.from(document.querySelectorAll('[class]')).slice(0, 500);
  var classStr_global = allClassElements.map(el => typeof el.className === 'string' ? el.className : '').join(' ').toLowerCase();

  // ─── 13. Build Markdown ────────────────────────────────────────────

  function buildMarkdown(data) {
    const { meta, overview, libraries, colors, typography, spacing, layout, effects, scrollAnimations, animationPatterns, imageFrames, components } = data;

    const colorsByRole = {
      dark: colors.filter(c => c.role === 'dark'),
      accent: colors.filter(c => c.role === 'accent'),
      light: colors.filter(c => c.role === 'light')
    };

    // ── Header ──
    let md = `# Design DNA: ${meta.title}
> Extracted from: ${meta.url}
> Theme: ${overview.theme} | Page type: ${overview.pageType} | Sections: ${overview.sectionCount}
> Use this file as design inspiration for your agent. Replace all placeholder content with your own.

---

## Website Overview

${overview.overview}

### Page Structure

| # | Section | Heading | Background |
|---|---------|---------|------------|
`;
    overview.structureMap.forEach((s, i) => {
      md += `| ${i + 1} | ${s.type} | ${s.heading || '—'} | \`${s.background || 'transparent'}\` |\n`;
    });

    // ── Libraries ──
    md += `\n---\n\n## Libraries & Frameworks Detected\n\n`;

    if (libraries.length === 0) {
      md += `No major libraries detected. This may be a static site or use vanilla HTML/CSS/JS.\n`;
    } else {
      // Group by category
      const byCategory = {};
      libraries.forEach(lib => {
        const cat = lib.category || 'other';
        if (!byCategory[cat]) byCategory[cat] = [];
        byCategory[cat].push(lib);
      });

      const categoryLabels = {
        'js-framework': '### JavaScript Framework',
        'css-framework': '### CSS Framework',
        'animation': '### Animation Libraries',
        'scroll-animation': '### Scroll Animation Libraries',
        'scroll': '### Smooth Scroll',
        '3d': '### 3D / WebGL Libraries',
        '2d-webgl': '### 2D Graphics',
        '2d': '### Creative Coding',
        'slider': '### Slider / Carousel',
        'transitions': '### Page Transitions',
        'icons': '### Icon Libraries',
        'utility': '### Utility Libraries',
        'other': '### Other'
      };

      Object.entries(byCategory).forEach(([cat, libs]) => {
        md += `${categoryLabels[cat] || '### ' + cat}\n\n`;
        libs.forEach(lib => {
          md += `- **${lib.name}** — ${lib.usage}\n`;
          if (lib.dataAttributes) {
            md += `  - Data attributes: ${lib.dataAttributes.map(a => '`' + a + '`').join(', ')}\n`;
          }
          if (lib.plugins && lib.plugins.length) {
            md += `  - Active plugins: ${lib.plugins.join(', ')}\n`;
          }
        });
        md += '\n';
      });
    }

    // ── Colors ──
    md += `---\n\n## Color Palette\n\n`;
    md += `### Dark / base colors\n`;
    md += (colorsByRole.dark.map(c => `- \`${c.hex}\` — luminance ${c.luminance}, used ${c.count}×`).join('\n') || '- None detected') + '\n\n';
    md += `### Accent / brand colors\n`;
    md += (colorsByRole.accent.map(c => `- \`${c.hex}\` — luminance ${c.luminance}, used ${c.count}×`).join('\n') || '- None detected') + '\n\n';
    md += `### Light / surface colors\n`;
    md += (colorsByRole.light.map(c => `- \`${c.hex}\` — luminance ${c.luminance}, used ${c.count}×`).join('\n') || '- None detected') + '\n';

    if (effects.customProperties.length) {
      md += `\n### CSS Custom Properties (Design Tokens)\n`;
      md += '```css\n:root {\n';
      effects.customProperties.forEach(p => { md += `  ${p};\n`; });
      md += '}\n```\n';
    }

    // ── Typography ──
    md += `\n---\n\n## Typography\n\n`;
    md += `- **Primary font:** ${typography.primaryFont}\n`;
    md += `- **Secondary font:** ${typography.secondaryFont || 'None'}\n`;
    md += `- **Monospace font:** ${typography.monoFont || 'None'}\n`;
    if (typography.googleFonts.length) md += `- **Web fonts detected:** ${typography.googleFonts.join(', ')}\n`;
    md += `\n### Type Scale\n${typography.scale.map(s => `- \`${s}\``).join('\n') || '- N/A'}\n`;
    md += `\n### Font Weights\n${typography.weights.map(w => `- \`${w}\``).join('\n') || '- N/A'}\n`;
    if (typography.letterSpacings.length) md += `\n### Letter Spacing\n${typography.letterSpacings.map(l => `- \`${l}\``).join('\n')}\n`;
    if (typography.textTransforms.length) md += `\n### Text Transforms\n${typography.textTransforms.map(t => `- \`${t}\``).join('\n')}\n`;
    md += `\n### Type Specimens\n`;
    md += (typography.specimens.map(s =>
      `- **${s.element}** — font: ${s.fontFamily}, size: ${s.fontSize}, weight: ${s.fontWeight}${s.letterSpacing && s.letterSpacing !== '0px' ? `, spacing: ${s.letterSpacing}` : ''}${s.textTransform && s.textTransform !== 'none' ? `, transform: ${s.textTransform}` : ''}`
    ).join('\n') || '- N/A') + '\n';

    // ── Spacing ──
    md += `\n---\n\n## Spacing System\n\n`;
    md += `- **Padding values:** \`${spacing.paddings.join('` · `')}\`\n`;
    md += `- **Margin values:** \`${spacing.margins.join('` · `')}\`\n`;
    md += `- **Gap values:** \`${spacing.gaps.join('` · `')}\`\n`;
    md += `- **Border radii:** \`${spacing.borderRadii.join('` · `')}\`\n`;

    // ── Layout ──
    md += `\n---\n\n## Layout\n\n`;
    md += `### Max Widths\n${layout.maxWidths.map(w => `- \`${w}\``).join('\n') || '- Not detected'}\n`;
    md += `\n### Grid Layouts\n`;
    md += (layout.gridLayouts.map(g => `- \`${g.element}\` — columns: \`${g.columns}\`, gap: \`${g.gap}\``).join('\n') || '- None detected') + '\n';
    md += `\n- Sticky navigation: ${layout.hasSticky ? 'Yes' : 'No'}\n`;
    md += `- Sidebar layout: ${layout.hasSidebar ? 'Yes' : 'No'}\n`;

    // ── Scroll Animations ──
    md += `\n---\n\n## Scroll Animations\n\n`;
    if (scrollAnimations.techniques.length === 0) {
      md += `No scroll animations detected. The page uses static content without scroll-triggered effects.\n`;
    } else {
      md += `### Techniques Used\n`;
      scrollAnimations.techniques.forEach(t => { md += `- ${t}\n`; });

      if (scrollAnimations.aosAnimations.length) {
        md += `\n### AOS Animation Examples\n`;
        md += '| Animation | Delay | Duration | Easing |\n|-----------|-------|----------|--------|\n';
        scrollAnimations.aosAnimations.forEach(a => {
          md += `| ${a.animation} | ${a.delay}ms | ${a.duration} | ${a.easing} |\n`;
        });
        md += `\nTo replicate: add \`data-aos="animation-name"\` to elements, include AOS library, and call \`AOS.init()\`.\n`;
      }

      if (scrollAnimations.scrollSnap.length) {
        md += `\n### Scroll Snap\n`;
        scrollAnimations.scrollSnap.forEach(s => { md += `- \`${s.element}\` — scroll-snap-type: \`${s.type}\`\n`; });
      }

      if (scrollAnimations.stickyElements.length) {
        md += `\n### Sticky Elements\n`;
        scrollAnimations.stickyElements.forEach(s => { md += `- \`${s.element}\` — top: \`${s.top}\`\n`; });
      }

      if (scrollAnimations.parallaxElements && scrollAnimations.parallaxElements.length) {
        md += `\n### Parallax Elements\n`;
        scrollAnimations.parallaxElements.forEach(p => {
          md += `- \`${p.element}\` ${p.classes ? `(${p.classes})` : ''} ${p.speed ? `— speed: ${p.speed}` : ''}\n`;
        });
      }
    }

    // ── CSS Animations & Transitions ──
    md += `\n---\n\n## CSS Animations & Transitions\n\n`;

    if (animationPatterns.keyframes.length) {
      md += `### @keyframes Animations\n\n`;
      animationPatterns.keyframes.forEach(kf => {
        md += `#### \`${kf.name}\`\n\`\`\`css\n@keyframes ${kf.name} {\n`;
        kf.steps.forEach(step => {
          md += `  ${step.offset} { ${step.properties} }\n`;
        });
        md += `}\n\`\`\`\n\n`;
      });
    }

    if (animationPatterns.animatedElements.length) {
      md += `### Animated Elements\n`;
      md += '| Element | Animation | Duration | Timing | Iterations |\n|---------|-----------|----------|--------|------------|\n';
      animationPatterns.animatedElements.forEach(a => {
        md += `| ${a.element} | ${a.animationName} | ${a.duration} | ${a.timingFunction.substring(0, 30)} | ${a.iterationCount} |\n`;
      });
      md += '\n';
    }

    if (animationPatterns.transitions.length) {
      md += `### Transition Patterns\n`;
      md += '| Element | Property | Duration | Timing |\n|---------|----------|----------|--------|\n';
      animationPatterns.transitions.forEach(t => {
        md += `| ${t.element} | ${t.property} | ${t.duration} | ${truncate(t.timingFunction, 40)} |\n`;
      });
      md += '\n';
    }

    if (animationPatterns.timingFunctions.length) {
      md += `### Timing Functions Used\n`;
      animationPatterns.timingFunctions.forEach(tf => { md += `- \`${tf}\`\n`; });
      md += '\n';
    }

    // ── Visual Effects ──
    md += `---\n\n## Visual Effects & 3D\n\n`;

    const specialEffects = [];
    if (effects.glassmorphism) specialEffects.push('Glassmorphism (backdrop-filter blur)');
    if (effects.neumorphism) specialEffects.push('Neumorphism (inset box-shadows)');
    if (effects.has3D) specialEffects.push('3D transforms / perspective');
    if (effects.hasParallax) specialEffects.push('Parallax scrolling');
    if (effects.hasVideoBackground) specialEffects.push('Video backgrounds');
    if (effects.hasCanvas) specialEffects.push('Canvas-based graphics');
    if (effects.hasWebGL) specialEffects.push('WebGL rendering');
    if (effects.gradients.length) specialEffects.push('CSS gradients');
    if (effects.clipPaths.length) specialEffects.push('Clip-path shapes');
    if (effects.blendModes.length) specialEffects.push('CSS blend modes');

    md += `### Special Effects\n`;
    md += (specialEffects.length ? specialEffects.map(e => `- ${e}`).join('\n') : '- No special effects detected') + '\n';

    if (effects.shadows.length) {
      md += `\n### Box Shadows\n`;
      effects.shadows.slice(0, 4).forEach(s => { md += `- \`${s}\`\n`; });
    }
    if (effects.gradients.length) {
      md += `\n### CSS Gradients\n`;
      effects.gradients.slice(0, 4).forEach(g => { md += `- \`${truncate(g, 120)}\`\n`; });
    }
    if (effects.backdropFilters.length) {
      md += `\n### Backdrop Filters (Glassmorphism)\n`;
      effects.backdropFilters.forEach(f => { md += `- \`${f}\`\n`; });
    }
    if (effects.has3D && effects.transforms3D.length) {
      md += `\n### 3D Transform Details\n`;
      effects.transforms3D.forEach(t => {
        md += `- \`${t.element}\` — transform: \`${t.transform}\`${t.perspective ? `, perspective: \`${t.perspective}\`` : ''}${t.transformStyle ? `, transform-style: \`${t.transformStyle}\`` : ''}\n`;
      });
    }
    if (effects.perspective.length) {
      md += `\n### Perspective Values\n`;
      effects.perspective.forEach(p => { md += `- \`${p}\`\n`; });
    }
    if (effects.clipPaths.length) {
      md += `\n### Clip Paths\n`;
      effects.clipPaths.forEach(c => { md += `- \`${c}\`\n`; });
    }
    if (effects.blendModes.length) {
      md += `\n### Blend Modes\n`;
      effects.blendModes.forEach(b => { md += `- \`${b}\`\n`; });
    }

    // ── Image Frames ──
    md += `\n---\n\n## Image & Media Frames\n\n`;
    if (imageFrames.length) {
      imageFrames.slice(0, 6).forEach(f => {
        md += `### ${f.tag} frame\n`;
        md += `- Object fit: \`${f.objectFit || 'auto'}\`\n`;
        md += `- Border radius: \`${f.borderRadius || '0'}\`\n`;
        if (f.boxShadow) md += `- Box shadow: \`${f.boxShadow}\`\n`;
        if (f.filter) md += `- Filter: \`${f.filter}\`\n`;
        if (f.aspectRatio) md += `- Aspect ratio: \`${f.aspectRatio}\`\n`;
        if (f.transform) md += `- Transform: \`${f.transform}\`\n`;
        if (f.classes) md += `- Classes hint: \`${f.classes}\`\n`;
        md += '\n';
      });
    } else {
      md += '- No styled image frames detected\n';
    }

    // ── UI Components ──
    md += `---\n\n## UI Components\n\n`;

    md += `### Navigation Bar\n`;
    if (components.navigation) {
      md += `- Position: \`${components.navigation.position}\`\n`;
      md += `- Background: \`${components.navigation.background || 'transparent'}\`\n`;
      md += `- Height: \`${components.navigation.height}\`\n`;
      if (components.navigation.backdropFilter && components.navigation.backdropFilter !== 'none')
        md += `- Backdrop filter: \`${components.navigation.backdropFilter}\`\n`;
      if (components.navigation.boxShadow)
        md += `- Box shadow: \`${components.navigation.boxShadow}\`\n`;
    } else { md += '- Not detected\n'; }

    md += `\n### Primary Button\n`;
    if (components.primaryButton) {
      md += `- Background: \`${components.primaryButton.background}\`\n`;
      md += `- Color: \`${components.primaryButton.color}\`\n`;
      md += `- Border radius: \`${components.primaryButton.borderRadius}\`\n`;
      md += `- Border: \`${components.primaryButton.border}\`\n`;
      md += `- Padding: \`${components.primaryButton.padding}\`\n`;
      md += `- Font: size \`${components.primaryButton.fontSize}\`, weight \`${components.primaryButton.fontWeight}\`\n`;
      if (components.primaryButton.transition) md += `- Transition: \`${components.primaryButton.transition}\`\n`;
      if (components.primaryButton.boxShadow) md += `- Box shadow: \`${components.primaryButton.boxShadow}\`\n`;
    } else { md += '- Not detected\n'; }

    md += `\n### Card Component\n`;
    if (components.card) {
      md += `- Background: \`${components.card.background || 'transparent'}\`\n`;
      md += `- Border radius: \`${components.card.borderRadius}\`\n`;
      md += `- Border: \`${components.card.border}\`\n`;
      md += `- Padding: \`${components.card.padding}\`\n`;
      if (components.card.boxShadow) md += `- Box shadow: \`${components.card.boxShadow}\`\n`;
      if (components.card.backdropFilter) md += `- Backdrop filter: \`${components.card.backdropFilter}\`\n`;
      if (components.card.transition) md += `- Transition: \`${components.card.transition}\`\n`;
    } else { md += '- Not detected\n'; }

    md += `\n### Form Inputs\n`;
    if (components.input) {
      md += `- Background: \`${components.input.background || 'transparent'}\`\n`;
      md += `- Border: \`${components.input.border}\`\n`;
      md += `- Border radius: \`${components.input.borderRadius}\`\n`;
      md += `- Padding: \`${components.input.padding}\`\n`;
      md += `- Font size: \`${components.input.fontSize}\`\n`;
    } else { md += '- Not detected\n'; }

    // ── Agent Instructions ──
    md += `\n---\n\n## Agent Prompt Instructions\n\nWhen recreating this design for a new project, follow these rules:\n\n`;

    md += `### 1. Technology Stack\n`;
    if (libraries.length) {
      const animLibs = libraries.filter(l => ['animation', 'scroll-animation', 'scroll', '3d'].includes(l.category));
      const cssFramework = libraries.find(l => l.category === 'css-framework');
      const jsFramework = libraries.find(l => l.category === 'js-framework');

      if (jsFramework) md += `- Use **${jsFramework.name}** as the JavaScript framework\n`;
      if (cssFramework) md += `- Use **${cssFramework.name}** for styling\n`;
      if (animLibs.length) {
        md += `- For animations, install and configure:\n`;
        animLibs.forEach(l => { md += `  - **${l.name}** — ${l.usage}\n`; });
      }
    } else {
      md += `- This site uses vanilla HTML/CSS/JS — no framework required\n`;
    }

    md += `\n### 2. Colors\nUse the palette above as CSS custom properties. Map dark colors to \`--color-bg\`, accent colors to \`--color-primary\` and \`--color-secondary\`, light colors to \`--color-surface\`.\n`;

    md += `\n### 3. Typography\nUse **${typography.primaryFont}** as the primary font${typography.secondaryFont ? ` and **${typography.secondaryFont}** as a secondary/display font` : ''}. Follow the type scale above for heading and body sizes.\n`;

    md += `\n### 4. Scroll Animations\n`;
    if (scrollAnimations.techniques.length) {
      md += `This site heavily uses scroll-based animations. To replicate:\n`;
      scrollAnimations.techniques.forEach(t => { md += `- ${t}\n`; });
      md += `\n**Important:** Initialize all scroll animation libraries after DOM is ready. Use \`IntersectionObserver\` as a fallback for simple reveal animations. Test scroll performance on mobile.\n`;
    } else {
      md += `No scroll animations detected — keep it simple.\n`;
    }

    md += `\n### 5. Visual Effects\n`;
    md += specialEffects.length
      ? `This site uses: ${specialEffects.join(', ')}. Recreate these tastefully using the exact values documented above.\n`
      : `This site uses minimal effects — keep it clean and fast.\n`;

    md += `\n### 6. Components\nMatch the border-radius, shadow, padding, and transition patterns from the component section above.\n`;

    md += `\n### 7. Content\n**Replace all content** — swap every heading, paragraph, image URL, and label with your own business content. Keep the layout structure and visual patterns, not the words.\n`;

    md += `\n### 8. Responsive\nEnsure the layout collapses gracefully on mobile. Reference the grid columns and max-widths above.\n`;

    md += `\n### 9. Performance\n`;
    if (libraries.some(l => l.category === '3d')) {
      md += `- This site uses 3D/WebGL — lazy-load 3D assets and use \`requestAnimationFrame\` for render loops\n`;
    }
    md += `- Lazy-load images and videos below the fold\n`;
    md += `- Use \`will-change\` sparingly for animated elements\n`;
    md += `- Test scroll animation performance — disable complex effects on low-power devices\n`;

    md += `\n### 10. Legal\n**Do not copy** — this file is design inspiration only. No logos, images, or brand assets from the original site should be used.\n`;

    return md;
  }

  // ─── Main extraction function ──────────────────────────────────────

  window.__extractDesignDNA = function () {
    try {
      const data = {
        meta: extractMetadata(),
        overview: extractWebsiteOverview(),
        libraries: extractLibraries(),
        colors: extractColors(),
        typography: extractTypography(),
        spacing: extractSpacing(),
        layout: extractLayout(),
        effects: extractEffects(),
        scrollAnimations: extractScrollAnimations(),
        animationPatterns: extractAnimationPatterns(),
        imageFrames: extractImageFrames(),
        components: extractComponents()
      };

      const markdown = buildMarkdown(data);

      return {
        success: true,
        markdown,
        summary: {
          colorCount: data.colors.length,
          fontCount: Object.keys({ [data.typography.primaryFont]: 1, [data.typography.secondaryFont || '']: 1 }).filter(k => k).length,
          effectsCount: Object.values(data.effects).filter(v => v === true || (Array.isArray(v) && v.length > 0)).length,
          libraryCount: data.libraries.length,
          scrollAnimationCount: data.scrollAnimations.techniques.length,
          keyframeCount: data.animationPatterns.keyframes.length,
          sectionCount: data.overview.sectionCount,
          url: data.meta.url,
          title: data.meta.title
        }
      };
    } catch (err) {
      return { success: false, error: err.message + ' | ' + err.stack };
    }
  };
})();
