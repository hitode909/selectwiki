// ==UserScript==
// @name           select wiki
// @namespace      http://www.hatena.ne.jp/hitode909/
// @description    select wiki
// @include        *
// @require        http://jqueryjs.googlecode.com/files/jquery-1.3.2.min.js
// @require        http://www.hatena.ne.jp/js/Ten.js
// @require        http://www.hatena.ne.jp/js/Ten/Ten/SubWindow.js
// ==/UserScript==

var RootURI = "http://localhost:7000/";

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

var gotWords = function(words) {
    console.log(0);
//    console.log(words);
    var html = document.body.innerHTML;
    $.each(words, function() {
        // 正規表現これでよいのか検討すべき
        // TODO: this.nameが正規表現っぽいときバグるので，エスケープしたい
        html = html.replace(new RegExp(["(>[^><]*)(", this, ")([^><]*<)"].join(""), "ig"),
            "$1<span class='select-wiki-keyword'>$2</span>$3");
    });
    document.body.innerHTML = html;
    var keywordStyle = {
        "text-decoration": "underline",
        cursor: "pointer",
        "background-color": "#ff0"
    };
    console.log(1);
    var elems = $(".select-wiki-keyword");
    elems.css(keywordStyle);

    var self = this;
    elems.mouseover(function() {
        var w = new Ten.SubWindow;
        descriptionElement(w.container, $(this).text());
        var pos = $(this).position();
        w.show({x: pos.left + $(this).width(), y: pos.top + $(this).height() });
    });
    console.log(2);
};

console.log('gm');

with (Ten.SubWindow) {
    showScreen = false;
    draggable = true;
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
    var selection = content.window.getSelection();
    if (!selection.rangeCount) return;
    var range = selection.getRangeAt(0);
    if (range.startOffset == range.endOffset || range.startContainer != range.endContainer || range.collapsed) return;
    var name = selection.toString();
    if (name.length) {
        gotWords([name]);
    }
});

var words = GM_getValue("words");
if (typeof(words) == "undefined" || true) {
    GM_xmlhttpRequest({
        method: "GET",
        url: api("words/"),
        onload: function(response) {
            GM_setValue("words", response.responseText);
            var data = eval("("+response.responseText+")");
            gotWords(data.words);
        }
    });
} else {
    gotWords(words);
}

