// -----------------------------------------------------------------------------------
//
//	QikPages v1.0
//	by John Donnelly - http://www.my4dashboards.com/
//	Last Modification: 9/29/2014
//
//  Requirements:
//      - jquery v1.11.1 - http://code.jquery.com/jquery-1.11.0.min.js
//      - migrate.jquery.min.js - http://code.jquery.com/jquery-migrate-1.2.1.min.js
//      - jQuery hashchange event - v1.3 - http://benalman.com/projects/jquery-hashchange-plugin/
//
// -----------------------------------------------------------------------------------




//
//  Configuration
//
var currMode = "";
var sessionID = "";
var QikPagesOptions = {
    docTitle: "QikPages",                                               // Main Document Title
    aspxPageURL: "",                                                    // link for more complex pages such as asp.net or outside resourse pages
    animationSpeed: 250,                                                // sets the speed of the animation
    preventErrors: false,                                               // prevents any errors from being displayed
    loadingText: "Loading Requested Page. Please Wait.",
    pageDir: "pages/",                                                  // Page directory
    startPage: "home.html",

    // Define the desktop and mobile css files
    desktopCSS: "desktop_site.css",
    mobileCSS: "mobile_site.css",
    winMinWidth: 1000,

    slideShowSpeed: 5000                                                // In milliseconds (5 seconds = 5000 milliseconds)
};

// -----------------------------------------------------------------------------------




