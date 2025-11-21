# Hello Kitty Birthday — Static Site

This is a self-contained static export of the Hello Kitty Birthday page (HTML/CSS/JS).

How to preview locally:

```powershell
cd 'D:\Programming languages\Random projects\HBD1\publish'
python -m http.server 3000
# open http://localhost:3000/
```

What's included:
- `index.html` — main page
- `styles.css` — site styles
- `script.js` — interactivity (confetti, music, cake)
- `public/` — audio files (`blue-yong-kai.mp3`, `happy-birthday.mp3`)
- `Happy Birthday.jpg`, `img1.png`, `img2.jpg`, `Hello kitty face.jpg` — image assets

Notes:
- The `public/` folder contains the audio tracks bundled with the site. Make sure you have the rights to publish these files. If not, remove them before pushing to GitHub and update `index.html` to reference an external URL.
- The page includes a fallback overlay to enable audio if the browser blocks autoplay.

License: (choose and add a LICENSE file before publishing)
