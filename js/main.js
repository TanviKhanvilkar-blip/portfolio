(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---------- reveal on scroll (also rolls out the mini folders) ---------- */
  var revealables = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15 });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- art lightbox ---------- */
  var lb = document.getElementById('lightbox');
  var marks = Array.prototype.slice.call(document.querySelectorAll('button.bookmark'));
  if (lb && marks.length) {
    var lbImg = lb.querySelector('img'), lbCap = lb.querySelector('figcaption'), current = 0, lastFocus = null;
    var show = function (i) {
      current = (i + marks.length) % marks.length;
      var img = marks[current].querySelector('img');
      lbImg.src = img.src; lbImg.alt = img.alt;
      lbCap.textContent = marks[current].dataset.cap || '';
    };
    var close = function () { lb.classList.remove('open'); document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); };
    marks.forEach(function (m, i) {
      m.addEventListener('click', function () {
        lastFocus = m; show(i); lb.classList.add('open'); document.body.style.overflow = 'hidden';
        lb.querySelector('.lb-close').focus();
      });
    });
    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
    lb.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  /* ---------- starfield in the stargazing card ---------- */
  var sky = document.getElementById('starfield');
  if (sky) {
    var ctx = sky.getContext('2d'), stars = [], dpr = Math.min(window.devicePixelRatio || 1, 2);
    var size = function () {
      var r = sky.getBoundingClientRect();
      sky.width = r.width * dpr; sky.height = r.height * dpr;
      stars = [];
      var n = Math.round(r.width * r.height / 1400);
      for (var i = 0; i < n; i++) {
        stars.push({ x: Math.random() * sky.width, y: Math.random() * sky.height,
          r: (Math.random() * 1.1 + 0.3) * dpr, p: Math.random() * Math.PI * 2, s: 0.5 + Math.random() * 1.5 });
      }
    };
    var draw = function (t) {
      ctx.clearRect(0, 0, sky.width, sky.height);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i], a = reduceMotion ? 0.8 : 0.45 + 0.45 * Math.sin(s.p + t / 1000 * s.s);
        ctx.fillStyle = 'rgba(244,239,227,' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      }
      if (!reduceMotion) requestAnimationFrame(draw);
    };
    size(); requestAnimationFrame(draw);
    window.addEventListener('resize', size);
  }

  /* ---------- project folders ---------- */
  var cabinet = document.getElementById('cabinet');
  if (cabinet) {
    var folders = Array.prototype.slice.call(cabinet.querySelectorAll('.folder'));
    var setOpen = function (folder, updateHash) {
      folders.forEach(function (f) {
        var isOpen = f === folder;
        f.classList.toggle('open', isOpen);
        f.querySelector('.folder-tab').setAttribute('aria-expanded', isOpen);
      });
      cabinet.classList.toggle('has-open', !!folder);
      if (updateHash) history.replaceState(null, '', folder ? '#' + folder.id : location.pathname);
      if (folder) {
        folder.querySelector('.contents').scrollTop = 0;
        if (window.innerWidth <= 860) {
          setTimeout(function () { folder.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }); }, 60);
        }
      }
    };
    folders.forEach(function (f) {
      var tab = f.querySelector('.folder-tab');
      tab.addEventListener('click', function () { setOpen(f.classList.contains('open') ? null : f, true); });
      f.querySelector('.cover').addEventListener('click', function () { setOpen(f, true); });
      f.querySelector('.close-folder').addEventListener('click', function (e) { e.stopPropagation(); setOpen(null, true); tab.focus(); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && cabinet.classList.contains('has-open')) setOpen(null, true); });
    var fromHash = function () {
      var target = location.hash && document.getElementById(location.hash.slice(1));
      if (target && target.classList.contains('folder')) setOpen(target, false);
    };
    // let the roll-out animation play before opening a deep-linked folder
    setTimeout(fromHash, reduceMotion ? 0 : 900);
    window.addEventListener('hashchange', fromHash);
  }

  /* ---------- schematic 543-seat hemicycle ---------- */
  var hemi = document.getElementById('hemicycle');
  if (hemi) {
    var NS = 'http://www.w3.org/2000/svg', total = 543, rows = 12, cx = 150, cy = 150, r0 = 52, r1 = 140;
    var radii = [], sum = 0;
    for (var i = 0; i < rows; i++) { radii.push(r0 + (r1 - r0) * i / (rows - 1)); sum += radii[i]; }
    var seats = [], placed = 0;
    radii.forEach(function (r, i) {
      var n = i === rows - 1 ? total - placed : Math.round(total * r / sum);
      placed += n;
      for (var j = 0; j < n; j++) {
        var a = Math.PI - Math.PI * (j + 0.5) / n;
        seats.push({ x: cx + r * Math.cos(a), y: cy - r * Math.sin(a), a: a });
      }
    });
    seats.sort(function (p, q) { return q.a - p.a; });
    var blocks = [[0.42, '#4a5a3a'], [0.12, '#8a9a74'], [0.1, '#b9c3a2'], [0.14, '#a87d55'], [0.22, '#7a5638']];
    var bi = 0, edge = blocks[0][0] * total;
    seats.forEach(function (s, k) {
      while (k >= edge && bi < blocks.length - 1) { bi++; edge += blocks[bi][0] * total; }
      var c = document.createElementNS(NS, 'circle');
      c.setAttribute('cx', s.x.toFixed(1)); c.setAttribute('cy', s.y.toFixed(1)); c.setAttribute('r', '3');
      c.setAttribute('fill', blocks[bi][1]);
      hemi.appendChild(c);
    });
  }

  /* ---------- travel journal: photos + map ---------- */
  var journal = document.getElementById('journal');
  var openBtn = document.querySelector('.journal-open');
  if (journal && openBtn) {
    var PHOTOS = [
      ['photos/lucerne-street.jpg', 'Lucerne, Switzerland', 'Grey skies, a cosy coat, and every corner a postcard.'],
      ['travel/lion-monument.jpg', 'Lion Monument, Lucerne', 'A lion carved straight into the cliff face.'],
      ['travel/grendelwald.jpg', 'Grindelwald, Switzerland', 'Glacier-blue rivers and clouds resting on the peaks.'],
      ['travel/zurich-musuem.jpg', 'Zurich, Switzerland', 'A museum that looks like it belongs in a fairytale.'],
      ['travel/frankfurt.jpg', 'Frankfurt, Germany', 'Skyscrapers and leafy trees, Mainhattan style.'],
      ['travel/cologne-cathedral.jpg', 'Cologne Cathedral, Germany', 'Had to tilt my phone all the way back for this one.'],
      ['travel/cologne-city.jpg', 'Cologne, Germany', 'A leather jacket, a bright red tram and a good mood.'],
      ['travel/cologne-streets.jpg', 'Cologne, Germany', 'Wandering the old town squares.'],
      ['travel/zanse-schans.jpg', 'Zaanse Schans, Netherlands', 'Finally found clogs in my size.'],
      ['travel/brussels-grand-place.jpg', 'Brussels, Belgium', 'Cobblestone lanes around the Grand-Place.'],
      ['travel/eiffel-tower.jpg', 'Paris, France', 'Bonjour, Eiffel. Not a cloud in sight.'],
      ['travel/arc-de-triumph.jpg', 'Arc de Triomphe, Paris', 'Twelve avenues, one very grand roundabout.'],
      ['travel/le-louvre.jpg', 'The Louvre, Paris', 'Glass pyramid, endless blue sky.']
    ];
    // [name, left %, top %] on assets/travel/europe-map.svg (Mercator, lon -3.2..12.6, lat 45.2..54.2)
    var PLACES = [
      ['Switzerland', [['Lucerne', 72.8, 80.9], ['Zurich', 74.3, 77.4], ['Interlaken', 70.0, 84.7], ['Grindelwald', 71.1, 85.3], ['Mt. Titlis', 73.7, 83.8]]],
      ['Germany', [['Frankfurt', 75.2, 47.8], ['Cologne', 64.3, 38.4], ['Black Forest', 72.2, 67.6], ['Titisee', 71.8, 71.9]]],
      ['Netherlands', [['Amsterdam', 51.2, 21.9], ['Zaanse Schans', 50.7, 20.7], ['Noordwijkerhout', 48.7, 23.2]]],
      ['Belgium', [['Brussels', 47.8, 39.4], ['Atomium', 47.7, 38.9]]],
      ['France', [['Paris', 35.1, 61.6], ['Martragny, Normandy', 16.4, 57.3]]]
    ];

    var fig = journal.querySelector('.jp-figure img'), jpPlace = journal.querySelector('.jp-place'),
        jpCap = journal.querySelector('.jp-cap'), jpCount = journal.querySelector('.jp-count'),
        thumbs = journal.querySelector('.jp-thumbs'), idx = 0, built = false, lastFocusJ = null;

    var showPhoto = function (i) {
      idx = (i + PHOTOS.length) % PHOTOS.length;
      var p = PHOTOS[idx];
      fig.src = 'assets/' + p[0]; fig.alt = p[1];
      jpPlace.textContent = p[1]; jpCap.textContent = p[2]; jpCount.textContent = (idx + 1) + ' / ' + PHOTOS.length;
      Array.prototype.forEach.call(thumbs.children, function (t, k) { t.setAttribute('aria-current', k === idx ? 'true' : 'false'); });
      var cur = thumbs.children[idx];
      if (cur) cur.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    };

    var build = function () {
      if (built) return; built = true;
      PHOTOS.forEach(function (p, k) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'jp-thumb'; b.setAttribute('aria-label', p[1]);
        b.innerHTML = '<img loading="lazy" alt="" src="assets/' + p[0] + '">';
        b.addEventListener('click', function () { showPhoto(k); });
        thumbs.appendChild(b);
      });
      var pins = journal.querySelector('.jm-pins'), groups = journal.querySelector('.jm-groups'), total = 0;
      PLACES.forEach(function (g) {
        var box = document.createElement('div'); box.className = 'jm-group';
        box.innerHTML = '<h4>' + g[0] + '</h4>';
        var ul = document.createElement('ul');
        g[1].forEach(function (pl) {
          total++;
          var pin = document.createElement('button');
          pin.type = 'button'; pin.className = 'jm-pin'; pin.style.left = pl[1] + '%'; pin.style.top = pl[2] + '%';
          pin.setAttribute('aria-label', pl[0] + ', ' + g[0]);
          pin.innerHTML = '<span class="jm-tip">' + pl[0] + '</span>';
          pins.appendChild(pin);
          var li = document.createElement('li'); li.textContent = pl[0]; li.tabIndex = 0;
          var on = function () { pin.classList.add('active'); li.classList.add('active'); };
          var off = function () { pin.classList.remove('active'); li.classList.remove('active'); };
          [pin, li].forEach(function (el) {
            el.addEventListener('mouseenter', on); el.addEventListener('mouseleave', off);
            el.addEventListener('focus', on); el.addEventListener('blur', off);
          });
          ul.appendChild(li);
        });
        box.appendChild(ul); groups.appendChild(box);
      });
      journal.querySelector('.jm-count').innerHTML = '<b>' + total + '</b> places · <b>' + PLACES.length + '</b> countries';
    };

    var tabs = journal.querySelectorAll('[role="tab"]');
    var selectTab = function (tab) {
      Array.prototype.forEach.call(tabs, function (t) {
        var sel = t === tab;
        t.setAttribute('aria-selected', sel); t.tabIndex = sel ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !sel;
      });
    };
    Array.prototype.forEach.call(tabs, function (t, k) {
      t.addEventListener('click', function () { selectTab(t); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { var n = tabs[(k + 1) % tabs.length]; selectTab(n); n.focus(); }
      });
    });

    var openJ = function () {
      build(); lastFocusJ = document.activeElement;
      journal.hidden = false; document.body.style.overflow = 'hidden';
      selectTab(tabs[0]); showPhoto(0);
      journal.querySelector('.journal-close').focus();
    };
    var closeJ = function () {
      journal.hidden = true; document.body.style.overflow = '';
      if (lastFocusJ) lastFocusJ.focus();
    };
    openBtn.addEventListener('click', openJ);
    journal.querySelector('.journal-close').addEventListener('click', closeJ);
    journal.querySelector('.jp-prev').addEventListener('click', function () { showPhoto(idx - 1); });
    journal.querySelector('.jp-next').addEventListener('click', function () { showPhoto(idx + 1); });
    journal.addEventListener('click', function (e) { if (e.target === journal) closeJ(); });
    document.addEventListener('keydown', function (e) {
      if (journal.hidden) return;
      if (e.key === 'Escape') closeJ();
      var photosOpen = !document.getElementById('pane-photos').hidden;
      if (photosOpen && e.target.getAttribute('role') !== 'tab') {
        if (e.key === 'ArrowLeft') showPhoto(idx - 1);
        if (e.key === 'ArrowRight') showPhoto(idx + 1);
      }
    });
  }
})();
