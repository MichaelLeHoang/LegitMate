# Privacy

LegitMate v0.1 checks only the active tab when the user opens the popup and
chooses to check the site.

Default behavior:

- The extension analyzes URL structure locally.
- Page checks run only after a user-triggered check.
- Backend reputation checks send only the normalized hostname/domain.
- Full URLs, browsing history, page contents, cookies, and form values are not
  sent to the backend by default.
- Report region is selected manually in settings. LegitMate does not request
  geolocation permission to infer the user's location.
- Scam reports are saved locally first, then submitted to LegitMate's central
  review queue when the API is available.
- Report region is stored with the report so reviewers can choose the right
  official destination later. The extension does not submit reports directly to
  government or third-party destinations.
- Low-risk or unknown reports remain in the central review queue at standard
  priority to reduce false reports.

The project should keep this privacy baseline unless a future feature has a
clear user-facing reason, explicit opt-in, and updated documentation.
