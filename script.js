(() => {
  'use strict';

  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-button]');
  const nav = document.querySelector('[data-nav]');
  const navLinks = nav ? [...nav.querySelectorAll('a[href^="#"]')] : [];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const desktopNav = window.matchMedia('(min-width: 901px)');
  const mobileShirtMedia = window.matchMedia('(max-width: 768px)');

  let menuOpen = false;
  let lastFocusedElement = null;

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 18);
  };

  const closeMenu = ({ restoreFocus = false } = {}) => {
    if (!menuOpen || !menuButton || !nav || !header) return;

    menuOpen = false;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
    nav.classList.remove('is-open');
    header.classList.remove('menu-active');
    body.classList.remove('menu-open');

    if (restoreFocus && lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  };

  const openMenu = () => {
    if (menuOpen || !menuButton || !nav || !header) return;

    menuOpen = true;
    lastFocusedElement = document.activeElement;
    menuButton.setAttribute('aria-expanded', 'true');
    menuButton.setAttribute('aria-label', 'Close menu');
    nav.classList.add('is-open');
    header.classList.add('menu-active');
    body.classList.add('menu-open');

    const firstLink = nav.querySelector('a');
    if (firstLink instanceof HTMLElement) {
      window.setTimeout(() => firstLink.focus(), 220);
    }
  };

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      if (menuOpen) {
        closeMenu({ restoreFocus: true });
      } else {
        openMenu();
      }
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => closeMenu());
    });

    document.addEventListener('keydown', (event) => {
      if (!menuOpen) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu({ restoreFocus: true });
        return;
      }

      if (event.key !== 'Tab' || !nav || !menuButton) return;

      const focusable = [menuButton, ...nav.querySelectorAll('a')].filter(
        (element) => element instanceof HTMLElement && !element.hasAttribute('disabled')
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    desktopNav.addEventListener('change', (event) => {
      if (event.matches) closeMenu();
    });
  }

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  const heroRevealElements = [...document.querySelectorAll('#top [data-reveal]')];
  heroRevealElements.forEach((element) => element.classList.add('is-visible'));

  const revealElements = [...document.querySelectorAll('[data-reveal]')].filter(
    (element) => !element.closest('#top')
  );

  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.08
      }
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  } else {
    revealElements.forEach((element) => element.classList.add('is-visible'));
  }

  const sections = [...document.querySelectorAll('main section[id]')];

  if ('IntersectionObserver' in window && sections.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        navLinks.forEach((link) => {
          const targetId = link.getAttribute('href')?.slice(1);
          if (targetId === visible.target.id) {
            link.setAttribute('aria-current', 'true');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      },
      {
        rootMargin: '-32% 0px -58% 0px',
        threshold: [0, 0.15, 0.35, 0.6]
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  const normalizeSearchText = (value) =>
    value
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();

  const placesSearchForm = document.querySelector('[data-places-search]');
  const placesSearchInput = document.querySelector('[data-places-search-input]');
  const placesResults = document.querySelector('[data-places-results]');
  const placesSearchEmpty = document.querySelector('[data-places-search-empty]');
  const placesFilters = [...document.querySelectorAll('[data-places-filter]')];

  const setMobileShirtState = (toggle, side) => {
    const front = toggle.querySelector('[data-mobile-shirt-layer="front"]');
    const back = toggle.querySelector('[data-mobile-shirt-layer="back"]');
    const button = toggle.querySelector('[data-mobile-shirt-button]');

    if (!front || !back || !button) return;

    const isBackVisible = side === 'back';
    toggle.dataset.mobileShirtSide = side;

    front.classList.toggle('is-visible', !isBackVisible);
    back.classList.toggle('is-visible', isBackVisible);
    front.setAttribute('aria-hidden', isBackVisible ? 'true' : 'false');
    back.setAttribute('aria-hidden', isBackVisible ? 'false' : 'true');
    button.setAttribute(
      'aria-label',
      isBackVisible ? `Show front of ${toggle.dataset.mobileShirtGround} T-shirt` : `Show back of ${toggle.dataset.mobileShirtGround} T-shirt`
    );
    button.setAttribute('aria-pressed', isBackVisible ? 'true' : 'false');
  };

  const buildMobileShirtToggle = (shirt) => {
    const ground = escapeHtml(shirt.ground);
    const front = escapeHtml(shirt.mobileImages.front);
    const back = escapeHtml(shirt.mobileImages.back);

    return `
      <button
        class="mobile-shirt-toggle"
        type="button"
        data-mobile-shirt-button
        aria-label="Show back of ${ground} T-shirt"
        aria-pressed="false"
      >
        <img
          class="mobile-shirt-toggle__layer mobile-shirt-toggle__layer--front is-visible"
          src="${front}"
          alt="${ground} T-shirt front view"
          loading="eager"
          decoding="async"
          data-mobile-shirt-layer="front"
        >
        <img
          class="mobile-shirt-toggle__layer mobile-shirt-toggle__layer--back"
          src="${back}"
          alt="${ground} T-shirt back view"
          loading="eager"
          decoding="async"
          data-mobile-shirt-layer="back"
          aria-hidden="true"
        >
      </button>`;
  };

  const setupMobileShirtToggles = () => {
    const toggles = [...document.querySelectorAll('[data-mobile-shirt-toggle]')];

    toggles.forEach((toggle) => {
      const button = toggle.querySelector('[data-mobile-shirt-button]');
      const front = toggle.querySelector('[data-mobile-shirt-layer="front"]');
      const back = toggle.querySelector('[data-mobile-shirt-layer="back"]');

      if (!button || !front || !back) return;

      toggle.dataset.mobileShirtSide = toggle.dataset.mobileShirtSide || 'front';
      setMobileShirtState(toggle, 'front');

      let pointerStartX = 0;
      let pointerStartY = 0;
      let pointerMoved = false;
      let suppressClick = false;

      button.addEventListener('pointerdown', (event) => {
        if (event.pointerType !== 'touch') return;
        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
        pointerMoved = false;
      });

      button.addEventListener('pointermove', (event) => {
        if (event.pointerType !== 'touch' || pointerMoved) return;
        const deltaX = Math.abs(event.clientX - pointerStartX);
        const deltaY = Math.abs(event.clientY - pointerStartY);
        if (deltaX > 10 || deltaY > 10) {
          pointerMoved = true;
        }
      });

      button.addEventListener('pointerup', (event) => {
        if (event.pointerType !== 'touch' || pointerMoved) return;

        const nextSide = (toggle.dataset.mobileShirtSide || 'front') === 'front' ? 'back' : 'front';
        setMobileShirtState(toggle, nextSide);
        suppressClick = true;
      });

      button.addEventListener('click', (event) => {
        if (suppressClick) {
          suppressClick = false;
          event.preventDefault();
          return;
        }

        const nextSide = (toggle.dataset.mobileShirtSide || 'front') === 'front' ? 'back' : 'front';
        setMobileShirtState(toggle, nextSide);
      });
    });
  };

  const shirts = [
    {
      collection: 'current',
      ground: 'Amex Stadium',
      image: 'assets/T-Shirts/Contemporary%20Grounds/Amex_Stadium.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Contemporary/Amex_Stadium_front.png',
        back: 'assets/T-Shirts/Single/Contemporary/Amex_Stadium_back.png'
      },
      coordinates: '50°51\'43"N - 0°05\'13"W',
      colours: [
        { label: 'Royal Blue', swatch: 'royal' },
        { label: 'White', swatch: 'white' }
      ],
      keywords: 'brighton hove albion'
    },
    {
      collection: 'current',
      ground: 'Anfield',
      image: 'assets/T-Shirts/Contemporary%20Grounds/Anfield.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Contemporary/Anfield_front.png',
        back: 'assets/T-Shirts/Single/Contemporary/Anfield_back.png'
      },
      coordinates: '53°25\'51"N - 2°57\'39"W',
      colours: [
        { label: 'Red', swatch: 'red' },
        { label: 'White', swatch: 'white' }
      ],
      keywords: 'liverpool'
    },
    {
      collection: 'current',
      ground: 'CBS Arena',
      image: 'assets/T-Shirts/Contemporary%20Grounds/CBS_Arena.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Contemporary/CBS_Arena_front.png',
        back: 'assets/T-Shirts/Single/Contemporary/CBS_Arena_back.png'
      },
      coordinates: '52°26\'40"N - 1°29\'06"W',
      colours: [
        { label: 'Sky Blue', swatch: 'sky' },
        { label: 'Navy', swatch: 'navy' }
      ],
      keywords: 'coventry city'
    },
    {
      collection: 'current',
      ground: 'City Ground',
      image: 'assets/T-Shirts/Contemporary%20Grounds/City_Ground.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Contemporary/City_Ground_front.png',
        back: 'assets/T-Shirts/Single/Contemporary/City_Ground_back.png'
      },
      coordinates: '52°56\'24"N - 1°07\'44"W',
      colours: [
        { label: 'Red', swatch: 'red' },
        { label: 'White', swatch: 'white' }
      ],
      keywords: 'nottingham forest'
    },
    {
      collection: 'current',
      ground: 'Elland Road',
      image: 'assets/T-Shirts/Contemporary%20Grounds/Elland_Road.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Contemporary/Elland_Road_front.png',
        back: 'assets/T-Shirts/Single/Contemporary/Elland_Road_back.png'
      },
      coordinates: '53°46\'40"N - 1°34\'20"W',
      colours: [
        { label: 'White', swatch: 'white' },
        { label: 'Royal Blue', swatch: 'royal' }
      ],
      keywords: 'leeds united'
    },
    {
      collection: 'current',
      ground: 'Etihad Stadium',
      image: 'assets/T-Shirts/Contemporary%20Grounds/Etihad_Stadium.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Contemporary/Etihad_Stadium_front.png',
        back: 'assets/T-Shirts/Single/Contemporary/Etihad_Stadium_back.png'
      },
      coordinates: '53°28\'59"N - 2°12\'01"W',
      colours: [
        { label: 'Sky Blue', swatch: 'sky' },
        { label: 'White', swatch: 'white' }
      ],
      keywords: 'manchester city'
    },
    {
      collection: 'current',
      ground: 'GTech Community Stadium',
      image: 'assets/T-Shirts/Contemporary%20Grounds/GTech_Community_Stadium.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Contemporary/GTech_Company_Stadium_front.png',
        back: 'assets/T-Shirts/Single/Contemporary/GTech_Company_Stadium_back.png'
      },
      coordinates: '51°29\'53"N - 0°17\'10"W',
      colours: [
        { label: 'Red', swatch: 'red' },
        { label: 'White', swatch: 'white' }
      ],
      keywords: 'brentford'
    },
    {
      collection: 'current',
      ground: 'Hill Dickinson Stadium',
      image: 'assets/T-Shirts/Contemporary%20Grounds/Hill_Dickinson.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Contemporary/Hill_Dickinson_front.png',
        back: 'assets/T-Shirts/Single/Contemporary/Hill_Dickinson_back.png'
      },
      coordinates: '53°26\'24"N - 2°59\'14"W',
      colours: [
        { label: 'Royal Blue', swatch: 'royal' },
        { label: 'White', swatch: 'white' }
      ],
      keywords: 'everton bramley moore dock'
    },
    {
      collection: 'current',
      ground: 'London Stadium',
      image: 'assets/T-Shirts/Contemporary%20Grounds/London_Stadium.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Contemporary/London_Stadium_front.png',
        back: 'assets/T-Shirts/Single/Contemporary/London_Stadium_back.png'
      },
      coordinates: '51°32\'19"N - 0°01\'00"W',
      colours: [
        { label: 'Claret', swatch: 'claret' },
        { label: 'Sky Blue', swatch: 'sky' }
      ],
      keywords: 'west ham'
    },
    {
      collection: 'current',
      ground: 'MKM Stadium',
      image: 'assets/T-Shirts/Contemporary%20Grounds/MKM_Stadium.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Contemporary/MKM_Stadium_front.png',
        back: 'assets/T-Shirts/Single/Contemporary/MKM_Stadium_back.png'
      },
      coordinates: '53°44\'31"N - 0°22\'12"W',
      colours: [
        { label: 'Amber', swatch: 'amber' },
        { label: 'Black', swatch: 'black' }
      ],
      keywords: 'hull city'
    },
    {
      collection: 'current',
      ground: 'Old Trafford',
      image: 'assets/T-Shirts/Contemporary%20Grounds/Old_Trafford.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Contemporary/Old_Trafford_front.png',
        back: 'assets/T-Shirts/Single/Contemporary/Old_Trafford_back.png'
      },
      coordinates: '53°27\'47"N - 2°17\'28"W',
      colours: [
        { label: 'Red', swatch: 'red' },
        { label: 'White', swatch: 'white' }
      ],
      keywords: 'manchester united'
    },
    {
      collection: 'current',
      ground: 'Portman Road',
      image: 'assets/T-Shirts/Contemporary%20Grounds/Portman_Road.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Contemporary/Portman_Road_front.png',
        back: 'assets/T-Shirts/Single/Contemporary/Portman_Road_back.png'
      },
      coordinates: '52°03\'25"N - 1°08\'43"E',
      colours: [
        { label: 'Royal Blue', swatch: 'royal' },
        { label: 'White', swatch: 'white' }
      ],
      keywords: 'ipswich town'
    },
    {
      collection: 'current',
      ground: 'Selhurst Park',
      image: 'assets/T-Shirts/Contemporary%20Grounds/Selhurst_Park.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Contemporary/Selhurst_Park_front.png',
        back: 'assets/T-Shirts/Single/Contemporary/Selhurst_Park_back.png'
      },
      coordinates: '51°23\'54"N - 0°05\'09"W',
      colours: [
        { label: 'Red', swatch: 'red' },
        { label: 'Royal Blue', swatch: 'royal' }
      ],
      keywords: 'crystal palace'
    },
    {
      collection: 'current',
      ground: "St.James' Park",
      image: "assets/T-Shirts/Contemporary%20Grounds/St.James'_Park.png",
      mobileImages: {
        front: "assets/T-Shirts/Single/Contemporary/St.James'_Park_front.png",
        back: "assets/T-Shirts/Single/Contemporary/St.James'_Park_back.png"
      },
      coordinates: '54°58\'32"N - 1°37\'18"W',
      colours: [
        { label: 'Black', swatch: 'black' },
        { label: 'White', swatch: 'white' }
      ],
      keywords: 'newcastle united'
    },
    {
      collection: 'current',
      ground: 'Stadium of Light',
      image: 'assets/T-Shirts/Contemporary%20Grounds/Stadium_of_Light.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Contemporary/Stadium_of_Light_front.png',
        back: 'assets/T-Shirts/Single/Contemporary/Stadium_of_Light_back.png'
      },
      coordinates: '54°54\'55"N - 1°23\'13"W',
      colours: [
        { label: 'Red', swatch: 'red' },
        { label: 'White', swatch: 'white' }
      ],
      keywords: 'sunderland'
    },
    {
      collection: 'current',
      ground: 'Stamford Bridge',
      image: 'assets/T-Shirts/Contemporary%20Grounds/Stamford_Bridge.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Contemporary/Stamford_Bridge_front.png',
        back: 'assets/T-Shirts/Single/Contemporary/Stamford_Bridge_back.png'
      },
      coordinates: '51°28\'54"N - 0°11\'28"W',
      colours: [
        { label: 'Royal Blue', swatch: 'royal' },
        { label: 'White', swatch: 'white' }
      ],
      keywords: 'chelsea'
    },
    {
      collection: 'current',
      ground: 'The Emirates',
      image: 'assets/T-Shirts/Contemporary%20Grounds/The_Emirates.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Contemporary/The_Emirates_Front.png',
        back: 'assets/T-Shirts/Single/Contemporary/The_Emirates_back.png'
      },
      coordinates: '51°33\'18"N - 0°06\'32"W',
      colours: [
        { label: 'Red', swatch: 'red' },
        { label: 'White', swatch: 'white' }
      ],
      keywords: 'arsenal emirates stadium'
    },
    {
      collection: 'current',
      ground: 'Tottenham Hotspur Stadium',
      image: 'assets/T-Shirts/Contemporary%20Grounds/Tottenham_Hotspur_Stadium.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Contemporary/Tottenham_Hotspur_Stadium_front.png',
        back: 'assets/T-Shirts/Single/Contemporary/Tottenham_Hotspur_Stadium_back.png'
      },
      coordinates: '51°36\'14"N - 0°03\'58"W',
      colours: [
        { label: 'Navy', swatch: 'navy' },
        { label: 'White', swatch: 'white' }
      ],
      keywords: 'spurs tottenham'
    },
    {
      collection: 'current',
      ground: 'Villa Park',
      image: 'assets/T-Shirts/Contemporary%20Grounds/Villa_Park.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Contemporary/Villa_Park_Front.png',
        back: 'assets/T-Shirts/Single/Contemporary/Villa_Park_back.png'
      },
      coordinates: '52°30\'48"N - 1°53\'42"W',
      colours: [
        { label: 'Claret', swatch: 'claret' },
        { label: 'Sky Blue', swatch: 'sky' }
      ],
      keywords: 'aston villa'
    },
    {
      collection: 'current',
      ground: 'Vitality Stadium',
      image: 'assets/T-Shirts/Contemporary%20Grounds/Vitality_Stadium.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Contemporary/Vitality_Stadium_front.png',
        back: 'assets/T-Shirts/Single/Contemporary/Vitality_Stadium_back.png'
      },
      coordinates: '50°44\'06"N - 1°50\'49"W',
      colours: [
        { label: 'Red', swatch: 'red' },
        { label: 'Black', swatch: 'black' }
      ],
      keywords: 'bournemouth'
    },
    {
      collection: 'heritage',
      ground: 'Boothferry Park',
      image: 'assets/T-Shirts/Heritage%20Grounds/Boothferry_Park.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Heritage/Bootheferry_Park_front.png',
        back: 'assets/T-Shirts/Single/Heritage/Bootheferry_Park_back.png'
      },
      coordinates: '53°44\'18"N - 0°23\'56"W',
      colours: [
        { label: 'Amber', swatch: 'amber' },
        { label: 'Black', swatch: 'black' }
      ],
      keywords: 'hull city'
    },
    {
      collection: 'heritage',
      ground: 'Goldstone Ground',
      image: 'assets/T-Shirts/Heritage%20Grounds/Goldstone_Ground.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Heritage/Goldstone_Ground_front.png',
        back: 'assets/T-Shirts/Single/Heritage/Goldstone_Ground_back.png'
      },
      coordinates: '50°50\'22"N - 0°10\'12"W',
      colours: [
        { label: 'Royal Blue', swatch: 'royal' },
        { label: 'White', swatch: 'white' }
      ],
      keywords: 'brighton hove albion'
    },
    {
      collection: 'heritage',
      ground: 'Goodison Park',
      image: 'assets/T-Shirts/Heritage%20Grounds/Goodison_Park.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Heritage/Goodison_Park_front.png',
        back: 'assets/T-Shirts/Single/Heritage/Goodison_Park_back.png'
      },
      coordinates: '53°26\'16"N - 2°57\'59"W',
      colours: [
        { label: 'Royal Blue', swatch: 'royal' },
        { label: 'White', swatch: 'white' }
      ],
      keywords: 'everton'
    },
    {
      collection: 'heritage',
      ground: 'Griffin Park',
      image: 'assets/T-Shirts/Heritage%20Grounds/Griffin_Park.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Heritage/Griffin_Park_Front.png',
        back: 'assets/T-Shirts/Single/Heritage/Griffin_Park_back.png'
      },
      coordinates: '51°29\'31"N - 0°18\'05"W',
      colours: [
        { label: 'Red', swatch: 'red' },
        { label: 'White', swatch: 'white' }
      ],
      keywords: 'brentford'
    },
    {
      collection: 'heritage',
      ground: 'Highbury',
      image: 'assets/T-Shirts/Heritage%20Grounds/Highbury.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Heritage/Highbury_front.png',
        back: 'assets/T-Shirts/Single/Heritage/Highbury_back.png'
      },
      coordinates: '51°33\'29"N - 0°06\'29"W',
      colours: [
        { label: 'Red', swatch: 'red' },
        { label: 'White', swatch: 'white' }
      ],
      keywords: 'arsenal'
    },
    {
      collection: 'heritage',
      ground: 'Highfield Road',
      image: 'assets/T-Shirts/Heritage%20Grounds/Highfield_Road.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Heritage/Highfield_Road_front.png',
        back: 'assets/T-Shirts/Single/Heritage/Highfield_Road_back.png'
      },
      coordinates: '52°24\'13"N - 1°30\'29"W',
      colours: [
        { label: 'Sky Blue', swatch: 'sky' },
        { label: 'Navy', swatch: 'navy' }
      ],
      keywords: 'coventry city'
    },
    {
      collection: 'heritage',
      ground: 'Maine Road',
      image: 'assets/T-Shirts/Heritage%20Grounds/Maine_Road.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Heritage/Maine_Road_front.png',
        back: 'assets/T-Shirts/Single/Heritage/Maine_Road_back.png'
      },
      coordinates: '53°27\'46"N - 2°12\'02"W',
      colours: [
        { label: 'Sky Blue', swatch: 'sky' },
        { label: 'White', swatch: 'white' }
      ],
      keywords: 'manchester city'
    },
    {
      collection: 'heritage',
      ground: 'Roker Park',
      image: 'assets/T-Shirts/Heritage%20Grounds/Roker_Park.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Heritage/Roker_Park_front.png',
        back: 'assets/T-Shirts/Single/Heritage/Roker_Park_back.png'
      },
      coordinates: '54°55\'21"N - 1°22\'56"W',
      colours: [
        { label: 'Red', swatch: 'red' },
        { label: 'White', swatch: 'white' }
      ],
      keywords: 'sunderland'
    },
    {
      collection: 'heritage',
      ground: 'Upton Park',
      image: 'assets/T-Shirts/Heritage%20Grounds/Upton_Park.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Heritage/Upton_Park_front.png',
        back: 'assets/T-Shirts/Single/Heritage/Upton_Park_back.png'
      },
      coordinates: '51°31\'52"N - 0°02\'16"E',
      colours: [
        { label: 'Claret', swatch: 'claret' },
        { label: 'Sky Blue', swatch: 'sky' }
      ],
      keywords: 'west ham boleyn ground'
    },
    {
      collection: 'heritage',
      ground: 'White Hart Lane',
      image: 'assets/T-Shirts/Heritage%20Grounds/White_Hart_Lane.png',
      mobileImages: {
        front: 'assets/T-Shirts/Single/Heritage/White_Hart_Lane_front.png',
        back: 'assets/T-Shirts/Single/Heritage/White_Hart_Lane_back.png'
      },
      coordinates: '51°36\'16"N - 0°03\'58"W',
      colours: [
        { label: 'Navy', swatch: 'navy' },
        { label: 'White', swatch: 'white' }
      ],
      keywords: 'spurs tottenham'
    }
  ].map((shirt) => {
    const colourLabel = shirt.colours.map((colour) => colour.label).join(' / ');
    const searchBlob = normalizeSearchText(`${shirt.ground} ${shirt.coordinates} ${colourLabel} ${shirt.keywords}`);
    return { ...shirt, colourLabel, searchBlob };
  });

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const createGroundId = (value) => normalizeSearchText(value).replace(/\s+/g, '-');

  let activeCollection = 'current';
  let placesQuery = '';

  const setFilterState = () => {
    placesFilters.forEach((button) => {
      const isActive = button.dataset.placesFilter === activeCollection;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
  };

  const renderPlaces = () => {
    if (!placesResults) return;

    const visibleShirts = shirts.filter(
      (shirt) => shirt.collection === activeCollection && (!placesQuery || shirt.searchBlob.includes(placesQuery))
    );

    placesResults.innerHTML = visibleShirts
      .map((shirt, index) => {
        const groundId = `${createGroundId(shirt.ground)}-${index}`;
        const loading = index === 0 ? 'eager' : 'lazy';
        const fetchPriority = index === 0 ? ' fetchpriority="high"' : '';
        const swatches = shirt.colours
          .map((colour) => `<span class="place-story__swatch--${escapeHtml(colour.swatch)}" aria-hidden="true"></span>`)
          .join('');
        const hasMobileShirtToggle = Boolean(shirt.mobileImages);
        const desktopMediaMarkup = `
          <picture class="place-story__desktop-media">
            <img src="${escapeHtml(shirt.image)}" alt="${escapeHtml(shirt.ground)} STADIA T-shirt shown from the front and back." loading="${loading}" decoding="async"${fetchPriority}>
          </picture>`;
        const mobileMediaMarkup = hasMobileShirtToggle ? buildMobileShirtToggle(shirt) : '';

        return `
        <article class="place-story" aria-labelledby="${groundId}" data-place-card data-collection="${escapeHtml(shirt.collection)}">
          <figure class="place-story__media is-visible"${hasMobileShirtToggle ? ` data-mobile-shirt-toggle data-mobile-shirt-ground="${escapeHtml(shirt.ground)}" data-mobile-shirt-side="front"` : ''}>
            ${desktopMediaMarkup}
            ${mobileMediaMarkup}
          </figure>
          <div class="section-shell place-story__caption">
            <div>
              <h3 id="${groundId}">${escapeHtml(shirt.ground)}</h3>
            </div>
            <p class="place-story__coordinates">${escapeHtml(shirt.coordinates)}</p>
            <div class="place-story__colour">${swatches}${escapeHtml(shirt.colourLabel)}</div>
          </div>
        </article>`;
      })
      .join('');

    if (placesSearchEmpty) {
      placesSearchEmpty.hidden = visibleShirts.length !== 0;
    }

    setupMobileShirtToggles();
  };

  if (placesFilters.length) {
    placesFilters.forEach((button) => {
      button.addEventListener('click', () => {
        const selectedCollection = button.dataset.placesFilter;
        if (!selectedCollection || selectedCollection === activeCollection) return;
        activeCollection = selectedCollection;
        setFilterState();
        renderPlaces();
      });
    });
  }

  if (placesSearchInput) {
    placesSearchInput.addEventListener('input', () => {
      placesQuery = normalizeSearchText(placesSearchInput.value);
      renderPlaces();
    });
  }

  if (placesSearchForm) {
    placesSearchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      placesQuery = normalizeSearchText(placesSearchInput?.value ?? '');
      renderPlaces();
    });
  }

  setFilterState();
  renderPlaces();

  if (mobileShirtMedia.addEventListener) {
    mobileShirtMedia.addEventListener('change', renderPlaces);
  } else if (mobileShirtMedia.addListener) {
    mobileShirtMedia.addListener(renderPlaces);
  }

  if (!reduceMotion.matches) {
    let ticking = false;

    const updateOrbit = () => {
      const rotation = Math.min(window.scrollY * 0.035, 42);
      root.style.setProperty('--orbit-turn', `${rotation}deg`);
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(updateOrbit);
      },
      { passive: true }
    );
  }
})();
