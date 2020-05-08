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
/******/ 	return __webpack_require__(__webpack_require__.s = 3);
/******/ })
/************************************************************************/
/******/ ({

/***/ "../next-server/lib/router-context":
/*!**************************************************************!*\
  !*** external "next/dist/next-server/lib/router-context.js" ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("next/dist/next-server/lib/router-context.js");

/***/ }),

/***/ "../next-server/lib/utils":
/*!*****************************************************!*\
  !*** external "next/dist/next-server/lib/utils.js" ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("next/dist/next-server/lib/utils.js");

/***/ }),

/***/ "./_pages/home/Globe.jsx":
/*!*******************************!*\
  !*** ./_pages/home/Globe.jsx ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Globe; });
/* harmony import */ var _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @emotion/styled-base */ "@emotion/styled-base");
/* harmony import */ var _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_emotion_styled_base__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var lodash_get__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lodash.get */ "lodash.get");
/* harmony import */ var lodash_get__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(lodash_get__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var d3__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! d3 */ "d3");
/* harmony import */ var d3__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(d3__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var topojson__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! topojson */ "topojson");
/* harmony import */ var topojson__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(topojson__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _ne110m_land_json__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./ne110m_land.json */ "./_pages/home/ne110m_land.json");
var _ne110m_land_json__WEBPACK_IMPORTED_MODULE_5___namespace = /*#__PURE__*/__webpack_require__.t(/*! ./ne110m_land.json */ "./_pages/home/ne110m_land.json", 1);
/* harmony import */ var _emotion_core__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @emotion/core */ "@emotion/core");
/* harmony import */ var _emotion_core__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_emotion_core__WEBPACK_IMPORTED_MODULE_6__);

var _jsxFileName = "/Users/cliftoncampbell/Development/clif.world/_pages/home/Globe.jsx";
var __jsx = react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement;

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _EMOTION_STRINGIFIED_CSS_ERROR__() { return "You have tried to stringify object returned from `css` function. It isn't supposed to be used directly (e.g. as value of the `className` prop), but rather handed to emotion so it can handle it (e.g. as value of `css` prop)."; }







const countries = Object(topojson__WEBPACK_IMPORTED_MODULE_4__["feature"])(_ne110m_land_json__WEBPACK_IMPORTED_MODULE_5__, _ne110m_land_json__WEBPACK_IMPORTED_MODULE_5__.objects.land);

const geojson = _objectSpread({}, countries, {
  features: countries.features
});

const normalizeCursorLocation = ([x, y]) => {
  const {
    innerWidth,
    innerHeight
  } = window;

  const _x = (x - innerWidth / 2) / (innerWidth / 2);

  const _y = -(y - innerHeight / 2) / (innerHeight / 2);

  return [_x, _y];
};

const bufferChange = (val, oldVal) => {
  const difference = oldVal - val;
  const max = 0.1;
  const smallerChange = difference < 0 ? max : -max;
  return Math.abs(difference) > max ? oldVal + smallerChange : val;
};

const Canvas = _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()("canvas", {
  target: "ehfpmxk0",
  label: "Canvas"
})(false ? undefined : {
  name: "1ntfbxl",
  styles: "fill:transparent;",
  map: "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9fcGFnZXMvaG9tZS9HbG9iZS5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBMkI0QiIsImZpbGUiOiIvVXNlcnMvY2xpZnRvbmNhbXBiZWxsL0RldmVsb3BtZW50L2NsaWYud29ybGQvX3BhZ2VzL2hvbWUvR2xvYmUuanN4Iiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IENvbXBvbmVudCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBnZXQgZnJvbSAnbG9kYXNoLmdldCc7XG5pbXBvcnQgKiBhcyBkMyBmcm9tICdkMyc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ0BlbW90aW9uL3N0eWxlZCc7XG5pbXBvcnQgeyBmZWF0dXJlIH0gZnJvbSAndG9wb2pzb24nO1xuaW1wb3J0IGxhbmRzIGZyb20gJy4vbmUxMTBtX2xhbmQuanNvbic7XG5cbmNvbnN0IGNvdW50cmllcyA9IGZlYXR1cmUobGFuZHMsIGxhbmRzLm9iamVjdHMubGFuZCk7XG5jb25zdCBnZW9qc29uID0ge1xuICAuLi5jb3VudHJpZXMsXG4gIGZlYXR1cmVzOiBjb3VudHJpZXMuZmVhdHVyZXMsXG59O1xuXG5jb25zdCBub3JtYWxpemVDdXJzb3JMb2NhdGlvbiA9IChbeCwgeV0pID0+IHtcbiAgY29uc3QgeyBpbm5lcldpZHRoLCBpbm5lckhlaWdodCB9ID0gd2luZG93O1xuICBjb25zdCBfeCA9ICh4IC0gaW5uZXJXaWR0aCAvIDIpIC8gKGlubmVyV2lkdGggLyAyKTtcbiAgY29uc3QgX3kgPSAtKHkgLSBpbm5lckhlaWdodCAvIDIpIC8gKGlubmVySGVpZ2h0IC8gMik7XG4gIHJldHVybiBbX3gsIF95XTtcbn07XG5cbmNvbnN0IGJ1ZmZlckNoYW5nZSA9ICh2YWwsIG9sZFZhbCkgPT4ge1xuICBjb25zdCBkaWZmZXJlbmNlID0gb2xkVmFsIC0gdmFsO1xuICBjb25zdCBtYXggPSAwLjE7XG4gIGNvbnN0IHNtYWxsZXJDaGFuZ2UgPSBkaWZmZXJlbmNlIDwgMCA/IG1heCA6IC1tYXg7XG4gIHJldHVybiBNYXRoLmFicyhkaWZmZXJlbmNlKSA+IG1heCA/IG9sZFZhbCArIHNtYWxsZXJDaGFuZ2UgOiB2YWw7XG59O1xuXG5jb25zdCBDYW52YXMgPSBzdHlsZWQuY2FudmFzYFxuICBmaWxsOiB0cmFuc3BhcmVudDtcbmA7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdsb2JlIGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgY29vcmRzID0gWzAsIDBdO1xuXG4gIHJvdGF0aW9uWSA9IDA7XG5cbiAgc3RhdGUgPSB7XG4gICAgc2l6ZTogMCxcbiAgfTtcblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICBjb25zdCBzaXplID1cbiAgICAgIE1hdGgubWF4KHdpbmRvdy5pbm5lckhlaWdodCwgd2luZG93LmlubmVyV2lkdGgpICsgMjAwO1xuICAgIHRoaXMuc2V0U3RhdGUoeyBzaXplIH0pO1xuICAgIHRoaXMudHJhbnNsYXRlWCA9IHNpemUgLyAyO1xuICAgIHRoaXMudHJhbnNsYXRlWSA9IHNpemUgLyAyO1xuICAgIHRoaXMucm90YXRpb25YID0gc2l6ZTtcblxuICAgIGNvbnN0IHN2ZyA9IGQzLnNlbGVjdCgnI2dsb2JlJyk7XG4gICAgY29uc3QgY29udGV4dCA9IHN2Zy5ub2RlKCkuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICBjb25zdCBwcm9qZWN0aW9uID0gZDNcbiAgICAgIC5nZW9PcnRob2dyYXBoaWMoKVxuICAgICAgLmZpdFNpemUoW3NpemUsIHNpemVdLCBnZW9qc29uKVxuICAgICAgLnJvdGF0ZShbdGhpcy5yb3RhdGlvblgsIHRoaXMucm90YXRpb25ZXSlcbiAgICAgIC5jbGlwQW5nbGUoMTgwKVxuICAgICAgLnRyYW5zbGF0ZShbdGhpcy50cmFuc2xhdGVYLCB0aGlzLnRyYW5zbGF0ZVldKTtcbiAgICBjb25zdCBwYXRoID0gZDMuZ2VvUGF0aCgpLnByb2plY3Rpb24ocHJvamVjdGlvbikuY29udGV4dChjb250ZXh0KTtcbiAgICB0aGlzLnRpbWVyID0gZDMudGltZXIoKCkgPT4ge1xuICAgICAgY29uc3QgY2hhbmdlID0gdGhpcy5jb29yZHNbMF0gPj0gMCA/IC0wLjAyIDogMC4wMjtcbiAgICAgIHRoaXMucm90YXRpb25YICs9IGNoYW5nZTtcbiAgICAgIHRoaXMucm90YXRpb25ZID0gYnVmZmVyQ2hhbmdlKHRoaXMuY29vcmRzWzFdLCB0aGlzLnJvdGF0aW9uWSk7XG4gICAgICB0aGlzLnRyYW5zbGF0ZVggPSBidWZmZXJDaGFuZ2UoXG4gICAgICAgIHNpemUgLyAyICsgdGhpcy5jb29yZHNbMF0sXG4gICAgICAgIHRoaXMudHJhbnNsYXRlWCxcbiAgICAgICk7XG4gICAgICB0aGlzLnRyYW5zbGF0ZVkgPSBidWZmZXJDaGFuZ2UoXG4gICAgICAgIHNpemUgLyAyICsgdGhpcy5jb29yZHNbMV0sXG4gICAgICAgIHRoaXMudHJhbnNsYXRlWSxcbiAgICAgICk7XG4gICAgICBwcm9qZWN0aW9uXG4gICAgICAgIC5yb3RhdGUoW3RoaXMucm90YXRpb25YLCB0aGlzLnJvdGF0aW9uWV0pXG4gICAgICAgIC50cmFuc2xhdGUoW3RoaXMudHJhbnNsYXRlWCwgdGhpcy50cmFuc2xhdGVZXSk7XG4gICAgICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBzaXplLCBzaXplKTtcbiAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICBwYXRoKGNvdW50cmllcyk7XG4gICAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICcjMTExJztcbiAgICAgIGNvbnRleHQuZmlsbCgpO1xuICAgICAgY29udGV4dC5saW5lV2lkdGggPSAwLjU7XG4gICAgICBjb250ZXh0LnN0cm9rZUNvbG9yID0gJyMwMDAnO1xuICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICB9KTtcblxuICAgIHRoaXMubW91c2VMaXN0ZW5lciA9IHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFxuICAgICAgJ21vdXNlbW92ZScsXG4gICAgICB0aGlzLm9uR2xvYmFsTW91c2VNb3ZlLFxuICAgICk7XG4gICAgdGhpcy50b3VjaExpc3RlbmVyID0gd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgICAndG91Y2htb3ZlJyxcbiAgICAgIHRoaXMub25HbG9iYWxUb3VjaE1vdmUsXG4gICAgKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCB0aGlzLnRvdWNoTGlzdGVuZXIpO1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZW1vdmUnLCB0aGlzLm1vdXNlTGlzdGVuZXIpO1xuICAgIHRoaXMudGltZXIuc3RvcCgpO1xuICB9XG5cbiAgb25HbG9iYWxUb3VjaE1vdmUgPSAoZSkgPT4ge1xuICAgIGNvbnN0IHsgY2xpZW50WCwgY2xpZW50WSB9ID0gZ2V0KGUsICd0b3VjaGVzWzBdJyk7XG4gICAgaWYgKCFjbGllbnRYIHx8ICFjbGllbnRZKSByZXR1cm47XG4gICAgdGhpcy5jb29yZHMgPSBub3JtYWxpemVDdXJzb3JMb2NhdGlvbihbY2xpZW50WCwgY2xpZW50WV0pO1xuICB9O1xuXG4gIG9uR2xvYmFsTW91c2VNb3ZlID0gKHsgY2xpZW50WCwgY2xpZW50WSB9KSA9PiB7XG4gICAgdGhpcy5jb29yZHMgPSBub3JtYWxpemVDdXJzb3JMb2NhdGlvbihbY2xpZW50WCwgY2xpZW50WV0pO1xuICB9O1xuXG4gIGdldFBhdGhTdHJpbmcgPSAoKSA9PiB7fTtcblxuICByZW5kZXIoKSB7XG4gICAgY29uc3QgeyBzaXplIH0gPSB0aGlzLnN0YXRlO1xuICAgIHJldHVybiAoXG4gICAgICA8Q2FudmFzXG4gICAgICAgIGlkPVwiZ2xvYmVcIlxuICAgICAgICB3aWR0aD17YCR7c2l6ZX1gfVxuICAgICAgICBoZWlnaHQ9e2Ake3NpemV9YH1cbiAgICAgICAgdmlld0JveD17YDAgMCAke3NpemV9ICR7c2l6ZX1gfVxuICAgICAgLz5cbiAgICApO1xuICB9XG59XG4iXX0= */",
  toString: _EMOTION_STRINGIFIED_CSS_ERROR__
});

class Globe extends react__WEBPACK_IMPORTED_MODULE_1__["Component"] {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "coords", [0, 0]);

    _defineProperty(this, "rotationY", 0);

    _defineProperty(this, "state", {
      size: 0
    });

    _defineProperty(this, "onGlobalTouchMove", e => {
      const {
        clientX,
        clientY
      } = lodash_get__WEBPACK_IMPORTED_MODULE_2___default()(e, 'touches[0]');
      if (!clientX || !clientY) return;
      this.coords = normalizeCursorLocation([clientX, clientY]);
    });

    _defineProperty(this, "onGlobalMouseMove", ({
      clientX,
      clientY
    }) => {
      this.coords = normalizeCursorLocation([clientX, clientY]);
    });

    _defineProperty(this, "getPathString", () => {});
  }

  componentDidMount() {
    const size = Math.max(window.innerHeight, window.innerWidth) + 200;
    this.setState({
      size
    });
    this.translateX = size / 2;
    this.translateY = size / 2;
    this.rotationX = size;
    const svg = d3__WEBPACK_IMPORTED_MODULE_3__["select"]('#globe');
    const context = svg.node().getContext('2d');
    const projection = d3__WEBPACK_IMPORTED_MODULE_3__["geoOrthographic"]().fitSize([size, size], geojson).rotate([this.rotationX, this.rotationY]).clipAngle(180).translate([this.translateX, this.translateY]);
    const path = d3__WEBPACK_IMPORTED_MODULE_3__["geoPath"]().projection(projection).context(context);
    this.timer = d3__WEBPACK_IMPORTED_MODULE_3__["timer"](() => {
      const change = this.coords[0] >= 0 ? -0.02 : 0.02;
      this.rotationX += change;
      this.rotationY = bufferChange(this.coords[1], this.rotationY);
      this.translateX = bufferChange(size / 2 + this.coords[0], this.translateX);
      this.translateY = bufferChange(size / 2 + this.coords[1], this.translateY);
      projection.rotate([this.rotationX, this.rotationY]).translate([this.translateX, this.translateY]);
      context.clearRect(0, 0, size, size);
      context.beginPath();
      path(countries);
      context.fillStyle = '#111';
      context.fill();
      context.lineWidth = 0.5;
      context.strokeColor = '#000';
      context.stroke();
    });
    this.mouseListener = window.addEventListener('mousemove', this.onGlobalMouseMove);
    this.touchListener = window.addEventListener('touchmove', this.onGlobalTouchMove);
  }

  componentWillUnmount() {
    window.removeEventListener('touchmove', this.touchListener);
    window.removeEventListener('mousemove', this.mouseListener);
    this.timer.stop();
  }

  render() {
    const {
      size
    } = this.state;
    return Object(_emotion_core__WEBPACK_IMPORTED_MODULE_6__["jsx"])(Canvas, {
      id: "globe",
      width: `${size}`,
      height: `${size}`,
      viewBox: `0 0 ${size} ${size}`,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 114,
        columnNumber: 7
      }
    });
  }

}

/***/ }),

/***/ "./_pages/home/index.js":
/*!******************************!*\
  !*** ./_pages/home/index.js ***!
  \******************************/
/*! exports provided: Globe */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Globe__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Globe */ "./_pages/home/Globe.jsx");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Globe", function() { return _Globe__WEBPACK_IMPORTED_MODULE_0__["default"]; });



/***/ }),

/***/ "./_pages/home/ne110m_land.json":
/*!**************************************!*\
  !*** ./_pages/home/ne110m_land.json ***!
  \**************************************/
/*! exports provided: type, transform, objects, arcs, default */
/***/ (function(module) {

module.exports = JSON.parse("{\"type\":\"Topology\",\"transform\":{\"scale\":[0.0036000360003600037,0.0016925586033320111],\"translate\":[-180,-85.60903777459777]},\"objects\":{\"land\":{\"type\":\"MultiPolygon\",\"arcs\":[[[0]],[[1]],[[2]],[[3]],[[4]],[[5]],[[6]],[[7,8,9]],[[10,11]],[[12]],[[13]],[[14]],[[15]],[[16]],[[17]],[[18]],[[19]],[[20]],[[21]],[[22]],[[23]],[[24]],[[25]],[[26]],[[27]],[[28]],[[29,30]],[[31]],[[32]],[[33]],[[34]],[[35]],[[36]],[[37]],[[38]],[[39]],[[40]],[[41]],[[42,43]],[[44]],[[45]],[[46]],[[47,48,49,50]],[[51]],[[52]],[[53]],[[54]],[[55]],[[56]],[[57]],[[58]],[[59]],[[60]],[[61]],[[62,63]],[[64]],[[65]],[[66]],[[67]],[[68]],[[69]],[[70]],[[71]],[[72]],[[73]],[[74]],[[75]],[[76,77]],[[78]],[[79]],[[80]],[[81]],[[82]],[[83]],[[84]],[[85]],[[86]],[[87]],[[88]],[[89]],[[90,91]],[[92]],[[93]],[[94]],[[95]],[[96]],[[97]],[[98]],[[99]],[[100]],[[101]],[[102]],[[103]],[[104]],[[105]],[[106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127,128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143,144,145,146,147,148,149,150,151,152,153,154,155,156,157,158,159,160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175,176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191,192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218,219,220,221]],[[222,223]],[[224]],[[225]],[[226]],[[227]],[[228]],[[229]],[[230,231,232,233]],[[234]],[[235]],[[236]],[[237]],[[238]],[[239]],[[240]],[[241]],[[242,243,244,245,246,247,248,249,250,251,252,253,254,255,256,257,258,259,260,261,262,263,264,265,266,267,268,269,270,271,272,273,274,275,276,277,278,279,280,281,282,283,284,285,286,287,288,289,290,291,292,293,294,295,296,297,298,299,300,301,302,303,304,305,306,307,308,309,310,311,312,313,314,315,316,317,318,319,320,321,322,323,324,325,326,327,328,329,330,331,332,333,334,335,336,337,338,339,340,341,342,343,344,345,346,347,348,349,350,351,352,353,354,355,356,357,358,359,360,361,362,363,364,365,366,367,368,369,370,371,372,373,374,375,376,377,378,379,380,381,382,383,384,385,386,387,388,389,390,391,392,393,394,395,396,397,398,399,400,401,402,403,404,405,406,407,408,409,410,411,412,413,414,415,416,417,418,419,420,421,422,423,424,425,426,427,428,429,430,431,432,433,434,435,436,437,438,439,440,441,442,443,444,445,446,447,448,449,450,451,452,453,454,455,456,457,458,459,460,461,462,463,464,465,466,467,468,469,470,471,472,473,474,475,476,477],[478,479,480,481,482,483,484]],[[485]],[[486]],[[487]],[[488]],[[489]],[[490]],[[491]],[[492]],[[493]],[[494]],[[495]],[[496]],[[497]],[[498]]]},\"countries\":{\"type\":\"GeometryCollection\",\"geometries\":[{\"type\":\"Polygon\",\"arcs\":[[499,500,501,502,503,504]],\"id\":4},{\"type\":\"MultiPolygon\",\"arcs\":[[[505,506,352,507]],[[354,508,509]]],\"id\":24},{\"type\":\"Polygon\",\"arcs\":[[510,511,414,512,513,514]],\"id\":8},{\"type\":\"Polygon\",\"arcs\":[[312,515,314,516,517]],\"id\":784},{\"type\":\"MultiPolygon\",\"arcs\":[[[518,11]],[[519,520,521,166,522,168,523,524]]],\"id\":32},{\"type\":\"Polygon\",\"arcs\":[[525,526,527,528,529]],\"id\":51},{\"type\":\"MultiPolygon\",\"arcs\":[[[0]],[[1]],[[2]],[[3]],[[4]],[[5]],[[6]],[[530,531]]],\"id\":10},{\"type\":\"Polygon\",\"arcs\":[[13]],\"id\":260},{\"type\":\"MultiPolygon\",\"arcs\":[[[14]],[[24]]],\"id\":36},{\"type\":\"Polygon\",\"arcs\":[[532,533,534,535,536,537,538]],\"id\":40},{\"type\":\"MultiPolygon\",\"arcs\":[[[539,-528]],[[484,540,479,541,-526,542,543]]],\"id\":31},{\"type\":\"Polygon\",\"arcs\":[[544,545,546]],\"id\":108},{\"type\":\"Polygon\",\"arcs\":[[547,548,549,550,437]],\"id\":56},{\"type\":\"Polygon\",\"arcs\":[[551,552,553,554,366]],\"id\":204},{\"type\":\"Polygon\",\"arcs\":[[555,556,557,-553,558,559]],\"id\":854},{\"type\":\"Polygon\",\"arcs\":[[560,561,289,562]],\"id\":50},{\"type\":\"Polygon\",\"arcs\":[[563,404,564,565,566,567]],\"id\":100},{\"type\":\"MultiPolygon\",\"arcs\":[[[71]],[[73]],[[74]]],\"id\":44},{\"type\":\"Polygon\",\"arcs\":[[568,569,570]],\"id\":70},{\"type\":\"Polygon\",\"arcs\":[[571,572,573,574,575]],\"id\":112},{\"type\":\"Polygon\",\"arcs\":[[576,145,577]],\"id\":84},{\"type\":\"Polygon\",\"arcs\":[[578,579,580,581,-525]],\"id\":68},{\"type\":\"Polygon\",\"arcs\":[[-521,582,-581,583,584,585,586,587,588,164,589]],\"id\":76},{\"type\":\"Polygon\",\"arcs\":[[48,590]],\"id\":96},{\"type\":\"Polygon\",\"arcs\":[[591,592]],\"id\":64},{\"type\":\"Polygon\",\"arcs\":[[593,594,595,596]],\"id\":72},{\"type\":\"Polygon\",\"arcs\":[[597,598,599,600,601,602,603]],\"id\":140},{\"type\":\"MultiPolygon\",\"arcs\":[[[84]],[[85]],[[86]],[[87]],[[88]],[[96]],[[97]],[[99]],[[101]],[[103]],[[604,107,605,109,606,111,607,113,608,115,609,117,610,199,611,201,612,215,613,217,614,219,615,221]],[[616,223]],[[224]],[[225]],[[226]],[[227]],[[229]],[[230,617,232,618]],[[235]],[[237]],[[238]],[[240]],[[241]],[[485]],[[486]],[[488]],[[489]],[[490]],[[496]],[[497]]],\"id\":124},{\"type\":\"Polygon\",\"arcs\":[[-536,619,620,621]],\"id\":756},{\"type\":\"MultiPolygon\",\"arcs\":[[[-519,622,623,624]],[[-524,169,625,171,626,-579]]],\"id\":152},{\"type\":\"MultiPolygon\",\"arcs\":[[[64]],[[627,274,628,276,629,278,630,280,631,632,633,634,635,-593,636,637,638,639,-503,640,641,642,643,644,645]]],\"id\":156},{\"type\":\"Polygon\",\"arcs\":[[369,646,647,648,-556,649]],\"id\":384},{\"type\":\"Polygon\",\"arcs\":[[650,651,652,359,653,654,655,656,-604,657]],\"id\":120},{\"type\":\"Polygon\",\"arcs\":[[658,659,-545,660,661,662,663,-508,353,-510,664,-602,665]],\"id\":180},{\"type\":\"Polygon\",\"arcs\":[[-509,355,666,-658,-603,-665]],\"id\":178},{\"type\":\"Polygon\",\"arcs\":[[667,174,668,155,669,-585,670]],\"id\":170},{\"type\":\"Polygon\",\"arcs\":[[178,671,151,672]],\"id\":188},{\"type\":\"Polygon\",\"arcs\":[[70]],\"id\":192},{\"type\":\"Polygon\",\"arcs\":[[77,673]],\"id\":-99},{\"type\":\"Polygon\",\"arcs\":[[76,-674]],\"id\":196},{\"type\":\"Polygon\",\"arcs\":[[-538,674,675,676]],\"id\":203},{\"type\":\"Polygon\",\"arcs\":[[445,677,-675,-537,-622,678,679,-549,680,441,681]],\"id\":276},{\"type\":\"Polygon\",\"arcs\":[[337,682,683,684]],\"id\":262},{\"type\":\"MultiPolygon\",\"arcs\":[[[92]],[[-682,442,685,444]]],\"id\":208},{\"type\":\"Polygon\",\"arcs\":[[62,686]],\"id\":214},{\"type\":\"Polygon\",\"arcs\":[[687,688,689,690,691,384,692,693]],\"id\":12},{\"type\":\"Polygon\",\"arcs\":[[173,-668,694]],\"id\":218},{\"type\":\"Polygon\",\"arcs\":[[333,695,696,390,697]],\"id\":818},{\"type\":\"Polygon\",\"arcs\":[[698,699,700,336,-685]],\"id\":232},{\"type\":\"Polygon\",\"arcs\":[[431,701,433,702,427,703,429,704]],\"id\":724},{\"type\":\"Polygon\",\"arcs\":[[450,705,706]],\"id\":233},{\"type\":\"Polygon\",\"arcs\":[[-684,707,708,709,710,711,712,-699]],\"id\":231},{\"type\":\"Polygon\",\"arcs\":[[713,452,714,715,455,716,717]],\"id\":246},{\"type\":\"MultiPolygon\",\"arcs\":[[[18]],[[19]],[[20]]],\"id\":242},{\"type\":\"Polygon\",\"arcs\":[[12]],\"id\":238},{\"type\":\"MultiPolygon\",\"arcs\":[[[718,719,163,-589]],[[82]],[[720,-679,-621,721,426,-703,434,722,436,-551]]],\"id\":250},{\"type\":\"Polygon\",\"arcs\":[[356,723,-651,-667]],\"id\":266},{\"type\":\"MultiPolygon\",\"arcs\":[[[724,90]],[[725,726,727,728,729,730,731,732]]],\"id\":826},{\"type\":\"Polygon\",\"arcs\":[[400,733,-543,-530,734]],\"id\":268},{\"type\":\"Polygon\",\"arcs\":[[368,-650,-560,735]],\"id\":288},{\"type\":\"Polygon\",\"arcs\":[[736,737,374,738,739,740,-648]],\"id\":324},{\"type\":\"Polygon\",\"arcs\":[[741,377]],\"id\":270},{\"type\":\"Polygon\",\"arcs\":[[375,742,-739]],\"id\":624},{\"type\":\"Polygon\",\"arcs\":[[357,-652,-724]],\"id\":226},{\"type\":\"MultiPolygon\",\"arcs\":[[[78]],[[407,743,409,744,411,745,413,-512,746,-566,747]]],\"id\":300},{\"type\":\"Polygon\",\"arcs\":[[498]],\"id\":304},{\"type\":\"Polygon\",\"arcs\":[[185,748,-578,146,749,750]],\"id\":320},{\"type\":\"Polygon\",\"arcs\":[[161,751,-587,752]],\"id\":328},{\"type\":\"Polygon\",\"arcs\":[[182,753,754,-750,147,755,149,756]],\"id\":340},{\"type\":\"Polygon\",\"arcs\":[[757,-571,758,417,759,419,760,761]],\"id\":191},{\"type\":\"Polygon\",\"arcs\":[[-687,63]],\"id\":332},{\"type\":\"Polygon\",\"arcs\":[[-533,762,763,764,765,-762,766]],\"id\":348},{\"type\":\"MultiPolygon\",\"arcs\":[[[26]],[[767,30]],[[31]],[[32]],[[35]],[[36]],[[39]],[[40]],[[768,43]],[[44]],[[45]],[[769,50]],[[46]]],\"id\":360},{\"type\":\"Polygon\",\"arcs\":[[-639,770,-637,-592,-636,771,-563,290,772,292,773,294,774,296,775]],\"id\":356},{\"type\":\"Polygon\",\"arcs\":[[91,-725]],\"id\":372},{\"type\":\"Polygon\",\"arcs\":[[776,-505,777,300,778,302,779,780,781,-540,-527,-542,480]],\"id\":364},{\"type\":\"Polygon\",\"arcs\":[[782,783,784,785,786,-781,787]],\"id\":368},{\"type\":\"Polygon\",\"arcs\":[[100]],\"id\":352},{\"type\":\"Polygon\",\"arcs\":[[788,789,-698,391,790,791,792]],\"id\":376},{\"type\":\"MultiPolygon\",\"arcs\":[[[79]],[[80]],[[793,421,794,423,795,425,-722,-620,-535]]],\"id\":380},{\"type\":\"Polygon\",\"arcs\":[[61]],\"id\":388},{\"type\":\"Polygon\",\"arcs\":[[796,-785,797,332,-790,798,-793]],\"id\":400},{\"type\":\"MultiPolygon\",\"arcs\":[[[75]],[[81]],[[83]]],\"id\":392},{\"type\":\"Polygon\",\"arcs\":[[799,800,482,801,-643,802]],\"id\":398},{\"type\":\"Polygon\",\"arcs\":[[342,803,804,805,-710,806]],\"id\":404},{\"type\":\"Polygon\",\"arcs\":[[-803,-642,807,808]],\"id\":417},{\"type\":\"Polygon\",\"arcs\":[[809,810,811,283]],\"id\":116},{\"type\":\"Polygon\",\"arcs\":[[265,812,267,813]],\"id\":410},{\"type\":\"Polygon\",\"arcs\":[[-515,814,815,816]],\"id\":-99},{\"type\":\"Polygon\",\"arcs\":[[304,817,-783]],\"id\":414},{\"type\":\"Polygon\",\"arcs\":[[818,819,-634,820,-811]],\"id\":418},{\"type\":\"Polygon\",\"arcs\":[[-791,392,821]],\"id\":422},{\"type\":\"Polygon\",\"arcs\":[[370,822,372,823,-737,-647]],\"id\":430},{\"type\":\"Polygon\",\"arcs\":[[824,-694,825,388,826,-697,827,828]],\"id\":434},{\"type\":\"Polygon\",\"arcs\":[[52]],\"id\":144},{\"type\":\"Polygon\",\"arcs\":[[829]],\"id\":426},{\"type\":\"Polygon\",\"arcs\":[[830,448,831,-572,832]],\"id\":440},{\"type\":\"Polygon\",\"arcs\":[[-680,-721,-550]],\"id\":442},{\"type\":\"Polygon\",\"arcs\":[[449,-707,833,-573,-832]],\"id\":428},{\"type\":\"Polygon\",\"arcs\":[[-692,834,835,836,837,383]],\"id\":504},{\"type\":\"Polygon\",\"arcs\":[[838,839]],\"id\":498},{\"type\":\"Polygon\",\"arcs\":[[23]],\"id\":450},{\"type\":\"Polygon\",\"arcs\":[[840,-577,-749,186,841,188,842,190,843,192,844,194,845]],\"id\":484},{\"type\":\"Polygon\",\"arcs\":[[-817,846,-567,-747,-511]],\"id\":807},{\"type\":\"Polygon\",\"arcs\":[[847,-689,848,-557,-649,-741,849]],\"id\":466},{\"type\":\"Polygon\",\"arcs\":[[287,-561,-772,-635,-820,850]],\"id\":104},{\"type\":\"Polygon\",\"arcs\":[[416,-759,-570,851,-815,-514,852]],\"id\":499},{\"type\":\"Polygon\",\"arcs\":[[853,-645]],\"id\":496},{\"type\":\"Polygon\",\"arcs\":[[854,344,855,856,347,857,858,859,860,861,862]],\"id\":508},{\"type\":\"Polygon\",\"arcs\":[[863,379,864,-690,-848]],\"id\":478},{\"type\":\"Polygon\",\"arcs\":[[-863,865,866]],\"id\":454},{\"type\":\"MultiPolygon\",\"arcs\":[[[285,867]],[[-770,47,-591,49]]],\"id\":458},{\"type\":\"Polygon\",\"arcs\":[[351,-507,868,-595,869]],\"id\":516},{\"type\":\"Polygon\",\"arcs\":[[17]],\"id\":540},{\"type\":\"Polygon\",\"arcs\":[[-558,-849,-688,-825,870,-656,871,-554]],\"id\":562},{\"type\":\"Polygon\",\"arcs\":[[361,872,363,873,365,-555,-872,-655]],\"id\":566},{\"type\":\"Polygon\",\"arcs\":[[179,874,181,-757,150,-672]],\"id\":558},{\"type\":\"Polygon\",\"arcs\":[[-681,-548,438,875,440]],\"id\":528},{\"type\":\"MultiPolygon\",\"arcs\":[[[876,-718,877,457,878,459,879,461]],[[487]],[[492]],[[493]]],\"id\":578},{\"type\":\"Polygon\",\"arcs\":[[-771,-638]],\"id\":524},{\"type\":\"MultiPolygon\",\"arcs\":[[[15]],[[16]]],\"id\":554},{\"type\":\"MultiPolygon\",\"arcs\":[[[880,319,881,882,883,-517,315,884,317]],[[-516,313]]],\"id\":512},{\"type\":\"Polygon\",\"arcs\":[[-640,-776,297,885,299,-778,-504]],\"id\":586},{\"type\":\"Polygon\",\"arcs\":[[175,886,177,-673,152,887,154,-669]],\"id\":591},{\"type\":\"Polygon\",\"arcs\":[[-627,172,-695,-671,-584,-580]],\"id\":604},{\"type\":\"MultiPolygon\",\"arcs\":[[[51]],[[54]],[[55]],[[56]],[[57]],[[58]],[[59]]],\"id\":608},{\"type\":\"MultiPolygon\",\"arcs\":[[[37]],[[38]],[[-769,42]],[[41]]],\"id\":598},{\"type\":\"Polygon\",\"arcs\":[[-678,446,888,-833,-576,889,890,-676]],\"id\":616},{\"type\":\"Polygon\",\"arcs\":[[60]],\"id\":630},{\"type\":\"Polygon\",\"arcs\":[[262,891,264,-814,892,269,893,271,894,273,-628,895]],\"id\":408},{\"type\":\"Polygon\",\"arcs\":[[-705,430]],\"id\":620},{\"type\":\"Polygon\",\"arcs\":[[-582,-583,-520]],\"id\":600},{\"type\":\"Polygon\",\"arcs\":[[-799,-789]],\"id\":275},{\"type\":\"Polygon\",\"arcs\":[[308,896,310,897]],\"id\":634},{\"type\":\"Polygon\",\"arcs\":[[898,-840,899,403,-564,900,-765]],\"id\":642},{\"type\":\"MultiPolygon\",\"arcs\":[[[89]],[[-889,447,-831]],[[102]],[[104]],[[105]],[[228]],[[234]],[[236]],[[239]],[[901,243,902,245,903,247,904,249,905,251,906,253,907,255,908,257,909,259,910,261,-896,-646,-854,-644,-802,483,-544,-734,401,911,-574,-834,-706,451,-714,-877,912,913,914,915,464,916,466,917,468,918,470,919,920,473,921,475,922,477]],[[491]],[[494]],[[495]]],\"id\":643},{\"type\":\"Polygon\",\"arcs\":[[923,-546,-660,924]],\"id\":646},{\"type\":\"Polygon\",\"arcs\":[[-691,-865,380,-835]],\"id\":732},{\"type\":\"Polygon\",\"arcs\":[[925,329,926,331,-798,-784,-818,305,927,307,-898,311,-518,-884,928]],\"id\":682},{\"type\":\"Polygon\",\"arcs\":[[-599,929,-828,-696,334,-700,-713,930,931,932]],\"id\":729},{\"type\":\"Polygon\",\"arcs\":[[-711,-806,933,-666,-601,934,-932,935]],\"id\":728},{\"type\":\"Polygon\",\"arcs\":[[378,-864,-850,-740,-743,376,-742]],\"id\":686},{\"type\":\"MultiPolygon\",\"arcs\":[[[25]],[[27]],[[28]],[[33]],[[34]]],\"id\":90},{\"type\":\"Polygon\",\"arcs\":[[373,-738,-824]],\"id\":694},{\"type\":\"Polygon\",\"arcs\":[[184,-751,-755,936]],\"id\":222},{\"type\":\"Polygon\",\"arcs\":[[-708,-683,338,937,340,938]],\"id\":-99},{\"type\":\"Polygon\",\"arcs\":[[-807,-709,-939,341]],\"id\":706},{\"type\":\"Polygon\",\"arcs\":[[-568,-847,-816,-852,-569,-758,-766,-901]],\"id\":688},{\"type\":\"Polygon\",\"arcs\":[[162,-720,939,-588,-752]],\"id\":740},{\"type\":\"Polygon\",\"arcs\":[[-891,940,-763,-539,-677]],\"id\":703},{\"type\":\"Polygon\",\"arcs\":[[-534,-767,-761,420,-794]],\"id\":705},{\"type\":\"Polygon\",\"arcs\":[[-878,-717,456]],\"id\":752},{\"type\":\"Polygon\",\"arcs\":[[941,-859]],\"id\":748},{\"type\":\"Polygon\",\"arcs\":[[-797,-792,-822,393,942,-786]],\"id\":760},{\"type\":\"Polygon\",\"arcs\":[[-871,-829,-930,-598,-657]],\"id\":148},{\"type\":\"Polygon\",\"arcs\":[[-736,-559,-552,367]],\"id\":768},{\"type\":\"Polygon\",\"arcs\":[[284,-868,286,-851,-819,-810]],\"id\":764},{\"type\":\"Polygon\",\"arcs\":[[-808,-641,-502,943]],\"id\":762},{\"type\":\"Polygon\",\"arcs\":[[-777,481,-801,944,-500]],\"id\":795},{\"type\":\"Polygon\",\"arcs\":[[29,-768]],\"id\":626},{\"type\":\"Polygon\",\"arcs\":[[53]],\"id\":780},{\"type\":\"Polygon\",\"arcs\":[[-693,385,945,387,-826]],\"id\":788},{\"type\":\"MultiPolygon\",\"arcs\":[[[399,-735,-529,-782,-787,-943,394,946,947,397,948]],[[949,-748,-565,405]]],\"id\":792},{\"type\":\"Polygon\",\"arcs\":[[72]],\"id\":158},{\"type\":\"Polygon\",\"arcs\":[[-804,343,-855,-867,950,-663,951,-661,-547,-924,952]],\"id\":834},{\"type\":\"Polygon\",\"arcs\":[[-925,-659,-934,-805,-953]],\"id\":800},{\"type\":\"Polygon\",\"arcs\":[[-912,402,-900,-839,-899,-764,-941,-890,-575]],\"id\":804},{\"type\":\"Polygon\",\"arcs\":[[-590,165,-522]],\"id\":858},{\"type\":\"MultiPolygon\",\"arcs\":[[[65]],[[66]],[[67]],[[68]],[[69]],[[118,953,120,954,122,955,124,956,126,957,128,958,130,959,132,960,134,961,136,962,138,963,140,964,142,-846,195,965,966,967,968,969,-611]],[[93]],[[95]],[[98]],[[-613,202,970,204,971,206,972,208,973,210,974,212,975,214]]],\"id\":840},{\"type\":\"Polygon\",\"arcs\":[[-945,-800,-809,-944,-501]],\"id\":860},{\"type\":\"Polygon\",\"arcs\":[[156,976,158,977,160,-753,-586,-670]],\"id\":862},{\"type\":\"Polygon\",\"arcs\":[[282,-812,-821,-633]],\"id\":704},{\"type\":\"MultiPolygon\",\"arcs\":[[[21]],[[22]]],\"id\":548},{\"type\":\"Polygon\",\"arcs\":[[321,978,323,979,325,980,327,-929,-883,981]],\"id\":887},{\"type\":\"Polygon\",\"arcs\":[[982,350,-870,-594,983,-860,-942,-858,348],[-830]],\"id\":710},{\"type\":\"Polygon\",\"arcs\":[[-866,-862,984,-596,-869,-506,-664,-951]],\"id\":894},{\"type\":\"Polygon\",\"arcs\":[[-984,-597,-985,-861]],\"id\":716}]}},\"arcs\":[[[33289,2723],[-582,81],[-621,-35],[-348,197],[0,23],[-152,174],[625,-23],[599,-58],[207,243],[147,208],[288,-243],[-82,-301],[-81,-266]],[[5242,3530],[-364,208],[-163,209],[-11,35],[-180,162],[169,220],[517,-93],[277,-185],[212,-209],[76,-266],[-533,-81]],[[35977,2708],[-658,35],[-365,197],[49,243],[593,162],[239,197],[174,254],[126,220],[168,209],[180,243],[141,0],[414,127],[419,-127],[342,-255],[120,-359],[33,-254],[11,-301],[-430,-186],[-452,-150],[-522,-139],[-582,-116]],[[16602,6806],[-386,47],[-278,208],[60,197],[332,-104],[359,-93],[332,104],[-158,-208],[-261,-151]],[[15547,6934],[-164,23],[-359,58],[-381,162],[202,127],[277,-139],[425,-231]],[[23277,7733],[-217,46],[-337,-23],[-343,23],[-376,-35],[-283,116],[-146,243],[174,104],[353,-81],[403,-46],[305,-81],[304,69],[163,-335]],[[30256,7743],[-364,11],[136,232],[-327,-81],[-310,-81],[-212,174],[-16,243],[305,231],[190,70],[321,-23],[82,301],[16,219],[-6,475],[158,278],[256,93],[147,-220],[65,-220],[120,-267],[92,-254],[76,-267],[33,-266],[-49,-231],[-76,-220],[-326,-81],[-311,-116]],[[794,704],[78,49],[94,61],[81,52],[41,26]],[[1088,892],[41,-1],[29,-10]],[[1158,881],[402,-246],[352,246],[63,34],[816,104],[265,-138],[130,-71],[419,-196],[789,-151],[625,-185],[1072,-139],[800,162],[1181,-116],[669,-185],[734,174],[773,162],[60,278],[-1094,23],[-898,139],[-234,231],[-745,128],[49,266],[103,243],[104,220],[-55,243],[-462,162],[-212,209],[-430,185],[675,-35],[642,93],[402,-197],[495,173],[457,220],[223,197],[-98,243],[-359,162],[-408,174],[-571,35],[-500,81],[-539,58],[-180,220],[-359,185],[-217,208],[-87,672],[136,-58],[250,-185],[457,58],[441,81],[228,-255],[441,58],[370,127],[348,162],[315,197],[419,58],[-11,220],[-97,220],[81,208],[359,104],[163,-196],[425,115],[321,151],[397,12],[375,57],[376,139],[299,128],[337,127],[218,-35],[190,-46],[414,81],[370,-104],[381,11],[364,81],[375,-57],[414,-58],[386,23],[403,-12],[413,-11],[381,23],[283,174],[337,92],[349,-127],[331,104],[300,208],[179,-185],[98,-208],[180,-197],[288,174],[332,-220],[375,-70],[321,-162],[392,35],[354,104],[418,-23],[376,-81],[381,-104],[147,254],[-180,197],[-136,209],[-359,46],[-158,220],[-60,220],[-98,440],[213,-81],[364,-35],[359,35],[327,-93],[283,-174],[119,-208],[376,-35],[359,81],[381,116],[342,70],[283,-139],[370,46],[239,451],[224,-266],[321,-104],[348,58],[228,-232],[365,-23],[337,-69],[332,-128],[218,220],[108,209],[278,-232],[381,58],[283,-127],[190,-197],[370,58],[288,127],[283,151],[337,81],[392,69],[354,81],[272,127],[163,186],[65,254],[-32,244],[-87,231],[-98,232],[-87,231],[-71,209],[-16,231],[27,232],[130,220],[109,243],[44,231],[-55,255],[-32,232],[136,266],[152,173],[180,220],[190,186],[223,173],[109,255],[152,162],[174,151],[267,34],[174,186],[196,115],[228,70],[202,150],[157,186],[218,69],[163,-151],[-103,-196],[-283,-174],[-120,-127],[-206,92],[-229,-58],[-190,-139],[-202,-150],[-136,-174],[-38,-231],[17,-220],[130,-197],[-190,-139],[-261,-46],[-153,-197],[-163,-185],[-174,-255],[-44,-220],[98,-243],[147,-185],[229,-139],[212,-185],[114,-232],[60,-220],[82,-232],[130,-196],[82,-220],[38,-544],[81,-220],[22,-232],[87,-231],[-38,-313],[-152,-243],[-163,-197],[-370,-81],[-125,-208],[-169,-197],[-419,-220],[-370,-93],[-348,-127],[-376,-128],[-223,-243],[-446,-23],[-489,23],[-441,-46],[-468,0],[87,-232],[424,-104],[311,-162],[174,-208],[-310,-185],[-479,58],[-397,-151],[-17,-243],[-11,-232],[327,-196],[60,-220],[353,-220],[588,-93],[500,-162],[398,-185],[506,-186],[690,-92],[681,-162],[473,-174],[517,-197],[272,-278],[136,-220],[337,209],[457,173],[484,186],[577,150],[495,162],[691,12],[680,-81],[560,-139],[180,255],[386,173],[702,12],[550,127],[522,128],[577,81],[614,104],[430,150],[-196,209],[-119,208],[0,220],[-539,-23],[-571,-93],[-544,0],[-77,220],[39,440],[125,128],[397,138],[468,139],[337,174],[337,174],[251,231],[380,104],[376,81],[190,47],[430,23],[408,81],[343,116],[337,139],[305,139],[386,185],[245,197],[261,173],[82,232],[-294,139],[98,243],[185,185],[288,116],[305,139],[283,185],[217,232],[136,277],[202,163],[331,-35],[136,-197],[332,-23],[11,220],[142,231],[299,-58],[71,-220],[331,-34],[360,104],[348,69],[315,-34],[120,-243],[305,196],[283,105],[315,81],[310,81],[283,139],[310,92],[240,128],[168,208],[207,-151],[288,81],[202,-277],[157,-209],[316,116],[125,232],[283,162],[365,-35],[108,-220],[229,220],[299,69],[326,23],[294,-11],[310,-70],[300,-34],[130,-197],[180,-174],[304,104],[327,24],[315,0],[310,11],[278,81],[294,70],[245,162],[261,104],[283,58],[212,162],[152,324],[158,197],[288,-93],[109,-208],[239,-139],[289,46],[196,-208],[206,-151],[283,139],[98,255],[250,104],[289,197],[272,81],[326,116],[218,127],[228,139],[218,127],[261,-69],[250,208],[180,162],[261,-11],[229,139],[54,208],[234,162],[228,116],[278,93],[256,46],[244,-35],[262,-58],[223,-162],[27,-254],[245,-197],[168,-162],[332,-70],[185,-162],[229,-162],[266,-35],[223,116],[240,243],[261,-127],[272,-70],[261,-69],[272,-46],[277,0],[229,-614],[-11,-150],[-33,-267],[-266,-150],[-218,-220],[38,-232],[310,12],[-38,-232],[-141,-220],[-131,-243],[212,-185],[321,-58],[321,104],[153,232],[92,220],[153,185],[174,174],[70,208],[147,289],[174,58],[316,24],[277,69],[283,93],[136,231],[82,220],[190,220],[272,151],[234,115],[153,197],[157,104],[202,93],[277,-58],[250,58],[272,69],[305,-34],[201,162],[142,393],[103,-162],[131,-278],[234,-115],[266,-47],[267,70],[283,-46],[261,-12],[174,58],[234,-35],[212,-127],[250,81],[300,0],[255,81],[289,-81],[185,197],[141,196],[191,163],[348,439],[179,-81],[212,-162],[185,-208],[354,-359],[272,-12],[256,0],[299,70],[299,81],[229,162],[190,174],[310,23],[207,127],[218,-116],[141,-185],[196,-185],[305,23],[190,-150],[332,-151],[348,-58],[288,47],[218,185],[185,185],[250,46],[251,-81],[288,-58],[261,93],[250,0],[245,-58],[256,-58],[250,104],[299,93],[283,23],[316,0],[255,58],[251,46],[76,290],[11,243],[174,-162],[49,-266],[92,-244],[115,-196],[234,-105],[315,35],[365,12],[250,35],[364,0],[262,11],[364,-23],[310,-46],[196,-186],[-54,-220],[179,-173],[299,-139],[310,-151],[360,-104],[375,-92],[283,-93],[315,-12],[180,197],[245,-162],[212,-185],[245,-139],[337,-58],[321,-69],[136,-232],[316,-139],[212,-208],[310,-93],[321,12],[299,-35],[332,12],[332,-47],[310,-81],[288,-139],[289,-116],[195,-173],[-32,-232],[-147,-208],[-125,-266],[-98,-209],[-131,-243],[-364,-93],[-163,-208],[-360,-127],[-125,-232],[-190,-220],[-201,-185],[-115,-243],[-70,-220],[-28,-266],[6,-220],[158,-232],[60,-220],[130,-208],[517,-81],[109,-255],[-501,-93],[-424,-127],[-528,-23],[-234,-336],[-49,-278],[-119,-220],[-147,-220],[370,-196],[141,-244],[239,-219],[338,-197],[386,-186],[419,-185],[636,-185],[142,-289],[800,-128],[53,-45],[208,-175],[767,151],[636,-186],[-99504,-147],[245,344],[501,-185],[32,21]],[[31400,18145],[-92,-239],[-238,-183],[-301,67],[-202,177],[-291,86],[-350,330],[-283,317],[-383,662],[229,-124],[390,-395],[369,-212],[143,271],[90,405],[256,244],[198,-70]],[[30935,19481],[106,-274],[139,-443],[361,-355],[389,-147],[-125,-296],[-264,-29],[-141,208]],[[33139,19680],[-139,266],[333,354],[236,-148],[167,237],[222,-266],[-83,-207],[-375,-177],[-125,207],[-236,-266]],[[69095,21172],[-7,314],[41,244],[19,121],[179,-186],[263,-74],[9,-112],[-77,-269],[-427,-38]],[[90796,24799],[-57,32],[-171,19],[-171,505],[-38,390],[-160,515],[7,271],[181,-52],[269,-204],[151,81],[217,113],[166,-39],[20,-702],[-95,-203],[-29,-476],[-97,162],[-193,-412]],[[97036,23023],[-256,13],[-180,194],[-302,42],[-46,217],[149,438],[349,583],[179,111],[200,225],[238,310],[167,306],[123,441],[106,149],[41,330],[195,273],[61,-251],[63,-244],[198,239],[80,-249],[0,-249],[-103,-274],[-182,-435],[-142,-238],[103,-284],[-214,-7],[-238,-223],[-75,-387],[-157,-597],[-219,-264],[-138,-169]],[[98677,25949],[-48,155],[-116,85],[160,486],[-91,326],[-299,236],[8,214],[201,206],[47,455],[-13,382],[-113,396],[8,104],[-133,244],[-218,523],[-117,418],[104,46],[151,-328],[216,-153],[78,-526],[202,-622],[5,403],[126,-161],[41,-447],[224,-192],[188,-48],[158,226],[141,-69],[-67,-524],[-85,-345],[-212,12],[-74,-179],[26,-254],[-41,-110],[-105,-319],[-138,-404],[-214,-236]],[[96316,37345],[-153,160],[-199,266],[-179,313],[-184,416],[-38,201],[119,-9],[156,-201],[122,-200],[89,-166],[228,-366],[144,-272],[-105,-142]],[[99425,39775],[-153,73],[-27,260],[107,203],[126,-74],[69,98],[96,-171],[-46,-308],[-172,-81]],[[99645,40529],[-36,220],[139,121],[88,33],[163,184],[0,-289],[-177,-145],[-177,-124]],[[0,40798],[0,289],[57,27],[-34,-284],[-23,-32]],[[96531,40773],[-93,259],[10,158],[175,-339],[-92,-78]],[[96463,41280],[-75,74],[-58,-32],[-39,163],[-6,453],[133,-182],[45,-476]],[[62613,35454],[-160,151],[-220,211],[-77,312],[-18,524],[-98,471],[-26,425],[50,426],[128,102],[1,197],[133,447],[25,377],[-65,280],[-52,372],[-23,544],[97,331],[38,375],[138,22],[155,121],[103,107],[122,7],[158,337],[229,364],[83,297],[-38,253],[118,-71],[153,410],[6,356],[92,264],[96,-254],[74,-251],[69,-390],[45,-711],[72,-276],[-28,-284],[-49,-174],[-94,347],[-53,-175],[53,-438],[-24,-250],[-77,-137],[-18,-500],[-109,-689],[-137,-814],[-172,-1120],[-106,-821],[-125,-685],[-226,-140],[-243,-250]],[[90643,27516],[-230,262],[-170,104],[43,308],[-152,-112],[-243,-428],[-240,160],[-158,94],[-159,42],[-269,171],[-179,364],[-52,449],[-64,298],[-137,240],[-267,71],[91,287],[-67,438],[-136,-408],[-247,-109],[146,327],[42,341],[107,289],[-22,438],[-226,-504],[-174,-202],[-106,-470],[-217,243],[9,313],[-174,429],[-147,221],[52,137],[-356,358],[-195,17],[-267,287],[-498,-56],[-359,-211],[-317,-197],[-265,39],[-294,-303],[-241,-137],[-53,-309],[-103,-240],[-236,-15],[-174,-52],[-246,107],[-199,-64],[-191,-27],[-165,-315],[-81,26],[-140,-167],[-133,-187],[-203,23],[-186,0],[-295,377],[-149,113],[6,338],[138,81],[47,134],[-10,212],[34,411],[-31,350],[-147,598],[-45,337],[12,336],[-111,385],[-7,174],[-123,235],[-35,463],[-158,467],[-39,252],[122,-255],[-93,548],[137,-171],[83,-229],[-5,303],[-138,465],[-26,186],[-65,177],[31,341],[56,146],[38,295],[-29,346],[114,425],[21,-450],[118,406],[225,198],[136,252],[212,217],[126,46],[77,-73],[219,220],[168,66],[42,129],[74,54],[153,-14],[292,173],[151,262],[71,316],[163,300],[13,236],[7,321],[194,502],[117,-510],[119,118],[-99,279],[87,287],[122,-128],[34,449],[152,291],[67,233],[140,101],[4,165],[122,-69],[5,148],[122,85],[134,80],[205,-271],[155,-350],[173,-4],[177,-56],[-59,325],[133,473],[126,155],[-44,147],[121,338],[168,208],[142,-70],[234,111],[-5,302],[-204,195],[148,86],[184,-147],[148,-242],[234,-151],[79,60],[172,-182],[162,169],[105,-51],[65,113],[127,-292],[-74,-316],[-105,-239],[-96,-20],[32,-236],[-81,-295],[-99,-291],[20,-166],[221,-327],[214,-189],[143,-204],[201,-350],[78,1],[145,-151],[43,-183],[265,-200],[183,202],[55,317],[56,262],[34,324],[85,470],[-39,286],[20,171],[-32,339],[37,445],[53,120],[-43,197],[67,313],[52,325],[7,168],[104,222],[78,-289],[19,-371],[70,-71],[11,-249],[101,-300],[21,-335],[-10,-214],[100,-464],[179,223],[92,-250],[133,-231],[-29,-262],[60,-506],[42,-295],[70,-72],[75,-505],[-27,-307],[90,-400],[301,-309],[197,-281],[186,-257],[-37,-143],[159,-371],[108,-639],[111,130],[113,-256],[68,91],[48,-626],[197,-363],[129,-226],[217,-478],[78,-475],[7,-337],[-19,-365],[132,-502],[-16,-523],[-48,-274],[-75,-527],[6,-339],[-55,-423],[-123,-538],[-205,-290],[-102,-458],[-93,-292],[-82,-510],[-107,-294],[-70,-442],[-36,-407],[14,-187],[-159,-205],[-311,-22],[-257,-242],[-127,-229],[-168,-254]],[[95110,44183],[-194,4],[-106,363],[166,-142],[56,-22],[78,-203]],[[83414,44519],[-368,414],[259,116],[146,-180],[97,-180],[-17,-159],[-117,-11]],[[94572,44733],[-170,60],[-58,91],[17,235],[183,-93],[91,-124],[45,-155],[-108,-14]],[[94868,44799],[-206,512],[-57,353],[94,0],[100,-473],[111,-283],[-42,-109]],[[84713,45326],[32,139],[239,133],[194,20],[87,74],[105,-74],[-102,-160],[-289,-258],[-233,-170]],[[84746,45030],[-181,-441],[-238,-130],[-33,71],[25,201],[119,360],[275,235]],[[82576,45238],[-149,5],[95,340],[153,5],[74,209],[100,-158],[172,48],[69,-251],[-321,-119],[-193,-79]],[[83681,45301],[-370,73],[0,216],[220,123],[174,-177],[185,45],[249,216],[-41,-328],[-417,-168]],[[94421,45535],[-218,251],[-152,212],[-104,197],[41,60],[128,-142],[228,-272],[65,-187],[12,-119]],[[93704,46205],[-121,134],[-114,243],[14,99],[166,-250],[111,-193],[-56,-33]],[[81823,45409],[-306,238],[-251,-16],[-288,44],[-260,106],[-322,225],[-204,59],[-116,-74],[-506,243],[-48,254],[-255,44],[191,564],[337,-35],[224,-231],[115,-45],[38,-210],[533,-59],[61,244],[515,-284],[101,-383],[417,-108],[341,-351],[-317,-225]],[[87280,46506],[-27,445],[49,212],[58,200],[63,-173],[0,-282],[-143,-402]],[[93221,46491],[-120,227],[-122,375],[-59,450],[38,57],[30,-175],[84,-134],[135,-375],[131,-200],[-39,-166],[-78,-59]],[[91733,46847],[-148,1],[-228,171],[-158,165],[23,183],[249,-86],[152,46],[42,283],[40,15],[27,-314],[158,45],[78,202],[155,211],[-30,348],[166,11],[56,-97],[-5,-327],[-93,-361],[-146,-48],[-44,-166],[-152,-144],[-142,-138]],[[85242,48340],[-192,108],[-54,254],[281,29],[69,-195],[-104,-196]],[[86342,48300],[-234,244],[-232,49],[-157,-39],[-192,21],[65,325],[344,24],[305,-172],[101,-452]],[[92451,47764],[-52,348],[-65,229],[-126,193],[-158,252],[-200,174],[77,143],[150,-166],[94,-130],[117,-142],[111,-248],[106,-189],[33,-307],[-87,-157]],[[89166,49043],[482,-407],[513,-338],[192,-302],[154,-297],[43,-349],[462,-365],[68,-313],[-256,-64],[62,-393],[248,-388],[180,-627],[159,20],[-11,-262],[215,-100],[-84,-111],[295,-249],[-30,-171],[-184,-41],[-69,153],[-238,66],[-281,89],[-216,377],[-158,325],[-144,517],[-362,259],[-235,-169],[-170,-195],[35,-436],[-218,-203],[-155,99],[-288,25]],[[89175,45193],[-247,485],[-282,118],[-69,-168],[-352,-18],[118,481],[175,164],[-72,642],[-134,496],[-538,500],[-229,50],[-417,546],[-82,-287],[-107,-52],[-63,216],[-1,257],[-212,290],[299,213],[198,-11],[-23,156],[-407,1],[-110,352],[-248,109],[-117,293],[374,143],[142,192],[446,-242],[44,-220],[78,-955],[287,-354],[232,627],[319,356],[247,1],[238,-206],[206,-212],[298,-113]],[[83276,47228],[-119,173],[79,544],[-43,570],[-117,4],[-86,405],[115,387],[40,469],[139,891],[58,243],[237,439],[217,-174],[350,-82],[319,25],[275,429],[48,-132],[-223,-587],[-209,-113],[-267,115],[-463,-29],[-243,-85],[-39,-447],[248,-526],[150,268],[518,201],[-22,-272],[-121,86],[-121,-347],[-245,-229],[263,-757],[-50,-203],[249,-682],[-2,-388],[-148,-173],[-109,207],[134,484],[-273,-229],[-69,164],[36,228],[-200,346],[21,576],[-186,-179],[24,-689],[11,-846],[-176,-85]],[[85582,50048],[-112,374],[-82,755],[56,472],[92,215],[20,-322],[164,-52],[26,-241],[-15,-517],[-143,58],[-42,-359],[114,-312],[-78,-71]],[[79085,47110],[-234,494],[-356,482],[-119,358],[-210,481],[-138,443],[-212,827],[-244,493],[-81,508],[-103,461],[-250,372],[-145,506],[-209,330],[-290,652],[-24,300],[178,-24],[430,-114],[246,-577],[215,-401],[153,-246],[263,-635],[283,-9],[233,-405],[161,-495],[211,-270],[-111,-482],[159,-205],[100,-15],[47,-412],[97,-330],[204,-52],[135,-374],[-70,-735],[-11,-914],[-308,-12]],[[80461,51765],[204,-202],[214,110],[56,500],[119,112],[333,128],[199,467],[137,374]],[[81723,53254],[110,221],[236,323]],[[82069,53798],[214,411],[140,462],[112,2],[143,-299],[13,-257],[183,-165],[231,-177],[-20,-232],[-186,-29],[50,-289],[-205,-201]],[[82744,53024],[-158,-533],[204,-560],[-48,-272],[312,-546],[-329,-70],[-93,-403],[12,-535],[-267,-404],[-7,-589],[-107,-903],[-41,210],[-316,-266],[-110,361],[-198,34],[-139,189],[-330,-212],[-101,285],[-182,-32],[-229,68],[-43,793],[-138,164],[-134,505],[-38,517],[32,548],[165,392]],[[84832,53877],[-327,343],[-78,428],[84,280],[-176,280],[-87,-245],[-131,23],[-205,-330],[-46,173],[109,498],[175,166],[151,223],[98,-268],[212,162],[45,264],[196,15],[-16,457],[225,-280],[23,-297],[20,-218],[28,-392],[16,-332],[-94,-540],[-102,602],[-130,-300],[89,-435],[-79,-277]],[[72318,54106],[-132,470],[-49,849],[126,959],[192,-328],[129,-416],[134,-616],[-42,-615],[-116,-168],[-242,-135]],[[32841,56488],[-50,53],[81,163],[-6,233],[160,77],[58,-21],[-11,-440],[-232,-65]],[[84165,55910],[-171,409],[57,158],[70,165],[30,367],[153,35],[-44,-398],[205,570],[-26,-563],[-100,-195],[-87,-373],[-87,-175]],[[82548,55523],[136,414],[200,364],[167,409],[146,587],[49,-482],[-183,-325],[-146,-406],[-369,-561]],[[83889,56748],[-10,275],[20,301],[-43,282],[166,-183],[177,1],[-5,-247],[-129,-251],[-176,-178]],[[84666,56567],[-11,416],[-84,31],[-43,357],[163,-47],[-4,224],[-169,451],[266,-13],[77,-220],[78,-660],[-214,157],[5,-199],[68,-364],[-132,-133]],[[83683,57791],[-119,295],[-142,450],[238,-22],[97,-213],[-74,-510]],[[84465,57987],[-216,290],[-103,310],[-71,-217],[-177,354],[-253,-87],[-138,130],[14,244],[87,151],[-83,136],[-36,-213],[-137,340],[-41,257],[-11,566],[112,-195],[29,925],[90,535],[169,-1],[171,-168],[85,153],[26,-150],[-46,-245],[95,-423],[-73,-491],[-164,-196],[-43,-476],[62,-471],[147,-65],[123,70],[347,-328],[-27,-321],[91,-142],[-29,-272]],[[31337,61183],[-16,253],[40,86],[227,-3],[142,-52],[50,-118],[-71,-149],[-209,4],[-163,-21]],[[28554,61038],[-156,95],[-159,215],[34,135],[116,41],[64,-20],[187,-53],[147,-142],[46,-161],[-195,-11],[-84,-99]],[[30080,62227],[34,101],[217,-3],[165,-152],[73,15],[50,-209],[152,11],[-9,-176],[124,-21],[136,-217],[-103,-240],[-132,128],[-127,-25],[-92,28],[-50,-107],[-106,-37],[-43,144],[-92,-85],[-111,-405],[-71,94],[-14,170]],[[30081,61241],[-185,100],[-131,-41],[-169,43],[-130,-110],[-149,184],[24,190],[256,-82],[210,-47],[100,131],[-127,256],[2,226],[-175,92],[62,163],[170,-26],[241,-93]],[[80409,61331],[-228,183],[-8,509],[137,267],[304,166],[159,-14],[62,-226],[-122,-260],[-64,-341],[-240,-284]],[[6753,61756],[-69,84],[8,165],[-46,216],[14,65],[48,97],[-19,116],[16,55],[21,-11],[107,-100],[49,-51],[45,-79],[71,-207],[-7,-33],[-108,-126],[-89,-92],[-41,-99]],[[6551,62734],[-47,125],[-32,48],[-3,37],[27,50],[99,-56],[73,-90],[-23,-71],[-94,-43]],[[6447,63028],[-149,17],[21,72],[137,-26],[-9,-63]],[[6192,63143],[-19,8],[-97,21],[-35,133],[-11,24],[74,82],[23,-38],[80,-196],[-15,-34]],[[5704,63509],[-93,107],[14,43],[43,58],[64,-12],[5,-138],[-33,-58]],[[28401,62311],[186,329],[-113,154],[-179,39],[-96,171],[-66,336],[-157,-23],[-259,159],[-83,124],[-362,91],[-97,115],[104,148],[-273,30],[-199,-307],[-115,-8],[-40,-144],[-138,-65],[-118,56],[146,183],[60,213],[126,131],[142,116],[210,56],[67,65],[240,-42],[219,-7],[261,-201],[110,-216],[260,66],[98,-138],[235,-366],[173,-267],[92,8],[165,-120],[-20,-167],[205,-24],[210,-242],[-33,-138],[-185,-75],[-187,-29],[-191,46],[-398,-57]],[[28394,64588],[-70,340],[-104,171],[60,375],[84,-23],[97,-491],[1,-343],[-68,-29]],[[83540,63560],[-146,499],[-32,438],[163,581],[223,447],[127,-176],[-49,-357],[-167,-947],[-119,-485]],[[28080,66189],[-19,219],[130,47],[184,-18],[8,-153],[-303,-95]],[[28563,65870],[-51,75],[4,309],[-124,234],[-1,67],[220,-265],[-48,-420]],[[86948,69902],[-181,168],[2,281],[154,352],[158,-68],[114,248],[204,-127],[35,-203],[-156,-357],[-114,189],[-143,-137],[-73,-346]],[[59437,71293],[8,-48],[-285,-240],[-136,77],[-64,237],[132,22]],[[59092,71341],[19,3],[40,143],[200,-8],[253,176],[-188,-251],[21,-111]],[[56867,71211],[3,98],[-339,115],[52,251],[152,-199],[216,34],[207,-42],[-7,-103],[151,71],[-35,-175],[-400,-50]],[[54194,72216],[-213,222],[-141,64],[-387,300],[38,304],[325,-54],[284,64],[211,51],[-100,-465],[41,-183],[-58,-303]],[[52446,73567],[-105,156],[-11,713],[-64,338],[153,-30],[139,183],[166,-419],[-39,-782],[-126,38],[-113,-197]],[[86301,68913],[-135,229],[69,533],[-176,172],[-113,405],[263,182],[145,371],[280,306],[203,403],[553,177],[297,-121],[291,1050],[185,-282],[408,591],[158,229],[174,723],[-47,664],[117,374],[295,108],[152,-819],[-9,-479],[-256,-595],[4,-610],[-104,-472],[48,-296],[-145,-416],[-355,-278],[-488,-36],[-396,-675],[-186,227],[-12,442],[-483,-130],[-329,-279],[-325,-11],[282,-435],[-186,-1004],[-179,-248]],[[52563,75028],[-126,120],[-64,398],[56,219],[179,226],[47,-507],[-92,-456]],[[88876,75140],[-39,587],[138,455],[296,33],[81,817],[83,460],[326,-615],[213,-198],[195,-126],[197,250],[62,-663],[-412,-162],[-244,-587],[-436,404],[-152,-646],[-308,-9]],[[32535,77739],[-353,250],[-69,198],[105,183],[97,-288],[202,-79],[257,16],[-137,-242],[-102,-38]],[[32696,79581],[-360,186],[-258,279],[96,49],[365,-148],[284,-247],[8,-108],[-135,-11]],[[15552,79158],[-456,269],[-84,209],[-248,207],[-50,168],[-286,107],[-107,321],[24,137],[291,-129],[171,-89],[261,-63],[94,-204],[138,-280],[277,-244],[115,-327],[-140,-82]],[[35133,78123],[-183,111],[60,484],[-77,75],[-322,-513],[-166,21],[196,277],[-267,144],[-298,-35],[-539,18],[-43,175],[173,208],[-121,160],[234,356],[287,941],[172,336],[241,204],[129,-26],[-54,-160],[-148,-372],[-184,-517],[181,199],[187,-126],[-98,-206],[247,-162],[128,144],[277,-182],[-86,-433],[194,101],[36,-313],[86,-367],[-117,-520],[-125,-22]],[[13561,81409],[-111,1],[-167,270],[-103,272],[-140,184],[-51,260],[16,188],[131,-76],[267,47],[-84,-671],[242,-475]],[[89469,77738],[-51,496],[31,575],[-32,638],[64,446],[13,790],[-163,581],[24,808],[257,271],[-110,274],[123,83],[73,-391],[96,-569],[-7,-581],[114,-597],[280,-1046],[-411,195],[-171,-854],[271,-605],[-8,-413],[-211,356],[-182,-457]],[[47896,83153],[233,24],[298,-365],[-149,-406]],[[48278,82406],[46,-422],[-210,-528],[-493,-349],[-393,89],[225,617],[-145,601],[378,463],[210,276]],[[53358,82957],[-291,333],[-39,246],[408,195],[88,-296],[-166,-478]],[[7221,84100],[-142,152],[-43,277],[252,210],[148,90],[185,-40],[117,-183],[-240,-281],[-277,-225]],[[48543,80097],[-148,118],[407,621],[249,127],[-436,99],[-79,235],[291,183],[-152,319],[52,387],[414,-54],[40,343],[-190,372],[-337,104],[-66,160],[101,264],[-92,163],[-149,-279],[-17,569],[-140,301],[101,611],[216,480],[222,-47],[335,49],[-297,-639],[283,81],[304,-3],[-72,-481],[-250,-530],[287,-38],[270,-759],[190,-95],[171,-673],[79,-233],[337,-113],[-34,-378],[-142,-173],[111,-305],[-250,-310],[-371,6],[-473,-163],[-130,116],[-183,-276],[-257,67],[-195,-226]],[[3835,85884],[-182,110],[-168,161],[274,101],[220,-54],[27,-226],[-171,-92]],[[27873,86994],[-123,50],[-73,176],[13,41],[107,177],[114,-13],[70,-121],[-108,-310]],[[26925,87305],[-196,13],[-61,160],[207,273],[381,-6],[-6,-114],[-325,-326]],[[2908,87788],[-211,128],[-106,107],[-245,-34],[-66,52],[17,223],[171,-113],[173,61],[225,-156],[276,-79],[-23,-64],[-211,-125]],[[26243,87832],[-95,346],[-377,-57],[242,292],[35,465],[95,542],[201,-49],[51,-259],[143,91],[161,-155],[304,-203],[318,-184],[25,-281],[204,46],[199,-196],[-247,-186],[-432,142],[-156,266],[-275,-314],[-396,-306]],[[44817,88095],[-365,87],[-775,187],[273,261],[-605,289],[492,114],[-12,174],[-583,137],[188,385],[421,87],[433,-400],[422,321],[349,-167],[453,315],[461,-42],[-64,-382],[314,-403],[-361,-451],[-801,-405],[-240,-107]],[[28614,90223],[-69,289],[118,331],[255,82],[217,-163],[3,-253],[-32,-82],[-180,-174],[-312,-30]],[[1957,88542],[-260,17],[-212,206],[-369,172],[-62,257],[-283,96],[-315,-76],[-151,207],[60,219],[-333,-140],[126,-278],[-158,-251],[0,2354],[681,-451],[728,-588],[-24,-367],[187,-147],[-64,429],[754,-88],[544,-553],[-276,-257],[-455,-61],[-7,-578],[-111,-122]],[[23258,91203],[-374,179],[-226,-65],[-380,266],[245,183],[194,256],[295,-168],[166,-106],[84,-112],[169,-226],[-173,-207]],[[99694,92399],[-49,187],[354,247],[0,-404],[-305,-30]],[[0,92429],[0,404],[36,24],[235,-1],[402,-169],[-24,-81],[-286,-141],[-363,-36]],[[26228,91219],[16,648],[394,-45]],[[26638,91822],[411,-87],[373,-293],[17,-293],[-207,-315],[196,-316],[-36,-288],[-544,-413],[-386,-91],[-287,178],[-83,-297],[-268,-498]],[[25824,89109],[-81,-258],[-322,-400]],[[25421,88451],[-397,-39],[-220,-250],[-18,-384],[-323,-74],[-340,-479],[-301,-665],[-108,-466]],[[23714,86094],[-15,-686],[408,-99]],[[24107,85309],[125,-553],[130,-448],[388,117],[517,-256],[277,-225],[199,-279]],[[25743,83665],[348,-162],[294,-249]],[[26385,83254],[459,-34],[302,-58],[-45,-511],[86,-594],[201,-661],[414,-561],[214,192],[150,607],[-145,934],[-196,311],[445,276],[314,415],[154,411]],[[28738,83981],[-22,395],[-189,502]],[[28527,84878],[-338,445],[328,619],[-121,535],[-93,922],[194,137],[476,-161],[286,-57],[230,155],[258,-200],[342,-343],[85,-229],[495,-45],[-8,-496],[92,-747],[254,-92],[201,-348],[402,328],[266,652],[184,274],[216,-527],[362,-754],[307,-709],[-112,-371],[370,-333],[250,-338],[442,-152],[179,-189],[110,-500],[216,-78],[112,-223],[20,-664],[-202,-222],[-199,-207],[-458,-210],[-349,-486],[-470,-96],[-594,125],[-417,4],[-287,-41],[-233,-424],[-354,-262],[-401,-782],[-320,-545],[236,97],[446,776],[583,493]],[[31513,79609],[416,59],[245,-290]],[[32174,79378],[-262,-397],[88,-637],[91,-446],[361,-295],[459,86],[278,664],[19,-429],[180,-214],[-344,-387],[-615,-351],[-276,-239],[-310,-426],[-211,44],[-11,500],[483,488],[-445,-19],[-309,-72]],[[31350,77248],[48,-194],[-296,-286],[-286,-204],[-293,-175]],[[30523,76389],[-159,-386],[-35,-98]],[[30329,75905],[-3,-313],[92,-313],[115,-15],[-29,216],[83,-131],[-22,-169],[-188,-96]],[[30377,75084],[-133,12],[-205,-104]],[[30039,74992],[-121,-29],[-162,-29],[-231,-171],[408,111],[82,-112],[-389,-177],[-177,-1],[8,72],[-84,-164],[82,-27],[-60,-424],[-203,-455],[-20,152]],[[29172,73738],[-61,31],[-91,147]],[[29020,73916],[57,-318]],[[29077,73598],[66,-106],[8,-222]],[[29151,73270],[-89,-230],[-157,-472],[-25,24],[86,402]],[[28966,72994],[-142,226],[-33,490]],[[28791,73710],[-53,-255],[59,-375]],[[28797,73080],[-175,88],[183,-186]],[[28805,72982],[12,-562],[79,-41],[29,-204],[39,-591],[-176,-439],[-288,-175],[-182,-346],[-139,-38],[-141,-217],[-39,-199],[-305,-383],[-157,-281],[-131,-351],[-43,-419],[50,-411],[92,-505],[124,-418],[1,-256],[132,-685],[-9,-398],[-12,-230],[-69,-361]],[[27672,65472],[-83,-74],[-137,71]],[[27452,65469],[-44,259]],[[27408,65728],[-106,136],[-147,508]],[[27155,66372],[-129,452],[-42,231],[57,393],[-77,325],[-217,494]],[[26747,68267],[-108,91],[-281,-269]],[[26358,68089],[-49,30]],[[26309,68119],[-135,276],[-174,146]],[[26000,68541],[-314,-75],[-247,66],[-212,-41]],[[25227,68491],[-118,-83],[54,-166]],[[25163,68242],[-5,-240],[59,-117],[-53,-77],[-103,87],[-104,-112],[-202,18]],[[24755,67801],[-207,313],[-242,-74]],[[24306,68040],[-202,137],[-173,-42],[-234,-138],[-253,-438],[-276,-255],[-152,-282],[-63,-266],[-3,-407],[14,-284],[52,-201]],[[23016,65864],[1,-1],[-1,-1],[-107,-516]],[[22909,65346],[-49,-426],[-20,-791],[-27,-289],[48,-322],[86,-288],[56,-458],[184,-440],[65,-337],[109,-291],[295,-157],[114,-247],[244,165],[212,60],[208,106],[175,101],[176,241],[67,345],[22,496],[48,173],[188,155],[294,137],[246,-21],[169,50],[66,-125],[-9,-285],[-149,-351],[-66,-360],[51,-103],[-42,-255],[-69,-461],[-71,152],[-58,-10]],[[25472,61510],[1,-87],[53,-3],[-5,-160],[-45,-256],[24,-91],[-29,-212],[18,-56],[-32,-299],[-55,-156],[-50,-19],[-55,-205]],[[25297,59966],[90,-107],[24,88],[82,-75]],[[25493,59872],[29,-23],[61,104],[79,8],[26,-48],[43,29],[129,-53]],[[25860,59889],[128,16],[90,65]],[[26078,59970],[32,66],[89,-31],[66,-40],[73,14],[55,51],[127,-82],[44,-13],[85,-110],[80,-132],[101,-91],[73,-162]],[[26903,59440],[-24,-57],[-14,-132],[29,-216],[-64,-202],[-30,-237],[-9,-261],[15,-152],[7,-266],[-43,-58],[-26,-253],[19,-156],[-56,-151],[12,-159],[43,-97]],[[26762,57043],[70,-321],[108,-238],[130,-252]],[[27070,56232],[100,-212]],[[27170,56020],[-6,-125],[111,-27]],[[27275,55868],[26,48],[77,-145],[136,42],[119,150],[168,119],[95,176],[153,-34],[-10,-58],[155,-21],[124,-102],[90,-177],[105,-164]],[[28513,55702],[143,-18],[209,412],[114,63],[3,195],[51,500],[159,274],[175,11],[22,123],[218,-49],[218,298],[109,132],[134,285],[98,-36],[73,-156],[-54,-199]],[[30185,57537],[-8,-139],[-163,-69],[91,-268],[-3,-309]],[[30102,56752],[-123,-343],[105,-469]],[[30084,55940],[120,38],[62,427],[-86,208],[-14,447],[346,241],[-38,278],[97,186],[100,-415],[195,-9],[180,-330],[11,-195],[249,-6],[297,61],[159,-264]],[[31762,56607],[213,-73],[155,184]],[[32130,56718],[4,149],[344,35],[333,9],[-236,-175],[95,-279],[222,-44],[210,-291],[45,-473],[144,13],[109,-139]],[[33400,55523],[183,-217],[171,-385],[8,-304],[105,-14],[149,-289],[109,-205]],[[34125,54109],[333,-119],[30,107],[225,43],[298,-159]],[[35011,53981],[95,-65],[204,-140],[294,-499],[46,-242]],[[35650,53035],[95,28],[69,-327],[155,-1033],[149,-97],[7,-408],[-208,-487],[86,-178],[491,-92],[10,-593],[211,388],[349,-212],[462,-361],[135,-346],[-45,-327],[323,182],[540,-313],[415,23],[411,-489],[355,-662],[214,-170],[237,-24],[101,-186],[94,-752],[46,-358],[-110,-977],[-142,-385],[-391,-822],[-177,-668],[-206,-513],[-69,-11],[-78,-435],[20,-1107],[-77,-910],[-30,-390],[-88,-233],[-49,-790],[-282,-771],[-47,-610],[-225,-256],[-65,-355],[-302,2],[-437,-227],[-195,-263],[-311,-173],[-327,-470],[-235,-586],[-41,-441],[46,-326],[-51,-597],[-63,-289],[-195,-325],[-308,-1040],[-244,-468],[-189,-277],[-127,-562],[-183,-337]],[[35174,30629],[-121,-372],[-313,-328],[-205,118],[-151,-63],[-256,253],[-189,-19],[-169,327]],[[33770,30545],[-19,-308],[353,-506],[-38,-408],[173,-257],[-14,-289],[-267,-757],[-412,-317],[-557,-123],[-305,59],[59,-352],[-57,-442],[51,-298],[-167,-208],[-284,-82],[-267,216],[-108,-155],[39,-587],[188,-178],[152,186],[82,-307],[-255,-183],[-223,-367],[-41,-595],[-66,-316],[-262,-2],[-218,-302],[-80,-443]],[[31227,23224],[274,-433],[265,-119]],[[31766,22672],[-96,-531],[-328,-333],[-180,-692],[-254,-234],[-113,-276],[89,-614],[185,-342],[-117,30]],[[30952,19680],[-247,4],[-134,-145],[-250,-213],[-45,-552],[-118,-14],[-313,192],[-318,412],[-346,338],[-87,374],[79,346],[-140,393],[-36,1007],[119,568],[293,457],[-422,172],[265,522],[94,982],[309,-208],[145,1224],[-186,157],[-87,-738],[-175,83],[87,845],[95,1095],[127,404]],[[29661,27385],[-79,576],[-23,666]],[[29559,28627],[117,19],[170,954],[192,945],[118,881],[-64,885],[83,487],[-34,730],[163,721],[50,1143],[89,1227],[87,1321],[-20,967],[-58,832]],[[30452,39739],[-279,340],[-24,242],[-551,593],[-498,646],[-214,365],[-115,488],[46,170],[-236,775],[-274,1090],[-262,1177],[-114,269],[-87,435],[-216,386],[-198,239],[90,264],[-134,563],[86,414],[221,373]],[[27693,48568],[148,442],[-60,258],[-106,-275],[-166,259],[56,167],[-47,536],[97,89],[52,368],[105,381],[-20,241],[153,126],[190,236]],[[28095,51396],[-37,183],[103,44],[-12,296],[65,214],[138,40],[117,371],[106,310],[-102,141],[52,343],[-62,540],[59,155],[-44,500],[-112,315]],[[28366,54848],[-93,170],[-59,319],[68,158],[-70,40]],[[28212,55535],[-52,195],[-138,165]],[[28022,55895],[-122,-38],[-56,-205],[-112,-149],[-61,-20],[-27,-123],[132,-321],[-75,-76],[-40,-87],[-130,-30],[-48,353],[-36,-101],[-92,35],[-56,238],[-114,39],[-72,69],[-119,-1],[-8,-128],[-32,89]],[[26954,55439],[-151,131],[-56,124],[32,103],[-11,130],[-77,142],[-109,116],[-95,76],[-19,173],[-73,105],[18,-172],[-55,-141],[-64,164],[-89,58],[-38,120],[2,179],[36,187],[-78,83],[64,114]],[[26191,57131],[-96,186],[-130,238],[-61,200],[-117,185],[-140,267]],[[25647,58207],[31,92],[46,-89]],[[25724,58210],[21,41]],[[25745,58251],[-48,185]],[[25697,58436],[-84,52],[-31,-140]],[[25582,58348],[-161,9],[-100,57],[-115,117],[-154,37],[-79,127]],[[24973,58695],[-142,103],[-174,11],[-127,117],[-149,244]],[[24381,59170],[-314,636]],[[24067,59806],[-144,192],[-226,154]],[[23697,60152],[-156,-43],[-223,-223],[-140,-58],[-196,156],[-208,112],[-260,271],[-208,83],[-314,275],[-233,282],[-70,158],[-155,35],[-284,187],[-116,270],[-299,335],[-139,373],[-66,288],[93,57],[-29,169],[64,153],[1,204],[-93,266],[-25,235],[-94,298],[-244,587],[-280,462],[-135,368],[-238,241],[-51,145],[42,365]],[[19641,66203],[-142,137],[-164,288]],[[19335,66628],[-69,412],[-149,48],[-162,311],[-130,288],[-12,184],[-149,446],[-99,452],[5,227]],[[18570,68996],[-201,235],[-93,-26]],[[18276,69205],[-159,163],[-44,-240],[46,-284],[27,-444],[95,-243],[206,-407],[46,-139],[42,-42],[37,-203],[49,8],[56,-381],[85,-150],[59,-210],[174,-300],[92,-550],[83,-259],[77,-277],[15,-311],[134,-20],[112,-268],[100,-264],[-6,-106],[-117,-217],[-49,3],[-74,359]],[[19362,64423],[-182,337],[-200,286]],[[18980,65046],[-142,150],[9,432],[-42,320],[-132,183],[-191,264],[-37,-76],[-70,154],[-171,143],[-164,343],[20,44],[115,-33],[103,221],[10,266],[-214,422],[-163,163],[-102,369],[-103,388],[-129,472],[-113,531]],[[17464,69802],[-46,302],[-180,340],[-130,71],[-30,169],[-156,30],[-100,159],[-258,59]],[[16564,70932],[-70,95],[-34,324]],[[16460,71351],[-270,594],[-231,821],[10,137],[-123,195],[-215,495],[-38,482],[-148,323],[61,489],[-10,507],[-89,453],[109,557],[67,1072],[-50,792],[-88,506],[-80,274],[33,115],[402,-200],[148,-558]],[[15948,78405],[68,156],[-44,485],[-94,484]],[[15878,79530],[-38,1],[-537,581],[-199,255]],[[15104,80367],[-503,245],[-155,523],[40,362]],[[14486,81497],[-356,252],[-48,476],[-336,429],[-6,304]],[[13740,82958],[-153,223],[-245,188],[-78,515],[-358,478],[-150,558],[-267,38],[-441,15],[-326,170],[-574,613],[-266,112],[-486,211]],[[10396,86079],[-385,-50],[-546,271]],[[9465,86300],[-330,252],[-309,-125],[58,-411],[-154,-38],[-321,-123],[-245,-199]],[[8164,85656],[-307,-126],[-40,348]],[[7817,85878],[125,580],[295,182],[-76,148],[-354,-329],[-190,-394],[-400,-420],[203,-287],[-262,-424]],[[7158,84934],[-299,-247],[-278,-181]],[[6581,84506],[-69,-261],[-434,-305],[-87,-278],[-325,-252],[-191,45],[-259,-165],[-282,-201],[-231,-197],[-477,-169],[-43,99],[304,276],[271,182],[296,324],[345,66],[137,243],[385,353],[62,119],[205,208],[48,448],[141,349],[-320,-179],[-90,102],[-150,-215],[-181,300],[-75,-212],[-104,294],[-278,-236],[-170,0],[-24,352]],[[4985,85596],[50,217],[-179,210]],[[4856,86023],[-361,-113],[-235,277],[-190,142],[-1,334],[-214,252],[108,340],[226,330],[99,303],[225,43],[191,-94],[224,285],[201,-51],[212,183],[-52,270],[-155,106],[205,228],[-170,-7],[-295,-128],[-85,-131],[-219,131],[-392,-67],[-407,142],[-117,238],[-351,343],[390,247],[620,289],[228,0]],[[4541,89915],[-38,-295],[586,22]],[[5089,89642],[-225,366]],[[4864,90008],[-342,226],[-197,295]],[[4325,90529],[-267,252],[-381,187],[155,309],[493,19],[350,270],[66,287],[284,281],[271,68],[526,262],[256,-40],[427,315],[421,-124],[201,-266],[123,114],[469,-35],[-16,-136],[425,-101],[283,59],[585,-186],[534,-56],[214,-77],[370,96],[421,-177],[302,-83]],[[10837,91767],[518,-142]],[[11355,91625],[438,-284],[289,-55]],[[12082,91286],[244,247],[336,184],[413,-72],[416,259],[455,148],[191,-245],[207,138],[62,278],[192,-63],[470,-530],[369,401]],[[15437,92031],[38,-448],[341,96]],[[15816,91679],[105,173],[337,-34],[424,-248],[650,-217],[383,-100],[272,38]],[[17987,91291],[375,-300],[-391,-293]],[[17971,90698],[502,-127],[750,70],[236,103],[296,-354],[302,299],[-283,251],[179,202],[338,27],[223,59],[224,-141],[279,-321],[310,47],[491,-266],[431,94],[405,-14],[-32,367],[247,103],[431,-200],[-2,-559],[177,471],[223,-16],[126,594],[-298,364],[-324,239],[22,653],[329,429],[366,-95],[281,-261],[378,-666],[-247,-290],[517,-120],[-1,-604],[371,463],[332,-380],[-83,-438],[269,-399],[290,427],[202,510]],[[19722,91216],[-824,-103],[-374,-41]],[[18524,91072],[-151,279],[-379,161],[-246,-66],[-343,468],[185,62],[429,101],[392,-26],[362,103],[-537,138],[-594,-47],[-394,12],[-146,217],[644,237],[-428,-9],[-485,156],[233,443],[193,235],[744,359],[284,-114],[-139,-277],[618,179],[386,-298],[314,302],[254,-194],[227,-580],[140,244],[-197,606],[244,86],[276,-94],[311,-239],[175,-575],[86,-417],[466,-293],[502,-279],[-31,-260],[-456,-48],[178,-227],[-94,-217],[-503,93],[-478,160],[-322,-36],[-522,-201]],[[20728,93568],[-434,413],[95,83],[372,24],[211,-130],[-244,-390]],[[27920,93557],[-80,36],[-306,313],[12,213],[133,39],[636,-63],[479,-325],[25,-163],[-296,17],[-299,13],[-304,-80]],[[31620,87170],[-753,236],[-596,343],[-337,287],[97,167],[-414,304],[-405,286],[5,-171],[-803,-94],[-235,203],[183,435],[522,10],[571,76],[-92,211],[96,294],[360,576],[-77,261],[-107,203],[-425,286],[-563,201],[178,150],[-294,367],[-245,34],[-219,201],[-149,-175],[-503,-76],[-1011,132],[-588,174],[-450,89],[-231,207],[290,270],[-394,2],[-88,599],[213,528],[286,241],[717,158],[-204,-382],[219,-369],[256,477],[704,242],[477,-611],[-42,-387],[550,172],[263,235],[616,-299],[383,-282],[36,-258],[515,134],[290,-376],[670,-234],[242,-238],[263,-553],[-510,-275],[654,-386],[441,-130],[400,-543],[437,-39],[-87,-414],[-487,-687],[-342,253],[-437,568],[-359,-74],[-35,-338],[292,-344],[377,-272],[114,-157],[181,-584],[-96,-425],[-350,160],[-697,473],[393,-509],[289,-357],[45,-206]],[[22678,92689],[-268,50],[-192,225],[-690,456],[5,189],[567,-73],[-306,386],[329,286],[331,-124],[496,75],[72,-172],[-259,-283],[420,-254],[-50,-532],[-455,-229]],[[89468,93831],[-569,66],[-49,31],[263,234],[348,54],[394,-226],[34,-155],[-421,-4]],[[23814,93133],[-317,22],[-173,519],[4,294],[145,251],[276,161],[579,-20],[530,-144],[-415,-526],[-331,-115],[-298,-442]],[[15808,92470],[-147,259],[-641,312]],[[15020,93041],[93,193],[218,489]],[[15331,93723],[241,388],[-272,362],[939,93],[397,-123],[709,-33],[270,-171],[298,-249],[-349,-149],[-681,-415],[-344,-414]],[[16539,93012],[0,-248],[-731,-294]],[[91548,94707],[-444,53],[-516,233],[66,192],[518,-89],[697,-155],[-321,-234]],[[23845,94650],[-403,44],[-337,155],[148,266],[399,159],[243,-208],[101,-187],[-151,-229]],[[88598,94662],[-550,384],[149,406],[366,111],[734,-26],[1004,-313],[-219,-439],[-1023,16],[-461,-139]],[[22275,94831],[-298,94],[5,345],[-455,-46],[-18,457],[299,-18],[419,201],[390,-34],[22,77],[212,-273],[9,-303],[-127,-440],[-458,-60]],[[18404,94533],[-35,193],[577,261],[-1255,-70],[-389,106],[379,577],[262,165],[782,-199],[493,-350],[485,-45],[-397,565],[255,215],[286,-68],[94,-282],[109,-210],[247,99],[291,-26],[49,-289],[-169,-281],[-940,-91],[-701,-256],[-423,-14]],[[65817,92311],[-907,77],[-74,262],[-503,158],[-40,320],[284,126],[-10,323],[551,503],[-255,73],[665,518],[-75,268],[621,312],[917,380],[925,110],[475,220],[541,76],[193,-233],[-187,-184],[-984,-293],[-848,-282],[-863,-562],[-414,-577],[-435,-568],[56,-491],[531,-484],[-164,-52]],[[25514,94532],[-449,73],[-738,190],[-96,325],[-34,293],[-279,258],[-574,72],[-322,183],[104,242],[573,-37],[308,-190],[547,1],[240,-194],[-64,-222],[319,-134],[177,-140],[374,-26],[406,-50],[441,128],[566,51],[451,-42],[298,-223],[62,-244],[-174,-157],[-414,-127],[-355,72],[-797,-91],[-570,-11]],[[16250,95423],[-377,128],[472,442],[570,383],[426,-9],[381,87],[-38,-454],[-214,-205],[-259,-29],[-517,-252],[-444,-91]],[[81143,94175],[250,112],[142,-379]],[[81535,93908],[122,153],[444,93],[892,-97],[67,-276],[1162,-88],[15,451]],[[84237,94144],[590,-103],[443,3]],[[85270,94044],[449,-312],[128,-378],[-165,-247],[349,-465],[437,-240],[268,620],[446,-266],[473,159],[538,-182],[204,166],[455,-83],[-201,549],[367,256],[2509,-384],[236,-351],[727,-451],[1122,112],[553,-98],[231,-244],[-33,-432],[342,-168],[372,121],[492,15],[525,-116],[526,66],[484,-526],[344,189],[-224,378]],[[97224,91732],[123,263],[886,-166]],[[98233,91829],[578,36],[799,-282],[389,-258],[0,-2354],[-2,-3],[-357,-260],[-360,44],[250,-315],[166,-487],[128,-159],[32,-244],[-71,-157],[-518,129],[-777,-445],[-247,-69],[-425,-415],[-403,-362],[-102,-269],[-397,409],[-724,-464]],[[96192,85904],[-126,220],[-268,-254]],[[95798,85870],[-371,81],[-90,-388],[-333,-572],[10,-239],[316,-132],[-37,-860],[-258,-22],[-119,-494],[116,-255]],[[95032,82989],[-486,-301],[-96,-675]],[[94450,82013],[-415,-144],[-83,-600],[-400,-551],[-103,407],[-119,862],[-155,1313],[134,819],[234,353]],[[93543,84472],[15,276],[431,132]],[[93989,84880],[496,744],[479,608],[499,471],[223,833],[-337,-50],[-167,-487]],[[95182,86999],[-705,-648],[-227,726]],[[94250,87077],[-717,-201],[-696,-990],[230,-362],[-620,-154],[-430,-61],[20,427],[-431,90],[-344,-291],[-850,102]],[[90412,85637],[-913,-175],[-900,-1153]],[[88599,84309],[-1065,-1394],[438,-74],[136,-370],[270,-132]],[[88378,82339],[178,296],[305,-39]],[[88861,82596],[401,-650]],[[89262,81946],[9,-502],[-217,-591]],[[89054,80853],[-23,-705],[-126,-945],[-418,-855],[-94,-409],[-377,-688],[-374,-682],[-179,-349],[-370,-346],[-175,-8],[-175,287],[-373,-432],[-43,-197]],[[86327,75524],[-106,36]],[[86221,75560],[-120,-201],[-83,-201]],[[86018,75158],[10,-424],[-143,-130],[-50,-105],[-104,-174],[-185,-97],[-121,-159],[-9,-256],[-32,-65],[111,-96],[157,-259]],[[85652,73393],[240,-697],[68,-383],[3,-681],[-105,-325],[-252,-113],[-222,-245],[-250,-51],[-31,322]],[[85103,71220],[52,443],[-123,615]],[[85032,72278],[206,99],[-190,506]],[[85048,72883],[-135,113],[-34,-112]],[[84879,72884],[-81,-49],[-10,112],[-72,54],[-75,94]],[[84641,73095],[77,260],[65,69]],[[84783,73424],[-25,108],[71,319]],[[84829,73851],[-18,97],[-163,64]],[[84648,74012],[-131,158]],[[84517,74170],[-388,-171],[-204,-277],[-300,-161],[148,274],[-58,230],[220,397],[-147,310],[-242,-209],[-314,-411],[-171,-381],[-272,-29],[-142,-275],[147,-400],[227,-97],[9,-265]],[[83030,72705],[220,-172],[311,421]],[[83561,72954],[247,-230],[179,-15]],[[83987,72709],[46,-310],[-394,-165]],[[83639,72234],[-130,-319],[-270,-296],[-142,-414]],[[83097,71205],[299,-324],[109,-582]],[[83505,70299],[169,-541],[189,-454],[-5,-439],[-174,-161],[66,-315],[164,-184],[-43,-481],[-71,-468],[-155,-53],[-203,-640],[-225,-775],[-258,-705],[-382,-545],[-386,-498],[-313,-68],[-170,-262],[-96,192],[-157,-294],[-388,-296],[-294,-90],[-95,-624],[-154,-35],[-73,429],[66,228]],[[80517,63220],[-373,190],[-131,-97]],[[80013,63313],[-371,-505],[-231,-558],[-61,-410],[212,-623],[260,-772],[252,-365],[169,-475],[127,-1093],[-37,-1039],[-232,-389],[-318,-381],[-227,-492],[-346,-550],[-101,378],[78,401],[-206,335]],[[78981,56775],[-233,87],[-112,307],[-141,611]],[[78495,57780],[-249,271],[-238,-11],[41,464],[-245,-3],[-22,-650],[-150,-863],[-90,-522],[19,-428],[181,-18],[113,-539],[50,-512],[155,-338],[168,-69],[144,-306]],[[78372,54256],[64,-56],[164,-356],[116,-396],[16,-398],[-29,-269],[27,-203],[20,-349],[98,-163],[109,-523],[-5,-199],[-197,-40],[-263,438],[-329,469],[-32,301],[-161,395],[-38,489],[-100,322],[30,431],[-61,250]],[[77801,54399],[-110,227],[-47,292],[-148,334],[-135,280],[-45,-347],[-53,328],[30,369],[82,566]],[[77375,56448],[-27,439],[86,452],[-94,350],[23,644],[-113,306],[-90,707],[-50,746],[-121,490],[-183,-297],[-315,-421],[-156,53],[-172,138],[96,732],[-58,554],[-218,681],[34,213],[-163,76],[-197,481]],[[75657,62792],[-79,309],[-16,301],[-53,284]],[[75509,63686],[-116,344],[-256,23],[25,-243],[-87,-329],[-118,120],[-41,-108],[-78,65],[-108,53]],[[74730,63611],[-39,-216],[-189,7],[-343,-122],[16,-445],[-148,-349],[-400,-398],[-311,-695],[-209,-373]],[[73107,61020],[-276,-386],[-1,-272]],[[72830,60362],[-138,-146]],[[72692,60216],[-250,-212],[-130,-31]],[[72312,59973],[-84,-450],[58,-769],[15,-490],[-118,-561],[-1,-1004],[-144,-29],[-126,-450],[84,-195]],[[71996,56025],[-253,-167],[-93,-402]],[[71650,55456],[-112,-170],[-263,552],[-128,827],[-107,596],[-97,279],[-148,568],[-69,739],[-48,369],[-253,811],[-115,1145],[-83,756],[1,716],[-54,553],[-404,-353],[-196,70],[-362,716],[133,214],[-82,232],[-326,501]],[[68937,64577],[-203,150]],[[68734,64727],[-83,425],[-215,449]],[[68436,65601],[-512,-111],[-451,-11],[-391,-83]],[[67082,65396],[-523,179]],[[66559,65575],[-302,136],[-314,76]],[[65943,65787],[-118,725],[-133,105],[-214,-106],[-280,-286],[-339,196],[-281,454],[-267,168],[-186,561],[-205,788],[-149,-96],[-177,196]],[[63594,68492],[-103,-231],[-165,29]],[[63326,68290],[58,-261],[-25,-135],[89,-445]],[[63448,67449],[109,-510],[137,-135],[47,-207]],[[63741,66597],[190,-248],[16,-244]],[[63947,66105],[-27,-197],[35,-199],[80,-165],[37,-194],[41,-145]],[[64113,65205],[-18,430],[75,310],[76,64]],[[64246,66009],[84,-186],[5,-345]],[[64335,65478],[-61,-348]],[[64274,65130],[53,-226]],[[64327,64904],[49,29],[11,-162],[217,93],[230,-15],[168,-18],[190,400],[207,379],[176,364]],[[65575,65974],[80,201],[35,-51],[-26,-244],[-37,-108]],[[65627,65772],[38,-466]],[[65665,65306],[125,-404],[155,-214]],[[65945,64688],[204,-78],[164,-107]],[[66313,64503],[125,-339],[75,-196],[100,-75],[-1,-132],[-101,-352],[-44,-166],[-117,-189],[-104,-404],[-126,31],[-58,-141],[-44,-300],[34,-395],[-26,-72],[-128,2],[-174,-221],[-27,-288],[-63,-125],[-173,5],[-109,-149]],[[65352,60997],[1,-239],[-134,-164]],[[65219,60594],[-153,56],[-186,-199]],[[64880,60451],[-128,-33],[-201,-159]],[[64551,60259],[-54,-263],[-6,-201],[-277,-249],[-444,-276],[-249,-417]],[[63521,58853],[-122,-32],[-83,34]],[[63316,58855],[-163,-245]],[[63153,58610],[-177,-113],[-233,-31]],[[62743,58466],[-70,-34],[-61,-156],[-73,-43]],[[62539,58233],[-42,-150],[-138,13]],[[62359,58096],[-89,-80],[-192,30],[-72,345],[8,323],[-46,174],[-54,437],[-80,243],[56,29],[-29,270],[34,114],[-12,257]],[[61883,60238],[-36,253],[-84,177]],[[61763,60668],[-22,236],[-143,212],[-148,495],[-79,482],[-192,406],[-124,97],[-184,563],[-32,411],[12,350],[-159,655],[-130,231],[-150,122],[-92,339],[15,133]],[[60335,65400],[-77,307],[-81,131]],[[60177,65838],[-108,440],[-170,476],[-141,406],[-139,-3],[44,325],[12,206],[34,236]],[[59709,67924],[-9,86]],[[59700,68010],[-78,-238],[-60,-446],[-75,-308],[-65,-103],[-93,191],[-125,263],[-198,847],[-29,-53],[115,-624],[171,-594],[210,-920],[102,-321],[90,-334],[249,-654],[-55,-103],[9,-384],[323,-530],[49,-121]],[[60240,63578],[90,-580],[-61,-107],[40,-608],[102,-706],[106,-145],[152,-219]],[[60669,61213],[161,-683],[77,-543]],[[60907,59987],[152,-288],[379,-558],[154,-336],[151,-341],[87,-203],[136,-178]],[[61966,58083],[66,-183],[-9,-245],[-158,-142],[119,-161]],[[61984,57352],[91,-109]],[[62075,57243],[54,-244],[125,-248]],[[62254,56751],[138,-2],[262,151],[302,70],[245,184],[138,39],[99,108],[158,20]],[[63596,57321],[89,12],[128,88],[147,59],[132,202],[105,2],[6,-163],[-25,-344],[1,-310],[-59,-214],[-78,-639],[-134,-659],[-172,-755],[-238,-866],[-237,-661],[-327,-806],[-278,-479],[-415,-586],[-259,-450],[-304,-715],[-64,-312],[-63,-140]],[[61551,49585],[-195,-236],[-68,-246],[-104,-44],[-40,-416],[-89,-238],[-54,-393],[-112,-195]],[[60889,47817],[-128,-728],[16,-335],[178,-216],[8,-153],[-76,-357],[16,-180],[-18,-282],[97,-370],[115,-583],[101,-129]],[[61198,44484],[45,-265],[-11,-588],[34,-519],[11,-923],[49,-290],[-83,-422],[-108,-410],[-177,-366],[-254,-225],[-313,-287],[-313,-634],[-107,-108],[-194,-420],[-115,-136],[-23,-421],[132,-448],[54,-346],[4,-177],[49,29],[-8,-579]],[[59870,36949],[-45,-274],[65,-102]],[[59890,36573],[-41,-246],[-116,-210]],[[59733,36117],[-229,-199],[-334,-320],[-122,-219],[24,-248],[71,-40],[-24,-311]],[[59119,34780],[-70,-430],[-32,-491],[-72,-267],[-190,-298],[-54,-86],[-118,-300],[-77,-303],[-158,-424],[-314,-609],[-196,-355]],[[57838,31217],[-209,-269],[-291,-229]],[[57338,30719],[-141,-31],[-36,-164],[-169,88],[-138,-113],[-301,114],[-168,-72],[-115,31],[-286,-233],[-238,-94],[-171,-223],[-127,-14],[-117,210],[-94,11],[-120,264],[-13,-82],[-37,159],[2,346],[-90,396],[89,108],[-7,453],[-182,553],[-139,501],[-1,1],[-199,768]],[[54540,33696],[-207,446],[-108,432],[-62,575],[-68,428],[-93,910],[-7,707],[-35,322],[-108,243],[-144,489],[-146,708],[-60,371],[-226,577],[-17,453]],[[53259,40357],[-26,372],[38,519],[96,541],[15,254],[90,532],[66,243],[159,386],[90,263],[29,438],[-15,335],[-83,211],[-74,358],[-68,355],[15,122],[85,235],[-84,570],[-57,396],[-139,374],[26,115]],[[53422,46976],[-39,183]],[[53383,47159],[-74,444]],[[53309,47603],[-228,626]],[[53081,48229],[-285,596],[-184,488],[-169,610],[9,196],[61,189],[67,430],[56,438]],[[52636,51176],[-52,90],[96,663]],[[52680,51929],[40,467],[-108,390]],[[52612,52786],[-127,100],[-56,265]],[[52429,53151],[-71,85],[3,163]],[[52361,53399],[-289,-213]],[[52072,53186],[-105,32],[-107,-133]],[[51860,53085],[-222,13],[-149,370],[-91,427]],[[51398,53895],[-197,390],[-209,-8]],[[50992,54277],[-245,1]],[[50747,54278],[-229,-69]],[[50518,54209],[-224,-126]],[[50294,54083],[-436,-346],[-154,-203],[-250,-171],[-248,168]],[[49206,53531],[-126,-7],[-194,116],[-178,-7],[-329,-103],[-193,-170],[-275,-217],[-54,15]],[[47857,53158],[-73,-5],[-286,282]],[[47498,53435],[-252,450],[-237,323]],[[47009,54208],[-187,381]],[[46822,54589],[-75,44],[-200,238],[-144,316],[-49,216],[-34,437]],[[46320,55840],[-122,349],[-108,232],[-71,76],[-69,118],[-32,261],[-41,130],[-80,97]],[[45797,57103],[-149,247],[-117,39],[-63,166],[1,90],[-84,125],[-18,127]],[[45367,57897],[-46,453]],[[45321,58350],[36,262]],[[45357,58612],[-115,460],[-138,210],[122,112],[134,415],[66,304]],[[45426,60113],[-24,318],[78,291],[34,557],[-30,583],[-34,294],[28,295],[-72,281],[-146,255]],[[45260,62987],[12,249]],[[45272,63236],[13,274],[106,161],[91,308],[-18,200],[96,417],[155,376],[93,95],[74,344],[6,315],[100,365],[185,216],[177,603],[144,235]],[[46494,67145],[259,66],[219,403],[139,158]],[[47111,67772],[232,493],[-70,735],[106,508],[37,312],[179,399],[278,270],[206,244],[186,612],[87,362],[205,-2],[167,-251],[264,41],[288,-131],[121,-6]],[[49397,71358],[267,323],[300,102],[175,244],[268,180],[471,105],[459,48],[140,-87],[262,232],[297,5],[113,-137],[190,35]],[[52339,72408],[302,239],[195,-71],[-9,-299],[236,217],[20,-113]],[[53083,72381],[-139,-289],[-2,-274]],[[52942,71818],[96,-147],[-36,-511],[-183,-297],[53,-322],[143,-10],[70,-281],[106,-92]],[[53191,70158],[326,-204],[117,51],[232,-98],[368,-264],[130,-526],[250,-114],[391,-248],[296,-293],[136,153],[133,272],[-65,452],[87,288],[200,277],[192,80],[375,-121],[95,-264],[104,-2],[88,-101]],[[56646,69496],[276,-69],[68,-196]],[[56990,69231],[369,10],[268,-156],[275,-175],[129,-92],[214,188],[114,169],[245,49],[198,-75],[75,-293],[65,193],[222,-140],[217,-33],[137,149]],[[59518,69025],[80,194],[-19,34],[74,276],[56,446],[40,149],[8,6]],[[59757,70130],[99,482],[138,416],[5,21]],[[59999,71049],[-26,452],[68,243]],[[60041,71744],[-102,268],[105,222],[-169,-51],[-233,136],[-191,-340],[-421,-66],[-225,317],[-300,20],[-64,-245]],[[58441,72005],[-192,-71],[-268,315]],[[57981,72249],[-303,-10],[-165,587]],[[57513,72826],[-203,328],[135,459],[-176,283],[308,565],[428,23],[117,449],[529,-78],[334,383],[324,167],[459,13]],[[59768,75418],[485,-416],[399,-229]],[[60652,74773],[323,91],[239,-53],[328,309]],[[61542,75120],[42,252],[-70,403],[-160,218],[-154,68],[-102,181]],[[61098,76242],[-354,499],[-317,223],[-240,347],[202,95],[231,494],[-156,234],[410,241],[-8,129],[-249,-95]],[[60617,78409],[-222,-48],[-185,-191],[-260,-31],[-239,-220],[16,-368],[136,-142],[284,35],[-55,-210],[-304,-103],[-377,-342],[-154,121],[61,277],[-304,173],[50,113],[265,197],[-80,135],[-432,149],[-19,221],[-257,-73],[-103,-325],[-215,-437]],[[58223,77340],[6,-152],[-135,-128],[-84,56],[-78,-713]],[[57932,76403],[-144,-245],[-101,-422],[89,-337]],[[57776,75399],[33,-228],[243,-190],[-51,-145],[-330,-33],[-118,-182],[-232,-319]],[[57321,74302],[-87,275],[3,122]],[[57237,74699],[-169,17],[-145,56],[-336,-154],[192,-332],[-141,-96]],[[56638,74190],[-154,0],[-147,304]],[[56337,74494],[-52,-130],[62,-353],[139,-277]],[[56486,73734],[-105,-130],[155,-272]],[[56536,73332],[137,-171],[4,-334],[-257,157],[82,-302],[-176,-62],[105,-521]],[[56431,72099],[-184,-7],[-228,257],[-104,472]],[[55915,72821],[-49,393],[-108,272],[-143,337],[-18,168]],[[55597,73991],[-48,41],[-5,130],[-154,199],[-24,281],[23,403],[38,184]],[[55427,75229],[-46,93],[-59,46]],[[55322,75368],[-78,192],[-120,118]],[[55124,75678],[-261,218],[-161,213],[-254,176]],[[54448,76285],[-233,435],[56,44]],[[54271,76764],[-127,248],[-5,200],[-179,93],[-85,-255],[-82,198],[6,205],[10,9]],[[53809,77462],[62,54]],[[53871,77516],[-221,86],[-226,-210],[15,-293],[-34,-168],[91,-301],[261,-298],[140,-488],[309,-476],[217,3],[68,-130],[-78,-118]],[[54413,75123],[249,-213],[204,-179]],[[54866,74731],[238,-308],[29,-111],[-52,-211],[-154,276],[-242,97],[-116,-382],[200,-219],[-33,-309],[-116,-35],[-148,-506],[-116,-46],[1,181],[57,317],[60,126],[-108,342],[-85,298],[-115,74],[-82,255],[-179,107],[-120,238],[-206,38],[-217,267],[-254,384]],[[53108,75604],[-189,341],[-86,584]],[[52833,76529],[-138,68],[-226,195],[-128,-80],[-161,-274],[-115,-43]],[[52065,76395],[-252,-334],[-548,160],[-404,-192],[-32,-355]],[[50829,75674],[15,-344],[-263,-393],[-356,-125],[-25,-199],[-171,-327],[-107,-481],[108,-338],[-160,-263],[-60,-384],[-210,-118]],[[49600,72702],[-197,-455],[-352,-8]],[[49051,72239],[-265,11],[-174,-209],[-106,-223],[-136,49],[-103,199],[-79,340],[-259,92]],[[47929,72498],[-112,-153],[-146,83],[-143,-65],[42,462],[-26,363],[-124,55],[-67,224],[22,386],[111,215],[20,239],[58,355],[-6,250],[-56,212],[-12,200]],[[47490,75324],[14,420],[-114,257],[393,426]],[[47783,76427],[340,-107],[373,4]],[[48496,76324],[296,-101],[230,31],[449,-19]],[[49471,76235],[144,354],[53,1177],[-287,620],[-205,299]],[[49176,78685],[-424,228],[-28,430]],[[48724,79343],[360,129],[466,-152],[-88,669],[263,-254],[646,461],[84,484],[243,119]],[[50698,80799],[222,117]],[[50920,80916],[143,162]],[[51063,81078],[244,870],[380,247]],[[51687,82195],[231,-17]],[[51918,82178],[54,125],[232,32],[52,-130],[188,291],[-63,222],[-13,335]],[[52368,83053],[-113,328],[-8,604],[46,159]],[[52293,84144],[80,178],[244,36]],[[52617,84358],[98,163],[223,167],[-9,-304],[-82,-192],[33,-166],[151,-89],[-68,-223],[-83,64],[-200,-425],[76,-288]],[[52756,83065],[4,-228],[281,-138],[-3,-210],[283,111],[156,162],[313,-233],[132,-189]],[[53922,82340],[189,174],[434,273],[350,200],[277,-100],[21,-144],[268,-7]],[[55461,82736],[63,260],[383,191]],[[55907,83187],[-59,497]],[[55848,83684],[10,445],[136,371],[262,202],[221,-442],[223,12],[53,453]],[[56753,84725],[32,349],[-102,-75],[-176,210],[-24,340],[351,164],[350,86],[301,-97],[287,17]],[[57772,85719],[316,327],[-291,280]],[[57797,86326],[-504,-47],[-489,-216],[-452,-125]],[[56352,85938],[-161,322],[-269,195],[62,581]],[[55984,87036],[-135,534],[133,344]],[[55982,87914],[252,371],[635,640],[185,124],[-28,250],[-387,279]],[[56639,89578],[-478,-167],[-269,-413],[43,-361],[-441,-475],[-537,-509],[-202,-832],[198,-416],[265,-328],[-255,-666],[-289,-138],[-106,-992],[-157,-554],[-337,57],[-158,-468],[-321,-27],[-89,558],[-232,671],[-211,835]],[[53063,85353],[-187,363],[-548,-684]],[[52328,85032],[-370,-138],[-385,301]],[[51573,85195],[-99,635]],[[51474,85830],[-88,1364],[256,380]],[[51642,87574],[733,496],[549,609],[508,824],[668,1141],[465,444],[763,741],[610,259],[457,-31],[423,489],[506,-26],[499,118],[869,-433],[-358,-158],[305,-371]],[[58639,91676],[286,206],[456,-358],[761,-140],[1050,-668],[213,-281],[18,-393],[-308,-311],[-454,-157],[-1240,449],[-204,-75],[453,-433],[36,-878],[358,-180],[217,-153],[36,286]],[[60317,88590],[-174,263],[183,215]],[[60326,89068],[672,-368]],[[60998,88700],[234,144],[-187,433]],[[61045,89277],[647,578],[256,-34],[260,-206],[161,406],[-231,352],[136,353],[-204,367],[777,-190],[158,-331],[-351,-73]],[[62654,90499],[2,-328],[218,-203]],[[62874,89968],[429,128],[68,377]],[[63371,90473],[581,282],[969,507]],[[64921,91262],[209,-29],[-273,-359],[344,-61],[199,202],[521,16],[412,245],[317,-356],[315,391],[-291,343],[145,195],[820,-179],[385,-185],[1006,-675],[186,309],[-282,313],[-8,125],[-335,58],[92,280],[-149,461],[-8,189],[512,535]],[[69038,93080],[182,537],[207,116]],[[69427,93733],[735,-156],[58,-328]],[[70220,93249],[-263,-479],[173,-189],[89,-413],[-63,-809],[307,-362],[-120,-395],[-544,-839],[318,-87],[110,213],[306,151],[74,293],[240,281],[-162,336],[130,390],[-304,49],[-67,328]],[[70444,91717],[222,594],[-361,481]],[[70305,92792],[497,398],[-64,421],[139,13],[145,-328],[-109,-570],[297,-108],[-127,426],[465,233],[577,31],[513,-337],[-247,492],[-28,630]],[[72363,94093],[484,119],[668,-26]],[[73515,94186],[602,77],[-226,309],[321,388],[319,16],[540,293],[734,79],[93,162],[729,55],[227,-133],[624,314],[510,-10],[77,255],[265,252],[656,242],[476,-191],[-378,-146],[629,-90],[75,-292],[254,143],[812,-7],[626,-289],[223,-221],[-69,-307],[-307,-175],[-730,-328],[-209,-175],[345,-83],[410,-149]],[[63720,73858],[-47,-207],[-102,-138]],[[63571,73513],[7,-293]],[[63578,73220],[88,-436],[263,-123],[193,-296],[395,-102],[434,156],[27,139]],[[64978,72558],[-52,417],[40,618],[-216,200],[71,405],[-184,34],[61,498],[262,-145],[244,189],[-202,355],[-80,338],[-224,-151],[-28,-433],[-87,383]],[[64583,75266],[-15,144],[68,246],[-53,206],[-322,202],[-125,530],[-154,150],[-9,192],[270,-56],[11,432],[236,96],[243,-88],[50,576],[-50,365],[-278,-28],[-236,144],[-321,-260],[-259,-124]],[[63639,77993],[-127,-350],[-269,-97],[-276,-610],[252,-561],[-27,-398],[303,-696]],[[63495,75281],[146,-311],[141,-419],[130,-28],[85,-159],[-228,-47],[-49,-459]],[[23807,96363],[-521,38],[-74,165],[559,-9],[195,-109],[-33,-68],[-126,-17]],[[18874,96315],[-411,191],[224,188],[406,60],[392,-92],[-93,-177],[-518,-170]],[[56247,96336],[-490,137],[191,152],[-167,189],[575,119],[110,-222],[401,-134],[-620,-241]],[[19199,96904],[-461,1],[5,84],[285,177],[149,-27],[361,-120],[-339,-115]],[[22969,96575],[-226,138],[-119,221],[-22,245],[360,-24],[162,-39],[332,-205],[-76,-214],[-411,-122]],[[22313,96609],[-453,66],[-457,192],[-619,21],[268,176],[-335,142],[-21,227],[546,-81],[751,-215],[212,-281],[108,-247]],[[77621,96617],[507,776],[229,66],[208,-38],[704,-336],[-82,-240],[-1566,-228]],[[54420,95937],[-598,361],[252,210],[-416,170],[-541,499],[-216,463],[757,212],[152,-207],[396,8],[105,202],[408,20],[350,-206],[915,-440],[-699,-233],[-155,-435],[-243,-111],[-132,-490],[-335,-23]],[[56395,97491],[-819,98],[-50,163],[-398,11],[-304,271],[858,165],[403,-142],[281,177],[702,-148],[545,-207],[-412,-318],[-806,-70]],[[63218,97851],[-301,140],[158,185],[-618,18],[542,107],[422,8],[57,-160],[159,142],[262,97],[412,-129],[-107,-90],[-373,-78],[-250,-45],[-39,-97],[-324,-98]],[[77154,97111],[-773,170],[-462,226],[-213,423],[-379,117],[722,404],[600,133],[540,-297],[640,-572],[-69,-531],[-606,-73]],[[24776,96791],[-575,76],[-299,240],[4,215],[220,157],[-508,-4],[-306,196],[-176,268],[193,262],[192,180],[285,42],[-122,135],[646,30],[355,-315],[468,-127],[455,-112],[220,-390],[334,-190],[-381,-176],[-513,-445],[-492,-42]],[[27622,95587],[-726,163],[-816,-91],[-414,71],[-525,31],[-35,284],[514,133],[-137,427],[170,41],[742,-255],[-379,379],[-450,113],[225,229],[492,141],[79,206],[-392,231],[-118,304],[759,-26],[220,-64],[433,216],[-625,68],[-972,-38],[-491,201],[-232,239],[-324,173],[-61,202],[413,112],[324,19],[545,96],[409,220],[344,-30],[300,-166],[211,319],[367,95],[498,65],[849,24],[148,-63],[802,100],[601,-38],[602,-37],[742,-47],[597,-75],[508,-161],[-12,-157],[-678,-257],[-672,-119],[-251,-133],[605,3],[-656,-358],[-452,-167],[-476,-483],[-573,-98],[-177,-120],[-841,-64],[383,-74],[-192,-105],[230,-292],[-264,-202],[-429,-167],[-132,-232],[-388,-176],[39,-134],[475,23],[6,-144],[-742,-355]],[[37559,86051],[-410,482],[-556,3],[-269,324],[-186,577],[-481,735],[-141,385],[-38,530],[-384,546],[100,435],[-186,208],[275,691],[418,220],[110,247],[58,461],[-318,-209],[-151,-88],[-249,-84],[-341,193],[-19,401],[109,314],[258,9],[567,-157],[-478,375],[-249,202],[-276,-83],[-232,147],[310,550],[-169,220],[-220,409],[-335,626],[-353,230],[3,247],[-745,346],[-590,43],[-743,-24],[-677,-44],[-323,188],[-482,372],[729,186],[559,31],[-1188,154],[-627,241],[39,229],[1051,285],[1018,284],[107,214],[-750,213],[243,235],[961,413],[404,63],[-115,265],[658,156],[854,93],[853,5],[303,-184],[737,325],[663,-221],[390,-46],[577,-192],[-660,318],[38,253],[932,353],[975,-27],[354,218],[982,57],[2219,-74],[1737,-469],[-513,-227],[-1062,-26],[-1496,-58],[140,-105],[984,65],[836,-204],[540,181],[231,-212],[-305,-344],[707,220],[1348,229],[833,-114],[156,-253],[-1132,-420],[-157,-136],[-888,-102],[643,-28],[-324,-431],[-224,-383],[9,-658],[333,-386],[-434,-24],[-457,-187],[513,-313],[65,-502],[-297,-55],[360,-508],[-617,-42],[322,-241],[-91,-208],[-391,-91],[-388,-2],[348,-400],[4,-263],[-549,244],[-143,-158],[375,-148],[364,-361],[105,-476],[-495,-114],[-214,228],[-344,340],[95,-401],[-322,-311],[732,-25],[383,-32],[-745,-515],[-755,-466],[-813,-204],[-306,-2],[-288,-228],[-386,-624],[-597,-414],[-192,-24],[-370,-145],[-399,-138],[-238,-365],[-4,-415],[-141,-388],[-453,-472],[112,-462],[-125,-488],[-142,-577],[-391,-36]],[[67002,71642],[284,-224],[209,79],[58,268],[219,89],[157,180],[55,472],[234,114],[44,211],[131,-158],[84,-19]],[[68477,72654],[154,-4],[210,-124]],[[68841,72526],[85,-72],[201,189],[93,-114],[90,271],[166,-12],[43,86],[29,239],[120,205],[150,-134],[-30,-181],[84,-28],[-26,-496],[110,-194],[97,125],[123,58],[173,265],[192,-44],[286,-1]],[[70827,72688],[50,-169]],[[70877,72519],[-162,-67],[-141,-109],[-319,-68],[-298,-124],[-163,-258],[66,-250],[32,-294],[-139,-248],[12,-227],[-76,-213],[-265,18],[110,-390],[-177,-150],[-118,-356],[15,-355],[-108,-166],[-103,55],[-212,-77],[-31,-166],[-207,1],[-154,-334],[-10,-503],[-361,-246],[-194,52],[-56,-129],[-166,75],[-278,-88],[-465,301]],[[66909,68203],[252,536],[-23,380],[-210,100],[-22,375],[-91,472],[119,323],[-121,87],[76,430],[113,736]],[[56642,44124],[29,-184],[-32,-286],[49,-277],[-41,-222],[24,-203],[-579,7],[-13,-1880],[188,-483],[181,-369]],[[56448,40227],[-510,-241],[-673,83],[-192,284],[-1126,-26],[-42,-41],[-166,267],[-180,17],[-166,-100],[-134,-113]],[[53422,46976],[115,79],[80,-11],[98,71],[820,-8],[68,-440],[80,-354],[64,-191],[106,-309],[184,47],[91,83],[154,-83],[42,148],[69,344],[172,23],[15,103],[142,2],[-24,-213],[337,5],[5,-372],[56,-228],[-41,-356],[21,-363],[93,-219],[-15,-703],[68,54],[121,-15],[172,89],[127,-35]],[[53309,47603],[112,255],[84,100],[104,-203]],[[53609,47755],[-101,-124],[-45,-152],[-9,-258],[-71,-62]],[[55719,75309],[-35,-201],[39,-254],[115,-144]],[[55838,74710],[-5,-155],[-91,-85],[-16,-192],[-129,-287]],[[55427,75229],[-47,93]],[[55380,75322],[-18,188],[120,291],[18,-111],[75,52]],[[55575,75742],[59,-159],[66,-60],[19,-214]],[[65575,65974],[52,-202]],[[65665,65306],[-142,-3],[-23,-384],[50,-82],[-126,-117],[-1,-241],[-81,-245],[-7,-238]],[[65335,63996],[-56,-125],[-835,298],[-106,599],[-11,136]],[[31400,18145],[-168,16],[-297,1],[0,1319]],[[32587,37434],[511,-964],[227,-89],[339,-437],[286,-231],[40,-261],[-273,-898],[280,-160],[312,-91],[220,95],[252,453],[45,521]],[[34826,35372],[138,114],[139,-341],[-6,-472],[-234,-326],[-186,-241],[-314,-573],[-370,-806]],[[33993,32727],[-70,-473],[-74,-607],[3,-588],[-61,-132],[-21,-382]],[[31227,23224],[273,-433],[266,-119]],[[30952,19680],[-257,93],[-672,79],[-115,344],[6,443],[-185,-38],[-98,214],[-24,626],[213,260],[88,375],[-33,299],[148,504],[101,782],[-30,347],[122,112],[-30,223],[-129,118],[92,248],[-126,224],[-65,682],[112,120],[-47,720],[65,605],[75,527],[166,215],[-84,576],[-1,543],[210,386],[-7,494],[159,576],[1,544],[-72,108],[-128,1020],[171,607],[-27,572],[100,537],[182,555],[196,367],[-83,232],[58,190],[-9,985],[302,291],[96,614],[-34,148]],[[31359,37147],[231,534],[364,-144],[163,-427],[109,475],[316,-24],[45,-127]],[[62492,74950],[57,-155],[106,-103],[-56,-148],[148,-202],[-78,-189],[118,-160],[124,-97],[7,-410]],[[62918,73486],[-101,-17]],[[62817,73469],[-113,342],[1,91],[-123,-2],[-82,159],[-58,-16]],[[62442,74043],[-109,172],[-207,147],[27,288],[-47,208]],[[62106,74858],[386,92]],[[1088,892],[38,-7],[32,-4]],[[1158,881],[402,-246],[352,246],[63,34],[816,104],[265,-138],[130,-71],[419,-196],[789,-151],[625,-185],[1072,-139],[800,162],[1181,-116],[669,-185],[734,174],[773,162],[60,278],[-1094,23],[-898,139],[-234,231],[-745,128],[49,266],[103,243],[104,220],[-55,243],[-462,162],[-212,209],[-430,185],[675,-35],[642,93],[402,-197],[495,173],[457,220],[223,197],[-98,243],[-359,162],[-408,174],[-571,35],[-500,81],[-539,58],[-180,220],[-359,185],[-217,208],[-87,672],[136,-58],[250,-185],[457,58],[441,81],[228,-255],[441,58],[370,127],[348,162],[315,197],[419,58],[-11,220],[-97,220],[81,208],[359,104],[163,-196],[425,115],[321,151],[397,12],[375,57],[376,139],[299,128],[337,127],[218,-35],[190,-46],[414,81],[370,-104],[381,11],[364,81],[375,-57],[414,-58],[386,23],[403,-12],[413,-11],[381,23],[283,174],[337,92],[349,-127],[331,104],[300,208],[179,-185],[98,-208],[180,-197],[288,174],[332,-220],[375,-70],[321,-162],[392,35],[354,104],[418,-23],[376,-81],[381,-104],[147,254],[-180,197],[-136,209],[-359,46],[-158,220],[-60,220],[-98,440],[213,-81],[364,-35],[359,35],[327,-93],[283,-174],[119,-208],[376,-35],[359,81],[381,116],[342,70],[283,-139],[370,46],[239,451],[224,-266],[321,-104],[348,58],[228,-232],[365,-23],[337,-69],[332,-128],[218,220],[108,209],[278,-232],[381,58],[283,-127],[190,-197],[370,58],[288,127],[283,151],[337,81],[392,69],[354,81],[272,127],[163,186],[65,254],[-32,244],[-87,231],[-98,232],[-87,231],[-71,209],[-16,231],[27,232],[130,220],[109,243],[44,231],[-55,255],[-32,232],[136,266],[152,173],[180,220],[190,186],[223,173],[109,255],[152,162],[174,151],[267,34],[174,186],[196,115],[228,70],[202,150],[157,186],[218,69],[163,-151],[-103,-196],[-283,-174],[-120,-127],[-206,92],[-229,-58],[-190,-139],[-202,-150],[-136,-174],[-38,-231],[17,-220],[130,-197],[-190,-139],[-261,-46],[-153,-197],[-163,-185],[-174,-255],[-44,-220],[98,-243],[147,-185],[229,-139],[212,-185],[114,-232],[60,-220],[82,-232],[130,-196],[82,-220],[38,-544],[81,-220],[22,-232],[87,-231],[-38,-313],[-152,-243],[-163,-197],[-370,-81],[-125,-208],[-169,-197],[-419,-220],[-370,-93],[-348,-127],[-376,-128],[-223,-243],[-446,-23],[-489,23],[-441,-46],[-468,0],[87,-232],[424,-104],[311,-162],[174,-208],[-310,-185],[-479,58],[-397,-151],[-17,-243],[-11,-232],[327,-196],[60,-220],[353,-220],[588,-93],[500,-162],[398,-185],[506,-186],[690,-92],[681,-162],[473,-174],[517,-197],[272,-278],[136,-220],[337,209],[457,173],[484,186],[577,150],[495,162],[691,12],[680,-81],[560,-139],[180,255],[386,173],[702,12],[550,127],[522,128],[577,81],[614,104],[430,150],[-196,209],[-119,208],[0,220],[-539,-23],[-571,-93],[-544,0],[-77,220],[39,440],[125,128],[397,138],[468,139],[337,174],[337,174],[251,231],[380,104],[376,81],[190,47],[430,23],[408,81],[343,116],[337,139],[305,139],[386,185],[245,197],[261,173],[82,232],[-294,139],[98,243],[185,185],[288,116],[305,139],[283,185],[217,232],[136,277],[202,163],[331,-35],[136,-197],[332,-23],[11,220],[142,231],[299,-58],[71,-220],[331,-34],[360,104],[348,69],[315,-34],[120,-243],[305,196],[283,105],[315,81],[310,81],[283,139],[310,92],[240,128],[168,208],[207,-151],[288,81],[202,-277],[157,-209],[316,116],[125,232],[283,162],[365,-35],[108,-220],[229,220],[299,69],[326,23],[294,-11],[310,-70],[300,-34],[130,-197],[180,-174],[304,104],[327,24],[315,0],[310,11],[278,81],[294,70],[245,162],[261,104],[283,58],[212,162],[152,324],[158,197],[288,-93],[109,-208],[239,-139],[289,46],[196,-208],[206,-151],[283,139],[98,255],[250,104],[289,197],[272,81],[326,116],[218,127],[228,139],[218,127],[261,-69],[250,208],[180,162],[261,-11],[229,139],[54,208],[234,162],[228,116],[278,93],[256,46],[244,-35],[262,-58],[223,-162],[27,-254],[245,-197],[168,-162],[332,-70],[185,-162],[229,-162],[266,-35],[223,116],[240,243],[261,-127],[272,-70],[261,-69],[272,-46],[277,0],[229,-614],[-11,-150],[-33,-267],[-266,-150],[-218,-220],[38,-232],[310,12],[-38,-232],[-141,-220],[-131,-243],[212,-185],[321,-58],[321,104],[153,232],[92,220],[153,185],[174,174],[70,208],[147,289],[174,58],[316,24],[277,69],[283,93],[136,231],[82,220],[190,220],[272,151],[234,115],[153,197],[157,104],[202,93],[277,-58],[250,58],[272,69],[305,-34],[201,162],[142,393],[103,-162],[131,-278],[234,-115],[266,-47],[267,70],[283,-46],[261,-12],[174,58],[234,-35],[212,-127],[250,81],[300,0],[255,81],[289,-81],[185,197],[141,196],[191,163],[348,439],[179,-81],[212,-162],[185,-208],[354,-359],[272,-12],[256,0],[299,70],[299,81],[229,162],[190,174],[310,23],[207,127],[218,-116],[141,-185],[196,-185],[305,23],[190,-150],[332,-151],[348,-58],[288,47],[218,185],[185,185],[250,46],[251,-81],[288,-58],[261,93],[250,0],[245,-58],[256,-58],[250,104],[299,93],[283,23],[316,0],[255,58],[251,46],[76,290],[11,243],[174,-162],[49,-266],[92,-244],[115,-196],[234,-105],[315,35],[365,12],[250,35],[364,0],[262,11],[364,-23],[310,-46],[196,-186],[-54,-220],[179,-173],[299,-139],[310,-151],[360,-104],[375,-92],[283,-93],[315,-12],[180,197],[245,-162],[212,-185],[245,-139],[337,-58],[321,-69],[136,-232],[316,-139],[212,-208],[310,-93],[321,12],[299,-35],[332,12],[332,-47],[310,-81],[288,-139],[289,-116],[195,-173],[-32,-232],[-147,-208],[-125,-266],[-98,-209],[-131,-243],[-364,-93],[-163,-208],[-360,-127],[-125,-232],[-190,-220],[-201,-185],[-115,-243],[-70,-220],[-28,-266],[6,-220],[158,-232],[60,-220],[130,-208],[517,-81],[109,-255],[-501,-93],[-424,-127],[-528,-23],[-234,-336],[-49,-278],[-119,-220],[-147,-220],[370,-196],[141,-244],[239,-219],[338,-197],[386,-186],[419,-185],[636,-185],[142,-289],[800,-128],[53,-45],[208,-175],[767,151],[636,-186],[-99504,-147],[245,344],[501,-185],[32,21],[294,188]],[[54716,79012],[-21,-241],[-156,-2],[53,-128],[-92,-380]],[[54500,78261],[-53,-100],[-243,-14],[-140,-134],[-229,45]],[[53835,78058],[-398,153],[-62,205],[-274,-102],[-32,-113],[-169,84]],[[52900,78285],[-142,16],[-125,108],[42,145],[-10,104]],[[52665,78658],[83,33],[141,-164],[39,156],[245,-25],[199,106],[133,-18],[87,-121],[26,100],[-40,385],[100,75],[98,272]],[[53776,79457],[206,-190],[157,242],[98,44],[215,-180],[131,30],[128,-111]],[[54711,79292],[-23,-75],[28,-205]],[[62817,73469],[-190,78],[-141,273],[-44,223]],[[63720,73858],[-48,-207],[-101,-138]],[[63578,73220],[-69,-29],[-173,309],[95,292],[-82,174],[-104,-44],[-327,-436]],[[62492,74950],[68,96],[207,-169],[149,-36],[38,70],[-136,319],[72,82]],[[62890,75312],[78,-20],[191,-359],[122,-40],[48,150],[166,238]],[[58149,47921],[-17,713],[-70,268]],[[58062,48902],[169,-46],[85,336],[147,-38]],[[58463,49154],[16,-233],[60,-134],[3,-192],[-69,-124],[-108,-308],[-101,-214],[-115,-28]],[[50920,80916],[204,-47],[257,123],[176,-258],[153,-138]],[[51710,80596],[-32,-400]],[[51678,80196],[-72,-22],[-30,-331]],[[51576,79843],[-243,269],[-143,-46],[-194,279],[-129,237],[-129,10],[-40,207]],[[50518,54209],[-69,407],[13,1357],[-56,122],[-11,290],[-96,207],[-85,174],[35,311]],[[50249,57077],[96,67],[56,258],[136,56],[61,176]],[[50598,57634],[93,173],[100,2],[212,-340]],[[51003,57469],[-11,-197],[62,-350],[-54,-238],[29,-159],[-135,-366],[-86,-181],[-52,-372],[7,-376],[-16,-952]],[[49214,56277],[-190,152],[-130,-22],[-97,-149],[-125,125],[-49,195],[-125,129]],[[48498,56707],[-18,343],[76,250],[-7,200],[221,490],[41,405],[76,144],[134,-79],[116,120],[38,152],[216,265],[53,184],[259,246],[153,84],[70,-114],[178,3]],[[50104,59400],[-22,-286],[37,-269],[156,-386],[9,-286],[320,-134],[-6,-405]],[[50249,57077],[-243,13]],[[50006,57090],[-128,47],[-90,-96],[-123,43],[-482,-27],[-7,-336],[38,-444]],[[75742,63602],[-6,-424],[-97,90],[18,-476]],[[75657,62792],[-79,308],[-16,301],[-53,285]],[[74730,63611],[-43,486],[-96,444],[47,356],[-171,159],[62,215],[173,220],[-200,313],[98,401],[220,-255],[133,-30],[24,-410],[265,-81],[257,8],[160,-101],[-128,-500],[-124,-34],[-86,-336],[152,-306],[46,377],[76,2],[147,-937]],[[56293,76715],[80,-243],[108,43],[213,-92],[408,-31],[138,150],[327,138],[202,-215],[163,-62]],[[57776,75399],[-239,79],[-283,-186]],[[57254,75292],[-3,-294],[-252,-56],[-196,206],[-222,-162],[-206,17]],[[56375,75003],[-20,391],[-139,189]],[[56216,75583],[46,84],[-30,70],[47,188],[105,185],[-135,255],[-24,216],[68,134]],[[55279,77084],[100,2],[-69,-260],[134,-227],[-41,-278],[-65,-27]],[[55338,76294],[-52,-53],[-90,-138],[-41,-325]],[[55155,75778],[-246,224],[-105,247],[-106,130],[-127,221],[-61,183],[-136,277],[59,245],[99,-136],[60,123],[130,13],[239,-98],[192,8],[126,-131]],[[56523,82432],[268,-4],[302,223],[64,333],[228,190],[-26,264]],[[57359,83438],[169,100],[298,228]],[[57826,83766],[293,-149],[39,-146],[146,70],[272,-141],[27,-277],[-60,-159],[174,-387],[113,-108],[-16,-107],[187,-104],[80,-157],[-108,-129],[-224,20],[-54,-55],[66,-196],[68,-379]],[[58829,81362],[-239,-35],[-85,-129],[-18,-298],[-111,57],[-250,-28],[-73,138],[-104,-103],[-105,86],[-218,12],[-310,141],[-281,47],[-215,-14],[-152,-160],[-133,-23]],[[56535,81053],[-6,263],[-85,274],[166,121],[2,235],[-77,225],[-12,261]],[[25238,61101],[-2,87],[33,27],[51,-70],[99,357],[53,8]],[[25297,59966],[-83,0],[22,667],[2,468]],[[31359,37147],[-200,-81],[-109,814],[-150,663],[88,572],[-146,250],[-37,426],[-136,402]],[[30669,40193],[175,638],[-119,496],[63,199],[-49,219],[108,295],[6,503],[13,415],[60,200],[-240,951]],[[30686,44109],[206,-50],[143,13],[62,179],[243,239],[147,222],[363,100],[-29,-443],[34,-227],[-23,-396],[302,-529],[311,-98],[109,-220],[188,-117],[115,-172],[175,6],[161,-175],[12,-342],[55,-172],[3,-255],[-81,-10],[107,-688],[533,-24],[-41,-342],[30,-233],[151,-166],[66,-367],[-49,-465],[-77,-259],[27,-337],[-87,-122]],[[33842,38659],[-4,182],[-259,302],[-258,9],[-484,-172],[-133,-520],[-7,-318],[-110,-708]],[[34826,35372],[54,341],[38,350],[0,325],[-100,107],[-104,-96],[-103,26],[-33,228],[-26,541],[-52,177],[-187,160],[-114,-116],[-293,113],[18,802],[-82,329]],[[30686,44109],[-157,-102],[-126,68],[18,898],[-228,-348],[-245,15],[-105,315],[-184,34],[59,254],[-155,359],[-115,532],[73,108],[0,250],[168,171],[-28,319],[71,206],[20,275],[318,402],[227,114],[37,89],[251,-28]],[[30585,48040],[125,1620],[6,256],[-43,339],[-123,215],[1,430],[156,97],[56,-61],[9,226],[-162,61],[-4,370],[541,-13],[92,203],[77,-187],[55,-349],[52,73]],[[31423,51320],[153,-312],[216,38],[54,181],[206,138],[115,97],[32,250],[198,168],[-15,124],[-235,51],[-39,372],[12,396],[-125,153],[52,55],[206,-76],[221,-148],[80,140],[200,92],[310,221],[102,225],[-37,167]],[[33129,53652],[145,26],[64,-136],[-36,-259],[96,-90],[63,-274],[-77,-209],[-44,-502],[71,-299],[20,-274],[171,-277],[137,-29],[30,116],[88,25],[126,104],[90,157],[154,-50],[67,21]],[[34294,51702],[151,-48],[25,120],[-46,118],[28,171],[112,-53],[131,61],[159,-125]],[[34854,51946],[121,-122],[86,160],[62,-25],[38,-166],[133,42],[107,224],[85,436],[164,540]],[[35174,30629],[-77,334],[122,280],[-160,402],[-218,327],[-286,379],[-103,-18],[-279,457],[-180,-63]],[[82069,53798],[-13,-291],[-16,-377],[-133,19],[-58,-202],[-126,307]],[[75471,66988],[113,-189],[-20,-363],[-227,-17],[-234,39],[-175,-92],[-252,224],[-6,119]],[[74670,66709],[184,439],[150,150],[198,-137],[147,-14],[122,-159]],[[58175,37528],[-393,-435],[-249,-442],[-93,-393],[-83,-222],[-152,-47],[-48,-283],[-28,-184],[-178,-138],[-226,29],[-133,166],[-117,71],[-135,-137],[-68,-283],[-132,-177],[-139,-264],[-199,-60],[-62,207],[26,360],[-165,562],[-75,88]],[[55526,35946],[0,1725],[274,20],[8,2105],[207,19],[428,207],[106,-243],[177,231],[85,2],[156,133]],[[56967,40145],[50,-44]],[[57017,40101],[107,-473],[56,-105],[87,-342],[315,-649],[119,-64],[0,-208],[82,-375],[215,-90],[177,-267]],[[54244,54965],[229,44],[52,152],[46,-11],[69,-134],[350,226],[118,230],[145,207],[-28,208],[78,54],[269,-36],[261,273],[201,645],[141,239],[176,101]],[[56351,57163],[31,-253],[160,-369],[1,-241],[-45,-246],[18,-184],[96,-170]],[[56612,55700],[212,-258]],[[56824,55442],[152,-239],[2,-192],[187,-308],[116,-255],[70,-355],[208,-234],[44,-187]],[[57603,53672],[-91,-63],[-178,14],[-209,62],[-104,-51],[-41,-143],[-90,-18],[-110,125],[-309,-295],[-127,60],[-38,-46],[-83,-357],[-207,115],[-203,59],[-177,218],[-229,200],[-149,-190],[-108,-300],[-25,-412]],[[55125,52650],[-178,33],[-188,99],[-166,-313],[-146,-550]],[[54447,51919],[-29,172],[-12,269],[-127,190],[-103,305],[-23,212],[-132,309],[23,176],[-28,249],[21,458],[67,107],[140,599]],[[26228,91219],[16,649],[394,-46]],[[25824,89109],[-81,-259],[-322,-399]],[[23714,86094],[-16,-686],[409,-99]],[[25743,83665],[348,-163],[294,-248]],[[28738,83981],[-23,395],[-188,502]],[[31513,79609],[415,58],[246,-289]],[[31350,77248],[-181,334],[0,805],[-123,171],[-187,-100],[-92,155],[-212,-446],[-84,-460],[-99,-269],[-118,-91],[-89,-30],[-28,-146],[-512,0],[-422,-4],[-125,-109],[-294,-425],[-34,-46],[-89,-231],[-255,1],[-273,-3],[-125,-93],[44,-116],[25,-181],[-5,-60],[-363,-293],[-286,-93],[-323,-316],[-70,0],[-94,93],[-31,85],[6,61],[61,207],[131,325],[81,349],[-56,514],[-59,536],[-290,277],[35,105],[-41,73],[-76,0],[-56,93],[-14,140],[-54,-61],[-75,18],[17,59],[-65,58],[-27,155],[-216,189],[-224,197],[-272,229],[-261,214],[-248,-167],[-91,-6],[-342,154],[-225,-77],[-269,183],[-284,94],[-194,36],[-86,100],[-49,325],[-94,-3],[-1,-227],[-575,0],[-951,0],[-944,0],[-833,0],[-834,0],[-819,0],[-847,0],[-273,0],[-825,0],[-788,0]],[[15104,80367],[-503,244],[-155,523],[40,363]],[[13740,82958],[154,285],[-7,373],[-473,376],[-284,674],[-173,424],[-255,266],[-187,242],[-147,306],[-279,-192],[-270,-330],[-247,388],[-194,259],[-271,164],[-273,17],[1,3364],[2,2193]],[[11355,91625],[438,-285],[289,-54]],[[15437,92031],[38,-449],[341,97]],[[17987,91291],[374,-300],[-390,-293]],[[19722,91216],[-704,-88],[-494,-56]],[[15020,93041],[119,250],[192,432]],[[16539,93012],[0,-257],[-731,-285]],[[52900,78285],[-22,-242],[-122,-100],[-206,75],[-60,-239],[-132,-19],[-48,94],[-156,-200],[-134,-28],[-120,126]],[[51900,77752],[-95,259],[-133,-92],[5,267],[203,332],[-9,150],[126,-54],[77,101]],[[52074,78715],[236,-4],[57,128],[298,-181]],[[31400,18145],[-92,-239],[-238,-183]],[[31070,17723],[-137,19],[-164,48]],[[30769,17790],[-202,177],[-291,86],[-350,330],[-283,317],[-383,662],[229,-124],[390,-395],[369,-212],[143,271],[90,405],[256,244],[198,-70]],[[29661,27385],[-80,576],[-22,666]],[[30452,39739],[143,151],[74,303]],[[86288,75628],[-179,348],[-111,-331],[-429,-254],[44,-312],[-241,22],[-131,185],[-191,-419],[-306,-318],[-227,-379]],[[83030,72705],[220,-173],[311,422]],[[83987,72709],[45,-310],[-393,-165]],[[83097,71205],[299,-325],[109,-581]],[[80517,63220],[-373,189],[-131,-96]],[[80013,63313],[-280,154],[-132,240],[44,340],[-254,108],[-134,222],[-236,-315],[-271,-68],[-221,3],[-149,-145]],[[78380,63852],[-144,-86],[42,-676],[-148,16],[-25,139]],[[78105,63245],[-9,244],[-203,-172],[-121,109],[-206,222],[81,490],[-176,115],[-66,544],[-293,-98],[33,701],[263,493],[11,487],[-8,452],[-121,141],[-93,348],[-162,-44]],[[77035,67277],[-300,89],[94,248],[-130,367],[-198,-249],[-233,145],[-321,-376],[-252,-439],[-224,-74]],[[74670,66709],[-23,465],[-170,-124]],[[74477,67050],[-324,57],[-314,136],[-225,259],[-216,117],[-93,284],[-157,84],[-280,385],[-223,182],[-115,-141]],[[72530,68413],[-386,413],[-273,374],[-78,651],[200,-79],[9,301],[-111,303],[28,482],[-298,692]],[[71621,71550],[-457,239],[-82,454],[-205,276]],[[70827,72688],[-42,337],[10,230],[-169,134],[-91,-59],[-70,546]],[[70465,73876],[79,136],[-39,138],[266,279],[192,116],[294,-80],[105,378],[356,70],[99,234],[438,320],[39,134]],[[72294,75601],[-22,337],[190,154],[-250,1026],[550,236],[143,131],[200,1058],[551,-194],[155,267],[13,592],[230,56],[212,393]],[[74266,79657],[109,49]],[[74375,79706],[73,-413],[233,-313],[396,-222],[192,-476],[-107,-690],[100,-256],[330,-101],[374,-83],[336,-368],[171,-66],[127,-544],[163,-351],[306,14],[574,-133],[369,82],[274,-88],[411,-359],[336,1],[123,-184],[324,318],[448,205],[417,22],[324,208],[200,316],[194,199],[-45,195],[-89,227],[146,381],[156,-53],[286,-120],[277,313],[423,229],[204,391],[195,168],[404,78],[219,-66],[30,210],[-251,413],[-223,189],[-214,-219],[-274,92],[-157,-74],[-72,241],[197,590],[135,446]],[[82410,80055],[333,-223],[392,373],[-3,260],[251,627],[155,189],[-4,326],[-152,141],[229,294],[345,106],[369,16],[415,-176],[244,-217],[172,-596],[104,-254],[97,-363],[103,-579],[483,-189],[329,-420],[112,-555],[423,-1],[240,233],[459,175],[-146,-532],[-107,-216],[-96,-647],[-186,-575],[-338,104],[-238,-208],[73,-506],[-40,-698],[-142,-16],[2,-300]],[[47857,53158],[22,487],[26,74],[-8,233],[-118,247],[-88,40],[-81,162],[60,262],[-28,286],[13,172]],[[47655,55121],[44,0],[17,258],[-22,114],[27,82],[103,71],[-69,473],[-64,245],[23,200],[55,46]],[[47769,56610],[36,54],[77,-89],[215,-5],[51,172],[48,-11],[80,67],[43,-253],[65,74],[114,88]],[[49214,56277],[74,-841],[-117,-496],[-73,-667],[121,-509],[-13,-233]],[[53632,51919],[-35,32],[-164,-76],[-169,79],[-132,-38]],[[53132,51916],[-452,13]],[[52680,51929],[40,466],[-108,391]],[[52429,53151],[-72,85],[4,163]],[[52361,53399],[71,418],[132,570],[81,6],[165,345],[105,10],[156,-243],[191,199],[26,246],[63,238],[43,299],[148,243],[56,414],[59,132],[39,307],[74,377],[234,457],[14,196],[31,107],[-110,235]],[[53939,57955],[9,188],[78,34]],[[54026,58177],[111,-378],[18,-392],[-10,-393],[151,-537],[-155,6],[-78,-42],[-127,60],[-60,-279],[164,-345],[121,-100],[39,-245],[87,-407],[-43,-160]],[[54447,51919],[-20,-319],[-220,140],[-225,156],[-350,23]],[[58564,52653],[-16,-691],[111,-80],[-89,-210],[-107,-157],[-106,-308],[-59,-274],[-15,-475],[-65,-225],[-2,-446]],[[58216,49787],[-80,-165],[-10,-351],[-38,-46],[-26,-323]],[[58149,47921],[50,-544],[-27,-307]],[[58172,47070],[55,-343],[161,-330]],[[58388,46397],[150,-745]],[[58538,45652],[-109,60],[-373,-99],[-75,-71],[-79,-377],[62,-261],[-49,-699],[-34,-593],[75,-105],[194,-230],[76,107],[23,-637],[-212,5],[-114,325],[-103,252],[-213,82],[-62,310],[-170,-187],[-222,83],[-93,268],[-176,55],[-131,-15],[-15,184],[-96,15]],[[53609,47755],[73,-60],[95,226],[152,-6],[17,-167],[104,-105],[164,370],[161,289],[71,189],[-10,486],[121,574],[127,304],[183,285],[32,189],[7,216],[45,205],[-14,335],[34,524],[55,368],[83,316],[16,357]],[[57603,53672],[169,-488],[124,-71],[75,99],[128,-39],[155,125],[66,-252],[244,-393]],[[53081,48229],[212,326],[-105,391],[95,148],[187,73],[23,261],[148,-283],[245,-25],[85,279],[36,393],[-31,461],[-131,350],[120,684],[-69,117],[-207,-48],[-78,305],[21,258]],[[29063,50490],[-119,140],[-137,195],[-79,-94],[-235,82],[-68,255],[-52,-10],[-278,338]],[[28366,54848],[36,287],[89,-43],[52,176],[-64,348],[34,86]],[[30185,57537],[-178,-99],[-71,-295],[-107,-169],[-81,-220],[-34,-422],[-77,-345],[144,-40],[35,-271],[62,-130],[21,-238],[-33,-219],[10,-123],[69,-49],[66,-207],[357,57],[161,-75],[196,-508],[112,63],[200,-32],[158,68],[99,-102],[-50,-318],[-62,-199],[-22,-423],[56,-393],[79,-175],[9,-133],[-140,-294],[100,-130],[74,-207],[85,-589]],[[30585,48040],[-139,314],[-83,14],[179,602],[-213,276],[-166,-51],[-101,103],[-153,-157],[-207,74],[-163,620],[-129,152],[-89,279],[-184,280],[-74,-56]],[[26191,57131],[42,76],[183,-156],[63,77],[89,-50],[46,-121],[82,-40],[66,126]],[[27070,56232],[-107,-53],[1,-238],[58,-88],[-41,-70],[10,-107],[-23,-120],[-14,-117]],[[59437,71293],[-30,21],[-53,-45],[-42,12],[-14,-22],[-5,59],[-20,37],[-54,6],[-75,-51],[-52,31]],[[53776,79457],[-157,254],[-141,142],[-30,249],[-49,176],[202,129],[103,147],[200,114],[70,113],[73,-68],[124,62]],[[54171,80775],[132,-191],[207,-51],[-17,-163],[151,-122],[41,153],[191,-66],[26,-185],[207,-36],[127,-291]],[[55236,79823],[-82,-1],[-43,-106],[-64,-26],[-18,-134],[-54,-28],[-7,-55],[-95,-61],[-123,10],[-39,-130]],[[53922,82340],[64,-300],[-77,-158],[101,-210],[69,-316],[-22,-204],[114,-377]],[[52074,78715],[35,421],[140,404],[-400,109],[-131,155]],[[51718,79804],[16,259],[-56,133]],[[51710,80596],[-47,619],[167,0],[70,222],[69,541],[-51,200]],[[52368,83053],[210,-78],[178,90]],[[61984,57352],[-102,-317]],[[61882,57035],[-62,106],[-67,-42],[-155,10],[-4,180],[-22,163],[94,277],[98,261]],[[61764,57990],[119,-51],[83,144]],[[52293,84144],[80,177],[244,37]],[[30081,61241],[5,161],[-71,177],[68,99],[21,228],[-24,321]],[[53333,64447],[-952,-1126],[-804,-1161],[-392,-263]],[[51185,61897],[-308,-58],[-3,376],[-129,96],[-173,169],[-66,277],[-937,1289],[-937,1289]],[[48632,65335],[-1045,1431]],[[47587,66766],[6,114],[-1,40]],[[47592,66920],[-2,700],[449,436],[277,90],[227,159],[107,295],[324,234],[12,438],[161,51],[126,219],[363,99],[51,230],[-73,125],[-96,624],[-17,359],[-104,379]],[[52339,72408],[-57,-303],[44,-563],[-65,-487],[-171,-330],[24,-445],[227,-352],[3,-143],[171,-238],[118,-1061]],[[52633,68486],[90,-522],[15,-274],[-49,-482],[21,-270],[-36,-323],[24,-371],[-110,-247],[164,-431],[11,-253],[99,-330],[130,109],[219,-275],[122,-370]],[[29063,50490],[38,-449],[-86,-384],[-303,-619],[-334,-233],[-170,-514],[-53,-398],[-157,-243],[-116,298],[-113,64],[-114,-47],[-8,216],[79,141],[-33,246]],[[60240,63578],[-1102,0],[-1077,0],[-1117,0]],[[56944,63578],[0,2175],[0,2101],[-83,476],[71,365],[-43,253],[101,283]],[[59518,69025],[182,-1015]],[[61764,57990],[-95,191],[-114,346],[-124,190],[-71,204],[-242,237],[-191,7],[-67,124],[-163,-139],[-168,268],[-87,-441],[-323,124]],[[60119,59101],[-30,236],[120,868],[27,393],[88,181],[204,97],[141,337]],[[60669,61213],[161,-684],[77,-542]],[[47783,76427],[340,-106],[373,3]],[[49471,76235],[111,-230],[511,-268],[101,127],[313,-267],[322,77]],[[49600,72702],[-197,-454],[-352,-9]],[[47929,72498],[-23,195],[103,222],[38,161],[-96,175],[77,388],[-111,355],[120,48],[11,280],[45,86],[3,461],[129,160],[-78,296],[-162,21],[-47,-75],[-164,0],[-70,289],[-113,-86],[-101,-150]],[[57772,85719],[42,-103],[-198,-341],[83,-551],[-120,-187]],[[57579,84537],[-229,1],[-239,219],[-121,73],[-237,-105]],[[61882,57035],[-61,-209],[103,-325],[102,-285],[106,-210],[909,-702],[233,4]],[[63274,55308],[-785,-1773],[-362,-26],[-247,-417],[-178,-11],[-76,-186]],[[61626,52895],[-190,0],[-112,200],[-254,-247],[-82,-247],[-185,47],[-62,68],[-65,-16],[-87,6],[-352,502],[-193,0],[-95,194],[0,332],[-145,99]],[[59804,53833],[-164,643],[-127,137],[-48,236],[-141,288],[-171,42],[95,337],[147,14],[42,181]],[[59437,55711],[-4,531]],[[59433,56242],[82,618],[132,166],[28,241],[119,451],[168,293],[112,582],[45,508]],[[57942,91385],[-41,-414],[425,-394],[-256,-445],[323,-673],[-187,-506],[250,-440],[-113,-385],[411,-405],[-105,-301],[-258,-341],[-594,-755]],[[56352,85938],[-161,323],[-269,193],[62,582]],[[55984,87036],[-135,533],[133,345]],[[56639,89578],[-93,230],[-8,910],[-433,402],[-371,289]],[[55734,91409],[167,156],[309,-312],[362,29],[298,-143],[265,262],[137,433],[431,200],[356,-235],[-117,-414]],[[34854,51946],[70,252],[24,269],[48,253],[-107,349]],[[34889,53069],[-22,404],[144,508]],[[51576,79843],[62,-52],[80,13]],[[51900,77752],[-11,-167],[82,-222],[-97,-180],[72,-457],[151,-75],[-32,-256]],[[49176,78685],[-424,227],[-28,431]],[[52636,51176],[94,35],[404,-6],[-2,711]],[[48278,82406],[-210,122],[-172,-9],[57,317],[-57,317]],[[49420,83612],[22,-62],[248,-697]],[[49690,82853],[190,-95],[171,-673],[79,-233],[337,-113],[-34,-378],[-142,-173],[111,-305],[-250,-310],[-371,6],[-473,-163],[-130,116],[-183,-276],[-257,67],[-195,-226],[-148,118],[407,621],[249,127]],[[49051,80963],[-2,1],[-434,98]],[[48615,81062],[-79,235],[291,183],[-152,319],[52,387]],[[48727,82186],[413,-54],[1,0]],[[49141,82132],[40,343]],[[49181,82475],[-186,364],[-4,8]],[[48991,82847],[-337,104],[-66,160],[101,264],[-92,163],[-149,-279],[-17,569],[-140,301],[101,611],[216,480],[222,-47],[335,49],[-297,-639],[283,81],[304,-3],[-72,-481],[-250,-530],[287,-38]],[[61098,76242],[34,70],[235,-101],[409,-96],[378,-283],[48,-110],[169,93],[259,-124],[85,-242],[175,-137]],[[62106,74858],[-268,290],[-296,-28]],[[50006,57090],[-20,-184],[116,-305],[-1,-429],[27,-466],[69,-215],[-61,-532],[22,-294],[74,-375],[62,-207]],[[47655,55121],[-78,15],[-57,-238],[-78,3],[-55,126],[19,237],[-116,362],[-73,-67],[-59,-13]],[[47158,55546],[-77,-34],[3,217],[-44,155],[9,171],[-60,249],[-78,211],[-222,1],[-65,-112],[-76,-13],[-48,-128],[-32,-163],[-148,-260]],[[45797,57103],[123,288],[84,-11],[73,99],[61,1],[44,78],[-24,196],[31,62],[5,200]],[[46194,58016],[134,-6],[200,-144],[61,13],[21,66],[151,-47],[40,33]],[[46801,57931],[16,-216],[44,1],[73,78],[46,-19],[77,-150],[119,-48],[76,128],[90,79],[67,83],[55,-15],[62,-130],[33,-163],[114,-248],[-57,-152],[-11,-192],[59,58],[35,-69],[-15,-176],[85,-170]],[[45357,58612],[302,17],[63,140],[88,9],[110,-145],[86,-3],[92,99],[56,-170],[-120,-133],[-121,11],[-119,124],[-103,-136],[-50,-5],[-67,-83],[-253,13]],[[45367,57897],[147,96],[92,-19],[75,67],[513,-25]],[[56638,74190],[-154,-1],[-147,305]],[[56486,73734],[-105,-129],[155,-273]],[[56431,72099],[-184,-8],[-228,257],[-104,473]],[[55838,74710],[182,53],[106,129],[150,-12],[46,103],[53,20]],[[57254,75292],[135,-157],[-86,-369],[-66,-67]],[[24381,59170],[7,172],[32,138],[-39,111],[133,481],[357,2],[7,201],[-45,36],[-31,128],[-103,136],[-103,198],[125,1],[1,333],[259,1],[257,-7]],[[25493,59872],[-127,-225],[-131,-166],[-20,-113],[22,-116],[-58,-150]],[[25179,59102],[-65,-37],[15,-69],[-52,-66],[-95,-149],[-9,-86]],[[34125,54109],[-44,-532],[-169,-154],[15,-139],[-51,-305],[123,-429],[89,-1],[37,-333],[169,-514]],[[33129,53652],[-188,448],[75,163],[-5,273],[171,95],[69,110],[-95,220],[24,215],[220,347]],[[25697,58436],[-84,51]],[[25613,58487],[19,237],[-38,64],[-57,42],[-122,-70],[-10,79],[-84,95],[-60,118],[-82,50]],[[25860,59889],[128,15],[90,66]],[[26903,59440],[-95,12],[-38,-81],[-97,-77],[-70,0],[-61,-76],[-56,27],[-47,90],[-29,-17],[-36,-141],[-27,5],[-4,-121],[-97,-163],[-51,-70],[-29,-74],[-82,120],[-60,-158],[-58,4],[-65,-14],[6,-290],[-41,-5],[-35,-135],[-86,-25]],[[55230,77704],[67,-229],[89,-169],[-107,-222]],[[55155,75778],[-31,-100]],[[54448,76285],[-233,434],[56,45]],[[53809,77462],[194,-20],[51,100],[94,-97],[109,-11],[-1,165],[97,60],[27,239],[221,157]],[[54601,78055],[88,-73],[208,-253],[229,-114],[104,89]],[[54716,79012],[141,-151],[103,-65],[233,73],[22,118],[111,18],[135,92],[30,-38],[130,74],[66,139],[91,36],[297,-180],[59,61]],[[56134,79189],[155,-161],[19,-159]],[[56308,78869],[-170,-123],[-131,-401],[-168,-401],[-223,-111]],[[55616,77833],[-173,26],[-213,-155]],[[54601,78055],[-54,200],[-47,6]],[[84713,45326],[28,-117],[5,-179]],[[89166,49043],[5,-1925],[4,-1925]],[[80461,51765],[47,-395],[190,-334],[179,121],[177,-43],[162,299],[133,52],[263,-166],[226,126],[143,822],[107,205],[96,672],[319,0],[241,-100]],[[72530,68413],[-176,-268],[-108,-553],[269,-224],[262,-289],[362,-332],[381,-76],[160,-301],[215,-56],[334,-138],[231,10],[32,234],[-36,375],[21,255]],[[77035,67277],[20,-224],[-97,-108],[23,-364],[-199,107],[-359,-408],[8,-338],[-153,-496],[-14,-288],[-124,-487],[-217,135],[-11,-612],[-63,-201],[30,-251],[-137,-140]],[[73107,61020],[-276,-387],[-1,-271]],[[72692,60216],[-251,-212],[-129,-31]],[[71996,56025],[-253,-168],[-93,-401]],[[68937,64577],[185,395],[612,-2],[-56,507],[-156,300],[-31,455],[-182,265],[306,619],[323,-45],[290,620],[174,599],[270,593],[-4,421],[236,342],[-224,292],[-96,400],[-99,517],[137,255],[421,-144],[310,88],[268,496]],[[64978,72558],[244,114],[197,338],[186,-17],[122,110],[197,-55],[308,-299],[221,-65],[318,-523],[207,-21],[24,-498]],[[66909,68203],[137,-310],[112,-357],[266,-260],[7,-520],[133,-96],[23,-272],[-400,-305],[-105,-687]],[[66559,65575],[-303,136],[-313,76]],[[63594,68492],[-104,-231]],[[63490,68261],[-153,311],[-3,314],[-89,0],[46,428],[-143,449],[-340,324],[-193,562],[65,461],[139,204],[-21,345],[-182,177],[-180,705]],[[62436,72541],[-152,473],[55,183],[-87,678],[190,168]],[[63326,68290],[-187,49],[-204,-567]],[[62935,67772],[-516,47],[-784,1188],[-413,414],[-335,160]],[[60887,69581],[-112,720]],[[60775,70301],[615,614],[105,715],[-26,431],[152,146],[142,369]],[[61763,72576],[119,92],[324,-77],[97,-150],[133,100]],[[63490,68261],[-164,29]],[[59873,69719],[-100,82],[-58,-394],[69,-66],[-71,-81],[-12,-156],[131,80]],[[59832,69184],[7,-230],[-139,-944]],[[59757,70130],[93,-1],[25,104],[75,8]],[[59950,70241],[4,-242],[-38,-90],[6,-4]],[[59922,69905],[-49,-186]],[[53835,78058],[-31,-291],[67,-251]],[[54413,75123],[249,-214],[204,-178]],[[53108,75604],[-189,340],[-86,585]],[[59922,69905],[309,-234],[544,630]],[[60887,69581],[-53,-89],[-556,-296],[277,-591],[-92,-101],[-46,-197],[-212,-82],[-66,-213],[-120,-182],[-310,94]],[[59832,69184],[41,173],[0,362]],[[69711,75551],[-159,-109],[-367,-412],[-121,-422],[-104,-4],[-76,280],[-353,19],[-57,484],[-135,4],[21,593],[-333,431],[-476,-46],[-326,-86],[-265,533],[-227,223],[-431,423],[-52,51],[-715,-349],[11,-2178]],[[65546,74986],[-142,-29],[-195,463],[-188,166],[-315,-123],[-123,-197]],[[63639,77993],[-142,96],[29,304],[-177,395],[-207,-17],[-235,401],[160,448],[-81,120],[222,649],[285,-342],[35,431],[573,643],[434,15],[612,-409],[329,-239],[295,249],[440,12],[356,-306],[80,175],[391,-25],[69,280],[-450,406],[267,288],[-52,161],[266,153],[-200,405],[127,202],[1039,205],[136,146],[695,218],[250,245],[499,-127],[88,-612],[290,144],[356,-202],[-23,-322],[267,33],[696,558],[-102,-185],[355,-457],[620,-1500],[148,309],[383,-340],[399,151],[154,-106],[133,-341],[194,-115],[119,-251],[358,79],[147,-361]],[[72294,75601],[-171,87],[-140,212],[-412,62],[-461,16],[-100,-65],[-396,248],[-158,-122],[-43,-349],[-457,204],[-183,-84],[-62,-259]],[[60889,47817],[-399,590],[-19,343],[-1007,1203],[-47,65]],[[59417,50018],[-3,627],[80,239],[137,391],[101,431],[-123,678],[-32,296],[-132,411]],[[59445,53091],[171,352],[188,390]],[[61626,52895],[-243,-670],[3,-2152],[165,-488]],[[70465,73876],[-526,-89],[-343,192],[-301,-46],[26,340],[303,-98],[101,182]],[[69725,74357],[212,-58],[355,425],[-329,311],[-198,-147],[-205,223],[234,382],[-83,58]],[[78495,57780],[-66,713],[178,492],[359,112],[261,-84]],[[79227,59013],[229,-232],[126,407],[246,-217]],[[79828,58971],[64,-394],[-34,-708],[-467,-455],[122,-358],[-292,-43],[-240,-238]],[[85103,71220],[51,443],[-122,615]],[[85048,72883],[17,54],[124,-21],[108,266],[197,29],[118,39],[40,143]],[[55575,75742],[52,132]],[[55627,75874],[66,43],[38,196],[50,33],[40,-84],[52,-36],[36,-94],[46,-28],[54,-110],[39,4],[-31,-144],[-33,-71],[9,-44]],[[55993,75539],[-62,-23],[-164,-91],[-13,-121],[-35,5]],[[63448,67449],[-196,-16],[-69,282],[-248,57]],[[79227,59013],[90,266],[12,500],[-224,515],[-18,583],[-211,480],[-210,40],[-56,-205],[-163,-17],[-83,104],[-293,-353],[-6,530],[68,623],[-188,27],[-16,355],[-120,182]],[[77809,62643],[59,218],[237,384]],[[78380,63852],[162,-466],[125,-537],[342,-5],[108,-515],[-178,-155],[-80,-212],[333,-353],[231,-699],[175,-520],[210,-411],[70,-418],[-50,-590]],[[59999,71049],[125,-31],[45,-231],[-151,-223],[-68,-323]],[[47498,53435],[-252,449],[-237,324]],[[46822,54589],[66,189],[15,172],[126,320],[129,276]],[[54125,64088],[-197,-220],[-156,324],[-439,255]],[[52633,68486],[136,137],[24,250],[-30,244],[191,228],[86,189],[135,170],[16,454]],[[56646,69496],[276,-70],[68,-195]],[[56944,63578],[0,-1180],[-320,-2],[-3,-248]],[[56621,62148],[-1108,1131],[-1108,1132],[-280,-323]],[[57708,32474],[-209,454],[148,374],[151,232],[130,120],[121,-182],[96,-178],[-85,-288],[-47,-192],[-155,-93],[-51,-188],[-99,-59]],[[56314,82678],[-23,150],[30,162],[-123,94],[-291,103]],[[55848,83684],[318,181],[466,-38],[273,59],[39,-123],[148,-38],[267,-287]],[[56523,82432],[-67,182],[-142,64]],[[57579,84537],[134,-136],[24,-287],[89,-348]],[[47592,66920],[-42,0],[7,-317],[-172,-19],[-90,-134],[-126,0],[-100,76],[-234,-63],[-91,-460],[-86,-44],[-131,-745],[-386,-637],[-92,-816],[-114,-265],[-33,-213],[-625,-48],[-5,1]],[[45272,63236],[13,274],[106,161],[91,308],[-18,200],[96,417],[155,376],[93,95],[74,344],[6,315],[100,365],[185,216],[177,603]],[[46350,66910],[5,8],[139,227]],[[46494,67145],[259,65],[218,404],[140,158]],[[57394,79070],[66,87],[185,58],[204,-184],[115,-22],[125,-159],[-20,-200],[101,-97],[40,-247],[97,-150],[-19,-88],[52,-60],[-74,-44],[-164,18],[-27,81],[-58,-47],[20,-106],[-76,-188],[-49,-203],[-70,-64]],[[57842,77455],[-50,270],[30,252],[-9,259],[-160,352],[-89,249],[-86,175],[-84,58]],[[23016,65864],[-107,-518],[-49,-426],[-20,-791],[-27,-289],[48,-322],[86,-288],[56,-458],[184,-440],[65,-337],[109,-291],[295,-157],[114,-247],[244,165],[212,60],[208,106],[175,101],[176,241],[67,345],[22,496],[48,173],[188,155],[294,137],[246,-21],[169,50],[66,-125],[-9,-285],[-149,-351],[-66,-360],[51,-103],[-42,-255],[-69,-461],[-71,152],[-58,-10]],[[24067,59806],[-144,191],[-226,155]],[[19641,66203],[-142,138],[-164,287]],[[18570,68996],[-201,234],[-93,-25]],[[19362,64423],[-181,337],[-201,286]],[[17464,69802],[316,46],[353,64],[-26,-116],[419,-287],[634,-416],[552,4],[221,0],[0,244],[481,0],[102,-210],[142,-186],[165,-260],[92,-309],[69,-325],[144,-178],[230,-177],[175,467],[227,11],[196,-236],[139,-404],[96,-346],[164,-337],[61,-414],[78,-277],[217,-184],[197,-130],[108,18]],[[55993,75539],[95,35],[128,9]],[[46619,59216],[93,107],[47,348],[88,14],[194,-165],[157,117],[107,-39],[42,131],[1114,9],[62,414],[-48,73],[-134,2550],[-134,2550],[425,10]],[[51185,61897],[1,-1361],[-152,-394],[-24,-364],[-247,-94],[-379,-51],[-102,-210],[-178,-23]],[[46801,57931],[13,184],[-24,229],[-104,166],[-54,338],[-13,368]],[[77809,62643],[-159,-137],[-162,-256],[-196,-26],[-127,-639],[-117,-107],[134,-519],[177,-431],[113,-390],[-101,-514],[-96,-109],[66,-296],[185,-470],[32,-330],[-4,-274],[108,-539],[-152,-551],[-135,-607]],[[55338,76294],[74,-101],[40,-82],[91,-63],[106,-123],[-22,-51]],[[55380,75322],[-58,46]],[[74375,79706],[292,102],[530,509],[423,278],[242,-182],[289,-8],[186,-276],[277,-22],[402,-148],[270,411],[-113,348],[288,612],[311,-244],[252,-69],[327,-152],[53,-443],[394,-248],[263,109],[351,78],[279,-78],[272,-284],[168,-302],[258,6],[350,-96],[255,146],[366,98],[407,416],[166,-63],[146,-198],[331,49]],[[59599,43773],[209,48],[334,-166],[73,74],[193,16],[99,177],[167,-10],[303,230],[221,342]],[[59870,36949],[-45,-275],[65,-101]],[[59890,36573],[-41,-245],[-116,-211]],[[59119,34780],[-211,5]],[[58908,34785],[-24,261],[-41,265]],[[58843,35311],[-23,212],[49,659],[-72,419],[-133,832]],[[58664,37433],[292,671],[74,426],[42,53],[31,348],[-45,175],[12,442],[54,409],[0,748],[-145,190],[-132,43],[-60,146],[-128,125],[-232,-12],[-18,220]],[[58409,41417],[-26,421],[843,487]],[[59226,42325],[159,-284],[77,54],[110,-149],[16,-237],[-59,-274],[21,-417],[181,-365],[85,410],[120,124],[-24,760],[-116,427],[-100,191],[-97,-9],[-77,768],[77,449]],[[46619,59216],[-184,405],[-168,435],[-184,157],[-133,173],[-155,-6],[-135,-129],[-138,51],[-96,-189]],[[45260,62987],[60,197],[1088,-4],[-53,853],[68,304],[261,53],[-9,1512],[911,-31],[1,895]],[[59226,42325],[-147,153],[85,549],[87,205],[-53,490],[56,479],[47,160],[-71,501],[-131,264]],[[59099,45126],[273,-110],[55,-164],[95,-275],[77,-804]],[[77801,54399],[48,105],[227,-258],[22,-304],[183,71],[91,243]],[[56448,40227],[228,134],[180,-34],[109,-133],[2,-49]],[[55526,35946],[0,-2182],[-248,-302],[-149,-43],[-175,112],[-125,43],[-47,252],[-109,162],[-133,-292]],[[54125,64088],[68,-919],[104,-153],[4,-188],[116,-203],[-60,-254],[-107,-1199],[-15,-769],[-354,-557],[-120,-778],[115,-219],[0,-380],[178,-13],[-28,-279]],[[53939,57955],[-52,-13],[-188,647],[-65,24],[-217,-331],[-215,173],[-150,34],[-80,-83],[-163,18],[-164,-252],[-141,-14],[-337,305],[-131,-145],[-142,10],[-104,223],[-279,221],[-298,-70],[-72,-128],[-39,-340],[-80,-238],[-19,-527]],[[52072,53186],[-105,31],[-107,-132]],[[51398,53895],[-197,389],[-209,-7]],[[25647,58207],[31,91],[46,-88]],[[51063,81078],[244,869],[380,248]],[[58639,91676],[-473,-237],[-224,-54]],[[55734,91409],[-172,-24],[-41,-389],[-523,95],[-74,-329],[-267,2],[-183,-421],[-278,-655],[-431,-831],[101,-202],[-97,-234],[-275,10],[-180,-554],[17,-784],[177,-300],[-92,-694],[-231,-405],[-122,-341]],[[52328,85032],[-371,-138],[-384,301]],[[51474,85830],[-88,1363],[256,381]],[[65352,60997],[1,-238],[-134,-165]],[[64880,60451],[-128,-34]],[[64752,60417],[-91,413],[-217,975]],[[64444,61805],[833,591],[185,1182],[-127,418]],[[65945,64688],[203,-78],[165,-107]],[[68734,64727],[-83,424],[-215,450]],[[28212,55535],[-52,196],[-138,164]],[[27170,56020],[-6,-126],[111,-26]],[[55461,82736],[342,-67],[511,9]],[[56535,81053],[139,-515],[-29,-166],[-138,-69],[-252,-491],[71,-266],[-60,35]],[[56266,79581],[-264,227],[-200,-84],[-131,61],[-165,-127],[-140,210],[-114,-81],[-16,36]],[[86221,75560],[-120,-200],[-83,-202]],[[85048,72883],[-135,112],[-34,-111]],[[84641,73095],[76,260],[66,69]],[[84829,73851],[-18,96],[-163,65]],[[86288,75628],[39,-104]],[[64246,66009],[84,-185],[5,-346]],[[64274,65130],[-77,-42],[-84,117]],[[56308,78869],[120,127],[172,-65],[178,-3],[129,-144],[95,91],[205,56],[69,139],[118,0]],[[57842,77455],[124,-109],[131,95],[126,-101]],[[56293,76715],[-51,103],[65,99],[-69,74],[-87,-133],[-162,172],[-22,244],[-169,139],[-31,188],[-151,232]],[[81143,94175],[251,112],[141,-379]],[[84237,94144],[590,-104],[443,4]],[[97224,91732],[123,262],[886,-165]],[[96192,85904],[-126,219],[-268,-253]],[[95032,82989],[-486,-302],[-96,-674]],[[93543,84472],[14,276],[432,132]],[[95182,86999],[-705,-649],[-227,727]],[[90412,85637],[-914,-175],[-899,-1153]],[[88378,82339],[178,295],[305,-38]],[[89262,81946],[9,-503],[-217,-590]],[[60617,78409],[9,262],[143,165],[269,43],[44,197],[-62,326],[113,310],[-3,173],[-410,192],[-162,-6],[-172,277],[-213,-94],[-352,208],[6,116],[-99,256],[-222,29],[-23,183],[70,120],[-178,334],[-288,-57],[-84,30],[-70,-134],[-104,23]],[[58639,91676],[286,206],[456,-358],[761,-140],[1050,-668],[213,-281],[18,-393],[-308,-311],[-454,-157],[-1240,449],[-204,-75],[453,-433]],[[59670,89515],[18,-274],[18,-604]],[[59706,88637],[358,-180],[217,-153],[36,286]],[[60317,88590],[-168,254],[177,224]],[[60998,88700],[233,144],[-186,433]],[[62654,90499],[1,-328],[219,-203]],[[63371,90473],[580,282],[970,507]],[[69038,93080],[183,537],[206,116]],[[69427,93733],[736,-156],[57,-328]],[[70444,91717],[222,593],[-361,482]],[[72363,94093],[483,119],[669,-26]],[[58449,49909],[110,-333],[-16,-348],[-80,-74]],[[58216,49787],[67,-60],[166,182]],[[61883,60238],[-37,252],[-83,178]],[[60335,65400],[-77,306],[-81,132]],[[63741,66597],[190,-249],[16,-243]],[[64444,61805],[-801,-226],[-259,-266],[-199,-620],[-130,-99],[-70,197],[-106,-30],[-269,60],[-50,59],[-321,-14],[-75,-53],[-114,153],[-74,-290],[28,-249],[-121,-189]],[[56351,57163],[3,143],[-102,174],[-3,343],[-58,228],[-98,-34],[28,217],[72,246],[-32,245],[92,181],[-58,138],[73,365],[127,435],[240,-41],[-14,2345]],[[59433,56242],[1,-71]],[[59434,56171],[-39,12],[5,294],[-33,203],[-143,233],[-34,426],[34,436],[-129,41],[-19,-132],[-167,-30],[67,-173],[23,-355],[-152,-324],[-138,-426],[-144,-61],[-233,345],[-105,-122],[-29,-172],[-143,-112],[-9,-122],[-277,0],[-38,122],[-200,20],[-100,-101],[-77,51],[-143,344],[-48,163],[-200,-81],[-76,-274],[-72,-528],[-95,-111],[-85,-65]],[[56635,55672],[-23,28]],[[59445,53091],[-171,-272],[-195,1],[-224,-138],[-176,132],[-115,-161]],[[56824,55442],[-189,230]],[[59434,56171],[3,-460]],[[25613,58487],[-31,-139]],[[62075,57243],[54,-245],[125,-247]],[[63596,57321],[-2,-9],[-1,-244],[0,-596],[0,-308],[-125,-363],[-194,-493]],[[34889,53069],[109,-351],[-49,-254],[-24,-270],[-71,-248]],[[56266,79581],[-77,-154],[-55,-238]],[[58908,34785],[-56,-263],[-163,-63],[-166,320],[-2,204],[76,222],[26,172],[80,42],[140,-108]],[[60041,71744],[74,129],[75,130],[15,329],[91,-115],[306,165],[147,-112],[229,2],[320,222],[149,-10],[316,92]],[[68841,72526],[156,598],[-60,440],[-204,140],[72,261],[232,-28],[132,326],[89,380],[371,137],[-58,-274],[40,-164],[114,15]],[[65546,74986],[313,8],[-45,297],[237,204],[234,343],[374,-312],[30,-471],[106,-121],[301,27],[93,-108],[137,-609],[317,-408],[181,-278],[291,-289],[369,-253],[-7,-362]],[[53083,72381],[-139,-290],[-2,-273]],[[58441,72005],[-192,-70],[-268,314]],[[57981,72249],[-303,-11],[-165,588]],[[59768,75418],[485,-417],[399,-228]],[[57321,74302],[-87,276],[3,121]],[[59099,45126],[-157,177],[-177,100],[-111,99],[-116,150]],[[58388,46397],[-161,331],[-55,342]],[[58449,49909],[98,71],[304,-7],[566,45]],[[30523,76389],[-147,-351],[-47,-133]],[[30377,75084],[-133,11],[-205,-103]],[[29172,73738],[-61,30],[-91,148]],[[29077,73598],[69,-105],[5,-223]],[[28966,72994],[-142,225],[-33,491]],[[28797,73080],[-183,93],[191,-191]],[[27672,65472],[-83,-75],[-137,72]],[[27408,65728],[-105,136],[-148,508]],[[26747,68267],[-108,90],[-281,-268]],[[26309,68119],[-135,275],[-174,147]],[[25227,68491],[-114,-92],[50,-157]],[[24755,67801],[-207,312],[-242,-73]],[[16564,70932],[-71,95],[-33,324]],[[16460,71351],[-270,594],[-231,821],[10,137],[-123,195],[-215,495],[-38,482],[-148,323],[61,489],[-10,507],[-89,453],[109,557]],[[15516,76404],[34,536],[33,536]],[[15583,77476],[-50,792],[-88,506],[-80,274],[33,115],[402,-200],[148,-558]],[[15948,78405],[69,156],[-45,484],[-94,485]],[[10396,86079],[-385,-51],[-546,272]],[[8164,85656],[-308,-126],[-39,348]],[[7158,84934],[-299,-248],[-278,-180]],[[4985,85596],[50,216],[-179,211]],[[4541,89915],[-38,-296],[586,23]],[[4864,90008],[-342,225],[-197,296]],[[30102,56752],[-123,-344],[105,-468]],[[31762,56607],[213,-74],[155,185]],[[63521,58853],[-122,-33],[-83,35]],[[63153,58610],[-177,-114],[-233,-30]],[[62539,58233],[-43,-150],[-137,13]],[[64752,60417],[-201,-158]],[[57838,31217],[-210,-269],[-290,-229]],[[58175,37528],[113,-7],[134,-100],[94,71],[148,-59]],[[58409,41417],[-210,-81],[-159,-235],[-33,-205],[-100,-46],[-241,-486],[-154,-383],[-94,-13],[-90,68],[-311,65]]]}");

/***/ }),

/***/ "./components/CTA/Button.js":
/*!**********************************!*\
  !*** ./components/CTA/Button.js ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var recompose_withProps__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! recompose/withProps */ "recompose/withProps");
/* harmony import */ var recompose_withProps__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(recompose_withProps__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _CTA__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CTA */ "./components/CTA/CTA.jsx");


/* harmony default export */ __webpack_exports__["default"] = (recompose_withProps__WEBPACK_IMPORTED_MODULE_0___default()({
  isLink: false
})(_CTA__WEBPACK_IMPORTED_MODULE_1__["default"]));

/***/ }),

/***/ "./components/CTA/CTA.jsx":
/*!********************************!*\
  !*** ./components/CTA/CTA.jsx ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @emotion/styled-base */ "@emotion/styled-base");
/* harmony import */ var _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_emotion_styled_base__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! prop-types */ "prop-types");
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/link */ "./node_modules/next/link.js");
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var utils_prop_types__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! utils/prop-types */ "./utils/prop-types.js");
/* harmony import */ var styles__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! styles */ "./styles/index.js");
/* harmony import */ var styles_text__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! styles/text */ "./styles/text.js");
/* harmony import */ var styles_layout__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! styles/layout */ "./styles/layout.js");
/* harmony import */ var _emotion_core__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @emotion/core */ "@emotion/core");
/* harmony import */ var _emotion_core__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_emotion_core__WEBPACK_IMPORTED_MODULE_8__);

var _jsxFileName = "/Users/cliftoncampbell/Development/clif.world/components/CTA/CTA.jsx";
var __jsx = react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement;

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }










const StyledLink = _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()("a", {
  target: "ex4txm40",
  label: "StyledLink"
})(styles_layout__WEBPACK_IMPORTED_MODULE_7__["centered"], ";border:", Object(styles__WEBPACK_IMPORTED_MODULE_5__["getStyle"])('ctaBorder2'), ";cursor:pointer;background:transparent;svg{color:inherit;}", Object(styles__WEBPACK_IMPORTED_MODULE_5__["getBool"])('vertical', `
      writing-mode: vertical-lr;
      width: ${Object(styles__WEBPACK_IMPORTED_MODULE_5__["size"])(8)};
      padding: ${Object(styles__WEBPACK_IMPORTED_MODULE_5__["size"])(3)} 0;
      svg {
        transform: rotate(90deg);
        margin-bottom: ${Object(styles__WEBPACK_IMPORTED_MODULE_5__["size"])(3)};
      }
    `, `
      height: ${Object(styles__WEBPACK_IMPORTED_MODULE_5__["size"])(8)};
      padding: 0 ${Object(styles__WEBPACK_IMPORTED_MODULE_5__["size"])(3)};
      svg {
        margin-right: ${Object(styles__WEBPACK_IMPORTED_MODULE_5__["size"])(3)};
      }
    `), ";border-radius:", Object(styles__WEBPACK_IMPORTED_MODULE_5__["size"])(4), ";", styles_text__WEBPACK_IMPORTED_MODULE_6__["detail2"], ";svg{width:", Object(styles__WEBPACK_IMPORTED_MODULE_5__["size"])(4), ";}", Object(styles__WEBPACK_IMPORTED_MODULE_5__["getBool"])('hasChildren', '', `
    padding: 0;
    width: ${Object(styles__WEBPACK_IMPORTED_MODULE_5__["size"])(8)};
    svg {
      height: 12px;
      margin-right: 0;
      margin-bottom: 0;
    }
  `), " &:hover,&:active,&:focus{color:", Object(styles__WEBPACK_IMPORTED_MODULE_5__["getStyle"])('text3'), ";background:", Object(styles__WEBPACK_IMPORTED_MODULE_5__["getStyle"])('ctaBackground1'), ";}&:active{opacity:0.7 !important;}", Object(styles__WEBPACK_IMPORTED_MODULE_5__["getBool"])('disabled', `
    opacity: 0.5;
    pointer-events: none;
  `), false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL0NUQS9DVEEuanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVMyQiIsImZpbGUiOiIvVXNlcnMvY2xpZnRvbmNhbXBiZWxsL0RldmVsb3BtZW50L2NsaWYud29ybGQvY29tcG9uZW50cy9DVEEvQ1RBLmpzeCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IE5leHRMaW5rIGZyb20gJ25leHQvbGluayc7XG5pbXBvcnQgeyBDaGlsZHJlblByb3BUeXBlIH0gZnJvbSAndXRpbHMvcHJvcC10eXBlcyc7XG5pbXBvcnQgeyBnZXRCb29sLCBnZXRTdHlsZSwgc2l6ZSB9IGZyb20gJ3N0eWxlcyc7XG5pbXBvcnQgeyBkZXRhaWwyIH0gZnJvbSAnc3R5bGVzL3RleHQnO1xuaW1wb3J0IHsgY2VudGVyZWQgfSBmcm9tICdzdHlsZXMvbGF5b3V0JztcbmltcG9ydCBzdHlsZWQgZnJvbSAnQGVtb3Rpb24vc3R5bGVkJztcblxuY29uc3QgU3R5bGVkTGluayA9IHN0eWxlZC5hYFxuICAke2NlbnRlcmVkfTtcbiAgYm9yZGVyOiAke2dldFN0eWxlKCdjdGFCb3JkZXIyJyl9O1xuICBjdXJzb3I6IHBvaW50ZXI7XG4gIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuICBzdmcge1xuICAgIGNvbG9yOiBpbmhlcml0O1xuICB9XG4gICR7Z2V0Qm9vbChcbiAgICAndmVydGljYWwnLFxuICAgIGBcbiAgICAgIHdyaXRpbmctbW9kZTogdmVydGljYWwtbHI7XG4gICAgICB3aWR0aDogJHtzaXplKDgpfTtcbiAgICAgIHBhZGRpbmc6ICR7c2l6ZSgzKX0gMDtcbiAgICAgIHN2ZyB7XG4gICAgICAgIHRyYW5zZm9ybTogcm90YXRlKDkwZGVnKTtcbiAgICAgICAgbWFyZ2luLWJvdHRvbTogJHtzaXplKDMpfTtcbiAgICAgIH1cbiAgICBgLFxuICAgIGBcbiAgICAgIGhlaWdodDogJHtzaXplKDgpfTtcbiAgICAgIHBhZGRpbmc6IDAgJHtzaXplKDMpfTtcbiAgICAgIHN2ZyB7XG4gICAgICAgIG1hcmdpbi1yaWdodDogJHtzaXplKDMpfTtcbiAgICAgIH1cbiAgICBgLFxuICApfTtcbiAgYm9yZGVyLXJhZGl1czogJHtzaXplKDQpfTtcbiAgJHtkZXRhaWwyfTtcbiAgc3ZnIHtcbiAgICB3aWR0aDogJHtzaXplKDQpfTtcbiAgfVxuICAke2dldEJvb2woXG4gICAgJ2hhc0NoaWxkcmVuJyxcbiAgICAnJyxcbiAgICBgXG4gICAgcGFkZGluZzogMDtcbiAgICB3aWR0aDogJHtzaXplKDgpfTtcbiAgICBzdmcge1xuICAgICAgaGVpZ2h0OiAxMnB4O1xuICAgICAgbWFyZ2luLXJpZ2h0OiAwO1xuICAgICAgbWFyZ2luLWJvdHRvbTogMDtcbiAgICB9XG4gIGAsXG4gICl9XG4gICY6aG92ZXIsXG4gICY6YWN0aXZlLFxuICAmOmZvY3VzIHtcbiAgICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDMnKX07XG4gICAgYmFja2dyb3VuZDogJHtnZXRTdHlsZSgnY3RhQmFja2dyb3VuZDEnKX07XG4gIH1cbiAgJjphY3RpdmUge1xuICAgIG9wYWNpdHk6IDAuNyAhaW1wb3J0YW50O1xuICB9XG4gICR7Z2V0Qm9vbChcbiAgICAnZGlzYWJsZWQnLFxuICAgIGBcbiAgICBvcGFjaXR5OiAwLjU7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gIGAsXG4gICl9XG5gO1xuXG5jb25zdCBTdHlsZWRCdXR0b24gPSBTdHlsZWRMaW5rLndpdGhDb21wb25lbnQoJ2J1dHRvbicpO1xuXG5jb25zdCBMaW5rID0gKHtcbiAgYXJpYUxhYmVsLFxuICBJY29uLFxuICBjaGlsZHJlbixcbiAgY2xhc3NOYW1lLFxuICBkaXNhYmxlZCxcbiAgaHJlZixcbiAgaW50ZXJuYWwsXG4gIGlzTGluayxcbiAgb25DbGljayxcbiAgdmVydGljYWwsXG59KSA9PiB7XG4gIGxldCBNZWF0ID0gU3R5bGVkQnV0dG9uO1xuICBsZXQgbWVhdFByb3BzID0ge1xuICAgICdhcmlhLWxhYmVsJzogYXJpYUxhYmVsLFxuICB9O1xuICBpZiAoaXNMaW5rKSB7XG4gICAgTWVhdCA9IFN0eWxlZExpbms7XG4gICAgbWVhdFByb3BzID0gaW50ZXJuYWxcbiAgICAgID8ge31cbiAgICAgIDoge1xuICAgICAgICAgIGhyZWYsXG4gICAgICAgICAgdGFyZ2V0OiAnX2JsYW5rJyxcbiAgICAgICAgICByZWw6ICdub29wZW5lciBub3JlZmVycmVyJyxcbiAgICAgICAgfTtcbiAgfVxuICBjb25zdCBtZWF0ID0gKFxuICAgIDxNZWF0XG4gICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZX1cbiAgICAgIHZlcnRpY2FsPXt2ZXJ0aWNhbH1cbiAgICAgIG9uQ2xpY2s9e29uQ2xpY2t9XG4gICAgICBkaXNhYmxlZD17ZGlzYWJsZWR9XG4gICAgICBoYXNDaGlsZHJlbj17ISFjaGlsZHJlbn1cbiAgICAgIHsuLi5tZWF0UHJvcHN9XG4gICAgPlxuICAgICAgPEljb24gLz5cbiAgICAgIHtjaGlsZHJlbn1cbiAgICA8L01lYXQ+XG4gICk7XG4gIGlmIChpc0xpbmsgJiYgaW50ZXJuYWwpXG4gICAgcmV0dXJuIChcbiAgICAgIDxOZXh0TGluayBocmVmPXtocmVmfSBwYXNzSHJlZj5cbiAgICAgICAge21lYXR9XG4gICAgICA8L05leHRMaW5rPlxuICAgICk7XG4gIHJldHVybiBtZWF0O1xufTtcblxuTGluay5wcm9wVHlwZXMgPSB7XG4gIGFyaWFMYWJlbDogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICBJY29uOiBDaGlsZHJlblByb3BUeXBlLmlzUmVxdWlyZWQsXG4gIGNoaWxkcmVuOiBQcm9wVHlwZXMuc3RyaW5nLFxuICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gIGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbCxcbiAgaHJlZjogUHJvcFR5cGVzLnN0cmluZyxcbiAgaW50ZXJuYWw6IFByb3BUeXBlcy5ib29sLFxuICBpc0xpbms6IFByb3BUeXBlcy5ib29sLFxuICBvbkNsaWNrOiBQcm9wVHlwZXMuZnVuYyxcbiAgdmVydGljYWw6IFByb3BUeXBlcy5ib29sLFxufTtcblxuTGluay5kZWZhdWx0UHJvcHMgPSB7XG4gIGNoaWxkcmVuOiBudWxsLFxuICBjbGFzc05hbWU6ICcnLFxuICBkaXNhYmxlZDogZmFsc2UsXG4gIGhyZWY6ICcnLFxuICBpbnRlcm5hbDogZmFsc2UsXG4gIGlzTGluazogZmFsc2UsXG4gIG9uQ2xpY2soKSB7fSxcbiAgdmVydGljYWw6IGZhbHNlLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgTGluaztcbiJdfQ== */");

const StyledButton = StyledLink.withComponent('button', {
  target: "ex4txm41",
  label: "StyledButton"
});

const Link = ({
  ariaLabel,
  Icon,
  children,
  className,
  disabled,
  href,
  internal,
  isLink,
  onClick,
  vertical
}) => {
  let Meat = StyledButton;
  let meatProps = {
    'aria-label': ariaLabel
  };

  if (isLink) {
    Meat = StyledLink;
    meatProps = internal ? {} : {
      href,
      target: '_blank',
      rel: 'noopener noreferrer'
    };
  }

  const meat = Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])(Meat, _extends({
    className: className,
    vertical: vertical,
    onClick: onClick,
    disabled: disabled,
    hasChildren: !!children
  }, meatProps, {
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 102,
      columnNumber: 5
    }
  }), Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])(Icon, {
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 110,
      columnNumber: 7
    }
  }), children);

  if (isLink && internal) return Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])(next_link__WEBPACK_IMPORTED_MODULE_3___default.a, {
    href: href,
    passHref: true,
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 116,
      columnNumber: 7
    }
  }, meat);
  return meat;
};

Link.propTypes = {
  ariaLabel: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.string.isRequired,
  Icon: utils_prop_types__WEBPACK_IMPORTED_MODULE_4__["ChildrenPropType"].isRequired,
  children: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.string,
  className: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.string,
  disabled: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.bool,
  href: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.string,
  internal: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.bool,
  isLink: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.bool,
  onClick: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.func,
  vertical: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.bool
};
Link.defaultProps = {
  children: null,
  className: '',
  disabled: false,
  href: '',
  internal: false,
  isLink: false,

  onClick() {},

  vertical: false
};
/* harmony default export */ __webpack_exports__["default"] = (Link);

/***/ }),

/***/ "./components/CTA/Link.js":
/*!********************************!*\
  !*** ./components/CTA/Link.js ***!
  \********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var recompose_withProps__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! recompose/withProps */ "recompose/withProps");
/* harmony import */ var recompose_withProps__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(recompose_withProps__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _CTA__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./CTA */ "./components/CTA/CTA.jsx");


/* harmony default export */ __webpack_exports__["default"] = (recompose_withProps__WEBPACK_IMPORTED_MODULE_0___default()({
  isLink: true
})(_CTA__WEBPACK_IMPORTED_MODULE_1__["default"]));

/***/ }),

/***/ "./components/CTA/index.js":
/*!*********************************!*\
  !*** ./components/CTA/index.js ***!
  \*********************************/
/*! exports provided: Button, Link */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Button__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Button */ "./components/CTA/Button.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Button", function() { return _Button__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _Link__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Link */ "./components/CTA/Link.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Link", function() { return _Link__WEBPACK_IMPORTED_MODULE_1__["default"]; });




/***/ }),

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

/***/ "./components/Filmstrip.jsx":
/*!**********************************!*\
  !*** ./components/Filmstrip.jsx ***!
  \**********************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return Filmstrip; });
/* harmony import */ var _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @emotion/styled-base */ "@emotion/styled-base");
/* harmony import */ var _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_emotion_styled_base__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! prop-types */ "prop-types");
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var react_spring__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! react-spring */ "react-spring");
/* harmony import */ var react_spring__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(react_spring__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var react_use_gesture__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react-use-gesture */ "react-use-gesture");
/* harmony import */ var react_use_gesture__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react_use_gesture__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var is_touch_device__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! is-touch-device */ "is-touch-device");
/* harmony import */ var is_touch_device__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(is_touch_device__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var styles__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! styles */ "./styles/index.js");
/* harmony import */ var _layout__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./layout */ "./components/layout.js");
/* harmony import */ var _emotion_core__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @emotion/core */ "@emotion/core");
/* harmony import */ var _emotion_core__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_emotion_core__WEBPACK_IMPORTED_MODULE_8__);

var _jsxFileName = "/Users/cliftoncampbell/Development/clif.world/components/Filmstrip.jsx";
var __jsx = react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement;

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }




 // useScroll






const Container = /*#__PURE__*/_emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()(react_spring__WEBPACK_IMPORTED_MODULE_3__["animated"].div, {
  target: "e1g6fpbm0",
  label: "Container"
})("position:relative;width:100%;overflow-y:visible;", Object(styles__WEBPACK_IMPORTED_MODULE_6__["getBool"])('', `
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  `, `
    overflow-x: scroll;
  `), ";overflow-x:", ({
  isTouch
}) => isTouch ? 'auto' : 'hidden', ";-webkit-overflow-scrolling:touch;::-webkit-scrollbar{height:0;width:0;}::-webkit-scrollbar-track,::-webkit-scrollbar-thumb{border:0px solid rgba(255,255,255,0);border-radius:0px;}" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL0ZpbG1zdHJpcC5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBU3NDIiwiZmlsZSI6Ii9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL0ZpbG1zdHJpcC5qc3giLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgdXNlUmVmLCB1c2VTdGF0ZSwgdXNlRWZmZWN0IH0gZnJvbSAncmVhY3QnO1xuaW1wb3J0IHN0eWxlZCBmcm9tICdAZW1vdGlvbi9zdHlsZWQnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7IGFuaW1hdGVkLCB1c2VTcHJpbmcgfSBmcm9tICdyZWFjdC1zcHJpbmcnO1xuaW1wb3J0IHsgdXNlRHJhZyB9IGZyb20gJ3JlYWN0LXVzZS1nZXN0dXJlJzsgLy8gdXNlU2Nyb2xsXG5pbXBvcnQgaXNUb3VjaERldmljZSBmcm9tICdpcy10b3VjaC1kZXZpY2UnO1xuaW1wb3J0IHsgZ2V0Qm9vbCwgbW9iaWxlLCB0YWJsZXQsIGdldFN0eWxlLCBtcSB9IGZyb20gJ3N0eWxlcyc7XG5pbXBvcnQgeyBSb3cgfSBmcm9tICcuL2xheW91dCc7XG5cbmNvbnN0IENvbnRhaW5lciA9IHN0eWxlZChhbmltYXRlZC5kaXYpYFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIHdpZHRoOiAxMDAlO1xuICBvdmVyZmxvdy15OiB2aXNpYmxlO1xuICAke2dldEJvb2woXG4gICAgJycsXG4gICAgYFxuICAgIG92ZXJmbG93LXg6IGF1dG87XG4gICAgLXdlYmtpdC1vdmVyZmxvdy1zY3JvbGxpbmc6IHRvdWNoO1xuICBgLFxuICAgIGBcbiAgICBvdmVyZmxvdy14OiBzY3JvbGw7XG4gIGAsXG4gICl9O1xuICBvdmVyZmxvdy14OiAkeyh7IGlzVG91Y2ggfSkgPT4gKGlzVG91Y2ggPyAnYXV0bycgOiAnaGlkZGVuJyl9O1xuICAtd2Via2l0LW92ZXJmbG93LXNjcm9sbGluZzogdG91Y2g7XG4gIDo6LXdlYmtpdC1zY3JvbGxiYXIge1xuICAgIGhlaWdodDogMDtcbiAgICB3aWR0aDogMDtcbiAgfVxuXG4gIDo6LXdlYmtpdC1zY3JvbGxiYXItdHJhY2ssXG4gIDo6LXdlYmtpdC1zY3JvbGxiYXItdGh1bWIge1xuICAgIGJvcmRlcjogMHB4IHNvbGlkIHJnYmEoMjU1LCAyNTUsIDI1NSwgMCk7XG4gICAgYm9yZGVyLXJhZGl1czogMHB4O1xuICB9XG5gO1xuXG5jb25zdCBDaGlsZCA9IHN0eWxlZC5kaXZgXG4gIGhlaWdodDogMTAwJTtcbiAgPiAqIHtcbiAgICAke2dldEJvb2woXG4gICAgICAncmV2ZWFsJyxcbiAgICAgIGBcbiAgICAgIEBrZXlmcmFtZXMgc2xpZGVpbiB7XG4gICAgICAgICAgZnJvbSB7XG4gICAgICAgICAgICBvcGFjaXR5OiAwO1xuICAgICAgICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC0xNnB4KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdG8ge1xuICAgICAgICAgICAgb3BhY2l0eTogMTtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYW5pbWF0aW9uOiAwLjNzIGVhc2UtaW4gZm9yd2FyZHMgc2xpZGVpbjtcbiAgICBgLFxuICAgICl9O1xuICAgICR7KHsgaW5kZXggfSkgPT4gYFxuICAgICAgYW5pbWF0aW9uLWRlbGF5OiAke2luZGV4ICogODB9bXM7XG4gICAgYH07XG4gICAgb3BhY2l0eTogMDtcbiAgfVxuYDtcblxuY29uc3QgSW5uZXIgPSBzdHlsZWQoUm93KWBcbiAgaGVpZ2h0OiAxMDAlO1xuICB3aWR0aDogbWluLWNvbnRlbnQ7XG4gIGN1cnNvcjogZXctcmVzaXplO1xuICAke0NoaWxkfSB7XG4gICAgcG9pbnRlci1ldmVudHM6ICR7KHsgaXNEcmFnZ2luZyB9KSA9PlxuICAgICAgaXNEcmFnZ2luZyA/ICdub25lJyA6ICdhdXRvJ307XG4gICAgdHJhbnNpdGlvbjogdHJhbnNmb3JtIGVhc2UtaW4tb3V0IDAuMjRzICFpbXBvcnRhbnQ7XG4gICAgJHtnZXRCb29sKFxuICAgICAgJ2lzRHJhZ2dpbmcnLFxuICAgICAgYFxuICAgICAgICB0cmFuc2Zvcm06IHNjYWxlKDAuOTYpO1xuICAgICAgYCxcbiAgICAgIGBcbiAgICAgICAgJjpob3ZlciB7XG4gICAgICAgICAgdHJhbnNmb3JtOiBzY2FsZSgxLjAyKTtcbiAgICAgICAgfVxuICAgICAgICAmOmFjdGl2ZSB7XG4gICAgICAgICAgdHJhbnNmb3JtOiBzY2FsZSgxLjAxKTtcbiAgICAgICAgfVxuICAgICAgYCxcbiAgICApfTtcbiAgfVxuICA+ICo6bnRoLWNoaWxkKG9kZCkge1xuICAgIG1hcmdpbi1ib3R0b206IDI0cHg7XG4gIH1cbiAgPiAqOm50aC1jaGlsZChldmVuKSB7XG4gICAgbWFyZ2luLXRvcDogMjRweDtcbiAgfVxuICA+ICo6bGFzdC1jaGlsZCB7XG4gICAgJHttcSh7XG4gICAgICBtYXJnaW5SaWdodDogW1xuICAgICAgICBnZXRTdHlsZSgnZm9yZWdyb3VuZENvbnRlbnRSaWdodFBhZGRpbmcnKSxcbiAgICAgICAgZ2V0U3R5bGUoJ2ZvcmVncm91bmRDb250ZW50UmlnaHRQYWRkaW5nVGFibGV0JyksXG4gICAgICAgIGdldFN0eWxlKCdmb3JlZ3JvdW5kQ29udGVudFJpZ2h0UGFkZGluZ01vYmlsZScpLFxuICAgICAgXSxcbiAgICB9KX07XG4gIH1cbiAgPiAqOmZpcnN0LWNoaWxkIHtcbiAgICBtYXJnaW4tbGVmdDogJHtnZXRTdHlsZSgnZm9yZWdyb3VuZExlZnRQYWRkaW5nJyl9O1xuICB9XG4gID4gKiB7XG4gICAgbWFyZ2luLWxlZnQ6IDQ4cHg7XG4gIH1cbiAgJHt0YWJsZXQoYFxuICAgID4gKjpmaXJzdC1jaGlsZCB7XG4gICAgICBtYXJnaW4tbGVmdDogJHtnZXRTdHlsZSgnZm9yZWdyb3VuZExlZnRQYWRkaW5nVGFibGV0Jyl9O1xuICAgIH1cbiAgICA+ICoge1xuICAgICAgbWFyZ2luLWxlZnQ6IDI0cHg7XG4gICAgfVxuICAgID4gKjpudGgtY2hpbGQob2RkKSB7XG4gICAgICBtYXJnaW4tYm90dG9tOiAxMnB4O1xuICAgIH1cbiAgICA+ICo6bnRoLWNoaWxkKGV2ZW4pIHtcbiAgICAgIG1hcmdpbi10b3A6IDEycHg7XG4gICAgfVxuICBgKX07XG4gICR7bW9iaWxlKGBcbiAgICAgID4gKiB7XG4gICAgbWFyZ2luLWxlZnQ6IDEycHg7XG4gIH1cbiAgYCl9O1xuYDtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gRmlsbXN0cmlwKHsgY2xhc3NOYW1lLCBjaGlsZHJlbiwgcmV2ZWFsIH0pIHtcbiAgY29uc3Qgb3V0ZXJSZWYgPSB1c2VSZWYobnVsbCk7XG5cbiAgY29uc3QgW2lzRHJhZ2dpbmcsIHNldElzRHJhZ2dpbmddID0gdXNlU3RhdGUoZmFsc2UpO1xuICBjb25zdCBbaXNUb3VjaCwgc2V0SXNUb3VjaF0gPSB1c2VTdGF0ZShmYWxzZSk7XG4gIC8vIGNvbnN0IFtpc1RvdWNoaW5nLCBzZXRJc1RvdWNoaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIHNldElzVG91Y2goaXNUb3VjaERldmljZSgpKTtcbiAgICBjb25zdCBsaXN0ZW5lciA9IHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCAoKSA9PlxuICAgICAgc2V0SXNUb3VjaChpc1RvdWNoRGV2aWNlKCkpLFxuICAgICk7XG4gICAgLy8gY29uc3QgdG91Y2hTdGFydExpc3RlbmVyID0gb3V0ZXJSZWYuY3VycmVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgIC8vICAgJ3RvdWNoc3RhcnQnLFxuICAgIC8vICAgKCkgPT4gc2V0SXNUb3VjaGluZyh0cnVlKSxcbiAgICAvLyApO1xuICAgIC8vIGNvbnN0IHRvdWNoRW5kTGlzdGVuZXIgPSBvdXRlclJlZi5jdXJyZW50LmFkZEV2ZW50TGlzdGVuZXIoXG4gICAgLy8gICAndG91Y2hlbmQnLFxuICAgIC8vICAgKCkgPT4gc2V0SXNUb3VjaGluZyhmYWxzZSksXG4gICAgLy8gKTtcbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGxpc3RlbmVyKTtcbiAgICAgIC8vIG91dGVyUmVmLmN1cnJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgIC8vICAgJ3RvdWNoc3RhcnQnLFxuICAgICAgLy8gICB0b3VjaFN0YXJ0TGlzdGVuZXIsXG4gICAgICAvLyApO1xuICAgICAgLy8gb3V0ZXJSZWYuY3VycmVudC5yZW1vdmVFdmVudExpc3RlbmVyKFxuICAgICAgLy8gICAndG91Y2hlbmQnLFxuICAgICAgLy8gICB0b3VjaEVuZExpc3RlbmVyLFxuICAgICAgLy8gKTtcbiAgICB9O1xuICB9LCBbXSk7XG5cbiAgY29uc3QgZ2V0UmFuZ2UgPSAoKSA9PlxuICAgIG91dGVyUmVmLmN1cnJlbnQuc2Nyb2xsV2lkdGggLSBvdXRlclJlZi5jdXJyZW50LmNsaWVudFdpZHRoO1xuXG4gIGNvbnN0IFt7IHNjcm9sbCB9LCBzZXRTcHJpbmddID0gdXNlU3ByaW5nKCgpID0+ICh7XG4gICAgc2Nyb2xsOiAwLFxuICB9KSk7XG5cbiAgY29uc3QgYmluZERyYWcgPSB1c2VEcmFnKChkcmFnKSA9PiB7XG4gICAgaWYgKGlzVG91Y2gpIHJldHVybjtcbiAgICBjb25zdCB7XG4gICAgICBtb3ZlbWVudDogW214XSxcbiAgICAgIHZlbG9jaXR5LFxuICAgICAgZHJhZ2dpbmcsXG4gICAgfSA9IGRyYWc7XG5cbiAgICBjb25zdCBtaW4gPSAwO1xuICAgIGNvbnN0IG1heCA9IGdldFJhbmdlKCk7XG5cbiAgICBjb25zdCBwcm9qZWN0ZWQgPVxuICAgICAgb3V0ZXJSZWYuY3VycmVudC5zY3JvbGxMZWZ0IC0gbXggKiAoMSArIHZlbG9jaXR5KTtcbiAgICBsZXQgbm9ybWFsaXplZCA9IHByb2plY3RlZDtcblxuICAgIGlmIChwcm9qZWN0ZWQgPD0gbWluKSBub3JtYWxpemVkID0gbWluO1xuICAgIGlmIChwcm9qZWN0ZWQgPj0gbWF4KSBub3JtYWxpemVkID0gbWF4ICsgNTA7XG5cbiAgICBzZXRJc0RyYWdnaW5nKGRyYWdnaW5nICYmIG14ICE9PSAwKTtcblxuICAgIHNldFNwcmluZyh7IHNjcm9sbDogbm9ybWFsaXplZCB9KTtcbiAgfSk7XG5cbiAgLy8gY29uc3QgYmluZFNjcm9sbCA9IHVzZVNjcm9sbCgoeyBzY3JvbGxpbmcgfSkgPT4ge1xuICAvLyAgIGlmIChpc1RvdWNoKSBzZXRJc0RyYWdnaW5nKGlzVG91Y2hpbmcgJiYgc2Nyb2xsaW5nKTtcbiAgLy8gfSk7XG5cbiAgcmV0dXJuIChcbiAgICA8Q29udGFpbmVyXG4gICAgICBjbGFzc05hbWU9e2NsYXNzTmFtZX1cbiAgICAgIGlzVG91Y2g9e2lzVG91Y2h9XG4gICAgICByZWY9e291dGVyUmVmfVxuICAgICAgc2Nyb2xsTGVmdD17c2Nyb2xsfVxuICAgICAgey4uLmJpbmREcmFnKCl9XG4gICAgICAvLyB7Li4uYmluZFNjcm9sbCgpfVxuICAgID5cbiAgICAgIDxJbm5lciBpc0RyYWdnaW5nPXtpc0RyYWdnaW5nfT5cbiAgICAgICAge2NoaWxkcmVuLm1hcCgoY2hpbGQsIGkpID0+IChcbiAgICAgICAgICA8Q2hpbGQga2V5PXtjaGlsZD8ucHJvcHM/LmlkfSBpbmRleD17aX0gcmV2ZWFsPXtyZXZlYWx9PlxuICAgICAgICAgICAge2NoaWxkfVxuICAgICAgICAgIDwvQ2hpbGQ+XG4gICAgICAgICkpfVxuICAgICAgPC9Jbm5lcj5cbiAgICA8L0NvbnRhaW5lcj5cbiAgKTtcbn1cblxuRmlsbXN0cmlwLnByb3BUeXBlcyA9IHtcbiAgY2xhc3NOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuICBjaGlsZHJlbjogUHJvcFR5cGVzLmFycmF5T2YoUHJvcFR5cGVzLm5vZGUpLmlzUmVxdWlyZWQsXG4gIHJldmVhbDogUHJvcFR5cGVzLmJvb2wsXG59O1xuXG5GaWxtc3RyaXAuZGVmYXVsdFByb3BzID0ge1xuICBjbGFzc05hbWU6ICcnLFxuICByZXZlYWw6IHRydWUsXG59O1xuIl19 */"));

const Child = _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()("div", {
  target: "e1g6fpbm1",
  label: "Child"
})("height:100%;> *{", Object(styles__WEBPACK_IMPORTED_MODULE_6__["getBool"])('reveal', `
      @keyframes slidein {
          from {
            opacity: 0;
            transform: translateY(-16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        animation: 0.3s ease-in forwards slidein;
    `), ";", ({
  index
}) => `
      animation-delay: ${index * 80}ms;
    `, ";opacity:0;}" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL0ZpbG1zdHJpcC5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBcUN3QiIsImZpbGUiOiIvVXNlcnMvY2xpZnRvbmNhbXBiZWxsL0RldmVsb3BtZW50L2NsaWYud29ybGQvY29tcG9uZW50cy9GaWxtc3RyaXAuanN4Iiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IHVzZVJlZiwgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBzdHlsZWQgZnJvbSAnQGVtb3Rpb24vc3R5bGVkJztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgeyBhbmltYXRlZCwgdXNlU3ByaW5nIH0gZnJvbSAncmVhY3Qtc3ByaW5nJztcbmltcG9ydCB7IHVzZURyYWcgfSBmcm9tICdyZWFjdC11c2UtZ2VzdHVyZSc7IC8vIHVzZVNjcm9sbFxuaW1wb3J0IGlzVG91Y2hEZXZpY2UgZnJvbSAnaXMtdG91Y2gtZGV2aWNlJztcbmltcG9ydCB7IGdldEJvb2wsIG1vYmlsZSwgdGFibGV0LCBnZXRTdHlsZSwgbXEgfSBmcm9tICdzdHlsZXMnO1xuaW1wb3J0IHsgUm93IH0gZnJvbSAnLi9sYXlvdXQnO1xuXG5jb25zdCBDb250YWluZXIgPSBzdHlsZWQoYW5pbWF0ZWQuZGl2KWBcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICB3aWR0aDogMTAwJTtcbiAgb3ZlcmZsb3cteTogdmlzaWJsZTtcbiAgJHtnZXRCb29sKFxuICAgICcnLFxuICAgIGBcbiAgICBvdmVyZmxvdy14OiBhdXRvO1xuICAgIC13ZWJraXQtb3ZlcmZsb3ctc2Nyb2xsaW5nOiB0b3VjaDtcbiAgYCxcbiAgICBgXG4gICAgb3ZlcmZsb3cteDogc2Nyb2xsO1xuICBgLFxuICApfTtcbiAgb3ZlcmZsb3cteDogJHsoeyBpc1RvdWNoIH0pID0+IChpc1RvdWNoID8gJ2F1dG8nIDogJ2hpZGRlbicpfTtcbiAgLXdlYmtpdC1vdmVyZmxvdy1zY3JvbGxpbmc6IHRvdWNoO1xuICA6Oi13ZWJraXQtc2Nyb2xsYmFyIHtcbiAgICBoZWlnaHQ6IDA7XG4gICAgd2lkdGg6IDA7XG4gIH1cblxuICA6Oi13ZWJraXQtc2Nyb2xsYmFyLXRyYWNrLFxuICA6Oi13ZWJraXQtc2Nyb2xsYmFyLXRodW1iIHtcbiAgICBib3JkZXI6IDBweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDApO1xuICAgIGJvcmRlci1yYWRpdXM6IDBweDtcbiAgfVxuYDtcblxuY29uc3QgQ2hpbGQgPSBzdHlsZWQuZGl2YFxuICBoZWlnaHQ6IDEwMCU7XG4gID4gKiB7XG4gICAgJHtnZXRCb29sKFxuICAgICAgJ3JldmVhbCcsXG4gICAgICBgXG4gICAgICBAa2V5ZnJhbWVzIHNsaWRlaW4ge1xuICAgICAgICAgIGZyb20ge1xuICAgICAgICAgICAgb3BhY2l0eTogMDtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMTZweCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRvIHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDE7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGFuaW1hdGlvbjogMC4zcyBlYXNlLWluIGZvcndhcmRzIHNsaWRlaW47XG4gICAgYCxcbiAgICApfTtcbiAgICAkeyh7IGluZGV4IH0pID0+IGBcbiAgICAgIGFuaW1hdGlvbi1kZWxheTogJHtpbmRleCAqIDgwfW1zO1xuICAgIGB9O1xuICAgIG9wYWNpdHk6IDA7XG4gIH1cbmA7XG5cbmNvbnN0IElubmVyID0gc3R5bGVkKFJvdylgXG4gIGhlaWdodDogMTAwJTtcbiAgd2lkdGg6IG1pbi1jb250ZW50O1xuICBjdXJzb3I6IGV3LXJlc2l6ZTtcbiAgJHtDaGlsZH0ge1xuICAgIHBvaW50ZXItZXZlbnRzOiAkeyh7IGlzRHJhZ2dpbmcgfSkgPT5cbiAgICAgIGlzRHJhZ2dpbmcgPyAnbm9uZScgOiAnYXV0byd9O1xuICAgIHRyYW5zaXRpb246IHRyYW5zZm9ybSBlYXNlLWluLW91dCAwLjI0cyAhaW1wb3J0YW50O1xuICAgICR7Z2V0Qm9vbChcbiAgICAgICdpc0RyYWdnaW5nJyxcbiAgICAgIGBcbiAgICAgICAgdHJhbnNmb3JtOiBzY2FsZSgwLjk2KTtcbiAgICAgIGAsXG4gICAgICBgXG4gICAgICAgICY6aG92ZXIge1xuICAgICAgICAgIHRyYW5zZm9ybTogc2NhbGUoMS4wMik7XG4gICAgICAgIH1cbiAgICAgICAgJjphY3RpdmUge1xuICAgICAgICAgIHRyYW5zZm9ybTogc2NhbGUoMS4wMSk7XG4gICAgICAgIH1cbiAgICAgIGAsXG4gICAgKX07XG4gIH1cbiAgPiAqOm50aC1jaGlsZChvZGQpIHtcbiAgICBtYXJnaW4tYm90dG9tOiAyNHB4O1xuICB9XG4gID4gKjpudGgtY2hpbGQoZXZlbikge1xuICAgIG1hcmdpbi10b3A6IDI0cHg7XG4gIH1cbiAgPiAqOmxhc3QtY2hpbGQge1xuICAgICR7bXEoe1xuICAgICAgbWFyZ2luUmlnaHQ6IFtcbiAgICAgICAgZ2V0U3R5bGUoJ2ZvcmVncm91bmRDb250ZW50UmlnaHRQYWRkaW5nJyksXG4gICAgICAgIGdldFN0eWxlKCdmb3JlZ3JvdW5kQ29udGVudFJpZ2h0UGFkZGluZ1RhYmxldCcpLFxuICAgICAgICBnZXRTdHlsZSgnZm9yZWdyb3VuZENvbnRlbnRSaWdodFBhZGRpbmdNb2JpbGUnKSxcbiAgICAgIF0sXG4gICAgfSl9O1xuICB9XG4gID4gKjpmaXJzdC1jaGlsZCB7XG4gICAgbWFyZ2luLWxlZnQ6ICR7Z2V0U3R5bGUoJ2ZvcmVncm91bmRMZWZ0UGFkZGluZycpfTtcbiAgfVxuICA+ICoge1xuICAgIG1hcmdpbi1sZWZ0OiA0OHB4O1xuICB9XG4gICR7dGFibGV0KGBcbiAgICA+ICo6Zmlyc3QtY2hpbGQge1xuICAgICAgbWFyZ2luLWxlZnQ6ICR7Z2V0U3R5bGUoJ2ZvcmVncm91bmRMZWZ0UGFkZGluZ1RhYmxldCcpfTtcbiAgICB9XG4gICAgPiAqIHtcbiAgICAgIG1hcmdpbi1sZWZ0OiAyNHB4O1xuICAgIH1cbiAgICA+ICo6bnRoLWNoaWxkKG9kZCkge1xuICAgICAgbWFyZ2luLWJvdHRvbTogMTJweDtcbiAgICB9XG4gICAgPiAqOm50aC1jaGlsZChldmVuKSB7XG4gICAgICBtYXJnaW4tdG9wOiAxMnB4O1xuICAgIH1cbiAgYCl9O1xuICAke21vYmlsZShgXG4gICAgICA+ICoge1xuICAgIG1hcmdpbi1sZWZ0OiAxMnB4O1xuICB9XG4gIGApfTtcbmA7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEZpbG1zdHJpcCh7IGNsYXNzTmFtZSwgY2hpbGRyZW4sIHJldmVhbCB9KSB7XG4gIGNvbnN0IG91dGVyUmVmID0gdXNlUmVmKG51bGwpO1xuXG4gIGNvbnN0IFtpc0RyYWdnaW5nLCBzZXRJc0RyYWdnaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW2lzVG91Y2gsIHNldElzVG91Y2hdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAvLyBjb25zdCBbaXNUb3VjaGluZywgc2V0SXNUb3VjaGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRJc1RvdWNoKGlzVG91Y2hEZXZpY2UoKSk7XG4gICAgY29uc3QgbGlzdGVuZXIgPSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT5cbiAgICAgIHNldElzVG91Y2goaXNUb3VjaERldmljZSgpKSxcbiAgICApO1xuICAgIC8vIGNvbnN0IHRvdWNoU3RhcnRMaXN0ZW5lciA9IG91dGVyUmVmLmN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAvLyAgICd0b3VjaHN0YXJ0JyxcbiAgICAvLyAgICgpID0+IHNldElzVG91Y2hpbmcodHJ1ZSksXG4gICAgLy8gKTtcbiAgICAvLyBjb25zdCB0b3VjaEVuZExpc3RlbmVyID0gb3V0ZXJSZWYuY3VycmVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgIC8vICAgJ3RvdWNoZW5kJyxcbiAgICAvLyAgICgpID0+IHNldElzVG91Y2hpbmcoZmFsc2UpLFxuICAgIC8vICk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCBsaXN0ZW5lcik7XG4gICAgICAvLyBvdXRlclJlZi5jdXJyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICAvLyAgICd0b3VjaHN0YXJ0JyxcbiAgICAgIC8vICAgdG91Y2hTdGFydExpc3RlbmVyLFxuICAgICAgLy8gKTtcbiAgICAgIC8vIG91dGVyUmVmLmN1cnJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgIC8vICAgJ3RvdWNoZW5kJyxcbiAgICAgIC8vICAgdG91Y2hFbmRMaXN0ZW5lcixcbiAgICAgIC8vICk7XG4gICAgfTtcbiAgfSwgW10pO1xuXG4gIGNvbnN0IGdldFJhbmdlID0gKCkgPT5cbiAgICBvdXRlclJlZi5jdXJyZW50LnNjcm9sbFdpZHRoIC0gb3V0ZXJSZWYuY3VycmVudC5jbGllbnRXaWR0aDtcblxuICBjb25zdCBbeyBzY3JvbGwgfSwgc2V0U3ByaW5nXSA9IHVzZVNwcmluZygoKSA9PiAoe1xuICAgIHNjcm9sbDogMCxcbiAgfSkpO1xuXG4gIGNvbnN0IGJpbmREcmFnID0gdXNlRHJhZygoZHJhZykgPT4ge1xuICAgIGlmIChpc1RvdWNoKSByZXR1cm47XG4gICAgY29uc3Qge1xuICAgICAgbW92ZW1lbnQ6IFtteF0sXG4gICAgICB2ZWxvY2l0eSxcbiAgICAgIGRyYWdnaW5nLFxuICAgIH0gPSBkcmFnO1xuXG4gICAgY29uc3QgbWluID0gMDtcbiAgICBjb25zdCBtYXggPSBnZXRSYW5nZSgpO1xuXG4gICAgY29uc3QgcHJvamVjdGVkID1cbiAgICAgIG91dGVyUmVmLmN1cnJlbnQuc2Nyb2xsTGVmdCAtIG14ICogKDEgKyB2ZWxvY2l0eSk7XG4gICAgbGV0IG5vcm1hbGl6ZWQgPSBwcm9qZWN0ZWQ7XG5cbiAgICBpZiAocHJvamVjdGVkIDw9IG1pbikgbm9ybWFsaXplZCA9IG1pbjtcbiAgICBpZiAocHJvamVjdGVkID49IG1heCkgbm9ybWFsaXplZCA9IG1heCArIDUwO1xuXG4gICAgc2V0SXNEcmFnZ2luZyhkcmFnZ2luZyAmJiBteCAhPT0gMCk7XG5cbiAgICBzZXRTcHJpbmcoeyBzY3JvbGw6IG5vcm1hbGl6ZWQgfSk7XG4gIH0pO1xuXG4gIC8vIGNvbnN0IGJpbmRTY3JvbGwgPSB1c2VTY3JvbGwoKHsgc2Nyb2xsaW5nIH0pID0+IHtcbiAgLy8gICBpZiAoaXNUb3VjaCkgc2V0SXNEcmFnZ2luZyhpc1RvdWNoaW5nICYmIHNjcm9sbGluZyk7XG4gIC8vIH0pO1xuXG4gIHJldHVybiAoXG4gICAgPENvbnRhaW5lclxuICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWV9XG4gICAgICBpc1RvdWNoPXtpc1RvdWNofVxuICAgICAgcmVmPXtvdXRlclJlZn1cbiAgICAgIHNjcm9sbExlZnQ9e3Njcm9sbH1cbiAgICAgIHsuLi5iaW5kRHJhZygpfVxuICAgICAgLy8gey4uLmJpbmRTY3JvbGwoKX1cbiAgICA+XG4gICAgICA8SW5uZXIgaXNEcmFnZ2luZz17aXNEcmFnZ2luZ30+XG4gICAgICAgIHtjaGlsZHJlbi5tYXAoKGNoaWxkLCBpKSA9PiAoXG4gICAgICAgICAgPENoaWxkIGtleT17Y2hpbGQ/LnByb3BzPy5pZH0gaW5kZXg9e2l9IHJldmVhbD17cmV2ZWFsfT5cbiAgICAgICAgICAgIHtjaGlsZH1cbiAgICAgICAgICA8L0NoaWxkPlxuICAgICAgICApKX1cbiAgICAgIDwvSW5uZXI+XG4gICAgPC9Db250YWluZXI+XG4gICk7XG59XG5cbkZpbG1zdHJpcC5wcm9wVHlwZXMgPSB7XG4gIGNsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgY2hpbGRyZW46IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5ub2RlKS5pc1JlcXVpcmVkLFxuICByZXZlYWw6IFByb3BUeXBlcy5ib29sLFxufTtcblxuRmlsbXN0cmlwLmRlZmF1bHRQcm9wcyA9IHtcbiAgY2xhc3NOYW1lOiAnJyxcbiAgcmV2ZWFsOiB0cnVlLFxufTtcbiJdfQ== */"));

const Inner = /*#__PURE__*/_emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()(_layout__WEBPACK_IMPORTED_MODULE_7__["Row"], {
  target: "e1g6fpbm2",
  label: "Inner"
})("height:100%;width:min-content;cursor:ew-resize;", Child, "{pointer-events:", ({
  isDragging
}) => isDragging ? 'none' : 'auto', ";transition:transform ease-in-out 0.24s !important;", Object(styles__WEBPACK_IMPORTED_MODULE_6__["getBool"])('isDragging', `
        transform: scale(0.96);
      `, `
        &:hover {
          transform: scale(1.02);
        }
        &:active {
          transform: scale(1.01);
        }
      `), ";}> *:nth-child(odd){margin-bottom:24px;}> *:nth-child(even){margin-top:24px;}> *:last-child{", Object(styles__WEBPACK_IMPORTED_MODULE_6__["mq"])({
  marginRight: [Object(styles__WEBPACK_IMPORTED_MODULE_6__["getStyle"])('foregroundContentRightPadding'), Object(styles__WEBPACK_IMPORTED_MODULE_6__["getStyle"])('foregroundContentRightPaddingTablet'), Object(styles__WEBPACK_IMPORTED_MODULE_6__["getStyle"])('foregroundContentRightPaddingMobile')]
}), ";}> *:first-child{margin-left:", Object(styles__WEBPACK_IMPORTED_MODULE_6__["getStyle"])('foregroundLeftPadding'), ";}> *{margin-left:48px;}", Object(styles__WEBPACK_IMPORTED_MODULE_6__["tablet"])(`
    > *:first-child {
      margin-left: ${Object(styles__WEBPACK_IMPORTED_MODULE_6__["getStyle"])('foregroundLeftPaddingTablet')};
    }
    > * {
      margin-left: 24px;
    }
    > *:nth-child(odd) {
      margin-bottom: 12px;
    }
    > *:nth-child(even) {
      margin-top: 12px;
    }
  `), ";", Object(styles__WEBPACK_IMPORTED_MODULE_6__["mobile"])(`
      > * {
    margin-left: 12px;
  }
  `), ";" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL0ZpbG1zdHJpcC5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBK0R5QiIsImZpbGUiOiIvVXNlcnMvY2xpZnRvbmNhbXBiZWxsL0RldmVsb3BtZW50L2NsaWYud29ybGQvY29tcG9uZW50cy9GaWxtc3RyaXAuanN4Iiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IHVzZVJlZiwgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBzdHlsZWQgZnJvbSAnQGVtb3Rpb24vc3R5bGVkJztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgeyBhbmltYXRlZCwgdXNlU3ByaW5nIH0gZnJvbSAncmVhY3Qtc3ByaW5nJztcbmltcG9ydCB7IHVzZURyYWcgfSBmcm9tICdyZWFjdC11c2UtZ2VzdHVyZSc7IC8vIHVzZVNjcm9sbFxuaW1wb3J0IGlzVG91Y2hEZXZpY2UgZnJvbSAnaXMtdG91Y2gtZGV2aWNlJztcbmltcG9ydCB7IGdldEJvb2wsIG1vYmlsZSwgdGFibGV0LCBnZXRTdHlsZSwgbXEgfSBmcm9tICdzdHlsZXMnO1xuaW1wb3J0IHsgUm93IH0gZnJvbSAnLi9sYXlvdXQnO1xuXG5jb25zdCBDb250YWluZXIgPSBzdHlsZWQoYW5pbWF0ZWQuZGl2KWBcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICB3aWR0aDogMTAwJTtcbiAgb3ZlcmZsb3cteTogdmlzaWJsZTtcbiAgJHtnZXRCb29sKFxuICAgICcnLFxuICAgIGBcbiAgICBvdmVyZmxvdy14OiBhdXRvO1xuICAgIC13ZWJraXQtb3ZlcmZsb3ctc2Nyb2xsaW5nOiB0b3VjaDtcbiAgYCxcbiAgICBgXG4gICAgb3ZlcmZsb3cteDogc2Nyb2xsO1xuICBgLFxuICApfTtcbiAgb3ZlcmZsb3cteDogJHsoeyBpc1RvdWNoIH0pID0+IChpc1RvdWNoID8gJ2F1dG8nIDogJ2hpZGRlbicpfTtcbiAgLXdlYmtpdC1vdmVyZmxvdy1zY3JvbGxpbmc6IHRvdWNoO1xuICA6Oi13ZWJraXQtc2Nyb2xsYmFyIHtcbiAgICBoZWlnaHQ6IDA7XG4gICAgd2lkdGg6IDA7XG4gIH1cblxuICA6Oi13ZWJraXQtc2Nyb2xsYmFyLXRyYWNrLFxuICA6Oi13ZWJraXQtc2Nyb2xsYmFyLXRodW1iIHtcbiAgICBib3JkZXI6IDBweCBzb2xpZCByZ2JhKDI1NSwgMjU1LCAyNTUsIDApO1xuICAgIGJvcmRlci1yYWRpdXM6IDBweDtcbiAgfVxuYDtcblxuY29uc3QgQ2hpbGQgPSBzdHlsZWQuZGl2YFxuICBoZWlnaHQ6IDEwMCU7XG4gID4gKiB7XG4gICAgJHtnZXRCb29sKFxuICAgICAgJ3JldmVhbCcsXG4gICAgICBgXG4gICAgICBAa2V5ZnJhbWVzIHNsaWRlaW4ge1xuICAgICAgICAgIGZyb20ge1xuICAgICAgICAgICAgb3BhY2l0eTogMDtcbiAgICAgICAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtMTZweCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRvIHtcbiAgICAgICAgICAgIG9wYWNpdHk6IDE7XG4gICAgICAgICAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVkoMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGFuaW1hdGlvbjogMC4zcyBlYXNlLWluIGZvcndhcmRzIHNsaWRlaW47XG4gICAgYCxcbiAgICApfTtcbiAgICAkeyh7IGluZGV4IH0pID0+IGBcbiAgICAgIGFuaW1hdGlvbi1kZWxheTogJHtpbmRleCAqIDgwfW1zO1xuICAgIGB9O1xuICAgIG9wYWNpdHk6IDA7XG4gIH1cbmA7XG5cbmNvbnN0IElubmVyID0gc3R5bGVkKFJvdylgXG4gIGhlaWdodDogMTAwJTtcbiAgd2lkdGg6IG1pbi1jb250ZW50O1xuICBjdXJzb3I6IGV3LXJlc2l6ZTtcbiAgJHtDaGlsZH0ge1xuICAgIHBvaW50ZXItZXZlbnRzOiAkeyh7IGlzRHJhZ2dpbmcgfSkgPT5cbiAgICAgIGlzRHJhZ2dpbmcgPyAnbm9uZScgOiAnYXV0byd9O1xuICAgIHRyYW5zaXRpb246IHRyYW5zZm9ybSBlYXNlLWluLW91dCAwLjI0cyAhaW1wb3J0YW50O1xuICAgICR7Z2V0Qm9vbChcbiAgICAgICdpc0RyYWdnaW5nJyxcbiAgICAgIGBcbiAgICAgICAgdHJhbnNmb3JtOiBzY2FsZSgwLjk2KTtcbiAgICAgIGAsXG4gICAgICBgXG4gICAgICAgICY6aG92ZXIge1xuICAgICAgICAgIHRyYW5zZm9ybTogc2NhbGUoMS4wMik7XG4gICAgICAgIH1cbiAgICAgICAgJjphY3RpdmUge1xuICAgICAgICAgIHRyYW5zZm9ybTogc2NhbGUoMS4wMSk7XG4gICAgICAgIH1cbiAgICAgIGAsXG4gICAgKX07XG4gIH1cbiAgPiAqOm50aC1jaGlsZChvZGQpIHtcbiAgICBtYXJnaW4tYm90dG9tOiAyNHB4O1xuICB9XG4gID4gKjpudGgtY2hpbGQoZXZlbikge1xuICAgIG1hcmdpbi10b3A6IDI0cHg7XG4gIH1cbiAgPiAqOmxhc3QtY2hpbGQge1xuICAgICR7bXEoe1xuICAgICAgbWFyZ2luUmlnaHQ6IFtcbiAgICAgICAgZ2V0U3R5bGUoJ2ZvcmVncm91bmRDb250ZW50UmlnaHRQYWRkaW5nJyksXG4gICAgICAgIGdldFN0eWxlKCdmb3JlZ3JvdW5kQ29udGVudFJpZ2h0UGFkZGluZ1RhYmxldCcpLFxuICAgICAgICBnZXRTdHlsZSgnZm9yZWdyb3VuZENvbnRlbnRSaWdodFBhZGRpbmdNb2JpbGUnKSxcbiAgICAgIF0sXG4gICAgfSl9O1xuICB9XG4gID4gKjpmaXJzdC1jaGlsZCB7XG4gICAgbWFyZ2luLWxlZnQ6ICR7Z2V0U3R5bGUoJ2ZvcmVncm91bmRMZWZ0UGFkZGluZycpfTtcbiAgfVxuICA+ICoge1xuICAgIG1hcmdpbi1sZWZ0OiA0OHB4O1xuICB9XG4gICR7dGFibGV0KGBcbiAgICA+ICo6Zmlyc3QtY2hpbGQge1xuICAgICAgbWFyZ2luLWxlZnQ6ICR7Z2V0U3R5bGUoJ2ZvcmVncm91bmRMZWZ0UGFkZGluZ1RhYmxldCcpfTtcbiAgICB9XG4gICAgPiAqIHtcbiAgICAgIG1hcmdpbi1sZWZ0OiAyNHB4O1xuICAgIH1cbiAgICA+ICo6bnRoLWNoaWxkKG9kZCkge1xuICAgICAgbWFyZ2luLWJvdHRvbTogMTJweDtcbiAgICB9XG4gICAgPiAqOm50aC1jaGlsZChldmVuKSB7XG4gICAgICBtYXJnaW4tdG9wOiAxMnB4O1xuICAgIH1cbiAgYCl9O1xuICAke21vYmlsZShgXG4gICAgICA+ICoge1xuICAgIG1hcmdpbi1sZWZ0OiAxMnB4O1xuICB9XG4gIGApfTtcbmA7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIEZpbG1zdHJpcCh7IGNsYXNzTmFtZSwgY2hpbGRyZW4sIHJldmVhbCB9KSB7XG4gIGNvbnN0IG91dGVyUmVmID0gdXNlUmVmKG51bGwpO1xuXG4gIGNvbnN0IFtpc0RyYWdnaW5nLCBzZXRJc0RyYWdnaW5nXSA9IHVzZVN0YXRlKGZhbHNlKTtcbiAgY29uc3QgW2lzVG91Y2gsIHNldElzVG91Y2hdID0gdXNlU3RhdGUoZmFsc2UpO1xuICAvLyBjb25zdCBbaXNUb3VjaGluZywgc2V0SXNUb3VjaGluZ10gPSB1c2VTdGF0ZShmYWxzZSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBzZXRJc1RvdWNoKGlzVG91Y2hEZXZpY2UoKSk7XG4gICAgY29uc3QgbGlzdGVuZXIgPSB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgKCkgPT5cbiAgICAgIHNldElzVG91Y2goaXNUb3VjaERldmljZSgpKSxcbiAgICApO1xuICAgIC8vIGNvbnN0IHRvdWNoU3RhcnRMaXN0ZW5lciA9IG91dGVyUmVmLmN1cnJlbnQuYWRkRXZlbnRMaXN0ZW5lcihcbiAgICAvLyAgICd0b3VjaHN0YXJ0JyxcbiAgICAvLyAgICgpID0+IHNldElzVG91Y2hpbmcodHJ1ZSksXG4gICAgLy8gKTtcbiAgICAvLyBjb25zdCB0b3VjaEVuZExpc3RlbmVyID0gb3V0ZXJSZWYuY3VycmVudC5hZGRFdmVudExpc3RlbmVyKFxuICAgIC8vICAgJ3RvdWNoZW5kJyxcbiAgICAvLyAgICgpID0+IHNldElzVG91Y2hpbmcoZmFsc2UpLFxuICAgIC8vICk7XG4gICAgcmV0dXJuICgpID0+IHtcbiAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCBsaXN0ZW5lcik7XG4gICAgICAvLyBvdXRlclJlZi5jdXJyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXG4gICAgICAvLyAgICd0b3VjaHN0YXJ0JyxcbiAgICAgIC8vICAgdG91Y2hTdGFydExpc3RlbmVyLFxuICAgICAgLy8gKTtcbiAgICAgIC8vIG91dGVyUmVmLmN1cnJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcbiAgICAgIC8vICAgJ3RvdWNoZW5kJyxcbiAgICAgIC8vICAgdG91Y2hFbmRMaXN0ZW5lcixcbiAgICAgIC8vICk7XG4gICAgfTtcbiAgfSwgW10pO1xuXG4gIGNvbnN0IGdldFJhbmdlID0gKCkgPT5cbiAgICBvdXRlclJlZi5jdXJyZW50LnNjcm9sbFdpZHRoIC0gb3V0ZXJSZWYuY3VycmVudC5jbGllbnRXaWR0aDtcblxuICBjb25zdCBbeyBzY3JvbGwgfSwgc2V0U3ByaW5nXSA9IHVzZVNwcmluZygoKSA9PiAoe1xuICAgIHNjcm9sbDogMCxcbiAgfSkpO1xuXG4gIGNvbnN0IGJpbmREcmFnID0gdXNlRHJhZygoZHJhZykgPT4ge1xuICAgIGlmIChpc1RvdWNoKSByZXR1cm47XG4gICAgY29uc3Qge1xuICAgICAgbW92ZW1lbnQ6IFtteF0sXG4gICAgICB2ZWxvY2l0eSxcbiAgICAgIGRyYWdnaW5nLFxuICAgIH0gPSBkcmFnO1xuXG4gICAgY29uc3QgbWluID0gMDtcbiAgICBjb25zdCBtYXggPSBnZXRSYW5nZSgpO1xuXG4gICAgY29uc3QgcHJvamVjdGVkID1cbiAgICAgIG91dGVyUmVmLmN1cnJlbnQuc2Nyb2xsTGVmdCAtIG14ICogKDEgKyB2ZWxvY2l0eSk7XG4gICAgbGV0IG5vcm1hbGl6ZWQgPSBwcm9qZWN0ZWQ7XG5cbiAgICBpZiAocHJvamVjdGVkIDw9IG1pbikgbm9ybWFsaXplZCA9IG1pbjtcbiAgICBpZiAocHJvamVjdGVkID49IG1heCkgbm9ybWFsaXplZCA9IG1heCArIDUwO1xuXG4gICAgc2V0SXNEcmFnZ2luZyhkcmFnZ2luZyAmJiBteCAhPT0gMCk7XG5cbiAgICBzZXRTcHJpbmcoeyBzY3JvbGw6IG5vcm1hbGl6ZWQgfSk7XG4gIH0pO1xuXG4gIC8vIGNvbnN0IGJpbmRTY3JvbGwgPSB1c2VTY3JvbGwoKHsgc2Nyb2xsaW5nIH0pID0+IHtcbiAgLy8gICBpZiAoaXNUb3VjaCkgc2V0SXNEcmFnZ2luZyhpc1RvdWNoaW5nICYmIHNjcm9sbGluZyk7XG4gIC8vIH0pO1xuXG4gIHJldHVybiAoXG4gICAgPENvbnRhaW5lclxuICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWV9XG4gICAgICBpc1RvdWNoPXtpc1RvdWNofVxuICAgICAgcmVmPXtvdXRlclJlZn1cbiAgICAgIHNjcm9sbExlZnQ9e3Njcm9sbH1cbiAgICAgIHsuLi5iaW5kRHJhZygpfVxuICAgICAgLy8gey4uLmJpbmRTY3JvbGwoKX1cbiAgICA+XG4gICAgICA8SW5uZXIgaXNEcmFnZ2luZz17aXNEcmFnZ2luZ30+XG4gICAgICAgIHtjaGlsZHJlbi5tYXAoKGNoaWxkLCBpKSA9PiAoXG4gICAgICAgICAgPENoaWxkIGtleT17Y2hpbGQ/LnByb3BzPy5pZH0gaW5kZXg9e2l9IHJldmVhbD17cmV2ZWFsfT5cbiAgICAgICAgICAgIHtjaGlsZH1cbiAgICAgICAgICA8L0NoaWxkPlxuICAgICAgICApKX1cbiAgICAgIDwvSW5uZXI+XG4gICAgPC9Db250YWluZXI+XG4gICk7XG59XG5cbkZpbG1zdHJpcC5wcm9wVHlwZXMgPSB7XG4gIGNsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgY2hpbGRyZW46IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5ub2RlKS5pc1JlcXVpcmVkLFxuICByZXZlYWw6IFByb3BUeXBlcy5ib29sLFxufTtcblxuRmlsbXN0cmlwLmRlZmF1bHRQcm9wcyA9IHtcbiAgY2xhc3NOYW1lOiAnJyxcbiAgcmV2ZWFsOiB0cnVlLFxufTtcbiJdfQ== */"));

function Filmstrip({
  className,
  children,
  reveal
}) {
  const outerRef = Object(react__WEBPACK_IMPORTED_MODULE_1__["useRef"])(null);
  const {
    0: isDragging,
    1: setIsDragging
  } = Object(react__WEBPACK_IMPORTED_MODULE_1__["useState"])(false);
  const {
    0: isTouch,
    1: setIsTouch
  } = Object(react__WEBPACK_IMPORTED_MODULE_1__["useState"])(false); // const [isTouching, setIsTouching] = useState(false);

  Object(react__WEBPACK_IMPORTED_MODULE_1__["useEffect"])(() => {
    setIsTouch(is_touch_device__WEBPACK_IMPORTED_MODULE_5___default()());
    const listener = window.addEventListener('resize', () => setIsTouch(is_touch_device__WEBPACK_IMPORTED_MODULE_5___default()())); // const touchStartListener = outerRef.current.addEventListener(
    //   'touchstart',
    //   () => setIsTouching(true),
    // );
    // const touchEndListener = outerRef.current.addEventListener(
    //   'touchend',
    //   () => setIsTouching(false),
    // );

    return () => {
      window.removeEventListener('resize', listener); // outerRef.current.removeEventListener(
      //   'touchstart',
      //   touchStartListener,
      // );
      // outerRef.current.removeEventListener(
      //   'touchend',
      //   touchEndListener,
      // );
    };
  }, []);

  const getRange = () => outerRef.current.scrollWidth - outerRef.current.clientWidth;

  const [{
    scroll
  }, setSpring] = Object(react_spring__WEBPACK_IMPORTED_MODULE_3__["useSpring"])(() => ({
    scroll: 0
  }));
  const bindDrag = Object(react_use_gesture__WEBPACK_IMPORTED_MODULE_4__["useDrag"])(drag => {
    if (isTouch) return;
    const {
      movement: [mx],
      velocity,
      dragging
    } = drag;
    const min = 0;
    const max = getRange();
    const projected = outerRef.current.scrollLeft - mx * (1 + velocity);
    let normalized = projected;
    if (projected <= min) normalized = min;
    if (projected >= max) normalized = max + 50;
    setIsDragging(dragging && mx !== 0);
    setSpring({
      scroll: normalized
    });
  }); // const bindScroll = useScroll(({ scrolling }) => {
  //   if (isTouch) setIsDragging(isTouching && scrolling);
  // });

  return Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])(Container, _extends({
    className: className,
    isTouch: isTouch,
    ref: outerRef,
    scrollLeft: scroll
  }, bindDrag(), {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 197,
      columnNumber: 5
    }
  }), Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])(Inner, {
    isDragging: isDragging,
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 205,
      columnNumber: 7
    }
  }, children.map((child, i) => {
    var _child$props;

    return Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])(Child, {
      key: child === null || child === void 0 ? void 0 : (_child$props = child.props) === null || _child$props === void 0 ? void 0 : _child$props.id,
      index: i,
      reveal: reveal,
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 207,
        columnNumber: 11
      }
    }, child);
  })));
}
Filmstrip.propTypes = {
  className: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.string,
  children: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.arrayOf(prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.node).isRequired,
  reveal: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.bool
};
Filmstrip.defaultProps = {
  className: '',
  reveal: true
};

/***/ }),

/***/ "./components/GlitchImage/GlitchImage.jsx":
/*!************************************************!*\
  !*** ./components/GlitchImage/GlitchImage.jsx ***!
  \************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @emotion/styled-base */ "@emotion/styled-base");
/* harmony import */ var _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_emotion_styled_base__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! prop-types */ "prop-types");
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var glslify__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! glslify */ "glslify");
/* harmony import */ var glslify__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(glslify__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! three */ "three");
/* harmony import */ var three__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(three__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _glsl_vertex_glsl__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./glsl/vertex.glsl */ "./components/GlitchImage/glsl/vertex.glsl");
/* harmony import */ var _glsl_fragment_glsl__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./glsl/fragment.glsl */ "./components/GlitchImage/glsl/fragment.glsl");
/* harmony import */ var _emotion_core__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @emotion/core */ "@emotion/core");
/* harmony import */ var _emotion_core__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(_emotion_core__WEBPACK_IMPORTED_MODULE_7__);

var _jsxFileName = "/Users/cliftoncampbell/Development/clif.world/components/GlitchImage/GlitchImage.jsx";
var __jsx = react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _EMOTION_STRINGIFIED_CSS_ERROR__() { return "You have tried to stringify object returned from `css` function. It isn't supposed to be used directly (e.g. as value of the `className` prop), but rather handed to emotion so it can handle it (e.g. as value of `css` prop)."; }








const vertexShader = glslify__WEBPACK_IMPORTED_MODULE_3___default()(_glsl_vertex_glsl__WEBPACK_IMPORTED_MODULE_5__["default"]);
const fragmentShader = glslify__WEBPACK_IMPORTED_MODULE_3___default()(_glsl_fragment_glsl__WEBPACK_IMPORTED_MODULE_6__["default"]);

const Container = _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()("div", {
  target: "e1yvo4p60",
  label: "Container"
})(false ? undefined : {
  name: "zzq8fp",
  styles: "position:relative;width:100%;canvas{position:absolute;top:0;left:0;background:transparent;}",
  map: "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL0dsaXRjaEltYWdlL0dsaXRjaEltYWdlLmpzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFXNEIiLCJmaWxlIjoiL1VzZXJzL2NsaWZ0b25jYW1wYmVsbC9EZXZlbG9wbWVudC9jbGlmLndvcmxkL2NvbXBvbmVudHMvR2xpdGNoSW1hZ2UvR2xpdGNoSW1hZ2UuanN4Iiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0LCB7IENvbXBvbmVudCB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ0BlbW90aW9uL3N0eWxlZCc7XG5pbXBvcnQgZ2xzbCBmcm9tICdnbHNsaWZ5JztcbmltcG9ydCAqIGFzIFRIUkVFIGZyb20gJ3RocmVlJztcbmltcG9ydCB2ZXJ0ZXggZnJvbSAnLi9nbHNsL3ZlcnRleC5nbHNsJztcbmltcG9ydCBmcmFnbWVudCBmcm9tICcuL2dsc2wvZnJhZ21lbnQuZ2xzbCc7XG5cbmNvbnN0IHZlcnRleFNoYWRlciA9IGdsc2wodmVydGV4KTtcbmNvbnN0IGZyYWdtZW50U2hhZGVyID0gZ2xzbChmcmFnbWVudCk7XG5cbmNvbnN0IENvbnRhaW5lciA9IHN0eWxlZC5kaXZgXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgd2lkdGg6IDEwMCU7XG4gIGNhbnZhcyB7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHRvcDogMDtcbiAgICBsZWZ0OiAwO1xuICAgIGJhY2tncm91bmQ6IHRyYW5zcGFyZW50O1xuICB9XG5gO1xuXG5jbGFzcyBHbGl0Y2hJbWFnZSBleHRlbmRzIENvbXBvbmVudCB7XG4gIGNvbnRhaW5lclJlZiA9IG51bGw7XG5cbiAgd2lkdGggPSBudWxsO1xuXG4gIGhlaWdodCA9IG51bGw7XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgdGhpcy5zZXRTaXplKCk7XG4gICAgdGhpcy5pbml0KCk7XG4gICAgdGhpcy5jcmVhdGVNZXNoKCk7XG4gICAgdGhpcy5hZGRFdmVudHMoKTtcbiAgICB0aGlzLnJlbmRlclNjZW5lKCk7XG4gICAgdGhpcy5vblJlc2l6ZSgpO1xuICB9XG5cbiAgaW5pdCA9ICgpID0+IHtcbiAgICB0aGlzLnNjZW5lID0gbmV3IFRIUkVFLlNjZW5lKCk7XG4gICAgdGhpcy5jYW1lcmEgPSBuZXcgVEhSRUUuUGVyc3BlY3RpdmVDYW1lcmEoXG4gICAgICA0NSxcbiAgICAgIHRoaXMud2lkdGggLyB0aGlzLmhlaWdodCxcbiAgICAgIDAuMSxcbiAgICAgIDEwMCxcbiAgICApO1xuXG4gICAgdGhpcy5jYW1lcmEucG9zaXRpb24ueiA9IDE7XG4gICAgdGhpcy5yZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKHtcbiAgICAgIGFudGlhbGlhczogdHJ1ZSxcbiAgICAgIGFscGhhOiB0cnVlLFxuICAgIH0pO1xuICAgIHRoaXMucmVuZGVyZXIuc2V0U2l6ZSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRDbGVhckNvbG9yKDB4MTYxNjE2LCAwKTtcbiAgICB0aGlzLnJlbmRlcmVyLnNldFBpeGVsUmF0aW8od2luZG93LmRldmljZVBpeGVsUmF0aW8pO1xuICAgIHRoaXMuY29udGFpbmVyUmVmLmFwcGVuZENoaWxkKHRoaXMucmVuZGVyZXIuZG9tRWxlbWVudCk7XG5cbiAgICB0aGlzLmNsb2NrID0gbmV3IFRIUkVFLkNsb2NrKCk7XG4gIH07XG5cbiAgc2V0U2l6ZSA9ICgpID0+IHtcbiAgICB0aGlzLndpZHRoID0gdGhpcy5jb250YWluZXJSZWYuY2xpZW50V2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSB0aGlzLndpZHRoICogKDUgLyAxMik7XG4gICAgdGhpcy5jb250YWluZXJSZWYuc3R5bGUuaGVpZ2h0ID0gYCR7dGhpcy5oZWlnaHR9cHhgO1xuICB9O1xuXG4gIG9uUmVzaXplID0gKCkgPT4ge1xuICAgIHRoaXMuc2V0U2l6ZSgpO1xuXG4gICAgdGhpcy5jYW1lcmEuYXNwZWN0ID0gdGhpcy53aWR0aCAvIHRoaXMuaGVpZ2h0O1xuICAgIHRoaXMuY2FtZXJhLnVwZGF0ZVByb2plY3Rpb25NYXRyaXgoKTtcblxuICAgIHRoaXMucmVuZGVyZXIuc2V0U2l6ZSh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgdGhpcy5tZXNoLnNjYWxlLnNldChcbiAgICAgIHRoaXMud2lkdGggLyB0aGlzLmhlaWdodCAtICh0aGlzLndpZHRoIC8gdGhpcy5oZWlnaHQpICogMC4yLFxuICAgICAgMC44LFxuICAgICAgMSxcbiAgICApO1xuICB9O1xuXG4gIGFkZEV2ZW50cyA9ICgpID0+IHtcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5ydW4pO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCB0aGlzLm9uUmVzaXplLCBmYWxzZSk7XG4gIH07XG5cbiAgY3JlYXRlTWVzaCA9ICgpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBzcmMgfSA9IHRoaXMucHJvcHM7XG4gICAgICB0aGlzLmdlb21ldHJ5ID0gbmV3IFRIUkVFLlBsYW5lR2VvbWV0cnkoMSwgMSwgMTYsIDE2KTtcbiAgICAgIGNvbnN0IHRleHR1cmUgPSBuZXcgVEhSRUUuVGV4dHVyZUxvYWRlcigpLmxvYWQoc3JjKTtcbiAgICAgIHRleHR1cmUubWluRmlsdGVyID0gVEhSRUUuTGluZWFyRmlsdGVyO1xuICAgICAgdGhpcy5tYXRlcmlhbCA9IG5ldyBUSFJFRS5TaGFkZXJNYXRlcmlhbCh7XG4gICAgICAgIHZlcnRleFNoYWRlcixcbiAgICAgICAgZnJhZ21lbnRTaGFkZXIsXG4gICAgICAgIHVuaWZvcm1zOiB7XG4gICAgICAgICAgdVRpbWU6IHsgdmFsdWU6IDAuMCB9LFxuICAgICAgICAgIHVUZXh0dXJlOiB7XG4gICAgICAgICAgICB2YWx1ZTogdGV4dHVyZSxcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgICB0aGlzLm1lc2ggPSBuZXcgVEhSRUUuTWVzaCh0aGlzLmdlb21ldHJ5LCB0aGlzLm1hdGVyaWFsKTtcblxuICAgICAgdGhpcy5zY2VuZS5hZGQodGhpcy5tZXNoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBhbGVydChlKTtcbiAgICB9XG4gIH07XG5cbiAgcnVuID0gKCkgPT4ge1xuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnJ1bik7XG4gICAgdGhpcy5yZW5kZXJTY2VuZSgpO1xuICB9O1xuXG4gIHJlbmRlclNjZW5lID0gKCkgPT4ge1xuICAgIHRoaXMubWF0ZXJpYWwudW5pZm9ybXMudVRpbWUudmFsdWUgPSB0aGlzLmNsb2NrLmdldEVsYXBzZWRUaW1lKCk7XG4gICAgdGhpcy5yZW5kZXJlci5yZW5kZXIodGhpcy5zY2VuZSwgdGhpcy5jYW1lcmEpO1xuICB9O1xuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7IGdhIH0gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiAoXG4gICAgICA8Q29udGFpbmVyXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgZ3JpZEFyZWE6IGdhLFxuICAgICAgICB9fVxuICAgICAgICByZWY9eyhyZWYpID0+IHtcbiAgICAgICAgICB0aGlzLmNvbnRhaW5lclJlZiA9IHJlZjtcbiAgICAgICAgfX1cbiAgICAgIC8+XG4gICAgKTtcbiAgfVxufVxuXG5HbGl0Y2hJbWFnZS5wcm9wVHlwZXMgPSB7XG4gIHNyYzogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxuICBnYTogUHJvcFR5cGVzLnN0cmluZyxcbn07XG5cbkdsaXRjaEltYWdlLmRlZmF1bHRQcm9wcyA9IHtcbiAgZ2E6ICcnLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgR2xpdGNoSW1hZ2U7XG4iXX0= */",
  toString: _EMOTION_STRINGIFIED_CSS_ERROR__
});

class GlitchImage extends react__WEBPACK_IMPORTED_MODULE_1__["Component"] {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "containerRef", null);

    _defineProperty(this, "width", null);

    _defineProperty(this, "height", null);

    _defineProperty(this, "init", () => {
      this.scene = new three__WEBPACK_IMPORTED_MODULE_4__["Scene"]();
      this.camera = new three__WEBPACK_IMPORTED_MODULE_4__["PerspectiveCamera"](45, this.width / this.height, 0.1, 100);
      this.camera.position.z = 1;
      this.renderer = new three__WEBPACK_IMPORTED_MODULE_4__["WebGLRenderer"]({
        antialias: true,
        alpha: true
      });
      this.renderer.setSize(this.width, this.height);
      this.renderer.setClearColor(0x161616, 0);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.containerRef.appendChild(this.renderer.domElement);
      this.clock = new three__WEBPACK_IMPORTED_MODULE_4__["Clock"]();
    });

    _defineProperty(this, "setSize", () => {
      this.width = this.containerRef.clientWidth;
      this.height = this.width * (5 / 12);
      this.containerRef.style.height = `${this.height}px`;
    });

    _defineProperty(this, "onResize", () => {
      this.setSize();
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
      this.mesh.scale.set(this.width / this.height - this.width / this.height * 0.2, 0.8, 1);
    });

    _defineProperty(this, "addEvents", () => {
      requestAnimationFrame(this.run);
      window.addEventListener('resize', this.onResize, false);
    });

    _defineProperty(this, "createMesh", () => {
      try {
        const {
          src
        } = this.props;
        this.geometry = new three__WEBPACK_IMPORTED_MODULE_4__["PlaneGeometry"](1, 1, 16, 16);
        const texture = new three__WEBPACK_IMPORTED_MODULE_4__["TextureLoader"]().load(src);
        texture.minFilter = three__WEBPACK_IMPORTED_MODULE_4__["LinearFilter"];
        this.material = new three__WEBPACK_IMPORTED_MODULE_4__["ShaderMaterial"]({
          vertexShader,
          fragmentShader,
          uniforms: {
            uTime: {
              value: 0.0
            },
            uTexture: {
              value: texture
            }
          }
        });
        this.mesh = new three__WEBPACK_IMPORTED_MODULE_4__["Mesh"](this.geometry, this.material);
        this.scene.add(this.mesh);
      } catch (e) {
        alert(e);
      }
    });

    _defineProperty(this, "run", () => {
      requestAnimationFrame(this.run);
      this.renderScene();
    });

    _defineProperty(this, "renderScene", () => {
      this.material.uniforms.uTime.value = this.clock.getElapsedTime();
      this.renderer.render(this.scene, this.camera);
    });
  }

  componentDidMount() {
    this.setSize();
    this.init();
    this.createMesh();
    this.addEvents();
    this.renderScene();
    this.onResize();
  }

  render() {
    const {
      ga
    } = this.props;
    return Object(_emotion_core__WEBPACK_IMPORTED_MODULE_7__["jsx"])(Container, {
      style: {
        gridArea: ga
      },
      ref: ref => {
        this.containerRef = ref;
      },
      __self: this,
      __source: {
        fileName: _jsxFileName,
        lineNumber: 123,
        columnNumber: 7
      }
    });
  }

}

GlitchImage.propTypes = {
  src: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.string.isRequired,
  ga: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.string
};
GlitchImage.defaultProps = {
  ga: ''
};
/* harmony default export */ __webpack_exports__["default"] = (GlitchImage);

/***/ }),

/***/ "./components/GlitchImage/glsl/fragment.glsl":
/*!***************************************************!*\
  !*** ./components/GlitchImage/glsl/fragment.glsl ***!
  \***************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ("precision highp float;\n#define GLSLIFY 1\n\nvarying vec2 vUv;\nvarying float vWave;\nuniform sampler2D uTexture;\n\nvoid main() {\n  float wave = vWave * 0.25;\n  float r = texture2D(uTexture, vUv).r;\n  float g = texture2D(uTexture, vUv).g;\n  float b = texture2D(uTexture, vUv + wave).b;\n  vec3 texture = vec3(r, g, b);\n  gl_FragColor = vec4(texture, 1.);\n}");

/***/ }),

/***/ "./components/GlitchImage/glsl/vertex.glsl":
/*!*************************************************!*\
  !*** ./components/GlitchImage/glsl/vertex.glsl ***!
  \*************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony default export */ __webpack_exports__["default"] = ("precision highp float;\n#define GLSLIFY 1\n\nvarying vec2 vUv;\nvarying float vWave;\nuniform float uTime;\n\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute(vec4 x) {\n     return mod289(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise(vec3 v) {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);\n\n  // First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n  // Other corners\n  vec3 g = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g;\n  vec3 i1 = min( g.xyz, l.zxy );\n  vec3 i2 = max( g.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n  // Permutations\n  i = mod289(i);\n  vec4 p = permute( permute( permute(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n  // Gradients: 7x7 points over a square, mapped onto an octahedron.\n  // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D.wyz - D.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1.xy,h.z);\n  vec3 p3 = vec3(a1.zw,h.w);\n\n  // Normalise gradients\n  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n  // Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n}\n\nvoid main() {\n  vUv = uv;\n\n  vec3 pos = position;\n  float noiseFreq = .3;\n  float noiseAmp = 0.04;\n  vec3 noisePos = vec3(pos.x * noiseFreq + uTime, pos.y, pos.z);\n  pos.z += snoise(noisePos) * noiseAmp;\n  vWave = pos.z;\n\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);\n}");

/***/ }),

/***/ "./components/GlitchImage/index.js":
/*!*****************************************!*\
  !*** ./components/GlitchImage/index.js ***!
  \*****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _GlitchImage__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./GlitchImage */ "./components/GlitchImage/GlitchImage.jsx");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _GlitchImage__WEBPACK_IMPORTED_MODULE_0__["default"]; });



/***/ }),

/***/ "./components/Navigation/Navigation.jsx":
/*!**********************************************!*\
  !*** ./components/Navigation/Navigation.jsx ***!
  \**********************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @emotion/styled-base */ "@emotion/styled-base");
/* harmony import */ var _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_emotion_styled_base__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! react-router-dom */ "react-router-dom");
/* harmony import */ var react_router_dom__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(react_router_dom__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! prop-types */ "prop-types");
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var styles__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! styles */ "./styles/index.js");
/* harmony import */ var styles_text__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! styles/text */ "./styles/text.js");
/* harmony import */ var styles_layout__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! styles/layout */ "./styles/layout.js");
/* harmony import */ var constants_pages__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! constants/pages */ "./constants/pages.js");
/* harmony import */ var icons__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! icons */ "./icons/index.js");
/* harmony import */ var _layout__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../layout */ "./components/layout.js");
/* harmony import */ var _emotion_core__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! @emotion/core */ "@emotion/core");
/* harmony import */ var _emotion_core__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(_emotion_core__WEBPACK_IMPORTED_MODULE_10__);

var _jsxFileName = "/Users/cliftoncampbell/Development/clif.world/components/Navigation/Navigation.jsx";
var __jsx = react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement;

function _EMOTION_STRINGIFIED_CSS_ERROR__() { return "You have tried to stringify object returned from `css` function. It isn't supposed to be used directly (e.g. as value of the `className` prop), but rather handed to emotion so it can handle it (e.g. as value of `css` prop)."; }












const StyledHomeIcon = /*#__PURE__*/_emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()(icons__WEBPACK_IMPORTED_MODULE_8__["HomeIcon"], {
  target: "ehen9z30",
  label: "StyledHomeIcon"
})(false ? undefined : {
  name: "1uu7u3w",
  styles: "height:20px;width:20px;",
  map: "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL05hdmlnYXRpb24vTmF2aWdhdGlvbi5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBV3VDIiwiZmlsZSI6Ii9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL05hdmlnYXRpb24vTmF2aWdhdGlvbi5qc3giLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHsgTGluaywgdXNlUGFyYW1zIH0gZnJvbSAncmVhY3Qtcm91dGVyLWRvbSc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ0BlbW90aW9uL3N0eWxlZCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgZ2V0Qm9vbCwgZ2V0U3R5bGUsIHNpemUgfSBmcm9tICdzdHlsZXMnO1xuaW1wb3J0IHsgZGV0YWlsIH0gZnJvbSAnc3R5bGVzL3RleHQnO1xuaW1wb3J0IHsgY2VudGVyZWQgfSBmcm9tICdzdHlsZXMvbGF5b3V0JztcbmltcG9ydCB7IEhFTExPLCBXT1JLLCBQUk9KRUNUUywgb3JkZXJlZFRhYnMgfSBmcm9tICdjb25zdGFudHMvcGFnZXMnO1xuaW1wb3J0IHsgSG9tZUljb24gfSBmcm9tICdpY29ucyc7XG5pbXBvcnQgeyBDb2x1bW4gfSBmcm9tICcuLi9sYXlvdXQnO1xuXG5jb25zdCBTdHlsZWRIb21lSWNvbiA9IHN0eWxlZChIb21lSWNvbilgXG4gIGhlaWdodDogMjBweDtcbiAgd2lkdGg6IDIwcHg7XG5gO1xuXG5jb25zdCBTdHlsZWRMaW5rID0gc3R5bGVkKExpbmspYFxuICAke2NlbnRlcmVkfTtcbiAgJHtkZXRhaWx9O1xuICBmb250LXdlaWdodDogMzAwO1xuICBwb3NpdGlvbjogcmVsYXRpdmU7XG4gIHdyaXRpbmctbW9kZTogdmVydGljYWwtbHI7XG4gIHotaW5kZXg6IDE7XG4gIHdpZHRoOiAke3NpemUoNil9O1xuICBwYWRkaW5nOiAke3NpemUoMil9IDA7XG4gICR7U3R5bGVkSG9tZUljb259IHtcbiAgICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDEnKX07XG4gIH1cbiAgJHtnZXRCb29sKFxuICAgICdpc0FjdGl2ZScsXG4gICAgYFxuICAgICAgY29sb3I6ICR7Z2V0U3R5bGUoJ3RleHQzJyl9O1xuICAgICAgJHtTdHlsZWRIb21lSWNvbn0ge1xuICAgICAgICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDInKX07XG4gICAgICB9XG4gICAgYCxcbiAgICBgXG4gICAgICAmOm5vdCguJHtIRUxMT30pOmhvdmVyOjphZnRlciB7XG4gICAgICAgIHdpZHRoOiAyMCU7XG4gICAgICB9XG4gICAgICAmOm5vdCguJHtIRUxMT30pOmFjdGl2ZTo6YWZ0ZXIge1xuICAgICAgICB3aWR0aDogMTIlO1xuICAgICAgfVxuICAgICAgJi4ke0hFTExPfTpob3ZlciB7XG4gICAgICAgIG9wYWNpdHk6IDAuOTtcbiAgICAgIH1cbiAgICAgICYuJHtIRUxMT306YWN0aXZlIHtcbiAgICAgICAgb3BhY2l0eTogMC44O1xuICAgICAgfVxuICBgLFxuICApfTtcbiAgJjpub3QoLiR7SEVMTE99KSA6OmFmdGVyIHtcbiAgICBjb250ZW50OiAnJztcbiAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgdG9wOiAwO1xuICAgIGxlZnQ6IDA7XG4gICAgaGVpZ2h0OiAxMDAlO1xuICAgIHdpZHRoOiAkeyh7IGlzQWN0aXZlIH0pID0+IChpc0FjdGl2ZSA/ICcxMDAlJyA6IDApfTtcbiAgICB0cmFuc2l0aW9uOiAke2dldFN0eWxlKCdlYXNlT3V0U2l6ZScpfTtcbiAgICBiYWNrZ3JvdW5kOiAke2dldFN0eWxlKCdjdGFCYWNrZ3JvdW5kMScpfTtcbiAgICB6LWluZGV4OiAtMTtcbiAgfVxuYDtcblxuY29uc3QgQ29udGFpbmVyID0gc3R5bGVkKENvbHVtbilgXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbmA7XG5cbmNvbnN0IGNvcHkgPSB7XG4gIFtIRUxMT106IDxTdHlsZWRIb21lSWNvbiAvPixcbiAgW1BST0pFQ1RTXTogJ1Byb2plY3RzJyxcbiAgW1dPUktdOiAnSGlzdG9yeScsXG59O1xuXG5jb25zdCBOYXZpZ2F0aW9uID0gKHsgY2xhc3NOYW1lIH0pID0+IHtcbiAgY29uc3QgeyB0YWJJZCB9ID0gdXNlUGFyYW1zKCk7XG4gIHJldHVybiAoXG4gICAgPENvbnRhaW5lciBjbGFzc05hbWU9e2NsYXNzTmFtZX0gc3A9ezR9PlxuICAgICAge29yZGVyZWRUYWJzLm1hcCgodGFiKSA9PiAoXG4gICAgICAgIDxTdHlsZWRMaW5rXG4gICAgICAgICAgY2xhc3NOYW1lPXt0YWJ9XG4gICAgICAgICAgaXNBY3RpdmU9e3RhYiA9PT0gdGFiSWR9XG4gICAgICAgICAgdG89e2AvJHt0YWJ9YH1cbiAgICAgICAgICBrZXk9e3RhYn1cbiAgICAgICAgPlxuICAgICAgICAgIHtjb3B5W3RhYl19XG4gICAgICAgIDwvU3R5bGVkTGluaz5cbiAgICAgICkpfVxuICAgIDwvQ29udGFpbmVyPlxuICApO1xufTtcblxuTmF2aWdhdGlvbi5wcm9wVHlwZXMgPSB7XG4gIGNsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbn07XG5cbk5hdmlnYXRpb24uZGVmYXVsdFByb3BzID0ge1xuICBjbGFzc05hbWU6ICcnLFxufTtcblxuZXhwb3J0IGRlZmF1bHQgTmF2aWdhdGlvbjtcbiJdfQ== */",
  toString: _EMOTION_STRINGIFIED_CSS_ERROR__
});

const StyledLink = /*#__PURE__*/_emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()(react_router_dom__WEBPACK_IMPORTED_MODULE_2__["Link"], {
  target: "ehen9z31",
  label: "StyledLink"
})(styles_layout__WEBPACK_IMPORTED_MODULE_6__["centered"], ";", styles_text__WEBPACK_IMPORTED_MODULE_5__["detail"], ";font-weight:300;position:relative;writing-mode:vertical-lr;z-index:1;width:", Object(styles__WEBPACK_IMPORTED_MODULE_4__["size"])(6), ";padding:", Object(styles__WEBPACK_IMPORTED_MODULE_4__["size"])(2), " 0;", StyledHomeIcon, "{color:", Object(styles__WEBPACK_IMPORTED_MODULE_4__["getStyle"])('text1'), ";}", Object(styles__WEBPACK_IMPORTED_MODULE_4__["getBool"])('isActive', `
      color: ${Object(styles__WEBPACK_IMPORTED_MODULE_4__["getStyle"])('text3')};
      ${StyledHomeIcon} {
        color: ${Object(styles__WEBPACK_IMPORTED_MODULE_4__["getStyle"])('text2')};
      }
    `, `
      &:not(.${constants_pages__WEBPACK_IMPORTED_MODULE_7__["HELLO"]}):hover::after {
        width: 20%;
      }
      &:not(.${constants_pages__WEBPACK_IMPORTED_MODULE_7__["HELLO"]}):active::after {
        width: 12%;
      }
      &.${constants_pages__WEBPACK_IMPORTED_MODULE_7__["HELLO"]}:hover {
        opacity: 0.9;
      }
      &.${constants_pages__WEBPACK_IMPORTED_MODULE_7__["HELLO"]}:active {
        opacity: 0.8;
      }
  `), ";&:not(.", constants_pages__WEBPACK_IMPORTED_MODULE_7__["HELLO"], ")::after{content:'';position:absolute;top:0;left:0;height:100%;width:", ({
  isActive
}) => isActive ? '100%' : 0, ";transition:", Object(styles__WEBPACK_IMPORTED_MODULE_4__["getStyle"])('easeOutSize'), ";background:", Object(styles__WEBPACK_IMPORTED_MODULE_4__["getStyle"])('ctaBackground1'), ";z-index:-1;}" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL05hdmlnYXRpb24vTmF2aWdhdGlvbi5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBZ0IrQiIsImZpbGUiOiIvVXNlcnMvY2xpZnRvbmNhbXBiZWxsL0RldmVsb3BtZW50L2NsaWYud29ybGQvY29tcG9uZW50cy9OYXZpZ2F0aW9uL05hdmlnYXRpb24uanN4Iiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IExpbmssIHVzZVBhcmFtcyB9IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nO1xuaW1wb3J0IHN0eWxlZCBmcm9tICdAZW1vdGlvbi9zdHlsZWQnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7IGdldEJvb2wsIGdldFN0eWxlLCBzaXplIH0gZnJvbSAnc3R5bGVzJztcbmltcG9ydCB7IGRldGFpbCB9IGZyb20gJ3N0eWxlcy90ZXh0JztcbmltcG9ydCB7IGNlbnRlcmVkIH0gZnJvbSAnc3R5bGVzL2xheW91dCc7XG5pbXBvcnQgeyBIRUxMTywgV09SSywgUFJPSkVDVFMsIG9yZGVyZWRUYWJzIH0gZnJvbSAnY29uc3RhbnRzL3BhZ2VzJztcbmltcG9ydCB7IEhvbWVJY29uIH0gZnJvbSAnaWNvbnMnO1xuaW1wb3J0IHsgQ29sdW1uIH0gZnJvbSAnLi4vbGF5b3V0JztcblxuY29uc3QgU3R5bGVkSG9tZUljb24gPSBzdHlsZWQoSG9tZUljb24pYFxuICBoZWlnaHQ6IDIwcHg7XG4gIHdpZHRoOiAyMHB4O1xuYDtcblxuY29uc3QgU3R5bGVkTGluayA9IHN0eWxlZChMaW5rKWBcbiAgJHtjZW50ZXJlZH07XG4gICR7ZGV0YWlsfTtcbiAgZm9udC13ZWlnaHQ6IDMwMDtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICB3cml0aW5nLW1vZGU6IHZlcnRpY2FsLWxyO1xuICB6LWluZGV4OiAxO1xuICB3aWR0aDogJHtzaXplKDYpfTtcbiAgcGFkZGluZzogJHtzaXplKDIpfSAwO1xuICAke1N0eWxlZEhvbWVJY29ufSB7XG4gICAgY29sb3I6ICR7Z2V0U3R5bGUoJ3RleHQxJyl9O1xuICB9XG4gICR7Z2V0Qm9vbChcbiAgICAnaXNBY3RpdmUnLFxuICAgIGBcbiAgICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MycpfTtcbiAgICAgICR7U3R5bGVkSG9tZUljb259IHtcbiAgICAgICAgY29sb3I6ICR7Z2V0U3R5bGUoJ3RleHQyJyl9O1xuICAgICAgfVxuICAgIGAsXG4gICAgYFxuICAgICAgJjpub3QoLiR7SEVMTE99KTpob3Zlcjo6YWZ0ZXIge1xuICAgICAgICB3aWR0aDogMjAlO1xuICAgICAgfVxuICAgICAgJjpub3QoLiR7SEVMTE99KTphY3RpdmU6OmFmdGVyIHtcbiAgICAgICAgd2lkdGg6IDEyJTtcbiAgICAgIH1cbiAgICAgICYuJHtIRUxMT306aG92ZXIge1xuICAgICAgICBvcGFjaXR5OiAwLjk7XG4gICAgICB9XG4gICAgICAmLiR7SEVMTE99OmFjdGl2ZSB7XG4gICAgICAgIG9wYWNpdHk6IDAuODtcbiAgICAgIH1cbiAgYCxcbiAgKX07XG4gICY6bm90KC4ke0hFTExPfSkgOjphZnRlciB7XG4gICAgY29udGVudDogJyc7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHRvcDogMDtcbiAgICBsZWZ0OiAwO1xuICAgIGhlaWdodDogMTAwJTtcbiAgICB3aWR0aDogJHsoeyBpc0FjdGl2ZSB9KSA9PiAoaXNBY3RpdmUgPyAnMTAwJScgOiAwKX07XG4gICAgdHJhbnNpdGlvbjogJHtnZXRTdHlsZSgnZWFzZU91dFNpemUnKX07XG4gICAgYmFja2dyb3VuZDogJHtnZXRTdHlsZSgnY3RhQmFja2dyb3VuZDEnKX07XG4gICAgei1pbmRleDogLTE7XG4gIH1cbmA7XG5cbmNvbnN0IENvbnRhaW5lciA9IHN0eWxlZChDb2x1bW4pYFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XG5gO1xuXG5jb25zdCBjb3B5ID0ge1xuICBbSEVMTE9dOiA8U3R5bGVkSG9tZUljb24gLz4sXG4gIFtQUk9KRUNUU106ICdQcm9qZWN0cycsXG4gIFtXT1JLXTogJ0hpc3RvcnknLFxufTtcblxuY29uc3QgTmF2aWdhdGlvbiA9ICh7IGNsYXNzTmFtZSB9KSA9PiB7XG4gIGNvbnN0IHsgdGFiSWQgfSA9IHVzZVBhcmFtcygpO1xuICByZXR1cm4gKFxuICAgIDxDb250YWluZXIgY2xhc3NOYW1lPXtjbGFzc05hbWV9IHNwPXs0fT5cbiAgICAgIHtvcmRlcmVkVGFicy5tYXAoKHRhYikgPT4gKFxuICAgICAgICA8U3R5bGVkTGlua1xuICAgICAgICAgIGNsYXNzTmFtZT17dGFifVxuICAgICAgICAgIGlzQWN0aXZlPXt0YWIgPT09IHRhYklkfVxuICAgICAgICAgIHRvPXtgLyR7dGFifWB9XG4gICAgICAgICAga2V5PXt0YWJ9XG4gICAgICAgID5cbiAgICAgICAgICB7Y29weVt0YWJdfVxuICAgICAgICA8L1N0eWxlZExpbms+XG4gICAgICApKX1cbiAgICA8L0NvbnRhaW5lcj5cbiAgKTtcbn07XG5cbk5hdmlnYXRpb24ucHJvcFR5cGVzID0ge1xuICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG59O1xuXG5OYXZpZ2F0aW9uLmRlZmF1bHRQcm9wcyA9IHtcbiAgY2xhc3NOYW1lOiAnJyxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IE5hdmlnYXRpb247XG4iXX0= */"));

const Container = /*#__PURE__*/_emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()(_layout__WEBPACK_IMPORTED_MODULE_9__["Column"], {
  target: "ehen9z32",
  label: "Container"
})(false ? undefined : {
  name: "79elbk",
  styles: "position:relative;",
  map: "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL05hdmlnYXRpb24vTmF2aWdhdGlvbi5qc3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBZ0VnQyIsImZpbGUiOiIvVXNlcnMvY2xpZnRvbmNhbXBiZWxsL0RldmVsb3BtZW50L2NsaWYud29ybGQvY29tcG9uZW50cy9OYXZpZ2F0aW9uL05hdmlnYXRpb24uanN4Iiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7IExpbmssIHVzZVBhcmFtcyB9IGZyb20gJ3JlYWN0LXJvdXRlci1kb20nO1xuaW1wb3J0IHN0eWxlZCBmcm9tICdAZW1vdGlvbi9zdHlsZWQnO1xuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcbmltcG9ydCB7IGdldEJvb2wsIGdldFN0eWxlLCBzaXplIH0gZnJvbSAnc3R5bGVzJztcbmltcG9ydCB7IGRldGFpbCB9IGZyb20gJ3N0eWxlcy90ZXh0JztcbmltcG9ydCB7IGNlbnRlcmVkIH0gZnJvbSAnc3R5bGVzL2xheW91dCc7XG5pbXBvcnQgeyBIRUxMTywgV09SSywgUFJPSkVDVFMsIG9yZGVyZWRUYWJzIH0gZnJvbSAnY29uc3RhbnRzL3BhZ2VzJztcbmltcG9ydCB7IEhvbWVJY29uIH0gZnJvbSAnaWNvbnMnO1xuaW1wb3J0IHsgQ29sdW1uIH0gZnJvbSAnLi4vbGF5b3V0JztcblxuY29uc3QgU3R5bGVkSG9tZUljb24gPSBzdHlsZWQoSG9tZUljb24pYFxuICBoZWlnaHQ6IDIwcHg7XG4gIHdpZHRoOiAyMHB4O1xuYDtcblxuY29uc3QgU3R5bGVkTGluayA9IHN0eWxlZChMaW5rKWBcbiAgJHtjZW50ZXJlZH07XG4gICR7ZGV0YWlsfTtcbiAgZm9udC13ZWlnaHQ6IDMwMDtcbiAgcG9zaXRpb246IHJlbGF0aXZlO1xuICB3cml0aW5nLW1vZGU6IHZlcnRpY2FsLWxyO1xuICB6LWluZGV4OiAxO1xuICB3aWR0aDogJHtzaXplKDYpfTtcbiAgcGFkZGluZzogJHtzaXplKDIpfSAwO1xuICAke1N0eWxlZEhvbWVJY29ufSB7XG4gICAgY29sb3I6ICR7Z2V0U3R5bGUoJ3RleHQxJyl9O1xuICB9XG4gICR7Z2V0Qm9vbChcbiAgICAnaXNBY3RpdmUnLFxuICAgIGBcbiAgICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MycpfTtcbiAgICAgICR7U3R5bGVkSG9tZUljb259IHtcbiAgICAgICAgY29sb3I6ICR7Z2V0U3R5bGUoJ3RleHQyJyl9O1xuICAgICAgfVxuICAgIGAsXG4gICAgYFxuICAgICAgJjpub3QoLiR7SEVMTE99KTpob3Zlcjo6YWZ0ZXIge1xuICAgICAgICB3aWR0aDogMjAlO1xuICAgICAgfVxuICAgICAgJjpub3QoLiR7SEVMTE99KTphY3RpdmU6OmFmdGVyIHtcbiAgICAgICAgd2lkdGg6IDEyJTtcbiAgICAgIH1cbiAgICAgICYuJHtIRUxMT306aG92ZXIge1xuICAgICAgICBvcGFjaXR5OiAwLjk7XG4gICAgICB9XG4gICAgICAmLiR7SEVMTE99OmFjdGl2ZSB7XG4gICAgICAgIG9wYWNpdHk6IDAuODtcbiAgICAgIH1cbiAgYCxcbiAgKX07XG4gICY6bm90KC4ke0hFTExPfSkgOjphZnRlciB7XG4gICAgY29udGVudDogJyc7XG4gICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgIHRvcDogMDtcbiAgICBsZWZ0OiAwO1xuICAgIGhlaWdodDogMTAwJTtcbiAgICB3aWR0aDogJHsoeyBpc0FjdGl2ZSB9KSA9PiAoaXNBY3RpdmUgPyAnMTAwJScgOiAwKX07XG4gICAgdHJhbnNpdGlvbjogJHtnZXRTdHlsZSgnZWFzZU91dFNpemUnKX07XG4gICAgYmFja2dyb3VuZDogJHtnZXRTdHlsZSgnY3RhQmFja2dyb3VuZDEnKX07XG4gICAgei1pbmRleDogLTE7XG4gIH1cbmA7XG5cbmNvbnN0IENvbnRhaW5lciA9IHN0eWxlZChDb2x1bW4pYFxuICBwb3NpdGlvbjogcmVsYXRpdmU7XG5gO1xuXG5jb25zdCBjb3B5ID0ge1xuICBbSEVMTE9dOiA8U3R5bGVkSG9tZUljb24gLz4sXG4gIFtQUk9KRUNUU106ICdQcm9qZWN0cycsXG4gIFtXT1JLXTogJ0hpc3RvcnknLFxufTtcblxuY29uc3QgTmF2aWdhdGlvbiA9ICh7IGNsYXNzTmFtZSB9KSA9PiB7XG4gIGNvbnN0IHsgdGFiSWQgfSA9IHVzZVBhcmFtcygpO1xuICByZXR1cm4gKFxuICAgIDxDb250YWluZXIgY2xhc3NOYW1lPXtjbGFzc05hbWV9IHNwPXs0fT5cbiAgICAgIHtvcmRlcmVkVGFicy5tYXAoKHRhYikgPT4gKFxuICAgICAgICA8U3R5bGVkTGlua1xuICAgICAgICAgIGNsYXNzTmFtZT17dGFifVxuICAgICAgICAgIGlzQWN0aXZlPXt0YWIgPT09IHRhYklkfVxuICAgICAgICAgIHRvPXtgLyR7dGFifWB9XG4gICAgICAgICAga2V5PXt0YWJ9XG4gICAgICAgID5cbiAgICAgICAgICB7Y29weVt0YWJdfVxuICAgICAgICA8L1N0eWxlZExpbms+XG4gICAgICApKX1cbiAgICA8L0NvbnRhaW5lcj5cbiAgKTtcbn07XG5cbk5hdmlnYXRpb24ucHJvcFR5cGVzID0ge1xuICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG59O1xuXG5OYXZpZ2F0aW9uLmRlZmF1bHRQcm9wcyA9IHtcbiAgY2xhc3NOYW1lOiAnJyxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IE5hdmlnYXRpb247XG4iXX0= */",
  toString: _EMOTION_STRINGIFIED_CSS_ERROR__
});

const copy = {
  [constants_pages__WEBPACK_IMPORTED_MODULE_7__["HELLO"]]: Object(_emotion_core__WEBPACK_IMPORTED_MODULE_10__["jsx"])(StyledHomeIcon, {
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 70,
      columnNumber: 12
    }
  }),
  [constants_pages__WEBPACK_IMPORTED_MODULE_7__["PROJECTS"]]: 'Projects',
  [constants_pages__WEBPACK_IMPORTED_MODULE_7__["WORK"]]: 'History'
};

const Navigation = ({
  className
}) => {
  const {
    tabId
  } = Object(react_router_dom__WEBPACK_IMPORTED_MODULE_2__["useParams"])();
  return Object(_emotion_core__WEBPACK_IMPORTED_MODULE_10__["jsx"])(Container, {
    className: className,
    sp: 4,
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 78,
      columnNumber: 5
    }
  }, constants_pages__WEBPACK_IMPORTED_MODULE_7__["orderedTabs"].map(tab => Object(_emotion_core__WEBPACK_IMPORTED_MODULE_10__["jsx"])(StyledLink, {
    className: tab,
    isActive: tab === tabId,
    to: `/${tab}`,
    key: tab,
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 80,
      columnNumber: 9
    }
  }, copy[tab])));
};

Navigation.propTypes = {
  className: prop_types__WEBPACK_IMPORTED_MODULE_3___default.a.string
};
Navigation.defaultProps = {
  className: ''
};
/* harmony default export */ __webpack_exports__["default"] = (Navigation);

/***/ }),

/***/ "./components/Navigation/index.js":
/*!****************************************!*\
  !*** ./components/Navigation/index.js ***!
  \****************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Navigation__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Navigation */ "./components/Navigation/Navigation.jsx");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "default", function() { return _Navigation__WEBPACK_IMPORTED_MODULE_0__["default"]; });



/***/ }),

/***/ "./components/Page.jsx":
/*!*****************************!*\
  !*** ./components/Page.jsx ***!
  \*****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @emotion/styled-base */ "@emotion/styled-base");
/* harmony import */ var _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_emotion_styled_base__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! prop-types */ "prop-types");
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var utils_prop_types__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! utils/prop-types */ "./utils/prop-types.js");
/* harmony import */ var styles__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! styles */ "./styles/index.js");
/* harmony import */ var styles_layout__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! styles/layout */ "./styles/layout.js");
/* harmony import */ var _text__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./text */ "./components/text.js");
/* harmony import */ var _layout__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./layout */ "./components/layout.js");
/* harmony import */ var _emotion_core__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @emotion/core */ "@emotion/core");
/* harmony import */ var _emotion_core__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_emotion_core__WEBPACK_IMPORTED_MODULE_8__);

var _jsxFileName = "/Users/cliftoncampbell/Development/clif.world/components/Page.jsx";
var __jsx = react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement;









const HeaderContainer = /*#__PURE__*/_emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()(_layout__WEBPACK_IMPORTED_MODULE_7__["Column"], {
  target: "exf6iqk0",
  label: "HeaderContainer"
})(styles_layout__WEBPACK_IMPORTED_MODULE_5__["full"], ";align-items:flex-start;height:min-content;top:", Object(styles__WEBPACK_IMPORTED_MODULE_4__["getStyle"])('pageMinimumPadding'), ";width:calc(100% - ", Object(styles__WEBPACK_IMPORTED_MODULE_4__["size"])(15), ");z-index:1;", Object(styles__WEBPACK_IMPORTED_MODULE_4__["getBool"])('hasForeground', `
    background-image: ${Object(styles__WEBPACK_IMPORTED_MODULE_4__["getStyle"])('fadeIntoBackground')};
  `), ";", _text__WEBPACK_IMPORTED_MODULE_6__["Heading"], "{opacity:1;width:100%;will-change:opacity;}> *{pointer-events:auto;}" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL1BhZ2UuanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQWFzQyIsImZpbGUiOiIvVXNlcnMvY2xpZnRvbmNhbXBiZWxsL0RldmVsb3BtZW50L2NsaWYud29ybGQvY29tcG9uZW50cy9QYWdlLmpzeCIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyB1c2VFZmZlY3QsIHVzZVJlZiB9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBzdHlsZWQgZnJvbSAnQGVtb3Rpb24vc3R5bGVkJztcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5pbXBvcnQgeyBDaGlsZHJlblByb3BUeXBlIH0gZnJvbSAndXRpbHMvcHJvcC10eXBlcyc7XG5pbXBvcnQgeyBtb2JpbGUsIHRhYmxldCwgZ2V0Qm9vbCwgZ2V0U3R5bGUsIHNpemUsIG1xIH0gZnJvbSAnc3R5bGVzJztcbmltcG9ydCB7XG4gIGNlbnRlcmVkLFxuICBmdWxsLFxuICBmb3JlZ3JvdW5kQ29udGVudFRvcFBhZGRpbmcsXG59IGZyb20gJ3N0eWxlcy9sYXlvdXQnO1xuaW1wb3J0IHsgSGVhZGluZyB9IGZyb20gJy4vdGV4dCc7XG5pbXBvcnQgeyBGdWxsLCBDb2x1bW4gfSBmcm9tICcuL2xheW91dCc7XG5cbmNvbnN0IEhlYWRlckNvbnRhaW5lciA9IHN0eWxlZChDb2x1bW4pYFxuICAke2Z1bGx9O1xuICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcbiAgaGVpZ2h0OiBtaW4tY29udGVudDtcbiAgdG9wOiAke2dldFN0eWxlKCdwYWdlTWluaW11bVBhZGRpbmcnKX07XG4gIHdpZHRoOiBjYWxjKDEwMCUgLSAke3NpemUoMTUpfSk7XG4gIHotaW5kZXg6IDE7XG4gICR7Z2V0Qm9vbChcbiAgICAnaGFzRm9yZWdyb3VuZCcsXG4gICAgYFxuICAgIGJhY2tncm91bmQtaW1hZ2U6ICR7Z2V0U3R5bGUoJ2ZhZGVJbnRvQmFja2dyb3VuZCcpfTtcbiAgYCxcbiAgKX07XG4gICR7SGVhZGluZ30ge1xuICAgIG9wYWNpdHk6IDE7XG4gICAgd2lkdGg6IDEwMCU7XG4gICAgd2lsbC1jaGFuZ2U6IG9wYWNpdHk7XG4gIH1cbiAgPiAqIHtcbiAgICBwb2ludGVyLWV2ZW50czogYXV0bztcbiAgfVxuYDtcblxuY29uc3QgRm9yZWdyb3VuZENvbnRlbnRDb250YWluZXIgPSBzdHlsZWQoRnVsbClgXG4gIGFsaWduLWl0ZW1zOiBmbGV4LXN0YXJ0O1xuICB6LWluZGV4OiAyO1xuICBvdmVyZmxvdy15OiBhdXRvO1xuICAtd2Via2l0LW92ZXJmbG93LXNjcm9sbGluZzogdG91Y2g7XG4gIHBvaW50ZXItZXZlbnRzOiBhdXRvO1xuICAke2ZvcmVncm91bmRDb250ZW50VG9wUGFkZGluZ307XG4gICR7bXEoe1xuICAgIHBhZGRpbmdSaWdodDogW1xuICAgICAgZ2V0U3R5bGUoJ2ZvcmVncm91bmRDb250ZW50UmlnaHRQYWRkaW5nJyksXG4gICAgICBnZXRTdHlsZSgnZm9yZWdyb3VuZENvbnRlbnRSaWdodFBhZGRpbmdUYWJsZXQnKSxcbiAgICAgIGdldFN0eWxlKCdmb3JlZ3JvdW5kQ29udGVudFJpZ2h0UGFkZGluZ01vYmlsZScpLFxuICAgIF0sXG4gIH0pfTtcbiAgPiAqOm5vdCg6bGFzdC1jaGlsZCkge1xuICAgIG1hcmdpbi1ib3R0b206ICR7c2l6ZSgyNyl9O1xuICB9XG4gICR7bW9iaWxlKGBcbiAgICA+ICo6bm90KDpsYXN0LWNoaWxkKSB7XG4gICAgICBtYXJnaW4tYm90dG9tOiAke3NpemUoMTMpfTtcbiAgICB9XG4gIGApfVxuYDtcblxuY29uc3QgcGFnZVNsaWRlSW4gPSBgXG4gIEBrZXlmcmFtZXMgc2xpZGVpbiB7XG4gICAgZnJvbSB7XG4gICAgICBvcGFjaXR5OiAwO1xuICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKC04cHgpO1xuICAgIH1cbiAgICB0byB7XG4gICAgICBvcGFjaXR5OiAxO1xuICAgICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xuICAgIH1cbiAgfVxuICBhbmltYXRpb246IDAuNnMgZWFzZS1vdXQgZm9yd2FyZHMgc2xpZGVpbjtcbmA7XG5cbmNvbnN0IEZvcmVncm91bmRDb250YWluZXIgPSBzdHlsZWQuZGl2YFxuICB6LWluZGV4OiAzO1xuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIGhlaWdodDogMTAwJTtcbiAgbGVmdDogJHtnZXRTdHlsZSgnZm9yZWdyb3VuZExlZnRQYWRkaW5nJyl9O1xuICB3aWR0aDogY2FsYygxMDAlIC0gJHtzaXplKDI4KX0pO1xuICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgJHt0YWJsZXQoYFxuICAgIGxlZnQ6ICR7Z2V0U3R5bGUoJ2ZvcmVncm91bmRMZWZ0UGFkZGluZ1RhYmxldCcpfTtcbiAgICB3aWR0aDogY2FsYygxMDAlIC0gJHtnZXRTdHlsZSgncGFnZU1pbmltdW1QYWRkaW5nJyl9KTtcbiAgYCl9XG5gO1xuXG5jb25zdCBCYWNrZ3JvdW5kQ29udGFpbmVyID0gc3R5bGVkKEZ1bGwpYFxuICB6LWluZGV4OiAwO1xuICAke2NlbnRlcmVkfTtcbmA7XG5cbmNvbnN0IENvbnRhaW5lciA9IHN0eWxlZC5kaXZgXG4gIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgdG9wOiAwO1xuICBsZWZ0OiAwO1xuICBoZWlnaHQ6IDEwMCU7XG4gIHdpZHRoOiAxMDAlO1xuICAke2dldEJvb2woXG4gICAgJ3JldmVhbCcsXG4gICAgYFxuICAgICR7Rm9yZWdyb3VuZENvbnRhaW5lcn0ge1xuICAgICAgJHtwYWdlU2xpZGVJbn07XG4gICAgfVxuICAgIGAsXG4gICAgYFxuICAgIHotaW5kZXg6IC0xMDAwMDAwO1xuICAgIG9wYWNpdHk6IDA7XG4gICAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gIGAsXG4gICl9XG5gO1xuXG5jb25zdCBQYWdlID0gKHtcbiAgY2xhc3NOYW1lLFxuICBCYWNrZ3JvdW5kLFxuICBTdWJoZWFkZXIsXG4gIGJhY2tncm91bmRDc3MsXG4gIGNoaWxkcmVuLFxuICBmYWRlRm9yZWdyb3VuZCxcbiAgdGl0bGUsXG4gIHJldmVhbCxcbn0pID0+IHtcbiAgY29uc3QgaGVhZGVyQ29udGFpbmVyID0gdXNlUmVmKG51bGwpO1xuICBjb25zdCBmb3JlZ3JvdW5kQ29udGVudCA9IHVzZVJlZihudWxsKTtcbiAgY29uc3QgaGVhZGVyID0gdXNlUmVmKG51bGwpO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgY29uc3QgcmVuZGVySGVhZGVyU3R5bGVzID0gKCkgPT4ge1xuICAgICAgaWYgKFxuICAgICAgICBmb3JlZ3JvdW5kQ29udGVudC5jdXJyZW50ICYmXG4gICAgICAgIGhlYWRlci5jdXJyZW50ICYmXG4gICAgICAgIGZvcmVncm91bmRDb250ZW50LmN1cnJlbnRcbiAgICAgICkge1xuICAgICAgICBjb25zdCB0aHJlc2hvbGQgPSBoZWFkZXJDb250YWluZXIuY3VycmVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgIGNvbnN0IHsgc2Nyb2xsVG9wIH0gPSBmb3JlZ3JvdW5kQ29udGVudC5jdXJyZW50O1xuICAgICAgICBoZWFkZXIuY3VycmVudC5zdHlsZS5vcGFjaXR5ID1cbiAgICAgICAgICAxIC0gKHNjcm9sbFRvcCAvIHRocmVzaG9sZCkgKiAwLjU7XG4gICAgICB9XG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVySGVhZGVyU3R5bGVzKTtcbiAgICB9O1xuXG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlckhlYWRlclN0eWxlcyk7XG4gIH0sIFtdKTtcblxuICByZXR1cm4gKFxuICAgIDxDb250YWluZXIgcmV2ZWFsPXtyZXZlYWx9PlxuICAgICAgPEZvcmVncm91bmRDb250YWluZXI+XG4gICAgICAgIDxIZWFkZXJDb250YWluZXJcbiAgICAgICAgICByZWY9e2hlYWRlckNvbnRhaW5lcn1cbiAgICAgICAgICBoYXNGb3JlZ3JvdW5kPXtmYWRlRm9yZWdyb3VuZH1cbiAgICAgICAgICBzcD17NH1cbiAgICAgICAgPlxuICAgICAgICAgIDxIZWFkaW5nIHJlZj17aGVhZGVyfT57dGl0bGV9PC9IZWFkaW5nPlxuICAgICAgICAgIHtTdWJoZWFkZXJ9XG4gICAgICAgIDwvSGVhZGVyQ29udGFpbmVyPlxuICAgICAgICB7Y2hpbGRyZW4gJiYgKFxuICAgICAgICAgIDxGb3JlZ3JvdW5kQ29udGVudENvbnRhaW5lclxuICAgICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc05hbWV9XG4gICAgICAgICAgICByZWY9e2ZvcmVncm91bmRDb250ZW50fVxuICAgICAgICAgID5cbiAgICAgICAgICAgIHtjaGlsZHJlbn1cbiAgICAgICAgICA8L0ZvcmVncm91bmRDb250ZW50Q29udGFpbmVyPlxuICAgICAgICApfVxuICAgICAgPC9Gb3JlZ3JvdW5kQ29udGFpbmVyPlxuICAgICAge0JhY2tncm91bmQgJiYgKFxuICAgICAgICA8QmFja2dyb3VuZENvbnRhaW5lciBjc3M9e2JhY2tncm91bmRDc3N9PlxuICAgICAgICAgIHtCYWNrZ3JvdW5kfVxuICAgICAgICA8L0JhY2tncm91bmRDb250YWluZXI+XG4gICAgICApfVxuICAgIDwvQ29udGFpbmVyPlxuICApO1xufTtcblxuUGFnZS5wcm9wVHlwZXMgPSB7XG4gIGNsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgQmFja2dyb3VuZDogQ2hpbGRyZW5Qcm9wVHlwZSxcbiAgU3ViaGVhZGVyOiBDaGlsZHJlblByb3BUeXBlLFxuICBiYWNrZ3JvdW5kQ3NzOiBQcm9wVHlwZXMuc3RyaW5nLFxuICBjaGlsZHJlbjogQ2hpbGRyZW5Qcm9wVHlwZSxcbiAgZmFkZUZvcmVncm91bmQ6IFByb3BUeXBlcy5ib29sLFxuICB0aXRsZTogUHJvcFR5cGVzLnN0cmluZy5pc1JlcXVpcmVkLFxufTtcblxuUGFnZS5kZWZhdWx0UHJvcHMgPSB7XG4gIGNsYXNzTmFtZTogJycsXG4gIEJhY2tncm91bmQ6IG51bGwsXG4gIFN1YmhlYWRlcjogbnVsbCxcbiAgYmFja2dyb3VuZENzczogbnVsbCxcbiAgY2hpbGRyZW46IG51bGwsXG4gIGZhZGVGb3JlZ3JvdW5kOiBmYWxzZSxcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFBhZ2U7XG4iXX0= */"));

const ForegroundContentContainer = /*#__PURE__*/_emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()(_layout__WEBPACK_IMPORTED_MODULE_7__["Full"], {
  target: "exf6iqk1",
  label: "ForegroundContentContainer"
})("align-items:flex-start;z-index:2;overflow-y:auto;-webkit-overflow-scrolling:touch;pointer-events:auto;", styles_layout__WEBPACK_IMPORTED_MODULE_5__["foregroundContentTopPadding"], ";", Object(styles__WEBPACK_IMPORTED_MODULE_4__["mq"])({
  paddingRight: [Object(styles__WEBPACK_IMPORTED_MODULE_4__["getStyle"])('foregroundContentRightPadding'), Object(styles__WEBPACK_IMPORTED_MODULE_4__["getStyle"])('foregroundContentRightPaddingTablet'), Object(styles__WEBPACK_IMPORTED_MODULE_4__["getStyle"])('foregroundContentRightPaddingMobile')]
}), ";> *:not(:last-child){margin-bottom:", Object(styles__WEBPACK_IMPORTED_MODULE_4__["size"])(27), ";}", Object(styles__WEBPACK_IMPORTED_MODULE_4__["mobile"])(`
    > *:not(:last-child) {
      margin-bottom: ${Object(styles__WEBPACK_IMPORTED_MODULE_4__["size"])(13)};
    }
  `), false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL1BhZ2UuanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQW9DK0MiLCJmaWxlIjoiL1VzZXJzL2NsaWZ0b25jYW1wYmVsbC9EZXZlbG9wbWVudC9jbGlmLndvcmxkL2NvbXBvbmVudHMvUGFnZS5qc3giLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ0BlbW90aW9uL3N0eWxlZCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgQ2hpbGRyZW5Qcm9wVHlwZSB9IGZyb20gJ3V0aWxzL3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgbW9iaWxlLCB0YWJsZXQsIGdldEJvb2wsIGdldFN0eWxlLCBzaXplLCBtcSB9IGZyb20gJ3N0eWxlcyc7XG5pbXBvcnQge1xuICBjZW50ZXJlZCxcbiAgZnVsbCxcbiAgZm9yZWdyb3VuZENvbnRlbnRUb3BQYWRkaW5nLFxufSBmcm9tICdzdHlsZXMvbGF5b3V0JztcbmltcG9ydCB7IEhlYWRpbmcgfSBmcm9tICcuL3RleHQnO1xuaW1wb3J0IHsgRnVsbCwgQ29sdW1uIH0gZnJvbSAnLi9sYXlvdXQnO1xuXG5jb25zdCBIZWFkZXJDb250YWluZXIgPSBzdHlsZWQoQ29sdW1uKWBcbiAgJHtmdWxsfTtcbiAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XG4gIGhlaWdodDogbWluLWNvbnRlbnQ7XG4gIHRvcDogJHtnZXRTdHlsZSgncGFnZU1pbmltdW1QYWRkaW5nJyl9O1xuICB3aWR0aDogY2FsYygxMDAlIC0gJHtzaXplKDE1KX0pO1xuICB6LWluZGV4OiAxO1xuICAke2dldEJvb2woXG4gICAgJ2hhc0ZvcmVncm91bmQnLFxuICAgIGBcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiAke2dldFN0eWxlKCdmYWRlSW50b0JhY2tncm91bmQnKX07XG4gIGAsXG4gICl9O1xuICAke0hlYWRpbmd9IHtcbiAgICBvcGFjaXR5OiAxO1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIHdpbGwtY2hhbmdlOiBvcGFjaXR5O1xuICB9XG4gID4gKiB7XG4gICAgcG9pbnRlci1ldmVudHM6IGF1dG87XG4gIH1cbmA7XG5cbmNvbnN0IEZvcmVncm91bmRDb250ZW50Q29udGFpbmVyID0gc3R5bGVkKEZ1bGwpYFxuICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcbiAgei1pbmRleDogMjtcbiAgb3ZlcmZsb3cteTogYXV0bztcbiAgLXdlYmtpdC1vdmVyZmxvdy1zY3JvbGxpbmc6IHRvdWNoO1xuICBwb2ludGVyLWV2ZW50czogYXV0bztcbiAgJHtmb3JlZ3JvdW5kQ29udGVudFRvcFBhZGRpbmd9O1xuICAke21xKHtcbiAgICBwYWRkaW5nUmlnaHQ6IFtcbiAgICAgIGdldFN0eWxlKCdmb3JlZ3JvdW5kQ29udGVudFJpZ2h0UGFkZGluZycpLFxuICAgICAgZ2V0U3R5bGUoJ2ZvcmVncm91bmRDb250ZW50UmlnaHRQYWRkaW5nVGFibGV0JyksXG4gICAgICBnZXRTdHlsZSgnZm9yZWdyb3VuZENvbnRlbnRSaWdodFBhZGRpbmdNb2JpbGUnKSxcbiAgICBdLFxuICB9KX07XG4gID4gKjpub3QoOmxhc3QtY2hpbGQpIHtcbiAgICBtYXJnaW4tYm90dG9tOiAke3NpemUoMjcpfTtcbiAgfVxuICAke21vYmlsZShgXG4gICAgPiAqOm5vdCg6bGFzdC1jaGlsZCkge1xuICAgICAgbWFyZ2luLWJvdHRvbTogJHtzaXplKDEzKX07XG4gICAgfVxuICBgKX1cbmA7XG5cbmNvbnN0IHBhZ2VTbGlkZUluID0gYFxuICBAa2V5ZnJhbWVzIHNsaWRlaW4ge1xuICAgIGZyb20ge1xuICAgICAgb3BhY2l0eTogMDtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtOHB4KTtcbiAgICB9XG4gICAgdG8ge1xuICAgICAgb3BhY2l0eTogMTtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcbiAgICB9XG4gIH1cbiAgYW5pbWF0aW9uOiAwLjZzIGVhc2Utb3V0IGZvcndhcmRzIHNsaWRlaW47XG5gO1xuXG5jb25zdCBGb3JlZ3JvdW5kQ29udGFpbmVyID0gc3R5bGVkLmRpdmBcbiAgei1pbmRleDogMztcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICBoZWlnaHQ6IDEwMCU7XG4gIGxlZnQ6ICR7Z2V0U3R5bGUoJ2ZvcmVncm91bmRMZWZ0UGFkZGluZycpfTtcbiAgd2lkdGg6IGNhbGMoMTAwJSAtICR7c2l6ZSgyOCl9KTtcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICR7dGFibGV0KGBcbiAgICBsZWZ0OiAke2dldFN0eWxlKCdmb3JlZ3JvdW5kTGVmdFBhZGRpbmdUYWJsZXQnKX07XG4gICAgd2lkdGg6IGNhbGMoMTAwJSAtICR7Z2V0U3R5bGUoJ3BhZ2VNaW5pbXVtUGFkZGluZycpfSk7XG4gIGApfVxuYDtcblxuY29uc3QgQmFja2dyb3VuZENvbnRhaW5lciA9IHN0eWxlZChGdWxsKWBcbiAgei1pbmRleDogMDtcbiAgJHtjZW50ZXJlZH07XG5gO1xuXG5jb25zdCBDb250YWluZXIgPSBzdHlsZWQuZGl2YFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHRvcDogMDtcbiAgbGVmdDogMDtcbiAgaGVpZ2h0OiAxMDAlO1xuICB3aWR0aDogMTAwJTtcbiAgJHtnZXRCb29sKFxuICAgICdyZXZlYWwnLFxuICAgIGBcbiAgICAke0ZvcmVncm91bmRDb250YWluZXJ9IHtcbiAgICAgICR7cGFnZVNsaWRlSW59O1xuICAgIH1cbiAgICBgLFxuICAgIGBcbiAgICB6LWluZGV4OiAtMTAwMDAwMDtcbiAgICBvcGFjaXR5OiAwO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICBgLFxuICApfVxuYDtcblxuY29uc3QgUGFnZSA9ICh7XG4gIGNsYXNzTmFtZSxcbiAgQmFja2dyb3VuZCxcbiAgU3ViaGVhZGVyLFxuICBiYWNrZ3JvdW5kQ3NzLFxuICBjaGlsZHJlbixcbiAgZmFkZUZvcmVncm91bmQsXG4gIHRpdGxlLFxuICByZXZlYWwsXG59KSA9PiB7XG4gIGNvbnN0IGhlYWRlckNvbnRhaW5lciA9IHVzZVJlZihudWxsKTtcbiAgY29uc3QgZm9yZWdyb3VuZENvbnRlbnQgPSB1c2VSZWYobnVsbCk7XG4gIGNvbnN0IGhlYWRlciA9IHVzZVJlZihudWxsKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHJlbmRlckhlYWRlclN0eWxlcyA9ICgpID0+IHtcbiAgICAgIGlmIChcbiAgICAgICAgZm9yZWdyb3VuZENvbnRlbnQuY3VycmVudCAmJlxuICAgICAgICBoZWFkZXIuY3VycmVudCAmJlxuICAgICAgICBmb3JlZ3JvdW5kQ29udGVudC5jdXJyZW50XG4gICAgICApIHtcbiAgICAgICAgY29uc3QgdGhyZXNob2xkID0gaGVhZGVyQ29udGFpbmVyLmN1cnJlbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgICBjb25zdCB7IHNjcm9sbFRvcCB9ID0gZm9yZWdyb3VuZENvbnRlbnQuY3VycmVudDtcbiAgICAgICAgaGVhZGVyLmN1cnJlbnQuc3R5bGUub3BhY2l0eSA9XG4gICAgICAgICAgMSAtIChzY3JvbGxUb3AgLyB0aHJlc2hvbGQpICogMC41O1xuICAgICAgfVxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlckhlYWRlclN0eWxlcyk7XG4gICAgfTtcblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXJIZWFkZXJTdHlsZXMpO1xuICB9LCBbXSk7XG5cbiAgcmV0dXJuIChcbiAgICA8Q29udGFpbmVyIHJldmVhbD17cmV2ZWFsfT5cbiAgICAgIDxGb3JlZ3JvdW5kQ29udGFpbmVyPlxuICAgICAgICA8SGVhZGVyQ29udGFpbmVyXG4gICAgICAgICAgcmVmPXtoZWFkZXJDb250YWluZXJ9XG4gICAgICAgICAgaGFzRm9yZWdyb3VuZD17ZmFkZUZvcmVncm91bmR9XG4gICAgICAgICAgc3A9ezR9XG4gICAgICAgID5cbiAgICAgICAgICA8SGVhZGluZyByZWY9e2hlYWRlcn0+e3RpdGxlfTwvSGVhZGluZz5cbiAgICAgICAgICB7U3ViaGVhZGVyfVxuICAgICAgICA8L0hlYWRlckNvbnRhaW5lcj5cbiAgICAgICAge2NoaWxkcmVuICYmIChcbiAgICAgICAgICA8Rm9yZWdyb3VuZENvbnRlbnRDb250YWluZXJcbiAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lfVxuICAgICAgICAgICAgcmVmPXtmb3JlZ3JvdW5kQ29udGVudH1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7Y2hpbGRyZW59XG4gICAgICAgICAgPC9Gb3JlZ3JvdW5kQ29udGVudENvbnRhaW5lcj5cbiAgICAgICAgKX1cbiAgICAgIDwvRm9yZWdyb3VuZENvbnRhaW5lcj5cbiAgICAgIHtCYWNrZ3JvdW5kICYmIChcbiAgICAgICAgPEJhY2tncm91bmRDb250YWluZXIgY3NzPXtiYWNrZ3JvdW5kQ3NzfT5cbiAgICAgICAgICB7QmFja2dyb3VuZH1cbiAgICAgICAgPC9CYWNrZ3JvdW5kQ29udGFpbmVyPlxuICAgICAgKX1cbiAgICA8L0NvbnRhaW5lcj5cbiAgKTtcbn07XG5cblBhZ2UucHJvcFR5cGVzID0ge1xuICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gIEJhY2tncm91bmQ6IENoaWxkcmVuUHJvcFR5cGUsXG4gIFN1YmhlYWRlcjogQ2hpbGRyZW5Qcm9wVHlwZSxcbiAgYmFja2dyb3VuZENzczogUHJvcFR5cGVzLnN0cmluZyxcbiAgY2hpbGRyZW46IENoaWxkcmVuUHJvcFR5cGUsXG4gIGZhZGVGb3JlZ3JvdW5kOiBQcm9wVHlwZXMuYm9vbCxcbiAgdGl0bGU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbn07XG5cblBhZ2UuZGVmYXVsdFByb3BzID0ge1xuICBjbGFzc05hbWU6ICcnLFxuICBCYWNrZ3JvdW5kOiBudWxsLFxuICBTdWJoZWFkZXI6IG51bGwsXG4gIGJhY2tncm91bmRDc3M6IG51bGwsXG4gIGNoaWxkcmVuOiBudWxsLFxuICBmYWRlRm9yZWdyb3VuZDogZmFsc2UsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBQYWdlO1xuIl19 */");

const pageSlideIn = `
  @keyframes slidein {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  animation: 0.6s ease-out forwards slidein;
`;

const ForegroundContainer = _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()("div", {
  target: "exf6iqk2",
  label: "ForegroundContainer"
})("z-index:3;position:absolute;height:100%;left:", Object(styles__WEBPACK_IMPORTED_MODULE_4__["getStyle"])('foregroundLeftPadding'), ";width:calc(100% - ", Object(styles__WEBPACK_IMPORTED_MODULE_4__["size"])(28), ");pointer-events:none;", Object(styles__WEBPACK_IMPORTED_MODULE_4__["tablet"])(`
    left: ${Object(styles__WEBPACK_IMPORTED_MODULE_4__["getStyle"])('foregroundLeftPaddingTablet')};
    width: calc(100% - ${Object(styles__WEBPACK_IMPORTED_MODULE_4__["getStyle"])('pageMinimumPadding')});
  `), false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL1BhZ2UuanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQTBFc0MiLCJmaWxlIjoiL1VzZXJzL2NsaWZ0b25jYW1wYmVsbC9EZXZlbG9wbWVudC9jbGlmLndvcmxkL2NvbXBvbmVudHMvUGFnZS5qc3giLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ0BlbW90aW9uL3N0eWxlZCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgQ2hpbGRyZW5Qcm9wVHlwZSB9IGZyb20gJ3V0aWxzL3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgbW9iaWxlLCB0YWJsZXQsIGdldEJvb2wsIGdldFN0eWxlLCBzaXplLCBtcSB9IGZyb20gJ3N0eWxlcyc7XG5pbXBvcnQge1xuICBjZW50ZXJlZCxcbiAgZnVsbCxcbiAgZm9yZWdyb3VuZENvbnRlbnRUb3BQYWRkaW5nLFxufSBmcm9tICdzdHlsZXMvbGF5b3V0JztcbmltcG9ydCB7IEhlYWRpbmcgfSBmcm9tICcuL3RleHQnO1xuaW1wb3J0IHsgRnVsbCwgQ29sdW1uIH0gZnJvbSAnLi9sYXlvdXQnO1xuXG5jb25zdCBIZWFkZXJDb250YWluZXIgPSBzdHlsZWQoQ29sdW1uKWBcbiAgJHtmdWxsfTtcbiAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XG4gIGhlaWdodDogbWluLWNvbnRlbnQ7XG4gIHRvcDogJHtnZXRTdHlsZSgncGFnZU1pbmltdW1QYWRkaW5nJyl9O1xuICB3aWR0aDogY2FsYygxMDAlIC0gJHtzaXplKDE1KX0pO1xuICB6LWluZGV4OiAxO1xuICAke2dldEJvb2woXG4gICAgJ2hhc0ZvcmVncm91bmQnLFxuICAgIGBcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiAke2dldFN0eWxlKCdmYWRlSW50b0JhY2tncm91bmQnKX07XG4gIGAsXG4gICl9O1xuICAke0hlYWRpbmd9IHtcbiAgICBvcGFjaXR5OiAxO1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIHdpbGwtY2hhbmdlOiBvcGFjaXR5O1xuICB9XG4gID4gKiB7XG4gICAgcG9pbnRlci1ldmVudHM6IGF1dG87XG4gIH1cbmA7XG5cbmNvbnN0IEZvcmVncm91bmRDb250ZW50Q29udGFpbmVyID0gc3R5bGVkKEZ1bGwpYFxuICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcbiAgei1pbmRleDogMjtcbiAgb3ZlcmZsb3cteTogYXV0bztcbiAgLXdlYmtpdC1vdmVyZmxvdy1zY3JvbGxpbmc6IHRvdWNoO1xuICBwb2ludGVyLWV2ZW50czogYXV0bztcbiAgJHtmb3JlZ3JvdW5kQ29udGVudFRvcFBhZGRpbmd9O1xuICAke21xKHtcbiAgICBwYWRkaW5nUmlnaHQ6IFtcbiAgICAgIGdldFN0eWxlKCdmb3JlZ3JvdW5kQ29udGVudFJpZ2h0UGFkZGluZycpLFxuICAgICAgZ2V0U3R5bGUoJ2ZvcmVncm91bmRDb250ZW50UmlnaHRQYWRkaW5nVGFibGV0JyksXG4gICAgICBnZXRTdHlsZSgnZm9yZWdyb3VuZENvbnRlbnRSaWdodFBhZGRpbmdNb2JpbGUnKSxcbiAgICBdLFxuICB9KX07XG4gID4gKjpub3QoOmxhc3QtY2hpbGQpIHtcbiAgICBtYXJnaW4tYm90dG9tOiAke3NpemUoMjcpfTtcbiAgfVxuICAke21vYmlsZShgXG4gICAgPiAqOm5vdCg6bGFzdC1jaGlsZCkge1xuICAgICAgbWFyZ2luLWJvdHRvbTogJHtzaXplKDEzKX07XG4gICAgfVxuICBgKX1cbmA7XG5cbmNvbnN0IHBhZ2VTbGlkZUluID0gYFxuICBAa2V5ZnJhbWVzIHNsaWRlaW4ge1xuICAgIGZyb20ge1xuICAgICAgb3BhY2l0eTogMDtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtOHB4KTtcbiAgICB9XG4gICAgdG8ge1xuICAgICAgb3BhY2l0eTogMTtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcbiAgICB9XG4gIH1cbiAgYW5pbWF0aW9uOiAwLjZzIGVhc2Utb3V0IGZvcndhcmRzIHNsaWRlaW47XG5gO1xuXG5jb25zdCBGb3JlZ3JvdW5kQ29udGFpbmVyID0gc3R5bGVkLmRpdmBcbiAgei1pbmRleDogMztcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICBoZWlnaHQ6IDEwMCU7XG4gIGxlZnQ6ICR7Z2V0U3R5bGUoJ2ZvcmVncm91bmRMZWZ0UGFkZGluZycpfTtcbiAgd2lkdGg6IGNhbGMoMTAwJSAtICR7c2l6ZSgyOCl9KTtcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICR7dGFibGV0KGBcbiAgICBsZWZ0OiAke2dldFN0eWxlKCdmb3JlZ3JvdW5kTGVmdFBhZGRpbmdUYWJsZXQnKX07XG4gICAgd2lkdGg6IGNhbGMoMTAwJSAtICR7Z2V0U3R5bGUoJ3BhZ2VNaW5pbXVtUGFkZGluZycpfSk7XG4gIGApfVxuYDtcblxuY29uc3QgQmFja2dyb3VuZENvbnRhaW5lciA9IHN0eWxlZChGdWxsKWBcbiAgei1pbmRleDogMDtcbiAgJHtjZW50ZXJlZH07XG5gO1xuXG5jb25zdCBDb250YWluZXIgPSBzdHlsZWQuZGl2YFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHRvcDogMDtcbiAgbGVmdDogMDtcbiAgaGVpZ2h0OiAxMDAlO1xuICB3aWR0aDogMTAwJTtcbiAgJHtnZXRCb29sKFxuICAgICdyZXZlYWwnLFxuICAgIGBcbiAgICAke0ZvcmVncm91bmRDb250YWluZXJ9IHtcbiAgICAgICR7cGFnZVNsaWRlSW59O1xuICAgIH1cbiAgICBgLFxuICAgIGBcbiAgICB6LWluZGV4OiAtMTAwMDAwMDtcbiAgICBvcGFjaXR5OiAwO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICBgLFxuICApfVxuYDtcblxuY29uc3QgUGFnZSA9ICh7XG4gIGNsYXNzTmFtZSxcbiAgQmFja2dyb3VuZCxcbiAgU3ViaGVhZGVyLFxuICBiYWNrZ3JvdW5kQ3NzLFxuICBjaGlsZHJlbixcbiAgZmFkZUZvcmVncm91bmQsXG4gIHRpdGxlLFxuICByZXZlYWwsXG59KSA9PiB7XG4gIGNvbnN0IGhlYWRlckNvbnRhaW5lciA9IHVzZVJlZihudWxsKTtcbiAgY29uc3QgZm9yZWdyb3VuZENvbnRlbnQgPSB1c2VSZWYobnVsbCk7XG4gIGNvbnN0IGhlYWRlciA9IHVzZVJlZihudWxsKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHJlbmRlckhlYWRlclN0eWxlcyA9ICgpID0+IHtcbiAgICAgIGlmIChcbiAgICAgICAgZm9yZWdyb3VuZENvbnRlbnQuY3VycmVudCAmJlxuICAgICAgICBoZWFkZXIuY3VycmVudCAmJlxuICAgICAgICBmb3JlZ3JvdW5kQ29udGVudC5jdXJyZW50XG4gICAgICApIHtcbiAgICAgICAgY29uc3QgdGhyZXNob2xkID0gaGVhZGVyQ29udGFpbmVyLmN1cnJlbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgICBjb25zdCB7IHNjcm9sbFRvcCB9ID0gZm9yZWdyb3VuZENvbnRlbnQuY3VycmVudDtcbiAgICAgICAgaGVhZGVyLmN1cnJlbnQuc3R5bGUub3BhY2l0eSA9XG4gICAgICAgICAgMSAtIChzY3JvbGxUb3AgLyB0aHJlc2hvbGQpICogMC41O1xuICAgICAgfVxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlckhlYWRlclN0eWxlcyk7XG4gICAgfTtcblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXJIZWFkZXJTdHlsZXMpO1xuICB9LCBbXSk7XG5cbiAgcmV0dXJuIChcbiAgICA8Q29udGFpbmVyIHJldmVhbD17cmV2ZWFsfT5cbiAgICAgIDxGb3JlZ3JvdW5kQ29udGFpbmVyPlxuICAgICAgICA8SGVhZGVyQ29udGFpbmVyXG4gICAgICAgICAgcmVmPXtoZWFkZXJDb250YWluZXJ9XG4gICAgICAgICAgaGFzRm9yZWdyb3VuZD17ZmFkZUZvcmVncm91bmR9XG4gICAgICAgICAgc3A9ezR9XG4gICAgICAgID5cbiAgICAgICAgICA8SGVhZGluZyByZWY9e2hlYWRlcn0+e3RpdGxlfTwvSGVhZGluZz5cbiAgICAgICAgICB7U3ViaGVhZGVyfVxuICAgICAgICA8L0hlYWRlckNvbnRhaW5lcj5cbiAgICAgICAge2NoaWxkcmVuICYmIChcbiAgICAgICAgICA8Rm9yZWdyb3VuZENvbnRlbnRDb250YWluZXJcbiAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lfVxuICAgICAgICAgICAgcmVmPXtmb3JlZ3JvdW5kQ29udGVudH1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7Y2hpbGRyZW59XG4gICAgICAgICAgPC9Gb3JlZ3JvdW5kQ29udGVudENvbnRhaW5lcj5cbiAgICAgICAgKX1cbiAgICAgIDwvRm9yZWdyb3VuZENvbnRhaW5lcj5cbiAgICAgIHtCYWNrZ3JvdW5kICYmIChcbiAgICAgICAgPEJhY2tncm91bmRDb250YWluZXIgY3NzPXtiYWNrZ3JvdW5kQ3NzfT5cbiAgICAgICAgICB7QmFja2dyb3VuZH1cbiAgICAgICAgPC9CYWNrZ3JvdW5kQ29udGFpbmVyPlxuICAgICAgKX1cbiAgICA8L0NvbnRhaW5lcj5cbiAgKTtcbn07XG5cblBhZ2UucHJvcFR5cGVzID0ge1xuICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gIEJhY2tncm91bmQ6IENoaWxkcmVuUHJvcFR5cGUsXG4gIFN1YmhlYWRlcjogQ2hpbGRyZW5Qcm9wVHlwZSxcbiAgYmFja2dyb3VuZENzczogUHJvcFR5cGVzLnN0cmluZyxcbiAgY2hpbGRyZW46IENoaWxkcmVuUHJvcFR5cGUsXG4gIGZhZGVGb3JlZ3JvdW5kOiBQcm9wVHlwZXMuYm9vbCxcbiAgdGl0bGU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbn07XG5cblBhZ2UuZGVmYXVsdFByb3BzID0ge1xuICBjbGFzc05hbWU6ICcnLFxuICBCYWNrZ3JvdW5kOiBudWxsLFxuICBTdWJoZWFkZXI6IG51bGwsXG4gIGJhY2tncm91bmRDc3M6IG51bGwsXG4gIGNoaWxkcmVuOiBudWxsLFxuICBmYWRlRm9yZWdyb3VuZDogZmFsc2UsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBQYWdlO1xuIl19 */");

const BackgroundContainer = /*#__PURE__*/_emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()(_layout__WEBPACK_IMPORTED_MODULE_7__["Full"], {
  target: "exf6iqk3",
  label: "BackgroundContainer"
})("z-index:0;", styles_layout__WEBPACK_IMPORTED_MODULE_5__["centered"], ";" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL1BhZ2UuanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQXVGd0MiLCJmaWxlIjoiL1VzZXJzL2NsaWZ0b25jYW1wYmVsbC9EZXZlbG9wbWVudC9jbGlmLndvcmxkL2NvbXBvbmVudHMvUGFnZS5qc3giLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ0BlbW90aW9uL3N0eWxlZCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgQ2hpbGRyZW5Qcm9wVHlwZSB9IGZyb20gJ3V0aWxzL3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgbW9iaWxlLCB0YWJsZXQsIGdldEJvb2wsIGdldFN0eWxlLCBzaXplLCBtcSB9IGZyb20gJ3N0eWxlcyc7XG5pbXBvcnQge1xuICBjZW50ZXJlZCxcbiAgZnVsbCxcbiAgZm9yZWdyb3VuZENvbnRlbnRUb3BQYWRkaW5nLFxufSBmcm9tICdzdHlsZXMvbGF5b3V0JztcbmltcG9ydCB7IEhlYWRpbmcgfSBmcm9tICcuL3RleHQnO1xuaW1wb3J0IHsgRnVsbCwgQ29sdW1uIH0gZnJvbSAnLi9sYXlvdXQnO1xuXG5jb25zdCBIZWFkZXJDb250YWluZXIgPSBzdHlsZWQoQ29sdW1uKWBcbiAgJHtmdWxsfTtcbiAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XG4gIGhlaWdodDogbWluLWNvbnRlbnQ7XG4gIHRvcDogJHtnZXRTdHlsZSgncGFnZU1pbmltdW1QYWRkaW5nJyl9O1xuICB3aWR0aDogY2FsYygxMDAlIC0gJHtzaXplKDE1KX0pO1xuICB6LWluZGV4OiAxO1xuICAke2dldEJvb2woXG4gICAgJ2hhc0ZvcmVncm91bmQnLFxuICAgIGBcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiAke2dldFN0eWxlKCdmYWRlSW50b0JhY2tncm91bmQnKX07XG4gIGAsXG4gICl9O1xuICAke0hlYWRpbmd9IHtcbiAgICBvcGFjaXR5OiAxO1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIHdpbGwtY2hhbmdlOiBvcGFjaXR5O1xuICB9XG4gID4gKiB7XG4gICAgcG9pbnRlci1ldmVudHM6IGF1dG87XG4gIH1cbmA7XG5cbmNvbnN0IEZvcmVncm91bmRDb250ZW50Q29udGFpbmVyID0gc3R5bGVkKEZ1bGwpYFxuICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcbiAgei1pbmRleDogMjtcbiAgb3ZlcmZsb3cteTogYXV0bztcbiAgLXdlYmtpdC1vdmVyZmxvdy1zY3JvbGxpbmc6IHRvdWNoO1xuICBwb2ludGVyLWV2ZW50czogYXV0bztcbiAgJHtmb3JlZ3JvdW5kQ29udGVudFRvcFBhZGRpbmd9O1xuICAke21xKHtcbiAgICBwYWRkaW5nUmlnaHQ6IFtcbiAgICAgIGdldFN0eWxlKCdmb3JlZ3JvdW5kQ29udGVudFJpZ2h0UGFkZGluZycpLFxuICAgICAgZ2V0U3R5bGUoJ2ZvcmVncm91bmRDb250ZW50UmlnaHRQYWRkaW5nVGFibGV0JyksXG4gICAgICBnZXRTdHlsZSgnZm9yZWdyb3VuZENvbnRlbnRSaWdodFBhZGRpbmdNb2JpbGUnKSxcbiAgICBdLFxuICB9KX07XG4gID4gKjpub3QoOmxhc3QtY2hpbGQpIHtcbiAgICBtYXJnaW4tYm90dG9tOiAke3NpemUoMjcpfTtcbiAgfVxuICAke21vYmlsZShgXG4gICAgPiAqOm5vdCg6bGFzdC1jaGlsZCkge1xuICAgICAgbWFyZ2luLWJvdHRvbTogJHtzaXplKDEzKX07XG4gICAgfVxuICBgKX1cbmA7XG5cbmNvbnN0IHBhZ2VTbGlkZUluID0gYFxuICBAa2V5ZnJhbWVzIHNsaWRlaW4ge1xuICAgIGZyb20ge1xuICAgICAgb3BhY2l0eTogMDtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtOHB4KTtcbiAgICB9XG4gICAgdG8ge1xuICAgICAgb3BhY2l0eTogMTtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcbiAgICB9XG4gIH1cbiAgYW5pbWF0aW9uOiAwLjZzIGVhc2Utb3V0IGZvcndhcmRzIHNsaWRlaW47XG5gO1xuXG5jb25zdCBGb3JlZ3JvdW5kQ29udGFpbmVyID0gc3R5bGVkLmRpdmBcbiAgei1pbmRleDogMztcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICBoZWlnaHQ6IDEwMCU7XG4gIGxlZnQ6ICR7Z2V0U3R5bGUoJ2ZvcmVncm91bmRMZWZ0UGFkZGluZycpfTtcbiAgd2lkdGg6IGNhbGMoMTAwJSAtICR7c2l6ZSgyOCl9KTtcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICR7dGFibGV0KGBcbiAgICBsZWZ0OiAke2dldFN0eWxlKCdmb3JlZ3JvdW5kTGVmdFBhZGRpbmdUYWJsZXQnKX07XG4gICAgd2lkdGg6IGNhbGMoMTAwJSAtICR7Z2V0U3R5bGUoJ3BhZ2VNaW5pbXVtUGFkZGluZycpfSk7XG4gIGApfVxuYDtcblxuY29uc3QgQmFja2dyb3VuZENvbnRhaW5lciA9IHN0eWxlZChGdWxsKWBcbiAgei1pbmRleDogMDtcbiAgJHtjZW50ZXJlZH07XG5gO1xuXG5jb25zdCBDb250YWluZXIgPSBzdHlsZWQuZGl2YFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHRvcDogMDtcbiAgbGVmdDogMDtcbiAgaGVpZ2h0OiAxMDAlO1xuICB3aWR0aDogMTAwJTtcbiAgJHtnZXRCb29sKFxuICAgICdyZXZlYWwnLFxuICAgIGBcbiAgICAke0ZvcmVncm91bmRDb250YWluZXJ9IHtcbiAgICAgICR7cGFnZVNsaWRlSW59O1xuICAgIH1cbiAgICBgLFxuICAgIGBcbiAgICB6LWluZGV4OiAtMTAwMDAwMDtcbiAgICBvcGFjaXR5OiAwO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICBgLFxuICApfVxuYDtcblxuY29uc3QgUGFnZSA9ICh7XG4gIGNsYXNzTmFtZSxcbiAgQmFja2dyb3VuZCxcbiAgU3ViaGVhZGVyLFxuICBiYWNrZ3JvdW5kQ3NzLFxuICBjaGlsZHJlbixcbiAgZmFkZUZvcmVncm91bmQsXG4gIHRpdGxlLFxuICByZXZlYWwsXG59KSA9PiB7XG4gIGNvbnN0IGhlYWRlckNvbnRhaW5lciA9IHVzZVJlZihudWxsKTtcbiAgY29uc3QgZm9yZWdyb3VuZENvbnRlbnQgPSB1c2VSZWYobnVsbCk7XG4gIGNvbnN0IGhlYWRlciA9IHVzZVJlZihudWxsKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHJlbmRlckhlYWRlclN0eWxlcyA9ICgpID0+IHtcbiAgICAgIGlmIChcbiAgICAgICAgZm9yZWdyb3VuZENvbnRlbnQuY3VycmVudCAmJlxuICAgICAgICBoZWFkZXIuY3VycmVudCAmJlxuICAgICAgICBmb3JlZ3JvdW5kQ29udGVudC5jdXJyZW50XG4gICAgICApIHtcbiAgICAgICAgY29uc3QgdGhyZXNob2xkID0gaGVhZGVyQ29udGFpbmVyLmN1cnJlbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgICBjb25zdCB7IHNjcm9sbFRvcCB9ID0gZm9yZWdyb3VuZENvbnRlbnQuY3VycmVudDtcbiAgICAgICAgaGVhZGVyLmN1cnJlbnQuc3R5bGUub3BhY2l0eSA9XG4gICAgICAgICAgMSAtIChzY3JvbGxUb3AgLyB0aHJlc2hvbGQpICogMC41O1xuICAgICAgfVxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlckhlYWRlclN0eWxlcyk7XG4gICAgfTtcblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXJIZWFkZXJTdHlsZXMpO1xuICB9LCBbXSk7XG5cbiAgcmV0dXJuIChcbiAgICA8Q29udGFpbmVyIHJldmVhbD17cmV2ZWFsfT5cbiAgICAgIDxGb3JlZ3JvdW5kQ29udGFpbmVyPlxuICAgICAgICA8SGVhZGVyQ29udGFpbmVyXG4gICAgICAgICAgcmVmPXtoZWFkZXJDb250YWluZXJ9XG4gICAgICAgICAgaGFzRm9yZWdyb3VuZD17ZmFkZUZvcmVncm91bmR9XG4gICAgICAgICAgc3A9ezR9XG4gICAgICAgID5cbiAgICAgICAgICA8SGVhZGluZyByZWY9e2hlYWRlcn0+e3RpdGxlfTwvSGVhZGluZz5cbiAgICAgICAgICB7U3ViaGVhZGVyfVxuICAgICAgICA8L0hlYWRlckNvbnRhaW5lcj5cbiAgICAgICAge2NoaWxkcmVuICYmIChcbiAgICAgICAgICA8Rm9yZWdyb3VuZENvbnRlbnRDb250YWluZXJcbiAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lfVxuICAgICAgICAgICAgcmVmPXtmb3JlZ3JvdW5kQ29udGVudH1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7Y2hpbGRyZW59XG4gICAgICAgICAgPC9Gb3JlZ3JvdW5kQ29udGVudENvbnRhaW5lcj5cbiAgICAgICAgKX1cbiAgICAgIDwvRm9yZWdyb3VuZENvbnRhaW5lcj5cbiAgICAgIHtCYWNrZ3JvdW5kICYmIChcbiAgICAgICAgPEJhY2tncm91bmRDb250YWluZXIgY3NzPXtiYWNrZ3JvdW5kQ3NzfT5cbiAgICAgICAgICB7QmFja2dyb3VuZH1cbiAgICAgICAgPC9CYWNrZ3JvdW5kQ29udGFpbmVyPlxuICAgICAgKX1cbiAgICA8L0NvbnRhaW5lcj5cbiAgKTtcbn07XG5cblBhZ2UucHJvcFR5cGVzID0ge1xuICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gIEJhY2tncm91bmQ6IENoaWxkcmVuUHJvcFR5cGUsXG4gIFN1YmhlYWRlcjogQ2hpbGRyZW5Qcm9wVHlwZSxcbiAgYmFja2dyb3VuZENzczogUHJvcFR5cGVzLnN0cmluZyxcbiAgY2hpbGRyZW46IENoaWxkcmVuUHJvcFR5cGUsXG4gIGZhZGVGb3JlZ3JvdW5kOiBQcm9wVHlwZXMuYm9vbCxcbiAgdGl0bGU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbn07XG5cblBhZ2UuZGVmYXVsdFByb3BzID0ge1xuICBjbGFzc05hbWU6ICcnLFxuICBCYWNrZ3JvdW5kOiBudWxsLFxuICBTdWJoZWFkZXI6IG51bGwsXG4gIGJhY2tncm91bmRDc3M6IG51bGwsXG4gIGNoaWxkcmVuOiBudWxsLFxuICBmYWRlRm9yZWdyb3VuZDogZmFsc2UsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBQYWdlO1xuIl19 */"));

const Container = _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()("div", {
  target: "exf6iqk4",
  label: "Container"
})("position:absolute;top:0;left:0;height:100%;width:100%;", Object(styles__WEBPACK_IMPORTED_MODULE_4__["getBool"])('reveal', `
    ${ForegroundContainer} {
      ${pageSlideIn};
    }
    `, `
    z-index: -1000000;
    opacity: 0;
    pointer-events: none;
  `), false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL1BhZ2UuanN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQTRGNEIiLCJmaWxlIjoiL1VzZXJzL2NsaWZ0b25jYW1wYmVsbC9EZXZlbG9wbWVudC9jbGlmLndvcmxkL2NvbXBvbmVudHMvUGFnZS5qc3giLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QsIHsgdXNlRWZmZWN0LCB1c2VSZWYgfSBmcm9tICdyZWFjdCc7XG5pbXBvcnQgc3R5bGVkIGZyb20gJ0BlbW90aW9uL3N0eWxlZCc7XG5pbXBvcnQgUHJvcFR5cGVzIGZyb20gJ3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgQ2hpbGRyZW5Qcm9wVHlwZSB9IGZyb20gJ3V0aWxzL3Byb3AtdHlwZXMnO1xuaW1wb3J0IHsgbW9iaWxlLCB0YWJsZXQsIGdldEJvb2wsIGdldFN0eWxlLCBzaXplLCBtcSB9IGZyb20gJ3N0eWxlcyc7XG5pbXBvcnQge1xuICBjZW50ZXJlZCxcbiAgZnVsbCxcbiAgZm9yZWdyb3VuZENvbnRlbnRUb3BQYWRkaW5nLFxufSBmcm9tICdzdHlsZXMvbGF5b3V0JztcbmltcG9ydCB7IEhlYWRpbmcgfSBmcm9tICcuL3RleHQnO1xuaW1wb3J0IHsgRnVsbCwgQ29sdW1uIH0gZnJvbSAnLi9sYXlvdXQnO1xuXG5jb25zdCBIZWFkZXJDb250YWluZXIgPSBzdHlsZWQoQ29sdW1uKWBcbiAgJHtmdWxsfTtcbiAgYWxpZ24taXRlbXM6IGZsZXgtc3RhcnQ7XG4gIGhlaWdodDogbWluLWNvbnRlbnQ7XG4gIHRvcDogJHtnZXRTdHlsZSgncGFnZU1pbmltdW1QYWRkaW5nJyl9O1xuICB3aWR0aDogY2FsYygxMDAlIC0gJHtzaXplKDE1KX0pO1xuICB6LWluZGV4OiAxO1xuICAke2dldEJvb2woXG4gICAgJ2hhc0ZvcmVncm91bmQnLFxuICAgIGBcbiAgICBiYWNrZ3JvdW5kLWltYWdlOiAke2dldFN0eWxlKCdmYWRlSW50b0JhY2tncm91bmQnKX07XG4gIGAsXG4gICl9O1xuICAke0hlYWRpbmd9IHtcbiAgICBvcGFjaXR5OiAxO1xuICAgIHdpZHRoOiAxMDAlO1xuICAgIHdpbGwtY2hhbmdlOiBvcGFjaXR5O1xuICB9XG4gID4gKiB7XG4gICAgcG9pbnRlci1ldmVudHM6IGF1dG87XG4gIH1cbmA7XG5cbmNvbnN0IEZvcmVncm91bmRDb250ZW50Q29udGFpbmVyID0gc3R5bGVkKEZ1bGwpYFxuICBhbGlnbi1pdGVtczogZmxleC1zdGFydDtcbiAgei1pbmRleDogMjtcbiAgb3ZlcmZsb3cteTogYXV0bztcbiAgLXdlYmtpdC1vdmVyZmxvdy1zY3JvbGxpbmc6IHRvdWNoO1xuICBwb2ludGVyLWV2ZW50czogYXV0bztcbiAgJHtmb3JlZ3JvdW5kQ29udGVudFRvcFBhZGRpbmd9O1xuICAke21xKHtcbiAgICBwYWRkaW5nUmlnaHQ6IFtcbiAgICAgIGdldFN0eWxlKCdmb3JlZ3JvdW5kQ29udGVudFJpZ2h0UGFkZGluZycpLFxuICAgICAgZ2V0U3R5bGUoJ2ZvcmVncm91bmRDb250ZW50UmlnaHRQYWRkaW5nVGFibGV0JyksXG4gICAgICBnZXRTdHlsZSgnZm9yZWdyb3VuZENvbnRlbnRSaWdodFBhZGRpbmdNb2JpbGUnKSxcbiAgICBdLFxuICB9KX07XG4gID4gKjpub3QoOmxhc3QtY2hpbGQpIHtcbiAgICBtYXJnaW4tYm90dG9tOiAke3NpemUoMjcpfTtcbiAgfVxuICAke21vYmlsZShgXG4gICAgPiAqOm5vdCg6bGFzdC1jaGlsZCkge1xuICAgICAgbWFyZ2luLWJvdHRvbTogJHtzaXplKDEzKX07XG4gICAgfVxuICBgKX1cbmA7XG5cbmNvbnN0IHBhZ2VTbGlkZUluID0gYFxuICBAa2V5ZnJhbWVzIHNsaWRlaW4ge1xuICAgIGZyb20ge1xuICAgICAgb3BhY2l0eTogMDtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgtOHB4KTtcbiAgICB9XG4gICAgdG8ge1xuICAgICAgb3BhY2l0eTogMTtcbiAgICAgIHRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcbiAgICB9XG4gIH1cbiAgYW5pbWF0aW9uOiAwLjZzIGVhc2Utb3V0IGZvcndhcmRzIHNsaWRlaW47XG5gO1xuXG5jb25zdCBGb3JlZ3JvdW5kQ29udGFpbmVyID0gc3R5bGVkLmRpdmBcbiAgei1pbmRleDogMztcbiAgcG9zaXRpb246IGFic29sdXRlO1xuICBoZWlnaHQ6IDEwMCU7XG4gIGxlZnQ6ICR7Z2V0U3R5bGUoJ2ZvcmVncm91bmRMZWZ0UGFkZGluZycpfTtcbiAgd2lkdGg6IGNhbGMoMTAwJSAtICR7c2l6ZSgyOCl9KTtcbiAgcG9pbnRlci1ldmVudHM6IG5vbmU7XG4gICR7dGFibGV0KGBcbiAgICBsZWZ0OiAke2dldFN0eWxlKCdmb3JlZ3JvdW5kTGVmdFBhZGRpbmdUYWJsZXQnKX07XG4gICAgd2lkdGg6IGNhbGMoMTAwJSAtICR7Z2V0U3R5bGUoJ3BhZ2VNaW5pbXVtUGFkZGluZycpfSk7XG4gIGApfVxuYDtcblxuY29uc3QgQmFja2dyb3VuZENvbnRhaW5lciA9IHN0eWxlZChGdWxsKWBcbiAgei1pbmRleDogMDtcbiAgJHtjZW50ZXJlZH07XG5gO1xuXG5jb25zdCBDb250YWluZXIgPSBzdHlsZWQuZGl2YFxuICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gIHRvcDogMDtcbiAgbGVmdDogMDtcbiAgaGVpZ2h0OiAxMDAlO1xuICB3aWR0aDogMTAwJTtcbiAgJHtnZXRCb29sKFxuICAgICdyZXZlYWwnLFxuICAgIGBcbiAgICAke0ZvcmVncm91bmRDb250YWluZXJ9IHtcbiAgICAgICR7cGFnZVNsaWRlSW59O1xuICAgIH1cbiAgICBgLFxuICAgIGBcbiAgICB6LWluZGV4OiAtMTAwMDAwMDtcbiAgICBvcGFjaXR5OiAwO1xuICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICBgLFxuICApfVxuYDtcblxuY29uc3QgUGFnZSA9ICh7XG4gIGNsYXNzTmFtZSxcbiAgQmFja2dyb3VuZCxcbiAgU3ViaGVhZGVyLFxuICBiYWNrZ3JvdW5kQ3NzLFxuICBjaGlsZHJlbixcbiAgZmFkZUZvcmVncm91bmQsXG4gIHRpdGxlLFxuICByZXZlYWwsXG59KSA9PiB7XG4gIGNvbnN0IGhlYWRlckNvbnRhaW5lciA9IHVzZVJlZihudWxsKTtcbiAgY29uc3QgZm9yZWdyb3VuZENvbnRlbnQgPSB1c2VSZWYobnVsbCk7XG4gIGNvbnN0IGhlYWRlciA9IHVzZVJlZihudWxsKTtcblxuICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgIGNvbnN0IHJlbmRlckhlYWRlclN0eWxlcyA9ICgpID0+IHtcbiAgICAgIGlmIChcbiAgICAgICAgZm9yZWdyb3VuZENvbnRlbnQuY3VycmVudCAmJlxuICAgICAgICBoZWFkZXIuY3VycmVudCAmJlxuICAgICAgICBmb3JlZ3JvdW5kQ29udGVudC5jdXJyZW50XG4gICAgICApIHtcbiAgICAgICAgY29uc3QgdGhyZXNob2xkID0gaGVhZGVyQ29udGFpbmVyLmN1cnJlbnQuY2xpZW50SGVpZ2h0O1xuICAgICAgICBjb25zdCB7IHNjcm9sbFRvcCB9ID0gZm9yZWdyb3VuZENvbnRlbnQuY3VycmVudDtcbiAgICAgICAgaGVhZGVyLmN1cnJlbnQuc3R5bGUub3BhY2l0eSA9XG4gICAgICAgICAgMSAtIChzY3JvbGxUb3AgLyB0aHJlc2hvbGQpICogMC41O1xuICAgICAgfVxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlckhlYWRlclN0eWxlcyk7XG4gICAgfTtcblxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXJIZWFkZXJTdHlsZXMpO1xuICB9LCBbXSk7XG5cbiAgcmV0dXJuIChcbiAgICA8Q29udGFpbmVyIHJldmVhbD17cmV2ZWFsfT5cbiAgICAgIDxGb3JlZ3JvdW5kQ29udGFpbmVyPlxuICAgICAgICA8SGVhZGVyQ29udGFpbmVyXG4gICAgICAgICAgcmVmPXtoZWFkZXJDb250YWluZXJ9XG4gICAgICAgICAgaGFzRm9yZWdyb3VuZD17ZmFkZUZvcmVncm91bmR9XG4gICAgICAgICAgc3A9ezR9XG4gICAgICAgID5cbiAgICAgICAgICA8SGVhZGluZyByZWY9e2hlYWRlcn0+e3RpdGxlfTwvSGVhZGluZz5cbiAgICAgICAgICB7U3ViaGVhZGVyfVxuICAgICAgICA8L0hlYWRlckNvbnRhaW5lcj5cbiAgICAgICAge2NoaWxkcmVuICYmIChcbiAgICAgICAgICA8Rm9yZWdyb3VuZENvbnRlbnRDb250YWluZXJcbiAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NOYW1lfVxuICAgICAgICAgICAgcmVmPXtmb3JlZ3JvdW5kQ29udGVudH1cbiAgICAgICAgICA+XG4gICAgICAgICAgICB7Y2hpbGRyZW59XG4gICAgICAgICAgPC9Gb3JlZ3JvdW5kQ29udGVudENvbnRhaW5lcj5cbiAgICAgICAgKX1cbiAgICAgIDwvRm9yZWdyb3VuZENvbnRhaW5lcj5cbiAgICAgIHtCYWNrZ3JvdW5kICYmIChcbiAgICAgICAgPEJhY2tncm91bmRDb250YWluZXIgY3NzPXtiYWNrZ3JvdW5kQ3NzfT5cbiAgICAgICAgICB7QmFja2dyb3VuZH1cbiAgICAgICAgPC9CYWNrZ3JvdW5kQ29udGFpbmVyPlxuICAgICAgKX1cbiAgICA8L0NvbnRhaW5lcj5cbiAgKTtcbn07XG5cblBhZ2UucHJvcFR5cGVzID0ge1xuICBjbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXG4gIEJhY2tncm91bmQ6IENoaWxkcmVuUHJvcFR5cGUsXG4gIFN1YmhlYWRlcjogQ2hpbGRyZW5Qcm9wVHlwZSxcbiAgYmFja2dyb3VuZENzczogUHJvcFR5cGVzLnN0cmluZyxcbiAgY2hpbGRyZW46IENoaWxkcmVuUHJvcFR5cGUsXG4gIGZhZGVGb3JlZ3JvdW5kOiBQcm9wVHlwZXMuYm9vbCxcbiAgdGl0bGU6IFByb3BUeXBlcy5zdHJpbmcuaXNSZXF1aXJlZCxcbn07XG5cblBhZ2UuZGVmYXVsdFByb3BzID0ge1xuICBjbGFzc05hbWU6ICcnLFxuICBCYWNrZ3JvdW5kOiBudWxsLFxuICBTdWJoZWFkZXI6IG51bGwsXG4gIGJhY2tncm91bmRDc3M6IG51bGwsXG4gIGNoaWxkcmVuOiBudWxsLFxuICBmYWRlRm9yZWdyb3VuZDogZmFsc2UsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBQYWdlO1xuIl19 */");

const Page = ({
  className,
  Background,
  Subheader,
  backgroundCss,
  children,
  fadeForeground,
  title,
  reveal
}) => {
  const headerContainer = Object(react__WEBPACK_IMPORTED_MODULE_1__["useRef"])(null);
  const foregroundContent = Object(react__WEBPACK_IMPORTED_MODULE_1__["useRef"])(null);
  const header = Object(react__WEBPACK_IMPORTED_MODULE_1__["useRef"])(null);
  Object(react__WEBPACK_IMPORTED_MODULE_1__["useEffect"])(() => {
    const renderHeaderStyles = () => {
      if (foregroundContent.current && header.current && foregroundContent.current) {
        const threshold = headerContainer.current.clientHeight;
        const {
          scrollTop
        } = foregroundContent.current;
        header.current.style.opacity = 1 - scrollTop / threshold * 0.5;
      }

      requestAnimationFrame(renderHeaderStyles);
    };

    requestAnimationFrame(renderHeaderStyles);
  }, []);
  return Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])(Container, {
    reveal: reveal,
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 147,
      columnNumber: 5
    }
  }, Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])(ForegroundContainer, {
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 148,
      columnNumber: 7
    }
  }, Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])(HeaderContainer, {
    ref: headerContainer,
    hasForeground: fadeForeground,
    sp: 4,
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 149,
      columnNumber: 9
    }
  }, Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])(_text__WEBPACK_IMPORTED_MODULE_6__["Heading"], {
    ref: header,
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 154,
      columnNumber: 11
    }
  }, title), Subheader), children && Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])(ForegroundContentContainer, {
    className: className,
    ref: foregroundContent,
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 158,
      columnNumber: 11
    }
  }, children)), Background && Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])(BackgroundContainer, {
    css: backgroundCss,
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 167,
      columnNumber: 9
    }
  }, Background));
};

Page.propTypes = {
  className: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.string,
  Background: utils_prop_types__WEBPACK_IMPORTED_MODULE_3__["ChildrenPropType"],
  Subheader: utils_prop_types__WEBPACK_IMPORTED_MODULE_3__["ChildrenPropType"],
  backgroundCss: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.string,
  children: utils_prop_types__WEBPACK_IMPORTED_MODULE_3__["ChildrenPropType"],
  fadeForeground: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.bool,
  title: prop_types__WEBPACK_IMPORTED_MODULE_2___default.a.string.isRequired
};
Page.defaultProps = {
  className: '',
  Background: null,
  Subheader: null,
  backgroundCss: null,
  children: null,
  fadeForeground: false
};
/* harmony default export */ __webpack_exports__["default"] = (Page);

/***/ }),

/***/ "./components/index.js":
/*!*****************************!*\
  !*** ./components/index.js ***!
  \*****************************/
/*! exports provided: Button, Link, Body, Body2, Heading, Heading2, Heading3, Subheader, Subheader2, Detail, Detail2, Detail3, Full, Centered, Row, Column, GlitchImage, Cursor, Filmstrip, Navigation, Page */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _CTA__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./CTA */ "./components/CTA/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Button", function() { return _CTA__WEBPACK_IMPORTED_MODULE_0__["Button"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Link", function() { return _CTA__WEBPACK_IMPORTED_MODULE_0__["Link"]; });

/* harmony import */ var _text__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./text */ "./components/text.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Body", function() { return _text__WEBPACK_IMPORTED_MODULE_1__["Body"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Body2", function() { return _text__WEBPACK_IMPORTED_MODULE_1__["Body2"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Heading", function() { return _text__WEBPACK_IMPORTED_MODULE_1__["Heading"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Heading2", function() { return _text__WEBPACK_IMPORTED_MODULE_1__["Heading2"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Heading3", function() { return _text__WEBPACK_IMPORTED_MODULE_1__["Heading3"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Subheader", function() { return _text__WEBPACK_IMPORTED_MODULE_1__["Subheader"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Subheader2", function() { return _text__WEBPACK_IMPORTED_MODULE_1__["Subheader2"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Detail", function() { return _text__WEBPACK_IMPORTED_MODULE_1__["Detail"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Detail2", function() { return _text__WEBPACK_IMPORTED_MODULE_1__["Detail2"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Detail3", function() { return _text__WEBPACK_IMPORTED_MODULE_1__["Detail3"]; });

/* harmony import */ var _layout__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./layout */ "./components/layout.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Full", function() { return _layout__WEBPACK_IMPORTED_MODULE_2__["Full"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Centered", function() { return _layout__WEBPACK_IMPORTED_MODULE_2__["Centered"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Row", function() { return _layout__WEBPACK_IMPORTED_MODULE_2__["Row"]; });

/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Column", function() { return _layout__WEBPACK_IMPORTED_MODULE_2__["Column"]; });

/* harmony import */ var _GlitchImage__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./GlitchImage */ "./components/GlitchImage/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "GlitchImage", function() { return _GlitchImage__WEBPACK_IMPORTED_MODULE_3__["default"]; });

/* harmony import */ var _Cursor__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./Cursor */ "./components/Cursor/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Cursor", function() { return _Cursor__WEBPACK_IMPORTED_MODULE_4__["default"]; });

/* harmony import */ var _Filmstrip__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./Filmstrip */ "./components/Filmstrip.jsx");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Filmstrip", function() { return _Filmstrip__WEBPACK_IMPORTED_MODULE_5__["default"]; });

/* harmony import */ var _Navigation__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Navigation */ "./components/Navigation/index.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Navigation", function() { return _Navigation__WEBPACK_IMPORTED_MODULE_6__["default"]; });

/* harmony import */ var _Page__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./Page */ "./components/Page.jsx");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "Page", function() { return _Page__WEBPACK_IMPORTED_MODULE_7__["default"]; });










/***/ }),

/***/ "./components/layout.js":
/*!******************************!*\
  !*** ./components/layout.js ***!
  \******************************/
/*! exports provided: Full, Centered, Row, Column */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Full", function() { return Full; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Centered", function() { return Centered; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Row", function() { return Row; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Column", function() { return Column; });
/* harmony import */ var _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @emotion/styled-base */ "@emotion/styled-base");
/* harmony import */ var _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_emotion_styled_base__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var styles_layout__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! styles/layout */ "./styles/layout.js");


const Full = _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()("div", {
  target: "e11wog5a0",
  label: "Full"
})(styles_layout__WEBPACK_IMPORTED_MODULE_1__["full"], ";" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL2xheW91dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFHOEIiLCJmaWxlIjoiL1VzZXJzL2NsaWZ0b25jYW1wYmVsbC9EZXZlbG9wbWVudC9jbGlmLndvcmxkL2NvbXBvbmVudHMvbGF5b3V0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHN0eWxlZCBmcm9tICdAZW1vdGlvbi9zdHlsZWQnO1xuaW1wb3J0IHsgY2VudGVyZWQsIGZ1bGwsIHJvdywgY29sdW1uIH0gZnJvbSAnc3R5bGVzL2xheW91dCc7XG5cbmV4cG9ydCBjb25zdCBGdWxsID0gc3R5bGVkLmRpdmBcbiAgJHtmdWxsfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBDZW50ZXJlZCA9IHN0eWxlZC5kaXZgXG4gICR7Y2VudGVyZWR9O1xuYDtcblxuZXhwb3J0IGNvbnN0IFJvdyA9IHN0eWxlZC5kaXZgXG4gICR7cm93fTtcbmA7XG5cbmV4cG9ydCBjb25zdCBDb2x1bW4gPSBzdHlsZWQuZGl2YFxuICAke2NvbHVtbn07XG5gO1xuIl19 */"));
const Centered = _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()("div", {
  target: "e11wog5a1",
  label: "Centered"
})(styles_layout__WEBPACK_IMPORTED_MODULE_1__["centered"], ";" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL2xheW91dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFPa0MiLCJmaWxlIjoiL1VzZXJzL2NsaWZ0b25jYW1wYmVsbC9EZXZlbG9wbWVudC9jbGlmLndvcmxkL2NvbXBvbmVudHMvbGF5b3V0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHN0eWxlZCBmcm9tICdAZW1vdGlvbi9zdHlsZWQnO1xuaW1wb3J0IHsgY2VudGVyZWQsIGZ1bGwsIHJvdywgY29sdW1uIH0gZnJvbSAnc3R5bGVzL2xheW91dCc7XG5cbmV4cG9ydCBjb25zdCBGdWxsID0gc3R5bGVkLmRpdmBcbiAgJHtmdWxsfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBDZW50ZXJlZCA9IHN0eWxlZC5kaXZgXG4gICR7Y2VudGVyZWR9O1xuYDtcblxuZXhwb3J0IGNvbnN0IFJvdyA9IHN0eWxlZC5kaXZgXG4gICR7cm93fTtcbmA7XG5cbmV4cG9ydCBjb25zdCBDb2x1bW4gPSBzdHlsZWQuZGl2YFxuICAke2NvbHVtbn07XG5gO1xuIl19 */"));
const Row = _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()("div", {
  target: "e11wog5a2",
  label: "Row"
})(styles_layout__WEBPACK_IMPORTED_MODULE_1__["row"], ";" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL2xheW91dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFXNkIiLCJmaWxlIjoiL1VzZXJzL2NsaWZ0b25jYW1wYmVsbC9EZXZlbG9wbWVudC9jbGlmLndvcmxkL2NvbXBvbmVudHMvbGF5b3V0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHN0eWxlZCBmcm9tICdAZW1vdGlvbi9zdHlsZWQnO1xuaW1wb3J0IHsgY2VudGVyZWQsIGZ1bGwsIHJvdywgY29sdW1uIH0gZnJvbSAnc3R5bGVzL2xheW91dCc7XG5cbmV4cG9ydCBjb25zdCBGdWxsID0gc3R5bGVkLmRpdmBcbiAgJHtmdWxsfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBDZW50ZXJlZCA9IHN0eWxlZC5kaXZgXG4gICR7Y2VudGVyZWR9O1xuYDtcblxuZXhwb3J0IGNvbnN0IFJvdyA9IHN0eWxlZC5kaXZgXG4gICR7cm93fTtcbmA7XG5cbmV4cG9ydCBjb25zdCBDb2x1bW4gPSBzdHlsZWQuZGl2YFxuICAke2NvbHVtbn07XG5gO1xuIl19 */"));
const Column = _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()("div", {
  target: "e11wog5a3",
  label: "Column"
})(styles_layout__WEBPACK_IMPORTED_MODULE_1__["column"], ";" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL2xheW91dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFlZ0MiLCJmaWxlIjoiL1VzZXJzL2NsaWZ0b25jYW1wYmVsbC9EZXZlbG9wbWVudC9jbGlmLndvcmxkL2NvbXBvbmVudHMvbGF5b3V0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHN0eWxlZCBmcm9tICdAZW1vdGlvbi9zdHlsZWQnO1xuaW1wb3J0IHsgY2VudGVyZWQsIGZ1bGwsIHJvdywgY29sdW1uIH0gZnJvbSAnc3R5bGVzL2xheW91dCc7XG5cbmV4cG9ydCBjb25zdCBGdWxsID0gc3R5bGVkLmRpdmBcbiAgJHtmdWxsfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBDZW50ZXJlZCA9IHN0eWxlZC5kaXZgXG4gICR7Y2VudGVyZWR9O1xuYDtcblxuZXhwb3J0IGNvbnN0IFJvdyA9IHN0eWxlZC5kaXZgXG4gICR7cm93fTtcbmA7XG5cbmV4cG9ydCBjb25zdCBDb2x1bW4gPSBzdHlsZWQuZGl2YFxuICAke2NvbHVtbn07XG5gO1xuIl19 */"));

/***/ }),

/***/ "./components/text.js":
/*!****************************!*\
  !*** ./components/text.js ***!
  \****************************/
/*! exports provided: Body, Body2, Heading, Heading2, Heading3, Subheader, Subheader2, Detail, Detail2, Detail3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Body", function() { return Body; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Body2", function() { return Body2; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Heading", function() { return Heading; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Heading2", function() { return Heading2; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Heading3", function() { return Heading3; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Subheader", function() { return Subheader; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Subheader2", function() { return Subheader2; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Detail", function() { return Detail; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Detail2", function() { return Detail2; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Detail3", function() { return Detail3; });
/* harmony import */ var _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @emotion/styled-base */ "@emotion/styled-base");
/* harmony import */ var _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_emotion_styled_base__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var styles_text__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! styles/text */ "./styles/text.js");


const Body = _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()("span", {
  target: "eljqjq20",
  label: "Body"
})("grid-area:body;", styles_text__WEBPACK_IMPORTED_MODULE_1__["body"], ";" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL3RleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBYytCIiwiZmlsZSI6Ii9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL3RleHQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgc3R5bGVkIGZyb20gJ0BlbW90aW9uL3N0eWxlZCc7XG5pbXBvcnQge1xuICBib2R5LFxuICBib2R5MixcbiAgZGV0YWlsLFxuICBkZXRhaWwyLFxuICBkZXRhaWwzLFxuICBoZWFkaW5nLFxuICBoZWFkaW5nMixcbiAgaGVhZGluZzMsXG4gIHN1YmhlYWRlcixcbiAgc3ViaGVhZGVyMixcbn0gZnJvbSAnc3R5bGVzL3RleHQnO1xuXG5leHBvcnQgY29uc3QgQm9keSA9IHN0eWxlZC5zcGFuYFxuICBncmlkLWFyZWE6IGJvZHk7XG4gICR7Ym9keX07XG5gO1xuXG5leHBvcnQgY29uc3QgQm9keTIgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBib2R5MjtcbiAgJHtib2R5Mn07XG5gO1xuXG5leHBvcnQgY29uc3QgSGVhZGluZyA9IHN0eWxlZC5zcGFuYFxuICBncmlkLWFyZWE6IGhlYWRpbmc7XG4gICR7aGVhZGluZ307XG5gO1xuXG5leHBvcnQgY29uc3QgSGVhZGluZzIgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBoZWFkaW5nMjtcbiAgJHtoZWFkaW5nMn07XG5gO1xuXG5leHBvcnQgY29uc3QgSGVhZGluZzMgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBoZWFkaW5nMztcbiAgJHtoZWFkaW5nM307XG5gO1xuXG5leHBvcnQgY29uc3QgU3ViaGVhZGVyID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogc3ViaGVhZGVyO1xuICAke3N1YmhlYWRlcn07XG5gO1xuXG5leHBvcnQgY29uc3QgU3ViaGVhZGVyMiA9IHN0eWxlZC5zcGFuYFxuICBncmlkLWFyZWE6IHN1YmhlYWRlcjI7XG4gICR7c3ViaGVhZGVyMn07XG5gO1xuXG5leHBvcnQgY29uc3QgRGV0YWlsID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogZGV0YWlsO1xuICAke2RldGFpbH07XG5gO1xuXG5leHBvcnQgY29uc3QgRGV0YWlsMiA9IHN0eWxlZC5zcGFuYFxuICBncmlkLWFyZWE6IGRldGFpbDI7XG4gICR7ZGV0YWlsMn07XG5gO1xuXG5leHBvcnQgY29uc3QgRGV0YWlsMyA9IHN0eWxlZC5zcGFuYFxuICBncmlkLWFyZWE6IGRldGFpbDM7XG4gICR7ZGV0YWlsM307XG5gO1xuIl19 */"));
const Body2 = _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()("span", {
  target: "eljqjq21",
  label: "Body2"
})("grid-area:body2;", styles_text__WEBPACK_IMPORTED_MODULE_1__["body2"], ";" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL3RleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBbUJnQyIsImZpbGUiOiIvVXNlcnMvY2xpZnRvbmNhbXBiZWxsL0RldmVsb3BtZW50L2NsaWYud29ybGQvY29tcG9uZW50cy90ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHN0eWxlZCBmcm9tICdAZW1vdGlvbi9zdHlsZWQnO1xuaW1wb3J0IHtcbiAgYm9keSxcbiAgYm9keTIsXG4gIGRldGFpbCxcbiAgZGV0YWlsMixcbiAgZGV0YWlsMyxcbiAgaGVhZGluZyxcbiAgaGVhZGluZzIsXG4gIGhlYWRpbmczLFxuICBzdWJoZWFkZXIsXG4gIHN1YmhlYWRlcjIsXG59IGZyb20gJ3N0eWxlcy90ZXh0JztcblxuZXhwb3J0IGNvbnN0IEJvZHkgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBib2R5O1xuICAke2JvZHl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEJvZHkyID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogYm9keTI7XG4gICR7Ym9keTJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmcgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBoZWFkaW5nO1xuICAke2hlYWRpbmd9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmcyID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogaGVhZGluZzI7XG4gICR7aGVhZGluZzJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmczID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogaGVhZGluZzM7XG4gICR7aGVhZGluZzN9O1xuYDtcblxuZXhwb3J0IGNvbnN0IFN1YmhlYWRlciA9IHN0eWxlZC5zcGFuYFxuICBncmlkLWFyZWE6IHN1YmhlYWRlcjtcbiAgJHtzdWJoZWFkZXJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IFN1YmhlYWRlcjIgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBzdWJoZWFkZXIyO1xuICAke3N1YmhlYWRlcjJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbCA9IHN0eWxlZC5zcGFuYFxuICBncmlkLWFyZWE6IGRldGFpbDtcbiAgJHtkZXRhaWx9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbDIgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBkZXRhaWwyO1xuICAke2RldGFpbDJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbDMgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBkZXRhaWwzO1xuICAke2RldGFpbDN9O1xuYDtcbiJdfQ== */"));
const Heading = _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()("span", {
  target: "eljqjq22",
  label: "Heading"
})("grid-area:heading;", styles_text__WEBPACK_IMPORTED_MODULE_1__["heading"], ";" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL3RleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBd0JrQyIsImZpbGUiOiIvVXNlcnMvY2xpZnRvbmNhbXBiZWxsL0RldmVsb3BtZW50L2NsaWYud29ybGQvY29tcG9uZW50cy90ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHN0eWxlZCBmcm9tICdAZW1vdGlvbi9zdHlsZWQnO1xuaW1wb3J0IHtcbiAgYm9keSxcbiAgYm9keTIsXG4gIGRldGFpbCxcbiAgZGV0YWlsMixcbiAgZGV0YWlsMyxcbiAgaGVhZGluZyxcbiAgaGVhZGluZzIsXG4gIGhlYWRpbmczLFxuICBzdWJoZWFkZXIsXG4gIHN1YmhlYWRlcjIsXG59IGZyb20gJ3N0eWxlcy90ZXh0JztcblxuZXhwb3J0IGNvbnN0IEJvZHkgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBib2R5O1xuICAke2JvZHl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEJvZHkyID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogYm9keTI7XG4gICR7Ym9keTJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmcgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBoZWFkaW5nO1xuICAke2hlYWRpbmd9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmcyID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogaGVhZGluZzI7XG4gICR7aGVhZGluZzJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmczID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogaGVhZGluZzM7XG4gICR7aGVhZGluZzN9O1xuYDtcblxuZXhwb3J0IGNvbnN0IFN1YmhlYWRlciA9IHN0eWxlZC5zcGFuYFxuICBncmlkLWFyZWE6IHN1YmhlYWRlcjtcbiAgJHtzdWJoZWFkZXJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IFN1YmhlYWRlcjIgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBzdWJoZWFkZXIyO1xuICAke3N1YmhlYWRlcjJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbCA9IHN0eWxlZC5zcGFuYFxuICBncmlkLWFyZWE6IGRldGFpbDtcbiAgJHtkZXRhaWx9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbDIgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBkZXRhaWwyO1xuICAke2RldGFpbDJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbDMgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBkZXRhaWwzO1xuICAke2RldGFpbDN9O1xuYDtcbiJdfQ== */"));
const Heading2 = _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()("span", {
  target: "eljqjq23",
  label: "Heading2"
})("grid-area:heading2;", styles_text__WEBPACK_IMPORTED_MODULE_1__["heading2"], ";" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL3RleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBNkJtQyIsImZpbGUiOiIvVXNlcnMvY2xpZnRvbmNhbXBiZWxsL0RldmVsb3BtZW50L2NsaWYud29ybGQvY29tcG9uZW50cy90ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHN0eWxlZCBmcm9tICdAZW1vdGlvbi9zdHlsZWQnO1xuaW1wb3J0IHtcbiAgYm9keSxcbiAgYm9keTIsXG4gIGRldGFpbCxcbiAgZGV0YWlsMixcbiAgZGV0YWlsMyxcbiAgaGVhZGluZyxcbiAgaGVhZGluZzIsXG4gIGhlYWRpbmczLFxuICBzdWJoZWFkZXIsXG4gIHN1YmhlYWRlcjIsXG59IGZyb20gJ3N0eWxlcy90ZXh0JztcblxuZXhwb3J0IGNvbnN0IEJvZHkgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBib2R5O1xuICAke2JvZHl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEJvZHkyID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogYm9keTI7XG4gICR7Ym9keTJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmcgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBoZWFkaW5nO1xuICAke2hlYWRpbmd9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmcyID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogaGVhZGluZzI7XG4gICR7aGVhZGluZzJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmczID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogaGVhZGluZzM7XG4gICR7aGVhZGluZzN9O1xuYDtcblxuZXhwb3J0IGNvbnN0IFN1YmhlYWRlciA9IHN0eWxlZC5zcGFuYFxuICBncmlkLWFyZWE6IHN1YmhlYWRlcjtcbiAgJHtzdWJoZWFkZXJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IFN1YmhlYWRlcjIgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBzdWJoZWFkZXIyO1xuICAke3N1YmhlYWRlcjJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbCA9IHN0eWxlZC5zcGFuYFxuICBncmlkLWFyZWE6IGRldGFpbDtcbiAgJHtkZXRhaWx9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbDIgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBkZXRhaWwyO1xuICAke2RldGFpbDJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbDMgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBkZXRhaWwzO1xuICAke2RldGFpbDN9O1xuYDtcbiJdfQ== */"));
const Heading3 = _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()("span", {
  target: "eljqjq24",
  label: "Heading3"
})("grid-area:heading3;", styles_text__WEBPACK_IMPORTED_MODULE_1__["heading3"], ";" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL3RleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBa0NtQyIsImZpbGUiOiIvVXNlcnMvY2xpZnRvbmNhbXBiZWxsL0RldmVsb3BtZW50L2NsaWYud29ybGQvY29tcG9uZW50cy90ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHN0eWxlZCBmcm9tICdAZW1vdGlvbi9zdHlsZWQnO1xuaW1wb3J0IHtcbiAgYm9keSxcbiAgYm9keTIsXG4gIGRldGFpbCxcbiAgZGV0YWlsMixcbiAgZGV0YWlsMyxcbiAgaGVhZGluZyxcbiAgaGVhZGluZzIsXG4gIGhlYWRpbmczLFxuICBzdWJoZWFkZXIsXG4gIHN1YmhlYWRlcjIsXG59IGZyb20gJ3N0eWxlcy90ZXh0JztcblxuZXhwb3J0IGNvbnN0IEJvZHkgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBib2R5O1xuICAke2JvZHl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEJvZHkyID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogYm9keTI7XG4gICR7Ym9keTJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmcgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBoZWFkaW5nO1xuICAke2hlYWRpbmd9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmcyID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogaGVhZGluZzI7XG4gICR7aGVhZGluZzJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmczID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogaGVhZGluZzM7XG4gICR7aGVhZGluZzN9O1xuYDtcblxuZXhwb3J0IGNvbnN0IFN1YmhlYWRlciA9IHN0eWxlZC5zcGFuYFxuICBncmlkLWFyZWE6IHN1YmhlYWRlcjtcbiAgJHtzdWJoZWFkZXJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IFN1YmhlYWRlcjIgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBzdWJoZWFkZXIyO1xuICAke3N1YmhlYWRlcjJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbCA9IHN0eWxlZC5zcGFuYFxuICBncmlkLWFyZWE6IGRldGFpbDtcbiAgJHtkZXRhaWx9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbDIgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBkZXRhaWwyO1xuICAke2RldGFpbDJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbDMgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBkZXRhaWwzO1xuICAke2RldGFpbDN9O1xuYDtcbiJdfQ== */"));
const Subheader = _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()("span", {
  target: "eljqjq25",
  label: "Subheader"
})("grid-area:subheader;", styles_text__WEBPACK_IMPORTED_MODULE_1__["subheader"], ";" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL3RleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBdUNvQyIsImZpbGUiOiIvVXNlcnMvY2xpZnRvbmNhbXBiZWxsL0RldmVsb3BtZW50L2NsaWYud29ybGQvY29tcG9uZW50cy90ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHN0eWxlZCBmcm9tICdAZW1vdGlvbi9zdHlsZWQnO1xuaW1wb3J0IHtcbiAgYm9keSxcbiAgYm9keTIsXG4gIGRldGFpbCxcbiAgZGV0YWlsMixcbiAgZGV0YWlsMyxcbiAgaGVhZGluZyxcbiAgaGVhZGluZzIsXG4gIGhlYWRpbmczLFxuICBzdWJoZWFkZXIsXG4gIHN1YmhlYWRlcjIsXG59IGZyb20gJ3N0eWxlcy90ZXh0JztcblxuZXhwb3J0IGNvbnN0IEJvZHkgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBib2R5O1xuICAke2JvZHl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEJvZHkyID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogYm9keTI7XG4gICR7Ym9keTJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmcgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBoZWFkaW5nO1xuICAke2hlYWRpbmd9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmcyID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogaGVhZGluZzI7XG4gICR7aGVhZGluZzJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmczID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogaGVhZGluZzM7XG4gICR7aGVhZGluZzN9O1xuYDtcblxuZXhwb3J0IGNvbnN0IFN1YmhlYWRlciA9IHN0eWxlZC5zcGFuYFxuICBncmlkLWFyZWE6IHN1YmhlYWRlcjtcbiAgJHtzdWJoZWFkZXJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IFN1YmhlYWRlcjIgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBzdWJoZWFkZXIyO1xuICAke3N1YmhlYWRlcjJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbCA9IHN0eWxlZC5zcGFuYFxuICBncmlkLWFyZWE6IGRldGFpbDtcbiAgJHtkZXRhaWx9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbDIgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBkZXRhaWwyO1xuICAke2RldGFpbDJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbDMgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBkZXRhaWwzO1xuICAke2RldGFpbDN9O1xuYDtcbiJdfQ== */"));
const Subheader2 = _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()("span", {
  target: "eljqjq26",
  label: "Subheader2"
})("grid-area:subheader2;", styles_text__WEBPACK_IMPORTED_MODULE_1__["subheader2"], ";" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL3RleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBNENxQyIsImZpbGUiOiIvVXNlcnMvY2xpZnRvbmNhbXBiZWxsL0RldmVsb3BtZW50L2NsaWYud29ybGQvY29tcG9uZW50cy90ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHN0eWxlZCBmcm9tICdAZW1vdGlvbi9zdHlsZWQnO1xuaW1wb3J0IHtcbiAgYm9keSxcbiAgYm9keTIsXG4gIGRldGFpbCxcbiAgZGV0YWlsMixcbiAgZGV0YWlsMyxcbiAgaGVhZGluZyxcbiAgaGVhZGluZzIsXG4gIGhlYWRpbmczLFxuICBzdWJoZWFkZXIsXG4gIHN1YmhlYWRlcjIsXG59IGZyb20gJ3N0eWxlcy90ZXh0JztcblxuZXhwb3J0IGNvbnN0IEJvZHkgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBib2R5O1xuICAke2JvZHl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEJvZHkyID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogYm9keTI7XG4gICR7Ym9keTJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmcgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBoZWFkaW5nO1xuICAke2hlYWRpbmd9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmcyID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogaGVhZGluZzI7XG4gICR7aGVhZGluZzJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmczID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogaGVhZGluZzM7XG4gICR7aGVhZGluZzN9O1xuYDtcblxuZXhwb3J0IGNvbnN0IFN1YmhlYWRlciA9IHN0eWxlZC5zcGFuYFxuICBncmlkLWFyZWE6IHN1YmhlYWRlcjtcbiAgJHtzdWJoZWFkZXJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IFN1YmhlYWRlcjIgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBzdWJoZWFkZXIyO1xuICAke3N1YmhlYWRlcjJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbCA9IHN0eWxlZC5zcGFuYFxuICBncmlkLWFyZWE6IGRldGFpbDtcbiAgJHtkZXRhaWx9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbDIgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBkZXRhaWwyO1xuICAke2RldGFpbDJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbDMgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBkZXRhaWwzO1xuICAke2RldGFpbDN9O1xuYDtcbiJdfQ== */"));
const Detail = _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()("span", {
  target: "eljqjq27",
  label: "Detail"
})("grid-area:detail;", styles_text__WEBPACK_IMPORTED_MODULE_1__["detail"], ";" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL3RleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBaURpQyIsImZpbGUiOiIvVXNlcnMvY2xpZnRvbmNhbXBiZWxsL0RldmVsb3BtZW50L2NsaWYud29ybGQvY29tcG9uZW50cy90ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHN0eWxlZCBmcm9tICdAZW1vdGlvbi9zdHlsZWQnO1xuaW1wb3J0IHtcbiAgYm9keSxcbiAgYm9keTIsXG4gIGRldGFpbCxcbiAgZGV0YWlsMixcbiAgZGV0YWlsMyxcbiAgaGVhZGluZyxcbiAgaGVhZGluZzIsXG4gIGhlYWRpbmczLFxuICBzdWJoZWFkZXIsXG4gIHN1YmhlYWRlcjIsXG59IGZyb20gJ3N0eWxlcy90ZXh0JztcblxuZXhwb3J0IGNvbnN0IEJvZHkgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBib2R5O1xuICAke2JvZHl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEJvZHkyID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogYm9keTI7XG4gICR7Ym9keTJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmcgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBoZWFkaW5nO1xuICAke2hlYWRpbmd9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmcyID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogaGVhZGluZzI7XG4gICR7aGVhZGluZzJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmczID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogaGVhZGluZzM7XG4gICR7aGVhZGluZzN9O1xuYDtcblxuZXhwb3J0IGNvbnN0IFN1YmhlYWRlciA9IHN0eWxlZC5zcGFuYFxuICBncmlkLWFyZWE6IHN1YmhlYWRlcjtcbiAgJHtzdWJoZWFkZXJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IFN1YmhlYWRlcjIgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBzdWJoZWFkZXIyO1xuICAke3N1YmhlYWRlcjJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbCA9IHN0eWxlZC5zcGFuYFxuICBncmlkLWFyZWE6IGRldGFpbDtcbiAgJHtkZXRhaWx9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbDIgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBkZXRhaWwyO1xuICAke2RldGFpbDJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbDMgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBkZXRhaWwzO1xuICAke2RldGFpbDN9O1xuYDtcbiJdfQ== */"));
const Detail2 = _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()("span", {
  target: "eljqjq28",
  label: "Detail2"
})("grid-area:detail2;", styles_text__WEBPACK_IMPORTED_MODULE_1__["detail2"], ";" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL3RleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBc0RrQyIsImZpbGUiOiIvVXNlcnMvY2xpZnRvbmNhbXBiZWxsL0RldmVsb3BtZW50L2NsaWYud29ybGQvY29tcG9uZW50cy90ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHN0eWxlZCBmcm9tICdAZW1vdGlvbi9zdHlsZWQnO1xuaW1wb3J0IHtcbiAgYm9keSxcbiAgYm9keTIsXG4gIGRldGFpbCxcbiAgZGV0YWlsMixcbiAgZGV0YWlsMyxcbiAgaGVhZGluZyxcbiAgaGVhZGluZzIsXG4gIGhlYWRpbmczLFxuICBzdWJoZWFkZXIsXG4gIHN1YmhlYWRlcjIsXG59IGZyb20gJ3N0eWxlcy90ZXh0JztcblxuZXhwb3J0IGNvbnN0IEJvZHkgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBib2R5O1xuICAke2JvZHl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEJvZHkyID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogYm9keTI7XG4gICR7Ym9keTJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmcgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBoZWFkaW5nO1xuICAke2hlYWRpbmd9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmcyID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogaGVhZGluZzI7XG4gICR7aGVhZGluZzJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmczID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogaGVhZGluZzM7XG4gICR7aGVhZGluZzN9O1xuYDtcblxuZXhwb3J0IGNvbnN0IFN1YmhlYWRlciA9IHN0eWxlZC5zcGFuYFxuICBncmlkLWFyZWE6IHN1YmhlYWRlcjtcbiAgJHtzdWJoZWFkZXJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IFN1YmhlYWRlcjIgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBzdWJoZWFkZXIyO1xuICAke3N1YmhlYWRlcjJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbCA9IHN0eWxlZC5zcGFuYFxuICBncmlkLWFyZWE6IGRldGFpbDtcbiAgJHtkZXRhaWx9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbDIgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBkZXRhaWwyO1xuICAke2RldGFpbDJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbDMgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBkZXRhaWwzO1xuICAke2RldGFpbDN9O1xuYDtcbiJdfQ== */"));
const Detail3 = _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()("span", {
  target: "eljqjq29",
  label: "Detail3"
})("grid-area:detail3;", styles_text__WEBPACK_IMPORTED_MODULE_1__["detail3"], ";" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9jb21wb25lbnRzL3RleHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBMkRrQyIsImZpbGUiOiIvVXNlcnMvY2xpZnRvbmNhbXBiZWxsL0RldmVsb3BtZW50L2NsaWYud29ybGQvY29tcG9uZW50cy90ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHN0eWxlZCBmcm9tICdAZW1vdGlvbi9zdHlsZWQnO1xuaW1wb3J0IHtcbiAgYm9keSxcbiAgYm9keTIsXG4gIGRldGFpbCxcbiAgZGV0YWlsMixcbiAgZGV0YWlsMyxcbiAgaGVhZGluZyxcbiAgaGVhZGluZzIsXG4gIGhlYWRpbmczLFxuICBzdWJoZWFkZXIsXG4gIHN1YmhlYWRlcjIsXG59IGZyb20gJ3N0eWxlcy90ZXh0JztcblxuZXhwb3J0IGNvbnN0IEJvZHkgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBib2R5O1xuICAke2JvZHl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEJvZHkyID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogYm9keTI7XG4gICR7Ym9keTJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmcgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBoZWFkaW5nO1xuICAke2hlYWRpbmd9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmcyID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogaGVhZGluZzI7XG4gICR7aGVhZGluZzJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IEhlYWRpbmczID0gc3R5bGVkLnNwYW5gXG4gIGdyaWQtYXJlYTogaGVhZGluZzM7XG4gICR7aGVhZGluZzN9O1xuYDtcblxuZXhwb3J0IGNvbnN0IFN1YmhlYWRlciA9IHN0eWxlZC5zcGFuYFxuICBncmlkLWFyZWE6IHN1YmhlYWRlcjtcbiAgJHtzdWJoZWFkZXJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IFN1YmhlYWRlcjIgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBzdWJoZWFkZXIyO1xuICAke3N1YmhlYWRlcjJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbCA9IHN0eWxlZC5zcGFuYFxuICBncmlkLWFyZWE6IGRldGFpbDtcbiAgJHtkZXRhaWx9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbDIgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBkZXRhaWwyO1xuICAke2RldGFpbDJ9O1xuYDtcblxuZXhwb3J0IGNvbnN0IERldGFpbDMgPSBzdHlsZWQuc3BhbmBcbiAgZ3JpZC1hcmVhOiBkZXRhaWwzO1xuICAke2RldGFpbDN9O1xuYDtcbiJdfQ== */"));

/***/ }),

/***/ "./constants/pages.js":
/*!****************************!*\
  !*** ./constants/pages.js ***!
  \****************************/
/*! exports provided: HELLO, WORK, PROJECTS, LOST, orderedTabs */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HELLO", function() { return HELLO; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "WORK", function() { return WORK; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PROJECTS", function() { return PROJECTS; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "LOST", function() { return LOST; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "orderedTabs", function() { return orderedTabs; });
const HELLO = 'hello';
const WORK = 'work';
const PROJECTS = 'projects';
const LOST = 'lost';
const orderedTabs = [HELLO, PROJECTS, WORK];

/***/ }),

/***/ "./icons/arrow-left.svg":
/*!******************************!*\
  !*** ./icons/arrow-left.svg ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }



var _ref = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("path", {
  fill: "currentColor",
  d: "M64 468V44c0-6.6 5.4-12 12-12h48c6.6 0 12 5.4 12 12v176.4l195.5-181C352.1 22.3 384 36.6 384 64v384c0 27.4-31.9 41.7-52.5 24.6L136 292.7V468c0 6.6-5.4 12-12 12H76c-6.6 0-12-5.4-12-12z"
});

var SvgArrowLeft = function SvgArrowLeft(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("svg", _extends({
    "aria-hidden": "true",
    "data-prefix": "fas",
    "data-icon": "step-backward",
    className: "arrow-left_svg__svg-inline--fa arrow-left_svg__fa-step-backward arrow-left_svg__fa-w-14",
    viewBox: "0 0 448 512"
  }, props), _ref);
};

/* harmony default export */ __webpack_exports__["default"] = (SvgArrowLeft);

/***/ }),

/***/ "./icons/arrow-right.svg":
/*!*******************************!*\
  !*** ./icons/arrow-right.svg ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }



var _ref = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("path", {
  fill: "currentColor",
  d: "M384 44v424c0 6.6-5.4 12-12 12h-48c-6.6 0-12-5.4-12-12V291.6l-195.5 181C95.9 489.7 64 475.4 64 448V64c0-27.4 31.9-41.7 52.5-24.6L312 219.3V44c0-6.6 5.4-12 12-12h48c6.6 0 12 5.4 12 12z"
});

var SvgArrowRight = function SvgArrowRight(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("svg", _extends({
    "aria-hidden": "true",
    "data-prefix": "fas",
    "data-icon": "step-forward",
    className: "arrow-right_svg__svg-inline--fa arrow-right_svg__fa-step-forward arrow-right_svg__fa-w-14",
    viewBox: "0 0 448 512"
  }, props), _ref);
};

/* harmony default export */ __webpack_exports__["default"] = (SvgArrowRight);

/***/ }),

/***/ "./icons/caret-down.svg":
/*!******************************!*\
  !*** ./icons/caret-down.svg ***!
  \******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }



var _ref = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("path", {
  fill: "currentColor",
  d: "M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z"
});

var SvgCaretDown = function SvgCaretDown(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("svg", _extends({
    "aria-hidden": "true",
    "data-prefix": "fas",
    "data-icon": "caret-down",
    className: "caret-down_svg__svg-inline--fa caret-down_svg__fa-caret-down caret-down_svg__fa-w-10",
    viewBox: "0 0 320 512"
  }, props), _ref);
};

/* harmony default export */ __webpack_exports__["default"] = (SvgCaretDown);

/***/ }),

/***/ "./icons/caret-right.svg":
/*!*******************************!*\
  !*** ./icons/caret-right.svg ***!
  \*******************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }



var _ref = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("path", {
  fill: "currentColor",
  d: "M0 384.662V127.338c0-17.818 21.543-26.741 34.142-14.142l128.662 128.662c7.81 7.81 7.81 20.474 0 28.284L34.142 398.804C21.543 411.404 0 402.48 0 384.662z"
});

var SvgCaretRight = function SvgCaretRight(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("svg", _extends({
    "aria-hidden": "true",
    "data-prefix": "fas",
    "data-icon": "caret-right",
    className: "caret-right_svg__svg-inline--fa caret-right_svg__fa-caret-right caret-right_svg__fa-w-6",
    viewBox: "0 0 192 512"
  }, props), _ref);
};

/* harmony default export */ __webpack_exports__["default"] = (SvgCaretRight);

/***/ }),

/***/ "./icons/cube.svg":
/*!************************!*\
  !*** ./icons/cube.svg ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }



var _ref = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("path", {
  fill: "currentColor",
  d: "M239.1 6.3l-208 78c-18.7 7-31.1 25-31.1 45v225.1c0 18.2 10.3 34.8 26.5 42.9l208 104c13.5 6.8 29.4 6.8 42.9 0l208-104c16.3-8.1 26.5-24.8 26.5-42.9V129.3c0-20-12.4-37.9-31.1-44.9l-208-78C262 2.2 250 2.2 239.1 6.3zM256 68.4l192 72v1.1l-192 78-192-78v-1.1l192-72zm32 356V275.5l160-65v133.9l-160 80z"
});

var SvgCube = function SvgCube(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("svg", _extends({
    "aria-hidden": "true",
    "data-prefix": "fas",
    "data-icon": "cube",
    className: "cube_svg__svg-inline--fa cube_svg__fa-cube cube_svg__fa-w-16",
    viewBox: "0 0 512 512"
  }, props), _ref);
};

/* harmony default export */ __webpack_exports__["default"] = (SvgCube);

/***/ }),

/***/ "./icons/envelope.svg":
/*!****************************!*\
  !*** ./icons/envelope.svg ***!
  \****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }



var _ref = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("path", {
  fill: "currentColor",
  d: "M502.3 190.8c3.9-3.1 9.7-.2 9.7 4.7V400c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V195.6c0-5 5.7-7.8 9.7-4.7 22.4 17.4 52.1 39.5 154.1 113.6 21.1 15.4 56.7 47.8 92.2 47.6 35.7.3 72-32.8 92.3-47.6 102-74.1 131.6-96.3 154-113.7zM256 320c23.2.4 56.6-29.2 73.4-41.4 132.7-96.3 142.8-104.7 173.4-128.7 5.8-4.5 9.2-11.5 9.2-18.9v-19c0-26.5-21.5-48-48-48H48C21.5 64 0 85.5 0 112v19c0 7.4 3.4 14.3 9.2 18.9 30.6 23.9 40.7 32.4 173.4 128.7 16.8 12.2 50.2 41.8 73.4 41.4z"
});

var SvgEnvelope = function SvgEnvelope(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("svg", _extends({
    "aria-hidden": "true",
    "data-prefix": "fas",
    "data-icon": "envelope",
    className: "envelope_svg__svg-inline--fa envelope_svg__fa-envelope envelope_svg__fa-w-16",
    viewBox: "0 0 512 512"
  }, props), _ref);
};

/* harmony default export */ __webpack_exports__["default"] = (SvgEnvelope);

/***/ }),

/***/ "./icons/expand.svg":
/*!**************************!*\
  !*** ./icons/expand.svg ***!
  \**************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }



var _ref = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("path", {
  fill: "currentColor",
  d: "M448 344v112a23.94 23.94 0 01-24 24H312c-21.39 0-32.09-25.9-17-41l36.2-36.2L224 295.6 116.77 402.9 153 439c15.09 15.1 4.39 41-17 41H24a23.94 23.94 0 01-24-24V344c0-21.4 25.89-32.1 41-17l36.19 36.2L184.46 256 77.18 148.7 41 185c-15.1 15.1-41 4.4-41-17V56a23.94 23.94 0 0124-24h112c21.39 0 32.09 25.9 17 41l-36.2 36.2L224 216.4l107.23-107.3L295 73c-15.09-15.1-4.39-41 17-41h112a23.94 23.94 0 0124 24v112c0 21.4-25.89 32.1-41 17l-36.19-36.2L263.54 256l107.28 107.3L407 327.1c15.1-15.2 41-4.5 41 16.9z"
});

var SvgExpand = function SvgExpand(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("svg", _extends({
    "aria-hidden": "true",
    "data-prefix": "fas",
    "data-icon": "expand-arrows-alt",
    className: "expand_svg__svg-inline--fa expand_svg__fa-expand-arrows-alt expand_svg__fa-w-14",
    viewBox: "0 0 448 512"
  }, props), _ref);
};

/* harmony default export */ __webpack_exports__["default"] = (SvgExpand);

/***/ }),

/***/ "./icons/eye.svg":
/*!***********************!*\
  !*** ./icons/eye.svg ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }



var _ref = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("path", {
  fill: "currentColor",
  d: "M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 000 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 000-29.19zM288 400a144 144 0 11144-144 143.93 143.93 0 01-144 144zm0-240a95.31 95.31 0 00-25.31 3.79 47.85 47.85 0 01-66.9 66.9A95.78 95.78 0 10288 160z"
});

var SvgEye = function SvgEye(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("svg", _extends({
    "aria-hidden": "true",
    "data-prefix": "fas",
    "data-icon": "eye",
    className: "eye_svg__svg-inline--fa eye_svg__fa-eye eye_svg__fa-w-18",
    viewBox: "0 0 576 512"
  }, props), _ref);
};

/* harmony default export */ __webpack_exports__["default"] = (SvgEye);

/***/ }),

/***/ "./icons/feather.svg":
/*!***************************!*\
  !*** ./icons/feather.svg ***!
  \***************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }



var _ref = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("path", {
  fill: "currentColor",
  d: "M512 0C460.22 3.56 96.44 38.2 71.01 287.61c-3.09 26.66-4.84 53.44-5.99 80.24l178.87-178.69c6.25-6.25 16.4-6.25 22.65 0s6.25 16.38 0 22.63L7.04 471.03c-9.38 9.37-9.38 24.57 0 33.94 9.38 9.37 24.59 9.37 33.98 0l57.13-57.07c42.09-.14 84.15-2.53 125.96-7.36 53.48-5.44 97.02-26.47 132.58-56.54H255.74l146.79-48.88c11.25-14.89 21.37-30.71 30.45-47.12h-81.14l106.54-53.21C500.29 132.86 510.19 26.26 512 0z"
});

var SvgFeather = function SvgFeather(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("svg", _extends({
    "aria-hidden": "true",
    "data-prefix": "fas",
    "data-icon": "feather-alt",
    className: "feather_svg__svg-inline--fa feather_svg__fa-feather-alt feather_svg__fa-w-16",
    viewBox: "0 0 512 512"
  }, props), _ref);
};

/* harmony default export */ __webpack_exports__["default"] = (SvgFeather);

/***/ }),

/***/ "./icons/futbol.svg":
/*!**************************!*\
  !*** ./icons/futbol.svg ***!
  \**************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }



var _ref = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("path", {
  fill: "currentColor",
  d: "M483.8 179.4C449.8 74.6 352.6 8 248.1 8c-25.4 0-51.2 3.9-76.7 12.2C41.2 62.5-30.1 202.4 12.2 332.6 46.2 437.4 143.4 504 247.9 504c25.4 0 51.2-3.9 76.7-12.2 130.2-42.3 201.5-182.2 159.2-312.4zm-74.5 193.7l-52.2 6.4-43.7-60.9 24.4-75.2 71.1-22.1 38.9 36.4c-.2 30.7-7.4 61.1-21.7 89.2-4.7 9.3-10.7 17.8-16.8 26.2zm0-235.4l-10.4 53.1-70.7 22-64.2-46.5V92.5l47.4-26.2c39.2 13 73.4 38 97.9 71.4zM184.9 66.4L232 92.5v73.8l-64.2 46.5-70.6-22-10.1-52.5c24.3-33.4 57.9-58.6 97.8-71.9zM139 379.5L85.9 373c-14.4-20.1-37.3-59.6-37.8-115.3l39-36.4 71.1 22.2 24.3 74.3-43.5 61.7zm48.2 67l-22.4-48.1 43.6-61.7H287l44.3 61.7-22.4 48.1c-6.2 1.8-57.6 20.4-121.7 0z"
});

var SvgFutbol = function SvgFutbol(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("svg", _extends({
    "aria-hidden": "true",
    "data-prefix": "far",
    "data-icon": "futbol",
    className: "futbol_svg__svg-inline--fa futbol_svg__fa-futbol futbol_svg__fa-w-16",
    viewBox: "0 0 496 512"
  }, props), _ref);
};

/* harmony default export */ __webpack_exports__["default"] = (SvgFutbol);

/***/ }),

/***/ "./icons/hiking.svg":
/*!**************************!*\
  !*** ./icons/hiking.svg ***!
  \**************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }



var _ref = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("path", {
  fill: "currentColor",
  d: "M80.95 472.23c-4.28 17.16 6.14 34.53 23.28 38.81 2.61.66 5.22.95 7.8.95 14.33 0 27.37-9.7 31.02-24.23l25.24-100.97-52.78-52.78-34.56 138.22zm14.89-196.12L137 117c2.19-8.42-3.14-16.95-11.92-19.06-43.88-10.52-88.35 15.07-99.32 57.17L.49 253.24c-2.19 8.42 3.14 16.95 11.92 19.06l63.56 15.25c8.79 2.1 17.68-3.02 19.87-11.44zM368 160h-16c-8.84 0-16 7.16-16 16v16h-34.75l-46.78-46.78C243.38 134.11 228.61 128 212.91 128c-27.02 0-50.47 18.3-57.03 44.52l-26.92 107.72a32.012 32.012 0 008.42 30.39L224 397.25V480c0 17.67 14.33 32 32 32s32-14.33 32-32v-82.75c0-17.09-6.66-33.16-18.75-45.25l-46.82-46.82c.15-.5.49-.89.62-1.41l19.89-79.57 22.43 22.43c6 6 14.14 9.38 22.62 9.38h48v240c0 8.84 7.16 16 16 16h16c8.84 0 16-7.16 16-16V176c.01-8.84-7.15-16-15.99-16zM240 96c26.51 0 48-21.49 48-48S266.51 0 240 0s-48 21.49-48 48 21.49 48 48 48z"
});

var SvgHiking = function SvgHiking(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("svg", _extends({
    "aria-hidden": "true",
    "data-prefix": "fas",
    "data-icon": "hiking",
    className: "hiking_svg__svg-inline--fa hiking_svg__fa-hiking hiking_svg__fa-w-12",
    viewBox: "0 0 384 512"
  }, props), _ref);
};

/* harmony default export */ __webpack_exports__["default"] = (SvgHiking);

/***/ }),

/***/ "./icons/home.svg":
/*!************************!*\
  !*** ./icons/home.svg ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }



var _ref = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("path", {
  fill: "currentColor",
  d: "M280.37 148.26L96 300.11V464a16 16 0 0016 16l112.06-.29a16 16 0 0015.92-16V368a16 16 0 0116-16h64a16 16 0 0116 16v95.64a16 16 0 0016 16.05L464 480a16 16 0 0016-16V300L295.67 148.26a12.19 12.19 0 00-15.3 0zM571.6 251.47L488 182.56V44.05a12 12 0 00-12-12h-56a12 12 0 00-12 12v72.61L318.47 43a48 48 0 00-61 0L4.34 251.47a12 12 0 00-1.6 16.9l25.5 31A12 12 0 0045.15 301l235.22-193.74a12.19 12.19 0 0115.3 0L530.9 301a12 12 0 0016.9-1.6l25.5-31a12 12 0 00-1.7-16.93z"
});

var SvgHome = function SvgHome(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("svg", _extends({
    "aria-hidden": "true",
    "data-prefix": "fas",
    "data-icon": "home",
    className: "home_svg__svg-inline--fa home_svg__fa-home home_svg__fa-w-18",
    viewBox: "0 0 576 512"
  }, props), _ref);
};

/* harmony default export */ __webpack_exports__["default"] = (SvgHome);

/***/ }),

/***/ "./icons/index.js":
/*!************************!*\
  !*** ./icons/index.js ***!
  \************************/
/*! exports provided: ArrowLeftIcon, ArrowRightIcon, CaretDownIcon, CaretRightIcon, CubeIcon, EnvelopeIcon, ExpandIcon, EyeIcon, FeatherIcon, FutbolIcon, HikingIcon, HomeIcon, MoleculeIcon, MountainIcon, UFOIcon */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _arrow_left_svg__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./arrow-left.svg */ "./icons/arrow-left.svg");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ArrowLeftIcon", function() { return _arrow_left_svg__WEBPACK_IMPORTED_MODULE_0__["default"]; });

/* harmony import */ var _arrow_right_svg__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./arrow-right.svg */ "./icons/arrow-right.svg");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ArrowRightIcon", function() { return _arrow_right_svg__WEBPACK_IMPORTED_MODULE_1__["default"]; });

/* harmony import */ var _caret_down_svg__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./caret-down.svg */ "./icons/caret-down.svg");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CaretDownIcon", function() { return _caret_down_svg__WEBPACK_IMPORTED_MODULE_2__["default"]; });

/* harmony import */ var _caret_right_svg__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./caret-right.svg */ "./icons/caret-right.svg");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CaretRightIcon", function() { return _caret_right_svg__WEBPACK_IMPORTED_MODULE_3__["default"]; });

/* harmony import */ var _cube_svg__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./cube.svg */ "./icons/cube.svg");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "CubeIcon", function() { return _cube_svg__WEBPACK_IMPORTED_MODULE_4__["default"]; });

/* harmony import */ var _envelope_svg__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./envelope.svg */ "./icons/envelope.svg");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EnvelopeIcon", function() { return _envelope_svg__WEBPACK_IMPORTED_MODULE_5__["default"]; });

/* harmony import */ var _expand_svg__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./expand.svg */ "./icons/expand.svg");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "ExpandIcon", function() { return _expand_svg__WEBPACK_IMPORTED_MODULE_6__["default"]; });

/* harmony import */ var _eye_svg__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./eye.svg */ "./icons/eye.svg");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "EyeIcon", function() { return _eye_svg__WEBPACK_IMPORTED_MODULE_7__["default"]; });

/* harmony import */ var _feather_svg__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./feather.svg */ "./icons/feather.svg");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "FeatherIcon", function() { return _feather_svg__WEBPACK_IMPORTED_MODULE_8__["default"]; });

/* harmony import */ var _futbol_svg__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./futbol.svg */ "./icons/futbol.svg");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "FutbolIcon", function() { return _futbol_svg__WEBPACK_IMPORTED_MODULE_9__["default"]; });

/* harmony import */ var _hiking_svg__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./hiking.svg */ "./icons/hiking.svg");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "HikingIcon", function() { return _hiking_svg__WEBPACK_IMPORTED_MODULE_10__["default"]; });

/* harmony import */ var _home_svg__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./home.svg */ "./icons/home.svg");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "HomeIcon", function() { return _home_svg__WEBPACK_IMPORTED_MODULE_11__["default"]; });

/* harmony import */ var _molecule_svg__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./molecule.svg */ "./icons/molecule.svg");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MoleculeIcon", function() { return _molecule_svg__WEBPACK_IMPORTED_MODULE_12__["default"]; });

/* harmony import */ var _mountain_svg__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./mountain.svg */ "./icons/mountain.svg");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "MountainIcon", function() { return _mountain_svg__WEBPACK_IMPORTED_MODULE_13__["default"]; });

/* harmony import */ var _ufo_svg__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./ufo.svg */ "./icons/ufo.svg");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "UFOIcon", function() { return _ufo_svg__WEBPACK_IMPORTED_MODULE_14__["default"]; });

















/***/ }),

/***/ "./icons/molecule.svg":
/*!****************************!*\
  !*** ./icons/molecule.svg ***!
  \****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }



var _ref = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("path", {
  d: "M256 166c-49.629 0-90 40.371-90 90s40.371 90 90 90 90-40.371 90-90-40.371-90-90-90zM111.5 90.289C116.768 81.367 120 71.094 120 60c0-33.091-26.909-60-60-60S0 26.909 0 60s26.909 60 60 60c11.094 0 21.367-3.232 30.289-8.5l71.307 71.307a120.226 120.226 0 0121.211-21.211L111.5 90.289zM421 31c-33.091 0-60 26.909-60 60 0 11.094 3.232 21.367 8.5 30.289l-40.307 40.307a120.226 120.226 0 0121.211 21.211l40.307-40.307c8.922 5.268 19.195 8.5 30.289 8.5 33.091 0 60-26.909 60-60s-26.909-60-60-60zM137.216 268.018l-24.264 5.367C102.92 254.235 83.08 241 60 241c-33.091 0-60 26.909-60 60s26.909 60 60 60c32.547 0 58.976-26.071 59.839-58.412l23.936-5.29c-3.428-9.278-5.526-19.092-6.559-29.28zM452 271c-20.839 0-39.192 10.693-49.951 26.862l-30.348-11.739c-2.574 9.855-6.418 19.107-11.268 27.808l32.038 12.415c-.123 1.563-.471 3.061-.471 4.654 0 33.091 26.909 60 60 60s60-26.909 60-60-26.909-60-60-60zM271 394.13v-19.646c-4.968.63-9.864 1.516-15 1.516s-10.032-.886-15-1.516v19.646c-25.807 6.707-45 29.989-45 57.87 0 33.091 26.909 60 60 60s60-26.909 60-60c0-27.881-19.193-51.163-45-57.87z"
});

var SvgMolecule = function SvgMolecule(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("svg", _extends({
    viewBox: "0 0 512 512"
  }, props), _ref);
};

/* harmony default export */ __webpack_exports__["default"] = (SvgMolecule);

/***/ }),

/***/ "./icons/mountain.svg":
/*!****************************!*\
  !*** ./icons/mountain.svg ***!
  \****************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }



var _ref = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("path", {
  fill: "currentColor",
  d: "M634.92 462.7l-288-448C341.03 5.54 330.89 0 320 0s-21.03 5.54-26.92 14.7l-288 448a32.001 32.001 0 00-1.17 32.64A32.004 32.004 0 0032 512h576c11.71 0 22.48-6.39 28.09-16.67a31.983 31.983 0 00-1.17-32.63zM320 91.18L405.39 224H320l-64 64-38.06-38.06L320 91.18z"
});

var SvgMountain = function SvgMountain(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("svg", _extends({
    "aria-hidden": "true",
    "data-prefix": "fas",
    "data-icon": "mountain",
    className: "mountain_svg__svg-inline--fa mountain_svg__fa-mountain mountain_svg__fa-w-20",
    viewBox: "0 0 640 512"
  }, props), _ref);
};

/* harmony default export */ __webpack_exports__["default"] = (SvgMountain);

/***/ }),

/***/ "./icons/ufo.svg":
/*!***********************!*\
  !*** ./icons/ufo.svg ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }



var _ref = /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("path", {
  d: "M224 344.828c-5.402 0-10.694-.186-16-.346v96.346h32v-96.346c-5.306.16-10.598.346-16 .346zM61.206 314.635l-43.518 87.037 28.625 14.313 44.974-89.947c-10.812-3.42-20.878-7.222-30.081-11.403zM386.794 314.635c-9.202 4.181-19.269 7.983-30.08 11.402l44.974 89.947 28.625-14.313-43.519-87.036zM351.305 121.885C344.636 57.528 290.091 7.172 224 7.172S103.365 57.528 96.695 121.885C38.31 139.212 0 168.088 0 200.829c0 53.019 100.288 96 224 96s224-42.981 224-96c0-32.741-38.31-61.617-96.695-78.944zM88 232.829c-13.255 0-24-10.745-24-24s10.745-24 24-24 24 10.745 24 24-10.745 24-24 24zm92.61-103.039c2.919-4.771 13.021-3.906 22.562 1.934 9.541 5.839 14.909 14.439 11.99 19.21-2.92 4.77-13.021 3.906-22.562-1.934-9.54-5.839-14.908-14.44-11.99-19.21zM224 264.829c-13.255 0-24-10.745-24-24s10.745-24 24-24 24 10.745 24 24-10.745 24-24 24zM255.316 149c-9.541 5.839-19.642 6.704-22.562 1.934-2.919-4.77 2.45-13.371 11.991-19.21s19.642-6.705 22.562-1.934c2.919 4.77-2.45 13.371-11.991 19.21zm64.685-3.54c-11.81 8.434-29.52 15.147-50.622 19.186 5.806-12.053 9.802-25.608 9.85-39.898.147-44.513-35.926-55.568-55.229-55.568-19.303 0-55.46 11.054-55.311 55.567.047 14.282 4.039 27.83 9.84 39.878-21.059-4.041-38.738-10.744-50.528-19.166v-10.287c0-52.938 43.062-96 96-96s96 43.062 96 96v10.288zM360 232.829c-13.255 0-24-10.745-24-24s10.745-24 24-24 24 10.745 24 24-10.745 24-24 24z"
});

var SvgUfo = function SvgUfo(props) {
  return /*#__PURE__*/react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement("svg", _extends({
    viewBox: "0 0 448 448"
  }, props), _ref);
};

/* harmony default export */ __webpack_exports__["default"] = (SvgUfo);

/***/ }),

/***/ "./node_modules/next/dist/client/link.js":
/*!***********************************************!*\
  !*** ./node_modules/next/dist/client/link.js ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "./node_modules/next/node_modules/@babel/runtime/helpers/interopRequireDefault.js");

var _interopRequireWildcard = __webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "./node_modules/next/node_modules/@babel/runtime/helpers/interopRequireWildcard.js");

exports.__esModule = true;
exports.default = void 0;

var _react = _interopRequireWildcard(__webpack_require__(/*! react */ "react"));

var _url = __webpack_require__(/*! url */ "url");

var _utils = __webpack_require__(/*! ../next-server/lib/utils */ "../next-server/lib/utils");

var _router = _interopRequireDefault(__webpack_require__(/*! ./router */ "./node_modules/next/dist/client/router.js"));

var _router2 = __webpack_require__(/*! ../next-server/lib/router/router */ "./node_modules/next/dist/next-server/lib/router/router.js");

function isLocal(href) {
  var url = (0, _url.parse)(href, false, true);
  var origin = (0, _url.parse)((0, _utils.getLocationOrigin)(), false, true);
  return !url.host || url.protocol === origin.protocol && url.host === origin.host;
}

function memoizedFormatUrl(formatFunc) {
  var lastHref = null;
  var lastAs = null;
  var lastResult = null;
  return (href, as) => {
    if (lastResult && href === lastHref && as === lastAs) {
      return lastResult;
    }

    var result = formatFunc(href, as);
    lastHref = href;
    lastAs = as;
    lastResult = result;
    return result;
  };
}

function formatUrl(url) {
  return url && typeof url === 'object' ? (0, _utils.formatWithValidation)(url) : url;
}

var observer;
var listeners = new Map();
var IntersectionObserver = false ? undefined : null;
var prefetched = {};

function getObserver() {
  // Return shared instance of IntersectionObserver if already created
  if (observer) {
    return observer;
  } // Only create shared IntersectionObserver if supported in browser


  if (!IntersectionObserver) {
    return undefined;
  }

  return observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!listeners.has(entry.target)) {
        return;
      }

      var cb = listeners.get(entry.target);

      if (entry.isIntersecting || entry.intersectionRatio > 0) {
        observer.unobserve(entry.target);
        listeners.delete(entry.target);
        cb();
      }
    });
  }, {
    rootMargin: '200px'
  });
}

var listenToIntersections = (el, cb) => {
  var observer = getObserver();

  if (!observer) {
    return () => {};
  }

  observer.observe(el);
  listeners.set(el, cb);
  return () => {
    try {
      observer.unobserve(el);
    } catch (err) {
      console.error(err);
    }

    listeners.delete(el);
  };
};

class Link extends _react.Component {
  constructor(props) {
    super(props);
    this.p = void 0;

    this.cleanUpListeners = () => {};

    this.formatUrls = memoizedFormatUrl((href, asHref) => {
      return {
        href: (0, _router2.addBasePath)(formatUrl(href)),
        as: asHref ? (0, _router2.addBasePath)(formatUrl(asHref)) : asHref
      };
    });

    this.linkClicked = e => {
      var {
        nodeName,
        target
      } = e.currentTarget;

      if (nodeName === 'A' && (target && target !== '_self' || e.metaKey || e.ctrlKey || e.shiftKey || e.nativeEvent && e.nativeEvent.which === 2)) {
        // ignore click for new tab / new window behavior
        return;
      }

      var {
        href,
        as
      } = this.formatUrls(this.props.href, this.props.as);

      if (!isLocal(href)) {
        // ignore click if it's outside our scope (e.g. https://google.com)
        return;
      }

      var {
        pathname
      } = window.location;
      href = (0, _url.resolve)(pathname, href);
      as = as ? (0, _url.resolve)(pathname, as) : href;
      e.preventDefault(); //  avoid scroll for urls with anchor refs

      var {
        scroll
      } = this.props;

      if (scroll == null) {
        scroll = as.indexOf('#') < 0;
      } // replace state instead of push if prop is present


      _router.default[this.props.replace ? 'replace' : 'push'](href, as, {
        shallow: this.props.shallow
      }).then(success => {
        if (!success) return;

        if (scroll) {
          window.scrollTo(0, 0);
          document.body.focus();
        }
      });
    };

    if (true) {
      if (props.prefetch) {
        console.warn('Next.js auto-prefetches automatically based on viewport. The prefetch attribute is no longer needed. More: https://err.sh/zeit/next.js/prefetch-true-deprecated');
      }
    }

    this.p = props.prefetch !== false;
  }

  componentWillUnmount() {
    this.cleanUpListeners();
  }

  getPaths() {
    var {
      pathname
    } = window.location;
    var {
      href: parsedHref,
      as: parsedAs
    } = this.formatUrls(this.props.href, this.props.as);
    var resolvedHref = (0, _url.resolve)(pathname, parsedHref);
    return [resolvedHref, parsedAs ? (0, _url.resolve)(pathname, parsedAs) : resolvedHref];
  }

  handleRef(ref) {
    if (this.p && IntersectionObserver && ref && ref.tagName) {
      this.cleanUpListeners();
      var isPrefetched = prefetched[this.getPaths().join( // Join on an invalid URI character
      '%')];

      if (!isPrefetched) {
        this.cleanUpListeners = listenToIntersections(ref, () => {
          this.prefetch();
        });
      }
    }
  } // The function is memoized so that no extra lifecycles are needed
  // as per https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html


  prefetch(options) {
    if (!this.p || true) return; // Prefetch the JSON page if asked (only in the client)

    var paths = this.getPaths(); // We need to handle a prefetch error here since we may be
    // loading with priority which can reject but we don't
    // want to force navigation since this is only a prefetch

    _router.default.prefetch(paths[
    /* href */
    0], paths[
    /* asPath */
    1], options).catch(err => {
      if (true) {
        // rethrow to show invalid URL errors
        throw err;
      }
    });

    prefetched[paths.join( // Join on an invalid URI character
    '%')] = true;
  }

  render() {
    var {
      children
    } = this.props;
    var {
      href,
      as
    } = this.formatUrls(this.props.href, this.props.as); // Deprecated. Warning shown by propType check. If the children provided is a string (<Link>example</Link>) we wrap it in an <a> tag

    if (typeof children === 'string') {
      children = _react.default.createElement("a", null, children);
    } // This will return the first child, if multiple are provided it will throw an error


    var child = _react.Children.only(children);

    var props = {
      ref: el => {
        this.handleRef(el);

        if (child && typeof child === 'object' && child.ref) {
          if (typeof child.ref === 'function') child.ref(el);else if (typeof child.ref === 'object') {
            child.ref.current = el;
          }
        }
      },
      onMouseEnter: e => {
        if (child.props && typeof child.props.onMouseEnter === 'function') {
          child.props.onMouseEnter(e);
        }

        this.prefetch({
          priority: true
        });
      },
      onClick: e => {
        if (child.props && typeof child.props.onClick === 'function') {
          child.props.onClick(e);
        }

        if (!e.defaultPrevented) {
          this.linkClicked(e);
        }
      }
    }; // If child is an <a> tag and doesn't have a href attribute, or if the 'passHref' property is
    // defined, we specify the current 'href', so that repetition is not needed by the user

    if (this.props.passHref || child.type === 'a' && !('href' in child.props)) {
      props.href = as || href;
    } // Add the ending slash to the paths. So, we can serve the
    // "<page>/index.html" directly.


    if (false) { var rewriteUrlForNextExport; }

    return _react.default.cloneElement(child, props);
  }

}

if (true) {
  var warn = (0, _utils.execOnce)(console.error); // This module gets removed by webpack.IgnorePlugin

  var PropTypes = __webpack_require__(/*! prop-types */ "prop-types");

  var exact = __webpack_require__(/*! prop-types-exact */ "prop-types-exact"); // @ts-ignore the property is supported, when declaring it on the class it outputs an extra bit of code which is not needed.


  Link.propTypes = exact({
    href: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
    as: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    prefetch: PropTypes.bool,
    replace: PropTypes.bool,
    shallow: PropTypes.bool,
    passHref: PropTypes.bool,
    scroll: PropTypes.bool,
    children: PropTypes.oneOfType([PropTypes.element, (props, propName) => {
      var value = props[propName];

      if (typeof value === 'string') {
        warn("Warning: You're using a string directly inside <Link>. This usage has been deprecated. Please add an <a> tag as child of <Link>");
      }

      return null;
    }]).isRequired
  });
}

var _default = Link;
exports.default = _default;

/***/ }),

/***/ "./node_modules/next/dist/client/router.js":
/*!*************************************************!*\
  !*** ./node_modules/next/dist/client/router.js ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireWildcard = __webpack_require__(/*! @babel/runtime/helpers/interopRequireWildcard */ "./node_modules/next/node_modules/@babel/runtime/helpers/interopRequireWildcard.js");

var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "./node_modules/next/node_modules/@babel/runtime/helpers/interopRequireDefault.js");

exports.__esModule = true;
exports.useRouter = useRouter;
exports.makePublicRouterInstance = makePublicRouterInstance;
exports.createRouter = exports.withRouter = exports.default = void 0;

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "react"));

var _router2 = _interopRequireWildcard(__webpack_require__(/*! ../next-server/lib/router/router */ "./node_modules/next/dist/next-server/lib/router/router.js"));

exports.Router = _router2.default;
exports.NextRouter = _router2.NextRouter;

var _routerContext = __webpack_require__(/*! ../next-server/lib/router-context */ "../next-server/lib/router-context");

var _withRouter = _interopRequireDefault(__webpack_require__(/*! ./with-router */ "./node_modules/next/dist/client/with-router.js"));

exports.withRouter = _withRouter.default;
/* global window */

var singletonRouter = {
  router: null,
  // holds the actual router instance
  readyCallbacks: [],

  ready(cb) {
    if (this.router) return cb();

    if (false) {}
  }

}; // Create public properties and methods of the router in the singletonRouter

var urlPropertyFields = ['pathname', 'route', 'query', 'asPath', 'components', 'isFallback', 'basePath'];
var routerEvents = ['routeChangeStart', 'beforeHistoryChange', 'routeChangeComplete', 'routeChangeError', 'hashChangeStart', 'hashChangeComplete'];
var coreMethodFields = ['push', 'replace', 'reload', 'back', 'prefetch', 'beforePopState']; // Events is a static property on the router, the router doesn't have to be initialized to use it

Object.defineProperty(singletonRouter, 'events', {
  get() {
    return _router2.default.events;
  }

});
urlPropertyFields.forEach(field => {
  // Here we need to use Object.defineProperty because, we need to return
  // the property assigned to the actual router
  // The value might get changed as we change routes and this is the
  // proper way to access it
  Object.defineProperty(singletonRouter, field, {
    get() {
      var router = getRouter();
      return router[field];
    }

  });
});
coreMethodFields.forEach(field => {
  // We don't really know the types here, so we add them later instead
  ;

  singletonRouter[field] = function () {
    var router = getRouter();
    return router[field](...arguments);
  };
});
routerEvents.forEach(event => {
  singletonRouter.ready(() => {
    _router2.default.events.on(event, function () {
      var eventField = "on" + event.charAt(0).toUpperCase() + event.substring(1);
      var _singletonRouter = singletonRouter;

      if (_singletonRouter[eventField]) {
        try {
          _singletonRouter[eventField](...arguments);
        } catch (err) {
          // tslint:disable-next-line:no-console
          console.error("Error when running the Router event: " + eventField); // tslint:disable-next-line:no-console

          console.error(err.message + "\n" + err.stack);
        }
      }
    });
  });
});

function getRouter() {
  if (!singletonRouter.router) {
    var message = 'No router instance found.\n' + 'You should only use "next/router" inside the client side of your app.\n';
    throw new Error(message);
  }

  return singletonRouter.router;
} // Export the singletonRouter and this is the public API.


var _default = singletonRouter; // Reexport the withRoute HOC

exports.default = _default;

function useRouter() {
  return _react.default.useContext(_routerContext.RouterContext);
} // INTERNAL APIS
// -------------
// (do not use following exports inside the app)
// Create a router and assign it as the singleton instance.
// This is used in client side when we are initilizing the app.
// This should **not** use inside the server.


var createRouter = function createRouter() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  singletonRouter.router = new _router2.default(...args);
  singletonRouter.readyCallbacks.forEach(cb => cb());
  singletonRouter.readyCallbacks = [];
  return singletonRouter.router;
}; // This function is used to create the `withRouter` router instance


exports.createRouter = createRouter;

function makePublicRouterInstance(router) {
  var _router = router;
  var instance = {};

  for (var property of urlPropertyFields) {
    if (typeof _router[property] === 'object') {
      instance[property] = Object.assign({}, _router[property]); // makes sure query is not stateful

      continue;
    }

    instance[property] = _router[property];
  } // Events is a static property on the router, the router doesn't have to be initialized to use it


  instance.events = _router2.default.events;
  coreMethodFields.forEach(field => {
    instance[field] = function () {
      return _router[field](...arguments);
    };
  });
  return instance;
}

/***/ }),

/***/ "./node_modules/next/dist/client/with-router.js":
/*!******************************************************!*\
  !*** ./node_modules/next/dist/client/with-router.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _interopRequireDefault = __webpack_require__(/*! @babel/runtime/helpers/interopRequireDefault */ "./node_modules/next/node_modules/@babel/runtime/helpers/interopRequireDefault.js");

exports.__esModule = true;
exports.default = withRouter;

var _react = _interopRequireDefault(__webpack_require__(/*! react */ "react"));

var _router = __webpack_require__(/*! ./router */ "./node_modules/next/dist/client/router.js");

function withRouter(ComposedComponent) {
  function WithRouterWrapper(props) {
    return _react.default.createElement(ComposedComponent, Object.assign({
      router: (0, _router.useRouter)()
    }, props));
  }

  WithRouterWrapper.getInitialProps = ComposedComponent.getInitialProps // This is needed to allow checking for custom getInitialProps in _app
  ;
  WithRouterWrapper.origGetInitialProps = ComposedComponent.origGetInitialProps;

  if (true) {
    var name = ComposedComponent.displayName || ComposedComponent.name || 'Unknown';
    WithRouterWrapper.displayName = "withRouter(" + name + ")";
  }

  return WithRouterWrapper;
}

/***/ }),

/***/ "./node_modules/next/dist/next-server/lib/mitt.js":
/*!********************************************************!*\
  !*** ./node_modules/next/dist/next-server/lib/mitt.js ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
MIT License

Copyright (c) Jason Miller (https://jasonformat.com/)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

Object.defineProperty(exports, "__esModule", {
  value: true
});

function mitt() {
  const all = Object.create(null);
  return {
    on(type, handler) {
      ;
      (all[type] || (all[type] = [])).push(handler);
    },

    off(type, handler) {
      if (all[type]) {
        // tslint:disable-next-line:no-bitwise
        all[type].splice(all[type].indexOf(handler) >>> 0, 1);
      }
    },

    emit(type, ...evts) {
      // eslint-disable-next-line array-callback-return
      ;
      (all[type] || []).slice().map(handler => {
        handler(...evts);
      });
    }

  };
}

exports.default = mitt;

/***/ }),

/***/ "./node_modules/next/dist/next-server/lib/router/router.js":
/*!*****************************************************************!*\
  !*** ./node_modules/next/dist/next-server/lib/router/router.js ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};

Object.defineProperty(exports, "__esModule", {
  value: true
});

const url_1 = __webpack_require__(/*! url */ "url");

const mitt_1 = __importDefault(__webpack_require__(/*! ../mitt */ "./node_modules/next/dist/next-server/lib/mitt.js"));

const utils_1 = __webpack_require__(/*! ../utils */ "./node_modules/next/dist/next-server/lib/utils.js");

const is_dynamic_1 = __webpack_require__(/*! ./utils/is-dynamic */ "./node_modules/next/dist/next-server/lib/router/utils/is-dynamic.js");

const route_matcher_1 = __webpack_require__(/*! ./utils/route-matcher */ "./node_modules/next/dist/next-server/lib/router/utils/route-matcher.js");

const route_regex_1 = __webpack_require__(/*! ./utils/route-regex */ "./node_modules/next/dist/next-server/lib/router/utils/route-regex.js");

const basePath =  false || '';

function addBasePath(path) {
  return path.indexOf(basePath) !== 0 ? basePath + path : path;
}

exports.addBasePath = addBasePath;

function delBasePath(path) {
  return path.indexOf(basePath) === 0 ? path.substr(basePath.length) || '/' : path;
}

exports.delBasePath = delBasePath;

function toRoute(path) {
  return path.replace(/\/$/, '') || '/';
}

const prepareRoute = path => toRoute(!path || path === '/' ? '/index' : path);

function fetchNextData(pathname, query, isServerRender, cb) {
  let attempts = isServerRender ? 3 : 1;

  function getResponse() {
    return fetch(utils_1.formatWithValidation({
      pathname: addBasePath( // @ts-ignore __NEXT_DATA__
      `/_next/data/${__NEXT_DATA__.buildId}${delBasePath(pathname)}.json`),
      query
    }), {
      // Cookies are required to be present for Next.js' SSG "Preview Mode".
      // Cookies may also be required for `getServerSideProps`.
      //
      // > `fetch` won’t send cookies, unless you set the credentials init
      // > option.
      // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
      //
      // > For maximum browser compatibility when it comes to sending &
      // > receiving cookies, always supply the `credentials: 'same-origin'`
      // > option instead of relying on the default.
      // https://github.com/github/fetch#caveats
      credentials: 'same-origin'
    }).then(res => {
      if (!res.ok) {
        if (--attempts > 0 && res.status >= 500) {
          return getResponse();
        }

        throw new Error(`Failed to load static props`);
      }

      return res.json();
    });
  }

  return getResponse().then(data => {
    return cb ? cb(data) : data;
  }).catch(err => {
    // We should only trigger a server-side transition if this was caused
    // on a client-side transition. Otherwise, we'd get into an infinite
    // loop.
    if (!isServerRender) {
      ;
      err.code = 'PAGE_LOAD_ERROR';
    }

    throw err;
  });
}

class Router {
  constructor(pathname, query, as, {
    initialProps,
    pageLoader,
    App,
    wrapApp,
    Component,
    err,
    subscription,
    isFallback
  }) {
    // Static Data Cache
    this.sdc = {};

    this.onPopState = e => {
      if (!e.state) {
        // We get state as undefined for two reasons.
        //  1. With older safari (< 8) and older chrome (< 34)
        //  2. When the URL changed with #
        //
        // In the both cases, we don't need to proceed and change the route.
        // (as it's already changed)
        // But we can simply replace the state with the new changes.
        // Actually, for (1) we don't need to nothing. But it's hard to detect that event.
        // So, doing the following for (1) does no harm.
        const {
          pathname,
          query
        } = this;
        this.changeState('replaceState', utils_1.formatWithValidation({
          pathname,
          query
        }), utils_1.getURL());
        return;
      } // Make sure we don't re-render on initial load,
      // can be caused by navigating back from an external site


      if (e.state && this.isSsr && e.state.as === this.asPath && url_1.parse(e.state.url).pathname === this.pathname) {
        return;
      } // If the downstream application returns falsy, return.
      // They will then be responsible for handling the event.


      if (this._bps && !this._bps(e.state)) {
        return;
      }

      const {
        url,
        as,
        options
      } = e.state;

      if (true) {
        if (typeof url === 'undefined' || typeof as === 'undefined') {
          console.warn('`popstate` event triggered but `event.state` did not have `url` or `as` https://err.sh/zeit/next.js/popstate-state-empty');
        }
      }

      this.replace(url, as, options);
    };

    this._getStaticData = asPath => {
      const pathname = prepareRoute(url_1.parse(asPath).pathname);
      return  false ? undefined : fetchNextData(pathname, null, this.isSsr, data => this.sdc[pathname] = data);
    };

    this._getServerData = asPath => {
      let {
        pathname,
        query
      } = url_1.parse(asPath, true);
      pathname = prepareRoute(pathname);
      return fetchNextData(pathname, query, this.isSsr);
    }; // represents the current component key


    this.route = toRoute(pathname); // set up the component cache (by route keys)

    this.components = {}; // We should not keep the cache, if there's an error
    // Otherwise, this cause issues when when going back and
    // come again to the errored page.

    if (pathname !== '/_error') {
      this.components[this.route] = {
        Component,
        props: initialProps,
        err,
        __N_SSG: initialProps && initialProps.__N_SSG,
        __N_SSP: initialProps && initialProps.__N_SSP
      };
    }

    this.components['/_app'] = {
      Component: App
    }; // Backwards compat for Router.router.events
    // TODO: Should be remove the following major version as it was never documented

    this.events = Router.events;
    this.pageLoader = pageLoader;
    this.pathname = pathname;
    this.query = query; // if auto prerendered and dynamic route wait to update asPath
    // until after mount to prevent hydration mismatch

    this.asPath = // @ts-ignore this is temporarily global (attached to window)
    is_dynamic_1.isDynamicRoute(pathname) && __NEXT_DATA__.autoExport ? pathname : as;
    this.basePath = basePath;
    this.sub = subscription;
    this.clc = null;
    this._wrapApp = wrapApp; // make sure to ignore extra popState in safari on navigating
    // back from external site

    this.isSsr = true;
    this.isFallback = isFallback;

    if (false) {}
  } // @deprecated backwards compatibility even though it's a private method.


  static _rewriteUrlForNextExport(url) {
    if (false) {} else {
      return url;
    }
  }

  update(route, mod) {
    const Component = mod.default || mod;
    const data = this.components[route];

    if (!data) {
      throw new Error(`Cannot update unavailable route: ${route}`);
    }

    const newData = Object.assign(Object.assign({}, data), {
      Component,
      __N_SSG: mod.__N_SSG,
      __N_SSP: mod.__N_SSP
    });
    this.components[route] = newData; // pages/_app.js updated

    if (route === '/_app') {
      this.notify(this.components[this.route]);
      return;
    }

    if (route === this.route) {
      this.notify(newData);
    }
  }

  reload() {
    window.location.reload();
  }
  /**
   * Go back in history
   */


  back() {
    window.history.back();
  }
  /**
   * Performs a `pushState` with arguments
   * @param url of the route
   * @param as masks `url` for the browser
   * @param options object you can define `shallow` and other options
   */


  push(url, as = url, options = {}) {
    return this.change('pushState', url, as, options);
  }
  /**
   * Performs a `replaceState` with arguments
   * @param url of the route
   * @param as masks `url` for the browser
   * @param options object you can define `shallow` and other options
   */


  replace(url, as = url, options = {}) {
    return this.change('replaceState', url, as, options);
  }

  change(method, _url, _as, options) {
    return new Promise((resolve, reject) => {
      if (!options._h) {
        this.isSsr = false;
      } // marking route changes as a navigation start entry


      if (utils_1.ST) {
        performance.mark('routeChange');
      } // If url and as provided as an object representation,
      // we'll format them into the string version here.


      let url = typeof _url === 'object' ? utils_1.formatWithValidation(_url) : _url;
      let as = typeof _as === 'object' ? utils_1.formatWithValidation(_as) : _as;
      url = addBasePath(url);
      as = addBasePath(as); // Add the ending slash to the paths. So, we can serve the
      // "<page>/index.html" directly for the SSR page.

      if (false) {}

      this.abortComponentLoad(as); // If the url change is only related to a hash change
      // We should not proceed. We should only change the state.
      // WARNING: `_h` is an internal option for handing Next.js client-side
      // hydration. Your app should _never_ use this property. It may change at
      // any time without notice.

      if (!options._h && this.onlyAHashChange(as)) {
        this.asPath = as;
        Router.events.emit('hashChangeStart', as);
        this.changeState(method, url, as, options);
        this.scrollToHash(as);
        Router.events.emit('hashChangeComplete', as);
        return resolve(true);
      }

      const {
        pathname,
        query,
        protocol
      } = url_1.parse(url, true);

      if (!pathname || protocol) {
        if (true) {
          throw new Error(`Invalid href passed to router: ${url} https://err.sh/zeit/next.js/invalid-href-passed`);
        }

        return resolve(false);
      } // If asked to change the current URL we should reload the current page
      // (not location.reload() but reload getInitialProps and other Next.js stuffs)
      // We also need to set the method = replaceState always
      // as this should not go into the history (That's how browsers work)
      // We should compare the new asPath to the current asPath, not the url


      if (!this.urlIsNew(as)) {
        method = 'replaceState';
      }

      const route = toRoute(pathname);
      const {
        shallow = false
      } = options;

      if (is_dynamic_1.isDynamicRoute(route)) {
        const {
          pathname: asPathname
        } = url_1.parse(as);
        const routeRegex = route_regex_1.getRouteRegex(route);
        const routeMatch = route_matcher_1.getRouteMatcher(routeRegex)(asPathname);

        if (!routeMatch) {
          const missingParams = Object.keys(routeRegex.groups).filter(param => !query[param]);

          if (missingParams.length > 0) {
            if (true) {
              console.warn(`Mismatching \`as\` and \`href\` failed to manually provide ` + `the params: ${missingParams.join(', ')} in the \`href\`'s \`query\``);
            }

            return reject(new Error(`The provided \`as\` value (${asPathname}) is incompatible with the \`href\` value (${route}). ` + `Read more: https://err.sh/zeit/next.js/incompatible-href-as`));
          }
        } else {
          // Merge params into `query`, overwriting any specified in search
          Object.assign(query, routeMatch);
        }
      }

      Router.events.emit('routeChangeStart', as); // If shallow is true and the route exists in the router cache we reuse the previous result

      this.getRouteInfo(route, pathname, query, as, shallow).then(routeInfo => {
        const {
          error
        } = routeInfo;

        if (error && error.cancelled) {
          return resolve(false);
        }

        Router.events.emit('beforeHistoryChange', as);
        this.changeState(method, url, as, options);

        if (true) {
          const appComp = this.components['/_app'].Component;
          window.next.isPrerendered = appComp.getInitialProps === appComp.origGetInitialProps && !routeInfo.Component.getInitialProps;
        }

        this.set(route, pathname, query, as, routeInfo);

        if (error) {
          Router.events.emit('routeChangeError', error, as);
          throw error;
        }

        Router.events.emit('routeChangeComplete', as);
        return resolve(true);
      }, reject);
    });
  }

  changeState(method, url, as, options = {}) {
    if (true) {
      if (typeof window.history === 'undefined') {
        console.error(`Warning: window.history is not available.`);
        return;
      }

      if (typeof window.history[method] === 'undefined') {
        console.error(`Warning: window.history.${method} is not available`);
        return;
      }
    }

    if (method !== 'pushState' || utils_1.getURL() !== as) {
      window.history[method]({
        url,
        as,
        options
      }, // Most browsers currently ignores this parameter, although they may use it in the future.
      // Passing the empty string here should be safe against future changes to the method.
      // https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState
      '', as);
    }
  }

  getRouteInfo(route, pathname, query, as, shallow = false) {
    const cachedRouteInfo = this.components[route]; // If there is a shallow route transition possible
    // If the route is already rendered on the screen.

    if (shallow && cachedRouteInfo && this.route === route) {
      return Promise.resolve(cachedRouteInfo);
    }

    const handleError = (err, loadErrorFail) => {
      return new Promise(resolve => {
        if (err.code === 'PAGE_LOAD_ERROR' || loadErrorFail) {
          // If we can't load the page it could be one of following reasons
          //  1. Page doesn't exists
          //  2. Page does exist in a different zone
          //  3. Internal error while loading the page
          // So, doing a hard reload is the proper way to deal with this.
          window.location.href = as; // Changing the URL doesn't block executing the current code path.
          // So, we need to mark it as a cancelled error and stop the routing logic.

          err.cancelled = true; // @ts-ignore TODO: fix the control flow here

          return resolve({
            error: err
          });
        }

        if (err.cancelled) {
          // @ts-ignore TODO: fix the control flow here
          return resolve({
            error: err
          });
        }

        resolve(this.fetchComponent('/_error').then(res => {
          const {
            page: Component
          } = res;
          const routeInfo = {
            Component,
            err
          };
          return new Promise(resolve => {
            this.getInitialProps(Component, {
              err,
              pathname,
              query
            }).then(props => {
              routeInfo.props = props;
              routeInfo.error = err;
              resolve(routeInfo);
            }, gipErr => {
              console.error('Error in error page `getInitialProps`: ', gipErr);
              routeInfo.error = err;
              routeInfo.props = {};
              resolve(routeInfo);
            });
          });
        }).catch(err => handleError(err, true)));
      });
    };

    return new Promise((resolve, reject) => {
      if (cachedRouteInfo) {
        return resolve(cachedRouteInfo);
      }

      this.fetchComponent(route).then(res => resolve({
        Component: res.page,
        __N_SSG: res.mod.__N_SSG,
        __N_SSP: res.mod.__N_SSP
      }), reject);
    }).then(routeInfo => {
      const {
        Component,
        __N_SSG,
        __N_SSP
      } = routeInfo;

      if (true) {
        const {
          isValidElementType
        } = __webpack_require__(/*! react-is */ "./node_modules/next/node_modules/react-is/index.js");

        if (!isValidElementType(Component)) {
          throw new Error(`The default export is not a React Component in page: "${pathname}"`);
        }
      }

      return this._getData(() => __N_SSG ? this._getStaticData(as) : __N_SSP ? this._getServerData(as) : this.getInitialProps(Component, // we provide AppTree later so this needs to be `any`
      {
        pathname,
        query,
        asPath: as
      })).then(props => {
        routeInfo.props = props;
        this.components[route] = routeInfo;
        return routeInfo;
      });
    }).catch(handleError);
  }

  set(route, pathname, query, as, data) {
    this.isFallback = false;
    this.route = route;
    this.pathname = pathname;
    this.query = query;
    this.asPath = as;
    this.notify(data);
  }
  /**
   * Callback to execute before replacing router state
   * @param cb callback to be executed
   */


  beforePopState(cb) {
    this._bps = cb;
  }

  onlyAHashChange(as) {
    if (!this.asPath) return false;
    const [oldUrlNoHash, oldHash] = this.asPath.split('#');
    const [newUrlNoHash, newHash] = as.split('#'); // Makes sure we scroll to the provided hash if the url/hash are the same

    if (newHash && oldUrlNoHash === newUrlNoHash && oldHash === newHash) {
      return true;
    } // If the urls are change, there's more than a hash change


    if (oldUrlNoHash !== newUrlNoHash) {
      return false;
    } // If the hash has changed, then it's a hash only change.
    // This check is necessary to handle both the enter and
    // leave hash === '' cases. The identity case falls through
    // and is treated as a next reload.


    return oldHash !== newHash;
  }

  scrollToHash(as) {
    const [, hash] = as.split('#'); // Scroll to top if the hash is just `#` with no value

    if (hash === '') {
      window.scrollTo(0, 0);
      return;
    } // First we check if the element by id is found


    const idEl = document.getElementById(hash);

    if (idEl) {
      idEl.scrollIntoView();
      return;
    } // If there's no element with the id, we check the `name` property
    // To mirror browsers


    const nameEl = document.getElementsByName(hash)[0];

    if (nameEl) {
      nameEl.scrollIntoView();
    }
  }

  urlIsNew(asPath) {
    return this.asPath !== asPath;
  }
  /**
   * Prefetch page code, you may wait for the data during page rendering.
   * This feature only works in production!
   * @param url the href of prefetched page
   * @param asPath the as path of the prefetched page
   */


  prefetch(url, asPath = url, options = {}) {
    return new Promise((resolve, reject) => {
      const {
        pathname,
        protocol
      } = url_1.parse(url);

      if (!pathname || protocol) {
        if (true) {
          throw new Error(`Invalid href passed to router: ${url} https://err.sh/zeit/next.js/invalid-href-passed`);
        }

        return;
      } // Prefetch is not supported in development mode because it would trigger on-demand-entries


      if (true) {
        return;
      }

      const route = delBasePath(toRoute(pathname));
      Promise.all([this.pageLoader.prefetchData(url, delBasePath(asPath)), this.pageLoader[options.priority ? 'loadPage' : 'prefetch'](route)]).then(() => resolve(), reject);
    });
  }

  async fetchComponent(route) {
    let cancelled = false;

    const cancel = this.clc = () => {
      cancelled = true;
    };

    route = delBasePath(route);
    const componentResult = await this.pageLoader.loadPage(route);

    if (cancelled) {
      const error = new Error(`Abort fetching component for route: "${route}"`);
      error.cancelled = true;
      throw error;
    }

    if (cancel === this.clc) {
      this.clc = null;
    }

    return componentResult;
  }

  _getData(fn) {
    let cancelled = false;

    const cancel = () => {
      cancelled = true;
    };

    this.clc = cancel;
    return fn().then(data => {
      if (cancel === this.clc) {
        this.clc = null;
      }

      if (cancelled) {
        const err = new Error('Loading initial props cancelled');
        err.cancelled = true;
        throw err;
      }

      return data;
    });
  }

  getInitialProps(Component, ctx) {
    const {
      Component: App
    } = this.components['/_app'];

    const AppTree = this._wrapApp(App);

    ctx.AppTree = AppTree;
    return utils_1.loadGetInitialProps(App, {
      AppTree,
      Component,
      router: this,
      ctx
    });
  }

  abortComponentLoad(as) {
    if (this.clc) {
      const e = new Error('Route Cancelled');
      e.cancelled = true;
      Router.events.emit('routeChangeError', e, as);
      this.clc();
      this.clc = null;
    }
  }

  notify(data) {
    this.sub(data, this.components['/_app'].Component);
  }

}

exports.default = Router;
Router.events = mitt_1.default();

/***/ }),

/***/ "./node_modules/next/dist/next-server/lib/router/utils/is-dynamic.js":
/*!***************************************************************************!*\
  !*** ./node_modules/next/dist/next-server/lib/router/utils/is-dynamic.js ***!
  \***************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
}); // Identify /[param]/ in route string

const TEST_ROUTE = /\/\[[^/]+?\](?=\/|$)/;

function isDynamicRoute(route) {
  return TEST_ROUTE.test(route);
}

exports.isDynamicRoute = isDynamicRoute;

/***/ }),

/***/ "./node_modules/next/dist/next-server/lib/router/utils/route-matcher.js":
/*!******************************************************************************!*\
  !*** ./node_modules/next/dist/next-server/lib/router/utils/route-matcher.js ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

function getRouteMatcher(routeRegex) {
  const {
    re,
    groups
  } = routeRegex;
  return pathname => {
    const routeMatch = re.exec(pathname);

    if (!routeMatch) {
      return false;
    }

    const decode = param => {
      try {
        return decodeURIComponent(param);
      } catch (_) {
        const err = new Error('failed to decode param');
        err.code = 'DECODE_FAILED';
        throw err;
      }
    };

    const params = {};
    Object.keys(groups).forEach(slugName => {
      const g = groups[slugName];
      const m = routeMatch[g.pos];

      if (m !== undefined) {
        params[slugName] = ~m.indexOf('/') ? m.split('/').map(entry => decode(entry)) : g.repeat ? [decode(m)] : decode(m);
      }
    });
    return params;
  };
}

exports.getRouteMatcher = getRouteMatcher;

/***/ }),

/***/ "./node_modules/next/dist/next-server/lib/router/utils/route-regex.js":
/*!****************************************************************************!*\
  !*** ./node_modules/next/dist/next-server/lib/router/utils/route-regex.js ***!
  \****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
}); // this isn't importing the escape-string-regex module
// to reduce bytes

function escapeRegex(str) {
  return str.replace(/[|\\{}()[\]^$+*?.-]/g, '\\$&');
}

function getRouteRegex(normalizedRoute) {
  // Escape all characters that could be considered RegEx
  const escapedRoute = escapeRegex(normalizedRoute.replace(/\/$/, '') || '/');
  const groups = {};
  let groupIndex = 1;
  const parameterizedRoute = escapedRoute.replace(/\/\\\[([^/]+?)\\\](?=\/|$)/g, (_, $1) => {
    const isCatchAll = /^(\\\.){3}/.test($1);
    groups[$1 // Un-escape key
    .replace(/\\([|\\{}()[\]^$+*?.-])/g, '$1').replace(/^\.{3}/, '') // eslint-disable-next-line no-sequences
    ] = {
      pos: groupIndex++,
      repeat: isCatchAll
    };
    return isCatchAll ? '/(.+?)' : '/([^/]+?)';
  });
  let namedParameterizedRoute; // dead code eliminate for browser since it's only needed
  // while generating routes-manifest

  if (true) {
    namedParameterizedRoute = escapedRoute.replace(/\/\\\[([^/]+?)\\\](?=\/|$)/g, (_, $1) => {
      const isCatchAll = /^(\\\.){3}/.test($1);
      const key = $1 // Un-escape key
      .replace(/\\([|\\{}()[\]^$+*?.-])/g, '$1').replace(/^\.{3}/, '');
      return isCatchAll ? `/(?<${escapeRegex(key)}>.+?)` : `/(?<${escapeRegex(key)}>[^/]+?)`;
    });
  }

  return Object.assign({
    re: new RegExp('^' + parameterizedRoute + '(?:/)?$', 'i'),
    groups
  }, namedParameterizedRoute ? {
    namedRegex: `^${namedParameterizedRoute}(?:/)?$`
  } : {});
}

exports.getRouteRegex = getRouteRegex;

/***/ }),

/***/ "./node_modules/next/dist/next-server/lib/utils.js":
/*!*********************************************************!*\
  !*** ./node_modules/next/dist/next-server/lib/utils.js ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

const url_1 = __webpack_require__(/*! url */ "url");
/**
 * Utils
 */


function execOnce(fn) {
  let used = false;
  let result;
  return (...args) => {
    if (!used) {
      used = true;
      result = fn(...args);
    }

    return result;
  };
}

exports.execOnce = execOnce;

function getLocationOrigin() {
  const {
    protocol,
    hostname,
    port
  } = window.location;
  return `${protocol}//${hostname}${port ? ':' + port : ''}`;
}

exports.getLocationOrigin = getLocationOrigin;

function getURL() {
  const {
    href
  } = window.location;
  const origin = getLocationOrigin();
  return href.substring(origin.length);
}

exports.getURL = getURL;

function getDisplayName(Component) {
  return typeof Component === 'string' ? Component : Component.displayName || Component.name || 'Unknown';
}

exports.getDisplayName = getDisplayName;

function isResSent(res) {
  return res.finished || res.headersSent;
}

exports.isResSent = isResSent;

async function loadGetInitialProps(App, ctx) {
  var _a;

  if (true) {
    if ((_a = App.prototype) === null || _a === void 0 ? void 0 : _a.getInitialProps) {
      const message = `"${getDisplayName(App)}.getInitialProps()" is defined as an instance method - visit https://err.sh/zeit/next.js/get-initial-props-as-an-instance-method for more information.`;
      throw new Error(message);
    }
  } // when called from _app `ctx` is nested in `ctx`


  const res = ctx.res || ctx.ctx && ctx.ctx.res;

  if (!App.getInitialProps) {
    if (ctx.ctx && ctx.Component) {
      // @ts-ignore pageProps default
      return {
        pageProps: await loadGetInitialProps(ctx.Component, ctx.ctx)
      };
    }

    return {};
  }

  const props = await App.getInitialProps(ctx);

  if (res && isResSent(res)) {
    return props;
  }

  if (!props) {
    const message = `"${getDisplayName(App)}.getInitialProps()" should resolve to an object. But found "${props}" instead.`;
    throw new Error(message);
  }

  if (true) {
    if (Object.keys(props).length === 0 && !ctx.ctx) {
      console.warn(`${getDisplayName(App)} returned an empty object from \`getInitialProps\`. This de-optimizes and prevents automatic static optimization. https://err.sh/zeit/next.js/empty-object-getInitialProps`);
    }
  }

  return props;
}

exports.loadGetInitialProps = loadGetInitialProps;
exports.urlObjectKeys = ['auth', 'hash', 'host', 'hostname', 'href', 'path', 'pathname', 'port', 'protocol', 'query', 'search', 'slashes'];

function formatWithValidation(url, options) {
  if (true) {
    if (url !== null && typeof url === 'object') {
      Object.keys(url).forEach(key => {
        if (exports.urlObjectKeys.indexOf(key) === -1) {
          console.warn(`Unknown key passed via urlObject into url.format: ${key}`);
        }
      });
    }
  }

  return url_1.format(url, options);
}

exports.formatWithValidation = formatWithValidation;
exports.SP = typeof performance !== 'undefined';
exports.ST = exports.SP && typeof performance.mark === 'function' && typeof performance.measure === 'function';

/***/ }),

/***/ "./node_modules/next/link.js":
/*!***********************************!*\
  !*** ./node_modules/next/link.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! ./dist/client/link */ "./node_modules/next/dist/client/link.js")


/***/ }),

/***/ "./node_modules/next/node_modules/@babel/runtime/helpers/interopRequireDefault.js":
/*!****************************************************************************************!*\
  !*** ./node_modules/next/node_modules/@babel/runtime/helpers/interopRequireDefault.js ***!
  \****************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;

/***/ }),

/***/ "./node_modules/next/node_modules/@babel/runtime/helpers/interopRequireWildcard.js":
/*!*****************************************************************************************!*\
  !*** ./node_modules/next/node_modules/@babel/runtime/helpers/interopRequireWildcard.js ***!
  \*****************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var _typeof = __webpack_require__(/*! ../helpers/typeof */ "./node_modules/next/node_modules/@babel/runtime/helpers/typeof.js");

function _getRequireWildcardCache() {
  if (typeof WeakMap !== "function") return null;
  var cache = new WeakMap();

  _getRequireWildcardCache = function _getRequireWildcardCache() {
    return cache;
  };

  return cache;
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }

  if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") {
    return {
      "default": obj
    };
  }

  var cache = _getRequireWildcardCache();

  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }

  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;

  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;

      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }

  newObj["default"] = obj;

  if (cache) {
    cache.set(obj, newObj);
  }

  return newObj;
}

module.exports = _interopRequireWildcard;

/***/ }),

/***/ "./node_modules/next/node_modules/@babel/runtime/helpers/typeof.js":
/*!*************************************************************************!*\
  !*** ./node_modules/next/node_modules/@babel/runtime/helpers/typeof.js ***!
  \*************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

function _typeof(obj) {
  if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return _typeof2(obj);
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
    };
  }

  return _typeof(obj);
}

module.exports = _typeof;

/***/ }),

/***/ "./node_modules/next/node_modules/react-is/cjs/react-is.development.js":
/*!*****************************************************************************!*\
  !*** ./node_modules/next/node_modules/react-is/cjs/react-is.development.js ***!
  \*****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/** @license React v16.8.6
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */





if (true) {
  (function() {
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// The Symbol used to tag the ReactElement-like types. If there is no native Symbol
// nor polyfill, then a plain number is used for performance.
var hasSymbol = typeof Symbol === 'function' && Symbol.for;

var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for('react.element') : 0xeac7;
var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for('react.portal') : 0xeaca;
var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for('react.fragment') : 0xeacb;
var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for('react.strict_mode') : 0xeacc;
var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for('react.profiler') : 0xead2;
var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for('react.provider') : 0xeacd;
var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for('react.context') : 0xeace;
var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for('react.async_mode') : 0xeacf;
var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for('react.concurrent_mode') : 0xeacf;
var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for('react.forward_ref') : 0xead0;
var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for('react.suspense') : 0xead1;
var REACT_MEMO_TYPE = hasSymbol ? Symbol.for('react.memo') : 0xead3;
var REACT_LAZY_TYPE = hasSymbol ? Symbol.for('react.lazy') : 0xead4;

function isValidElementType(type) {
  return typeof type === 'string' || typeof type === 'function' ||
  // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
  type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || typeof type === 'object' && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE);
}

/**
 * Forked from fbjs/warning:
 * https://github.com/facebook/fbjs/blob/e66ba20ad5be433eb54423f2b097d829324d9de6/packages/fbjs/src/__forks__/warning.js
 *
 * Only change is we use console.warn instead of console.error,
 * and do nothing when 'console' is not supported.
 * This really simplifies the code.
 * ---
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var lowPriorityWarning = function () {};

{
  var printWarning = function (format) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var argIndex = 0;
    var message = 'Warning: ' + format.replace(/%s/g, function () {
      return args[argIndex++];
    });
    if (typeof console !== 'undefined') {
      console.warn(message);
    }
    try {
      // --- Welcome to debugging React ---
      // This error was thrown as a convenience so that you can use this stack
      // to find the callsite that caused this warning to fire.
      throw new Error(message);
    } catch (x) {}
  };

  lowPriorityWarning = function (condition, format) {
    if (format === undefined) {
      throw new Error('`lowPriorityWarning(condition, format, ...args)` requires a warning ' + 'message argument');
    }
    if (!condition) {
      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      printWarning.apply(undefined, [format].concat(args));
    }
  };
}

var lowPriorityWarning$1 = lowPriorityWarning;

function typeOf(object) {
  if (typeof object === 'object' && object !== null) {
    var $$typeof = object.$$typeof;
    switch ($$typeof) {
      case REACT_ELEMENT_TYPE:
        var type = object.type;

        switch (type) {
          case REACT_ASYNC_MODE_TYPE:
          case REACT_CONCURRENT_MODE_TYPE:
          case REACT_FRAGMENT_TYPE:
          case REACT_PROFILER_TYPE:
          case REACT_STRICT_MODE_TYPE:
          case REACT_SUSPENSE_TYPE:
            return type;
          default:
            var $$typeofType = type && type.$$typeof;

            switch ($$typeofType) {
              case REACT_CONTEXT_TYPE:
              case REACT_FORWARD_REF_TYPE:
              case REACT_PROVIDER_TYPE:
                return $$typeofType;
              default:
                return $$typeof;
            }
        }
      case REACT_LAZY_TYPE:
      case REACT_MEMO_TYPE:
      case REACT_PORTAL_TYPE:
        return $$typeof;
    }
  }

  return undefined;
}

// AsyncMode is deprecated along with isAsyncMode
var AsyncMode = REACT_ASYNC_MODE_TYPE;
var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
var ContextConsumer = REACT_CONTEXT_TYPE;
var ContextProvider = REACT_PROVIDER_TYPE;
var Element = REACT_ELEMENT_TYPE;
var ForwardRef = REACT_FORWARD_REF_TYPE;
var Fragment = REACT_FRAGMENT_TYPE;
var Lazy = REACT_LAZY_TYPE;
var Memo = REACT_MEMO_TYPE;
var Portal = REACT_PORTAL_TYPE;
var Profiler = REACT_PROFILER_TYPE;
var StrictMode = REACT_STRICT_MODE_TYPE;
var Suspense = REACT_SUSPENSE_TYPE;

var hasWarnedAboutDeprecatedIsAsyncMode = false;

// AsyncMode should be deprecated
function isAsyncMode(object) {
  {
    if (!hasWarnedAboutDeprecatedIsAsyncMode) {
      hasWarnedAboutDeprecatedIsAsyncMode = true;
      lowPriorityWarning$1(false, 'The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 17+. Update your code to use ' + 'ReactIs.isConcurrentMode() instead. It has the exact same API.');
    }
  }
  return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
}
function isConcurrentMode(object) {
  return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
}
function isContextConsumer(object) {
  return typeOf(object) === REACT_CONTEXT_TYPE;
}
function isContextProvider(object) {
  return typeOf(object) === REACT_PROVIDER_TYPE;
}
function isElement(object) {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
}
function isForwardRef(object) {
  return typeOf(object) === REACT_FORWARD_REF_TYPE;
}
function isFragment(object) {
  return typeOf(object) === REACT_FRAGMENT_TYPE;
}
function isLazy(object) {
  return typeOf(object) === REACT_LAZY_TYPE;
}
function isMemo(object) {
  return typeOf(object) === REACT_MEMO_TYPE;
}
function isPortal(object) {
  return typeOf(object) === REACT_PORTAL_TYPE;
}
function isProfiler(object) {
  return typeOf(object) === REACT_PROFILER_TYPE;
}
function isStrictMode(object) {
  return typeOf(object) === REACT_STRICT_MODE_TYPE;
}
function isSuspense(object) {
  return typeOf(object) === REACT_SUSPENSE_TYPE;
}

exports.typeOf = typeOf;
exports.AsyncMode = AsyncMode;
exports.ConcurrentMode = ConcurrentMode;
exports.ContextConsumer = ContextConsumer;
exports.ContextProvider = ContextProvider;
exports.Element = Element;
exports.ForwardRef = ForwardRef;
exports.Fragment = Fragment;
exports.Lazy = Lazy;
exports.Memo = Memo;
exports.Portal = Portal;
exports.Profiler = Profiler;
exports.StrictMode = StrictMode;
exports.Suspense = Suspense;
exports.isValidElementType = isValidElementType;
exports.isAsyncMode = isAsyncMode;
exports.isConcurrentMode = isConcurrentMode;
exports.isContextConsumer = isContextConsumer;
exports.isContextProvider = isContextProvider;
exports.isElement = isElement;
exports.isForwardRef = isForwardRef;
exports.isFragment = isFragment;
exports.isLazy = isLazy;
exports.isMemo = isMemo;
exports.isPortal = isPortal;
exports.isProfiler = isProfiler;
exports.isStrictMode = isStrictMode;
exports.isSuspense = isSuspense;
  })();
}


/***/ }),

/***/ "./node_modules/next/node_modules/react-is/index.js":
/*!**********************************************************!*\
  !*** ./node_modules/next/node_modules/react-is/index.js ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


if (false) {} else {
  module.exports = __webpack_require__(/*! ./cjs/react-is.development.js */ "./node_modules/next/node_modules/react-is/cjs/react-is.development.js");
}


/***/ }),

/***/ "./pages/index.js":
/*!************************!*\
  !*** ./pages/index.js ***!
  \************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @emotion/styled-base */ "@emotion/styled-base");
/* harmony import */ var _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_emotion_styled_base__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! react */ "react");
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/link */ "./node_modules/next/link.js");
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var components__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! components */ "./components/index.js");
/* harmony import */ var components_Page__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! components/Page */ "./components/Page.jsx");
/* harmony import */ var styles__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! styles */ "./styles/index.js");
/* harmony import */ var constants_pages__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! constants/pages */ "./constants/pages.js");
/* harmony import */ var _pages_home__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! _pages/home */ "./_pages/home/index.js");
/* harmony import */ var _emotion_core__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @emotion/core */ "@emotion/core");
/* harmony import */ var _emotion_core__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(_emotion_core__WEBPACK_IMPORTED_MODULE_8__);

var _jsxFileName = "/Users/cliftoncampbell/Development/clif.world/pages/index.js";
var __jsx = react__WEBPACK_IMPORTED_MODULE_1___default.a.createElement;









const CallToAction = _emotion_styled_base__WEBPACK_IMPORTED_MODULE_0___default()("div", {
  target: "e1s0zc7h0",
  label: "CallToAction"
})("position:relative;padding:8px 0 8px 36px;", Object(styles__WEBPACK_IMPORTED_MODULE_5__["mq"])({
  marginTop: ['120px', '96px', '62px']
}), "::after{content:'';position:absolute;left:0;top:0;height:100%;width:6px;border-radius:3px;background:", Object(styles__WEBPACK_IMPORTED_MODULE_5__["getStyle"])('ctaBackground4'), ";}", components__WEBPACK_IMPORTED_MODULE_3__["Body"], "{font-weight:300;line-height:40px;b{font-weight:400;}", Object(styles__WEBPACK_IMPORTED_MODULE_5__["mobile"])(`
      line-height: 30px;
    `), ";}" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9wYWdlcy9pbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTK0IiLCJmaWxlIjoiL1VzZXJzL2NsaWZ0b25jYW1wYmVsbC9EZXZlbG9wbWVudC9jbGlmLndvcmxkL3BhZ2VzL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBzdHlsZWQgZnJvbSAnQGVtb3Rpb24vc3R5bGVkJztcbmltcG9ydCBMaW5rIGZyb20gJ25leHQvbGluayc7XG5pbXBvcnQgeyBDb2x1bW4sIEJvZHksIEhlYWRpbmczIH0gZnJvbSAnY29tcG9uZW50cyc7XG5pbXBvcnQgUGFnZSBmcm9tICdjb21wb25lbnRzL1BhZ2UnO1xuaW1wb3J0IHsgZ2V0U3R5bGUsIG1vYmlsZSwgbXEgfSBmcm9tICdzdHlsZXMnO1xuaW1wb3J0IHsgV09SSywgUFJPSkVDVFMgfSBmcm9tICdjb25zdGFudHMvcGFnZXMnO1xuaW1wb3J0IHsgR2xvYmUgfSBmcm9tICdfcGFnZXMvaG9tZSc7XG5cbmNvbnN0IENhbGxUb0FjdGlvbiA9IHN0eWxlZC5kaXZgXG4gIHBvc2l0aW9uOiByZWxhdGl2ZTtcbiAgcGFkZGluZzogOHB4IDAgOHB4IDM2cHg7XG4gICR7bXEoe1xuICAgIG1hcmdpblRvcDogWycxMjBweCcsICc5NnB4JywgJzYycHgnXSxcbiAgfSl9XG4gIDo6YWZ0ZXIge1xuICAgIGNvbnRlbnQ6ICcnO1xuICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICBsZWZ0OiAwO1xuICAgIHRvcDogMDtcbiAgICBoZWlnaHQ6IDEwMCU7XG4gICAgd2lkdGg6IDZweDtcbiAgICBib3JkZXItcmFkaXVzOiAzcHg7XG4gICAgYmFja2dyb3VuZDogJHtnZXRTdHlsZSgnY3RhQmFja2dyb3VuZDQnKX07XG4gIH1cbiAgJHtCb2R5fSB7XG4gICAgZm9udC13ZWlnaHQ6IDMwMDtcbiAgICBsaW5lLWhlaWdodDogNDBweDtcbiAgICBiIHtcbiAgICAgIGZvbnQtd2VpZ2h0OiA0MDA7XG4gICAgfVxuICAgICR7bW9iaWxlKGBcbiAgICAgIGxpbmUtaGVpZ2h0OiAzMHB4O1xuICAgIGApfTtcbiAgfVxuYDtcblxuZXhwb3J0IGRlZmF1bHQgKCkgPT4gKFxuICA8UGFnZSByZXZlYWwgdGl0bGU9XCJIRUxMTy5cIiBCYWNrZ3JvdW5kPXs8R2xvYmUgLz59PlxuICAgIDxDb2x1bW4gYT1cImZsZXgtc3RhcnRcIiBtPVwiMjRweCAwIDAgMFwiPlxuICAgICAgPEhlYWRpbmczPlxuICAgICAgICBNeSBuYW1lIGlzIENsaWZ0b24gQ2FtcGJlbGwuXG4gICAgICAgIDxiciAvPlxuICAgICAgICA8YnIgLz5cbiAgICAgICAgSSAmIzEwMDg0OyYjNjUwMzk7XG4gICAgICAgIDxiPiBkZXNpZ25pbmc8L2I+XG4gICAgICAgIHsnIGFuZCAnfVxuICAgICAgICA8Yj5kZXZlbG9waW5nPC9iPlxuICAgICAgICB7JyB3ZWJzaXRlcy4nfVxuICAgICAgPC9IZWFkaW5nMz5cbiAgICAgIDxDYWxsVG9BY3Rpb24+XG4gICAgICAgIDxCb2R5PlxuICAgICAgICAgIENoZWNrIG91dCBteVxuICAgICAgICAgIHsnICd9XG4gICAgICAgICAgPExpbmsgaHJlZj17YC8ke1BST0pFQ1RTfWB9IHBhc3NIcmVmPlxuICAgICAgICAgICAgPGE+XG4gICAgICAgICAgICAgIDxiPnByb2plY3RzPC9iPlxuICAgICAgICAgICAgPC9hPlxuICAgICAgICAgIDwvTGluaz5cbiAgICAgICAgICA8YnIgLz5cbiAgICAgICAgICAmIG15IHdvcmtcbiAgICAgICAgICB7JyAnfVxuICAgICAgICAgIDxMaW5rIGhyZWY9e2AvJHtXT1JLfWB9IHBhc3NIcmVmPlxuICAgICAgICAgICAgPGE+XG4gICAgICAgICAgICAgIDxiPmhpc3Rvcnk8L2I+XG4gICAgICAgICAgICA8L2E+XG4gICAgICAgICAgPC9MaW5rPlxuICAgICAgICAgIC5cbiAgICAgICAgPC9Cb2R5PlxuICAgICAgPC9DYWxsVG9BY3Rpb24+XG4gICAgPC9Db2x1bW4+XG4gIDwvUGFnZT5cbik7XG4iXX0= */"));

/* harmony default export */ __webpack_exports__["default"] = (() => Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])(components_Page__WEBPACK_IMPORTED_MODULE_4__["default"], {
  reveal: true,
  title: "HELLO.",
  Background: Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])(_pages_home__WEBPACK_IMPORTED_MODULE_7__["Globe"], {
    __self: undefined,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 39,
      columnNumber: 43
    }
  }),
  __self: undefined,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 39,
    columnNumber: 3
  }
}, Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])(components__WEBPACK_IMPORTED_MODULE_3__["Column"], {
  a: "flex-start",
  m: "24px 0 0 0",
  __self: undefined,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 40,
    columnNumber: 5
  }
}, Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])(components__WEBPACK_IMPORTED_MODULE_3__["Heading3"], {
  __self: undefined,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 41,
    columnNumber: 7
  }
}, "My name is Clifton Campbell.", Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])("br", {
  __self: undefined,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 43,
    columnNumber: 9
  }
}), Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])("br", {
  __self: undefined,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 44,
    columnNumber: 9
  }
}), "I \u2764\uFE0F", Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])("b", {
  __self: undefined,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 46,
    columnNumber: 9
  }
}, " designing"), ' and ', Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])("b", {
  __self: undefined,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 48,
    columnNumber: 9
  }
}, "developing"), ' websites.'), Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])(CallToAction, {
  __self: undefined,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 51,
    columnNumber: 7
  }
}, Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])(components__WEBPACK_IMPORTED_MODULE_3__["Body"], {
  __self: undefined,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 52,
    columnNumber: 9
  }
}, "Check out my", ' ', Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])(next_link__WEBPACK_IMPORTED_MODULE_2___default.a, {
  href: `/${constants_pages__WEBPACK_IMPORTED_MODULE_6__["PROJECTS"]}`,
  passHref: true,
  __self: undefined,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 55,
    columnNumber: 11
  }
}, Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])("a", {
  __self: undefined,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 56,
    columnNumber: 13
  }
}, Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])("b", {
  __self: undefined,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 57,
    columnNumber: 15
  }
}, "projects"))), Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])("br", {
  __self: undefined,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 60,
    columnNumber: 11
  }
}), "& my work", ' ', Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])(next_link__WEBPACK_IMPORTED_MODULE_2___default.a, {
  href: `/${constants_pages__WEBPACK_IMPORTED_MODULE_6__["WORK"]}`,
  passHref: true,
  __self: undefined,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 63,
    columnNumber: 11
  }
}, Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])("a", {
  __self: undefined,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 64,
    columnNumber: 13
  }
}, Object(_emotion_core__WEBPACK_IMPORTED_MODULE_8__["jsx"])("b", {
  __self: undefined,
  __source: {
    fileName: _jsxFileName,
    lineNumber: 65,
    columnNumber: 15
  }
}, "history"))), ".")))));

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

/***/ "./styles/text.js":
/*!************************!*\
  !*** ./styles/text.js ***!
  \************************/
/*! exports provided: heading, heading2, heading3, subheader, subheader2, detail, detail2, detail3, body, body2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "heading", function() { return heading; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "heading2", function() { return heading2; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "heading3", function() { return heading3; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "subheader", function() { return subheader; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "subheader2", function() { return subheader2; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "detail", function() { return detail; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "detail2", function() { return detail2; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "detail3", function() { return detail3; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "body", function() { return body; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "body2", function() { return body2; });
/* harmony import */ var _emotion_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @emotion/core */ "@emotion/core");
/* harmony import */ var _emotion_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_emotion_core__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils */ "./styles/utils.js");
/* harmony import */ var _breakpoints__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./breakpoints */ "./styles/breakpoints.js");



const base =
/*#__PURE__*/

/*#__PURE__*/
Object(_emotion_core__WEBPACK_IMPORTED_MODULE_0__["css"])("transition:", Object(_utils__WEBPACK_IMPORTED_MODULE_1__["getStyle"])('linearHue'), ";font-weight:300;;label:base;" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9zdHlsZXMvdGV4dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJZ0IiLCJmaWxlIjoiL1VzZXJzL2NsaWZ0b25jYW1wYmVsbC9EZXZlbG9wbWVudC9jbGlmLndvcmxkL3N0eWxlcy90ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3NzIH0gZnJvbSAnQGVtb3Rpb24vY29yZSc7XG5pbXBvcnQgeyBnZXRTdHlsZSB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgdGFibGV0LCBtb2JpbGUgfSBmcm9tICcuL2JyZWFrcG9pbnRzJztcblxuY29uc3QgYmFzZSA9IGNzc2BcbiAgdHJhbnNpdGlvbjogJHtnZXRTdHlsZSgnbGluZWFySHVlJyl9O1xuICBmb250LXdlaWdodDogMzAwO1xuYDtcblxuY29uc3QgaW5saW5lTGluayA9IGNzc2BcbiAgYSB7XG4gICAgYmFja2dyb3VuZC1pbWFnZTogbGluZWFyLWdyYWRpZW50KFxuICAgICAgMTIwZGVnLFxuICAgICAgJHtnZXRTdHlsZSgnY3RhQmFja2dyb3VuZDQnKX0gMCUsXG4gICAgICAke2dldFN0eWxlKCdjdGFCYWNrZ3JvdW5kNCcpfSAxMDAlXG4gICAgKTtcbiAgICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xuICAgIGJhY2tncm91bmQtc2l6ZTogMTAwJSAxcHg7XG4gICAgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAxMDAlO1xuICAgIHRyYW5zaXRpb246IGJhY2tncm91bmQtc2l6ZSAwLjE1cyBsaW5lYXI7XG4gICAgY29sb3I6ICR7Z2V0U3R5bGUoJ3RleHQxYicpfTtcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG4gICAgJjpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kLXNpemU6IDEwMCUgNTAlO1xuICAgICAgY29sb3I6ICR7Z2V0U3R5bGUoJ3RleHQxJyl9O1xuICAgIH1cbiAgICAmOmFjdGl2ZSB7XG4gICAgICBiYWNrZ3JvdW5kLXNpemU6IDEwMCUgMzAlO1xuICAgICAgY29sb3I6ICR7Z2V0U3R5bGUoJ3RleHQxJyl9O1xuICAgIH1cbiAgfVxuYDtcblxuZXhwb3J0IGNvbnN0IGhlYWRpbmcgPSBjc3NgXG4gICR7YmFzZX07XG4gIGZvbnQtZmFtaWx5OiAnRmF0JztcbiAgY29sb3I6ICR7Z2V0U3R5bGUoJ3RleHQyJyl9O1xuICBmb250LXNpemU6IDg0cHQ7XG4gICR7dGFibGV0KGBmb250LXNpemU6IDY0cHQ7YCl9O1xuICAke21vYmlsZShgZm9udC1zaXplOiA0MHB0O2ApfTtcbiAgb3ZlcmZsb3c6IHZpc2libGU7XG5gO1xuXG5jb25zdCBiYXNlMiA9IGNzc2BcbiAgJHtiYXNlfTtcbiAgZm9udC1mYW1pbHk6ICdSb2JvdG8gTW9ubyc7XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MScpfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBoZWFkaW5nMiA9IGNzc2BcbiAgJHtiYXNlMn07XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MScpfTtcbiAgZm9udC1zaXplOiAzNnB4O1xuICBmb250LXdlaWdodDogMzAwO1xuICAke3RhYmxldChgZm9udC1zaXplOiAzMnB4O2ApfTtcbiAgJHttb2JpbGUoYGZvbnQtc2l6ZTogMjJweDtgKX07XG5gO1xuXG5leHBvcnQgY29uc3QgaGVhZGluZzMgPSBjc3NgXG4gICR7aGVhZGluZzJ9O1xuICBmb250LXdlaWdodDogMjAwO1xuYDtcblxuZXhwb3J0IGNvbnN0IHN1YmhlYWRlciA9IGNzc2BcbiAgJHtiYXNlMn07XG4gICR7aW5saW5lTGlua307XG4gIGZvbnQtc2l6ZTogMjJwdDtcbiAgbGluZS1oZWlnaHQ6IDI0cHQ7XG4gICR7dGFibGV0KGBcbiAgICBmb250LXNpemU6IDE4cHQ7XG4gICAgbGluZS1oZWlnaHQ6IDIycHQ7XG4gIGApfTtcbiAgJHttb2JpbGUoYFxuICAgIGZvbnQtc2l6ZTogMTRwdDtcbiAgICBsaW5lLWhlaWdodDogMjBwdDtcbiAgYCl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IHN1YmhlYWRlcjIgPSBjc3NgXG4gICR7c3ViaGVhZGVyfTtcbiAgY29sb3I6ICR7Z2V0U3R5bGUoJ3RleHQyJyl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGRldGFpbCA9IGNzc2BcbiAgJHtiYXNlMn07XG4gIGZvbnQtc2l6ZTogMTRweDtcbiAgbGluZS1oZWlnaHQ6IDE4cHg7XG4gIGZvbnQtd2VpZ2h0OiAyMDA7XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MWInKX07XG4gICR7bW9iaWxlKGBcbiAgICBmb250LXNpemU6IDEycHg7XG4gICAgbGluZS1oZWlnaHQ6IDE2cHg7XG4gIGApfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBkZXRhaWwyID0gY3NzYFxuICAke2RldGFpbH07XG4gIGZvbnQtd2VpZ2h0OiAzMDA7XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MicpfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBkZXRhaWwzID0gY3NzYFxuICAke2RldGFpbH07XG4gIGZvbnQtd2VpZ2h0OiAzMDA7XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MWMnKX07XG5gO1xuXG5leHBvcnQgY29uc3QgYm9keSA9IGNzc2BcbiAgJHtiYXNlMn07XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MWInKX07XG4gIGZvbnQtc2l6ZTogMThweDtcbiAgbGluZS1oZWlnaHQ6IDI4cHg7XG4gIGZvbnQtd2VpZ2h0OiAyMDA7XG4gICR7aW5saW5lTGlua307XG4gIHAge1xuICAgIG1hcmdpbjogMDtcbiAgfVxuICA+IHA6bm90KDpsYXN0LWNoaWxkKSB7XG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcbiAgfVxuICAke21vYmlsZShgXG4gICAgZm9udC1zaXplOiAxNHB4O1xuICAgIGxpbmUtaGVpZ2h0OiAyMnB4O1xuICBgKX07XG5gO1xuXG5leHBvcnQgY29uc3QgYm9keTIgPSBjc3NgXG4gICR7Ym9keX07XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MicpfTtcbiAgZm9udC13ZWlnaHQ6IDMwMDtcbmA7XG4iXX0= */"), ";label:base;");
const inlineLink =
/*#__PURE__*/

/*#__PURE__*/
Object(_emotion_core__WEBPACK_IMPORTED_MODULE_0__["css"])("a{background-image:linear-gradient( 120deg,", Object(_utils__WEBPACK_IMPORTED_MODULE_1__["getStyle"])('ctaBackground4'), " 0%,", Object(_utils__WEBPACK_IMPORTED_MODULE_1__["getStyle"])('ctaBackground4'), " 100% );background-repeat:no-repeat;background-size:100% 1px;background-position:0 100%;transition:background-size 0.15s linear;color:", Object(_utils__WEBPACK_IMPORTED_MODULE_1__["getStyle"])('text1b'), ";text-decoration:none;&:hover{background-size:100% 50%;color:", Object(_utils__WEBPACK_IMPORTED_MODULE_1__["getStyle"])('text1'), ";}&:active{background-size:100% 30%;color:", Object(_utils__WEBPACK_IMPORTED_MODULE_1__["getStyle"])('text1'), ";}};label:inlineLink;" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9zdHlsZXMvdGV4dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFTc0IiLCJmaWxlIjoiL1VzZXJzL2NsaWZ0b25jYW1wYmVsbC9EZXZlbG9wbWVudC9jbGlmLndvcmxkL3N0eWxlcy90ZXh0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgY3NzIH0gZnJvbSAnQGVtb3Rpb24vY29yZSc7XG5pbXBvcnQgeyBnZXRTdHlsZSB9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgdGFibGV0LCBtb2JpbGUgfSBmcm9tICcuL2JyZWFrcG9pbnRzJztcblxuY29uc3QgYmFzZSA9IGNzc2BcbiAgdHJhbnNpdGlvbjogJHtnZXRTdHlsZSgnbGluZWFySHVlJyl9O1xuICBmb250LXdlaWdodDogMzAwO1xuYDtcblxuY29uc3QgaW5saW5lTGluayA9IGNzc2BcbiAgYSB7XG4gICAgYmFja2dyb3VuZC1pbWFnZTogbGluZWFyLWdyYWRpZW50KFxuICAgICAgMTIwZGVnLFxuICAgICAgJHtnZXRTdHlsZSgnY3RhQmFja2dyb3VuZDQnKX0gMCUsXG4gICAgICAke2dldFN0eWxlKCdjdGFCYWNrZ3JvdW5kNCcpfSAxMDAlXG4gICAgKTtcbiAgICBiYWNrZ3JvdW5kLXJlcGVhdDogbm8tcmVwZWF0O1xuICAgIGJhY2tncm91bmQtc2l6ZTogMTAwJSAxcHg7XG4gICAgYmFja2dyb3VuZC1wb3NpdGlvbjogMCAxMDAlO1xuICAgIHRyYW5zaXRpb246IGJhY2tncm91bmQtc2l6ZSAwLjE1cyBsaW5lYXI7XG4gICAgY29sb3I6ICR7Z2V0U3R5bGUoJ3RleHQxYicpfTtcbiAgICB0ZXh0LWRlY29yYXRpb246IG5vbmU7XG4gICAgJjpob3ZlciB7XG4gICAgICBiYWNrZ3JvdW5kLXNpemU6IDEwMCUgNTAlO1xuICAgICAgY29sb3I6ICR7Z2V0U3R5bGUoJ3RleHQxJyl9O1xuICAgIH1cbiAgICAmOmFjdGl2ZSB7XG4gICAgICBiYWNrZ3JvdW5kLXNpemU6IDEwMCUgMzAlO1xuICAgICAgY29sb3I6ICR7Z2V0U3R5bGUoJ3RleHQxJyl9O1xuICAgIH1cbiAgfVxuYDtcblxuZXhwb3J0IGNvbnN0IGhlYWRpbmcgPSBjc3NgXG4gICR7YmFzZX07XG4gIGZvbnQtZmFtaWx5OiAnRmF0JztcbiAgY29sb3I6ICR7Z2V0U3R5bGUoJ3RleHQyJyl9O1xuICBmb250LXNpemU6IDg0cHQ7XG4gICR7dGFibGV0KGBmb250LXNpemU6IDY0cHQ7YCl9O1xuICAke21vYmlsZShgZm9udC1zaXplOiA0MHB0O2ApfTtcbiAgb3ZlcmZsb3c6IHZpc2libGU7XG5gO1xuXG5jb25zdCBiYXNlMiA9IGNzc2BcbiAgJHtiYXNlfTtcbiAgZm9udC1mYW1pbHk6ICdSb2JvdG8gTW9ubyc7XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MScpfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBoZWFkaW5nMiA9IGNzc2BcbiAgJHtiYXNlMn07XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MScpfTtcbiAgZm9udC1zaXplOiAzNnB4O1xuICBmb250LXdlaWdodDogMzAwO1xuICAke3RhYmxldChgZm9udC1zaXplOiAzMnB4O2ApfTtcbiAgJHttb2JpbGUoYGZvbnQtc2l6ZTogMjJweDtgKX07XG5gO1xuXG5leHBvcnQgY29uc3QgaGVhZGluZzMgPSBjc3NgXG4gICR7aGVhZGluZzJ9O1xuICBmb250LXdlaWdodDogMjAwO1xuYDtcblxuZXhwb3J0IGNvbnN0IHN1YmhlYWRlciA9IGNzc2BcbiAgJHtiYXNlMn07XG4gICR7aW5saW5lTGlua307XG4gIGZvbnQtc2l6ZTogMjJwdDtcbiAgbGluZS1oZWlnaHQ6IDI0cHQ7XG4gICR7dGFibGV0KGBcbiAgICBmb250LXNpemU6IDE4cHQ7XG4gICAgbGluZS1oZWlnaHQ6IDIycHQ7XG4gIGApfTtcbiAgJHttb2JpbGUoYFxuICAgIGZvbnQtc2l6ZTogMTRwdDtcbiAgICBsaW5lLWhlaWdodDogMjBwdDtcbiAgYCl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IHN1YmhlYWRlcjIgPSBjc3NgXG4gICR7c3ViaGVhZGVyfTtcbiAgY29sb3I6ICR7Z2V0U3R5bGUoJ3RleHQyJyl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGRldGFpbCA9IGNzc2BcbiAgJHtiYXNlMn07XG4gIGZvbnQtc2l6ZTogMTRweDtcbiAgbGluZS1oZWlnaHQ6IDE4cHg7XG4gIGZvbnQtd2VpZ2h0OiAyMDA7XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MWInKX07XG4gICR7bW9iaWxlKGBcbiAgICBmb250LXNpemU6IDEycHg7XG4gICAgbGluZS1oZWlnaHQ6IDE2cHg7XG4gIGApfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBkZXRhaWwyID0gY3NzYFxuICAke2RldGFpbH07XG4gIGZvbnQtd2VpZ2h0OiAzMDA7XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MicpfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBkZXRhaWwzID0gY3NzYFxuICAke2RldGFpbH07XG4gIGZvbnQtd2VpZ2h0OiAzMDA7XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MWMnKX07XG5gO1xuXG5leHBvcnQgY29uc3QgYm9keSA9IGNzc2BcbiAgJHtiYXNlMn07XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MWInKX07XG4gIGZvbnQtc2l6ZTogMThweDtcbiAgbGluZS1oZWlnaHQ6IDI4cHg7XG4gIGZvbnQtd2VpZ2h0OiAyMDA7XG4gICR7aW5saW5lTGlua307XG4gIHAge1xuICAgIG1hcmdpbjogMDtcbiAgfVxuICA+IHA6bm90KDpsYXN0LWNoaWxkKSB7XG4gICAgbWFyZ2luLWJvdHRvbTogMXJlbTtcbiAgfVxuICAke21vYmlsZShgXG4gICAgZm9udC1zaXplOiAxNHB4O1xuICAgIGxpbmUtaGVpZ2h0OiAyMnB4O1xuICBgKX07XG5gO1xuXG5leHBvcnQgY29uc3QgYm9keTIgPSBjc3NgXG4gICR7Ym9keX07XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MicpfTtcbiAgZm9udC13ZWlnaHQ6IDMwMDtcbmA7XG4iXX0= */"), ";label:inlineLink;");
const heading =
/*#__PURE__*/

/*#__PURE__*/
Object(_emotion_core__WEBPACK_IMPORTED_MODULE_0__["css"])(base, ";font-family:'Fat';color:", Object(_utils__WEBPACK_IMPORTED_MODULE_1__["getStyle"])('text2'), ";font-size:84pt;", Object(_breakpoints__WEBPACK_IMPORTED_MODULE_2__["tablet"])(`font-size: 64pt;`), ";", Object(_breakpoints__WEBPACK_IMPORTED_MODULE_2__["mobile"])(`font-size: 40pt;`), ";overflow:visible;;label:heading;" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9zdHlsZXMvdGV4dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFpQzBCIiwiZmlsZSI6Ii9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9zdHlsZXMvdGV4dC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNzcyB9IGZyb20gJ0BlbW90aW9uL2NvcmUnO1xuaW1wb3J0IHsgZ2V0U3R5bGUgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IHRhYmxldCwgbW9iaWxlIH0gZnJvbSAnLi9icmVha3BvaW50cyc7XG5cbmNvbnN0IGJhc2UgPSBjc3NgXG4gIHRyYW5zaXRpb246ICR7Z2V0U3R5bGUoJ2xpbmVhckh1ZScpfTtcbiAgZm9udC13ZWlnaHQ6IDMwMDtcbmA7XG5cbmNvbnN0IGlubGluZUxpbmsgPSBjc3NgXG4gIGEge1xuICAgIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudChcbiAgICAgIDEyMGRlZyxcbiAgICAgICR7Z2V0U3R5bGUoJ2N0YUJhY2tncm91bmQ0Jyl9IDAlLFxuICAgICAgJHtnZXRTdHlsZSgnY3RhQmFja2dyb3VuZDQnKX0gMTAwJVxuICAgICk7XG4gICAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcbiAgICBiYWNrZ3JvdW5kLXNpemU6IDEwMCUgMXB4O1xuICAgIGJhY2tncm91bmQtcG9zaXRpb246IDAgMTAwJTtcbiAgICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kLXNpemUgMC4xNXMgbGluZWFyO1xuICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MWInKX07XG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICAgICY6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZC1zaXplOiAxMDAlIDUwJTtcbiAgICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MScpfTtcbiAgICB9XG4gICAgJjphY3RpdmUge1xuICAgICAgYmFja2dyb3VuZC1zaXplOiAxMDAlIDMwJTtcbiAgICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MScpfTtcbiAgICB9XG4gIH1cbmA7XG5cbmV4cG9ydCBjb25zdCBoZWFkaW5nID0gY3NzYFxuICAke2Jhc2V9O1xuICBmb250LWZhbWlseTogJ0ZhdCc7XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MicpfTtcbiAgZm9udC1zaXplOiA4NHB0O1xuICAke3RhYmxldChgZm9udC1zaXplOiA2NHB0O2ApfTtcbiAgJHttb2JpbGUoYGZvbnQtc2l6ZTogNDBwdDtgKX07XG4gIG92ZXJmbG93OiB2aXNpYmxlO1xuYDtcblxuY29uc3QgYmFzZTIgPSBjc3NgXG4gICR7YmFzZX07XG4gIGZvbnQtZmFtaWx5OiAnUm9ib3RvIE1vbm8nO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDEnKX07XG5gO1xuXG5leHBvcnQgY29uc3QgaGVhZGluZzIgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDEnKX07XG4gIGZvbnQtc2l6ZTogMzZweDtcbiAgZm9udC13ZWlnaHQ6IDMwMDtcbiAgJHt0YWJsZXQoYGZvbnQtc2l6ZTogMzJweDtgKX07XG4gICR7bW9iaWxlKGBmb250LXNpemU6IDIycHg7YCl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGhlYWRpbmczID0gY3NzYFxuICAke2hlYWRpbmcyfTtcbiAgZm9udC13ZWlnaHQ6IDIwMDtcbmA7XG5cbmV4cG9ydCBjb25zdCBzdWJoZWFkZXIgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICAke2lubGluZUxpbmt9O1xuICBmb250LXNpemU6IDIycHQ7XG4gIGxpbmUtaGVpZ2h0OiAyNHB0O1xuICAke3RhYmxldChgXG4gICAgZm9udC1zaXplOiAxOHB0O1xuICAgIGxpbmUtaGVpZ2h0OiAyMnB0O1xuICBgKX07XG4gICR7bW9iaWxlKGBcbiAgICBmb250LXNpemU6IDE0cHQ7XG4gICAgbGluZS1oZWlnaHQ6IDIwcHQ7XG4gIGApfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBzdWJoZWFkZXIyID0gY3NzYFxuICAke3N1YmhlYWRlcn07XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MicpfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBkZXRhaWwgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBmb250LXNpemU6IDE0cHg7XG4gIGxpbmUtaGVpZ2h0OiAxOHB4O1xuICBmb250LXdlaWdodDogMjAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFiJyl9O1xuICAke21vYmlsZShgXG4gICAgZm9udC1zaXplOiAxMnB4O1xuICAgIGxpbmUtaGVpZ2h0OiAxNnB4O1xuICBgKX07XG5gO1xuXG5leHBvcnQgY29uc3QgZGV0YWlsMiA9IGNzc2BcbiAgJHtkZXRhaWx9O1xuICBmb250LXdlaWdodDogMzAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDInKX07XG5gO1xuXG5leHBvcnQgY29uc3QgZGV0YWlsMyA9IGNzc2BcbiAgJHtkZXRhaWx9O1xuICBmb250LXdlaWdodDogMzAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFjJyl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGJvZHkgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFiJyl9O1xuICBmb250LXNpemU6IDE4cHg7XG4gIGxpbmUtaGVpZ2h0OiAyOHB4O1xuICBmb250LXdlaWdodDogMjAwO1xuICAke2lubGluZUxpbmt9O1xuICBwIHtcbiAgICBtYXJnaW46IDA7XG4gIH1cbiAgPiBwOm5vdCg6bGFzdC1jaGlsZCkge1xuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XG4gIH1cbiAgJHttb2JpbGUoYFxuICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICBsaW5lLWhlaWdodDogMjJweDtcbiAgYCl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGJvZHkyID0gY3NzYFxuICAke2JvZHl9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDInKX07XG4gIGZvbnQtd2VpZ2h0OiAzMDA7XG5gO1xuIl19 */"), ";label:heading;");
const base2 =
/*#__PURE__*/

/*#__PURE__*/
Object(_emotion_core__WEBPACK_IMPORTED_MODULE_0__["css"])(base, ";font-family:'Roboto Mono';color:", Object(_utils__WEBPACK_IMPORTED_MODULE_1__["getStyle"])('text1'), ";;label:base2;" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9zdHlsZXMvdGV4dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUEyQ2lCIiwiZmlsZSI6Ii9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9zdHlsZXMvdGV4dC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNzcyB9IGZyb20gJ0BlbW90aW9uL2NvcmUnO1xuaW1wb3J0IHsgZ2V0U3R5bGUgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IHRhYmxldCwgbW9iaWxlIH0gZnJvbSAnLi9icmVha3BvaW50cyc7XG5cbmNvbnN0IGJhc2UgPSBjc3NgXG4gIHRyYW5zaXRpb246ICR7Z2V0U3R5bGUoJ2xpbmVhckh1ZScpfTtcbiAgZm9udC13ZWlnaHQ6IDMwMDtcbmA7XG5cbmNvbnN0IGlubGluZUxpbmsgPSBjc3NgXG4gIGEge1xuICAgIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudChcbiAgICAgIDEyMGRlZyxcbiAgICAgICR7Z2V0U3R5bGUoJ2N0YUJhY2tncm91bmQ0Jyl9IDAlLFxuICAgICAgJHtnZXRTdHlsZSgnY3RhQmFja2dyb3VuZDQnKX0gMTAwJVxuICAgICk7XG4gICAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcbiAgICBiYWNrZ3JvdW5kLXNpemU6IDEwMCUgMXB4O1xuICAgIGJhY2tncm91bmQtcG9zaXRpb246IDAgMTAwJTtcbiAgICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kLXNpemUgMC4xNXMgbGluZWFyO1xuICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MWInKX07XG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICAgICY6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZC1zaXplOiAxMDAlIDUwJTtcbiAgICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MScpfTtcbiAgICB9XG4gICAgJjphY3RpdmUge1xuICAgICAgYmFja2dyb3VuZC1zaXplOiAxMDAlIDMwJTtcbiAgICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MScpfTtcbiAgICB9XG4gIH1cbmA7XG5cbmV4cG9ydCBjb25zdCBoZWFkaW5nID0gY3NzYFxuICAke2Jhc2V9O1xuICBmb250LWZhbWlseTogJ0ZhdCc7XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MicpfTtcbiAgZm9udC1zaXplOiA4NHB0O1xuICAke3RhYmxldChgZm9udC1zaXplOiA2NHB0O2ApfTtcbiAgJHttb2JpbGUoYGZvbnQtc2l6ZTogNDBwdDtgKX07XG4gIG92ZXJmbG93OiB2aXNpYmxlO1xuYDtcblxuY29uc3QgYmFzZTIgPSBjc3NgXG4gICR7YmFzZX07XG4gIGZvbnQtZmFtaWx5OiAnUm9ib3RvIE1vbm8nO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDEnKX07XG5gO1xuXG5leHBvcnQgY29uc3QgaGVhZGluZzIgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDEnKX07XG4gIGZvbnQtc2l6ZTogMzZweDtcbiAgZm9udC13ZWlnaHQ6IDMwMDtcbiAgJHt0YWJsZXQoYGZvbnQtc2l6ZTogMzJweDtgKX07XG4gICR7bW9iaWxlKGBmb250LXNpemU6IDIycHg7YCl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGhlYWRpbmczID0gY3NzYFxuICAke2hlYWRpbmcyfTtcbiAgZm9udC13ZWlnaHQ6IDIwMDtcbmA7XG5cbmV4cG9ydCBjb25zdCBzdWJoZWFkZXIgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICAke2lubGluZUxpbmt9O1xuICBmb250LXNpemU6IDIycHQ7XG4gIGxpbmUtaGVpZ2h0OiAyNHB0O1xuICAke3RhYmxldChgXG4gICAgZm9udC1zaXplOiAxOHB0O1xuICAgIGxpbmUtaGVpZ2h0OiAyMnB0O1xuICBgKX07XG4gICR7bW9iaWxlKGBcbiAgICBmb250LXNpemU6IDE0cHQ7XG4gICAgbGluZS1oZWlnaHQ6IDIwcHQ7XG4gIGApfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBzdWJoZWFkZXIyID0gY3NzYFxuICAke3N1YmhlYWRlcn07XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MicpfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBkZXRhaWwgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBmb250LXNpemU6IDE0cHg7XG4gIGxpbmUtaGVpZ2h0OiAxOHB4O1xuICBmb250LXdlaWdodDogMjAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFiJyl9O1xuICAke21vYmlsZShgXG4gICAgZm9udC1zaXplOiAxMnB4O1xuICAgIGxpbmUtaGVpZ2h0OiAxNnB4O1xuICBgKX07XG5gO1xuXG5leHBvcnQgY29uc3QgZGV0YWlsMiA9IGNzc2BcbiAgJHtkZXRhaWx9O1xuICBmb250LXdlaWdodDogMzAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDInKX07XG5gO1xuXG5leHBvcnQgY29uc3QgZGV0YWlsMyA9IGNzc2BcbiAgJHtkZXRhaWx9O1xuICBmb250LXdlaWdodDogMzAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFjJyl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGJvZHkgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFiJyl9O1xuICBmb250LXNpemU6IDE4cHg7XG4gIGxpbmUtaGVpZ2h0OiAyOHB4O1xuICBmb250LXdlaWdodDogMjAwO1xuICAke2lubGluZUxpbmt9O1xuICBwIHtcbiAgICBtYXJnaW46IDA7XG4gIH1cbiAgPiBwOm5vdCg6bGFzdC1jaGlsZCkge1xuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XG4gIH1cbiAgJHttb2JpbGUoYFxuICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICBsaW5lLWhlaWdodDogMjJweDtcbiAgYCl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGJvZHkyID0gY3NzYFxuICAke2JvZHl9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDInKX07XG4gIGZvbnQtd2VpZ2h0OiAzMDA7XG5gO1xuIl19 */"), ";label:base2;");
const heading2 =
/*#__PURE__*/

/*#__PURE__*/
Object(_emotion_core__WEBPACK_IMPORTED_MODULE_0__["css"])(base2, ";color:", Object(_utils__WEBPACK_IMPORTED_MODULE_1__["getStyle"])('text1'), ";font-size:36px;font-weight:300;", Object(_breakpoints__WEBPACK_IMPORTED_MODULE_2__["tablet"])(`font-size: 32px;`), ";", Object(_breakpoints__WEBPACK_IMPORTED_MODULE_2__["mobile"])(`font-size: 22px;`), ";;label:heading2;" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9zdHlsZXMvdGV4dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFpRDJCIiwiZmlsZSI6Ii9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9zdHlsZXMvdGV4dC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNzcyB9IGZyb20gJ0BlbW90aW9uL2NvcmUnO1xuaW1wb3J0IHsgZ2V0U3R5bGUgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IHRhYmxldCwgbW9iaWxlIH0gZnJvbSAnLi9icmVha3BvaW50cyc7XG5cbmNvbnN0IGJhc2UgPSBjc3NgXG4gIHRyYW5zaXRpb246ICR7Z2V0U3R5bGUoJ2xpbmVhckh1ZScpfTtcbiAgZm9udC13ZWlnaHQ6IDMwMDtcbmA7XG5cbmNvbnN0IGlubGluZUxpbmsgPSBjc3NgXG4gIGEge1xuICAgIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudChcbiAgICAgIDEyMGRlZyxcbiAgICAgICR7Z2V0U3R5bGUoJ2N0YUJhY2tncm91bmQ0Jyl9IDAlLFxuICAgICAgJHtnZXRTdHlsZSgnY3RhQmFja2dyb3VuZDQnKX0gMTAwJVxuICAgICk7XG4gICAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcbiAgICBiYWNrZ3JvdW5kLXNpemU6IDEwMCUgMXB4O1xuICAgIGJhY2tncm91bmQtcG9zaXRpb246IDAgMTAwJTtcbiAgICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kLXNpemUgMC4xNXMgbGluZWFyO1xuICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MWInKX07XG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICAgICY6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZC1zaXplOiAxMDAlIDUwJTtcbiAgICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MScpfTtcbiAgICB9XG4gICAgJjphY3RpdmUge1xuICAgICAgYmFja2dyb3VuZC1zaXplOiAxMDAlIDMwJTtcbiAgICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MScpfTtcbiAgICB9XG4gIH1cbmA7XG5cbmV4cG9ydCBjb25zdCBoZWFkaW5nID0gY3NzYFxuICAke2Jhc2V9O1xuICBmb250LWZhbWlseTogJ0ZhdCc7XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MicpfTtcbiAgZm9udC1zaXplOiA4NHB0O1xuICAke3RhYmxldChgZm9udC1zaXplOiA2NHB0O2ApfTtcbiAgJHttb2JpbGUoYGZvbnQtc2l6ZTogNDBwdDtgKX07XG4gIG92ZXJmbG93OiB2aXNpYmxlO1xuYDtcblxuY29uc3QgYmFzZTIgPSBjc3NgXG4gICR7YmFzZX07XG4gIGZvbnQtZmFtaWx5OiAnUm9ib3RvIE1vbm8nO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDEnKX07XG5gO1xuXG5leHBvcnQgY29uc3QgaGVhZGluZzIgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDEnKX07XG4gIGZvbnQtc2l6ZTogMzZweDtcbiAgZm9udC13ZWlnaHQ6IDMwMDtcbiAgJHt0YWJsZXQoYGZvbnQtc2l6ZTogMzJweDtgKX07XG4gICR7bW9iaWxlKGBmb250LXNpemU6IDIycHg7YCl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGhlYWRpbmczID0gY3NzYFxuICAke2hlYWRpbmcyfTtcbiAgZm9udC13ZWlnaHQ6IDIwMDtcbmA7XG5cbmV4cG9ydCBjb25zdCBzdWJoZWFkZXIgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICAke2lubGluZUxpbmt9O1xuICBmb250LXNpemU6IDIycHQ7XG4gIGxpbmUtaGVpZ2h0OiAyNHB0O1xuICAke3RhYmxldChgXG4gICAgZm9udC1zaXplOiAxOHB0O1xuICAgIGxpbmUtaGVpZ2h0OiAyMnB0O1xuICBgKX07XG4gICR7bW9iaWxlKGBcbiAgICBmb250LXNpemU6IDE0cHQ7XG4gICAgbGluZS1oZWlnaHQ6IDIwcHQ7XG4gIGApfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBzdWJoZWFkZXIyID0gY3NzYFxuICAke3N1YmhlYWRlcn07XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MicpfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBkZXRhaWwgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBmb250LXNpemU6IDE0cHg7XG4gIGxpbmUtaGVpZ2h0OiAxOHB4O1xuICBmb250LXdlaWdodDogMjAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFiJyl9O1xuICAke21vYmlsZShgXG4gICAgZm9udC1zaXplOiAxMnB4O1xuICAgIGxpbmUtaGVpZ2h0OiAxNnB4O1xuICBgKX07XG5gO1xuXG5leHBvcnQgY29uc3QgZGV0YWlsMiA9IGNzc2BcbiAgJHtkZXRhaWx9O1xuICBmb250LXdlaWdodDogMzAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDInKX07XG5gO1xuXG5leHBvcnQgY29uc3QgZGV0YWlsMyA9IGNzc2BcbiAgJHtkZXRhaWx9O1xuICBmb250LXdlaWdodDogMzAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFjJyl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGJvZHkgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFiJyl9O1xuICBmb250LXNpemU6IDE4cHg7XG4gIGxpbmUtaGVpZ2h0OiAyOHB4O1xuICBmb250LXdlaWdodDogMjAwO1xuICAke2lubGluZUxpbmt9O1xuICBwIHtcbiAgICBtYXJnaW46IDA7XG4gIH1cbiAgPiBwOm5vdCg6bGFzdC1jaGlsZCkge1xuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XG4gIH1cbiAgJHttb2JpbGUoYFxuICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICBsaW5lLWhlaWdodDogMjJweDtcbiAgYCl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGJvZHkyID0gY3NzYFxuICAke2JvZHl9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDInKX07XG4gIGZvbnQtd2VpZ2h0OiAzMDA7XG5gO1xuIl19 */"), ";label:heading2;");
const heading3 =
/*#__PURE__*/

/*#__PURE__*/
Object(_emotion_core__WEBPACK_IMPORTED_MODULE_0__["css"])(heading2, ";font-weight:200;;label:heading3;" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9zdHlsZXMvdGV4dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUEwRDJCIiwiZmlsZSI6Ii9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9zdHlsZXMvdGV4dC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNzcyB9IGZyb20gJ0BlbW90aW9uL2NvcmUnO1xuaW1wb3J0IHsgZ2V0U3R5bGUgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IHRhYmxldCwgbW9iaWxlIH0gZnJvbSAnLi9icmVha3BvaW50cyc7XG5cbmNvbnN0IGJhc2UgPSBjc3NgXG4gIHRyYW5zaXRpb246ICR7Z2V0U3R5bGUoJ2xpbmVhckh1ZScpfTtcbiAgZm9udC13ZWlnaHQ6IDMwMDtcbmA7XG5cbmNvbnN0IGlubGluZUxpbmsgPSBjc3NgXG4gIGEge1xuICAgIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudChcbiAgICAgIDEyMGRlZyxcbiAgICAgICR7Z2V0U3R5bGUoJ2N0YUJhY2tncm91bmQ0Jyl9IDAlLFxuICAgICAgJHtnZXRTdHlsZSgnY3RhQmFja2dyb3VuZDQnKX0gMTAwJVxuICAgICk7XG4gICAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcbiAgICBiYWNrZ3JvdW5kLXNpemU6IDEwMCUgMXB4O1xuICAgIGJhY2tncm91bmQtcG9zaXRpb246IDAgMTAwJTtcbiAgICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kLXNpemUgMC4xNXMgbGluZWFyO1xuICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MWInKX07XG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICAgICY6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZC1zaXplOiAxMDAlIDUwJTtcbiAgICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MScpfTtcbiAgICB9XG4gICAgJjphY3RpdmUge1xuICAgICAgYmFja2dyb3VuZC1zaXplOiAxMDAlIDMwJTtcbiAgICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MScpfTtcbiAgICB9XG4gIH1cbmA7XG5cbmV4cG9ydCBjb25zdCBoZWFkaW5nID0gY3NzYFxuICAke2Jhc2V9O1xuICBmb250LWZhbWlseTogJ0ZhdCc7XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MicpfTtcbiAgZm9udC1zaXplOiA4NHB0O1xuICAke3RhYmxldChgZm9udC1zaXplOiA2NHB0O2ApfTtcbiAgJHttb2JpbGUoYGZvbnQtc2l6ZTogNDBwdDtgKX07XG4gIG92ZXJmbG93OiB2aXNpYmxlO1xuYDtcblxuY29uc3QgYmFzZTIgPSBjc3NgXG4gICR7YmFzZX07XG4gIGZvbnQtZmFtaWx5OiAnUm9ib3RvIE1vbm8nO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDEnKX07XG5gO1xuXG5leHBvcnQgY29uc3QgaGVhZGluZzIgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDEnKX07XG4gIGZvbnQtc2l6ZTogMzZweDtcbiAgZm9udC13ZWlnaHQ6IDMwMDtcbiAgJHt0YWJsZXQoYGZvbnQtc2l6ZTogMzJweDtgKX07XG4gICR7bW9iaWxlKGBmb250LXNpemU6IDIycHg7YCl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGhlYWRpbmczID0gY3NzYFxuICAke2hlYWRpbmcyfTtcbiAgZm9udC13ZWlnaHQ6IDIwMDtcbmA7XG5cbmV4cG9ydCBjb25zdCBzdWJoZWFkZXIgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICAke2lubGluZUxpbmt9O1xuICBmb250LXNpemU6IDIycHQ7XG4gIGxpbmUtaGVpZ2h0OiAyNHB0O1xuICAke3RhYmxldChgXG4gICAgZm9udC1zaXplOiAxOHB0O1xuICAgIGxpbmUtaGVpZ2h0OiAyMnB0O1xuICBgKX07XG4gICR7bW9iaWxlKGBcbiAgICBmb250LXNpemU6IDE0cHQ7XG4gICAgbGluZS1oZWlnaHQ6IDIwcHQ7XG4gIGApfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBzdWJoZWFkZXIyID0gY3NzYFxuICAke3N1YmhlYWRlcn07XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MicpfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBkZXRhaWwgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBmb250LXNpemU6IDE0cHg7XG4gIGxpbmUtaGVpZ2h0OiAxOHB4O1xuICBmb250LXdlaWdodDogMjAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFiJyl9O1xuICAke21vYmlsZShgXG4gICAgZm9udC1zaXplOiAxMnB4O1xuICAgIGxpbmUtaGVpZ2h0OiAxNnB4O1xuICBgKX07XG5gO1xuXG5leHBvcnQgY29uc3QgZGV0YWlsMiA9IGNzc2BcbiAgJHtkZXRhaWx9O1xuICBmb250LXdlaWdodDogMzAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDInKX07XG5gO1xuXG5leHBvcnQgY29uc3QgZGV0YWlsMyA9IGNzc2BcbiAgJHtkZXRhaWx9O1xuICBmb250LXdlaWdodDogMzAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFjJyl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGJvZHkgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFiJyl9O1xuICBmb250LXNpemU6IDE4cHg7XG4gIGxpbmUtaGVpZ2h0OiAyOHB4O1xuICBmb250LXdlaWdodDogMjAwO1xuICAke2lubGluZUxpbmt9O1xuICBwIHtcbiAgICBtYXJnaW46IDA7XG4gIH1cbiAgPiBwOm5vdCg6bGFzdC1jaGlsZCkge1xuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XG4gIH1cbiAgJHttb2JpbGUoYFxuICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICBsaW5lLWhlaWdodDogMjJweDtcbiAgYCl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGJvZHkyID0gY3NzYFxuICAke2JvZHl9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDInKX07XG4gIGZvbnQtd2VpZ2h0OiAzMDA7XG5gO1xuIl19 */"), ";label:heading3;");
const subheader =
/*#__PURE__*/

/*#__PURE__*/
Object(_emotion_core__WEBPACK_IMPORTED_MODULE_0__["css"])(base2, ";", inlineLink, ";font-size:22pt;line-height:24pt;", Object(_breakpoints__WEBPACK_IMPORTED_MODULE_2__["tablet"])(`
    font-size: 18pt;
    line-height: 22pt;
  `), ";", Object(_breakpoints__WEBPACK_IMPORTED_MODULE_2__["mobile"])(`
    font-size: 14pt;
    line-height: 20pt;
  `), ";;label:subheader;" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9zdHlsZXMvdGV4dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUErRDRCIiwiZmlsZSI6Ii9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9zdHlsZXMvdGV4dC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNzcyB9IGZyb20gJ0BlbW90aW9uL2NvcmUnO1xuaW1wb3J0IHsgZ2V0U3R5bGUgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IHRhYmxldCwgbW9iaWxlIH0gZnJvbSAnLi9icmVha3BvaW50cyc7XG5cbmNvbnN0IGJhc2UgPSBjc3NgXG4gIHRyYW5zaXRpb246ICR7Z2V0U3R5bGUoJ2xpbmVhckh1ZScpfTtcbiAgZm9udC13ZWlnaHQ6IDMwMDtcbmA7XG5cbmNvbnN0IGlubGluZUxpbmsgPSBjc3NgXG4gIGEge1xuICAgIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudChcbiAgICAgIDEyMGRlZyxcbiAgICAgICR7Z2V0U3R5bGUoJ2N0YUJhY2tncm91bmQ0Jyl9IDAlLFxuICAgICAgJHtnZXRTdHlsZSgnY3RhQmFja2dyb3VuZDQnKX0gMTAwJVxuICAgICk7XG4gICAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcbiAgICBiYWNrZ3JvdW5kLXNpemU6IDEwMCUgMXB4O1xuICAgIGJhY2tncm91bmQtcG9zaXRpb246IDAgMTAwJTtcbiAgICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kLXNpemUgMC4xNXMgbGluZWFyO1xuICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MWInKX07XG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICAgICY6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZC1zaXplOiAxMDAlIDUwJTtcbiAgICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MScpfTtcbiAgICB9XG4gICAgJjphY3RpdmUge1xuICAgICAgYmFja2dyb3VuZC1zaXplOiAxMDAlIDMwJTtcbiAgICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MScpfTtcbiAgICB9XG4gIH1cbmA7XG5cbmV4cG9ydCBjb25zdCBoZWFkaW5nID0gY3NzYFxuICAke2Jhc2V9O1xuICBmb250LWZhbWlseTogJ0ZhdCc7XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MicpfTtcbiAgZm9udC1zaXplOiA4NHB0O1xuICAke3RhYmxldChgZm9udC1zaXplOiA2NHB0O2ApfTtcbiAgJHttb2JpbGUoYGZvbnQtc2l6ZTogNDBwdDtgKX07XG4gIG92ZXJmbG93OiB2aXNpYmxlO1xuYDtcblxuY29uc3QgYmFzZTIgPSBjc3NgXG4gICR7YmFzZX07XG4gIGZvbnQtZmFtaWx5OiAnUm9ib3RvIE1vbm8nO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDEnKX07XG5gO1xuXG5leHBvcnQgY29uc3QgaGVhZGluZzIgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDEnKX07XG4gIGZvbnQtc2l6ZTogMzZweDtcbiAgZm9udC13ZWlnaHQ6IDMwMDtcbiAgJHt0YWJsZXQoYGZvbnQtc2l6ZTogMzJweDtgKX07XG4gICR7bW9iaWxlKGBmb250LXNpemU6IDIycHg7YCl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGhlYWRpbmczID0gY3NzYFxuICAke2hlYWRpbmcyfTtcbiAgZm9udC13ZWlnaHQ6IDIwMDtcbmA7XG5cbmV4cG9ydCBjb25zdCBzdWJoZWFkZXIgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICAke2lubGluZUxpbmt9O1xuICBmb250LXNpemU6IDIycHQ7XG4gIGxpbmUtaGVpZ2h0OiAyNHB0O1xuICAke3RhYmxldChgXG4gICAgZm9udC1zaXplOiAxOHB0O1xuICAgIGxpbmUtaGVpZ2h0OiAyMnB0O1xuICBgKX07XG4gICR7bW9iaWxlKGBcbiAgICBmb250LXNpemU6IDE0cHQ7XG4gICAgbGluZS1oZWlnaHQ6IDIwcHQ7XG4gIGApfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBzdWJoZWFkZXIyID0gY3NzYFxuICAke3N1YmhlYWRlcn07XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MicpfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBkZXRhaWwgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBmb250LXNpemU6IDE0cHg7XG4gIGxpbmUtaGVpZ2h0OiAxOHB4O1xuICBmb250LXdlaWdodDogMjAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFiJyl9O1xuICAke21vYmlsZShgXG4gICAgZm9udC1zaXplOiAxMnB4O1xuICAgIGxpbmUtaGVpZ2h0OiAxNnB4O1xuICBgKX07XG5gO1xuXG5leHBvcnQgY29uc3QgZGV0YWlsMiA9IGNzc2BcbiAgJHtkZXRhaWx9O1xuICBmb250LXdlaWdodDogMzAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDInKX07XG5gO1xuXG5leHBvcnQgY29uc3QgZGV0YWlsMyA9IGNzc2BcbiAgJHtkZXRhaWx9O1xuICBmb250LXdlaWdodDogMzAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFjJyl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGJvZHkgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFiJyl9O1xuICBmb250LXNpemU6IDE4cHg7XG4gIGxpbmUtaGVpZ2h0OiAyOHB4O1xuICBmb250LXdlaWdodDogMjAwO1xuICAke2lubGluZUxpbmt9O1xuICBwIHtcbiAgICBtYXJnaW46IDA7XG4gIH1cbiAgPiBwOm5vdCg6bGFzdC1jaGlsZCkge1xuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XG4gIH1cbiAgJHttb2JpbGUoYFxuICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICBsaW5lLWhlaWdodDogMjJweDtcbiAgYCl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGJvZHkyID0gY3NzYFxuICAke2JvZHl9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDInKX07XG4gIGZvbnQtd2VpZ2h0OiAzMDA7XG5gO1xuIl19 */"), ";label:subheader;");
const subheader2 =
/*#__PURE__*/

/*#__PURE__*/
Object(_emotion_core__WEBPACK_IMPORTED_MODULE_0__["css"])(subheader, ";color:", Object(_utils__WEBPACK_IMPORTED_MODULE_1__["getStyle"])('text2'), ";;label:subheader2;" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9zdHlsZXMvdGV4dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUE4RTZCIiwiZmlsZSI6Ii9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9zdHlsZXMvdGV4dC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNzcyB9IGZyb20gJ0BlbW90aW9uL2NvcmUnO1xuaW1wb3J0IHsgZ2V0U3R5bGUgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IHRhYmxldCwgbW9iaWxlIH0gZnJvbSAnLi9icmVha3BvaW50cyc7XG5cbmNvbnN0IGJhc2UgPSBjc3NgXG4gIHRyYW5zaXRpb246ICR7Z2V0U3R5bGUoJ2xpbmVhckh1ZScpfTtcbiAgZm9udC13ZWlnaHQ6IDMwMDtcbmA7XG5cbmNvbnN0IGlubGluZUxpbmsgPSBjc3NgXG4gIGEge1xuICAgIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudChcbiAgICAgIDEyMGRlZyxcbiAgICAgICR7Z2V0U3R5bGUoJ2N0YUJhY2tncm91bmQ0Jyl9IDAlLFxuICAgICAgJHtnZXRTdHlsZSgnY3RhQmFja2dyb3VuZDQnKX0gMTAwJVxuICAgICk7XG4gICAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcbiAgICBiYWNrZ3JvdW5kLXNpemU6IDEwMCUgMXB4O1xuICAgIGJhY2tncm91bmQtcG9zaXRpb246IDAgMTAwJTtcbiAgICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kLXNpemUgMC4xNXMgbGluZWFyO1xuICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MWInKX07XG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICAgICY6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZC1zaXplOiAxMDAlIDUwJTtcbiAgICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MScpfTtcbiAgICB9XG4gICAgJjphY3RpdmUge1xuICAgICAgYmFja2dyb3VuZC1zaXplOiAxMDAlIDMwJTtcbiAgICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MScpfTtcbiAgICB9XG4gIH1cbmA7XG5cbmV4cG9ydCBjb25zdCBoZWFkaW5nID0gY3NzYFxuICAke2Jhc2V9O1xuICBmb250LWZhbWlseTogJ0ZhdCc7XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MicpfTtcbiAgZm9udC1zaXplOiA4NHB0O1xuICAke3RhYmxldChgZm9udC1zaXplOiA2NHB0O2ApfTtcbiAgJHttb2JpbGUoYGZvbnQtc2l6ZTogNDBwdDtgKX07XG4gIG92ZXJmbG93OiB2aXNpYmxlO1xuYDtcblxuY29uc3QgYmFzZTIgPSBjc3NgXG4gICR7YmFzZX07XG4gIGZvbnQtZmFtaWx5OiAnUm9ib3RvIE1vbm8nO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDEnKX07XG5gO1xuXG5leHBvcnQgY29uc3QgaGVhZGluZzIgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDEnKX07XG4gIGZvbnQtc2l6ZTogMzZweDtcbiAgZm9udC13ZWlnaHQ6IDMwMDtcbiAgJHt0YWJsZXQoYGZvbnQtc2l6ZTogMzJweDtgKX07XG4gICR7bW9iaWxlKGBmb250LXNpemU6IDIycHg7YCl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGhlYWRpbmczID0gY3NzYFxuICAke2hlYWRpbmcyfTtcbiAgZm9udC13ZWlnaHQ6IDIwMDtcbmA7XG5cbmV4cG9ydCBjb25zdCBzdWJoZWFkZXIgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICAke2lubGluZUxpbmt9O1xuICBmb250LXNpemU6IDIycHQ7XG4gIGxpbmUtaGVpZ2h0OiAyNHB0O1xuICAke3RhYmxldChgXG4gICAgZm9udC1zaXplOiAxOHB0O1xuICAgIGxpbmUtaGVpZ2h0OiAyMnB0O1xuICBgKX07XG4gICR7bW9iaWxlKGBcbiAgICBmb250LXNpemU6IDE0cHQ7XG4gICAgbGluZS1oZWlnaHQ6IDIwcHQ7XG4gIGApfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBzdWJoZWFkZXIyID0gY3NzYFxuICAke3N1YmhlYWRlcn07XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MicpfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBkZXRhaWwgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBmb250LXNpemU6IDE0cHg7XG4gIGxpbmUtaGVpZ2h0OiAxOHB4O1xuICBmb250LXdlaWdodDogMjAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFiJyl9O1xuICAke21vYmlsZShgXG4gICAgZm9udC1zaXplOiAxMnB4O1xuICAgIGxpbmUtaGVpZ2h0OiAxNnB4O1xuICBgKX07XG5gO1xuXG5leHBvcnQgY29uc3QgZGV0YWlsMiA9IGNzc2BcbiAgJHtkZXRhaWx9O1xuICBmb250LXdlaWdodDogMzAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDInKX07XG5gO1xuXG5leHBvcnQgY29uc3QgZGV0YWlsMyA9IGNzc2BcbiAgJHtkZXRhaWx9O1xuICBmb250LXdlaWdodDogMzAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFjJyl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGJvZHkgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFiJyl9O1xuICBmb250LXNpemU6IDE4cHg7XG4gIGxpbmUtaGVpZ2h0OiAyOHB4O1xuICBmb250LXdlaWdodDogMjAwO1xuICAke2lubGluZUxpbmt9O1xuICBwIHtcbiAgICBtYXJnaW46IDA7XG4gIH1cbiAgPiBwOm5vdCg6bGFzdC1jaGlsZCkge1xuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XG4gIH1cbiAgJHttb2JpbGUoYFxuICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICBsaW5lLWhlaWdodDogMjJweDtcbiAgYCl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGJvZHkyID0gY3NzYFxuICAke2JvZHl9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDInKX07XG4gIGZvbnQtd2VpZ2h0OiAzMDA7XG5gO1xuIl19 */"), ";label:subheader2;");
const detail =
/*#__PURE__*/

/*#__PURE__*/
Object(_emotion_core__WEBPACK_IMPORTED_MODULE_0__["css"])(base2, ";font-size:14px;line-height:18px;font-weight:200;color:", Object(_utils__WEBPACK_IMPORTED_MODULE_1__["getStyle"])('text1b'), ";", Object(_breakpoints__WEBPACK_IMPORTED_MODULE_2__["mobile"])(`
    font-size: 12px;
    line-height: 16px;
  `), ";;label:detail;" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9zdHlsZXMvdGV4dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFtRnlCIiwiZmlsZSI6Ii9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9zdHlsZXMvdGV4dC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNzcyB9IGZyb20gJ0BlbW90aW9uL2NvcmUnO1xuaW1wb3J0IHsgZ2V0U3R5bGUgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IHRhYmxldCwgbW9iaWxlIH0gZnJvbSAnLi9icmVha3BvaW50cyc7XG5cbmNvbnN0IGJhc2UgPSBjc3NgXG4gIHRyYW5zaXRpb246ICR7Z2V0U3R5bGUoJ2xpbmVhckh1ZScpfTtcbiAgZm9udC13ZWlnaHQ6IDMwMDtcbmA7XG5cbmNvbnN0IGlubGluZUxpbmsgPSBjc3NgXG4gIGEge1xuICAgIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudChcbiAgICAgIDEyMGRlZyxcbiAgICAgICR7Z2V0U3R5bGUoJ2N0YUJhY2tncm91bmQ0Jyl9IDAlLFxuICAgICAgJHtnZXRTdHlsZSgnY3RhQmFja2dyb3VuZDQnKX0gMTAwJVxuICAgICk7XG4gICAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcbiAgICBiYWNrZ3JvdW5kLXNpemU6IDEwMCUgMXB4O1xuICAgIGJhY2tncm91bmQtcG9zaXRpb246IDAgMTAwJTtcbiAgICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kLXNpemUgMC4xNXMgbGluZWFyO1xuICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MWInKX07XG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICAgICY6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZC1zaXplOiAxMDAlIDUwJTtcbiAgICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MScpfTtcbiAgICB9XG4gICAgJjphY3RpdmUge1xuICAgICAgYmFja2dyb3VuZC1zaXplOiAxMDAlIDMwJTtcbiAgICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MScpfTtcbiAgICB9XG4gIH1cbmA7XG5cbmV4cG9ydCBjb25zdCBoZWFkaW5nID0gY3NzYFxuICAke2Jhc2V9O1xuICBmb250LWZhbWlseTogJ0ZhdCc7XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MicpfTtcbiAgZm9udC1zaXplOiA4NHB0O1xuICAke3RhYmxldChgZm9udC1zaXplOiA2NHB0O2ApfTtcbiAgJHttb2JpbGUoYGZvbnQtc2l6ZTogNDBwdDtgKX07XG4gIG92ZXJmbG93OiB2aXNpYmxlO1xuYDtcblxuY29uc3QgYmFzZTIgPSBjc3NgXG4gICR7YmFzZX07XG4gIGZvbnQtZmFtaWx5OiAnUm9ib3RvIE1vbm8nO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDEnKX07XG5gO1xuXG5leHBvcnQgY29uc3QgaGVhZGluZzIgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDEnKX07XG4gIGZvbnQtc2l6ZTogMzZweDtcbiAgZm9udC13ZWlnaHQ6IDMwMDtcbiAgJHt0YWJsZXQoYGZvbnQtc2l6ZTogMzJweDtgKX07XG4gICR7bW9iaWxlKGBmb250LXNpemU6IDIycHg7YCl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGhlYWRpbmczID0gY3NzYFxuICAke2hlYWRpbmcyfTtcbiAgZm9udC13ZWlnaHQ6IDIwMDtcbmA7XG5cbmV4cG9ydCBjb25zdCBzdWJoZWFkZXIgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICAke2lubGluZUxpbmt9O1xuICBmb250LXNpemU6IDIycHQ7XG4gIGxpbmUtaGVpZ2h0OiAyNHB0O1xuICAke3RhYmxldChgXG4gICAgZm9udC1zaXplOiAxOHB0O1xuICAgIGxpbmUtaGVpZ2h0OiAyMnB0O1xuICBgKX07XG4gICR7bW9iaWxlKGBcbiAgICBmb250LXNpemU6IDE0cHQ7XG4gICAgbGluZS1oZWlnaHQ6IDIwcHQ7XG4gIGApfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBzdWJoZWFkZXIyID0gY3NzYFxuICAke3N1YmhlYWRlcn07XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MicpfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBkZXRhaWwgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBmb250LXNpemU6IDE0cHg7XG4gIGxpbmUtaGVpZ2h0OiAxOHB4O1xuICBmb250LXdlaWdodDogMjAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFiJyl9O1xuICAke21vYmlsZShgXG4gICAgZm9udC1zaXplOiAxMnB4O1xuICAgIGxpbmUtaGVpZ2h0OiAxNnB4O1xuICBgKX07XG5gO1xuXG5leHBvcnQgY29uc3QgZGV0YWlsMiA9IGNzc2BcbiAgJHtkZXRhaWx9O1xuICBmb250LXdlaWdodDogMzAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDInKX07XG5gO1xuXG5leHBvcnQgY29uc3QgZGV0YWlsMyA9IGNzc2BcbiAgJHtkZXRhaWx9O1xuICBmb250LXdlaWdodDogMzAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFjJyl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGJvZHkgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFiJyl9O1xuICBmb250LXNpemU6IDE4cHg7XG4gIGxpbmUtaGVpZ2h0OiAyOHB4O1xuICBmb250LXdlaWdodDogMjAwO1xuICAke2lubGluZUxpbmt9O1xuICBwIHtcbiAgICBtYXJnaW46IDA7XG4gIH1cbiAgPiBwOm5vdCg6bGFzdC1jaGlsZCkge1xuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XG4gIH1cbiAgJHttb2JpbGUoYFxuICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICBsaW5lLWhlaWdodDogMjJweDtcbiAgYCl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGJvZHkyID0gY3NzYFxuICAke2JvZHl9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDInKX07XG4gIGZvbnQtd2VpZ2h0OiAzMDA7XG5gO1xuIl19 */"), ";label:detail;");
const detail2 =
/*#__PURE__*/

/*#__PURE__*/
Object(_emotion_core__WEBPACK_IMPORTED_MODULE_0__["css"])(detail, ";font-weight:300;color:", Object(_utils__WEBPACK_IMPORTED_MODULE_1__["getStyle"])('text2'), ";;label:detail2;" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9zdHlsZXMvdGV4dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUErRjBCIiwiZmlsZSI6Ii9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9zdHlsZXMvdGV4dC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNzcyB9IGZyb20gJ0BlbW90aW9uL2NvcmUnO1xuaW1wb3J0IHsgZ2V0U3R5bGUgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IHRhYmxldCwgbW9iaWxlIH0gZnJvbSAnLi9icmVha3BvaW50cyc7XG5cbmNvbnN0IGJhc2UgPSBjc3NgXG4gIHRyYW5zaXRpb246ICR7Z2V0U3R5bGUoJ2xpbmVhckh1ZScpfTtcbiAgZm9udC13ZWlnaHQ6IDMwMDtcbmA7XG5cbmNvbnN0IGlubGluZUxpbmsgPSBjc3NgXG4gIGEge1xuICAgIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudChcbiAgICAgIDEyMGRlZyxcbiAgICAgICR7Z2V0U3R5bGUoJ2N0YUJhY2tncm91bmQ0Jyl9IDAlLFxuICAgICAgJHtnZXRTdHlsZSgnY3RhQmFja2dyb3VuZDQnKX0gMTAwJVxuICAgICk7XG4gICAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcbiAgICBiYWNrZ3JvdW5kLXNpemU6IDEwMCUgMXB4O1xuICAgIGJhY2tncm91bmQtcG9zaXRpb246IDAgMTAwJTtcbiAgICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kLXNpemUgMC4xNXMgbGluZWFyO1xuICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MWInKX07XG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICAgICY6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZC1zaXplOiAxMDAlIDUwJTtcbiAgICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MScpfTtcbiAgICB9XG4gICAgJjphY3RpdmUge1xuICAgICAgYmFja2dyb3VuZC1zaXplOiAxMDAlIDMwJTtcbiAgICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MScpfTtcbiAgICB9XG4gIH1cbmA7XG5cbmV4cG9ydCBjb25zdCBoZWFkaW5nID0gY3NzYFxuICAke2Jhc2V9O1xuICBmb250LWZhbWlseTogJ0ZhdCc7XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MicpfTtcbiAgZm9udC1zaXplOiA4NHB0O1xuICAke3RhYmxldChgZm9udC1zaXplOiA2NHB0O2ApfTtcbiAgJHttb2JpbGUoYGZvbnQtc2l6ZTogNDBwdDtgKX07XG4gIG92ZXJmbG93OiB2aXNpYmxlO1xuYDtcblxuY29uc3QgYmFzZTIgPSBjc3NgXG4gICR7YmFzZX07XG4gIGZvbnQtZmFtaWx5OiAnUm9ib3RvIE1vbm8nO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDEnKX07XG5gO1xuXG5leHBvcnQgY29uc3QgaGVhZGluZzIgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDEnKX07XG4gIGZvbnQtc2l6ZTogMzZweDtcbiAgZm9udC13ZWlnaHQ6IDMwMDtcbiAgJHt0YWJsZXQoYGZvbnQtc2l6ZTogMzJweDtgKX07XG4gICR7bW9iaWxlKGBmb250LXNpemU6IDIycHg7YCl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGhlYWRpbmczID0gY3NzYFxuICAke2hlYWRpbmcyfTtcbiAgZm9udC13ZWlnaHQ6IDIwMDtcbmA7XG5cbmV4cG9ydCBjb25zdCBzdWJoZWFkZXIgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICAke2lubGluZUxpbmt9O1xuICBmb250LXNpemU6IDIycHQ7XG4gIGxpbmUtaGVpZ2h0OiAyNHB0O1xuICAke3RhYmxldChgXG4gICAgZm9udC1zaXplOiAxOHB0O1xuICAgIGxpbmUtaGVpZ2h0OiAyMnB0O1xuICBgKX07XG4gICR7bW9iaWxlKGBcbiAgICBmb250LXNpemU6IDE0cHQ7XG4gICAgbGluZS1oZWlnaHQ6IDIwcHQ7XG4gIGApfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBzdWJoZWFkZXIyID0gY3NzYFxuICAke3N1YmhlYWRlcn07XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MicpfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBkZXRhaWwgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBmb250LXNpemU6IDE0cHg7XG4gIGxpbmUtaGVpZ2h0OiAxOHB4O1xuICBmb250LXdlaWdodDogMjAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFiJyl9O1xuICAke21vYmlsZShgXG4gICAgZm9udC1zaXplOiAxMnB4O1xuICAgIGxpbmUtaGVpZ2h0OiAxNnB4O1xuICBgKX07XG5gO1xuXG5leHBvcnQgY29uc3QgZGV0YWlsMiA9IGNzc2BcbiAgJHtkZXRhaWx9O1xuICBmb250LXdlaWdodDogMzAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDInKX07XG5gO1xuXG5leHBvcnQgY29uc3QgZGV0YWlsMyA9IGNzc2BcbiAgJHtkZXRhaWx9O1xuICBmb250LXdlaWdodDogMzAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFjJyl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGJvZHkgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFiJyl9O1xuICBmb250LXNpemU6IDE4cHg7XG4gIGxpbmUtaGVpZ2h0OiAyOHB4O1xuICBmb250LXdlaWdodDogMjAwO1xuICAke2lubGluZUxpbmt9O1xuICBwIHtcbiAgICBtYXJnaW46IDA7XG4gIH1cbiAgPiBwOm5vdCg6bGFzdC1jaGlsZCkge1xuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XG4gIH1cbiAgJHttb2JpbGUoYFxuICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICBsaW5lLWhlaWdodDogMjJweDtcbiAgYCl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGJvZHkyID0gY3NzYFxuICAke2JvZHl9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDInKX07XG4gIGZvbnQtd2VpZ2h0OiAzMDA7XG5gO1xuIl19 */"), ";label:detail2;");
const detail3 =
/*#__PURE__*/

/*#__PURE__*/
Object(_emotion_core__WEBPACK_IMPORTED_MODULE_0__["css"])(detail, ";font-weight:300;color:", Object(_utils__WEBPACK_IMPORTED_MODULE_1__["getStyle"])('text1c'), ";;label:detail3;" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9zdHlsZXMvdGV4dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFxRzBCIiwiZmlsZSI6Ii9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9zdHlsZXMvdGV4dC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNzcyB9IGZyb20gJ0BlbW90aW9uL2NvcmUnO1xuaW1wb3J0IHsgZ2V0U3R5bGUgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IHRhYmxldCwgbW9iaWxlIH0gZnJvbSAnLi9icmVha3BvaW50cyc7XG5cbmNvbnN0IGJhc2UgPSBjc3NgXG4gIHRyYW5zaXRpb246ICR7Z2V0U3R5bGUoJ2xpbmVhckh1ZScpfTtcbiAgZm9udC13ZWlnaHQ6IDMwMDtcbmA7XG5cbmNvbnN0IGlubGluZUxpbmsgPSBjc3NgXG4gIGEge1xuICAgIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudChcbiAgICAgIDEyMGRlZyxcbiAgICAgICR7Z2V0U3R5bGUoJ2N0YUJhY2tncm91bmQ0Jyl9IDAlLFxuICAgICAgJHtnZXRTdHlsZSgnY3RhQmFja2dyb3VuZDQnKX0gMTAwJVxuICAgICk7XG4gICAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcbiAgICBiYWNrZ3JvdW5kLXNpemU6IDEwMCUgMXB4O1xuICAgIGJhY2tncm91bmQtcG9zaXRpb246IDAgMTAwJTtcbiAgICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kLXNpemUgMC4xNXMgbGluZWFyO1xuICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MWInKX07XG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICAgICY6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZC1zaXplOiAxMDAlIDUwJTtcbiAgICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MScpfTtcbiAgICB9XG4gICAgJjphY3RpdmUge1xuICAgICAgYmFja2dyb3VuZC1zaXplOiAxMDAlIDMwJTtcbiAgICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MScpfTtcbiAgICB9XG4gIH1cbmA7XG5cbmV4cG9ydCBjb25zdCBoZWFkaW5nID0gY3NzYFxuICAke2Jhc2V9O1xuICBmb250LWZhbWlseTogJ0ZhdCc7XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MicpfTtcbiAgZm9udC1zaXplOiA4NHB0O1xuICAke3RhYmxldChgZm9udC1zaXplOiA2NHB0O2ApfTtcbiAgJHttb2JpbGUoYGZvbnQtc2l6ZTogNDBwdDtgKX07XG4gIG92ZXJmbG93OiB2aXNpYmxlO1xuYDtcblxuY29uc3QgYmFzZTIgPSBjc3NgXG4gICR7YmFzZX07XG4gIGZvbnQtZmFtaWx5OiAnUm9ib3RvIE1vbm8nO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDEnKX07XG5gO1xuXG5leHBvcnQgY29uc3QgaGVhZGluZzIgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDEnKX07XG4gIGZvbnQtc2l6ZTogMzZweDtcbiAgZm9udC13ZWlnaHQ6IDMwMDtcbiAgJHt0YWJsZXQoYGZvbnQtc2l6ZTogMzJweDtgKX07XG4gICR7bW9iaWxlKGBmb250LXNpemU6IDIycHg7YCl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGhlYWRpbmczID0gY3NzYFxuICAke2hlYWRpbmcyfTtcbiAgZm9udC13ZWlnaHQ6IDIwMDtcbmA7XG5cbmV4cG9ydCBjb25zdCBzdWJoZWFkZXIgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICAke2lubGluZUxpbmt9O1xuICBmb250LXNpemU6IDIycHQ7XG4gIGxpbmUtaGVpZ2h0OiAyNHB0O1xuICAke3RhYmxldChgXG4gICAgZm9udC1zaXplOiAxOHB0O1xuICAgIGxpbmUtaGVpZ2h0OiAyMnB0O1xuICBgKX07XG4gICR7bW9iaWxlKGBcbiAgICBmb250LXNpemU6IDE0cHQ7XG4gICAgbGluZS1oZWlnaHQ6IDIwcHQ7XG4gIGApfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBzdWJoZWFkZXIyID0gY3NzYFxuICAke3N1YmhlYWRlcn07XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MicpfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBkZXRhaWwgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBmb250LXNpemU6IDE0cHg7XG4gIGxpbmUtaGVpZ2h0OiAxOHB4O1xuICBmb250LXdlaWdodDogMjAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFiJyl9O1xuICAke21vYmlsZShgXG4gICAgZm9udC1zaXplOiAxMnB4O1xuICAgIGxpbmUtaGVpZ2h0OiAxNnB4O1xuICBgKX07XG5gO1xuXG5leHBvcnQgY29uc3QgZGV0YWlsMiA9IGNzc2BcbiAgJHtkZXRhaWx9O1xuICBmb250LXdlaWdodDogMzAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDInKX07XG5gO1xuXG5leHBvcnQgY29uc3QgZGV0YWlsMyA9IGNzc2BcbiAgJHtkZXRhaWx9O1xuICBmb250LXdlaWdodDogMzAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFjJyl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGJvZHkgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFiJyl9O1xuICBmb250LXNpemU6IDE4cHg7XG4gIGxpbmUtaGVpZ2h0OiAyOHB4O1xuICBmb250LXdlaWdodDogMjAwO1xuICAke2lubGluZUxpbmt9O1xuICBwIHtcbiAgICBtYXJnaW46IDA7XG4gIH1cbiAgPiBwOm5vdCg6bGFzdC1jaGlsZCkge1xuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XG4gIH1cbiAgJHttb2JpbGUoYFxuICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICBsaW5lLWhlaWdodDogMjJweDtcbiAgYCl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGJvZHkyID0gY3NzYFxuICAke2JvZHl9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDInKX07XG4gIGZvbnQtd2VpZ2h0OiAzMDA7XG5gO1xuIl19 */"), ";label:detail3;");
const body =
/*#__PURE__*/

/*#__PURE__*/
Object(_emotion_core__WEBPACK_IMPORTED_MODULE_0__["css"])(base2, ";color:", Object(_utils__WEBPACK_IMPORTED_MODULE_1__["getStyle"])('text1b'), ";font-size:18px;line-height:28px;font-weight:200;", inlineLink, ";p{margin:0;}> p:not(:last-child){margin-bottom:1rem;}", Object(_breakpoints__WEBPACK_IMPORTED_MODULE_2__["mobile"])(`
    font-size: 14px;
    line-height: 22px;
  `), ";;label:body;" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9zdHlsZXMvdGV4dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUEyR3VCIiwiZmlsZSI6Ii9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9zdHlsZXMvdGV4dC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNzcyB9IGZyb20gJ0BlbW90aW9uL2NvcmUnO1xuaW1wb3J0IHsgZ2V0U3R5bGUgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IHRhYmxldCwgbW9iaWxlIH0gZnJvbSAnLi9icmVha3BvaW50cyc7XG5cbmNvbnN0IGJhc2UgPSBjc3NgXG4gIHRyYW5zaXRpb246ICR7Z2V0U3R5bGUoJ2xpbmVhckh1ZScpfTtcbiAgZm9udC13ZWlnaHQ6IDMwMDtcbmA7XG5cbmNvbnN0IGlubGluZUxpbmsgPSBjc3NgXG4gIGEge1xuICAgIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudChcbiAgICAgIDEyMGRlZyxcbiAgICAgICR7Z2V0U3R5bGUoJ2N0YUJhY2tncm91bmQ0Jyl9IDAlLFxuICAgICAgJHtnZXRTdHlsZSgnY3RhQmFja2dyb3VuZDQnKX0gMTAwJVxuICAgICk7XG4gICAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcbiAgICBiYWNrZ3JvdW5kLXNpemU6IDEwMCUgMXB4O1xuICAgIGJhY2tncm91bmQtcG9zaXRpb246IDAgMTAwJTtcbiAgICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kLXNpemUgMC4xNXMgbGluZWFyO1xuICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MWInKX07XG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICAgICY6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZC1zaXplOiAxMDAlIDUwJTtcbiAgICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MScpfTtcbiAgICB9XG4gICAgJjphY3RpdmUge1xuICAgICAgYmFja2dyb3VuZC1zaXplOiAxMDAlIDMwJTtcbiAgICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MScpfTtcbiAgICB9XG4gIH1cbmA7XG5cbmV4cG9ydCBjb25zdCBoZWFkaW5nID0gY3NzYFxuICAke2Jhc2V9O1xuICBmb250LWZhbWlseTogJ0ZhdCc7XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MicpfTtcbiAgZm9udC1zaXplOiA4NHB0O1xuICAke3RhYmxldChgZm9udC1zaXplOiA2NHB0O2ApfTtcbiAgJHttb2JpbGUoYGZvbnQtc2l6ZTogNDBwdDtgKX07XG4gIG92ZXJmbG93OiB2aXNpYmxlO1xuYDtcblxuY29uc3QgYmFzZTIgPSBjc3NgXG4gICR7YmFzZX07XG4gIGZvbnQtZmFtaWx5OiAnUm9ib3RvIE1vbm8nO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDEnKX07XG5gO1xuXG5leHBvcnQgY29uc3QgaGVhZGluZzIgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDEnKX07XG4gIGZvbnQtc2l6ZTogMzZweDtcbiAgZm9udC13ZWlnaHQ6IDMwMDtcbiAgJHt0YWJsZXQoYGZvbnQtc2l6ZTogMzJweDtgKX07XG4gICR7bW9iaWxlKGBmb250LXNpemU6IDIycHg7YCl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGhlYWRpbmczID0gY3NzYFxuICAke2hlYWRpbmcyfTtcbiAgZm9udC13ZWlnaHQ6IDIwMDtcbmA7XG5cbmV4cG9ydCBjb25zdCBzdWJoZWFkZXIgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICAke2lubGluZUxpbmt9O1xuICBmb250LXNpemU6IDIycHQ7XG4gIGxpbmUtaGVpZ2h0OiAyNHB0O1xuICAke3RhYmxldChgXG4gICAgZm9udC1zaXplOiAxOHB0O1xuICAgIGxpbmUtaGVpZ2h0OiAyMnB0O1xuICBgKX07XG4gICR7bW9iaWxlKGBcbiAgICBmb250LXNpemU6IDE0cHQ7XG4gICAgbGluZS1oZWlnaHQ6IDIwcHQ7XG4gIGApfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBzdWJoZWFkZXIyID0gY3NzYFxuICAke3N1YmhlYWRlcn07XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MicpfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBkZXRhaWwgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBmb250LXNpemU6IDE0cHg7XG4gIGxpbmUtaGVpZ2h0OiAxOHB4O1xuICBmb250LXdlaWdodDogMjAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFiJyl9O1xuICAke21vYmlsZShgXG4gICAgZm9udC1zaXplOiAxMnB4O1xuICAgIGxpbmUtaGVpZ2h0OiAxNnB4O1xuICBgKX07XG5gO1xuXG5leHBvcnQgY29uc3QgZGV0YWlsMiA9IGNzc2BcbiAgJHtkZXRhaWx9O1xuICBmb250LXdlaWdodDogMzAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDInKX07XG5gO1xuXG5leHBvcnQgY29uc3QgZGV0YWlsMyA9IGNzc2BcbiAgJHtkZXRhaWx9O1xuICBmb250LXdlaWdodDogMzAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFjJyl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGJvZHkgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFiJyl9O1xuICBmb250LXNpemU6IDE4cHg7XG4gIGxpbmUtaGVpZ2h0OiAyOHB4O1xuICBmb250LXdlaWdodDogMjAwO1xuICAke2lubGluZUxpbmt9O1xuICBwIHtcbiAgICBtYXJnaW46IDA7XG4gIH1cbiAgPiBwOm5vdCg6bGFzdC1jaGlsZCkge1xuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XG4gIH1cbiAgJHttb2JpbGUoYFxuICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICBsaW5lLWhlaWdodDogMjJweDtcbiAgYCl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGJvZHkyID0gY3NzYFxuICAke2JvZHl9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDInKX07XG4gIGZvbnQtd2VpZ2h0OiAzMDA7XG5gO1xuIl19 */"), ";label:body;");
const body2 =
/*#__PURE__*/

/*#__PURE__*/
Object(_emotion_core__WEBPACK_IMPORTED_MODULE_0__["css"])(body, ";color:", Object(_utils__WEBPACK_IMPORTED_MODULE_1__["getStyle"])('text2'), ";font-weight:300;;label:body2;" + (false ? undefined : "/*# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9zdHlsZXMvdGV4dC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUE4SHdCIiwiZmlsZSI6Ii9Vc2Vycy9jbGlmdG9uY2FtcGJlbGwvRGV2ZWxvcG1lbnQvY2xpZi53b3JsZC9zdHlsZXMvdGV4dC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGNzcyB9IGZyb20gJ0BlbW90aW9uL2NvcmUnO1xuaW1wb3J0IHsgZ2V0U3R5bGUgfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IHRhYmxldCwgbW9iaWxlIH0gZnJvbSAnLi9icmVha3BvaW50cyc7XG5cbmNvbnN0IGJhc2UgPSBjc3NgXG4gIHRyYW5zaXRpb246ICR7Z2V0U3R5bGUoJ2xpbmVhckh1ZScpfTtcbiAgZm9udC13ZWlnaHQ6IDMwMDtcbmA7XG5cbmNvbnN0IGlubGluZUxpbmsgPSBjc3NgXG4gIGEge1xuICAgIGJhY2tncm91bmQtaW1hZ2U6IGxpbmVhci1ncmFkaWVudChcbiAgICAgIDEyMGRlZyxcbiAgICAgICR7Z2V0U3R5bGUoJ2N0YUJhY2tncm91bmQ0Jyl9IDAlLFxuICAgICAgJHtnZXRTdHlsZSgnY3RhQmFja2dyb3VuZDQnKX0gMTAwJVxuICAgICk7XG4gICAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcbiAgICBiYWNrZ3JvdW5kLXNpemU6IDEwMCUgMXB4O1xuICAgIGJhY2tncm91bmQtcG9zaXRpb246IDAgMTAwJTtcbiAgICB0cmFuc2l0aW9uOiBiYWNrZ3JvdW5kLXNpemUgMC4xNXMgbGluZWFyO1xuICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MWInKX07XG4gICAgdGV4dC1kZWNvcmF0aW9uOiBub25lO1xuICAgICY6aG92ZXIge1xuICAgICAgYmFja2dyb3VuZC1zaXplOiAxMDAlIDUwJTtcbiAgICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MScpfTtcbiAgICB9XG4gICAgJjphY3RpdmUge1xuICAgICAgYmFja2dyb3VuZC1zaXplOiAxMDAlIDMwJTtcbiAgICAgIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MScpfTtcbiAgICB9XG4gIH1cbmA7XG5cbmV4cG9ydCBjb25zdCBoZWFkaW5nID0gY3NzYFxuICAke2Jhc2V9O1xuICBmb250LWZhbWlseTogJ0ZhdCc7XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MicpfTtcbiAgZm9udC1zaXplOiA4NHB0O1xuICAke3RhYmxldChgZm9udC1zaXplOiA2NHB0O2ApfTtcbiAgJHttb2JpbGUoYGZvbnQtc2l6ZTogNDBwdDtgKX07XG4gIG92ZXJmbG93OiB2aXNpYmxlO1xuYDtcblxuY29uc3QgYmFzZTIgPSBjc3NgXG4gICR7YmFzZX07XG4gIGZvbnQtZmFtaWx5OiAnUm9ib3RvIE1vbm8nO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDEnKX07XG5gO1xuXG5leHBvcnQgY29uc3QgaGVhZGluZzIgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDEnKX07XG4gIGZvbnQtc2l6ZTogMzZweDtcbiAgZm9udC13ZWlnaHQ6IDMwMDtcbiAgJHt0YWJsZXQoYGZvbnQtc2l6ZTogMzJweDtgKX07XG4gICR7bW9iaWxlKGBmb250LXNpemU6IDIycHg7YCl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGhlYWRpbmczID0gY3NzYFxuICAke2hlYWRpbmcyfTtcbiAgZm9udC13ZWlnaHQ6IDIwMDtcbmA7XG5cbmV4cG9ydCBjb25zdCBzdWJoZWFkZXIgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICAke2lubGluZUxpbmt9O1xuICBmb250LXNpemU6IDIycHQ7XG4gIGxpbmUtaGVpZ2h0OiAyNHB0O1xuICAke3RhYmxldChgXG4gICAgZm9udC1zaXplOiAxOHB0O1xuICAgIGxpbmUtaGVpZ2h0OiAyMnB0O1xuICBgKX07XG4gICR7bW9iaWxlKGBcbiAgICBmb250LXNpemU6IDE0cHQ7XG4gICAgbGluZS1oZWlnaHQ6IDIwcHQ7XG4gIGApfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBzdWJoZWFkZXIyID0gY3NzYFxuICAke3N1YmhlYWRlcn07XG4gIGNvbG9yOiAke2dldFN0eWxlKCd0ZXh0MicpfTtcbmA7XG5cbmV4cG9ydCBjb25zdCBkZXRhaWwgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBmb250LXNpemU6IDE0cHg7XG4gIGxpbmUtaGVpZ2h0OiAxOHB4O1xuICBmb250LXdlaWdodDogMjAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFiJyl9O1xuICAke21vYmlsZShgXG4gICAgZm9udC1zaXplOiAxMnB4O1xuICAgIGxpbmUtaGVpZ2h0OiAxNnB4O1xuICBgKX07XG5gO1xuXG5leHBvcnQgY29uc3QgZGV0YWlsMiA9IGNzc2BcbiAgJHtkZXRhaWx9O1xuICBmb250LXdlaWdodDogMzAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDInKX07XG5gO1xuXG5leHBvcnQgY29uc3QgZGV0YWlsMyA9IGNzc2BcbiAgJHtkZXRhaWx9O1xuICBmb250LXdlaWdodDogMzAwO1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFjJyl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGJvZHkgPSBjc3NgXG4gICR7YmFzZTJ9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDFiJyl9O1xuICBmb250LXNpemU6IDE4cHg7XG4gIGxpbmUtaGVpZ2h0OiAyOHB4O1xuICBmb250LXdlaWdodDogMjAwO1xuICAke2lubGluZUxpbmt9O1xuICBwIHtcbiAgICBtYXJnaW46IDA7XG4gIH1cbiAgPiBwOm5vdCg6bGFzdC1jaGlsZCkge1xuICAgIG1hcmdpbi1ib3R0b206IDFyZW07XG4gIH1cbiAgJHttb2JpbGUoYFxuICAgIGZvbnQtc2l6ZTogMTRweDtcbiAgICBsaW5lLWhlaWdodDogMjJweDtcbiAgYCl9O1xuYDtcblxuZXhwb3J0IGNvbnN0IGJvZHkyID0gY3NzYFxuICAke2JvZHl9O1xuICBjb2xvcjogJHtnZXRTdHlsZSgndGV4dDInKX07XG4gIGZvbnQtd2VpZ2h0OiAzMDA7XG5gO1xuIl19 */"), ";label:body2;");

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

/***/ "./utils/prop-types.js":
/*!*****************************!*\
  !*** ./utils/prop-types.js ***!
  \*****************************/
/*! exports provided: ChildrenPropType */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "ChildrenPropType", function() { return ChildrenPropType; });
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! prop-types */ "prop-types");
/* harmony import */ var prop_types__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(prop_types__WEBPACK_IMPORTED_MODULE_0__);

const ChildrenPropType = prop_types__WEBPACK_IMPORTED_MODULE_0___default.a.oneOfType([prop_types__WEBPACK_IMPORTED_MODULE_0___default.a.node, prop_types__WEBPACK_IMPORTED_MODULE_0___default.a.arrayOf(prop_types__WEBPACK_IMPORTED_MODULE_0___default.a.node), prop_types__WEBPACK_IMPORTED_MODULE_0___default.a.func, prop_types__WEBPACK_IMPORTED_MODULE_0___default.a.object]);

/***/ }),

/***/ 3:
/*!******************************!*\
  !*** multi ./pages/index.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! /Users/cliftoncampbell/Development/clif.world/pages/index.js */"./pages/index.js");


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

/***/ "d3":
/*!*********************!*\
  !*** external "d3" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("d3");

/***/ }),

/***/ "facepaint":
/*!****************************!*\
  !*** external "facepaint" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("facepaint");

/***/ }),

/***/ "glslify":
/*!**************************!*\
  !*** external "glslify" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("glslify");

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

/***/ "prop-types":
/*!*****************************!*\
  !*** external "prop-types" ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("prop-types");

/***/ }),

/***/ "prop-types-exact":
/*!***********************************!*\
  !*** external "prop-types-exact" ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("prop-types-exact");

/***/ }),

/***/ "react":
/*!************************!*\
  !*** external "react" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react");

/***/ }),

/***/ "react-router-dom":
/*!***********************************!*\
  !*** external "react-router-dom" ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react-router-dom");

/***/ }),

/***/ "react-spring":
/*!*******************************!*\
  !*** external "react-spring" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react-spring");

/***/ }),

/***/ "react-use-gesture":
/*!************************************!*\
  !*** external "react-use-gesture" ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("react-use-gesture");

/***/ }),

/***/ "recompose/withProps":
/*!**************************************!*\
  !*** external "recompose/withProps" ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("recompose/withProps");

/***/ }),

/***/ "three":
/*!************************!*\
  !*** external "three" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("three");

/***/ }),

/***/ "topojson":
/*!***************************!*\
  !*** external "topojson" ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("topojson");

/***/ }),

/***/ "url":
/*!**********************!*\
  !*** external "url" ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("url");

/***/ })

/******/ });
//# sourceMappingURL=index.js.map