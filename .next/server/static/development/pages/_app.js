module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = require('../../../ssr-module-cache.js');
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete installedModules[moduleId];
/******/ 		}
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./components/Cursor/Cursor.jsx":
/*!**************************************!*\
  !*** ./components/Cursor/Cursor.jsx ***!
  \**************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @emotion/styled-base */ "@emotion/styled-base");
/* harmony import */ var _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_emotion_styled_base__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lodash_get__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lodash.get */ "lodash.get");
/* harmony import */ var lodash_get__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash_get__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var styles__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! styles */ "./styles/index.js");
/* harmony import */ var is_touch_device__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! is-touch-device */ "is-touch-device");
/* harmony import */ var is_touch_device__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(is_touch_device__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _emotion_core__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @emotion/core */ "@emotion/core");
/* harmony import */ var _emotion_core__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_emotion_core__WEBPACK_IMPORTED_MODULE_5__);

var _jsxFileName = "/Users/cliftoncampbell/Development/clif.world/components/Cursor/Cursor.jsx";
var __jsx = react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement;





let lastElement;
let lastPayload;

const getElementMetadata = (element, depth = 8) => {
  const payload = {
    hasXOverflow: false,
    hasYOverflow: false,
    isActive: false,
    isButton: false,
    isLink: false,
    isExternalLink: false
  };

  if (!element || element.isEqualNode(lastElement)) {
    return lastPayload || payload;
  }

  let _element = element;

  for (let i = 0; i < depth; i++) {
    var _element2;

    if (!_element) return payload;
    const nodeName = (_element2 = _element) === null || _element2 === void 0 ? void 0 : _element2.nodeName;

    if (!payload.isActive) {
      var _element3;

      payload.isLink = nodeName === 'A';
      payload.isExternalLink = payload.isLink && ((_element3 = _element) === null || _element3 === void 0 ? void 0 : _element3.target) === '_blank';
      payload.isButton = nodeName === 'BUTTON';
      payload.isActive = payload.isLink || payload.isButton;
    }

    if (!payload.hasXOverflow) {
      payload.hasXOverflow = _element.scrollWidth > _element.clientWidth;
    }

    if (!payload.hasYOverflow) {
      payload.hasYOverflow = _element.scrollHeight > _element.clientHeight;
      payload.hasXOverflow = _element.scrollWidth > _element.clientWidth;
    }

    _element = lodash_get__WEBPACK_IMPORTED_MODULE_2___default()(_element, 'parentElement');
  }

  lastElement = element;
  lastPayload = payload;
  return payload;
};

const DIAMETER = 20;
const RADIUS = DIAMETER / 2;

