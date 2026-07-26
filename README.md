# Nilavaram

Nilavaram is an invitation-only, Firestore-driven administration application
built with Google Apps Script.

The approved tentative menu hierarchy and the purpose of each section are
documented in `NAVIGATION.md`.

The agreed Project Start defines Nilavaram as a private, long-term Personal,
Family and Business Information System. The UI records development intentions
that may be completed in any practical sequence.

Admin development and credential-location notes are maintained in `notes_ref1`
and `notes_ref2` and displayed safely under System → Project Development →
Admin Technical Guide. Secret credential values must never be stored there.

## Current foundation

- Source code is maintained in VS Code and synchronized with Apps Script using
  `clasp`.
- Dashboard navigation is stored in Firestore rather than hardcoded in
  `Navigation.js`.
- Users sign in with a Google account.
- An Admin invites users and assigns one of five simple roles.
- Important access changes are written to an audit log.

## Access roles

| Role | Meaning |
| --- | --- |
| Admin | Full application access, including managing users and roles |
| Editor | Can read and change approved business data |
| Reader | Can read all approved business data but cannot change it |
| Ltd | Can read only specifically assigned modules |
| Disabled | Cannot enter the application |

GitHub and Apps Script permissions control who may edit the program code. They
are deliberately separate from Nilavaram application roles.

## Firestore collections

### `menus`

One document for each navigation heading.

Example: `menus/security`

```text
label: "Security"
order: 20
enabled: true
```

### `menuItems`

One document for each clickable dashboard item.

Example: `menuItems/users`

```text
menuId: "security"
label: "Users"
moduleId: "users"
order: 10
enabled: true
roles: ["admin"]
```

The `menuId` connects a button to its heading. The `roles` list controls which
roles may see the button.

Top-level menu documents use `type: "group"` for expandable sections and
`type: "link"` for direct destinations such as Dashboard and Help. Closed
groups show a down arrow; open groups show an up arrow. The current top-level
order is Dashboard, Businesses, Security, Transactions, Accounting, Customers
& Vendors, Documents, Tasks, Reports, System and Help.

## Display preferences

The default dashboard appearance uses a sky-blue background, black text and
large type. Each user can select Sky blue, Dark or Device setting and can select
Large, Standard or Small text. The browser remembers these choices locally.
The interface uses semantic HTML, responsive CSS, accessible focus indicators
and scalable inline SVG graphics.

The header records when the current page view started, displays the live
Pacific Time and provides a button for copying the session details. Application
version information is displayed under System Status instead of the header.

### `users`

One document for each invited Google account. The normalized email address is
the document ID.

Example: `users/employee@gmail.com`

```text
email: "employee@gmail.com"
displayName: "Example Employee"
role: "editor"
status: "invited"
allowedModules: []
```

For a `ltd` user, `allowedModules` contains module IDs such as `files`.

### `auditLog`

Records setup, invitations, accepted invitations and role changes. Each record
contains the actor, target, action, details and date.

### `helpArticles`, `helpHistory` and `alerts`

`helpArticles` stores the current editable Help content. Every save copies the
previous version to `helpHistory`, writes an `auditLog` record and creates an
unread `alerts` record for every active Admin. A correction reason is optional;
blank reasons are stored as `No reason provided`.

### `developmentTasks`

Stores visible project-development intentions, assignments and due dates.
Tasks may be completed in a flexible sequence. The Private Decision Journal is
due `2026-08-10`; Safe Automated Backup is due `2026-08-16`.

### `reminders`

Stores private or selectively shared reminders. The initial trust-tax filing
review asks the owner to confirm the trust, tax years, required form and actual
deadline. Its five planned email offsets are 30, 14, 7, 3 and 1 days before the
confirmed deadline; email delivery remains disabled until those facts are
entered.

Help articles are stored as Markdown text and rendered safely by the dashboard.
Raw user-entered HTML is not executed.

## First-time setup

The two initial Admins are defined in `Setup.js`:

```text
mangai8100@gmail.com
vm8100@gmail.com
```

After pushing the source to Apps Script, select and run:

```text
setupNilavaram
```

The first run asks for Google authorization. The function creates or updates:

- four menu documents;
- twelve menu-item documents;
- both initial active Admins;
- an initial audit record.

The function is repeatable. It uses fixed document IDs, so running it again
updates those initial records instead of creating duplicates.

As a first-run safeguard, opening Nilavaram with either declared initial Admin
also runs this setup automatically when that Admin's Firestore user record does
not yet exist. This prevents the initial Admin from being locked out merely
because the manual setup function was not run.

The setup function creates or updates only the two declared initial Admins. It
does not change, disable or delete any other user account.

## Development and testing

Push the current source:

```text
clasp push
```

Use **Deploy → Test deployments** in Apps Script and bookmark the web-app URL
ending in `/dev`. After another `clasp push`, refresh that page to test the
latest code. A production `/exec` deployment only needs to be updated after the
test succeeds.

## Inviting a user

1. Sign in as an Admin.
2. Open **Security → Users**.
3. Enter one Gmail address and optional name.
4. Select `Admin`, `Editor`, `Reader`, `Ltd`, or `Disabled`.
5. For `Ltd`, enter allowed module IDs separated by commas.
6. Select **Save user**.

The Users table includes an **Edit** button. It reloads an existing user into
the same form so an Admin can change that person's role or Ltd modules without
changing program code.

Example:

```text
Gmail: reader@gmail.com
Role: Ltd
Ltd modules: files, reports
```

This creates an invitation record; it does not give GitHub or Apps Script code
access, and it does not send an email automatically. When general user access is
enabled later, the invited person opens the Nilavaram URL using the matching
Google account and selects **Accept invitation**.

## Security rules implemented in application code

- Only an active invited user can receive navigation.
- Only an Admin can list users or change access.
- A disabled user is denied.
- A Ltd user sees only assigned modules.
- The last active Admin cannot be downgraded or disabled.
- User invitations and access changes are audited.

## Important deployment limitation

The current manifest restricts the web app to `MYSELF`. Keep this setting while
the owner tests the new foundation. Before invited users can enter, the
deployment access and Google identity behavior must be configured and tested.
Do not broaden access until that authentication step is complete.

## Main files

| File | Responsibility |
| --- | --- |
| `Code.js` | Web-app entry point |
| `Dashboard.html` | Sidebar, content panel and Users form |
| `Firestore.js` | Firestore REST connection and data conversion |
| `Navigation.js` | Reads menus and filters them for the current user |
| `Users.js` | Invitations, roles, access checks and audit records |
| `Setup.js` | Repeatable creation of initial Firestore records |
| `UI.js` | Dashboard information and temporary module responses |

## Safe development sequence

Test locally owned access first. Then verify the first Admin, add one test
Editor, and add one test Ltd reader. Only after those tests succeed should the
web app be opened to invited accounts.
