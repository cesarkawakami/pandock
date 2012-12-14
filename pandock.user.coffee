###
==UserScript==
@name       Pandock: Flowdock UX fixes
@version    0.2
@description  Adds fixes to Flowdock UX, like keyboard shortcuts and a more readable UI
@match      http*://*.flowdock.com/app/*
@copyright  2012+, Cesar Kawakami
@updateURL
==/UserScript==
###


circularElementDelta = (list, element, delta) ->
    idx = list.indexOf element
    if idx == -1
        throw new RangeError "element not found in list"
    list[(idx + list.length + delta % list.length) % list.length]


simulateMouseClick = (element) ->
    # I'm still baffled as jQuery doesn't provide this functionality right off
    # the box
    evt = document.createEvent "MouseEvents"
    evt.initEvent "click", true, true
    element.dispatchEvent evt


init = ($, window) ->
    class TabHighlighter
        updateTabHighlight: ->
            $("#tab-bar li")
                .css("border-bottom", "")
                .has(".current")
                    .css("border-bottom", "5px solid #666")

        init: ->
            window.setInterval @updateTabHighlight, 200

    class KeyboardMagic
        init: ->
            $("body").on "keydown", (evt) ->
                # toggle focus between chat-input and search box on Ctrl-' or Ctrl-"
                if evt.which == 222 and evt.ctrlKey
                    if $(".chat-input:focus").length > 0 and
                            $("#search [contenteditable]").length > 0
                        $("#search [contenteditable]").focus()
                    else
                        $(".chat-input").focus()

                # switch tabs via Ctrl-, and Ctrl-. (or Ctrl-< and Ctrl->)
                if evt.which in [188, 190] and evt.ctrlKey
                    delta = if evt.which == 188 then -1 else 1
                    tabElements = $("#tab-bar li.tabs-reorderable a.tab")
                    existingTabs = ($(x).attr "href" for x in tabElements)
                    currentTab = tabElements.filter(".current").attr("href")
                    nextTab = circularElementDelta existingTabs, currentTab, delta
                    nextTabElement = (x for x in tabElements when $(x).attr("href") == nextTab)[0]
                    simulateMouseClick nextTabElement

    class AnnoyingWarningAnnihilator
        annihilate: ->
            $(".error")
                .filter(-> /A New Desktop App Available/.exec $(@).html())
                .remove()

        init: ->
            window.setInterval @annihilate, 200

    class CodeHighlighter
        prettify: ->
            if window.prettyPrintOne?
                for el in $("pre > code").not(".prettyprinted")
                    $(el)
                        .html(prettyPrintOne($(el).html()))
                        .addClass("prettyprinted")
                        .css("font-size", "90%")

        init: ->
            $("<link rel=stylesheet href=//cdn.jsdelivr.net/prettify/0.1/prettify.css>")
                .appendTo $("head")
            $("<script src=//cdnjs.cloudflare.com/ajax/libs/prettify/188.0.0/prettify.js>")
                .appendTo $("body")

            setInterval @prettify, 1000


    for cls in [KeyboardMagic, AnnoyingWarningAnnihilator, CodeHighlighter]
        (new cls).init()


getUnsafeWindow = ->
    el = document.createElement "p"
    el.setAttribute "onclick", "return window;"
    el.onclick()  # returns the window element of the content window


waitForJQueryThen = (callback) ->
    unsafeWindow = getUnsafeWindow()
    if unsafeWindow.$?
        callback unsafeWindow.$, unsafeWindow
    else
        window.setTimeout (-> waitForJQueryThen callback), 500


waitForJQueryThen init