const CursorSymbol = _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()("div", {
  target: "e1bb7trp0",
  label: "CursorSymbol"
})("height:200%;width:200%;transform:translate(-25%,-25%) scale(0.5);transition:", Object(styles__WEBPACK_IMPORTED_MODULE_3__["getStyle"])('easeOutSize'), ",", Object(styles__WEBPACK_IMPORTED_MODULE_3__["getStyle"])('linearHue'), ";background:", Object(styles__WEBPACK_IMPORTED_MODULE_3__["getStyle"])('ctaBackground1'), ";border:1px solid ", Object(styles__WEBPACK_IMPORTED_MODULE_3__["getStyle"])('ctaBackground4'), ";border-radius:50%;::after{content:'';position:absolute;top:-6px;right:-6px;width:0;height:0;transform:rotate(45deg);opacity:0;transition:", Object(styles__WEBPACK_IMPORTED_MODULE_3__["getStyle"])('easeOutSize'), ",", Object(styles__WEBPACK_IMPORTED_MODULE_3__["getStyle"])('linearHue'), ";border-left:0px solid transparent;border-right:0px solid transparent;border-bottom:0px solid ", Object(styles__WEBPACK_IMPORTED_MODULE_3__["getStyle"])('ctaBackground4'), ";}" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL0N1cnNvci9DdXJzb3IuanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQW9EK0IiLCJmaWxlIjoiL1VzZXJzL2NsaWZ0b25jYW1wYmVsbC9EZXZlbG9wbWVudC9jbGlmLndvcmxkL2NvbXBvbmVudHMvQ3Vyc29yL0N1cnNvci5qc3giLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgZ2V0IGZyb20gJ2xvZGFzaC5nZXQnO1xuaW1wb3J0IHN0eWxlZCBmcm9tICdAZW1vdGlvbi9zdHlsZWQnO1xuaW1wb3J0IHsgZ2V0U3R5bGUgfSBmcm9tICdzdHlsZXMnO1xuaW1wb3J0IGlzVG91Y2hEZXZpY2UgZnJvbSAnaXMtdG91Y2gtZGV2aWNlJztcblxubGV0IGxhc3RFbGVtZW50O1xubGV0IGxhc3RQYXlsb2FkO1xuY29uc3QgZ2V0RWxlbWVudE1ldGFkYXRhID0gKGVsZW1lbnQsIGRlcHRoID0gOCkgPT4ge1xuICBjb25zdCBwYXlsb2FkID0ge1xuICAgIGhhc1hPdmVyZmxvdzogZmFsc2UsXG4gICAgaGFzWU92ZXJmbG93OiBmYWxzZSxcbiAgICBpc0FjdGl2ZTogZmFsc2UsXG4gICAgaXNCdXR0b246IGZhbHNlLFxuICAgIGlzTGluazogZmFsc2UsXG4gICAgaXNFeHRlcm5hbExpbms6IGZhbHNlLFxuICB9O1xuICBpZiAoIWVsZW1lbnQgfHwgZWxlbWVudC5pc0VxdWFsTm9kZShsYXN0RWxlbWVudCkpIHtcbiAgICByZXR1cm4gbGFzdFBheWxvYWQgfHwgcGF5bG9hZDtcbiAgfVxuICBsZXQgX2VsZW1lbnQgPSBlbGVtZW50O1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGRlcHRoOyBpKyspIHtcbiAgICBpZiAoIV9lbGVtZW50KSByZXR1cm4gcGF5bG9hZDtcbiAgICBjb25zdCBub2RlTmFtZSA9IF9lbGVtZW50Py5ub2RlTmFtZTtcbiAgICBpZiAoIXBheWxvYWQuaXNBY3RpdmUpIHtcbiAgICAgIHBheWxvYWQuaXNMaW5rID0gbm9kZU5hbWUgPT09ICdBJztcbiAgICAgIHBheWxvYWQuaXNFeHRlcm5hbExpbmsgPVxuICAgICAgICBwYXlsb2FkLmlzTGluayAmJiBfZWxlbWVudD8udGFyZ2V0ID09PSAnX2JsYW5rJztcbiAgICAgIHBheWxvYWQuaXNCdXR0b24gPSBub2RlTmFtZSA9PT0gJ0JVVFRPTic7XG4gICAgICBwYXlsb2FkLmlzQWN0aXZlID0gcGF5bG9hZC5pc0xpbmsgfHwgcGF5bG9hZC5pc0J1dHRvbjtcbiAgICB9XG4gICAgaWYgKCFwYXlsb2FkLmhhc1hPdmVyZmxvdykge1xuICAgICAgcGF5bG9hZC5oYXNYT3ZlcmZsb3cgPVxuICAgICAgICBfZWxlbWVudC5zY3JvbGxXaWR0aCA+IF9lbGVtZW50LmNsaWVudFdpZHRoO1xuICAgIH1cbiAgICBpZiAoIXBheWxvYWQuaGFzWU92ZXJmbG93KSB7XG4gICAgICBwYXlsb2FkLmhhc1lPdmVyZmxvdyA9XG4gICAgICAgIF9lbGVtZW50LnNjcm9sbEhlaWdodCA+IF9lbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICAgIHBheWxvYWQuaGFzWE92ZXJmbG93ID1cbiAgICAgICAgX2VsZW1lbnQuc2Nyb2xsV2lkdGggPiBfZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICB9XG5cbiAgICBfZWxlbWVudCA9IGdldChfZWxlbWVudCwgJ3BhcmVudEVsZW1lbnQnKTtcbiAgfVxuICBsYXN0RWxlbWVudCA9IGVsZW1lbnQ7XG4gIGxhc3RQYXlsb2FkID0gcGF5bG9hZDtcbiAgcmV0dXJuIHBheWxvYWQ7XG59O1xuXG5jb25zdCBESUFNRVRFUiA9IDIwO1xuY29uc3QgUkFESVVTID0gRElBTUVURVIgLyAyO1xuXG5jb25zdCBDdXJzb3JTeW1ib2wgPSBzdHlsZWQuZGl2YFxuICBoZWlnaHQ6IDIwMCU7XG4gIHdpZHRoOiAyMDAlO1xuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtMjUlLCAtMjUlKSBzY2FsZSgwLjUpO1xuICB0cmFuc2l0aW9uOiAke2dldFN0eWxlKCdlYXNlT3V0U2l6ZScpfSwgJHtnZXRTdHlsZSgnbGluZWFySHVlJyl9O1xuICBiYWNrZ3JvdW5kOiAke2dldFN0eWxlKCdjdGFCYWNrZ3JvdW5kMScpfTtcbiAgYm9yZGVyOiAxcHggc29saWQgJHtnZXRTdHlsZSgnY3RhQmFja2dyb3VuZDQnKX07XG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgOjphZnRlciB7XG4gICAgY29udGVudDogJyc7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHRvcDogLTZweDtcbiAgICByaWdodDogLTZweDtcbiAgICB3aWR0aDogMDtcbiAgICBoZWlnaHQ6IDA7XG4gICAgdHJhbnNmb3JtOiByb3RhdGUoNDVkZWcpO1xuICAgIG9wYWNpdHk6IDA7XG4gICAgdHJhbnNpdGlvbjogJHtnZXRTdHlsZSgnZWFzZU91dFNpemUnKX0sICR7Z2V0U3R5bGUoJ2xpbmVhckh1ZScpfTtcbiAgICBib3JkZXItbGVmdDogMHB4IHNvbGlkIHRyYW5zcGFyZW50O1xuICAgIGJvcmRlci1yaWdodDogMHB4IHNvbGlkIHRyYW5zcGFyZW50O1xuICAgIGJvcmRlci1ib3R0b206IDBweCBzb2xpZCAke2dldFN0eWxlKCdjdGFCYWNrZ3JvdW5kNCcpfTtcbiAgfVxuYDtcblxuY29uc3QgQ3Vyc29yU2hlbGwgPSBzdHlsZWQuZGl2YFxuICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgcG9zaXRpb246IGZpeGVkO1xuICBoZWlnaHQ6ICR7RElBTUVURVJ9cHg7XG4gIHdpZHRoOiAke0RJQU1FVEVSfXB4O1xuICBtaXgtYmxlbmQtbW9kZTogZXhjbHVzaW9uO1xuICB6LWluZGV4OiAxMDAwMDtcbiAgJi5vZmZTY3JlZW4gJHtDdXJzb3JTeW1ib2x9IHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtMjUlLCAtMjUlKSBzY2FsZSgwKTtcbiAgfVxuICAmLnByZXNzZWQgJHtDdXJzb3JTeW1ib2x9IHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtMjUlLCAtMjUlKSBzY2FsZSgwLjQpO1xuICB9XG4gICYub3ZlckFjdGl2ZUVsICR7Q3Vyc29yU3ltYm9sfSB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTI1JSwgLTI1JSkgc2NhbGUoMSk7XG4gICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XG4gIH1cbiAgJi5vdmVyQWN0aXZlRWwucHJlc3NlZCAke0N1cnNvclN5bWJvbH0ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKC0yNSUsIC0yNSUpIHNjYWxlKDAuOCk7XG4gIH1cbiAgJi5vdmVyTGluayAke0N1cnNvclN5bWJvbH0gOjphZnRlciB7XG4gICAgb3BhY2l0eTogMTtcbiAgICBib3JkZXItbGVmdDogNXB4IHNvbGlkIHRyYW5zcGFyZW50O1xuICAgIGJvcmRlci1yaWdodDogNXB4IHNvbGlkIHRyYW5zcGFyZW50O1xuICAgIGJvcmRlci1ib3R0b206IDVweCBzb2xpZCAke2dldFN0eWxlKCdjdGFCYWNrZ3JvdW5kMScpfTtcbiAgfVxuYDtcblxubGV0IF9jbGllbnRYID0gLTEwMDtcbmxldCBfY2xpZW50WSA9IC0xMDA7XG5jb25zdCBDdXJzb3IgPSAoKSA9PiB7XG4gIGNvbnN0IGN1cnNvckVsID0gdXNlUmVmKG51bGwpO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChpc1RvdWNoRGV2aWNlKCkpIHJldHVybiAoKSA9PiB7fTtcbiAgICBjb25zdCBwcm9jZXNzTW91c2VUYXJnZXQgPSAodGFyZ2V0KSA9PiB7XG4gICAgICBjb25zdCB7IGlzRXh0ZXJuYWxMaW5rLCBpc0FjdGl2ZSB9ID0gZ2V0RWxlbWVudE1ldGFkYXRhKHRhcmdldCk7XG4gICAgICBjdXJzb3JFbC5jdXJyZW50LmNsYXNzTGlzdC5yZW1vdmUoJ29mZlNjcmVlbicpO1xuICAgICAgY3Vyc29yRWwuY3VycmVudC5jbGFzc0xpc3QudG9nZ2xlKCdvdmVyTGluaycsIGlzRXh0ZXJuYWxMaW5rKTtcbiAgICAgIGN1cnNvckVsLmN1cnJlbnQuY2xhc3NMaXN0LnRvZ2dsZSgnb3ZlckFjdGl2ZUVsJywgaXNBY3RpdmUpO1xuICAgIH07XG4gICAgY29uc3Qgb25Nb3VzZU1vdmUgPSAoeyBjbGllbnRYLCBjbGllbnRZLCB0YXJnZXQgfSkgPT4ge1xuICAgICAgX2NsaWVudFggPSBjbGllbnRYO1xuICAgICAgX2NsaWVudFkgPSBjbGllbnRZO1xuICAgICAgcHJvY2Vzc01vdXNlVGFyZ2V0KHRhcmdldCk7XG4gICAgfTtcbiAgICBjb25zdCBvbk1vdXNlTGVhdmUgPSAoKSA9PiB7XG4gICAgICBjdXJzb3JFbC5jdXJyZW50LmNsYXNzTGlzdC5hZGQoJ29mZlNjcmVlbicpO1xuICAgIH07XG4gICAgY29uc3Qgb25Nb3VzZURvd24gPSAoKSA9PiB7XG4gICAgICBjdXJzb3JFbC5jdXJyZW50LmNsYXNzTGlzdC5hZGQoJ3ByZXNzZWQnKTtcbiAgICB9O1xuICAgIGNvbnN0IG9uTW91c2VVcCA9ICh7IGNsaWVudFgsIGNsaWVudFkgfSkgPT4ge1xuICAgICAgY3Vyc29yRWwuY3VycmVudC5jbGFzc0xpc3QucmVtb3ZlKCdwcmVzc2VkJyk7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcHJvY2Vzc01vdXNlVGFyZ2V0KFxuICAgICAgICAgIGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoY2xpZW50WCwgY2xpZW50WSksXG4gICAgICAgICk7XG4gICAgICB9LCA1KTtcbiAgICB9O1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBvbk1vdXNlTGVhdmUpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uTW91c2VEb3duKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgb25Nb3VzZVVwKTtcblxuICAgIGNvbnN0IHN0eWxlID0gZ2V0KGN1cnNvckVsLCAnY3VycmVudC5zdHlsZScsIHt9KTtcblxuICAgIGNvbnN0IHJlbmRlckN1cnNvclN0eWxlcyA9ICgpID0+IHtcbiAgICAgIHN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUoJHtfY2xpZW50WCAtIFJBRElVU31weCwgJHtcbiAgICAgICAgX2NsaWVudFkgLSBSQURJVVNcbiAgICAgIH1weClgO1xuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlckN1cnNvclN0eWxlcyk7XG4gICAgfTtcblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXJDdXJzb3JTdHlsZXMpO1xuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlKTtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBvbk1vdXNlTGVhdmUpO1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Nb3VzZURvd24pO1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG9uTW91c2VVcCk7XG4gICAgfTtcbiAgfSwgW10pO1xuICBpZiAoaXNUb3VjaERldmljZSgpKSByZXR1cm4gbnVsbDtcblxuICByZXR1cm4gKFxuICAgIDxDdXJzb3JTaGVsbCByZWY9e2N1cnNvckVsfT5cbiAgICAgIDxDdXJzb3JTeW1ib2wgLz5cbiAgICA8L0N1cnNvclNoZWxsPlxuICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgQ3Vyc29yO1xuIl19 */"));

const CursorShell = _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()("div", {
  target: "e1bb7trp1",
  label: "CursorShell"
})("pointer-events:none;position:fixed;height:", DIAMETER, "px;width:", DIAMETER, "px;mix-blend-mode:exclusion;z-index:10000;&.offScreen ", CursorSymbol, "{transform:translate(-25%,-25%) scale(0);}&.pressed ", CursorSymbol, "{transform:translate(-25%,-25%) scale(0.4);}&.overActiveEl ", CursorSymbol, "{transform:translate(-25%,-25%) scale(1);background:transparent;}&.overActiveEl.pressed ", CursorSymbol, "{transform:translate(-25%,-25%) scale(0.8);}&.overLink ", CursorSymbol, "::after{opacity:1;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:5px solid ", Object(styles__WEBPACK_IMPORTED_MODULE_3__["getStyle"])('ctaBackground1'), ";}" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL0N1cnNvci9DdXJzb3IuanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQTRFOEIiLCJmaWxlIjoiL1VzZXJzL2NsaWZ0b25jYW1wYmVsbC9EZXZlbG9wbWVudC9jbGlmLndvcmxkL2NvbXBvbmVudHMvQ3Vyc29yL0N1cnNvci5qc3giLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgZ2V0IGZyb20gJ2xvZGFzaC5nZXQnO1xuaW1wb3J0IHN0eWxlZCBmcm9tICdAZW1vdGlvbi9zdHlsZWQnO1xuaW1wb3J0IHsgZ2V0U3R5bGUgfSBmcm9tICdzdHlsZXMnO1xuaW1wb3J0IGlzVG91Y2hEZXZpY2UgZnJvbSAnaXMtdG91Y2gtZGV2aWNlJztcblxubGV0IGxhc3RFbGVtZW50O1xubGV0IGxhc3RQYXlsb2FkO1xuY29uc3QgZ2V0RWxlbWVudE1ldGFkYXRhID0gKGVsZW1lbnQsIGRlcHRoID0gOCkgPT4ge1xuICBjb25zdCBwYXlsb2FkID0ge1xuICAgIGhhc1hPdmVyZmxvdzogZmFsc2UsXG4gICAgaGFzWU92ZXJmbG93OiBmYWxzZSxcbiAgICBpc0FjdGl2ZTogZmFsc2UsXG4gICAgaXNCdXR0b246IGZhbHNlLFxuICAgIGlzTGluazogZmFsc2UsXG4gICAgaXNFeHRlcm5hbExpbms6IGZhbHNlLFxuICB9O1xuICBpZiAoIWVsZW1lbnQgfHwgZWxlbWVudC5pc0VxdWFsTm9kZShsYXN0RWxlbWVudCkpIHtcbiAgICByZXR1cm4gbGFzdFBheWxvYWQgfHwgcGF5bG9hZDtcbiAgfVxuICBsZXQgX2VsZW1lbnQgPSBlbGVtZW50O1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGRlcHRoOyBpKyspIHtcbiAgICBpZiAoIV9lbGVtZW50KSByZXR1cm4gcGF5bG9hZDtcbiAgICBjb25zdCBub2RlTmFtZSA9IF9lbGVtZW50Py5ub2RlTmFtZTtcbiAgICBpZiAoIXBheWxvYWQuaXNBY3RpdmUpIHtcbiAgICAgIHBheWxvYWQuaXNMaW5rID0gbm9kZU5hbWUgPT09ICdBJztcbiAgICAgIHBheWxvYWQuaXNFeHRlcm5hbExpbmsgPVxuICAgICAgICBwYXlsb2FkLmlzTGluayAmJiBfZWxlbWVudD8udGFyZ2V0ID09PSAnX2JsYW5rJztcbiAgICAgIHBheWxvYWQuaXNCdXR0b24gPSBub2RlTmFtZSA9PT0gJ0JVVFRPTic7XG4gICAgICBwYXlsb2FkLmlzQWN0aXZlID0gcGF5bG9hZC5pc0xpbmsgfHwgcGF5bG9hZC5pc0J1dHRvbjtcbiAgICB9XG4gICAgaWYgKCFwYXlsb2FkLmhhc1hPdmVyZmxvdykge1xuICAgICAgcGF5bG9hZC5oYXNYT3ZlcmZsb3cgPVxuICAgICAgICBfZWxlbWVudC5zY3JvbGxXaWR0aCA+IF9lbGVtZW50LmNsaWVudFdpZHRoO1xuICAgIH1cbiAgICBpZiAoIXBheWxvYWQuaGFzWU92ZXJmbG93KSB7XG4gICAgICBwYXlsb2FkLmhhc1lPdmVyZmxvdyA9XG4gICAgICAgIF9lbGVtZW50LnNjcm9sbEhlaWdodCA+IF9lbGVtZW50LmNsaWVudEhlaWdodDtcbiAgICAgIHBheWxvYWQuaGFzWE92ZXJmbG93ID1cbiAgICAgICAgX2VsZW1lbnQuc2Nyb2xsV2lkdGggPiBfZWxlbWVudC5jbGllbnRXaWR0aDtcbiAgICB9XG5cbiAgICBfZWxlbWVudCA9IGdldChfZWxlbWVudCwgJ3BhcmVudEVsZW1lbnQnKTtcbiAgfVxuICBsYXN0RWxlbWVudCA9IGVsZW1lbnQ7XG4gIGxhc3RQYXlsb2FkID0gcGF5bG9hZDtcbiAgcmV0dXJuIHBheWxvYWQ7XG59O1xuXG5jb25zdCBESUFNRVRFUiA9IDIwO1xuY29uc3QgUkFESVVTID0gRElBTUVURVIgLyAyO1xuXG5jb25zdCBDdXJzb3JTeW1ib2wgPSBzdHlsZWQuZGl2YFxuICBoZWlnaHQ6IDIwMCU7XG4gIHdpZHRoOiAyMDAlO1xuICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtMjUlLCAtMjUlKSBzY2FsZSgwLjUpO1xuICB0cmFuc2l0aW9uOiAke2dldFN0eWxlKCdlYXNlT3V0U2l6ZScpfSwgJHtnZXRTdHlsZSgnbGluZWFySHVlJyl9O1xuICBiYWNrZ3JvdW5kOiAke2dldFN0eWxlKCdjdGFCYWNrZ3JvdW5kMScpfTtcbiAgYm9yZGVyOiAxcHggc29saWQgJHtnZXRTdHlsZSgnY3RhQmFja2dyb3VuZDQnKX07XG4gIGJvcmRlci1yYWRpdXM6IDUwJTtcbiAgOjphZnRlciB7XG4gICAgY29udGVudDogJyc7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHRvcDogLTZweDtcbiAgICByaWdodDogLTZweDtcbiAgICB3aWR0aDogMDtcbiAgICBoZWlnaHQ6IDA7XG4gICAgdHJhbnNmb3JtOiByb3RhdGUoNDVkZWcpO1xuICAgIG9wYWNpdHk6IDA7XG4gICAgdHJhbnNpdGlvbjogJHtnZXRTdHlsZSgnZWFzZU91dFNpemUnKX0sICR7Z2V0U3R5bGUoJ2xpbmVhckh1ZScpfTtcbiAgICBib3JkZXItbGVmdDogMHB4IHNvbGlkIHRyYW5zcGFyZW50O1xuICAgIGJvcmRlci1yaWdodDogMHB4IHNvbGlkIHRyYW5zcGFyZW50O1xuICAgIGJvcmRlci1ib3R0b206IDBweCBzb2xpZCAke2dldFN0eWxlKCdjdGFCYWNrZ3JvdW5kNCcpfTtcbiAgfVxuYDtcblxuY29uc3QgQ3Vyc29yU2hlbGwgPSBzdHlsZWQuZGl2YFxuICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgcG9zaXRpb246IGZpeGVkO1xuICBoZWlnaHQ6ICR7RElBTUVURVJ9cHg7XG4gIHdpZHRoOiAke0RJQU1FVEVSfXB4O1xuICBtaXgtYmxlbmQtbW9kZTogZXhjbHVzaW9uO1xuICB6LWluZGV4OiAxMDAwMDtcbiAgJi5vZmZTY3JlZW4gJHtDdXJzb3JTeW1ib2x9IHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtMjUlLCAtMjUlKSBzY2FsZSgwKTtcbiAgfVxuICAmLnByZXNzZWQgJHtDdXJzb3JTeW1ib2x9IHtcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtMjUlLCAtMjUlKSBzY2FsZSgwLjQpO1xuICB9XG4gICYub3ZlckFjdGl2ZUVsICR7Q3Vyc29yU3ltYm9sfSB7XG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGUoLTI1JSwgLTI1JSkgc2NhbGUoMSk7XG4gICAgYmFja2dyb3VuZDogdHJhbnNwYXJlbnQ7XG4gIH1cbiAgJi5vdmVyQWN0aXZlRWwucHJlc3NlZCAke0N1cnNvclN5bWJvbH0ge1xuICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlKC0yNSUsIC0yNSUpIHNjYWxlKDAuOCk7XG4gIH1cbiAgJi5vdmVyTGluayAke0N1cnNvclN5bWJvbH0gOjphZnRlciB7XG4gICAgb3BhY2l0eTogMTtcbiAgICBib3JkZXItbGVmdDogNXB4IHNvbGlkIHRyYW5zcGFyZW50O1xuICAgIGJvcmRlci1yaWdodDogNXB4IHNvbGlkIHRyYW5zcGFyZW50O1xuICAgIGJvcmRlci1ib3R0b206IDVweCBzb2xpZCAke2dldFN0eWxlKCdjdGFCYWNrZ3JvdW5kMScpfTtcbiAgfVxuYDtcblxubGV0IF9jbGllbnRYID0gLTEwMDtcbmxldCBfY2xpZW50WSA9IC0xMDA7XG5jb25zdCBDdXJzb3IgPSAoKSA9PiB7XG4gIGNvbnN0IGN1cnNvckVsID0gdXNlUmVmKG51bGwpO1xuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGlmIChpc1RvdWNoRGV2aWNlKCkpIHJldHVybiAoKSA9PiB7fTtcbiAgICBjb25zdCBwcm9jZXNzTW91c2VUYXJnZXQgPSAodGFyZ2V0KSA9PiB7XG4gICAgICBjb25zdCB7IGlzRXh0ZXJuYWxMaW5rLCBpc0FjdGl2ZSB9ID0gZ2V0RWxlbWVudE1ldGFkYXRhKHRhcmdldCk7XG4gICAgICBjdXJzb3JFbC5jdXJyZW50LmNsYXNzTGlzdC5yZW1vdmUoJ29mZlNjcmVlbicpO1xuICAgICAgY3Vyc29yRWwuY3VycmVudC5jbGFzc0xpc3QudG9nZ2xlKCdvdmVyTGluaycsIGlzRXh0ZXJuYWxMaW5rKTtcbiAgICAgIGN1cnNvckVsLmN1cnJlbnQuY2xhc3NMaXN0LnRvZ2dsZSgnb3ZlckFjdGl2ZUVsJywgaXNBY3RpdmUpO1xuICAgIH07XG4gICAgY29uc3Qgb25Nb3VzZU1vdmUgPSAoeyBjbGllbnRYLCBjbGllbnRZLCB0YXJnZXQgfSkgPT4ge1xuICAgICAgX2NsaWVudFggPSBjbGllbnRYO1xuICAgICAgX2NsaWVudFkgPSBjbGllbnRZO1xuICAgICAgcHJvY2Vzc01vdXNlVGFyZ2V0KHRhcmdldCk7XG4gICAgfTtcbiAgICBjb25zdCBvbk1vdXNlTGVhdmUgPSAoKSA9PiB7XG4gICAgICBjdXJzb3JFbC5jdXJyZW50LmNsYXNzTGlzdC5hZGQoJ29mZlNjcmVlbicpO1xuICAgIH07XG4gICAgY29uc3Qgb25Nb3VzZURvd24gPSAoKSA9PiB7XG4gICAgICBjdXJzb3JFbC5jdXJyZW50LmNsYXNzTGlzdC5hZGQoJ3ByZXNzZWQnKTtcbiAgICB9O1xuICAgIGNvbnN0IG9uTW91c2VVcCA9ICh7IGNsaWVudFgsIGNsaWVudFkgfSkgPT4ge1xuICAgICAgY3Vyc29yRWwuY3VycmVudC5jbGFzc0xpc3QucmVtb3ZlKCdwcmVzc2VkJyk7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcHJvY2Vzc01vdXNlVGFyZ2V0KFxuICAgICAgICAgIGRvY3VtZW50LmVsZW1lbnRGcm9tUG9pbnQoY2xpZW50WCwgY2xpZW50WSksXG4gICAgICAgICk7XG4gICAgICB9LCA1KTtcbiAgICB9O1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgb25Nb3VzZU1vdmUpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBvbk1vdXNlTGVhdmUpO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZG93bicsIG9uTW91c2VEb3duKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZXVwJywgb25Nb3VzZVVwKTtcblxuICAgIGNvbnN0IHN0eWxlID0gZ2V0KGN1cnNvckVsLCAnY3VycmVudC5zdHlsZScsIHt9KTtcblxuICAgIGNvbnN0IHJlbmRlckN1cnNvclN0eWxlcyA9ICgpID0+IHtcbiAgICAgIHN0eWxlLnRyYW5zZm9ybSA9IGB0cmFuc2xhdGUoJHtfY2xpZW50WCAtIFJBRElVU31weCwgJHtcbiAgICAgICAgX2NsaWVudFkgLSBSQURJVVNcbiAgICAgIH1weClgO1xuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlckN1cnNvclN0eWxlcyk7XG4gICAgfTtcblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXJDdXJzb3JTdHlsZXMpO1xuXG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIG9uTW91c2VNb3ZlKTtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBvbk1vdXNlTGVhdmUpO1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgb25Nb3VzZURvd24pO1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIG9uTW91c2VVcCk7XG4gICAgfTtcbiAgfSwgW10pO1xuICBpZiAoaXNUb3VjaERldmljZSgpKSByZXR1cm4gbnVsbDtcblxuICByZXR1cm4gKFxuICAgIDxDdXJzb3JTaGVsbCByZWY9e2N1cnNvckVsfT5cbiAgICAgIDxDdXJzb3JTeW1ib2wgLz5cbiAgICA8L0N1cnNvclNoZWxsPlxuICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgQ3Vyc29yO1xuIl19 */"));

let _clientX = -100;

let _clientY = -100;

const Cursor = () => {
  const cursorEl = Object(react__WEBPACK_IMPORTED_MODULE_1__["useRef"])(null);
  Object(react__WEBPACK_IMPORTED_MODULE_1__["useEffect"])(() => {
    if (is_touch_device__WEBPACK_IMPORTED_MODULE_4___default()()) return () => {};

    const processMouseTarget = target => {
      const {
        isExternalLink,
        isActive
      } = getElementMetadata(target);
      cursorEl.current.classList.remove('offScreen');
      cursorEl.current.classList.toggle('overLink', isExternalLink);
      cursorEl.current.classList.toggle('overActiveEl', isActive);
    };

    const onMouseMove = ({
      clientX,
      clientY,
      target
    }) => {
      _clientX = clientX;
      _clientY = clientY;
      processMouseTarget(target);
    };

    const onMouseLeave = () => {
      cursorEl.current.classList.add('offScreen');
    };

    const onMouseDown = () => {
      cursorEl.current.classList.add('pressed');
    };

    const onMouseUp = ({
      clientX,
      clientY
    }) => {
      cursorEl.current.classList.remove('pressed');
      setTimeout(() => {
        processMouseTarget(document.elementFromPoint(clientX, clientY));
      }, 5);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    const style = lodash_get__WEBPACK_IMPORTED_MODULE_2___default()(cursorEl, 'current.style', {});

    const renderCursorStyles = () => {
      style.transform = `translate(${_clientX - RADIUS}px, ${_clientY - RADIUS}px)`;
      requestAnimationFrame(renderCursorStyles);
    };

    requestAnimationFrame(renderCursorStyles);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);
  if (is_touch_device__WEBPACK_IMPORTED_MODULE_4___default()()) return null;
  return Object(_emotion_core__WEBPACK_IMPORTED_MODULE_5__["jsx"])(CursorShell, {
    ref: cursorEl,
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 163,
      columnNumber: 5
    }
  }, Object(_emotion_core__WEBPACK_IMPORTED_MODULE_5__["jsx"])(CursorSymbol, {
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 164,
      columnNumber: 7
    }
  }));
};

/* harmony default export */ __webpack_exports__["default"] = (Cursor);

/***/ }),

