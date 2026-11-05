# GradPath Outreach

Status site for Alexandre Melo's Canada master's outreach (AI / CS / Eng, Alberta and Calgary first). The page reads `data/tracker.json` and does not invent sends, replies, or email bodies. Missing text is an em dash (—).

The interface is in Portuguese. Names, subjects, notes, and the shortlist stay in the language of the source files.

## Open locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:4731](http://127.0.0.1:4731).

`npm run check` validates the JSON and prints the status counts. `npm run build` writes a static `dist/` and copies `data/` into it. Serve that with `npm run preview` (same port). Opening `dist/index.html` as a `file://` URL will not load the JSON.

## Refresh the data

Edit `data/tracker.json`, save, and reload the browser. There is no codegen step. The dev server reads `data/` directly.

Accepted fields:

| Field | What the page does |
| --- | --- |
| `id`, `name`, `status` | Required. `uni` or `university` is the school. |
| `email`, `subject`, `role`, `channel`, `channelUrl` | Shown when present. |
| `sentAt` or `sent_at` | Date in the Enviado column. Hold and skip rows without it stay —. |
| `recorded_at` | Shown in the expanded row as Registrado, not as a send. |
| `notes` | Notes column. A `hook` is shown there only when notes are empty, labeled Gancho. |
| `chance` | Shown only when the field is present. It is not guessed per professor. |
| `region` | Used as written. Otherwise Calgary, Alberta, and Outras are read from the university name. Calgary is its own filter. |
| `priority` | Adds a Prioridade filter only when some row has the field. |
| `messageId` | Shown in the expanded row when present. |
| `body` | Expanded preview. If it is absent, the row links out with recipient and subject only. |
| `reply`, `repliedAt`, or status `replied` | Counted as Respostas. Until then the count stays 0. |

Status values the chips understand: `sent`, `form_needed`, `hold`, `skip`. Anything else still appears in the list.

`data/shortlist.md` is the chance legend (A written route, B exception or qualifying year, C long shot, plus SAIT / Athabasca pathways). `data/email_template.md` is reference copy, not a record of what was sent.

## Static hosting

`vite` uses a relative `base` (`./`), so `dist/` can be published on GitHub Pages or any static host without a backend.
