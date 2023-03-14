const fs = require('fs/promises');
const config = require('../config');


let resources = {};

const loadResources = async () => {
    const social_icons = (await fs.readdir(config.paths.social_icons)).filter(icon => icon.endsWith('.png'));
    const social_icons_data = await Promise.all(social_icons.map(icon => fs.readFile(`${config.paths.social_icons}/${icon}`, 'base64')));

    resources = {
        social_icons: Object.fromEntries(social_icons.map((icon, idx) => [icon.slice(0, -4), social_icons_data[idx]])),
    }
}

const getResources = () => resources;

module.exports = {
    loadResources,
    getResources
}