/***/ "./components/Cursor/index.js":
/*!************************************!*\
  !*** ./components/Cursor/index.js ***!
  \************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Cursor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Cursor */ "./components/Cursor/Cursor.jsx");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _Cursor__WEBPACK_IMPORTED_MODULE_0__["default"]; });



/***/ }),

/***/ "./constants/devices.js":
/*!******************************!*\
  !*** ./constants/devices.js ***!
  \******************************/
/*! exports provided: MOBILE, TABLET, DESKTOP */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MOBILE", function() { return MOBILE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TABLET", function() { return TABLET; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DESKTOP", function() { return DESKTOP; });
const MOBILE = 'mobile';
const TABLET = 'tablet';
const DESKTOP = 'desktop';

/***/ }),

/***/ "./constants/map.js":
/*!**************************!*\
  !*** ./constants/map.js ***!
  \**************************/
/*! exports provided: BOUNDS_PADDING, BOUNDS_PADDING_MOBILE */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BOUNDS_PADDING", function() { return BOUNDS_PADDING; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BOUNDS_PADDING_MOBILE", function() { return BOUNDS_PADDING_MOBILE; });
const BOUNDS_PADDING = {
  top: 200,
  left: 100,
  right: 130,
  bottom: 100
};
const BOUNDS_PADDING_MOBILE = {
  top: 200,
  left: 60,
  right: 130,
  bottom: 260
};

/***/ }),

/***/ "./constants/source.js":
/*!*****************************!*\
  !*** ./constants/source.js ***!
  \*****************************/
/*! exports provided: WORK_SOURCE, WORK_PATH_SOURCE, WORK_LABEL_SOURCE */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WORK_SOURCE", function() { return WORK_SOURCE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WORK_PATH_SOURCE", function() { return WORK_PATH_SOURCE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WORK_LABEL_SOURCE", function() { return WORK_LABEL_SOURCE; });
const WORK_SOURCE = 'work-source';
const WORK_PATH_SOURCE = 'work-path-source';
const WORK_LABEL_SOURCE = 'work-label-source';

/***/ }),

/***/ "./fonts/fonts.css":
/*!*************************!*\
  !*** ./fonts/fonts.css ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {



/***/ }),

/***/ "./hooks/AppHooks.js":
/*!***************************!*\
  !*** ./hooks/AppHooks.js ***!
  \***************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _useWatchScreenSize__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./useWatchScreenSize */ "./hooks/useWatchScreenSize.js");


const AppHooks = () => {
  Object(_useWatchScreenSize__WEBPACK_IMPORTED_MODULE_0__["default"])();
  return null;
};

/* harmony default export */ __webpack_exports__["default"] = (AppHooks);

/***/ }),

/***/ "./hooks/useActions.js":
/*!*****************************!*\
  !*** ./hooks/useActions.js ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return useActions; });
/* harmony import */ var redux__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! redux */ "redux");
/* harmony import */ var redux__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(redux__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react-redux */ "react-redux");
/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react_redux__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_2__);



function useActions(actions, deps) {
  const dispatch = Object(react_redux__WEBPACK_IMPORTED_MODULE_1__["useDispatch"])();
  return Object(react__WEBPACK_IMPORTED_MODULE_2__["useMemo"])(() => {
    if (Array.isArray(actions)) {
      return actions.map(a => Object(redux__WEBPACK_IMPORTED_MODULE_0__["bindActionCreators"])(a, dispatch));
    }

    return Object(redux__WEBPACK_IMPORTED_MODULE_0__["bindActionCreators"])(actions, dispatch);
  }, deps ? [dispatch, ...deps] : [dispatch]);
}

/***/ }),

/***/ "./hooks/useWatchScreenSize.js":
/*!*************************************!*\
  !*** ./hooks/useWatchScreenSize.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return useWatchScreenSize; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var modules_app__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! modules/app */ "./modules/app/index.js");
/* harmony import */ var _useActions__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./useActions */ "./hooks/useActions.js");



function useWatchScreenSize() {
  const setScreenSize = Object(_useActions__WEBPACK_IMPORTED_MODULE_2__["default"])(modules_app__WEBPACK_IMPORTED_MODULE_1__["setScreenSize"]);
  return Object(react__WEBPACK_IMPORTED_MODULE_0__["useEffect"])(() => {
    setScreenSize(window.innerWidth, window.innerHeight);
    const mouseListener = window.addEventListener('resize', e => setScreenSize(e.target.innerWidth, e.target.innerHeight));
    return () => {
      window.removeEventListener('resize', mouseListener);
    };
  }, []);
}

/***/ }),

/***/ "./mapbox-gl-ssr.js":
/*!**************************!*\
  !*** ./mapbox-gl-ssr.js ***!
  \**************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
let __ssr_safe__mapboxgl = {};

if (false) {}

/* harmony default export */ __webpack_exports__["default"] = (__ssr_safe__mapboxgl);

/***/ }),

/***/ "./modules/app/actions.js":
/*!********************************!*\
  !*** ./modules/app/actions.js ***!
  \********************************/
/*! exports provided: SET_SCREEN_SIZE, SET_CURSOR, setCursor, setScreenSize */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SET_SCREEN_SIZE", function() { return SET_SCREEN_SIZE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SET_CURSOR", function() { return SET_CURSOR; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setCursor", function() { return setCursor; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setScreenSize", function() { return setScreenSize; });
const base = 'app';
const SET_SCREEN_SIZE = `${base}-setScreenSize`;
const SET_CURSOR = `${base}-setCursor`;
const setCursor = payload => ({
  type: SET_CURSOR,
  payload
});
const setScreenSize = (x, y) => ({
  type: SET_SCREEN_SIZE,
  payload: {
    x,
    y
  }
});

/***/ }),

/***/ "./modules/app/index.js":
/*!******************************!*\
  !*** ./modules/app/index.js ***!
  \******************************/
/*! exports provided: SET_SCREEN_SIZE, SET_CURSOR, setCursor, setScreenSize, appReducer, selectState, selectScreenWidth, selectDevice, selectIsMobile */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _actions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./actions */ "./modules/app/actions.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SET_SCREEN_SIZE", function() { return _actions__WEBPACK_IMPORTED_MODULE_0__["SET_SCREEN_SIZE"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SET_CURSOR", function() { return _actions__WEBPACK_IMPORTED_MODULE_0__["SET_CURSOR"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "setCursor", function() { return _actions__WEBPACK_IMPORTED_MODULE_0__["setCursor"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "setScreenSize", function() { return _actions__WEBPACK_IMPORTED_MODULE_0__["setScreenSize"]; });

/* harmony import */ var _reducer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./reducer */ "./modules/app/reducer.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "appReducer", function() { return _reducer__WEBPACK_IMPORTED_MODULE_1__["appReducer"]; });

/* harmony import */ var _selectors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./selectors */ "./modules/app/selectors.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectState", function() { return _selectors__WEBPACK_IMPORTED_MODULE_2__["selectState"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectScreenWidth", function() { return _selectors__WEBPACK_IMPORTED_MODULE_2__["selectScreenWidth"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectDevice", function() { return _selectors__WEBPACK_IMPORTED_MODULE_2__["selectDevice"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectIsMobile", function() { return _selectors__WEBPACK_IMPORTED_MODULE_2__["selectIsMobile"]; });





/***/ }),

/***/ "./modules/app/reducer.js":
/*!********************************!*\
  !*** ./modules/app/reducer.js ***!
  \********************************/
/*! exports provided: appReducer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "appReducer", function() { return appReducer; });
/* harmony import */ var _actions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./actions */ "./modules/app/actions.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


const initialState = {
  screenSize: null
};
function appReducer(state = initialState, action) {
  const {
    type,
    payload
  } = action;

  switch (type) {
    case _actions__WEBPACK_IMPORTED_MODULE_0__["SET_SCREEN_SIZE"]:
      return _objectSpread({}, state, {
        screenSize: payload
      });

    default:
      return state;
  }
}

/***/ }),

/***/ "./modules/app/selectors.js":
/*!**********************************!*\
  !*** ./modules/app/selectors.js ***!
  \**********************************/
/*! exports provided: selectState, selectScreenWidth, selectDevice, selectIsMobile */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectState", function() { return selectState; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectScreenWidth", function() { return selectScreenWidth; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectDevice", function() { return selectDevice; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectIsMobile", function() { return selectIsMobile; });
/* harmony import */ var lodash_get__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash.get */ "lodash.get");
/* harmony import */ var lodash_get__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash_get__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var reselect__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! reselect */ "reselect");
/* harmony import */ var reselect__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(reselect__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var styles_breakpoints__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! styles/breakpoints */ "./styles/breakpoints.js");
/* harmony import */ var constants_devices__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! constants/devices */ "./constants/devices.js");




const selectState = state => state.app;
const selectScreenWidth = Object(reselect__WEBPACK_IMPORTED_MODULE_1__["createSelector"])(selectState, app => lodash_get__WEBPACK_IMPORTED_MODULE_0___default()(app, 'screenSize.x'));
const selectDevice = Object(reselect__WEBPACK_IMPORTED_MODULE_1__["createSelector"])(selectScreenWidth, width => {
  if (Object(styles_breakpoints__WEBPACK_IMPORTED_MODULE_2__["isMobile"])(width)) return constants_devices__WEBPACK_IMPORTED_MODULE_3__["MOBILE"];
  if (Object(styles_breakpoints__WEBPACK_IMPORTED_MODULE_2__["isTablet"])(width)) return constants_devices__WEBPACK_IMPORTED_MODULE_3__["TABLET"];
  return constants_devices__WEBPACK_IMPORTED_MODULE_3__["DESKTOP"];
});
const selectIsMobile = Object(reselect__WEBPACK_IMPORTED_MODULE_1__["createSelector"])(selectDevice, device => device === constants_devices__WEBPACK_IMPORTED_MODULE_3__["MOBILE"]);

