// ==UserScript==
// @name           wedictionary
// @namespace      http://wedictionary.appspot.com/
// @description    we are dictionary
// @include        *
// @exclude        http://wedictionary.appspot.com/*
// @require        http://jqueryjs.googlecode.com/files/jquery-1.3.2.min.js
// @require        http://www.hatena.ne.jp/js/Ten.js
// @require        http://www.hatena.ne.jp/js/Ten/Ten/SubWindow.js
// ==/UserScript==

var RootURI = "http://wedictionary.appspot.com/";
//var RootURI = "http://localhost:8081/";

// http://blog.livedoor.jp/dankogai/archives/51058313.html
String.prototype.quotemeta = function(){
  return this.replace(/([^0-9A-Za-z_])/g, '\\$1');
};

var api = function(path) {
    return RootURI + "api/" + path;
};

var isGM = function() {
    return (typeof(GM_xmlhttpRequest) != 'undefined');
};

var isSameDomain = function() {
    return ('http://' + location.host + '/' == RootURI);
};

var xhr = function(option) {
    if (isSameDomain()) {
        jQuery.ajax(
            {
                complete: function(req, st) {option.onload(req);},
                data: option.data,
                url: option.url,
                type: option.method
            });
    } else {
        if (option.method == 'POST') {
            var header = {'Content-type': 'application/x-www-form-urlencoded'};
        }
        GM_xmlhttpRequest(
            {
                method: option.method,
                url: option.url,
                data: option.data,
                headers: option.header || header,
                onload: option.onload
            });
    }
};

var filterTextNode = function(element, filter) {
    if (!element) return null;
    if (element.nodeType == 3 && !/^(textarea|script|style)$/i.test(element.parentNode.tagName) ) {
        filter(element);
    } else {
        var children = element.childNodes;
        for (var i=0; i < children.length; i++){
            filterTextNode(children[i], filter);
        }
    }
};
    
var gotDescription = function(element, response) {
    if (response.status != 200) return;
    try {
        var data = eval("(" + response.responseText + ")");
    } catch (e) {
        console.log(e);
        return;
    }
    if (typeof(data.word) == 'undefined') return;
    var el = $("<div>");
    el.append($("<h3>").text(data.word.name));

    var ul = $("<ul>");
    for (var i=0; i < data.word.descriptions.length; i++) {
        var description = data.word.descriptions[i];
        var li = $("<li>").text(description.body);
        var del_button = $("<img>").attr("src", RootURI + "image/delete.png").addClass("button");
        li.append(del_button);
        del_button.data("key", description.key);
        del_button.click(function(){
            var el = $(this);
            xhr({
                method: "DELETE",
                url: api("word") + ["?word=", data.word.name, "&key=", el.data("key")].join(""),
                onload: function(response) {
                    if (response.status == 200) {
                        gotDescription(element, response);
                    } else {
                        document.write(uneval(response));
                    }
                }
            });
        });
        ul.append(li);
    }
    ul.append($("<li>").append(addElement(element, data.word.name)));
    el.append(ul);
    $(element).empty().append(el);
};

var addElement = function(element, name) {
    if (!name) return null;
    var form = $("<form>");
    var input = $("<input>").attr({name: "body"});
    var add_button = $("<img>").attr("src", RootURI + "image/add.png").addClass("button");
    var submit = function(){
        var body = input.val();
        xhr({
                method: "POST",
                url: api("word"),
                data: ["word=", name, "&description=", encodeURIComponent(body)].join(""),
                headers: {'Content-type': 'application/x-www-form-urlencoded'},
                onload: function(response) {
                    if (response.status == 200) {
                        gotDescription(element, response);
                    }
                }
        });
        input.val("");
        return false;
    };
    add_button.click(submit);
    form.submit(submit);
    form.append(input);
    form.append(add_button);
    return form;
};;

var descriptionElement = function(element, name) {
    $(element).empty().append($("<h3>").text(name));
    var ul = $("<ul>");
    ul.append($("<li>").append(addElement(element, name)));
    $(element).append(ul);

    xhr({
            method: "GET",
            url: api("word?word=" + name),
            onload: function(response) {
                gotDescription(element, response);
            }
        });
};

