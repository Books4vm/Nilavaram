# Nilavaram Ongoing Development Checklist

This checklist is the working operating guide for the Nilavaram project. Keep it current as coding progresses. Use it as the live checklist for each step, not as a one-time setup note.

## 1) Source-of-truth and environment
- [ ] Keep the authoritative code in: C:\Users\theso\Documents\nn\Nilavaram
- [ ] Treat VS Code as the primary place for editing source files
- [ ] Never edit the app code only in Google Apps Script browser editor when the local project is active
- [ ] Keep external backup copies on E:\nn\Nilavaram and E:\nn\Nilavaram Data

## 2) Clasp setup and sync workflow
- [ ] Confirm Node.js is installed
- [ ] Install clasp if needed: `npm install -g @google/clasp`
- [ ] Log in to Google: `clasp login`
- [ ] In the project folder, verify the Apps Script project is linked: `clasp login --creds` or `clasp clone <scriptId>` if needed
- [ ] Use the project folder as the working copy for source files
- [ ] Before testing, run: `clasp push`
- [ ] After pushing, test in Google Apps Script using the `/dev` deployment
- [ ] After successful testing, update production deployment only when needed
- [ ] Re-run `clasp push` after any significant source change before testing
- [ ] Keep Apps Script code and VS Code code synchronized

## 3) GitHub push flow
- [ ] Check status: `git status`
- [ ] Review the working changes before commit
- [ ] Add files: `git add .`
- [ ] Commit with a clear message: `git commit -m "Describe update"`
- [ ] Push to GitHub: `git push origin main`
- [ ] Confirm the pushed code is the current working version
- [ ] Use GitHub to preserve history, but do not rely on GitHub to run the app
- [ ] Keep commit messages specific to what changed

## 4) Firestore structure and data rules
- [ ] Use Firestore for vital operational data: menus, users, permissions, help, alerts, audit, tasks
- [ ] Validate each collection/document against the repo-approved design
- [ ] Store metadata and links for documents in Firestore, not the full file payload
- [ ] Keep file content in OneDrive or appropriate storage, not in Firestore
- [ ] Do not store passwords, OAuth tokens, private keys, or service-account secrets in Firestore
- [ ] Record credential details only as name, purpose, owner, location, and status
- [ ] Confirm business and access rules when adding or editing collections
- [ ] Preserve audit records when making important changes

## 5) OneDrive file and document storage
- [ ] Store large files in OneDrive or Google Drive, per project guidance
- [ ] Use the OneDrive sync source: E:\nn\Nilavaram Data\04 OneDrive Sync
- [ ] Keep the local OneDrive view at: C:\Users\theso\OneDrive
- [ ] Save PDFs, scans, attachments, and large images in OneDrive storage
- [ ] Store document metadata and links in Firestore
- [ ] Keep file names consistent and easy to trace to the project record
- [ ] Avoid downloading the whole archive permanently on the laptop

## 6) Backup routine
- [ ] Keep an external HDD copy at E:\ (My Passport)
- [ ] Maintain code backup at E:\nn\Nilavaram
- [ ] Maintain data backup at E:\nn\Nilavaram Data
- [ ] Archive old items in: E:\nn\Nilavaram Data\99 Archive
- [ ] Back up the project after meaningful code changes
- [ ] Back up Firestore-relevant data and OneDrive file changes as part of the working routine
- [ ] Treat the E: project folder as a backup copy only; do not edit the authoritative project there

## 7) Working progression checklist for each coding step
- [ ] Clarify the task and the required outcome
- [ ] Read the relevant repo rule files before making code changes
- [ ] Identify the module, script, and Firestore structure affected
- [ ] Implement the smallest safe change
- [ ] Save in VS Code
- [ ] Push to Apps Script with clasp
- [ ] Test the behavior in /dev
- [ ] Review if Firestore or OneDrive data needs updates
- [ ] Commit the working code to GitHub
- [ ] Document any new rules or dependencies in the relevant notes
- [ ] Update this checklist if the process changes

## 8) Current project status
- [ ] Confirm the main working copy path is correct
- [ ] Confirm Clasp is connected to the Apps Script project
- [ ] Confirm GitHub remote is configured
- [ ] Confirm OneDrive file sync location is in use
- [ ] Confirm external backup path exists and is maintained
- [ ] Confirm Firestore data handling matches the project rules

## 9) Ongoing reminder
Keep this checklist active throughout development. When a step is finished, mark it complete and continue with the next small step. This is not a one-time setup; it is the live operational checklist for the Nilavaram project.
