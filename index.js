const fs = require('fs/promises');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const Koa = require('koa');
const parser = require('koa-bodyparser');
const cors = require("@koa/cors");
const Router = require('koa-router');
const { prepareDocumentDefinition } = require('./src/utility/docDefChecks');
const { loadResources } = require('./src/utility/resourceLoader');


let browser;
let resources;

const app = new Koa();
const router = new Router();

router.post('/renderpdf', async (ctx) => {
    const documentDef = prepareDocumentDefinition(ctx.request.body);
    const renderedTemplate = await ejs.renderFile("./src/templates/template.ejs", { ...documentDef, resources });

    const browserPage = await browser.newPage();
    await browserPage.setContent(renderedTemplate);
    const pdf = await browserPage.pdf({ format: 'a4', printBackground: true });
    await browserPage.close();

    ctx.attachment('output.pdf');
    ctx.type = "application/pdf";
    ctx.body = pdf;
});

const init = async () => {
    browser = await puppeteer.launch();
    resources = await loadResources();

    const onExit = () => {
        browser.close();
    }

    process.on("SIGINT", onExit);
    process.on("SIGTERM", onExit);
}

init();

app
    .use(parser())
    .use(cors())
    .use(router.routes())
    .listen(8000, () => {
        console.log("Service active");
    });
