if (typeof imex === "undefined") {
    var imex = {}
} else {
    console.warn("WARNING: variable ceos is already define")
}

imex.export = function (){
    chrome.storage.sync.get(null, (storage) => {
        data = {'dump':storage, 'imex_timeStamp': new Date()}
        data_export = 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 4))
        time_export = new Date().toLocaleString(undefined, {hour12: false}).replace(/:/g, '.').replace(/\//g, '-').replace(/,/g, '').replace(/ /g, '_')
        filename = `OpenTabs_${time_export}.json`
        a = document.createElement('a')
        a.href = data_export
        a.download = filename
        a.type = "text/plain"
        a.click()
    })
}

imex.import = function (callback = ()=>{}){
    input = document.createElement('input')
    input.type = 'file'
    input.onchange = function (){
        var file = this.files[0];
        if ( file === undefined || file.name === '' ) {
            return;
        }

        var fr = new FileReader()
        fr.onload = function() {
            var userData = JSON.parse(this.result)

            if ( userData === undefined ) {
                callback(false)
                return
            }
            var time = new Date(userData.imex_timeStamp)
            console.log(time)
            if (confirm(`Do you wish to overwrite settings with data from ${time}?`)){
                chrome.storage.sync.set(
                    userData['dump'],
                    () => {
                        if (chrome.runtime.lastError) {
                            console.error('Save failed: ' + chrome.runtime.lastError.message)
                        }
                   }
                )
            }

        }
        fr.readAsText(file)
    }
    input.click()
}
