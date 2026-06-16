# Privacy

LegitMate v0.1 checks only the active tab when the user opens the popup and
chooses to check the site.

Default behavior:

- The extension analyzes URL structure locally.
- Page checks run only after a user-triggered check.
- Backend reputation checks send only the normalized hostname/domain.
- Full URLs, browsing history, page contents, cookies, and form values are not
  sent to the backend by default.

The project should keep this privacy baseline unless a future feature has a
clear user-facing reason, explicit opt-in, and updated documentation.