/***/ }),

/***/ "./modules/appReducer.js":
/*!*******************************!*\
  !*** ./modules/appReducer.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var redux__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! redux */ "redux");
/* harmony import */ var redux__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(redux__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _app__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./app */ "./modules/app/index.js");
/* harmony import */ var _geojson__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./geojson */ "./modules/geojson/index.js");
/* harmony import */ var _map__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./map */ "./modules/map/index.js");




/* harmony default export */ __webpack_exports__["default"] = (Object(redux__WEBPACK_IMPORTED_MODULE_0__["combineReducers"])({
  app: _app__WEBPACK_IMPORTED_MODULE_1__["appReducer"],
  geojson: _geojson__WEBPACK_IMPORTED_MODULE_2__["geojsonReducer"],
  map: _map__WEBPACK_IMPORTED_MODULE_3__["mapReducer"]
}));

/***/ }),

/***/ "./modules/geojson/features.js":
/*!*************************************!*\
  !*** ./modules/geojson/features.js ***!
  \*************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ([{
  company: 'New York State Parks',
  role: 'Geospatial Technician I',
  description: 'I produced over 100 trailmaps and master planning maps for 20 New York state parks using ArcGIS 10.3, Python scripting, and Adobe Illustrator.',
  date: {
    start: 1420348252000,
    end: 1467609052000
  },
  coordinates: [-73.7508132, 42.652377],
  id: 1,
  outlier: true
}, {
  company: 'City of Tigard',
  role: 'Geospatial Technician I',
  description: 'I automated city GIS workflows using Python. I also created data products including complex transportation layers and published web applications using ArcGIS Online.',
  date: {
    start: 1470287452000,
    end: 1486185052000
  },
  coordinates: [-122.7689952, 45.424939],
  id: 2
}, {
  company: 'Nike',
  role: 'Software Engineer',
  description: "I worked for Nike Digital's Content Management Service, helping to streamline the creation of content for Nike.com.",
  date: {
    start: 1503378652000,
    end: 1545455452000
  },
  coordinates: [-122.8303353, 45.5077801],
  id: 3
}, {
  company: 'Ubiquiti',
  role: 'Software Engineer',
  description: 'I sat in between design and project managers to create consumer facing tools and user interfaces in use by many thousands of customers.',
  date: {
    start: 1545455452000,
    end: 1579480362000
  },
  coordinates: [-122.6854872, 45.5121414],
  id: 4
}, {
  company: 'Freelancing',
  role: 'Software Engineer & Designer',
  description: 'I am currently working on projects for variety of clients including Ramboll Shair and Human Recreational Services.',
  coordinates: [-122.6997509, 45.5784006],
  date: {
    start: 1579480362000,
    end: Date.now()
  },
  id: 5
}]);

/***/ }),

/***/ "./modules/geojson/index.js":
/*!**********************************!*\
  !*** ./modules/geojson/index.js ***!
  \**********************************/
/*! exports provided: geojsonReducer, selectState, selectData, selectFeatureList, selectLookup, selectGeoJson, selectGeoJsonWithoutOutliers, selectAreFeaturesEmpty, selectIsInitialized, selectChronologicalFeatures, selectChronologicalFeatureIds, selectWorkPathGeoJson, selectGeoJsonBounds, GET_EVENTS */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _reducer__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./reducer */ "./modules/geojson/reducer.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "geojsonReducer", function() { return _reducer__WEBPACK_IMPORTED_MODULE_0__["geojsonReducer"]; });

/* harmony import */ var _selectors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./selectors */ "./modules/geojson/selectors.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectState", function() { return _selectors__WEBPACK_IMPORTED_MODULE_1__["selectState"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectData", function() { return _selectors__WEBPACK_IMPORTED_MODULE_1__["selectData"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectFeatureList", function() { return _selectors__WEBPACK_IMPORTED_MODULE_1__["selectFeatureList"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectLookup", function() { return _selectors__WEBPACK_IMPORTED_MODULE_1__["selectLookup"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectGeoJson", function() { return _selectors__WEBPACK_IMPORTED_MODULE_1__["selectGeoJson"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectGeoJsonWithoutOutliers", function() { return _selectors__WEBPACK_IMPORTED_MODULE_1__["selectGeoJsonWithoutOutliers"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectAreFeaturesEmpty", function() { return _selectors__WEBPACK_IMPORTED_MODULE_1__["selectAreFeaturesEmpty"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectIsInitialized", function() { return _selectors__WEBPACK_IMPORTED_MODULE_1__["selectIsInitialized"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectChronologicalFeatures", function() { return _selectors__WEBPACK_IMPORTED_MODULE_1__["selectChronologicalFeatures"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectChronologicalFeatureIds", function() { return _selectors__WEBPACK_IMPORTED_MODULE_1__["selectChronologicalFeatureIds"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectWorkPathGeoJson", function() { return _selectors__WEBPACK_IMPORTED_MODULE_1__["selectWorkPathGeoJson"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectGeoJsonBounds", function() { return _selectors__WEBPACK_IMPORTED_MODULE_1__["selectGeoJsonBounds"]; });

/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./types */ "./modules/geojson/types.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "GET_EVENTS", function() { return _types__WEBPACK_IMPORTED_MODULE_2__["GET_EVENTS"]; });





/***/ }),

/***/ "./modules/geojson/reducer.js":
/*!************************************!*\
  !*** ./modules/geojson/reducer.js ***!
  \************************************/
/*! exports provided: geojsonReducer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "geojsonReducer", function() { return geojsonReducer; });
/* harmony import */ var _features__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./features */ "./modules/geojson/features.js");

const initialState = {
  data: _features__WEBPACK_IMPORTED_MODULE_0__["default"]
};
const geojsonReducer = (state = initialState, action) => {
  const {
    type
  } = action;

  switch (type) {
    default:
      return state;
  }
};

/***/ }),

/***/ "./modules/geojson/selectors.js":
/*!**************************************!*\
  !*** ./modules/geojson/selectors.js ***!
  \**************************************/
/*! exports provided: selectState, selectData, selectFeatureList, selectLookup, selectGeoJson, selectGeoJsonWithoutOutliers, selectAreFeaturesEmpty, selectIsInitialized, selectChronologicalFeatures, selectChronologicalFeatureIds, selectWorkPathGeoJson, selectGeoJsonBounds */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectState", function() { return selectState; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectData", function() { return selectData; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectFeatureList", function() { return selectFeatureList; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectLookup", function() { return selectLookup; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectGeoJson", function() { return selectGeoJson; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectGeoJsonWithoutOutliers", function() { return selectGeoJsonWithoutOutliers; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectAreFeaturesEmpty", function() { return selectAreFeaturesEmpty; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectIsInitialized", function() { return selectIsInitialized; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectChronologicalFeatures", function() { return selectChronologicalFeatures; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectChronologicalFeatureIds", function() { return selectChronologicalFeatureIds; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectWorkPathGeoJson", function() { return selectWorkPathGeoJson; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectGeoJsonBounds", function() { return selectGeoJsonBounds; });
/* harmony import */ var _turf_bbox__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @turf/bbox */ "@turf/bbox");
/* harmony import */ var _turf_bbox__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_turf_bbox__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _turf_helpers__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @turf/helpers */ "@turf/helpers");
/* harmony import */ var _turf_helpers__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_turf_helpers__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lodash_get__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lodash.get */ "lodash.get");
/* harmony import */ var lodash_get__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash_get__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var reselect__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! reselect */ "reselect");
/* harmony import */ var reselect__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(reselect__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var utils_geojson__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! utils/geojson */ "./utils/geojson.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }






const selectState = state => state.geojson;
const selectData = Object(reselect__WEBPACK_IMPORTED_MODULE_3__["createSelector"])(selectState, state => lodash_get__WEBPACK_IMPORTED_MODULE_2___default()(state, 'data', []));
const selectFeatureList = Object(reselect__WEBPACK_IMPORTED_MODULE_3__["createSelector"])(selectData, data => Object.values(data));
const selectLookup = Object(reselect__WEBPACK_IMPORTED_MODULE_3__["createSelector"])(selectData, data => data.reduce((acc, ft) => _objectSpread({}, acc, {
  [ft.id]: ft
}), {}));
const selectGeoJson = Object(reselect__WEBPACK_IMPORTED_MODULE_3__["createSelector"])(selectFeatureList, features => Object(utils_geojson__WEBPACK_IMPORTED_MODULE_4__["arrayToFeatureCollection"])(features));
const selectGeoJsonWithoutOutliers = Object(reselect__WEBPACK_IMPORTED_MODULE_3__["createSelector"])(selectFeatureList, features => Object(utils_geojson__WEBPACK_IMPORTED_MODULE_4__["arrayToFeatureCollection"])(features.filter(({
  outlier
}) => !outlier)));
const selectAreFeaturesEmpty = Object(reselect__WEBPACK_IMPORTED_MODULE_3__["createSelector"])(selectFeatureList, list => list.length === 0);
const selectIsInitialized = Object(reselect__WEBPACK_IMPORTED_MODULE_3__["createSelector"])(selectState, state => state.updateCount > 0);
const selectChronologicalFeatures = Object(reselect__WEBPACK_IMPORTED_MODULE_3__["createSelector"])(selectFeatureList, features => features.sort((a, b) => a.date.end > b.date.end));
const selectChronologicalFeatureIds = Object(reselect__WEBPACK_IMPORTED_MODULE_3__["createSelector"])(selectChronologicalFeatures, features => features.map(({
  id
}) => id));
const selectWorkPathGeoJson = Object(reselect__WEBPACK_IMPORTED_MODULE_3__["createSelector"])(selectChronologicalFeatures, features => {
  const orderedCoords = features.map(({
    coordinates
  }) => coordinates);
  return Object(_turf_helpers__WEBPACK_IMPORTED_MODULE_1__["lineString"])(orderedCoords);
});
const selectGeoJsonBounds = Object(reselect__WEBPACK_IMPORTED_MODULE_3__["createSelector"])(selectGeoJsonWithoutOutliers, selectAreFeaturesEmpty, (geojson, isEmpty) => {
  if (isEmpty) return null;
  return _turf_bbox__WEBPACK_IMPORTED_MODULE_0___default()(geojson);
});

/***/ }),

/***/ "./modules/geojson/types.js":
/*!**********************************!*\
  !*** ./modules/geojson/types.js ***!
  \**********************************/
/*! exports provided: GET_EVENTS */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GET_EVENTS", function() { return GET_EVENTS; });
const GET_EVENTS = 'geojson/getEvents';

/***/ }),

/***/ "./modules/map/actions.js":
/*!********************************!*\
  !*** ./modules/map/actions.js ***!
  \********************************/
/*! exports provided: setMapLoaded, fitBounds, unhoverFeature, clearSelection, setPopupId, selectFeature, selectNextFeature, selectPrevFeature, hoverFeature, resetMap */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setMapLoaded", function() { return setMapLoaded; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "fitBounds", function() { return fitBounds; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "unhoverFeature", function() { return unhoverFeature; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "clearSelection", function() { return clearSelection; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setPopupId", function() { return setPopupId; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectFeature", function() { return selectFeature; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectNextFeature", function() { return selectNextFeature; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectPrevFeature", function() { return selectPrevFeature; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "hoverFeature", function() { return hoverFeature; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "resetMap", function() { return resetMap; });
/* harmony import */ var lodash_get__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash.get */ "lodash.get");
/* harmony import */ var lodash_get__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash_get__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var uuid_v4__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! uuid/v4 */ "uuid/v4");
/* harmony import */ var uuid_v4__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(uuid_v4__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var mapbox_gl_ssr__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! mapbox-gl-ssr */ "./mapbox-gl-ssr.js");
/* harmony import */ var styles_theme_sizes__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! styles/theme/sizes */ "./styles/theme/sizes.js");
/* harmony import */ var constants_source__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! constants/source */ "./constants/source.js");
/* harmony import */ var constants_map__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! constants/map */ "./constants/map.js");
/* harmony import */ var _app_selectors__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../app/selectors */ "./modules/app/selectors.js");
/* harmony import */ var _geojson_selectors__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../geojson/selectors */ "./modules/geojson/selectors.js");
/* harmony import */ var _selectors__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./selectors */ "./modules/map/selectors.js");
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./types */ "./modules/map/types.js");










const setMapLoaded = isLoaded => ({
  type: _types__WEBPACK_IMPORTED_MODULE_9__["SET_MAP_LOADED"],
  payload: isLoaded
});
const fitBounds = () => (_, getState, getMap) => {
  const state = getState();
  const map = getMap();
  const bounds = Object(_geojson_selectors__WEBPACK_IMPORTED_MODULE_7__["selectGeoJsonBounds"])(state);
  const isMobile = Object(_app_selectors__WEBPACK_IMPORTED_MODULE_6__["selectIsMobile"])(state);
  const isFeatureSelected = Object(_selectors__WEBPACK_IMPORTED_MODULE_8__["selectIsFeatureSelected"])(state);

  if (bounds) {
    map.fitBounds(bounds, {
      padding: isMobile && isFeatureSelected ? constants_map__WEBPACK_IMPORTED_MODULE_5__["BOUNDS_PADDING_MOBILE"] : constants_map__WEBPACK_IMPORTED_MODULE_5__["BOUNDS_PADDING"]
    });
  }
};
const unhoverFeature = () => (dispatch, getState, getMap) => {
  if (!Object(_selectors__WEBPACK_IMPORTED_MODULE_8__["selectMapLoaded"])(getState())) return null;
  const map = getMap();
  const hoveredId = Object(_selectors__WEBPACK_IMPORTED_MODULE_8__["selectHoveredFeatureId"])(getState());
  if (hoveredId) map.setFeatureState({
    source: constants_source__WEBPACK_IMPORTED_MODULE_4__["WORK_SOURCE"],
    id: hoveredId
  }, {
    hover: false
  });
  map.getCanvas().style.cursor = 'grab';
  return dispatch({
    type: _types__WEBPACK_IMPORTED_MODULE_9__["UNHOVER_FEATURE"]
  });
};
let popup;

const removePopup = () => {
  if (popup && popup.isOpen()) {
    popup.remove();
  }
};

