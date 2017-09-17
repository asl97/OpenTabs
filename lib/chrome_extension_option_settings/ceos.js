if (typeof ceos === "undefined") {
    var ceos = {}
} else {
    console.warn("WARNING: variable ceos is already define")
}

var toArray = function toArray(elements){
    array = []
    elements.forEach((element) => {
            array.push(element)
    })
    return array
}



ceos.default_load_func_map = {
    "text": function (element, value) {element.value = value},
    "radio": function (element, value) {if (element.value == value){element.checked = true}},
    "checkbox": function (element, value) {element.checked = element.value},
    "select-one": function (element, value) {element.querySelectorAll('option').forEach((opt)=>{if (opt.value == value){opt.selected = true}})}
}

ceos.default_save_func_map = {
    "text": function (element) {return element.value},
    "radio": function (element) {if (element.checked){return element.value}},
    "checkbox": function (element) {if (element.checked){return true}},
    "select-one": function (element) {return element.selectedOptions[0].value}
}

var get_option = function (element, save_func_map){
    type = element.type
    func = save_func_map[type] || ceos.default_save_func_map[type]
    if (typeof func !== "undefined") {
        return func(element)
    }
}

var set_option = function (element, value, load_func_map){
    type = element.type
    func = load_func_map[type] || ceos.default_load_func_map[type]
    if (typeof func !== "undefined") {
        return func(element, value)
    }
}

ceos.load = function (option_name, load_func_map = {}, save_func_map = {}, callback = ()=>{}){
    elements = document.querySelectorAll('.'+option_name)

    // disable everything at start
    elements.forEach((element)=>{
        element.disabled = true
    })

    chrome.storage.sync.get(option_name, options => {
        options = options[option_name] || {}
        if (options){
            elements.forEach((element) =>{
                var key = element.dataset.key  || element.name
                if (key) {
                    value = options[key]
                    if (typeof value !== "undefined") {
                        set_option(element, value, load_func_map)
                    } else {
                        lvalue = get_option(element, save_func_map)
                        if (typeof lvalue !== "undefined"){
                            options[key] = lvalue
                        }
                    }
                }
            })
        }

        // enable everything after finish loading
        elements.forEach((element)=>{
            element.disabled = false
        })
        ceos.options = options
        callback(options)
    })
}

ceos.save = function (option_name, save_func_map = {}){
    elements = document.querySelectorAll('.'+option_name)
    options = toArray(elements).reduce((obj, element) =>{
        var key = element.dataset.key  || element.name
        if (key) {
            value = get_option(element, save_func_map)
            if (typeof value !== "undefined") {
                if (!(key in obj)){
                    obj[key] = value
                } else {
                    console.warn('WARNING: multiple same key detected:', key)
                }
            }
        }
        return obj
        }, {}
    )

    chrome.storage.sync.set(
        {[option_name]: options},
        () => {
            if (chrome.runtime.lastError) {
                console.error('Save failed: ' + chrome.runtime.lastError.message)
            }
       }
    )
}

