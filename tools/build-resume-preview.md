# Regenerating the resume hover preview

`assets/resume-preview.webp` is page 1 of `Nitansh-Anand-Resume.pdf`, rendered to an
image so the hover popover on the "Download resume" button costs one small request
instead of shipping a PDF renderer to every visitor.

Redo it whenever the PDF changes. There is no CLI rasteriser on this machine
(no `pdftoppm`, no ImageMagick), so the render happens in a browser.

1. Serve the site: `node serve.js` (port 5210).
2. Open `http://localhost:5210/` and paste this into the devtools console:

```js
const s = document.createElement('script');
s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
document.head.appendChild(s);
await new Promise(r => (s.onload = r));
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const pdf  = await pdfjsLib.getDocument('Nitansh-Anand-Resume.pdf').promise;
const page = await pdf.getPage(1);
const base = page.getViewport({ scale: 1 });
const vp   = page.getViewport({ scale: 720 / base.width }); // 2x the 360px slot

const cv = Object.assign(document.createElement('canvas'),
  { width: Math.round(vp.width), height: Math.round(vp.height) });
const ctx = cv.getContext('2d');
ctx.fillStyle = '#fff';                 // the PDF has no background of its own
ctx.fillRect(0, 0, cv.width, cv.height);
await page.render({ canvasContext: ctx, viewport: vp }).promise;

cv.toBlob(b => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(b);
  a.download = 'resume-preview.webp';
  a.click();
}, 'image/webp', 0.9);
```

3. Move the downloaded file to `assets/resume-preview.webp`.

The last render was 720x932, 99KB. If the resume ever grows past one page, only
page 1 is previewed — update the "1 page - PDF" caption in `index.html` to match.