const clearSelection = () => (dispatch, getState, getMap) => {
  if (!Object(_selectors__WEBPACK_IMPORTED_MODULE_8__["selectMapLoaded"])(getState())) return null;
  const map = getMap();
  const selectedId = Object(_selectors__WEBPACK_IMPORTED_MODULE_8__["selectSelectedFeatureId"])(getState());
  removePopup();
  if (selectedId) map.setFeatureState({
    source: constants_source__WEBPACK_IMPORTED_MODULE_4__["WORK_SOURCE"],
    id: selectedId
  }, {
    selected: false
  });
  return dispatch({
    type: _types__WEBPACK_IMPORTED_MODULE_9__["CLEAR_SELECTION"]
  });
};

const getId = (map, e) => {
  if (typeof e === 'number' || typeof e === 'string') return e;

  try {
    const features = map.queryRenderedFeatures(e.point);
    return lodash_get__WEBPACK_IMPORTED_MODULE_0___default()(features, '[0].properties.id', null);
  } catch (err) {
    console.log(err);
    return e;
  }
};

const setPopupId = id => ({
  type: _types__WEBPACK_IMPORTED_MODULE_9__["SET_POPUP_ID"],
  payload: id
});
const selectFeature = e => (dispatch, getState, getMap) => {
  const state = getState();
  if (!Object(_selectors__WEBPACK_IMPORTED_MODULE_8__["selectMapLoaded"])(state)) return null;
  const map = getMap();
  const isMobile = Object(_app_selectors__WEBPACK_IMPORTED_MODULE_6__["selectIsMobile"])(state);
  const prevPopupId = Object(_selectors__WEBPACK_IMPORTED_MODULE_8__["selectPopupId"])(state);
  const prevSelectedId = Object(_selectors__WEBPACK_IMPORTED_MODULE_8__["selectSelectedFeatureId"])(state);
  const id = getId(map, e);
  if (!id) return null;
  const feature = Object(_geojson_selectors__WEBPACK_IMPORTED_MODULE_7__["selectLookup"])(state)[id];
  map.flyTo({
    center: feature.coordinates,
    offset: [0, isMobile ? -60 : 180],
    zoom: 12
  });

  if (id !== prevSelectedId) {
    if (prevSelectedId) {
      map.setFeatureState({
        source: constants_source__WEBPACK_IMPORTED_MODULE_4__["WORK_SOURCE"],
        id: prevSelectedId
      }, {
        selected: false
      });
    }

    map.setFeatureState({
      source: constants_source__WEBPACK_IMPORTED_MODULE_4__["WORK_SOURCE"],
      id
    }, {
      selected: true
    });
    dispatch({
      type: _types__WEBPACK_IMPORTED_MODULE_9__["SELECT_FEATURE"],
      payload: id
    });
  }

  if ((id !== prevSelectedId || !prevPopupId) && !isMobile) {
    removePopup();
    const popupId = uuid_v4__WEBPACK_IMPORTED_MODULE_1___default()();
    popup = new mapbox_gl_ssr__WEBPACK_IMPORTED_MODULE_2__["default"].Popup({
      closeButton: false,
      offset: 30,
      maxWidth: styles_theme_sizes__WEBPACK_IMPORTED_MODULE_3__["default"].popupWidth
    }).once('close', () => dispatch(setPopupId(null))).setLngLat(feature.coordinates).setHTML(`<div id="${popupId}"></div>`).addTo(map);
    dispatch(setPopupId(popupId));
  }

  return null;
};
const selectNextFeature = () => (dispatch, getState) => {
  const state = getState();
  const nextFeatureId = Object(_selectors__WEBPACK_IMPORTED_MODULE_8__["selectNextFeatureId"])(state);
  return dispatch(selectFeature(nextFeatureId));
};
const selectPrevFeature = () => (dispatch, getState) => {
  const state = getState();
  const prevFeatureId = Object(_selectors__WEBPACK_IMPORTED_MODULE_8__["selectPrevFeatureId"])(state);
  return dispatch(selectFeature(prevFeatureId));
};
const hoverFeature = e => (dispatch, getState, getMap) => {
  const state = getState();
  if (!Object(_selectors__WEBPACK_IMPORTED_MODULE_8__["selectMapLoaded"])(state)) return null;
  const map = getMap();
  const hoveredId = Object(_selectors__WEBPACK_IMPORTED_MODULE_8__["selectHoveredFeatureId"])(state);
  const id = getId(map, e);
  if (!id) return null;
  map.getCanvas().style.cursor = 'pointer';
  if (hoveredId !== id) dispatch(unhoverFeature());
  if (hoveredId === id) return null;
  map.setFeatureState({
    source: constants_source__WEBPACK_IMPORTED_MODULE_4__["WORK_SOURCE"],
    id
  }, {
    hover: true
  });
  return dispatch({
    type: _types__WEBPACK_IMPORTED_MODULE_9__["HOVER_FEATURE"],
    payload: id
  });
};
const resetMap = () => ({
  type: _types__WEBPACK_IMPORTED_MODULE_9__["RESET_MAP"]
});

/***/ }),

/***/ "./modules/map/config.js":
/*!*******************************!*\
  !*** ./modules/map/config.js ***!
  \*******************************/
/*! exports provided: config */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "config", function() { return config; });
/* harmony import */ var constants_map__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! constants/map */ "./constants/map.js");

const config = {
  accessToken: 'pk.eyJ1IjoiY2hpZWZrbGVlZiIsImEiOiJjaWhkbnE5cGEwYnltdnFrbHBwaHd0NXhuIn0.SXxGsE9D61dU7gWmWEV71Q',
  maxZoom: 18,
  bearing: 0,
  pitch: 120,
  style: 'mapbox://styles/chiefkleef/ck8yx5uws03fh1ir30w1qkprd',
  attributionControl: false,
  fitBoundsOptions: {
    padding: constants_map__WEBPACK_IMPORTED_MODULE_0__["BOUNDS_PADDING"]
  }
};

/***/ }),

/***/ "./modules/map/index.js":
/*!******************************!*\
  !*** ./modules/map/index.js ***!
  \******************************/
