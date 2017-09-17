var query_string = {}

location.search.substr(1).split("&").forEach(
    function(item) {
        var key = item.split("=")[0], value = decodeURIComponent(item.split("=")[1])
        if (key in query_string){
            query_string[key].push(value)
        } else {
            query_string[key] = [value]
        }
    }
)

window.addEventListener('load', function() {
    $('#clear_storage').on('click', () => {
        if (window.confirm("Do you really want to clear storage?")) { 
            chrome.storage.sync.clear(
                () => {
                    if (chrome.runtime.lastError == undefined) {
                        alert('storage cleared')
                    } else {
                        alert('Something happen, check console log for error')
                        console.warn(chrome.runtime.lastError)
                    }
                }
            )
        }
    })

    ceos.load('ceos_options', {}, {}, callback=(options) => {
        $('.ceos_options').change(() => {
            ceos.save('ceos_options')
            snackbar = document.getElementById("snackbar")
            snackbar.className = "show"
            snackbar.onclick = ()=>{
                window.location.reload()
            }
        })

        chrome.storage.sync.get(null, (storage) => {
            $('.menu').each((i, menu)=>{
                if (menu.id == 'test'){
                    if (options['display-test']){
                        $('#nav_group').append('<a href="?menu=test">test</a>')
                        $('#json_dump').after($('<textarea editable=false style="width:400px;height:200px">').val(JSON.stringify(storage, null, 4)))
                    }
                } else {
                    $('#nav_group').append(`<a href="?menu=${menu.id}">${menu.id}</a>`)
                }
            })

            // tried to do it with just plain css 3 and ::after but it didn't work out
            if (options['nav-sep'] == 'arrow'){
                $('nav div :not(:last-child)').after('<img src="images/ui/nav-arrow.svg"></img>')
                $('nav div').after('<img src="images/ui/nav-arrow.svg"></img>')
            } else if (options['nav-sep'] == 'line') {
                $('nav div :not(:last-child)').after('<img src="images/ui/nav-line.svg"></img>')
                $('nav div').after('<img src="images/ui/nav-line.svg"></img>')
            }

            selected = query_string['menu']
            document.getElementById(selected || 'overview').style.display = 'inherit'
            $(`nav a:contains(${selected})`).addClass('selected')
            document.getElementById('import').onclick = imex.import
            document.getElementById('export').onclick = imex.export
            document.body.style.display = 'initial'

            Object.entries(storage['groups']).forEach(([name, tabs]) => {
                $('#group_names').append(`<a href="?menu=groups&tab=${name}">${unescape(name)}</a>`)
                if (query_string['tab'] == unescape(name)){
                    Object.entries(tabs).forEach(([link, title]) => {
                        b = $(`<p>${title}</p>`)
                        b.attr('data-link', link);
                        b.dblclick((e) => {window.open(e.target.dataset.link, "_blank")})
                        $('#group_tabs').append($("<div tabindex='-1'><img src='images/ui/trash.svg'></img></div>").prepend(b))
                    })
                }
            })

            $('#group_tabs > div > img').click((e)=>{
                groups = storage['groups']
                delete groups[query_string['tab']][e.target.previousSibling.dataset.link]
                chrome.storage.sync.set(
                    {'groups': groups},
                    () => {
                        if (chrome.runtime.lastError) {
                            console.error('Update failed: ' + chrome.runtime.lastError.message)
                            displayErrorWithMessage('Your groups couldn\'t be updated.')
                        } else {
                            e.target.parentNode.remove()
                        }
                    }
                )
            })
        })
    })
})
