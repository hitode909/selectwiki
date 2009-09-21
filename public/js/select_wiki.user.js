// ==UserScript==
// @name           select wiki
// @namespace      http://www.hatena.ne.jp/hitode909/
// @description    select wiki
// @include        *
// @require        http://jqueryjs.googlecode.com/files/jquery-1.3.2.min.js
// @require        http://www.hatena.ne.jp/js/Ten.js
// @require        http://www.hatena.ne.jp/js/Ten/Ten/SubWindow.js
// ==/UserScript==

$.fn.extend(function(element) {
    var subWindow = $("#subwindow");
    if (!subWindow) {
        subWindow = $("<div id='subwindow'>");
        var container = $("<div id='container'>");
        subWindow.append(container);
    }
});

var RootURI = "http://localhost:7000/";
var p = function(text) {
    console.log(text);
};
    
var po = function(obj) {
    console.log(uneval(obj));
};

var api = function(path) {
    return RootURI + "api/" + path;
};


var gotDescription = function(element, response) {
    if (response.status != 200) return;
    try {
        var data = eval("(" + response.responseText + ")");
    } catch (e) {
        console.log(e);
        return;
    }
    var el = $("<div>");
    el.append($("<h3>").text(data.word.name));

    var ul = $("<ul>");
    for (var i=0; i < data.word.descriptions.length; i++) {
        var description = data.word.descriptions[i];
        var li = $("<li>").text(description.body);
        var del_button = $("<img>").attr("src", RootURI + "image/delete.png").css({cursor: "pointer"});
        li.append(del_button);
        del_button.data("id", description.id);
        del_button.click(function(){
            var el = $(this);
            GM_xmlhttpRequest({
                method: "POST",
                url: api("word/delete"),
                data: ["word=", data.word.name, "&id=", el.data("id")].join(""),
                headers: {'Content-type': 'application/x-www-form-urlencoded'},
                onload: function(response) {
                    if (response.status == 200) {
                        gotDescription(element, response);
                    }
                }
            });
        });
        ul.append(li);
    }
    var input = $("<input>").attr({name: "body"});
    var add_button = $("<img>").attr("src", RootURI + "image/add.png").css({cursor: "pointer"});
    add_button.click(function(){
        var body = input.val();
        GM_xmlhttpRequest({
                method: "POST",
                url: api("word/add"),
            data: ["word=", data.word.name, "&description=", encodeURIComponent(body)].join(""),
                headers: {'Content-type': 'application/x-www-form-urlencoded'},
                onload: function(response) {
                    if (response.status == 200) {
                        gotDescription(element, response);
                    }
                }
            });
        input.val("");
    });
    ul.append($("<li>").append(input).append(add_button));
    el.append(ul);
    $(element).empty().append(el);
};

var descriptionElement = function(element, name) {
    var el = $("<div>");
    $(element).empty().append($("<h3>").text(name));
    GM_xmlhttpRequest({
            method: "GET",
            url: api("word/?word=" + name),
            onload: function(response) {
                gotDescription(element, response);
            }
        });
};

var getWordsObject = function() {
    var words = GM_getValue("words");
    return eval("("+words+")");
};

var gotWords = function(wordsText) {
    var words = eval("("+wordsText+")");
    var html = document.body.innerHTML;
    $.each(words.words, function() {
        // 正規表現これでよいのか検討すべき
        html = html.replace(new RegExp(["(>[^><]*)(", this.name, ")([^><]*<)"].join(""), "ig"),
            "$1<span class='select-wiki-keyword'>$2</span>$3");
    });
    document.body.innerHTML = html;
    var keywordStyle = {
        "text-decoration": "underline",
        cursor: "pointer",
        "background-color": "#ff0"
    };
    var elems = $(".select-wiki-keyword");
    elems.css(keywordStyle);
    elems.mouseover(function() {
        var w = new Ten.SubWindow;
        descriptionElement(w.container, $(this).text());
        var pos = $(this).position();
        w.show({x: pos.left + $(this).width(), y: pos.top + $(this).height() });
        $(this).data("window", w);
    });
    elems.mouseout(function() {
//        $(this).data("window").hide();
    });
};

var words = GM_getValue("words");
if (typeof(words) == "undefined" || true) {
    GM_xmlhttpRequest({
        method: "GET",
        url: api("words/"),
        onload: function(response) {
            GM_setValue("words", response.responseText);
            gotWords(response.responseText);
        }
    });
} else {
    gotWords(words);
}

with (Ten.SubWindow) {
    showScreen = false;
    draggable = false;
    handleStyle = false;
    containerStyle = {
        margin: "5px",
        padding: "0"
    };
    style = {
        width: "15em",
        height: "20em"
    };
    style.textAlign = "left";


};


jQuery(document).mouseup(function(){
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);
    if (range.startOffset != range.endOffset && range.startContainer == range.endContainer) {
        var name = window.getSelection().toString();
        range.surroundContents($("<span class='select-wiki-keyword-new'>")[0]);
        var keywordStyle = {
            "text-decoration": "underline",
            "cursor": "pointer",
            "background-color": "#ff0"
        };
        var elem = $(".select-wiki-keyword-new").removeClass("select-wiki-keyword-new").addClass("select-wiki-keyword");
        elem.css(keywordStyle);
        var w = new Ten.SubWindow;
        descriptionElement(w.container, name);
        var pos = elem.position();
        w.show({x: pos.left + elem.width(), y: pos.top + elem.height() });
        elem.data("window", w);
    }
});