/*! exports provided: setMapLoaded, fitBounds, unhoverFeature, clearSelection, setPopupId, selectFeature, selectNextFeature, selectPrevFeature, hoverFeature, resetMap, mapReducer, selectMapState, selectMapLoaded, selectMapConfig, selectMapLayers, selectHoveredFeatureId, selectSelectedFeatureId, selectIsFeatureSelected, selectSelectedFeature, selectIsFirstFeatureSelected, selectIsLastFeatureSelected, selectPrevFeatureId, selectNextFeatureId, selectPopupId, CLEAR_SELECTION, HOVER_FEATURE, SELECT_FEATURE, SET_POPUP_ID, UNHOVER_FEATURE, SET_MAP_LOADED, RESET_MAP */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _actions__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./actions */ "./modules/map/actions.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "setMapLoaded", function() { return _actions__WEBPACK_IMPORTED_MODULE_0__["setMapLoaded"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "fitBounds", function() { return _actions__WEBPACK_IMPORTED_MODULE_0__["fitBounds"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "unhoverFeature", function() { return _actions__WEBPACK_IMPORTED_MODULE_0__["unhoverFeature"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "clearSelection", function() { return _actions__WEBPACK_IMPORTED_MODULE_0__["clearSelection"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "setPopupId", function() { return _actions__WEBPACK_IMPORTED_MODULE_0__["setPopupId"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectFeature", function() { return _actions__WEBPACK_IMPORTED_MODULE_0__["selectFeature"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectNextFeature", function() { return _actions__WEBPACK_IMPORTED_MODULE_0__["selectNextFeature"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectPrevFeature", function() { return _actions__WEBPACK_IMPORTED_MODULE_0__["selectPrevFeature"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "hoverFeature", function() { return _actions__WEBPACK_IMPORTED_MODULE_0__["hoverFeature"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "resetMap", function() { return _actions__WEBPACK_IMPORTED_MODULE_0__["resetMap"]; });

/* harmony import */ var _reducer__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./reducer */ "./modules/map/reducer.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "mapReducer", function() { return _reducer__WEBPACK_IMPORTED_MODULE_1__["mapReducer"]; });

/* harmony import */ var _selectors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./selectors */ "./modules/map/selectors.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectMapState", function() { return _selectors__WEBPACK_IMPORTED_MODULE_2__["selectMapState"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectMapLoaded", function() { return _selectors__WEBPACK_IMPORTED_MODULE_2__["selectMapLoaded"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectMapConfig", function() { return _selectors__WEBPACK_IMPORTED_MODULE_2__["selectMapConfig"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectMapLayers", function() { return _selectors__WEBPACK_IMPORTED_MODULE_2__["selectMapLayers"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectHoveredFeatureId", function() { return _selectors__WEBPACK_IMPORTED_MODULE_2__["selectHoveredFeatureId"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectSelectedFeatureId", function() { return _selectors__WEBPACK_IMPORTED_MODULE_2__["selectSelectedFeatureId"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectIsFeatureSelected", function() { return _selectors__WEBPACK_IMPORTED_MODULE_2__["selectIsFeatureSelected"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectSelectedFeature", function() { return _selectors__WEBPACK_IMPORTED_MODULE_2__["selectSelectedFeature"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectIsFirstFeatureSelected", function() { return _selectors__WEBPACK_IMPORTED_MODULE_2__["selectIsFirstFeatureSelected"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectIsLastFeatureSelected", function() { return _selectors__WEBPACK_IMPORTED_MODULE_2__["selectIsLastFeatureSelected"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectPrevFeatureId", function() { return _selectors__WEBPACK_IMPORTED_MODULE_2__["selectPrevFeatureId"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectNextFeatureId", function() { return _selectors__WEBPACK_IMPORTED_MODULE_2__["selectNextFeatureId"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "selectPopupId", function() { return _selectors__WEBPACK_IMPORTED_MODULE_2__["selectPopupId"]; });

/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./types */ "./modules/map/types.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CLEAR_SELECTION", function() { return _types__WEBPACK_IMPORTED_MODULE_3__["CLEAR_SELECTION"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "HOVER_FEATURE", function() { return _types__WEBPACK_IMPORTED_MODULE_3__["HOVER_FEATURE"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SELECT_FEATURE", function() { return _types__WEBPACK_IMPORTED_MODULE_3__["SELECT_FEATURE"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SET_POPUP_ID", function() { return _types__WEBPACK_IMPORTED_MODULE_3__["SET_POPUP_ID"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "UNHOVER_FEATURE", function() { return _types__WEBPACK_IMPORTED_MODULE_3__["UNHOVER_FEATURE"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "SET_MAP_LOADED", function() { return _types__WEBPACK_IMPORTED_MODULE_3__["SET_MAP_LOADED"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "RESET_MAP", function() { return _types__WEBPACK_IMPORTED_MODULE_3__["RESET_MAP"]; });






/***/ }),

/***/ "./modules/map/reducer.js":
/*!********************************!*\
  !*** ./modules/map/reducer.js ***!
  \********************************/
/*! exports provided: mapReducer */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mapReducer", function() { return mapReducer; });
/* harmony import */ var _types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./types */ "./modules/map/types.js");
/* harmony import */ var _config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./config */ "./modules/map/config.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }



const initialState = {
  config: _config__WEBPACK_IMPORTED_MODULE_1__["config"],
  selectedFeatureId: null,
  hoveredFeatureId: null,
  mapLoaded: false,
  popupId: null
};
function mapReducer(state = initialState, action) {
  const {
    type,
    payload
  } = action;

  switch (type) {
    case _types__WEBPACK_IMPORTED_MODULE_0__["SELECT_FEATURE"]:
      return _objectSpread({}, state, {
        selectedFeatureId: payload
      });

    case _types__WEBPACK_IMPORTED_MODULE_0__["SET_POPUP_ID"]:
      return _objectSpread({}, state, {
        popupId: payload
      });

    case _types__WEBPACK_IMPORTED_MODULE_0__["CLEAR_SELECTION"]:
      return _objectSpread({}, state, {
        selectedFeatureId: initialState.selectedFeatureId
      });

    case _types__WEBPACK_IMPORTED_MODULE_0__["HOVER_FEATURE"]:
      return _objectSpread({}, state, {
        hoveredFeatureId: payload
      });

    case _types__WEBPACK_IMPORTED_MODULE_0__["UNHOVER_FEATURE"]:
      return _objectSpread({}, state, {
        hoveredFeatureId: initialState.hoveredFeatureId
      });

    case _types__WEBPACK_IMPORTED_MODULE_0__["SET_MAP_LOADED"]:
      return _objectSpread({}, state, {
        mapLoaded: payload
      });

    case _types__WEBPACK_IMPORTED_MODULE_0__["RESET_MAP"]:
      return initialState;

    default:
      return state;
  }
}

/***/ }),

/***/ "./modules/map/selectors.js":
/*!**********************************!*\
  !*** ./modules/map/selectors.js ***!
  \**********************************/
/*! exports provided: selectMapState, selectMapLoaded, selectMapConfig, selectMapLayers, selectHoveredFeatureId, selectSelectedFeatureId, selectIsFeatureSelected, selectSelectedFeature, selectIsFirstFeatureSelected, selectIsLastFeatureSelected, selectPrevFeatureId, selectNextFeatureId, selectPopupId */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectMapState", function() { return selectMapState; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectMapLoaded", function() { return selectMapLoaded; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectMapConfig", function() { return selectMapConfig; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectMapLayers", function() { return selectMapLayers; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectHoveredFeatureId", function() { return selectHoveredFeatureId; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectSelectedFeatureId", function() { return selectSelectedFeatureId; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectIsFeatureSelected", function() { return selectIsFeatureSelected; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectSelectedFeature", function() { return selectSelectedFeature; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectIsFirstFeatureSelected", function() { return selectIsFirstFeatureSelected; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectIsLastFeatureSelected", function() { return selectIsLastFeatureSelected; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectPrevFeatureId", function() { return selectPrevFeatureId; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectNextFeatureId", function() { return selectNextFeatureId; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "selectPopupId", function() { return selectPopupId; });
/* harmony import */ var reselect__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! reselect */ "reselect");
/* harmony import */ var reselect__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(reselect__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var lodash_get__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lodash.get */ "lodash.get");
/* harmony import */ var lodash_get__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(lodash_get__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var constants_source__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! constants/source */ "./constants/source.js");
/* harmony import */ var styles_theme_colors__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! styles/theme/colors */ "./styles/theme/colors.js");
/* harmony import */ var _geojson_selectors__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../geojson/selectors */ "./modules/geojson/selectors.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }






const selectMapState = state => state.map;
const selectMapLoaded = Object(reselect__WEBPACK_IMPORTED_MODULE_0__["createSelector"])(selectMapState, map => lodash_get__WEBPACK_IMPORTED_MODULE_1___default()(map, 'mapLoaded', false));
const selectMapConfig = Object(reselect__WEBPACK_IMPORTED_MODULE_0__["createSelector"])(selectMapState, _geojson_selectors__WEBPACK_IMPORTED_MODULE_4__["selectGeoJsonBounds"], ({
  config
}, bounds) => _objectSpread({}, config, {
  bounds
}));

const makeHoverCase = (hoverValue, defaultValue) => ['case', ['boolean', ['feature-state', 'hover'], false], hoverValue, defaultValue];

const makeSelectedCase = (selectedValue, defaultValue) => ['case', ['boolean', ['feature-state', 'selected'], false], selectedValue, defaultValue];

const selectMapLayers = Object(reselect__WEBPACK_IMPORTED_MODULE_0__["createSelector"])(_geojson_selectors__WEBPACK_IMPORTED_MODULE_4__["selectGeoJson"], _geojson_selectors__WEBPACK_IMPORTED_MODULE_4__["selectWorkPathGeoJson"], (data, lineData) => [{
  id: constants_source__WEBPACK_IMPORTED_MODULE_2__["WORK_PATH_SOURCE"],
  type: 'line',
  source: {
    type: 'geojson',
    data: lineData
  },
  paint: {
    'line-color': styles_theme_colors__WEBPACK_IMPORTED_MODULE_3__["default"].text2,
    'line-opacity': 0.5,
    'line-width': 1
  }
}, {
  id: constants_source__WEBPACK_IMPORTED_MODULE_2__["WORK_SOURCE"],
  type: 'circle',
  source: {
    type: 'geojson',
    data
  },
  paint: {
    'circle-color': styles_theme_colors__WEBPACK_IMPORTED_MODULE_3__["default"].ctaBackground1,
    'circle-radius': makeSelectedCase(8, 6),
    'circle-stroke-width': makeSelectedCase(10, makeHoverCase(8, 5)),
    'circle-stroke-color': styles_theme_colors__WEBPACK_IMPORTED_MODULE_3__["default"].ctaBackground1,
    'circle-stroke-opacity': makeHoverCase(0.3, 0.2)
  }
}, {
  id: constants_source__WEBPACK_IMPORTED_MODULE_2__["WORK_LABEL_SOURCE"],
  type: 'symbol',
  source: {
    type: 'geojson',
    data
  },
  paint: {
    'text-color': styles_theme_colors__WEBPACK_IMPORTED_MODULE_3__["default"].text2
  },
  layout: {
    'text-field': '{company}',
    'text-font': ['Andale Mono Regular'],
    'text-anchor': 'left',
    'text-offset': [1.5, 0.3],
    'text-transform': 'uppercase'
  }
}]);
const selectHoveredFeatureId = Object(reselect__WEBPACK_IMPORTED_MODULE_0__["createSelector"])(selectMapState, map => lodash_get__WEBPACK_IMPORTED_MODULE_1___default()(map, 'hoveredFeatureId'));
const selectSelectedFeatureId = Object(reselect__WEBPACK_IMPORTED_MODULE_0__["createSelector"])(selectMapState, map => lodash_get__WEBPACK_IMPORTED_MODULE_1___default()(map, 'selectedFeatureId'));
const selectIsFeatureSelected = Object(reselect__WEBPACK_IMPORTED_MODULE_0__["createSelector"])(selectSelectedFeatureId, id => !!id);
const selectSelectedFeature = Object(reselect__WEBPACK_IMPORTED_MODULE_0__["createSelector"])(selectSelectedFeatureId, _geojson_selectors__WEBPACK_IMPORTED_MODULE_4__["selectLookup"], (id, lookup) => lodash_get__WEBPACK_IMPORTED_MODULE_1___default()(lookup, id, {}));
const selectIsFirstFeatureSelected = Object(reselect__WEBPACK_IMPORTED_MODULE_0__["createSelector"])(selectSelectedFeatureId, _geojson_selectors__WEBPACK_IMPORTED_MODULE_4__["selectChronologicalFeatureIds"], (id, ids) => ids.indexOf(id) === 0);
const selectIsLastFeatureSelected = Object(reselect__WEBPACK_IMPORTED_MODULE_0__["createSelector"])(selectSelectedFeatureId, _geojson_selectors__WEBPACK_IMPORTED_MODULE_4__["selectChronologicalFeatureIds"], (id, ids) => ids.indexOf(id) === ids.length - 1);
const selectPrevFeatureId = Object(reselect__WEBPACK_IMPORTED_MODULE_0__["createSelector"])(selectSelectedFeatureId, _geojson_selectors__WEBPACK_IMPORTED_MODULE_4__["selectChronologicalFeatureIds"], selectIsFirstFeatureSelected, (id, ids, bail) => {
  if (bail) return id;
  return ids[ids.indexOf(id) - 1];
});
const selectNextFeatureId = Object(reselect__WEBPACK_IMPORTED_MODULE_0__["createSelector"])(selectSelectedFeatureId, _geojson_selectors__WEBPACK_IMPORTED_MODULE_4__["selectChronologicalFeatureIds"], selectIsLastFeatureSelected, (id, ids, bail) => {
  if (bail) return id;
  return ids[ids.indexOf(id) + 1];
});
const selectPopupId = Object(reselect__WEBPACK_IMPORTED_MODULE_0__["createSelector"])(selectMapState, map => map.popupId);

/***/ }),

/***/ "./modules/map/types.js":
/*!******************************!*\
  !*** ./modules/map/types.js ***!
  \******************************/
/*! exports provided: CLEAR_SELECTION, HOVER_FEATURE, SELECT_FEATURE, SET_POPUP_ID, UNHOVER_FEATURE, SET_MAP_LOADED, RESET_MAP */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CLEAR_SELECTION", function() { return CLEAR_SELECTION; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HOVER_FEATURE", function() { return HOVER_FEATURE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SELECT_FEATURE", function() { return SELECT_FEATURE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SET_POPUP_ID", function() { return SET_POPUP_ID; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "UNHOVER_FEATURE", function() { return UNHOVER_FEATURE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SET_MAP_LOADED", function() { return SET_MAP_LOADED; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RESET_MAP", function() { return RESET_MAP; });
const base = 'map/';
const CLEAR_SELECTION = `${base}clearSelection`;
const HOVER_FEATURE = `${base}hoverFeature`;
const SELECT_FEATURE = `${base}selectFeature`;
const SET_POPUP_ID = `${base}setPopupId`;
const UNHOVER_FEATURE = `${base}unhoverFeature`;
const SET_MAP_LOADED = `${base}loaded`;
const RESET_MAP = `${base}reset`;

/***/ }),

/***/ "./modules/store.js":
/*!**************************!*\
  !*** ./modules/store.js ***!
  \**************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var redux_thunk__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! redux-thunk */ "redux-thunk");
/* harmony import */ var redux_thunk__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(redux_thunk__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var redux_devtools_extension_developmentOnly__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! redux-devtools-extension/developmentOnly */ "redux-devtools-extension/developmentOnly");
/* harmony import */ var redux_devtools_extension_developmentOnly__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(redux_devtools_extension_developmentOnly__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var redux__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! redux */ "redux");
/* harmony import */ var redux__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(redux__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var utils_map__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! utils/map */ "./utils/map.js");
/* harmony import */ var _appReducer__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./appReducer */ "./modules/appReducer.js");






const rootReducer = (state, action) => Object(_appReducer__WEBPACK_IMPORTED_MODULE_4__["default"])(state, action);

function configureStore() {
  const middlewares = [redux_thunk__WEBPACK_IMPORTED_MODULE_0___default.a.withExtraArgument(utils_map__WEBPACK_IMPORTED_MODULE_3__["getMap"])];
  let composeFn = redux__WEBPACK_IMPORTED_MODULE_2__["compose"];

  if (process.env === 'development') {
    composeFn = redux_devtools_extension_developmentOnly__WEBPACK_IMPORTED_MODULE_1__["composeWithDevTools"];
  }

  const store = Object(redux__WEBPACK_IMPORTED_MODULE_2__["createStore"])(rootReducer, composeFn(Object(redux__WEBPACK_IMPORTED_MODULE_2__["applyMiddleware"])(...middlewares)));
  return store;
}

/* harmony default export */ __webpack_exports__["default"] = (configureStore());

/***/ }),

/***/ "./node_modules/mapbox-gl/dist/mapbox-gl.css":
/*!***************************************************!*\
  !*** ./node_modules/mapbox-gl/dist/mapbox-gl.css ***!
  \***************************************************/
/*! no static exports found */
/***/ (function(module, exports) {



/***/ }),

/***/ "./node_modules/normalize.css/normalize.css":
/*!**************************************************!*\
  !*** ./node_modules/normalize.css/normalize.css ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports) {



/***/ }),

/***/ "./pages/_app.js":
/*!***********************!*\
  !*** ./pages/_app.js ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! prop-types */ "prop-types");
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/head */ "next/head");
/* harmony import */ var next_head__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_head__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/router */ "next/router");
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react-redux */ "react-redux");
/* harmony import */ var react_redux__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react_redux__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var emotion_theming__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! emotion-theming */ "emotion-theming");
/* harmony import */ var emotion_theming__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(emotion_theming__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var components_Cursor__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! components/Cursor */ "./components/Cursor/index.js");
/* harmony import */ var utils_analytics__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! utils/analytics */ "./utils/analytics.js");
/* harmony import */ var hooks_AppHooks__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! hooks/AppHooks */ "./hooks/AppHooks.js");
/* harmony import */ var styles_theme__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! styles/theme */ "./styles/theme/index.js");
/* harmony import */ var styles_GlobalStyles__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! styles/GlobalStyles */ "./styles/GlobalStyles.js");
/* harmony import */ var modules_store__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! modules/store */ "./modules/store.js");
/* harmony import */ var normalize_css__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! normalize.css */ "./node_modules/normalize.css/normalize.css");
/* harmony import */ var normalize_css__WEBPACK_IMPORTED_MODULE_12___default = /*#__PURE__*/__webpack_require__.n(normalize_css__WEBPACK_IMPORTED_MODULE_12__);
/* harmony import */ var mapbox_gl_dist_mapbox_gl_css__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! mapbox-gl/dist/mapbox-gl.css */ "./node_modules/mapbox-gl/dist/mapbox-gl.css");
/* harmony import */ var mapbox_gl_dist_mapbox_gl_css__WEBPACK_IMPORTED_MODULE_13___default = /*#__PURE__*/__webpack_require__.n(mapbox_gl_dist_mapbox_gl_css__WEBPACK_IMPORTED_MODULE_13__);
/* harmony import */ var _fonts_fonts_css__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ../fonts/fonts.css */ "./fonts/fonts.css");
/* harmony import */ var _fonts_fonts_css__WEBPACK_IMPORTED_MODULE_14___default = /*#__PURE__*/__webpack_require__.n(_fonts_fonts_css__WEBPACK_IMPORTED_MODULE_14__);
/* harmony import */ var _emotion_core__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! @emotion/core */ "@emotion/core");
/* harmony import */ var _emotion_core__WEBPACK_IMPORTED_MODULE_15___default = /*#__PURE__*/__webpack_require__.n(_emotion_core__WEBPACK_IMPORTED_MODULE_15__);
var _jsxFileName = "/Users/cliftoncampbell/Development/clif.world/pages/_app.js";
var __jsx = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement;

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }


















if (global.window) {
  utils_analytics__WEBPACK_IMPORTED_MODULE_7__["init"]('UA-91745405-6');
}

const App = ({
  Component,
  pageProps
}) => {
  const {
    pathname
  } = Object(next_router__WEBPACK_IMPORTED_MODULE_3__["useRouter"])();
  Object(react__WEBPACK_IMPORTED_MODULE_0__["useEffect"])(() => {
    utils_analytics__WEBPACK_IMPORTED_MODULE_7__["pageview"]();
  }, [pathname]);
  return Object(_emotion_core__WEBPACK_IMPORTED_MODULE_15__["jsx"])(react__WEBPACK_IMPORTED_MODULE_0___default.a.Fragment, null, Object(_emotion_core__WEBPACK_IMPORTED_MODULE_15__["jsx"])(next_head__WEBPACK_IMPORTED_MODULE_2___default.a, {
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 30,
      columnNumber: 7
    }
  }, Object(_emotion_core__WEBPACK_IMPORTED_MODULE_15__["jsx"])("title", {
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 31,
      columnNumber: 9
    }
  }, "hello"), Object(_emotion_core__WEBPACK_IMPORTED_MODULE_15__["jsx"])("meta", {
    name: "viewport",
    content: "width=device-width, initial-scale=1",
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 32,
      columnNumber: 9
    }
  }), Object(_emotion_core__WEBPACK_IMPORTED_MODULE_15__["jsx"])("meta", {
    name: "description",
    content: "Clifton Campbell's Web Development Portlfolio",
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 36,
      columnNumber: 9
    }
  }), Object(_emotion_core__WEBPACK_IMPORTED_MODULE_15__["jsx"])("meta", {
    name: "keywords",
    content: "Web Development, Mapbox, Software, Clifton Campbell, Websites",
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 40,
      columnNumber: 9
    }
  }), Object(_emotion_core__WEBPACK_IMPORTED_MODULE_15__["jsx"])("meta", {
    name: "author",
    content: "Clifton Campbell",
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 44,
      columnNumber: 9
    }
  }), Object(_emotion_core__WEBPACK_IMPORTED_MODULE_15__["jsx"])("meta", {
    charset: "utf-8",
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 45,
      columnNumber: 9
    }
  }), Object(_emotion_core__WEBPACK_IMPORTED_MODULE_15__["jsx"])("link", {
    href: "https://fonts.googleapis.com/css?family=Roboto+Mono:100,200,300,400&display=swap",
    rel: "stylesheet",
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 46,
      columnNumber: 9
    }
  }), Object(_emotion_core__WEBPACK_IMPORTED_MODULE_15__["jsx"])("link", {
    rel: "icon",
    href: "/favicon.png",
    sizes: "16x16",
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 50,
      columnNumber: 9
    }
  })), Object(_emotion_core__WEBPACK_IMPORTED_MODULE_15__["jsx"])(styles_GlobalStyles__WEBPACK_IMPORTED_MODULE_10__["default"], {
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 52,
      columnNumber: 7
    }
  }), Object(_emotion_core__WEBPACK_IMPORTED_MODULE_15__["jsx"])(emotion_theming__WEBPACK_IMPORTED_MODULE_5__["ThemeProvider"], {
    theme: styles_theme__WEBPACK_IMPORTED_MODULE_9__["default"],
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 53,
      columnNumber: 7
    }
  }, Object(_emotion_core__WEBPACK_IMPORTED_MODULE_15__["jsx"])(react_redux__WEBPACK_IMPORTED_MODULE_4__["Provider"], {
    store: modules_store__WEBPACK_IMPORTED_MODULE_11__["default"],
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 54,
      columnNumber: 9
    }
  }, Object(_emotion_core__WEBPACK_IMPORTED_MODULE_15__["jsx"])(hooks_AppHooks__WEBPACK_IMPORTED_MODULE_8__["default"], {
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 55,
      columnNumber: 11
    }
  }), Object(_emotion_core__WEBPACK_IMPORTED_MODULE_15__["jsx"])(components_Cursor__WEBPACK_IMPORTED_MODULE_6__["default"], {
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 56,
      columnNumber: 11
    }
  }), Object(_emotion_core__WEBPACK_IMPORTED_MODULE_15__["jsx"])(Component, _extends({}, pageProps, {
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 57,
      columnNumber: 11
    }
  })))));
};

