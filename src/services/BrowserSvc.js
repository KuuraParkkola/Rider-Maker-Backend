const puppeteer = require('puppeteer');


let is_running = false;
let browser;
let watchdog;

const watchdogSvc = async () => {
    if (!browser.isConnected) {
        console.log("Browser Watchdog: Browser has been disconnected. Relaunching...");
        browser = await browser.close();
        browser = await puppeteer.launch();
        console.log("Browser Watchdog: Browser relaunched");
    }
}

const startBrowser = async () => {
    browser = await puppeteer.launch({ headless: true });
    watchdog = setInterval(watchdogSvc, 1000);
    is_running = true;
    console.log("Browser Watchdog: Browser started");
}

const stopBrowser = async () => {
    clearInterval(watchdog);
    await browser.close();
    is_running = false;
    console.log("Browser Watchdog: Browser stopped");
}

const isRunning = () => {
    return is_running();
}


module.exports = {
    isRunning,
    startBrowser,
    stopBrowser,
}
