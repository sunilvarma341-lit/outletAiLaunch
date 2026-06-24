# Go-Live Backend

Tiny server with one job: when the director clicks "Go Live" on the launch
page, log it loudly wherever this server is running. That's the cue for
whoever has Play Console access to manually turn off Managed Publishing,
which is what actually makes the app go live.

There is no Google Play API integration here. We tried that — see the
postmortem below — and it can't do the one thing that matters, so it's been
removed entirely to keep this simple.

## Why no Play Developer API

If Managed Publishing is on (recommended — it stops an early Google review
approval from making the app live before you're ready), an approved release
sits in a "ready to publish" hold. We verified directly against a real
closed-testing release that:

- Calling `edits.commit` via the Android Publisher API does **not** clear
  that hold. It returns success, but Play Console still shows the change as
  pending and nothing shows up in Submission activity.
- The only thing that clears it is the manual **"Publish changes"** click in
  Play Console (Publishing overview), or turning Managed Publishing off,
  which prompts the same confirmation. There is no documented API for either.

So automating the actual publish isn't possible without a human in Play
Console anyway. This backend's only real job is making sure that human knows
the moment the director clicked the button.

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `GO_LIVE_TOKEN` — a long random string, shared only with the frontend's `/config` page
- `ALLOWED_ORIGIN` — the GitHub Pages origin the launch page is served from
- `PORT` — defaults to 4000

```bash
npm start
```

Sanity check: `curl http://localhost:4000/api/health` should return `{"ok":true}`.

## What happens on a click

`POST /api/go-live` (with the `x-go-live-token` header) prints a loud banner
to this server's console and appends a line to `backend/launch-log.txt`.
That's it — no external calls, nothing that can fail except the token check.

## Expose it to the internet for the event

```bash
ngrok http 4000
```

Copy the `https://....ngrok-free.app` URL it prints, then paste it into
`/config` on the deployed site as **Backend URL**, with **Go-Live Token**
matching `GO_LIVE_TOKEN` from `.env`.

## The actual launch sequence

1. Keep Managed Publishing **ON** for the app until the event, so an early
   Google review approval can't make it live ahead of time.
2. At the agreed moment: director clicks "Go Live" on the website (their
   ceremony — confirm dialog, rocket animation, "App is live"). At the same
   moment, whoever is watching this server's console/log sees the signal and
   clicks **"Publish changes"** in Play Console.
3. The app goes live for real within seconds of that Console click.

It's a two-person, two-action launch under the hood. The website makes it
feel like one button to the director; it isn't, and there's no way to make
it actually be one button without Google exposing an API for the Managed
Publishing gate.

## Leftover files

`backend/service-account.json` (if present) and any `PACKAGE_NAME`/`TRACK`
env vars from the earlier API-integration attempt are no longer used by
anything. Safe to delete the key file and revoke the service account in
Google Cloud Console if you don't expect to need it again.
