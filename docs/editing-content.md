# Editing the Kreative Studio Lab site

Everything on the site is edited in WordPress at
`https://website.taufikandrian.my.id/kreative-lab/wp-admin/`. Press **Update** and
the site rebuilds itself. Changes are live in about two minutes. You can follow the
build in GitHub → **Actions**.

## Where things are

| In WordPress | What it controls |
|---|---|
| **Site Pages → Global** | Wordmark, menu labels, site title and description (search results, browser tab) |
| **Site Pages → Home** | One tab per section: Hero (headline, marquee, showreel), Manifesto, Who we are (four cards), Two labs, Archive preview, Clients heading, Closing |
| **Site Pages → About / Product Lab / Creative Lab / Archive / Contact** | That page's headings, text, images, capability lists and reel |
| **Site Pages → Page not found (404)** | The error page |
| **Archive Projects** | Case studies: text, scope of work, opener image, gallery (16 slots), reel, and "Show on homepage" |
| **Client Logos** | Who appears on the logo wall, in what order, with what artwork |
| **Site Settings** | Phone numbers, email, address, and the image shown when the site is shared on social media |

## The rules

- **An empty field shows the current content.** Clearing a headline brings back the
  original; it never leaves a gap. The same goes for images and videos: leave one empty
  to keep the artwork the site has today.
- **Red words:** in headlines, wrap words in stars. `PRODUCT *LAB*` shows LAB in red.
- **Wide letters:** one or two round letters in each headline (O, S, C, G, R) are set in a
  wide, thin face automatically. There is nothing to type; retyping a headline picks new
  letters. In the "Two labs" subheading, starred words get a red highlighter stroke instead.
- **Phone dock (Global → Header & footer):** the three labels on the floating bar phones
  see at the bottom of the screen (Menu, the call to action, Work) and the menu's Close.
- **Statement photos (Home → Manifesto):** four small square photos set inside the
  opening sentence. Any photo works; the site crops it square and loads a small copy.
- **About cards:** the pillar words come from About → Pillars; their photographs are the
  ones in Home → Who we are, so a picture changed there changes on both pages.
- **Case studies:** each study's **Scope of work** list shows as tags on its page. Left
  empty, the list from the studio deck is used. Its **Hero image** is the big photo; left
  empty, the photograph from the deck is used. The small labels on every case study page
  (Industry, Year, Lab, Scope of work) are under **Site Pages → Archive**.
- **Contact page:** shows the email and phone numbers from **Site Settings** and nothing
  else, one per row, each number with a WhatsApp button. The small labels (Email, Phone,
  WhatsApp) are under **Site Pages → Contact**.
- **Card lines (Home → Who we are):** each card has a word and a one-line description
  under it.
- **Lists are one item per line.**
  - *Manifesto steps:* the large words, then `|`, then the rest:
    `It begins | with understanding.`
  - *Capabilities:* a line ending in a colon starts a group, and the lines under it are
    its items:
    ```
    Print & Packaging:
    Premium Gift Sets
    Publications
    ```
- **Photographs:** upload full size. The site makes smaller copies itself.
- **Videos:** MP4 only, exported at the size they should play at. The site does not
  shrink videos, and a 40 MB file makes a slow page.
- **Reels need a poster:** the first frame, as an image of the same shape. Without one,
  the reel is not shown, and the build stops to tell you why.
- **Client logos:** upload a **black logo on a transparent background** (PNG or SVG). The
  site colours it itself and turns it red on hover, so a logo with its own white box shows
  as a solid rectangle. A client with no logo uploaded shows the logo cut from the deck,
  or failing that, its name in the display type.
- **Homepage archive preview:** tick **Show on homepage** on up to three case studies.
  If fewer than three are ticked, the newest fill the remaining places.
- **Removing something:** move it to the trash, or switch it to Draft. It disappears from
  the site on the next build.

## When a build fails

The site keeps showing the last good version. Nothing is ever half-published. Open
GitHub → **Actions**, click the red run, then the red step. The build names the problem
in plain words, for example "archive number 07 is used by both …" or "a reel video needs
a reel poster image". Fix it in WordPress and press **Update** again.
