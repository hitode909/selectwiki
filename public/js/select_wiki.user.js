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

var descriptionElement = function(element, name) {
    var el = $("<div>");
    el.append($("<h3>").text(name));
    element.innerHTML = el[0].innerHTML;
    GM_xmlhttpRequest({
            method: "GET",
            url: api("word/?word=" + name),
            onload: function(response) {
//                gotDescription(element, response);
                //GM_setValue("description-" + name, response.responseText);
                try {
                    var data = eval("(" + response.responseText + ")");
                } catch (e) {
                    console.log(e);
                }
                var ul = $("<ul>");//.css({"list-style-type": "none"});
                for (var i=0; i < data.word.descriptions.length; i++) {
                    var description = data.word.descriptions[i];
                    var li = $("<li>").text(description.body);
                    var del_button = $("<img>").attr("src", RootURI + "image/delete.png").css({cursor: "pointer"});
                    del_button.click(function(){
                        GM_xmlhttpRequest({
                            method: "POST",
                            url: api("word/delete"),
                            data: ["word=", name, "&id=", description.id].join(""),
                            headers: {'Content-type': 'application/x-www-form-urlencoded'},
                            onload: function(response) {
                                if (response.status == 200) {
                                    li.empty();
                                }
                            }
                        });
                    });
                    li.append(del_button);
                    ul.append(li);
                }
                var add_form = $("<form>");
                add_form.append($("<input>").attr({name: "body"}));
                var add_button = $("<img>").attr("src", RootURI + "image/add.png").css({cursor: "pointer"});
                add_button.click(function(){alert('add');});
                add_form.append(add_button);
                ul.append($("<li>").append(add_form));
                el.append(ul);
                $(element).empty().append(el);
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
        // XXX: HTMLが壊れる場合があるので，正規表現まともに
        html = html.replace(new RegExp(this.name, "ig"), "<span class='select-wiki-keyword'>"+this.name+"</span>");
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
if (typeof(words) == "undefined") {
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