var QikPages = function () {

    // Private Variables
    var slideshowArray;
    var directionsArray;
    var currPicNum = 0;
    var totalItemsSlideShow = 0;
    var ssTimeout1;
    var initHeaderHt = 100;


    function initialize() {
        sessionID = createSessionID(); // Create the session ID
        $("#footer-pagetitle").html(QikPagesOptions.docTitle);

        var ver = getInternetExplorerVersion();
        if (ver > -1) {
            if (ver <= 7.0) {
                $("#headerContent").css("background", "#576C96");
            }
        }

        initHeaderHt = $("#topheader").outerHeight();

        BuildSlideShowImgs();
        setWindowMinWidth();
        LoadViewPort();

        $(function () {
            $(window).error(function (e) {
                if (QikPagesOptions.preventErrors) {
                    e.preventDefault();
                }
            });

            $(window).hashchange(function () {
                var url = location.hash;
                QikPages.startPageLoad(url == "" ? "1" : url);
            });

            // Creates the navigation event that handles the menu bar
            $("li.nav-main-li").hover(function () {
                if (currMode != "mobile") {
                    var $_Menu = $(this).find(".nav-main-a");
                    var $_subMenu = $(this).find(".nav-main-li-sub");
                    if ($_subMenu.length > 0) {
                        if (!$_Menu.hasClass("nav-main-active")) {
                            $_Menu.addClass("hover");
                        }
                        $_subMenu.fadeIn(100);
                    }
                }
            }, function () {
                if (currMode != "mobile") {
                    var $_Menu = $(this).find(".nav-main-a");
                    var $_subMenu = $(this).find(".nav-main-li-sub");
                    if ($_subMenu.length > 0) {
                        $_Menu.removeClass("hover");
                        $_subMenu.fadeOut(100);
                    }
                }
            });

            $(".Modal-element-modal").draggable({
                containment: "body",
                cancel: '.ModalPadContent, .ModalExitButton',
                drag: function (event, ui) {
                    var $this = $(this);
                    $this.css("opacity", "0.6");
                    $this.css("filter", "alpha(opacity=60)");

                    // Apply an overlay over widget
                    // This fixes the issues when dragging iframes
                    if ($this.find("iframe").length > 0) {
                        var $_id = $this.find(".ModalPadContent");
                        $wo = $_id.find(".widget-overlay-fix");
                        if ($wo.length == 0) {
                            if ($_id.length == 1) {
                                $_id.append("<div class='widget-overlay-fix'></div>");
                            }
                        }
                    }
                },
                stop: function (event, ui) {
                    var $this = $(this);
                    $this.css("opacity", "1.0");
                    $this.css("filter", "alpha(opacity=100)");
                    $wo = $(this).find(".widget-overlay-fix");
                    if ($wo.length == 1) {
                        $wo.remove();
                    }
                }
            });
        });
    }
    function createSessionID() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 10; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    function getInternetExplorerVersion() {
        // Returns the version of Internet Explorer or a -1
        // (indicating the use of another browser).
        var rv = -1; // Return value assumes failure.
        if (navigator.appName == 'Microsoft Internet Explorer') {
            var ua = navigator.userAgent;
            var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
            if (re.exec(ua) != null)
                rv = parseFloat(RegExp.$1);
        }
        return rv;
    }

    function SetContentHeight() {
        // Set content min-height
        var window_ht = $(window).height();
        var footerWrapper_ht = $("#footerWrapper").height() - $("#footerImg").height();
        var padding = 35; // Adjust the padding to get your correct min-height
        $("#wrapper-height").css("min-height", window_ht - (footerWrapper_ht + padding));
        SetScrollHeader();
    }
    function setWindowMinWidth() {
        try {
            if ($("body").css("min-width") != "") {
                var minWidth = parseInt($("body").css("min-width").replace("px", ""));
                if (minWidth > 0) {
                    QikPagesOptions.winMinWidth = minWidth;
                }
            }
        }
        catch (evt) { }
    }

    function loadCSS(url) {
        $("link[href='css/" + url + "']").remove();
        var head = document.getElementsByTagName('head')[0];
        link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = "css/" + url;
        head.appendChild(link);
    }
    function unloadCSS(url) {
        $("link[href='css/" + url + "']").remove();
    }
    function LoadViewPort() {
        if (navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/webOS/i) || navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i) || navigator.userAgent.match(/BlackBerry/i) || navigator.userAgent.match(/Windows Phone/i)) {
            var head = document.getElementsByTagName('head')[0];
            meta = document.createElement('meta');
            meta.name = 'viewport';
            meta.id = 'mobileViewport';
            meta.content = 'initial-scale=0.80, user-scalable=no';
            head.appendChild(meta);
        }
        else {
            if ($("#mobileViewport").length > 0) {
                $("#mobileViewport").remove();
            }
        }
    }

    function startPageLoad(num) {
        var page = QikPagesOptions.startPage;
        if ((num != "") && (num != "1")) {
            page = num;
        }
        var arg1 = window.location.href.split("#");

        changeTab(num);
        addLoadingFrame();

        var arg2 = "";
        var page = "Home";
        var pageQuery = "";

        if (arg1.length > 1) {
            arg2 = arg1[1].split("?");
            page = arg2[0];
            if (arg2.length > 1) {
                pageQuery = arg2[1];
            }
        }

        var htmIndex = page.indexOf(".htm");
        var pTitleIndex = page.indexOf("[");

        // Placing '[]' at the end of the href attribute tag will overwrite the document title (e.g. #Home.html[My Home Page])
        var pTitle = QikPagesOptions.docTitle;
        if ((pTitleIndex != -1) && (pTitleIndex > htmIndex)) {
            pTitle = page.substring(page.indexOf("[") + 1);
            pTitle = pTitle.replace("]", "");
            page = page.replace("[" + pTitle + "]", "");
        }

        if (htmIndex == -1) {
            page += ".html";
        }

        if (page == ".html") {
            page = "Home.html";
        }

        page = $.trim(page);
        pageQuery = $.trim(pageQuery);
        pTitle = $.trim(pTitle);

        animatePageLoad(page, pageQuery, pTitle);
        SetContentHeight();
    }
    function animatePageLoad(page, query, title) {
        document.title = title;

        if ($(".custom-header-content").length > 0) {
            $(".custom-header-content").parent().height($(".custom-header-content").height() + 25);
        }

        $(".custom-header-content").fadeOut(QikPagesOptions.animationSpeed);
        $("#loadContent").fadeTo(QikPagesOptions.animationSpeed, 0.0, function () {
            $(".custom-header-content").remove();
            checkIfPageExists(page, query);
        });
    }
    function checkIfPageExists(page, query, title) {
        $.ajax({
            url: QikPagesOptions.pageDir + page,
            type: 'HEAD',
            error: function () {
                finishPageLoad(QikPagesOptions.startPage, query, title);
            },
            success: function () {
                finishPageLoad(page, query, title);
            }
        });
    }
    function finishPageLoad(page, query, title) {
        $("#loadContent").load(QikPagesOptions.pageDir + page, function () {

            // Overwrite the document title if title available
            if (($("#loadContent").find("title").length > 0) && (title == QikPagesOptions.docTitle)) {
                var tempTitle = $.trim($("#loadContent").find("title").text());
                if (tempTitle != "") {
                    document.title = tempTitle;
                }
            }

            var ic1Height = 25;
            var $custom_header_content = $("#loadContent").find(".custom-header-content");
            if ($custom_header_content.length > 0) {
                $("#headerContent").prepend($custom_header_content);
                $("#loadContent").find(".custom-header-content").remove();

                ic1Height = $("#headerContent").find(".custom-header-content").height() + 25;
                if ($("#headerContent").find(".custom-header-content").hasClass("collapse")) {
                    ic1Height = 25;
                }
            }

            $("#headerContent").animate({
                height: ic1Height
            }, QikPagesOptions.animationSpeed, function () {
                if ($("#headerContent").find(".custom-header-content").length > 0) {
                    $("#headerContent").find(".custom-header-content").fadeIn(QikPagesOptions.animationSpeed);
                }

                customizedPages(page, query);

                $("#loadContent").fadeTo(QikPagesOptions.animationSpeed, 1.0);
                $("#loading-frame").fadeOut(QikPagesOptions.animationSpeed, function () {
                    $("#loading-frame").remove();
                });
            });
        });
    }
    function customizedPages(page, query) {
        if (page.toLowerCase() == "home.html") {
            $("#headerContent").height(212);
            StartSlideShow();
        }
    }
    function addLoadingFrame() {
        $("#headerContent").append("<div id='loading-frame'>" + QikPagesOptions.loadingText + "</div>");
        $("#loading-frame").fadeIn(QikPagesOptions.animationSpeed);
    }
    function changeTab(page) {
        var $this = $(".nav-main-li").eq(0);
        $(".nav-main-li").each(function (index) {
            $(this).removeClass("nav-main-active");
            var currPage = $(this).find(".nav-main-a").attr("href");
            if (currPage == page) {
                $this = $(".nav-main-li").eq(index);
            }
            else if ($(this).find(".nav-main-li-sub").length > 0) {
                $(this).find(".nav-main-li-sub").find(".nav-main-li-sub-li-a").each(function () {
                    currPage = $(this).attr("href");
                    if (currPage == page) {
                        $this = $(".nav-main-li").eq(index);
                    }
                });
            }
        });

        $this.addClass("nav-main-active");
    }

    function LoadModalWindow(open, element, title) {
        var $thisElement = $("#" + element);
        if (open) {
            $thisElement.css("display", "block");
            $thisElement.find(".Modal-element-align").css({
                marginTop: -($thisElement.find(".Modal-element-modal").height() / 2),
                marginLeft: -($thisElement.find(".Modal-element-modal").width() / 2)
            });

            if (title != "") {
                $thisElement.find(".Modal-title").html(title);
            }

            $thisElement.fadeTo(QikPagesOptions.animationSpeed, 1.0);
        }
        else {
            $thisElement.fadeTo(QikPagesOptions.animationSpeed, 0.0, function () {
                $thisElement.css("display", "none");
                $thisElement.find(".Modal-title").html("");
            });
        }
    }


    $(window).scroll(function () {
        SetScrollHeader();
    });
    function SetScrollHeader() {
        var scrollTop = $(window).scrollTop();
        if (scrollTop >= initHeaderHt && currMode != "mobile") {
            $("#topheader").addClass("topheader-shadow");
            $("#headerContent").addClass("topheader-shadow-adjust");
        }
        else {
            $("#topheader").removeClass("topheader-shadow");
            $("#headerContent").removeClass("topheader-shadow-adjust");
        }
    }



    /* ----------------- CUSTOM CODE BELOW ----------------- */

    // Direction Modal Load
    function OpenDirectionModal() {
        var ver = getInternetExplorerVersion();
        if (ver > -1) {
            if (ver <= 7.0) {
                alert("Your browser does not support this feature!");
                return false;
            }
        }

        var iframe = "<div class='iframe-loadingImage'></div><iframe id='google-maps-dir' src='//maps.google.com/maps?f=q&amp;source=s_q&amp;hl=en&amp;geocode=&amp;q=1700%2BWest%2B25Th%2BSt.%2BKansas%2BCity%2C%2BMO%2B64108&amp;ie=UTF8&amp;z=10&amp;t=m&amp;iwloc=near&amp;output=embed' width='100%' height='300' frameborder='0' style='border: 1px solid #CCC;'></iframe>";
        
        $("#Directions-element").find(".ModalPadContent").html(iframe);
        BuildDirectionElements("dirModal_details");

        $("#google-maps-dir").one("load", function () {
            setTimeout(function () {
                $("#Directions-element").find(".ModalPadContent").find(".iframe-loadingImage").remove();
            }, 500);
        });
        LoadModalWindow(true, 'Directions-element', 'Directions / Map');
    }
    function CloseDirectionModal() {
        LoadModalWindow(false, 'Directions-element', '');
        setTimeout(function () {
            $("#Directions-element").find(".ModalPadContent").html("");
        }, QikPagesOptions.animationSpeed);
    }


    // Slide Show
    function StartSlideShow() {
        if ($("#ssimage").length > 0) {
            var xml = slideshowArray;
            if (xml != null) {
                totalItemsSlideShow = xml.children().length;

                var item = xml.children().eq(currPicNum).children();
                if (currPicNum < totalItemsSlideShow) {
                    try {
                        var img = $.trim(item.eq(1).text());
                        if (img != "") {
                            if ($.trim(item.eq(0).text()) != "") {
                                $(".learnMoreText").html($.trim(item.eq(0).text()));
                            }
                            else {
                                $(".learnMoreText").hide();
                            }

                            $(".learnMoreLnk").html("<a href='#" + $.trim(item.eq(3).text()) + "'>" + $.trim(item.eq(2).text()) + " &rarr;</a>");
                            $("#ssimage").css("background-image", "url(" + img + ")");

                            $("#ssimage").animate({ "background-position": "-70px", opacity: 1, filter: "alpha(opacity=100)" }, QikPagesOptions.animationSpeed, function () {
                                if ($.trim(item.eq(0).text()) != "") {
                                    $(".learnMoreText").fadeIn(QikPagesOptions.animationSpeed / 2);
                                }
                                $(".learnMoreLnk").fadeIn(QikPagesOptions.animationSpeed / 2);
                                ssTimeout1 = setTimeout(function () {

                                    $(".learnMoreText, .learnMoreLnk").fadeOut(QikPagesOptions.animationSpeed);
                                    $('#ssimage').animate({ "background-position": $("#ssimage").width(), opacity: 0, filter: "alpha(opacity=0)" }, QikPagesOptions.animationSpeed, function () {
                                        $('#ssimage').css("background-position", -($("#ssimage").width()));
                                        NextSlideShow();
                                    });
                                }, QikPagesOptions.slideShowSpeed);
                            });
                        }
                        else {
                            NextSlideShow();
                        }
                    }
                    catch (evt) {
                        NextSlideShow();
                    }
                }
            }
        }
        else {
            if (ssTimeout1 != null) {
                clearTimeout(ssTimeout1);
            }
        }
    }
    function PrevSlideShow() {
        currPicNum--;
        if (currPicNum < 0) {
            currPicNum = totalItemsSlideShow - 1;
        }

        if (ssTimeout1 != null) {
            clearTimeout(ssTimeout1);
        }

        StartSlideShow();
    }
    function NextSlideShow() {
        currPicNum++;
        if (currPicNum >= totalItemsSlideShow) {
            currPicNum = 0;
        }

        if (ssTimeout1 != null) {
            clearTimeout(ssTimeout1);
        }

        StartSlideShow();
    }
    $(document.body).on("click", "#slideshow-prev", function () {
        $(".learnMoreText, .learnMoreLnk").fadeOut(QikPagesOptions.animationSpeed);
        $("#ssimage").animate({ "background-position": -($("#ssimage").width()), opacity: 0, filter: "alpha(opacity=0)" }, QikPagesOptions.animationSpeed, function () {
            $('#ssimage').css("background-position", $("#ssimage").width());
            QikPages.PrevSlideShow();
        });
    });
    $(document.body).on("click", "#slideshow-next", function () {
        $(".learnMoreText, .learnMoreLnk").fadeOut(QikPagesOptions.animationSpeed);
        $("#ssimage").animate({ "background-position": $("#ssimage").width(), opacity: 0, filter: "alpha(opacity=0)" }, QikPagesOptions.animationSpeed, function () {
            $('#ssimage').css("background-position", -($("#ssimage").width()));
            QikPages.NextSlideShow();
        });
    });


    // Get Xml Files
    function BuildSlideShowImgs() {
        $.ajax({
            type: "GET",
            url: "Slideshow.xml",
            dataType: ($.browser.msie) ? "text" : "xml",
            success: function (xml) {
                var newXML = parseXml(xml, "Slideshow.xml");
                if (newXML != null) {
                    slideshowArray = $(newXML).find("Items");
                    var url = location.hash;
                    startPageLoad(url == "" ? "1" : url);
                }
            }
        });
    }
    function parseXml(xml, xmlFileName) {
        if ($.browser.msie) {
            if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
                xmlhttp = new XMLHttpRequest();
            }
            else {// code for IE6, IE5
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            }

            xmlhttp.open("GET", xmlFileName, false);
            xmlhttp.send();
            xmlDoc = xmlhttp.responseXML;

            xml = xmlDoc;
        }
        return xml;
    }


    /* ----------------- END CUSTOM CODE ----------------- */


    return {
        initialize: initialize,
        SetContentHeight: SetContentHeight,
        getInternetExplorerVersion: getInternetExplorerVersion,
        loadCSS: loadCSS,
        unloadCSS: unloadCSS,
        LoadModalWindow: LoadModalWindow,
        PrevSlideShow: PrevSlideShow,
        NextSlideShow: NextSlideShow,
        OpenDirectionModal: OpenDirectionModal,
        CloseDirectionModal: CloseDirectionModal,
        startPageLoad: startPageLoad
    }
}();


$(document).ready(function () {
    QikPages.initialize();
    $(window).resize();
});
$(window).resize(function () {
    // Set mobile or desktop view
    var currWidth = $(window).width();
    if (currWidth <= QikPagesOptions.winMinWidth) {
        if (currMode != "mobile") {
            currMode = "mobile";
            QikPages.unloadCSS(QikPagesOptions.desktopCSS);
            QikPages.loadCSS(QikPagesOptions.mobileCSS);
        }
    }
    else {
        if (currMode != "desktop") {
            currMode = "desktop";
            QikPages.unloadCSS(QikPagesOptions.mobileCSS);
            QikPages.loadCSS(QikPagesOptions.desktopCSS);
        }
    }

    setTimeout(function () {
        QikPages.SetContentHeight();
    }, 100);
});