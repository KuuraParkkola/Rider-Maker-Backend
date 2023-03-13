const presets = {
    a4: { width: '210mm', height: '297.35mm' }
}

const loadPreset = (preset) => presets[preset];


module.exports = {presets, loadPreset};