var gotWords = function(words) {
    var regex = new RegExp("(" + words.map(function(w){return w.quotemeta();}).join('|') + ")", "g");
    var tmp = [];
    filterTextNode(document.body, function(textNode) {
        var parent = textNode.parentNode;
        var df = document.createDocumentFragment();
        var text = textNode.nodeValue;
        //XXX:IEでは動く気がしない
        var flag = false;
        var x = text.split(regex);
        for(var i = 0; i< x.length; i++) {
            flag = !flag;
            if(flag) {
                df.appendChild(document.createTextNode(x[i]));
            } else {
                var e = document.createElement('span');
                e.className = 'wedictionary-keyword-new';
                e.appendChild(document.createTextNode(x[i]));
                df.appendChild(e);
            }
        }
        tmp.push([df, textNode]);
    } );
    for(var i=0; i<tmp.length; i++) {
        tmp[i][1].parentNode.replaceChild(tmp[i][0], tmp[i][1]);
    }
    var elems = $(".wedictionary-keyword-new").removeClass("wedictionary-keyword-new").addClass("wedictionary-keyword");

    elems.mouseover(function() {
        var w = new Ten.SubWindow;
        descriptionElement(w.container, $(this).text());
        $(w.container).attr('id', 'ten-subwindow-container');
        var pos = Ten.Geometry.getElementPosition(this);
        w.show({x: pos.x + $(this).width(), y: pos.y + $(this).height() });
    });
};

with (Ten.SubWindow) {
    showScreen = false;
    draggable = true;
    style = {
        zIndex: 2000,
        width: "20em",
        height: "20em",
        textAlign: "left",
        overflow: "auto"
    };
};

jQuery(document).mouseup(function(){
    var selection = content.window.getSelection(); // XXX:ふつうのjs化したいので，うまくやりたい
    if (!selection.rangeCount) return;
    var range = selection.getRangeAt(0);
    if (range.startOffset == range.endOffset || range.startContainer != range.endContainer || range.collapsed) return;
    var name = selection.toString();
    if (name.length) {
        gotWords([name]);
    }
});

xhr({
        method: "GET",
        url: api("words"),
        onload: function(response) {
            var data = eval("("+response.responseText+")");
            gotWords(data.words);
        }
    });

var style = $("<style>").html(
    [
    ".wedictionary-keyword {",
    "text-decoration: underline;",
    "background-color: #ffc;",
    "}",
    "#ten-subwindow-container {",
    "color: #000;",
    "margin: 0px;",
    "padding: 0px;",
    "border-width: 0px;",
    "width: auto;",
    "background: transparent;",
    "}",
    "#ten-subwindow-container h3{",
    "font-size: 20px;",
    "color: #000;",
    "margin: 0px;",
    "padding: 5px 0px;",
    "font-weight: bold;",
    "border-width: 0px;",
    "text-indent: 0px;",
    "background: transparent;",
    "line-height:1.0;",
    "}",
    "#ten-subwindow-container ul{",
    "color: #000;",
    "margin:  0px;",
    "padding: 5px 0px;",
    "width: 100%;",
    "line-height:1.0;",
    "list-style-image : none;",
    "background: transparent;",
    "}",
    "#ten-subwindow-container li{",
    "list-style-type: none;",
    "font-size: 12px;",
    "color: #000;",
    "margin:  0px;",
    "padding: 3px;",
    "width: 100%;",
    "background: transparent;",
    "}",
    "#ten-subwindow-container input{",
    "font-size: 12px;",
    "color: #000;",
    "margin: 0px;",
    "padding: 0px;",
    "font-weight: normal;",
    "width: 80%;",
    "background: transparent;",
    "}",
    "#ten-subwindow-container .button{",
    "cursor: pointer;",
    "margin: 0px 0px 0px 2px;",
    "padding: 0px;",
    "vertical-align: middle;",
    "}"
    ].join("\n"));
$("head").append(style);