App.propTypes = {
  Component: prop_types__WEBPACK_IMPORTED_MODULE_1___default.a.func.isRequired,
  pageProps: prop_types__WEBPACK_IMPORTED_MODULE_1___default.a.object.isRequired
};
/* harmony default export */ __webpack_exports__["default"] = (App);

/***/ }),

/***/ "./styles/GlobalStyles.js":
/*!********************************!*\
  !*** ./styles/GlobalStyles.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return GlobalStyles; });
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _emotion_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @emotion/core */ "@emotion/core");
/* harmony import */ var _emotion_core__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_emotion_core__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _theme_colors__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./theme/colors */ "./styles/theme/colors.js");
/* harmony import */ var _theme_transitions__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./theme/transitions */ "./styles/theme/transitions.js");
var _jsxFileName = "/Users/cliftoncampbell/Development/clif.world/styles/GlobalStyles.js";
var __jsx = react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement;





const globalCss =
/*#__PURE__*/

/*#__PURE__*/
Object(_emotion_core__WEBPACK_IMPORTED_MODULE_1__["css"])("html{box-sizing:border-box;}*,*:before,*:after{box-sizing:inherit;cursor:none !important;-webkit-overflow-scrolling:touch;}*{::-webkit-scrollbar{height:12px;width:12px;background-color:rgba(255,255,255,0);}::-webkit-scrollbar-track,::-webkit-scrollbar-thumb{border:4px solid rgba(255,255,255,0);border-radius:10px;background-clip:padding-box;}::-webkit-scrollbar-track{background-color:rgba(255,255,255,0);}::-webkit-scrollbar-thumb{transition:", _theme_transitions__WEBPACK_IMPORTED_MODULE_3__["default"].linearHue, ";background-color:", _theme_colors__WEBPACK_IMPORTED_MODULE_2__["default"].scroll1, ";&:hover{background-color:", _theme_colors__WEBPACK_IMPORTED_MODULE_2__["default"].scroll2, ";}&:active{background-color:", _theme_colors__WEBPACK_IMPORTED_MODULE_2__["default"].scroll3, ";}}}html,body,#__next{height:100%;width:100%;position:relative;overflow:hidden;}body{background:", _theme_colors__WEBPACK_IMPORTED_MODULE_2__["default"].background1, ";}ul{padding:0;margin-right:0;}a{text-decoration:none;}button,a{*{user-select:none;}}svg{fill:currentColor;};label:globalCss;" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9zdHlsZXMvR2xvYmFsU3R5bGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUtxQiIsImZpbGUiOiIvVXNlcnMvY2xpZnRvbmNhbXBiZWxsL0RldmVsb3BtZW50L2NsaWYud29ybGQvc3R5bGVzL0dsb2JhbFN0eWxlcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgeyBHbG9iYWwsIGNzcyB9IGZyb20gJ0BlbW90aW9uL2NvcmUnO1xuaW1wb3J0IGNvbG9ycyBmcm9tICcuL3RoZW1lL2NvbG9ycyc7XG5pbXBvcnQgdHJhbnNpdGlvbnMgZnJvbSAnLi90aGVtZS90cmFuc2l0aW9ucyc7XG5cbmNvbnN0IGdsb2JhbENzcyA9IGNzc2BcbiAgaHRtbCB7XG4gICAgYm94LXNpemluZzogYm9yZGVyLWJveDtcbiAgfVxuICAqLFxuICAqOmJlZm9yZSxcbiAgKjphZnRlciB7XG4gICAgYm94LXNpemluZzogaW5oZXJpdDtcbiAgICBjdXJzb3I6IG5vbmUgIWltcG9ydGFudDtcbiAgICAtd2Via2l0LW92ZXJmbG93LXNjcm9sbGluZzogdG91Y2g7XG4gIH1cbiAgKiB7XG4gICAgOjotd2Via2l0LXNjcm9sbGJhciB7XG4gICAgICBoZWlnaHQ6IDEycHg7XG4gICAgICB3aWR0aDogMTJweDtcbiAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMCk7XG4gICAgfVxuXG4gICAgOjotd2Via2l0LXNjcm9sbGJhci10cmFjayxcbiAgICA6Oi13ZWJraXQtc2Nyb2xsYmFyLXRodW1iIHtcbiAgICAgIGJvcmRlcjogNHB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMCk7XG4gICAgICBib3JkZXItcmFkaXVzOiAxMHB4O1xuICAgICAgYmFja2dyb3VuZC1jbGlwOiBwYWRkaW5nLWJveDtcbiAgICB9XG5cbiAgICA6Oi13ZWJraXQtc2Nyb2xsYmFyLXRyYWNrIHtcbiAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMjU1LCAyNTUsIDI1NSwgMCk7XG4gICAgfVxuXG4gICAgOjotd2Via2l0LXNjcm9sbGJhci10aHVtYiB7XG4gICAgICB0cmFuc2l0aW9uOiAke3RyYW5zaXRpb25zLmxpbmVhckh1ZX07XG4gICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAke2NvbG9ycy5zY3JvbGwxfTtcbiAgICAgICY6aG92ZXIge1xuICAgICAgICBiYWNrZ3JvdW5kLWNvbG9yOiAke2NvbG9ycy5zY3JvbGwyfTtcbiAgICAgIH1cbiAgICAgICY6YWN0aXZlIHtcbiAgICAgICAgYmFja2dyb3VuZC1jb2xvcjogJHtjb2xvcnMuc2Nyb2xsM307XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaHRtbCxcbiAgYm9keSxcbiAgI19fbmV4dCB7XG4gICAgaGVpZ2h0OiAxMDAlO1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xuICB9XG4gIGJvZHkge1xuICAgIGJhY2tncm91bmQ6ICR7Y29sb3JzLmJhY2tncm91bmQxfTtcbiAgfVxuICB1bCB7XG4gICAgcGFkZGluZzogMDtcbiAgICBtYXJnaW4tcmlnaHQ6IDA7XG4gIH1cbiAgYSB7XG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICB9XG4gIGJ1dHRvbixcbiAgYSB7XG4gICAgKiB7XG4gICAgICB1c2VyLXNlbGVjdDogbm9uZTtcbiAgICB9XG4gIH1cbiAgc3ZnIHtcbiAgICBmaWxsOiBjdXJyZW50Q29sb3I7XG4gIH1cbmA7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEdsb2JhbFN0eWxlcygpIHtcbiAgcmV0dXJuIDxHbG9iYWwgc3R5bGVzPXtnbG9iYWxDc3N9IC8+O1xufVxuIl19 */"), ";label:globalCss;");
function GlobalStyles() {
  return Object(_emotion_core__WEBPACK_IMPORTED_MODULE_1__["jsx"])(_emotion_core__WEBPACK_IMPORTED_MODULE_1__["Global"], {
    styles: globalCss,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 77,
      columnNumber: 10
    }
  });
}

/***/ }),

/***/ "./styles/breakpoints.js":
/*!*******************************!*\
  !*** ./styles/breakpoints.js ***!
  \*******************************/
/*! exports provided: MOBILE, TABLET, isMobile, isTablet, desktop, tablet, mobile, breakpoints, mq */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MOBILE", function() { return MOBILE; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TABLET", function() { return TABLET; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isMobile", function() { return isMobile; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "isTablet", function() { return isTablet; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "desktop", function() { return desktop; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "tablet", function() { return tablet; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mobile", function() { return mobile; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "breakpoints", function() { return breakpoints; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "mq", function() { return mq; });
/* harmony import */ var facepaint__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! facepaint */ "facepaint");
/* harmony import */ var facepaint__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(facepaint__WEBPACK_IMPORTED_MODULE_0__);

const MOBILE = 650;
const TABLET = 1000;
const isMobile = width => width < MOBILE;
const isTablet = width => width < TABLET;
const desktop = ttl => `
  @media (min-width: ${TABLET}px) {
    ${ttl};
  }
`;
const tablet = ttl => `
  @media (max-width: ${TABLET}px) {
    ${ttl};
  }
`;
const mobile = ttl => `
  @media (max-width: ${MOBILE}px) {
    ${ttl};
  }
`;
const breakpoints = [TABLET, MOBILE];
const mq = facepaint__WEBPACK_IMPORTED_MODULE_0___default()(breakpoints.map(bp => `@media (max-width: ${bp}px)`));

/***/ }),

/***/ "./styles/index.js":
/*!*************************!*\
  !*** ./styles/index.js ***!
  \*************************/
/*! exports provided: size, getStyle, getProp, getBool, centered, foregroundContentTopPadding, foregroundContentBottomPadding, header, row, column, full, MOBILE, TABLET, isMobile, isTablet, desktop, tablet, mobile, breakpoints, mq */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _size__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./size */ "./styles/size.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "size", function() { return _size__WEBPACK_IMPORTED_MODULE_0__["size"]; });

