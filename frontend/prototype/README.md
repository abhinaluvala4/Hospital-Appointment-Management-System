# Carepoint interactive prototype

This is a self-contained browser prototype. It needs no npm packages, database, or backend.

## Open it

Open `index.html` in a current desktop or mobile browser. If your browser blocks local files, run a static server from the repository root:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000/frontend/prototype/`.

## Demo sign-ins

| Role | Email | Password |
| --- | --- | --- |
| Patient | `patient@carepoint.demo` | `patient123` |
| Doctor | `avery@carepoint.demo` | `doctor123` |
| Administrator | `admin@carepoint.demo` | `admin123` |

The sign-in page has one-click buttons for each demo role. You can also register a patient account.

## Try the workflows

- **Patient:** Search the doctor directory, book an open time, review appointments, reschedule or cancel more than 24 hours before the visit, and view records.
- **Doctor:** Publish and remove availability, review assigned appointments, complete a visit, and save a visit note and optional prescription.
- **Administrator:** Review all appointments and accounts, deactivate/reactivate accounts, edit doctor profiles, and add doctor accounts.

Data is stored in this browser's `localStorage`. Use **Reset demo data** in the sidebar to return to the original sample accounts and appointments. Demo passwords are intentionally simple, and local storage is not secure. Use only fictional data; this prototype is not connected to the Spring API and is not suitable for real patient information.
