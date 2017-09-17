# OpenTabs
A Google Chrome extension that lets you create groups of tabs, save them across multiple devices, and reopen them later.

This edition removes usage of the font **Visby CF** which is supposedly not free,
As well as rewrite quite a bit of the data storage format.
And has a bunch of new UI.

Known Technical Issues:
- Extension page not auto closing when open using right click icon option button
    It's because chrome force us to open the option page in an overlay on the extension page.
    Even though we can force open it in a new tab, we can't automatically close the extension page.

    There is an Options link in the popup which can be use to open the option page without the extension page
    Kind of like how uBlock does with it's dashboard button in their popup

    TODO: Check open_in_tab option in options_ui?

- JavaScript injected Stylesheet isn't toggleable/editable in chrome devtools

- Being unable to store same url
    This is a design feature, this extension uses object to store url instead of an array
    As such, it isn't able to store the exact same url.

    Note that it is able to store same link address with different hash or query.

- Panel/Stuff unable to resize smaller than initial size
    It's a bug in the css 3 implementation which should be fix in chrome v61
    https://bugs.chromium.org/p/chromium/issues/detail?id=94583

FAQ:
- Are you aware of the `right click tab > bookmark all tabs` function which is similar to what this is trying to accomplish?
    Yes

- An option page on the extension page like how an v2 option ui suppose to do?
    This is a wouldn't be done.

    There is two reason for it:
        1. The lack of alert/confirm with v2 option ui, see:
           https://bugs.chromium.org/p/chromium/issues/detail?id=476350
        2. Duplicate code are troublesome.
           Iframe are even more troublesome.

- Separate import export function into reusable template that can just be dumped as is on a webpage
    Afaik, can't be done neatly due to no embedded script (CSP)
    https://developer.chrome.com/extensions/contentSecurityPolicy#JSExecution

    And lack of relative link (relative to template)

