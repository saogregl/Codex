var ThingView2D = (function () {
    "use strict";

    const _EDGE = /Edge\/\d+/.test(navigator.userAgent);
    var _PDFJS;

    //PDF CONSTANTS
    const _markupTypes = {
        note : "note",
        noteLeader : "noteLeader",
        leaderLine : "line",
        leaderLineHeadTail : "lineHeadTail",
        polyline : "multipleLine",
        polyLineHeadTail : "multipleLineHeadTail",
        rectangle : "rectangle",
        rectangleFilled : "rectangleFilled",
        ellipse : "ellipse",
        ellipseFilled : "ellipseFilled",
        polygon : "polygon",
        polygonFilled : "polygonFilled",
        freehand : "freehand",
        textHighlight : "textHighlight",
        textStrikethrough : "textStrikethrough",
        textUnderline : "textUnderline",
        stamp : "stamp"
    };
    Object.freeze(_markupTypes);

    var _pdfText = {
        displaySidebar: 'Display Sidebar',
        firstPage: 'First Page',
        previousPage: 'Previous Page',
        nextPage: 'Next Page',
        lastPage: 'Last Page',
        rotateClockwise: 'Rotate Clockwise',
        rotateAntiClockwise: 'Rotate Anti-clockwise',
        zoomIn: 'Zoom In',
        zoomOut: 'Zoom Out',
        panMode: 'Pan Mode',
        textSelectMode: 'Text Select Mode',
        printPDF: 'Print PDF',
        pageMode: 'Page Mode',
        original: 'Original',
        fitPage: 'Fit Page',
        fitWidth: 'Fit Width',
        searchInput: 'Enter a search term',
        searching: 'Searching for results...',
        searchingPage: 'Searching Page',
        searchNotFound: 'Search term not found',
        matches: 'matches',
        tooltipSearch: 'Search',
        tooltipClear: 'Clear',
        tooltipNext: 'Next',
        tooltipPrevious: 'Previous',
        tooltipClose: 'Close',
        enterPassword: 'Please enter a password.',
        incorrectPassword: 'That password is incorrect.',
        enterPasswordAgain: 'Please try again.'
    };

    const _cursorTypes = {
        text : "text",
        pan : "pan",
        markup : "markup"
    };
    Object.freeze(_cursorTypes);

    const _uiColors = {
        pdfViewer : {
            background : '#80858E',
            textHighlight: '#0000FF'
        },
        toolbar : {
            text : '#FFFFFF',
            background : '#44474B',
            activeButton : '#232B2D',
            menuButton: '#4D5055',
            subMenuButton: '#616469',
            activeText: '#000000'
        },
        sidebar : {
            background : '#656872',
            navBorder : '#80858E',
            tab : '#3B4550',
            text : '#FFFFFF'
        },
        markup : {
            line : '#FF0000',
            noteFill : '#F5F4EA',
            selectedLine : "#0000FF",
            highlight: "rgb(255,171,0)",
            underline: "rgb(106,217,38)",
            white: "#FFFFFF",
            transparent: "rgba(255,255,255,0)"
        },
        anchor : {
            fill: 'rgba(230,51,179,0.7)',
            box: 'rgb(77,204,153)',
            boxFill: 'rgba(255,255,255,0)'
        },
        rotator : {
            fill: 'rgba(230,51,179,0.7)'
        }
    };
    Object.freeze(_uiColors);

    const _uiSizes = {
        anchor : {
            width : 20,
            height : 20,
            boxLine : 1,
            boxMargin : 10,
        },
        rotator : {
            radius : 10,
            length : 5
        },
        highlight : {
            margin : 5
        },
        noteMarkup : {
            padding: [1, 2.5, 1.5, 2],
            minWidth: 10,
            minHeight: 10
        }
    };
    Object.freeze(_uiSizes);

    const _noteDefaults = {
        fontColor: "#FF0000",
        fontFamily: "Helvetica,sans-serif",
        fontSize: 12,
        textAlignment: "left",
        minWidth: 10
    };
    Object.freeze(_noteDefaults);

    const _zIndex = {
        dynamicCanvas: "5",
        toolbarSearchBox: "5",
        text: "4",
        markupPrint: "4",
        markup: "3",
        watermark: "2",
        textHidden: "-1"
    };
    Object.freeze(_zIndex);

    const _maxCanvasLength = 16384;
    /**
     * Limit of zoom ratio.
     * i.e. 0.1 is 10%, 10 is 1000%
     * @constant
     * @type {number}
     */
    const _zoomLimit = {
        /** Min/max of SVG document */
        svgMin: 0.15,
        svgMax: 10.0,
        /** Min/max of PDF document */
        pdfMin: 0.1,
        pdfMax: 10.0
    };
    Object.freeze(_zoomLimit);
    const _scrollPadding = 17;

    const _refreshMode = {
        none: "none",
        zoom: "zoom",
        rotCw: "rotateClockwise",
        rotCcw: "rotateCounterClockwise"
    };

    const _watermark = {
        visible: false,
        global: {},
        document: [],
        drawing: []
    };
    _watermark.reset = function () {
        this.visible = false;
        this.global = {};
        this.document = [];
        this.drawing = [];
    };

    const _noteDefaultProps = {
        alpha: 1.0,
        textColor: [0.13, 0.13, 0.13],   // #333333
        textBGColor: [0.96, 0.96, 0.92], // #F5F4EA
        fontSize: 10,
        lineColor: [1.0, 0.0, 0.0], // #FF0000
        head: "None"
    };

    const _lineDefaultProps = {
        alpha: 1.0,
        lineColor: [1.0, 0.0, 0.0], // #FF0000
        head: "None", // ClosedArrow, Circle
        tail: "None"
    };

    const _shapeDefaultProps = {
        alpha: 0.5,
        lineColor: [1.0, 0.0, 0.0], // #FF0000
    };

    const _freehandDefaultProps = {
        alpha: 1.0,
        lineColor: [1.0, 0.0, 0.0], // #FF0000
    };

    const _borderDefaultProps = {
        width: 1,   // 3, 5
        style: 'S', // D
        pattern: [] // s1, s2
    };

    const _markupPropsCV = {
        shapeColor: [1.0, 0.0, 0.0],
        setShapeColor: true,
        opacity: 0.5,
        lineWeight: 1,
        lineStyle: 0,
        headStyle: "None",
        tailStyle: "None",
        fontSize: 10,
        textColor: [1.0, 0.0, 0.0],
        lineColor: [1.0, 0.0, 0.0]
    };

    const _annotFlagsDefaults = {
        invisible: false,
        hidden: false,
        print: true,
        noZoom: false,
        noRotate: false,
        noView: false,
        readOnly: false,
        locked: false,
        toggleNoView: false,
        lockedContents: false
    };

    const _svgNS = "http://www.w3.org/2000/svg";
    const _xlinkNS = "http://www.w3.org/1999/xlink";
    const _xhtmlNS = "http://www.w3.org/1999/xhtml";

    // defines the markers used in creating the heads and tails of various markups
    const _svgMarkerPresets = {
        ClosedArrowHead: {
            viewBox: "-7 -1 12 11.8",
            width: "24", height: "11",
            refX: "-7", refY: "3",
            pathD: "M0,0 L-6,3 L0,6 Z"
        },
        ClosedArrowTail: {
            viewBox: "0 -1 12 12",
            width: "12", height: "12",
            refX: "7", refY: "3",
            pathD: "M0,0 L6,3 L0,6 Z"
        },
        ClosedArrowNote: {
            width: "11", height: "11",
            refX: "3", refY: "6",
            pathD: "M2,6 L9,1 L9,10 Z"
        },
        OpenArrow: {
            width: "11", height: "11",
            refX: "3", refY: "6",
            pathD: "M9,1 L2,6 L9,10"
        },
        OpenArrowNote: {
            viewBox: "0 -4 5 10",
            width: "11", height: "11",
            refX: "-1", refY: "0",
            pathD: "M6,3 L0,0 L6,-3",
        },
        Circle: {
            width: "9", height: "9",
            refX: "5", refY: "5",
            cx: "5", cy: "5", cr: "2"
        },
        CircleNote: {
            width: "9", height: "9",
            refX: "5", refY: "5",
            cx: "5", cy: "5", cr: "2"
        }
    };

    var _currentCanvasId = "";
    var _parentCanvasId = "";
    //SVG VARS
    var _calloutColors = [];
    var _calloutsSelected = [];
    var _partColors = [];
    var _partsSelected = [];
    var _svgCalloutCB;
    var _zoomWindow = false;
    var _zoomButton = false;
    var _zoomButtonScale;
    const _calloutControls = {
        startX: 0,
        startY: 0,
        touchMoved: false
    };
    _calloutControls.reset = function () {
        this.startX = 0;
        this.startY = 0;
        this.touchMoved = false;
    };
    const _svgControls = {
        deselect: {
            x: 0,
            y: 0
        },
        drag: {
            x: 0,
            y: 0,
            state: false,
        },
        rightClickDrag: {
            x: 0,
            y: 0,
            lastY: 0,
            state: false
        },
        zoomDrag: {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
            state: false
        },
        zoomPinch: {
            xCenter: 0,
            yCenter: 0,
            oldXs : {},
            oldYs : {},
            newXs : {},
            newYs : {},
            state: false
        },
        twoPointDrag: {
            x: 0,
            y: 0,
            state: false,
        },
        touchMoved: false,
        lastTap: 0,
        rectCanvas: null
    };
    _svgControls.reset = function () {
        this.deselect.x = this.deselect.y = 0;
        this.drag.x = this.drag.y = 0;
        this.drag.state = false;
        this.rightClickDrag.x = this.rightClickDrag.y = this.rightClickDrag.lastY = 0;
        this.rightClickDrag.state = false;
        this.zoomDrag.x1 = this.zoomDrag.y1 = 0;
        this.zoomDrag.x2 = this.zoomDrag.y2 = 0;
        this.zoomDrag.state = false;
        this.zoomPinch.xCenter = this.zoomPinch.yCenter = 0;
        this.zoomPinch.oldXs = {};
        this.zoomPinch.oldYs = {};
        this.zoomPinch.newXs = {};
        this.zoomPinch.newYs = {};
        this.zoomPinch.state = false;
        this.twoPointDrag.x = this.twoPointDrag.y = 0;
        this.twoPointDrag.state = false;
        this.touchMoved = false;
        this.lastTap = 0;
        this.rectCanvas = null;
    };

    //PDF VARS
    var __PDF_DOC = null;
    var __CURRENT_PAGE = 0;
    var __TOTAL_PAGES = 0;
    var __ZOOMSCALE = 1;
    var _pdfCallback = null;
    var _hyperlinkCallback = null;
    var _layerStateCallback = null;
    var _pageMode = "Original";

    var _cursor = {current: "text", cached: null, callback: null};

    var _ignoreScrollEvent = false;
    var _ignoreNavScrollEvent = false;
    var _ignoreWrapperScroll = false;
    var _refreshingPDF = false;
    var _nextRefreshEvent = null;
    var _scrollTimer = null;
    var _marginSize = 10;
    var _zoomInScale = 1.2;
    var _zoomOutScale = 0.8;
    var _largestWidth = 0;
    var _largestHeight = 0;
    var _largestZoomScale = 10;
    var _toolbarEnabled = false;
    var _toolbarHeight = 40;
    var _miniToolbar = false;
    var _toolbarFullContainerWidth = 0;
    var _toolbarGroups = {pages: true, zoom: true, cursor: true, search: true, sidebar: true, rotate: true, print: true};
    var _firstLoadedPage = 0;
    var _lastLoadedPage = 0;
    var _orderToShowPages = [];
    var _bookmarks = [];
    var _optionalContentConfig = null;
    var _documentLoaded = false;
    var _textSelection = null;
    var _annoSelection = [];
    var _sidebarEnabled = false;
    var _navbar = {enabled: true, firstLoadedPage: 0, lastLoadedPage: 0, selectedPage: 0, bufferSize: 5};
    var _navSidebarWidth = 200;
    const _navSidebarWidthMin = 200;
    const _navSidebarWidthMax = 500;
    var _navSidebarResizeWidth = 5;
    var _navWrapperMargin = 10;
    var _navWrapperBorder = 6;
    var _navCallbackRegistered = false;
    var _bookmarksBar = {enabled: false};
    var _sidebarResize = false;
    var _searchDrag = {enabled: false, x: 0, y: 0};
    var _pageRotation = 0;
    var _print = null;
    var _printEnabled = true;
    var _prefetchedPage = null;
    var _printCallback = null;
    var _printDocCursor = "";
    var _pdfAnnotationId = -1;
    const _pdfAnnotationSetLayerState = {
        prev: [],
        cur: []
    };
    _pdfAnnotationSetLayerState.reset = function () {
        this.prev = this.cur;
        this.cur = [];
    };
    var _pdfAnnotationSetCurrentPage = 0;
    var _pdfParsedAnnotationSet = [];
    var _filterPdfMarkups = false;
    var _pageAnnoSetList = {};
    var _scrollOffset = null;
    const _pdfControls = {
        drag: {
            x: 0,
            y: 0,
            state: false
        },
        lastTap: 0
    };
    _pdfControls.reset = function () {
        this.drag.x = this.drag.y = 0;
        this.drag.state = false;
        this.lastTap = 0;
    };

    //PDF Markup Creation
    const _markupMode = {
        alteredCB: null,
        on: false,
        type: null,
        mouse: {
            xStart: null,
            yStart: null,
            xEnd: null,
            yEnd: null,
            xVect: [],
            yVect: [],
            jitter: 2,
            endThreshold: 11,
            pageNo: null,
            down: false,
            drag: false,
            pick: false
        },
        selectedAnnotations: [],
        hiddenSelectedAnnotations: [],
        options: null
    };
    _markupMode.mouse.reset = function () {
        this.xStart = null;
        this.yStart = null;
        this.xEnd = null;
        this.yEnd = null;
        this.xVect = [];
        this.yVect = [];
        this.pageNo = null;
        this.down = false;
        this.drag = false;
        this.pick = false;
    };

    const _markupEdit = {
        move: false,
        edit: false,
        idNo: -1,
        preventDeselect: false,
        viewDirty: false,
        cachedX: -1,
        cachedY: -1,
        drag: {
            x: -1,
            y: -1,
            index: -1,
            target: null,
            state: false,
            dirty: false
        },
        note: {
            idNo: -1,
            zoom: 1,
            pageRotated: false
        }
    };
    _markupEdit.drag.reset = function () {
        this.x = this.y = this.index = -1;
        this.target = null;
        this.state = this.dirty = false;
    };

    const _undoPresets = {
        create: "create",
        delete: "delete",
        hide: "hide",
        unhide: "unhide",
        move: "move",
        resize: "resize",
        apply: "apply",
        noteEdit: "edit note",
        applyToView: "applyToView"
    };
    Object.freeze(_undoPresets);

    const _markupHistory = {
        stack: [],
        layerStateStack: [],
        index: -1
    };
    _markupHistory.reset = function () {
        this.stack = [];
        this.layerStateStack = [];
        this.index = -1;
    };

    const _markupGroupOp = {
        running: false,
        idNos: [],
        action: ""
    };
    _markupGroupOp.reset = function () {
        this.running = false;
        this.idNos = [];
        this.action = "";
    };

    const _noteCursorLocator = {
        rotation: -1,
        rect: null
    };
    _noteCursorLocator.reset = function () {
        this.rotation = -1;
        this.rect = null;
    }

    var _pendingUpdatePassword = null;

    //PDF Template
    var _pageWrapperTemplate = null;
    var _textLayerTemplate = null;
    var _watermarkCanvasTemplate = null;
    var _watermarkLayerTemplate = null;
    var _annotationTemplate = null;
    var _canvasTemplate = null;
    var _navWrapperTemplate = null;
    var _navAnnotationCanvasTemplate = null;
    var _printDivTemplate = null;
    var _printWrapperTemplate = null;
    var _printPageTemplate = null;
    var _printMarkupTemplate = null;

    //PDF Search
    var _pdfSearchCallback = null;
    var _searchResultsCase = false;
    var _searchResultsWord = false;
    var _searchTerm = "";
    var _searchCaseMatch = false;
    var _searchWordMatch = false;
    var _extractTextPromises = [];
    var _pageMatches = [];
    var _matchesCountTotal = 0;
    var _indexedPageNum = 0;
    var _pageContents = [];
    var _scrollMatches = false;
    var _findTimeout = null;
    var _searchState = null;
    var _dirtyMatch = false;
    var _selected = {
        pageIdx: -1,
        matchIdx: -1
    };
    var _offset = {
        pageIdx: null,
        matchIdx: null,
        wrapped: false
    };
    var _resumePageIdx = null;
    var _pendingFindMatches = Object.create(null);
    var _matchSelected = {
        pageIdx:  -1,
        matchIdx: -1
    };
    var _pagesToSearch = null;
    var _charactersToNormalize = {
        "\u2018": '\'',
        "\u2019": '\'',
        "\u201A": '\'',
        "\u201B": '\'',
        "\u201C": '"',
        "\u201D": '"',
        "\u201E": '"',
        "\u201F": '"',
        "\xBC": '1/4',
        "\xBD": '1/2',
        "\xBE": '3/4'
    };
    var _normalizationRegex = null;

    //PDF MARKUP OBSERVER
    var _markupObserver = null;

    function MarkupObserver() {
        var callbacks = {};

        return {
            set: function(key, value, op){
                if (callbacks[key]) {
                    callbacks[key].forEach(function(callback){
                        callback(value, op);
                    });
                }
            },

            addCallback: function(key, callbackToAdd){
                if (!callbacks[key]) {
                    callbacks[key] = [];
                }
                callbacks[key].push(callbackToAdd);
            },

            removeCallback: function(key, callbackToRemove){
                if (callbacks[key]) {
                    callbacks[key] = callbacks[key].filter(function (callback) {
                        return callback !== callbackToRemove;
                    });
                }
            }
        };
    }

    function normalize(text) {
        if (!_normalizationRegex) {
            var replace = Object.keys(_charactersToNormalize).join('');
            _normalizationRegex = new RegExp("[".concat(replace, "]"), 'g');
        }

        return text.replace(_normalizationRegex, function (ch) {
            return _charactersToNormalize[ch];
        });
    }

    //Public Functions
    var returnObj = {
        //SHARED
        LoadDocument: function (viewable, parentCanvasId, model, watermark, isWindowless, callback){
          _resetPdfAnnotationSet();
          _LoadDocument(viewable, parentCanvasId, model, watermark, isWindowless, callback);
        },
        LoadPDF: function (parentCanvasId, val, isUrl, watermark, isWindowless, callback){
           _resetPdfAnnotationSet();
           _LoadPdfDocument(parentCanvasId, val, isUrl, watermark, isWindowless, callback);
        },
        Destroy2DCanvas: function() {
            _destroy2DCanvas();
        },
        ResetTransform: function(elem){
          _resetTransform(elem);
        },
        SetZoomOnButton: function(scale){
            if (_zoomWindow) {
                _setZoomWindow();
            }
            _setZoomOnButton(scale);
        },
        //SVG
        IsSVGSession: function() {
            return _IsSVGSession();
        },
        ResetTransformSVG: function(){
            if (_zoomButton) {
                _setZoomOnButton(_zoomButtonScale);
            }
            _resetTransform(document.getElementById(_currentCanvasId).childNodes[0]);
        },
        SetZoomWindow: function(){
            if (_zoomButton) {
                _setZoomOnButton(_zoomButtonScale);
            }
            _setZoomWindow();
        },
        GetCallouts: function(){
            return _getCallouts();
        },
        SelectCallout: function (callout) {
            if (_calloutsSelected.indexOf(callout.id) == -1) {
                _selectCallout(callout);
            }
        },
        DeselectCallout: function(callout){
            if(_calloutsSelected.indexOf(callout.id) != -1){
                _deselectCallout(callout);
                var index = _calloutsSelected.indexOf(callout.id);
                if (index !=-1){
                    _calloutsSelected.splice(index,1);
                }
            }
        },
        GetSVGParts: function(partNo){
            return _getSVGParts(partNo);
        },
        SetSVGCalloutCallback: function(callback){
            if(typeof callback === "function"){
                _svgCalloutCB = callback;
            }
        },
        //PDF
        CreatePDFSession: function(parentCanvasId, callback) {
            _createPDFSession(parentCanvasId, callback);
        },
        SetPDFCallback: function (callback) {
            if (typeof callback === "function"){
                _pdfCallback = callback;
            }
        },
        SetHyperlinkCallback: function (callback) {
            if (typeof callback === "function") {
                _hyperlinkCallback = callback;
            }
        },
        SetLayerStateChangeCallback : function (callback) {
            if (typeof callback === "function") {
                _layerStateCallback = callback;
            }
        },
        IsPDFSession: function() {
            return _IsPDFSession();
        },
        LoadPrevPage: function (callback) {
            _LoadPrevPage(callback);
        },
        LoadNextPage: function (callback) {
            _LoadNextPage(callback);
        },
        LoadPage: function (callback, pageNo) {
            _LoadPage(callback, parseInt(pageNo));
        },
        GetCurrentPDFPage: function () {
            if (_IsPDFSession()){
                return __CURRENT_PAGE;
            }
        },
        GetTotalPDFPages: function () {
            if (_IsPDFSession()){
                return __TOTAL_PAGES;
            }
        },
        GetPdfBookmarks: function() {
            if(_IsPDFSession()){
                return _bookmarks;
            }
        },
        GetPdfLayers: function () {
            if(_IsPDFSession()){
                return _getPdfLayers();
            }
        },
        SetLayerStatus: function (layerStatus) {
            if(_IsPDFSession()){
                _setLayerStatus(layerStatus);
            }
        },
        SetDocumentLoaded: function() {
            if(_IsPDFSession()){
                _documentLoaded = true;
            }
        },
        GetDocumentLoaded: function() {
            if(_IsPDFSession()){
                return _documentLoaded;
            }
        },
        ResetTransformPDF: function(){
            if(_zoomButton) {
                _setZoomOnButton(_zoomButtonScale);
            }
            _resetTransformPDF();
        },
        SetPageModePDF: function(pageMode){
            if(_IsPDFSession()){
                _pageMode = pageMode;
                _setPageModePDF();
            }
        },
        SetPageModePDFWithCB: function(pageMode, callback){
            if(_IsPDFSession()){
                _pageMode = pageMode;
                _setPageModePDF(callback);
            }
        },
        SetPanModePDF: function(){
            if(_IsPDFSession()){
                if (_zoomButton) {
                    _setZoomOnButton(_zoomButtonScale);
                }
                if (_cursor.current == _cursorTypes.markup) {
                    _togglePdfMarkupMode(null);
                }
                _cursor.current = _cursorTypes.pan;
                _setUserSelect();
                if (_cursor.callback) {
                    _cursor.callback(_cursorTypes.pan);
                }
            }
        },
        SetTextModePDF: function(){
            if(_IsPDFSession()){
                if (_zoomButton) {
                    _setZoomOnButton(_zoomButtonScale);
                }
                if (_cursor.current == _cursorTypes.markup) {
                    _togglePdfMarkupMode(null);
                }
                _cursor.current = _cursorTypes.text;
                _setUserSelect();
                if (_cursor.callback) {
                    _cursor.callback(_cursorTypes.text);
                }
            }
        },
        /**
        * Change the cursor mode to or from "Markup" and enter / exit markup creation mode
        * @method SetMarkupModePDF
        * @param {string} markupType the type of markup to create (null if switching off)
        *  markupType can be:
        *   "note" - plain note
        *   "noteLeader" - note with leader line
        *   "line" - plain single leader line
        *   "lineHeadTail" - single leader line with a head and tail
        *   "multipleLine" - plain leader line with multiple branches
        *   "multipleLineHeadTail" - leader line with multiple branches, head and tail
        *   "rectangle" - hollow (not filled) rectangle
        *   "rectangleFilled" - filled rectangle
        *   "ellipse" - hollow ellipse
        *   "ellipseFilled" - filled ellipse
        *   "polygon" - hollow polygon
        *   "polygonFilled" - filled polygon
        *   "freehand" - freehand
        *   "textHighlight" - text highlight
        *   "textStrikethrough" - text strikethrough
        *   "textUnderline" - text underline
        *   "stamp" - stamp
        * @param {array} options reserved for Stamps for now
        * @public
        * @memberof ThingView
        **/
        SetMarkupModePDF : function (markupType, options) {
            if (_IsPDFSession()) {
                if (_zoomButton) {
                    _setZoomOnButton(_zoomButtonScale);
                }
                if (markupType != null) {
                    _confirmNoteChanges();
                    _clearPdfAnnoSelection();
                    _applyPdfMarkupProperties(markupType);
                    if (!_cursor.cached) {
                        _cursor.cached = _cursor.current;
                    }
                    _cursor.current = _cursorTypes.markup;
                    if (_cursor.cached == _cursorTypes.text &&
                        !(markupType == _markupTypes.textHighlight ||
                          markupType == _markupTypes.textStrikethrough ||
                          markupType == _markupTypes.textUnderline)) {
                        _setUserSelect();
                    }
                    _togglePdfMarkupMode(markupType, options);
                } else {
                    if (_markupMode.type == _markupTypes.note || _markupMode.type == _markupTypes.noteLeader) {
                        _markupMode.on = false;
                        _createNoteMarkup();
                    }
                    _confirmNoteChanges();
                    if (_cursor.cached == _cursorTypes.pan) {
                        this.SetPanModePDF();
                    } else if (_cursor.cached == _cursorTypes.text) {
                        this.SetTextModePDF();
                    }
                    _cursor.cached = null;
                    _markupMode.mouse.reset();
                    _markupMode.options = null;
                    _removeDynamicMarkupCanvas();
                }
            }
        },
        /**
        * Set the function to call (back to the external application) when the cursor mode changes
        * Should be called when a pdf is first loaded
        * Callback will be called with the type of cursor mode as
        * a parameter (string: "text", "pan", or "markup")
        * @param {SetPdfCursorCallback} callback The function to call when cursor mode is changed
        * @public
        * @memberof ThingView
        **/
        SetPdfCursorCallback: function (callback) {
            if (_IsPDFSession()) {
                _cursor.callback = callback;
            }
        },
        SetPdfToolbar: function(parentId, enabled, groups) {
            if(_IsPDFSession()){
                var parent = document.getElementById(parentId);
                _toolbarEnabled = enabled;
                if (groups) {
                    _toolbarGroups = groups;
                }
                if (enabled) {
                    _DisplayDocumentToolbar(parent, _toolbarGroups);
                    _resizeDocumentToolbar(parent, _toolbarGroups);
                    _updateDocumentToolbarPageDisplay();
                    _observeMouseDown();
                } else {
                    _RemoveDocumentToolbar(parent);
                }
            }
        },
        SetPdfToolbarGroups: function (groups) {
            _toolbarGroups = groups;
            if (groups) {
                _toolbarGroups = groups;
            }
        },
        ShowPdfBookmark: function(bookmarkTitle) {
            if(_IsPDFSession()){
                _ShowPdfBookmark(bookmarkTitle);
            }
        },
        SearchInPdfDocument: function(searchTerm, callback, findDirection){
            if(_IsPDFSession() && searchTerm != ""){
                _SearchInPdfDocument(searchTerm, findDirection, callback);
            }
        },
        ClearPdfDocumentSearch: function () {
            if(_IsPDFSession()){
                _searchTerm = "";
                _removePdfSearchResultHighlights ();
            }
        },
        FocusNextPdfDocumentSearch: function () {
            if(_IsPDFSession() && _searchState) {
                _searchState.highlightAll = false;
                _searchState.findPrevious = false;
                _nextMatch();
            }
        },
        FocusPrevPdfDocumentSearch: function () {
            if(_IsPDFSession() && _searchState) {
                _searchState.highlightAll = false;
                _searchState.findPrevious = true;
                _nextMatch();
            }
        },
        FocusAllPdfDocumentSearch: function() {
            if(_IsPDFSession() && _searchState) {
                _searchState.highlightAll = true;
                _searchState.findPrevious = false;
                _checkCurrentPagesSearched();
            }
        },
        SetPdfSearchCaseMatch: function (matchCase) {
            if(_IsPDFSession()){
                _searchCaseMatch = matchCase;
            }
        },
        SetPdfSearchWordMatch: function (matchWord) {
            if(_IsPDFSession()){
                _searchWordMatch = matchWord;
            }
        },
        TogglePdfSidePane: function () {
            if (_IsPDFSession()) {
                _togglePdfSidePane();
            }
        },
        RotateDocumentPages: function (clockwise) {
            if (_IsPDFSession()) {
                _RotateDocumentPages(clockwise);
            }
        },
        PrintPdf: function () {
            if (_IsPDFSession() && _printEnabled) {
                _PrintPdf(document.getElementById(_parentCanvasId));
            }
        },
        LoadPdfAnnotationSet: function(documentViewable, parentCanvasId, docScene, structure, annoSet, isWindowless, documentCallback) {
            _LoadPdfAnnotationSet(documentViewable, parentCanvasId, docScene, structure, annoSet, isWindowless, documentCallback);
        },
        ApplyPdfAnnotationSet: function(annoSet, documentCallback, clearExisting) {
            _ApplyPdfAnnotationSet(annoSet, documentCallback, clearExisting);
        },
        GetLoadedPdfAnnotationSetFdf: function(docScene, author, filePath, callback) {
            _GetLoadedPdfAnnotationSetFdf(docScene, author, filePath, callback);
        },
        ZoomOnButtonPdf: function(scale) {
            _zoomButtonScale = scale;
            _zoomButtonPDF();
        },
        ZoomAllButtonPdf: function(){
            if(_IsPDFSession()){
                _pageMode = "FitZoomAll";
                _setPageModePDF();
            }
        },
        GetPdfPrintBuffers: function(firstPage, lastPage, width, height, showWatermarks, callback) {
            if(_IsPDFSession() && _printEnabled) {
                if (firstPage == null) {
                    firstPage = 1;
                }
                if (lastPage == null) {
                    lastPage = __TOTAL_PAGES;
                }
                if (firstPage > lastPage) {
                    var tempPage = firstPage;
                    firstPage = lastPage;
                    lastPage = tempPage;
                }
                firstPage = Math.min(Math.max(firstPage, 1), __TOTAL_PAGES);
                lastPage = Math.max(Math.min(lastPage, __TOTAL_PAGES), 1);

                showWatermarks = (showWatermarks || false);

                _GetPdfPrintBuffers(document.getElementById(_parentCanvasId), firstPage, lastPage, width, height, showWatermarks, callback);
            }
        },
        GetSinglePdfPrintBuffer : function(params, callback) {
            if(_IsPDFSession() && _printEnabled) {
                const pageNo = params.pageNo;
                const width = params.minWidth;
                const height = params.minHeight;
                const showWatermarks = (params.includeWatermarks || false);

                _GetPdfPrintBuffers(document.getElementById(_parentCanvasId), pageNo, pageNo, width, height, showWatermarks, callback);
            }
        },
        SetPdfMarkupsFilter : function(filterOn) {
            if(_IsPDFSession()) {
                _setPdfMarkupsFilter(filterOn);
            }
        },
        GetPdfMarkupsFilter : function() {
            if (_IsPDFSession()) {
                return _filterPdfMarkups;
            }
        },
        SetMarkupAlteredCallback : function (callback) {
            if (callback) {
                _markupMode.alteredCB = callback;
            }
        },
        SelectPdfMarkup : function (idNo, selected) {
            if (_IsPDFSession()) {
                _handleSelectPdfAnnoAPI(idNo, selected);
            }
        },
        ClearPdfMarkupSelection : function () {
            if (_IsPDFSession()) {
                _clearPdfAnnoSelection();
            }
        },
        DeletePdfMarkup : function (idNo) {
            if (_IsPDFSession()) {
                _handleDeletePdfAnnoAPI(idNo);
            }
        },
        AddDeletedPdfMarkup : function (idNo) {
            if (_IsPDFSession()) {
                _handleAddDeletedPdfAnnoAPI(idNo);
            }
        },
        SetPdfMarkupVisibility : function (idNo, visible) {
            if (_IsPDFSession()) {
                _handleSetPdfMarkupVisibility(idNo, visible);
            }
        },
        SetPdfMarkupProperties : function (properties) {
            if (_IsPDFSession()) {
                _handleSetPdfMarkupProperties(properties);
            }
        },
        UndoPdfMarkupAction : function () {
            if (_IsPDFSession()) {
                _undoPdfMarkupAction();
            }
        },
        RedoPdfMarkupAction : function () {
            if (_IsPDFSession()) {
                _redoPdfMarkupAction();
            }
        },
        BeginPdfOperationGroup : function () {
            if (_IsPDFSession()) {
                _beginPdfOperationGroup();
            }
        },
        EndPdfOperationGroup : function () {
            if (_IsPDFSession()) {
                _endPdfOperationGroup();
            }
        },
        //PDF MARKUP OBSERVER CALLBACKS
        SetAnnotationSetLoadedCallback : function (callback) {
            if (callback && _markupObserver) {
                _markupObserver.addCallback("annoSetLoaded", callback);
            }
        },
        SetAnnotationSelectedCallback : function (callback) {
            if (callback && _markupObserver) {
                _markupObserver.addCallback("annoSelected", callback);
            }
        },
        SetAnnotationDeletedCallback : function (callback) {
            if (callback && _markupObserver) {
                _markupObserver.addCallback("annoDeleted", callback);
            }
        },
        SetAnnotationCreatedCallback : function (callback) {
            if (callback && _markupObserver) {
                _markupObserver.addCallback("annoCreated", callback);
            }
        },
        SetAnnotationVisibilityCallback : function (callback) {
            if (callback && _markupObserver) {
                _markupObserver.addCallback("annoVisChanged", callback);
            }
        },
        SetAnnotationSetEditedCallback : function (callback) {
            if (callback && _markupObserver) {
                _markupObserver.addCallback("annoSetEdited", callback);
            }
        },
        SetAnnotationModeCompleteCallback : function (callback) {
            if (callback && _markupObserver) {
                _markupObserver.addCallback("annoModeComplete", callback);
            }
        },
        SetAnnotationUndoActionAddedCallback : function (callback) {
            if (callback && _markupObserver) {
                _markupObserver.addCallback("annoUndoActionAdded", callback);
            }
        },
        SetDocumentPassword : function (pswd) {
            _SetDocumentPassword(pswd);
        },
        CancelDocumentLoad: function (callback) {
            _CancelDocumentLoad(callback);
        },
        LoadWatermark: function (params) {
            const fileName = params.fileName;
            if (fileName) {
                _loadWatermarks({
                    url: fileName,
                    visible: params.isVisibleInView
                });
            } else {
                _watermark.visible = false;
                _showWatermarks(false);
            }
        },
        SetWatermarkVisibility: function (visible) {
            if (_watermark.visible != visible) {
                _watermark.visible = visible;
                _showWatermarks(visible);
            }
        },
        ApplyPDFLocalisation: function (localisationObj) {
            _pdfText = localisationObj;
        },
        BeginCapturePreview: function () {
            if (_IsPDFSession()) {
                _showContentOnly(true);
            }
        },
        EndCapturePreview: function () {
            if (_IsPDFSession()) {
                _showContentOnly(false);
            }
        },
        LOAD_EVENT : {
            NEED_PASSWORD : 'need_password',
            WRONG_PASSWORD : 'wrong_password',
            LOAD_SUCCESS : 'load_success',
            LOAD_FAILURE : 'load_failure'
        }
    };

    extendObject(ThingView, returnObj);

    //Private Functions

    //SHARED
    function extendObject (obj1, obj2) {
        for (var key in obj2) {
            if (obj2.hasOwnProperty(key)) {
                obj1[key] = obj2[key];
            }
        }
        return obj1;
    }

    function _LoadDocument(viewable, parentCanvasId, model, watermark, isWindowless, callback){
        _markupObserver = null;
        _navCallbackRegistered = false;
        if(viewable && model){
            if(viewable.type==Module.ViewableType.DOCUMENT && viewable.fileSource.indexOf(".pdf", viewable.fileSource.length - 4) != -1){
                if (!_IsPDFSession()){
                    _createPDFSession(parentCanvasId, function(){
                        _cursor.current = _cursorTypes.text;
                        _pageMode = "Original";
                        _bookmarks = [];
                        _optionalContentConfig = null;
                        _documentLoaded = false;
                        _markupObserver = MarkupObserver();
                        _markupMode.selectedAnnotations = [];
                        _markupMode.hiddenSelectedAnnotations = [];
                        _pdfParsedAnnotationSet = [];
                        model.GetFromLoadedDataSource(viewable.idPath, viewable.index, function(val){
                            _LoadPDF(val, false, callback, isWindowless, watermark);
                        });
                    });
                } else {
                    _cursor.current = _cursorTypes.text;
                    _pageMode = "Original";
                    _bookmarks = [];
                    _optionalContentConfig = null;
                    _documentLoaded = false;
                    _markupObserver = MarkupObserver();
                    _markupMode.selectedAnnotations = [];
                    _markupMode.hiddenSelectedAnnotations = [];
                    _pdfParsedAnnotationSet = [];
                    model.GetFromLoadedDataSource(viewable.idPath, viewable.index, function(val){
                        _LoadPDF(val, false, callback, isWindowless, watermark);
                    });
                }
            }
            else if (viewable.type==Module.ViewableType.ILLUSTRATION && viewable.fileSource.indexOf(".svg", viewable.fileSource.length - 4) != -1){
                if(!_IsSVGSession()){
                    _createSVGSession(parentCanvasId);
                }
                model.GetFromLoadedDataSource(viewable.idPath, viewable.index, function(val){
                    _LoadSVG(decodeURIComponent(escape(val)), callback);
                });
            } else {
                if (callback) callback(false);
            }
        } else {
            if (callback) callback(false);
        }
    }

    function _LoadPdfDocument (parentCanvasId, pdfVal, isUrl, watermark, isWindowless, callback){
        _markupObserver = null;
        _navCallbackRegistered = false;
        if (parentCanvasId && pdfVal) {
            if (!_IsPDFSession()){
                _createPDFSession(parentCanvasId, function(){
                    _documentLoaded = false;
                    _markupObserver = MarkupObserver();
                    _cursor.current = _cursorTypes.text;
                    _pageMode = "FitWidth";
                    _bookmarks = [];
                    _optionalContentConfig = null;
                    _markupMode.selectedAnnotations = [];
                    _markupMode.hiddenSelectedAnnotations = [];
                    _LoadPDF(pdfVal, isUrl, callback, isWindowless, watermark);
                });
            } else {
                _documentLoaded = false;
                _markupObserver = MarkupObserver();
                _cursor.current = _cursorTypes.text;
                _pageMode = "FitWidth";
                _bookmarks = [];
                _optionalContentConfig = null;
                _markupMode.selectedAnnotations = [];
                _markupMode.hiddenSelectedAnnotations = [];
                _LoadPDF(pdfVal, isUrl, callback, isWindowless, watermark);
            }
        }
    }

    function _resetTransform(elem){
        _setTransformMatrix(elem, 1, 0, 0, 1, 0, 0);
    }

    function _destroy2DCanvas(){
        _removeWindowEventListenersSVG();
        _removeWindowEventListenersPDF();
        var currentCanvas = document.getElementById(_currentCanvasId);
        var parent = currentCanvas.parentNode;
        parent.style.cursor = "";
        parent.removeChild(currentCanvas);
        if(_IsPDFSession()){
            _RemoveDocumentToolbar(parent.parentNode);
            _RemovePdfSideBar (parent.parentNode);
            parent.parentNode.removeChild(document.getElementById("CreoDocumentScrollWrapper"));
        }
        _currentCanvasId = "";
        _documentLoaded = false;
    }

    //SVG
    function _createSVGSession(parentCanvasId){
        if(_IsPDFSession()){
            _destroy2DCanvas();
        }
        else if (!_IsSVGSession()){
            ThingView.Hide3DCanvas();
        }
        _currentCanvasId = "";
        const svgWrapper = document.createElement("div");
        const parent = document.getElementById(parentCanvasId);
        svgWrapper.id = parentCanvasId + "_CreoViewSVGDiv" + ThingView.GetNextCanvasID();
        svgWrapper.style.position = "relative";
        svgWrapper.style.height = "100%";
        svgWrapper.style.width = "100%";
        svgWrapper.style.overflow = "hidden";
        svgWrapper.style.backgroundColor = "white";
        parent.style.overflow = "hidden";
        const svgHolder = document.createElement("div");
        svgHolder.setAttribute("type", "image/svg+xml");

        _svgControls.reset();

        _svgControls.rectCanvas = document.createElement("canvas");
        _svgControls.rectCanvas.style.position = "absolute";
        _svgControls.rectCanvas.style.top = "0%";
        _svgControls.rectCanvas.style.left = "0%";
        _svgControls.rectCanvas.setAttribute('width', parent.clientWidth);
        _svgControls.rectCanvas.setAttribute('height', parent.clientHeight);

        svgWrapper.addEventListener("wheel", _zoomOnWheelSVG);
        svgWrapper.addEventListener("dblclick", function(){
            if(!_zoomButton){
                _resetTransform(svgHolder);
            }
        },{passive: false});

        svgWrapper.addEventListener("mousedown", function(e){
            e.preventDefault();
            if (_zoomWindow) {
                _handleZoomWindowEvent(e);
            } else if (_zoomButton) {
                _zoomOnButton(e);
            } else if (!_svgControls.drag.state && e.button==0) {
                _handlePanEvent(e);
            } else if (!_svgControls.rightClickDrag.state && e.button==2) {
                _handleRightClickZoomEvent(e);
            }
            _svgControls.deselect.x = e.pageX;
            _svgControls.deselect.y = e.pageY;
        },{passive: false});

        svgWrapper.addEventListener("mouseup", function(e){
            e.preventDefault();
            if (_zoomWindow && _svgControls.zoomDrag.state){
                _handleZoomWindowEvent(e);
            } else if (_svgControls.drag.state){
                _handlePanEvent(e);
            } else if (_svgControls.rightClickDrag.state){
                _handleRightClickZoomEvent(e);
            }
            var target = String(e.target.className.baseVal);
            target = target != "" ? target : String(e.target.parentNode.className.baseVal);
            if (e.pageX == _svgControls.deselect.x && e.pageY == _svgControls.deselect.y &&
                !(e.ctrlKey || e.metaKey) &&
                (target.indexOf("hotspot") == -1) &&
                (target.indexOf("callout") == -1)) {
                _deselectAllCallouts();
            }
        }, {passive: false});

        svgWrapper.addEventListener("mousemove", function(e){
            e.preventDefault();
            if (!_zoomWindow) {
                if (_svgControls.drag.state) {
                    _handlePanEvent(e);
                } else if (_svgControls.rightClickDrag.state) {
                    _handleRightClickZoomEvent(e);
                }
            } else if (_zoomWindow && _svgControls.zoomDrag.state) {
               _handleZoomWindowEvent(e);
            }
        }, {passive: false});

        svgWrapper.addEventListener("mouseleave", function(){
            if (_zoomWindow && _svgControls.zoomDrag.state) {
                _addSVGZoomWindowEvents();
            } else if (_svgControls.drag.state) {
                _addSVGPanEvents();
            } else if (_svgControls.rightClickDrag.state) {
                _addSVGMouseZoomEvents();
            }
        },{passive: false});
        svgWrapper.addEventListener("mouseenter", function(){
            _removeWindowEventListenersSVG();
        },{passive: false});

        svgWrapper.addEventListener("touchstart", function(e){
            _svgControls.touchMoved = false;
            if (e.touches.length <= 1) {
                if (_zoomWindow) {
                    _handleZoomWindowEvent(e);
                } else if (_zoomButton) {
                    _zoomOnButton(e);
                } else {
                    _handlePanEvent(e);
                }
            } else {
                _handleZoomOnPinchEvent(e);
                _handleTwoPointPanEvent(e);
            }
        },{passive: false});

        svgWrapper.addEventListener("touchend", function(e){
            e.preventDefault();
            if (!_svgControls.zoomPinch.state) {
                var currTime = new Date().getTime();
                var tapLength = currTime - _svgControls.lastTap;
                if (tapLength < 200 && tapLength > 0){
                    if(!_zoomButton){
                        _resetTransform(svgHolder);
                        _svgControls.drag.state = false;
                    }
                } else if(_zoomWindow && _svgControls.zoomDrag.state) {
                    _handleZoomWindowEvent(e);
                } else if(_svgControls.drag.state) {
                    _handlePanEvent(e);
                } else if(_svgControls.twoPointDrag.state) {
                    _handleTwoPointPanEvent(e);
                }
                _svgControls.lastTap = currTime;
                e.stopPropagation();
                if(!_svgControls.touchMoved && !(e.ctrlKey || e.metaKey)) {
                    _deselectAllCallouts();
                }
            } else {
                _handleZoomOnPinchEvent(e);
                if(_svgControls.drag.state) {
                    _handlePanEvent(e);
                }
            }
            _svgControls.touchMoved = false;
        }, {passive: false});

        svgWrapper.addEventListener("touchmove", function(e){
            e.preventDefault();
            if (!_svgControls.zoomPinch.state) {
                if (!_zoomWindow) {
                    if (_svgControls.drag.state) {
                        _handlePanEvent(e);
                    }
                } else if (_zoomWindow && _svgControls.zoomDrag.state) {
                   _handleZoomWindowEvent(e);
                }
            } else if (_svgControls.zoomPinch.state && e.touches.length == 2) {
                _handleZoomOnPinchEvent(e);
            }
            if (_svgControls.twoPointDrag.state) {
                _handleTwoPointPanEvent(e);
            }
            _svgControls.touchMoved = true;
        }, {passive: false});

        svgWrapper.insertBefore(svgHolder, svgWrapper.childNodes[0]);
        svgHolder.style.position = "relative";
        svgHolder.style.height = "inherit";
        svgHolder.style.width = "inherit";
        parent.insertBefore(svgWrapper, parent.childNodes[0]);
        _currentCanvasId = svgWrapper.id;
        return;
    }

    function _handleZoomWindowEvent (e) {
        const svgWrapper = document.querySelector("#" + _currentCanvasId);
        if (!svgWrapper) return;
        if (e.type == "mousedown" || e.type == "touchstart") {
            _svgControls.zoomDrag.x1 = e.type.indexOf("touch") != -1 ? e.touches[0].pageX : e.pageX;
            _svgControls.zoomDrag.y1 = e.type.indexOf("touch") != -1 ? e.touches[0].pageY : e.pageY;
            _svgControls.zoomDrag.state = true;
            _svgControls.rectCanvas.getContext('2d').clearRect(0,0,parseInt(_svgControls.rectCanvas.width),parseInt(_svgControls.rectCanvas.height));
            svgWrapper.insertBefore(_svgControls.rectCanvas, svgWrapper.childNodes[1]);
        } else if (e.type == "mouseup" || e.type == "touchend") {
            _zoomOnWindowSVG(e, _svgControls.zoomDrag);
            svgWrapper.removeChild(_svgControls.rectCanvas);
            _svgControls.zoomDrag.state = false;
            _setZoomWindow();
        } else if (e.type == "mousemove" || e.type == "touchmove") {
            _drawZoomWindow(_svgControls.rectCanvas, _svgControls.zoomDrag, e);
            _svgControls.zoomDrag.x2 = e.type.indexOf("touch") != -1 ? e.touches[0].pageX : e.pageX;
            _svgControls.zoomDrag.y2 = e.type.indexOf("touch") != -1 ? e.touches[0].pageY : e.pageY;
        }
    }

    function _handlePanEvent (e) {
        const svgWrapper = document.querySelector("#" + _currentCanvasId);
        if (!svgWrapper) return;
        if (e.type == "mousedown" || e.type == "touchstart") {
            _svgControls.drag.x = e.type.indexOf("touch") != -1 ? Math.floor(e.touches[0].pageX) : e.pageX;
            _svgControls.drag.y = e.type.indexOf("touch") != -1 ? Math.floor(e.touches[0].pageY) : e.pageY;
            _svgControls.drag.state = true;
        } else if (e.type == "mouseup" || e.type == "touchend") {
            svgWrapper.style.cursor = "auto";
            _svgControls.drag.state = false;
        } else if (e.type == "mousemove" || e.type == "touchmove") {
            svgWrapper.style.cursor = "url(" + ThingView.resourcePath + "/cursors/pan.cur),auto";
            _panSVG(e, _svgControls.drag);
        }
    }

    function _handleRightClickZoomEvent (e) {
        const svgWrapper = document.querySelector("#" + _currentCanvasId);
        if (!svgWrapper) return;
        if (e.type == "mousedown") {
            _svgControls.rightClickDrag.x = e.pageX;
            _svgControls.rightClickDrag.y = e.pageY;
            _svgControls.rightClickDrag.lastY = e.pageY;
            _svgControls.rightClickDrag.state = true;
            svgWrapper.oncontextmenu = function(){return true;};
        } else if (e.type == "mouseup") {
            svgWrapper.style.cursor = "auto";
            _svgControls.rightClickDrag.state = false;
        } else if (e.type == "mousemove") {
            svgWrapper.oncontextmenu = function(){return false;};
            svgWrapper.style.cursor = "url(" + ThingView.resourcePath + "/cursors/zoom.cur),auto";
            _zoomOnRightClickSVG(e, _svgControls.rightClickDrag);
        }
    }

    function _handleZoomOnPinchEvent(e) {
        if (e.type == "touchstart") {
            var touchCenter = _getTouchCenter(e);
            _svgControls.zoomPinch.xCenter = touchCenter.x;
            _svgControls.zoomPinch.yCenter = touchCenter.y;
            _svgControls.zoomPinch.oldXs = {x0: e.touches[0].pageX, x1: e.touches[1].pageX};
            _svgControls.zoomPinch.oldYs = {y0: e.touches[0].pageY, y1: e.touches[1].pageY};
            _svgControls.zoomPinch.state = true;
        } else if (e.type == "touchend") {
            _svgControls.zoomPinch.state = false;
        } else if (e.type == "touchmove") {
            _svgControls.zoomPinch.newXs = {x0: e.touches[0].pageX, x1: e.touches[1].pageX};
            _svgControls.zoomPinch.newYs = {y0: e.touches[0].pageY, y1: e.touches[1].pageY};
            _zoomOnPinch(e, _svgControls.zoomPinch);
        }
    }

    function _handleTwoPointPanEvent(e) {
        if (e.type == "touchstart") {
            var touchCenter = _getTouchCenter(e);
            _svgControls.twoPointDrag.x = touchCenter.x;
            _svgControls.twoPointDrag.y = touchCenter.y;
            _svgControls.twoPointDrag.state = true;
        } else if (e.type == "touchend") {
            _svgControls.twoPointDrag.state = false;
        } else if (e.type == "touchmove") {
            _panSVG(e, _svgControls.twoPointDrag);
        }
    }

    function _addSVGZoomWindowEvents () {
        window.addEventListener("mouseup", _handleZoomWindowEvent);
        window.addEventListener("mousemove", _handleZoomWindowEvent);
    }

    function _removeSVGZoomWindowEvents () {
        window.removeEventListener("mouseup", _handleZoomWindowEvent);
        window.removeEventListener("mousemove", _handleZoomWindowEvent);
    }

    function _addSVGPanEvents () {
        window.addEventListener("mouseup", _handlePanEvent);
        window.addEventListener("mousemove", _handlePanEvent);
    }

    function _removeSVGPanEvents () {
        window.removeEventListener("mouseup", _handlePanEvent);
        window.removeEventListener("mousemove", _handlePanEvent);
    }

    function _addSVGMouseZoomEvents () {
        window.addEventListener("mouseup", _handleRightClickZoomEvent);
        window.addEventListener("mousemove", _handleRightClickZoomEvent);
    }

    function _removeSVGMouseZoomEvents () {
        window.removeEventListener("mouseup", _handleRightClickZoomEvent);
        window.removeEventListener("mousemove", _handleRightClickZoomEvent);
    }

    function _removeWindowEventListenersSVG() {
        _removeSVGZoomWindowEvents();
        _removeSVGPanEvents();
        _removeSVGMouseZoomEvents();
    }

    function _getTransformMatrix(svgHolder){
        var svgTransform = getComputedStyle(svgHolder).getPropertyValue('transform');
        if(svgTransform=="none"){
            svgTransform = "matrix(1, 0, 0, 1, 0, 0)";
        }
        var matrix = svgTransform.replace(/[^\d.,-]/g, '').split(',').map(Number);
        return matrix;
    }

    function _setTransformMatrix(elem, scaleX, skewX, skewY, scaleY, transX, transY){
        elem.style.transform = "matrix(" + scaleX + "," + skewX + "," + skewY + "," + scaleY + "," + transX + "," + transY + ")";
    }

    function _getTouchCenter (e){
        var sumX = 0;
        var sumY = 0;
        for (var i=0; i < e.touches.length; i++){
            sumX += e.touches[i].pageX;
            sumY += e.touches[i].pageY;
        }
        return {x: Math.floor(sumX / i), y: Math.floor(sumY / i)};
    }

    function _panSVG(e, drag){
        e.preventDefault();
        var pageX = e.type.indexOf("touch") == -1 ? e.pageX : _getTouchCenter(e).x;
        var pageY = e.type.indexOf("touch") == -1 ? e.pageY : _getTouchCenter(e).y;
        var svgHolder = document.getElementById(_currentCanvasId).childNodes[0];
        var deltaX = pageX - drag.x;
        var deltaY = pageY - drag.y;
        var matrix = _getTransformMatrix(svgHolder);
        _setTransformMatrix(svgHolder, matrix[0], matrix[1], matrix[2], matrix[3], (matrix[4] + deltaX), (matrix[5] + deltaY));
        drag.x = pageX;
        drag.y = pageY;
    }

    function _getElementCenter(elem) {
        var boundingRect = elem.getBoundingClientRect();
        var centerX = (boundingRect.left + boundingRect.right)/2;
        var centerY = (boundingRect.top + boundingRect.bottom)/2;
        return {x: centerX, y: centerY};
    }

    function _zoomOnWheelSVG(e){
        const ZOOMMODIFIER = 0.15;
        const MINZOOM = _zoomLimit.svgMin;
        const MAXZOOM = _zoomLimit.svgMax;

        var svgHolder = e.currentTarget.childNodes[0];
        var center = _getElementCenter(svgHolder);
        var mouseDeltaX = (center.x - e.pageX) * ZOOMMODIFIER;
        var mouseDeltaY = (center.y - e.pageY) * ZOOMMODIFIER;

        var matrix = _getTransformMatrix(svgHolder);

        var delta = e.deltaY > 0 ? 1 : -1;

        var newScale = matrix[0] * (1 + (delta * ZOOMMODIFIER));
        if ((newScale <= MAXZOOM && delta == 1) || (newScale >= MINZOOM && delta == -1)) {
            _setTransformMatrix(svgHolder, newScale, matrix[1], matrix[2], newScale,(matrix[4] + (mouseDeltaX * delta)), (matrix[5] + (mouseDeltaY * delta)));
        }
    }

    function _onZoomOnButton (e) {
        if (e.key == "Escape" && _zoomButton) {
            _setZoomOnButton(_zoomButtonScale);
        }
    }

    function _setZoomOnButton(scale){
        if(!_zoomButtonScale || !(_zoomButton && _zoomButtonScale != scale)) {
            _zoomButton = !_zoomButton;
        }
        if(_zoomButton) {
            _zoomButtonScale = scale;
            document.getElementById(_currentCanvasId).style.cursor = "url(" + ThingView.resourcePath + "/cursors/zoom.cur),auto";
            document.addEventListener('keydown', _onZoomOnButton);
        } else {
            document.getElementById(_currentCanvasId).style.cursor = "auto";
            document.removeEventListener('keydown', _onZoomOnButton);
        }
    }

    function _zoomOnButton(e) {
        const MINZOOM = _zoomLimit.svgMin;
        const MAXZOOM = _zoomLimit.svgMax;

        var svgHolder = e.currentTarget.childNodes[0];
        var center = _getElementCenter(svgHolder);

        var pageX = e.type.indexOf("touch") != -1 ? e.touches[0].pageX : e.pageX;
        var pageY = e.type.indexOf("touch") != -1 ? e.touches[0].pageY : e.pageY;

        var mouseDeltaX = _zoomButtonScale < 1 ? (center.x - pageX) * (1 - _zoomButtonScale) : (center.x - pageX) * (_zoomButtonScale - 1);
        var mouseDeltaY = _zoomButtonScale < 1 ? (center.y - pageY) * (1 - _zoomButtonScale) : (center.y - pageY) * (_zoomButtonScale - 1);

        var matrix = _getTransformMatrix(svgHolder);

        var delta = _zoomButtonScale >= 1 ? 1 : -1;

        var newScale = matrix[0] * _zoomButtonScale;
        if ((newScale <= MAXZOOM && delta == 1) || (newScale >= MINZOOM && delta == -1)) {
            _setTransformMatrix(svgHolder, newScale, matrix[1], matrix[2], newScale,(matrix[4] + (mouseDeltaX * delta)), (matrix[5] + (mouseDeltaY * delta)));
        }
    }

    function _zoomOnRightClickSVG(e, drag){
        e.preventDefault();
        const ZOOMMODIFIER = 0.05;
        const MINZOOM = _zoomLimit.svgMin;
        const MAXZOOM = _zoomLimit.svgMax;

        var svgHolder = document.getElementById(_currentCanvasId).childNodes[0];
        var matrix = _getTransformMatrix(svgHolder);
        var center = _getElementCenter(svgHolder);
        var mouseDeltaX = (center.x - drag.x) * ZOOMMODIFIER;
        var mouseDeltaY = (center.y - drag.y) * ZOOMMODIFIER;

        var delta = (drag.lastY - e.pageY) > 0 ? 1 : (drag.lastY - e.pageY) < 0 ? -1 : 0;

        var newScale = matrix[0] * (1 + (delta * ZOOMMODIFIER));
        if ((newScale <= MAXZOOM && delta == 1) || (newScale >= MINZOOM && delta == -1)) {
            _setTransformMatrix(svgHolder, newScale, matrix[1], matrix[2], newScale,(matrix[4] + (delta * mouseDeltaX)), (matrix[5] + (delta * mouseDeltaY)));
        }
        drag.lastY = e.pageY;
    }

    function _setZoomWindow(){
        _zoomWindow = !_zoomWindow;
        const wrapper = document.getElementById(_currentCanvasId);
        if (_zoomWindow) {
            if (wrapper) {
                wrapper.style.cursor = "url(" + ThingView.resourcePath + "/cursors/fly_rectangle.cur),auto";
            }
            document.addEventListener('keydown', _zoomWindowEscapeListener);
        } else {
            if (wrapper) {
                wrapper.style.cursor = "auto";
            }
            document.removeEventListener('keydown', _zoomWindowEscapeListener);
        }
    }

    function _drawZoomWindow(rectCanvas, zoomDrag, e){
        var boundingClientRect = rectCanvas.getBoundingClientRect();
        var pageX = e.type.indexOf("touch") != -1 ? e.touches[0].pageX : e.pageX;
        var pageY = e.type.indexOf("touch") != -1 ? e.touches[0].pageY : e.pageY;
        var rectW = (pageX-boundingClientRect.left) - (zoomDrag.x1-boundingClientRect.left);
        var rectH = (pageY-boundingClientRect.top) - (zoomDrag.y1-boundingClientRect.top);
        var context = rectCanvas.getContext('2d');
        context.clearRect(0,0,parseInt(rectCanvas.width),parseInt(rectCanvas.height));
        context.strokeStyle = "#96ed14";
        context.fillStyle = "rgba(204,204,204,0.5)";
        context.lineWidth = 1;
        context.strokeRect((zoomDrag.x1-boundingClientRect.left), (zoomDrag.y1-boundingClientRect.top), rectW, rectH);
        context.fillRect((zoomDrag.x1-boundingClientRect.left), (zoomDrag.y1-boundingClientRect.top), rectW, rectH);
    }

    function _zoomWindowEscapeListener(e){
        if (e.key == "Escape" && _zoomWindow) {
            const svgWrapper = document.getElementById(_currentCanvasId);
            if (svgWrapper) {
                svgWrapper.style.cursor = "auto";
                if (_IsSVGSession()) {
                    if (svgWrapper.childNodes.length > 1){
                        svgWrapper.removeChild(svgWrapper.childNodes[1]);
                    }
                }
            }
            _setZoomWindow();
        }
    }

    function _zoomOnWindowSVG(e, zoomDrag){
        var svgHolder = document.getElementById(_currentCanvasId).childNodes[0];

        if(zoomDrag.x1 > zoomDrag.x2){
            zoomDrag.x1 = [zoomDrag.x2, zoomDrag.x2=zoomDrag.x1][0];
        }
        if(zoomDrag.y1 > zoomDrag.y2){
            zoomDrag.y1 = [zoomDrag.y2, zoomDrag.y2=zoomDrag.y1][0];
        }

        var width = zoomDrag.x2 - zoomDrag.x1;
        var height = zoomDrag.y2 - zoomDrag.y1;
        var holderAspectRatio = svgHolder.clientWidth / svgHolder.clientHeight;
        var zoomAspectRatio = width / height;
        var zoomModifier = (width > height && holderAspectRatio < zoomAspectRatio) ? (svgHolder.clientWidth / width) - 1 : (svgHolder.clientHeight / height) - 1;

        var center = _getElementCenter(svgHolder);
        var newCenterX = zoomDrag.x1 + width/2;
        var newCenterY = zoomDrag.y1 + height/2;
        var deltaX = (center.x - newCenterX) * (1 + zoomModifier);
        var deltaY = (center.y - newCenterY) * (1 + zoomModifier);

        var matrix = _getTransformMatrix(svgHolder);
        _setTransformMatrix(svgHolder, (matrix[0] * (1 + zoomModifier)), matrix[1], matrix[2], (matrix[0] * (1 + zoomModifier)), (matrix[4] + deltaX), (matrix[5] + deltaY));

    }

    function _zoomOnPinch(e, zoomPinch) {
        var oldHypth = Math.sqrt(Math.pow(zoomPinch.oldXs.x0 - zoomPinch.oldXs.x1,2) + Math.pow(zoomPinch.oldYs.y0 - zoomPinch.oldYs.y1,2));
        var newHypth = Math.sqrt(Math.pow(zoomPinch.newXs.x0 - zoomPinch.newXs.x1,2) + Math.pow(zoomPinch.newYs.y0 - zoomPinch.newYs.y1,2));
        var delta = (newHypth - oldHypth);

        if (delta!=0) {
            const ZOOMMODIFIER = 0.015 * delta;
            const MINZOOM = _zoomLimit.svgMin;
            const MAXZOOM = _zoomLimit.svgMax;

            var svgHolder = e.currentTarget.childNodes[0];
            var center = _getElementCenter(svgHolder);
            var mouseDeltaX = (center.x - zoomPinch.xCenter) * ZOOMMODIFIER;
            var mouseDeltaY = (center.y - zoomPinch.yCenter) * ZOOMMODIFIER;

            var matrix = _getTransformMatrix(svgHolder);
            var newScale = matrix[0] * (1 + ZOOMMODIFIER);
            if(newScale <= MAXZOOM && newScale >= MINZOOM){
                _setTransformMatrix(svgHolder, newScale, matrix[1], matrix[2], newScale,(matrix[4] + mouseDeltaX), (matrix[5] + mouseDeltaY));
            }

            zoomPinch.oldXs.x0 = zoomPinch.newXs.x0;
            zoomPinch.oldXs.x1 = zoomPinch.newXs.x1;
            zoomPinch.oldYs.y0 = zoomPinch.newYs.y0;
            zoomPinch.oldYs.y1 = zoomPinch.newYs.y1;
        }
    }

    function _IsSVGSession()
    {
        var retVal = false;
        if (!_currentCanvasId=="") {
            retVal = _currentCanvasId.indexOf("_CreoViewSVGDiv") != -1 ? true : false;
        }
        return retVal;
    }

    function _LoadSVG(val, callback){
        if(_IsSVGSession())
        {
            var canvasId = _currentCanvasId;
            var svgHolder = document.getElementById(canvasId).childNodes[0];
            _resetTransform(svgHolder);
            svgHolder.innerHTML = val;
            _setCalloutListeners(svgHolder);
            var svg = svgHolder.getElementsByTagName("svg")[0];
            svg.setAttribute('height',"100%");
            svg.setAttribute('width',"100%");
            _calloutsSelected = [];
            _partsSelected = [];
            _calloutColors = [];
            if (callback) callback(true);
        }
    }

    function _getCallouts(){
        var svgHolder = document.getElementById(_currentCanvasId).childNodes[0];
        var callouts = svgHolder.querySelectorAll('[class^="callout"]');
        return callouts;
    }

    function _getSVGElementColors(elem, colorsList){
        var colors = [];
        colors[0] = elem.id;
        for (var i = 1; i < elem.childNodes.length; i++){
            colors = _addNodeColor(elem.childNodes[i], colors);
        }
        colorsList.push(colors);
    }

    function _addNodeColor(node, colors){
        var obj = {};
        if(node.nodeName == "path" || node.nodeName == "line" || node.nodeName == "text" || node.nodeName == "polyline"){
            obj.fill = node.getAttribute("fill") ? node.getAttribute("fill") : null;
            obj.stroke = node.getAttribute("stroke") ? node.getAttribute("stroke") : null;
            colors.push(obj);
        } else if(node.nodeName == "g") {
            for (var i = 0; i < node.childNodes.length; i++){
                colors = _addNodeColor(node.childNodes[i], colors);
            }
        }
        return colors;
    }

    function _setCalloutListeners(svgHolder){
        var hotspots = svgHolder.querySelectorAll('[class^="hotspot"]');
        if(hotspots.length==0){
            hotspots = svgHolder.querySelectorAll('[class^="callout"]');
        }

        _calloutControls.reset();

        const onCalloutMouseDown = function (e) {
            _calloutControls.startX = e.pageX;
            _calloutControls.startY = e.pageY;
        };
        const onCalloutMouseUp = function (e) {
            if (_calloutControls.startX == e.pageX &&
                _calloutControls.startY == e.pageY) {
                if (!(e.ctrlKey || e.metaKey)) {
                    _deselectAllCallouts();
                }
                _toggleCalloutSelection(e);
            }
        };
        const onCalloutTouchStart = function (e) {
            _calloutControls.touchMoved = false;
        };
        const onCalloutTouchMove = function (e) {
            _calloutControls.touchMoved = true;
        };
        const onCalloutTouchEnd = function (e) {
            if (!_calloutControls.touchMoved) {
                e.stopPropagation();
                e.preventDefault();
                if (!(e.ctrlKey || e.metaKey)) {
                    _deselectAllCallouts();
                }
                _toggleCalloutSelection(e);
                _calloutControls.touchMoved = false;
            }
        };

        for (const hotspot of hotspots) {
            hotspot.addEventListener("mousedown", onCalloutMouseDown, false);
            hotspot.addEventListener("mouseup", onCalloutMouseUp, false);
            hotspot.addEventListener("touchstart", onCalloutTouchStart);
            hotspot.addEventListener("touchmove", onCalloutTouchMove);
            hotspot.addEventListener("touchend", onCalloutTouchEnd, {passive: false});
        }
    }

    function _getCalloutForToggle(e){
        var targetClass = e.currentTarget.getAttribute("class");
        if (targetClass.indexOf("callout") != -1){
            return e.currentTarget;
        } else if(targetClass.indexOf("hotspot") != -1){
            var noIndex = targetClass.indexOf("_");
            var calloutNo = targetClass.substring(noIndex);
            var svgHolder = document.getElementById(_currentCanvasId).childNodes[0];
            var callouts = svgHolder.querySelectorAll('[class^="callout"]');
            var callout;
            for (var i=0; i<callouts.length; i++){
                if(callouts[i].getAttribute('class').indexOf(calloutNo, callouts[i].getAttribute('class').length - calloutNo.length) != -1) {
                    var calloutBoundingRect = callouts[i].getBoundingClientRect();
                    // Check that the mouse is within the callout's bounding box
                    // We can have two callouts with the same classes when there's callout on inset
                    if (e.clientX >= calloutBoundingRect.left && e.clientX <= calloutBoundingRect.right &&
                        e.clientY <= calloutBoundingRect.bottom && e.clientY >= calloutBoundingRect.top)
                    {
                        callout = callouts[i];
                        break;
                    }
                }
            }
            return callout;
        } else {
            return;
        }
    }

    function _toggleCalloutSelection(e){
        var callout = _getCalloutForToggle(e);
        if(callout){
            if (_calloutsSelected.indexOf(callout.id) != -1){
                _deselectCallout(callout);
                var index = _calloutsSelected.indexOf(callout.id);
                if (index !=-1){
                    _calloutsSelected.splice(index,1);
                }
            } else {
                _selectCallout(callout);
            }
            if(_svgCalloutCB){
                _svgCalloutCB(callout.id);
            }
        }
    }

    function _setSVGElementColors(callout, color){
        _setNodeColor(callout.childNodes[0], color);
    }

    function _setNodeColor(node, color){
        if(node){
            if (node.nodeName == "path" || node.nodeName == "line" || node.nodeName == "polyline") {
                node.setAttribute("stroke", color);
            } else if (node.nodeName == "g"){
                _setNodeColor(node.childNodes[0], color);
            }
            _setNodeColor(node.nextSibling, color);
        }
    }

    function _resetSVGElementColors (elem, colorsList){
        var colors = [];
        for (var i = 0; i < colorsList.length; i++){
            if (colorsList[i][0] == elem.id) {
                colors = colorsList[i];
                break;
            }
        }
        colors.shift();
        _resetNodeColor(elem.childNodes[0], colors);
        colorsList.splice(colorsList.indexOf(colors), 1);
    }

    function _resetNodeColor (node, colors){
        if (node) {
            if (node.nodeName == "line" || node.nodeName == "path" || node.nodeName == "text" || node.nodeName == "polyline") {
                var obj = colors.shift();
                if (obj)
                {
                    if(obj.fill != null){
                        node.setAttribute('fill', obj.fill);
                    } else {
                        node.removeAttribute('fill');
                    }
                    if (obj.stroke != null){
                        node.setAttribute('stroke', obj.stroke);
                    } else {
                        node.removeAttribute('stroke');
                    }
                }
            } else if (node.nodeName == "g") {
                _resetNodeColor(node.childNodes[0], colors);
            }
            _resetNodeColor(node.nextSibling, colors);
        }
    }

    function _selectCallout(callout){
        _getSVGElementColors(callout, _calloutColors);
        _setSVGElementColors(callout, "rgb(102,153,255)");
        _calloutsSelected.push(callout.id);
        var calloutDesc = callout.getElementsByTagName("desc");
        if (calloutDesc.length) {
            var parts = _getSVGParts(calloutDesc[0].textContent);
            if(parts.length > 0){
                _selectSVGPart(parts);
            } else if (callout.parentNode) {
                // If we haven't found an svg part matching the callout
                // It's possible that it's a phantom part
                _selectSVGPhantomPart(callout.parentNode);
            }
        }
    }

    function _deselectAllCallouts(){
        for (var j=0; j<_calloutsSelected.length; j++){
            var callout = document.getElementById(_calloutsSelected[j]);
            _deselectCallout(callout);
            if(_svgCalloutCB) {
                _svgCalloutCB(callout.id);
            }
        }
        _calloutsSelected = [];
    }

    function _deselectCallout(callout){
        _resetSVGElementColors(callout, _calloutColors);
        var calloutDesc = callout.getElementsByTagName("desc");
        if (calloutDesc.length) {
            var parts = _getSVGParts(calloutDesc[0].textContent);
            if(parts.length > 0){
                _deselectSVGPart(parts);
            } else if (callout.parentNode) {
                // If we haven't found an svg part matching the callout
                // It's possible that it's a phantom part
                _deselectSVGPhantomPart(callout.parentNode);
            }
        }
    }

    function _getSVGParts(partNo){
        return document.getElementsByClassName("part part_" + partNo);
    }

    function _selectSVGPart(parts){
        for (var i = 0; i < parts.length; i++){
            var part = parts.item(i);
            if(part){
                _getSVGElementColors(part, _partColors);
                _setSVGElementColors(part, "rgb(102,153,255)");
                _partsSelected.push(part.id);
            }
        }
    }

    function _isPhantomPart(part) 
    {
        var partDesc = part.getElementsByTagName("desc");
        return ((partDesc.length > 0) && (partDesc[0].textContent == "Phantom"))
    }

    function _selectSVGPhantomPart(part)
    {
        // Check whether the part is a Phantom part
        if (part && _isPhantomPart(part))
        {
            // Select the phantom part
            var colors = [];
            colors[0] = part.id;
            for (var i = 1; i < part.childNodes.length; i++){
                var node = part.childNodes[i];

                if (node.nodeName == "path" || node.nodeName == "line" || node.nodeName == "polyline")
                {
                    var obj = {};
                    obj.fill = node.getAttribute("fill") ? node.getAttribute("fill") : null;
                    obj.stroke = node.getAttribute("stroke") ? node.getAttribute("stroke") : null;
                    colors.push(obj);
                }
            }

            _partColors.push(colors);
            _setSVGElementColors(part, "rgb(102,153,255)", "rgb(255,255,255)");
            _partsSelected.push(part.id);
        }
    }

    function _deselectSVGPhantomPart(part) 
    {
        if (part && _isPhantomPart(part))
        {
            _resetSVGElementColors(part, _partColors);
            var index = _partsSelected.indexOf(part.id);
            if (index != -1)
            {
                _partsSelected.splice(index, 1);
            }
        }
    }

    function _deselectSVGPart(parts){
        for (var i = 0; i < parts.length; i++){
            var part = parts.item(i);
            if(part){
                _resetSVGElementColors(part, _partColors);
                var index = _partsSelected.indexOf(part.id);
                if (index !=-1){
                    _partsSelected.splice(index,1);
                }
            }
        }
    }

    //PDF
    function _createPDFSession(parentCanvasId, callback) {

        if(_IsSVGSession()){
            _destroy2DCanvas();
        }
        else if (!_IsPDFSession()){
            ThingView.Hide3DCanvas();
        }
        if (!document.getElementById("pdfjs")) {
            if (typeof requirejs !== 'undefined') {
                requirejs.config({paths: {'pdfjs-dist/build': '/Thingworx/Common/extensions/ptc-thingview-extension/ui/thingview/js/ptc/thingview/pdfjs'}});
                requirejs(['pdfjs-dist/build/pdf'], function(pdf) {
                    _PDFJS = pdf;
                    _PDFJS.GlobalWorkerOptions.workerSrc = ThingView.modulePath + "pdfjs/pdf.worker.js";
                    _buildPDFSession(parentCanvasId, callback);
                });
            } else {
                const script_pdf = document.createElement("script");
                script_pdf.src = ThingView.modulePath + "pdfjs/pdf.js";
                script_pdf.id = "pdfjs";
                script_pdf.async = false;
                const head = document.getElementsByTagName('head').item(0);
                head.appendChild(script_pdf);
                script_pdf.onload = function() {
                    _PDFJS = pdfjsLib;
                    _PDFJS.GlobalWorkerOptions.workerSrc = ThingView.modulePath + "pdfjs/pdf.worker.js";
                    _buildPDFSession(parentCanvasId, callback);
                };
            }
        } else {
            _buildPDFSession(parentCanvasId, callback);
        }
        return;
    }

    function _buildPDFSession(parentCanvasId, callback){
        _currentCanvasId = "";
        var canvasWrapper = document.createElement("div");
        var parent = document.getElementById(parentCanvasId);
        _parentCanvasId = parentCanvasId;
        parent.style.fontSize = "12pt";
        canvasWrapper.id = parentCanvasId + "_CreoViewDocumentCanvas" + ThingView.GetNextCanvasID();
        canvasWrapper.style.minHeight = "100%";
        canvasWrapper.style.backgroundColor = _uiColors.pdfViewer.background;
        canvasWrapper.style.position = "absolute";

        var scrollWrapper = document.createElement("div");
        scrollWrapper.id = "CreoDocumentScrollWrapper";
        scrollWrapper.tabIndex = "0";
        scrollWrapper.style.overflowY = "scroll";
        scrollWrapper.style.overflowX = "auto";
        scrollWrapper.style.position = "relative";
        scrollWrapper.style.height = "100%";
        scrollWrapper.style.backgroundColor = "rgb(128, 133, 142)";
        scrollWrapper.style.outline = "none";
        scrollWrapper.style.scrollBehavior = "auto";
        scrollWrapper.appendChild(canvasWrapper);
        parent.insertBefore(scrollWrapper, parent.childNodes[0]);
        parent.style.overflow = "hidden";
        parent.style.backgroundColor = _uiColors.pdfViewer.background;

        _addDynamicTextMarkupStyle();
        _addPageWrapperStyle();
        _addTextLayerStyle("PdfPageDisplayTextLayer");
        _addTextLayerStyle("PdfPageDynamicTextMarkupCanvas");

        _currentCanvasId = canvasWrapper.id;
        if ((/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) || /android/.test(navigator.userAgent)) {
            _printEnabled = false;
            _toolbarGroups.print = false;
        } else if (_printEnabled) {
            _addPdfPrintClass(parent);
        }
        _RemoveDocumentToolbar (parent);
        if (_toolbarEnabled){
            _DisplayDocumentToolbar(parent, _toolbarGroups);
        }

        _pdfControls.reset();

        document.getElementById(_parentCanvasId).addEventListener("keydown", _changePageOnKey);

        window.addEventListener("resize", _handleBrowserResize);

        window.addEventListener("mouseup", _handleShapeMarkupEditEvent);

        scrollWrapper.addEventListener("scroll", _handlePagesOnScroll);

        scrollWrapper.addEventListener("wheel", _handlePageOnWheel);

        canvasWrapper.addEventListener("wheel", _changePageOnScroll);

        canvasWrapper.addEventListener("mousedown", function(e){
            if (!_documentLoaded) return;

            if (_zoomButton) {
                _zoomButtonPDF();
            } else if (_cursor.current == _cursorTypes.pan && e.button == 0) {
                _handlePanEventPDF(e);
            }

            _removePdfSearchResultHighlights();
        });

        canvasWrapper.addEventListener("mouseup", function(e){
            if (!_documentLoaded) return;

            if (_pdfControls.drag.state) {
                _handlePanEventPDF(e);
            }
        });

        canvasWrapper.addEventListener("mousemove", function(e){
            if (!_documentLoaded) return;

            if (_pdfControls.drag.state) {
                _handlePanEventPDF(e);
            }
        });

        canvasWrapper.addEventListener("mouseleave", function() {
            if (_pdfControls.drag.state) {
                _addPDFPanEvents();
            }
        });

        canvasWrapper.addEventListener("mouseenter", function() {
            _removePDFPanEvents();
        });

        canvasWrapper.addEventListener("touchend", function(e){
            if (!_zoomButton) {
                var currTime = new Date().getTime();
                var tapLength = currTime - _pdfControls.lastTap;
                if (tapLength < 200 && tapLength > 0){
                        _resetTransformPDF();
                        _pdfControls.drag.state = false;
                    }
                    _pdfControls.lastTap = currTime;
            } else {
                _zoomButtonPDF();
            }
        });

        if (callback) callback();
    }

    function _addPDFPanEvents () {
        window.addEventListener("mouseup", _handlePanEventPDF);
        window.addEventListener("mousemove", _handlePanEventPDF);
    }

    function _removePDFPanEvents () {
        window.removeEventListener("mouseup", _handlePanEventPDF);
        window.removeEventListener("mousemove", _handlePanEventPDF);
    }

    function _getPDFCanvas() {
        var sessionCanvas = document.createElement("canvas");
        sessionCanvas.style.display = "inline-block";
        sessionCanvas.oncontextmenu = function (e) {
            e.preventDefault();
            return false;
        };
        return sessionCanvas;
    }

    function _removeWindowEventListenersPDF() {
        window.removeEventListener("resize", _handleBrowserResize);
        _removePDFPanEvents();
        if (_printEnabled) {
            window.removeEventListener('afterprint', _removePdfPrintDiv);
        }
        window.removeEventListener("mouseup", _handleShapeMarkupEditEvent);

        if (_parentCanvasId && _parentCanvasId.length) {
            document.getElementById(_parentCanvasId).removeEventListener("keydown", _changePageOnKey);
            document.getElementById(_parentCanvasId).removeEventListener("keydown", _deletePdfAnnotationEvent);
        }

        if (_currentCanvasId && _currentCanvasId.length) {
            document.getElementById(_currentCanvasId).parentNode.removeEventListener("scroll", _changePageOnScroll);
            document.getElementById(_currentCanvasId).removeEventListener("mousedown", _checkDeselectPdfAnnotation);
        }
    }

    function _handlePanEventPDF (e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        if (e.type == "mousedown") {
            _pdfControls.drag.x = e.pageX;
            _pdfControls.drag.y = e.pageY;
            _pdfControls.drag.state = true;
        } else if (e.type == "mousemove") {
            document.getElementById(_currentCanvasId).style.cursor = "url(" + ThingView.resourcePath + "/cursors/pan.cur),auto";
            _panPDF(e, _pdfControls.drag);
        } else if (e.type == "mouseup") {
            document.getElementById(_currentCanvasId).style.cursor = "auto";
            _pdfControls.drag.state = false;
        }
    }

    function _panPDF(e, drag) {
        e.preventDefault();
        var deltaX = 0 - (e.pageX - drag.x);
        var deltaY = 0 - (e.pageY - drag.y);
        var scrollWrapper = document.getElementById(_currentCanvasId).parentNode;
        var scrollTop = scrollWrapper.scrollTop;
        var scrollLeft = scrollWrapper.scrollLeft;
        scrollWrapper.scrollTop = scrollTop + deltaY;
        scrollWrapper.scrollLeft = scrollLeft + deltaX;
        drag.x = e.pageX;
        drag.y = e.pageY;
    }

    function getPageHeight(page) {
        return (_marginSize + parseFloat(page.clientHeight));
    }

    function _handlePageOnWheel(evt) {
        if (!_documentLoaded) return;

        if (evt && evt.ctrlKey) {
            _zoomToCursor(evt);
            evt.preventDefault();
            return;
        }
    }

    function _changePageOnScroll(evt) {
        if (!_documentLoaded) return;
        if (_ignoreWrapperScroll) {
            _ignoreWrapperScroll = false;
            return;
        }

        if (evt && evt.ctrlKey) {
            evt.preventDefault();
            return;
        }

        const canvasWrapper = document.getElementById(_currentCanvasId);
        const scrollWrapper = canvasWrapper.parentNode;
        var wrapperHeight = scrollWrapper.clientHeight;
        var scrollTop = scrollWrapper.scrollTop;
        var scrollBottom = scrollWrapper.scrollHeight - scrollTop - wrapperHeight;
        var firstPageQuarterHeight = document.getElementById("PdfPageDisplayWrapper1").offsetHeight / 4;
        var lastPageQuarterHeight = document.getElementById("PdfPageDisplayWrapper"+__TOTAL_PAGES).offsetHeight / 4;
        if (scrollTop < firstPageQuarterHeight) {
            __CURRENT_PAGE = 1;
        } else if (scrollBottom < lastPageQuarterHeight) {
            __CURRENT_PAGE = __TOTAL_PAGES;
        } else {
            const scrollWrapperRect = scrollWrapper.getBoundingClientRect();
            const x = scrollWrapperRect.left + scrollWrapperRect.width / 2;
            const y = scrollWrapperRect.top + scrollWrapperRect.height / 2;
            var elementsUnderCursor;
            if (document.elementsFromPoint) {
                elementsUnderCursor = document.elementsFromPoint(x, y);
            } else if (document.msElementsFromPoint) {
                elementsUnderCursor = document.msElementsFromPoint(x, y);
            }
            for (var elem of elementsUnderCursor) {
                if (elem.className) {
                    if (typeof elem.className != "object" && elem.className.indexOf("PdfPageDisplayWrapper") != -1) {
                        __CURRENT_PAGE = parseInt(elem.id.substring("PdfPageDisplayWrapper".length));
                        break;
                    }
                }
            }
        }

        __CURRENT_PAGE = Math.max(1, __CURRENT_PAGE);
        __CURRENT_PAGE = Math.min(__CURRENT_PAGE, __TOTAL_PAGES);

        _updateDocumentToolbarPageDisplay();
        _updateNavbar();
        if (_pdfCallback) {
            _pdfCallback(true);
        }
    }

    function _getPageBufferSize(mode, pagesPerLine) {
        if (pagesPerLine < 4) {
            switch (mode) {
            default:
            // case 0 : refreshing pages so return reduced size 2
            case 0:
                return 2;
            // case 1 : scrolling pages so return usual 5
            case 1:
                if (_getLargestPageWidth() > _getLargestPageHeight()) {
                    return 5;
                }
                return 3;
            // case 2 : jump to page without refreshing pages
            case 2:
                return 0;
            }
        } else {
            return (2*pagesPerLine - 1);
        }
    }

    function _updateNavbar() {
        if (_sidebarEnabled && _navbar.enabled) {
            _selectNavPage(document.getElementById("PdfNavPageWrapper" + __CURRENT_PAGE), __CURRENT_PAGE);
            _scrollNavbarToPage(document.getElementById("CreoViewDocumentNavbar"), __CURRENT_PAGE);
        }
    }

    function _handlePagesOnScroll() {
        if (!_documentLoaded) return;
        _changePageOnScroll();
        if (!_ignoreScrollEvent){
            const visiblePages = getVisiblePages();
            const pageBufferSize = Math.max(Math.floor((visiblePages.lastPage - visiblePages.firstPage) / 2), 2);
            if (!document.getElementById("PdfPageDisplayWrapper" + __CURRENT_PAGE).firstChild) {
                _ignoreScrollEvent = true;
                showPage(__CURRENT_PAGE, function(success) {
                    if (success) {
                        _ignoreScrollEvent = false;
                        _updateNavbar();
                    }
                }, 0);
            } else if (visiblePages.lastPage >= _lastLoadedPage - 1) {
                const curFirstLoadedPage = _firstLoadedPage;
                const curLastLoadedPage = _lastLoadedPage;
                _firstLoadedPage = Math.max((visiblePages.firstPage-pageBufferSize), 1);
                _lastLoadedPage  = Math.min(visiblePages.lastPage + pageBufferSize + 1, __TOTAL_PAGES);
                if (curFirstLoadedPage === _firstLoadedPage && curLastLoadedPage === _lastLoadedPage) {
                    return;
                }
                _ignoreScrollEvent = true;
                generateOrderToShowPages(1);
                showPagesOnOrder(function(success) {
                    if (success) {
                        _ignoreScrollEvent = false;
                        clearInvisibleWrappers();
                        _updateNavbar();
                    }
                });
            } else if (visiblePages.firstPage <= _firstLoadedPage + 1) {
                const curFirstLoadedPage = _firstLoadedPage;
                const curLastLoadedPage = _lastLoadedPage;
                _firstLoadedPage = Math.max((visiblePages.firstPage-pageBufferSize), 1);
                _lastLoadedPage  = Math.min(visiblePages.lastPage + pageBufferSize + 1, __TOTAL_PAGES);
                if (curFirstLoadedPage === _firstLoadedPage && curLastLoadedPage === _lastLoadedPage) {
                    return;
                }
                _ignoreScrollEvent = true;
                generateOrderToShowPages(-1);
                showPagesOnOrder(function(success) {
                    if (success) {
                        _ignoreScrollEvent = false;
                        clearInvisibleWrappers();
                        _updateNavbar();
                    }
                });
            } else if (_sidebarEnabled && _navbar.enabled) {
                _updateNavbar();
            }
        } else {
            if (_scrollTimer !== null) {
                clearTimeout(_scrollTimer);
                _scrollTimer = null;
            }
            _scrollTimer = setTimeout(function() {
                var currentPage = document.getElementById("PdfPageDisplayWrapper" + __CURRENT_PAGE);
                if (currentPage && !currentPage.childElementCount) {
                    _ignoreScrollEvent = true;
                    showPage(__CURRENT_PAGE, function(success) {
                        if (success) {
                            _ignoreScrollEvent = false;
                            clearInvisibleWrappers();
                            _updateNavbar();
                        }
                    }, 0);
                }
            }, 100);
        }
    }

    function _scrollPageOnKey (key) {
        var canvasWrapper = document.getElementById(_currentCanvasId);
        if (!canvasWrapper) return;

        const arrowOffset = 40;
        const pageOffset = canvasWrapper.parentNode.clientHeight - _marginSize * 2;

        if (key == "ArrowUp") {
            canvasWrapper.parentNode.scrollTop = Math.max(0, canvasWrapper.parentNode.scrollTop - arrowOffset);
        } else if (key == "ArrowDown") {
            canvasWrapper.parentNode.scrollTop = canvasWrapper.parentNode.scrollTop + arrowOffset;
        } else if (key == "PageUp") {
            canvasWrapper.parentNode.scrollTop = Math.max(0, canvasWrapper.parentNode.scrollTop - pageOffset);
        } else if (key == "PageDown") {
            canvasWrapper.parentNode.scrollTop = canvasWrapper.parentNode.scrollTop + pageOffset;
        }
    }

    function _changePageOnKey(e) {
        if (!_documentLoaded) return;

        var keyPressed = e.key;
        if (keyPressed == "ArrowRight") {
            _LoadNextPage(_pdfCallback);
        } else if (keyPressed == "ArrowLeft") {
            _LoadPrevPage(_pdfCallback);
        } else if (keyPressed == "ArrowUp" ||
                   keyPressed == "ArrowDown" ||
                   keyPressed == "PageUp" ||
                   keyPressed == "PageDown") {
            _scrollPageOnKey(keyPressed);
        } else if (keyPressed == "Home") {
            _LoadPage(_pdfCallback, 1);
        } else if (keyPressed == "End") {
            _LoadPage(_pdfCallback, __TOTAL_PAGES);
        } else if (e.keyCode == 189 && e.ctrlKey) { // '-'
            _zoomButtonScale = _zoomOutScale;
            _zoomButtonPDF();
        } else if (e.keyCode == 187 && e.ctrlKey) {// '='
            _zoomButtonScale = _zoomInScale;
            _zoomButtonPDF();
        } else {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
    }

    function _getValidZoomScale (scale) {
        return Math.min(Math.max(scale,
                                 (__TOTAL_PAGES == 1 ? _zoomLimit.svgMin : _zoomLimit.pdfMin)),
                        Math.min(_zoomLimit.pdfMax, _largestZoomScale));
    }

    function _zoomToCursor(evt) {
        if (_refreshingPDF) return;

        const newScale = _getValidZoomScale(__ZOOMSCALE * (evt.deltaY > 0 ? _zoomOutScale : _zoomInScale));
        if (newScale == __ZOOMSCALE) return;

        const scrollWrapper = document.getElementById(_currentCanvasId).parentNode;
        const wrapperRect = scrollWrapper.getBoundingClientRect();
        const x = evt.clientX - wrapperRect.left;
        const y = evt.clientY - wrapperRect.top;

        _getScrollCenterData(newScale, {x:x,y:y});

        _refreshPDF(function(success){
            if (success) {
                if (_pdfCallback) {
                    _pdfCallback(success);
                }
            }
        }, {zoomScale: newScale});
    }

    function _zoomButtonPDF() {
        const newScale = _getValidZoomScale(__ZOOMSCALE * _zoomButtonScale);
        if (newScale == __ZOOMSCALE) return;

        _getScrollCenterData(newScale);

        _refreshPDF(function(success){
            if (success) {
                if (_pdfCallback) {
                    _pdfCallback(success);
                }
            }
        }, {zoomScale: newScale});
    }

    function _resetTransformPDF () {
        if(_cursor.current != _cursorTypes.text){
            _setPageModePDF();
        }
    }

    function _adjustWrapperSize() {
        var canvasWrapper = document.getElementById(_currentCanvasId);
        var canvasWrapperWidth = _getLargestPageWidth() + _marginSize * 2;
        canvasWrapper.style.width = canvasWrapperWidth + "px";
        canvasWrapper.style.left = Math.max((canvasWrapper.parentNode.clientWidth - canvasWrapperWidth)/2, 0) + "px";
    }

    function _refreshPDF(callback, value) {
        if (_refreshingPDF) {
            _nextRefreshEvent = value;
            if (callback) callback(false);
            return;
        }

        let mode = _refreshMode.none;
        if (value) {
            if (value.zoomScale != undefined) {
                __ZOOMSCALE = _getValidZoomScale(value.zoomScale);
                mode = _refreshMode.zoom;
            }
            if (value.pageRotation != undefined) {
                _pageRotation = value.pageRotation;
                if (value.clockwise)
                    mode = _refreshMode.rotCw;
                else
                    mode = _refreshMode.rotCcw;
            }
        }

        _ignoreScrollEvent = true;
        _refreshingPDF = true;

        _largestWidth = _largestHeight = 0;
        _getNoteMarkupEdit();
        _getAnnoSelection();
        _getTextSelection();
        _resizePageWrapper(1, mode, function() {
            _adjustWrapperSize();
            _applyScrollData();
            showPage(__CURRENT_PAGE, function(success) {
                if (success) {
                    _showSearchResultHighlight();
                    _showTextSelection();
                    _setNoteMarkupEdit();
                    _ignoreScrollEvent = false;
                    _changePageOnScroll();
                    _refreshingPDF = false;
                    if (_nextRefreshEvent) {
                        _refreshPDF(callback, _nextRefreshEvent);
                        _nextRefreshEvent = null;
                    } else {
                        _setUserSelect();
                        _annoSelection = [];
                        if (callback) callback(true);
                    }
                }
            }, 0);
        });
    }

    function _getLargestPageWidth() {
        return _largestWidth;
    }

    function _getLargestPageHeight() {
        return _largestHeight;
    }

    function _setPageModePDF(callback) {
        if (callback == null) {
            callback = _pdfCallback;
        }

        const currentPage = document.getElementById("PdfPageDisplayWrapper" + __CURRENT_PAGE);
        const canvasWrapper = document.getElementById(_currentCanvasId);
        const pageWidthScale  = (canvasWrapper.parentNode.clientWidth  - _marginSize * 2) / parseFloat(currentPage.style.width)  * __ZOOMSCALE;
        const pageHeightScale = (canvasWrapper.parentNode.offsetHeight - _marginSize * 2) / parseFloat(currentPage.style.height) * __ZOOMSCALE;

        var scale = __ZOOMSCALE;
        switch (_pageMode) {
            case "FitPage":
                scale = pageHeightScale;
                break;
            case "FitWidth":
                scale = pageWidthScale;
                break;
            case "FitZoomAll":
                scale = Math.min(pageWidthScale, pageHeightScale);
                break;
            case "Original":
            case "100percent":
                scale = 1;
                break;
            case "500percent":
                scale = 5;
                break;
            case "250percent":
                scale = 2.5;
                break;
            case "200percent":
                scale = 2;
                break;
            case "75percent":
                scale = 0.75;
                break;
            case "50percent":
                scale = 0.5;
                break;
            case "25percent":
                scale = 0.25;
                break;
            case "10percent":
                scale = 0.1;
                break;
            default:
                console.log("Requested Page Mode is not supported");
                return;
        }

        if (Math.abs(__ZOOMSCALE - scale) > 0.001) {
            _getScrollTopData(scale);

            _refreshPDF(function(success){
                if (success) {
                    if (callback) {
                        callback();
                    }
                }
            }, {zoomScale: scale});
        } else {
            if (callback) {
                callback();
            }
        }

        _updateToolbarPageModeSelection();
    }

    function _updateToolbarPageModeSelection() {
        if (_toolbarEnabled && !_miniToolbar && _toolbarGroups.zoom) {
            var pageModeSelect = document.getElementById("CreoViewDocToolbarPageModeSelect");
            if (pageModeSelect) {
                document.getElementById("CreoViewDocToolbarPageModeSelect").value = _pageMode;
            }
        }
    }

    function _IsPDFSession() {
        var retVal = false;
        if (_currentCanvasId != "") {
            retVal = _currentCanvasId.indexOf("_CreoViewDocumentCanvas") != -1 ? true : false;
        }
        return retVal;
    }

    function _initializeTemplates() {
        _pageWrapperTemplate = null;
        _textLayerTemplate = null;
        _watermarkCanvasTemplate = null;
        _watermarkLayerTemplate = null;
        _annotationTemplate = null;
        _canvasTemplate = null;
        _navWrapperTemplate = null;
        _navAnnotationCanvasTemplate = null;

        _printDivTemplate = null;
        _printWrapperTemplate = null;
        _printPageTemplate = null;
        _printMarkupTemplate = null;

        _prefetchedPage = null;
        _printCallback = null;
    }

    function _showWatermarks (visible) {
        var watermarkCanvases = document.querySelectorAll(".PdfWatermarkCanvas");
        for (var canvas of watermarkCanvases) {
            canvas.style.visibility = (visible === true ? "visible" : "hidden" );
        }
    }

    function _generateTransparentWatermarkImage (watermark, image) {
        const canvas = document.createElement("canvas");
        canvas.width = watermark._width;
        canvas.height = watermark._height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        image.style.display = "none";
        const imageData = ctx.getImageData(0, 0, watermark._width, watermark._height);
        const data = imageData.data;

        if (_watermark.global.style.wmprintfirst === "true") {
            for (var i=3;i<data.length;i+=4) {
                data[i] = 128; // transparency 0.5
            }
        }

        // if (_watermark.global.style.wmprintfirst === "false") {
        //     for (var i=0;i<data.length;i+=4) {
        //         if (data[i] == 255 &&
        //             data[i+1] == 255 &&
        //             data[i+2] == 255) {
        //             data[i+3] = 0;
        //         }
        //     }
        // }
        ctx.putImageData(imageData, 0, 0);
        watermark._image = canvas.toDataURL();
    }

    function _loadWatermarkImage (watermark) {
        return new Promise(function (resolve, reject) {
            const img = new Image();
            img.src = "watermark/" + watermark.image;
            img.onload = function () {
                watermark._width = this.width;
                watermark._height = this.height;
                _generateTransparentWatermarkImage(watermark, this);
                watermark._loaded = true;
                resolve();
            };
            img.onerror = function () {
                watermark._loaded = false;
                console.error(`Failed to load watermark image "${watermark.image}"`);
                resolve();
            };
        });
    }

    function _loadWatermarkText (watermark) {
        const getMaxLineWidth = function (context, text) {
            var maxWidth = 0;
            const widths = [];
            const lines = text.split("{lf}");
            for (const line of lines) {
                const textSize = context.measureText(line);
                if (maxWidth < textSize.width) {
                    maxWidth = textSize.width;
                }
                widths.push(textSize.width);
            }
            return { text: lines, widths: widths, maxWidth: maxWidth };
        };
        return new Promise(function (resolve, reject) {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const font =
                (watermark.italic === "true" ? "italic " : "") +
                (watermark.bold === "true" ? "bold " : "") +
                (watermark.size + "px ") +
                watermark.font;
            ctx.font = font;
    
            const lines = getMaxLineWidth(ctx, watermark.text);
            watermark._widths = lines.widths;
            watermark._width = lines.maxWidth;
            watermark._height = parseInt(watermark.size) * 1.12;
            watermark.text = lines.text;
            resolve();
        });
    }

    function _checkWatermarkSize (callback) {
        const promiseArray = [];
        _watermark.document.forEach(function (wm) {
            if (wm.image) {
                promiseArray.push(_loadWatermarkImage(wm));
            } else if (wm.text) {
                promiseArray.push(_loadWatermarkText(wm));
            }
        });
        Promise.all(promiseArray).then(function () {
            if (_watermark.document.length) {
                for (var i = _firstLoadedPage; i <= _lastLoadedPage; i++) {
                    const pageWrapper = document.getElementById("PdfPageDisplayWrapper" + i);
                    const width = parseInt(pageWrapper.style.width);
                    const height = parseInt(pageWrapper.style.height);
                    addWatermarkLayer(pageWrapper, i, width, height);
                }
            }
            if (callback) callback();
        });
    }

    function _parseWatermark (section, index, name, value) {
        if (_watermark[section][index] == undefined) {
            _watermark[section][index] = {
                _id: index
            };
        }
        if (_watermark[section][index][name] == undefined) {
            _watermark[section][index][name] = value;
        }
    }

    function _parseWatermarkIni (data, callback) {
        const regex = {
            section: /^\s*\[\s*([^\]]*)\s*\]\s*$/,
            key: /^\s*([^=]+?)\s*=\s*(.*?)\s*$/,
            nameIndex: /^([a-zA-Z]+)(\d+)$/,
            comment: /^\s*;.*$/
        };
        const lines = data.split(/[\r\n]+/);
        var section = null;
        lines.forEach(function (line) {
            if (regex.comment.test(line)) {
                return;
            } else if (regex.key.test(line)) {
                if (section === "document" ||
                    section === "drawing") {
                    let match1 = line.match(regex.key);
                    let match2 = match1[1].match(regex.nameIndex);
                    if (match1 && match2) {
                        _parseWatermark(section, parseInt(match2[2]) - 1, match2[1], match1[2]);
                    }
                } else if (section) {
                    let match = line.match(regex.key);
                    _watermark.global[section][match[1]] = match[2];
                }
            } else if (regex.section.test(line)) {
                let match = line.match(regex.section);
                if (match[1] === "model"  || match[1] === "image" ||
                    match[1] === "markup" || match[1] === "ecad") {
                    section = null;
                    return;
                }
                if (match[1] !== "document" && match[1] !== "drawing")
                    _watermark.global[match[1]] = {};
                section = match[1];
            } else if (line.length == 0 && section) {
                section = null;
            }
        });
        if (_watermark.global.resolution && _watermark.global.resolution.dpi) {
            _watermark.global._dpiRatio = 96 * window.devicePixelRatio / parseInt(_watermark.global.resolution.dpi);
        }
        _checkWatermarkSize(callback);
    }

    function _loadWatermarks (watermark, callback) {
        if (!watermark) {
            if (callback) callback();
            return;
        }
        const url = watermark.url;
        if (url) {
            var xhr = new XMLHttpRequest();
            const getUrl = "watermark/" + url;
            xhr.open("GET", getUrl, true);
            xhr.setRequestHeader("Content-Type", "text/html");
            xhr.send(null);
            xhr.onload = function () {
                if (xhr.status != 200) {
                    console.log("XMLHttpRequest failed to download " + getUrl);
                    if (callback) callback();
                } else {
                    _watermark.reset();
                    _watermark.visible = watermark.visible;
                    _parseWatermarkIni(xhr.response, callback);
                }
            };
            xhr.onerror = function () {
                console.log("XMLHttpRequest failed to download " + getUrl);
                if (callback) callback();
            };
        }
    }

    function _LoadPDF (val, isUrl, callback, isWindowless, watermark) {
        if(_IsPDFSession() && val) {
            _ignoreScrollEvent = true;
            __ZOOMSCALE = 1;
            __CURRENT_PAGE = _pdfAnnotationSetCurrentPage || 1;
            _pageRotation = 0;
            _markupMode.selectedAnnotations = [];
            _markupMode.hiddenSelectedAnnotations = [];
            _markupHistory.reset();
            var canvasWrapper = document.getElementById(_currentCanvasId);
            if (_sidebarEnabled){
                _RemovePdfSideBar(document.getElementById(_parentCanvasId));
            }
            while(canvasWrapper.lastChild){
                canvasWrapper.removeChild(canvasWrapper.lastChild);
            }

            var removePasswordDialog = function() {
                var pwBGElem = document.getElementById("PasswordBackground");
                if (pwBGElem) {
                    pwBGElem.parentNode.removeChild(pwBGElem);
                }
            };
            const params = {
                cMapUrl: "cmaps/",
                cMapPacked: true
            };
            if (isUrl)
                params.url = val;
            else
                params.data = val;

            const loadingTask = _PDFJS.getDocument(params);

            loadingTask.onPassword = function(updatePassword, reason) {
                if (reason === _PDFJS.PasswordResponses.NEED_PASSWORD) {
                    if (isWindowless == true) {
                        _pendingUpdatePassword = updatePassword;
                        if (callback) callback(returnObj.LOAD_EVENT.NEED_PASSWORD);
                        return;
                    }
                    if (document.getElementById("PasswordBackground") == null) {
                        const passwordBG = document.createElement("div");
                        passwordBG.id = "PasswordBackground";
                        passwordBG.style.width = "100%";
                        passwordBG.style.height = "100%";
                        passwordBG.style.backgroundColor = "lightgrey";
                        passwordBG.style.overflow = "hidden";
                        passwordBG.style.position = "absolute";
                        passwordBG.style.top = "0px";
                        passwordBG.style.left = "0px";

                        const passwordDiv = document.createElement("div");
                        passwordDiv.id = "PasswordContainer";
                        passwordDiv.style.position = "absolute";
                        passwordDiv.style.top = "50%";
                        passwordDiv.style.left = "50%";
                        passwordDiv.style.transform = "translate(-50%, -50%)";
                        passwordDiv.style.border = "1px solid black";
                        passwordDiv.style.padding = "20px 20px 10px";
                        passwordDiv.style.margin = "3px";
                        passwordDiv.style.backgroundColor = "white";
                        passwordBG.appendChild(passwordDiv);

                        const passwordTitle = document.createElement("div");
                        passwordTitle.style.textAlign = "left";
                        passwordTitle.style.marginBottom = "10px";
                        passwordTitle.style.display = "block";
                        passwordTitle.innerHTML = _pdfText.enterPassword;
                        passwordDiv.appendChild(passwordTitle);

                        const passwordInputDiv = document.createElement("div");
                        passwordInputDiv.style.marginBottom = "10px";
                        passwordInputDiv.style.display = "block";
                        passwordDiv.appendChild(passwordInputDiv);

                        const passwordInput = document.createElement("input");
                        passwordInput.type = "password";
                        passwordInput.id = "PasswordInput";
                        passwordInput.autocomplete = "off";
                        passwordInput.style.width = "240px";
                        passwordInput.style.display = "block";
                        passwordInput.style.border = "1px solid black";
                        passwordInputDiv.appendChild(passwordInput);

                        const passwordButtonDiv = document.createElement("div");
                        passwordButtonDiv.style.display =  "block";
                        passwordButtonDiv.style.height =  "20px";
                        passwordButtonDiv.style.marginBottom =  "10px";
                        passwordDiv.appendChild(passwordButtonDiv);

                        const passwordOK = document.createElement("button");
                        passwordOK.id = "PasswordOK";
                        passwordOK.innerHTML = "OK";
                        passwordOK.style.width = "120px";
                        passwordOK.style.height = "20px";
                        passwordOK.style.float = "left";
                        passwordOK.style.marginRight = "3px";
                        passwordButtonDiv.appendChild(passwordOK);

                        const passwordCancel = document.createElement("button");
                        passwordCancel.id = "PasswordCancel";
                        passwordCancel.innerHTML = "Cancel";
                        passwordCancel.style.width = "120px";
                        passwordCancel.style.height = "20px";
                        passwordCancel.style.float = "right";
                        passwordButtonDiv.appendChild(passwordCancel);

                        const passwordMessage = document.createElement("div");
                        passwordMessage.id = "PasswordMessage";
                        passwordMessage.style.display = "block";
                        passwordMessage.style.color = "red";
                        passwordMessage.style.textAlign = "left";
                        passwordMessage.style.marginBottom = "10px";
                        passwordDiv.appendChild(passwordMessage);

                        const parent = canvasWrapper.parentNode;
                        parent.appendChild(passwordBG);

                        passwordInput.addEventListener("keyup", function(e) {
                            if (e.keyCode === 13) { // return key
                                e.preventDefault();
                                document.getElementById("PasswordOK").click();
                            }
                        });
                        passwordOK.addEventListener("click", function(e) {
                            var pwInputElem = document.getElementById("PasswordInput");
                            var pw = pwInputElem.value;
                            pwInputElem.value = '';
                            updatePassword(pw.length ? pw : ' ');
                        });
                        passwordCancel.addEventListener("click", function(e) {
                            removePasswordDialog();
                        });
                    }
                } else if (reason === _PDFJS.PasswordResponses.INCORRECT_PASSWORD) {
                    if (isWindowless) {
                        _pendingUpdatePassword = updatePassword;
                        if (callback) callback(returnObj.LOAD_EVENT.WRONG_PASSWORD);
                        return;
                    } else {
                        let passwordMessage = _pdfText.incorrectPassword + '<br>' + _pdfText.enterPasswordAgain;
                        document.getElementById("PasswordMessage").innerHTML = passwordMessage;
                    }
                }
            };

            loadingTask.promise.then(function(pdf_doc) {
                removePasswordDialog();

                __PDF_DOC = pdf_doc;
                __TOTAL_PAGES = __PDF_DOC.numPages;
                _firstLoadedPage = Math.min(Math.max(1, __CURRENT_PAGE), __TOTAL_PAGES);
                _lastLoadedPage = Math.min(__TOTAL_PAGES, _firstLoadedPage + 2);
                _largestWidth = _largestHeight = 0;
                _largestZoomScale = 10;
                _resetSearchVariables();
                _initializeTemplates();
                generateOrderToShowPages(1);
                _preCalculateZoomScale(canvasWrapper, function() {
                    _preparePageWrapper(canvasWrapper, 1, function() {
                        _adjustWrapperSize();
                        _scrollToPage(__CURRENT_PAGE);
                        _scrollToHorizontalCenter();
                        _getOptionalContentConfig(false, function () {
                            showPagesOnOrder(function(success) {
                                if (success) {
                                    __PDF_DOC.getOutline().then(function(outline){
                                        if(outline){
                                            _bookmarks = outline;
                                        } else {
                                            _bookmarksBar.enabled = false;
                                            _navbar.enabled = true;
                                        }
                                        if (_sidebarEnabled) {
                                            if (_navbar.enabled) {
                                                _DisplayPdfNavigationBar(_CreateSideBar(document.getElementById(_parentCanvasId)), 1);
                                            } else if (_bookmarksBar.enabled) {
                                                _DisplayPdfBookmarksBar(_CreateSideBar(document.getElementById(_parentCanvasId)));
                                            }
                                        }
                                        if (_toolbarEnabled) {
                                            _resizeDocumentToolbar(document.getElementById(_parentCanvasId), _toolbarGroups);
                                            _updateDocumentToolbarPageDisplay();
                                        }
                                        _setUserSelect();
                                        _ignoreScrollEvent = false;
                                        _documentLoaded = true;
                                        _loadWatermarks(watermark, function () {
                                            if (callback) {
                                                callback(returnObj.LOAD_EVENT.LOAD_SUCCESS);
                                            }
                                        });
                                    });
                                }
                            });
                        });
                    });
                });
            }).catch(function(error) {
                console.log("Javascript caught exception in showPDF : " + error.message);
                if (typeof callback === "function") callback(returnObj.LOAD_EVENT.LOAD_FAILURE);
            });
        }
    }

    function _getOptionalContentConfig (refresh, callback) {
        __PDF_DOC.getOptionalContentConfig().then(function (optionalContentConfig) {
            if (optionalContentConfig) {
                _optionalContentConfig = optionalContentConfig;
                _setAnnotationSetLayerState(refresh);
            }
            if (callback) callback();
        });
    }

    function _getPdfLayers () {
        const layers = [];
        if (_optionalContentConfig) {
            const order = _optionalContentConfig.getOrder();
            if (order) {
                const queue = [order];
                while (queue.length) {
                    const groups = queue.shift();
                    for (const groupId of groups) {
                        if (typeof groupId === "string") {
                            const group = _optionalContentConfig.getGroup(groupId);
                            if (group) {
                                layers.push({id: groupId, name: group.name, visible: group.visible});
                            }
                        }
                    }
                }
            }
        }
        return layers;
    }

    function _setLayerStatus (layerStatus) {
        if (!_optionalContentConfig) return;
        if (!Array.isArray(layerStatus)) return;
        var updated = false;
        for (const layer of layerStatus) {
            const id = layer.id;
            const visible = layer.visible;
            if (typeof id === "string" && typeof visible === "boolean") {
                const group = _optionalContentConfig.getGroup(id);
                if (!group) continue;
                if (group.visible == visible) continue;
                _optionalContentConfig.setVisibility(id, visible);
                updated = true;
            }
        }
        if (updated) _refreshCanvasLayer();
    }

    function _setAnnotationSetLayerState (refresh) {
        const getLayerState = function (layer) {
            if (typeof _pdfAnnotationSetLayerState.cur[layer] === "boolean") {
                return _pdfAnnotationSetLayerState.cur[layer];
            }
            return undefined;
        };

        if (_pdfAnnotationSetLayerState.cur) {
            for (const layer of _getPdfLayers()) {
                const state = getLayerState(layer.name);
                if (state == undefined || state === layer.visible) continue;
                _optionalContentConfig.setVisibility(layer.id, state);
            }
        }

        if (refresh === true) {
            _refreshCanvasLayer();
            if (_layerStateCallback) _layerStateCallback();
        }
    }

    function _refreshCanvasLayer () {
        const renderCanvas = function (page) {
            const viewport = page.getViewport({scale: __ZOOMSCALE, rotation: _getPageRotate(page)});
            const canvas = document.getElementById("PdfPageDisplayCanvas" + page.pageNumber);
            if (!canvas) return;
            const clone = canvas.cloneNode(false);
            const params = {
                canvasContext: clone.getContext("2d"),
                viewport: viewport
            };
            if (_optionalContentConfig) {
                params.optionalContentConfigPromise = Promise.resolve(_optionalContentConfig);
            }
            const ratio = getValidZoomRatio();
            if (ratio != 1) {
                params.transform = [ratio, 0, 0, ratio, 0, 0];
            }

            page.render(params).promise.then(function () {
                canvas.getContext("2d").drawImage(clone, 0, 0);
            });
        };

        for (var pageNo = _firstLoadedPage; pageNo <= _lastLoadedPage; pageNo++) {
            __PDF_DOC.getPage(pageNo).then(renderCanvas);
        }
    }

    function _SetDocumentPassword (pswd) {
        if (_pendingUpdatePassword) {
            _pendingUpdatePassword(pswd);
        }
    }

    function _CancelDocumentLoad (callback) {
        _pendingUpdatePassword = null;
        if (callback) {
            callback(returnObj.LOAD_EVENT.LOAD_FAILURE);
        }
    }

    function _preCalculateZoomScale(canvasWrapper, callback) {
        __PDF_DOC.getPage(1).then(function(page){
            const viewport = page.getViewport({scale: 1, rotation: _getPageRotate(page)});
            var pageWidth = parseFloat(viewport.width);
            var pageHeight = parseFloat(viewport.height);

            var pageWidthScale  = (canvasWrapper.parentNode.clientWidth  - _marginSize * 2)  / pageWidth;
            var pageHeightScale = (canvasWrapper.parentNode.clientHeight - _marginSize * 2) / pageHeight;

            var scale = __ZOOMSCALE;
            switch(_pageMode) {
            case "FitPage":
                scale = pageHeightScale;
                break;

            case "FitWidth":
                scale = pageWidthScale;
                break;
            }

            __ZOOMSCALE = scale;

            _updateToolbarPageModeSelection();

            if (callback) callback();
        });
    }

    function _resizePageWrapper(pageNo, mode, callback) {
        var pageWrapper = document.getElementById("PdfPageDisplayWrapper" + pageNo);
        if (pageWrapper) {
            for (let i = pageWrapper.childNodes.length-1; i >= 0; i--) {
                if (pageWrapper.childNodes[i].id !== ("PdfPageDisplayCanvas" + pageNo)) {
                    pageWrapper.removeChild(pageWrapper.childNodes[i]);
                }
            }
            __PDF_DOC.getPage(pageNo).then(function(page) {
                const viewport = page.getViewport({scale: __ZOOMSCALE, rotation: _getPageRotate(page)});
                var width = parseFloat(viewport.width);
                var height = Math.floor(parseFloat(viewport.height));
                _largestWidth = Math.max(_largestWidth, width);
                _largestHeight = Math.max(_largestHeight, height);
                pageWrapper.height = height + "px";
                pageWrapper.width = width + "px";
                pageWrapper.style.height = height + "px";
                pageWrapper.style.width = width + "px";
                pageWrapper.style.margin = _marginSize + "px auto";

                // resize canvas
                const canvas = pageWrapper.querySelector("canvas");
                if (canvas) {
                    const newCanvas = _getPDFCanvas();
                    newCanvas.id = "PdfPageDisplayCanvasOld" + pageNo;
                    newCanvas.className = "PdfPageDisplayCanvas";
                    if (mode == _refreshMode.zoom) {
                        newCanvas.width = width;
                        newCanvas.height = height;
                        newCanvas.getContext("2d").drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, width, height);
                    } else if (mode == _refreshMode.rotCw || mode == _refreshMode.rotCcw) {
                        newCanvas.width = canvas.height;
                        newCanvas.height = canvas.width;
                        const context = newCanvas.getContext("2d");
                        context.translate(width/2, height/2);
                        context.rotate((mode == _refreshMode.rotCw ? 90 : -90) * Math.PI / 180);
                        context.drawImage(canvas, -height/2, -width/2);
                    }
                    pageWrapper.removeChild(canvas);
                    pageWrapper.appendChild(newCanvas);
                }

                if (pageNo < __TOTAL_PAGES) {
                    _resizePageWrapper(pageNo+1, mode, callback);
                } else {
                    if (callback) {
                        callback();
                    }
                }
            });
        }
    }

    function _addPageWrapperStyle () {
        const selectionStyle = document.createElement('style');
        selectionStyle.innerHTML = `
            .PdfPageDisplayWrapper {
                margin: ${_marginSize}px auto;
                background-color: white;
                box-shadow: 0px 0px 6px rgba(0,0,0,0.5);
                position: relative;
                display: block;
            }
        `;
        document.getElementsByTagName('head')[0].appendChild(selectionStyle);
    }

    function _preparePageWrapper(canvasWrapper, pageNo, callback) {
        __PDF_DOC.getPage(pageNo).then(function(page){
            const viewport = page.getViewport({scale: __ZOOMSCALE, rotation: _getPageRotate(page)});

            var height = Math.floor(parseFloat(viewport.height));
            var width = parseFloat(viewport.width);
            _largestWidth = Math.max(_largestWidth, width);
            _largestHeight = Math.max(_largestHeight, height);
            var largestLength = Math.max(_largestWidth / __ZOOMSCALE, _largestHeight / __ZOOMSCALE);
            _largestZoomScale = _maxCanvasLength / largestLength;

            var pageWrapper = null;
            if (_pageWrapperTemplate == null) {
                pageWrapper = document.createElement("div");
                pageWrapper.className = "PdfPageDisplayWrapper";

                _pageWrapperTemplate = pageWrapper.cloneNode(false);
            } else {
                pageWrapper = _pageWrapperTemplate.cloneNode(false);
            }
            pageWrapper.style.height = height + "px";
            pageWrapper.style.width = width + "px";

            pageWrapper.height = height + "px";
            pageWrapper.width = width + "px";

            pageWrapper.id = "PdfPageDisplayWrapper" + pageNo;

            canvasWrapper.appendChild(pageWrapper);
            if (pageNo < __TOTAL_PAGES) {
                _preparePageWrapper(canvasWrapper, pageNo+1, callback);
            } else {
                if (callback) {
                    callback();
                }
            }
        });
    }

    function handleNextPageOnOrder(callback) {
        var pageNo = _orderToShowPages.shift();
        if (pageNo) {
            __PDF_DOC.getPage(pageNo).then(function(newPage){
                handlePage(newPage, callback);
            });
        } else {
            if (callback) {
                callback(true);
            }
        }
    }

    function _addTextLayerStyle (className) {
        const selectionStyle = document.createElement('style');
        selectionStyle.innerHTML = `
            .${className} {
                position: absolute;
                text-align: initial;
                left: 0;
                top: 0;
                right: 0;
                bottom: 0;
                overflow: hidden;
                opacity: 0.2;
                line-height: 1;
                -webkit-text-size-adjust: none;
                   -moz-text-size-adjust: none;
                        text-size-adjust: none;
            }
            .${className} span,
            .${className} br {
                color: transparent;
                position: absolute;
                white-space: pre;
                cursor: text;
                transform-origin: 0% 0%;
            }
            .${className} br {
                user-select: none;
            }
        `;
        document.getElementsByTagName('head')[0].appendChild(selectionStyle);
    }

    function getTextLayer(pageNo, width, height, selectedMarkup) {
        var textLayer = null;
        if (_textLayerTemplate == null) {
            textLayer = document.createElement("div");
            textLayer.className = "PdfPageDisplayTextLayer";

            _textLayerTemplate = textLayer.cloneNode(false);
        } else {
            textLayer = _textLayerTemplate.cloneNode(false);

        }
        textLayer.id = "PdfPageDisplayTextLayer" + pageNo;
        textLayer.width  = width;
        textLayer.height = height;
        textLayer.style.width  = width + "px";
        textLayer.style.height = height + "px";
        textLayer.style.zIndex = selectedMarkup ? _zIndex.watermark : _zIndex.text;

        var drag = {x: 0, y: 0};
        textLayer.addEventListener("mousedown", function(e){
            _handleMarkupSelectionCheck(e, drag);
        });
        textLayer.addEventListener("mouseup", function(e){
            _handleMarkupSelectionCheck(e, drag);
        });

        return textLayer;
    }

    function _roundToInt (val) {
        return parseInt(Math.floor(val + 0.5));
    }

    function _convertValToPixel (type, baseVal, viewSize, zoomScale) {
        var val = parseInt(baseVal);
        switch (type) {
        case "percent":
            val = _roundToInt(val * (viewSize * 0.01));
            break;
        case "abspixel":
            break;
        case "dpipixel":
            val = _roundToInt(val * zoomScale * _watermark.global._dpiRatio);
            break;
        }
        return val;
    }

    function _addTextWatermarkPattern (watermark, svgLayer, svgText, zoomScale) {
        var textFill = "none";

        if (watermark.filltype == "none" ||
            watermark.filltype == "opaque") {
            textFill = "rgb(" + watermark.color + ")";
        } else if (watermark.filltype == "bdiagonal") {
/*
            const pattern = document.createElementNS(_svgNS, "pattern");
            const id = "textPattern" + watermark._id;
            pattern.id = id;
            pattern.setAttribute("x", "0");
            pattern.setAttribute("y", "0");
            pattern.setAttribute("width", "8");
            pattern.setAttribute("height", "8");
            pattern.setAttribute("patternUnits", "userSpaceOnUse");
            pattern.setAttribute("patternTransform", "rotate(45)");

            const rect = document.createElementNS(_svgNS, "rect");
            rect.setAttribute("x", "0");
            rect.setAttribute("y", "0");
            rect.setAttribute("width", "1");
            rect.setAttribute("height", "8");
            rect.setAttribute("stroke", "none");
            rect.setAttribute("fill", "rgb(" + watermark.color + ")");

            pattern.appendChild(rect);
            svgLayer.appendChild(pattern);

            textFill = "url(#" + id + ")";
*/
        }

        svgText.style.fill = textFill;
        if (watermark.filltype !== "none") {
            svgText.style.paintOrder = "fill stroke";
            svgText.style.stroke = "black";
            svgText.style.strokeWidth = "1px";
        }
    }

    function _addTextWatermark (watermark, svgLayer, zoomScale) {
        const textWidth = watermark._width * zoomScale,
              textHeight = watermark._height * zoomScale * watermark.text.length,
              canvasWidth = svgLayer.clientWidth,
              canvasHeight = svgLayer.clientHeight,
              baseXY = watermark.textbasexy.split(",");

        // convert users offset from the unit to pixels
        var userOffset = [
            _convertValToPixel(watermark.textunittype, baseXY[0], canvasWidth, zoomScale),
            _convertValToPixel(watermark.textunittype, baseXY[1], canvasHeight, zoomScale)
        ];
        if (watermark.textxbasetype === "right")  userOffset[0] *= -1;
        if (watermark.textybasetype === "bottom") userOffset[1] *= -1;

        // find the total extent of the text
        const bboxSize = [textWidth, textHeight];
        if (watermark.diagonal === "true") {
            const angle = (watermark.angle ? parseInt(watermark.angle) : 0) * Math.PI / 180;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const rotatePt = function (x, y) {
                return [
                    x * cos - y * sin,
                    x * sin + y * cos
                ];
            };
            var pts = [
                [-textWidth/2, -textHeight/2],
                [ textWidth/2, -textHeight/2],
                [ textWidth/2,  textHeight/2],
                [-textWidth/2,  textHeight/2]
            ];
            var minX = Number.MAX_VALUE, minY = Number.MAX_VALUE,
                maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE;
            for (let i=0;i<pts.length;i++) {
                let pt = rotatePt(pts[i][0], pts[i][1]);
                minX = Math.min(minX, pt[0]);
                maxX = Math.max(maxX, pt[0]);
                minY = Math.min(minY, pt[1]);
                maxY = Math.max(maxY, pt[1]);
            }
            bboxSize[0] = Math.abs(maxX - minX);
            bboxSize[1] = Math.abs(maxY - minY);
        }

        // find center of bbox
        var bboxCenterPoint = [0, 0];
        switch(watermark.textxbasetype) {
        case "left":
            bboxCenterPoint[0] = _roundToInt(bboxSize[0] / 2);
            break;
        case "center":
            bboxCenterPoint[0] = _roundToInt(canvasWidth / 2);
            break;
        case "right":
            bboxCenterPoint[0] = canvasWidth - _roundToInt(bboxSize[0] / 2);
            break;
        }
        switch(watermark.textybasetype) {
        case "top":
            bboxCenterPoint[1] = _roundToInt(bboxSize[1] / 2);
            break;
        case "center":
            bboxCenterPoint[1] = _roundToInt(canvasHeight / 2);
            break;
        case "bottom":
            bboxCenterPoint[1] = canvasHeight - _roundToInt(bboxSize[1] / 2);
            break;
        }

        // adjust for margins, and user offset
        bboxCenterPoint[0] += userOffset[0];
        bboxCenterPoint[1] += userOffset[1];

        const fontSize = parseFloat(watermark.size) * zoomScale;
        const text = document.createElementNS(_svgNS, "text");
        text.setAttribute("x", bboxCenterPoint[0]);
        text.setAttribute("y", bboxCenterPoint[1] + fontSize * (_EDGE ? 0.5 : 0.2)); // hack to adjust vertical position
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        const font =
            (watermark.italic === "true" ? "italic " : "") +
            (watermark.bold === "true" ? "bold " : "") +
            (fontSize.toFixed(1) + "px ") +
            watermark.font;
        text.style.font = font;
        text.style.whiteSpace = "pre";
        _addTextWatermarkPattern(watermark, svgLayer, text, zoomScale);
        const textDeco =
            (watermark.underline === "true" ? "underline " : "") +
            (watermark.strikeout === "true" ? "line-through" : "");
        if (textDeco.length) {
            text.setAttribute("text-decoration", textDeco);
        }
        if (watermark.diagonal === "true") {
            const angle = watermark.angle ? -parseInt(watermark.angle) : 0;
            const transform = "rotate(" + angle + " " + bboxCenterPoint[0] + " " + bboxCenterPoint[1] + ")";
            text.setAttribute("transform", transform);
        }
        if (_watermark.global.style.wmprintfirst === "true") {
            text.setAttribute("opacity", "0.5");
        }

        var textHtml = "";
        var dySum = 0;
        for (let i=0;i<watermark.text.length;i++) {
            if (watermark.text[i].length == 0) {
                dySum += fontSize;
                continue;
            }
            let dx = (watermark._width - watermark._widths[i]) * zoomScale / 2;
            switch (watermark.justification) {
                case "left": dx *= -1; break;
                case "center": dx = 0; break;
            }
            let dy = (i == 0 ? "" : (" dy=\"" + (fontSize + dySum) + "\""));
            textHtml += "<tspan x=\"" + (bboxCenterPoint[0] + dx) + "\"" + dy + ">" + watermark.text[i] + "</tspan>";
            dySum = 0;
        }
        text.innerHTML = textHtml;

        svgLayer.appendChild(text);
    }

    function _addImageWatermark (watermark, svgLayer, zoomScale) {
        if (!watermark._loaded) return;
        const imageWidth = watermark._width * zoomScale,
              imageHeight = watermark._height * zoomScale,
              canvasWidth = svgLayer.clientWidth,
              canvasHeight = svgLayer.clientHeight,
              baseXY = watermark.imagebasexy.split(","),
              deltaXY = watermark.deltaxy.split(","),
              userOffsetX = _convertValToPixel(watermark.imageunittype, baseXY[0], canvasWidth, zoomScale),
              userOffsetY = _convertValToPixel(watermark.imageunittype, baseXY[1], canvasHeight, zoomScale);

        // work out the size of the bitmap
        var bboxSize = [imageWidth, imageHeight];
        switch (watermark.imageunittype) {
        case "percent":
            if (watermark.usedeltax === "true") bboxSize[0] = _roundToInt(canvasWidth * 0.01 * parseInt(deltaXY[0]));
            if (watermark.usedeltay === "true") bboxSize[1] = _roundToInt(canvasHeight * 0.01 * parseInt(deltaXY[1]));
            break;
        case "abspixel":
            if (watermark.usedeltax === "true") bboxSize[0] = _roundToInt(parseInt(deltaXY[0]) * zoomScale);
            if (watermark.usedeltay === "true") bboxSize[1] = _roundToInt(parseInt(deltaXY[1]) * zoomScale);
            break;
        case "dpipixel":
            if (watermark.usedeltax === "true") bboxSize[0] = _roundToInt(_watermark.global._dpiRatio * parseInt(deltaXY[0]) * zoomScale);
            if (watermark.usedeltay === "true") bboxSize[1] = _roundToInt(_watermark.global._dpiRatio * parseInt(deltaXY[1]) * zoomScale);
            break;
        }

        // find the position of the image
        var bboxRect = [0, 0, 0, 0];
        switch (watermark.imagexbasetype) {
        case "left":
            bboxRect[2] = bboxSize[0];
            break;
        case "center":
            bboxRect[0] = _roundToInt(canvasWidth / 2 - bboxSize[0] / 2);
            bboxRect[2] = _roundToInt(canvasWidth / 2 + bboxSize[0] / 2);
            break;
        case "right":
            bboxRect[0] = canvasWidth - bboxSize[0];
            bboxRect[2] = canvasWidth;
            break;
        }
        switch (watermark.imageybasetype) {
        case "top":
            bboxRect[3] = bboxSize[1];
            break;
        case "center":
            bboxRect[1] = _roundToInt(canvasHeight / 2 - bboxSize[1] / 2);
            bboxRect[3] = _roundToInt(canvasHeight / 2 + bboxSize[1] / 2);
            break;
        case "bottom":
            bboxRect[1] = canvasHeight - bboxSize[1];
            bboxRect[3] = canvasHeight;
            break;
        }

        // maintain the aspect ratio
        if (watermark.isotropic === "true" && imageWidth && imageHeight) {
            // work out size with correct aspect
            var arx = bboxSize[0] / imageWidth;
            var ary = bboxSize[1] / imageHeight;
            if (arx < ary) arx = ary;
            var aspectSize = [_roundToInt(imageWidth * arx), _roundToInt(imageHeight * ary)];

            switch (watermark.imagexbasetype) {
            case "left":
                bboxRect[2] = bboxRect[0] + aspectSize[0];
                break;
            case "center":
                let leftOver = parseInt(bboxRect[2] - bboxRect[0] - aspectSize[0]);
                bboxRect[0] = _roundToInt(bboxRect[0] + leftOver / 2);
                bboxRect[2] = bboxRect[0] + aspectSize[0];
                break;
            case "right":
                bboxRect[0] = bboxRect[2] - aspectSize[0];
                break;
            }
            switch (watermark.imageybasetype) {
            case "top":
                bboxRect[3] = bboxRect[1] + aspectSize[1];
                break;
            case "center":
                let leftOver = parseInt(bboxRect[3] - bboxRect[1] - aspectSize[1]);
                bboxRect[1] = _roundToInt(bboxRect[1] + leftOver / 2);
                bboxRect[3] = bboxRect[1] + aspectSize[1];
                break;
            case "bottom":
                bboxRect[1] = bboxRect[3] - aspectSize[1];
                break;
            }
        }

        // adjust bboxRect for margins and user offset
        bboxRect[0] += userOffsetX;
        bboxRect[2] += userOffsetX;
        bboxRect[1] += userOffsetY;
        bboxRect[3] += userOffsetY;

        const image = document.createElementNS(_svgNS, "image");
        image.setAttribute("x", bboxRect[0]);
        image.setAttribute("y", bboxRect[1]);
        image.setAttribute("width", bboxRect[2] - bboxRect[0]);
        image.setAttribute("height", bboxRect[3] - bboxRect[1]);
        image.setAttributeNS(_xlinkNS, "xlink:href", watermark._image);

        svgLayer.appendChild(image);
    }

    function _addWatermarksToLayer (svg, zoomScale) {
        _watermark.document.forEach(function (wm) {
            if (wm.text) {
                _addTextWatermark(wm, svg, zoomScale);
            } else if (wm.image) {
                _addImageWatermark(wm, svg, zoomScale);
            }
        });
    }

    function addWatermarkLayer (pageWrapper, pageNo, wrapperWidth, wrapperHeight) {
        var watermarkCanvas = pageWrapper.querySelector(".PdfWatermarkCanvas");
        var watermarkSvgLayer = null;
        if (watermarkCanvas) {
            watermarkSvgLayer = watermarkCanvas.querySelector(".PdfWatermarkSvgLayer");
            while (watermarkSvgLayer.lastChild) {
                watermarkSvgLayer.removeChild(watermarkSvgLayer.lastChild);
            }
        } else {
            if (_watermarkCanvasTemplate == null) {
                watermarkCanvas = document.createElement("div");
                watermarkCanvas.className = "PdfWatermarkCanvas";
                watermarkCanvas.style.overflow = "hidden";
                watermarkCanvas.style.position = "absolute";
                watermarkCanvas.style.top = "0px";
                watermarkCanvas.style.left = "0px";
                watermarkCanvas.style.pointerEvents = "none";
                watermarkCanvas.style.zIndex = _zIndex.watermark;

                _watermarkCanvasTemplate = watermarkCanvas.cloneNode(false);
            } else {
                watermarkCanvas = _watermarkCanvasTemplate.cloneNode(false);
            }
            const width = _checkPageRotation()%2==1 ? parseFloat(wrapperHeight) : parseFloat(wrapperWidth);
            const height = _checkPageRotation()%2==1 ? parseFloat(wrapperWidth) : parseFloat(wrapperHeight);
            watermarkCanvas.id = "PdfWatermarkCanvas" + pageNo;
            watermarkCanvas.width = width;
            watermarkCanvas.height = height;
            watermarkCanvas.style.width = width + "px";
            watermarkCanvas.style.height = height + "px";
            watermarkCanvas.style.transform = _getAnnotationCanvasTransform(width, height);
            watermarkCanvas.style.visibility = (_watermark.visible === true ? "visible" : "hidden" );

            const absMarginLeft = parseInt(_watermark.global.margin.left) * _watermark.global._dpiRatio,
                absMarginTop = parseInt(_watermark.global.margin.top) * _watermark.global._dpiRatio,
                absMarginRight = parseInt(_watermark.global.margin.right) * _watermark.global._dpiRatio,
                absMarginBottom = parseInt(_watermark.global.margin.bottom) * _watermark.global._dpiRatio;

            if (_watermarkLayerTemplate == null) {
                watermarkSvgLayer = document.createElementNS(_svgNS, "svg");
                watermarkSvgLayer.classList.add("PdfWatermarkSvgLayer");
                watermarkSvgLayer.style.overflow = "hidden";
                watermarkSvgLayer.style.position = "absolute";
                watermarkSvgLayer.style.zIndex = _zIndex.watermark;
                watermarkSvgLayer.style.pointerEvents = "none";


                watermarkSvgLayer.style.left = absMarginLeft + "px";
                watermarkSvgLayer.style.top = absMarginTop + "px";

                _watermarkLayerTemplate = watermarkSvgLayer.cloneNode(false);
            } else {
                watermarkSvgLayer = _watermarkLayerTemplate.cloneNode(false);
            }

            const layerWidth = width - (absMarginLeft + absMarginRight);
            const layerHeight = height - (absMarginTop + absMarginBottom);
            watermarkSvgLayer.id = "PdfWatermarkSvgLayer" + pageNo;
            watermarkSvgLayer.setAttribute("width", layerWidth);
            watermarkSvgLayer.setAttribute("height", layerHeight);
            watermarkSvgLayer.style.width = layerWidth + "px";
            watermarkSvgLayer.style.height = layerHeight + "px";

            watermarkCanvas.appendChild(watermarkSvgLayer);
            pageWrapper.appendChild(watermarkCanvas);
        }

        watermarkCanvas.style.visibility = (_watermark.visible === true ? "visible" : "hidden" );
        _addWatermarksToLayer(watermarkSvgLayer, __ZOOMSCALE);
    }

    /**
     * Make sure canvas size doesn't be greater than the browser allows
     * @returns {number} Floored to 3 decimal places; i.e. 1.234
     */
    function getValidZoomRatio () {
        const devicePixelRatio = window.devicePixelRatio || 1;
        if (__ZOOMSCALE * devicePixelRatio > _largestZoomScale) {
            return floor10(_largestZoomScale / __ZOOMSCALE, -3);
        }

        return devicePixelRatio;
    }

    function handlePage(page, callback) {
        const pageNo = page.pageNumber;
        const pageWrapper = document.getElementById("PdfPageDisplayWrapper" + pageNo);
        if (pageWrapper.querySelector("canvas") && !_refreshingPDF) {
            handleNextPageOnOrder(callback);
            return;
        }

        const ratio = getValidZoomRatio();

        const viewport = page.getViewport({scale: __ZOOMSCALE, rotation: _getPageRotate(page)});
        const height = parseFloat(viewport.height);
        const width = parseFloat(viewport.width);
        const canvas = getCanvas(pageNo, width, height, ratio);

        page.render(getRenderParams(canvas, viewport, ratio)).promise.then(function(){
            removeOldCanvas(pageWrapper)
            pageWrapper.appendChild(canvas);

            handleWatermarkLayer(pageWrapper, pageNo, width, height);

            const annotationCanvas = pageWrapper.querySelector(".PdfAnnotationCanvas");
            if (!annotationCanvas) {
                _redrawPdfAnnotationPage(pageNo, true);
            } else {
                annotationCanvas.style.visibility = "visible";
            }

            const textLayer = getTextLayer(pageNo, width, height, checkMarkupSelected(pageNo));
            pageWrapper.appendChild(textLayer);
            page.getAnnotations().then(function(annotations) {
                _addLinkAnnotationPage(pageWrapper, pageNo, width, height, annotations);
                _showAnnoSelectionPage(pageNo);

                page.getTextContent({ normalizeWhitespace: true }).then(function(textContent){
                    const textSpans = [];
                    _PDFJS.renderTextLayer({
                        textContent: textContent,
                        container: textLayer,
                        viewport: viewport,
                        textDivs: textSpans,
                        enhanceTextSelection: false
                    })._capability.promise.then(function(){
                        filterTextSpans(textSpans, textLayer.id, width, height);
                        handleNextPageOnOrder(callback);
                    });
                });
            });
        });
    }

    function checkMarkupSelected(pageNo) {
        if (!_pageAnnoSetList[pageNo]) return false;
        for (var idNo of _pageAnnoSetList[pageNo]) {
            if (_markupMode.selectedAnnotations.length > 0 &&
                _markupMode.selectedAnnotations.indexOf(idNo) > -1) {
                return true;
            }
        }
        return false;
    }

    function removeOldCanvas(pageWrapper) {
        const oldCanvas = pageWrapper.querySelector("canvas");
        if (oldCanvas) {
            pageWrapper.removeChild(oldCanvas);
        }
    }

    function getCanvas(pageNo, width, height, ratio) {
        const canvas = _getPDFCanvas();
        canvas.id = "PdfPageDisplayCanvas" + pageNo;
        canvas.className = "PdfPageDisplayCanvas";
        canvas.height = height * ratio;
        canvas.width = width * ratio;
        canvas.style.height = height + "px";
        canvas.style.width = width + "px";

        return canvas;
    }

    function getRenderParams(canvas, viewport, ratio) {
        const params = {
            canvasContext: canvas.getContext('2d'),
            viewport
        };
        if (_optionalContentConfig) {
            params.optionalContentConfigPromise = Promise.resolve(_optionalContentConfig);
        }
        if (ratio != 1) {
            params.transform = [ratio, 0, 0, ratio, 0, 0];
        }

        return params;
    }

    function handleWatermarkLayer(pageWrapper, pageNo, width, height) {
        if (_watermark.document.length) {
            addWatermarkLayer(pageWrapper, pageNo, width, height);
        }
    }

    /**
     * If a text span is completely out of a page, remove it.
     * Otherwise, add ID and class name.
     * @param {HTMLSpanElement[]} spans Array of text spans
     * @param {string} textLayerId ID of text layer
     * @param {number} width Width of page
     * @param {number} height Height of page
     */
    function filterTextSpans(spans, textLayerId, width, height) {
        for (let i = spans.length - 1; i >= 0; i--) {
            const span = spans[i],
                  left = parseFloat(span.style.left),
                  right = left + parseFloat(span.width),
                  top = parseFloat(span.style.top),
                  bottom = top + parseFloat(span.height);
            if (left > width || right < 0 || top > height || bottom < 0) {
                if (span.parentNode) {
                    span.parentNode.removeChild(span);
                }
            } else {
                span.id = `${textLayerId}_${i+1}`;
                span.className = "PdfPageDisplayTextContainer";
            }
        }
    }

    function gotoBookmark(page_no, coordinate, callback) {
        if ((page_no > 0) && (page_no <=__TOTAL_PAGES)) {
            if(!_ignoreScrollEvent) {
                _ignoreScrollEvent = true;

                _scrollToPage(page_no, function() {
                    showPage(page_no, function(success) {
                        if (success) {
                            _ignoreScrollEvent = false;
                            _changePageOnScroll();
                            _updateNavbar();
                        }
                        if (callback) callback(success);
                    }, 0);
                }, coordinate);
            }
        } else {
            if (callback) callback(false);
        }
    }

    function gotoPage(page_no, callback) {
        _confirmNoteChanges();
        if(!_ignoreScrollEvent) {
            _ignoreScrollEvent = true;

            _scrollToPage(page_no, function() {
                showPage(page_no, function(success) {
                    if (success) {
                        _ignoreScrollEvent = false;
                        _updateNavbar();
                        if (callback)
                            callback(true);
                        if (_pdfCallback)
                            _pdfCallback(true);
                    }
                }, 0);
            });
        }
    }

    function generateOrderToShowPages(type, center) {
        var arr = [];
        var first = _firstLoadedPage,
            last  = _lastLoadedPage,
            size  = last - first + 1;
        if (type == 1) {
            // Top down
            while (arr.length < size) {
                arr.push(first++);
            }
        } else if (type == -1) {
            // Bottom up
            while (arr.length < size) {
                arr.push(last--);
            }
        } else if (type == 0 || type == 3) {
            // Center first
            var multiplier = -1;
            var index = 0;
            var curPage = center;
            while (arr.length < size) {
                curPage = curPage + index * multiplier;
                if (curPage >= first && curPage <= last)
                arr.push(curPage);

                index += 1;
                multiplier *= -1;
            }
            if (type == 3) {
                // except center
                arr.shift();
            }
        } else if (type == 2) {
            arr.push(center);
        }

        _orderToShowPages = _orderToShowPages.concat(arr.filter (function (item) {
            return _orderToShowPages.indexOf(item) < 0;
        }));
    }

    function clearInvisibleWrappers() {
        const displayCanvases = document.querySelectorAll(".PdfPageDisplayCanvas");
        const pageWrappers = [];
        for (const canvas of displayCanvases) {
            pageWrappers.push(canvas.closest(".PdfPageDisplayWrapper"));
        }

        for (const wrapper of pageWrappers) {
            const pageNo = parseInt(wrapper.id.substring("PdfPageDisplayWrapper".length));
            if (pageNo < _firstLoadedPage || pageNo > _lastLoadedPage) {
                for (let i = wrapper.childNodes.length - 1; i >= 0; i--) {
                    if (wrapper.childNodes[i].id !== `PdfAnnotationCanvas${pageNo}`) {
                        wrapper.removeChild(wrapper.childNodes[i]);
                    } else {
                        wrapper.childNodes[i].style.visibility = "hidden";
                    }
                }
            }
        }
    }

    function showPagesOnOrder(callback) {
        var pageNo = _orderToShowPages.shift();
        if(pageNo) {
            __PDF_DOC.getPage(pageNo).then(function(page) {
                handlePage(page, function(success) {
                    if (callback) {
                        callback(success);
                    }
                });
            });
        } else {
            if (callback) {
                callback(true);
            }
        }
    }

    function getPageUnderPoint (x, y) {
        var pageNo = __CURRENT_PAGE;
        var elementsUnderCursor;
        if (document.elementsFromPoint) {
            elementsUnderCursor = document.elementsFromPoint(x, y);
        } else if (document.msElementsFromPoint) {
            elementsUnderCursor = document.msElementsFromPoint(x, y);
        }
        for (const elem of elementsUnderCursor) {
            if (elem.className) {
                if (typeof elem.className != "object" && elem.className.indexOf("PdfPageDisplayWrapper") != -1) {
                    pageNo = parseInt(elem.id.substring("PdfPageDisplayWrapper".length));
                    break;
                }
            }
        }
        return pageNo;
    }

    function getVisiblePages () {
        const scrollWrapper = document.getElementById(_currentCanvasId).parentNode;
        const scrollWrapperRect = scrollWrapper.getBoundingClientRect();
        const x = scrollWrapperRect.left + scrollWrapperRect.width / 2;
        const y1 = scrollWrapperRect.top + _marginSize + 1;
        const y2 = scrollWrapperRect.top + scrollWrapper.clientHeight - _marginSize - 1;
        const firstPage = Math.max(getPageUnderPoint(x, y1), 1);
        const lastPage = Math.min(getPageUnderPoint(x, y2), __TOTAL_PAGES);
        return { firstPage, lastPage };
    }

    function showPage(page_no, callback, mode) {
        const pageBufferSize = _getPageBufferSize(mode == 2 ? 2 : 0, 1);
        const visiblePages = getVisiblePages();
        _firstLoadedPage = Math.max((visiblePages.firstPage-pageBufferSize), 1);
        _lastLoadedPage = Math.min((visiblePages.lastPage + pageBufferSize), __TOTAL_PAGES);

        generateOrderToShowPages(mode, page_no);
        showPagesOnOrder(function(success) {
            if (success) {
                if (mode != 2) {
                    clearInvisibleWrappers();
                }
            }
            if (callback) {
                callback(success);
            }
        });
    }

    function _scrollToHorizontalCenter() {
        var canvasWrapper = document.getElementById(_currentCanvasId);
        var offset = (canvasWrapper.parentNode.scrollWidth - canvasWrapper.parentNode.clientWidth) / 2;
        canvasWrapper.parentNode.scrollLeft = offset;
    }

    function _getScrollCenterData(scale, mouse) {
        var canvasWrapper = document.getElementById(_currentCanvasId);
        var screenScrollY = canvasWrapper.parentNode.scrollTop;
        var screenScrollX = canvasWrapper.parentNode.scrollLeft;
        var centerOffsetX = 0;
        var centerOffsetY = 0;
        if (mouse == null) {
            centerOffsetX = canvasWrapper.parentNode.clientWidth / 2;
            centerOffsetY = canvasWrapper.parentNode.clientHeight / 2;
        } else {
            centerOffsetX = mouse.x;
            centerOffsetY = mouse.y;
        }

        var offsetX = 0;
        if (mouse == null) {
            if (canvasWrapper.parentNode.scrollWidth > canvasWrapper.parentNode.clientWidth) {
                offsetX = (screenScrollX + centerOffsetX - _marginSize) * scale / __ZOOMSCALE - centerOffsetX + _marginSize;
            } else {
                offsetX = -1;
            }
        } else {
            offsetX = (screenScrollX + centerOffsetX - _marginSize) * scale / __ZOOMSCALE - centerOffsetX + _marginSize;
        }

        var pageNo = 1;
        var offsetY = 0;
        var height = 0;
        var pdfDisplays = document.getElementsByClassName("PdfPageDisplayWrapper");
        for (var i = 0; i < pdfDisplays.length;i++) {
            var pageHeight = getPageHeight(pdfDisplays[i]);

            if ((height + pageHeight) > screenScrollY) {
                pageNo = (i+1);
                offsetY = screenScrollY - height + centerOffsetY;
                if (offsetY < _marginSize) {
                    offsetY -= 10;
                } else {
                    offsetY = (offsetY - _marginSize) * scale / __ZOOMSCALE - centerOffsetY;
                }
                break;
            }

            height += pageHeight;
        }

        _scrollOffset = {pageNo: pageNo, offsetX: offsetX, offsetY: offsetY};
    }

    function _getScrollTopData(scale) {
        var canvasWrapper = document.getElementById(_currentCanvasId);
        var screenScroll = canvasWrapper.parentNode.scrollTop;

        var pageNo = 1;
        var offset = 0;
        var height = 0;
        var pdfDisplays = document.getElementsByClassName("PdfPageDisplayWrapper");
        for (var i = 0; i < pdfDisplays.length;) {
            const pageHeight = getPageHeight(pdfDisplays[i]);

            if ((height + pageHeight) > screenScroll) {
                pageNo = (i+1);
                offset = screenScroll - height;
                if (offset < _marginSize) {
                    offset -= 10;
                } else {
                    offset = (offset - _marginSize) * scale / __ZOOMSCALE;
                }
                break;
            }

            height += pageHeight;
            i += 1;
        }

        _scrollOffset = {pageNo: pageNo, offsetX: -1, offsetY: offset};
    }

    function _applyScrollData () {
        if (_scrollOffset) {
            var canvasWrapper = document.getElementById(_currentCanvasId);
            const displayWrapper = document.querySelector("#PdfPageDisplayWrapper" + _scrollOffset.pageNo);
            if (!displayWrapper) {
                _scrollOffset = null;
                return;
            }

            __CURRENT_PAGE = _scrollOffset.pageNo;
            var offsetX = _scrollOffset.offsetX;
            var offsetY = _scrollOffset.offsetY;
            if (_scrollOffset.addPageOffset === true) {
                offsetX = displayWrapper.offsetLeft + offsetX;
            }

            canvasWrapper.parentNode.scrollTop = displayWrapper.offsetTop + offsetY;

            if (offsetX == -1) {
                var offset = (canvasWrapper.parentNode.scrollWidth - canvasWrapper.parentNode.clientWidth) / 2;
                canvasWrapper.parentNode.scrollLeft = offset;
            } else {
                canvasWrapper.parentNode.scrollLeft = offsetX;
            }

            _scrollOffset = null;
        }
    }

    function _scrollToPage(page_no, callback, coordinate){
        __CURRENT_PAGE = page_no;
        var canvasWrapper = document.getElementById(_currentCanvasId);
        var targetPage = document.getElementById("PdfPageDisplayWrapper" + page_no);
        var scrollToVal = targetPage.offsetTop - _marginSize;

        if (coordinate) {
            if (coordinate[1].name == "XYZ") {
                // bookmark
                scrollToVal += _marginSize + coordinate[3];
                canvasWrapper.parentNode.scrollLeft = targetPage.offsetLeft + coordinate[2];
            } else {
                // search result
                canvasWrapper.parentNode.scrollLeft = Math.max(targetPage.offsetLeft + coordinate[2] - canvasWrapper.parentNode.clientWidth / 2, 0);
                scrollToVal += (coordinate[3] - canvasWrapper.parentNode.clientHeight / 2);
            }
        }

        const scrollTop = Math.max(scrollToVal, 0);
        if (canvasWrapper.parentNode.scrollTop != scrollTop) {
            _ignoreWrapperScroll = true;
            canvasWrapper.parentNode.scrollTop = scrollTop;
        }
        _updateDocumentToolbarPageDisplay();
        if (callback) {
            callback(true);
        }
    }

    function _getNoPagesPerLine(page_no) {
        var canvasWrapper = document.getElementById(_currentCanvasId);
        if (canvasWrapper.childNodes[0].style.display == "block") {
            return 1;
        }
        var wrapperWidth = canvasWrapper.clientWidth;
        var sum = 0;
        var count = 0;
        for (var i = 0; i < page_no; i++) {
            var page = canvasWrapper.childNodes[i];
            if (page) {
                sum += parseFloat(page.width) + _marginSize;
                count += 1;
                if (sum > wrapperWidth) {
                    sum = parseFloat(page.width);
                    count = 1;
                }
            }
        }
        for (var j = page_no; j < canvasWrapper.childNodes.length; j++) {
            var page = canvasWrapper.childNodes[j];
            if (page) {
                sum += parseFloat(page.width) + _marginSize;
                if (sum > wrapperWidth) {
                    break;
                }
                count += 1;
            }
        }
        return count;
    }

    function _setUserSelect(){
        var elems = document.getElementsByClassName("PdfPageDisplayTextLayer");
        for (var i = 0; i < elems.length; i++) {
            elems[i].style.WebkitUserSelect = _cursor.current == _cursorTypes.text ? _cursorTypes.text : "none";
            elems[i].style.msUserSelect = _cursor.current == _cursorTypes.text ? _cursorTypes.text : "none";
            elems[i].style.MozUserSelect = _cursor.current == _cursorTypes.text ? _cursorTypes.text : "none";
        }

        if (_cursor.current != _cursorTypes.text) {
            // Clear all text selection
            _clearTextSelection();
        }
    }

    function _LoadPrevPage(callback) {
        if (__CURRENT_PAGE != 1)
            gotoPage(__CURRENT_PAGE - 1, callback);
    }

    function _LoadNextPage(callback) {
        if (__CURRENT_PAGE != __TOTAL_PAGES)
            gotoPage(__CURRENT_PAGE + 1, callback);
    }

    function _LoadPage(callback, pageNo) {
        if ((pageNo > 0) && (pageNo <=__TOTAL_PAGES))
            gotoPage(pageNo, callback);
    }

    //PDF TOOLBAR

    function _DisplayDocumentToolbar (parent, groups) {
        if (document.getElementById("CreoViewDocumentToolbar") == null) {
            const toolbarDiv = document.createElement("div");
            toolbarDiv.id = "CreoViewDocumentToolbar";
            toolbarDiv.tabIndex = "0";
            toolbarDiv.style.WebkitUserSelect = "none";
            toolbarDiv.style.msUserSelect = "none";
            toolbarDiv.style.MozUserSelect = "none";
            toolbarDiv.style.userSelect = "none";
            toolbarDiv.style.color = _uiColors.toolbar.text;
            toolbarDiv.style.backgroundColor = _uiColors.toolbar.background;
            toolbarDiv.style.height = _toolbarHeight + "px";
            toolbarDiv.style.textAlign = "left";
            toolbarDiv.style.zIndex = _zIndex.toolbarSearchBox;
            toolbarDiv.style.outline = "none";
            parent.insertBefore(toolbarDiv, parent.childNodes[0]);
            _BuildDocumentFullToolbar(toolbarDiv, groups, parent);
            document.getElementById(_currentCanvasId).parentNode.style.height = parseInt(parent.clientHeight) - _toolbarHeight + "px";
            if (_sidebarEnabled) {
                var sidebarDiv = document.getElementById("CreoViewDocumentSidebar");
                if (sidebarDiv) {
                    sidebarDiv.style.height = parseInt(parent.clientHeight) - _toolbarHeight + "px";
                }
            }

            const leftContainerRect = toolbarDiv.querySelector("#CreoToolbarLeftContainerFull").getBoundingClientRect();
            const midContainerRect = toolbarDiv.querySelector("#CreoToolbarMidContainerFull").getBoundingClientRect();
            _toolbarFullContainerWidth = leftContainerRect.width + midContainerRect.width / 2;

        }
    }

    function _observeMouseDown () {
        document.onmousedown = function (e) {
            const menuDiv = document.querySelector("#PdfToolbarMiniMenuDiv");
            if (!menuDiv || menuDiv.style.display == "none") return;

            let elementsUnderCursor;
            let foundElement = false;
            if (document.elementsFromPoint) {
                elementsUnderCursor = document.elementsFromPoint(e.clientX, e.clientY);
            } else if (document.msElementsFromPoint) {
                elementsUnderCursor = document.msElementsFromPoint(e.clientX, e.clientY);
            }
            for (const elem of elementsUnderCursor) {
                if (!elem.id) continue;
                if (elem.id === "PdfToolbarMiniMenuButton" || elem.id === "PdfToolbarMiniMenuDiv" || elem.id  === "PdfToolbarMiniMenuPageModeOptions") {
                    foundElement = true;
                    break;
                }
            }
            if (!foundElement) {
                _showToolbarMiniMenu(false);
            }
        };
    }

    function _RemoveDocumentToolbar (parent) {
        var toolbarDiv = document.getElementById("CreoViewDocumentToolbar");
        if (toolbarDiv && parent) {
            parent.removeChild(toolbarDiv);
        }
        var currentCanvas = document.getElementById(_currentCanvasId);
        if (currentCanvas) {
            currentCanvas.parentNode.style.height = "100%";
        }
        if (_sidebarEnabled) {
            var sidebarDiv = document.getElementById("CreoViewDocumentSidebar");
            if (sidebarDiv) {
                sidebarDiv.style.height = "100%";
                sidebarDiv.childNodes[1].style.height = (parseInt(sidebarDiv.childNodes[1].style.height) + _toolbarHeight) + "px";
            }
        }
        if (_searchDrag.enabled){
            _searchDrag.enabled = false;
        }

        if (parent) {
            parent.removeEventListener("mousemove", _dragSearchBox);
            parent.removeEventListener("mouseleave", _disableDragSearchBox);
            parent.removeEventListener("mouseup", _disableDragSearchBox);
        }
    }

    function _BuildDocumentFullToolbar (toolbarDiv, groups, parent) {
        _miniToolbar = false;

        // Hide mini containers (left and middle)
        const leftMini = toolbarDiv.querySelector("#CreoToolbarLeftContainerMini");
        if (leftMini) {
            leftMini.style.display = "none";
        }
        const midMini = toolbarDiv.querySelector("#CreoToolbarMidContainerMini");
        if (midMini) {
            midMini.style.display = "none";
        }

        // Show (or create) left full container
        const leftFull = toolbarDiv.querySelector("#CreoToolbarLeftContainerFull");
        if (leftFull) {
            leftFull.style.display = "";
        } else {
            const leftContainer = document.createElement("div");
            leftContainer.id = "CreoToolbarLeftContainerFull";
            leftContainer.style.float = "left";
            leftContainer.style.height = _toolbarHeight + "px";
            leftContainer.style.position = "relative";

            toolbarDiv.appendChild(leftContainer);

            leftContainer.appendChild(_buildNavbarGroup());
            leftContainer.appendChild(_buildPagesGroup());
        }

        _showToolbarGroup("CreoToolbarSidebarGroup", groups.sidebar);
        _showToolbarGroup("CreoToolbarPagesGroup", groups.pages);

        // Show (or create) middle full container
        const midFull = toolbarDiv.querySelector("#CreoToolbarMidContainerFull");
        if (midFull) {
            midFull.style.display = "";
        } else {
            const midContainer = document.createElement("div");
            midContainer.id = "CreoToolbarMidContainerFull";
            midContainer.style.height = _toolbarHeight + "px";
            midContainer.style.overflow = "hidden";
            midContainer.style.position = "absolute";
            midContainer.style.left = "50%";
            midContainer.style.transform = "translateX(-50%)";

            toolbarDiv.appendChild(midContainer);

            midContainer.appendChild(_buildRotateGroup());
            midContainer.appendChild(_buildZoomGroup());
            midContainer.appendChild(_buildCursorModeGroup());
        }

        _showToolbarGroup("CreoToolbarRotateGroup", groups.rotate);
        _showToolbarGroup("CreoToolbarZoomGroup", groups.zoom);
        _showToolbarGroup("CreoToolbarCursorGroup", groups.cursor);

        // Create right container
        const right = toolbarDiv.querySelector("#CreoToolbarRightContainer");
        if (right) {
            const printGroup = toolbarDiv.querySelector("#CreoToolbarPrintGroup");
            if (printGroup) {
                printGroup.style.display = "";
            }
        } else {
            const rightContainer = document.createElement("div");
            rightContainer.id = "CreoToolbarRightContainer";
            rightContainer.style.float = "right";
            rightContainer.style.height = _toolbarHeight + "px";

            toolbarDiv.appendChild(rightContainer);

            rightContainer.appendChild(_BuildDocumentSearchToolbar(parent));
            rightContainer.appendChild(_buildPrintGroup(parent));
        }

        _showToolbarGroup("CreoToolbarSearchGroup", groups.search);
        _showToolbarGroup("CreoToolbarPrintGroup", (groups.print && _printEnabled));
    }

    function _buildNavbarGroup() {
        var navbarGroup = _BuildDocumentToolbarButton('/icons/pdf_sidebar.svg', true);
        navbarGroup.id = "CreoToolbarSidebarGroup";
        navbarGroup.style.margin = "5px";
        if(_sidebarEnabled){
            navbarGroup.style.backgroundColor = _uiColors.sidebar.background;
        }
        navbarGroup.addEventListener("click", function(e){
            e.stopPropagation();
            if(!_sidebarEnabled){
                navbarGroup.style.backgroundColor = _uiColors.toolbar.activeButton;
            } else {
                navbarGroup.style.backgroundColor = "inherit";
            }
            _togglePdfSidePane();
        });
        navbarGroup.addEventListener("mouseenter", function(){
            if(!_sidebarEnabled){
                navbarGroup.style.backgroundColor = _uiColors.toolbar.activeButton;
            }
        });
        navbarGroup.addEventListener("mouseleave", function(){
            if(!_sidebarEnabled){
                navbarGroup.style.backgroundColor = "inherit";
            }
        });
        return navbarGroup;
    }

    function _showToolbarGroup (id, show) {
        const group = document.querySelector("#" + id);
        if (group) {
            group.style.display = (show === true ? "" : "none");
        }
    }

    function _buildPagesGroup() {
        const pagesGroup = document.createElement("div");
        pagesGroup.style.display = "inline-block";
        pagesGroup.style.marginLeft = "5px";
        pagesGroup.style.height = _toolbarHeight + "px";
        pagesGroup.id = "CreoToolbarPagesGroup";
        pagesGroup.style.float = "left";
        pagesGroup.style.position = "relative";

        const firstPageButton = _BuildDocumentToolbarButton("/icons/pdf_first_page.svg", true);
        _AddToolbarButtonMouseOver(firstPageButton);
        firstPageButton.addEventListener("click", function(){
            _LoadPage(_pdfCallback, 1);
        });
        pagesGroup.appendChild(firstPageButton);

        const prevPageButton = _BuildDocumentToolbarButton("/icons/pdf_previous_page.svg", true);
        _AddToolbarButtonMouseOver(prevPageButton);
        prevPageButton.addEventListener("click", function(){
            _LoadPrevPage(_pdfCallback);
        });
        pagesGroup.appendChild(prevPageButton);

        const pageCounterSpan = _buildPagesCounter();
        pagesGroup.appendChild(pageCounterSpan);

        const nextPageButton = _BuildDocumentToolbarButton("/icons/pdf_next_page.svg", true);
        _AddToolbarButtonMouseOver(nextPageButton);
        nextPageButton.addEventListener("click", function(){
            _LoadNextPage(_pdfCallback);
        });
        pagesGroup.appendChild(nextPageButton);

        const lastPageButton = _BuildDocumentToolbarButton("/icons/pdf_last_page.svg", true);
        _AddToolbarButtonMouseOver(lastPageButton);
        lastPageButton.addEventListener("click", function(){
            _LoadPage(_pdfCallback, __TOTAL_PAGES);
        });
        pagesGroup.appendChild(lastPageButton);

        return pagesGroup;
    }

    function _buildRotateGroup () {
        const rotateGroup = document.createElement("div");
        rotateGroup.id = "CreoToolbarRotateGroup";
        rotateGroup.style.margin = "auto 7px";
        rotateGroup.style.position = "relative";
        rotateGroup.style.float = "left";

        const rotateClockwiseButton = _BuildDocumentToolbarButton("/icons/pdf_rotate_clockwise.svg", true);
        rotateClockwiseButton.addEventListener("click", function(){
            _RotateDocumentPages(true);
        });
        _AddToolbarButtonMouseOver(rotateClockwiseButton);
        rotateGroup.appendChild(rotateClockwiseButton);

        const rotateAntiClockwiseButton = _BuildDocumentToolbarButton("/icons/pdf_rotate_anti_clockwise.svg", true);
        rotateAntiClockwiseButton.addEventListener("click", function(){
            _RotateDocumentPages(false);
        });
        _AddToolbarButtonMouseOver(rotateAntiClockwiseButton);
        rotateGroup.appendChild(rotateAntiClockwiseButton);

        return rotateGroup;
    }

    function _buildPagesCounter (mini) {
        const pageCounterDiv = document.createElement("div");
        pageCounterDiv.id = "CreoToolbar" + (mini === true ? "Mini" : "") + "PagesCounter";
        pageCounterDiv.style.display = "unset";
        pageCounterDiv.style.float = "left";
        pageCounterDiv.style.position = "relative";
        
        const pageCounterInput = document.createElement("input");
        pageCounterInput.className = "PageCounterInput";
        pageCounterInput.type = "text";
        pageCounterInput.pattern = "[0-9]+";
        pageCounterInput.size = "3";
        pageCounterInput.value = "1";
        pageCounterInput.style.textAlign = "right";
        pageCounterInput.style.outline = "none";
        pageCounterInput.style.marginLeft = "10px";
        pageCounterInput.style.fontSize = "12px";
        pageCounterInput.style.padding = "1px 3px 1px 0px";
        if (mini === true) pageCounterInput.style.width = "40px";

        pageCounterInput.addEventListener("keypress", function(e){
            if (!(e.key == "Enter" || /^\d*$/.test(e.key))) {
                e.preventDefault();
            }
        });
        pageCounterInput.addEventListener("change", function(e){
            const pageNo = parseInt(e.target.value);
            if (pageNo) {
                _LoadPage(_pdfCallback, pageNo);
            }
        });
        const pageCounterSpan = document.createElement("span");
        pageCounterSpan.className = "PageCounterSpan";
        pageCounterSpan.innerHTML = "  /  " + __TOTAL_PAGES;
        pageCounterSpan.style.display = "inline-block";
        pageCounterSpan.style.margin = "9px 10px 10px";

        pageCounterDiv.appendChild(pageCounterInput);
        pageCounterDiv.appendChild(pageCounterSpan);
        return pageCounterDiv;
    }

    function _buildZoomGroup () {
        const zoomGroup = document.createElement("div");
        zoomGroup.id = "CreoToolbarZoomGroup";
        zoomGroup.style.margin = "auto 7px";
        zoomGroup.style.position = "relative";
        zoomGroup.style.float = "left";

        var zoomInButton = _BuildDocumentToolbarButton("./icons/pdf_zoom_in.svg", true);
        _AddToolbarButtonMouseOver(zoomInButton);
        zoomInButton.addEventListener("click", function(){
            _zoomButtonScale = _zoomInScale;
            _zoomButtonPDF();
        });
        zoomGroup.appendChild(zoomInButton);
        var zoomOutButton = _BuildDocumentToolbarButton("./icons/pdf_zoom_out.svg", true);
        _AddToolbarButtonMouseOver(zoomOutButton);
        zoomOutButton.addEventListener("click", function(){
            _zoomButtonScale = _zoomOutScale;
            _zoomButtonPDF();
        });
        zoomGroup.appendChild(zoomOutButton);

        var pageModeSpan = document.createElement("span");
        pageModeSpan.style.display = "unset";
        pageModeSpan.style.position = "relative";
        pageModeSpan.style.marginLeft = "5px";
        pageModeSpan.style.marginRight = "5px";
        pageModeSpan.style.top = "10px";

        var pageModeInput = document.createElement("select");
        pageModeInput.id = "CreoViewDocToolbarPageModeSelect";
        pageModeInput.style.outline = "none";
        var pageModeTexts = [_pdfText.original, _pdfText.fitPage, _pdfText.fitWidth, "500%", "250%", "200%", "100%", "75%", "50%", "25%", "10%"];
        var pageModeValues = ["Original", "FitPage", "FitWidth", "500percent", "250percent", "200percent", "100percent", "75percent", "50percent", "25percent", "10percent"];
        for(var i=0; i < pageModeTexts.length; i++){
            var option = document.createElement("option");
            option.text = pageModeTexts[i];
            option.value = pageModeValues[i];
            pageModeInput.appendChild(option);

            let zoomScale = parseInt(pageModeTexts[i]);
            if (!isNaN(zoomScale)) {
                if (zoomScale / 100 > _largestZoomScale) {
                    option.disabled = true;
                }
            }
        }
        pageModeInput.value = _pageMode;
        pageModeInput.addEventListener("change", function(e){
            _pageMode = e.target.options[e.target.selectedIndex].value;
            _setPageModePDF();
        });

        pageModeSpan.appendChild(pageModeInput);
        zoomGroup.appendChild(pageModeSpan);
        return zoomGroup;
    }

    function _buildCursorModeGroup(){
        const cursorModeGroup = document.createElement("div");
        cursorModeGroup.id = "CreoToolbarCursorGroup";
        cursorModeGroup.style.margin = "auto 7px";
        cursorModeGroup.style.float = "left";
        cursorModeGroup.style.position = "relative";

        var panModeButton = _BuildDocumentToolbarButton("/icons/pdf_pan_view.svg", true);
        panModeButton.addEventListener("mouseenter", function(){
            if (_cursor.current != _cursorTypes.pan) {
                panModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
            }
        });
        panModeButton.addEventListener("mouseleave", function(){
            if (_cursor.current != _cursorTypes.pan) {
                panModeButton.style.backgroundColor = "inherit";
            }
        });
        var textModeButton = _BuildDocumentToolbarButton("/icons/pdf_text_select.svg", true);
        textModeButton.addEventListener("mouseenter", function(){
            if (_cursor.current != _cursorTypes.text) {
                textModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
            }
        });
        textModeButton.addEventListener("mouseleave", function(){
            if (_cursor.current != _cursorTypes.text) {
                textModeButton.style.backgroundColor = "inherit";
            }
        });

        if (_cursor.current == _cursorTypes.pan) {
            panModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
        } else if (_cursor.current == _cursorTypes.text) {
            textModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
        }

        panModeButton.addEventListener("mousedown", function(e){
            if (_zoomButton) {
                _setZoomOnButton(_zoomButtonScale);
            }
            _cursor.current = _cursorTypes.pan;
            _setUserSelect();
            panModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
            textModeButton.style.backgroundColor = "inherit";
            if (_cursor.callback) {
                _cursor.callback(_cursorTypes.pan);
            }
        });
        cursorModeGroup.appendChild(panModeButton);

        textModeButton.addEventListener("mousedown", function(){
            if (_zoomButton) {
                _setZoomOnButton(_zoomButtonScale);
            }
            _cursor.current = _cursorTypes.text;
            _setUserSelect();
            textModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
            panModeButton.style.backgroundColor = "inherit";
            if (_cursor.callback) {
                _cursor.callback(_cursorTypes.text);
            }
        });
        cursorModeGroup.appendChild(textModeButton);

        return cursorModeGroup;
    }

    function _buildPrintGroup (parent) {
        var printGroup = document.createElement("div");
        printGroup.id = "CreoToolbarPrintGroup";
        printGroup.style.display = "inline-block";
        printGroup.style.margin = "auto 7px";
        printGroup.style.float = "right";

        var printButton = _BuildDocumentToolbarButton("/icons/pdf_print.svg", true);
        printButton.addEventListener("click", function(){
            _PrintPdf(parent);
        });
        _AddToolbarButtonMouseOver(printButton);
        printGroup.appendChild(printButton);

        return printGroup;
    }

    function _resizeDocumentToolbar(parent, groups){
        if (!parent) return;
        const toolbarDiv = document.getElementById("CreoViewDocumentToolbar");
        document.getElementById(_currentCanvasId).parentNode.style.height = (parseInt(parent.clientHeight) - _toolbarHeight) + "px";
        if (_sidebarEnabled){
            var sidebarDiv = document.getElementById("CreoViewDocumentSidebar");
            if (sidebarDiv) {
                sidebarDiv.style.height = parseInt(parent.clientHeight) - _toolbarHeight + "px";
                sidebarDiv.childNodes[1].style.height = parseInt(parent.clientHeight) - (_toolbarHeight*2) + "px";
            }
        }

        const toolbarWidth = toolbarDiv.getBoundingClientRect().width / 2;
        if (!_miniToolbar) {
            if (_toolbarFullContainerWidth >= toolbarWidth) {
                _BuildDocumentMiniToolbar(toolbarDiv, groups, parent);
            }
        } else {
            if (_toolbarFullContainerWidth < toolbarWidth) {
                _BuildDocumentFullToolbar(toolbarDiv, groups, parent);
                _updateDocumentToolbarPageDisplay();
            }
        }
        _showToolbarMiniMenu(false);
        if (_miniToolbar) {
            const pageModeOptions = document.getElementById("PdfToolbarMiniMenuPageModeOptions");
            pageModeOptions.style.display = "none";
            pageModeOptions.parentNode.style.backgroundColor = "inherit";
            const miniMenuDiv = document.getElementById("PdfToolbarMiniMenuDiv");
            miniMenuDiv.style.maxHeight = (parseInt(parent.clientHeight) - (_toolbarHeight + 12)) + "px";
        }
    }

    function _updateDocumentToolbarPageDisplay() {
        if (_toolbarEnabled && _toolbarGroups.pages){
            const inputs = document.querySelectorAll(".PageCounterInput");
            for (const input of inputs) {
                input.value = __CURRENT_PAGE;
            }
            const spans = document.querySelectorAll(".PageCounterSpan");
            for (const span of spans) {
                span.innerHTML = "  /  " + __TOTAL_PAGES;
            }
        }
    }

    function _getDocumentToolbarScrollbarStyle (id, width) {
        return (
            "#" + id + "::-webkit-scrollbar{width:" + width + "px;background-color:#f5f5f5;border-left:1px solid #ccc;}" +
            "#" + id + "::-webkit-scrollbar-thumb{background-color:#C1C1C1;border:none;}"
        );
    }

    function _addDocumentToolbarScrollbarStyle (id, width) {
        const newStyle = _getDocumentToolbarScrollbarStyle(id, width);
        const documentStyle = document.querySelector("style");
        if (documentStyle && documentStyle.textContent.search(id) == -1) {
            documentStyle.textContent += newStyle;
        } else if (!documentStyle) {
            const style = document.createElement("style");
            style.textContent = newStyle;
            document.getElementsByTagName('head')[0].appendChild(style);
        }
    }

    function _showToolbarMiniMenu (show) {
        const menuDiv = document.querySelector("#PdfToolbarMiniMenuDiv");
        const menuButton = document.querySelector("#PdfToolbarMiniMenuButton");
        if (!menuDiv) return;
        if (show) {
            menuDiv.style.display = "block";
            menuButton.style.backgroundColor = _uiColors.toolbar.activeButton;
        } else {
            const pageModeOptions = document.querySelector("#PdfToolbarMiniMenuPageModeOptions");
            if (pageModeOptions) pageModeOptions.style.display = "none";
            const pageModeButton = document.querySelector("#PdfToolbarMiniMenuPageModeButton");
            if (pageModeButton) pageModeButton.style.backgroundColor = "inherit";
            menuDiv.style.display = "none";
            menuButton.style.backgroundColor = "inherit";
        }
    }

    function _BuildDocumentMiniToolbar (toolbarDiv, groups, parent){
        _miniToolbar = true;

        // Hide full containers (left and middle)
        const leftFull = toolbarDiv.querySelector("#CreoToolbarLeftContainerFull");
        if (leftFull) {
            leftFull.style.display = "none";
        }
        const midFull = toolbarDiv.querySelector("#CreoToolbarMidContainerFull");
        if (midFull) {
            midFull.style.display = "none";
        }

        // Show (or create) left mini container
        const leftMini = toolbarDiv.querySelector("#CreoToolbarLeftContainerMini");
        if (leftMini) {
            leftMini.style.display = "";
        } else {
            const leftContainer = document.createElement("div");
            leftContainer.id = "CreoToolbarLeftContainerMini";
            leftContainer.style.float = "left";
            leftContainer.style.height = _toolbarHeight + "px";
            leftContainer.style.position = "relative";

            toolbarDiv.appendChild(leftContainer);

            const menuButton = document.createElement("span");
            menuButton.id = "PdfToolbarMiniMenuButton";
            const menuImage = document.createElement("img");
            menuImage.src = ThingView.resourcePath + '/icons/pdf_more_menu.svg';
            menuButton.appendChild(menuImage);
            menuButton.style.WebkitUserSelect = "none";
            menuButton.style.msUserSelect = "none";
            menuButton.style.MozUserSelect = "none";
            menuButton.style.userSelect = "none";
            menuButton.style.position = "relative";
            menuButton.style.margin = "6px";
            menuButton.style.padding = "6px";
            menuButton.style.cursor = "pointer";
            menuButton.style.float = "left";
            leftContainer.appendChild(menuButton);

            const menuDiv = document.createElement("div");
            menuDiv.id = "PdfToolbarMiniMenuDiv";
            menuDiv.style.display = "none";
            menuDiv.style.backgroundColor = _uiColors.toolbar.menuButton;
            menuDiv.style.position = "absolute";
            menuDiv.style.zIndex = "5";
            menuDiv.style.padding = "5px";
            menuDiv.style.cursor = "auto";
            menuDiv.style.color = _uiColors.toolbar.text;
            menuDiv.style.whiteSpace = "nowrap";
            menuDiv.style.maxHeight = (parseInt(parent.clientHeight) - (_toolbarHeight + 15)) + "px";
            menuDiv.style.overflowY = "auto";
            menuDiv.style.overflowX = "visible";
            menuDiv.style.scrollbarWidth = "thin";
            menuDiv.style.top = toolbarDiv.clientHeight + "px";
            _addDocumentToolbarScrollbarStyle(menuDiv.id, 5);
            leftContainer.appendChild(menuDiv);

            _buildMiniSidebarGroup(menuDiv);
            _buildMiniPagesGroup(menuDiv);
            leftContainer.appendChild(_buildPagesCounter(true));
            _buildMiniRotateGroup(menuDiv);
            _buildMiniZoomGroup(menuDiv);
            leftContainer.appendChild(_buildMiniPageModeOptions());
            _buildMiniCursorGroup(menuDiv);
            _buildMiniPrintGroup(parent, menuDiv);

            menuButton.addEventListener("click", function () {
                if (menuDiv.style.display == "none") {
                    _showToolbarMiniMenu(true);
                } else {
                    _showToolbarMiniMenu(false);
                }
            });
            menuButton.addEventListener("mouseenter", function(){
                if (menuDiv.style.display == "none") {
                    menuButton.style.backgroundColor = _uiColors.toolbar.activeButton;
                }
            });
            menuButton.addEventListener("mouseleave", function(){
                if (menuDiv.style.display == "none") {
                    menuButton.style.backgroundColor = "inherit";
                }
            });
        }

        _showToolbarGroup("CreoToolbarMiniSidebarGroup", groups.sidebar);
        _showToolbarGroup("CreoToolbarMiniPagesGroup", groups.pages);
        _showToolbarGroup("CreoToolbarMiniPagesCounter", groups.pages);
        _showToolbarGroup("CreoToolbarMiniRotateGroup", groups.rotate);
        _showToolbarGroup("CreoToolbarMiniZoomGroup", groups.zoom);
        _showToolbarGroup("CreoToolbarMiniCursorGroup", groups.cursor);
        _showToolbarGroup("CreoToolbarMiniPrintGroup", (groups.print && _printEnabled));

        // Show (or create) middle mini container
        const midMini = toolbarDiv.querySelector("#CreoToolbarMidContainerMini");
        if (midMini) {
            midMini.style.display = "";
        } else {
            const midContainer = document.createElement("div");
            midContainer.id = "CreoToolbarMidContainerMini";
            midContainer.style.position = "absolute";
            midContainer.style.left = "50%";
            midContainer.style.transform = "translateX(-50%)";

            toolbarDiv.appendChild(midContainer);

            const zoomGroup = document.createElement("div");
            zoomGroup.id = "CreoToolbarMiniZoomGroup2";
            zoomGroup.style.display = "inline-block";
            zoomGroup.style.whiteSpace = "nowrap";
            const zoomInButton = _BuildDocumentToolbarButton("/icons/pdf_zoom_in.svg", true);
            _AddToolbarButtonMouseOver(zoomInButton);
            zoomInButton.addEventListener("click", function () {
                _zoomButtonScale = _zoomInScale;
                _zoomButtonPDF();
            });
            zoomGroup.appendChild(zoomInButton);
            const zoomOutButton = _BuildDocumentToolbarButton("/icons/pdf_zoom_out.svg", true);
            _AddToolbarButtonMouseOver(zoomOutButton);
            zoomOutButton.addEventListener("click", function () {
                _zoomButtonScale = _zoomOutScale;
                _zoomButtonPDF();
            });
            zoomGroup.appendChild(zoomOutButton);
            midContainer.appendChild(zoomGroup);
        }

        _showToolbarGroup("CreoToolbarMiniZoomGroup2", groups.zoom);

        // Create right container
        const right = toolbarDiv.querySelector("#CreoToolbarRightContainer");
        if (right) {
            const printGroup = toolbarDiv.querySelector("#CreoToolbarPrintGroup");
            if (printGroup) {
                printGroup.style.display = "none";
            }
        } else {
            const rightContainer = document.createElement("div");
            rightContainer.id = "CreoToolbarRightContainer";
            rightContainer.style.float = "right";
            rightContainer.style.height = _toolbarHeight + "px";

            toolbarDiv.appendChild(rightContainer);

            rightContainer.appendChild(_BuildDocumentSearchToolbar(parent));
        }

        _showToolbarGroup("CreoToolbarSearchGroup", groups.search);
    }

    function _buildMenuHr () {
        const hr = document.createElement("hr");
        hr.style.marginTop = "4px";
        hr.style.marginBottom = "4px";
        hr.style.color = _uiColors.toolbar.background;
        hr.style.borderStyle = "solid";
        return hr;
    }

    function _buildMiniPagesGroup (menuDiv) {
        const pagesGroup = document.createElement("div");
        pagesGroup.id = "CreoToolbarMiniPagesGroup";

        const firstPageDiv = _createMiniMenuItem(_pdfText.firstPage, "/icons/pdf_first_page.svg");
        firstPageDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _showToolbarMiniMenu(false);
            _LoadPage(_pdfCallback, 1);
        });
        _AddMiniToolbarEvents(firstPageDiv);
        pagesGroup.appendChild(firstPageDiv);

        const prevPageDiv = _createMiniMenuItem(_pdfText.previousPage, "/icons/pdf_previous_page.svg");
        prevPageDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _showToolbarMiniMenu(false);
            _LoadPrevPage(_pdfCallback);
        });
        _AddMiniToolbarEvents(prevPageDiv);
        pagesGroup.appendChild(prevPageDiv);

        const nextPageDiv = _createMiniMenuItem(_pdfText.nextPage, "/icons/pdf_next_page.svg");
        nextPageDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _showToolbarMiniMenu(false);
            _LoadNextPage(_pdfCallback);
        });
        _AddMiniToolbarEvents(nextPageDiv);
        pagesGroup.appendChild(nextPageDiv);

        const lastPageDiv = _createMiniMenuItem(_pdfText.lastPage, "/icons/pdf_last_page.svg");
        lastPageDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _showToolbarMiniMenu(false);
            _LoadPage(_pdfCallback, __TOTAL_PAGES);
        });
        _AddMiniToolbarEvents(lastPageDiv);
        pagesGroup.appendChild(lastPageDiv);

        pagesGroup.appendChild(_buildMenuHr());

        menuDiv.appendChild(pagesGroup);
    }

    function _buildMiniRotateGroup (menuDiv) {
        const rotateGroup = document.createElement("div");
        rotateGroup.id = "CreoToolbarMiniRotateGroup";

        const rotateClockwiseDiv = _createMiniMenuItem(_pdfText.rotateClockwise, "/icons/pdf_rotate_clockwise.svg");
        rotateClockwiseDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _showToolbarMiniMenu(false);
            _RotateDocumentPages(true);
        });
        _AddMiniToolbarEvents(rotateClockwiseDiv);
        rotateGroup.appendChild(rotateClockwiseDiv);

        const rotateAntiClockwiseDiv = _createMiniMenuItem(_pdfText.rotateAntiClockwise, "/icons/pdf_rotate_anti_clockwise.svg");
        rotateAntiClockwiseDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _showToolbarMiniMenu(false);
            _RotateDocumentPages(false);
        });
        _AddMiniToolbarEvents(rotateAntiClockwiseDiv);
        rotateGroup.appendChild(rotateAntiClockwiseDiv);
        rotateGroup.appendChild(_buildMenuHr());

        menuDiv.appendChild(rotateGroup);
    }

    function _buildMiniPageModeOptions () {
        const pageModeOptionsDiv = document.createElement("div");
        pageModeOptionsDiv.id = "PdfToolbarMiniMenuPageModeOptions";
        pageModeOptionsDiv.style.display = "none";
        pageModeOptionsDiv.style.width = "auto";
        pageModeOptionsDiv.style.position = "absolute";
        pageModeOptionsDiv.style.cursor = "pointer";
        pageModeOptionsDiv.style.zIndex = "5";
        pageModeOptionsDiv.style.backgroundColor = _uiColors.toolbar.subMenuButton;
        pageModeOptionsDiv.style.padding = "2px";
        pageModeOptionsDiv.style.overflowY = "auto";
        pageModeOptionsDiv.style.overflowX = "visible";
        pageModeOptionsDiv.style.scrollbarWidth = "thin";
        _addDocumentToolbarScrollbarStyle(pageModeOptionsDiv.id, 5);

        const onOptionClick = function (e) {
            e.stopPropagation();
            _showToolbarMiniMenu(false);
            _pageMode = e.target.dataset.pageMode;
            _setPageModePDF();
            for (const child of e.target.parentNode.childNodes) {
                child.style.backgroundColor = "inherit";
            }
            e.target.style.backgroundColor = _uiColors.toolbar.activeButton;
        };
        const onOptionMouseEnter = function (e) {
            e.target.style.backgroundColor = _uiColors.toolbar.activeButton;
        };
        const onOptionMouseLeave = function (e) {
            if (_pageMode != e.target.dataset.pageMode) {
                e.target.style.backgroundColor = "inherit";
            }
        };

        const pageModeTexts = [_pdfText.original, _pdfText.fitPage, _pdfText.fitWidth, "500%", "250%", "200%", "100%", "75%", "50%", "25%", "10%"];
        const pageModeValues = ["Original", "FitPage", "FitWidth", "500percent", "250percent", "200percent", "100percent", "75percent", "50percent", "25percent", "10percent"];
        for (var i = 0; i < pageModeTexts.length; i++) {
            let zoomScale = parseInt(pageModeTexts[i]);
            if (!isNaN(zoomScale)) {
                if (zoomScale / 100 > _largestZoomScale) {
                    continue;
                }
            }
            const optionDiv = document.createElement("div");
            optionDiv.style.whiteSpace = "nowrap";
            optionDiv.style.padding = "2px 5px";
            optionDiv.style.margin = "0px 2px";
            optionDiv.style.width = "auto";
            optionDiv.dataset.pageMode = pageModeValues[i];
            optionDiv.textContent = pageModeTexts[i];
            optionDiv.addEventListener("click", onOptionClick);
            optionDiv.addEventListener("mouseenter", onOptionMouseEnter);
            optionDiv.addEventListener("mouseleave", onOptionMouseLeave);
            pageModeOptionsDiv.appendChild(optionDiv);
        }

        return pageModeOptionsDiv;
    }

    function _showToolbarMiniMenuPageOptions (show) {
        const pageModeOptionsDiv = document.querySelector("#PdfToolbarMiniMenuPageModeOptions");
        const pageModeButton = document.querySelector("#PdfToolbarMiniMenuPageModeButton");
        if (!pageModeOptionsDiv || !pageModeButton) return;
        if (show) {
            const menuDiv = document.querySelector("#PdfToolbarMiniMenuDiv");
            pageModeOptionsDiv.style.display = "block";
            pageModeOptionsDiv.style.left = menuDiv.getBoundingClientRect().width + "px";
            pageModeOptionsDiv.style.top = Math.max(Math.min(pageModeButton.offsetTop + _toolbarHeight - 5, menuDiv.offsetHeight - pageModeOptionsDiv.scrollHeight + _toolbarHeight), _toolbarHeight) + "px";
            pageModeOptionsDiv.style.maxHeight = parseInt(menuDiv.offsetHeight) + "px";
            pageModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
        } else {
            pageModeOptionsDiv.style.display = "none";
            pageModeButton.style.backgroundColor = "inherit";
        }
    }

    function _buildMiniZoomGroup (menuDiv) {
        const zoomGroup = document.createElement("div");
        zoomGroup.id = "CreoToolbarMiniZoomGroup";

        const zoomInDiv = _createMiniMenuItem(_pdfText.zoomIn, "/icons/pdf_zoom_in.svg");
        zoomInDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _showToolbarMiniMenu(false);
            _zoomButtonScale = _zoomInScale;
            _zoomButtonPDF();
        });
        _AddMiniToolbarEvents(zoomInDiv);
        zoomGroup.appendChild(zoomInDiv);

        const zoomOutDiv = _createMiniMenuItem(_pdfText.zoomOut, "/icons/pdf_zoom_out.svg");
        zoomOutDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _showToolbarMiniMenu(false);
            _zoomButtonScale = _zoomOutScale;
            _zoomButtonPDF();
        });
        _AddMiniToolbarEvents(zoomOutDiv);
        zoomGroup.appendChild(zoomOutDiv);

        zoomGroup.appendChild(_buildMenuHr());

        const pageModeButton = _createMiniMenuItem(_pdfText.pageMode, null);
        const pageModeArrow = document.createElement("img");
        pageModeArrow.src = ThingView.resourcePath + "/icons/pdf_next_find.svg";
        pageModeArrow.style.transform = "rotate(90deg)";
        pageModeArrow.style.float = "right";
        pageModeArrow.style.overflow = "visible";
        pageModeButton.id = "PdfToolbarMiniMenuPageModeButton";
        pageModeButton.appendChild(pageModeArrow);
        pageModeButton.addEventListener("mouseenter", function(){
            _showToolbarMiniMenuPageOptions(true);
        });
        pageModeButton.addEventListener("mouseleave", function(){
            const pageModeOptionsDiv = document.querySelector("#PdfToolbarMiniMenuPageModeOptions");
            if (pageModeOptionsDiv.style.display == "none") {
                pageModeButton.style.backgroundColor = "inherit";
            }
        });
        zoomGroup.appendChild(pageModeButton);
        zoomGroup.appendChild(_buildMenuHr());

        menuDiv.appendChild(zoomGroup);
    }

    function _buildMiniCursorGroup (menuDiv) {
        const cursorGroup = document.createElement("div");
        cursorGroup.id = "CreoToolbarMiniCursorGroup";

        const panModeButton = _createMiniMenuItem(_pdfText.panMode, "/icons/pdf_pan_view.svg");
        cursorGroup.appendChild(panModeButton);
        const textModeButton = _createMiniMenuItem(_pdfText.textSelectMode, "/icons/pdf_text_select.svg");
        cursorGroup.appendChild(textModeButton);

        if (_cursor.current == _cursorTypes.pan) {
            panModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
        } else if (_cursor.current == _cursorTypes.text) {
            textModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
        }

        panModeButton.addEventListener("click", function(e){
            e.stopPropagation();
            _showToolbarMiniMenu(false);
            if (_zoomButton) {
                _setZoomOnButton(_zoomButtonScale);
            }
            _cursor.current = _cursorTypes.pan;
            _setUserSelect();
            panModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
            textModeButton.style.backgroundColor = "inherit";
            if (_cursor.callback) {
                _cursor.callback(_cursorTypes.pan);
            }
        });
        textModeButton.addEventListener("click", function(e){
            e.stopPropagation();
            _showToolbarMiniMenu(false);
            if (_zoomButton) {
                _setZoomOnButton(_zoomButtonScale);
            }
            _cursor.current = _cursorTypes.text;
            _setUserSelect();
            textModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
            panModeButton.style.backgroundColor = "inherit";
            if (_cursor.callback) {
                _cursor.callback(_cursorTypes.text);
            }
        });

        panModeButton.addEventListener("mouseenter", function(){
            if (_cursor.current != _cursorTypes.pan) {
                panModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
            }
        });
        panModeButton.addEventListener("mouseleave", function(){
            if (_cursor.current != _cursorTypes.pan) {
                panModeButton.style.backgroundColor = "inherit";
            }
        });
        textModeButton.addEventListener("mouseenter", function(){
            if (_cursor.current != _cursorTypes.text) {
                textModeButton.style.backgroundColor = _uiColors.toolbar.activeButton;
            }
        });
        textModeButton.addEventListener("mouseleave", function(){
            if (_cursor.current != _cursorTypes.text) {
                textModeButton.style.backgroundColor = "inherit";
            }
        });

        cursorGroup.appendChild(_buildMenuHr());

        menuDiv.appendChild(cursorGroup);
    }

    function _buildMiniSidebarGroup (menuDiv) {
        const sidebarGroup = document.createElement("div");
        sidebarGroup.id = "CreoToolbarMiniSidebarGroup";
        const sidebarToggleDiv = _createMiniMenuItem(_pdfText.displaySidebar, "/icons/pdf_sidebar.svg");
        if (_sidebarEnabled){
            sidebarToggleDiv.style.backgroundColor = _uiColors.toolbar.activeButton;
        }
        sidebarToggleDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _togglePdfSidePane();
            if (_sidebarEnabled){
                sidebarToggleDiv.style.backgroundColor = _uiColors.toolbar.activeButton;
            } else {
                sidebarToggleDiv.style.backgroundColor = "inherit";
            }
            _showToolbarMiniMenu(false);
        });
        sidebarToggleDiv.addEventListener("mouseenter", function(){
            if(!_sidebarEnabled){
                sidebarToggleDiv.style.backgroundColor = _uiColors.toolbar.activeButton;
            }
        });
        sidebarToggleDiv.addEventListener("mouseleave", function(){
            if(!_sidebarEnabled){
                sidebarToggleDiv.style.backgroundColor = "inherit";
            }
        });
        sidebarGroup.appendChild(sidebarToggleDiv);
        sidebarGroup.appendChild(_buildMenuHr());

        menuDiv.appendChild(sidebarGroup);
    }

    function _buildMiniPrintGroup (parent, menuDiv) {
        const printGroup = document.createElement("div");
        printGroup.id = "CreoToolbarMiniPrintGroup";

        const printDiv = _createMiniMenuItem(_pdfText.printPDF, "/icons/pdf_print.svg");
        _AddMiniToolbarEvents(printDiv);
        printDiv.addEventListener("click", function(e){
            e.stopPropagation();
            _showToolbarMiniMenu(false);
            _PrintPdf(parent);
        });
        printGroup.appendChild(printDiv);

        menuDiv.appendChild(printGroup);
    }

    function _createMiniMenuItem (text, imgURL) {
        const item = document.createElement("div");
        item.style.backgroundColor = _uiColors.toolbar.menuButton;
        item.style.color = _uiColors.toolbar.text;
        item.style.cursor = "pointer";
        item.style.height = "23px";
        item.style.paddingRight = "10px";
        item.style.paddingTop = "7px";
        item.textContent = text;
        if (imgURL) {
            var itemIcon = document.createElement("img");
            itemIcon.src = ThingView.resourcePath + imgURL;
            itemIcon.style.margin = "0px 18px 0px 12px";
            item.insertBefore(itemIcon, item.childNodes[0]);
        } else {
            item.style.paddingLeft = "46px";
        }
        item.onmouseenter = function () {
            _showToolbarMiniMenuPageOptions(false);
        };
        return item;
    }

    function _AddMiniToolbarEvents (button) {
        button.addEventListener("mouseenter", function(){
            button.style.backgroundColor = _uiColors.toolbar.activeButton;
        });
        button.addEventListener("mouseleave", function(){
            button.style.backgroundColor = "inherit";
        });
    }

    function _BuildDocumentSearchToolbar (parent) {
        const searchButton = document.createElement("div");
            searchButton.id = "CreoToolbarSearchGroup";
            searchButton.style.WebkitUserSelect = "none";
            searchButton.style.msUserSelect = "none";
            searchButton.style.MozUserSelect = "none";
            searchButton.style.userSelect = "none";
            searchButton.style.display = "inline-block";
            searchButton.style.margin = "6px";
        const searchIcon = document.createElement("img");
            searchIcon.src = ThingView.resourcePath + '/icons/pdf_find.svg';
            searchButton.style.padding = "5px";
            searchButton.appendChild(searchIcon);
            searchButton.style.cursor = "pointer";
            searchButton.style.float = "right";

        const searchGroup = document.createElement("div");
            searchGroup.style.display = "none";
            searchGroup.style.color = _uiColors.toolbar.text;
            searchGroup.style.backgroundColor = _uiColors.toolbar.background;
            searchGroup.style.position = "absolute";
            searchGroup.style.zIndex = _zIndex.toolbarSearchBox;
            searchGroup.style.padding = "0px 5px 5px";
            searchGroup.style.marginTop = "7.5px";
            searchGroup.style.top = "80px";
            searchGroup.style.right = "30px";
            searchGroup.style.cursor = "move";
            searchGroup.id = "PdfToolbarSearchBox";
            _searchDrag.y = 80;
            _searchDrag.x = _toolbarHeight;

        const searchTextWrapper = document.createElement("span");
            searchTextWrapper.style.marginRight = "2px";
            searchTextWrapper.style.marginTop = "5px";
            searchTextWrapper.style.display = "inline-block";
            searchTextWrapper.style.verticalAlign = "middle";

        const searchTextBox = document.createElement("input");
            searchTextBox.id = "PdfToolbarSearchTextBox";
            searchTextBox.type = _cursorTypes.text;
            searchTextBox.style.cursor = "auto";
            searchTextBox.style.outline = "none";
            searchTextBox.style.marginTop = "-2px";
            searchTextBox.addEventListener("click", function(e){
                e.stopPropagation();
            });
            searchTextBox.addEventListener("mousedown", function(e){
                e.stopPropagation();
            });
            searchTextBox.addEventListener("keydown", function(e){
                if (e.key == "Enter") {
                    if (_searchTerm != searchTextBox.value) {
                        _SearchInPdfDocument(searchTextBox.value);
                    } else {
                        if (_searchState) {
                            _searchState.highlightAll = false;
                            _searchState.findPrevious = false;
                            _nextMatch();
                        }
                    }
                } else if (e.key == "Delete" ||
                           e.key == "Home" || e.key == "End" ||
                           e.key == "PageUp" || e.key == "PageDown" ||
                           e.key == "ArrowUp" || e.key == "ArrowDown" ||
                           e.key == "ArrowLeft" || e.key == "ArrowRight") {
                    e.stopPropagation();
                }
            });
            searchTextWrapper.appendChild(searchTextBox);
            searchGroup.appendChild(searchTextWrapper);

            var searchQueryButton =_BuildDocumentToolbarButton('/icons/pdf_find.svg', false);
            searchQueryButton.style.verticalAlign = "middle";
            searchQueryButton.title = _pdfText.tooltipSearch;
            _AddToolbarButtonMouseOver(searchQueryButton);
            searchQueryButton.addEventListener("click", function(e){
                e.stopPropagation();
                _SearchInPdfDocument(searchTextBox.value);
            });
            searchGroup.appendChild(searchQueryButton);

            var searchClearButton = _BuildDocumentToolbarButton('/icons/pdf_clear.svg', false);
            searchClearButton.style.backgroundColor = "transparent";
            searchClearButton.style.verticalAlign = "middle";
            searchClearButton.style.position = "absolute";
            searchClearButton.style.float = "right";
            searchClearButton.style.margin = "-4px 0px auto -20px";
            searchClearButton.title = _pdfText.tooltipClear;
            searchClearButton.addEventListener("click", function(e){
                e.stopPropagation();
                _searchTerm = "";
                searchTextBox.value = "";
                _removePdfSearchResultHighlights ();
                _DisplayPdfSearchResultsDialogue(_pdfText.searchInput);
            });
            searchTextWrapper.appendChild(searchClearButton);

            var searchNextButton = _BuildDocumentToolbarButton('/icons/pdf_previous_find.svg', false);
            searchNextButton.style.verticalAlign = "middle";
            searchNextButton.title = _pdfText.tooltipNext;
            _AddToolbarButtonMouseOver(searchNextButton);
            searchNextButton.addEventListener("click", function(e){
                e.stopPropagation();
                if (_searchState) {
                    _searchState.highlightAll = false;
                    _searchState.findPrevious = false;
                    _nextMatch();
                }
            });
            searchGroup.appendChild(searchNextButton);

            var searchPrevButton = _BuildDocumentToolbarButton('/icons/pdf_next_find.svg', false);
            searchPrevButton.style.verticalAlign = "middle";
            searchPrevButton.title = _pdfText.tooltipPrevious;
            _AddToolbarButtonMouseOver(searchPrevButton);
            searchPrevButton.addEventListener("click", function(e){
                e.stopPropagation();
                if (_searchState) {
                    _searchState.highlightAll = false;
                    _searchState.findPrevious = true;
                    _nextMatch();
                }
            });
            searchGroup.appendChild(searchPrevButton);

            var searchCloseButton = _BuildDocumentToolbarButton('/icons/pdf_close.svg', false);
            searchCloseButton.style.margin = "0px 0px -20px 12px";
            searchCloseButton.style.padding = "0px";
            searchCloseButton.title = _pdfText.tooltipClose;
            _AddToolbarButtonMouseOver(searchCloseButton);
            searchCloseButton.addEventListener("click", function(e){
                e.stopPropagation();
                searchGroup.style.display = "none";
                searchButton.style.backgroundColor = "inherit";
                searchButton.style.color = "inherit";
                _searchTerm = "";
                _removePdfSearchResultHighlights ();
            });
            searchGroup.appendChild(searchCloseButton);

            var searchResultsDiv = document.createElement("div");
            searchResultsDiv.id = "PdfToolbarSearchResultsDiv";
            searchResultsDiv.style.textAlign = "center";
            searchResultsDiv.style.marginTop = "1px";
            searchResultsDiv.textContent = _pdfText.searchInput;
            searchGroup.appendChild(searchResultsDiv);

            searchButton.appendChild(searchGroup);

            searchButton.addEventListener("click", function(e){
                e.stopPropagation();
                _toggleSearchBox();
            });
            searchGroup.addEventListener("click", function(e){
                e.stopPropagation();
            });
            searchGroup.addEventListener("mousedown", function(e){
                if (!_searchDrag.enabled) {
                    _searchDrag.enabled = true;
                    _searchDrag.x = e.clientX;
                    _searchDrag.y = e.clientY;
                }
            });

            parent.addEventListener("mousemove", _dragSearchBox);
            parent.addEventListener("mouseleave", _disableDragSearchBox);
            parent.addEventListener("mouseup", _disableDragSearchBox);

            searchButton.addEventListener("mouseenter", function(){
                if (searchGroup.style.display == "none") {
                    searchButton.style.backgroundColor = _uiColors.toolbar.activeButton;
                }
            });
            searchButton.addEventListener("mouseleave", function(){
                if (searchGroup.style.display == "none") {
                    searchButton.style.backgroundColor = "inherit";
                }
            });

        return searchButton;
    }

    function _toggleSearchBox () {
        if (!_IsPDFSession() || !_toolbarEnabled || !_toolbarGroups.search) {
            return;
        }
        _searchDrag.enabled = false;
        var searchGroup = document.getElementById("PdfToolbarSearchBox");
        var searchButton = document.getElementById("CreoToolbarSearchGroup");
        if(searchGroup.style.display == "none"){
            searchGroup.style.display = "block";
            document.getElementById("PdfToolbarSearchTextBox").value = "";
            _DisplayPdfSearchResultsDialogue(_pdfText.searchInput);
            searchButton.style.backgroundColor = _uiColors.toolbar.activeButton;
            searchButton.style.color = _uiColors.toolbar.activeText;
        } else {
            searchGroup.style.display = "none";
            searchButton.style.backgroundColor = "inherit";
            searchButton.style.color = "inherit";
        }
    }

    function _dragSearchBox (e) {
        if (_searchDrag.enabled) {
            var parentRect = e.currentTarget.getBoundingClientRect();
            var searchBox = document.getElementById("PdfToolbarSearchBox");
            var searchRect = searchBox.getBoundingClientRect();
            if (!(parentRect.left > searchRect.left - (_searchDrag.x - e.clientX) ||
                parentRect.right - 20 < searchRect.right - (_searchDrag.x - e.clientX) ||
                parentRect.top + 35 > searchRect.top - (_searchDrag.y - e.clientY) ||
                parentRect.bottom - 20 < searchRect.bottom - (_searchDrag.y - e.clientY))) {
                    searchBox.style.right = (parseInt(searchBox.style.right) + (_searchDrag.x - e.clientX)) + "px";
                    searchBox.style.top = (parseInt(searchBox.style.top) - (_searchDrag.y - e.clientY)) + "px";
            }
            _searchDrag.x = e.clientX;
            _searchDrag.y = e.clientY;
        }
    }

    function _disableDragSearchBox () {
        if (_searchDrag.enabled) {
            _searchDrag.enabled = false;
        }
    }

    //PDF BOOKMARKS

    function _ShowPdfBookmark (bookmarkTitle) {
        var bookmarkData = _GetPdfBookmark(bookmarkTitle, _bookmarks);
        if(!bookmarkData){
            return;
        }

        _gotoDestination(bookmarkData.dest);
    }

    function _gotoDestination (destination) {
        const refreshPdf = function (newScale) {
            _refreshPDF(function (success) {
                if (success) {
                    if (_pdfCallback) {
                        _pdfCallback(success);
                    }
                }
            }, {zoomScale: newScale});
        };
        const getDestination = function (dest, callback) {
            if (typeof dest === "string") {
                __PDF_DOC.getDestination(dest).then(callback);
            } else if (typeof dest === "object") {
                callback(dest);
            }
        };

        if (!destination) return;
        getDestination(destination, function (dest) {
            if (!dest) return;
            __PDF_DOC.getPageIndex(dest[0]).then(function (pageIndex) {
                const pageNo = pageIndex + 1;
                switch (dest[1].name) {
                    case "FitB":
                    case "Fit":
                        _getBookmarkFitScrollData(pageNo, refreshPdf);
                        break;
                    case "FitR":
                        _getBookmarkFitRScrollData(pageNo, dest, refreshPdf);
                        break;
                    case "FitH":
                    case "FitBH":
                        _getBookmarkFitHScrollData(pageNo, dest, refreshPdf);
                            break;
                    case "FitV":
                    case "FitBV":
                        _getBookmarkFitVScrollData(pageNo, dest, refreshPdf);
                        break;
                    case "XYZ":
                        const newScale = dest[4];
                        if (newScale) {
                            _getBookmarkXYZScrollData(pageNo, dest, newScale * 1.6, refreshPdf(newScale * 1.6));
                        } else {
                            _getBookmarkXYZScrollData(pageNo, dest, null, function (left, top) {
                                const dest = { 1: {name: "XYZ"}, 2: left, 3: top };
                                gotoBookmark(pageNo, dest, function(success) {
                                    if (_pdfCallback && success) {
                                        _pdfCallback(success);
                                    }
                                });
                            });
                        }
                        break;
                    default:
                        _LoadPage(function(success){
                            if (_pdfCallback) {
                                _pdfCallback(success);
                            }
                        }, pageNo);
                        break;
                }
            });
        });
    }

    function _getBookmarkFitScrollData (pageNo, callback) {
        const scrollWrapper = document.getElementById(_currentCanvasId).parentNode;
        const wrapperRect = scrollWrapper.getBoundingClientRect();

        const wrapperWidth = wrapperRect.width - _scrollPadding,
              wrapperHeight = wrapperRect.height;

        __PDF_DOC.getPage(pageNo).then(function (page) {
            const viewport = page.getViewport({scale: 1, rotation: _getPageRotate(page)});

            const vpWidth = _checkPageRotated() ? viewport.height : viewport.width,
                  vpHeight = _checkPageRotated() ? viewport.width : viewport.height;

            const widthScale = (wrapperWidth - 2 * _marginSize) / vpWidth,
                  heightScale = (wrapperHeight - _scrollPadding) / vpHeight,
                  newScale = Math.min(widthScale, heightScale);

            _scrollOffset = {pageNo: pageNo, offsetX: -1, offsetY: 0};

            if (callback) callback(newScale);
        });
    }

    function _getBookmarkFitVScrollData (pageNo, destination, callback) {
        const scrollWrapper = document.getElementById(_currentCanvasId).parentNode;
        const wrapperRect = scrollWrapper.getBoundingClientRect();

        const wrapperWidth = wrapperRect.width - _scrollPadding - 2 * _marginSize;
        const wrapperHeight = wrapperRect.height;

        __PDF_DOC.getPage(pageNo).then(function (page) {
            var viewport = page.getViewport({scale: 1, rotation: _getPageRotate(page)});
            const vpHeight = _checkPageRotated() ? viewport.width : viewport.height;
            var newScale = wrapperHeight / vpHeight;
            viewport = page.getViewport({scale: newScale, rotation: _getPageRotate(page)});
            const vpWidth = _checkPageRotated() ? viewport.height : viewport.width;
            if (vpWidth > wrapperWidth) {
                newScale = (wrapperHeight - _scrollPadding) / vpHeight;
            }

            viewport = page.getViewport({scale: newScale, rotation: _getPageRotate(page)});
            const x = _checkPageRotated() ? 0 : destination[2],
                  y = _checkPageRotated() ? destination[2] : 0,
                  pt = _getPositionOnCanvas(x, y, viewport.width, viewport.height, newScale);

            const left = Math.max(pt.x, 0);

            _scrollOffset = {pageNo: pageNo, offsetX: left, offsetY: 0, addPageOffset: true};

            if (callback) callback(newScale);
        });
    }

    function _getBookmarkFitHScrollData (pageNo, destination, callback) {
        const scrollWrapper = document.getElementById(_currentCanvasId).parentNode;
        const wrapperRect = scrollWrapper.getBoundingClientRect();

        const wrapperWidth = wrapperRect.width;

        __PDF_DOC.getPage(pageNo).then(function (page) {
            var viewport = page.getViewport({scale: 1, rotation: _getPageRotate(page)});
            const newScale = (wrapperWidth - _scrollPadding - 2 * _marginSize) / viewport.width;
            viewport = page.getViewport({scale: newScale, rotation: _getPageRotate(page)});
            const x = _checkPageRotated() ? destination[2] : 0,
                  y = _checkPageRotated() ? 0 : destination[2],
                  pt = _getPositionOnCanvas(x, y, viewport.width, viewport.height, newScale);

            const top = Math.max(pt.y, 0);

            _scrollOffset = {pageNo: pageNo, offsetX: 0, offsetY: top, addPageOffset: true};

            if (callback) callback(newScale);
        });
    }

    function _getBookmarkXYZScrollData (pageNo, destination, newScale, callback) {
        const scale = newScale || __ZOOMSCALE;
        __PDF_DOC.getPage(pageNo).then(function (page) {
            const viewport = page.getViewport({scale: scale, rotation: _getPageRotate(page)});
            let pageWidth = parseFloat(viewport.width),
                pageHeight = parseFloat(viewport.height);

            const p = _getPositionOnCanvas(destination[2], destination[3], pageWidth, pageHeight, scale);

            let left = Math.max(p.x, 0),
                top = Math.max(p.y, 0);

            if (newScale)
                _scrollOffset = {pageNo: pageNo, offsetX: left, offsetY: top, addPageOffset: true};

            if (callback) callback(left, top);
        });
    }

    function _getBookmarkFitRScrollData (pageNo, destination, callback) {
        const scrollWrapper = document.getElementById(_currentCanvasId).parentNode;
        const wrapperRect = scrollWrapper.getBoundingClientRect();

        const wrapperWidth = wrapperRect.width,
              wrapperHeight = wrapperRect.height;

        const x = destination[2],
              y = destination[3],
              boxWidth = destination[4] - x,
              boxHeight = destination[5] - y;

        const widthScale = (wrapperWidth - _scrollPadding) / (_checkPageRotated() ? boxHeight : boxWidth),
              heightScale = (wrapperHeight - _scrollPadding) / (_checkPageRotated() ? boxWidth : boxHeight),
              newScale = Math.min(widthScale, heightScale, _zoomLimit.pdfMax, _largestZoomScale);

        __PDF_DOC.getPage(pageNo).then(function (page) {
            const viewport = page.getViewport({scale: newScale, rotation: _getPageRotate(page)});
            let pageWidth = parseFloat(viewport.width),
                pageHeight = parseFloat(viewport.height);

            const p0 = _getPositionOnCanvas(destination[2], destination[3], pageWidth, pageHeight, newScale),
                  p1 = _getPositionOnCanvas(destination[4], destination[5], pageWidth, pageHeight, newScale);

            let left = Math.max(Math.min(p0.x, p1.x), 0),
                top = Math.max(Math.min(p0.y, p1.y), 0);

            _scrollOffset = {pageNo: pageNo, offsetX: left, offsetY: top, addPageOffset: true};

            if (callback) callback(newScale);
        });
    }

    function _setPageModeFitPage(callback) {
        var canvasWrapper = document.getElementById(_currentCanvasId);
        var scale = (canvasWrapper.parentNode.clientHeight - _marginSize * 2) / _getLargestPageHeight() * __ZOOMSCALE;
        if (Math.abs(__ZOOMSCALE - scale) > 0.001) {

            _refreshPDF(function(success){
                if (success) {
                    if (callback) callback();
                }
            }, {zoomScale: scale});
        } else {
            if (callback) callback();
        }

        _updateToolbarPageModeSelection();
    }

    function _GetPdfBookmark(bookmarkTitle, bookmarkList) {
        var returnBookmark = null;
        for(var i = 0; i < bookmarkList.length; i++) {
            if (bookmarkList[i].title == bookmarkTitle) {
                returnBookmark = bookmarkList[i];
            } else if (bookmarkList[i].items.length > 0){
                returnBookmark = _GetPdfBookmark(bookmarkTitle, bookmarkList[i].items);
            }
            if (returnBookmark){
                break;
            }
        }
        return returnBookmark;
    }

    //PDF SEARCH

    function _resetSearchVariables() {
        _extractTextPromises = [];
        _pageMatches = [];
        _pageContents = [];
        _matchesCountTotal = 0;
        _indexedPageNum = 0;
        clearTimeout(_findTimeout);
        _findTimeout = null;
        _pendingFindMatches = Object.create(null);
        _scrollMatches = false;
        _searchState = null;
        _dirtyMatch = false;
        _selected = {
            pageIdx: -1,
            matchIdx: -1
        };
        _offset = {
            pageIdx: null,
            matchIdx: null,
            wrapped: false
        };
        _resumePageIdx = null;
        _matchSelected = {
            pageIdx:  -1,
            matchIdx: -1
        };
        _pagesToSearch = null;
    }

    function _SearchInPdfDocument(searchTerm, findDirection, callback) {
        if(searchTerm == ""){
            return;
        }

        if (callback) {
            _pdfSearchCallback = callback;
        }

        if (_searchTerm == searchTerm &&
            _searchResultsCase == _searchCaseMatch &&
            _searchResultsWord == _searchWordMatch &&
            _selected.pageIdx == __CURRENT_PAGE) {
            if (findDirection == -1) { // Previous
                ThingView.FocusPrevPdfDocumentSearch();
            } else if (findDirection == 1) { // Next
                ThingView.FocusNextPdfDocumentSearch();
            } else if (findDirection == 0) { // All
                ThingView.FocusAllPdfDocumentSearch();
            }
            if (_pdfSearchCallback) {
                _pdfSearchCallback(_matchesCountTotal != 0); // duplicated search
            }
            return;
        }

        _removePdfSearchResultHighlights();
        _searchTerm = searchTerm;
        _searchResultsCase = _searchCaseMatch;
        _searchResultsWord = _searchWordMatch;

        _DisplayPdfSearchResultsDialogue(_pdfText.searching);

        _searchState = {
            query: _searchTerm,
            phraseSearch: true,
            caseSensitive: _searchCaseMatch,
            entireWord: _searchWordMatch,
            highlightAll: (findDirection == 0),
            findPrevious: (findDirection == -1)
        };
        _dirtyMatch = true;

        _buildSearchResult();
    }

    function _updateUIResultsCount() {
        if (!_toolbarEnabled) return;

        var total = _matchesCountTotal;
        var pageIdx = _selected.pageIdx;
        var matchIdx = _selected.matchIdx;
        var current = 0;
        if (matchIdx !== -1) {
            for (var i = 0; i < pageIdx; i++) {
                current += _pageMatches[i] && _pageMatches[i].length || 0;
            }

            current += matchIdx + 1;
        }

        if (current < 1 || current > total) {
            current = total = 0;
        }

        var message = "";
        if (_indexedPageNum != __TOTAL_PAGES) {
            message = _pdfText.searchingPage + ' ' + _indexedPageNum;
        } else {
            if (total == 0) {
                message = _pdfText.searchNotFound;
            } else {
                message = "(" + current + "/" + total + ") " + _pdfText.matches;
            }
        }
        _DisplayPdfSearchResultsDialogue(message);
    }

    function _createPromise() {
        var capability = {};
        capability.promise = new Promise(function (resolve, reject) {
            capability.resolve = resolve;
            capability.reject = reject;
        });
        return capability;
    }

    function _extractText() {
        if (_extractTextPromises.length > 0) {
            return true;
        }

        var promise = Promise.resolve();

        var _loop = function _loop(pageNo) {
            var extractTextCapability = _createPromise();
            _extractTextPromises[pageNo] = extractTextCapability.promise;
            promise = promise.then(function () {
                return __PDF_DOC.getPage(pageNo).then(function (pdfPage) {
                    return pdfPage.getTextContent({
                        normalizeWhitespace: true
                    });
                }).then(function (textContent) {
                    var textItems = textContent.items;
                    var strBuf = [];

                    for (var j = 0, jj = textItems.length; j < jj; j++) {
                        strBuf.push(textItems[j].str);
                    }

                    _pageContents[pageNo] = normalize(strBuf.join(''));
                    extractTextCapability.resolve(pageNo);
                }, function (reason) {
                    console.error("Unable to get text content for page ".concat(pageNo), reason);
                    _pageContents[pageNo] = '';
                    extractTextCapability.resolve(pageNo);
                });
            });
        };

        var curPage = _searchState.highlightAll ? _firstLoadedPage : __CURRENT_PAGE;
        var count = 0;
        while (count != __TOTAL_PAGES) {
            _loop(curPage);
            curPage = _getNextPageNo(curPage, !_searchState.findPrevious);
            count += 1;
        }
        return false;
    }

    function _getNextPageNo(pageNo, next) {
        if (next) {
            var nextPageNo = pageNo + 1;
            if (nextPageNo > __TOTAL_PAGES) {
                return 1;
            } else {
                return nextPageNo;
            }
        } else {
            var prevPageNo = pageNo - 1;
            if (prevPageNo < 1) {
                return __TOTAL_PAGES;
            } else {
                return prevPageNo;
            }
        }
    }

    function _calculatePageMatch(pageNo) {
        var pageContent = _pageContents[pageNo];
        var query = _searchTerm;

        if (!_searchCaseMatch) {
            pageContent = pageContent.toLowerCase();
            query = query.toLowerCase();
        }

        _calculatePhraseMatch(query, pageNo, pageContent, _searchWordMatch);

        if (_resumePageIdx === pageNo) {
            _resumePageIdx = null;

            _nextPageMatch();
        }

        var pageMatchesCount = _pageMatches[pageNo].length;

        if (pageMatchesCount > 0) {
            _matchesCountTotal += pageMatchesCount;
        }
        _indexedPageNum += 1;
        if (_indexedPageNum == __TOTAL_PAGES) {
            if (_pdfSearchCallback) {
                _pdfSearchCallback(_matchesCountTotal != 0); // new search
            }
        }
        _updateUIResultsCount();
    }

    function _calculatePhraseMatch(query, pageIndex, pageContent, entireWord) {
        var matches = [];
        var queryLen = query.length;
        var matchIdx = -queryLen;

        while (true) {
            matchIdx = pageContent.indexOf(query, matchIdx + queryLen);

            if (matchIdx === -1) {
                break;
            }

            if (entireWord && !_isEntireWord(pageContent, matchIdx, queryLen)) {
                continue;
            }

            matches.push(matchIdx);
        }

        _pageMatches[pageIndex] = matches;
    }

    function _nextMatch() {
        var previous = _searchState.findPrevious;
        var numPages = __TOTAL_PAGES;

        if (_dirtyMatch) {
            _dirtyMatch = false;
            _selected.pageIdx = _selected.matchIdx = -1;
            _offset.pageIdx = __CURRENT_PAGE;
            _offset.matchIdx = null;
            _offset.wrapped = false;
            _resumePageIdx = null;
            _pageMatches.length = 0;
            _matchesCountTotal = 0;
            _indexedPageNum = 0;

            var _calLoop = function _calLoop(curPage) {
                if (_pendingFindMatches[curPage] == true) {
                    return;
                }

                _pendingFindMatches[curPage] = true;

                _extractTextPromises[curPage].then(function(pageNo) {
                    delete _pendingFindMatches[pageNo];

                    _calculatePageMatch(pageNo);
                });
            };

            var curPage = _searchState.highlightAll ? _firstLoadedPage : __CURRENT_PAGE;
            var count = 0;
            while (count != __TOTAL_PAGES) {
                _calLoop(curPage);
                curPage = _getNextPageNo(curPage, !_searchState.findPrevious);
                count += 1;
            }
        }

        if (_resumePageIdx) {
            return;
        }

        var offset = _offset;
        _pagesToSearch = numPages;

        if (offset.matchIdx !== null) {
            var numPageMatches = _pageMatches[offset.pageIdx].length;

            if (!previous && offset.matchIdx + 1 < numPageMatches || previous && offset.matchIdx > 0) {
                offset.matchIdx = previous ? offset.matchIdx - 1 : offset.matchIdx + 1;

                _updateMatch(true);
                return;
            }

            _advanceOffsetPage(previous);
        }

        _nextPageMatch();
    }

    function _advanceOffsetPage(previous) {
        var offset = _offset;
        offset.pageIdx = previous ? offset.pageIdx - 1 : offset.pageIdx + 1;
        offset.matchIdx = null;
        _pagesToSearch--;

        if (offset.pageIdx > __TOTAL_PAGES || offset.pageIdx < 1) {
            offset.pageIdx = previous ? __TOTAL_PAGES : 1;
            offset.wrapped = true;
        }
    }

    function _nextPageMatch() {
        if (_resumePageIdx !== null) {
            console.error('There can only be one pending page.');
        }

        var matches = null;

        do {
            var pageIdx = _offset.pageIdx;
            matches = _pageMatches[pageIdx];

            if (!matches) {
                _resumePageIdx = pageIdx;
                break;
            }
        } while (!_matchesReady(matches));
    }

    function _matchesReady(matches) {
        var offset = _offset;
        var numMatches = matches.length;
        var previous = _searchState.findPrevious;

        if (numMatches) {
            offset.matchIdx = previous ? numMatches - 1 : 0;

            _updateMatch(true);

            return true;
        }

        _advanceOffsetPage(previous);

        if (offset.wrapped) {
            offset.matchIdx = null;

            if (_pagesToSearch < 0) {
                _updateMatch(false);

                return true;
            }
        }

        return false;
    }

    function _updateMatch() {
        var found = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        _offset.wrapped = false;

        if (found) {
            var previousPage = _selected.pageIdx;
            _selected.pageIdx = _offset.pageIdx;
            _selected.matchIdx = _offset.matchIdx;

            if (previousPage !== -1 && previousPage !== _selected.pageIdx) {
                _updatePage(previousPage);
            }
        }

        if (_selected.pageIdx !== -1) {
            _scrollMatches = true;

            _updatePage(_selected.pageIdx);
        }
    }

    function _updatePage(index) {
        if (_scrollMatches && _selected.pageIdx === index) {
            _convertMatches(index, function(matches) {
                if (matches && matches.length) {
                    _focusMatch(matches, function(success) {
                        if (success) {
                            if (_searchState.highlightAll === true) { // All
                                ThingView.FocusAllPdfDocumentSearch();
                            }
                            _updateUIResultsCount();
                            _matchSelected = {
                                pageIdx:  _selected.pageIdx,
                                matchIdx: _selected.matchIdx
                            };
                        }
                    });
                }
            });
        }
    }

    function _focusMatch(matches, callback) {
        _ignoreScrollEvent = true;
        showPage(_selected.pageIdx, function(success) {
            if (success) {
                var match = matches[_selected.matchIdx];
                if (match) {
                    _removePdfSearchResultHighlights();
                    const textPos = _highlightTextElements(match);
                    var destination = null;
                    if (textPos.num != 0) {
                        destination = {
                            1: "",
                            2: textPos.x + _marginSize,
                            3: textPos.y + _marginSize
                        };
                    }

                    _scrollToPage(_selected.pageIdx, function() {
                        showPage(_selected.pageIdx, function(result) {
                            if (result) {
                                _ignoreScrollEvent = false;
                                _changePageOnScroll();
                                _updateNavbar();
                                if (callback) {
                                    callback(true);
                                }
                                if (_pdfCallback) {
                                    _pdfCallback(true);
                                }
                            }
                        }, 3);
                    }, destination);
                }
            }
        }, 2);
    }

    function _buildSearchResult() {
        const extracted = _extractText();

        if (_findTimeout) {
            clearTimeout(_findTimeout);
            _findTimeout = null;
        }

        if (extracted) {
            _nextMatch();
        } else {
            _findTimeout = setTimeout(function () {
                _nextMatch();
                _findTimeout = null;
            }, 250);
        }
    }

    function _isEntireWord(content, startIdx, length) {
        if (startIdx > 0) {
            var first = content.charCodeAt(startIdx);
            var limit = content.charCodeAt(startIdx - 1);

            if (_getCharacterType(first) == _getCharacterType(limit)) {
                return false;
            }
        }

        var endIdx = startIdx + length - 1;

        if (endIdx < content.length - 1) {
            var last = content.charCodeAt(endIdx);

            var _limit = content.charCodeAt(endIdx + 1);

            if (_getCharacterType(last) == _getCharacterType(_limit)) {
                return false;
            }
        }

        return true;
    }

    function _getCharacterType (charCode) {
        var CharacterType = {
            SPACE: 0,
            ALPHA_LETTER: 1,
            PUNCT: 2,
            HAN_LETTER: 3,
            KATAKANA_LETTER: 4,
            HIRAGANA_LETTER: 5,
            HALFWIDTH_KATAKANA_LETTER: 6,
            THAI_LETTER: 7
        };

        function isAlphabeticalScript(charCode) {
            return charCode < 0x2E80;
        }

        function isAscii(charCode) {
            return (charCode & 0xFF80) === 0;
        }

        function isAsciiAlpha(charCode) {
            return charCode >= 0x61 && charCode <= 0x7A || charCode >= 0x41 && charCode <= 0x5A;
        }

        function isAsciiDigit(charCode) {
            return charCode >= 0x30 && charCode <= 0x39;
        }

        function isAsciiSpace(charCode) {
            return charCode === 0x20 || charCode === 0x09 || charCode === 0x0D || charCode === 0x0A;
        }

        function isHan(charCode) {
            return charCode >= 0x3400 && charCode <= 0x9FFF || charCode >= 0xF900 && charCode <= 0xFAFF;
        }

        function isKatakana(charCode) {
            return charCode >= 0x30A0 && charCode <= 0x30FF;
        }

        function isHiragana(charCode) {
            return charCode >= 0x3040 && charCode <= 0x309F;
        }

        function isHalfwidthKatakana(charCode) {
            return charCode >= 0xFF60 && charCode <= 0xFF9F;
        }

        function isThai(charCode) {
            return (charCode & 0xFF80) === 0x0E00;
        }

        if (isAlphabeticalScript(charCode)) {
            if (isAscii(charCode)) {
                if (isAsciiSpace(charCode)) {
                    return CharacterType.SPACE;
                } else if (isAsciiAlpha(charCode) || isAsciiDigit(charCode) || charCode === 0x5F) {
                    return CharacterType.ALPHA_LETTER;
                }

                return CharacterType.PUNCT;
            } else if (isThai(charCode)) {
                return CharacterType.THAI_LETTER;
            } else if (charCode === 0xA0) {
                return CharacterType.SPACE;
            }

            return CharacterType.ALPHA_LETTER;
        }

        if (isHan(charCode)) {
            return CharacterType.HAN_LETTER;
        } else if (isKatakana(charCode)) {
            return CharacterType.KATAKANA_LETTER;
        } else if (isHiragana(charCode)) {
            return CharacterType.HIRAGANA_LETTER;
        } else if (isHalfwidthKatakana(charCode)) {
            return CharacterType.HALFWIDTH_KATAKANA_LETTER;
        }

        return CharacterType.ALPHA_LETTER;
    }

    function _DisplayPdfSearchResultsDialogue(message) {
        var resultsDisplay = document.getElementById("PdfToolbarSearchResultsDiv");
        if (!resultsDisplay){
            return;
        }
        resultsDisplay.textContent = message;
    }

    String.prototype.insertTwo = function(idx1, str1, idx2, str2) {
        var slice1 = this.slice(0, idx1);
        var slice2 = this.slice(idx1, idx2);
        var slice3 = this.slice(idx2);
        return encodeHtml(slice1) + str1 + encodeHtml(slice2) + str2 + encodeHtml(slice3);
    };

    /**
     * Converts non-ASCII characters to . to follow behaviour from Adobe.
     * @param {string} str The string to convert
     * @return {string} Converted string
     * @private
     * @memberof ThingView
     **/
    function encodePathContent(str) {
        var buf = [];
        for (var i=str.length-1;i>=0;i--) {
            var code = str.charCodeAt(i);
            if (code > 126) {
                buf.unshift('.');
            } else {
                buf.unshift(str[i]);
            }
        }
        return buf.join('');
    }

    /**
     * Converts non-ASCII characters of a string to its html entities.
     * @param {string} str The string to convert
     * @return {string} Converted string
     * @private
     * @memberof ThingView
     **/
    function encodeContent(str) {
        var buf = [];
        for (var i=str.length-1;i>=0;i--) {
            var code = str.charCodeAt(i);
            if (code > 126) {
                buf.unshift(['&#', code, ';'].join(''));
            } else {
                switch (code) {
                    case 34: buf.unshift('&quot;'); break;
                    case 38: buf.unshift('&amp;'); break;
                    case 60: buf.unshift('&lt;'); break;
                    case 62: buf.unshift('&gt;'); break;
                    default: buf.unshift(str[i]); break;
                }
            }
        }
        return buf.join('');
    }

    /**
     * Converts a string to its html entities completely.
     * @param {string} str The string to convert
     * @return {string} Converted string
     * @private
     * @memberof ThingView
     **/
    function encodeHtml(str) {
        var buf = [];
        for (var i=str.length-1;i>=0;i--) {
            buf.unshift(['&#', str[i].charCodeAt(), ';'].join(''));
        }
        return buf.join('');
    }

    function decodeHtml(html) {
        var txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    }

    function _removePdfSearchResultHighlights () {
        _matchSelected = {
            pageIdx:  -1,
            matchIdx: -1
        };
        _clearTextSelection();
        const textLayers = document.querySelectorAll(".PdfPageDisplayTextLayer");
        for (const textLayer of textLayers) {
            const highlights = textLayer.querySelectorAll(".PdfSearchResultHighlight");
            Array.prototype.forEach.call(highlights, function (node) {
                node.parentNode.removeChild(node);
            });
        }
    }

    function _convertMatches(pageNo, callback) {
        const matches = _pageMatches[pageNo] || null;
        if (!matches) {
            if (callback) callback(null);
            return;
        }

        __PDF_DOC.getPage(pageNo).then(function(page) {
            page.getTextContent({ normalizeWhitespace: true }).then(function(textContent){
                var textContentItemsStr = [];
                var textLayerFrag = document.createDocumentFragment();
                _PDFJS.renderTextLayer({
                    textContent: textContent,
                    container: textLayerFrag,
                    viewport: page.getViewport({scale: __ZOOMSCALE, rotation: _getPageRotate(page)}),
                    textContentItemsStr: textContentItemsStr,
                    enhanceTextSelection: true
                })._capability.promise.then(function(){
                    var i = 0,
                        iIndex = 0;
                    var end = textContentItemsStr.length - 1;
                    var queryLen = _searchTerm.length;
                    var result = [];

                    for (var m = 0, mm = matches.length; m < mm; m++) {
                        var matchIdx = matches[m];

                        while (i !== end && matchIdx >= iIndex + textContentItemsStr[i].length) {
                            iIndex += textContentItemsStr[i].length;
                            i++;
                        }

                        if (i === textContentItemsStr.length) {
                            console.error('Could not find a matching mapping');
                        }

                        var match = {
                            pageNo: pageNo,
                            begin: {
                            divIdx: i,
                            offset: matchIdx - iIndex
                            }
                        };

                        matchIdx += queryLen;

                        while (i !== end && matchIdx > iIndex + textContentItemsStr[i].length) {
                            iIndex += textContentItemsStr[i].length;
                            i++;
                        }

                        match.end = {
                            divIdx: i,
                            offset: matchIdx - iIndex
                        };
                        result.push(match);
                    }

                    if (callback) callback(result);
                });
            });
        });
    }

    function _highlightTextElements(match) {
        const textLayer = document.querySelector("#PdfPageDisplayTextLayer" + match.pageNo);
        var i = match.begin.divIdx;
        const endi = match.end.divIdx;
        const result = { x: 0, y: 0, num: 0 };
        if (textLayer) {
            const textLayerRect = textLayer.getBoundingClientRect();
            for (;i<=endi;i++) {
                const textElem = textLayer.querySelector("#PdfPageDisplayTextLayer" + match.pageNo + "_" + (i+1));
                if (textElem) {
                    const highlightedTextElement = textElem.cloneNode(true);
                    highlightedTextElement.className = "PdfSearchResultHighlight";
                    highlightedTextElement.id = "PdfSearchResultHighlight" + match.pageNo + "_" + (i+1);

                    const start = i == match.begin.divIdx ? match.begin.offset : 0;
                    const end = i == match.end.divIdx ? match.end.offset : textElem.innerText.length;
                    const htmlText =
                        decodeHtml(highlightedTextElement.innerHTML)
                        .insertTwo(start,
                                   "<span style=\"background-color:" + _uiColors.pdfViewer.textHighlight +
                                   "; color:" + _uiColors.pdfViewer.textHighlight + ";\">",
                                   end,
                                   "</span>");
                    highlightedTextElement.innerHTML = htmlText;
                    textElem.parentNode.appendChild(highlightedTextElement);
                    const spanRect = highlightedTextElement.querySelector("span").getBoundingClientRect();
                    result.x += spanRect.left - textLayerRect.left + spanRect.width / 2;
                    result.y += spanRect.top - textLayerRect.top + spanRect.height / 2;
                    result.num += 1;
                }
            }
        }
        if (result.num != 0) {
            result.x /= result.num;
            result.y /= result.num;
        }
        return result;
    }

    function _showSearchResultHighlight() {
        if (_searchState && _searchState.highlightAll) {
            _highlightAllMatches();
        } else {
            if (_matchSelected.pageIdx != -1 &&
                _matchSelected.matchIdx != -1) {
                _convertMatches(_matchSelected.pageIdx, function(matches) {
                    if (matches && matches.length) {
                        var match = matches[_matchSelected.matchIdx];
                        _highlightTextElements(match);
                    }
                });
            }
        }
    }

    function _checkCurrentPagesSearched () {
        if (_pendingFindMatches[__CURRENT_PAGE] == true) {
            setTimeout(_checkCurrentPagesSearched, 100);
        } else {
            _highlightAllMatches();
        }
    }

    function _highlightAllMatches() {
        _convertMatches(__CURRENT_PAGE, function (matches) {
            if (matches) {
                for (const match of matches) {
                    _highlightTextElements(match);
                }
            }
        });
    }

    function _getAnnoSelection () {
        returnObj.SetMarkupModePDF(null);
        _annoSelection = _deepCloneObject(_markupMode.selectedAnnotations);
        _clearPdfAnnoSelection();
    }

    function _showAnnoSelectionPage (pageNo) {
        if (_markupEdit.note.idNo != -1) return;
        const canvas = document.querySelector("#PdfAnnotationCanvas" + pageNo);
        if (!canvas) return;

        var usedIds = [];
        for (let i=0;i<_annoSelection.length;i++) {
            const annotation = canvas.querySelector("#PdfAnnotationElement" + _annoSelection[i]);
            if (annotation) {
                _selectPdfAnnotation(annotation);
                usedIds.unshift(i);
            }
        }

        for (const id of usedIds) {
            _annoSelection.splice(id, 1);
        }
    }

    function _getNoteMarkupEdit() {
        if (_markupEdit.edit) {
            const editableDiv = document.getElementById("PdfMarkupNoteEditor");
            if (editableDiv && editableDiv.hasChildNodes()) {
                _markupEdit.note.idNo = _markupEdit.idNo;
            }
        }
    }

    function _setNoteMarkupEdit() {
        if (_markupEdit.note.idNo != -1) {
            _editNoteMarkup(_markupEdit.note.idNo, null);

            _markupEdit.note.idNo = -1;
        }
    }

    function _clearTextSelection() {
        if (window.getSelection) {
            if (window.getSelection().empty) { // Chrome, Edge and Firefox
                window.getSelection().empty();
            } else if (window.getSelection().removeAllRanges) { // IE
                window.getSelection().removeAllRanges();
            }
        }
    }

    function _getTextSelection() {
        _textSelection = {valid: false};
        var selection = window.getSelection();
        if (selection.type == "Range") {
            var startId = selection.anchorNode.parentNode.id;
            var startNumbers = startId.replace("PdfPageDisplayTextLayer","").split("_");
            var endId = selection.focusNode.parentNode.id;
            var endNumbers = endId.replace("PdfPageDisplayTextLayer","").split("_");

            if (startNumbers.length == 2 && endNumbers.length == 2) {
                var start = {
                    id: startId,
                    offset: selection.anchorOffset,
                    page: startNumbers[0],
                    no: startNumbers[1]
                };
                var end = {
                    id: endId,
                    offset: selection.focusOffset,
                    page: endNumbers[0],
                    no: endNumbers[1]
                };
                if (start.page < end.page) {
                    _textSelection.startNodeId = start.id;
                    _textSelection.startOffset = start.offset;
                    _textSelection.endNodeId = end.id;
                    _textSelection.endOffset = end.offset;
                } else if (start.page > end.page) {
                    _textSelection.startNodeId = end.id;
                    _textSelection.startOffset = end.offset;
                    _textSelection.endNodeId = start.id;
                    _textSelection.endOffset = start.offset;
                } else {
                    if (start.id < end.id) {
                        _textSelection.startNodeId = start.id;
                        _textSelection.startOffset = start.offset;
                        _textSelection.endNodeId = end.id;
                        _textSelection.endOffset = end.offset;
                    } else if (start.id > end.id) {
                        _textSelection.startNodeId = end.id;
                        _textSelection.startOffset = end.offset;
                        _textSelection.endNodeId = start.id;
                        _textSelection.endOffset = start.offset;
                    } else {
                        _textSelection.startNodeId = start.id;
                        _textSelection.startOffset = Math.min(start.offset, end.offset);
                        _textSelection.endNodeId = start.id;
                        _textSelection.endOffset = Math.max(start.offset, end.offset);
                    }
                }
                _textSelection.valid = true;
            }
        }
    }

    function _showTextSelection() {
        _clearTextSelection();
        if (_textSelection.valid) {
            var startNode = document.getElementById(_textSelection.startNodeId);
            var endNode = document.getElementById(_textSelection.endNodeId);
            if (startNode && startNode.firstChild &&
                endNode   && endNode.firstChild) {
                var range = document.createRange();
                range.setStart(startNode.firstChild, _textSelection.startOffset);
                range.setEnd(endNode.firstChild, _textSelection.endOffset);

                var selection = window.getSelection();
                selection.addRange(range);
            }
        }
    }

    //PDF SIDEBAR

    function _DisplayPdfNavigationBar (parent, pageNo) {
        if (!parent) return;
        _registerNavAnnotationCallbacks();
        var navDiv = document.getElementById("CreoViewDocumentNavbar");
        _clearNavPages(navDiv);
        if (!navDiv) {
            navDiv = document.createElement("div");
            navDiv.id = "CreoViewDocumentNavbar";
            navDiv.style.backgroundColor = _uiColors.sidebar.background;
            navDiv.style.height = parseInt(parent.clientHeight) - parseInt(parent.firstChild.clientHeight) + "px";
            navDiv.style.width = "100%";
            navDiv.style.overflowY = "auto";
            _addDocumentToolbarScrollbarStyle(navDiv.id, 15);
            navDiv.addEventListener("scroll", function(){
                _handleNavOnScroll(navDiv);
            });
            parent.appendChild(navDiv);
        }
        _PopulatePdfNavigationBar(navDiv, pageNo);
    }

    function _PopulatePdfNavigationBar (navDiv, pageNo) {
        _ignoreNavScrollEvent = true;
        _prepareNavWrapper(1, navDiv, function(){
            _navbar.firstLoadedPage = Math.max(pageNo - _navbar.bufferSize, 1);
            _navbar.lastLoadedPage  = Math.min(pageNo + _navbar.bufferSize, __TOTAL_PAGES);
            _displayNavPages(_navbar.firstLoadedPage, function(){
                _selectNavPage(document.getElementById("PdfNavPageWrapper" + pageNo), pageNo);
                _scrollNavbarToPage(navDiv, pageNo);
            });
        });
    }

    function _prepareNavWrapper (pageNo, navDiv, callback){
        __PDF_DOC.getPage(pageNo).then(function(page){
            const viewport = page.getViewport({scale: 1, rotation: _getPageRotate(page)});

            var width = _navSidebarWidth - 2 * (_navWrapperBorder + _navWrapperMargin);
            var height = width * viewport.height / viewport.width;
            var newZoomScale = height / viewport.height;
            height = Math.floor(height);

            var navWrapper = null;
            if (_navWrapperTemplate == null) {
                navWrapper = document.createElement("div");
                navWrapper.style.margin = "10px auto";
                navWrapper.style.display = "block";
                navWrapper.style.boxShadow = "3px 3px 10px rgba(0,0,0,0.5)";
                navWrapper.style.cursor = "pointer";

                _navWrapperTemplate = navWrapper.cloneNode(false);
            } else {
                navWrapper = _navWrapperTemplate.cloneNode(false);
            }

            navWrapper.dataset.zoomScale = newZoomScale;
            navWrapper.style.height = height + "px";
            navWrapper.style.width = width + "px";
            navWrapper.height = height;
            navWrapper.width = width;
            navWrapper.style.position = "relative";
            navWrapper.id = "PdfNavPageWrapper" + pageNo;
            navWrapper.title = "Page " + pageNo;
            navWrapper.addEventListener("click", function(){
                _selectNavPage(navWrapper, pageNo);
                _LoadPage(_pdfCallback, pageNo);
            });
            navWrapper.addEventListener("mouseenter", function(){
                document.getElementById(_currentCanvasId).style.cursor = "pointer";
            });
            navWrapper.addEventListener("mouseleave", function(){
                document.getElementById(_currentCanvasId).style.cursor = "auto";
            });
            navDiv.appendChild(navWrapper);
            if (pageNo < __TOTAL_PAGES) {
                _prepareNavWrapper(pageNo+1, navDiv, callback);
            } else {
                if (callback) {
                    callback();
                }
            }
        });
    }

    function _displayNavPageAnnotation (annotation) {
        if (!annotation || !annotation.visible) return;

        const pageNo = annotation.pageNo + 1;
        const pdfCanvas = document.getElementById("PdfNavPageWrapper" + pageNo);
        if (!pdfCanvas) return;

        const zoomScale = Number(pdfCanvas.dataset.zoomScale);
        const canvasId = "PdfNavAnnotationCanvas" + pageNo;
        const svgLayerId = "PdfNavAnnotationSvgLayer" + pageNo;
        var canvas = document.getElementById(canvasId);
        var svgLayer = document.getElementById(svgLayerId);
        if (!canvas) {
            const width = _checkPageRotation()%2==1 ? parseFloat(pdfCanvas.height) : parseFloat(pdfCanvas.width);
            const height = _checkPageRotation()%2==1 ? parseFloat(pdfCanvas.width) : parseFloat(pdfCanvas.height);
            if (_navAnnotationCanvasTemplate == null) {
                canvas = document.createElement("div");
                canvas.setAttribute('class', "PdfNavAnnotationCanvas");
                canvas.style.position = "absolute";
                canvas.style.top = "0px";
                canvas.style.left = "0px";
                canvas.style.zIndex = _zIndex.markup;

                _navAnnotationCanvasTemplate = canvas.cloneNode(false);
            } else {
                canvas = _navAnnotationCanvasTemplate.cloneNode(false);
            }
            canvas.id = canvasId;
            canvas.width = width + "px";
            canvas.height = height + "px";
            canvas.style.height = height + "px";
            canvas.style.width = width + "px";
            canvas.style.transform = _getAnnotationCanvasTransform(width, height);

            if (_filterPdfMarkups) {
                canvas.style.visibility = "hidden";
            }
            pdfCanvas.insertBefore(canvas, pdfCanvas.firstChild);

            svgLayer = document.createElementNS(_svgNS, "svg");
            svgLayer.id = svgLayerId;
            svgLayer.setAttribute("preserveAspectRatio", "none");
            svgLayer.setAttribute("width", width);
            svgLayer.setAttribute("height", height);
            svgLayer.style.zIndex = _zIndex.markup;
            svgLayer.style.position = "absolute";
            svgLayer.style.left = "0px";
            svgLayer.style.top = "0px";
            canvas.appendChild(svgLayer);

            const defs = document.createElementNS(_svgNS, "defs");
            svgLayer.appendChild(defs);
        }
        switch (annotation.type) {
            case _markupTypes.leaderLine:
            case _markupTypes.polyline:
                _displayPdfLeaderLine(annotation, svgLayer, false, zoomScale, true);
                break;
            case _markupTypes.rectangle:
            case _markupTypes.rectangleFilled:
                _displayPdfRectangle(annotation, svgLayer, false, zoomScale, true);
                break;
            case _markupTypes.ellipse:
            case _markupTypes.ellipseFilled:
                _displayPdfCircle(annotation, svgLayer, false, zoomScale, true);
                break;
            case _markupTypes.polygon:
            case _markupTypes.polygonFilled:
                _displayPdfPolygon(annotation, svgLayer, false, zoomScale, true);
                break;
            case _markupTypes.freehand:
                _displayPdfFreehand(annotation, svgLayer, false, zoomScale, true);
                break;
            case _markupTypes.textStrikethrough:
            case _markupTypes.textUnderline:
                _displayPdfStrikeThrough(annotation, svgLayer, false, zoomScale, true);
                break;
            case _markupTypes.textHighlight:
                _displayPdfHighlight(annotation, svgLayer, false, zoomScale, true);
                break;
            case _markupTypes.note:
            case _markupTypes.noteLeader:
                _displayPdfNote(annotation, svgLayer, false, zoomScale, true);
                break;
            case _markupTypes.stamp:
                _displayPdfStamp(annotation, svgLayer, false, zoomScale, true);
                break;
            default:
                console.log("Annotation type not supported");
                break;
        }
    }

    function _registerNavAnnotationCallbacks () {
        if (_navCallbackRegistered) return;

        _markupObserver.addCallback("annoDeleted", _redrawNavAnnotationPages);
        _markupObserver.addCallback("annoSetEdited", _redrawNavAnnotationPages);

        _navCallbackRegistered = true;
    }

    function _unregisterNavAnnotationCallbacks () {
        if (!_navCallbackRegistered) return;

        _markupObserver.removeCallback("annoDeleted", _redrawNavAnnotationPages);
        _markupObserver.removeCallback("annoSetEdited", _redrawNavAnnotationPages);

        _navCallbackRegistered = false;
    }

    function _getSelectedAnnoPages () {
        const pageNos = new Set();
        for (const annoId of _markupMode.selectedAnnotations) {
            const parsedAnno = _pdfParsedAnnotationSet[annoId];
            if (parsedAnno) {
                pageNos.add(parsedAnno.pageNo + 1);
            }
        }
        pageNos.add(__CURRENT_PAGE);
        return pageNos;
    }

    function _redrawNavAnnotationPages () {
        _getSelectedAnnoPages().forEach(function(pageNo) {
            _drawNavPageAnnotations(pageNo);
        });
    }

    function _drawNavPageAnnotations (pageNo) {
        if (!_pageAnnoSetList[pageNo]) return;

        const oldAnnoCanvas = document.getElementById("PdfNavAnnotationCanvas" + pageNo);
        if (oldAnnoCanvas) {
            oldAnnoCanvas.parentNode.removeChild(oldAnnoCanvas);
        }
        for (const idNo of _pageAnnoSetList[pageNo]) {
            _displayNavPageAnnotation(_pdfParsedAnnotationSet[idNo]);
        }
    }

    function _displayNavPages (pageNo, callback){
        __PDF_DOC.getPage(pageNo).then(function(page){
            const navWrapper = document.getElementById("PdfNavPageWrapper" + pageNo);
            if (navWrapper && navWrapper.childElementCount == 0) {
                const scale = parseFloat(navWrapper.dataset.zoomScale);
                const viewport = page.getViewport({scale: scale, rotation: _getPageRotate(page)});
                var canvas = document.createElement("canvas");
                canvas.id = "PdfNavPageCanvas" + pageNo;
                canvas.height = parseInt(viewport.height);
                canvas.width = parseInt(viewport.width);
                page.render({canvasContext: canvas.getContext('2d'), viewport: viewport}).promise.then(function(){
                    if (navWrapper) {
                        navWrapper.appendChild(canvas);
                        _drawNavPageAnnotations(pageNo);
                        if (pageNo < _navbar.lastLoadedPage){
                            _displayNavPages(pageNo+1, callback);
                        } else {
                            _ignoreNavScrollEvent = false;
                            if (callback) {
                                callback();
                            }
                        }
                    }
                });
            } else {
                if (pageNo < _navbar.lastLoadedPage){
                    _displayNavPages(pageNo+1, callback);
                } else {
                    _ignoreNavScrollEvent = false;
                    if (callback) {
                        callback();
                    }
                }
            }
        });
    }

    function _RemovePdfSideBar (parent) {
        if (parent && _sidebarEnabled) {
            _unregisterNavAnnotationCallbacks();
            var sideBar = document.getElementById("CreoViewDocumentSidebar");
            if (sideBar) {
                parent.removeChild(sideBar);
                var currentCanvas = document.getElementById(_currentCanvasId);
                if (currentCanvas) {
                    currentCanvas.parentNode.style.marginLeft = "auto";
                }
                parent.removeEventListener("mousemove", _ResizePdfSideBar);
                parent.removeEventListener("mouseup", _ResizePdfSideBarCompleted);
                _sidebarResize = false;
            }
        }
    }

    function _RemovePdfNavigationBar (parent){
        if (_sidebarEnabled && _navbar.enabled){
            _unregisterNavAnnotationCallbacks();
            parent.removeChild(document.getElementById("CreoViewDocumentNavbar"));
        }
    }

    function _clearNavPages (navDiv) {
        if (_navbar.enabled && navDiv){
            while (navDiv.lastChild) {
                navDiv.removeChild(navDiv.lastChild);
            }
        }
    }

    function clearInvisibleNavWrappers() {
        var navWrappers = document.querySelectorAll("div[data-zoom-scale]");
        for (var i = 0; i < navWrappers.length; i++) {
            var pageNo = (i+1);
            if (pageNo < _navbar.firstLoadedPage || pageNo > _navbar.lastLoadedPage) {
                while (navWrappers[i].lastChild) {
                    navWrappers[i].removeChild(navWrappers[i].lastChild);
                }
            }
        }
    }

    function _handleNavOnScroll(navDiv) {
        if (_ignoreScrollEvent || _ignoreNavScrollEvent) {
            return;
        }

        const currentNavPage = _getCurrentNavPage(navDiv);
        if (!currentNavPage) return;

        if (!document.getElementById("PdfNavPageWrapper" + currentNavPage).firstChild ||
            ((currentNavPage - 1) < _navbar.firstLoadedPage && currentNavPage > 1) ||
            ((currentNavPage + 1) > (_navbar.lastLoadedPage - 1) && currentNavPage < (__TOTAL_PAGES - 1))) {
            _ignoreNavScrollEvent = true;
            _navbar.firstLoadedPage = Math.max(currentNavPage - _navbar.bufferSize, 1);
            _navbar.lastLoadedPage  = Math.min(currentNavPage + _navbar.bufferSize, __TOTAL_PAGES);
            _displayNavPages(_navbar.firstLoadedPage, function(){
                clearInvisibleNavWrappers();
                _ignoreNavScrollEvent = false;
            });
        }
    }

    function _getCurrentNavPage (navDiv) {
        var scrollTop = navDiv.scrollTop;
        var navWrapper1 = document.getElementById("PdfNavPageWrapper1");
        var offsetTop1 = navWrapper1.offsetTop;

        var scrollCenter = scrollTop + navDiv.clientHeight / 2;
        for (var i=1; i<=__TOTAL_PAGES; i++) {
            var navWrapper = document.getElementById("PdfNavPageWrapper" + i);

            var offsetTop = navWrapper.offsetTop - offsetTop1;
            var offsetBottom = offsetTop + navWrapper.offsetHeight + _navWrapperMargin;
            if (offsetTop <= scrollCenter && scrollCenter < offsetBottom) {
                return i;
            }
        }
    }

    function _selectNavPage(navWrapper, pageNo) {
        if (pageNo < 1 || pageNo > __TOTAL_PAGES || !navWrapper) {
            return;
        }
        if (_navbar.selectedPage > 0 && _navbar.selectedPage <= __TOTAL_PAGES) {
            document.getElementById("PdfNavPageWrapper" + _navbar.selectedPage).style.border = "none";
        }
        navWrapper.style.border = "6px solid " + _uiColors.sidebar.navBorder;
        navWrapper.style.borderRadius = "3px";
        _navbar.selectedPage = pageNo;
    }

    function _scrollNavbarToPage (navDiv, pageNo) {
        if (pageNo > __TOTAL_PAGES || pageNo < 1 || !navDiv || (pageNo == 1 && __TOTAL_PAGES == 1)) {
            return;
        }

        var navWrapper1 = document.getElementById("PdfNavPageWrapper1");
        if (!navWrapper1) return;

        var navWrapper = document.getElementById("PdfNavPageWrapper" + pageNo);
        if (!navWrapper) return;

        var scrollBottom = navDiv.scrollTop + navDiv.clientHeight;
        var offsetTop = navWrapper.offsetTop - navWrapper1.offsetTop;
        var offsetBottom = offsetTop + navWrapper.offsetHeight + 2 * _navWrapperMargin;

        if (offsetTop < navDiv.scrollTop) {
            navDiv.scrollTop = offsetTop;
        } else if (offsetBottom > scrollBottom) {
            navDiv.scrollTop += (offsetBottom - scrollBottom);
        }

        _handleNavOnScroll(navDiv);
    }

    function _togglePdfSidePane () {
        var currentCanvas = document.getElementById(_currentCanvasId);
        if (!currentCanvas){
            return;
        }
        const parentNode = document.getElementById(_parentCanvasId);
        if (!parentNode){
            return;
        }
        if (_sidebarEnabled){
            _RemovePdfSideBar(parentNode);
            if (_documentLoaded) {
                _setPageModePDF(function() {
                    if (_pdfCallback) {
                        _pdfCallback(true);
                    }
                });
            }
            _sidebarEnabled = false;
        } else {
            if (!_documentLoaded) return;
            _sidebarEnabled = true;
            var tempPageNo = __CURRENT_PAGE;
            if (_bookmarks.length <= 0) {
                _bookmarksBar.enabled = false;
                _navbar.enabled = true;
            }
            if (_navbar.enabled){
                _DisplayPdfNavigationBar(_CreateSideBar(parentNode), tempPageNo);
            } else if (_bookmarksBar.enabled){
                _DisplayPdfBookmarksBar(_CreateSideBar(parentNode));
            }
        }
    }

    function _CreateSideBar (parent) {
        if (!parent ||document.getElementById("CreoViewDocumentSidebar")) {
            return;
        }
        const sidebarDiv = document.createElement("div");
        sidebarDiv.id = "CreoViewDocumentSidebar";
        sidebarDiv.style.float = "left";
        sidebarDiv.style.width = _navSidebarWidth + "px";
        sidebarDiv.style.paddingRight = _navSidebarResizeWidth + "px";
        sidebarDiv.style.backgroundColor = _uiColors.sidebar.background;
        if (_toolbarEnabled) {
            sidebarDiv.style.height = parseInt(parent.clientHeight) - _toolbarHeight + "px";
        } else {
            sidebarDiv.style.height = "100%";
        }
        const scrollWrapper = document.getElementById(_currentCanvasId).parentNode;
        parent.insertBefore(sidebarDiv, scrollWrapper);
        scrollWrapper.style.marginLeft = _navSidebarWidth + "px";
        if (_documentLoaded) {
            _setPageModePDF(function() {
                if (_pdfCallback) {
                    _pdfCallback(true);
                }
            });
        }

        var tabsDiv = document.createElement("div");
        tabsDiv.style.width = "100%";
        tabsDiv.style.height = _toolbarHeight + "px";
        tabsDiv.style.backgroundColor = _uiColors.sidebar.background;
        tabsDiv.style.position = "relative";
        tabsDiv.style.textAlign = "left";
        _PopulateSideBarTabs(tabsDiv);
        sidebarDiv.appendChild(tabsDiv);

        sidebarDiv.addEventListener("mousemove", function (e) {
            if (!_sidebarResize) {
                const lhs = e.clientX - parent.getBoundingClientRect().left,
                      rhs = sidebarDiv.getBoundingClientRect().width - _navSidebarResizeWidth;
                if (lhs > rhs) {
                    sidebarDiv.style.cursor = "col-resize";
                } else if (sidebarDiv.style.cursor == "col-resize" && lhs <= rhs) {
                    sidebarDiv.style.cursor = "auto";
                }
            }
        });

        sidebarDiv.addEventListener("mousedown", function (e) {
            if (!_sidebarResize &&
                e.clientX - parent.getBoundingClientRect().left > sidebarDiv.getBoundingClientRect().width - _navSidebarResizeWidth) {
                parent.style.cursor = "col-resize";
                _sidebarResize = true;
            }
        });

        parent.addEventListener("mouseup", _ResizePdfSideBarCompleted);
        parent.addEventListener("mousemove", _ResizePdfSideBar);

        return sidebarDiv;
    }

    function _ResizePdfSideBarCompleted (e) {
        if (_sidebarResize) {
            e.currentTarget.style.cursor = "auto";
            const sidebarDiv = document.querySelector("#CreoViewDocumentSidebar");
            sidebarDiv.style.cursor = "auto";
            _sidebarResize = false;
            if (_navbar.enabled) {
                const navDiv = document.querySelector("#CreoViewDocumentNavbar");
                _clearNavPages(navDiv);
                _PopulatePdfNavigationBar(navDiv, _navbar.selectedPage);
            }
            if (_documentLoaded) {
                _setPageModePDF(function() {
                    if (_pdfCallback) {
                        _pdfCallback(true);
                    }
                });
            }
        }
    }

    function _ResizePdfSideBar (e) {
        if (_sidebarResize) {
            var newWidth = e.clientX - e.currentTarget.getBoundingClientRect().left;
            if (newWidth > _navSidebarWidthMin && newWidth < _navSidebarWidthMax) {
                document.querySelector("#CreoViewDocumentSidebar").style.width = newWidth + "px";
                document.querySelector("#"+_currentCanvasId).parentNode.style.marginLeft = newWidth + "px";
                _navSidebarWidth = newWidth;
            }
        }
    }

    function _PopulateSideBarTabs (tabsDiv) {
        var navbarTab = _BuildDocumentToolbarButton('/icons/pdf_nav_pane.svg', false);
        navbarTab.id = "CreoSidebarNavbarButton";
        navbarTab.style.position = "absolute";
        navbarTab.style.bottom = "6px";
        navbarTab.style.left = "6px";
        navbarTab.style.backgroundColor = "inherit";
        if (_navbar.enabled) {
            navbarTab.style.backgroundColor = _uiColors.sidebar.tab;
        }
        tabsDiv.appendChild(navbarTab);

        var bookmarksTab = _BuildDocumentToolbarButton('/icons/pdf_bookmark.svg', false);
        bookmarksTab.id = "CreoSidebarBookmarksButton";
        bookmarksTab.style.position = "absolute";
        bookmarksTab.style.bottom = "6px";
        bookmarksTab.style.left = "38px";
        bookmarksTab.style.backgroundColor = "inherit";
        if (_bookmarksBar.enabled && _bookmarks.length > 0) {
            bookmarksTab.style.backgroundColor = _uiColors.sidebar.tab;
        }
        if (_bookmarks.length <= 0) {
            bookmarksTab.style.opacity = 0.5;
            bookmarksTab.style.cursor = "auto";
        }
        tabsDiv.appendChild(bookmarksTab);

        navbarTab.addEventListener("click", function(){
            if (!_navbar.enabled) {
                navbarTab.style.backgroundColor = _uiColors.sidebar.tab;
                bookmarksTab.style.backgroundColor = _uiColors.sidebar.background;
                _RemovePdfBookmarksBar(tabsDiv.parentNode);
                _navbar.enabled = true;
                _bookmarksBar.enabled = false;
                _DisplayPdfNavigationBar(tabsDiv.parentNode, __CURRENT_PAGE);
            }
        });
        if (_bookmarks.length > 0) {
            bookmarksTab.addEventListener("click", function(){
                if (!_bookmarksBar.enabled) {
                    bookmarksTab.style.backgroundColor = _uiColors.sidebar.tab;
                    navbarTab.style.backgroundColor = _uiColors.sidebar.background;
                    _RemovePdfNavigationBar(tabsDiv.parentNode);
                    _navbar.enabled = false;
                    _bookmarksBar.enabled = true;
                    _DisplayPdfBookmarksBar(tabsDiv.parentNode);
                }
            });
        }

        navbarTab.addEventListener("mouseenter", function(){
            if (!_navbar.enabled) {
                navbarTab.style.backgroundColor = _uiColors.sidebar.tab;
            }
        });
        navbarTab.addEventListener("mouseleave", function(){
            if (!_navbar.enabled) {
                navbarTab.style.backgroundColor = _uiColors.sidebar.background;
            }
        });
        if (_bookmarks.length > 0) {
            bookmarksTab.addEventListener("mouseenter", function(){
                if (!_bookmarksBar.enabled) {
                    bookmarksTab.style.backgroundColor = _uiColors.sidebar.tab;
                }
            });
            bookmarksTab.addEventListener("mouseleave", function(){
                if (!_bookmarksBar.enabled) {
                    bookmarksTab.style.backgroundColor = _uiColors.sidebar.background;
                }
            });
        }
    }

    function _DisplayPdfBookmarksBar (parent) {
        var bookmarksDiv = document.createElement("div");
        bookmarksDiv.id = "CreoViewDocumentBookmarksBar";
        bookmarksDiv.style.backgroundColor = _uiColors.sidebar.background;
        bookmarksDiv.style.width = "100%";
        bookmarksDiv.style.overflowY = "auto";
        bookmarksDiv.style.overflowX = "hidden";
        bookmarksDiv.style.color = _uiColors.sidebar.text;
        bookmarksDiv.style.lineHeight = "30px";
        _addDocumentToolbarScrollbarStyle(bookmarksDiv.id, 15);
        bookmarksDiv.style.height = (parseInt(parent.clientHeight) - parseInt(parent.firstChild.clientHeight)) + "px";
        parent.appendChild(bookmarksDiv);
        _PopulatePdfBookmarksBar(bookmarksDiv);
    }

    function _PopulatePdfBookmarksBar (bookmarksDiv) {
        var bookmarksContent = document.createElement("div");
        bookmarksContent.id = "CreoViewDocumentBookmarksTreeWrapper";
        bookmarksContent.style.paddingTop = "5px";
        if(_bookmarks.length == 0){
            return;
        } else {
            _BuildDocumentBookmarksTree(bookmarksContent);
        }
        bookmarksDiv.appendChild(bookmarksContent);
    }

    function _BuildDocumentBookmarksTree(container) {
        const bookmarksTree = document.createElement("div");
        bookmarksTree.id = "CreoViewDocumentBookmarksTree";
        bookmarksTree.style.WebkitUserSelect = "none";
        bookmarksTree.style.msUserSelect = "none";
        bookmarksTree.style.MozUserSelect = "none";
        bookmarksTree.style.userSelect = "none";
        bookmarksTree.style.textAlign = "left";
        bookmarksTree.style.marginLeft = "0px";
        bookmarksTree.style.paddingLeft = "0px";
        for(var i = 0; i<_bookmarks.length; i++){
            _BuildDocumentBookmarksTreeContent(_bookmarks[i], bookmarksTree);
        }
        container.appendChild(bookmarksTree);
    }

    function _BuildDocumentBookmarksTreeContent(bookmark, bookmarksTree) {
        const arrowMargin = 5,
              labelMargin = 25,
              groupMargin = 16,
              childMargin = 25;

        const liElem = document.createElement("div");
        liElem.className = "CreoBookmarkElement";
        liElem.style.color = _uiColors.sidebar.text;
        liElem.style.backgroundColor = "transparent";
        liElem.style.position = "relative";
        liElem.style.display = "block";
        const highlightDiv = document.createElement("div");
        highlightDiv.style.backgroundColor = "inherit";
        highlightDiv.style.height = "30px";
        highlightDiv.style.width = "100%";
        highlightDiv.style.position = "absolute";
        highlightDiv.style.top = "0px";
        highlightDiv.style.zIndex = "1";
        liElem.appendChild(highlightDiv);
        if (bookmark.items.length == 0) {
            const spanElem = document.createElement("span");
            spanElem.textContent = bookmark.title;
            spanElem.style.cursor = "pointer";
            spanElem.style.marginLeft = childMargin + "px";
            spanElem.style.zIndex = "2";
            spanElem.style.position = "relative";
            spanElem.style.display = "block";
            spanElem.style.wordBreak = "break-word";
            spanElem.addEventListener("click", function(){
                _ShowPdfBookmark(bookmark.title);
            });
            spanElem.addEventListener("mouseenter", function(){
                highlightDiv.style.height = spanElem.clientHeight + "px";
                highlightDiv.style.backgroundColor = _uiColors.sidebar.tab;
            });
            spanElem.addEventListener("mouseleave", function(){
                highlightDiv.style.backgroundColor = "inherit";
            });
            liElem.appendChild(spanElem);
        } else {
            const caretElem = document.createElement("span");
            caretElem.style.cursor = "pointer";
            caretElem.style.zIndex = "2";
            caretElem.style.position = "absolute";
            caretElem.style.marginLeft = arrowMargin + "px";
            const caretImg = document.createElement("img");
            caretImg.src = ThingView.resourcePath + "icons/pdf_previous_find.svg";
            caretImg.style.transform = "rotate(-90deg)";
            caretImg.style.marginTop = "7px";
            caretElem.appendChild(caretImg);
            caretElem.addEventListener("click", function(){
                if(liElem.childNodes[3].style.display == "none"){
                    liElem.childNodes[3].style.display = "block";
                    caretImg.style.transform = "none";
                } else {
                    liElem.childNodes[3].style.display = "none";
                    caretImg.style.transform = "rotate(-90deg)";
                }
            });

            const spanElem = document.createElement("span");
            spanElem.style.cursor = "pointer";
            spanElem.style.marginLeft = labelMargin + "px";
            spanElem.style.zIndex = "2";
            spanElem.style.position = "relative";
            spanElem.style.display = "block";
            spanElem.style.wordBreak = "break-word";
            spanElem.textContent = bookmark.title;
            spanElem.addEventListener("click", function(){
                _ShowPdfBookmark(bookmark.title);
            });
            spanElem.addEventListener("mouseenter", function(){
                highlightDiv.style.height = spanElem.clientHeight + "px";
                highlightDiv.style.backgroundColor = _uiColors.sidebar.tab;
            });
            spanElem.addEventListener("mouseleave", function(){
                highlightDiv.style.backgroundColor = "inherit";
            });
            liElem.appendChild(caretElem);
            liElem.appendChild(spanElem);
            const ulElem = document.createElement("div");
            ulElem.style.display = "none";
            ulElem.style.marginLeft = groupMargin + "px";
            liElem.appendChild(ulElem);
            for (var i = 0; i<bookmark.items.length; i++){
                _BuildDocumentBookmarksTreeContent(bookmark.items[i], ulElem);
            }
        }
        bookmarksTree.appendChild(liElem);
    }

    function _RemovePdfBookmarksBar (parent) {
        if (_sidebarEnabled && _bookmarksBar.enabled){
            parent.removeChild(document.getElementById("CreoViewDocumentBookmarksBar"));
        }
    }

    function _BuildDocumentToolbarButton (imgURL, onLoadEvent) {
        const buttonDiv = document.createElement("div");
        buttonDiv.style.WebkitUserSelect = "none";
        buttonDiv.style.msUserSelect = "none";
        buttonDiv.style.MozUserSelect = "none";
        buttonDiv.style.userSelect = "none";
        buttonDiv.style.backgroundColor = _uiColors.toolbar.background;
        buttonDiv.style.marginTop = "6px";
        buttonDiv.style.padding = "6px";
        buttonDiv.style.cursor = "pointer";
        buttonDiv.style.display = "unset";
        buttonDiv.style.width = "16px";
        buttonDiv.style.height = "16px";
        buttonDiv.style.float = "left";
        buttonDiv.style.position = "relative";
        const buttonImage = document.createElement("img");
        if (!onLoadEvent) {
            buttonDiv.style.display = "inline-block";
            buttonDiv.style.float = "unset";
        }
        buttonImage.src = ThingView.resourcePath + imgURL;
        buttonDiv.appendChild(buttonImage);
        return buttonDiv;
    }

    function _AddToolbarButtonMouseOver (button) {
        button.addEventListener("mouseenter", function(){
            button.style.backgroundColor = _uiColors.toolbar.activeButton;
        });
        button.addEventListener("mouseleave", function(){
            button.style.backgroundColor = _uiColors.toolbar.background;
        });
    }

    // PDF ROTATE

    function _getPageRotate (page) {
        return (_pageRotation + page.rotate + 360) % 360;
    }

    function _RotateDocumentPages (clockwise) {
        var newRotation = (_pageRotation + 360 + (clockwise ? 90 : -90)) % 360;
        _getScrollCenterData(__ZOOMSCALE);
        _pageRotation = newRotation;
        _refreshPDF(function(success){
            if (success) {
                if (_sidebarEnabled && _navbar.enabled) {
                    _DisplayPdfNavigationBar(document.getElementById(_parentCanvasId), __CURRENT_PAGE);
                }
                if (_pdfCallback) {
                    _pdfCallback(success);
                }
            }
        }, {pageRotation: newRotation, clockwise});
    }

    function _checkPageRotation() {
        if (_pageRotation == 0)
            return 0;
        else if (_pageRotation == 90)
            return 1;
        else if (_pageRotation == 180)
            return 2;
        else if (_pageRotation == 270)
            return 3;
    }

    function _checkPageRotated () {
        return (_checkPageRotation() % 2 == 1);
    }

    // PDF PRINT

    function _PrintPdf (parent) {
        if (!parent || !_printEnabled || (_print && _print.running)) {
            return;
        }
        _print = {running: true};
        _preparePrintStyling();
        var printDiv = _preparePdfPrintDiv(parent);
        window.addEventListener('afterprint', _removePdfPrintDiv);
        _saveCurrentDocCursor();
        _populatePrintDiv(printDiv, null, null, 1, __TOTAL_PAGES, function() {
            document.getElementById(_currentCanvasId).style.cursor = _printDocCursor;
            window.print();
        });
    }

    function _populatePrintDiv (printDiv, width, height, firstPage, lastPage, callback) {
        _preparePrintWrapper(printDiv, width, height, firstPage, lastPage, function() {
            if (!_filterPdfMarkups && _pdfParsedAnnotationSet != null && _pdfParsedAnnotationSet.length > 0) {
                _preparePrintMarkup(0, printDiv, callback);
            } else {
                if (callback) callback();
            }
        });
    }

    function _createPrintCanvas (pageNo, width, height) {
        var canvas = null;
        if (_printPageTemplate == null) {
            canvas = document.createElement("canvas");
            canvas.className = "PdfPrintElement";

            _printPageTemplate = canvas.cloneNode(false);
        } else {
            canvas = _printPageTemplate.cloneNode(false);
        }
        canvas.id = "PdfPrintPage" + pageNo;
        canvas.width = width;
        canvas.height = height;

        return canvas;
    }

    function _createPrintWrapperCanvas (printDiv, pageNo, page, zoomScale) {
        const viewport = page.getViewport({scale: zoomScale});
        const width = parseFloat(viewport.width);
        const height = parseFloat(viewport.height);

        var printWrapper = null;
        if (_printWrapperTemplate == null) {
            printWrapper = document.createElement("div");
            printWrapper.className = "PdfPrintElement PdfPrintWrapper";
            printWrapper.style.position = "relative";

            _printWrapperTemplate = printWrapper.cloneNode(false);
        } else {
            printWrapper = _printWrapperTemplate.cloneNode(false);
        }
        printWrapper.id = "PdfPrintWrapper" + pageNo;
        printWrapper.height = height;
        printWrapper.width = width;
        printWrapper.style.height = height + "px";
        printWrapper.style.width = width + "px";
        printWrapper.dataset.zoomScale = zoomScale;

        printDiv.appendChild(printWrapper);

        const canvas = _createPrintCanvas(pageNo, width, height);
        printWrapper.appendChild(canvas);

        return {viewport, canvas};
    }

    function _getPrintPageZoomScale (page, width, height) {
        const viewport = page.getViewport({scale: 1});
        const prevWidth = parseFloat(viewport.width);
        const prevHeight = parseFloat(viewport.height);

        const pageWidth = width || prevWidth;
        const pageHeight = height || prevHeight;

        const widthZoom = Math.min(pageWidth, _maxCanvasLength) / prevWidth;
        const heightZoom = Math.min(pageHeight, _maxCanvasLength) / prevHeight;
        var zoomScale = Math.min(widthZoom, heightZoom);
        return zoomScale;
    }

    function  _preparePrintWrapper (printDiv, width, height, pageNo, lastPage, callback) {
        __PDF_DOC.getPage(pageNo).then(function(page) {
            const zoomScale = _getPrintPageZoomScale(page, width, height);
            const vs = _createPrintWrapperCanvas(printDiv, pageNo, page, zoomScale);
            const params = {
                canvasContext: vs.canvas.getContext('2d'),
                viewport: vs.viewport,
                intent: 'print'
            };
            if (_optionalContentConfig) {
                params.optionalContentConfigPromise = Promise.resolve(_optionalContentConfig);
            }
            page.render(params).promise.then(function() {
                if (pageNo >= lastPage) {
                    if (callback) {
                        callback();
                    }
                } else {
                    _preparePrintWrapper(printDiv, width, height, pageNo+1, lastPage, callback);
                }
            });
        });
    }

    function _printWatermarks (showWatermarks, firstPage, lastPage, callback) {
        if (!showWatermarks) {
            if (callback) callback();
            return;
        }
        _preparePrintWatermark(firstPage, lastPage, function () {
            if (callback) callback();
        });
    }

    function _preparePrintWatermark (pageNo, lastPage, callback) {
        _printWatermark(pageNo, function () {
            if (pageNo < lastPage) {
                _preparePrintWatermark(pageNo+1, lastPage, callback);
            } else {
                if (callback) callback();
            }
        });
    }

    function _printWatermark (pageNo, callback) {
        const pdfCanvas = document.getElementById("PdfPrintWrapper" + pageNo);
        if (!pdfCanvas || !_watermark.document.length) {
            if (callback) callback();
            return;
        }

        const width = parseFloat(pdfCanvas.width);
        const height = parseFloat(pdfCanvas.height);
        const zoomScale = Number(pdfCanvas.dataset.zoomScale);

        const canvasId = "PdfPrintWatermarkCanvas" + pageNo;
        const svgLayerId = "PdfPrintWatermarkSvgLayer" + pageNo;

        const canvas = document.createElement("div");
        canvas.setAttribute("id", canvasId);
        canvas.setAttribute("class", "PdfPrintAnnotationCanvas PdfPrintAnnotation");
        canvas.setAttribute("width", width + "px");
        canvas.setAttribute("height", height + "px");
        canvas.style.overflow = "hidden";
        canvas.style.position = "absolute";
        canvas.style.left = "0px";
        canvas.style.top = "0px";
        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
        pdfCanvas.appendChild(canvas);

        const absMarginLeft = parseInt(_watermark.global.margin.left) * _watermark.global._dpiRatio * zoomScale,
              absMarginTop = parseInt(_watermark.global.margin.top) * _watermark.global._dpiRatio * zoomScale,
              absMarginRight = parseInt(_watermark.global.margin.right) * _watermark.global._dpiRatio * zoomScale,
              absMarginBottom = parseInt(_watermark.global.margin.bottom) * _watermark.global._dpiRatio * zoomScale,
              layerWidth = width - (absMarginLeft + absMarginRight),
              layerHeight = height - (absMarginTop + absMarginBottom);

        const svgLayer = document.createElementNS(_svgNS, "svg");
        svgLayer.id = svgLayerId;
        svgLayer.classList.add("PdfPrintAnnotation");
        svgLayer.setAttribute("preserveAspectRatio", "none");
        svgLayer.setAttribute("width", layerWidth);
        svgLayer.setAttribute("height", layerHeight);
        svgLayer.style.overflow = "hidden";
        svgLayer.style.position = "absolute";
        svgLayer.style.left = absMarginLeft + "px";
        svgLayer.style.top = absMarginTop + "px";
        canvas.appendChild(svgLayer);

        _addWatermarksToLayer(svgLayer, zoomScale);

        if (callback) callback();
    }

    function _preparePrintMarkup (markupNo, printDiv, callback) {
        _displayPrintMarkup (_pdfParsedAnnotationSet[markupNo], printDiv);
        if (markupNo < _pdfParsedAnnotationSet.length-1) {
            _preparePrintMarkup(markupNo+1, printDiv, callback);
        } else {
            if (callback) {
                callback();
            }
        }
    }

    function _displayPrintMarkup (annotation, printDiv) {
        if (!annotation || !annotation.visible) return;

        const pageNo = annotation.pageNo + 1;
        const pdfCanvas = document.getElementById("PdfPrintWrapper" + pageNo);
        if (!pdfCanvas) return;

        const zoomScale = Number(pdfCanvas.dataset.zoomScale);
        const canvasId = "PdfPrintAnnotationCanvas" + pageNo;
        const svgLayerId = "PdfPrintAnnotationSvgLayer" + pageNo;
        var canvas = document.getElementById(canvasId);
        var svgLayer = document.getElementById(svgLayerId);
        if(!canvas || canvas.parentNode.parentNode != printDiv){
            const width = parseFloat(pdfCanvas.width);
            const height = parseFloat(pdfCanvas.height);
            if (_printMarkupTemplate == null) {
                canvas = document.createElement("div");
                canvas.setAttribute('id', canvasId);
                canvas.setAttribute('class', "PdfPrintAnnotationCanvas PdfPrintAnnotation");
                canvas.setAttribute('width', width + "px");
                canvas.setAttribute('height', height + "px");
                canvas.style.position = "absolute";
                canvas.style.top = "0px";
                canvas.style.left = "0px";
                canvas.style.zIndex = _zIndex.markupPrint;

                _printMarkupTemplate = canvas.cloneNode(false);
            } else {
                canvas = _printMarkupTemplate.cloneNode(false);

                canvas.id = canvasId;
                canvas.width = width + "px";
                canvas.height = height + "px";
            }
            canvas.style.height = height + "px";
            canvas.style.width = width + "px";

            pdfCanvas.insertBefore(canvas, pdfCanvas.firstChild);

            svgLayer = document.createElementNS(_svgNS, "svg");
            svgLayer.id = svgLayerId;
            svgLayer.classList.add("PdfPrintAnnotation");
            svgLayer.setAttribute("preserveAspectRatio", "none");
            svgLayer.setAttribute("width", width);
            svgLayer.setAttribute("height", height);
            svgLayer.style.zIndex = _zIndex.markupPrint;
            svgLayer.style.position = "absolute";
            svgLayer.style.left = "0px";
            svgLayer.style.top = "0px";
            canvas.appendChild(svgLayer);

            const defs = document.createElementNS(_svgNS, "defs");
            svgLayer.appendChild(defs);
        }
        switch (annotation.type) {
            case _markupTypes.leaderLine:
            case _markupTypes.polyline:
                _displayPdfLeaderLine(annotation, svgLayer, true, zoomScale);
                break;
            case _markupTypes.rectangle:
            case _markupTypes.rectangleFilled:
                _displayPdfRectangle(annotation, svgLayer, true, zoomScale);
                break;
            case _markupTypes.ellipse:
            case _markupTypes.ellipseFilled:
                _displayPdfCircle(annotation, svgLayer, true, zoomScale);
                break;
            case _markupTypes.polygon:
            case _markupTypes.polygonFilled:
                _displayPdfPolygon(annotation, svgLayer, true, zoomScale);
                break;
            case _markupTypes.freehand:
                _displayPdfFreehand(annotation, svgLayer, true, zoomScale);
                break;
            case _markupTypes.textStrikethrough:
            case _markupTypes.textUnderline:
                _displayPdfStrikeThrough(annotation, svgLayer, true, zoomScale);
                break;
            case _markupTypes.textHighlight:
                _displayPdfHighlight(annotation, svgLayer, true, zoomScale);
                break;
            case _markupTypes.note:
            case _markupTypes.noteLeader:
                _displayPdfNote(annotation, svgLayer, true, zoomScale);
                break;
            case _markupTypes.stamp:
                _displayPdfStamp(annotation, svgLayer, true, zoomScale);
                break;
            default:
                console.log("Annotation type not supported");
                break;
        }
    }

    const printCSSStyle = "@media print{ body :not(.PdfPrintElement){ display: none} .PdfPrintElement{width: 100% !important; border: none !important; padding: 0px !important; margin: 0px !important; visibility: visible !important} .PdfPrintAnnotationCanvas{transform: scale(1.01, 1.015) !important; margin: 1% auto auto 0.5% !important; visibility: visible !important} .PdfPrintElement, .PdfPrintAnnotation{height: 100% !important; overflow: visible !important; box-shadow: none !important; display: block !important; visibility: visible !important} .PdfPrintAnnotationStamp, .PdfPrintAnnotationNote {display: block !important} @page{ margin: 0px} *{ float: none !important}}";
    function _preparePrintStyling () {
        //We don't need to remove a users @media print styling because the rules of precedence say the last in wins
        var newStyle = printCSSStyle;
        if (!document.querySelector("style")) {
            var style = document.createElement("style");
            style.textContent = newStyle;
            document.getElementsByTagName('head')[0].appendChild(style);
        } else {
            document.querySelector("style").textContent += newStyle;
        }
    }

    function _removePrintStyling () {
        document.querySelector("style").textContent = document.querySelector("style").textContent.replace(printCSSStyle, "");
    }

    function _addPdfPrintClass (element) {
        element.classList.add("PdfPrintElement");
        if (element.parentNode && element.parentNode != document.body) {
            _addPdfPrintClass(element.parentNode);
        }
    }

    function _saveCurrentDocCursor() {
        _printDocCursor = document.getElementById(_currentCanvasId).style.cursor != "" ? document.getElementById(_currentCanvasId).style.cursor : "auto";
        document.getElementById(_currentCanvasId).style.cursor = "wait";
    }

    function _removePdfPrintDiv () {
        window.removeEventListener("afterprint", _removePdfPrintDiv);
        if (!_printEnabled || !_print || !_print.running) {
            return;
        }
        _print = null;
        _removePrintStyling();
        var printDiv = document.getElementById("PdfPrintDiv");
        printDiv.parentNode.removeChild(printDiv);
    }

    //PDF PRINT BUFFERS

    function _checkPrefetchedPageValid (pageNo, width, height, showWatermarks) {
        if (_prefetchedPage &&
            _prefetchedPage.pageNo == pageNo &&
            (_prefetchedPage.width >= width || _prefetchedPage.height >= height) &&
            _prefetchedPage.showWatermarks == showWatermarks) {
            return true;
        }
        return false;
    }

    function _GetPdfPrintBuffers (parent, firstPage, lastPage, width, height, showWatermarks, callback) {
        if (!parent || !_printEnabled) return;

        if (_print && _print.running) {
            if (firstPage == lastPage) {
                _printCallback = {
                    pageNo: firstPage,
                    width: width,
                    height: height,
                    showWatermarks: showWatermarks,
                    callback: callback
                };
            }
            return;
        }
        if (firstPage == lastPage && _checkPrefetchedPageValid(firstPage, width, height, showWatermarks)) {
            if (callback) callback([_prefetchedPage]);
            _prefetchedPage = null;
            _getPrintBuffers(parent, firstPage+1, firstPage+1, width, height, showWatermarks, true);
        } else {
            _getPrintBuffers(parent, firstPage, lastPage, width, height, showWatermarks, false, callback, function() {
                _getPrintBuffers(parent, firstPage+1, firstPage+1, width, height, showWatermarks, true);
            });
        }
    }

    function _preparePdfPrintDiv(parent) {
        var printDiv = null;
        if (_printDivTemplate == null) {
            printDiv = document.createElement("div");
            printDiv.id = "PdfPrintDiv";
            printDiv.className = "PdfPrintElement";
            printDiv.style.visibility = "hidden";

            _printDivTemplate = printDiv.cloneNode(false);
        } else {
            printDiv = _printDivTemplate.cloneNode(false);
        }
        parent.appendChild(printDiv);

        return printDiv;
    }

    function _checkPrintCallback(parent) {
        if (_printCallback) {
            if (_printCallback.pageNo == _prefetchedPage.pageNo) {
                if (_printCallback.callback) _printCallback.callback([_prefetchedPage]);
                const nextPageNo = _prefetchedPage.pageNo+1;
                const width = _printCallback.width;
                const height = _printCallback.height;
                const showWatermarks = _printCallback.showWatermarks;
                _prefetchedPage = null;
                _printCallback = null;

                _getPrintBuffers(parent, nextPageNo, nextPageNo, width, height, showWatermarks, true);
            } else {
                _prefetchedPage = null;
                _GetPdfPrintBuffers(
                    parent,
                    _printCallback.pageNo, _printCallback.pageNo,
                    _printCallback.width, _printCallback.height,
                    _printCallback.showWatermarks, _printCallback.callback
                );
            }
        }
    }

    function _getPrintBuffers(parent, firstPage, lastPage, width, height, showWatermarks, prefetch, pdfCallback, callback) {
        if (prefetch && (firstPage > __TOTAL_PAGES)) {
            return;
        }

        _print = {running: true};
        _preparePrintStyling();
        _saveCurrentDocCursor();
        _populatePrintDiv(_preparePdfPrintDiv(parent), width, height, firstPage, lastPage, function() {
            _printWatermarks(showWatermarks, firstPage, lastPage, function () {
                var bufferArray = [];
                _generatePdfPrintBuffers(firstPage, lastPage, bufferArray, function() {
                    if (prefetch) {
                        _prefetchedPage = bufferArray[0];
                        _prefetchedPage.showWatermarks = showWatermarks;
                        _getPdfPrintBuffersCallback();
                        _checkPrintCallback(parent);
                    } else {
                        _getPdfPrintBuffersCallback(bufferArray, pdfCallback);
                        if (callback) callback();
                    }
                });
            });
        });
    }

    function _handleNextPrintPage(pageNo, lastPage, result, callback) {
        if (pageNo >= lastPage) {
            if (callback) {
                callback();
            }
        } else {
            _generatePdfPrintBuffers(pageNo+1, lastPage, result, callback);
        }
    }

    function _generatePdfPrintBuffers(pageNo, lastPage, result, callback) {
        const printPage = document.getElementById("PdfPrintPage" + pageNo);
        if (printPage) {
            const svgArray = [];
            const markupSvg = printPage.parentNode.querySelector("#PdfPrintAnnotationSvgLayer" + pageNo);
            if (markupSvg) {
                svgArray.push(markupSvg);
            }
            const watermarkSvg = printPage.parentNode.querySelector("#PdfPrintWatermarkSvgLayer" + pageNo);
            if (watermarkSvg) {
                if (_watermark.global.style.wmprintfirst === "true") {
                    svgArray.unshift(watermarkSvg);
                } else {
                    svgArray.push(watermarkSvg);
                }
            }
            if (svgArray.length) {
                _drawSvgImages(svgArray, printPage, function() {
                    result.push(_getPdfPageBufferFromContext(printPage));
                    _handleNextPrintPage(pageNo, lastPage, result, callback);
                });
            } else {
                result.push(_getPdfPageBufferFromContext(printPage));
                _handleNextPrintPage(pageNo, lastPage, result, callback);
            }
        } else {
            _handleNextPrintPage(pageNo, lastPage, result, callback);
        }
    }

    function _drawSvgImages (list, printPage, callback) {
        const svgImage = list.shift();
        if (svgImage) {
            _drawSvgImage(svgImage, printPage, function () {
                _drawSvgImages(list, printPage, callback);
            });
        } else {
            if (callback) callback();
        }
    }

    function _drawSvgImage (svgLayer, canvas, callback) {
        const loadSvgImage = function (svg, promises) {
            const promise = new Promise(function (resolve, reject) {
                let image = new Image();
                let svgXml = new XMLSerializer().serializeToString(svg);
                image.onload = function () {
                    let ctx = canvas.getContext("2d");
                    ctx.drawImage(this, 0, 0);
                    resolve();
                };
                image.onerror = function () {
                    reject();
                };
                image.src = "data:image/svg+xml;base64," + window.btoa(unescape(encodeURIComponent(svgXml)));
            });
            promises.push(promise);
        };

        const promiseArray = [];
        loadSvgImage(svgLayer, promiseArray);
        Promise.all(promiseArray)
        .then(function () {
            if (callback) callback();
        })
        .catch(function () {
            if (callback) callback();
        });
    }

    function _getPdfPageBufferFromContext (printPage) {
        return {
            width:  parseInt(printPage.width),
            height: parseInt(printPage.height),
            pageNo: parseInt(printPage.id.substring("PdfPrintPage".length)),
            png:    printPage.toDataURL()
        };
    }

    function _getPdfPrintBuffersCallback (bufferArray, callback) {
        _removePdfPrintDiv();
        if (_currentCanvasId != "") {
            document.getElementById(_currentCanvasId).style.cursor = _printDocCursor;
        }
        if (callback) {
            callback(bufferArray);
            if (_printCallback) _printCallback = null;
        }
    }

    // MISC

    function _handleBrowserResize () {
        if (!_documentLoaded) return;

        if(_toolbarEnabled){
            _resizeDocumentToolbar(document.getElementById(_parentCanvasId), _toolbarGroups);
        }
        _adjustWrapperSize();
    }

     // PDF MARKUPS

    function _LoadPdfAnnotationSet(documentViewable, parentCanvasId, docScene, structure, annoSet, isWindowless, documentCallback) {
        _ignoreScrollEvent = true;
        _pdfAnnotationId = -1;
        _pdfParsedAnnotationSet = [];
        _markupMode.selectedAnnotations = [];
        _markupMode.hiddenSelectedAnnotations = [];
        _markupHistory.reset();
        docScene.LoadPdf(documentViewable.idPath, documentViewable.index, structure, function(success) {
            if (!success) {
                if (documentCallback) {
                    documentCallback();
                }
                return;
            }
            docScene.GetPdfBuffer(function(buffer){
                _resetPdfAnnotationSet();
                _parsePdfRawAnnotationSet(annoSet);

                _LoadPdfDocument(parentCanvasId, buffer, false, null, isWindowless, function(){
                    _ignoreScrollEvent = false;
                    if (documentCallback) {
                        documentCallback();
                    }
                    if (_markupObserver) {
                        _markupObserver.set("annoSetLoaded", _deepCopyParsedAnnotationSet(_pdfParsedAnnotationSet));
                    }
            
                });
            });
        });
    }

    function _resetPdfAnnotationSet () {
        _pdfAnnotationSetLayerState.reset();
        _pdfAnnotationSetCurrentPage = 0;
        _pdfParsedAnnotationSet = [];
        _pdfAnnotationId = -1;
        _pageAnnoSetList = {};
        _removeDynamicMarkupCanvas();
    }

    function _ApplyPdfAnnotationSet(annoSet, documentCallback, clearExisting) {
        if (clearExisting === false) {
            returnObj.SetMarkupModePDF(null);
            _clearPdfAnnoSelection();
            _pdfAnnotationSetLayerState.reset();
            _pdfAnnotationSetCurrentPage = 0;
            _removeDynamicMarkupCanvas();
        } else {
            _resetPdfAnnotationSet();
            _markupHistory.reset();
            _markupMode.selectedAnnotations = [];
            _markupMode.hiddenSelectedAnnotations = [];
        }
        _processPdfAnnotationSet(annoSet, documentCallback, clearExisting);
    }

    function _loadAnnoSetCurrentPage (callback) {
        if (_pdfAnnotationSetCurrentPage === 0) {
            callback();
        } else {
            _LoadPage(callback, _pdfAnnotationSetCurrentPage);
        }
    }

    function _processPdfAnnotationSet(annoSet, callback, clearExisting) {
        if (!annoSet) {
            return;
        }

        const existing = [];
        if (clearExisting === false) {
            for (const anno of _pdfParsedAnnotationSet) {
                if (!anno) continue;
                existing.push(_deepCloneObject(anno));
                if (anno.visible != false) {
                    _markupObserver.set("annoVisChanged", anno.id, false);
                }
                anno.visible = false;
            }
        }
        const added = _parsePdfRawAnnotationSet(annoSet);
        _loadAnnoSetCurrentPage(function () {
            _getOptionalContentConfig(true, function () {
                _displayPdfAnnotations(_pdfParsedAnnotationSet);
                _ignoreScrollEvent = false;
                if (callback) {
                    callback();
                }
                if (clearExisting === false) {
                    if (_markupObserver) _markupObserver.set("annoSetLoaded", _deepCopyParsedAnnotationSet(added));
                    const annos = [];
                    added.forEach(function (anno) {
                        annos.push(_deepCloneObject(anno));
                    });
                    _pushActionToMarkupHistory(_undoPresets.applyToView, [existing, annos]);
                    _markupObserver.set("annoSetEdited");
                } else {
                    if (_markupObserver) _markupObserver.set("annoSetLoaded", _deepCopyParsedAnnotationSet(_pdfParsedAnnotationSet));
                }
            });
        });
    }

    function _deepCopyParsedAnnotationSet (annoSet) {
        const copySet = [];
        for (const anno of annoSet) {
            if (anno) {
                var copyAnno = {};
                copyAnno.id = anno.id;
                copyAnno.type = anno.type;
                copyAnno.visible = anno.visible;
                copyAnno.isNew = anno.isNew;
                copySet.push(copyAnno);
            } else {
                copySet.push(null);
            }
        }
        return copySet;
    }

    function _displayPdfAnnotations(annoSet) {
        const wrappers = document.querySelectorAll(".PdfPageDisplayWrapper");
        for (const wrapper of wrappers) {
            const canvas = wrapper.querySelector(".PdfAnnotationCanvas");
            if (canvas) {
                wrapper.removeChild(canvas);
            }
        }
        for (const annoset of annoSet) {
            _displayPdfAnnotation(annoset);
        }

        const deletableMarkups = document.getElementsByClassName("PdfAnnotationElementSel");
        for (const m of deletableMarkups) {
            _addMarkupSelectEvents(m);
        }
        const parent = document.getElementById(_parentCanvasId);
        parent.addEventListener("mousedown", _checkDeselectPdfAnnotation);
        document.getElementById(_parentCanvasId).addEventListener("keydown", _deletePdfAnnotationEvent);
    }

    function _checkElementHasClassName(element, classNames) {
        if (typeof element.className == "object") { // svg
            if (element.className.baseVal) {
                for (let name of classNames) {
                    if (element.className.baseVal.indexOf(name) > -1) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Add the events needed to move a markup
     * Should not be called for any markups which should not be moved via mouse / touch drag (text decoration)
     * @param {HTMLElement} markup The markup requiring the events
     * @private
     * @memberof ThingView
     **/
    function _addMarkupMoveEvents (markup) {
        markup.addEventListener("mousedown", _handleMovePdfAnnoEvent);
        markup.addEventListener("mouseleave", _handleMovePdfAnnoEvent);
        markup.addEventListener("mouseenter", _handleMovePdfAnnoEvent);
        const svgElem = markup.closest("svg");
        if (svgElem) {
            svgElem.addEventListener("mouseup", _handleMovePdfAnnoEvent);
            svgElem.addEventListener("mousemove", _handleMovePdfAnnoEvent);
        }
    }

    /**
     * Remove the events needed to move a markup
     * Should not be called for any markups which should not be moved via mouse / touch drag (text decoration)
     * @param {HTMLElement} markup The markup requiring the events
     * @private
     * @memberof ThingView
     **/
    function _removeMarkupMoveEvents (markup) {
        const anno = _getParsedAnnotation(markup);
        if (anno.type == _markupTypes.textHighlight ||
            anno.type == _markupTypes.textStrikethrough ||
            anno.type == _markupTypes.textUnderline) {
            return;
        }
        const proxyEvent = new Event("mouseup");
        const svgElem = markup.closest("svg");
        if (svgElem) {
            svgElem.dispatchEvent(proxyEvent);
            svgElem.removeEventListener("mouseup", _handleMovePdfAnnoEvent);
            svgElem.removeEventListener("mousemove", _handleMovePdfAnnoEvent);
        }
    }

    function _addMarkupSelectEvents (markup) {
        const group = markup.closest(".PdfAnnotationGroup");
        if (group) {
            group.addEventListener("mouseup", _handleSelectPdfAnnoEvent);
        }
    }

    function _deletePdfAnnotationEvent (e) {
        if(e.key == "Delete") {
            _deleteSelectedPdfAnnotations();
        }
    }

    function _getAnnotationCanvasTransform(width, height) {
        const rot = _checkPageRotation();
        const diff = (width - height) / 2;
        if (rot == 1) {
            // 90 deg
            return "rotate(90deg) translate(" + diff + "px," + diff + "px)";
        } else if (rot == 2) {
            // 180 deg
            return "rotate(180deg)";
        } else if (rot == 3) {
            // 270 deg
            return "rotate(270deg) translate(" + (-diff) + "px," + (-diff) + "px)";
        } else {
            // 0 deg
            return 'unset';
        }
    }

    function _displayPdfAnnotation (annotation) {
        if (!annotation || !annotation.visible) {
            return;
        }
        const pageNo = annotation.pageNo + 1;
        const canvasId = "PdfAnnotationCanvas" + pageNo;
        const svgLayerId = "PdfAnnotationSvgLayer" + pageNo;
        const canvasWrapper = document.getElementById(_currentCanvasId);
        var canvas = document.getElementById(canvasId);
        var svgLayer = document.getElementById(svgLayerId);
        if (!canvas || canvas.parentNode.parentNode != canvasWrapper){
            const pdfCanvas = document.getElementById("PdfPageDisplayWrapper" + pageNo);
            const width = _checkPageRotation()%2==1 ? parseFloat(pdfCanvas.height) : parseFloat(pdfCanvas.width);
            const height = _checkPageRotation()%2==1 ? parseFloat(pdfCanvas.width) : parseFloat(pdfCanvas.height);
            if (width <= 0 || height <= 0)
                return;
            if (_annotationTemplate == null) {
                canvas = document.createElement("div");
                canvas.setAttribute('class', "PdfAnnotationCanvas");
                canvas.style.position = "absolute";
                canvas.style.top = "0px";
                canvas.style.left = "0px";
                canvas.style.zIndex = _zIndex.markup;

                _annotationTemplate = canvas.cloneNode(false);
            } else {
                canvas = _annotationTemplate.cloneNode(false);
            }
            canvas.style.transform = _getAnnotationCanvasTransform(width, height);
            canvas.setAttribute('width', width + "px");
            canvas.setAttribute('height', height + "px");
            canvas.style.width = width + "px";
            canvas.style.height = height + "px";
            canvas.id = canvasId;

            if (_filterPdfMarkups) {
                canvas.style.visibility = "hidden";
            }
            pdfCanvas.insertBefore(canvas, pdfCanvas.firstChild);

            svgLayer = document.createElementNS(_svgNS, "svg");
            svgLayer.id = svgLayerId;
            svgLayer.setAttribute("width", width);
            svgLayer.setAttribute("height", height);
            svgLayer.style.zIndex = _zIndex.markup;
            svgLayer.style.position = "absolute";
            svgLayer.style.left = "0px";
            svgLayer.style.top = "0px";
            canvas.appendChild(svgLayer);

            const defs = document.createElementNS(_svgNS, "defs");
            svgLayer.appendChild(defs);
        }
        switch (annotation.type) {
            case _markupTypes.leaderLine:
            case _markupTypes.polyline:
                _displayPdfLeaderLine(annotation, svgLayer, false, __ZOOMSCALE);
                break;
            case _markupTypes.rectangle:
            case _markupTypes.rectangleFilled:
                _displayPdfRectangle(annotation, svgLayer, false, __ZOOMSCALE);
                break;
            case _markupTypes.ellipse:
            case _markupTypes.ellipseFilled:
                _displayPdfCircle(annotation, svgLayer, false, __ZOOMSCALE);
                break;
            case _markupTypes.polygon:
            case _markupTypes.polygonFilled:
                _displayPdfPolygon(annotation, svgLayer, false, __ZOOMSCALE);
                break;
            case _markupTypes.freehand:
                _displayPdfFreehand(annotation, svgLayer, false, __ZOOMSCALE);
                break;
            case _markupTypes.textStrikethrough:
            case _markupTypes.textUnderline:
                _displayPdfStrikeThrough(annotation, svgLayer, false, __ZOOMSCALE);
                break;
            case _markupTypes.textHighlight:
                _displayPdfHighlight(annotation, svgLayer, false, __ZOOMSCALE);
                break;
            case _markupTypes.note:
            case _markupTypes.noteLeader:
                _displayPdfNote(annotation, svgLayer, false, __ZOOMSCALE);
                break;
            case _markupTypes.stamp:
                _displayPdfStamp(annotation, svgLayer, false, __ZOOMSCALE);
                break;
            default:
                console.log("Annotation type not supported");
                break;
        }
    }

    function _parsePdfRawAnnotationSet(annoSet) {
        const added = [];
        for (let i = 0; i < annoSet.length; i++) {
            const annotation = _parsePdfRawAnnotation(annoSet[i]);
            if (annotation) {
                _pdfParsedAnnotationSet.push(annotation);
                added.push(annotation);
                const pageNo = Number(annotation.pageNo+1);
                _addAnnoIdToPage(pageNo, _pdfParsedAnnotationSet.length-1);
            }
        }
        return added;
    }

    function _parsePdfRawAnnotation(rawAnno){
        var annotation = _parsePdfRawAnno(rawAnno);
        if (!annotation) return null;
        switch (rawAnno.type){
            case "LeaderLine":    annotation.type = _markupTypes.leaderLine; break;
            case "PolyLine":      annotation.type = _markupTypes.polyline;   break;
            case "Rectangle":     annotation.type = annotation.filled ? _markupTypes.rectangleFilled : _markupTypes.rectangle; break;
            case "Circle":        annotation.type = annotation.filled ? _markupTypes.ellipseFilled   : _markupTypes.ellipse;   break;
            case "Polygon":       annotation.type = annotation.filled ? _markupTypes.polygonFilled   : _markupTypes.polygon;   break;
            case "Freehand":      annotation.type = _markupTypes.freehand;          break;
            case "StrikeThrough": annotation.type = _markupTypes.textStrikethrough; break;
            case "Underline":     annotation.type = _markupTypes.textUnderline;     break;
            case "Highlight":     annotation.type = _markupTypes.textHighlight;     break;
            case "Stamp":         annotation.type = _markupTypes.stamp;             break;
            case "Note":
                annotation.type = annotation.leaderLineVertices.length > 0 ? _markupTypes.noteLeader : _markupTypes.note;
                annotation.fontColor = _parseRGBA(annotation.fontColor);
                _updateFontFamily(annotation);
                break;
            default:
                console.log("Annotation type not supported");
                return null;
        }
        return annotation;
    }

    /**
     * If font style (normal | italic | oblique) is detected in font family,
     * move it to font style property of annotation
     * i.e. If font family is "italic 'Monotype Corsiva',monospace",
     * move italic to font style,
     * so font family is now "'Monotype Corsiva',monospace"
     * and font style is "italic"
     * @param {any} annotation Markup annotation object
     */
    function _updateFontFamily(annotation) {
        let fontStyle = '';
        /**
         * Return false when str is empty or is 'normal', 'italic' or 'oblique'
         * @param {string} str string to filter
         * @returns {boolean}
         */
        const fontFilter = function (str) {
            if (!str) return false;
            if (str == 'normal' || str == 'italic' || str == 'oblique') {
                fontStyle = str;
                return false;
            }
            return true;
        };

        /**
         * Trim string and
         * if a space is detected, wrap the string with single quotes
         * @param {string} str string to trim
         * @returns {string} Trimmed and wrapped string
         */
        const fontMapper = function (str) {
            let string = str.trim();
            if (string.includes(' ')) {
                string = `'${string}'`;
            }
            return string;
        };

        /** @type {string[]} */
        const strs = annotation.fontFamily.split(",");
        for (let i = 0; i < strs.length; i++) {
            strs[i] = strs[i]
                .split("'")
                .map(fontMapper)
                .filter(fontFilter)
                .join(",");
        }
        annotation.fontFamily = strs.join(",");
        if (fontStyle) {
            annotation.fontStyle = fontStyle;
        }
    }

    function _getCorrectedBoundingBox(vertices, canvas, zoomScale){
        var arrX = [], arrY = [];
        for (var i=0;i<vertices.length;i++) {
            if (i%2 == 0) arrX.push(vertices[i]);
            else arrY.push(vertices[i]);
        }
        const canvasHeight = parseInt(canvas.style.height || canvas.getAttribute("height"));
        var box = {
            x1: Math.min.apply(Math, arrX) * zoomScale,
            x2: Math.max.apply(Math, arrX) * zoomScale,
            y1: canvasHeight - Math.max.apply(Math, arrY) * zoomScale,
            y2: canvasHeight - Math.min.apply(Math, arrY) * zoomScale
        };
        return box;
    }

    function _parsePdfRawAnno (rawAnno) {
        const annotation = JSON.parse(rawAnno.data);
        if (rawAnno.pageNo == -1) {
            switch (rawAnno.type) {
                case "LayerState":
                    _pdfAnnotationSetLayerState.cur = annotation;
                    break;
                case "CurrentPage":
                    if (annotation.pageNo) {
                        _pdfAnnotationSetCurrentPage = Number(annotation.pageNo);
                    }
                    break;
                default:
                    break;
            }
        } else {
            annotation.id = _getNextPdfAnnotationId();
            annotation.pageNo = rawAnno.pageNo;
            annotation.visible = !annotation.flags.hidden;
            annotation.isNew = false;
            return annotation;
        }
    }

    function _getColorRGB (color) {
        return "rgb(" + parseInt(255 * color[0]) + "," + parseInt(255 * color[1]) + "," + parseInt(255 * color[2]) + ")";
    }

    function _getColorHex (color) {
        var r = parseInt(255 * color[0]).toString(16);
        var g = parseInt(255 * color[1]).toString(16);
        var b = parseInt(255 * color[2]).toString(16);

        if (r.length == 1)
            r = "0" + r;
        if (g.length == 1)
            g = "0" + g;
        if (b.length == 1)
            b = "0" + b;

        return "#" + r + g + b;
    }

    function _getStrokeDash (borderStyle, shape, valueOnly) {
        var strokeDash = "";
        if (borderStyle &&
            borderStyle.style == 'D' &&
            borderStyle.pattern.length) {
            strokeDash = (valueOnly === true ? "" : "stroke-dasharray:");
            for (let i=0;i<borderStyle.pattern.length;i++) {
                if (!shape)
                    strokeDash += borderStyle.pattern[i] * 2 * __ZOOMSCALE * (borderStyle.width * 0.7);
                else
                    strokeDash += borderStyle.pattern[i] * __ZOOMSCALE;
                strokeDash += ' ';
            }
            strokeDash = strokeDash.trim();
            strokeDash += (valueOnly === true ? "" : ";");
        }
        return strokeDash;
    }

    function _createSvgMarker (id, type, color, fill, print) {
        // marker
        const marker = document.createElementNS(_svgNS, "marker");
        marker.setAttribute("id", id);
        if (print) {
            marker.classList.add("PdfPrintAnnotation");
        }

        const attrs = _svgMarkerPresets[type];
        if (attrs.viewBox) marker.setAttribute("viewBox", attrs.viewBox);
        marker.setAttribute("markerWidth", attrs.width);
        marker.setAttribute("markerHeight", attrs.height);
        marker.setAttribute("refX", attrs.refX);
        marker.setAttribute("refY", attrs.refY);
        marker.setAttribute("orient", "auto");

        // path or circle
        const poc = document.createElementNS(_svgNS, type.indexOf("Circle") == -1 ? "path" : "circle");
        if (print) {
            poc.classList.add("PdfPrintAnnotation");
        }

        switch (type) {
            case "ClosedArrowHead":
            case "ClosedArrowTail":
                poc.style.fill = poc.style.stroke = color;
                poc.setAttribute("d", attrs.pathD);
                break;
            case "ClosedArrowNote":
                poc.style.fill = fill;
                poc.style.stroke = color;
                poc.setAttribute("d", attrs.pathD);
                break;
            case "OpenArrow":
            case "OpenArrowNote":
                poc.style.fill = _uiColors.markup.transparent;
                poc.style.stroke = color;
                poc.setAttribute("d", attrs.pathD);
                break;
            case "Circle":
                poc.style.fill = color;
                poc.setAttribute("cx", attrs.cx);
                poc.setAttribute("cy", attrs.cy);
                poc.setAttribute("r", attrs.cr);
                break;
            case "CircleNote":
                poc.style.fill = fill;
                poc.style.stroke = color;
                poc.setAttribute("cx", attrs.cx);
                poc.setAttribute("cy", attrs.cy);
                poc.setAttribute("r", attrs.cr);
                break;
        }

        marker.appendChild(poc);

        return marker;
    }

    function _addSvgMarker (canvas, annotation, isHead, isNote, print) {
        const defs = canvas.querySelector("defs");
        if (!defs) return null;

        var type = (isHead === true ? annotation.head : annotation.tail) + (isNote === true ? "Note" : "");
        const color = annotation.color != undefined ? _getColorHex(annotation.color) : _getColorHex(annotation.outlineColor);
        const fill = annotation.fillColor != undefined ? _getColorHex(annotation.fillColor) : _uiColors.markup.white;
        const id = "marker-" + type + (isHead ? "Head" : "Tail") + "-" + color.substring(1) + fill.substring(1);
        const url = "url(#" + id + ")";

        if (defs.querySelector("#" + id)) return url;

        if (type == "ClosedArrow") {
            type += (isHead ? "Head" : "Tail") ;
        }
        const marker = _createSvgMarker(id, type, color, fill, print);

        defs.appendChild(marker);

        return url;
    }

    // Displays
    function _displayPdfLeaderLine (annotation, svgLayer, printElement, zoomScale, sideBar) {
        // group
        const g = document.createElementNS(_svgNS, "g");
        if (sideBar !== true) {
            g.dataset.annoid = annotation.id;
            g.dataset.selected = "false";

            g.classList.add("PdfAnnotationGroup");
        }
        if (printElement) {
            g.classList.add("PdfPrintAnnotation");
        }

        // polyline
        const polyline = document.createElementNS(_svgNS, "polyline");
        if (sideBar !== true) {
            polyline.id = "PdfAnnotationElement" + annotation.id;
            polyline.classList.add("PdfAnnotationElement");
        }
        if (printElement) {
            polyline.classList.add("PdfPrintAnnotation");
        }
        var width = 1;
        if (annotation.borderStyle) {
            width = annotation.borderStyle.width;
        }
        const canvasHeight = parseInt(svgLayer.style.height || svgLayer.getAttribute("height"));
        polyline.setAttribute("points", _createPolyPointPath(annotation.vertices, canvasHeight, zoomScale));
        polyline.style.fill = "none";
        polyline.style.stroke = _getColorRGB(annotation.color);
        polyline.style.strokeWidth = 1.5 * zoomScale * width;
        var strokeDash = _getStrokeDash(annotation.borderStyle, false, true);
        if (strokeDash.length) {
            polyline.style.strokeDasharray = strokeDash;
        }

        // defs
        if (annotation.head != "None") {
            const markerStartUrl = _addSvgMarker(svgLayer, annotation, true, false, printElement);
            if (markerStartUrl) {
                polyline.setAttribute("marker-start", markerStartUrl);
            }
        }
        if (annotation.tail != "None") {
            const markerEndUrl = _addSvgMarker(svgLayer, annotation, false, false, printElement);
            if (markerEndUrl) {
                polyline.setAttribute("marker-end", markerEndUrl);
            }
        }
        g.appendChild(polyline);

        // selector box
        if (!printElement && !_markupMode.on) {
            const selectorBox = _buildPolyLineSelectorBox(annotation.vertices, width, svgLayer, annotation.id, sideBar);
            g.appendChild(selectorBox);
        }

        svgLayer.appendChild(g);
    }

    function _applyRectangleDifferences (box, diffs, zoomScale) {
        if (diffs) {
            box.x1 = box.x1 + diffs[0] * zoomScale;
            box.y1 = box.y1 + diffs[1] * zoomScale;
            box.x2 = box.x2 - diffs[2] * zoomScale;
            box.y2 = box.y2 - diffs[3] * zoomScale;
        }
    }

    function _setShapeStyle (shape, annotation, zoomScale) {
        var width = 1.0;
        if (annotation.borderStyle &&
            annotation.borderStyle.width &&
            annotation.borderStyle.width != -1) {
            width = annotation.borderStyle.width;
        }
        shape.style.fill = annotation.filled ? _getColorRGB(annotation.fillColor) : "none";
        shape.style.stroke = _getColorRGB(annotation.outlineColor);
        shape.style.strokeWidth = zoomScale * width;
        var strokeDash = _getStrokeDash(annotation.borderStyle, true, true);
        if (strokeDash.length) {
            shape.style.strokeDasharray = strokeDash;
        }
        shape.style.opacity = annotation.alpha != -1 ? annotation.alpha : 1.0;
    }

    function _updateLinkLayerPointerEvents () {
        if (_markupMode.selectedAnnotations.length > 0) {
            _setLinkLayerPointerEvents(false);
        }  else {
            _setLinkLayerPointerEvents(true);
        }
    }

    function _setLinkLayerPointerEvents (enabled) {
        const layers = document.querySelectorAll("[id^=\"PdfPageDisplayLinkLayer\"]");
        for (const layer of layers) {
            layer.style.pointerEvents = enabled === true ? "auto" : "none";
        }
    }

    function _addLinkAnnotationPage (pageWrapper, pageNo, width, height, annotations) {
        if (!annotations || !annotations.length) return;

        const visibleColor = "rgba(255,255,0,0.2)";
        const invisibleColor = "rgba(255,255,0,0.0)";

        const onMouseEnter = function (e) {
            e.target.style.backgroundColor = visibleColor;
            document.getElementById(_currentCanvasId).style.cursor = "pointer";
        };
        const onMouseLeave = function (e) {
            e.target.style.backgroundColor = invisibleColor;
            document.getElementById(_currentCanvasId).style.cursor = "auto";
        };
        const onMouseClick = function (e) {
            document.getElementById(_currentCanvasId).style.cursor = "auto";
            const url = e.target.dataset.url;
            const unsafeUrl = e.target.dataset.unsafeUrl;
            if (url || unsafeUrl) {
                if (_hyperlinkCallback) {
                    _hyperlinkCallback(url, unsafeUrl);
                } else {
                    if (url.length && unsafeUrl.length) {
                        window.open(url);
                    }
                }
                return;
            }

            const dest = e.target.dataset.dest;
            if (dest) {
                _gotoDestination(JSON.parse(dest));
            }
        };
        const getPosition = function (x, y, canvasWidth, canvasHeight) {
            var cx, cy;
            switch (_checkPageRotation()) {
                case 0:
                default:
                    cx = x * __ZOOMSCALE;
                    cy = canvasHeight - y * __ZOOMSCALE;
                    break;
                case 1:
                    cx = y * __ZOOMSCALE;
                    cy = x * __ZOOMSCALE;
                    break;
                case 2:
                    cx = canvasWidth - x * __ZOOMSCALE;
                    cy = y * __ZOOMSCALE;
                    break;
                case 3:
                    cx = canvasWidth - y * __ZOOMSCALE;
                    cy = canvasHeight - x * __ZOOMSCALE;
                    break;
            }
            return {x: cx, y: cy};
        };

        const linkLayer = document.createElement("div");
        linkLayer.id = `PdfPageDisplayLinkLayer${pageNo}`;
        pageWrapper.appendChild(linkLayer);

        for (let i=0;i<annotations.length;i++) {
            const annotation = annotations[i];
            if (annotation.subtype !== "Link") continue;
            if (!annotation.dest && !annotation.url && !annotation.unsafeUrl) continue;

            const p0 = getPosition(annotation.rect[0], annotation.rect[1], width, height),
                  p1 = getPosition(annotation.rect[2], annotation.rect[3], width, height);

            // hyperlink
            const link = document.createElement("div");
            link.dataset.annoid = annotation.id;
            link.style.zIndex = _zIndex.text;

            let linkWidth = Math.abs(p0.x - p1.x);
            let linkHeight = Math.abs(p0.y - p1.y);

            if (annotation.dest) {
                link.dataset.dest = JSON.stringify(annotation.dest);
            } else {
                link.title = annotation.url || annotation.unsafeUrl;
                link.dataset.url = annotation.url || "";
                link.dataset.unsafeUrl = annotation.unsafeUrl || "";
            }

            if (annotation.borderStyle.width > 0) {
                link.style.borderWidth = `${annotation.borderStyle.width}px`;

                if (annotation.borderStyle.style != 5) {
                    linkWidth = linkWidth - 2 * annotation.borderStyle.width;
                    linkHeight = linkHeight - 2 * annotation.borderStyle.width;
                }

                const horRad = annotation.borderStyle.horizontalCornerRadius,
                      verRad = annotation.borderStyle.verticalCornerRadius;

                if (horRad > 0 || verRad > 0) {
                    const rad = `${horRad}px / ${verRad}px`;
                    link.style.borderRadius = rad;
                }

                switch (annotation.borderStyle.style) {
                    case 1: link.style.borderStyle = "solid"; break;  // Solid
                    case 2: link.style.borderStyle = "dashed"; break; // Dashed
                    case 5: link.style.borderStyle = "none none solid"; break; // Underline
                    default: break;
                }

                if (annotation.color) {
                    link.style.borderColor = `rgb(${annotation.color.join(",")})`;
                } else {
                    link.style.borderWidth = 0;
                }
            }

            link.style.backgroundColor = invisibleColor;

            link.style.position = "absolute";
            link.style.left = `${Math.min(p0.x, p1.x)}px`;
            link.style.top  = `${Math.min(p0.y, p1.y)}px`;
            link.style.width  = `${linkWidth}px`;
            link.style.height = `${linkHeight}px`;

            link.addEventListener("mouseenter", onMouseEnter);
            link.addEventListener("mouseleave", onMouseLeave);
            link.addEventListener("click", onMouseClick);

            linkLayer.appendChild(link);
        }
    }

    function _displayPdfRectangle (annotation, svgLayer, printElement, zoomScale, sideBar) {
        const box = _getCorrectedBoundingBox(annotation.vertices, svgLayer, zoomScale);
        _applyRectangleDifferences(box, annotation.boxDiffs, zoomScale * 2);

        // rect
        const rect = document.createElementNS(_svgNS, "rect");
        if (sideBar !== true) {
            rect.id = "PdfAnnotationElement" + annotation.id;
            rect.classList.add("PdfAnnotationElement");
            if (annotation.filled) rect.classList.add("PdfAnnotationElementSel");
        }
        if (printElement) {
            rect.classList.add("PdfPrintAnnotation");
        }

        rect.setAttribute("x", box.x1);
        rect.setAttribute("y", box.y1);
        rect.setAttribute("width", Math.max((box.x2 - box.x1), 0));
        rect.setAttribute("height", Math.max((box.y2 - box.y1), 0));
        _setShapeStyle(rect, annotation, zoomScale);

        // group
        const g = document.createElementNS(_svgNS, "g");
        if (sideBar !== true) {
            g.dataset.annoid = annotation.id;
            g.dataset.selected = "false";
            g.classList.add("PdfAnnotationGroup");
        }
        g.appendChild(rect);

        // selector
        if (!printElement && !annotation.filled && !_markupMode.on) {
            const selector = document.createElementNS(_svgNS, "rect");
            if (sideBar !== true) {
                selector.classList.add("PdfMarkupSelector");
                selector.classList.add("PdfAnnotationElementSel");
            }
            selector.setAttribute("x", box.x1);
            selector.setAttribute("y", box.y1);
            selector.setAttribute("width", Math.max((box.x2 - box.x1), 0));
            selector.setAttribute("height", Math.max((box.y2 - box.y1), 0));
            selector.style.fill = "none";
            selector.style.stroke = "transparent";
            selector.style.strokeWidth = (1.5 * __ZOOMSCALE + 10);
            g.appendChild(selector);
        }

        svgLayer.appendChild(g);
    }

    function _displayPdfCircle (annotation, svgLayer, printElement, zoomScale, sideBar) {
        const box = _getCorrectedBoundingBox(annotation.vertices, svgLayer, zoomScale);
        _applyRectangleDifferences(box, annotation.boxDiffs, zoomScale * 2);

        // ellipse
        const ellipse = document.createElementNS(_svgNS, "ellipse");
        if (sideBar !== true) {
            ellipse.id = "PdfAnnotationElement" + annotation.id;
            ellipse.classList.add("PdfAnnotationElement");
            if (annotation.filled) ellipse.classList.add("PdfAnnotationElementSel");
        }
        if (printElement) {
            ellipse.classList.add("PdfPrintAnnotation");
        }

        ellipse.setAttribute("cx", (box.x2 + box.x1)/2);
        ellipse.setAttribute("cy", (box.y2 + box.y1)/2);
        ellipse.setAttribute("rx", Math.max((box.x2 - box.x1)/2, 0));
        ellipse.setAttribute("ry", Math.max((box.y2 - box.y1)/2, 0));
        _setShapeStyle(ellipse, annotation, zoomScale);

        // group
        const g = document.createElementNS(_svgNS, "g");
        if (sideBar !== true) {
            g.dataset.annoid = annotation.id;
            g.dataset.selected = "false";
            g.classList.add("PdfAnnotationGroup");
        }
        g.appendChild(ellipse);

        // selector
        if (!printElement && !annotation.filled && !_markupMode.on) {
            const selector = document.createElementNS(_svgNS, "ellipse");
            if (sideBar !== true) {
                selector.classList.add("PdfMarkupSelector");
                selector.classList.add("PdfAnnotationElementSel");
            }
            selector.setAttribute("cx", (box.x2 + box.x1)/2);
            selector.setAttribute("cy", (box.y2 + box.y1)/2);
            selector.setAttribute("rx", Math.max((box.x2 - box.x1)/2, 0));
            selector.setAttribute("ry", Math.max((box.y2 - box.y1)/2, 0));
            selector.style.fill = "none";
            selector.style.stroke = "transparent";
            selector.style.strokeWidth = (1.5 * __ZOOMSCALE + 10);
            g.appendChild(selector);
        }

        svgLayer.appendChild(g);
    }

    function _displayPdfPolygon (annotation, svgLayer, printElement, zoomScale, sideBar) {
        // polygon
        const polygon = document.createElementNS(_svgNS, "polygon");
        if (sideBar !== true) {
            polygon.id = "PdfAnnotationElement" + annotation.id;
            polygon.classList.add("PdfAnnotationElement");

            if (annotation.filled) {
                polygon.classList.add("PdfAnnotationElementSel");
            }
        }
        if (printElement) {
            polygon.classList.add("PdfPrintAnnotation");
        }

        const canvasHeight = parseInt(svgLayer.style.height || svgLayer.getAttribute("height"));
        polygon.setAttribute("points", _createPolyPointPath(annotation.vertices, canvasHeight, zoomScale, true));
        _setShapeStyle(polygon, annotation, zoomScale);

        // group
        const g = document.createElementNS(_svgNS, "g");
        if (sideBar !== true) {
            g.dataset.annoid = annotation.id;
            g.dataset.selected = "false";
            g.classList.add("PdfAnnotationGroup");
        }
        if (printElement) {
            g.classList.add("PdfPrintAnnotation");
        }
        g.appendChild(polygon);
        
        // selector box
        if (!printElement && !annotation.filled && !_markupMode.on) {
            var width = 1;
            if (annotation.borderStyle && annotation.borderStyle.width) {
                width = annotation.borderStyle.width;
            }
            const selectorBox = _buildPolyLineSelectorBox(annotation.vertices, width, svgLayer, annotation.id, sideBar);
            g.appendChild(selectorBox);
        }

        svgLayer.appendChild(g);
    }

    function _displayPdfFreehand (annotation, svgLayer, printElement, zoomScale, sideBar) {
        const canvasHeight = parseInt(svgLayer.style.height || svgLayer.getAttribute("height"));
        var pathD = "M" + (annotation.vertices[0] * zoomScale) + " " + (canvasHeight - (annotation.vertices[1] * zoomScale));
        for (var i = 2; i <= annotation.vertices.length-4; i+=4) {
            pathD += " Q" + (annotation.vertices[i] * zoomScale) + " " + (canvasHeight - (annotation.vertices[i+1] * zoomScale)) + " " + (annotation.vertices[i+2] * zoomScale) + " " + (canvasHeight - (annotation.vertices[i+3] * zoomScale));
        }
        const width = (annotation.width <= 0 ? 1.0 : annotation.width) * 1.5 * zoomScale;

        // path
        const path = document.createElementNS(_svgNS, "path");
        if (sideBar !== true) {
            path.id = "PdfAnnotationElement" + annotation.id;
            path.classList.add("PdfAnnotationElement");
        }
        if (printElement) {
            path.classList.add("PdfPrintAnnotation");
        }

        path.setAttribute("d", pathD);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", _getColorRGB(annotation.color));
        path.setAttribute("stroke-width", width);
        path.setAttribute("stroke-linejoin", "round");
        path.setAttribute("opacity", annotation.alpha != -1 ? annotation.alpha : "1.0");

        // group
        const g = document.createElementNS(_svgNS, "g");
        if (sideBar !== true) {
            g.dataset.annoid = annotation.id;
            g.dataset.selected = "false";
            g.classList.add("PdfAnnotationGroup");
        }
        if (printElement) {
            g.classList.add("PdfPrintAnnotation");
        }
        g.appendChild(path);

        // selector box
        if (!printElement && !_markupMode.on) {
            const selector = document.createElementNS(_svgNS, "path");
            if (sideBar !== true) {
                selector.classList.add("PdfMarkupSelector");
                selector.classList.add("PdfMarkupFreehandBox");
                selector.classList.add("PdfAnnotationElementSel");
            }
            selector.setAttribute("d", pathD);
            selector.setAttribute("fill", "none");
            selector.setAttribute("stroke", _uiColors.anchor.boxFill);
            selector.setAttribute("stroke-width", width + 10);
            selector.setAttribute("stroke-linejoin", "round");
            g.appendChild(selector);
        }

        svgLayer.appendChild(g);
    }

    function _getTextDecoMidPoint (p1, p2, ratio) {
        return ((1 - ratio) * p1 + ratio * p2);
    }
    function _getTextDecoDistance (x1, y1, x2, y2) {
        return (Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2)));
    }

    function _displayPdfStrikeThrough (annotation, svgLayer, printElement, zoomScale, sideBar) {
        const canvasHeight = parseInt(svgLayer.style.height || svgLayer.getAttribute("height")),
              ratio = annotation.type == _markupTypes.textStrikethrough ? 0.5 : 0.86,
              width = annotation.type == _markupTypes.textStrikethrough ? 0.074 : 0.073;

        // group
        const g = document.createElementNS(_svgNS, "g");
        if (sideBar !== true) {
            g.dataset.annoid = annotation.id;
            g.dataset.selected = "false";
            g.classList.add("PdfAnnotationGroup");
        }

        // path
        var boxPathD = "";
        for (let i=0;i<(annotation.vertices.length / 8);i++) {
            var x = [], y = [];
            for (let j=0;j<4;j++) {
                x.push(annotation.vertices[i*8+j*2] * zoomScale);
                y.push(canvasHeight - annotation.vertices[i*8+j*2+1] * zoomScale);
            }
            const pathD =
                " M" + _getTextDecoMidPoint(x[0], x[2], ratio) + "," + _getTextDecoMidPoint(y[0], y[2], ratio) +
                " L" + _getTextDecoMidPoint(x[1], x[3], ratio) + "," + _getTextDecoMidPoint(y[1], y[3], ratio);
            boxPathD +=
                " M" + x[0] + "," + y[0] +
                " L" + x[1] + "," + y[1] +
                " L" + x[3] + "," + y[3] +
                " L" + x[2] + "," + y[2] +
                " Z";

            const path = document.createElementNS(_svgNS, "path");
            if (sideBar !== true) {
                path.id = "PdfAnnotationElement" + annotation.id;
                path.classList.add("PdfAnnotationElement");
            }
            if (printElement) {
                path.classList.add("PdfPrintAnnotation");
            }
            path.setAttribute("d", pathD);
            path.setAttribute("stroke", _getColorRGB(annotation.color));
            path.setAttribute("stroke-width", _getTextDecoDistance(x[0], y[0], x[2], y[2])*width);
            path.setAttribute("opacity", annotation.alpha != -1.0 ? annotation.alpha : "1.0");

            g.appendChild(path);
        }

        // selector path
        const path = document.createElementNS(_svgNS, "path");
        if (sideBar !== true) path.classList.add("PdfAnnotationElementSel");

        path.setAttribute("d", boxPathD);
        path.setAttribute("stroke", _uiColors.markup.transparent);
        path.setAttribute("fill", _uiColors.markup.transparent);
        path.setAttribute("stroke-width", "1");
        g.appendChild(path);

        svgLayer.appendChild(g);
    }

    function _displayPdfHighlight (annotation, svgLayer, printElement, zoomScale, sideBar) {
        const canvasHeight = parseInt(svgLayer.style.height || svgLayer.getAttribute("height")),
              ratio = 0.39;

        // path
        var pathD = "";
        for (let i=0;i<(annotation.vertices.length / 8);i++) {
            var x = [], y = [];
            for (let j=0;j<4;j++) {
                x.push(annotation.vertices[i*8+j*2] * zoomScale);
                y.push(canvasHeight - annotation.vertices[i*8+j*2+1] * zoomScale);
            }
            const vecNorm = _getTextDecoDistance(x[0], y[0], x[1], y[1]);
            if (Math.abs(vecNorm) <= 0.001) continue;
            const vecX = (x[1] - x[0]) / vecNorm;
            const vecY = (y[1] - y[0]) / vecNorm;
            const curveDist = _getTextDecoDistance(x[0], y[0], x[2], y[2]) * ratio;
            pathD +=
                " M" + x[0] + "," + y[0] +
                " L" + x[1] + "," + y[1] +
                " S" +
                (_getTextDecoMidPoint(x[1], x[3], 0.5) + vecX * curveDist) + "," +
                (_getTextDecoMidPoint(y[1], y[3], 0.5) + vecY * curveDist) +
                " "  + x[3] + "," + y[3] +
                " L" + x[2] + "," + y[2] +
                " S" +
                (_getTextDecoMidPoint(x[2], x[0], 0.5) - vecX * curveDist) + "," +
                (_getTextDecoMidPoint(y[2], y[0], 0.5) - vecY * curveDist) +
                " "  + x[0] + "," + y[0];
        }

        const path = document.createElementNS(_svgNS, "path");
        if (sideBar !== true) {
            path.id = "PdfAnnotationElement" + annotation.id;
            path.classList.add("PdfAnnotationElement");
            path.classList.add("PdfAnnotationElementSel");
        }
        if (printElement) {
            path.classList.add("PdfPrintAnnotation");
        }

        const color = _getColorRGB(annotation.color);
        path.setAttribute("d", pathD);
        path.setAttribute("stroke", color);
        path.setAttribute("stroke-width", "1");
        path.setAttribute("fill", color);
        path.setAttribute("opacity", annotation.alpha != -1.0 ? annotation.alpha : "0.5");

        // group
        const g = document.createElementNS(_svgNS, "g");
        if (sideBar !== true) {
            g.dataset.annoid = annotation.id;
            g.dataset.selected = "false";
            g.classList.add("PdfAnnotationGroup");
        }
        g.appendChild(path);

        svgLayer.appendChild(g);
    }

    function _displayPdfNote (annotation, svgLayer, printElement, zoomScale, sideBar) {
        // parent group
        const parentGroup = document.createElementNS(_svgNS, "g");
        if (sideBar !== true) {
            parentGroup.dataset.annoid = annotation.id;
            parentGroup.dataset.selected = "false";
            parentGroup.classList.add("PdfAnnotationGroup");
        }

        // opacity group
        const opacityGroup = document.createElementNS(_svgNS, "g");
        opacityGroup.setAttribute("opacity", annotation.alpha);

        parentGroup.appendChild(opacityGroup);

        var box = _getCorrectedBoundingBox(annotation.boundingBox, svgLayer, zoomScale);

        var width = 1;
        if (annotation.borderStyle) {
            width = annotation.borderStyle.width;
        }
        const strokeDash = _getStrokeDash(annotation.borderStyle, false, true);

        if (annotation.leaderLineVertices.length != 0) {
            if (annotation.boxDiffs && annotation.boxDiffs.length == 4) {
                box.x1 += (annotation.boxDiffs[0] * zoomScale);
                box.y1 += (annotation.boxDiffs[3] * zoomScale);
                box.x2 -= (annotation.boxDiffs[2] * zoomScale);
                box.y2 -= (annotation.boxDiffs[1] * zoomScale);
            }
            box = _getCorrectedLeaderLineBoundingBox(annotation, box, svgLayer, zoomScale);

            // polyline
            const polyline = document.createElementNS(_svgNS, "polyline");
            if (printElement) {
                polyline.classList.add("PdfPrintAnnotationNote");
            }
            const svgLayerHeight = parseInt(svgLayer.style.height || svgLayer.getAttribute("height"));
            const points = _createPolyPointPath(annotation.leaderLineVertices, svgLayerHeight, zoomScale);
            polyline.setAttribute("points", points);
            polyline.style.stroke = _getColorHex(annotation.outlineColor);
            polyline.style.strokeWidth = zoomScale * width;
            polyline.style.fill = "none";
            if (strokeDash.length) {
                polyline.style.strokeDasharray = strokeDash;
            }

            // selector polyline
            if (!printElement && !_markupMode.on) {
                const selector = document.createElementNS(_svgNS, "polyline");
                selector.setAttribute("points", points);
                selector.style.stroke = _uiColors.markup.transparent;
                selector.style.strokeWidth = (1.5 * zoomScale * width + 10);
                selector.style.fill = "none";
                if (sideBar !== true) selector.classList.add("PdfAnnotationElementSel");
                opacityGroup.appendChild(selector);
            }

            // defs
            if (annotation.head != "None") {
                const markerStartUrl = _addSvgMarker(svgLayer, annotation, true, true, printElement);
                if (markerStartUrl) {
                    polyline.setAttribute("marker-start", markerStartUrl);
                }
            }
            opacityGroup.appendChild(polyline);
        }

        // rect
        const rect = document.createElementNS(_svgNS, "rect");
        if (sideBar !== true) {
            rect.id = "PdfAnnotationElement" + annotation.id;
            rect.classList.add("PdfAnnotationElement");
            rect.classList.add("PdfAnnotationElementSel");
        }
        if (printElement) {
            rect.classList.add("PdfPrintAnnotationNote");
        }
        const rectWidth = Math.abs(box.x2 - box.x1);
        const rectHeight = Math.abs(box.y2 - box.y1);
        rect.setAttribute("x", box.x1);
        rect.setAttribute("y", box.y1);
        rect.setAttribute("width", rectWidth);
        rect.setAttribute("height", rectHeight);
        rect.style.fill = _getColorHex(annotation.fillColor);
        rect.style.stroke = _getColorHex(annotation.outlineColor);
        rect.style.strokeWidth = zoomScale * width;
        if (strokeDash.length) {
            rect.style.strokeDasharray = strokeDash;
        }
        opacityGroup.appendChild(rect);

        // clip path
        const clipPath = document.createElementNS(_svgNS, "clipPath");
        const clipPathId = "textAnnoClipPath" + annotation.id + (sideBar === true ? "_sideBar" : "");
        clipPath.id = clipPathId;

        // polygon
        const polygon = document.createElementNS(_svgNS, "polygon");
        const textClipPath =
            (box.x1 - 2) + "," + (box.y1 - 2) + " " +
            (box.x2 + 2) + "," + (box.y1 - 2) + " " +
            (box.x2 + 2) + "," + (box.y2 + 2) + " " +
            (box.x1 - 2) + "," + (box.y2 + 2);
        polygon.setAttribute("points", textClipPath);
        clipPath.appendChild(polygon);
        opacityGroup.appendChild(clipPath);

        // text group
        const textGroup = document.createElementNS(_svgNS, "g");
        if (sideBar !== true) textGroup.classList.add("textAnnoClipGroup");
        textGroup.setAttribute("clip-path", "url(#" + clipPathId + ")");

        opacityGroup.appendChild(textGroup);

        // textarea
        const foreignObject = document.createElementNS(_svgNS, "foreignObject");
        foreignObject.classList.add("noselect");
        if (printElement) {
            foreignObject.classList.add("PdfPrintAnnotationNote");
        }
        foreignObject.setAttribute("pointer-events", "none");
        foreignObject.setAttribute("x", box.x1);
        foreignObject.setAttribute("y", box.y1);

        if (annotation.rotation == 0) {
            foreignObject.setAttribute("width", rectWidth);
            foreignObject.setAttribute("height", rectHeight - _uiSizes.noteMarkup.padding[2] * zoomScale);
        } else if (annotation.rotation == 90) {
            foreignObject.setAttribute("width", rectHeight);
            foreignObject.setAttribute("height", rectWidth - _uiSizes.noteMarkup.padding[2] * zoomScale);
            const transform =
                "translate(0," + Math.abs(box.y1 - box.y2) +
                ") rotate(" + (360 - annotation.rotation) + " , " + box.x1 + " , " + box.y1 + ")";
            foreignObject.setAttribute("transform", transform);
        } else if (annotation.rotation == 180) {
            foreignObject.setAttribute("width", rectWidth);
            foreignObject.setAttribute("height", rectHeight - _uiSizes.noteMarkup.padding[2] * zoomScale);
            const transform =
                "translate(" + Math.abs(box.x1 - box.x2) + "," + Math.abs(box.y1 - box.y2) +
                ") rotate(" + (360 - annotation.rotation) + " , " + box.x1 + " , " + box.y1 + ")";
            foreignObject.setAttribute("transform", transform);
        } else if (annotation.rotation == 270) {
            foreignObject.setAttribute("width", rectHeight);
            foreignObject.setAttribute("height", rectWidth - _uiSizes.noteMarkup.padding[2] * zoomScale);
            const transform =
                "translate(" + Math.abs(box.x1 - box.x2) +
                ",0) rotate(" + (360 - annotation.rotation) + " , " + box.x1 + " , " + box.y1 + ")";
            foreignObject.setAttribute("transform", transform);
        }

        const textDiv = document.createElementNS(_xhtmlNS, "div");
        textDiv.setAttribute("pointer-events", "none");
        textDiv.style.padding = _getNoteMarkupPadding(zoomScale);
        textDiv.style.whiteSpace = "pre-wrap";
        textDiv.style.wordBreak = "break-word";
        textDiv.style.userSelect = "none";
        textDiv.style.fontSize = (annotation.fontSize * zoomScale) + "px";
        textDiv.style.textAlign = "left";
        textDiv.style.color = _getColorHex(annotation.fontColor);
        textDiv.style.fontWeight = "normal";
        textDiv.style.fontStyle = annotation.fontStyle || "normal";
        textDiv.style.fontStretch = "normal";
        textDiv.style.fontFamily = annotation.fontFamily;
        textDiv.style.lineHeight = "1.22";
        textDiv.innerHTML = annotation.content.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/&#13;/g, "<br>");
        foreignObject.appendChild(textDiv);

        textGroup.appendChild(foreignObject);

        svgLayer.appendChild(parentGroup);
    }

    function _displayPdfStamp (annotation, canvas, printElement, zoomScale, sideBar) {
        const stampGroup = document.createElementNS(_svgNS, "g");
        if (sideBar !== true) {
            stampGroup.dataset.annoid = annotation.id;
            stampGroup.dataset.selected = "false";
            stampGroup.classList.add("PdfAnnotationGroup");
        }
        const stampImage = document.createElementNS(_svgNS, "image");
        if (sideBar !== true) {
            stampImage.classList.add("PdfAnnotationElement");
            stampImage.classList.add("PdfAnnotationElementSel");
            stampImage.id = "PdfAnnotationElement" + annotation.id;
        }
        if (printElement) {
            stampImage.classList.add("PdfPrintAnnotationStamp");
        }
        stampImage.draggable = false;

        const box = _getCorrectedBoundingBox(annotation.vertices, canvas, zoomScale);

        if (annotation.matrix && annotation.matrix.length == 6) {
            const st = _generateStampTransform(box, annotation);
            if (!st) return;

            stampImage.setAttribute("x", st.x);
            stampImage.setAttribute("y", st.y);
            stampImage.setAttribute("width", st.width);
            stampImage.setAttribute("height", st.height);
            stampImage.setAttribute("transform", st.transform);
        } else {
            stampImage.setAttribute("x", box.x1);
            stampImage.setAttribute("y", box.y1);
            stampImage.setAttribute("width", box.x2 - box.x1);
            stampImage.setAttribute("height", box.y2 - box.y1);
        }

        if (annotation.isNew) {
            stampImage.setAttributeNS(_xlinkNS, "xlink:href", annotation.inflatedStream);
        } else {
            stampImage.setAttributeNS(_xlinkNS, "xlink:href", "data:image/bmp;base64," + annotation.inflatedStream);
        }
        stampGroup.appendChild(stampImage);
        canvas.appendChild(stampGroup);
    }

    function _generateStampTransform (box, annotation) {
        const angle = function (a, b) {
            const epsilon = 1e-6;
            let angle = 0;
            const sinX = -b;
            if (sinX >= (1 - epsilon)) {
                angle = Math.PI * 0.5; // 90;
            } else if (sinX <= (-1 + epsilon)) {
                angle = -Math.PI * 0.5; // -90;
            } else {
                angle = Math.atan2(sinX, a);
            }
            return angle;
        };
        const cos = function (theta) {
            if (0 <= theta && theta <= Math.PI / 2) {
                return {
                    x: Math.cos(theta),
                    y: Math.cos(Math.PI / 2 - theta)
                };
            } else if (Math.PI / 2 < theta && theta <= Math.PI) {
                return {
                    x: Math.cos(Math.PI - theta),
                    y: Math.cos(theta - Math.PI / 2)
                };
            } else if (-Math.PI / 2 <= theta && theta < 0) {
                return {
                    x: Math.cos(-theta),
                    y: Math.cos(Math.PI / 2 + theta)
                };
            } else if (-Math.PI < theta && theta < -Math.PI / 2) {
                return {
                    x: Math.cos(Math.PI + theta),
                    y: Math.cos(-Math.PI/2 - theta)
                };
            }
        };

        const matrix = annotation.matrix ? annotation.matrix.slice(0) : [1, 0, 0, 1, 0, 0];
        const theta = angle(matrix[0], -matrix[1]);
        const coss = cos(theta);
        if (!coss) return null;

        const width = box.x2 - box.x1;
        const height = box.y2 - box.y1;
        const ratio = annotation.height / annotation.width;

        const stampWidth = width / (coss.x + ratio * coss.y);
        const stampHeight = ratio * stampWidth;

        return {
            x: box.x1 + (width - stampWidth) / 2,
            y: box.y1 + (height - stampHeight) / 2,
            width: stampWidth,
            height: stampHeight,
            transform: `rotate(${-theta * 180 / Math.PI} ${box.x1 + width / 2} ${box.y1 + height / 2})`
        };
    }

    function _createPolyPointPath(vertices, height, zoomScale, polygon) {
        var path = "";
        const length = polygon === true ? (vertices.length/2 - 1) : vertices.length/2;
        for (var i=0;i<length;i++) {
            path +=
                (vertices[i*2] * zoomScale) + "," +
                (height - (vertices[i*2+1] * zoomScale)) + " ";
        }
        return path.trim();
    }

    function _getCorrectedLeaderLineBoundingBox (annotation, box, canvas, zoomScale){
        const canvasHeight = parseInt(canvas.style.height || canvas.getAttribute("height"));
        var x2 = annotation.leaderLineVertices[annotation.leaderLineVertices.length - 4] * zoomScale;
        var y2 = canvasHeight - (annotation.leaderLineVertices[annotation.leaderLineVertices.length - 3] * zoomScale);
        var x3 = annotation.leaderLineVertices[annotation.leaderLineVertices.length - 2] * zoomScale;
        var y3 = canvasHeight - (annotation.leaderLineVertices[annotation.leaderLineVertices.length - 1] * zoomScale);
        if (x2 == x3) {
            if (y2 < y3) {
                box.y1 = y3;
            } else {
                box.y2 = y3;
            }
        } else {
            if (x2 < x3) {
                box.x1 = x3;
            } else {
                box.x2 = x3;
            }
        }
        return box;
    }

    function _sanitizeSvgText(content){
        content = content.replace("\u0096", '&OElig;');
        content = content.replace("\u009c", '&oelig;');
        return content;
    }

    function _getNextPdfAnnotationId() {
        _pdfAnnotationId += 1;
        return _pdfAnnotationId;
    }

    function _buildPolyLineSelectorBox (vertices, width, canvas, sideBar) {
        const canvasHeight = parseInt(canvas.style.height || canvas.getAttribute("height"));
        const polyline = document.createElementNS(_svgNS, "polyline");
        if (sideBar !== true) polyline.classList.add("PdfAnnotationElementSel");
        polyline.setAttribute("points", _createPolyPointPath(vertices, canvasHeight, __ZOOMSCALE));
        polyline.style.fill = "none";
        polyline.style.stroke = "transparent";
        polyline.style.strokeWidth = (1.5 * __ZOOMSCALE * width + 10);
        return polyline;
    }

//PDF MOVE MARKUPS

    function _checkMarkupDatasetSelected (markup) {
        if (markup) {
            const group = markup.closest(".PdfAnnotationGroup");
            if (group) {
                if (group.dataset.selected == "true") {
                    return true;
                } else if (group.dataset.selected == "false") {
                    return false;
                }
            }
        }
        return false;
    }

    function _setMarkupDatasetSelected (markup, selected) {
        if (markup) {
            const group = markup.closest(".PdfAnnotationGroup");
            if (group) {
                group.dataset.selected = String(selected);
            }
        }
    }

    function _getMarkupDatasetAnnoId (markup) {
        if (markup) {
            const group = markup.closest(".PdfAnnotationGroup");
            if (group && group.dataset.annoid) {
                return Number(group.dataset.annoid);
            }
        }
        return -1;
    }

    function _handleMovePdfAnnoEvent(e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        e.preventDefault();
        switch(e.type) {
            case "mouseenter":
                if (!_markupEdit.edit) {
                    if (!_checkMarkupDatasetSelected(e.target)) {
                        return;
                    }
                    document.getElementById(_currentCanvasId).style.cursor = "move";
                }
                break;
            case "mousedown":
                var target;
                if (_checkElementHasClassName(e.target, ["PdfMarkupAnchorBox", "PdfMarkupFreehandBox"])) {
                    target = document.getElementById("PdfAnnotationElement" + _getMarkupDatasetAnnoId(e.target));
                } else {
                    target = e.target;
                }
                if (!_markupEdit.edit &&
                    _markupMode.selectedAnnotations.length > 0 &&
                    _markupMode.selectedAnnotations.indexOf(_getParsedAnnotationId(target)) > -1) {
                    _markupEdit.drag.x = e.pageX;
                    _markupEdit.drag.y = e.pageY;
                    _markupEdit.move = true;
                    _markupEdit.drag.state = true;
                    _markupEdit.drag.target = target;
                    _markupEdit.drag.dirty = false;
                }
                break;
            case "mousemove":
                if (_markupEdit.move && !_markupEdit.edit && _markupEdit.drag.state && _markupEdit.drag.target) {
                    if (!_markupEdit.preventDeselect) {
                        _markupEdit.preventDeselect = true;
                    }
                    if (!_markupEdit.viewDirty) {
                        _markupEdit.viewDirty = true;
                        _markupEdit.drag.dirty = true;
                        _pushActionToMarkupHistory(
                            _undoPresets.move,
                            _markupMode.selectedAnnotations.map(function(y) { return _pdfParsedAnnotationSet[y]; })
                        );
                    }
                    _movePdfAnnos(e, _markupEdit.drag);
                }
                break;
            case "mouseleave":
                document.getElementById(_currentCanvasId).style.cursor = "auto";
                break;
            case "mouseup":
                if (_markupEdit.move && !_markupEdit.edit && _markupEdit.drag.state && _markupEdit.drag.target) {
                    _markupEdit.move = false;
                    _markupEdit.preventDeselect = false;
                    _markupEdit.drag.state = false;
                    _markupEdit.drag.target = null;
                    if (_markupEdit.viewDirty) {
                        _markupEdit.viewDirty = false;
                        _markupObserver.set("annoSetEdited");
                    }
                }
                break;
            default:
                return;
        }
    }

    function _reorderSVGElement(target, drag, bringToFront) {
        var targetElem = document.querySelector("#" + target.id);
        var parent = targetElem.parentNode;
        var redrawNode = targetElem;
        while (parent.tagName != "svg" && parent.parentNode) {
            redrawNode = parent;
            parent = parent.parentNode;
        }
        if (bringToFront) {
            drag.index = -1;
            for (var i = 0; i < parent.childNodes.length; i++) {
                if (parent.childNodes[i] == redrawNode) {
                    drag.index = i;
                    break;
                }
            }
            if (drag.index < 0) {
                return;
            }
            parent.appendChild(redrawNode);
        } else {
            if (drag.index < 0 || drag.dirty) {
                return;
            }
            parent.insertBefore(redrawNode, parent.childNodes[drag.index]);
            drag.index = -1;
        }
    }

    function _movePdfAnnos(e, drag) {
        e.preventDefault();
        var deltaX, deltaY;
        var pageRotation = _checkPageRotation();
        if (pageRotation == 0) {
            deltaX = e.pageX - drag.x;
            deltaY = e.pageY - drag.y;
        } else if (pageRotation == 1) {
            deltaY = drag.x - e.pageX;
            deltaX = e.pageY - drag.y;
        } else if (pageRotation == 2) {
            deltaX = drag.x - e.pageX;
            deltaY = drag.y - e.pageY;
        } else if (pageRotation == 3) {
            deltaY = e.pageX - drag.x;
            deltaX = drag.y - e.pageY;
        } else {
           return;
        }
        for (var i = 0; i < _markupMode.selectedAnnotations.length; i++) {
            var anno = _getAnnotationElement(_markupMode.selectedAnnotations[i]);
            if (!anno) continue;
            var parsedAnno = _pdfParsedAnnotationSet[_markupMode.selectedAnnotations[i]];
            if (!parsedAnno) continue;
            switch (parsedAnno.type) {
                case _markupTypes.leaderLine :
                case _markupTypes.polyline :
                case _markupTypes.polygon :
                case _markupTypes.polygonFilled :
                    _moveLeaderLineAnno(deltaX, deltaY, parsedAnno, anno);
                    break;
                case _markupTypes.rectangle :
                case _markupTypes.rectangleFilled :
                    _moveShapeAnno(deltaX, deltaY, parsedAnno, anno, true);
                    break;
                case _markupTypes.ellipse :
                case _markupTypes.ellipseFilled :
                    _moveShapeAnno(deltaX, deltaY, parsedAnno, anno, false);
                    break;
                case _markupTypes.freehand :
                    _moveFreehandAnno(deltaX, deltaY, parsedAnno, anno);
                    break;
                case _markupTypes.note :
                case _markupTypes.noteLeader :
                    _moveNoteAnno(deltaX, deltaY, parsedAnno, anno);
                    break;
                case _markupTypes.stamp :
                    _moveStampAnno(deltaX, deltaY, parsedAnno, anno);
                    break;
                default:
                    break;
            }
        }
        drag.x = e.pageX;
        drag.y = e.pageY;
    }

    function _applyDeltaToNodeValue (node, name, delta) {
        const newPos = parseFloat(node.getAttribute(name)) + delta;
        node.setAttribute(name, newPos);
    }

    /**
    * Move the anchor points of a shape markup
    * @param {deltaX} float The distance the markup has moved by on the X axis
    * @param {deltaY} float The distance the markup has moved by on the Y axis
    * @param {target} HTMLElement The target element of the move event (the markup being moved)
    * @private
    * @memberof ThingView
    **/
    function _moveShapeAnchorPoints (deltaX, deltaY, target) {
        const anchorGroup = target.parentNode.querySelector("[id^=\"PdfMarkupAnchorGroup\"]");
        if (!anchorGroup) return;
        for (var i = 0; i < anchorGroup.childNodes.length; i++) {
            _applyDeltaToNodeValue(anchorGroup.childNodes[i], "x", deltaX);
            _applyDeltaToNodeValue(anchorGroup.childNodes[i], "y", deltaY);
        }
    }

    function _moveShapeAnno(deltaX, deltaY, parsedAnno, target, rectangle) {
        const deltaZ = _checkAnnoInsidePage(deltaX, deltaY, parsedAnno);
        if (deltaZ) {
            const x = rectangle ? "x" : "cx",
                  y = rectangle ? "y" : "cy";
            _applyDeltaToNodeValue(target, x, deltaX);
            _applyDeltaToNodeValue(target, y, deltaY);
            const selector = target.parentNode.querySelector(".PdfMarkupSelector");
            if (selector) {
                _applyDeltaToNodeValue(selector, x, deltaX);
                _applyDeltaToNodeValue(selector, y, deltaY);
            }
            _moveShapeAnchorPoints(deltaX, deltaY, target);
            parsedAnno.vertices[0] += deltaZ.x;
            parsedAnno.vertices[1] -= deltaZ.y;
            parsedAnno.vertices[2] += deltaZ.x;
            parsedAnno.vertices[3] -= deltaZ.y;
        }
    }

    function _checkAnnoInsidePage (deltaX, deltaY, parsedAnno) {
        const bbox = parsedAnno.boundingBox || parsedAnno.vertices;
        if (!bbox) return undefined;
        const deltaXZ = deltaX / __ZOOMSCALE;
        const deltaYZ = deltaY / __ZOOMSCALE;
        const bx1 = Math.min(bbox[0], bbox[2]);
        const by1 = Math.max(bbox[1], bbox[3]);
        const bx2 = Math.max(bbox[0], bbox[2]);
        const by2 = Math.min(bbox[1], bbox[3]);
        const pageCanvas = document.getElementById("PdfAnnotationCanvas" + (parsedAnno.pageNo+1));
        const pageWidthZ = parseFloat(pageCanvas.style.width) / __ZOOMSCALE;
        const pageHeightZ = parseFloat(pageCanvas.style.height) / __ZOOMSCALE;
        const minXZ = _uiSizes.anchor.width / 2 / __ZOOMSCALE;
        const minYZ = _uiSizes.anchor.height / 2 / __ZOOMSCALE;
        if ((deltaXZ > 0 || bx1 + deltaXZ > minXZ) &&
            (deltaYZ > 0 || by1 - deltaYZ < pageHeightZ - minYZ) &&
            (deltaXZ < 0 || bx2 + deltaXZ < pageWidthZ - minXZ) &&
            (deltaYZ < 0 || by2 - deltaYZ > minYZ)) {
            return { x: deltaXZ, y: deltaYZ };
        }
        return undefined;
    }

    function _checkNoteAnnoExceedPage (parsedAnno) {
        const result = { x: false, y: false };
        const bbox = parsedAnno.boundingBox || parsedAnno.vertices;
        if (!bbox) return null;

        const widthZ = Math.abs(bbox[0] - bbox[2]);
        const heightZ = Math.abs(bbox[1] - bbox[3]);

        if (isNaN(widthZ) || isNaN(heightZ)) return null;

        const pageCanvas = document.getElementById("PdfAnnotationCanvas" + (parsedAnno.pageNo+1));
        const pageWidthZ = parseFloat(pageCanvas.style.width) / __ZOOMSCALE;
        const pageHeightZ = parseFloat(pageCanvas.style.height) / __ZOOMSCALE;

        if (isNaN(pageWidthZ) || isNaN(pageHeightZ)) return null;

        if (widthZ >= pageWidthZ) result.x = true;
        if (heightZ >= pageHeightZ) result.y = true;
        return result;
    }

    function _moveNoteAnno (deltaX, deltaY, parsedAnno, target) {
        const prevX = parseFloat(target.getAttribute("x"));
        const prevY = parseFloat(target.getAttribute("y"));

        if (isNaN(prevX) || isNaN(prevY)) return;

        let newX = prevX + deltaX;
        let newY = prevY + deltaY;
        const width = parseFloat(target.getAttribute("width"));
        const height = parseFloat(target.getAttribute("height"));
        const pageCanvas = document.getElementById("PdfAnnotationCanvas" + (parsedAnno.pageNo+1));
        const pageWidth = parseFloat(pageCanvas.style.width);
        const pageHeight = parseFloat(pageCanvas.style.height);

        const exceed = _checkNoteAnnoExceedPage(parsedAnno);
        if (!exceed) return;

        if (!exceed.x) {
            newX = Math.max(Math.min(newX, pageWidth - width), 0);
        }
        if (!exceed.y) {
            newY = Math.max(Math.min(newY, pageHeight - height), 0);
        }

        deltaX = newX - prevX;
        deltaY = newY - prevY;

        if (isNaN(deltaX) || isNaN(deltaY)) return;

        const parentGroup = target.parentNode;
        const paths = parentGroup.querySelectorAll("polygon");
        for (const path of paths) {
            const length = path.points.length || path.points.numberOfItems;
            for (let i=0;i<length;i++) {
                const p = path.points.getItem(i);
                p.x += deltaX;
                p.y += deltaY;
            }
        }

        const rect = parentGroup.querySelector("rect");
        if (rect) {
            _applyDeltaToNodeValue(rect, "x", deltaX);
            _applyDeltaToNodeValue(rect, "y", deltaY);
        }

        const text = parentGroup.querySelector("foreignObject");
        if (text) {
            if (parsedAnno.rotation == 0) {
                _applyDeltaToNodeValue(text, "x", deltaX);
                _applyDeltaToNodeValue(text, "y", deltaY);
            } else if (parsedAnno.rotation == 90) {
                _applyDeltaToNodeValue(text, "y",  deltaX);
                _applyDeltaToNodeValue(text, "x", -deltaY);
            } else if (parsedAnno.rotation == 180) {
                _applyDeltaToNodeValue(text, "x", -deltaX);
                _applyDeltaToNodeValue(text, "y", -deltaY);
            } else if (parsedAnno.rotation == 270) {
                _applyDeltaToNodeValue(text, "y", -deltaX);
                _applyDeltaToNodeValue(text, "x",  deltaY);
            }
        }

        const anchorGroup = parentGroup.parentNode.childNodes[1];
        for (var i = 0; i < anchorGroup.childNodes.length; i++) {
            if (anchorGroup.childNodes[i].id.indexOf("PdfMarkupAnchorL") != -1)
                continue;
            _applyDeltaToNodeValue(anchorGroup.childNodes[i], "x", deltaX);
            _applyDeltaToNodeValue(anchorGroup.childNodes[i], "y", deltaY);
        }

        const anchor = parentGroup.parentNode.querySelector("#PdfMarkupAnchorL" + parsedAnno.id);
        if (anchor) {
            _repositionNoteLeaderLine(anchor, target, deltaX, deltaY, parsedAnno, true);
        } else {
            for (var l = 0; l < parsedAnno.boundingBox.length-1; l+=2) {
                parsedAnno.boundingBox[l] += deltaX / __ZOOMSCALE;
                parsedAnno.boundingBox[l+1] -= deltaY / __ZOOMSCALE;
            }
            for (var m = 0; m < parsedAnno.leaderLineVertices.length-1; m+=2) {
                parsedAnno.leaderLineVertices[m] += deltaX / __ZOOMSCALE;
                parsedAnno.leaderLineVertices[m+1] -= deltaY / __ZOOMSCALE;
            }
        }
    }

    function _updateStampRotator (group, positions) {
        if (!group) return;
        group.setAttribute("transform", positions.rect.transform);
        for (const rotator of group.childNodes) {
            switch (rotator.nodeName) {
                case 'rect': {
                    rotator.setAttribute("x", String(positions.rect.x));
                    rotator.setAttribute("y", String(positions.rect.y));
                    rotator.setAttribute("width", String(positions.rect.width));
                    rotator.setAttribute("height", String(positions.rect.height));
                } break;
                case 'line': {
                    rotator.setAttribute("x1", String(positions.line.p1.x));
                    rotator.setAttribute("y1", String(positions.line.p1.y));
                    rotator.setAttribute("x2", String(positions.line.p2.x));
                    rotator.setAttribute("y2", String(positions.line.p2.y));
                } break;
                case 'circle': {
                    rotator.setAttribute("cx", String(positions.circle.x));
                    rotator.setAttribute("cy", String(positions.circle.y));
                } break;
            }
        }

        // Show rotator group
        group.style.visibility = "";
    }

    function _moveStampAnno (deltaX, deltaY, parsedAnno, target) {
        const deltaZ = _checkAnnoInsidePage(deltaX, deltaY, parsedAnno);
        if (deltaZ) {
            parsedAnno.vertices[0] += deltaZ.x;
            parsedAnno.vertices[1] -= deltaZ.y;
            parsedAnno.vertices[2] += deltaZ.x;
            parsedAnno.vertices[3] -= deltaZ.y;

            const canvas = document.getElementById("PdfAnnotationCanvas" + (parsedAnno.pageNo+1));
            const box = _getCorrectedBoundingBox(parsedAnno.vertices, canvas, __ZOOMSCALE);
            const positions = _getStampRotatorPositions(box, parsedAnno);
    
            for (const node of target.parentNode.childNodes) {
                if (node.tagName.toLowerCase() == "image") {
                    _applyDeltaToNodeValue(node, "x", deltaX);
                    _applyDeltaToNodeValue(node, "y", deltaY);
                    const transformString = node.getAttribute('transform');
                    if (transformString) {
                        node.setAttribute("transform", positions.rect.transform);
                    }
                } else {
                    const id = node.getAttribute("id");
                    if (id && id.indexOf("PdfMarkupAnchorGroup") != -1) {
                        for (const anchor of node.childNodes) {
                            if (anchor.nodeName == "rect") {
                                _applyDeltaToNodeValue(anchor, "x", deltaX);
                                _applyDeltaToNodeValue(anchor, "y", deltaY);

                                const anchorId = anchor.getAttribute("id");
                                if (anchorId && anchorId.indexOf("PdfMarkupAnchorBox") != -1) {
                                    _applyDeltaToNodeValue(anchor, "prevX", deltaX);
                                    _applyDeltaToNodeValue(anchor, "prevY", deltaY);
                                }
                            } else if (anchor.nodeName == "g") {
                                _updateStampRotator(anchor, positions);
                            }
                        }
                    }
                }
            }
        }
    }

    function _moveLeaderLineAnno(deltaX, deltaY, parsedAnno, target) {
        const deltaZ = _checkAnnoInsidePage(deltaX, deltaY, parsedAnno);
        if (deltaZ) {
            var shapes = target.parentNode.querySelectorAll("polyline, polygon");
            for (var shape of shapes) {
                const length = shape.points.length || shape.points.numberOfItems;
                for (var i=0;i<length;i++) {
                    var p = shape.points.getItem(i);
                    p.x += deltaX;
                    p.y += deltaY;
                }
            }
            var rects = target.parentNode.querySelectorAll("rect");
            for (var rect of rects) {
                _applyDeltaToNodeValue(rect, "x", deltaX);
                _applyDeltaToNodeValue(rect, "y", deltaY);
            }
            for (var l = 0; l < parsedAnno.boundingBox.length-1; l+=2) {
                parsedAnno.boundingBox[l] += deltaZ.x;
                parsedAnno.boundingBox[l+1] -= deltaZ.y;
            }
            for (var m = 0; m < parsedAnno.vertices.length-1; m+=2) {
                parsedAnno.vertices[m] += deltaZ.x;
                parsedAnno.vertices[m+1] -= deltaZ.y;
            }
        }
    }

    function _moveFreehandAnno(deltaX, deltaY, parsedAnno, target) {
        const deltaZ = _checkAnnoInsidePage(deltaX, deltaY, parsedAnno);
        if (deltaZ) {
            for (var i = 0; i < target.parentNode.childNodes.length; i++) {
                var node = target.parentNode.childNodes[i];
                const d = node.getAttribute("d");
                if (d && d != "") {
                    var coords = d.match(/[-]{0,1}[\d]*[.]{0,1}[\d]+/g).map(Number);
                    var newPath = "";
                    for (var k=0;k<coords.length/2;k++) {
                        coords[k*2] = parseFloat(coords[k*2]) + deltaX;
                        coords[k*2+1] = parseFloat(coords[k*2+1]) + deltaY;

                        if (k == 0) {
                            newPath += "M" + coords[k*2] + " " + coords[k*2+1];
                        } else {
                            if (k%2 == 1) newPath += "Q";
                            newPath += coords[k*2] + " " + coords[k*2+1] + " ";
                        }
                    }
                    node.setAttribute("d", newPath);
                } else {
                    const id = node.getAttribute("id");
                    if (id && id.indexOf("PdfMarkupAnchorGroup") != -1) {
                        for (var j = 0; j < node.childNodes.length; j++) {
                            _applyDeltaToNodeValue(node.childNodes[j], "x", deltaX);
                            _applyDeltaToNodeValue(node.childNodes[j], "y", deltaY);

                            const childId = node.childNodes[j].getAttribute("id");
                            if (childId && childId.indexOf("PdfMarkupAnchorBox") != -1) {
                                _applyDeltaToNodeValue(node.childNodes[j], "prevX", deltaX);
                                _applyDeltaToNodeValue(node.childNodes[j], "prevY", deltaY);
                            }
                        }
                    }
                }
            }
            for (var l = 0; l <= parsedAnno.boundingBox.length-2; l+=2) {
                parsedAnno.boundingBox[l] += deltaZ.x;
                parsedAnno.boundingBox[l+1] -= deltaZ.y;
            }
            for (var m = 0; m <= parsedAnno.vertices.length-2; m+=2) {
                parsedAnno.vertices[m] += deltaZ.x;
                parsedAnno.vertices[m+1] -= deltaZ.y;
            }
        }
    }

    function _getAnnotationElement (annoId) {
        return document.querySelector("#PdfAnnotationElement" + annoId);
    }

    function _getParsedAnnotationId (markup) {
        const group = markup.closest(".PdfAnnotationGroup");
        if (group) {
            if (group.dataset.annoid != undefined) {
                return Number(group.dataset.annoid);
            }
        }
        return -1;
    }

    function _getParsedAnnotation (markup) {
        var annoId = _getParsedAnnotationId(markup);
        if (annoId == null || annoId < 0) {
            return null;
        }
        return _pdfParsedAnnotationSet[annoId];
    }

//PDF DELETE AND EDIT MARKUPS

    function _handleMarkupSelectionCheck (e, drag) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        if (e.type == "mousedown") {
            var boundingBox = e.target.parentNode.getBoundingClientRect();
            drag.x = e.clientX - boundingBox.left;
            drag.y = e.clientY - boundingBox.top;
        }
        if (e.type == "mouseup") {
            var boundingBox = e.target.parentNode.getBoundingClientRect();
            var x = e.clientX - boundingBox.left;
            var y = e.clientY - boundingBox.top;
            if (x != drag.x || y != drag.y) {
                drag.x = 0;
                drag.y = 0;
                return;
            }
            drag.x = 0;
            drag.y = 0;
            var className = "PdfPageDisplayTextLayer";
            var pageNo = parseInt(e.target.id.substring(className.length));
            var annoCanvas = document.getElementById("PdfAnnotationCanvas" + pageNo);
            if (!annoCanvas) {
                return;
            }

            var elementsUnderCursor;
            var foundElement;
            if (document.elementsFromPoint) {
                elementsUnderCursor = document.elementsFromPoint(e.clientX, e.clientY);
            } else if (document.msElementsFromPoint) {
                elementsUnderCursor = document.msElementsFromPoint(e.clientX, e.clientY);
            }
            for (var elem of elementsUnderCursor) {
                if (elem.className) {
                    if (_checkElementHasClassName(elem, ["PdfAnnotationElementSel"])) {
                        foundElement = elem;
                        break;
                    }
                }
            }

            if (foundElement) {
                e.stopPropagation();
                var proxyEvent = new Event('mouseup');
                const group = foundElement.closest(".PdfAnnotationGroup")
                if (group) {
                    group.dispatchEvent(proxyEvent);
                }
            }
        }
    }

    function _handleSelectPdfAnnoEvent (e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        if (!_markupEdit.preventDeselect) {
            e.preventDefault();
            const annoId = _getParsedAnnotationId(e.target);
            const id = _markupMode.selectedAnnotations.indexOf(annoId);
            if (e.ctrlKey) {
                if (_markupMode.selectedAnnotations.length == 0 || id == -1) {
                    _selectPdfAnnotation(e.target);
                } else if (id != -1) {
                    _deselectPdfAnnotation(e.target);
                }
            } else {
                if (id == -1) {
                    _deselectAllSelectedAnnotations();
                    _selectPdfAnnotation(e.target);
                } else {
                    const annoSelection = _markupMode.selectedAnnotations.filter(function (item) {
                        return item != annoId;
                    });
                    for (const index of annoSelection) {
                        _setPdfAnnotationSelect(_getAnnotationElement(index), false);
                    }
                }
            }
        }
    }

    function getMarkupBBoxInDocument(anno, canvas) {
        const vertices = anno.boundingBox || anno.vertices;
        var sumX = 0, sumY = 0;
        for (var i=0;i<vertices.length;i++) {
            if (i%2 == 0) sumX += vertices[i];
            else sumY += vertices[i];
        }
        const x = sumX / (vertices.length / 2),
              y = sumY / (vertices.length / 2),
              canvasWidth = parseInt(canvas.style.width || canvas.getAttribute("width")),
              canvasHeight = parseInt(canvas.style.height || canvas.getAttribute("height")),
              box = _getPositionOnCanvas(x, y, canvasWidth, canvasHeight);
        box.x += canvas.parentNode.offsetLeft;
        box.y += canvas.parentNode.offsetTop;

        return box;
    }

    function _handleSelectPdfAnnoAPI (idNo, selected) {
        _confirmNoteChanges();
        var annotation = document.getElementById("PdfAnnotationElement" + idNo);
        if (annotation) {
            if (selected) {
                if (_markupMode.selectedAnnotations.length == 0) {
                    var anno = _pdfParsedAnnotationSet[parseInt(idNo)];
                    if (anno) {
                        var canvas = document.getElementById("PdfAnnotationCanvas" + (anno.pageNo+1));
                        if (canvas) {
                            var box = getMarkupBBoxInDocument(anno, canvas);
                            var canvasWrapper = document.getElementById(_currentCanvasId);
                            canvasWrapper.parentNode.scrollLeft = Math.max(box.x - canvasWrapper.parentNode.clientWidth / 2, 0);
                            canvasWrapper.parentNode.scrollTop = Math.max(box.y - canvasWrapper.parentNode.clientHeight / 2 + _marginSize, 0);
                            _updateDocumentToolbarPageDisplay();
                            _selectPdfAnnotation(annotation);
                        }
                    }
                } else {
                    _selectPdfAnnotation(annotation);
                }
            } else {
                _deselectPdfAnnotation(annotation);
            }
        } else {
            if (selected) {
                var annot = _pdfParsedAnnotationSet[parseInt(idNo)];
                if (annot) {
                    if (_markupMode.selectedAnnotations.length == 0) {
                        var pageNo = annot.pageNo+1;
                        var pageWrapper = document.getElementById("PdfPageDisplayWrapper" + pageNo);
                        if (pageWrapper) {
                            var bbox = getMarkupBBoxInDocument(annot, pageWrapper);
                            var dest = { 1: "", 2: bbox.x, 3: bbox.y };
                            gotoBookmark(pageNo, dest, function(success) {
                                if (success) {
                                    var annotation = document.getElementById("PdfAnnotationElement" + idNo);
                                    if (annotation) {
                                        _selectPdfAnnotation(annotation);
                                    } else {
                                        _markupMode.hiddenSelectedAnnotations.push(idNo);
                                    }
                                }
                            });
                        }
                    }
                }
            } else {
                if (_markupMode.hiddenSelectedAnnotations.indexOf(idNo) > -1) {
                    _markupMode.hiddenSelectedAnnotations.splice(_markupMode.hiddenSelectedAnnotations.indexOf(idNo), 1);
                }
            }
        }
    }

    function _checkDeselectPdfAnnotation (e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        if ((_markupMode.selectedAnnotations.length > 0 && _markupMode.selectedAnnotations.indexOf(_getParsedAnnotationId(e.target)) == -1) &&
            (e.target.className && e.target.className != "PdfMarkupNoteEditor") &&
            (!(_checkElementHasClassName(e.target, ["PdfAnnotationElementSel", "PdfMarkupAnchorBox", "PdfMarkupFreehandBox"])))) {
                _clearPdfAnnoSelection();
        }
    }

    function _clearPdfAnnoSelection () {
        var selectedLength = _markupMode.selectedAnnotations.length;
        for (var i = 0; i < selectedLength; i++) {
            _deselectPdfAnnotation(_getAnnotationElement(_markupMode.selectedAnnotations[0]));
        }
    }

    function _clearPdfAnnoSelectionPage (pageNo) {
        if (!_pageAnnoSetList[pageNo]) return;
        for (var idNo of _pageAnnoSetList[pageNo]) {
            _deselectPdfAnnotation(_getAnnotationElement(idNo));
        }
    }

    function _setTextLayersSelectMode (mode) {
        if (mode == "none" && !_markupMode.selectedAnnotations.length) return;
        if (mode == "text" && _markupMode.selectedAnnotations.length) return;
        const textLayers = document.querySelectorAll(".PdfPageDisplayTextLayer");
        for (const textLayer of textLayers) {
            textLayer.style.userSelect = mode;
        }
    }

    function _selectPdfAnnotation (annotation) {
        if (annotation.closest(".PdfAnnotationGroup")) {
            const anno = _pdfParsedAnnotationSet[_getMarkupDatasetAnnoId(annotation)];
            if (!anno) return;
            var pageNo = anno.pageNo+1;
            var textLayer = document.getElementById("PdfPageDisplayTextLayer" + pageNo);
            if (textLayer) {
                textLayer.style.zIndex = _zIndex.watermark;
            }
            if (!_checkMarkupDatasetSelected(annotation) &&
                (_markupMode.selectedAnnotations.length == 0 || _markupMode.selectedAnnotations.indexOf(_getParsedAnnotationId(annotation)) == -1)) {
                _setPdfAnnotationSelect(annotation, true);
                _setTextLayersSelectMode("none");
            }
        }
    }

    function _deselectPdfAnnotation (annotation) {
        if (annotation &&
            _checkMarkupDatasetSelected(annotation)) {
            document.getElementById(_currentCanvasId).style.cursor = "auto";
            _setPdfAnnotationSelect(annotation, false);
            _setTextLayersSelectMode("text");
            const anno = _pdfParsedAnnotationSet[_getMarkupDatasetAnnoId(annotation)];
            if (!anno) return;
            var pageNo = anno.pageNo + 1;
            var selectedPageNos = _markupMode.selectedAnnotations.map(function(x) { return _pdfParsedAnnotationSet[x].pageNo; });
            if (selectedPageNos.indexOf(pageNo-1) == -1) {
                var textLayer = document.getElementById("PdfPageDisplayTextLayer" + pageNo);
                if (textLayer) {
                    textLayer.style.zIndex = _zIndex.text;
                }
            }
        }
    }

    function _setPdfAnnotationSelect (markup, selected) {
        if (!markup) {
            return;
        }
        const parsedAnno = _getParsedAnnotation(markup);
        if (!parsedAnno) {
            return;
        }
        const markupElem = document.querySelector("#PdfAnnotationElement" + parsedAnno.id);
        if (!markupElem) {
            return;
        }
        const annoId = _getParsedAnnotationId(markupElem);
        if (selected && !_checkMarkupDatasetSelected(markupElem)) {
            _setMarkupDatasetSelected(markupElem, true);
            switch (parsedAnno.type) {
                case _markupTypes.leaderLine :
                case _markupTypes.polyline :
                    _addLeaderLineAnchorPoints(parsedAnno, markupElem);
                    _addMarkupMoveEvents(document.getElementById("PdfMarkupAnchorBox" + parsedAnno.id));
                    _markupMode.selectedAnnotations.push(annoId);
                    break;
                case _markupTypes.rectangle :
                case _markupTypes.ellipse :
                    _addShapeAnchorPoints(parsedAnno, markupElem, false);
                    const selectorShape = markupElem.parentNode.querySelector(".PdfMarkupSelector");
                    if (selectorShape) _addMarkupMoveEvents(selectorShape);
                    _markupMode.selectedAnnotations.push(annoId);
                    break;
                case _markupTypes.rectangleFilled :
                case _markupTypes.ellipseFilled :
                    _addShapeAnchorPoints(parsedAnno, markupElem, false);
                    _addMarkupMoveEvents(markupElem);
                    _markupMode.selectedAnnotations.push(annoId);
                    break;
                case _markupTypes.polygon :
                    _addLeaderLineAnchorPoints(parsedAnno, markupElem, true);
                    _addMarkupMoveEvents(document.getElementById("PdfMarkupAnchorBox" + parsedAnno.id));
                    _markupMode.selectedAnnotations.push(annoId);
                    break;
                case _markupTypes.polygonFilled :
                    _addLeaderLineAnchorPoints(parsedAnno, markupElem, true, true);
                    _addMarkupMoveEvents(document.getElementById("PdfMarkupAnchorBox" + parsedAnno.id));
                    _markupMode.selectedAnnotations.push(annoId);
                    break;
                case _markupTypes.freehand :
                    _addShapeAnchorPoints(parsedAnno, markupElem, true);
                    const selectorFreehand = markupElem.parentNode.querySelector(".PdfMarkupSelector");
                    if (selectorFreehand) _addMarkupMoveEvents(selectorFreehand);
                    _markupMode.selectedAnnotations.push(annoId);
                    break;
                case _markupTypes.note :
                    _addNoteAnchorPoints(parsedAnno, markupElem, parsedAnno.boundingBox);
                    _addShapeAnchorPointsEvents();
                    var anchorBox = document.getElementById("PdfMarkupAnchorBox" + parsedAnno.id);
                    _addMarkupMoveEvents(anchorBox);
                    anchorBox.addEventListener("dblclick", _handleNoteEditTextEvent);
                    _markupMode.selectedAnnotations.push(annoId);
                    break;
                case _markupTypes.noteLeader :
                    _addNoteLeaderAnchorPoints(parsedAnno, markupElem);
                    var anchorBox = document.getElementById("PdfMarkupAnchorBox" + parsedAnno.id);
                    _addMarkupMoveEvents(anchorBox);
                    anchorBox.addEventListener("dblclick", _handleNoteEditTextEvent);
                    _markupMode.selectedAnnotations.push(annoId);
                    break;
                case _markupTypes.stamp :
                    _addShapeAnchorPoints(parsedAnno, markupElem, true, true);
                    _addMarkupMoveEvents(markupElem);
                    _markupMode.selectedAnnotations.push(annoId);
                    break;
                case _markupTypes.textUnderline :
                case _markupTypes.textStrikethrough :
                case _markupTypes.textHighlight :
                    _addTextDecoAnchorBox(parsedAnno, markupElem);
                    _markupMode.selectedAnnotations.push(annoId);
                    break;
                default:
                    break;
            }
            _markupEdit.drag.reset();
            _reorderSVGElement(markupElem, _markupEdit.drag, true);
            _markupObserver.set("annoSelected", parsedAnno.id, "add");
        } else if (!selected && _checkMarkupDatasetSelected(markupElem)) {
            switch (parsedAnno.type) {
                case _markupTypes.leaderLine :
                case _markupTypes.polyline :
                case _markupTypes.rectangle :
                case _markupTypes.rectangleFilled :
                case _markupTypes.ellipse :
                case _markupTypes.ellipseFilled :
                case _markupTypes.polygon :
                case _markupTypes.polygonFilled :
                case _markupTypes.freehand :
                case _markupTypes.stamp :
                    _removeAnchorPoints(markupElem);
                    break;
                case _markupTypes.note :
                case _markupTypes.noteLeader :
                    _removeAnchorPoints(markupElem.parentNode);
                    break;
                case _markupTypes.textHighlight :
                case _markupTypes.textUnderline :
                case _markupTypes.textStrikethrough :
                    const target = markupElem.parentNode.querySelector("[id^=\"PdfMarkupAnchorGroup\"]");
                    if (target) {
                        markupElem.parentNode.removeChild(target);
                    }
                    break;
                default:
                    break;
            }
            _setMarkupDatasetSelected(markupElem, false);
            _reorderSVGElement(markupElem, _markupEdit.drag, false);
            var pageNo = _getParsedAnnotation(markupElem).pageNo;
            _markupMode.selectedAnnotations.splice(_markupMode.selectedAnnotations.indexOf(annoId), 1);
            if (_markupMode.selectedAnnotations.map(
                function(x) {
                    if (_pdfParsedAnnotationSet[x])
                        return _pdfParsedAnnotationSet[x].pageNo;
                    else
                        return null;
                }
            ).indexOf(pageNo) == -1) {
                _removeMarkupMoveEvents(markupElem);
            }
            _markupObserver.set("annoSelected", parsedAnno.id, "remove");
        }
        _updateLinkLayerPointerEvents();
    }
    /**
    * Add anchor points to target
    * @param {JSON} parsedAnno The parsed representation of the markup
    * @param {HTMLElement} target The markup HTML element
    * @param {boolean} keepRatio True then anchor points will be added only at corners.
    * @param {boolean} [rotate] True then rotate point will be added.
    * @private
    * @memberof ThingView
    **/
    function _addShapeAnchorPoints (parsedAnno, target, keepRatio, rotate) {
        const targetParent = target.parentNode;
        const canvas = document.getElementById("PdfAnnotationCanvas" + (parsedAnno.pageNo+1));
        const box = _getCorrectedBoundingBox(parsedAnno.vertices, canvas, __ZOOMSCALE);
        _applyRectangleDifferences(box, parsedAnno.boxDiffs, __ZOOMSCALE);
        const anchorPointsGroup = _buildShapeAnchorPoints(box, parsedAnno.id, keepRatio, true);
        targetParent.appendChild(anchorPointsGroup);
        if (rotate === true) {
            anchorPointsGroup.appendChild(_buildStampRotator(box, parsedAnno));
        }
        _addShapeAnchorPointsEvents();
    }

    function _addNoteAnchorPoints (parsedAnno, target, vertices) {
        const targetParent = target.parentNode.parentNode;
        const canvas = document.getElementById("PdfAnnotationCanvas" + (parsedAnno.pageNo+1));
        const box = _getCorrectedBoundingBox(vertices, canvas, __ZOOMSCALE);
        targetParent.appendChild(_buildShapeAnchorPoints(box, parsedAnno.id));
        document.getElementById("PdfMarkupAnchorBox" + parsedAnno.id).setAttribute("fill", _uiColors.anchor.boxFill);
    }

    function _addNoteLeaderAnchorPoints (parsedAnno, target) {
        const pageHeight = parseInt(document.getElementById("PdfAnnotationCanvas" + (parsedAnno.pageNo+1)).clientHeight);
        const boxVertices = _getNoteBoxVerticesFromMarkup(target, pageHeight);
        _addNoteAnchorPoints(parsedAnno, target, boxVertices);
        const anchorGroup = document.getElementById("PdfMarkupAnchorGroup" + parsedAnno.id);
        anchorGroup.dataset.annoid = String(parsedAnno.id);
        for (let i=0;i<2;i++) {
            const lx = parsedAnno.leaderLineVertices[i*2] * __ZOOMSCALE;
            const ly = pageHeight - (parsedAnno.leaderLineVertices[i*2+1] * __ZOOMSCALE);
            const rect = document.createElementNS(_svgNS, "rect");
            rect.setAttribute("width", String(_uiSizes.anchor.width));
            rect.setAttribute("height", String(_uiSizes.anchor.height));
            rect.setAttribute("x", String(lx - (_uiSizes.anchor.width/2)));
            rect.setAttribute("y", String(ly - (_uiSizes.anchor.height/2)));
            rect.setAttribute("stroke", _uiColors.anchor.fill);
            rect.setAttribute("fill", _uiColors.anchor.fill);
            rect.classList.add("PdfMarkupAnchor");
            rect.id = "PdfMarkupAnchor" + (i == 0 ? "L" : "M") + parsedAnno.id;
            anchorGroup.appendChild(rect);
        }
        _addShapeAnchorPointsEvents();
    }

    function _getTextDecoBoxes (vertices, canvas) {
        const canvasHeight = parseInt(canvas.style.height || canvas.getAttribute("height"));
        var boxes = [];
        for (var i=0;i<(vertices.length / 8);i++) {
            var box = [];
            for (var j=0;j<4;j++) {
                box.push({
                    x: vertices[i*8+j*2] * __ZOOMSCALE,
                    y: canvasHeight - vertices[i*8+j*2+1] * __ZOOMSCALE
                });
            }
            boxes.push(box);
        }
        return boxes;
    }

    function _buildTextDecoMasks (group, annoNumber, boxes, hasCurve) {
        var buildPath = function (box) {
            const angle = Math.atan2(box[1].y - box[0].y, box[1].x - box[0].x);

            const curveDist =
                hasCurve === true ?
                (_getTextDecoDistance(box[0].x, box[0].y, box[2].x, box[2].y) * 0.18) : 0;
            const margin = 3;
            const marginVecH = {
                x: (margin + curveDist) * Math.cos(angle),
                y: (margin + curveDist) * Math.sin(angle)
            };
            const marginVecV = {
                x: margin * Math.cos(angle + Math.PI / 2),
                y: margin * Math.sin(angle + Math.PI / 2)
            };
            return (
                "M" + (box[0].x - marginVecH.x - marginVecV.x) + "," + (box[0].y - marginVecH.y - marginVecV.y) +
                "L" + (box[1].x + marginVecH.x - marginVecV.x) + "," + (box[1].y + marginVecH.y - marginVecV.y) +
                " " + (box[3].x + marginVecH.x + marginVecV.x) + "," + (box[3].y + marginVecH.y + marginVecV.y) +
                " " + (box[2].x - marginVecH.x + marginVecV.x) + "," + (box[2].y - marginVecH.y + marginVecV.y) +
                "Z"
            );
        };
        const defs = document.createElementNS(_svgNS, "defs");
        group.appendChild(defs);
        const rect = document.createElementNS(_svgNS, "rect");
        rect.id = "PdfMarkupAnchorGroupBackground" + annoNumber;
        rect.setAttribute("width", "100%");
        rect.setAttribute("height", "100%");
        rect.setAttribute("fill", "white");
        defs.appendChild(rect);


        const length = boxes.length;
        for (let i=0;i<length;i++) {
            const id = "PdfMarkupAnchorGroupTextDeco" + annoNumber + "_" + i;
            
            // path
            const path = document.createElementNS(_svgNS, "path");
            path.id = id;
            path.setAttribute("stroke", "rgb(33,117,200)");
            path.setAttribute("stroke-width", "1");
            path.setAttribute("d", buildPath(boxes[i]));
            defs.appendChild(path);

            // mask
            const mask = document.createElementNS(_svgNS, "mask");
            mask.id = id + "-cutout";
            defs.appendChild(mask);
            
            // use
            const useBG = document.createElementNS(_svgNS, "use");
            useBG.setAttribute("href", "#PdfMarkupAnchorGroupBackground" + annoNumber);
            mask.appendChild(useBG);
            for (let j=0;j<length;j++) {
                if (j != i) {
                    const useDeco = document.createElementNS(_svgNS, "use");
                    useDeco.setAttribute("href", "#PdfMarkupAnchorGroupTextDeco" + annoNumber + "_" + j);
                    mask.appendChild(useDeco);
                }
            }
            const useMask = document.createElementNS(_svgNS, "use");
            useMask.setAttribute("href", "#" + id);
            useMask.setAttribute("fill", "none");
            useMask.setAttribute("mask", "url(#" + id + "-cutout)");
            group.appendChild(useMask);
        }
    }

    function _addTextDecoAnchorBox (parsedAnno, target) {
        const targetParent = target.parentNode;
        const canvas = document.getElementById("PdfAnnotationCanvas" + (parsedAnno.pageNo+1));
        const boxes = _getTextDecoBoxes(parsedAnno.vertices, canvas);

        const anchorGroup = document.createElementNS(_svgNS, "g");
        anchorGroup.id = "PdfMarkupAnchorGroup" + parsedAnno.id;

        _buildTextDecoMasks(anchorGroup, parsedAnno.id, boxes, parsedAnno.type == _markupTypes.textHighlight);
        targetParent.appendChild(anchorGroup);
        const targetElem = targetParent.querySelector("[id^=\"PdfAnnotationElement\"]");
        _addMarkupSelectEvents(targetElem);
    }

    function _getNoteBoxVerticesFromMarkup (markup, pageHeight) {
        var x1 = parseFloat(markup.getAttribute("x")) / __ZOOMSCALE;
        var y1 = (pageHeight - parseFloat(markup.getAttribute("y"))) / __ZOOMSCALE;
        var x2 = (parseFloat(markup.getAttribute("x")) + parseFloat(markup.getAttribute("width"))) / __ZOOMSCALE;
        var y2 = (pageHeight - (parseFloat(markup.getAttribute("y")) + parseFloat(markup.getAttribute("height")))) / __ZOOMSCALE;
        var boxVertices = [x1, y1, x2, y2];
        return boxVertices;
    }

    function _buildShapeAnchorPoint (pos, x, y, annoNumber) {
        const point = document.createElementNS(_svgNS, "rect");
        point.classList.add("PdfMarkupAnchor");
        point.id = "PdfMarkupAnchor" + pos + annoNumber;
        point.setAttribute("width", String(_uiSizes.anchor.width));
        point.setAttribute("height", String(_uiSizes.anchor.height));
        point.setAttribute("stroke", _uiColors.anchor.fill);
        point.setAttribute("fill", _uiColors.anchor.fill);

        point.setAttribute("x", String(x));
        point.setAttribute("y", String(y));

        return point;
    }

    function _getStampRotatorPositions (box, annotation) {
        const st = _generateStampTransform(box, annotation);
        if (!st) return null;
        return {
            rect: st,
            line: {
                p1: {
                    x: st.x + st.width / 2,
                    y: st.y
                },
                p2: {
                    x: st.x + st.width / 2,
                    y: st.y - _uiSizes.rotator.length
                }
            },
            circle: {
                x: st.x + st.width / 2,
                y: st.y - _uiSizes.rotator.length - _uiSizes.rotator.radius
            }
        };
    }

    function _buildStampRotator (box, annotation) {
        const positions = _getStampRotatorPositions(box, annotation);
        if (!positions) return null;

        const annoNumber = annotation.id;
        const group = document.createElementNS(_svgNS, "g");
        group.id = "PdfMarkupRotatorGroup" + annoNumber;
        group.dataset.annoid = String(annoNumber);

        // rotator rect
        const rotatorRect = document.createElementNS(_svgNS, "rect");
        rotatorRect.classList.add("PdfMarkupRotatorBox");
        rotatorRect.id = "PdfMarkupRotatorBox" + annoNumber;
        rotatorRect.setAttribute("stroke", _uiColors.anchor.box);
        rotatorRect.setAttribute("fill", "none");
        rotatorRect.setAttribute("stroke-width", String(_uiSizes.anchor.boxLine));
        rotatorRect.setAttribute("x", String(positions.rect.x));
        rotatorRect.setAttribute("y", String(positions.rect.y));
        rotatorRect.setAttribute("width", String(positions.rect.width));
        rotatorRect.setAttribute("height", String(positions.rect.height));
        group.appendChild(rotatorRect);

        // rotator line
        const rotatorLine = document.createElementNS(_svgNS, "line");
        rotatorLine.classList.add("PdfMarkupRotatorBox");
        rotatorLine.setAttribute("stroke", _uiColors.anchor.box);
        rotatorLine.setAttribute("stroke-width", String(_uiSizes.anchor.boxLine));
        rotatorLine.setAttribute("x1", String(positions.line.p1.x));
        rotatorLine.setAttribute("y1", String(positions.line.p1.y));
        rotatorLine.setAttribute("x2", String(positions.line.p2.x));
        rotatorLine.setAttribute("y2", String(positions.line.p2.y));
        group.appendChild(rotatorLine);

        // rotator circle
        const rotatorCircle = document.createElementNS(_svgNS, "circle");
        rotatorCircle.classList.add("PdfMarkupRotator");
        rotatorCircle.id = "PdfMarkupRotator" + annoNumber;
        rotatorCircle.setAttribute("stroke", _uiColors.rotator.fill);
        rotatorCircle.setAttribute("fill", _uiColors.rotator.fill);
        rotatorCircle.setAttribute("cx", String(positions.circle.x));
        rotatorCircle.setAttribute("cy", String(positions.circle.y));
        rotatorCircle.setAttribute("r", String(_uiSizes.rotator.radius));
        group.appendChild(rotatorCircle);

        group.setAttribute("transform", positions.rect.transform);

        return group;
    }

    function _buildShapeAnchorPoints (box, annoNumber, keepRatio, noPointerEvents) {
        const group = document.createElementNS(_svgNS, "g");
        group.id = "PdfMarkupAnchorGroup" + annoNumber;
        group.dataset.annoid = String(annoNumber);

        // anchor box
        const anchorBox = document.createElementNS(_svgNS, "rect");
        anchorBox.classList.add("PdfMarkupAnchorBox");
        anchorBox.id = "PdfMarkupAnchorBox" + annoNumber;
        anchorBox.setAttribute("stroke", _uiColors.anchor.box);
        anchorBox.setAttribute("fill", "none");
        anchorBox.setAttribute("stroke-width", String(_uiSizes.anchor.boxLine));
        anchorBox.setAttribute("x", String(box.x1));
        anchorBox.setAttribute("y", String(box.y1));
        if (noPointerEvents === true) anchorBox.style.pointerEvents = "none";

        const width = Math.abs(box.x2 - box.x1),
              height = Math.abs(box.y2 - box.y1);
        anchorBox.setAttribute("width", String(width));
        anchorBox.setAttribute("height", String(height));

        if (keepRatio === true) {
            anchorBox.setAttribute("prevX", String(box.x1));
            anchorBox.setAttribute("prevY", String(box.y1));
            anchorBox.setAttribute("prevWidth", String(width));
            anchorBox.setAttribute("prevHeight", String(height));
        }
        group.appendChild(anchorBox);

        // anchor points
        group.appendChild(_buildShapeAnchorPoint("NW", box.x1 - (_uiSizes.anchor.width/2), box.y1 - (_uiSizes.anchor.height/2), annoNumber));
        group.appendChild(_buildShapeAnchorPoint("NE", box.x2 - (_uiSizes.anchor.width/2), box.y1 - (_uiSizes.anchor.height/2), annoNumber));
        group.appendChild(_buildShapeAnchorPoint("SE", box.x2 - (_uiSizes.anchor.width/2), box.y2 - (_uiSizes.anchor.height/2), annoNumber));
        group.appendChild(_buildShapeAnchorPoint("SW", box.x1 - (_uiSizes.anchor.width/2), box.y2 - (_uiSizes.anchor.height/2), annoNumber));

        if (keepRatio !== true) {
            group.appendChild(_buildShapeAnchorPoint("W", box.x1 - (_uiSizes.anchor.width/2), ((box.y1 + box.y2)/2) - (_uiSizes.anchor.height/2), annoNumber));
            group.appendChild(_buildShapeAnchorPoint("E", box.x2 - (_uiSizes.anchor.width/2), ((box.y1 + box.y2)/2) - (_uiSizes.anchor.height/2), annoNumber));
            group.appendChild(_buildShapeAnchorPoint("N", ((box.x1 + box.x2)/2) - (_uiSizes.anchor.width/2), box.y1 - (_uiSizes.anchor.height/2), annoNumber));
            group.appendChild(_buildShapeAnchorPoint("S", ((box.x1 + box.x2)/2) - (_uiSizes.anchor.width/2), box.y2 - (_uiSizes.anchor.height/2), annoNumber));
        }

        return group;
    }

    function _addShapeAnchorPointsEvents () {
        const anchorPoints = document.querySelectorAll(".PdfMarkupAnchor, .PdfMarkupRotator");
        for (const anchorPoint of anchorPoints) {
            anchorPoint.addEventListener("mouseenter", _handleShapeMarkupEditEvent);
            anchorPoint.addEventListener("mouseleave", function () { if (!_markupEdit.edit){ document.getElementById(_currentCanvasId).style.cursor = "auto"; }});
            anchorPoint.addEventListener("mousedown", _handleShapeMarkupEditEvent);
        }
        const svgElem = anchorPoints[0].closest("svg");
        if (svgElem) {
            svgElem.addEventListener("mousemove", _handleShapeMarkupEditEvent);
            svgElem.addEventListener("mouseup", _handleShapeMarkupEditEvent);
        }
    }

    function _addLeaderLineAnchorPoints (parsedAnno, target, polygon, polygonFilled) {
        const canvas = target.closest(".PdfAnnotationCanvas"),
              group = target.closest("g");
        _buildLineAnchorPoints(group, parsedAnno.vertices, parseInt(canvas.clientHeight), parsedAnno.id, polygon, polygonFilled);
        _addShapeAnchorPointsEvents();
    }

    function _buildLineAnchorPoints (parent, vertices, pageHeight, annoNumber, polygon, polygonFilled) {
        const group = document.createElementNS(_svgNS, "g");
        group.id = "PdfMarkupAnchorGroup" + annoNumber;
        group.dataset.annoid = String(annoNumber);

        const length = polygon === true ? (vertices.length / 2 - 1) : vertices.length / 2;
        for (var i=0;i<length;i++) {
            const x = vertices[i*2] * __ZOOMSCALE - _uiSizes.anchor.width / 2;
            const y = pageHeight - vertices[i*2+1] * __ZOOMSCALE - _uiSizes.anchor.height / 2;

            const rect = document.createElementNS(_svgNS, "rect");
            rect.setAttribute("width", String(_uiSizes.anchor.width));
            rect.setAttribute("height", String(_uiSizes.anchor.height));
            rect.classList.add("PdfMarkupAnchor");
            rect.dataset.anchorid = String(i);
            rect.id = "PdfMarkupAnchor" + annoNumber + "_" + i;
            rect.setAttribute("x", String(x));
            rect.setAttribute("y", String(y));
            rect.setAttribute("stroke", _uiColors.anchor.fill);
            rect.setAttribute("fill", _uiColors.anchor.fill);

            group.appendChild(rect);
        }

        _buildLineAnchorBox(group, vertices, annoNumber, pageHeight, polygon, polygonFilled);

        parent.appendChild(group);
    }

    function _buildLineAnchorBox (parent, vertices, annoNumber, pageHeight, polygon, polygonFilled) {
        const tag = polygon === true ? "polygon" : "polyline";
        const points = _createPolyPointPath(vertices, pageHeight, __ZOOMSCALE, polygon);

        const box = document.createElementNS(_svgNS, tag);
        box.classList.add("PdfMarkupAnchorBox");
        box.id = "PdfMarkupAnchorBox" + annoNumber;
        box.setAttribute("points", points);
        box.setAttribute("fill", polygonFilled === true ? _uiColors.markup.transparent : "none");
        box.setAttribute("stroke", _uiColors.markup.transparent);
        box.setAttribute("stroke-width", "20");

        const path = document.createElementNS(_svgNS, tag);
        path.id = "PdfMarkupAnchorPath" + annoNumber;
        path.setAttribute("points", points);
        path.setAttribute("fill", "none");
        path.setAttribute("stroke", _uiColors.anchor.box);
        path.setAttribute("stroke-width", "2");

        parent.insertBefore(box, parent.firstChild);
        parent.insertBefore(path, parent.firstChild);
    }

    function _handleShapeMarkupEditEvent (e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        var markupTarget;
        e.stopPropagation();
        switch (e.type) {
            case "mouseenter":
                if (!_markupEdit.move) {
                    _setMarkupEditCursor(e.target);
                }
                break;
            case "mouseleave" :
                if (_markupEdit.edit && !_markupEdit.move && _markupEdit.drag.state && _markupEdit.drag.target) {
                    _markupEdit.edit = false;
                    markupTarget = document.getElementById("PdfAnnotationElement" + _getMarkupDatasetAnnoId(_markupEdit.drag.target));
                    _reorderSVGElement(markupTarget, _markupEdit.drag, false);
                    _markupEdit.drag.target = null;
                    _markupEdit.drag.state = false;
                    document.getElementById(_currentCanvasId).style.cursor = "auto";
                    if (_markupEdit.viewDirty) {
                        _markupEdit.viewDirty = false;
                        _markupObserver.set("annoSetEdited");
                    }
                }
                break;
            case "mousedown" :
                if (!_markupEdit.move) {
                    _markupEdit.edit = true;
                    if (e.pageX && e.pageY) {
                        _markupEdit.drag.x = e.pageX;
                        _markupEdit.drag.y = e.pageY;

                        _markupEdit.drag.startX = e.pageX;
                        _markupEdit.drag.startY = e.pageY;
                    } else {
                        _markupEdit.drag.x = _markupEdit.cachedX;
                        _markupEdit.drag.y = _markupEdit.cachedY;

                        _markupEdit.drag.startX = _markupEdit.cachedX;
                        _markupEdit.drag.startY = _markupEdit.cachedY;
                    }
                    _markupEdit.drag.state = true;
                    _markupEdit.drag.target = e.target;
                    _markupEdit.drag.dirty = false;
                    markupTarget = document.getElementById("PdfAnnotationElement" + _getMarkupDatasetAnnoId(e.target));
                    _reorderSVGElement(markupTarget, _markupEdit.drag, true);

                    const anno = _pdfParsedAnnotationSet[_getMarkupDatasetAnnoId(markupTarget)];
                    if (!anno) return;
                    switch (anno.type) {
                        case _markupTypes.stamp:
                            _startEditStampMarkup(_markupEdit.drag.target);
                            break;
                    }
                }
                break;
            case "mousemove" :
                if (_markupEdit.edit && !_markupEdit.move && _markupEdit.drag.state && _markupEdit.drag.target) {
                    if (_markupEdit.drag.x > -1 && _markupEdit.drag.y > -1) {
                        if (!_markupEdit.preventDeselect) {
                            _markupEdit.preventDeselect = true;
                        }

                        var deltaX, deltaY;
                        var pageRotation = _checkPageRotation();
                        if (pageRotation == 0) {
                            deltaX = e.pageX - _markupEdit.drag.x;
                            deltaY = e.pageY - _markupEdit.drag.y;
                        } else if (pageRotation == 1) {
                            deltaY = _markupEdit.drag.x - e.pageX;
                            deltaX = e.pageY - _markupEdit.drag.y;
                        } else if (pageRotation == 2) {
                            deltaX = _markupEdit.drag.x - e.pageX;
                            deltaY = _markupEdit.drag.y - e.pageY;
                        } else if (pageRotation == 3) {
                            deltaY = e.pageX - _markupEdit.drag.x;
                            deltaX = _markupEdit.drag.y - e.pageY;
                        } else {
                            return;
                        }

                        markupTarget = document.getElementById("PdfAnnotationElement" + _getMarkupDatasetAnnoId(_markupEdit.drag.target));
                        _markupEdit.cachedX = e.pageX;
                        _markupEdit.cachedY = e.pageY;
                        _markupEdit.drag.x = e.pageX;
                        _markupEdit.drag.y = e.pageY;
                        const anno = _pdfParsedAnnotationSet[_getMarkupDatasetAnnoId(markupTarget)];
                        if (!anno) return;
                        var markupType = anno.type;
                        switch (markupType) {
                            case _markupTypes.rectangle :
                            case _markupTypes.rectangleFilled :
                                _dragEditRectangleMarkup(_markupEdit.drag.target, markupTarget, deltaX, deltaY);
                                break;
                            case _markupTypes.ellipse :
                            case _markupTypes.ellipseFilled :
                                _dragEditEllipseMarkup(_markupEdit.drag.target, markupTarget, deltaX, deltaY);
                                break;
                            case _markupTypes.leaderLine :
                            case _markupTypes.polyline :
                                _dragEditLeaderLineMarkup(_markupEdit.drag.target, markupTarget, deltaX, deltaY);
                                break;
                            case _markupTypes.polygon :
                            case _markupTypes.polygonFilled :
                                _dragEditLeaderLineMarkup(_markupEdit.drag.target, markupTarget, deltaX, deltaY, true);
                                break;
                            case _markupTypes.note :
                            case _markupTypes.noteLeader :
                                _dragEditNoteMarkup(_markupEdit.drag.target, markupTarget, deltaX, deltaY);
                                break;
                            case _markupTypes.freehand :
                                _dragEditFreehandMarkup(_markupEdit.drag.target,
                                                        _markupEdit.drag.x, _markupEdit.drag.y,
                                                        _markupEdit.drag.startX, _markupEdit.drag.startY);
                                break;
                            case _markupTypes.stamp :
                                _dragEditStampMarkup(_markupEdit.drag.target,
                                                     _markupEdit.drag.x, _markupEdit.drag.y,
                                                     _markupEdit.drag.startX, _markupEdit.drag.startY,
                                                     e.shiftKey);
                                break;
                            default:
                                break;
                        }
                        if (!_markupEdit.viewDirty) {
                            _markupEdit.viewDirty = true;
                            _markupEdit.drag.dirty = true;
                            _pushActionToMarkupHistory(_undoPresets.resize, [_getParsedAnnotation(markupTarget)]);
                        }
                    }
                }
                break;
            case "mouseup" :
                if (_markupEdit.edit && !_markupEdit.move && _markupEdit.drag.state && _markupEdit.drag.target) {
                    markupTarget = document.getElementById("PdfAnnotationElement" + _getMarkupDatasetAnnoId(_markupEdit.drag.target));
                    if (markupTarget) {
                        _reorderSVGElement(markupTarget, _markupEdit.drag, false);
                        const anno = _pdfParsedAnnotationSet[_getMarkupDatasetAnnoId(markupTarget)];
                        if (!anno) return;
                        switch (anno.type) {
                            case _markupTypes.leaderLine:
                            case _markupTypes.polyline:
                            case _markupTypes.polygon:
                            case _markupTypes.polygonFilled :
                                _dropEditLeaderLineMarkup(_markupEdit.drag.target);
                                break;
                            case _markupTypes.freehand:
                                _dropEditFreehandMarkup(_markupEdit.drag.target, markupTarget);
                                break;
                            case _markupTypes.stamp :
                                _dropEditStampMarkup(_markupEdit.drag.target, markupTarget);
                                break;
                            default:
                                break;
                        }
                    }
                    _markupEdit.preventDeselect = false;
                    _markupEdit.drag.state = false;
                    _markupEdit.drag.target = null;
                    _markupEdit.drag.x = -1;
                    _markupEdit.drag.y = -1;
                    _markupEdit.drag.startX = -1;
                    _markupEdit.drag.startY = -1;
                    _markupEdit.edit = false;

                    if (_markupEdit.viewDirty) {
                        _markupEdit.viewDirty = false;
                        _markupObserver.set("annoSetEdited");
                    }
                    document.getElementById(_currentCanvasId).style.cursor = "auto";
                }
                break;
            default :
                break;
        }
    }

    function _dragEditFreehandAnchor(anchorBox, curX, curY, startX, startY, flipX, flipY) {
        var prevWidth = parseFloat(anchorBox.getAttribute("prevWidth"));
        var prevHeight = parseFloat(anchorBox.getAttribute("prevHeight"));
        var curWidth = parseFloat(anchorBox.getAttribute("width"));
        var curHeight = parseFloat(anchorBox.getAttribute("height"));

        const offset = _getDragEditOffset(curX, curY, startX, startY);
        const offX = offset.x
        const offY = offset.y;

        var slope = (prevHeight * flipY) / (prevWidth * flipX);
        var scale = 1;
        if (flipY == 1) {
            if (offY <= slope * offX) {
                scale = Math.max((prevHeight - offY * flipY) / prevHeight, 0);
            } else if (offY > slope * offX) {
                scale = Math.max((prevWidth - offX * flipX) / prevWidth, 0);
            }
        } else {
            if (offY <= slope * offX) {
                scale = Math.max((prevWidth - offX * flipX) / prevWidth, 0);
            } else if (offY > slope * offX) {
                scale = Math.max((prevHeight - offY * flipY) / prevHeight, 0);
            }
        }

        var newWidth = prevWidth * scale;
        var newHeight = prevHeight * scale;

        anchorBox.setAttribute("width", newWidth);
        anchorBox.setAttribute("height", newHeight);

        return {x: newWidth - curWidth, y: newHeight - curHeight};
    }

    function _startEditStampMarkup (anchorTarget) {
        const annoId = anchorTarget.parentNode.dataset.annoid;
        if (!annoId) return;

        if (anchorTarget.nodeName == "circle") {
            // Rotate
            // Hide anchor boxes
            const boxes = anchorTarget.closest("#PdfMarkupAnchorGroup" + annoId).querySelectorAll(".PdfMarkupAnchorBox, .PdfMarkupAnchor");
            for (const box of boxes) {
                box.style.visibility = "hidden";
            }

            const transformString = anchorTarget.parentNode.getAttribute("transform");
            const transformArray = transformString.split(" ");
            if (transformArray.length !== 3) return;

            const centerX = parseFloat(transformArray[1]);
            const centerY = parseFloat(transformArray[2]);

            const cx = parseFloat(anchorTarget.getAttribute("cx"));
            const cy = parseFloat(anchorTarget.getAttribute("cy"));

            // Calculate absolute position of circle center
            const circleCenter = _getSVGElementAbsolutePosition(anchorTarget, cx, cy);

            _markupEdit.drag.stampRotationVec = {
                x: circleCenter.x - centerX,
                y: circleCenter.y - centerY
            };
        } else if (anchorTarget.nodeName == "rect") {
            // Resize
            // Hide rotator group
            const rotator = anchorTarget.closest("g").querySelector("#PdfMarkupRotatorGroup" + annoId);
            if (rotator) {
                rotator.style.visibility = "hidden";
            }
        }
    }

    function _getDragEditOffset (curX, curY, startX, startY) {
        let offX = 0, offY = 0;
        const pageRotation = _checkPageRotation();
        if (pageRotation == 0) {
            offX = curX - startX;
            offY = curY - startY;
        } else if (pageRotation == 1) {
            offY = startX - curX;
            offX = curY - startY;
        } else if (pageRotation == 2) {
            offX = startX - curX;
            offY = startY - curY;
        } else if (pageRotation == 3) {
            offY = curX - startX;
            offX = startY - curY;
        }
        return { x: offX, y: offY };
    }

    function _snapStampRotate (degree, step) {
        // Use absolute value of degree for simpler calculation of snap degree
        // then apply the sign of value later on return
        const minus = degree < 0 ? -1 : 1;
        const snapStep = step || 1;
        const quotient = Math.floor(Math.abs(degree) / snapStep);
        const remainder = Math.abs(degree) % snapStep;

        if (remainder > snapStep / 2) {
            return (quotient + 1) * minus * snapStep;
        } else {
            return quotient * minus * snapStep;
        }
    }

    function _getDragEditStampRotate (vec) {
        let radian = -Math.atan2(vec.y, vec.x) - Math.PI / 2;
        if (radian < -Math.PI) {
            radian += Math.PI * 2;
        }
        return radian * 180 / Math.PI;
    }

    function _dragEditStampMarkup (anchorTarget, curX, curY, startX, startY, shiftKey) {
        // resize
        if (anchorTarget.id.indexOf("PdfMarkupAnchor") != -1) {
            _dragEditFreehandMarkup(anchorTarget, curX, curY, startX, startY);
            return;
        }

        if (anchorTarget.nodeName != "circle") return;

        // rotate
        if (!_markupEdit.drag.stampRotationVec || isNaN(_markupEdit.drag.stampRotationVec.x) || isNaN(_markupEdit.drag.stampRotationVec.y)) return;
        const anno = _pdfParsedAnnotationSet[_getMarkupDatasetAnnoId(anchorTarget)];
        if (!anno) return;

        const offset = _getDragEditOffset(curX, curY, startX, startY);
        const vector = {
            x: _markupEdit.drag.stampRotationVec.x + offset.x,
            y: _markupEdit.drag.stampRotationVec.y + offset.y
        };

        const rotatorGroup = anchorTarget.closest("g");
        const transformString = rotatorGroup.getAttribute("transform");
        const transformArray = transformString.split(" ");

        const centerX = parseFloat(transformArray[1]);
        const centerY = parseFloat(transformArray[2]);

        const degree = _snapStampRotate(_getDragEditStampRotate(vector), shiftKey ? 15 : 1);
        rotatorGroup.setAttribute("rotDegree", String(degree));
        rotatorGroup.setAttribute("transform", `rotate(${-degree} ${centerX} ${centerY})`);
    }

    function _dragEditFreehandMarkup(anchorTarget, curX, curY, startX, startY) {
        const anno = _pdfParsedAnnotationSet[_getMarkupDatasetAnnoId(anchorTarget)];
        if (!anno) return;
        var annoId = anno.id;
        var anchorBox = anchorTarget.parentNode.querySelector("#PdfMarkupAnchorBox" + annoId);
        switch (anchorTarget.id) {
            case "PdfMarkupAnchorNW" + annoId:
                {
                    let offset = _dragEditFreehandAnchor(anchorBox, curX, curY, startX, startY, 1, 1);

                    anchorBox.setAttribute("x", parseFloat(anchorBox.getAttribute("x")) - offset.x);
                    anchorBox.setAttribute("y", parseFloat(anchorBox.getAttribute("y")) - offset.y);

                    anchorTarget.setAttribute("x", parseFloat(anchorTarget.getAttribute("x")) - offset.x);
                    anchorTarget.setAttribute("y", parseFloat(anchorTarget.getAttribute("y")) - offset.y);

                    let anchorSW = anchorTarget.parentNode.querySelector("#PdfMarkupAnchorSW" + annoId);
                    anchorSW.setAttribute("x", parseFloat(anchorSW.getAttribute("x")) - offset.x);

                    let anchorNE = anchorTarget.parentNode.querySelector("#PdfMarkupAnchorNE" + annoId);
                    anchorNE.setAttribute("y", parseFloat(anchorNE.getAttribute("y")) - offset.y);
                }
                break;
            case "PdfMarkupAnchorNE" + annoId:
                {
                    let offset = _dragEditFreehandAnchor(anchorBox, curX, curY, startX, startY, -1, 1);

                    anchorBox.setAttribute("y", parseFloat(anchorBox.getAttribute("y")) - offset.y);

                    anchorTarget.setAttribute("x", parseFloat(anchorTarget.getAttribute("x")) + offset.x);
                    anchorTarget.setAttribute("y", parseFloat(anchorTarget.getAttribute("y")) - offset.y);

                    let anchorSE = anchorTarget.parentNode.querySelector("#PdfMarkupAnchorSE" + annoId);
                    anchorSE.setAttribute("x", parseFloat(anchorSE.getAttribute("x")) + offset.x);

                    let anchorNW = anchorTarget.parentNode.querySelector("#PdfMarkupAnchorNW" + annoId);
                    anchorNW.setAttribute("y", parseFloat(anchorNW.getAttribute("y")) - offset.y);
                }
                break;
            case "PdfMarkupAnchorSE" + annoId:
                {
                    let offset = _dragEditFreehandAnchor(anchorBox, curX, curY, startX, startY, -1, -1);

                    anchorTarget.setAttribute("x", parseFloat(anchorTarget.getAttribute("x")) + offset.x);
                    anchorTarget.setAttribute("y", parseFloat(anchorTarget.getAttribute("y")) + offset.y);

                    let anchorNE = anchorTarget.parentNode.querySelector("#PdfMarkupAnchorNE" + annoId);
                    anchorNE.setAttribute("x", parseFloat(anchorNE.getAttribute("x")) + offset.x);

                    let anchorSW = anchorTarget.parentNode.querySelector("#PdfMarkupAnchorSW" + annoId);
                    anchorSW.setAttribute("y", parseFloat(anchorSW.getAttribute("y")) + offset.y);
                }
                break;
            case "PdfMarkupAnchorSW" + annoId:
                {
                    let offset = _dragEditFreehandAnchor(anchorBox, curX, curY, startX, startY, 1, -1);

                    anchorBox.setAttribute("x", parseFloat(anchorBox.getAttribute("x")) - offset.x);

                    anchorTarget.setAttribute("x", parseFloat(anchorTarget.getAttribute("x")) - offset.x);
                    anchorTarget.setAttribute("y", parseFloat(anchorTarget.getAttribute("y")) + offset.y);

                    let anchorNW = anchorTarget.parentNode.querySelector("#PdfMarkupAnchorNW" + annoId);
                    anchorNW.setAttribute("x", parseFloat(anchorNW.getAttribute("x")) - offset.x);

                    let anchorSE = anchorTarget.parentNode.querySelector("#PdfMarkupAnchorSE" + annoId);
                    anchorSE.setAttribute("y", parseFloat(anchorSE.getAttribute("y")) + offset.y);
                }
                break;
            default:
                break;
        }
    }

    function _dropEditFreehandMarkup (anchorTarget, markupTarget) {
        const parsedAnno = _pdfParsedAnnotationSet[_getMarkupDatasetAnnoId(anchorTarget)];
        if (!parsedAnno) return;
        const annoId = parsedAnno.id,
            anchorBox = anchorTarget.parentNode.querySelector("#PdfMarkupAnchorBox" + annoId),
            prevWidth = parseFloat(anchorBox.getAttribute("prevWidth")),
            curWidth = parseFloat(anchorBox.getAttribute("width")),
            prevX = parseFloat(anchorBox.getAttribute("prevX")),
            prevY = parseFloat(anchorBox.getAttribute("prevY")),
            curX = parseFloat(anchorBox.getAttribute("x")),
            curY = parseFloat(anchorBox.getAttribute("y")),
            scale = curWidth / prevWidth,
            canvasHeight = parseInt(markupTarget.closest("svg").clientHeight),
            paths = markupTarget.parentNode.querySelectorAll("path");

        for (const path of paths) {
            const oldPath = path.getAttribute("d");
            if  (!oldPath || oldPath == "") continue;
            const coords = oldPath.match(/[-]{0,1}[\d]*[.]{0,1}[\d]+/g).map(Number);
            var newPath = "",
                minX = Number.MAX_VALUE, minY = Number.MAX_VALUE,
                maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE;
            for (var i=0;i<coords.length/2;i++) {
                // Calculate coordinates
                coords[i*2] = (parseFloat(coords[i*2]) - prevX) * scale + curX;
                coords[i*2+1] = (parseFloat(coords[i*2+1]) - prevY) * scale + curY;

                // Calculate min/max
                minX = Math.min(minX, coords[i*2]); maxX = Math.max(maxX, coords[i*2]);
                minY = Math.min(minY, coords[i*2+1]); maxY = Math.max(maxY, coords[i*2+1]);

                // Update vertices of annotation
                parsedAnno.vertices[i*2] = coords[i*2] / __ZOOMSCALE;
                parsedAnno.vertices[i*2+1] = (canvasHeight - coords[i*2+1]) / __ZOOMSCALE;

                // Write a new path
                if (i==0) {
                    newPath += "M";
                    newPath += coords[i*2] + " " + coords[i*2+1];
                } else {
                    if (i%2==1) newPath += "Q";
                    newPath += coords[i*2] + " " + coords[i*2+1] + " ";
                }
            }
            // Update freehand path
            path.setAttribute("d", newPath);

            // Reset initial values of anchor box
            anchorBox.setAttribute("prevWidth", curWidth);
            anchorBox.setAttribute("prevHeight", parseFloat(anchorBox.getAttribute("height")));
            anchorBox.setAttribute("prevX", curX);
            anchorBox.setAttribute("prevY", curY);

            // Update bounding box of annotation
            parsedAnno.boundingBox[0] = minX / __ZOOMSCALE;
            parsedAnno.boundingBox[1] = (canvasHeight - maxY) / __ZOOMSCALE;
            parsedAnno.boundingBox[2] = maxX / __ZOOMSCALE;
            parsedAnno.boundingBox[3] = (canvasHeight - minY) / __ZOOMSCALE;
        }
    }

    function _getSVGElementAbsolutePosition (svgElement, x, y) {
        const svg = svgElement.ownerSVGElement;

        const pt = svg.createSVGPoint();
        pt.x = x;
        pt.y = y;

        return pt.matrixTransform(svg.getCTM().inverse().multiply(svgElement.getCTM()));
    }

    function _updateAnchorBoxes (parsedAnno, anchors, box) {
        const width = Math.abs(box.x2 - box.x1),
              height = Math.abs(box.y2 - box.y1);
        const annoId = parsedAnno.id;
        for (const anchor of anchors) {
            switch (anchor.id) {
                case "PdfMarkupAnchorBox" + annoId: {
                    anchor.setAttribute("x", String(box.x1));
                    anchor.setAttribute("y", String(box.y1));
                    anchor.setAttribute("width", String(width));
                    anchor.setAttribute("height", String(height));

                    anchor.setAttribute("prevX", String(box.x1));
                    anchor.setAttribute("prevY", String(box.y1));
                    anchor.setAttribute("prevWidth", String(width));
                    anchor.setAttribute("prevHeight", String(height));
                } break;
                case "PdfMarkupAnchorNW" + annoId: {
                    anchor.setAttribute("x", String(box.x1 - (_uiSizes.anchor.width / 2)));
                    anchor.setAttribute("y", String(box.y1 - (_uiSizes.anchor.height / 2)));
                } break;
                case "PdfMarkupAnchorNE" + annoId: {
                    anchor.setAttribute("x", String(box.x2 - (_uiSizes.anchor.width / 2)));
                    anchor.setAttribute("y", String(box.y1 - (_uiSizes.anchor.height / 2)));
                } break;
                case "PdfMarkupAnchorSE" + annoId: {
                    anchor.setAttribute("x", String(box.x2 - (_uiSizes.anchor.width / 2)));
                    anchor.setAttribute("y", String(box.y2 - (_uiSizes.anchor.height / 2)));
                } break;
                case "PdfMarkupAnchorSW" + annoId: {
                    anchor.setAttribute("x", String(box.x1 - (_uiSizes.anchor.width / 2)));
                    anchor.setAttribute("y", String(box.y2 - (_uiSizes.anchor.height / 2)));
                } break;
            }
            // Show anchor boxes
            anchor.style.visibility = "";
        }
    }

    function _dropEditStampMarkup (anchorTarget, markupTarget) {
        const parsedAnno = _pdfParsedAnnotationSet[_getMarkupDatasetAnnoId(anchorTarget)];
        if (!parsedAnno) return;

        const getAttrNum = function (element, name) {
            return parseFloat(element.getAttribute(name));
        };

        const annoId = parsedAnno.id;
        const anchorGroup = anchorTarget.closest("#PdfMarkupAnchorGroup" + annoId);
        const rotatorGroup = anchorGroup.querySelector("#PdfMarkupRotatorGroup" + annoId);
        const svg = markupTarget.closest("svg");
        const canvasHeight = parseInt(svg.clientHeight);

        if (_markupEdit.drag.stampRotationVec && !isNaN(_markupEdit.drag.stampRotationVec.x) && !isNaN(_markupEdit.drag.stampRotationVec.y)) {
            // Rotate
            const rect = rotatorGroup.querySelector("rect");

            const x = getAttrNum(rect, "x");
            const y = getAttrNum(rect, "y");
            const width = getAttrNum(rect, "width");
            const height = getAttrNum(rect, "height");

            const lt = _getSVGElementAbsolutePosition(rect, x, y);                  // left-top
            const rt = _getSVGElementAbsolutePosition(rect, x + width, y);          // right-top
            const rb = _getSVGElementAbsolutePosition(rect, x + width, y + height); // right-bottom
            const lb = _getSVGElementAbsolutePosition(rect, x, y + height);         // left-bottom

            const minX = Math.min(lt.x, rt.x, rb.x, lb.x);
            const maxX = Math.max(lt.x, rt.x, rb.x, lb.x);
            const minY = Math.min(lt.y, rt.y, rb.y, lb.y);
            const maxY = Math.max(lt.y, rt.y, rb.y, lb.y);

            parsedAnno.vertices[0] = minX / __ZOOMSCALE;
            parsedAnno.vertices[1] = (canvasHeight - maxY) / __ZOOMSCALE;
            parsedAnno.vertices[2] = maxX / __ZOOMSCALE;
            parsedAnno.vertices[3] = (canvasHeight - minY) / __ZOOMSCALE;

            const rotate = Number(rotatorGroup.getAttribute("rotDegree"));
            if (rotate != 0) {
                parsedAnno.rotate = rotate;
                parsedAnno.matrix = _generateStampMatrix(rotate, parsedAnno.width, parsedAnno.height);
            } else {
                delete parsedAnno.rotate;
                delete parsedAnno.matrix;
            }
            delete _markupEdit.drag.stampRotationVec;
        } else {
            // Resize
            const anchorBox = anchorGroup.querySelector("#PdfMarkupAnchorBox" + annoId);
            const curX = getAttrNum(anchorBox, "x");
            const curY = getAttrNum(anchorBox, "y");
            const curWidth = getAttrNum(anchorBox, "width");
            const imageHeight = getAttrNum(anchorBox, "height");

            parsedAnno.vertices[0] = curX / __ZOOMSCALE;
            parsedAnno.vertices[1] = (canvasHeight - (curY + imageHeight)) / __ZOOMSCALE;
            parsedAnno.vertices[2] = (curX + curWidth) / __ZOOMSCALE;
            parsedAnno.vertices[3] = (canvasHeight - curY) / __ZOOMSCALE;
        }

        const box = _getCorrectedBoundingBox(parsedAnno.vertices, svg, __ZOOMSCALE);
        const positions = _getStampRotatorPositions(box, parsedAnno);
        // Update image
        markupTarget.setAttribute("x", String(positions.rect.x));
        markupTarget.setAttribute("y", String(positions.rect.y));
        markupTarget.setAttribute("width", String(positions.rect.width));
        markupTarget.setAttribute("height", String(positions.rect.height));
        if (parsedAnno.matrix) {
            markupTarget.setAttribute("transform", String(positions.rect.transform));
        } else {
            markupTarget.removeAttribute("transform");
        }

        // Update anchor
        const anchors = anchorGroup.querySelectorAll(".PdfMarkupAnchorBox, .PdfMarkupAnchor");
        _updateAnchorBoxes(parsedAnno, anchors, box);
        
        // Update rotator
        _updateStampRotator(rotatorGroup, positions);
    }

    function _dragEditRectangleMarkup (anchorTarget, markupTarget, deltaX, deltaY) {
        const parsedAnno = _pdfParsedAnnotationSet[_getMarkupDatasetAnnoId(anchorTarget)];
        if (!parsedAnno) return;
        var annoId = parsedAnno.id;
        switch (anchorTarget.id) {
            case "PdfMarkupAnchorNW" + annoId:
                _dragEditRectangleVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "N");
                _dragEditRectangleHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "W");
                document.getElementById("PdfMarkupAnchorN" + annoId).setAttribute("y", anchorTarget.getAttribute("y"));
                document.getElementById("PdfMarkupAnchorW" + annoId).setAttribute("x", anchorTarget.getAttribute("x"));
                break;
            case "PdfMarkupAnchorNE" + annoId:
                _dragEditRectangleVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "N");
                _dragEditRectangleHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "E");
                document.getElementById("PdfMarkupAnchorN" + annoId).setAttribute("y", anchorTarget.getAttribute("y"));
                document.getElementById("PdfMarkupAnchorE" + annoId).setAttribute("x", anchorTarget.getAttribute("x"));
                break;
            case "PdfMarkupAnchorSE" + annoId:
                _dragEditRectangleVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "S");
                _dragEditRectangleHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "E");
                document.getElementById("PdfMarkupAnchorS" + annoId).setAttribute("y", anchorTarget.getAttribute("y"));
                document.getElementById("PdfMarkupAnchorE" + annoId).setAttribute("x", anchorTarget.getAttribute("x"));
                break;
            case "PdfMarkupAnchorSW" + annoId:
                _dragEditRectangleVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "S");
                _dragEditRectangleHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "W");
                document.getElementById("PdfMarkupAnchorS" + annoId).setAttribute("y", anchorTarget.getAttribute("y"));
                document.getElementById("PdfMarkupAnchorW" + annoId).setAttribute("x", anchorTarget.getAttribute("x"));
                break;
            case "PdfMarkupAnchorN" + annoId:
                _dragEditRectangleVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "N");
                break;
            case "PdfMarkupAnchorS" + annoId:
                _dragEditRectangleVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "S");
                break;
            case "PdfMarkupAnchorE" + annoId:
                _dragEditRectangleHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "E");
                break;
            case "PdfMarkupAnchorW" + annoId:
                _dragEditRectangleHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "W");
                break;
            default:
                break;
        }
    }

    /**
    * Edit a rectangle markup's height by dragging an anchor point
    * Should only be called for anchors which can move on a vertical axis: N, S, NE, NW, SE, SW
    * @param {HTMLElement} markupTarget The markup dom element being altered
    * @param {HTMLElement} anchorTarget The anchor dom element receiving the event
    * @param {number} deltaY The distance being moved in pixels
    * @param {JSON} parsedAnno The parsed representation of the markup
    * @param {string} anchorLetter The letter representing the anchor selected (e.g "N" for north)
    * @private
    * @memberof ThingView
    **/
    function _dragEditRectangleVerticalAnchor (markupTarget, anchorTarget, deltaY, parsedAnno, anchorLetter) {
        var newHeight;
        var annoId = parsedAnno.id;
        if (anchorLetter == "N") {
            newHeight = parseFloat(markupTarget.getAttribute("height")) - deltaY;
        } else {
            newHeight = parseFloat(markupTarget.getAttribute("height")) + deltaY;
        }
        if (newHeight > 0) {
            const selector = markupTarget.parentNode.querySelector(".PdfMarkupSelector");
            var diff = parsedAnno.boxDiffs[1] * __ZOOMSCALE;
            if (anchorLetter == "N") {
                markupTarget.setAttribute("y", parseFloat(markupTarget.getAttribute("y")) + deltaY);
                if (selector) selector.setAttribute("y", parseFloat(selector.getAttribute("y")) + deltaY);
                document.getElementById("PdfMarkupAnchorBox" + parsedAnno.id).setAttribute("y", parseFloat(markupTarget.getAttribute("y")) - diff);
                if (parsedAnno.vertices[3] > parsedAnno.vertices[1]) {
                    parsedAnno.vertices[3] -= (deltaY / __ZOOMSCALE);
                } else {
                    parsedAnno.vertices[1] -= (deltaY / __ZOOMSCALE);
                }
            } else {
                if (parsedAnno.vertices[3] > parsedAnno.vertices[1]) {
                    parsedAnno.vertices[1] -= (deltaY / __ZOOMSCALE);
                } else {
                    parsedAnno.vertices[3] -= (deltaY / __ZOOMSCALE);
                }
            }
            markupTarget.setAttribute("height", newHeight);
            if (selector) selector.setAttribute("height", newHeight);
            anchorTarget.setAttribute("y", parseFloat(anchorTarget.getAttribute("y")) + deltaY);
            document.getElementById("PdfMarkupAnchor" + anchorLetter + "E" + annoId).setAttribute("y", anchorTarget.getAttribute("y"));
            document.getElementById("PdfMarkupAnchor" + anchorLetter + "W" + annoId).setAttribute("y", anchorTarget.getAttribute("y"));
            document.getElementById("PdfMarkupAnchorE" + annoId).setAttribute("y", parseFloat(document.getElementById("PdfMarkupAnchorE" + annoId).getAttribute("y")) + (deltaY/2));
            document.getElementById("PdfMarkupAnchorW" + annoId).setAttribute("y", document.getElementById("PdfMarkupAnchorE" + annoId).getAttribute("y"));
            document.getElementById("PdfMarkupAnchorBox" + annoId).setAttribute("height", newHeight + diff * 2);
        }
    }

    /**
    * Edit a rectangle markup's width by dragging an anchor point
    * Should only be called for anchors which can move on a horizontal axis: E, W, NE, NW, SE, SW
    * @param {HTMLElement} markupTarget The markup dom element being altered
    * @param {HTMLElement} anchorTarget The anchor dom element receiving the event
    * @param {number} deltaX The distance being moved in pixels
    * @param {JSON} parsedAnno The parsed representation of the markup
    * @param {string} anchorLetter The letter representing the anchor selected (e.g "E" for east)
    * @private
    * @memberof ThingView
    **/
    function _dragEditRectangleHorizontalAnchor (markupTarget, anchorTarget, deltaX, parsedAnno, anchorLetter) {
        var newWidth;
        var annoId = parsedAnno.id;
        if (anchorLetter == "W") {
            newWidth = parseFloat(markupTarget.getAttribute("width")) - deltaX;
        } else {
            newWidth = parseFloat(markupTarget.getAttribute("width")) + deltaX;
        }
        if (newWidth > 0) {
            const selector = markupTarget.parentNode.querySelector(".PdfMarkupSelector");
            var diff = parsedAnno.boxDiffs[1] * __ZOOMSCALE;
            if (anchorLetter == "W") {
                markupTarget.setAttribute("x", parseFloat(markupTarget.getAttribute("x")) + deltaX);
                if (selector) selector.setAttribute("x", parseFloat(selector.getAttribute("x")) + deltaX);
                document.getElementById("PdfMarkupAnchorBox" + annoId).setAttribute("x", parseFloat(markupTarget.getAttribute("x")) - diff);
                if (parsedAnno.vertices[0] < parsedAnno.vertices[2]) {
                    parsedAnno.vertices[0] += (deltaX / __ZOOMSCALE);
                } else {
                    parsedAnno.vertices[2] += (deltaX / __ZOOMSCALE);
                }
            } else {
                if (parsedAnno.vertices[0] < parsedAnno.vertices[2]) {
                    parsedAnno.vertices[2] += (deltaX / __ZOOMSCALE);
                } else {
                    parsedAnno.vertices[0] += (deltaX / __ZOOMSCALE);
                }
            }
            markupTarget.setAttribute("width", newWidth);
            if (selector) selector.setAttribute("width", newWidth);
            anchorTarget.setAttribute("x", parseFloat(anchorTarget.getAttribute("x")) + deltaX);
            document.getElementById("PdfMarkupAnchorN" + anchorLetter + annoId).setAttribute("x", anchorTarget.getAttribute("x"));
            document.getElementById("PdfMarkupAnchorS" + anchorLetter + annoId).setAttribute("x", anchorTarget.getAttribute("x"));
            document.getElementById("PdfMarkupAnchorN" + annoId).setAttribute("x", parseFloat(document.getElementById("PdfMarkupAnchorN" + annoId).getAttribute("x")) + (deltaX/2));
            document.getElementById("PdfMarkupAnchorS" + annoId).setAttribute("x", document.getElementById("PdfMarkupAnchorN" + annoId).getAttribute("x"));
            document.getElementById("PdfMarkupAnchorBox" + annoId).setAttribute("width", newWidth + diff * 2);
        }
    }

    function _dragEditEllipseMarkup (anchorTarget, markupTarget, deltaX, deltaY) {
        const parsedAnno = _pdfParsedAnnotationSet[_getMarkupDatasetAnnoId(anchorTarget)];
        if (!parsedAnno) return;
        const annoId = parsedAnno.id;
        switch (anchorTarget.id) {
            case "PdfMarkupAnchorNW" + annoId:
                _dragEditEllipseVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "N");
                _dragEditEllipseHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "W");
                document.getElementById("PdfMarkupAnchorN" + annoId).setAttribute("y", anchorTarget.getAttribute("y"));
                document.getElementById("PdfMarkupAnchorW" + annoId).setAttribute("x", anchorTarget.getAttribute("x"));
                break;
            case "PdfMarkupAnchorNE" + annoId:
                _dragEditEllipseVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "N");
                _dragEditEllipseHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "E");
                document.getElementById("PdfMarkupAnchorN" + annoId).setAttribute("y", anchorTarget.getAttribute("y"));
                document.getElementById("PdfMarkupAnchorE" + annoId).setAttribute("x", anchorTarget.getAttribute("x"));
                break;
            case "PdfMarkupAnchorSE" + annoId:
                _dragEditEllipseVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "S");
                _dragEditEllipseHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "E");
                document.getElementById("PdfMarkupAnchorS" + annoId).setAttribute("y", anchorTarget.getAttribute("y"));
                document.getElementById("PdfMarkupAnchorE" + annoId).setAttribute("x", anchorTarget.getAttribute("x"));
                break;
            case "PdfMarkupAnchorSW" + annoId:
                _dragEditEllipseVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "S");
                _dragEditEllipseHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "W");
                document.getElementById("PdfMarkupAnchorS" + annoId).setAttribute("y", anchorTarget.getAttribute("y"));
                document.getElementById("PdfMarkupAnchorW" + annoId).setAttribute("x", anchorTarget.getAttribute("x"));
                break;
            case "PdfMarkupAnchorN" + annoId:
                _dragEditEllipseVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "N");
                break;
            case "PdfMarkupAnchorS" + annoId:
                _dragEditEllipseVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "S");
                break;
            case "PdfMarkupAnchorE" + annoId:
                _dragEditEllipseHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "E");
                break;
            case "PdfMarkupAnchorW" + annoId:
                _dragEditEllipseHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "W");
                break;
            default:
                break;
        }
    }

   /**
    * Edit a ellipse markup's height by dragging an anchor point
    * Should only be called for anchors which can move on a vertical axis: N, S, NE, NW, SE, SW
    * @param {HTMLElement} markupTarget The markup dom element being altered
    * @param {HTMLElement} anchorTarget The anchor dom element receiving the event
    * @param {number} deltaY The distance being moved in pixels
    * @param {JSON} parsedAnno The parsed representation of the markup
    * @param {string} anchorLetter The letter representing the anchor selected (e.g "N" for north)
    * @private
    * @memberof ThingView
    **/
    function _dragEditEllipseVerticalAnchor (markupTarget, anchorTarget, deltaY, parsedAnno, anchorLetter) {
        var newRy;
        var annoId = parsedAnno.id;
        if (anchorLetter == "N") {
            newRy = parseFloat(markupTarget.getAttribute("ry")) - (deltaY / 2);
        } else {
            newRy = parseFloat(markupTarget.getAttribute("ry")) + (deltaY / 2);
        }
        if (newRy > 0) {
            if (anchorLetter == "N") {
                document.getElementById("PdfMarkupAnchorBox" + parsedAnno.id).setAttribute("y", parseFloat(document.getElementById("PdfMarkupAnchorBox" + parsedAnno.id).getAttribute("y")) + deltaY);
                if (parsedAnno.vertices[3] > parsedAnno.vertices[1]) {
                    parsedAnno.vertices[3] -= (deltaY / __ZOOMSCALE);
                } else {
                    parsedAnno.vertices[1] -= (deltaY / __ZOOMSCALE);
                }
            } else {
                if (parsedAnno.vertices[3] > parsedAnno.vertices[1]) {
                    parsedAnno.vertices[1] -= (deltaY / __ZOOMSCALE);
                } else {
                    parsedAnno.vertices[3] -= (deltaY / __ZOOMSCALE);
                }
            }
            markupTarget.setAttribute("cy", parseFloat(markupTarget.getAttribute("cy")) + (deltaY / 2));
            markupTarget.setAttribute("ry", newRy);
            const selector = markupTarget.parentNode.querySelector(".PdfMarkupSelector");
            if (selector) {
                selector.setAttribute("cy", parseFloat(selector.getAttribute("cy")) + (deltaY / 2));
                selector.setAttribute("ry", newRy);
            }
            anchorTarget.setAttribute("y", parseFloat(anchorTarget.getAttribute("y")) + deltaY);
            document.getElementById("PdfMarkupAnchor" + anchorLetter + "E" + annoId).setAttribute("y", anchorTarget.getAttribute("y"));
            document.getElementById("PdfMarkupAnchor" + anchorLetter + "W" + annoId).setAttribute("y", anchorTarget.getAttribute("y"));
            document.getElementById("PdfMarkupAnchorE" + annoId).setAttribute("y", parseFloat(document.getElementById("PdfMarkupAnchorE" + annoId).getAttribute("y")) + (deltaY/2));
            document.getElementById("PdfMarkupAnchorW" + annoId).setAttribute("y", document.getElementById("PdfMarkupAnchorE" + annoId).getAttribute("y"));
            document.getElementById("PdfMarkupAnchorBox" + annoId).setAttribute("height", (newRy + parsedAnno.boxDiffs[3] * __ZOOMSCALE) * 2);
            return false;
        }
    }

    /**
    * Edit a ellipse markup's width by dragging an anchor point
    * Should only be called for anchors which can move on a horizontal axis: E, W, NE, NW, SE, SW
    * @param {HTMLElement} markupTarget The markup dom element being altered
    * @param {HTMLElement} anchorTarget The anchor dom element receiving the event
    * @param {number} deltaX The distance being moved in pixels
    * @param {JSON} parsedAnno The parsed representation of the markup
    * @param {string} anchorLetter The letter representing the anchor selected (e.g "E" for east)
    * @private
    * @memberof ThingView
    **/
    function _dragEditEllipseHorizontalAnchor (markupTarget, anchorTarget, deltaX, parsedAnno, anchorLetter) {
        var newRx;
        var annoId = parsedAnno.id;
        if (anchorLetter == "W") {
            newRx = parseFloat(markupTarget.getAttribute("rx")) - (deltaX / 2);
        } else {
            newRx = parseFloat(markupTarget.getAttribute("rx")) + (deltaX / 2);
        }
        if (newRx > 0) {
            if (anchorLetter == "W") {
                document.getElementById("PdfMarkupAnchorBox" + annoId).setAttribute("x", parseFloat(document.getElementById("PdfMarkupAnchorBox" + annoId).getAttribute("x")) + deltaX);
                if (parsedAnno.vertices[0] < parsedAnno.vertices[2]) {
                    parsedAnno.vertices[0] += (deltaX / __ZOOMSCALE);
                } else {
                    parsedAnno.vertices[2] += (deltaX / __ZOOMSCALE);
                }
            } else {
                if (parsedAnno.vertices[0] < parsedAnno.vertices[2]) {
                    parsedAnno.vertices[2] += (deltaX / __ZOOMSCALE);
                } else {
                    parsedAnno.vertices[0] += (deltaX / __ZOOMSCALE);
                }
            }
            markupTarget.setAttribute("cx", parseFloat(markupTarget.getAttribute("cx")) + (deltaX / 2));
            markupTarget.setAttribute("rx", newRx);
            const selector = markupTarget.parentNode.querySelector(".PdfMarkupSelector");
            if (selector) {
                selector.setAttribute("cx", parseFloat(selector.getAttribute("cx")) + (deltaX / 2));
                selector.setAttribute("rx", newRx);
            }
            anchorTarget.setAttribute("x", parseFloat(anchorTarget.getAttribute("x")) + deltaX);
            document.getElementById("PdfMarkupAnchorN" + anchorLetter + annoId).setAttribute("x", anchorTarget.getAttribute("x"));
            document.getElementById("PdfMarkupAnchorS" + anchorLetter + annoId).setAttribute("x", anchorTarget.getAttribute("x"));
            document.getElementById("PdfMarkupAnchorN" + annoId).setAttribute("x", parseFloat(document.getElementById("PdfMarkupAnchorN" + annoId).getAttribute("x")) + (deltaX/2));
            document.getElementById("PdfMarkupAnchorS" + annoId).setAttribute("x", document.getElementById("PdfMarkupAnchorN" + annoId).getAttribute("x"));
            document.getElementById("PdfMarkupAnchorBox" + annoId).setAttribute("width", (newRx + parsedAnno.boxDiffs[2] * __ZOOMSCALE) * 2);
        }
    }

    function _dragEditLeaderLineMarkup (anchorTarget, markupTarget, deltaX, deltaY, polygon) {
        const annoId = _getMarkupDatasetAnnoId(anchorTarget);
        const anchorId = parseInt(anchorTarget.dataset.anchorid);

        // update polylines & polygons
        var shapes = markupTarget.parentNode.querySelectorAll("polyline, polygon");
        for (var shape of shapes) {
            var p = shape.points.getItem(anchorId);
            p.x += deltaX;
            p.y += deltaY;
        }

        // update annotation
        const parsedAnno = _pdfParsedAnnotationSet[annoId];
        if (!parsedAnno) return;
        parsedAnno.vertices[anchorId*2] += (deltaX / __ZOOMSCALE);
        parsedAnno.vertices[anchorId*2+1] -= (deltaY / __ZOOMSCALE);

        if (polygon === true && anchorId === 0) {
            parsedAnno.vertices[parsedAnno.vertices.length-2] += (deltaX / __ZOOMSCALE);
            parsedAnno.vertices[parsedAnno.vertices.length-1] -= (deltaY / __ZOOMSCALE);
        }

        // update anchor rects
        anchorTarget.setAttribute("x", parseFloat(anchorTarget.getAttribute("x")) + deltaX);
        anchorTarget.setAttribute("y", parseFloat(anchorTarget.getAttribute("y")) + deltaY);
    }

    function _dropEditLeaderLineMarkup (anchorTarget) {
        const annoId = _getMarkupDatasetAnnoId(anchorTarget);
        const parsedAnno = _pdfParsedAnnotationSet[annoId];
        if (!parsedAnno) return;

        var minX = Number.MAX_VALUE, minY = Number.MAX_VALUE,
            maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE;
        for (var i=0;i<parsedAnno.vertices.length/2;i++) {
            minX = Math.min(minX, parsedAnno.vertices[i*2]);
            maxX = Math.max(maxX, parsedAnno.vertices[i*2]);
            minY = Math.min(minY, parsedAnno.vertices[i*2+1]);
            maxY = Math.max(maxY, parsedAnno.vertices[i*2+1]);
        }

        var width = 1;
        if (parsedAnno.borderStyle &&
            parsedAnno.borderStyle.width &&
            parsedAnno.borderStyle.width != -1) {
            width = parsedAnno.borderStyle.width;
        }
        parsedAnno.boundingBox[0] = minX - width;
        parsedAnno.boundingBox[1] = maxY + width;
        parsedAnno.boundingBox[2] = maxX + width;
        parsedAnno.boundingBox[3] = minY - width;
    }

    function _dragEditNoteMarkup (anchorTarget, markupTarget, deltaX, deltaY) {
        const parsedAnno = _pdfParsedAnnotationSet[_getMarkupDatasetAnnoId(anchorTarget)];
        if (!parsedAnno) return;
        var annoId = parsedAnno.id;
        switch (anchorTarget.id) {
            case "PdfMarkupAnchorL" + annoId:
                _repositionNoteLeaderLine(anchorTarget, markupTarget, deltaX, deltaY, parsedAnno);
                break;
            case "PdfMarkupAnchorM" + annoId:
                _repositionNoteLeaderLine(anchorTarget, markupTarget, deltaX, deltaY, parsedAnno, false);
                break;
            case "PdfMarkupAnchorE" + annoId:
                _dragEditNoteHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "E");
                break;
            case "PdfMarkupAnchorW" + annoId:
                _dragEditNoteHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "W");
                break;
            case "PdfMarkupAnchorN" + annoId:
                _dragEditNoteVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "N");
                break;
            case "PdfMarkupAnchorS" + annoId:
                _dragEditNoteVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "S");
                break;
            case "PdfMarkupAnchorNE" + annoId:
                _dragEditNoteVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "N");
                _dragEditNoteHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "E");
                document.getElementById("PdfMarkupAnchorN" + annoId).setAttribute("y", anchorTarget.getAttribute("y"));
                document.getElementById("PdfMarkupAnchorE" + annoId).setAttribute("x", anchorTarget.getAttribute("x"));
                break;
            case "PdfMarkupAnchorNW" + annoId:
                _dragEditNoteVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "N");
                _dragEditNoteHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "W");
                document.getElementById("PdfMarkupAnchorN" + annoId).setAttribute("y", anchorTarget.getAttribute("y"));
                document.getElementById("PdfMarkupAnchorW" + annoId).setAttribute("x", anchorTarget.getAttribute("x"));
                break;
            case "PdfMarkupAnchorSE" + annoId:
                _dragEditNoteVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "S");
                _dragEditNoteHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "E");
                document.getElementById("PdfMarkupAnchorS" + annoId).setAttribute("y", anchorTarget.getAttribute("y"));
                document.getElementById("PdfMarkupAnchorE" + annoId).setAttribute("x", anchorTarget.getAttribute("x"));
                break;
            case "PdfMarkupAnchorSW" + annoId:
                _dragEditNoteVerticalAnchor(markupTarget, anchorTarget, deltaY, parsedAnno, "S");
                _dragEditNoteHorizontalAnchor(markupTarget, anchorTarget, deltaX, parsedAnno, "W");
                document.getElementById("PdfMarkupAnchorS" + annoId).setAttribute("y", anchorTarget.getAttribute("y"));
                document.getElementById("PdfMarkupAnchorW" + annoId).setAttribute("x", anchorTarget.getAttribute("x"));
                break;
            default:
                break;
        }
    }

    function _getTextTotalHeight (text) {
        const spans = text.querySelectorAll("tspan");
        var lineHeight = 0;
        for (const span of spans) {
            const height = parseFloat(window.getComputedStyle(span).fontSize);
            if (height > lineHeight) {
                lineHeight = height;
                break;
            }
        }
        return (lineHeight * spans.length);
    }

    function _dragEditNoteHorizontalAnchor (markupTarget, anchorTarget, deltaX, parsedAnno, anchorLetter) {
        const textDiv = markupTarget.parentNode.querySelector("foreignObject");
        if (!textDiv) return;
        var newWidth;
        const annoId = parsedAnno.id;
        if (anchorLetter == "W") {
            newWidth = parseFloat(markupTarget.getAttribute("width")) - deltaX;
        } else {
            newWidth = parseFloat(markupTarget.getAttribute("width")) + deltaX;
        }
        if (newWidth >= _uiSizes.noteMarkup.minWidth) {
            const anchorBox = anchorTarget.parentNode.querySelector("#PdfMarkupAnchorBox" + annoId);
            const setX = function () {
                _applyDeltaToNodeValue(markupTarget, "x", deltaX);
                _applyDeltaToNodeValue(anchorBox, "x", deltaX);
            };
            const setWidth = function () {
                textDiv.setAttribute("width", newWidth);
            };
            const setHeight = function () {
                textDiv.setAttribute("height", newWidth - _uiSizes.noteMarkup.padding[2] * __ZOOMSCALE);
            };
            switch (parsedAnno.rotation) {
                default:
                case 0: {
                    if (anchorLetter == "W") {
                        setX();
                        setWidth();
                        _applyDeltaToNodeValue(textDiv, "x", deltaX);
                    } else if (anchorLetter == "E") {
                        setWidth();
                    }
                } break;
                case 90: {
                    if (anchorLetter == "W") {
                        setX();
                        setHeight();
                        _applyDeltaToNodeValue(textDiv, "y", deltaX);
                    } else if (anchorLetter == "E") {
                        setHeight();
                    }
                } break;
                case 180: {
                    if (anchorLetter == "W") {
                        setX();
                        setWidth();
                    } else if (anchorLetter == "E") {
                        setWidth();
                        _applyDeltaToNodeValue(textDiv, "x", -deltaX);
                    }
                } break;
                case 270: {
                    if (anchorLetter == "W") {
                        setX();
                        setHeight();
                    } else if (anchorLetter == "E") {
                        setHeight();
                        _applyDeltaToNodeValue(textDiv, "y", -deltaX);
                    }
                } break;
            }
            markupTarget.setAttribute("width", newWidth);
            _applyDeltaToNodeValue(anchorTarget, "x", deltaX);
            document.getElementById("PdfMarkupAnchorN" + anchorLetter + annoId).setAttribute("x", anchorTarget.getAttribute("x"));
            document.getElementById("PdfMarkupAnchorS" + anchorLetter + annoId).setAttribute("x", anchorTarget.getAttribute("x"));
            const anchorN = anchorTarget.parentNode.querySelector("#PdfMarkupAnchorN" + annoId);
            _applyDeltaToNodeValue(anchorN, "x", deltaX/2);
            document.getElementById("PdfMarkupAnchorS" + annoId).setAttribute("x", anchorN.getAttribute("x"));
            anchorBox.setAttribute("width", newWidth);
            if (parsedAnno.leaderLineVertices.length > 0) {
                const leaderLines = markupTarget.parentNode.querySelectorAll("polyline");
                const l0p1 = leaderLines[0].points.getItem(1);
                const l0p2 = leaderLines[0].points.getItem(2);
                const l1p1 = leaderLines[1].points.getItem(1);
                const l1p2 = leaderLines[1].points.getItem(2);
                if (parsedAnno.leaderLineVertices[2] == parsedAnno.leaderLineVertices[4]) {
                    const newX = parseFloat(anchorBox.getAttribute("x")) + newWidth / 2;
                    l0p1.x = newX; l1p1.x = l0p1.x;
                    l0p2.x = newX; l1p2.x = l0p2.x;
                    parsedAnno.leaderLineVertices[2] = newX / __ZOOMSCALE;
                    parsedAnno.leaderLineVertices[4] = newX / __ZOOMSCALE;
                } else {
                    if ((anchorLetter == "W" && parsedAnno.leaderLineVertices[2] < parsedAnno.leaderLineVertices[4]) ||
                        (anchorLetter == "E" && parsedAnno.leaderLineVertices[2] > parsedAnno.leaderLineVertices[4])) {
                            l0p1.x += deltaX; l1p1.x = l0p1.x;
                            l0p2.x += deltaX; l1p2.x = l0p2.x;
                            parsedAnno.leaderLineVertices[2] += deltaX / __ZOOMSCALE;
                            parsedAnno.leaderLineVertices[4] += deltaX / __ZOOMSCALE;
                    }
                }

                const anchorM = anchorTarget.parentNode.querySelector("#PdfMarkupAnchorM" + parsedAnno.id);
                if (anchorM) {
                    anchorM.setAttribute("x", l0p1.x - _uiSizes.anchor.width / 2);
                    anchorM.setAttribute("y", l0p1.y - _uiSizes.anchor.height / 2);
                }
            }
            const pageHeight = parseFloat(document.getElementById("PdfAnnotationCanvas" + (parsedAnno.pageNo+1)).clientHeight);
            parsedAnno.boundingBox = _getNewNoteBoundingBox(markupTarget, pageHeight, parsedAnno);

            //update text clip path
            const x1 = parseFloat(markupTarget.getAttribute("x"));
            const y1 = parseFloat(markupTarget.getAttribute("y"));
            const x2 = x1 + parseFloat(markupTarget.getAttribute("width"));
            const y2 = y1 + parseFloat(markupTarget.getAttribute("height"));
            const clipPathPolygon = markupTarget.parentNode.querySelector("polygon");
            const cpp0 = clipPathPolygon.points.getItem(0), cpp1 = clipPathPolygon.points.getItem(1),
                  cpp2 = clipPathPolygon.points.getItem(2), cpp3 = clipPathPolygon.points.getItem(3);
            cpp0.x = x1 - 2; cpp0.y = y1 - 2;
            cpp1.x = x2 + 2; cpp1.y = y1 - 2;
            cpp2.x = x2 + 2; cpp2.y = y2 + 2;
            cpp3.x = x1 - 2; cpp3.y = y2 + 2;

            if (parsedAnno.leaderLineVertices.length > 0) {
                const dx1 = Math.abs(parsedAnno.boundingBox[0] - (x1 / __ZOOMSCALE));
                const dy1 = Math.abs(parsedAnno.boundingBox[3] - ((pageHeight - y2) / __ZOOMSCALE));
                const dx2 = Math.abs(parsedAnno.boundingBox[2] - (x2 / __ZOOMSCALE));
                const dy2 = Math.abs(parsedAnno.boundingBox[1] - ((pageHeight - y1)/ __ZOOMSCALE));
                parsedAnno.boxDiffs = [dx1, dy1, dx2, dy2];
            }
        }
    }

    function _dragEditNoteVerticalAnchor (markupTarget, anchorTarget, deltaY, parsedAnno, anchorLetter) {
        const textDiv = markupTarget.parentNode.querySelector("foreignObject");
        if (!textDiv) return;
        var newHeight;
        const annoId = parsedAnno.id;
        if (anchorLetter == "N") {
            newHeight = parseFloat(markupTarget.getAttribute("height")) - deltaY;
        } else {
            newHeight = parseFloat(markupTarget.getAttribute("height")) + deltaY;
        }
        if (newHeight >= _uiSizes.noteMarkup.minHeight) {
            const anchorBox = anchorTarget.parentNode.querySelector("#PdfMarkupAnchorBox" + annoId);
            const setY = function () {
                _applyDeltaToNodeValue(markupTarget, "y", deltaY);
                _applyDeltaToNodeValue(anchorBox, "y", deltaY);
            };
            const setWidth = function () {
                textDiv.setAttribute("width", newHeight);
            };
            const setHeight = function () {
                textDiv.setAttribute("height", newHeight - _uiSizes.noteMarkup.padding[2] * __ZOOMSCALE);
            };
            switch (parsedAnno.rotation) {
                default:
                case 0: {
                    if (anchorLetter == "N") {
                        setY();
                        setHeight();
                        _applyDeltaToNodeValue(textDiv, "y", deltaY);
                    } else if (anchorLetter == "S") {
                        setHeight();
                    }
                } break;
                case 90: {
                    if (anchorLetter == "N") {
                        setY();
                        setWidth();
                    } else if (anchorLetter == "S") {
                        _applyDeltaToNodeValue(textDiv, "x", -deltaY);
                        setWidth();
                    }
                } break;
                case 180: {
                    if (anchorLetter == "N") {
                        setY();
                        setHeight();
                    } else if (anchorLetter == "S") {
                        setHeight();
                        _applyDeltaToNodeValue(textDiv, "y", -deltaY);
                    }
                } break;
                case 270: {
                    if (anchorLetter == "N") {
                        setY();
                        setWidth();
                        _applyDeltaToNodeValue(textDiv, "x", deltaY);
                    } else if (anchorLetter == "S") {
                        setWidth();
                    }
                } break;
            }
            markupTarget.setAttribute("height", newHeight);
            _applyDeltaToNodeValue(anchorTarget, "y", deltaY);
            document.getElementById("PdfMarkupAnchor" + anchorLetter + "E" + annoId).setAttribute("y", anchorTarget.getAttribute("y"));
            document.getElementById("PdfMarkupAnchor" + anchorLetter + "W" + annoId).setAttribute("y", anchorTarget.getAttribute("y"));
            const anchorE = anchorTarget.parentNode.querySelector("#PdfMarkupAnchorE" + annoId);
            _applyDeltaToNodeValue(anchorE, "y", deltaY/2);
            document.getElementById("PdfMarkupAnchorW" + annoId).setAttribute("y", anchorE.getAttribute("y"));
            anchorBox.setAttribute("height", newHeight);

            const pageHeight = parseFloat(document.getElementById("PdfAnnotationCanvas" + (parsedAnno.pageNo+1)).clientHeight);
            if (parsedAnno.leaderLineVertices.length > 0) {
                const leaderLines = markupTarget.parentNode.querySelectorAll("polyline");
                const l0p1 = leaderLines[0].points.getItem(1);
                const l0p2 = leaderLines[0].points.getItem(2);
                const l1p1 = leaderLines[1].points.getItem(1);
                const l1p2 = leaderLines[1].points.getItem(2);
                if (parsedAnno.leaderLineVertices[2] == parsedAnno.leaderLineVertices[4]) {
                    //lines on the vertical
                    if ((parsedAnno.leaderLineVertices[3] < parsedAnno.leaderLineVertices[5] && anchorLetter == "S") ||
                        (parsedAnno.leaderLineVertices[3] > parsedAnno.leaderLineVertices[5] && anchorLetter == "N")) {
                        l0p1.y += deltaY; l1p1.y = l0p1.y;
                        l0p2.y += deltaY; l1p2.y = l0p2.y;
                        parsedAnno.leaderLineVertices[3] -= deltaY / __ZOOMSCALE;
                        parsedAnno.leaderLineVertices[5] -= deltaY / __ZOOMSCALE;
                    }
                } else {
                    //lines on the horizontal
                    const newY = parseFloat(anchorBox.getAttribute("y")) + newHeight / 2;
                    l0p1.y = newY; l1p1.y = l0p1.y;
                    l0p2.y = newY; l1p2.y = l0p2.y;
                    parsedAnno.leaderLineVertices[3] = (pageHeight - newY) / __ZOOMSCALE;
                    parsedAnno.leaderLineVertices[5] = (pageHeight - newY) / __ZOOMSCALE;
                }

                const anchorM = anchorTarget.parentNode.querySelector("#PdfMarkupAnchorM" + parsedAnno.id);
                if (anchorM) {
                    anchorM.setAttribute("x", l0p1.x - _uiSizes.anchor.width / 2);
                    anchorM.setAttribute("y", l0p1.y - _uiSizes.anchor.height / 2);
                }
            }
            parsedAnno.boundingBox = _getNewNoteBoundingBox(markupTarget, pageHeight, parsedAnno);

            //update text clip path
            const x1 = parseFloat(markupTarget.getAttribute("x"));
            const y1 = parseFloat(markupTarget.getAttribute("y"));
            const x2 = x1 + parseFloat(markupTarget.getAttribute("width"));
            const y2 = y1 + parseFloat(markupTarget.getAttribute("height"));
            const clipPathPolygon = markupTarget.parentNode.querySelector("polygon");
            const cpp0 = clipPathPolygon.points.getItem(0), cpp1 = clipPathPolygon.points.getItem(1),
                  cpp2 = clipPathPolygon.points.getItem(2), cpp3 = clipPathPolygon.points.getItem(3);
            cpp0.x = x1 - 2; cpp0.y = y1 - 2;
            cpp1.x = x2 + 2; cpp1.y = y1 - 2;
            cpp2.x = x2 + 2; cpp2.y = y2 + 2;
            cpp3.x = x1 - 2; cpp3.y = y2 + 2;

            //update box diffs
            if (parsedAnno.leaderLineVertices.length > 0) {
                const dx1 = Math.abs(parsedAnno.boundingBox[0] - (x1 / __ZOOMSCALE));
                const dy1 = Math.abs(parsedAnno.boundingBox[3] - ((pageHeight - y2) / __ZOOMSCALE));
                const dx2 = Math.abs(parsedAnno.boundingBox[2] - (x2 / __ZOOMSCALE));
                const dy2 = Math.abs(parsedAnno.boundingBox[1] - ((pageHeight - y1)/ __ZOOMSCALE));
                parsedAnno.boxDiffs = [dx1, dy1, dx2, dy2];
            }
        }
    }

    function _repositionNoteLeaderLine (anchorTarget, markupTarget, deltaX, deltaY, parsedAnno, endPoint) {
        const pageHeight = parseFloat(document.querySelector("#PdfAnnotationCanvas" + (parsedAnno.pageNo+1)).clientHeight);
        const polylines = markupTarget.parentNode.querySelectorAll("polyline");
        if (!polylines.length) return;
        const p0 = polylines[0].points.getItem(0);
        const p1 = polylines[0].points.getItem(1);
        const p2 = polylines[0].points.getItem(2);
        if (endPoint === true) {
            p1.x += deltaX; p1.y += deltaY;
            parsedAnno.leaderLineVertices[2] += (deltaX / __ZOOMSCALE);
            parsedAnno.leaderLineVertices[3] -= (deltaY / __ZOOMSCALE);

            p2.x += deltaX; p2.y += deltaY;
            parsedAnno.leaderLineVertices[4] += (deltaX / __ZOOMSCALE);
            parsedAnno.leaderLineVertices[5] -= (deltaY / __ZOOMSCALE);
        } else if (endPoint === false) {
            const tailLength = 12 * __ZOOMSCALE;
            if (p1.x == p2.x) {
                if (p1.y < p2.y) {
                    p1.y = Math.min(p1.y + deltaY, p2.y - tailLength);
                } else {
                    p1.y = Math.max(p1.y + deltaY, p2.y + tailLength);
                }
                parsedAnno.leaderLineVertices[3] = ((pageHeight - p1.y) / __ZOOMSCALE);
            } else {
                if (p1.x < p2.x) {
                    p1.x = Math.min(p1.x + deltaX, p2.x - tailLength);
                } else {
                    p1.x = Math.max(p1.x + deltaX, p2.x + tailLength);
                }
                parsedAnno.leaderLineVertices[2] = (p1.x / __ZOOMSCALE);
            }
        } else {
            p0.x += deltaX; p0.y += deltaY;
            parsedAnno.leaderLineVertices[0] += (deltaX / __ZOOMSCALE);
            parsedAnno.leaderLineVertices[1] -= (deltaY / __ZOOMSCALE);
        }

        const x0 = parseFloat(markupTarget.getAttribute("x")) + (parseFloat(markupTarget.getAttribute("width")) / 2);
        const y0 = parseFloat(markupTarget.getAttribute("y")) + (parseFloat(markupTarget.getAttribute("height")) / 2);

        const theta = Math.atan2(y0 - p0.y, x0 - p0.x) * (180 / Math.PI);
        var axisSwitched = false;
        if (p1.x == p2.x) {
            if (p1.y > p2.y) {
                if (theta < -112.5) {
                    p2.x = parseFloat(markupTarget.getAttribute("x")) + parseFloat(markupTarget.getAttribute("width"));
                    p2.y = parseFloat(markupTarget.getAttribute("y")) + (parseFloat(markupTarget.getAttribute("height")) / 2);
                    p1.x = p2.x + (12 * __ZOOMSCALE);
                    p1.y = p2.y;
                    axisSwitched = true;
                } else if (theta > -67.5){
                    p2.x = parseFloat(markupTarget.getAttribute("x"));
                    p2.y = parseFloat(markupTarget.getAttribute("y")) + (parseFloat(markupTarget.getAttribute("height")) / 2);
                    p1.x = p2.x - (12 * __ZOOMSCALE);
                    p1.y = p2.y;
                    axisSwitched = true;
                }
            } else {
                if (theta < 67.5) {
                    p2.x = parseFloat(markupTarget.getAttribute("x"));
                    p2.y = parseFloat(markupTarget.getAttribute("y")) + (parseFloat(markupTarget.getAttribute("height")) / 2);
                    p1.x = p2.x - (12 * __ZOOMSCALE);
                    p1.y = p2.y;
                    axisSwitched = true;
                } else if (theta > 112.5) {
                    p2.x = parseFloat(markupTarget.getAttribute("x")) + parseFloat(markupTarget.getAttribute("width"));
                    p2.y = parseFloat(markupTarget.getAttribute("y")) + (parseFloat(markupTarget.getAttribute("height")) / 2);
                    p1.x = p2.x + (12 * __ZOOMSCALE);
                    p1.y = p2.y;
                    axisSwitched = true;
                }
            }
        } else if (p1.x < p2.x) {
            if (theta > 67.5) {
                p2.x = parseFloat(markupTarget.getAttribute("x")) + (parseFloat(markupTarget.getAttribute("width")) / 2);
                p2.y = parseFloat(markupTarget.getAttribute("y"));
                p1.x = p2.x;
                p1.y = p2.y - (12 * __ZOOMSCALE);
                axisSwitched = true;
            } else if (theta < -67.5) {
                p2.x = parseFloat(markupTarget.getAttribute("x")) + (parseFloat(markupTarget.getAttribute("width")) / 2);
                p2.y = parseFloat(markupTarget.getAttribute("y")) + parseFloat(markupTarget.getAttribute("height"));
                p1.x = p2.x;
                p1.y = p2.y + (12 * __ZOOMSCALE);
                axisSwitched = true;
            }
        } else {
            if (theta > 90 && theta < 112.5) {
                p2.x = parseFloat(markupTarget.getAttribute("x")) + (parseFloat(markupTarget.getAttribute("width")) / 2);
                p2.y = parseFloat(markupTarget.getAttribute("y"));
                p1.x = p2.x;
                p1.y = p2.y - (12 * __ZOOMSCALE);
                axisSwitched = true;
            } else if (theta < -90 && theta > -112.5) {
                p2.x = parseFloat(markupTarget.getAttribute("x")) + (parseFloat(markupTarget.getAttribute("width")) / 2);
                p2.y = parseFloat(markupTarget.getAttribute("y")) + parseFloat(markupTarget.getAttribute("height"));
                p1.x = p2.x;
                p1.y = p2.y + (12 * __ZOOMSCALE);
                axisSwitched = true;
            }
        }

        if (polylines.length == 2) {
            const pl0 = polylines[1].points.getItem(0);
            pl0.x = p0.x; pl0.y = p0.y;
            const pl1 = polylines[1].points.getItem(1);
            pl1.x = p1.x; pl1.y = p1.y;
            const pl2 = polylines[1].points.getItem(2);
            pl2.x = p2.x; pl2.y = p2.y;
        }

        if (axisSwitched) {
            parsedAnno.leaderLineVertices[2] = (p1.x / __ZOOMSCALE);
            parsedAnno.leaderLineVertices[3] = ((pageHeight - p1.y) / __ZOOMSCALE);
            parsedAnno.leaderLineVertices[4] = (p2.x / __ZOOMSCALE);
            parsedAnno.leaderLineVertices[5] = ((pageHeight - p2.y) / __ZOOMSCALE);
        }

        parsedAnno.boundingBox = _getNewNoteBoundingBox(markupTarget, pageHeight, parsedAnno);

        const anchorParent = anchorTarget.parentNode;
        const anchorL = anchorParent.querySelector("#PdfMarkupAnchorL" + parsedAnno.id);
        if (anchorL) {
            anchorL.setAttribute("x", p0.x - _uiSizes.anchor.width / 2);
            anchorL.setAttribute("y", p0.y - _uiSizes.anchor.height / 2);
        }
        const anchorM = anchorParent.querySelector("#PdfMarkupAnchorM" + parsedAnno.id);
        if (anchorM) {
            anchorM.setAttribute("x", p1.x - _uiSizes.anchor.width / 2);
            anchorM.setAttribute("y", p1.y - _uiSizes.anchor.height / 2);
        }

        //update box diffs
        if (parsedAnno.leaderLineVertices.length > 0) {
            var x1 = parseFloat(markupTarget.getAttribute("x"));
            var y1 = parseFloat(markupTarget.getAttribute("y"));
            var x2 = parseFloat(markupTarget.getAttribute("x")) + parseFloat(markupTarget.getAttribute("width"));
            var y2 = parseFloat(markupTarget.getAttribute("y")) + parseFloat(markupTarget.getAttribute("height"));
            var dx1 = Math.abs(parsedAnno.boundingBox[0] - (x1 / __ZOOMSCALE));
            var dy1 = Math.abs(parsedAnno.boundingBox[3] - ((pageHeight - y2) / __ZOOMSCALE));
            var dx2 = Math.abs(parsedAnno.boundingBox[2] - (x2 / __ZOOMSCALE));
            var dy2 = Math.abs(parsedAnno.boundingBox[1] - ((pageHeight - y1)/ __ZOOMSCALE));
            parsedAnno.boxDiffs = [dx1, dy1, dx2, dy2];
        }
    }

    function _getNewNoteBoundingBox (markupTarget, pageHeight, parsedAnno) {
        var bx1 = parseFloat(markupTarget.getAttribute("x")) / __ZOOMSCALE;
        var by1 = (pageHeight - parseFloat(markupTarget.getAttribute("y"))) / __ZOOMSCALE;
        var bx2 = (parseFloat(markupTarget.getAttribute("x")) + parseFloat(markupTarget.getAttribute("width"))) / __ZOOMSCALE;
        var by2 = (pageHeight - (parseFloat(markupTarget.getAttribute("y")) + parseFloat(markupTarget.getAttribute("height")))) / __ZOOMSCALE;

        if (parsedAnno.leaderLineVertices && parsedAnno.leaderLineVertices.length == 6) {
            bx1 = Math.min(bx1, parsedAnno.leaderLineVertices[0], parsedAnno.leaderLineVertices[2], parsedAnno.leaderLineVertices[4]);
            by1 = Math.max(by1, parsedAnno.leaderLineVertices[1], parsedAnno.leaderLineVertices[3], parsedAnno.leaderLineVertices[5]);
            bx2 = Math.max(bx2, parsedAnno.leaderLineVertices[0], parsedAnno.leaderLineVertices[2], parsedAnno.leaderLineVertices[4]);
            by2 = Math.min(by2, parsedAnno.leaderLineVertices[1], parsedAnno.leaderLineVertices[3], parsedAnno.leaderLineVertices[5]);
        }

        return [bx1, by1, bx2, by2];
    }

    function _handleNoteEditTextEvent (e) {
        switch (e.type) {
            case "dblclick":
                const annoId = _getMarkupDatasetAnnoId(e.target);
                if (_editNoteMarkup(annoId, {x: e.clientX, y: e.clientY})) {
                    e.preventDefault();
                }
                break;
            default:
                break;
        }
    }

    function _editNoteMarkup(annoId, mousePos) {
        const markupTarget = document.getElementById("PdfAnnotationElement" + annoId);
        const parsedAnno = _pdfParsedAnnotationSet[annoId];
        if (markupTarget && parsedAnno && (parsedAnno.type == _markupTypes.note || parsedAnno.type == _markupTypes.noteLeader)) {
            _markupEdit.edit = true;
            _markupEdit.idNo = annoId;
            _markupEdit.note.zoom = __ZOOMSCALE;
            _markupEdit.note.pageRotated = _checkPageRotated();
            _createNoteEditCanvas(mousePos, markupTarget, parsedAnno);
            return true;
        }
        return false;
    }

    function _getNoteMarkupPadding (zoomScale) {
        return _uiSizes.noteMarkup.padding.map(function(val) {return (val * zoomScale).toFixed(2) + 'px';}).join(" ");
    }

    function _createNoteEditCanvas (mousePos, markupTarget, parsedAnno) {
        const anchorBox = document.querySelector("#PdfMarkupAnchorBox" + parsedAnno.id);
        if (anchorBox) {
            const rects = anchorBox.parentNode.parentNode.querySelectorAll("rect");
            for (const rect of rects) {
                rect.style.display = "none";
            }
        }

        _createDynamicNoteCanvas(parsedAnno.pageNo + 1, true);
        const x = parseFloat(markupTarget.getAttribute("x"));
        const y = parseFloat(markupTarget.getAttribute("y"));
        const paddingW = (_uiSizes.noteMarkup.padding[1] + _uiSizes.noteMarkup.padding[3]) * __ZOOMSCALE;
        const paddingH = (_uiSizes.noteMarkup.padding[0] + _uiSizes.noteMarkup.padding[2]) * __ZOOMSCALE;
        const width = parseFloat(markupTarget.getAttribute("width")) - paddingW;
        const height = parseFloat(markupTarget.getAttribute("height")) - paddingH;

        const divWrapper = document.createElement("div");
        divWrapper.id = "PdfMarkupNoteEditor";
        divWrapper.className = "PdfMarkupNoteEditor";
        divWrapper.style.position = "absolute";
        divWrapper.style.left = x + "px";
        divWrapper.style.top = y + "px";
        divWrapper.style.overflow = "hidden";
        divWrapper.style.outline = __ZOOMSCALE + "px solid " + _getColorHex(parsedAnno.outlineColor);
        divWrapper.style.backgroundColor = _getColorHex(parsedAnno.fillColor);

        const editableDiv = document.createElement("div");
        editableDiv.setAttribute("contentEditable", "true");
        editableDiv.style.left = "0px";
        editableDiv.style.top = "0px";
        editableDiv.style.fontFamily = parsedAnno.fontFamily;
        editableDiv.style.color = _getColorHex(parsedAnno.fontColor);
        editableDiv.style.fontSize = parsedAnno.fontSize * __ZOOMSCALE + "px";
        editableDiv.style.textAlign = parsedAnno.textAlignment;
        editableDiv.style.outline = "none";
        editableDiv.style.padding = _getNoteMarkupPadding(__ZOOMSCALE);
        editableDiv.style.whiteSpace = "pre-wrap";
        editableDiv.style.wordBreak = "break-word";
        editableDiv.style.lineHeight = "1.22";
        editableDiv.addEventListener("paste", function (e) {
            e.preventDefault();
            document.execCommand("inserttext", false, e.clipboardData.getData('text/plain'));
        });
        editableDiv.addEventListener("input", function () {
            _pushActionToMarkupHistory(_undoPresets.noteEdit, [parsedAnno]);

            _markupObserver.set("annoSetEdited");
        }, { once: true });

        const getWidth = function (wrapper) {
            return (width + (wrapper === true ? paddingW : 0)) + "px";
        };
        const getHeight = function (wrapper) {
            return (height + (wrapper === true ? paddingH : 0)) + "px";
        }

        if (parsedAnno.rotation == 0) {
            const transform = function (div, wrapper) {
                div.style.width = getWidth(wrapper);
                div.style.minHeight = getHeight(wrapper);
            };
            transform(editableDiv);
            transform(divWrapper, true);
        } else if (parsedAnno.rotation == 90) {
            const transform = function (div, noRot, wrapper) {
                div.style.width = getHeight(wrapper);
                div.style.minHeight = getWidth(wrapper);
                if (noRot) return;
                const transX = parseFloat(markupTarget.getAttribute("height"));
                div.style.transform = `rotate(270deg) translateX(-${transX}px)`;
                div.style.transformOrigin = "0%0%0";
            };
            transform(editableDiv, true);
            transform(divWrapper, false, true);
        } else if (parsedAnno.rotation == 180) {
            const transform = function (div, noRot, wrapper) {
                div.style.width = getWidth(wrapper);
                div.style.minHeight = getHeight(wrapper);
                if (noRot) return;
                const transX = parseFloat(markupTarget.getAttribute("width"));
                const transY = parseFloat(markupTarget.getAttribute("height"));
                div.style.transform = `rotate(180deg) translate(-${transX}px,-${transY}px)`;
                div.style.transformOrigin = "0%0%0";
            };
            transform(editableDiv, true);
            transform(divWrapper, false, true);
        } else if (parsedAnno.rotation == 270) {
            const transform = function (div, noRot, wrapper) {
                div.style.width = getHeight(wrapper);
                div.style.minHeight = getWidth(wrapper);
                if (noRot) return;
                const transY = parseFloat(markupTarget.getAttribute("width"));
                div.style.transform = `rotate(90deg) translateY(-${transY}px)`;
                div.style.transformOrigin = "0%0%0";
            };
            transform(editableDiv, true);
            transform(divWrapper, false, true);
        }

        editableDiv.innerHTML = parsedAnno.content.replace(/&#13;/g, "<br>");

        const dynamicCanvas = document.querySelector("#PdfPageDynamicMarkupCanvas" + (parsedAnno.pageNo + 1));

        divWrapper.appendChild(editableDiv);
        dynamicCanvas.appendChild(divWrapper);

        dynamicCanvas.addEventListener("mousedown", _checkExitNoteEdit);
        dynamicCanvas.addEventListener("keydown", _checkExitNoteEdit);

        markupTarget.style.visibility = "hidden";

        if (mousePos) {
            _updateCursorPosition(mousePos, editableDiv);
        } else {
            editableDiv.focus();
        }
    }

    function _locateCursor (editableDiv, line, col) {
        const text = editableDiv.childNodes[line];
        if (text.nodeName != '#text' || text.nodeType != 3) return;

        const selRange = document.createRange(),
        sel = window.getSelection();

        selRange.setStart(editableDiv.childNodes[line], Math.min(text.length, col));
        selRange.collapse(true);

        sel.removeAllRanges();
        sel.addRange(selRange);
    }

    function _getTextBoundRect (editableDiv, line, start, end) {
        const text = editableDiv.childNodes[line];
        const range = document.createRange();
        range.setStart(editableDiv.childNodes[line], Math.min(text.length, start));
        range.setEnd(editableDiv.childNodes[line], Math.min(text.length, end));
        return _getLocalRect(range.getBoundingClientRect());
    }

    function _locateCursorOnSpan (mouse, editableDiv, spanElem) {
        const mousePos = _getLocalPos(mouse.x, mouse.y);

        const line = Number(spanElem.getAttribute("line"));
        const prevCol = Number(spanElem.getAttribute("prev-length"));

        let nodeId = 0,
            count = 0;
        for (;nodeId<editableDiv.childNodes.length,count!=line;nodeId++) {
            const elem = editableDiv.childNodes[nodeId];
            if (_getTag(elem) == "br") count += 1;
        }

        for (let i = 0; i < spanElem.textContent.length - 1; i++) {
            const col = prevCol + i;
            const charRect = _getTextBoundRect(editableDiv, nodeId, col, col + 1);
            if (charRect.left <= mousePos.x && mousePos.x <= charRect.right &&
                charRect.top <= mousePos.y && mousePos.y <= charRect.bottom) {
                if (mousePos.x < (charRect.left + charRect.width / 2)) {
                    _locateCursor(editableDiv, nodeId, col);
                } else {
                    _locateCursor(editableDiv, nodeId, col + 1);
                }
                break;
            }
        }
    }

    function _locateCursorOnDiv (mouse, editableDiv, divElem) {
        const margin = 1 * __ZOOMSCALE
        const mousePos = _getLocalPos(mouse.x, mouse.y);
        const lineSet = new Set();

        // Collect first word of each line
        const firstWords = divElem.querySelectorAll('[sub-count="0"], br');
        for (let i = 0; i < firstWords.length; i++) {
            const firstWord = firstWords[i];
            const line = firstWord.getAttribute("line");
            if (line != null) lineSet.add(Number(line));
            const rect = _getLocalRect(firstWord.getBoundingClientRect());
            const top = rect.top - margin,
                  bottom = rect.bottom + margin;
            if (top <= mousePos.y && mousePos.y <= bottom) {
                if (!line) {
                    // empty line
                    const brIndex = firstWord.getAttribute("br-index");
                    _locateCursor(editableDiv, Number(brIndex) + lineSet.size, 0);
                    break;
                }
                const subLine = firstWord.getAttribute("sub-line");
                // Collect all words in one line
                const lineWords = divElem.querySelectorAll(`[line="${line}"][sub-line="${subLine}"]`);

                // Check if pick point is left of first word
                const firstLineWord = lineWords[0];
                const firstLineWordRect = _getLocalRect(firstLineWord.getBoundingClientRect());
                if (mousePos.x < firstLineWordRect.left) {
                    const lineNum = Number(firstLineWord.getAttribute("line")) + lineSet.size - 1;
                    const col = Number(firstLineWord.getAttribute("prev-length")); 
                    _locateCursor(editableDiv, lineNum, col);
                    break;
                }

                // Check if pick point is right of last word
                const lastLineWord = lineWords[lineWords.length - 1];
                const lineNum = Number(lastLineWord.getAttribute("line")) + lineSet.size - 1;
                let col = Number(lastLineWord.getAttribute("prev-length")) + lastLineWord.textContent.length;
                if (lastLineWord.textContent.slice(-1) == ' ') col--;
                _locateCursor(editableDiv, lineNum, col);
                break;
            } else if (i == firstWords.length - 1 && bottom < mousePos.y) {
                // Picked empty space below contents
                const length = editableDiv.childNodes.length;
                _locateCursor(editableDiv, length - 1, editableDiv.childNodes[length - 1].textContent.length);
                break;
            }
        }
    }

    function _convertTextToSpan (div) {
        const cloned = div.cloneNode(true);
        cloned.id += "Cloned";
        let uniqueId = 0;
        let lineCount = 0;
        let charCount = 0;
        const re = /<\/?[^>]+>|\s+|[^\s<]+/g;
        cloned.innerHTML = cloned.innerHTML.replace(re, function(match) {
            if (match == "<br>") {
                charCount = 0;
                return `<br br-index="${lineCount++}">`;
            }
            const span = `<span id="spanUId${uniqueId++}" line="${lineCount}" prev-length="${charCount}">${match}</span>`;
            charCount += match.length;
            return span;
        });
        cloned.style.opacity = "0";
        cloned.style.position = "absolute";
        div.parentNode.appendChild(cloned);

        return cloned;
    }

    function _detectSpanPosition (div) {
        let curLine = 0;
        let subLineCount = -1;
        let curPos = -1;
        let subLineIndex = 0;
        for (const span of div.querySelectorAll("span")) {
            const line = Number(span.getAttribute("line"));
            if (curLine != line) {
                subLineCount = -1;
                curLine = line;
            }
            const rect = _getLocalRect(span.getBoundingClientRect());
            const pos = rect.top;
            if (curPos != pos) {
                subLineCount += 1;
                curPos = pos;
                subLineIndex = 0;
            }
            span.setAttribute("sub-line", String(subLineCount));
            span.setAttribute("sub-count", String(subLineIndex++));
        }
    }

    function _getLocalPos (oldX, oldY) {
        let x, y;
        switch (_noteCursorLocator.rotation) {
            case 0: {
                x = oldX - _noteCursorLocator.rect.left;
                y = oldY - _noteCursorLocator.rect.top;
            } break;
            case 90: {
                x = oldY - _noteCursorLocator.rect.top;
                y = _noteCursorLocator.rect.right - oldX;
            } break;
            case 180: {
                x = _noteCursorLocator.rect.right - oldX;
                y = _noteCursorLocator.rect.bottom - oldY;
            } break;
            case 270: {
                x = _noteCursorLocator.rect.bottom - oldY;
                y = oldX - _noteCursorLocator.rect.left;
            } break;
        }
        return {x, y};
    }

    function _getLocalRect (rect) {
        const lt = _getLocalPos(rect.left, rect.top);
        const rb = _getLocalPos(rect.right, rect.bottom);

        const left = Math.min(lt.x, rb.x), top = Math.min(lt.y, rb.y);
        const right = Math.max(lt.x, rb.x), bottom = Math.max(lt.y, rb.y);
        const width = (right - left) / 2, height = (bottom - top) / 2;
        return {left, top, right, bottom, width, height};
    }

    function _updateCursorPosition (mousePos, editableDiv) {
        editableDiv.focus();

        if (!editableDiv.childNodes.length) return;

        // Convert all words to SPAN elements
        const cloned = _convertTextToSpan(editableDiv);

        // Detect rotation
        const getRotateDegree = function (elem) {
            const re = /rotate\(([-]{0,1}[\d]*[.]{0,1}[\d]+)deg\)/;
            const rotate = elem.style.transform.match(re);
            if (rotate && Array.isArray(rotate) && rotate.length > 1) {
                return Number(rotate[1]);
            } else {
                return 0;
            }
        };
        _noteCursorLocator.rotation =
            (getRotateDegree(editableDiv) +
             getRotateDegree(editableDiv.closest(".PdfMarkupNoteEditor")) +
             getRotateDegree(editableDiv.closest(".PdfPageDynamicMarkupCanvas"))) % 360;
        _noteCursorLocator.rect = cloned.getBoundingClientRect();

        // Detect SPAN position
        _detectSpanPosition(cloned);

        const elementsUnderCursor = document.elementsFromPoint(mousePos.x, mousePos.y);
        const elemTag = elementsUnderCursor[0].tagName.toLowerCase();
        if (elemTag == 'span') {
            _locateCursorOnSpan(mousePos, editableDiv, elementsUnderCursor[0]);
        } else if (elemTag == 'div') {
            _locateCursorOnDiv(mousePos, editableDiv, elementsUnderCursor[0]);
        }

        editableDiv.parentNode.removeChild(cloned);
        _noteCursorLocator.reset();
    }

    function _handleNoteKeydown (e, escapeFunc) {
        if (e.key == "Escape") {
            escapeFunc();
        } else if (e.key == "Delete" ||
                   e.key == "Home" || e.key == "End" ||
                   e.key == "ArrowUp" || e.key == "ArrowDown" ||
                   e.key == "ArrowLeft" || e.key == "ArrowRight") {
            e.stopPropagation();
        } else if (e.key == "PageUp" || e.key == "PageDown") {
            e.stopPropagation();
            e.preventDefault();
        }
    }

    function _checkExitNoteEdit (e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        switch(e.type) {
            case "mousedown":
                if (e.target.id != "PdfMarkupNoteEditor" && !e.target.closest('#PdfMarkupNoteEditor')) {
                    _confirmNoteChanges();
                }
                break;
            case "keydown":
                _handleNoteKeydown(e, _confirmNoteChanges);
                break;
            default:
                break;
        }
    }

    function _confirmNoteChanges () {
        if (!_markupEdit.edit) return;
        _markupEdit.edit = false;
        var editableDiv = document.getElementById("PdfMarkupNoteEditor");
        if (!editableDiv || _markupEdit.idNo < 0 || _markupEdit.idNo >= _pdfParsedAnnotationSet.length) {
            return;
        }

        var parsedAnno = _pdfParsedAnnotationSet[_markupEdit.idNo];
        var markupTarget = document.getElementById("PdfAnnotationElement" + _markupEdit.idNo);

        if (!parsedAnno || !markupTarget) {
            return;
        }

        markupTarget.style.visibility = "visible";

        const wrapperPrefix = "PdfPageDisplayWrapper";

        const extractedContent = _sanitizeSvgText(_extractNoteContent(editableDiv.childNodes));
        if (parsedAnno.content == extractedContent) {
            const markup = document.querySelector("#PdfAnnotationElement" + parsedAnno.id);
            if (markup) {
                const rects = markup.parentNode.parentNode.querySelectorAll("rect");
                for (const rect of rects) {
                    rect.style.display = "";
                }
            }
            editableDiv.closest("." + wrapperPrefix).removeChild(editableDiv.parentNode);
            return;
        }

        const zoomScale = _markupEdit.note.zoom;

        parsedAnno.content = extractedContent;

        editableDiv.style.maxHeight = 'none';
        editableDiv.style.minHeight = '0px';

        const pageHeight = parseFloat(document.getElementById("PdfAnnotationCanvas" + (parsedAnno.pageNo+1)).clientHeight);
        const editableDivRect = editableDiv.getBoundingClientRect();

        const arrX = [], arrY = [],
              editableDivWidth = _markupEdit.note.pageRotated ? editableDivRect.height : editableDivRect.width,
              editableDivHeight = _markupEdit.note.pageRotated ? editableDivRect.width : editableDivRect.height;
        var bx1, bx2, by1, by2;
        if (parsedAnno.rotation == 0) {
            bx1 = parseFloat(markupTarget.getAttribute("x")) / zoomScale;
            bx2 = bx1 + editableDivWidth / zoomScale;

            by1 = (pageHeight - parseFloat(markupTarget.getAttribute("y"))) / zoomScale;
            by2 = by1 - editableDivHeight / zoomScale;
        } else if (parsedAnno.rotation == 90) {
            bx1 = parseFloat(markupTarget.getAttribute("x")) / zoomScale;
            bx2 = bx1 + editableDivWidth / zoomScale;

            const y1 = parseFloat(markupTarget.getAttribute("y")) + parseFloat(markupTarget.getAttribute("height"));
            by1 = (pageHeight - y1) / zoomScale;
            by2 = by1 + editableDivHeight / zoomScale;
        } else if (parsedAnno.rotation == 180) {
            bx2 = (parseFloat(markupTarget.getAttribute("x")) + parseFloat(markupTarget.getAttribute("width"))) / zoomScale;
            bx1 = bx2 - editableDivWidth / zoomScale;

            const y1 = parseFloat(markupTarget.getAttribute("y")) + parseFloat(markupTarget.getAttribute("height"));
            by1 = (pageHeight - y1) / zoomScale;
            by2 = by1 + editableDivHeight / zoomScale;
        } else if (parsedAnno.rotation == 270) {
            bx2 = (parseFloat(markupTarget.getAttribute("x")) + parseFloat(markupTarget.getAttribute("width"))) / zoomScale;
            bx1 = bx2 - editableDivWidth / zoomScale;

            by2 = (pageHeight - parseFloat(markupTarget.getAttribute("y"))) / zoomScale;
            by1 = by2 - editableDivHeight / zoomScale;
        }

        arrX.push(bx1, bx2);
        arrY.push(by1, by2);

        //leaderline
        var vertices = parsedAnno.leaderLineVertices;
        if (vertices.length > 0) {
            _calculateLeaderlineVertices(vertices, bx1, by1, bx2, by2);
            arrX.push(vertices[0], vertices[2], vertices[4]);
            arrY.push(vertices[1], vertices[3], vertices[5]);
        }

        //boundingbox
        parsedAnno.boundingBox = [
            Math.min.apply(Math, arrX),
            Math.min.apply(Math, arrY),
            Math.max.apply(Math, arrX),
            Math.max.apply(Math, arrY)
        ];

        //update box diffs
        if (vertices.length > 0) {
            parsedAnno.boxDiffs = [
                Math.abs(parsedAnno.boundingBox[0] - Math.min(bx1, bx2)),
                Math.abs(parsedAnno.boundingBox[1] - Math.min(by1, by2)),
                Math.abs(parsedAnno.boundingBox[2] - Math.max(bx1, bx2)),
                Math.abs(parsedAnno.boundingBox[3] - Math.max(by1, by2))
            ];
        }

        editableDiv.closest("." + wrapperPrefix).removeChild(editableDiv.parentNode);

        _redrawPdfAnnotationPage(parsedAnno.pageNo+1);

        _markupObserver.set("annoSetEdited");
    }

    function _setMarkupEditCursor (target) {
        const currentCanvas = document.getElementById(_currentCanvasId);
        const pageRot = _checkPageRotation()%2 == 0;
        const annoId = _getMarkupDatasetAnnoId(target);
        switch (target.id) {
            case "PdfMarkupAnchorNW" + annoId:
            case "PdfMarkupAnchorSE" + annoId:
                currentCanvas.style.cursor = pageRot ? "nw-resize" : "ne-resize";
                break;
            case "PdfMarkupAnchorNE" + annoId:
            case "PdfMarkupAnchorSW" + annoId:
                currentCanvas.style.cursor = pageRot ? "ne-resize" : "nw-resize";
                break;
            case "PdfMarkupAnchorN" + annoId:
            case "PdfMarkupAnchorS" + annoId:
                currentCanvas.style.cursor = pageRot ? "n-resize" : "e-resize";
                break;
            case "PdfMarkupAnchorE" + annoId:
            case "PdfMarkupAnchorW" + annoId:
                currentCanvas.style.cursor = pageRot ? "e-resize" : "n-resize";
                break;
            case "PdfMarkupAnchorL" + annoId:
                currentCanvas.style.cursor = "move";
                break;
            case "PdfMarkupAnchorM" + annoId:
                const parsedAnno = _pdfParsedAnnotationSet[annoId];
                if (parsedAnno && parsedAnno.leaderLineVertices && parsedAnno.leaderLineVertices.length) {
                    const lineVertices = parsedAnno.leaderLineVertices;
                    if (lineVertices[2] == lineVertices[4]) {
                        currentCanvas.style.cursor = pageRot ? "n-resize" : "e-resize";
                    } else {
                        currentCanvas.style.cursor = pageRot ? "e-resize" : "n-resize";
                    }
                } else {
                    currentCanvas.style.cursor = "move";
                }
                break;
            case "PdfMarkupRotator" + annoId:
                currentCanvas.style.cursor = "url(" + ThingView.resourcePath + "/cursors/roll.cur),move";
                break;
            default :
                const targetId = "PdfMarkupAnchor" + annoId + "_";
                if (target.id.indexOf(targetId) > -1) {
                    currentCanvas.style.cursor = "move";
                } else {
                    currentCanvas.style.cursor = "auto";
                }
                break;
        }
    }

    function _removeAnchorPoints (target) {
        var elem = target.parentNode.querySelector("[id^=\"PdfMarkupAnchorGroup\"]");
        if (elem) {
            target.parentNode.removeChild(elem);
        }
        const svgElem = target.closest("svg");
        if (svgElem) {
            svgElem.removeEventListener("mousemove", _handleShapeMarkupEditEvent);
            svgElem.removeEventListener("mouseup", _handleShapeMarkupEditEvent);
        }
    }

    function _handleDeletePdfAnnoAPI (idNo) {
        _confirmNoteChanges();
        var anno = document.getElementById("PdfAnnotationElement" + idNo);
        if (anno && _checkMarkupDatasetSelected(anno)) {
            _deselectPdfAnnotation(anno);
        }
        _deletePdfAnnotationByIdWrapper(parseInt(idNo));
    }

    var _ignoreCommand = false;
    function _handleAddDeletedPdfAnnoAPI (idNo) {
        _ignoreCommand = true;
    }

    function _addAnnoIdToPage(pageNo, idNo) {
        if (!_pageAnnoSetList[pageNo]) {
            _pageAnnoSetList[pageNo] = new Set();
        }
        _pageAnnoSetList[pageNo].add(idNo);
    }

    function _removeAnnoIdFromPage(pageNo, idNo) {
        if (_pageAnnoSetList[pageNo]) {
            _pageAnnoSetList[pageNo].delete(idNo);
        }
    }

    function _deleteSelectedPdfAnnotations () {
        if (_markupMode.selectedAnnotations.length > 0) {
            let groupOp = _markupMode.selectedAnnotations.length > 1;
            if (groupOp) {
                ThingView.BeginPdfOperationGroup();
            }
            for (var i = 0; i < _markupMode.selectedAnnotations.length; i++) {
                var markup = _getAnnotationElement(_markupMode.selectedAnnotations[i]);
                if (markup) {
                    var annoId = _getMarkupDatasetAnnoId(markup);
                    if (annoId != null) {
                        _deletePdfAnnotationByIdWrapper(annoId);
                    }
                }
            }
            if (groupOp) {
                ThingView.EndPdfOperationGroup();
            }
            _markupMode.selectedAnnotations = [];
            document.getElementById(_currentCanvasId).style.cursor = "auto";
        }
    }

    function _deletePdfAnnotationByIdWrapper (idNo){
        if (idNo == null || idNo == -1) {
            return;
        }
        const parsedAnno = _pdfParsedAnnotationSet[idNo];
        if (parsedAnno) {
            if (_markupGroupOp.running) {
                _markupGroupOp.idNos.push(idNo);
                _markupGroupOp.action = _undoPresets.delete;
            } else {
                if (parsedAnno.visible)
                    _deletePdfAnnotationById(parsedAnno);

                var pageNo = parsedAnno.pageNo + 1;
                _pushActionToMarkupHistory(_undoPresets.delete, [parsedAnno]);
                _pdfParsedAnnotationSet[idNo] = null;
                _removeAnnoIdFromPage(pageNo, idNo);
                _markupObserver.set("annoDeleted", idNo);
            }
        }
    }

    function _deletePdfAnnotationById (parsedAnno) {
        if (!parsedAnno) return;
        const anno = document.getElementById("PdfAnnotationElement" + parsedAnno.id);
        if (anno) {
            _deselectPdfAnnotation(anno);
            const pageNo = parsedAnno.pageNo + 1;
            const textLayer = document.getElementById("PdfPageDisplayTextLayer" + pageNo);
            if (textLayer) {
                textLayer.style.zIndex = _zIndex.text;
            }
            if (anno.parentNode.tagName == "svg" ||
                anno.tagName.toLowerCase() == "img") {
                anno.parentNode.removeChild(anno);
            } else {
                anno.parentNode.parentNode.removeChild(anno.parentNode);
            }
        }
    }

//PDF SAVE FDF

    function _GetLoadedPdfAnnotationSetFdf (docScene, author, filePath, callback) {
        returnObj.SetMarkupModePDF(null);

        _ignoreCommand = false;
        var deparsedAnnoSet = _buildUnparsedAnnotationSet(_pdfParsedAnnotationSet);
        if (!author) {
            author = "";
        }
        if (!filePath) {
            filePath = "";
        }
        filePath = encodePathContent(filePath);
        docScene.GetFdfBufferfromPdfAnnotations(deparsedAnnoSet, author, filePath, function (buffer, errors) {
            if (callback) {
                callback(buffer);
            }
        });
    }

    function _buildUnparsedAnnotationSet (annoSet) {
        if (!annoSet) {
            return;
        }
        var deparsedAnnoSet = new Module.PdfAnnotationSetVec();
        for (var i = 0; i < annoSet.length; i++) {
            if (annoSet[i] != null) {
                var deparsedAnno = null;
                switch (annoSet[i].type) {
                    case _markupTypes.leaderLine:
                    case _markupTypes.leaderLineHeadTail:
                    case _markupTypes.polyline:
                    case _markupTypes.polyLineHeadTail:
                    case _markupTypes.rectangle:
                    case _markupTypes.rectangleFilled:
                    case _markupTypes.ellipse :
                    case _markupTypes.ellipseFilled :
                    case _markupTypes.polygon :
                    case _markupTypes.polygonFilled :
                    case _markupTypes.textHighlight:
                    case _markupTypes.textStrikethrough:
                    case _markupTypes.textUnderline:
                    case _markupTypes.freehand:
                        deparsedAnno = _unparseMarkup(annoSet[i]);
                        break;
                    case _markupTypes.stamp:
                        deparsedAnno = _unparseStampMarkup(annoSet[i]);
                        break;
                    case _markupTypes.note:
                    case _markupTypes.noteLeader:
                        deparsedAnno = _unparseNoteMarkup(annoSet[i]);
                        break;
                    default:
                        break;
                }
                if (deparsedAnno) {
                    deparsedAnnoSet.push_back(deparsedAnno);
                }
            }
        }
        return deparsedAnnoSet;
    }

    function _unparseMarkupTypeName (type) {
        switch (type) {
            case _markupTypes.note :
            case _markupTypes.noteLeader :
                return "Note";
            case _markupTypes.leaderLine :
            case _markupTypes.leaderLineHeadTail :
                return "LeaderLine";
            case _markupTypes.polyline :
            case _markupTypes.polyLineHeadTail :
                return "PolyLine";
            case _markupTypes.rectangle :
            case _markupTypes.rectangleFilled :
                return "Rectangle";
            case _markupTypes.ellipse :
            case _markupTypes.ellipseFilled :
                return "Circle";
            case _markupTypes.polygon :
            case _markupTypes.polygonFilled :
                return "Polygon";
            case _markupTypes.freehand :
                return "Freehand";
            case _markupTypes.textHighlight :
                return "Highlight";
            case _markupTypes.textStrikethrough :
                return "StrikeThrough";
            case _markupTypes.textUnderline :
                return "Underline";
            case _markupTypes.stamp :
                return "Stamp";
            default :
               return "";
        }
    }

    function _unparseMarkup(markup) {
        markup.flags.hidden = !markup.visible;
        var obj = {
            type: _unparseMarkupTypeName(markup.type),
            pageNo: markup.pageNo,
            data: JSON.stringify(markup)
        };
        return obj;
    }

    function _unparseStampMarkup (markup) {
        const copiedMarkup = _deepCloneObject(markup);
        copiedMarkup.inflatedStream = copiedMarkup._imageBuffer;
        delete copiedMarkup._imageBuffer;
        return _unparseMarkup(copiedMarkup);
    }

    function _unparseNoteMarkup (markup) {
        const orderedBoundingBox = [];
        orderedBoundingBox.push(Math.min(markup.boundingBox[0], markup.boundingBox[2]));
        orderedBoundingBox.push(Math.min(markup.boundingBox[1], markup.boundingBox[3]));
        orderedBoundingBox.push(Math.max(markup.boundingBox[0], markup.boundingBox[2]));
        orderedBoundingBox.push(Math.max(markup.boundingBox[1], markup.boundingBox[3]));

        var textContent = markup.content.replace(/\\/g, "\\\\");
        textContent = textContent.replace(/\(/g, "\\\(");
        textContent = textContent.replace(/\)/g, "\\\)");
        const copiedMarkup = _deepCloneObject(markup);
        copiedMarkup.boundingBox = orderedBoundingBox;
        copiedMarkup.content = textContent;
        copiedMarkup.fontColor = _getColorHex(copiedMarkup.fontColor);

        return _unparseMarkup(copiedMarkup);
    }

//PDF FILTER MARKUPS

    function _setPdfMarkupsFilter (filterOn) {
        _filterPdfMarkups = filterOn;
        if (_pdfParsedAnnotationSet && _pdfParsedAnnotationSet.length != 0) {
            const markupCanvases = document.querySelectorAll(".PdfAnnotationCanvas, .PdfNavAnnotationCanvas");
            var canvasVisibility = _filterPdfMarkups ? "hidden" : "visible";
            for (var i = 0; i < markupCanvases.length; i++) {
                markupCanvases[i].style.visibility = canvasVisibility;
            }
        }
    }

//PDF CREATE MARKUPS

    function _togglePdfMarkupMode (markupType, options) {
        if (_markupMode.on) {
            //markup is already on, need to cancel that
            if (_markupMode.type == _markupTypes.note || _markupMode.type == _markupTypes.noteLeader) {
                if (document.getElementById("PdfMarkupNoteCreator")) {
                    _createNoteMarkup();
                }
            }
            _switchMarkupModeType(false, true);
        }
        _markupMode.on = (markupType != null && markupType != _markupMode.type);
        var annoCanvases = document.getElementsByClassName("PdfAnnotationCanvas");
        if (_markupMode.on) {
            if (_cursor.callback) {
                _cursor.callback(_cursorTypes.markup);
            }
            for (let i = 0; i < annoCanvases.length; i++){
                annoCanvases[i].style.pointerEvents = "none";
            }
        } else {
            for (let i = 0; i < annoCanvases.length; i++){
                annoCanvases[i].style.pointerEvents = "auto";
            }
        }

        if (_markupMode.on) {
            _markupMode.type = markupType;
            _markupMode.options = options;
            _setLinkLayerPointerEvents(false);
            _switchMarkupModeType(true, false);
        } else {
            _switchMarkupModeType(false, false);
            _markupMode.type = null;

            if (_cursor.cached == _cursorTypes.pan) {
                _cursor.current = _cursorTypes.pan;
                returnObj.SetPanModePDF();
            } else if (_cursor.cached == _cursorTypes.text) {
                _cursor.current = _cursorTypes.text;
                returnObj.SetTextModePDF();
            }
            _cursor.cached = null;
            _setLinkLayerPointerEvents(true);
        }
    }

    function _switchMarkupModeType (markupOn, suppressCallback) {
        if (_markupMode.type) {
            switch (_markupMode.type) {
                case _markupTypes.note :
                    _setShapeMUCreation(markupOn, _handleCreateNoteEvent, "text", suppressCallback, "click");
                    break;
                case _markupTypes.noteLeader :
                    _setShapeMUCreation(markupOn, _handleCreateNoteLeaderEvent, "crosshair", suppressCallback);
                    break;
                case _markupTypes.leaderLine :
                case _markupTypes.leaderLineHeadTail :
                    _setShapeMUCreation(markupOn, _handleCreateLeaderLineEvent, "crosshair", suppressCallback);
                    break;
                case _markupTypes.polyline :
                case _markupTypes.polyLineHeadTail :
                    _setShapeMUCreation(markupOn, _handleCreatePolylineEvent, "crosshair", suppressCallback);
                    break;
                case _markupTypes.rectangle :
                case _markupTypes.rectangleFilled :
                    _setShapeMUCreation(markupOn, _handleCreateRectangleEvent, "crosshair", suppressCallback);
                    break;
                case _markupTypes.ellipse :
                case _markupTypes.ellipseFilled :
                    _setShapeMUCreation(markupOn, _handleCreateEllipseEvent, "crosshair", suppressCallback);
                    break;
                case _markupTypes.polygon :
                case _markupTypes.polygonFilled :
                    _setShapeMUCreation(markupOn, _handleCreatePolygonEvent, "crosshair", suppressCallback);
                    break;
                case _markupTypes.freehand :
                    _setShapeMUCreation(markupOn, _handleCreateFreehandEvent, "crosshair", suppressCallback);
                    break;
                case _markupTypes.textHighlight :
                case _markupTypes.textStrikethrough :
                case _markupTypes.textUnderline :
                    _setTextMUCreation(markupOn, _handleCreateTextEvent, suppressCallback);
                    break;
                case _markupTypes.stamp :
                    _setShapeMUCreation(markupOn, _handleCreateStampEvent, "crosshair", suppressCallback);
                    break;
                default :
                    break;
            }
        }
    }

    function _setShapeMUCreation (creationOn, eventFunction, creationCursor, suppressCallback, type) {
        var parent = document.getElementById(_currentCanvasId);
        var pages = document.getElementsByClassName("PdfPageDisplayCanvas");
        var textLayers = document.getElementsByClassName("PdfPageDisplayTextLayer");
        if (creationOn) {
            parent.style.cursor = creationCursor;
            for (var j = 0; j < textLayers.length; j++) {
                textLayers[j].style.zIndex = _zIndex.textHidden;
            }
            for (var i = 0; i < pages.length; i++) {
                pages[i].addEventListener(type || "mousedown", eventFunction);
            }
        } else {
            parent.style.cursor = "auto";
            for (var i = 0; i < pages.length; i++) {
                pages[i].removeEventListener(type || "mousedown", eventFunction);
            }
            for (var j = 0; j < textLayers.length; j++) {
                textLayers[j].style.zIndex = _zIndex.text;
            }
            if (!suppressCallback) {
                _markupObserver.set("annoModeComplete", _markupMode.type);
            }
        }
    }

    /**
     * Turn on/off text markup creation mode
     * @param {boolean} creationOn If true, text markup creation mode is on
     * @param {function} eventFunction mouse event callback function
     * @param {boolean} suppressCallback If true, suppress markup observer callback
     */
    function _setTextMUCreation (creationOn, eventFunction, suppressCallback) {
        const textLayers = document.querySelectorAll(".PdfPageDisplayTextLayer");
        if (creationOn) {
            const selection = window.getSelection();
            if (selection.type == "Range") {
                _createTextMarkup(selection, _markupMode.type);
            } else {
                textLayers.forEach(function (textLayer) {
                    const dynamicPageNo = _getPageNo(textLayer.id);
                    if (dynamicPageNo) {
                        const muCreationLayer = textLayer.cloneNode(true);
                        muCreationLayer.id = `PdfPageDynamicTextMarkupCanvas${dynamicPageNo}`;
                        muCreationLayer.className = "PdfPageDynamicTextMarkupCanvas";
                        muCreationLayer.childNodes.forEach(function (textItem) {
                            const pageId = _getPageAndId(textItem.id);
                            if (pageId) {
                                textItem.id = `PdfPageDynamicTextLayer${pageId.pageNo}_${pageId.idNo}`;
                                textItem.className = "PdfPageDynamicTextLayer";
                            }
                        });
                        muCreationLayer.style.userSelect = "text";
                        muCreationLayer.style.msUserSelect = "text";
                        textLayer.parentNode.appendChild(muCreationLayer);
                        muCreationLayer.addEventListener("mousedown", eventFunction);
                        muCreationLayer.addEventListener("mouseup", eventFunction);
                        textLayer.style.zIndex = _zIndex.textHidden;
                    }
                });
            }
        } else {
            textLayers.forEach(function (textLayer) {
                const pageNo = _getPageNo(textLayer.id);
                if (pageNo) {
                    const dynamicTextLayer = document.querySelector(`#PdfPageDynamicTextMarkupCanvas${pageNo}`);
                    if (dynamicTextLayer) {
                        textLayer.parentNode.removeChild(dynamicTextLayer);
                    }
                    textLayer.style.zIndex = _zIndex.text;
                }
            });
            if (!suppressCallback) {
                _markupObserver.set("annoModeComplete", _markupMode.type);
            }
        }
    }

    function _createDynamicMarkupCanvas (eventFunction) {
        var pageWrapper = document.getElementById("PdfPageDisplayWrapper" + _markupMode.mouse.pageNo);
        if (pageWrapper) {
            var dynamicCanvas = document.createElement("div");
            dynamicCanvas.id = "PdfPageDynamicMarkupCanvas" + _markupMode.mouse.pageNo;
            dynamicCanvas.className = "PdfPageDynamicMarkupCanvas";
            dynamicCanvas.height = pageWrapper.height;
            dynamicCanvas.width = pageWrapper.width;
            dynamicCanvas.style.height = pageWrapper.height;
            dynamicCanvas.style.width = pageWrapper.width;
            dynamicCanvas.style.display = "inline-block";
            dynamicCanvas.style.position = "absolute";
            dynamicCanvas.style.zIndex = _zIndex.dynamicCanvas;
            dynamicCanvas.addEventListener("mousedown", eventFunction, false);
            dynamicCanvas.addEventListener("mousemove", eventFunction, false);
            dynamicCanvas.addEventListener("mouseup", eventFunction, false);
            dynamicCanvas.addEventListener("click", eventFunction, false);
            dynamicCanvas.addEventListener("dblclick", eventFunction, false);
            pageWrapper.insertBefore(dynamicCanvas, pageWrapper.firstChild);
        }
    }

    function _removeDynamicMarkupCanvas () {
        const wrappers = document.querySelectorAll(".PdfPageDisplayWrapper");
        for (const wrapper of wrappers) {
            const canvas = wrapper.querySelector(".PdfPageDynamicMarkupCanvas");
            if (canvas) {
                wrapper.removeChild(canvas);
            }
        }
    }

    function _deselectAllSelectedAnnotations () {
        var selectedLength = _markupMode.selectedAnnotations.length;
        for (var i = 0; i < selectedLength; i++) {
            _setPdfAnnotationSelect(_getAnnotationElement(_markupMode.selectedAnnotations[0]), false);
        }
    }

    function _getMousePosOnCanvas (e) {
        const canvas = document.getElementById("PdfPageDisplayCanvas" + _markupMode.mouse.pageNo);
        if (canvas) {
            const rect = canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
        return null;
    }

    function _getPositionOnCanvas (x, y, canvasWidth, canvasHeight, scale) {
        const zoomScale = scale || __ZOOMSCALE;
        var cx, cy;
        switch (_checkPageRotation()) {
            case 0:
            default:
                cx = x * zoomScale;
                cy = canvasHeight - y * zoomScale;
                break;
            case 1:
                cx = y * zoomScale;
                cy = x * zoomScale;
                break;
            case 2:
                cx = canvasWidth - x * zoomScale;
                cy = y * zoomScale;
                break;
            case 3:
                cx = canvasHeight - y * zoomScale;
                cy = canvasWidth - x * zoomScale;
                break;
        }
        return {x: cx, y: cy};
    }

    function _getPositionOnPage (x, y, ignoreRotation) {
        var px, py;
        if (typeof x == "object") {
            px = x.x;
            py = x.y;
        } else {
            px = x;
            py = y;
        }
        var pageHeight = parseInt(document.getElementById("PdfPageDisplayCanvas" + _markupMode.mouse.pageNo).clientHeight);
        var pageWidth = parseInt(document.getElementById("PdfPageDisplayCanvas" + _markupMode.mouse.pageNo).clientWidth);
        var pageRotation = _checkPageRotation();
        if (pageRotation == 0 || ignoreRotation) {
            return {
                x: px / __ZOOMSCALE,
                y: (pageHeight - py) / __ZOOMSCALE
            };
        } else if (pageRotation == 1) {
            return {
                x: py / __ZOOMSCALE,
                y: px / __ZOOMSCALE
            };
        } else if (pageRotation == 2) {
            return {
                x: (pageWidth - px) / __ZOOMSCALE,
                y: py / __ZOOMSCALE
            };
        } else if (pageRotation == 3) {
            return {
                x: (pageHeight - py) / __ZOOMSCALE,
                y: (pageWidth - px) / __ZOOMSCALE
            };
        }
        return null;
    }

    function _handleMouseDownOnCreateMarkup (mouseEvt, createEvt) {
        if (_markupMode.mouse.pageNo == null) {
            _deselectAllSelectedAnnotations();
            if (!_markupMode.mouse.pick) {
                _markupMode.mouse.pageNo = parseInt(mouseEvt.target.id.substring(mouseEvt.target.className.length));
                _createDynamicMarkupCanvas(createEvt);
                _markupMode.mouse.down = true;
                const pos = _getMousePosOnCanvas(mouseEvt);
                _markupMode.mouse.xStart = pos.x;
                _markupMode.mouse.yStart = pos.y;
            }
        }
    }

    function _handleMouseUpOnCreateMarkup (mouseEvt, drawMarkup, createMarkup, keepDynamicCanvas) {
        mouseEvt.stopPropagation();
        const pos = _getMousePosOnCanvas(mouseEvt);
        _markupMode.mouse.xEnd = pos.x;
        _markupMode.mouse.yEnd = pos.y;
        _markupMode.mouse.down = false;
        if (!_markupMode.mouse.drag) {
            if (!_markupMode.mouse.pick) {
                if (!drawMarkup(pos.x, pos.y))
                    _markupMode.mouse.pick = true;
            } else {
                createMarkup();
                if (!keepDynamicCanvas)
                    _removeDynamicMarkupCanvas();
                _markupMode.mouse.pick = false;
            }
        } else {
            createMarkup();
            if (!keepDynamicCanvas)
                _removeDynamicMarkupCanvas();
            _markupMode.mouse.pick = false;
        }
        _markupMode.mouse.drag = false;
    }

    function _handleMouseMoveOnCreateMarkup (mouseEvt, drawMarkup) {
        mouseEvt.stopPropagation();
        const pos = _getMousePosOnCanvas(mouseEvt);
        if (_markupMode.mouse.down &&
            (Math.abs(pos.x - _markupMode.mouse.xStart) > _markupMode.mouse.jitter ||
             Math.abs(pos.y - _markupMode.mouse.yStart) > _markupMode.mouse.jitter)) {
            _markupMode.mouse.drag = true;
            drawMarkup(pos.x, pos.y);
        } else {
            _markupMode.mouse.drag = false;
            if (_markupMode.mouse.pick) {
                drawMarkup(pos.x, pos.y);
                _markupMode.mouse.xEnd = pos.x;
                _markupMode.mouse.yEnd = pos.y;
            }
        }
    }

    function _handleCreateStampEvent (e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        e.preventDefault();
        if (e.type == "mousedown") {
            _handleMouseDownOnCreateMarkup(e, _handleCreateStampEvent);
        } else if (e.type == "mouseup") {
            _handleMouseUpOnCreateMarkup(e, _drawDynamicStampMarkup, _createStampMarkup);
        } else if (e.type == "mousemove") {
            _handleMouseMoveOnCreateMarkup(e, _drawDynamicStampMarkup);
        }
    }

    /**
     * Generate matrix for rotated stamp markup
     * @param {number} degree Rotation degree, -180 ~ +180
     * @param {number} width Stamp width
     * @param {number} height Stamp height
     * @returns {number[] | null} Array of 6 numbers or null
     */
    function _generateStampMatrix (degree, width, height) {
        if (isNaN(degree) || isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
            return null;
        }
        /** @type {number[]} */
        const matrix = [], // [a, b, c, d, e, f]
              rad = degree / 180 * Math.PI,
              cos = Math.cos(rad),
              sin = Math.sin(rad);
        matrix.push(cos);  // a
        matrix.push(sin);  // b
        matrix.push(-sin); // c
        matrix.push(cos);  // d

        let x = 0, y = 0;
        if (-180 < degree && degree <= -90) {
            x = -width + height / 2 * Math.sin(2 * (rad + Math.PI / 2));
            y = height / 2 * (Math.cos(2 * (rad + Math.PI / 2)) - 1);
        } else if (-90 < degree && degree <= 0) {
            x = width / 2 * (Math.cos(2 * rad) - 1);
            y = -width / 2 * Math.sin(2 * rad);
        } else if (0 < degree && degree <= 90) {
            x = height / 2 * Math.sin(2 * rad);
            y = height / 2 * (Math.cos(2 * rad) - 1);
        } else if (90 < degree && degree <= 180) {
            x = width / 2 * (Math.cos(2 * (rad - Math.PI / 2)) - 1);
            y = -height - width / 2 * Math.sin(2 * (rad - Math.PI / 2));
        } else {
            return null;
        }

        matrix.push(x * cos - y * sin); // e
        matrix.push(x * sin + y * cos); // f

        if (matrix.length != 6) {
            return null;
        }

        matrix.forEach(function (value, index) {
            if (Math.abs(value) <= 0.001) {
                this[index] = 0;
            };
        }, matrix);

        return matrix;
    }

    function _createStampMarkup (oneClick) {
        const width = Math.abs(_markupMode.mouse.xEnd - _markupMode.mouse.xStart);
        const height = Math.abs(_markupMode.mouse.yEnd - _markupMode.mouse.yStart);
        if ((width <= 0 || height <= 0) && !oneClick) {
            returnObj.SetMarkupModePDF(null);
            return;
        }
        const pos1 = _getPositionOnPage(_markupMode.mouse.xStart, _markupMode.mouse.yStart);
        const pos2 = _getPositionOnPage(_markupMode.mouse.xEnd, _markupMode.mouse.yEnd);
        if ((!pos1 || !pos2) && !oneClick) {
            returnObj.SetMarkupModePDF(null);
            return;
        }
        const pageNo = _markupMode.mouse.pageNo;
        let vertices = [];
        let stampWidth = 0,
            stampHeight = 0,
            stampCenterX = 0,
            stampCenterY = 0,
            ratio = 0;
        if (oneClick === true) {
            const maxLength = 75; // px
            stampWidth = Math.min(maxLength, _markupMode.options.width);
            stampHeight = Math.min(maxLength, _markupMode.options.height);

            ratio = Math.min(stampWidth / _markupMode.options.width, stampHeight / _markupMode.options.height);

            stampCenterX = pos1.x;
            stampCenterY = pos1.y;
        } else {
            ratio = Math.min(width / _markupMode.options.width, height / _markupMode.options.height);

            stampCenterX = (pos1.x + pos2.x) / 2;
            stampCenterY = (pos1.y + pos2.y) / 2;
        }

        stampWidth = _markupMode.options.width * ratio;
        stampHeight = _markupMode.options.height * ratio;

        stampWidth /= __ZOOMSCALE;
        stampHeight /= __ZOOMSCALE;

        let rotate = 0;
        /** @type {number[]} */
        let matrix = [];
        switch (_checkPageRotation()) {
            case 1: {
                [stampWidth, stampHeight] = [stampHeight, stampWidth];
                rotate = 90;
                matrix = _generateStampMatrix(rotate, _markupMode.options.width, _markupMode.options.height);
            } break;
            case 2: {
                rotate = 180;
                matrix = _generateStampMatrix(rotate, _markupMode.options.width, _markupMode.options.height);
            } break;
            case 3: {
                [stampWidth, stampHeight] = [stampHeight, stampWidth];
                rotate = -90;
                matrix = _generateStampMatrix(rotate, _markupMode.options.width, _markupMode.options.height);
            } break;
        }

        vertices.push(stampCenterX - stampWidth / 2);
        vertices.push(stampCenterY - stampHeight / 2);
        vertices.push(stampCenterX + stampWidth / 2);
        vertices.push(stampCenterY + stampHeight / 2);

        const flipImage = function (buffer) {
            var newBuffer = "";
            const white = String.fromCharCode(255, 255, 255);
            const length = _markupMode.options.width * 4;
            for (let i=(_markupMode.options.height-1);i>=0;i--) {
                const index = i * length;
                let line = buffer.substring(index, index + length);
                for (let j=0;j<line.length;j+=4) {
                    let rgba = line.substring(j, j + 4);
                    if (rgba.charCodeAt(3) != 255) { // if alpha is not 1
                        // make the pixel white
                        newBuffer += white;
                    } else { // otherwise
                        // remove alpha value
                        newBuffer += rgba.substring(0, 3);
                    }
                }
            }
            return newBuffer;
        };

        const generateImageSrc = function (binaryImage) {
            const canvas = document.createElement("canvas");
            canvas.width = _markupMode.options.width;
            canvas.height = _markupMode.options.height;
            const ctx = canvas.getContext("2d");
            const imageData = ctx.createImageData(_markupMode.options.width, _markupMode.options.height);
            for (let i=0,j=0;i<imageData.data.length;i+=4,j+=3) {
                imageData.data[i] = parseInt("0x" + binaryImage.charCodeAt(j).toString(16));
                imageData.data[i+1] = parseInt("0x" + binaryImage.charCodeAt(j+1).toString(16));
                imageData.data[i+2] = parseInt("0x" + binaryImage.charCodeAt(j+2).toString(16));
                imageData.data[i+3] = 255;
            }
            ctx.putImageData(imageData, 0, 0);
            return canvas.toDataURL();
        };

        const flippedBuffer = flipImage(window.atob(_markupMode.options.buffer));
        const annotation = {
            _imageBuffer: window.btoa(flippedBuffer), // temporary, renamed to inflatedStream on saving.
            bitsPerComponent: 8,
            colorSpace: "L0RldmljZVJHQg==", // "DeviceRGB"
            filter: "FlateDecode",
            width: _markupMode.options.width,
            height: _markupMode.options.height,
            inflatedLength: _markupMode.options.width * _markupMode.options.height * 3,
            inflatedStream: generateImageSrc(flippedBuffer),
            type: _markupMode.type,
            id: _getNextPdfAnnotationId(),
            vertices: vertices,
            pageNo: pageNo - 1,
            flags: _deepCloneObject(_annotFlagsDefaults),
            visible: !_filterPdfMarkups,
            isNew: true
        };
        if (rotate != 0 && matrix && Array.isArray(matrix) && matrix.length == 6) {
            annotation.rotate = rotate;
            annotation.matrix = matrix;
        }
        let parsedAnnoSet = _pdfParsedAnnotationSet;
        if (!parsedAnnoSet) {
            parsedAnnoSet = [];
        }
        parsedAnnoSet.push(annotation);
        returnObj.SetMarkupModePDF(null);
        _addAnnoIdToPage(pageNo, _pdfParsedAnnotationSet.length-1);
        _redrawPdfAnnotationPage(pageNo);
        _pushActionToMarkupHistory(_undoPresets.create, [annotation]);
        _markupObserver.set("annoCreated", annotation);
    }

    function _drawDynamicStampMarkup (endX, endY) {
        const pos1 = _getPositionOnPage(_markupMode.mouse.xStart, _markupMode.mouse.yStart, true);
        const pos2 = _getPositionOnPage(endX, endY, true);
        if (Math.abs(pos1.x - pos2.x) <= _markupMode.mouse.jitter &&
            Math.abs(pos1.y - pos2.y) <= _markupMode.mouse.jitter &&
            !_markupMode.mouse.down) {
            _createStampMarkup(true);
            _removeDynamicMarkupCanvas();
            return true;
        }
        const dynamicCanvas = document.getElementById("PdfPageDynamicMarkupCanvas" + _markupMode.mouse.pageNo);
        if (dynamicCanvas.childNodes.length > 0) {
            const svgObj = dynamicCanvas.querySelector("rect");
            if (svgObj) {
                const box = _getCorrectedBoundingBox([pos1.x, pos1.y, pos2.x, pos2.y], dynamicCanvas, __ZOOMSCALE);
                _applyRectangleDifferences(box, [0.5, 0.5, 0.5, 0.5], __ZOOMSCALE * 2);
                svgObj.setAttribute("x", box.x1);
                svgObj.setAttribute("y", box.y1);
                svgObj.setAttribute("width",  Math.max((box.x2 - box.x1), 0));
                svgObj.setAttribute("height", Math.max((box.y2 - box.y1), 0));
            }
        } else {
            const annotation = {
                id: 0,
                vertices: [pos1.x, pos1.y, pos1.x, pos1.y],
                boxDiffs: [0.5, 0.5, 0.5, 0.5],
                outlineColor: [1.0, 0.0, 0.0],
                alpha: 1.0,
                filled: false
            };
            const pageCanvas = document.getElementById("PdfPageDisplayCanvas" + _markupMode.mouse.pageNo);
            const pageHeight = parseInt(pageCanvas.clientHeight);
            const pageWidth = parseInt(pageCanvas.clientWidth);
            const svgLayer = document.createElementNS(_svgNS, "svg");
            svgLayer.setAttribute("height", pageHeight + "px");
            svgLayer.setAttribute("width", pageWidth + "px");
            svgLayer.style.position = "absolute";
            svgLayer.style.left = "0px";
            svgLayer.style.top = "0px";
            dynamicCanvas.appendChild(svgLayer);
            _displayPdfRectangle(annotation, svgLayer, false, __ZOOMSCALE);
        }
    }

    function _handleCreateRectangleEvent (e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        e.preventDefault();
        if (e.type == "mousedown") {
            _handleMouseDownOnCreateMarkup(e, _handleCreateRectangleEvent);
        } else if (e.type == "mouseup") {
            _handleMouseUpOnCreateMarkup(e, _drawDynamicRectangleMarkup, _createShapeMarkup);
        } else if (e.type == "mousemove") {
            _handleMouseMoveOnCreateMarkup(e, _drawDynamicRectangleMarkup);
        }
    }

    function _createShapeMarkup () {
        const width = Math.abs(_markupMode.mouse.xEnd - _markupMode.mouse.xStart);
        const height = Math.abs(_markupMode.mouse.yEnd - _markupMode.mouse.yStart);
        if (width <= 0 || height <= 0) {
            returnObj.SetMarkupModePDF(null);
            return;
        }
        const pos1 = _getPositionOnPage(_markupMode.mouse.xStart, _markupMode.mouse.yStart);
        const pos2 = _getPositionOnPage(_markupMode.mouse.xEnd, _markupMode.mouse.yEnd);
        if (!pos1 || !pos2) {
            returnObj.SetMarkupModePDF(null);
            return;
        }
        const pageNo = _markupMode.mouse.pageNo;
        const filledVal = _markupMode.type.indexOf("Filled") > -1;
        const annotation = {
            type: _markupMode.type,
            id: _getNextPdfAnnotationId(),
            vertices: [Math.min(pos1.x, pos2.x), Math.min(pos1.y, pos2.y), Math.max(pos1.x, pos2.x), Math.max(pos1.y, pos2.y)],
            boxDiffs: [0.5, 0.5, 0.5, 0.5],
            outlineColor: _shapeDefaultProps.lineColor,
            alpha: _shapeDefaultProps.alpha,
            pageNo: pageNo - 1,
            filled: filledVal,
            flags: _deepCloneObject(_annotFlagsDefaults),
            visible: !_filterPdfMarkups,
            isNew: true
        };
        if (filledVal) {
            annotation.fillColor = _shapeDefaultProps.lineColor;
        }
        var parsedAnnoSet = _pdfParsedAnnotationSet;
        if (!parsedAnnoSet) {
            parsedAnnoSet = [];
        }
        parsedAnnoSet.push(annotation);
        returnObj.SetMarkupModePDF(null);
        _addAnnoIdToPage(pageNo, _pdfParsedAnnotationSet.length-1);
        _redrawPdfAnnotationPage(pageNo);
        _pushActionToMarkupHistory(_undoPresets.create, [annotation]);
        _markupObserver.set("annoCreated", annotation);
    }

    function _drawDynamicRectangleMarkup (endX, endY) {
        const pos1 = _getPositionOnPage(_markupMode.mouse.xStart, _markupMode.mouse.yStart, true);
        const pos2 = _getPositionOnPage(endX, endY, true);
        const dynamicCanvas = document.getElementById("PdfPageDynamicMarkupCanvas" + _markupMode.mouse.pageNo);
        if (dynamicCanvas.childNodes.length > 0) {
            const svgObj = dynamicCanvas.querySelector("rect");
            if (svgObj) {
                const box = _getCorrectedBoundingBox([pos1.x, pos1.y, pos2.x, pos2.y], dynamicCanvas, __ZOOMSCALE);
                _applyRectangleDifferences(box, [0.5, 0.5, 0.5, 0.5], __ZOOMSCALE * 2);
                svgObj.setAttribute("x", box.x1);
                svgObj.setAttribute("y", box.y1);
                svgObj.setAttribute("width",  Math.max((box.x2 - box.x1), 0));
                svgObj.setAttribute("height", Math.max((box.y2 - box.y1), 0));
            }
        } else {
            const annotation = {
                id: 0,
                vertices: [pos1.x, pos1.y, pos1.x, pos1.y],
                boxDiffs: [0.5, 0.5, 0.5, 0.5],
                outlineColor: [1.0, 0.0, 0.0],
                alpha: 1.0,
                filled: false
            };
            const pageCanvas = document.getElementById("PdfPageDisplayCanvas" + _markupMode.mouse.pageNo);
            const pageHeight = parseInt(pageCanvas.clientHeight);
            const pageWidth = parseInt(pageCanvas.clientWidth);
            const svgLayer = document.createElementNS(_svgNS, "svg");
            svgLayer.setAttribute("height", pageHeight + "px");
            svgLayer.setAttribute("width", pageWidth + "px");
            svgLayer.style.position = "absolute";
            svgLayer.style.left = "0px";
            svgLayer.style.top = "0px";
            dynamicCanvas.appendChild(svgLayer);
            _displayPdfRectangle(annotation, svgLayer, false, __ZOOMSCALE);
        }
    }

    function _handleCreateEllipseEvent (e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        e.preventDefault();
        if (e.type == "mousedown") {
            _handleMouseDownOnCreateMarkup(e, _handleCreateEllipseEvent);
        } else if (e.type == "mouseup") {
            _handleMouseUpOnCreateMarkup(e, _drawDynamicEllipseMarkup, _createShapeMarkup);
        } else if (e.type == "mousemove") {
            _handleMouseMoveOnCreateMarkup(e, _drawDynamicEllipseMarkup);
        }
    }

    function _drawDynamicEllipseMarkup (endX, endY) {
        const pos1 = _getPositionOnPage(_markupMode.mouse.xStart, _markupMode.mouse.yStart, true);
        const pos2 = _getPositionOnPage(endX, endY, true);
        const dynamicCanvas = document.getElementById("PdfPageDynamicMarkupCanvas" + _markupMode.mouse.pageNo);
        if (dynamicCanvas.childNodes.length > 0) {
            const svgObj = dynamicCanvas.querySelector("ellipse");
            if (svgObj) {
                const box = _getCorrectedBoundingBox([pos1.x, pos1.y, pos2.x, pos2.y], dynamicCanvas, __ZOOMSCALE);
                _applyRectangleDifferences(box, [0.5, 0.5, 0.5, 0.5], __ZOOMSCALE * 2);
                svgObj.setAttribute("cx", (_markupMode.mouse.xStart + endX)/2);
                svgObj.setAttribute("cy", (_markupMode.mouse.yStart + endY)/2);
                svgObj.setAttribute("rx", Math.max((box.x2 - box.x1)/2, 0));
                svgObj.setAttribute("ry", Math.max((box.y2 - box.y1)/2, 0));
            }
        } else {
            var annotation = {
                id: 0,
                vertices: [pos1.x, pos1.y, pos1.x, pos1.y],
                boxDiffs: [0.5, 0.5, 0.5, 0.5],
                outlineColor: [1.0, 0.0, 0.0],
                alpha: 1.0,
                filled: false
            };
            const pageCanvas = document.getElementById("PdfPageDisplayCanvas" + _markupMode.mouse.pageNo);
            const pageHeight = parseInt(pageCanvas.clientHeight);
            const pageWidth = parseInt(pageCanvas.clientWidth);
            const svgLayer = document.createElementNS(_svgNS, "svg");
            svgLayer.setAttribute("height", pageHeight + "px");
            svgLayer.setAttribute("width", pageWidth + "px");
            svgLayer.style.position = "absolute";
            svgLayer.style.left = "0px";
            svgLayer.style.top = "0px";
            dynamicCanvas.appendChild(svgLayer);
            _displayPdfCircle(annotation, svgLayer, false, __ZOOMSCALE);
        }
    }

    function _handleCreateLeaderLineEvent (e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        e.preventDefault();
        if (e.type == "mousedown") {
            _handleMouseDownOnCreateMarkup(e, _handleCreateLeaderLineEvent);
        } else if (e.type == "mouseup") {
            _handleMouseUpOnCreateMarkup(e, _drawDynamicLeaderLineMarkup, _createLeaderLineMarkup);
        } else if (e.type == "mousemove") {
            _handleMouseMoveOnCreateMarkup(e, _drawDynamicLeaderLineMarkup);
        }
    }

    function _createLeaderLineMarkup () {
        if (_markupMode.mouse.xStart == _markupMode.mouse.xEnd &&
            _markupMode.mouse.yStart == _markupMode.mouse.yEnd) {
            returnObj.SetMarkupModePDF(null);
            return;
        }
        const pos1 = _getPositionOnPage(_markupMode.mouse.xStart, _markupMode.mouse.yStart);
        const pos2 = _getPositionOnPage(_markupMode.mouse.xEnd, _markupMode.mouse.yEnd);
        if (!pos1 || !pos2) {
            returnObj.SetMarkupModePDF(null);
            return;
        }
        const pageNo = _markupMode.mouse.pageNo;
        const x1 = pos1.x, y1 = pos1.y;
        const x2 = pos2.x, y2 = pos2.y;
        const boundingSpacing = 5.5;
        const bx1 = Math.min(x1, x2) - boundingSpacing;
        const bx2 = Math.max(x1, x2) + boundingSpacing;
        const by1 = Math.min(y1, y2) - boundingSpacing;
        const by2 = Math.max(y1, y2) + boundingSpacing;
        const annotation = {
            type: _markupTypes.leaderLine,
            id: _getNextPdfAnnotationId(),
            boundingBox: [bx1, by1, bx2, by2],
            vertices: [x1, y1, x2, y2],
            pageNo: pageNo - 1,
            color: _deepCloneObject(_lineDefaultProps.lineColor),
            head: _deepCloneObject(_lineDefaultProps.head),
            tail: _deepCloneObject(_lineDefaultProps.tail),
            borderStyle: _deepCloneObject(_borderDefaultProps),
            visible: !_filterPdfMarkups,
            flags: _deepCloneObject(_annotFlagsDefaults),
            isNew: true
        };
        var parsedAnnoSet = _pdfParsedAnnotationSet;
        if (!parsedAnnoSet) {
            parsedAnnoSet = [];
        }
        parsedAnnoSet.push(annotation);
        returnObj.SetMarkupModePDF(null);
        _addAnnoIdToPage(pageNo, _pdfParsedAnnotationSet.length-1);
        _redrawPdfAnnotationPage(pageNo);
        _pushActionToMarkupHistory(_undoPresets.create, [annotation]);
        _markupObserver.set("annoCreated", annotation);
    }

    function _drawDynamicLeaderLineMarkup (endX, endY) {
        const pageNo = _markupMode.mouse.pageNo;
        const pageCanvas = document.getElementById("PdfPageDisplayCanvas" + pageNo);
        const pageHeight = parseInt(pageCanvas.clientHeight);
        const dynamicCanvas = document.getElementById("PdfPageDynamicMarkupCanvas" + pageNo);
        if (dynamicCanvas.childNodes.length > 0) {
            const polyline = dynamicCanvas.querySelector("polyline");
            const p = polyline.points.getItem(1);
            p.x = endX;
            p.y = endY;
        } else {
            const x1 = _markupMode.mouse.xStart / __ZOOMSCALE;
            const y1 = (pageHeight - _markupMode.mouse.yStart) / __ZOOMSCALE;
            const annotation = {
                id: 0,
                vertices: [x1, y1, x1, y1],
                pageNo: pageNo - 1,
                color: _parseRGBA(_uiColors.markup.line),
                head: _markupMode.type == _markupTypes.leaderLineHeadTail ? "OpenArrow" : "None",
                tail: "None"
            };
            const pageWidth = parseInt(pageCanvas.clientWidth);
            const svgLayer = document.createElementNS(_svgNS, "svg");
            svgLayer.setAttribute("height", pageHeight + "px");
            svgLayer.setAttribute("width", pageWidth + "px");
            svgLayer.style.position = "absolute";
            svgLayer.style.left = "0px";
            svgLayer.style.top = "0px";
            dynamicCanvas.appendChild(svgLayer);
            const defs = document.createElementNS(_svgNS, "defs");
            svgLayer.appendChild(defs);
            _displayPdfLeaderLine(annotation, svgLayer, false, __ZOOMSCALE);
        }
    }

    function _handleCreateFreehandEvent (e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        e.preventDefault();
        if (e.type == "mousedown") {
            if (_markupMode.mouse.pageNo == null) {
                _deselectAllSelectedAnnotations();
                _markupMode.mouse.pageNo = parseInt(e.target.id.substring(e.target.className.length));
                _createDynamicMarkupCanvas(_handleCreateFreehandEvent);
            }
            _markupMode.mouse.down = true;
            const pos = _getMousePosOnCanvas(e);
            _markupMode.mouse.xVect = [pos.x];
            _markupMode.mouse.yVect = [pos.y];
        } else if (e.type == "mouseup" && _markupMode.mouse.down) {
            e.stopPropagation();
            _markupMode.mouse.down = false;
            const pos = _getMousePosOnCanvas(e);
            _markupMode.mouse.xVect.push(pos.x);
            _markupMode.mouse.yVect.push(pos.y);
            _createFreehandMarkup();
            _removeDynamicMarkupCanvas();
        } else if (e.type == "mousemove" && _markupMode.mouse.down) {
            e.stopPropagation();
            const pos = _getMousePosOnCanvas(e);
            _markupMode.mouse.xVect.push(pos.x);
            _markupMode.mouse.yVect.push(pos.y);
            _drawDynamicFreehandMarkup(pos.x, pos.y);
        }
    }

    function _createFreehandMarkup () {
        if (_markupMode.mouse.xVect.length < 2 ||
            _markupMode.mouse.xVect.length != _markupMode.mouse.yVect.length) {
            returnObj.SetMarkupModePDF(null);
            return;
        }

        const pageNo = _markupMode.mouse.pageNo;
        var verticesArray = [];
        var minX = Number.MAX_VALUE, minY = Number.MAX_VALUE,
            maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE;
        for (var i=0;i<_markupMode.mouse.xVect.length;i++) {
            const pos = _getPositionOnPage(_markupMode.mouse.xVect[i], _markupMode.mouse.yVect[i]);
            minX = Math.min(minX, pos.x);
            maxX = Math.max(maxX, pos.x);
            minY = Math.min(minY, pos.y);
            maxY = Math.max(maxY, pos.y);

            verticesArray.push(pos.x);
            verticesArray.push(pos.y);
        }

        var boundingBoxArray = [
            minX - _borderDefaultProps.width,
            minY - _borderDefaultProps.width,
            maxX + _borderDefaultProps.width,
            maxY + _borderDefaultProps.width
        ];
        var annotation = {
            type: _markupTypes.freehand,
            id: _getNextPdfAnnotationId(),
            vertices: verticesArray,
            boundingBox: boundingBoxArray,
            color: _deepCloneObject(_freehandDefaultProps.lineColor),
            alpha: 1.0,
            width: _deepCloneObject(_borderDefaultProps.width),
            pageNo: pageNo - 1,
            visible: !_filterPdfMarkups,
            flags: _deepCloneObject(_annotFlagsDefaults),
            isNew: true
        };
        var parsedAnnoSet = _pdfParsedAnnotationSet;
        if (!parsedAnnoSet) {
            parsedAnnoSet = [];
        }
        parsedAnnoSet.push(annotation);
        returnObj.SetMarkupModePDF(null);
        _addAnnoIdToPage(pageNo, _pdfParsedAnnotationSet.length-1);
        _redrawPdfAnnotationPage(pageNo);
        _pushActionToMarkupHistory(_undoPresets.create, [annotation]);
        _markupObserver.set("annoCreated", annotation);
    }

    function _drawDynamicFreehandMarkup (endX, endY) {
        const pageCanvas = document.getElementById("PdfPageDisplayCanvas" + _markupMode.mouse.pageNo);
        const pageHeight = parseInt(pageCanvas.clientHeight);
        const dynamicCanvas = document.getElementById("PdfPageDynamicMarkupCanvas" + _markupMode.mouse.pageNo);
        if (dynamicCanvas.childNodes.length > 0) {
            const svgObj = dynamicCanvas.querySelector("path");
            if (svgObj) {
                const newD = svgObj.getAttribute("d") + " L" + endX + " " + endY;
                svgObj.setAttribute("d", newD);
            }
        } else {
            const x1 = _markupMode.mouse.xVect[0] / __ZOOMSCALE;
            const y1 = (pageHeight - _markupMode.mouse.yVect[0]) / __ZOOMSCALE;
            const annotation = {
                id: 0,
                vertices: [x1, y1],
                boundingBox: [0, 0, 0, 0],
                color: [1.0, 0.0, 0.0],
                alpha: 1.0,
                width: 1.0
            };
            const pageWidth = parseInt(pageCanvas.clientWidth);
            const svgLayer = document.createElementNS(_svgNS, "svg");
            svgLayer.setAttribute("height", pageHeight + "px");
            svgLayer.setAttribute("width", pageWidth + "px");
            svgLayer.style.position = "absolute";
            svgLayer.style.left = "0px";
            svgLayer.style.top = "0px";
            dynamicCanvas.appendChild(svgLayer);
            _displayPdfFreehand(annotation, svgLayer, false, __ZOOMSCALE);
        }
    }

    function _handleCreateNoteEvent (e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        if (e.type == "click") {
            e.preventDefault();
            _deselectAllSelectedAnnotations();
            _markupMode.mouse.pageNo = parseInt(e.target.id.substring(e.target.className.length));
            const pos = _getMousePosOnCanvas(e);
            if (!pos) return;
            _markupMode.mouse.xEnd = pos.x;
            _markupMode.mouse.yEnd = pos.y;
            document.getElementById(_currentCanvasId).style.cursor = "auto";
            _createDynamicNoteCanvas(_markupMode.mouse.pageNo);
            _createUserInputForNoteMarkup(_markupMode.mouse.pageNo, _markupMode.mouse.xEnd, _markupMode.mouse.yEnd);
        }
    }

    function _createDynamicNoteCanvas (pageNo, edit) {
        const pageWrapper = document.getElementById(`PdfPageDisplayWrapper${pageNo}`);
        const wrapperWidth = parseFloat(pageWrapper.style.width);
        const wrapperHeight = parseFloat(pageWrapper.style.height);
        const width = edit === true ? (_checkPageRotation()%2==1 ? wrapperHeight : wrapperWidth) : wrapperWidth;
        const height = edit === true ? (_checkPageRotation()%2==1 ? wrapperWidth : wrapperHeight) : wrapperHeight;

        const dynamicCanvas = document.createElement("div");
        dynamicCanvas.id = "PdfPageDynamicMarkupCanvas" + pageNo;
        dynamicCanvas.className = "PdfPageDynamicMarkupCanvas";
        dynamicCanvas.width = width;
        dynamicCanvas.height = height;
        dynamicCanvas.style.width = width + "px";
        dynamicCanvas.style.height = height + "px";
        dynamicCanvas.style.position = "absolute";
        dynamicCanvas.style.zIndex = _zIndex.dynamicCanvas;
        if (edit === true) dynamicCanvas.style.transform = _getAnnotationCanvasTransform(width, height);

        pageWrapper.insertBefore(dynamicCanvas, pageWrapper.firstChild);
    }

    function _createUserInputForNoteMarkup (pageNo, clickX, clickY) {
        const width = _noteDefaultProps.fontSize * _noteDefaults.minWidth * __ZOOMSCALE;
        const minHeight = (_noteDefaultProps.fontSize - 2) * __ZOOMSCALE;

        const divWrapper = document.createElement("div");
        divWrapper.id = "PdfMarkupNoteCreator";
        divWrapper.className = "PdfMarkupNoteCreator";
        divWrapper.style.position = "absolute";
        divWrapper.style.left = clickX + 0.5 * __ZOOMSCALE + "px";
        divWrapper.style.top = clickY + 0.5 * __ZOOMSCALE + "px";
        divWrapper.style.overflow = "hidden";
        divWrapper.style.outline = __ZOOMSCALE + "px solid " + _getColorHex(_noteDefaultProps.lineColor);
        divWrapper.style.backgroundColor = _getColorHex(_noteDefaultProps.textBGColor);
        divWrapper.style.minHeight = minHeight + "px";
        divWrapper.style.width = width + "px";

        const editableDiv = document.createElement("div");
        editableDiv.setAttribute("contentEditable", "true");
        editableDiv.style.left = "0px";
        editableDiv.style.top = "0px";
        editableDiv.style.fontFamily = _noteDefaults.fontFamily;
        editableDiv.style.color = _getColorHex(_noteDefaultProps.textColor);
        editableDiv.style.fontSize = (_noteDefaultProps.fontSize * __ZOOMSCALE) + "px";
        editableDiv.style.textAlign = _noteDefaults.textAlignment;
        editableDiv.style.outline = "none";
        editableDiv.style.padding = _getNoteMarkupPadding(__ZOOMSCALE);
        editableDiv.style.whiteSpace = "pre-wrap";
        editableDiv.style.wordBreak = "break-word";
        editableDiv.style.lineHeight = "1.22";
        editableDiv.addEventListener("paste", function (e) {
            e.preventDefault();
            document.execCommand("inserttext", false, e.clipboardData.getData('text/plain'));
        });

        const dynamicCanvas = document.getElementById("PdfPageDynamicMarkupCanvas" + pageNo);
        divWrapper.appendChild(editableDiv);
        dynamicCanvas.appendChild(divWrapper);
        dynamicCanvas.addEventListener("mousedown", _checkExitNoteCreation);
        dynamicCanvas.addEventListener("keydown", _checkExitNoteCreation);
        editableDiv.focus();

        _markupObserver.set("annoSetEdited");
    }

    function _checkExitNoteCreation (e) {
        switch (e.type) {
            case "mousedown":
                if (e.target.id != "PdfMarkupNoteCreator" && !e.target.closest('#PdfMarkupNoteCreator')) {
                    returnObj.SetMarkupModePDF(null);
                }
                break;
            case "keydown":
                _handleNoteKeydown(e, function() { returnObj.SetMarkupModePDF(null); });
                break;
        }
    }

    function _getTag (element) {
        if (element.tagName) {
            return element.tagName.toLowerCase();
        }
        return "";
    }

    function _replaceLineBreaks (content, replacer) {
        return content.replace(/\r\n/g, replacer).replace(/\r/g,'').replace(/\n/g, replacer);
    }

    function _extractNoteContent (extractedNodes) {
        const lineFeedChar = "&#13;";
        var extractedContent = "";
        if (extractedNodes.length > 0) {
            for (var i = 0; i < extractedNodes.length; i++) {
                const tag = _getTag(extractedNodes[i]);
                if (tag == "br") {
                    extractedContent += lineFeedChar;
                } else if (tag == "text" || extractedNodes[i].nodeType == 3) {
                    let lineContent = encodeContent(extractedNodes[i].textContent);
                    lineContent = _replaceLineBreaks(lineContent, lineFeedChar);
                    extractedContent += lineContent;
                    if (extractedNodes[i+1] && _getTag(extractedNodes[i+1]) == "div") {
                        extractedContent += lineFeedChar;
                    }
                } else if (tag == "div") {
                    if (extractedNodes[i].hasChildNodes()) {
                        const divContent = _extractNoteContent(extractedNodes[i].childNodes);
                        extractedContent += divContent;
                        if (divContent !== lineFeedChar && extractedNodes[i+1] && _getTag(extractedNodes[i+1]) == "div") {
                            extractedContent += lineFeedChar;
                        }
                    }
                }
            }
        } else {
            extractedContent = "";
        }
        return extractedContent;
    }

    function _calculateLeaderlineVertices (vertices, x1, y1, x2, y2) {
        if (vertices[2] == vertices[4]) {
            //vertical
            if (vertices[3] < vertices[5]) {
                //below
                vertices[5] = Math.min(y1, y2);
                vertices[3] = vertices[5] - 12;
            } else {
                //above
                vertices[5] = Math.max(y1, y2);
                vertices[3] = vertices[5] + 12;
            }
            vertices[4] = (x1 + x2) / 2;
            vertices[2] = vertices[4];
        } else {
            //horizontal
            if (vertices[4] < vertices[2]) {
                //right
                vertices[4] = Math.max(x1, x2);
                vertices[2] = vertices[4] + 12;
            } else {
                //left
                vertices[4] = Math.min(x1, x2);
                vertices[2] = vertices[4] - 12;
            }
            vertices[5] = (y1 + y2) / 2;
            vertices[3] = vertices[5];
        }
    }

    function _createNoteMarkup () {
        const pageNo = _markupMode.mouse.pageNo;
        const divNote = document.querySelector("#PdfMarkupNoteCreator");
        if (!divNote) {
            const dynamicCanvas = document.querySelector("#PdfPageDynamicMarkupCanvas" + pageNo);
            if (dynamicCanvas) {
                document.querySelector("#PdfPageDisplayWrapper" + pageNo).removeChild(dynamicCanvas);
            }
            _markupMode.mouse.reset();
            return;
        }

        const pos1 = _getPositionOnPage(parseFloat(divNote.style.left) - 0.5 * __ZOOMSCALE,
                                        parseFloat(divNote.style.top) - 0.5 * __ZOOMSCALE);

        const rect = divNote.getBoundingClientRect();
        const pos2 = _getPositionOnPage(parseFloat(divNote.style.left) + rect.width,
                                        parseFloat(divNote.style.top) + rect.height);
        if ((!pos1 || !pos2)) {
            returnObj.SetMarkupModePDF(null);
            return;
        }

        var leaderLineArray = [];
        var boxDiffsArray = [];
        var boundingArray = [
            Math.min(pos1.x, pos2.x),
            Math.min(pos1.y, pos2.y),
            Math.max(pos1.x, pos2.x),
            Math.max(pos1.y, pos2.y)
        ];

        if (_markupMode.type == _markupTypes.noteLeader) {
            const dynamicCanvas = document.getElementById("PdfPageDynamicMarkupCanvas" + pageNo);
            if (dynamicCanvas) {
                const polyline = dynamicCanvas.querySelector("polyline");
                if (polyline) {
                    const pl1 = _getPositionOnPage(polyline.points.getItem(0));
                    const pl2 = _getPositionOnPage(polyline.points.getItem(1));
                    const pl3 = _getPositionOnPage(polyline.points.getItem(2));

                    leaderLineArray = [
                        pl1.x, pl1.y,
                        pl2.x, pl2.y,
                        pl3.x, pl3.y
                    ];
                    _calculateLeaderlineVertices(leaderLineArray, pos1.x, pos1.y, pos2.x, pos2.y);

                    boundingArray = [
                        Math.min(pos1.x, pos2.x, pl1.x, pl2.x, pl3.x),
                        Math.min(pos1.y, pos2.y, pl1.y, pl2.y, pl3.y),
                        Math.max(pos1.x, pos2.x, pl1.x, pl2.x, pl3.x),
                        Math.max(pos1.y, pos2.y, pl1.y, pl2.y, pl3.y)
                    ];

                    boxDiffsArray = [
                        Math.abs(boundingArray[0] - Math.min(pos1.x, pos2.x)),
                        Math.abs(boundingArray[1] - Math.min(pos1.y, pos2.y)),
                        Math.abs(boundingArray[2] - Math.max(pos1.x, pos2.x)),
                        Math.abs(boundingArray[3] - Math.max(pos1.y, pos2.y))
                    ];
                }
            }
        }

        const annotation = {
            type: _markupMode.type,
            id: _getNextPdfAnnotationId(),
            boundingBox: boundingArray,
            pageNo: pageNo - 1,
            content: _extractNoteContent(divNote.childNodes),
            fontFamily: _noteDefaults.fontFamily,
            textAlignment: _noteDefaults.textAlignment,
            fontColor: _noteDefaultProps.textColor,
            fontSize: _noteDefaultProps.fontSize,
            head: _noteDefaultProps.head,
            leaderLineVertices: leaderLineArray,
            visible: !_filterPdfMarkups,
            boxDiffs: boxDiffsArray,
            rotation: _checkPageRotation() * 90,
            alpha: _noteDefaultProps.alpha,
            outlineColor: _noteDefaultProps.lineColor,
            fillColor: _noteDefaultProps.textBGColor,
            borderStyle: _deepCloneObject(_borderDefaultProps),
            flags: _deepCloneObject(_annotFlagsDefaults),
            isNew: true
        };
        annotation.richText = {
            body: {
                "xmlns": _xhtmlNS,
                "xmlns:xfa": "http://www.xfa.org/schema/xfa-data/1.0/",
                "xfa:APIVersion": "Acrobat:20.9.0",
                "xfa:spec": "2.0.2",
                style: {
                    "font-stretch": "normal",
                    "font-weight": "normal",
                    "font-style": "normal",
                    "color": _getColorHex(_noteDefaultProps.textColor),
                    "text-align": _noteDefaults.textAlignment,
                    "font-size": _noteDefaultProps.fontSize + "pt"
                }
            },
            p: {
                "dir": "ltr"
            },
            span: {
                style: {
                    "font-size": _noteDefaultProps.fontSize + "pt",
                    "color": _getColorHex(_noteDefaultProps.textColor),
                    "font-family": _noteDefaults.fontFamily
                }
            }
        };
        var parsedAnnoSet = _pdfParsedAnnotationSet;
        if (!parsedAnnoSet) {
            parsedAnnoSet = [];
        }
        parsedAnnoSet.push(annotation);
        _markupMode.mouse.reset();
        _addAnnoIdToPage(pageNo, _pdfParsedAnnotationSet.length-1);
        _redrawPdfAnnotationPage(pageNo);
        _pushActionToMarkupHistory(_undoPresets.create, [annotation]);
        _markupObserver.set("annoCreated", annotation);
        _removeDynamicMarkupCanvas();
    }

    function _handleCreateNoteLeaderEvent (e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        e.preventDefault();
        if (e.type == "mousedown") {
            _handleMouseDownOnCreateMarkup(e, _handleCreateNoteLeaderEvent);
        } else if (e.type == "mouseup") {
            e.stopPropagation();
            if (document.getElementById("PdfMarkupNoteCreator")) return;
            _handleMouseUpOnCreateMarkup(e, _drawDynamicNoteLeaderMarkup, _createUserInputForNoteLeaderMarkup, true);
        } else if (e.type == "mousemove") {
            _handleMouseMoveOnCreateMarkup(e, _drawDynamicNoteLeaderMarkup);
        }
    }

    function _drawDynamicNoteLeaderMarkup (endX, endY) {
        const pageNo = _markupMode.mouse.pageNo;
        const pageCanvas = document.getElementById("PdfPageDisplayCanvas" + pageNo);
        const pageHeight = parseInt(pageCanvas.clientHeight);
        const dynamicCanvas = document.getElementById("PdfPageDynamicMarkupCanvas" + pageNo);
        const tailLength = 12 * __ZOOMSCALE;
        if (dynamicCanvas.childNodes.length > 0) {
            const svgObj = dynamicCanvas.querySelector("polyline");
            const dx = endX - svgObj.points.getItem(0).x;
            const dy = endY - svgObj.points.getItem(0).y;

            const thetaRad = Math.atan2(dy, dx);
            const dist = Math.sqrt(Math.pow(dy, 2) + Math.pow(dx, 2));
            if (dist < tailLength) {
                endX = svgObj.points.getItem(0).x + tailLength * Math.cos(thetaRad);
                endY = svgObj.points.getItem(0).y + tailLength * Math.sin(thetaRad);
            }

            const theta = Math.abs(thetaRad * (180 / Math.PI));
            if (theta > 67.5 && theta < 112.5) {
                svgObj.points.getItem(1).x = endX;
                svgObj.points.getItem(1).y = endY;
                svgObj.points.getItem(2).x = endX;
                if (endY > svgObj.points.getItem(0).y) {
                    svgObj.points.getItem(2).y = endY + tailLength;
                    svgObj.setAttribute("dir", "S");
                } else {
                    svgObj.points.getItem(2).y = endY - tailLength;
                    svgObj.setAttribute("dir", "N");
                }
            } else {
                svgObj.points.getItem(1).x = endX;
                svgObj.points.getItem(1).y = endY;
                if (endX > svgObj.points.getItem(0).x) {
                    svgObj.points.getItem(2).x = endX + tailLength;
                    svgObj.setAttribute("dir", "E");
                } else {
                    svgObj.points.getItem(2).x = endX - tailLength;
                    svgObj.setAttribute("dir", "W");
                }
                svgObj.points.getItem(2).y = endY;
            }
        } else {
            const x1 = _markupMode.mouse.xStart / __ZOOMSCALE;
            const y1 = (pageHeight - _markupMode.mouse.yStart) / __ZOOMSCALE;
            const annotation = {
                id: 0,
                vertices: [x1, y1, x1, y1, (x1 + tailLength), y1],
                color: _noteDefaultProps.lineColor,
                head: "OpenArrow",
                tail: "None",
                pageNo: pageNo - 1,
            };
            const pageWidth = parseInt(pageCanvas.clientWidth);
            const svgLayer = document.createElementNS(_svgNS, "svg");
            svgLayer.setAttribute("height", pageHeight + "px");
            svgLayer.setAttribute("width", pageWidth + "px");
            svgLayer.style.position = "absolute";
            svgLayer.style.left = "0px";
            svgLayer.style.top = "0px";
            dynamicCanvas.appendChild(svgLayer);
            const defs = document.createElementNS(_svgNS, "defs");
            svgLayer.appendChild(defs);
            _displayPdfLeaderLine(annotation, svgLayer, false, __ZOOMSCALE);
            // default direction is 'E'
            const polyline = svgLayer.querySelector("polyline");
            if (polyline) {
                polyline.setAttribute("dir", "E");
            }
        }
    }

    function _createUserInputForNoteLeaderMarkup () {
        const pageNo = _markupMode.mouse.pageNo;
        var dynamicCanvas = document.getElementById("PdfPageDynamicMarkupCanvas" + pageNo);
        if (!dynamicCanvas) return;
        document.getElementById(_currentCanvasId).style.cursor = "auto";
        dynamicCanvas.removeEventListener("mousedown", _handleCreateNoteLeaderEvent);
        dynamicCanvas.removeEventListener("mousemove", _handleCreateNoteLeaderEvent);
        dynamicCanvas.removeEventListener("mouseup", _handleCreateNoteLeaderEvent);
        dynamicCanvas.removeEventListener("click", _handleCreateNoteLeaderEvent);
        dynamicCanvas.removeEventListener("dblclick", _handleCreateNoteLeaderEvent);
        if (dynamicCanvas.childNodes.length > 0) {
            var svgObj = dynamicCanvas.querySelector("polyline");
            if (svgObj) {
                var dirValue = svgObj.getAttribute("dir");
                var x = svgObj.points.getItem(2).x;
                var y = svgObj.points.getItem(2).y;
                switch (dirValue) {
                    case "S":
                        _createUserInputForNoteMarkup(
                            pageNo,
                            x - ((_noteDefaultProps.fontSize * _noteDefaults.minWidth * __ZOOMSCALE) / 2),
                            y
                        );
                        break;
                    case "N":
                        _createUserInputForNoteMarkup(
                            pageNo,
                            x - ((_noteDefaultProps.fontSize * _noteDefaults.minWidth * __ZOOMSCALE) / 2),
                            y - ((_noteDefaultProps.fontSize + 3) * __ZOOMSCALE)
                        );
                        break;
                    case "E":
                        _createUserInputForNoteMarkup(
                            pageNo,
                            x,
                            y - ((_noteDefaultProps.fontSize / 2 + 2.5 /* padding & border */) * __ZOOMSCALE)
                        );
                        break;
                    case "W":
                        _createUserInputForNoteMarkup(
                            pageNo,
                            x - (_noteDefaultProps.fontSize * _noteDefaults.minWidth * __ZOOMSCALE),
                            y - ((_noteDefaultProps.fontSize / 2 + 2.5 /* padding & border */) * __ZOOMSCALE)
                        );
                        break;
                }
            }
        }
    }

    function _handleCreatePolylineEvent (e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        e.preventDefault();
        if (e.type == "mousedown") {
            if (_markupMode.mouse.pageNo == null) {
                _deselectAllSelectedAnnotations();
                _markupMode.mouse.pageNo = parseInt(e.target.id.substring(e.target.className.length));
                _createDynamicMarkupCanvas(_handleCreatePolylineEvent);
            }
            const pos = _getMousePosOnCanvas(e);
            _markupMode.mouse.xStart = pos.x;
            _markupMode.mouse.yStart = pos.y;
        } else if (e.type == "click") {
            e.stopPropagation();
            const pos = _getMousePosOnCanvas(e);
            if (Math.abs(pos.x - _markupMode.mouse.xStart) <= _markupMode.mouse.jitter &&
                Math.abs(pos.y - _markupMode.mouse.yStart) <= _markupMode.mouse.jitter) {
                _addDynamicPolylinePoint(pos.x, pos.y);
            }
        } else if (e.type == "dblclick") {
            _createPolylineMarkup();
            _removeDynamicMarkupCanvas();
        } else if (e.type == "mousemove") {
            e.stopPropagation();
            const pos = _getMousePosOnCanvas(e);
            _drawDynamicPolylineMarkup(pos.x, pos.y);
        }
    }

    function _createPolylineMarkup () {
        const pageNo = _markupMode.mouse.pageNo;
        const dynamicCanvas = document.getElementById("PdfPageDynamicMarkupCanvas" + pageNo);
        if (!dynamicCanvas) {
            returnObj.SetMarkupModePDF(null);
            return;
        }
        const polyline = dynamicCanvas.querySelector("polyline");
        if (!polyline) {
            returnObj.SetMarkupModePDF(null);
            return;
        }
        const length = polyline.points.length || polyline.points.numberOfItems;
        if (length < 2) {
            returnObj.SetMarkupModePDF(null);
            return;
        }

        const verticesArray = [];
        var minX = Number.MAX_VALUE, minY = Number.MAX_VALUE,
            maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE;
        for (var i=0;i<length-2;i++) {
            const pt = polyline.points.getItem(i);
            const pos = _getPositionOnPage(pt);
            minX = Math.min(minX, pos.x);
            maxX = Math.max(maxX, pos.x);
            minY = Math.min(minY, pos.y);
            maxY = Math.max(maxY, pos.y);

            verticesArray.push(pos.x);
            verticesArray.push(pos.y);
        }

        const boundingBoxArray = [
            minX - _borderDefaultProps.width,
            minY - _borderDefaultProps.width,
            maxX + _borderDefaultProps.width,
            maxY + _borderDefaultProps.width
        ];
        const annotation = {
            type: _markupTypes.polyline,
            id: _getNextPdfAnnotationId(),
            vertices: verticesArray,
            boundingBox: boundingBoxArray,
            pageNo: pageNo - 1,
            color: _deepCloneObject(_lineDefaultProps.lineColor),
            head: _deepCloneObject(_lineDefaultProps.head),
            tail: _deepCloneObject(_lineDefaultProps.tail),
            borderStyle: _deepCloneObject(_borderDefaultProps),
            visible: !_filterPdfMarkups,
            flags: _deepCloneObject(_annotFlagsDefaults),
            isNew: true
        };
        var parsedAnnoSet = _pdfParsedAnnotationSet;
        if (!parsedAnnoSet) {
            parsedAnnoSet = [];
        }
        parsedAnnoSet.push(annotation);
        returnObj.SetMarkupModePDF(null);
        _addAnnoIdToPage(pageNo, _pdfParsedAnnotationSet.length-1);
        _redrawPdfAnnotationPage(pageNo);
        _pushActionToMarkupHistory(_undoPresets.create, [annotation]);
        _markupObserver.set("annoCreated", annotation);
    }

    function _addDynamicPolylinePoint (x, y) {
        const dynamicCanvas = document.getElementById("PdfPageDynamicMarkupCanvas" + _markupMode.mouse.pageNo);
        if (dynamicCanvas) {
            const svgObj = dynamicCanvas.querySelector("svg");
            const polyline = dynamicCanvas.querySelector("polyline");
            if (svgObj && polyline) {
                const point = svgObj.createSVGPoint();
                point.x = x;
                point.y = y;
                polyline.points.appendItem(point);
            }
        }
    }

    function _drawDynamicPolylineMarkup (endX, endY) {
        const pageNo = _markupMode.mouse.pageNo;
        const pageCanvas = document.getElementById("PdfPageDisplayCanvas" + pageNo);
        const pageHeight = parseInt(pageCanvas.clientHeight);
        const dynamicCanvas = document.getElementById("PdfPageDynamicMarkupCanvas" + pageNo);
        if (dynamicCanvas.childNodes.length > 0) {
            const polyline = dynamicCanvas.querySelector("polyline");
            const length = polyline.points.length || polyline.points.numberOfItems;
            const p = polyline.points.getItem(length - 1);
            p.x = endX;
            p.y = endY;
        } else {
            const x1 = _markupMode.mouse.xStart / __ZOOMSCALE;
            const y1 = (pageHeight - _markupMode.mouse.yStart) / __ZOOMSCALE;
            const annotation = {
                id: 0,
                vertices: [x1, y1, x1, y1],
                pageNo: pageNo - 1,
                color: _parseRGBA(_uiColors.markup.line),
                head: _markupMode.type == _markupTypes.polyLineHeadTail ? "OpenArrow" : "None",
                tail: "None"
            };
            const pageWidth = parseInt(pageCanvas.clientWidth);
            const svgLayer = document.createElementNS(_svgNS, "svg");
            svgLayer.setAttribute("height", pageHeight + "px");
            svgLayer.setAttribute("width", pageWidth + "px");
            svgLayer.style.position = "absolute";
            svgLayer.style.left = "0px";
            svgLayer.style.top = "0px";
            dynamicCanvas.appendChild(svgLayer);
            const defs = document.createElementNS(_svgNS, "defs");
            svgLayer.appendChild(defs);
            _displayPdfLeaderLine(annotation, svgLayer, false, __ZOOMSCALE);
        }
    }

    function _handleCreatePolygonEvent (e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        e.preventDefault();
        if (e.type == "mousedown") {
            if (_markupMode.mouse.pageNo == null) {
                _deselectAllSelectedAnnotations();
                _markupMode.mouse.pageNo = parseInt(e.target.id.substring(e.target.className.length));
                _createDynamicMarkupCanvas(_handleCreatePolygonEvent);
                const spos = _getMousePosOnCanvas(e);
                _markupMode.mouse.xStart = spos.x;
                _markupMode.mouse.yStart = spos.y;
            }
            const epos = _getMousePosOnCanvas(e);
            _markupMode.mouse.xEnd = epos.x;
            _markupMode.mouse.yEnd = epos.y;
        } else if (e.type == "click") {
            e.stopPropagation();
            const pos = _getMousePosOnCanvas(e);
            if (Math.abs(pos.x - _markupMode.mouse.xStart) <= _markupMode.mouse.endThreshold &&
                Math.abs(pos.y - _markupMode.mouse.yStart) <= _markupMode.mouse.endThreshold) {
                _createPolygonMarkup(1);
                _removeDynamicMarkupCanvas();
            } else if (Math.abs(pos.x - _markupMode.mouse.xEnd) <= _markupMode.mouse.jitter &&
                       Math.abs(pos.y - _markupMode.mouse.yEnd) <= _markupMode.mouse.jitter) {
                _addDynamicPolygonPoint(pos.x, pos.y);
            }
        } else if (e.type == "dblclick") {
            _createPolygonMarkup(2);
            _removeDynamicMarkupCanvas();
        } else if (e.type == "mousemove") {
            e.stopPropagation();
            const pos = _getMousePosOnCanvas(e);
            _drawDynamicPolygonMarkup(pos.x, pos.y);
        }
    }

    function _createPolygonMarkup (trimNum) {
        const pageNo = _markupMode.mouse.pageNo;
        const dynamicCanvas = document.getElementById("PdfPageDynamicMarkupCanvas" + pageNo);
        if (!dynamicCanvas) {
            returnObj.SetMarkupModePDF(null);
            return;
        }
        const polyline = dynamicCanvas.querySelector("polyline");
        if (!polyline) {
            returnObj.SetMarkupModePDF(null);
            return;
        }
        const length = polyline.points.length || polyline.points.numberOfItems;
        if (length < 2) {
            returnObj.SetMarkupModePDF(null);
            return;
        }

        const verticesArray = [];
        var minX = Number.MAX_VALUE, minY = Number.MAX_VALUE,
            maxX = Number.MIN_VALUE, maxY = Number.MIN_VALUE;
        for (var i=0;i<(length-trimNum);i++) {
            const pt = polyline.points.getItem(i);
            const pos = _getPositionOnPage(pt);
            minX = Math.min(minX, pos.x);
            maxX = Math.max(maxX, pos.x);
            minY = Math.min(minY, pos.y);
            maxY = Math.max(maxY, pos.y);

            verticesArray.push(pos.x);
            verticesArray.push(pos.y);
        }
        const pt0 = polyline.points.getItem(0);
        const pos0 = _getPositionOnPage(pt0);
        verticesArray.push(pos0.x);
        verticesArray.push(pos0.y);

        const boundingBoxArray = [
            minX - _borderDefaultProps.width,
            minY - _borderDefaultProps.width,
            maxX + _borderDefaultProps.width,
            maxY + _borderDefaultProps.width
        ];
        const filledVal = _markupMode.type.indexOf("Filled") > -1;
        const annotation = {
            type: _markupMode.type,
            id: _getNextPdfAnnotationId(),
            vertices: verticesArray,
            boundingBox: boundingBoxArray,
            pageNo: pageNo - 1,
            outlineColor: _shapeDefaultProps.lineColor,
            alpha: _shapeDefaultProps.alpha,
            visible: !_filterPdfMarkups,
            filled: filledVal,
            flags: _deepCloneObject(_annotFlagsDefaults),
            isNew: true
        };
        if (filledVal) {
            annotation.fillColor = _shapeDefaultProps.lineColor;
        }
        var parsedAnnoSet = _pdfParsedAnnotationSet;
        if (!parsedAnnoSet) {
            parsedAnnoSet = [];
        }
        parsedAnnoSet.push(annotation);
        returnObj.SetMarkupModePDF(null);
        _addAnnoIdToPage(pageNo, _pdfParsedAnnotationSet.length-1);
        _redrawPdfAnnotationPage(pageNo);
        _pushActionToMarkupHistory(_undoPresets.create, [annotation]);
        _markupObserver.set("annoCreated", annotation);
    }

    function _addDynamicPolygonPoint (x, y) {
        const dynamicCanvas = document.getElementById("PdfPageDynamicMarkupCanvas" + _markupMode.mouse.pageNo);
        if (dynamicCanvas) {
            const svgObj = dynamicCanvas.querySelector("svg");
            const polyline = dynamicCanvas.querySelector("polyline");
            if (svgObj && polyline) {
                const point = svgObj.createSVGPoint();
                point.x = x;
                point.y = y;
                polyline.points.appendItem(point);
            }
        }
    }

    function _drawDynamicPolygonMarkup (endX, endY) {
        const pageNo = _markupMode.mouse.pageNo;
        const pageCanvas = document.getElementById("PdfPageDisplayCanvas" + pageNo);
        const pageHeight = parseInt(pageCanvas.clientHeight);
        const dynamicCanvas = document.getElementById("PdfPageDynamicMarkupCanvas" + pageNo);
        if (dynamicCanvas.childNodes.length > 0) {
            const polyline = dynamicCanvas.querySelector("polyline");
            const length = polyline.points.length || polyline.points.numberOfItems;
            const p = polyline.points.getItem(length - 1);
            p.x = endX;
            p.y = endY;
            if (length > 3) {
                const polygon = dynamicCanvas.querySelector("polygon");
                if (polygon) {
                    polygon.style.visibility = "visible";
                }
            }
        } else {
            const x1 = _markupMode.mouse.xStart / __ZOOMSCALE;
            const y1 = (pageHeight - _markupMode.mouse.yStart) / __ZOOMSCALE;
            const annotation = {
                id: 0,
                vertices: [x1, y1, x1, y1],
                pageNo: pageNo - 1,
                color: _parseRGBA(_uiColors.markup.line),
                head: "None",
                tail: "None"
            };
            const pageWidth = parseInt(pageCanvas.clientWidth);
            const svgLayer = document.createElementNS(_svgNS, "svg");
            svgLayer.setAttribute("height", pageHeight + "px");
            svgLayer.setAttribute("width", pageWidth + "px");
            svgLayer.style.position = "absolute";
            svgLayer.style.left = "0px";
            svgLayer.style.top = "0px";
            dynamicCanvas.appendChild(svgLayer);
            _displayPdfLeaderLine(annotation, svgLayer, false, __ZOOMSCALE);
            _drawDynamicPolygonEndPoint(svgLayer);
        }
    }

    function _drawDynamicPolygonEndPoint (canvas) {
        const x = _markupMode.mouse.xStart;
        const y = _markupMode.mouse.yStart;
        const polygon = document.createElementNS(_svgNS, "polygon");
        const points =
            (x-10) + "," + (y-10) + " " + (x+11) + "," + (y-10) + " " +
            (x+11) + "," + (y+11) + " " + (x-10) + "," + (y+11);
        polygon.setAttribute("points", points);
        polygon.style.fill = "none";
        polygon.style.stroke = "black";
        polygon.style.strokeWidth = "1";
        polygon.style.strokeDasharray = "16 5";
        polygon.style.strokeDashoffset = "8";
        polygon.style.visibility = "hidden";
        const group = canvas.querySelector("g");
        group.appendChild(polygon);
    }

    function _handleCreateTextEvent (e) {
        if (e.buttons && e.button && e.buttons != 0 && e.button != 0) {
            return;
        }
        if (e.type == "mousedown") {
            _clearPdfAnnoSelection();
            if (e.target.className == "PdfPageDynamicTextLayer") {
                _markupMode.mouse.down = true;
                var pageNo = parseInt(e.target.parentNode.id.substring(e.target.parentNode.className.length));
                _markupMode.mouse.pageNo = pageNo;

                disableDynamicTextSelection(true, pageNo);
            }
        } else if (e.type == "mouseup" && _markupMode.mouse.down) {
            e.stopPropagation();
            _markupMode.mouse.down = false;
            var selection = window.getSelection();
            if (selection.type == "Range") {
                _createTextMarkup(selection, _markupMode.type);
            } else {
                disableDynamicTextSelection(false, _markupMode.mouse.pageNo);
            }
        }
    }

    function disableDynamicTextSelection(disable, except) {
        const textCanvases = Array.from(document.querySelectorAll(".PdfPageDynamicTextMarkupCanvas"));
        textCanvases.forEach(function (page) {
            if (page.id != `PdfPageDynamicTextMarkupCanvas${except}`) {
                if (disable) {
                    page.classList.add("PdfMarkupTextSelection");
                } else {
                    page.classList.remove("PdfMarkupTextSelection");
                }
            }
        });
    }

    function _addDynamicTextMarkupStyle() {
        const selectionStyle = document.createElement('style');
        selectionStyle.innerHTML = `
            .PdfPageDynamicTextMarkupCanvas.PdfMarkupTextSelection .PdfPageDynamicTextLayer::selection {
                color: rgba(0,0,0,0);
                background: rgba(0,0,0,0);
            }
        `;
        document.getElementsByTagName('head')[0].appendChild(selectionStyle);
    }

    /**
     * Get cloned & non-rotated text node by removing rotate part from transform
     * @param {HTMLSpanElement} node Node to clone
     * @returns {HTMLSpanElement} Cloned node
     */
    function _getNonRotatedTextNode (node) {
        /** @type {HTMLSpanElement} */
        const clonedNode = node.cloneNode(true);
        clonedNode.style.visibility = "hidden";
        const transform = clonedNode.style.transform;
        if (transform) {
            var index = transform.indexOf("rotate(");
            if (index != -1) {
                var subStr = transform.substring(index);
                index = subStr.indexOf(")");
                if (index != -1) {
                    subStr = subStr.substring(index + 1).trim();
                    clonedNode.style.transform = subStr;
                }
            }
        }
        node.parentNode.appendChild(clonedNode);
        return clonedNode;
    }

    /**
     * Create text markup from Selection
     * @param {Selection} selection Range of text selected by the user
     * @param {string} markupType 'textHighlight' | 'textStrikethrough' | 'textUnderline'
     */
    function _createTextMarkup (selection, markupType) {
        /** @type {number[]} */
        const verticesArray = [];
        for (let i = 0; i < selection.rangeCount; i++) {
            _createVerticesFromRange(selection.getRangeAt(i), verticesArray);
        }

        if (verticesArray.length == 0) {
            returnObj.SetMarkupModePDF(null);
            return;
        }

        const pageNo = verticesArray.shift();

        let bx1 = verticesArray[0],
            by1 = verticesArray[1],
            bx2 = verticesArray[0],
            by2 = verticesArray[1];

        for (let i = 2; i < verticesArray.length - 1; i += 2) {
            bx1 = Math.min(bx1, verticesArray[i]);
            by1 = Math.max(by1, verticesArray[i+1]);
            bx2 = Math.max(bx2, verticesArray[i]);
            by2 = Math.min(by2, verticesArray[i+1]);
        }

        if (isNaN(bx1) || isNaN(by1) || isNaN(bx2) || isNaN(by2)) {
            returnObj.SetMarkupModePDF(null);
            return;
        }

        const boundingArray = [bx1, by1, bx2, by2];

        const annotation = {
            type: markupType,
            id: _getNextPdfAnnotationId(),
            vertices: verticesArray,
            boundingBox: boundingArray,
            color: [1.0, 0.0, 0.0],
            alpha: 1.0,
            pageNo: pageNo - 1,
            flags: _deepCloneObject(_annotFlagsDefaults),
            visible: !_filterPdfMarkups,
            isNew: true
        };

        if (markupType == _markupTypes.textHighlight) {
            annotation.color = [1.0, 0.67, 0.0];
            annotation.alpha = 0.5;
        } else if (markupType == _markupTypes.textUnderline) {
            annotation.color = [0.42, 0.85, 0.15];
        }

        let parsedAnnoSet = _pdfParsedAnnotationSet;
        if (!parsedAnnoSet) {
            parsedAnnoSet = [];
        }
        parsedAnnoSet.push(annotation);
        returnObj.SetMarkupModePDF(null);
        selection.removeAllRanges();
        _addAnnoIdToPage(pageNo, _pdfParsedAnnotationSet.length-1);
        _redrawPdfAnnotationPage(pageNo);
        _pushActionToMarkupHistory(_undoPresets.create, [annotation]);
        _markupObserver.set("annoCreated", annotation);
    }

    /**
     * Get page number from ID
     * i.e. 123 from 'PdfPageDisplayTextLayer123'
     * @param {string} str Element ID
     * @returns {number | null} Returns number if it's valid, otherwise null
     */
    function _getPageNo (str) {
        const res = str.match(/(\d+)/g);
        if (res && res.length == 1) {
            return parseInt(res[0]);
        }
        return null;
    }

    /** @typedef {{pageNo: number, idNo: number}} PageAndId */

    /**
     * Get page number and text id number from ID
     * i.e. 123 and 456 from 'PdfPageDisplayTextLayer123_456'
     * @param {string} str Element ID
     * @returns {PageAndId | null} Returns @see PageAndId if it's valid, otherwise null
     */
    function _getPageAndId (str) {
        const res = str.match(/(\d+)/g);
        if (res && res.length == 2) {
            return { pageNo: parseInt(res[0]), idNo: parseInt(res[1]) };
        }
        return null;
    };

    /**
     * Create text markup from Range
     * @param {Range} range Fragment of a document that can contain nodes and parts of text nodes
     * @param {number[]} verticesArray New points are added into this array
     */
    function _createVerticesFromRange (range, verticesArray) {
        if (range.collapsed) return;

        /**
         * Get closest span node
         * @param {Node} node
         * @returns {Node | null}
         */
        function getSpanNode (node) {
            const nodeName = node.nodeName.toUpperCase();
            if (nodeName == "SPAN") {
                return node;
            } else if (nodeName == "DIV") {
                return null;
            } else {
                return getSpanNode(node.parentNode);
            }
        };

        const startOffset = range.startContainer.nodeName.toUpperCase() !== "DIV"
            ? range.startOffset
            : undefined;
        const endOffset = range.endContainer.nodeName.toUpperCase() !== "DIV"
            ?  range.endOffset
            : undefined;
        let spans = range.cloneContents().querySelectorAll('span');
        if (!spans.length) {
            if (range.startContainer === range.endContainer) {
                const span = getSpanNode(range.startContainer);
                if (span) {
                    spans = [span];
                }
            }
        }

        let pageWidth = 0;
        let pageHeight = 0;

        spans.forEach(function (span, index) {
            const lastSpan = index == spans.length - 1;
            const pageId = _getPageAndId(span.id);
            if (pageId) {
                if (verticesArray.length == 0) {
                    verticesArray.push(pageId.pageNo);

                    const page = document.querySelector(`#PdfPageDisplayTextLayer${pageId.pageNo}`);
                    pageWidth = page.parentNode.clientWidth;
                    pageHeight = page.parentNode.clientHeight;
                }

                if (pageId.pageNo && verticesArray.length && pageId.pageNo == verticesArray[0] &&
                    pageWidth && pageHeight) {
                    const textNode = document.querySelector(`#PdfPageDisplayTextLayer${pageId.pageNo}_${pageId.idNo}`);
                    if (textNode) {
                        if (index == 0) {
                            _createFirstTextMarkup(pageWidth, pageHeight, textNode, startOffset, endOffset, lastSpan, verticesArray);
                        } else if (lastSpan) {
                            _createLastTextMarkup(pageWidth, pageHeight, textNode, endOffset, verticesArray);
                        } else {
                            _createMiddleTextMarkup(pageWidth, pageHeight, textNode, verticesArray);
                        }
                    }
                }
            }
        });
    }

    /**
     * Create text markup of first span
     * @param {number} pageWidth Page width
     * @param {number} pageHeight Page height
     * @param {HTMLSpanElement} textNode Text node to create a markup on
     * @param {number} startOffset A number representing where in the text node the Range starts
     * @param {number} endOffset A number representing where in the text node the Range ends
     * @param {boolean} oneText True if startOffset and endOffset is on the same text node
     * @param {number[]} verticesArray Array to add new points
     */
    function _createFirstTextMarkup (pageWidth, pageHeight, textNode, startOffset, endOffset, oneText, verticesArray) {
        const textNodeLeft = _getTextNodeLeft(textNode, pageWidth, pageHeight);
        const clonedTextNode = _getNonRotatedTextNode(textNode);
        const textNodeWidth = clonedTextNode.getBoundingClientRect().width;
        const textContent = clonedTextNode.textContent;

        let anchorWidth = 0;
        let x1, x2, x3, x4;

        if (!startOffset) {
            x1 = x4 = textNodeLeft / __ZOOMSCALE;
            x2 = x3 = (textNodeLeft + textNodeWidth) / __ZOOMSCALE;
        } else {
            clonedTextNode.textContent = textContent.substring(0, startOffset);
            anchorWidth = clonedTextNode.getBoundingClientRect().width;
            x1 = x4 = (textNodeLeft + anchorWidth) / __ZOOMSCALE;
            x2 = x3 = (textNodeLeft + textNodeWidth) / __ZOOMSCALE;
        }

        if (oneText) {
            clonedTextNode.textContent = textContent.substring(startOffset, endOffset);
            const rangeWidth = clonedTextNode.getBoundingClientRect().width;
            x2 = x3 = x1 + (rangeWidth / __ZOOMSCALE);
        }

        _adjustTextDecoPoints(x1, x2, x3, x4, pageWidth, pageHeight, textNode, 2 * __ZOOMSCALE, anchorWidth / __ZOOMSCALE, verticesArray);
    }

    /**
     * Create text markup of last span
     * @param {number} pageWidth Page width
     * @param {number} pageHeight Page height
     * @param {Element} textNode Text node to create a markup on
     * @param {number} endOffset A number representing where in the text node the Range ends
     * @param {number[]} verticesArray Array to add new points
     */
    function _createLastTextMarkup (pageWidth, pageHeight, textNode, endOffset, verticesArray) {
        const textNodeLeft = _getTextNodeLeft(textNode, pageWidth, pageHeight);

        let x1, x2, x3, x4;

        x1 = x2 = x3 = x4 = textNodeLeft / __ZOOMSCALE;
        if (endOffset > 0 || endOffset === undefined) {
            const clonedFocusNode = _getNonRotatedTextNode(textNode);
            clonedFocusNode.textContent = clonedFocusNode.textContent.substring(0, endOffset);
            const rangeWidth = clonedFocusNode.getBoundingClientRect().width;
            x2 = x3 = x1 + (rangeWidth / __ZOOMSCALE);
        }

        _adjustTextDecoPoints(x1, x2, x3, x4, pageWidth, pageHeight, textNode, 2 * __ZOOMSCALE, 0, verticesArray);
    }

    /**
     * Create text markup of middle span
     * @param {number} pageWidth Page width
     * @param {number} pageHeight Page height
     * @param {Element} textNode Text node to create a markup on
     * @param {number[]} verticesArray Array to add new points
     */
    function _createMiddleTextMarkup (pageWidth, pageHeight, textNode, verticesArray) {
        const textNodeLeft = _getTextNodeLeft(textNode, pageWidth, pageHeight);
        const clonedTextNode = _getNonRotatedTextNode(textNode);
        const textNodeWidth = clonedTextNode.getBoundingClientRect().width;

        let x1, x2, x3, x4;

        x1 = x4 = textNodeLeft / __ZOOMSCALE;
        x2 = x3 = (textNodeLeft + textNodeWidth) / __ZOOMSCALE;

        _adjustTextDecoPoints(x1, x2, x3, x4, pageWidth, pageHeight, textNode, 2 * __ZOOMSCALE, 0, verticesArray);
    }

    /**
     * Get left pos of text node
     * @param {HTMLSpanElement} textNode Text node to get position from
     * @param {number} pageWidth Page width
     * @param {number} pageHeight Page height
     * @returns {number} Left position of text node
     */
    function _getTextNodeLeft (textNode, pageWidth, pageHeight) {
        if (_pageRotation == 0) {
            return parseFloat(textNode.style.left);
        } else if (_pageRotation == 90) {
            return parseFloat(textNode.style.top);
        } else if (_pageRotation == 180) {
            return pageWidth - parseFloat(textNode.style.left);
        } else if (_pageRotation == 270) {
            return pageHeight - parseFloat(textNode.style.top);
        }
    }

    /** @typedef {{x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number, }} TextDecoPts */

    /**
     * Adjust points of text decoration markup
     * @param {number} x1 X-axis value of left-bottom point
     * @param {number} x2 X-axis value of right-bottom point
     * @param {number} x3 X-axis value of right-top point
     * @param {number} x4 X-axis value of left-top point
     * @param {number} pageWidth Page width
     * @param {number} pageHeight Page height
     * @param {HTMLSpanElement} textNode Text node to create a markup on
     * @param {number} margin Margin to be added to top and bottom
     * @param {number} anchorOffset A distance between where the text node starts and where the Range starts
     * @param {number[]} verticesArray Array to add new points
     */
    function _adjustTextDecoPoints(x1, x2, x3, x4, pageWidth, pageHeight, textNode, margin, anchorOffset, verticesArray) {
        if (Math.abs(x1 - x2) <= 0.001) return;

        const pageRotatePoints = _adjustTextDecoPointsForPageRotate(x1, x2, x3, x4, pageWidth, pageHeight, textNode, margin);

        const textRotatePoints = _adjustTextDecoPointsForTextRotate(pageRotatePoints, textNode, anchorOffset);

        verticesArray.push(...textRotatePoints);
    }

    /**
     * Calculate Y-axis values of four corner points
     * @param {number} x1 X-axis value of left-bottom point
     * @param {number} x2 X-axis value of right-bottom point
     * @param {number} x3 X-axis value of right-top point
     * @param {number} x4 X-axis value of left-top point
     * @param {number} pageWidth Page width
     * @param {number} pageHeight Page height
     * @param {HTMLSpanElement} textNode Text node to create a markup on
     * @param {number} margin Margin to be added to top and bottom
     * @returns {TextDecoPts} Coordinates of four corner points
     */
    function _adjustTextDecoPointsForPageRotate (x1, x2, x3, x4, pageWidth, pageHeight, textNode, margin) {
        let y1, y2, y3, y4;
        if (_pageRotation == 0) {
            y1 = y2 = (pageHeight - parseFloat(textNode.style.top) + margin / 2) / __ZOOMSCALE;
            y3 = y4 = (pageHeight - (parseFloat(textNode.style.top) + parseFloat(textNode.clientHeight) + margin)) / __ZOOMSCALE;
        } else if (_pageRotation == 90) {
            y1 = y2 = (parseFloat(textNode.style.left) + margin / 2) / __ZOOMSCALE;
            y3 = y4 = (parseFloat(textNode.style.left) - parseFloat(textNode.clientHeight) - margin) / __ZOOMSCALE;
        } else if (_pageRotation == 180) {
            y1 = y2 = (parseFloat(textNode.style.top) + margin / 2) / __ZOOMSCALE;
            y3 = y4 = (parseFloat(textNode.style.top) - parseFloat(textNode.clientHeight) - margin) / __ZOOMSCALE;
        } else if (_pageRotation == 270) {
            y1 = y2 = (pageWidth - parseFloat(textNode.style.left) + margin / 2) / __ZOOMSCALE;
            y3 = y4 = (pageWidth - parseFloat(textNode.style.left) - parseFloat(textNode.clientHeight) - margin) / __ZOOMSCALE;
        }
        return {x1, y1, x2, y2, x3, y3, x4, y4};
    }

    /**
     * Rotate corner points around a point by text node transform angle
     * @param {TextDecoPts} pts Coordinates of four corner points
     * @param {HTMLSpanElement} textNode Text node to create a markup on
     * @param {number} anchorOffset A distance between where the text node starts and where the Range starts
     * @returns {number[]} Adjusted coordinates of four corner points
     */
    function _adjustTextDecoPointsForTextRotate (pts, textNode, anchorOffset) {
        /**
         * Find rotation degree i.e. 90deg or -22.5deg or -2.5e-06deg
         * @param {string} str transform of text node
         * @returns {number} Rotation degree
         */
        const getRotate = function (str) {
            if (str && str.length) {
                const res = str.match(/rotate\((.*)deg/);
                if (res && res.length === 2) {
                    return parseFloat(res[1]);
                }
            }
            return 0;
        };
        const alphaDegrees = getRotate(textNode.style.transform) - _pageRotation;
        const angle = -alphaDegrees * Math.PI / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const cenX = pts.x1 - anchorOffset;
        const cenY = pts.y1;

        /**
         * Rotate point around center point
         * @param {number} px X-axis value of a point to rotate
         * @param {number} py Y-axis value of a point to rotate
         * @returns
         */
        const rotatePoint = function (px, py) {
            const npx = px - cenX;
            const npy = py - cenY;

            const nx = npx * cos - npy * sin;
            const ny = npx * sin + npy * cos;

            return {
                x: nx + cenX,
                y: ny + cenY
            };
        };

        const p1 = rotatePoint(pts.x1, pts.y1);
        const x1 = p1.x, y1 = p1.y;
        const p2 = rotatePoint(pts.x2, pts.y2);
        const x2 = p2.x, y2 = p2.y;
        const p3 = rotatePoint(pts.x3, pts.y3);
        const x3 = p3.x, y3 = p3.y;
        const p4 = rotatePoint(pts.x4, pts.y4);
        const x4 = p4.x, y4 = p4.y;

        return [x1, y1, x2, y2, x4, y4, x3, y3];
    }
//PDF MARKUP PROPERTIES
    function _handleSetPdfMarkupProperties (props) {
        _ignoreCommand = false;
        var convertLineEndingStyle = function (cvStyle) {
            switch (cvStyle) {
                case "none":  return "None";
                case "point": return "ClosedArrow";
                case "round": return "Circle";
            }
            return "None";
        };
        if (props.shapeColorR != undefined &&
            props.shapeColorG != undefined &&
            props.shapeColorB != undefined) {
            _markupPropsCV.shapeColor = [props.shapeColorR, props.shapeColorG, props.shapeColorB];
        }
        if (props.setShapeColor != undefined)
            _markupPropsCV.setShapeColor = props.setShapeColor;
        if (props.opacity != undefined)
            _markupPropsCV.opacity = props.opacity;
        if (props.lineWeight != undefined)
            _markupPropsCV.lineWeight = props.lineWeight;
        if (props.lineStyle != undefined)
            _markupPropsCV.lineStyle = props.lineStyle;
        if (props.headStyle != undefined)
            _markupPropsCV.headStyle = convertLineEndingStyle(props.headStyle);
        if (props.tailStyle != undefined)
            _markupPropsCV.tailStyle = convertLineEndingStyle(props.tailStyle);
        if (props.fontSize != undefined)
            _markupPropsCV.fontSize = props.fontSize;
        if (props.textColorR != undefined &&
            props.textColorG != undefined &&
            props.textColorB != undefined) {
            _markupPropsCV.textColor = [props.textColorR, props.textColorG, props.textColorB];
        }
        if (props.lineColorR != undefined &&
            props.lineColorG != undefined &&
            props.lineColorB != undefined) {
            _markupPropsCV.lineColor = [props.lineColorR, props.lineColorG, props.lineColorB];
        }
    }

    function _applyPdfMarkupProperties(markupType) {
        switch (markupType) {
            case _markupTypes.note :
            case _markupTypes.noteLeader :
                _noteDefaultProps.alpha = _markupPropsCV.opacity;
                _noteDefaultProps.textColor = _markupPropsCV.textColor;
                _noteDefaultProps.textBGColor = _markupPropsCV.shapeColor;
                _noteDefaultProps.fontSize = _markupPropsCV.fontSize;
                _noteDefaultProps.lineColor = _markupPropsCV.lineColor;
                _noteDefaultProps.head = _markupPropsCV.headStyle;
                break;
            case _markupTypes.leaderLine :
            case _markupTypes.leaderLineHeadTail :
            case _markupTypes.polyline :
            case _markupTypes.polyLineHeadTail :
                _lineDefaultProps.alpha = _markupPropsCV.opacity;
                _lineDefaultProps.lineColor = _markupPropsCV.lineColor;
                _lineDefaultProps.head = _markupPropsCV.headStyle;
                _lineDefaultProps.tail = _markupPropsCV.tailStyle;
                break;
            case _markupTypes.rectangle :
            case _markupTypes.rectangleFilled :
            case _markupTypes.ellipse :
            case _markupTypes.ellipseFilled :
            case _markupTypes.polygon :
            case _markupTypes.polygonFilled :
                _shapeDefaultProps.alpha = _markupPropsCV.opacity;
                _shapeDefaultProps.lineColor = _markupPropsCV.lineColor;
                break;
            case _markupTypes.freehand :
                _freehandDefaultProps.alpha = _markupPropsCV.opacity;
                _freehandDefaultProps.lineColor = _markupPropsCV.lineColor;
                break;
            default :
                break;
        }

        if (_markupPropsCV.lineStyle == 0) {
            _borderDefaultProps.style = 'S';
        } else if (_markupPropsCV.lineStyle == 1) {
            _borderDefaultProps.style = 'D';
            _borderDefaultProps.pattern = [1, 1, 3, 1];
        } else if (_markupPropsCV.lineStyle == 2) {
            _borderDefaultProps.style = 'D';
            _borderDefaultProps.pattern = [1, 1, 1, 1, 3, 1];
        }
        _borderDefaultProps.width = _markupPropsCV.lineWeight;
    }

//PDF MARKUP VISIBILITY

    function _handleSetPdfMarkupVisibility (idNo, visible) {
        if (_ignoreCommand) return;
        var parsedAnno = _pdfParsedAnnotationSet[idNo];
        if (!parsedAnno) {
            return;
        }
        _confirmNoteChanges();
        if (visible != parsedAnno.visible) {
            if (_markupGroupOp.running) {
                _markupGroupOp.idNos.push(idNo);
                _markupGroupOp.action = visible ? _undoPresets.unhide : _undoPresets.hide;
            } else {
                _pushActionToMarkupHistory(visible ? _undoPresets.unhide : _undoPresets.hide, [parsedAnno]);
                parsedAnno.visible = visible;
                _redrawPdfAnnotationPage(parsedAnno.pageNo+1);
                _markupObserver.set("annoVisChanged", idNo, visible);

                var selectedIndex = _markupMode.hiddenSelectedAnnotations.indexOf(idNo);
                if (selectedIndex > -1) {
                    _markupMode.hiddenSelectedAnnotations.splice(selectedIndex, 1);
                    _handleSelectPdfAnnoAPI(idNo, true);
                }
                _markupObserver.set("annoSetEdited");
            }
        }
    }

    function _redrawPdfAnnotationPage (pageNo, noNavUpdate) {
        if (!_pageAnnoSetList[pageNo]) return;

        _clearPdfAnnoSelectionPage(pageNo);
        var oldAnnoCanvas = document.getElementById("PdfAnnotationCanvas" + pageNo);
        if (oldAnnoCanvas) {
            oldAnnoCanvas.parentNode.removeChild(oldAnnoCanvas);
        }
        for (var idNo of _pageAnnoSetList[pageNo]) {
            _displayPdfAnnotation(_pdfParsedAnnotationSet[idNo]);
        }

        if (noNavUpdate !== true) _drawNavPageAnnotations(pageNo);

        var newAnnoCanvas = document.getElementById("PdfAnnotationSvgLayer" + pageNo);
        if (!newAnnoCanvas) {
            return;
        }

        _addMarkupSelectEventsByPage(pageNo);
    }

    function _addMarkupSelectEventsByPage (pageNo) {
        const parent = document.getElementById(_parentCanvasId);
        parent.addEventListener("mousedown", _checkDeselectPdfAnnotation);
        document.getElementById(_parentCanvasId).addEventListener("keydown", _deletePdfAnnotationEvent);

        const canvas = document.querySelector("#PdfAnnotationCanvas" + pageNo);
        const selectableMUs = canvas.querySelectorAll(".PdfAnnotationElementSel");
        for (const mu of selectableMUs) {
            _addMarkupSelectEvents(mu);
        }
    }

//PDF MARKUP UNDO REDO

    function _undoVisibility (annotations, visibility) {
        const pagesToRedraw = new Set();
        const updateVisibility = function (id, pageNo, vis) {
            _pdfParsedAnnotationSet[id].visible = vis;
            pagesToRedraw.add(pageNo);
            _markupObserver.set("annoVisChanged", id, vis);
        };
        for (const anno of annotations) {
            updateVisibility(anno.id, anno.pageNo+1, visibility);
        }
        pagesToRedraw.forEach(function(pageNo) {
            _redrawPdfAnnotationPage(pageNo);
        });
    }

    function _undoDeletion (annotations, undo) {
        const pagesToRedraw = new Set();
        const undoDeletion = function (annotation) {
            const id = annotation.id;
            if (_pdfParsedAnnotationSet.length > id) {
                _pdfParsedAnnotationSet[id] = _deepCloneObject(annotation);
                _addAnnoIdToPage(annotation.pageNo+1, id);
                pagesToRedraw.add(annotation.pageNo+1);
                _markupObserver.set("annoCreated", _pdfParsedAnnotationSet[id]);
            }
        };
        const redoDeletion = function (annotation) {
            const id = annotation.id;
            const parsedAnno = _pdfParsedAnnotationSet[id];
            _deletePdfAnnotationById(parsedAnno);
            _pdfParsedAnnotationSet[id] = null;
            _removeAnnoIdFromPage(annotation.pageNo+1, id);
            _markupObserver.set("annoDeleted", id);
        };
        for (const anno of annotations) {
            if (undo)
                undoDeletion(anno);
            else
                redoDeletion(anno);
        }
        pagesToRedraw.forEach(function(pageNo) {
            _redrawPdfAnnotationPage(pageNo);
        });
    }

    function _undoMove (actionObject) {
        const pagesToRedraw = new Set();
        const newAnnotations = [];
        for (const anno of actionObject.annotations) {
            const id = anno.id;
            newAnnotations.push(_deepCloneObject(_pdfParsedAnnotationSet[id]));
            _pdfParsedAnnotationSet[id] = _deepCloneObject(anno);
            pagesToRedraw.add(anno.pageNo+1);
        }
        actionObject.annotations = newAnnotations;
        pagesToRedraw.forEach(function(pageNo) {
            _redrawPdfAnnotationPage(pageNo);
        });
    }

    function _undoLayerState (actionObject, undo) {
        if (!actionObject) return;
        if (undo)
            _pdfAnnotationSetLayerState.cur = actionObject.from;
        else
            _pdfAnnotationSetLayerState.cur = actionObject.to;

        _getOptionalContentConfig(true);
    }

    function _undoApplyToViewVisibility (annotations, undo) {
        const pagesToRedraw = new Set();
        const updateVisibility = function (id, pageNo, vis) {
            const anno = _pdfParsedAnnotationSet[id];
            if (anno.visible != vis) {
                anno.visible = vis;
                pagesToRedraw.add(pageNo);
                _markupObserver.set("annoVisChanged", id, vis);
            }
        };
        for (const anno of annotations) {
            updateVisibility(anno.id, anno.pageNo+1, undo ? anno.visible : false);
        }
        pagesToRedraw.forEach(function(pageNo) {
            _redrawPdfAnnotationPage(pageNo);
        });
    }

    function _undoCreation (annotations) {
        const anno = annotations[0];
        const id = anno.id;
        const parsedAnno = _pdfParsedAnnotationSet[id];
        _deletePdfAnnotationById(parsedAnno);
        _pdfParsedAnnotationSet[id] = null;
        _removeAnnoIdFromPage(anno.pageNo+1, id);
        _markupObserver.set("annoDeleted", id);
    }

    function _redoCreation (annotations) {
        const anno = annotations[0];
        const id = anno.id;
        if (_pdfParsedAnnotationSet.length <= id) {
            return;
        }
        _pdfParsedAnnotationSet[id] = _deepCloneObject(anno);
        _addAnnoIdToPage(anno.pageNo+1, id);
        _redrawPdfAnnotationPage(anno.pageNo+1);
        _markupObserver.set("annoCreated", _pdfParsedAnnotationSet[id]);
    }

    function _undoEdit (actionObject) {
        const id = actionObject.annotations[0].id;
        const newAnnotation = _deepCloneObject(_pdfParsedAnnotationSet[id]);
        _pdfParsedAnnotationSet[id] = _deepCloneObject(actionObject.annotations[0]);
        actionObject.annotations[0] = newAnnotation;
        _redrawPdfAnnotationPage(actionObject.annotations[0].pageNo+1);
    }

    function _undoApplyToView (annotations, undo) {
        if (annotations.length == 2) {
            _undoApplyToViewVisibility(annotations[0], undo);
            _undoDeletion(annotations[1], !undo);
        }
        _undoLayerState(_markupHistory.layerStateStack[_markupHistory.index], undo);
    }

    function _undoPdfMarkupAction () {
        _confirmNoteChanges();
        if (!_markupHistory || !_markupHistory.stack || _markupHistory.stack.length == 0 || _markupHistory.index < 0 || _markupHistory.index >= _markupHistory.stack.length) {
            return;
        }
        const actionObject = _markupHistory.stack[_markupHistory.index];
        if (!actionObject || !actionObject.annotations) {
            return;
        }
        switch (actionObject.actionName) {
            case _undoPresets.create:
                _undoCreation(actionObject.annotations);
                break;
            case _undoPresets.delete:
                _undoDeletion(actionObject.annotations, true);
                break;
            case _undoPresets.hide:
                _undoVisibility(actionObject.annotations, true);
                break;
            case _undoPresets.unhide:
                _undoVisibility(actionObject.annotations, false);
                break;
            case _undoPresets.move:
                _undoMove(actionObject);
                break;
            case _undoPresets.noteEdit:
            case _undoPresets.resize:
                _undoEdit(actionObject);
                break;
            case _undoPresets.applyToView:
                _undoApplyToView(actionObject.annotations, true);
                break;
            default :
                break;
        }
        _markupObserver.set("annoSetEdited");
        _markupHistory.index -= 1;
    }

    function _redoPdfMarkupAction () {
        _confirmNoteChanges();
        if (!_markupHistory || !_markupHistory.stack || _markupHistory.stack.length == 0 || _markupHistory.index < -1 || (_markupHistory.index >= _markupHistory.stack.length - 1)) {
            return;
        }
        _markupHistory.index += 1;
        const actionObject = _markupHistory.stack[_markupHistory.index];
        switch (actionObject.actionName) {
            case _undoPresets.create:
                _redoCreation (actionObject.annotations);
                break;
            case _undoPresets.delete:
                _undoDeletion(actionObject.annotations, false);
                break;
            case _undoPresets.hide:
                _undoVisibility(actionObject.annotations, false);
                break;
            case _undoPresets.unhide:
                _undoVisibility(actionObject.annotations, true);
                break;
            case _undoPresets.move:
                _undoMove(actionObject);
                break;
            case _undoPresets.noteEdit:
            case _undoPresets.resize:
                _undoEdit(actionObject);
                break;
            case _undoPresets.applyToView:
                _undoApplyToView(actionObject.annotations, false);
                break;
            default :
                break;
        }
        _markupObserver.set("annoSetEdited");
    }

    function _beginPdfOperationGroup () {
        _markupGroupOp.reset();
        _markupGroupOp.running = true;
    }

    function _endPdfOperationGroup () {
        switch (_markupGroupOp.action) {
            case _undoPresets.delete:
            {
                const annos = [];
                _markupGroupOp.idNos.forEach(function(idNo) {
                    const parsedAnno = _pdfParsedAnnotationSet[idNo];
                    if (parsedAnno.visible)
                        _deletePdfAnnotationById(parsedAnno);
                    annos.push(_deepCloneObject(parsedAnno));
                    var pageNo = parsedAnno.pageNo + 1;
                    _pdfParsedAnnotationSet[idNo] = null;
                    _removeAnnoIdFromPage(pageNo, idNo);
                    _markupObserver.set("annoDeleted", idNo);
                });
                _pushActionToMarkupHistory(_undoPresets.delete, annos);
            } break;
            case _undoPresets.hide:
            case _undoPresets.unhide:
            {
                const vis = _markupGroupOp.action == _undoPresets.hide ? false : true;
                const ids = [];
                const annos = [];
                const pages = new Set();
                _markupGroupOp.idNos.forEach(function(idNo) {
                    var parsedAnno = _pdfParsedAnnotationSet[idNo];
                    if (parsedAnno) {
                        parsedAnno.visible = vis;
                        ids.push(idNo);
                        annos.push(_deepCloneObject(parsedAnno));
                        pages.add(parsedAnno.pageNo+1);
                        _markupObserver.set("annoVisChanged", idNo, vis);
                    }
                });
                pages.forEach(function(pageNo) {
                    _redrawPdfAnnotationPage(pageNo);
                });
                _pushActionToMarkupHistory(_markupGroupOp.action, annos);
                if (vis) {
                    ids.forEach(function(idNo) {
                        var selectedIndex = _markupMode.hiddenSelectedAnnotations.indexOf(idNo);
                        if (selectedIndex > -1) {
                            _markupMode.hiddenSelectedAnnotations.splice(selectedIndex, 1);
                            _handleSelectPdfAnnoAPI(idNo, true);
                        }
                    });
                }
                _markupObserver.set("annoSetEdited");
            } break;
        }

        _markupGroupOp.reset();
    }

    /**
     * Push an action to the undo history list.
     * Clear the end of the list if we are situated anywhere but the end of it.
     * @param {string} actionName The name of the action to be added
     *      ("create", "delete", "move", ...)
     * @param {(JSON[])} annotations An array of annotations affected
     * @private
     * @memberof ThingView
     **/
    function _pushActionToMarkupHistory (actionName, annotations) {
        if (!actionName || !annotations) return;
        const getAnnotationTypeName = function (type, groupOp) {
            if (groupOp) return "Selected Annotations";
            switch(type) {
                case _markupTypes.note:
                    return "Note";
                case _markupTypes.noteLeader:
                    return "Note with Leader Line";
                case _markupTypes.leaderLine:
                case _markupTypes.leaderLineHeadTail :
                case _markupTypes.polyline :
                case _markupTypes.polyLineHeadTail :
                    return "Leader Line";
                case _markupTypes.rectangle :
                    return "Rectangle";
                case _markupTypes.rectangleFilled :
                    return "Filled Rectangle";
                case _markupTypes.ellipse :
                    return "Ellipse";
                case _markupTypes.ellipseFilled :
                    return "Filled Ellipse";
                case _markupTypes.polygon :
                    return "Polygon";
                case _markupTypes.polygonFilled :
                    return "Filled Polygon";
                case _markupTypes.freehand :
                    return "Freehand";
                case _markupTypes.textHighlight :
                    return "Text Highlight";
                case _markupTypes.textStrikethrough :
                    return "Text Strikethrough";
                case _markupTypes.textUnderline :
                    return "Text Underline";
                case _markupTypes.stamp :
                    return "Stamp";
                default :
                    return "";
            }
        };
        const getAnnotationActionName = function (name, groupOp) {
            if (groupOp) {
                return "group" + name.charAt(0).toUpperCase() + name.slice(1);
            } else {
                return name;
            }
        };
        const actionObject = {
            actionName: actionName,
            annotations: []
        };
        const groupOp = annotations.length == 1 ? false : true;
        for (const annot of annotations) {
            actionObject.annotations.push(_deepCloneObject(annot));
        }

        _markupHistory.index += 1;
        //remove back end of list
        if (_markupHistory.index > -1 && _markupHistory.index < _markupHistory.stack.length) {
            _markupHistory.stack.splice(_markupHistory.index);
        }

        _markupHistory.stack.push(actionObject);
        if (actionName === _undoPresets.applyToView) {
            const layerStateObject = {
                from: _pdfAnnotationSetLayerState.prev,
                to: _pdfAnnotationSetLayerState.cur
            };
            _markupHistory.layerStateStack[_markupHistory.index] = layerStateObject;

            _markupObserver.set("annoUndoActionAdded", actionName, "");
        } else {
            _markupObserver.set(
                "annoUndoActionAdded",
                getAnnotationActionName(actionName, groupOp),
                getAnnotationTypeName(actionObject.annotations[0].type, groupOp)
            );
        }
    }

    function _showContentOnly (show) {
        const wrapper = document.querySelector("#CreoDocumentScrollWrapper");
        if (!wrapper) return;

        // Hide/show scroll bars
        wrapper.style.overflow = show ? "hidden" : "auto scroll";

        // Hide/show markup selection
        const groups = wrapper.querySelectorAll("[id^=\"PdfMarkupAnchorGroup\"]");
        for (const group of groups) {
            group.style.visibility = show ? "hidden" : "visible";
        }
    }

    /**
     * Fast cloning with data loss (i.e. date, function, undefined, infinity, regexp, map, set, blob, etc.).
     * Only copy string, number and boolean values.
     * @param {Object} oldObj object to clone
     * @return {Object} Cloned object
     * @private
     * @memberof ThingView
     **/
    function _deepCloneObject(oldObj) {
        var obj = JSON.parse(JSON.stringify(oldObj));
        return obj;
    }

    /**
     * Convert various format (#FFFFFF, #FFF, rgba(255,255,255,1) and rgb(255,255,255)) of color
     * to RGBA array ([1.0, 1.0, 1.0, 1.0])
     * @param {string} color Color value
     * @param {boolean} integer Return array of integer values
     * @return {array} Array representing RGBA
     * @private
     * @memberof ThingView
     */
    function _parseRGBA (color, integer) {
        var colorParts;
        var parsedColor = color.replace(/\s\s*/g, ''); // Remove all spaces

        // Checks for 6 digit hex and converts string to integer
        if (colorParts = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(parsedColor))
            colorParts = [parseInt(colorParts[1], 16), parseInt(colorParts[2], 16), parseInt(colorParts[3], 16)];

        // Checks for 3 digit hex and converts string to integer
        else if (colorParts = /^#([\da-fA-F])([\da-fA-F])([\da-fA-F])/.exec(parsedColor))
            colorParts = [parseInt(colorParts[1], 16) * 17, parseInt(colorParts[2], 16) * 17, parseInt(colorParts[3], 16) * 17];

        // Checks for rgba and converts string to
        // integer/float using unary + operator to save bytes
        else if (colorParts = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*.[\d]+)\)/.exec(parsedColor))
            colorParts = [+colorParts[1], +colorParts[2], +colorParts[3], +colorParts[4]];

        // Checks for rgb and converts string to
        // integer/float using unary + operator to save bytes
        else if (colorParts = /^rgb\(([\d]+),([\d]+),([\d]+)\)/.exec(parsedColor))
            colorParts = [+colorParts[1], +colorParts[2], +colorParts[3]];

        // Otherwise throw an exception to make debugging easier
        else
            colorParts = [0,0,0,1];

        // Performs RGBA conversion by default
        isNaN(colorParts[3]) && (colorParts[3] = 1);

        if (integer !== true) {
            if (colorParts[0] != 0)
                colorParts[0] = colorParts[0] / 255;
            if (colorParts[1] != 0)
                colorParts[1] = colorParts[1] / 255;
            if (colorParts[2] != 0)
                colorParts[2] = colorParts[2] / 255;
        }

        return colorParts;
    }

    /**
     * Decimal floor
     *
     * @param {number} value The number.
     * @param {number} exp The exponent (the 10 logarithm of the adjustment base).
     * @returns {number} The adjusted value.
     */
    function floor10 (value, exp) {
        // If the exp is undefined or zero...
        if (typeof exp === 'undefined' || +exp === 0) {
            return Math.floor(value);
        }
        value = +value;
        exp = +exp;
        // If the value is not a number or the exp is not an integer...
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }
        // Shift
        value = value.toString().split('e');
        value = Math.floor(+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }

})();
