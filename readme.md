# Rider Maker
This is a utility for bands and technicians to quickly create technical riders for events and performances. A running instance of the site can be found at [this website](https://ridermaker.frostysound.fi).

## What does this do?
This backend program receives document descriptions from the frontend component and renders them into pdf documents. To test this out, go to the website linked above and click the `Load Demo` and `Render` buttons and see for yourself!

The frontend builds a document definition which instructs the backend on how the document should be built. The backend uses a headless chromium instance via Puppeteer to render a pdf from an EJS template. You can find the frontend in [this repository](https://github.com/KuuraParkkola/Rider-Maker-Frontend).