/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./styles/utils.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getStyle", function() { return _utils__WEBPACK_IMPORTED_MODULE_1__["getStyle"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getProp", function() { return _utils__WEBPACK_IMPORTED_MODULE_1__["getProp"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "getBool", function() { return _utils__WEBPACK_IMPORTED_MODULE_1__["getBool"]; });

/* harmony import */ var _layout__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./layout */ "./styles/layout.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "centered", function() { return _layout__WEBPACK_IMPORTED_MODULE_2__["centered"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "foregroundContentTopPadding", function() { return _layout__WEBPACK_IMPORTED_MODULE_2__["foregroundContentTopPadding"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "foregroundContentBottomPadding", function() { return _layout__WEBPACK_IMPORTED_MODULE_2__["foregroundContentBottomPadding"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "header", function() { return _layout__WEBPACK_IMPORTED_MODULE_2__["header"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "row", function() { return _layout__WEBPACK_IMPORTED_MODULE_2__["row"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "column", function() { return _layout__WEBPACK_IMPORTED_MODULE_2__["column"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "full", function() { return _layout__WEBPACK_IMPORTED_MODULE_2__["full"]; });

/* harmony import */ var _breakpoints__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./breakpoints */ "./styles/breakpoints.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MOBILE", function() { return _breakpoints__WEBPACK_IMPORTED_MODULE_3__["MOBILE"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "TABLET", function() { return _breakpoints__WEBPACK_IMPORTED_MODULE_3__["TABLET"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isMobile", function() { return _breakpoints__WEBPACK_IMPORTED_MODULE_3__["isMobile"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "isTablet", function() { return _breakpoints__WEBPACK_IMPORTED_MODULE_3__["isTablet"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "desktop", function() { return _breakpoints__WEBPACK_IMPORTED_MODULE_3__["desktop"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "tablet", function() { return _breakpoints__WEBPACK_IMPORTED_MODULE_3__["tablet"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "mobile", function() { return _breakpoints__WEBPACK_IMPORTED_MODULE_3__["mobile"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "breakpoints", function() { return _breakpoints__WEBPACK_IMPORTED_MODULE_3__["breakpoints"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "mq", function() { return _breakpoints__WEBPACK_IMPORTED_MODULE_3__["mq"]; });






/***/ }),

/***/ "./styles/layout.js":
/*!**************************!*\
  !*** ./styles/layout.js ***!
  \**************************/
/*! exports provided: centered, foregroundContentTopPadding, foregroundContentBottomPadding, header, row, column, full */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "centered", function() { return centered; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "foregroundContentTopPadding", function() { return foregroundContentTopPadding; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "foregroundContentBottomPadding", function() { return foregroundContentBottomPadding; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "header", function() { return header; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "row", function() { return row; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "column", function() { return column; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "full", function() { return full; });
/* harmony import */ var _size__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./size */ "./styles/size.js");
/* harmony import */ var _breakpoints__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./breakpoints */ "./styles/breakpoints.js");
function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }




const createBase = ({
  a = 'center',
  j = 'flex-start',
  p,
  m,
  as,
  ga
}) => `
  display: flex;
  justify-content: flex-start;
  align-items: center;
  align-items: ${a};
  justify-content: ${j};
  grid-area: ${ga};
  ${typeof p === 'number' ? `padding: ${Object(_size__WEBPACK_IMPORTED_MODULE_0__["size"])(p)};` : typeof p === 'string' ? `padding: ${p};` : ''};
  ${typeof m === 'number' ? `margin: ${Object(_size__WEBPACK_IMPORTED_MODULE_0__["size"])(m)};` : typeof m === 'string' ? `margin: ${m};` : ''};
  ${as ? 'align-self: stretch;' : ''};
`;

const centered = props => `
  ${createBase(props)};
  justify-content: center;
`;
const foregroundContentTopPadding = Object(_breakpoints__WEBPACK_IMPORTED_MODULE_1__["mq"])({
  paddingTop: [Object(_size__WEBPACK_IMPORTED_MODULE_0__["size"])(52), Object(_size__WEBPACK_IMPORTED_MODULE_0__["size"])(44), Object(_size__WEBPACK_IMPORTED_MODULE_0__["size"])(24)]
});
const foregroundContentBottomPadding = Object(_breakpoints__WEBPACK_IMPORTED_MODULE_1__["mq"])({
  paddingBottom: [Object(_size__WEBPACK_IMPORTED_MODULE_0__["size"])(20), Object(_size__WEBPACK_IMPORTED_MODULE_0__["size"])(20), Object(_size__WEBPACK_IMPORTED_MODULE_0__["size"])(10)]
});
const header = `
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 170px;
  padding: 0px 50px;
  img, svg {
    height: 68px;
  }
  ${Object(_breakpoints__WEBPACK_IMPORTED_MODULE_1__["mobile"])(`
    height: 100px;
    padding: 0px 25px;
    img, svg {
      height: 50px;
    }
  `)};
`;

const createSpacing = (sp, cssKey) => {
  switch (typeof sp) {
    case 'number':
      return `> *:not(:last-child) {
        ${cssKey}: ${Object(_size__WEBPACK_IMPORTED_MODULE_0__["size"])(sp)};
      }`;

    case 'string':
      return `
        > *:not(:last-child) {
          ${cssKey}: ${sp};
        }
      `;

    default:
      return '';
  }
};

const row = (_ref) => {
  let {
    sp,
    msp
  } = _ref,
      props = _objectWithoutProperties(_ref, ["sp", "msp"]);

  return `
  ${createBase(props)};
  flex-direction: row;
  ${createSpacing(sp, 'margin-right')};
  ${Object(_breakpoints__WEBPACK_IMPORTED_MODULE_1__["mobile"])(`
    ${createSpacing(msp, 'margin-right')};
  `)};
`;
};
const column = (_ref2) => {
  let {
    sp,
    msp
  } = _ref2,
      props = _objectWithoutProperties(_ref2, ["sp", "msp"]);

  return `
  ${createBase(props)};
  flex-direction: column;
  ${createSpacing(sp, 'margin-bottom')};
  ${Object(_breakpoints__WEBPACK_IMPORTED_MODULE_1__["mobile"])(`
    ${createSpacing(msp, 'margin-bottom')};
  `)};
`;
};
const full = `
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

/***/ }),

/***/ "./styles/size.js":
/*!************************!*\
  !*** ./styles/size.js ***!
  \************************/
/*! exports provided: size */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "size", function() { return size; });
const GRID_SIZE = 4;
const size = integer => `${integer * GRID_SIZE}px`;

/***/ }),

/***/ "./styles/theme/borders.js":
/*!*********************************!*\
  !*** ./styles/theme/borders.js ***!
  \*********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _colors__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./colors */ "./styles/theme/colors.js");

/* harmony default export */ __webpack_exports__["default"] = ({
  ctaBorder: `1px solid ${_colors__WEBPACK_IMPORTED_MODULE_0__["default"].border1}`,
  ctaBorder2: `1px solid ${_colors__WEBPACK_IMPORTED_MODULE_0__["default"].border2}`,
  ctaBorder3: `1px solid ${_colors__WEBPACK_IMPORTED_MODULE_0__["default"].border3}`,
  contentBorder: `1px solid ${_colors__WEBPACK_IMPORTED_MODULE_0__["default"].background2}`
});

/***/ }),

/***/ "./styles/theme/colors.js":
/*!********************************!*\
  !*** ./styles/theme/colors.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var hex_to_rgba__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! hex-to-rgba */ "hex-to-rgba");
/* harmony import */ var hex_to_rgba__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(hex_to_rgba__WEBPACK_IMPORTED_MODULE_0__);

const yellow = '#FFE520';
const black = '#161616';
const offBlack = '#232323';
/* harmony default export */ __webpack_exports__["default"] = ({
  background1: black,
  background2: '#202020',
  controlBackdrop: 'rgba(22,22,22,0.69)',
  text1: '#FFF',
  text1b: '#ebebeb',
  text1c: '#858585',
  text1d: '#474747',
  text1e: offBlack,
  text2: yellow,
  text3: black,
  border1: yellow,
  border2: hex_to_rgba__WEBPACK_IMPORTED_MODULE_0___default()(yellow, 0.3),
  border3: offBlack,
  ctaBackground1: yellow,
  ctaBackground2: hex_to_rgba__WEBPACK_IMPORTED_MODULE_0___default()(yellow, 0.3),
  ctaBackground3: hex_to_rgba__WEBPACK_IMPORTED_MODULE_0___default()(yellow, 0.12),
  ctaBackground4: hex_to_rgba__WEBPACK_IMPORTED_MODULE_0___default()(yellow, 0.6),
  scroll1: 'rgba(255, 229, 32, 0.3)',
  scroll2: 'rgba(255, 229, 32, 0.5)',
  scroll3: 'rgba(255, 229, 32, 0.8)'
});

/***/ }),

/***/ "./styles/theme/gradients.js":
/*!***********************************!*\
  !*** ./styles/theme/gradients.js ***!
  \***********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ({});

/***/ }),

/***/ "./styles/theme/index.js":
/*!*******************************!*\
  !*** ./styles/theme/index.js ***!
  \*******************************/
/*! exports provided: flatStanley, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "flatStanley", function() { return flatStanley; });
/* harmony import */ var _borders__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./borders */ "./styles/theme/borders.js");
/* harmony import */ var _colors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./colors */ "./styles/theme/colors.js");
/* harmony import */ var _gradients__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./gradients */ "./styles/theme/gradients.js");
/* harmony import */ var _sizes__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./sizes */ "./styles/theme/sizes.js");
/* harmony import */ var _transitions__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./transitions */ "./styles/theme/transitions.js");
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }






const theme = {
  borders: _borders__WEBPACK_IMPORTED_MODULE_0__["default"],
  colors: _colors__WEBPACK_IMPORTED_MODULE_1__["default"],
  gradients: _gradients__WEBPACK_IMPORTED_MODULE_2__["default"],
  sizes: _sizes__WEBPACK_IMPORTED_MODULE_3__["default"],
  transitions: _transitions__WEBPACK_IMPORTED_MODULE_4__["default"]
};
const flatStanley = Object.values(theme).reduce((acc, val) => _objectSpread({}, acc, {}, val), []);
/* harmony default export */ __webpack_exports__["default"] = (theme);

/***/ }),

/***/ "./styles/theme/sizes.js":
/*!*******************************!*\
  !*** ./styles/theme/sizes.js ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _size__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../size */ "./styles/size.js");

const pageMinimumPadding = Object(_size__WEBPACK_IMPORTED_MODULE_0__["size"])(4);
/* harmony default export */ __webpack_exports__["default"] = ({
  popupWidth: Object(_size__WEBPACK_IMPORTED_MODULE_0__["size"])(80),
  popupMaxHeight: Object(_size__WEBPACK_IMPORTED_MODULE_0__["size"])(65),
  foregroundContentRightPadding: Object(_size__WEBPACK_IMPORTED_MODULE_0__["size"])(30),
  foregroundContentRightPaddingTablet: Object(_size__WEBPACK_IMPORTED_MODULE_0__["size"])(23),
  foregroundContentRightPaddingMobile: Object(_size__WEBPACK_IMPORTED_MODULE_0__["size"])(13),
  foregroundLeftPadding: Object(_size__WEBPACK_IMPORTED_MODULE_0__["size"])(28),
  foregroundLeftPaddingTablet: pageMinimumPadding,
  pageMinimumPadding
});

/***/ }),

/***/ "./styles/theme/transitions.js":
/*!*************************************!*\
  !*** ./styles/theme/transitions.js ***!
  \*************************************/
/*! exports provided: speeds, default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "speeds", function() { return speeds; });
const speeds = {
  short: '0.15s',
  long: '0.5s'
};
const {
  short
} = speeds;
/* harmony default export */ __webpack_exports__["default"] = ({
  linearHue: `box-shadow ${short} linear, color ${short} linear, background-color ${short} linear, opacity ${short} linear, fill ${short} linear, border-color ${short} linear`,
  easeOutSize: `transform ${short} ease-out, width ${short} ease-out, height ${short} ease-out, margin ${short} ease-out, border-width ${short} ease-out`,
  speeds
});

/***/ }),

/***/ "./styles/utils.js":
/*!*************************!*\
  !*** ./styles/utils.js ***!
  \*************************/
/*! exports provided: getStyle, getProp, getBool */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getStyle", function() { return getStyle; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getProp", function() { return getProp; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getBool", function() { return getBool; });
/* harmony import */ var lodash_get__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lodash.get */ "lodash.get");
/* harmony import */ var lodash_get__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(lodash_get__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _theme__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./theme */ "./styles/theme/index.js");


const getStyle = key => lodash_get__WEBPACK_IMPORTED_MODULE_0___default()(_theme__WEBPACK_IMPORTED_MODULE_1__["flatStanley"], key);
const getProp = (key, callback) => p => {
  const val = lodash_get__WEBPACK_IMPORTED_MODULE_0___default()(p, key);
  return callback ? callback(val) : val;
};
const getBool = (key, ifTrue, ifFalse) => p => lodash_get__WEBPACK_IMPORTED_MODULE_0___default()(p, key) ? ifTrue || '' : ifFalse || '';

/***/ }),

/***/ "./utils/analytics.js":
/*!****************************!*\
  !*** ./utils/analytics.js ***!
  \****************************/
/*! exports provided: init, pageview, event, timing */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "init", function() { return init; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "pageview", function() { return pageview; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "event", function() { return event; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "timing", function() { return timing; });
/* harmony import */ var universal_analytics__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! universal-analytics */ "universal-analytics");
/* harmony import */ var universal_analytics__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(universal_analytics__WEBPACK_IMPORTED_MODULE_0__);
function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }


const enabled = process.env !== 'development';
let visitor;
const init = tracking => {
  if (enabled) {
    visitor = universal_analytics__WEBPACK_IMPORTED_MODULE_0___default()(tracking, {
      https: process.env !== 'development'
    });
  }
};

const getViewportDimesions = () => `${Math.max(document.documentElement.clientWidth, window.innerWidth || 0)}x${Math.max(document.documentElement.clientHeight, window.innerHeight || 0)}`;

const pageview = payload => {
  if (enabled) {
    visitor.pageview(_objectSpread({}, payload, {
      dp: window.location.pathname,
      dh: window.location.origin,
      vp: getViewportDimesions()
    })).send();
  }
};
const event = payload => {
  if (enabled) {
    visitor.event(payload);
  }
};
const timing = (category, action, time) => {
  if (enabled) {
    visitor.timing(category, action, time).send();
  }
};

/***/ }),

/***/ "./utils/geojson.js":
/*!**************************!*\
  !*** ./utils/geojson.js ***!
  \**************************/
/*! exports provided: emptyGeoJson, createGeoJsonFeature, arrayToFeatureCollection */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "emptyGeoJson", function() { return emptyGeoJson; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "createGeoJsonFeature", function() { return createGeoJsonFeature; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "arrayToFeatureCollection", function() { return arrayToFeatureCollection; });
const emptyGeoJson = {
  type: 'FeatureCollection',
  features: []
};
const createGeoJsonFeature = properties => {
  const {
    coordinates,
    id
  } = properties;
  return {
    type: 'Feature',
    id,
    geometry: {
      type: 'Point',
      coordinates
    },
    properties
  };
};
const arrayToFeatureCollection = data => ({
  type: 'FeatureCollection',
  features: data.map(createGeoJsonFeature)
});

/***/ }),

/***/ "./utils/map.js":
/*!**********************!*\
  !*** ./utils/map.js ***!
  \**********************/
/*! exports provided: setMap, getMap */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "setMap", function() { return setMap; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "getMap", function() { return getMap; });
/* eslint import/no-mutable-exports: 0 */
const setMap = mapboxMap => {
  global.map = mapboxMap;
  return global.map;
};
const getMap = () => global.map;

/***/ }),

/***/ 0:
/*!****************************************!*\
  !*** multi private-next-pages/_app.js ***!
  \****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! private-next-pages/_app.js */"./pages/_app.js");


/***/ }),

/***/ "@emotion/core":
/*!********************************!*\
  !*** external "@emotion/core" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@emotion/core");

/***/ }),

/***/ "@emotion/styled-base":
/*!***************************************!*\
  !*** external "@emotion/styled-base" ***!
  \***************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@emotion/styled-base");

/***/ }),

/***/ "@turf/bbox":
/*!*****************************!*\
  !*** external "@turf/bbox" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@turf/bbox");

/***/ }),

/***/ "@turf/helpers":
/*!********************************!*\
  !*** external "@turf/helpers" ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("@turf/helpers");

/***/ }),

/***/ "emotion-theming":
/*!**********************************!*\
  !*** external "emotion-theming" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("emotion-theming");

/***/ }),

/***/ "facepaint":
/*!****************************!*\
  !*** external "facepaint" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("facepaint");

/***/ }),

/***/ "hex-to-rgba":
/*!******************************!*\
  !*** external "hex-to-rgba" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("hex-to-rgba");

/***/ }),

/***/ "is-touch-device":
/*!**********************************!*\
  !*** external "is-touch-device" ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("is-touch-device");

/***/ }),

/***/ "lodash.get":
/*!*****************************!*\
  !*** external "lodash.get" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("lodash.get");

/***/ }),

/***/ "next/head":
/*!****************************!*\
  !*** external "next/head" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("next/head");

/***/ }),

/***/ "next/router":
/*!******************************!*\
  !*** external "next/router" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("next/router");

/***/ }),

/***/ "prop-types":
/*!*****************************!*\
  !*** external "prop-types" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("prop-types");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react");

/***/ }),

/***/ "react-redux":
/*!******************************!*\
  !*** external "react-redux" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react-redux");

/***/ }),

/***/ "redux":
/*!************************!*\
  !*** external "redux" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("redux");

/***/ }),

/***/ "redux-devtools-extension/developmentOnly":
/*!***********************************************************!*\
  !*** external "redux-devtools-extension/developmentOnly" ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("redux-devtools-extension/developmentOnly");

/***/ }),

/***/ "redux-thunk":
/*!******************************!*\
  !*** external "redux-thunk" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("redux-thunk");

/***/ }),

/***/ "reselect":
/*!***************************!*\
  !*** external "reselect" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("reselect");

/***/ }),

/***/ "universal-analytics":
/*!**************************************!*\
  !*** external "universal-analytics" ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("universal-analytics");

/***/ }),

/***/ "uuid/v4":
/*!**************************!*\
  !*** external "uuid/v4" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("uuid/v4");

/***/ })

/******/ });
//# sourceMappingURL=_app.js.map