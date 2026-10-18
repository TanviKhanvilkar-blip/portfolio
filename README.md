# Tanvi Khanvilkar · Portfolio

Personal portfolio of Tanvi Khanvilkar, a data science undergraduate at NMIMS MPSTME, Mumbai, and published researcher.

A hand-built static site in an earthy sage, cream and coffee palette with subtle paithani-inspired borders:

- **Home (`index.html`)**: bento-grid layout with about, skills constellation, research, education, painted bookmarks, stargazing, music and a travel journal (photos + map)
- **Projects (`projects.html`)**: "project files" that roll out like folders: document secret sharing (published research), India's CPI inflation study, and a 2019 Lok Sabha election data system

Built with plain HTML, CSS and JavaScript, no frameworks or build step. Hosted on Netlify.

## Run locally

```bash
python -m http.server 5173
```

Then open http://localhost:5173.

## Structure

```
index.html, projects.html   pages
css/style.css               all styles
js/main.js                  interactions (reveals, folders, lightboxes, travel journal)
assets/                     optimised photos, artwork, résumé and the travel map
```
