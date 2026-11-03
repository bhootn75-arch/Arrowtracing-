# बच्चों के लिए स्मार्ट एरो ट्रेसिंग ऐप (PWA)

## महत्वपूर्ण (इंस्टॉल + ऑफ़लाइन)

Chrome **तभी** असली ऐप इंस्टॉल करता है जब:
1. साइट **HTTPS** पर हो (GitHub Pages ठीक है)
2. `manifest.json` + आइकन सही लोड हों
3. **Service Worker** सफलतापूर्वक रजिस्टर हो

लोकल `file://` से खोलने पर इंस्टॉल/ऑफ़लाइन **नहीं** चलता।

---

## GitHub Pages पर पब्लिश

1. नया repository बनाएँ।
2. **इस Zip के अंदर की सारी फ़ाइलें** repo की **root** में डालें  
   (`index.html`, `manifest.json`, `sw.js`, `icons/`, `.nojekyll`, `README.md`)  
   — अंदर एक और फ़ोल्डर न बनाएँ।
3. Settings → **Pages** → Deploy from branch → `main` → `/ (root)` → Save.
4. URL: `https://<username>.github.io/<repo-name>/`

### पहली बार / पुराना SW साफ़ करें
Chrome → साइट पर → ⋮ → Site settings → **Clear data**  
या DevTools → Application → Service Workers → Unregister + Clear storage  
फिर पेज **Hard Refresh** (Ctrl+Shift+R)।

---

## Chrome से असली ऐप इंस्टॉल

### Android Chrome
1. HTTPS URL खोलें (GitHub Pages)।
2. ⋮ मेनू → **Install app** / **ऐप इंस्टॉल करें**  
   (सिर्फ़ “Add to Home screen / होम स्क्रीन पर जोड़ें” नहीं — वह शॉर्टकट होता है)
3. अगर Install नहीं दिखे: 2–3 सेकंड प्रतीक्षा, पेज रीफ्रेश, फिर मेनू देखें।

### Desktop Chrome
Address bar में **Install** आइकन, या ⋮ → **Install एरो ट्रेसिंग…**

इंस्टॉल के बाद ऐप **बिना address bar** (standalone) खुलना चाहिए।

---

## ऑफ़लाइन टेस्ट

1. इंस्टॉल के बाद ऐप खोलें (एक बार ऑनलाइन)।
2. फोन/कंप्यूटर का इंटरनेट बंद करें।
3. ऐप फिर से खोलें — ट्रेसिंग चलनी चाहिए।

---

## फ़ाइलें

| फ़ाइल | भूमिका |
|--------|--------|
| `index.html` | पूरा ऐप (ट्रेसिंग लॉजिक अपरिवर्तित) |
| `manifest.json` | standalone इंस्टॉल |
| `sw.js` | ऑफ़लाइन कैश |
| `icons/` | any + maskable आइकन |
| `.nojekyll` | GitHub Pages के लिए |

**नोट:** ट्रेसिंग / एरो / चींटी / एडिट लॉजिक में कोई बदलाव नहीं। केवल PWA (इंस्टॉल + ऑफ़लाइन) ठीक किया गया है।
