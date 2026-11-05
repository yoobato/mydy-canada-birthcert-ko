# Project instructions

- Commit completed changes on `main` after relevant validation. Push only when deployment is authorized; a push triggers publication.
- Never commit actual birth certificates, family information, user PDFs, credentials or test outputs. Use fictional data in tests and samples.
- Keep form inputs and PDF generation browser-local. Do not persist form data or add external translation APIs.
- Analytics accepts only the events, region codes and fixed campaign values defined in `src/analytics.js`. Never transmit form values, PDF contents or arbitrary URL parameters. Keep local development untracked.
- Registrar names are entered directly in Korean. Do not add automatic name suggestions.
- Keep public documentation concise and user-facing. Do not document service keys, measurement identifiers, account settings or internal operations. Never put secrets into client-side code; client-side service identifiers are publicly observable.
- Keep metadata consistent with supported regions. Regenerate and inspect the share image after changing its source.
- Advertising must remain in an opaque-origin sandboxed `data:` frame. Do not combine same-origin sandbox permissions with `srcdoc`, `blob:` or a same-origin URL. Intercept external advertising in browser tests and never pass user data to advertising.
- Preserve license texts and third-party notices.
