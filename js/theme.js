$(document).ready(() => {
    setUpThemes()
    initDatabase()
    setUpUIWithTheme('theme')
    $('.theme').on('click', function() { selectTheme($(this)) })
    $('#back').on('click', function() { history.go(-1) })
})

function setUpThemes() {
    const themesMarkup = Object.entries(themes).map(([name, theme]) => `
        <div class="theme">
            <div style='background-image: linear-gradient(${theme.color1} 0%, ${theme.color2} 100%); border: 2px solid lightgray;'></div>
            <h2>${name}</h2>
        </div>
    `).join('')
    $('#theme-list').html(themesMarkup)
}

function initDatabase() {
    getTheme(theme => {
        if (!theme) {
            console.log(defaultTheme)
            storageSave({'options': {'theme': defaultTheme}})
        }
    })
}

function selectTheme(theme) {
    name = theme.children('h2').html()
    theme = themes[name]
    if (theme) {
        modifyUIWithTheme(name, theme, 'theme')
        chrome.storage.sync.set(
            {'options': {'theme': name}},
            () => {
                if (chrome.runtime.lastError) {
                    console.error('Saving theme failed: ' + chrome.runtime.lastError.message)
                }
            }
        )
    }
}
