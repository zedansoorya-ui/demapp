# Yaadein · यादें · یادیں

A calm, familiar place for someone living with dementia. Family faces that speak their own names, the songs of their youth, naat sharif, and gentle games in which nothing can go wrong.

It works in **English, Hindi, Urdu and Memoni**, runs in any modern browser, installs on a tablet like an app, and keeps every photo and voice on the device.

---

## What it does

| Section | What happens |
| --- | --- |
| **My Family** | Photos of loved ones, each with the sound of their name. Best of all is their own voice: “Salaam Ammi, it’s me, Zainab.” A slideshow doubles as a photo frame after three quiet minutes on the home screen. |
| **Who is this?** | The name is played, then they touch the right photo. A wrong touch simply names that person. After two tries the right photo glows. There are no scores. |
| **Old Songs** | 28 classics played one after another like a radio: Lata Mangeshkar, Mohammed Rafi, Kishore Kumar, Mukesh, Talat Mahmood, Noor Jehan, Mehdi Hassan and more. |
| **Naat Sharif** | 13 naats, a hamd and two qawwalis: Owais Raza Qadri, Alhaj Khursheed Ahmed, Junaid Jamshed, Salim Raza, the Sabri Brothers, Nusrat Fateh Ali Khan. |
| **Sing along** | Public-domain words shown line by line: Urdu or Arabic script, Devanagari, or Roman letters, depending on the language chosen. |
| **Games** | Colouring (8 pictures), Sing with me (a garden that grows while they sing or hum), Find the pairs, Bubbles, Picture puzzle (with family photos too), Who is this? |
| **Tasbeeh** | A bead counter. Touch anywhere to count. The after-prayer sequence (33 · 33 · 34) moves on by itself. |
| **Relax** | Slow, guided breathing: in for four seconds, out for six. |
| **Every day** | The home screen greets them by name and says the day, the part of the day and the date. |

Everything the patient sees is also spoken, and every screen has a large, fixed way home.

## Languages

| Language | Script | Speech |
| --- | --- | --- |
| English | Roman | Indian, British or American voice, whichever the device has |
| हिन्दी Hindi | Devanagari | Hindi voice |
| اردو Urdu | Nastaliq, right to left | Urdu voice where available; otherwise the Hindi phrase is spoken, which sounds almost the same |
| Memoni | Roman | No device speaks Memoni, so each phrase has a Devanagari spelling that a Hindi voice reads aloud |

Any phrase in any language can be changed, and recorded in a family member’s own voice, from **Family settings → Words & voices**. A recording always plays instead of the computer voice.

### About the Memoni pack

Memoni is mostly spoken, and it differs from family to family. The phrases here follow the Roman-script Memoni of Abdur Razzaq Thaplawala, *Memoni – A New Language is Born* (Karachi, 2005), and the Memoni prose collected in it. For example: *aau* (I), *aaen* (you, respectful), *mijho* (my), *aae* (is), *kutumb* (family), *geet* (song), *saras* (lovely), *naro* (look), *halo* (come on). A few words could not be confirmed there, such as *bapor* (afternoon), some day names and colours. They are borrowed from Gujarati or Hindustani.

A native speaker has not checked these phrases. Please correct anything that sounds wrong, and record your own voice for the phrases heard most often. Family-settings screens stay in English when Memoni is chosen.

## For families

1. **First visit.** Choose a language and what to call them (Ammi, Dadi, Nana …).
2. **Family settings.** Press and hold the settings button on the home screen for two seconds. The hold is deliberate, so a stray touch cannot change anything.
3. **Loved ones.** Add a photo, a name, how they are related (“your granddaughter”), and record the name. A WhatsApp voice note works too.
4. **Songs & naats.** Add favourites from a YouTube link, an audio file, or record them yourself. Recorded and uploaded songs also work offline. Built-in songs can be hidden.
5. **Backup.** Download one file with every photo, voice and setting, and restore it on a new tablet.

A few suggestions:

- Sit together the first few times. Company matters more than the screen.
- Songs from someone’s teens and twenties are often remembered longest.
- If they seem tired or upset, try Relax or a favourite naat.
- Turn on Calm mode if movement on screen distracts them.

