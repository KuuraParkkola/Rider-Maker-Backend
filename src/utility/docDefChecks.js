const pagePresets = require("./pagePresets");
const labels = require('./documentLabels');


const ensureValidLanguage = (lang) => {
    const language = String(lang);
    if (['fi', 'en'].includes(language)) {
        return language;
    } else {
        return 'fi'
    }
}

const validatePageSetup = (pageSetup) => {
    const page = pageSetup ?? {};

    let pageSize = String(page.size);
    if (![ 'a4' ].includes(pageSize)) {
        pageSize = 'a4';
    }

    const validateMargin = (margin) => {
        let strMargin = String(margin);
        if (!strMargin.endsWith('mm')) {
            strMargin = `${strMargin}mm`;
        }
        return /^\d+mm$/.test(strMargin) ? strMargin : '10mm';
    }

    return {
        size: pageSize,
        ...pagePresets.loadPreset(pageSize),
        margins: {
            top: validateMargin(page.margin_top),
            bottom: validateMargin(page.margin_bottom),
            side: validateMargin(page.margin_side),
        }
    }
}

const validateSection = (validator) => (section) => {
    try {
        return {
            title: String(section.title),
            description: String(section.description),
            section: section.section,
            content: validator(section.content),
        }
    } catch (err) {
        return undefined;
    }
}

const validateBandOverview = (section_content) => {
    const validateRow = (row) => {
        try {
            return {
                name: String(row.name),
                instrument: String(row.instrument),
                channels: /^\d+$/.test(row.channels) ? row.channels : '',
                notes: String(row.notes),
            }
        } catch (err) {
            return undefined;
        }
    }

    return {
        rows: (section_content?.rows, []).map( validateRow ).filter( row => row !== undefined )
    };
}

const validateChannelList = (section_content) => {
    const validateRow = (row) => {
        try {
            return {
                instrument: String(row.instrument),
                input: String(row.input),
                phantom: Boolean(row.phantom),
                stand: String(row.stand),
                is_highlighted: Boolean(row.is_highlighted),
            }
        } catch (err) {
            return undefined;
        }
    }

    return {
        rows: (section_content?.rows ?? []).map( validateRow ).filter(row => row !== undefined)
    };
}

const validateContacts = (section_content) => {
    const validateContact = (contact) => {
        try {
            return {
                name: String(contact.name),
                role: String(contact.role),
                phone: String(contact.phone),
                email: String(contact.email),
            }
        } catch (err) {
            return undefined;
        }
    }

    return {
        common_contact: String(section_content?.common_contact),
        named_contacts: (section_content?.named_contacts ?? []).map( validateContact ).filter(contact => contact !== undefined)
    };
}

const validateEquipmentList = (section_content) => {
    const validateRow = (row) => {
        try {
            return {
                item: String(row.item),
                count: /\d*/.test(String(row.count)) ? String(row.count) : "",
                is_group: Boolean(row.is_group),
                is_highlighted: Boolean(row.is_highlighted),
            }
        } catch (err) {
            return undefined;
        }
    }
    
    return {
        rows: (section_content?.rows ?? []).map( validateRow ).filter(row => row !== undefined)
    };
}

const validateMembers = (section_content) => {
    const validateMember = (member) => {
        try {
            return {
                name: String(member.name),
                roles: String(member.roles),
            }
        } catch (err) {
            return undefined;
        }
    }

    return {
        members: (section_content?.members ?? []).map( validateMember ).filter(member => member !== undefined)
    };
}

const validateMonitoring = (section_content) => {
    const validateRow = (row) => {
        try {
            return {
                players: String(row.players),
                mix: String(row.mix),
            }
        } catch (err) {
            return undefined;
        }
    }

    return {
        rows: (section_content?.rows ?? []).map( validateRow ).filter(row => row !== undefined)
    };
}

const validateRequirements = (section_content) => {
    const validateRequirement = (requirement) => {
        try {
            return {
                title: String(requirement.title),
                content: String(requirement.content)
            }
        } catch (err) {
            return undefined;
        }
    }

    return {
        requirements: (section_content?.requirements ?? []).map( validateRequirement ).filter(requirement => requirement !== undefined)
    };
}

const validateStagePlan = (section_content) => {
    try {
        return {
            stage_plan: /data:image\/\w{1,4};base64,[A-Za-z0-9+/]+={0,2}/.test(String(section_content?.stage_plan)) ? String(section_content?.stage_plan) : ""
        };
    } catch (err) {
        return undefined;
    }
}

const validateTitleArea = (section_content) => {
    const validateSocial = (social) => {
        const service = String(social.service);
        if ([ 'facebook', 'instagram', 'snapchat', 'soundcloud', 'spotify', 'tiktok', 'twitter', 'youtube' ].includes(service)) {
            try {
                return {
                    service,
                    tag: String(social.tag),
                }
            } catch (err) {
               return undefined; 
            }
        } else {
            return undefined;
        }
    }

    return {
        header: String(section_content?.header),
        band_title: String(section_content?.band_title),
        socials: (section_content?.socials ?? []).map( validateSocial ).filter(social => social)
    };
}

const validateDocument = (docDef) => {
    const { document, content } = docDef;

    const validateContent = (section) => {
        switch(section.section) {
            case 'band_overview':
                return validateSection(validateBandOverview)(section);
            case 'channel_list':
                return validateSection(validateChannelList)(section);
            case 'contacts':
                return validateSection(validateContacts)(section);
            case 'equipment_list':
                return validateSection(validateEquipmentList)(section);
            case 'members':
                return validateSection(validateMembers)(section);
            case 'monitoring':
                return validateSection(validateMonitoring)(section);
            case 'requirements':
                return validateSection(validateRequirements)(section);
            case 'stage_plan':
                return validateSection(validateStagePlan)(section);
            case 'title_section':
                return validateSection(validateTitleArea)(section);
            case 'page_break':
                return { section: 'page_break' };
            default:
                return undefined;
        }
    }

    return {
        document: {
            title: String(document?.title),
            band: String(document?.band),
            revision: String(document?.revision),
            footer_text: String(document?.footer_text),
            language: ensureValidLanguage(document?.language),
            page: validatePageSetup(document?.page),
        },
        content: content.map((section) => validateContent(section)).filter((section) => section),
    };
}

const convertFields = (docDef) => {
    const paginate = (content) => {
        let output = [];
        let page = [];

        content.forEach((element) => {
            if (element.section === 'page_break') {
                output = [ ...output, page ];
                page = [];
            } else {
                page = [ ...page, element ];
            }
        });

        return [ ...output, page ];
    }

    const validDocDef = validateDocument(docDef);
    const document = validDocDef.document;

    return {
        document,
        content: paginate(validDocDef.content),
        labels: Object.fromEntries(Object.entries(labels).map(([key, value]) => [key, value[document.language || 'fi']])),
    };
}

const prepareDocumentDefinition = (docDef) => {
    return convertFields(docDef);
}


module.exports = {
    validateDocument,
    convertFields,
    prepareDocumentDefinition,
}
