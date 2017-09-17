function setContrast() {
  // randomly update
  rgb[0] = Math.round(Math.random() * 255);
  rgb[1] = Math.round(Math.random() * 255);
  rgb[2] = Math.round(Math.random() * 255);

  // http://www.w3.org/TR/AERT#color-contrast
  var o = Math.round(((parseInt(rgb[0]) * 299) +
                      (parseInt(rgb[1]) * 587) +
                      (parseInt(rgb[2]) * 114)) / 1000);
  return (o > 125) ? 'black' : 'white';
}

const themes = {
    'Pure': {
        color1: '#0000FF',
        color2: '#000000',
        font: '#FFFFFF'},
    'Depth': {
        color1: '#04E0E4',
        color2: '#08093F',
        font: '#FFFFFF'},
    'Popsicle': {
        color1: '#FE2851',
        color2: '#29C5FF',
        font: '#FFFFFF'},
    'Jazz': {
        color1: '#E10F5D',
        color2: '#03043C',
        font: '#FFFFFF'},
    'Sand': {
        color1: '#E26E43',
        color2: '#ED2962',
        font: '#FFFFFF'},
    'Night': {
        color1: '#1B0068',
        color2: '#08000C',
        font: '#FFFFFF'},
    'Dark': {
        color1: '#1b2b34',
        color2: '#1b2b34',
        font: '#c0c5ce'},
    'Light': {
        color1: '#FFFFFF',
        color2: '#FFFFFF',
        font: '#000000'}
}

const defaultTheme = 'Jazz'

var styleEl = document.createElement('style'), styleSheet;

document.head.appendChild(styleEl);

styleSheet = styleEl.sheet;

function escapeHTML(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function modifyUIWithTheme(name, theme, page) {
    $('body').css('backgroundImage', `linear-gradient(${theme.color1} 0%, ${theme.color2} 100%)`)
    switch (page) {
        case 'theme':
            const htmlThemes = $('.theme h2')
            htmlThemes.css('letter-spacing', '1px')
            htmlThemes.filter(`:contains('${name}')`).css('letter-spacing', '0.5px')
            $('footer a').css('color', theme.font)
            break
        case 'popup':
            // We are using a stylesheet because the group objects doesn't exist yet when this get called
            $('#error-message').css('backgroundImage', `linear-gradient(${theme.color1} 0%, ${theme.color2} 100%)`)
                               .css('color', theme.font)
            if ('font' in theme){
                
                styleSheet.insertRule(`.group {border-bottom: 2px solid ${theme.font}; color: ${theme.font}}`, 0)
                styleSheet.insertRule(`#group-list, .group input {color: ${theme.font}}`, 0)
            } else {
                styleSheet.insertRule(`.group {mix-blend-mode: difference; color: ${font}}`, 0)
                styleSheet.insertRule(`.group input {color: white}`, 0)
            }
            break
        default: 
            console.log('unexcepted page', page)
    }
}

function setUpUIWithTheme(page) {
    getTheme(themeInDB => {
        theme = themes[themeInDB]
        if (theme) {
            modifyUIWithTheme(themeInDB, theme, page)
        }
    })
}

function getTheme(callback) {
    chrome.storage.sync.get('options', store => {
        if (store.options){ callback(store.options.theme) }
        else { callback(defaultTheme) }
    })
}

function storageSave(options, errorcallback = ()=>{}) {
    chrome.storage.sync.set(
        options,
        () => {
            if (chrome.runtime.lastError) {
                console.error('Save failed: ' + chrome.runtime.lastError.message)
                errorcallback()
            }
       }
    )
}