## Design

The look follows Anthropic’s brand guidelines: ink `#141413` on warm paper `#faf9f5`, orange `#d97757`, blue `#6a9bcc` and green `#788c5d` accents, Poppins headings and Lora body text. Hand-drawn line illustrations draw themselves in; soft shapes drift behind every screen. Motion is slow, and it stops entirely in Calm mode or when the device asks for reduced motion.

The dementia-friendly choices are the ones that matter most:

- Large type and touch targets of 76 px or more; repeated or shaky taps are forgiven.
- One task per screen, with a big home or back button always in the same place.
- Every label is a picture, a word and a spoken phrase.
- Errorless games: no timers, no scores, no “wrong” sounds. Mistakes are answered with information.
- Familiar imagery: a transistor radio, a Ludo board, the green dome, chai with a rusk, a kite.
- Speech waits for the first touch, as browsers require, so a gentle “touch anywhere to begin” screen greets them after a restart.

## Privacy

Photos, voices, songs and settings are stored only in this browser (IndexedDB and localStorage). Nothing is uploaded. The only outside requests are Google Fonts and YouTube, for the built-in songs.

## Songs and lyrics

Built-in songs play through YouTube’s embedded player. Every video was checked, in September 2026, to allow embedding. Most come from the rights holders’ own channels: Saregama, Shemaroo, Rajshri, EMI Pakistan, Heera Gold and OSA. Each song lists a second video to fall back on. If both are unavailable, the player says “This one is resting” and moves on.

Words are only shown where they are in the public domain. That covers Allama Iqbal, Mirza Ghalib, Imam Ahmed Raza Khan, Imam al-Busiri, Sheikh Saadi and traditional verses. Film lyrics are not reproduced. The colouring pages and illustrations are original.

## Run it

It is plain HTML, CSS and JavaScript, with no build step and no dependencies.

```sh
npm start            # serves http://localhost:8080 (Node 18+)
```

It must be served over `http(s)`, not opened as a file. YouTube refuses to play embeds without a Referer (error 153), and the service worker and microphone need a secure origin (`localhost` counts).

**Deploy** to any static host:

- **GitHub Pages:** Settings → Pages → Deploy from a branch → `main`, `/ (root)`.
- **Netlify:** drag the folder onto app.netlify.com/drop.

**Install on a tablet:** open the site, then use *Add to Home Screen* (Safari) or *Install app* (Chrome). It then opens full screen and works offline, apart from the built-in songs.

## Develop

```
index.html            app shell
css/app.css           all styles (tokens at the top)
js/main.js            routes and start-up
js/core/              router, storage, i18n, speech, sound, motion, UI kit, art
js/lang/              en.js, hi.js, ur.js, mem.js
js/data/              song catalogue and lyrics, colouring pages, card pictures
js/screens/           one file per screen; care/ holds family settings
sw.js                 offline cache
tests/e2e.mjs         end-to-end browser test
scripts/              local server, language check, icon renderer
```

- `npm run check` confirms that every language pack has every key, with matching `{placeholders}`.
- `npm test` runs the browser test (`npm i -D playwright && npx playwright install chromium` first). It fakes YouTube and blocks other sites, so it runs offline.
- `npx eslint .` lints the code.

**To add a language,** copy `js/lang/en.js`, translate it, and register it in `js/core/i18n.js`. **To add a built-in song,** add it to `js/data/catalog.js` with two embeddable YouTube ids, then add any new files to the list in `sw.js`.

### Browser notes

- Chrome, Edge, Safari (iPadOS/iOS 15+) and Firefox are supported.
- On iPhone and iPad, a song may need one touch on the video itself the first time. The large play button pulses when that is the case.
- Which voices exist depends on the device. *Family settings → Sound & display* shows what is available and lets you pick one.

## Credits

Fonts: Poppins, Lora, Noto Sans Devanagari, Noto Nastaliq Urdu and Amiri, all under the SIL Open Font License. Memoni reference: Abdur Razzaq Thaplawala, *Memoni – A New Language is Born* (2005), made freely available by memonbooks.com.
