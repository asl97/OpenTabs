$(document).ready(() => {
    $('#toggle-create-group-prompt-button').on('click', () => { toggleCreateGroupPrompt() })
    $('#create-group-prompt input').on('keyup', e => { createGroup(e) })
    $('#create-group-prompt img').on('click', () => { createGroup({ keyCode: 13 }) })

    initWindow()
})

function initWindow() {
    $('#error-message').hide()
    $('#create-group-prompt').hide()

    initDatabase()
    setUpUIWithTheme('popup')
}

function getGroups(callback) {
    chrome.storage.sync.get('groups', store => {
        callback(store.groups)
    })
}

function initDatabase() {
    getGroups(groups => {
        if (!groups) {
            groups = {} // set default groups
            storageSave({'groups': groups})
        }
        renderGroupList(groups)
    })
}

function renderGroupList(groups) {
    if (Object.entries(groups).length > 0) {
        groupsMarkup = createGroupsListMarkup(groups)
        $('#group-list p').hide()
        $('#groups').html(groupsMarkup)
        initGroups()
    } else {
        $('#groups').html('')
        if (promptIsOpen()) {
            $('#group-list p').hide()
        } else {
            $('#group-list p').fadeIn(200)
        }
    }
}

function initGroups() {
    $('.group-editor').hide()

    $('.group-info').on('click', function() {
        $(this).children('img').toggleClass('rotate90')
        $(this).next().slideToggle(200)
    })

    $('.open-group-button').on('click', function() {
        const groupName = getGroupName($(this))
        getGroups(groups => {
            group = groups[groupName]
            if (group) {
                chrome.windows.create({ url: group.map(tab => { return tab.url }) }, () => {})
            }
        })
    })

    $('.add-tab-button').on('click', function() {
        const groupName = getGroupName($(this))
        getCurrentTab(tab => {
            if (tab) {
                getGroups(groups => {
                    group = groups[groupName]
                    if (group) {
                        group[tab.url] = tab.title
                        updateGroupList(groups)
                    }
                })
            }
        })
    })

    $('.update-group-button').on('click', function() {
        const groupName = getGroupName($(this))
        getGroups(groups => {
            getTabsInCurrentWindow(tabs => {
                groups[groupName] = compressTabs(tabs)
                updateGroupList(groups)
            })
        })
    })

    $('.delete-group-button').on('click', function() {
        const groupName = getGroupName($(this))
        getGroups(groups => {
            delete groups[groupName]
            updateGroupList(groups)
        })
    })
}

function updateGroupList(groups) {
    chrome.storage.sync.set(
        {'groups': groups},
        () => {
            if (chrome.runtime.lastError) {
                console.error('Update failed: ' + chrome.runtime.lastError.message)
                displayErrorWithMessage('Your groups couldn\'t be updated.')
            } else {
                renderGroupList(groups)
            }
        }
    )
}

function getGroupName(element) {
    return element.attr('data-group-name')
}

function toggleCreateGroupPrompt() {
    togglePromptVisibility()
    togglePromptButtonRotation()
    getGroups(groups => {
        renderGroupList(groups)
    })
}

function createGroup(key) {
    const inputValue = $('#create-group-prompt input').val()
    if (key.keyCode == 13 && inputValue != '' && promptIsOpen()) {
        getGroups(groups => {
            if (inputValue in groups) {
                displayErrorWithMessage('Another group already has this name.')
            } else {
                getTabsInCurrentWindow(tabs => {
                    saveGroup(inputValue, compressTabs(tabs))
                    togglePromptButtonRotation()
                    togglePromptVisibility()
                    $('html, body').animate({ scrollTop: $(document).height() }, 200)
                })
            }
        })
    } else {
        $('#create-group-prompt input').focus()
    }
}

function saveGroup(name, tabs) {
    getGroups(groups => {
        groups[escape(name)] = tabs
        storageSave({'groups': groups},
                    () => displayErrorWithMessage('This group couldn\'t be saved.'))
        renderGroupList(groups)
    })
}

function displayErrorWithMessage(message) {
    $('#error-message p').html(`Error! ${message}`)
    $('#error-message').slideDown(200).delay(4000).slideUp(200)
}

function compressTabs(tabs) {
    return tabs.reduce((obj, tab) => { obj[tab.url] = tab.title; return obj }, {})
}

function togglePromptButtonRotation() {
    $('#toggle-create-group-prompt-button img').toggleClass('rotate45')
}

function togglePromptVisibility() {
    if (promptIsOpen()) {
        $('#create-group-prompt').hide()
        $('#create-group-prompt input').val('')
    } else {
        setPromptSubtitle()
        $('#create-group-prompt').fadeIn(200)
        $('html, body').animate({ scrollTop: $(document).height() }, 200)
        $('#create-group-prompt input').focus()
    }
}

function createGroupsListMarkup(groups) {
    return Object.entries(groups).map(([name, tabs]) => `
        <div class="group">
            <div class="group-info">
                <div>
                    <h1>${unescape(name)}</h1>
                    <h2>${pluralizeTabsString(Object.keys(tabs).length)}</h2>
                </div>
                <img src="images/ui/arrow.svg" class="shadow">
            </div>
            <div class="group-editor">
                <div class="group-editor-buttons">
                    <div class="group-editor-row">
                        <div class="first-group-editor-button group-editor-button open-group-button" data-group-name="${name}">
                            <h1>Open</h1>
                            <h2>this group in a new window.</h2>
                        </div>
                        <div class="first-group-editor-button group-editor-button add-tab-button" data-group-name="${name}">
                            <h1>Add</h1>
                            <h2>the current tab to this group.</h2>
                        </div>
                    </div>
                    <div class="group-editor-row">
                        <div class="group-editor-button update-group-button" data-group-name="${name}">
                            <h1>Update</h1>
                            <h2>with the tabs in this window.</h2>
                        </div>
                        <div class="group-editor-button delete-group-button" data-group-name="${name}">
                            <h1>Delete</h1>
                            <h2>this group.</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('')
}

function pluralizeTabsString(numberOfTabs) {
    if (numberOfTabs > 1) {
        return `${numberOfTabs} Tabs`
    } else {
        return '1 Tab'
    }
}

function setPromptSubtitle() {
    getTabsInCurrentWindow(tabs => {
        $('#create-group-prompt div h2').html(pluralizeTabsString(Object.keys(compressTabs(tabs)).length))
    })
}

function getCurrentTab(callback) {
    chrome.tabs.query({ currentWindow: true, active: true }, tabs => callback(tabs[0]));
}

function getTabsInCurrentWindow(callback) {
    chrome.tabs.query({ 'currentWindow': true }, callback)
}

function promptIsOpen() {
    return $('#create-group-prompt').is(':visible')
}
