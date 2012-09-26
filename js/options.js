var o = {
    b: {},
    keyCurrentIconPath: "currentIconPath",
    currentIconPath: "img/icon19.png",
    defaultIconPath: "img/icon19.png",

    keyIsContextMenuOn: "isContextMenuOn",
    isContextMenuOn: true,

    reset: function () {
        o.setIcon(o.defaultIconPath);
        o.createContextMenu();
    },

    closeTab: function() {
        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.remove(tab.id);
        });
    },

    getIcon: function () {
        o.currentIconPath = localStorage[o.keyCurrentIconPath];
        if (o.currentIconPath === undefined) o.currentIconPath = o.defaultIconPath;
        return o.currentIconPath;
    },
    setIcon: function (iconPath) {
        localStorage[o.keyCurrentIconPath] = iconPath;
        o.currentIconPath = iconPath;
        chrome.browserAction.setIcon({ path: o.currentIconPath });
        //CHECK validate whether the path is right or not
    },

    initIcon: function () {
        o.getIcon();
        o.setIcon(o.currentIconPath);
        $('#iconLocal').attr('src', o.currentIconPath);
    },

    loadLocalIcon: function (evt) {
        var files = evt.target.files;
        for (var i = 0, f; f = files[i]; i++) {
            if (!f.type.match('image.*')) {
                continue;
            }
            var reader = new FileReader();
            reader.onload = (function (theFile) {
                return function (e) {
                    $('#iconLocal').attr('src', e.target.result);
                };
            })(f);
            reader.readAsDataURL(f);
        }
    },

    removeContextMenu: function () {
        if (b.contextMenuId !== undefined) {
            chrome.contextMenus.remove(b.contextMenuId);
            b.contextMenuId = undefined;
        }
        o.isContextMenuOn = false;
        localStorage[o.keyIsContextMenuOn] = o.isContextMenuOn;
        $("#cCMenu").attr("checked", o.isContextMenuOn);
    },

    createContextMenu: function () {
        b.initContextMenu();
        o.isContextMenuOn = true;
        localStorage[o.keyIsContextMenuOn] = o.isContextMenuOn;
        $("#cCMenu").attr("checked", o.isContextMenuOn);
    },

    initContextMenu: function () {
        if (localStorage[o.keyIsContextMenuOn] === undefined) o.isContextMenuOn = true;
        else o.isContextMenuOn = localStorage[o.keyIsContextMenuOn] == 'true';
        if (o.isContextMenuOn) {
            o.createContextMenu();
        } else {
            o.removeContextMenu();
        }
    },

    init: function () {
        //o.initIcon();
//        $("#dIcon input[type='image']").click(function () {
//            var iconPath = $(this).attr("src");
//            o.setIcon(iconPath);
//        });
        //        $('#bFile').change(function (e) {
        //            $in = $(this);
        //            $in.next().html($in.val());
        //            var iconPath = $(this).val();
        //            start(iconPath);
        //            //o.setIcon(iconPath);
        //        });
        //$('#bFile').change(o.loadLocalIcon);


        b = chrome.extension.getBackgroundPage().b;
        o.initContextMenu();
        $("#cCMenu").change(function () {
            if ($(this).is(':checked')) {
                o.createContextMenu();
            } else {
                o.removeContextMenu();
            }
        });
//        $("#cTBtn").change(function () {
//            if ($(this).is(':checked')) {
//                o.initIcon();
//            } else {
//                o.setIcon("");
//            }
//        });

        $("#bReset").click(function () {
            o.reset();
        });

        $("#bClose").click(function () {
            o.closeTab();
        });

    }
};


//o.init();