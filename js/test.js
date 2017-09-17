window.addEventListener('load', function() {
    document.getElementById('save').onclick = function (){
        ceos.save('ceos')
        alert('saved')
    }

    ceos.load('ceos')
})
