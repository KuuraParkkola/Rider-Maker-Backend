const ejs = require('ejs');
const Koa = require('koa');
const parser = require('koa-bodyparser');
const cors = require("@koa/cors");
const Router = require('koa-router');
const { prepareDocumentDefinition } = require('./src/utility/docDefChecks');
const { startBrowser, stopBrowser } = require('./src/services/BrowserSvc');
const { loadResources, getResources } = require('./src/services/ResourceSvc');


const app = new Koa();
const router = new Router();

const init = async () => {
    await startBrowser();
    await loadResources();

    const onExit = async () => {
        await stopBrowser();
        console.log("Exit handlers completed.");
    }

    process.on("SIGINT", onExit);
    process.on("SIGTERM", onExit);
}

router.post('/renderpdf', async (ctx) => {
    const documentDef = prepareDocumentDefinition(ctx.request.body);
    const renderedTemplate = await ejs.renderFile("./src/templates/template.ejs", { ...documentDef, resources: getResources() });

    const browserPage = await browser.newPage();
    await browserPage.setContent(renderedTemplate);
    const pdf = await browserPage.pdf({ format: 'a4', printBackground: true });
    await browserPage.close();

    ctx.attachment('output.pdf');
    ctx.type = "application/pdf";
    ctx.body = pdf;
});

init();

app
    .use(parser())
    .use(cors())
    .use(router.routes())
    .listen(8000, () => {
        console.log("Service active");
    });
