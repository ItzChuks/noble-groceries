# Noble's Groceries – PocketBase setup

Tested with PocketBase **v0.40.5** and the JS SDK **0.26.8** (loaded from a CDN in each page).
Needs PocketBase v0.23 or newer.

## 1. Start PocketBase

1. Download PocketBase and unzip it.
2. Copy the two folders from this project's `pocketbase/` folder (`pb_migrations` and `pb_hooks`) next to the `pocketbase` executable.
3. Run `./pocketbase serve`. On first start the migration creates everything for you:
   - extra fields on **users**: `country`, `phone`, `role` (user / admin)
   - collections **plans**, **subscriptions**, **payments**, **payouts**, with all access rules
4. Open http://127.0.0.1:8090/_/ and create the superuser.

(Alternative: leave the folders where they are and run
`./pocketbase serve --hooksDir=/path/to/pocketbase/pb_hooks --migrationsDir=/path/to/pocketbase/pb_migrations`.)

## 2. Point the site at it

- `app.js`, top: set `PB_URL` to your PocketBase address (use `https://` once deployed). `USE_MOCK` is `false`; set it to `true` only for the offline demo.
- Serve this folder (`npx serve .`, VS Code Live Server, any static host) and open `auth.html`.

## 3. Make your first admin

Sign up on `auth.html`, then in the PocketBase panel open **users**, edit your user and set `role` to `admin`. After that you can promote others from Admin > Users. Log in again and you land on the admin page.

Then open Admin > Plans and click **Add default plans**.

## What the server enforces (`pb_hooks/noble.pb.js`)

Browser code can be edited by anyone, so the rules that matter are checked on the server:

- **New accounts** are always `role = user`, even if the request says otherwise.
- **Joining a plan**: the plan must be active; the subscription always starts as `active`.
- **Payments**: the server recomputes the penalty, instalments covered and late count from its own clock and the member's history. A wrong amount (missing penalty, not a whole number of instalments, plan already fully paid) is rejected, and any `penalty` / `installments` / `late_count` / `status` sent by the browser is overwritten.
- **Payouts**: only for a fully saved and admin-confirmed plan, one open request per plan.
- Only admins can confirm or reject payments and payouts, edit plans, or change roles (collection rules).

**Keep two files in sync:** the payment rules exist in `app.js` (`RULES`, for display) and in `pocketbase/pb_hooks/rules.js` (enforcement). If you change the noon cut-off, multiplier, weekly day or monthly grace day, change both.

## Notes

- All deadlines use Lagos time (UTC+1), whatever the device clock says. Daily: before 12:00 noon; weekly: Friday 12:00 noon; monthly: end of the 2nd of the next month. Late instalments cost double and penalties never count towards savings or payout.
- Users' emails are visible to admins because sign-up sets `emailVisibility`.
- In production, run PocketBase behind HTTPS and, in Settings > Application, restrict allowed origins if you want only your site to call it.
- The `created` timestamp of a subscription is the "joined" time the first deadline is based on, so don't edit it.
