# Nilavaram

Nilavaram is an invitation-only, Firestore-driven administration application
built with Google Apps Script.

The approved tentative menu hierarchy and the purpose of each section are
documented in `NAVIGATION.md`.

The approved transaction, audit, Firestore, OneDrive, SharePoint and Microsoft
Graph responsibilities are locked in `INTEGRATION_DECISIONS.md`.

The permanent accounting identity, journal, posting, reconciliation,
correction and user-safety rules are locked in `ACCOUNTING_OPERATING_RULES.md`.

The agreed Project Start defines Nilavaram as a private, long-term Personal,
Family and Business Information System. The UI records development intentions
that may be completed in any practical sequence.

Help → About and Version History reads the GitHub `main` commit history. It
shows only code changes that were successfully pushed, including the commit
date, message, short commit ID and GitHub details link.

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

The dynamic-accounting development program is assigned to
`mangai8100@gmail.com` from `2026-08-02` through `2026-08-11`. It covers the
live Dashboard, family record structure, continuous input, double-entry
controls, reconciliation, account coding, payables and family reports.

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

## Editing popup guidance and navigation

Static popup guidance is source-controlled in one menu-named HTML file per
menu item. `ModuleGuideSources.html` is only the registry that includes the
individual files. Examples:

- `LifeTimeline.html` controls Life Timeline.
- `BusinessRecords.html` controls Business Records.
- `PermanentRecords.html` controls the compatibility guide for Permanent
  Records. Its stable internal compatibility ID remains
  `identity-immigration`.
- `AccountAddNew.html` controls Add New.
- `InputPayment.html` controls Payment.

The complete menu-to-file mapping is in `MenuFileCatalog.html`.

The guide file contains the title supplied by the menu, purpose, source,
display description, steps, learning points, Do, Do not and current status.
User-entered HTML is not used; the popup renders these values as escaped text.
Do not place passwords, tokens, private keys or uploaded document contents in
the source file.

To publish a source edit safely:

1. Edit the HTML file whose name matches the menu item in
   `MenuFileCatalog.html`.
2. Save the file and review the diff.
3. Run the focused syntax checks described below.
4. Run `clasp push`.
5. Open **Deploy → Test deployments** and use the `/dev` URL.
6. Open the relevant left-menu item and confirm the popup.
7. Test the affected role and selected client/business context.
8. Update the production deployment only after `/dev` testing succeeds.

The live application does not fetch executable or rendered popup HTML from
OneDrive. OneDrive remains the approved storage location for uploaded source
documents and evidence. Firestore retains access controls, menu records,
document metadata, protected links, hashes and audit history.

The About and Version History popup reads pushed commits from the public
GitHub API. If GitHub returns HTTP 403 because its unauthenticated rate limit
has been reached, the popup reports the cause explicitly. An Admin may add a
GitHub token as the Apps Script Project Property `GITHUB_TOKEN`; the token is
read at runtime and must never be placed in source code, documentation or
Firestore. A rejected or exhausted configured token is also reported
explicitly.

The source of truth for left-menu structure is `Setup.js`, specifically the
`menus` and `menuItems` definitions in `setupNavigation_()`. To change a menu
item in VS Code:

1. Edit its `label`, `description`, `order`, `parentId`, `level`, `roles`,
   `enabled` or `moduleId` in `Setup.js`.
2. Keep the existing stable `id` and `moduleId` unless a deliberate migration
   is required.
3. Use a new `order` value to move an item within its parent.
4. Change `parentId` and `level` to move it to another group or submenu.
5. Remove an item from the current source definition only after adding an
   explicit disabled retirement record in the setup/reset path; Firestore
   rewrites do not delete stale documents automatically.
6. Increase `NILAVARAM_NAVIGATION_VERSION`.
7. Push with `clasp push`.
8. Run the owner-only `resetNavigationOnly()` or
   `rewriteNavigationInFirestore()` in Apps Script, then reload `/dev`.

The existing owner-only Developer Console can inspect and save Firestore
`menus` and `menuItems` records for controlled testing, but those direct
Firestore edits are not the VS Code source of truth. If a change is kept,
copy it back into `Setup.js`, push again and run the navigation rewrite.

The current visible menu destinations have individual menu-named HTML files.
Files with `sourceReady: false` are editable templates and do not replace
existing module renderers until their text is reviewed. To activate one,
complete its module-specific content and change `sourceReady` to `true`.

`MenuFileCatalog.html` lists every current `Setup.js` menu item, its visible
label, stable module ID and source filename. The cleaned definition contains
80 unique menu-item rows and 71 distinct popup modules. The remaining
nine-row difference is intentional shared-module routing, not stale duplicate
menu items.

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
- The workspace displays identity only after its server-side session check
  succeeds. If that session has expired, the stale browser key is cleared and
  the user is returned to the sign-in page.
- Every user-facing popup must include self-service instructions describing its
  purpose, displayed data, actions, permissions, confidentiality rules and
  save/revoke results. Users must be able to learn the basic workflow without
  training or a support team.
- Returning users receive a server-validated default client, business and
  accounting year. First-time users must select their context; the Change
  client / business popup can replace the saved default at any time.
- The main workspace header includes Refresh / Update. It reloads the current
  Apps Script page so newly pushed code and current server data can be loaded.
  It does not sign the user out, clear the session, or delete the saved
  workspace context.

## Important deployment limitation

The current manifest restricts the web app to `MYSELF`. Keep this setting while
the owner tests the new foundation. Before invited users can enter, the
deployment access and Google identity behavior must be configured and tested.
Do not broaden access until that authentication step is complete.

## Microsoft Graph connection

Nilavaram's approved primary OneDrive repository is
`vmurugan@hotmail.com`. Microsoft account storage showed 0.2 GB used out of
1 TB on 2026-07-28, leaving approximately 999.8 GB available.
`thesolarcpa@outlook.com` is excluded from document storage.
The owner has maintained the Microsoft 365 Family subscription covering all six
family accounts for approximately three to four years and intends to continue
it.

Before **System → Connections → Connect OneDrive** can be used, register a
Microsoft Entra web application that accepts personal Microsoft accounts. Add
this exact Nilavaram production address as its **Web** redirect URI:

```text
https://script.google.com/macros/s/AKfycbxMMqgLL6xmJp__dI4vDHj0zZ_6ZyZsb_-KsspdNU99WXW1ZJrRzJTaVObTJ8C2s-3Q/exec
```

Add these values under **Apps Script → Project Settings → Script Properties**:

```text
MICROSOFT_CLIENT_ID
MICROSOFT_CLIENT_SECRET
MICROSOFT_REDIRECT_URI
```

Set `MICROSOFT_REDIRECT_URI` to the exact address above. It must exactly match
the redirect URI entered in Microsoft Entra. Never store the client secret in
this repository, Firestore, the dashboard or project notes.

The initial delegated Microsoft Graph permissions are:

```text
User.Read
Files.ReadWrite
offline_access
```

After authorization, Nilavaram verifies that the signed-in Microsoft identity
is exactly `vmurugan@hotmail.com`, reads its live OneDrive quota, and stores
only the non-secret drive identity and quota summary in Firestore. Access and
refresh tokens remain in Apps Script Properties.

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
