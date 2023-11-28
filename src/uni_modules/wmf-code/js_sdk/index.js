var __assign = function() {
	return (__assign = Object.assign || function(t) {
		for (var e, i = 1, r = arguments.length; i < r; i++)
			for (var o in e = arguments[i]) Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
		return t
	}).apply(this, arguments)
};

function __awaiter(t, n, h, a) {
	return new(h = h || Promise)(function(i, e) {
		function r(t) {
			try {
				s(a.next(t))
			} catch (t) {
				e(t)
			}
		}

		function o(t) {
			try {
				s(a.throw(t))
			} catch (t) {
				e(t)
			}
		}

		function s(t) {
			var e;
			t.done ? i(t.value) : ((e = t.value) instanceof h ? e : new h(function(t) {
				t(e)
			})).then(r, o)
		}
		s((a = a.apply(t, n || [])).next())
	})
}

function __generator(i, r) {
	var o, s, n, h = {
			label: 0,
			sent: function() {
				if (1 & n[0]) throw n[1];
				return n[1]
			},
			trys: [],
			ops: []
		},
		t = {
			next: e(0),
			throw: e(1),
			return: e(2)
		};
	return "function" == typeof Symbol && (t[Symbol.iterator] = function() {
		return this
	}), t;

	function e(e) {
		return function(t) {
			return function(e) {
				if (o) throw new TypeError("Generator is already executing.");
				for (; h;) try {
					if (o = 1, s && (n = 2 & e[0] ? s.return : e[0] ? s.throw || ((n = s.return) && n.call(s), 0) : s
						.next) && !(n = n.call(s, e[1])).done) return n;
					switch (s = 0, (e = n ? [2 & e[0], n.value] : e)[0]) {
						case 0:
						case 1:
							n = e;
							break;
						case 4:
							return h.label++, {
								value: e[1],
								done: !1
							};
						case 5:
							h.label++, s = e[1], e = [0];
							continue;
						case 7:
							e = h.ops.pop(), h.trys.pop();
							continue;
						default:
							if (!(n = 0 < (n = h.trys).length && n[n.length - 1]) && (6 === e[0] || 2 === e[0])) {
								h = 0;
								continue
							}
							if (3 === e[0] && (!n || e[1] > n[0] && e[1] < n[3])) {
								h.label = e[1];
								break
							}
							if (6 === e[0] && h.label < n[1]) {
								h.label = n[1], n = e;
								break
							}
							if (n && h.label < n[2]) {
								h.label = n[2], h.ops.push(e);
								break
							}
							n[2] && h.ops.pop(), h.trys.pop();
							continue
					}
					e = r.call(i, h)
				} catch (t) {
					e = [6, t], s = 0
				} finally {
					o = n = 0
				}
				if (5 & e[0]) throw e[1];
				return {
					value: e[0] ? e[1] : void 0,
					done: !0
				}
			}([e, t])
		}
	}
}
var ADELTA = [0, 11, 15, 19, 23, 27, 31, 16, 18, 20, 22, 24, 26, 28, 20, 22, 24, 24, 26, 28, 28, 22, 24, 24, 26, 26, 28,
		28, 24, 24, 26, 26, 26, 28, 28, 24, 26, 26, 26, 28, 28
	],
	VPAT = [3220, 1468, 2713, 1235, 3062, 1890, 2119, 1549, 2344, 2936, 1117, 2583, 1330, 2470, 1667, 2249, 2028, 3780,
		481, 4011, 142, 3098, 831, 3445, 592, 2517, 1776, 2234, 1951, 2827, 1070, 2660, 1345, 3177
	],
	fmtword = [30660, 29427, 32170, 30877, 26159, 25368, 27713, 26998, 21522, 20773, 24188, 23371, 17913, 16590, 20375,
		19104, 13663, 12392, 16177, 14854, 9396, 8579, 11994, 11245, 5769, 5054, 7399, 6608, 1890, 597, 3340, 2107
	],
	ECBLOCKS = [1, 0, 19, 7, 1, 0, 16, 10, 1, 0, 13, 13, 1, 0, 9, 17, 1, 0, 34, 10, 1, 0, 28, 16, 1, 0, 22, 22, 1, 0, 16,
		28, 1, 0, 55, 15, 1, 0, 44, 26, 2, 0, 17, 18, 2, 0, 13, 22, 1, 0, 80, 20, 2, 0, 32, 18, 2, 0, 24, 26, 4, 0, 9, 16,
		1, 0, 108, 26, 2, 0, 43, 24, 2, 2, 15, 18, 2, 2, 11, 22, 2, 0, 68, 18, 4, 0, 27, 16, 4, 0, 19, 24, 4, 0, 15, 28, 2,
		0, 78, 20, 4, 0, 31, 18, 2, 4, 14, 18, 4, 1, 13, 26, 2, 0, 97, 24, 2, 2, 38, 22, 4, 2, 18, 22, 4, 2, 14, 26, 2, 0,
		116, 30, 3, 2, 36, 22, 4, 4, 16, 20, 4, 4, 12, 24, 2, 2, 68, 18, 4, 1, 43, 26, 6, 2, 19, 24, 6, 2, 15, 28, 4, 0, 81,
		20, 1, 4, 50, 30, 4, 4, 22, 28, 3, 8, 12, 24, 2, 2, 92, 24, 6, 2, 36, 22, 4, 6, 20, 26, 7, 4, 14, 28, 4, 0, 107, 26,
		8, 1, 37, 22, 8, 4, 20, 24, 12, 4, 11, 22, 3, 1, 115, 30, 4, 5, 40, 24, 11, 5, 16, 20, 11, 5, 12, 24, 5, 1, 87, 22,
		5, 5, 41, 24, 5, 7, 24, 30, 11, 7, 12, 24, 5, 1, 98, 24, 7, 3, 45, 28, 15, 2, 19, 24, 3, 13, 15, 30, 1, 5, 107, 28,
		10, 1, 46, 28, 1, 15, 22, 28, 2, 17, 14, 28, 5, 1, 120, 30, 9, 4, 43, 26, 17, 1, 22, 28, 2, 19, 14, 28, 3, 4, 113,
		28, 3, 11, 44, 26, 17, 4, 21, 26, 9, 16, 13, 26, 3, 5, 107, 28, 3, 13, 41, 26, 15, 5, 24, 30, 15, 10, 15, 28, 4, 4,
		116, 28, 17, 0, 42, 26, 17, 6, 22, 28, 19, 6, 16, 30, 2, 7, 111, 28, 17, 0, 46, 28, 7, 16, 24, 30, 34, 0, 13, 24, 4,
		5, 121, 30, 4, 14, 47, 28, 11, 14, 24, 30, 16, 14, 15, 30, 6, 4, 117, 30, 6, 14, 45, 28, 11, 16, 24, 30, 30, 2, 16,
		30, 8, 4, 106, 26, 8, 13, 47, 28, 7, 22, 24, 30, 22, 13, 15, 30, 10, 2, 114, 28, 19, 4, 46, 28, 28, 6, 22, 28, 33,
		4, 16, 30, 8, 4, 122, 30, 22, 3, 45, 28, 8, 26, 23, 30, 12, 28, 15, 30, 3, 10, 117, 30, 3, 23, 45, 28, 4, 31, 24,
		30, 11, 31, 15, 30, 7, 7, 116, 30, 21, 7, 45, 28, 1, 37, 23, 30, 19, 26, 15, 30, 5, 10, 115, 30, 19, 10, 47, 28, 15,
		25, 24, 30, 23, 25, 15, 30, 13, 3, 115, 30, 2, 29, 46, 28, 42, 1, 24, 30, 23, 28, 15, 30, 17, 0, 115, 30, 10, 23,
		46, 28, 10, 35, 24, 30, 19, 35, 15, 30, 17, 1, 115, 30, 14, 21, 46, 28, 29, 19, 24, 30, 11, 46, 15, 30, 13, 6, 115,
		30, 14, 23, 46, 28, 44, 7, 24, 30, 59, 1, 16, 30, 12, 7, 121, 30, 12, 26, 47, 28, 39, 14, 24, 30, 22, 41, 15, 30, 6,
		14, 121, 30, 6, 34, 47, 28, 46, 10, 24, 30, 2, 64, 15, 30, 17, 4, 122, 30, 29, 14, 46, 28, 49, 10, 24, 30, 24, 46,
		15, 30, 4, 18, 122, 30, 13, 32, 46, 28, 48, 14, 24, 30, 42, 32, 15, 30, 20, 4, 117, 30, 40, 7, 47, 28, 43, 22, 24,
		30, 10, 67, 15, 30, 19, 6, 118, 30, 18, 31, 47, 28, 34, 34, 24, 30, 20, 61, 15, 30
	],
	GLOG = [255, 0, 1, 25, 2, 50, 26, 198, 3, 223, 51, 238, 27, 104, 199, 75, 4, 100, 224, 14, 52, 141, 239, 129, 28, 193,
		105, 248, 200, 8, 76, 113, 5, 138, 101, 47, 225, 36, 15, 33, 53, 147, 142, 218, 240, 18, 130, 69, 29, 181, 194, 125,
		106, 39, 249, 185, 201, 154, 9, 120, 77, 228, 114, 166, 6, 191, 139, 98, 102, 221, 48, 253, 226, 152, 37, 179, 16,
		145, 34, 136, 54, 208, 148, 206, 143, 150, 219, 189, 241, 210, 19, 92, 131, 56, 70, 64, 30, 66, 182, 163, 195, 72,
		126, 110, 107, 58, 40, 84, 250, 133, 186, 61, 202, 94, 155, 159, 10, 21, 121, 43, 78, 212, 229, 172, 115, 243, 167,
		87, 7, 112, 192, 247, 140, 128, 99, 13, 103, 74, 222, 237, 49, 197, 254, 24, 227, 165, 153, 119, 38, 184, 180, 124,
		17, 68, 146, 217, 35, 32, 137, 46, 55, 63, 209, 91, 149, 188, 207, 205, 144, 135, 151, 178, 220, 252, 190, 97, 242,
		86, 211, 171, 20, 42, 93, 158, 132, 60, 57, 83, 71, 109, 65, 162, 31, 45, 67, 216, 183, 123, 164, 118, 196, 23, 73,
		236, 127, 12, 111, 246, 108, 161, 59, 82, 41, 157, 85, 170, 251, 96, 134, 177, 187, 204, 62, 90, 203, 89, 95, 176,
		156, 169, 160, 81, 11, 245, 22, 235, 122, 117, 44, 215, 79, 174, 213, 233, 230, 231, 173, 232, 116, 214, 244, 234,
		168, 80, 88, 175
	],
	GEXP = [1, 2, 4, 8, 16, 32, 64, 128, 29, 58, 116, 232, 205, 135, 19, 38, 76, 152, 45, 90, 180, 117, 234, 201, 143, 3,
		6, 12, 24, 48, 96, 192, 157, 39, 78, 156, 37, 74, 148, 53, 106, 212, 181, 119, 238, 193, 159, 35, 70, 140, 5, 10,
		20, 40, 80, 160, 93, 186, 105, 210, 185, 111, 222, 161, 95, 190, 97, 194, 153, 47, 94, 188, 101, 202, 137, 15, 30,
		60, 120, 240, 253, 231, 211, 187, 107, 214, 177, 127, 254, 225, 223, 163, 91, 182, 113, 226, 217, 175, 67, 134, 17,
		34, 68, 136, 13, 26, 52, 104, 208, 189, 103, 206, 129, 31, 62, 124, 248, 237, 199, 147, 59, 118, 236, 197, 151, 51,
		102, 204, 133, 23, 46, 92, 184, 109, 218, 169, 79, 158, 33, 66, 132, 21, 42, 84, 168, 77, 154, 41, 82, 164, 85, 170,
		73, 146, 57, 114, 228, 213, 183, 115, 230, 209, 191, 99, 198, 145, 63, 126, 252, 229, 215, 179, 123, 246, 241, 255,
		227, 219, 171, 75, 150, 49, 98, 196, 149, 55, 110, 220, 165, 87, 174, 65, 130, 25, 50, 100, 200, 141, 7, 14, 28, 56,
		112, 224, 221, 167, 83, 166, 81, 162, 89, 178, 121, 242, 249, 239, 195, 155, 43, 86, 172, 69, 138, 9, 18, 36, 72,
		144, 61, 122, 244, 245, 247, 243, 251, 235, 203, 139, 11, 22, 44, 88, 176, 125, 250, 233, 207, 131, 27, 54, 108,
		216, 173, 71, 142, 0
	],
	PATTERNS = [
		[2, 1, 2, 2, 2, 2, 0, 0],
		[2, 2, 2, 1, 2, 2, 0, 0],
		[2, 2, 2, 2, 2, 1, 0, 0],
		[1, 2, 1, 2, 2, 3, 0, 0],
		[1, 2, 1, 3, 2, 2, 0, 0],
		[1, 3, 1, 2, 2, 2, 0, 0],
		[1, 2, 2, 2, 1, 3, 0, 0],
		[1, 2, 2, 3, 1, 2, 0, 0],
		[1, 3, 2, 2, 1, 2, 0, 0],
		[2, 2, 1, 2, 1, 3, 0, 0],
		[2, 2, 1, 3, 1, 2, 0, 0],
		[2, 3, 1, 2, 1, 2, 0, 0],
		[1, 1, 2, 2, 3, 2, 0, 0],
		[1, 2, 2, 1, 3, 2, 0, 0],
		[1, 2, 2, 2, 3, 1, 0, 0],
		[1, 1, 3, 2, 2, 2, 0, 0],
		[1, 2, 3, 1, 2, 2, 0, 0],
		[1, 2, 3, 2, 2, 1, 0, 0],
		[2, 2, 3, 2, 1, 1, 0, 0],
		[2, 2, 1, 1, 3, 2, 0, 0],
		[2, 2, 1, 2, 3, 1, 0, 0],
		[2, 1, 3, 2, 1, 2, 0, 0],
		[2, 2, 3, 1, 1, 2, 0, 0],
		[3, 1, 2, 1, 3, 1, 0, 0],
		[3, 1, 1, 2, 2, 2, 0, 0],
		[3, 2, 1, 1, 2, 2, 0, 0],
		[3, 2, 1, 2, 2, 1, 0, 0],
		[3, 1, 2, 2, 1, 2, 0, 0],
		[3, 2, 2, 1, 1, 2, 0, 0],
		[3, 2, 2, 2, 1, 1, 0, 0],
		[2, 1, 2, 1, 2, 3, 0, 0],
		[2, 1, 2, 3, 2, 1, 0, 0],
		[2, 3, 2, 1, 2, 1, 0, 0],
		[1, 1, 1, 3, 2, 3, 0, 0],
		[1, 3, 1, 1, 2, 3, 0, 0],
		[1, 3, 1, 3, 2, 1, 0, 0],
		[1, 1, 2, 3, 1, 3, 0, 0],
		[1, 3, 2, 1, 1, 3, 0, 0],
		[1, 3, 2, 3, 1, 1, 0, 0],
		[2, 1, 1, 3, 1, 3, 0, 0],
		[2, 3, 1, 1, 1, 3, 0, 0],
		[2, 3, 1, 3, 1, 1, 0, 0],
		[1, 1, 2, 1, 3, 3, 0, 0],
		[1, 1, 2, 3, 3, 1, 0, 0],
		[1, 3, 2, 1, 3, 1, 0, 0],
		[1, 1, 3, 1, 2, 3, 0, 0],
		[1, 1, 3, 3, 2, 1, 0, 0],
		[1, 3, 3, 1, 2, 1, 0, 0],
		[3, 1, 3, 1, 2, 1, 0, 0],
		[2, 1, 1, 3, 3, 1, 0, 0],
		[2, 3, 1, 1, 3, 1, 0, 0],
		[2, 1, 3, 1, 1, 3, 0, 0],
		[2, 1, 3, 3, 1, 1, 0, 0],
		[2, 1, 3, 1, 3, 1, 0, 0],
		[3, 1, 1, 1, 2, 3, 0, 0],
		[3, 1, 1, 3, 2, 1, 0, 0],
		[3, 3, 1, 1, 2, 1, 0, 0],
		[3, 1, 2, 1, 1, 3, 0, 0],
		[3, 1, 2, 3, 1, 1, 0, 0],
		[3, 3, 2, 1, 1, 1, 0, 0],
		[3, 1, 4, 1, 1, 1, 0, 0],
		[2, 2, 1, 4, 1, 1, 0, 0],
		[4, 3, 1, 1, 1, 1, 0, 0],
		[1, 1, 1, 2, 2, 4, 0, 0],
		[1, 1, 1, 4, 2, 2, 0, 0],
		[1, 2, 1, 1, 2, 4, 0, 0],
		[1, 2, 1, 4, 2, 1, 0, 0],
		[1, 4, 1, 1, 2, 2, 0, 0],
		[1, 4, 1, 2, 2, 1, 0, 0],
		[1, 1, 2, 2, 1, 4, 0, 0],
		[1, 1, 2, 4, 1, 2, 0, 0],
		[1, 2, 2, 1, 1, 4, 0, 0],
		[1, 2, 2, 4, 1, 1, 0, 0],
		[1, 4, 2, 1, 1, 2, 0, 0],
		[1, 4, 2, 2, 1, 1, 0, 0],
		[2, 4, 1, 2, 1, 1, 0, 0],
		[2, 2, 1, 1, 1, 4, 0, 0],
		[4, 1, 3, 1, 1, 1, 0, 0],
		[2, 4, 1, 1, 1, 2, 0, 0],
		[1, 3, 4, 1, 1, 1, 0, 0],
		[1, 1, 1, 2, 4, 2, 0, 0],
		[1, 2, 1, 1, 4, 2, 0, 0],
		[1, 2, 1, 2, 4, 1, 0, 0],
		[1, 1, 4, 2, 1, 2, 0, 0],
		[1, 2, 4, 1, 1, 2, 0, 0],
		[1, 2, 4, 2, 1, 1, 0, 0],
		[4, 1, 1, 2, 1, 2, 0, 0],
		[4, 2, 1, 1, 1, 2, 0, 0],
		[4, 2, 1, 2, 1, 1, 0, 0],
		[2, 1, 2, 1, 4, 1, 0, 0],
		[2, 1, 4, 1, 2, 1, 0, 0],
		[4, 1, 2, 1, 2, 1, 0, 0],
		[1, 1, 1, 1, 4, 3, 0, 0],
		[1, 1, 1, 3, 4, 1, 0, 0],
		[1, 3, 1, 1, 4, 1, 0, 0],
		[1, 1, 4, 1, 1, 3, 0, 0],
		[1, 1, 4, 3, 1, 1, 0, 0],
		[4, 1, 1, 1, 1, 3, 0, 0],
		[4, 1, 1, 3, 1, 1, 0, 0],
		[1, 1, 3, 1, 4, 1, 0, 0],
		[1, 1, 4, 1, 3, 1, 0, 0],
		[3, 1, 1, 1, 4, 1, 0, 0],
		[4, 1, 1, 1, 3, 1, 0, 0],
		[2, 1, 1, 4, 1, 2, 0, 0],
		[2, 1, 1, 2, 1, 4, 0, 0],
		[2, 1, 1, 2, 3, 2, 0, 0],
		[2, 3, 3, 1, 1, 1, 2, 0]
	],
	UNIT_CONVERSION = function(t) {
		return uni.upx2px(Number(t))
	},
	getPixelRatio = function(t) {
		return uni.getSystemInfoSync()[t || "pixelRatio"]
	},
	getTimeDate = function() {
		var t = new Date;
		return t.toLocaleDateString().replace(/\//g, "-") + " " + t.toTimeString().slice(0, 8)
	},
	GETSIZE = {
		"MP-ALIPAY": function(t) {
			return UNIT_CONVERSION(t) * getPixelRatio()
		},
		"MP-WEIXIN": function(t) {
			return UNIT_CONVERSION(t)
		},
		"MP-BAIDU": function(t) {
			return UNIT_CONVERSION(t)
		},
		"MP-TOUTIAO": function(t) {
			return UNIT_CONVERSION(t)
		},
		"MP-QQ": function(t) {
			return UNIT_CONVERSION(t)
		},
		"MP-LARK": function(t) {
			return UNIT_CONVERSION(t)
		},
		"MP-KUAISHOU": function(t) {
			return UNIT_CONVERSION(t)
		},
		"MP-360": function(t) {
			return UNIT_CONVERSION(t)
		},
		"QUICKAPP-WEBVIEW": function(t) {
			return UNIT_CONVERSION(t)
		},
		"QUICKAPP-WEBVIEW-UNION": function(t) {
			return UNIT_CONVERSION(t)
		},
		"QUICKAPP-WEBVIEW-HUAWEI": function(t) {
			return UNIT_CONVERSION(t)
		},
		MP: function(t) {
			return UNIT_CONVERSION(t)
		},
		"APP-PLUS": function(t) {
			return UNIT_CONVERSION(t)
		},
		NVUE: function(t) {
			return UNIT_CONVERSION(t)
		},
		H5: function(t) {
			return UNIT_CONVERSION(t)
		},
		none: function(t) {
			return UNIT_CONVERSION(t)
		}
	},
	UtF16TO8 = function(t) {
		for (var e, i = t.toString(), r = "", o = 0; o < i.length; o++) 1 <= (e = i.charCodeAt(o)) && e <= 127 ? r += i
			.charAt(o) : (2047 < e ? (r += String.fromCharCode(224 | e >> 12 & 15), r += String.fromCharCode(128 | e >> 6 &
				63)) : r += String.fromCharCode(192 | e >> 6 & 31), r += String.fromCharCode(128 | e >> 0 & 63));
		return r
	},
	SaveCodeImg = function(t) {
		var i = UNIT_CONVERSION(Number(t.width)),
			r = UNIT_CONVERSION(Number(t.height)),
			e = getPixelRatio("pixelRatio"),
			o = i * e,
			s = r * e;
		return "MP-ALIPAY" == t.source && (i = o, r = s), new Promise(function(e) {
			"[object String]" == Object.prototype.toString.call(t.id) ? uni.canvasToTempFilePath({
				canvasId: t.id,
				width: i,
				height: r,
				destWidth: o,
				destHeight: s,
				fileType: t.type || "jpg",
				quality: t.quality || 1,
				complete: function(t) {
					e(t)
				}
			}, t.ctx) : "[object Object]" == Object.prototype.toString.call(t.id) && t.id.toTempFilePath(0, 0, i, r, o,
				s, t.type || "png", 1,
				function(t) {
					e(t)
				})
		})
	},
	SetGradient = function(t, e, i, r) {
		i = t.createLinearGradient(0, 0, e, i);
		return 1 === r.length && (i.addColorStop(0, r[0]), i.addColorStop(1, r[0])), 2 === r.length && (i.addColorStop(0, r[
			0]), i.addColorStop(1, r[1])), 3 === r.length && (i.addColorStop(0, r[0]), i.addColorStop(.5, r[1]), i
			.addColorStop(1, r[2])), 4 === r.length && (i.addColorStop(0, r[0]), i.addColorStop(.35, r[1]), i.addColorStop(
			.7, r[2]), i.addColorStop(1, r[3])), 5 === r.length && (i.addColorStop(0, r[0]), i.addColorStop(.35, r[1]), i
			.addColorStop(.6, r[2]), i.addColorStop(.8, r[3]), i.addColorStop(1, r[4])), 6 === r.length && (i.addColorStop(
			0, r[0]), i.addColorStop(.25, r[1]), i.addColorStop(.45, r[2]), i.addColorStop(.65, r[3]), i.addColorStop(.85,
			r[4]), i.addColorStop(1, r[5])), 7 === r.length && (i.addColorStop(0, r[0]), i.addColorStop(.15, r[1]), i
			.addColorStop(.35, r[2]), i.addColorStop(.45, r[3]), i.addColorStop(.65, r[4]), i.addColorStop(.85, r[5]), i
			.addColorStop(1, r[6])), 8 === r.length && (i.addColorStop(0, r[0]), i.addColorStop(.1, r[1]), i.addColorStop(
			.25, r[2]), i.addColorStop(.45, r[3]), i.addColorStop(.65, r[4]), i.addColorStop(.85, r[5]), i.addColorStop(
			.9, r[6]), i.addColorStop(1, r[7])), 9 === r.length && (i.addColorStop(0, r[0]), i.addColorStop(.2, r[1]), i
			.addColorStop(.3, r[2]), i.addColorStop(.5, r[3]), i.addColorStop(.6, r[4]), i.addColorStop(.7, r[5]), i
			.addColorStop(.8, r[6]), i.addColorStop(.9, r[7]), i.addColorStop(1, r[8])), 10 <= r.length && (i.addColorStop(
				0, r[0]), i.addColorStop(.1, r[1]), i.addColorStop(.2, r[2]), i.addColorStop(.3, r[3]), i.addColorStop(.4, r[
				4]), i.addColorStop(.5, r[5]), i.addColorStop(.6, r[6]), i.addColorStop(.7, r[7]), i.addColorStop(.85, r[8]),
			i.addColorStop(1, r[9])), i
	},
	QRCodeInit = function() {
		function t(t) {
			void 0 === t && (t = 2), this.strinbuf = [], this.eccbuf = [], this.qrframe = [], this.framask = [], this
				.rlens = [], this.genpoly = [], this.ecclevel = 2, this.N1 = 3, this.N2 = 3, this.N3 = 40, this.N4 = 10, this
				.neccblk2 = 0, this.width = 0, this.neccblk1 = 0, this.datablkw = 0, this.eccblkwid = 0, this.ecclevel = t
		}
		return t.prototype.setmask = function(t, e) {
			var i = null;
			e < t && (i = t, t = e, e = i), i = e, i *= e, i += e, i >>= 1, this.framask[i += t] = 1
		}, t.prototype.getWidth = function() {
			return this.width
		}, t.prototype.putalign = function(t, e) {
			this.qrframe[t + this.width * e] = 1;
			for (var i = -2; i < 2; i++) this.qrframe[t + i + this.width * (e - 2)] = 1, this.qrframe[t - 2 + this.width * (
				e + i + 1)] = 1, this.qrframe[t + 2 + this.width * (e + i)] = 1, this.qrframe[t + i + 1 + this.width * (e +
				2)] = 1;
			for (i = 0; i < 2; i++) this.setmask(t - 1, e + i), this.setmask(t + 1, e - i), this.setmask(t - i, e - 1), this
				.setmask(t + i, e + 1)
		}, t.prototype.modnn = function(t) {
			for (; 255 <= t;) t = ((t -= 255) >> 8) + (255 & t);
			return t
		}, t.prototype.appendrs = function(t, e, i, r) {
			for (var o, s = 0; s < r; s++) this.strinbuf[i + s] = 0;
			for (s = 0; s < e; s++) {
				if (255 != (o = GLOG[this.strinbuf[t + s] ^ this.strinbuf[i]]))
					for (var n = 1; n < r; n++) this.strinbuf[i + n - 1] = this.strinbuf[i + n] ^ GEXP[this.modnn(o + this
						.genpoly[r - n])];
				else
					for (n = i; n < i + r; n++) this.strinbuf[n] = this.strinbuf[n + 1];
				this.strinbuf[i + r - 1] = 255 == o ? 0 : GEXP[this.modnn(o + this.genpoly[0])]
			}
		}, t.prototype.ismasked = function(t, e) {
			var i;
			return e < t && (i = t, t = e, e = i), i = e, i += e * e, i >>= 1, this.framask[i += t]
		}, t.prototype.badruns = function(t) {
			for (var e = 0, i = 0; i <= t; i++) 5 <= this.rlens[i] && (e += this.N1 + this.rlens[i] - 5);
			for (i = 3; i < t - 1; i += 2) this.rlens[i - 2] == this.rlens[i + 2] && this.rlens[i + 2] == this.rlens[i -
				1] && this.rlens[i - 1] == this.rlens[i + 1] && 3 * this.rlens[i - 1] == this.rlens[i] && (0 == this.rlens[i -
					3] || t < i + 3 || 3 * this.rlens[i - 3] >= 4 * this.rlens[i] || 3 * this.rlens[i + 3] >= 4 * this.rlens[
					i]) && (e += this.N3);
			return e
		}, t.prototype.toNum = function(t) {
			return 0 === t ? 1 : 0
		}, t.prototype.applymask = function(t) {
			switch (t) {
				case 0:
					for (var e = 0; e < this.width; e++)
						for (var i = 0; i < this.width; i++) i + e & 1 || this.ismasked(i, e) || (this.qrframe[i + e * this
							.width] ^= 1);
					break;
				case 1:
					for (e = 0; e < this.width; e++)
						for (i = 0; i < this.width; i++) 1 & e || this.ismasked(i, e) || (this.qrframe[i + e * this.width] ^= 1);
					break;
				case 2:
					for (e = 0; e < this.width; e++)
						for (var r = 0, i = 0; i < this.width; i++, r++)(r = 3 == r ? 0 : r) || this.ismasked(i, e) || (this
							.qrframe[i + e * this.width] ^= 1);
					break;
				case 3:
					for (var o = 0, e = 0; e < this.width; e++, o++)
						for (r = o = 3 == o ? 0 : o, i = 0; i < this.width; i++, r++)(r = 3 == r ? 0 : r) || this.ismasked(i,
							e) || (this.qrframe[i + e * this.width] ^= 1);
					break;
				case 4:
					for (e = 0; e < this.width; e++)
						for (r = 0, o = e >> 1 & 1, i = 0; i < this.width; i++, r++)(o = 3 == r ? (r = 0) < o ? 0 : 1 : o) || this
							.ismasked(i, e) || (this.qrframe[i + e * this.width] ^= 1);
					break;
				case 5:
					for (o = 0, e = 0; e < this.width; e++, o++) {
						3 == o && (o = 0);
						for (r = 0, i = 0; i < this.width; i++, r++) 3 == r && (r = 0), (i & e & 1) + this.toNum(this.toNum(r) |
							this.toNum(o)) || this.ismasked(i, e) || (this.qrframe[i + e * this.width] ^= 1)
					}
					break;
				case 6:
					for (o = 0, e = 0; e < this.width; e++, o++) {
						3 == o && (o = 0);
						for (r = 0, i = 0; i < this.width; i++, r++)(i & e & 1) + ((r = 3 == r ? 0 : r) && (r == o ? 1 : 0)) &
							1 || this.ismasked(i, e) || (this.qrframe[i + e * this.width] ^= 1)
					}
					break;
				case 7:
					for (o = 0, e = 0; e < this.width; e++, o++) {
						3 == o && (o = 0);
						for (r = 0, i = 0; i < this.width; i++, r++)((r = 3 == r ? 0 : r) && (r == o ? 1 : 0)) + (i + e & 1) &
							1 || this.ismasked(i, e) || (this.qrframe[i + e * this.width] ^= 1)
					}
			}
		}, t.prototype.Genframe = function(t) {
			var e = t.length,
				i = t.slice(0),
				r = 0,
				o = 0,
				s = 0,
				n = 0,
				h = 0,
				a = 0;
			do {
				if (o = 4 * (this.ecclevel - 1) + 16 * (++h - 1), this.neccblk1 = ECBLOCKS[o++], this.neccblk2 = ECBLOCKS[
					o++], this.datablkw = ECBLOCKS[o++], this.eccblkwid = ECBLOCKS[o], e <= (o = this.datablkw * (this
						.neccblk1 + this.neccblk2) + this.neccblk2 - 3 + (h <= 9 ? 1 : 0))) break
			} while (h < 40);
			this.width = 17 + 4 * h;
			for (var n = this.datablkw + (this.datablkw + this.eccblkwid) * (this.neccblk1 + this.neccblk2) + this.neccblk2,
					l = 0; l < n; l++) this.eccbuf[l] = 0;
			for (l = 0; l < this.width * this.width; l++) this.qrframe[l] = 0;
			for (l = 0; l < (this.width * (this.width + 1) + 1) / 2; l++) this.framask[l] = 0;
			for (l = 0; l < 3; l++) {
				s = o = 0, 1 == l && (o = this.width - 7), 2 == l && (s = this.width - 7), this.qrframe[s + 3 + this.width * (
					o + 3)] = 1;
				for (var c = 0; c < 6; c++) this.qrframe[s + c + this.width * o] = 1, this.qrframe[s + this.width * (o + c +
						1)] = 1, this.qrframe[s + 6 + this.width * (o + c)] = 1, this.qrframe[s + c + 1 + this.width * (o + 6)] =
					1;
				for (c = 1; c < 5; c++) this.setmask(s + c, o + 1), this.setmask(s + 1, o + c + 1), this.setmask(s + 5, o +
					c), this.setmask(s + c + 1, o + 5);
				for (c = 2; c < 4; c++) this.qrframe[s + c + this.width * (o + 2)] = 1, this.qrframe[s + 2 + this.width * (o +
					c + 1)] = 1, this.qrframe[s + 4 + this.width * (o + c)] = 1, this.qrframe[s + c + 1 + this.width * (o +
					4)] = 1
			}
			if (1 < h)
				for (e = ADELTA[h], s = this.width - 7;;) {
					for (r = this.width - 7; e - 3 < r && (this.putalign(r, s), !(r < e));) r -= e;
					if (s <= e + 9) break;
					s -= e, this.putalign(6, s), this.putalign(s, 6)
				}
			this.qrframe[8 + this.width * (this.width - 8)] = 1;
			for (var d = 0; d < 7; d++) this.setmask(7, d), this.setmask(this.width - 8, d), this.setmask(7, d + this
				.width - 7);
			for (c = 0; c < 8; c++) this.setmask(c, 7), this.setmask(c + this.width - 8, 7), this.setmask(c, this.width -
			8);
			for (c = 0; c < 9; c++) this.setmask(c, 8);
			for (c = 0; c < 8; c++) this.setmask(c + this.width - 8, 8), this.setmask(8, c);
			for (d = 0; d < 7; d++) this.setmask(8, d + this.width - 7);
			for (c = 0; c < this.width - 14; c++) 1 & c ? (this.setmask(8 + c, 6), this.setmask(6, 8 + c)) : (this.qrframe[
				8 + c + 6 * this.width] = 1, this.qrframe[6 + this.width * (8 + c)] = 1);
			if (6 < h)
				for (e = VPAT[h - 7], o = 17, c = 0; c < 6; c++)
					for (d = 0; d < 3; d++, o--) 1 & (11 < o ? h >> o - 12 : e >> o) ? (this.qrframe[5 - c + this.width * (2 -
						d + this.width - 11)] = 1, this.qrframe[2 - d + this.width - 11 + this.width * (5 - c)] = 1) : (this
						.setmask(5 - c, 2 - d + this.width - 11), this.setmask(2 - d + this.width - 11, 5 - c));
			for (d = 0; d < this.width; d++)
				for (c = 0; c <= d; c++) this.qrframe[c + this.width * d] && this.setmask(c, d);
			n = i.length;
			for (var f = 0; f < n; f++) this.eccbuf[f] = i.charCodeAt(f);
			if (this.strinbuf = this.eccbuf.slice(0), (r = this.datablkw * (this.neccblk1 + this.neccblk2) + this
				.neccblk2) - 2 <= n && (n = r - 2, 9 < h && n--), a = n, 9 < h) {
				for (this.strinbuf[a + 2] = 0, this.strinbuf[a + 3] = 0; a--;) e = this.strinbuf[a], this.strinbuf[a + 3] |=
					255 & e << 4, this.strinbuf[a + 2] = e >> 4;
				this.strinbuf[2] |= 255 & n << 4, this.strinbuf[1] = n >> 4, this.strinbuf[0] = 64 | n >> 12
			} else {
				for (this.strinbuf[a + 1] = 0, this.strinbuf[a + 2] = 0; a--;) e = this.strinbuf[a], this.strinbuf[a + 2] |=
					255 & e << 4, this.strinbuf[a + 1] = e >> 4;
				this.strinbuf[1] |= 255 & n << 4, this.strinbuf[0] = 64 | n >> 4
			}
			for (a = n + 3 - (h < 10 ? 1 : 0); a < r;) this.strinbuf[a++] = 236, this.strinbuf[a++] = 17;
			this.genpoly[0] = 1;
			for (f = 0; f < this.eccblkwid; f++) {
				this.genpoly[f + 1] = 1;
				for (var u = f; 0 < u; u--) this.genpoly[u] = this.genpoly[u] ? this.genpoly[u - 1] ^ GEXP[this.modnn(GLOG[
					this.genpoly[u]] + f)] : this.genpoly[u - 1];
				this.genpoly[0] = GEXP[this.modnn(GLOG[this.genpoly[0]] + f)]
			}
			for (f = 0; f <= this.eccblkwid; f++) this.genpoly[f] = GLOG[this.genpoly[f]];
			o = r;
			for (s = 0, f = 0; f < this.neccblk1; f++) this.appendrs(s, this.datablkw, o, this.eccblkwid), s += this
				.datablkw, o += this.eccblkwid;
			for (f = 0; f < this.neccblk2; f++) this.appendrs(s, this.datablkw + 1, o, this.eccblkwid), s += this.datablkw +
				1, o += this.eccblkwid;
			for (f = s = 0; f < this.datablkw; f++) {
				for (u = 0; u < this.neccblk1; u++) this.eccbuf[s++] = this.strinbuf[f + u * this.datablkw];
				for (u = 0; u < this.neccblk2; u++) this.eccbuf[s++] = this.strinbuf[this.neccblk1 * this.datablkw + f + u * (
					this.datablkw + 1)]
			}
			for (u = 0; u < this.neccblk2; u++) this.eccbuf[s++] = this.strinbuf[this.neccblk1 * this.datablkw + a + u * (
				this.datablkw + 1)];
			for (f = 0; f < this.eccblkwid; f++)
				for (u = 0; u < this.neccblk1 + this.neccblk2; u++) this.eccbuf[s++] = this.strinbuf[r + f + u * this
					.eccblkwid];
			this.strinbuf = this.eccbuf, r = s = this.width - 1, o = n = 1;
			for (var p = (this.datablkw + this.eccblkwid) * (this.neccblk1 + this.neccblk2) + this.neccblk2, f = 0; f <
				p; f++) {
				e = this.strinbuf[f];
				for (u = 0; u < 8; u++, e <<= 1)
					for (128 & e && (this.qrframe[r + this.width * s] = 1); n ? r-- : (r++, o ? 0 != s ? s-- : (o = 0 === o ?
							1 : 0, 6 == (r -= 2) && (r--, s = 9)) : s != this.width - 1 ? s++ : (o = 0 === o ? 1 : 0, 6 == (r -=
							2) && (r--, s -= 8))), n = 0 < n ? 0 : 1, this.ismasked(r, s););
			}
			for (this.strinbuf = this.qrframe.slice(0), s = 3e4, o = e = 0; o < 8 && (this.applymask(o), (r = this
				.badcheck()) < s && (s = r, e = o), 7 != e); o++) this.qrframe = this.strinbuf.slice(0);
			e != o && this.applymask(e), s = fmtword[e + (this.ecclevel - 1 << 3)];
			for (var S = 0; S < 8; S++, s >>= 1) 1 & s && (this.qrframe[this.width - 1 - S + 8 * this.width] = 1, S < 6 ?
				this.qrframe[8 + this.width * S] = 1 : this.qrframe[8 + this.width * (S + 1)] = 1);
			for (S = 0; S < 7; S++, s >>= 1) 1 & s && (this.qrframe[8 + this.width * (this.width - 7 + S)] = 1, S ? this
				.qrframe[6 - S + 8 * this.width] = 1 : this.qrframe[7 + 8 * this.width] = 1);
			return this.qrframe
		}, t.prototype.badcheck = function() {
			for (var t = 0, e = 0, i = 0, r = 0, o = 0, s = 0, n = 0, h = 0; h < this.width - 1; h++)
				for (var a = 0; a < this.width - 1; a++)(this.qrframe[a + this.width * h] && this.qrframe[a + 1 + this.width *
					h] && this.qrframe[a + this.width * (h + 1)] && this.qrframe[a + 1 + this.width * (h + 1)] || !(this
					.qrframe[a + this.width * h] || this.qrframe[a + 1 + this.width * h] || this.qrframe[a + this.width * (
						h + 1)] || this.qrframe[a + 1 + this.width * (h + 1)])) && (t += this.N2);
			for (h = 0; h < this.width; h++) {
				for (i = r = s = this.rlens[0] = 0; s < this.width; s++)(o = this.qrframe[s + this.width * h]) == r ? this
					.rlens[i]++ : this.rlens[++i] = 1, e += (r = o) ? 1 : -1;
				t += this.badruns(i)
			}
			var l = e = e < 0 ? -e : e,
				c = 0;
			for (l += l << 2, l <<= 1; l > this.width * this.width;) l -= this.width * this.width, c++;
			t += c * this.N4;
			for (a = 0; a < this.width; a++) {
				for (i = r = n = this.rlens[0] = 0; n < this.width; n++)(o = this.qrframe[a + this.width * n]) == r ? this
					.rlens[i]++ : this.rlens[++i] = 1, r = o;
				t += this.badruns(i)
			}
			return t
		}, t
	}(),
	StringToCode128 = function(t) {
		var s = {
				currcs: 5
			},
			e = GetBytes(t),
			i = 126 == e[0] ? 1 : 0,
			t = 0 < e.length ? CodeSetAllowedFor(e[i++]) : 2,
			i = 0 < e.length ? CodeSetAllowedFor(e[i++]) : 2;
		s.currcs = getBestStartSet(t, i), s.currcs = function(t, e) {
			for (var i = 0; i < t.length; i++) {
				var r = t[i];
				if ((r < 48 || 57 < r) && 126 != r) return e
			}
			return 5
		}(e, s.currcs);
		var r = [];
		switch (s.currcs) {
			case 3:
				r.push(103);
				break;
			case 4:
				r.push(104);
				break;
			default:
				r.push(105)
		}
		for (var o = 0; o < e.length; o++) {
			var n = e[o];
			n in REPLACE_CODES && (r.push(REPLACE_CODES[n]), n = e[++o]);
			var h = e.length > o + 1 ? e[o + 1] : -1,
				r = r.concat(function(t, e, i) {
					var r = [],
						o = -1;
					if (charCompatible(t, i)) 5 == i && (-1 == e ? (o = 100, i = 4) : charCompatible(e, i) || (i =
						charCompatible(e, 3) ? (o = 101, 3) : (o = 100, 4)));
					else if (-1 == e || charCompatible(e, i)) o = 98;
					else switch (i) {
						case 3:
							o = 100, i = 4;
							break;
						case 4:
							o = 101, i = 3
					}
					return -1 != o ? (r.push(o), r.push(codeValue(t))) : 5 == i ? r.push(codeValue(t, e)) : r.push(codeValue(
						t)), s.currcs = i, r
				}(n, h, s.currcs));
			5 == s.currcs && o++
		}
		for (var a = r[0], l = 1; l < r.length; l++) a += l * r[l];
		return r.push(a % 103), r.push(106), r
	},
	GetBytes = function(t) {
		for (var e = [], i = 0; i < t.length; i++) e.push(t.charCodeAt(i));
		return e
	},
	CodeSetAllowedFor = function(t) {
		return 48 <= t && t <= 57 ? 1 : 32 <= t && t <= 95 ? 2 : t < 32 ? 3 : 4
	},
	getBestStartSet = function(t, e) {
		var i = 0;
		return i += 3 == t ? 1 : 0, i += 4 == t ? -1 : 0, i += 3 == e ? 1 : 0, 0 < (i += 4 == e ? -1 : 0) ? 3 : 4
	},
	codeValue = function(t, e) {
		return void 0 === e ? 32 <= t ? t - 32 : t + 64 : parseInt(String.fromCharCode(t) + String.fromCharCode(e))
	},
	charCompatible = function(t, e) {
		t = codeSetAllowedFor(t);
		return 1 == t || (2 == t || (3 == t && 3 == e || 4 == t && 4 == e))
	},
	codeSetAllowedFor = function(t) {
		return 48 <= t && t <= 57 ? 1 : 32 <= t && t <= 95 ? 2 : t < 32 ? 3 : 4
	},
	REPLACE_CODES = {
		CHAR_TILDE: 102
	},
	BarCode128 = StringToCode128,
	OperationCode = function(t, e) {
		var i, r;
		t.code ? t.id ? (r = (new Date).getTime(), "[object String]" == Object.prototype.toString.call(t.id) ? (i = uni
					.createCanvasContext(t.id, t.ctx || null), BarCodeCanvas(r, t, i, e)) : "[object Object]" == Object.prototype
				.toString.call(t.id) && (i = t.id, BarCodeCanvas(r, t, i, e))) : console.warn("没有找到条形码canvas id或者实列!") : console
			.warn("没有找到条形码code")
	},
	BarCodeCanvas = function(t, e, i, r) {
		var o = e.text ? (e.text.size || 40) + (e.text.padding || 20) : 0,
			s = GETSIZE[e.source || "none"](e.width),
			n = GETSIZE[e.source || "none"](e.height),
			h = UtF16TO8(e.code);
		i.setFillStyle(e.bgColor || "#FFFFFF"), "horizontal" == e.orient ? i.fillRect(0, 0, s, GETSIZE[e.source || "none"](e
			.height + o)) : i.fillRect(0, 0, GETSIZE[e.source || "none"](e.height + o), s), i.setFillStyle(e.bgColor ||
			"#FFFFFF");
		o = new GraphicContentInit(i, s, n);
		e.color ? SetBarCodeColors(i, s, n, e.color || ["#000000"], e.orient) : i.setFillStyle("#000000"), SetBarCodeType[e
			.type || "CODE128"](h, o, n, e.orient, e.text), e.text && setBarCodeText(i, e.text, s, n, e.source || "H5", e
			.orient || "horizontal"), starDraw$1(i, e, t, r)
	},
	starDraw$1 = function(t, s, n, h) {
		var e = this;
		setTimeout(function() {
			t.draw(!1, function(o) {
				return __awaiter(e, void 0, void 0, function() {
					var e, i, r;
					return __generator(this, function(t) {
						switch (t.label) {
							case 0:
								return h ? (e = h, i = [__assign({}, o)], r = {
									createTime: getTimeDate(),
									takeUpTime: (new Date).getTime() - n
								}, [4, SaveCodeImg({
									width: "vertical" == s.orient ? s.height : s.width,
									height: "vertical" == s.orient ? s.width : s.height,
									id: s.id,
									source: s.source,
									ctx: s.ctx || null
								})]) : [3, 2];
							case 1:
								return e.apply(void 0, [__assign.apply(void 0, i.concat([(r.img = t.sent(), r.model =
									getPixelRatio("model"), r.system = getPixelRatio("system"), r.platform =
									getPixelRatio("platform"), r.code = s.code, r.source = s.source, r.with =
									UNIT_CONVERSION(s.width), r.height = UNIT_CONVERSION(s.height), r.id =
									"[object String]" == Object.prototype.toString.call(s.id) ? s.id : "nvue",
									r)]))]), [3, 3];
							case 2:
								t.label = 3;
							case 3:
								return [2]
						}
					})
				})
			})
		})
	},
	SetBarCodeColors = function(t, e, i, r, o) {
		r = SetGradient(t, "vertical" == (o = void 0 === o ? "horizontal" : o) ? i : e, "vertical" == o ? e : i, r);
		t.setFillStyle(r)
	},
	setBarCodeText = function(t, e, i, r, o, s) {
		var n = e.color || ["#000000"],
			h = SetGradient(t, i, r, n);
		t.setGlobalAlpha((null == e ? void 0 : e.opacity) || 1), t.setTextAlign("center"), t.setTextBaseline("middle"), t
			.setFillStyle("#000000"), t.setFontSize(UNIT_CONVERSION(e.size || 40)), "H5" == o ? t.setFillStyle(h) : t
			.setFillStyle(n[0]);
		n = "bottom" == e.position ? r + UNIT_CONVERSION((e.padding || 40) + (e.size || 20) / 2) : UNIT_CONVERSION(e.size) /
			2;
		"vertical" == s ? (t.rotate(90 * Math.PI / 180), "bottom" == e.position ? (t.translate(i, -r), t.fillText(e.content,
			-i / 2, -UNIT_CONVERSION(e.padding || 20 + (e.size || 40) / 2))) : (t.translate(-i / 2, -n), t.fillText(e
			.content, i, -n))) : t.fillText(e.content, i / 2, n), t.setGlobalAlpha(1)
	},
	SetBarCodeType = {
		CODE128: function(t, e, i, r, o) {
			void 0 === r && (r = "horizontal");
			var s = BarCode128(t),
				n = e.area.width / (11 * (s.length - 3) + 35),
				h = e.area.left,
				t = 0;
			o && "bottom" != o.position && (t = UNIT_CONVERSION(((null == o ? void 0 : o.size) || 40) + ((null == o ?
				void 0 : o.padding) || 20)));
			for (var a = e.area.top + t, l = i - e.area.top, c = 0; c < s.length; c++)
				for (var d = s[c], f = 0; f < 8; f += 2) {
					var u = PATTERNS[d][f] * n,
						p = PATTERNS[d][f + 1] * n;
					0 < u && e.fillFgRect("vertical" == r ? a : h, "vertical" == r ? h : a, "vertical" == r ? l : u,
						"vertical" == r ? u : l), h += u + p
				}
		},
		CODE39: function(t, e, i) {
			console.error("条形码编码类型：CODE39暂未实现")
		},
		EAN13: function(t, e, i) {
			-1 !== t.search(/^[0-9]{12}$/) ? console.error("条形码编码类型：EAN暂未实现") : console.error("条形码编码：code不符合EAN13规范")
		},
		UPCE: function(t, e, i) {
			-1 !== t.search(/^[0-9]{6}$/) ? console.error("条形码编码类型：EAN暂未实现") : console.error("条形码编码：code不符合UPCE规范")
		},
		UPC: function(t, e, i) {
			-1 !== t.search(/^[0-9]{1}$/) ? console.error("条形码编码类型：EAN暂未实现") : console.error("条形码编码：code不符合UPC规范")
		},
		ITF: function(t, e, i) {
			-1 !== t.search(/^([0-9]{2})+$/) ? console.error("条形码编码类型：ITF暂未实现") : console.error("条形码编码：code不符合ITF规范")
		},
		ITF14: function(t, e, i) {
			-1 !== t.search(/^[0-9]{14}$/) ? console.error("条形码编码类型：ITF14暂未实现") : console.error("条形码编码：code不符合ITF14规范")
		},
		MSI: function(t, e, i) {
			-1 !== t.search(/^[0-9]+$/) ? console.error("条形码编码类型：MSI暂未实现") : console.error("条形码编码：code不符合MSI规范")
		},
		Codabar: function(t, e, i) {
			-1 !== t.search(/^[A-D][0-9\-\$\:\.\+\/]+[A-D]$/) ? console.error("条形码编码类型：Codabar暂未实现") : console.error(
				"条形码编码：code不符合Codabar规范")
		},
		Pharmacode: function(t, e, i) {
			!isNaN(parseInt(t, 10)) && 3 <= Number(t) && Number(t) <= 131070 ? console.error("条形码编码类型：Pharmacode暂未实现") :
				console.error("条形码编码：code不符合Pharmacode类型")
		}
	},
	GraphicContentInit = function() {
		function t(t, e, i) {
			this.borderSize = 0, this.paddingWidth = 0, this.ctx = t, this.width = e, this.height = i, this.quiet = Math
				.round(this.width / 40), this.area = {
					width: e - 2 * this.paddingWidth - 2 * this.quiet,
					height: i - 2 * this.borderSize,
					top: this.borderSize - 4,
					left: this.borderSize + this.quiet
				}, this.fillBgRect(0, 0, e, i), this.fillBgRect(0, this.borderSize, e, i - 2 * this.borderSize)
		}
		return t.prototype.fillFgRect = function(t, e, i, r) {
			this.FILLRECT(t, e, i, r)
		}, t.prototype.fillBgRect = function(t, e, i, r) {
			this.FILLRECT(t, e, i, r)
		}, t.prototype.FILLRECT = function(t, e, i, r) {
			this.ctx.fillRect(t, e, i, r)
		}, t
	}(),
	WidgetCode = function(t, e) {
		var i, r, o, s;
		t.code ? t.id ? (r = (new Date).getTime(), s = new QRCodeInit(t.level), (o = UtF16TO8(t.code)) ? (o = s.Genframe(o),
			s = s.getWidth(), "[object String]" == Object.prototype.toString.call(t.id) ? (i = uni.createCanvasContext(t
				.id, t.ctx || null), RepaintCanvas(r, t, i, o, s, e)) : "[object Object]" == Object.prototype.toString.call(
				t.id) && (i = t.id, RepaintCanvas(r, t, i, o, s, e))) : console.warn("二维码code转换错误")) : console.warn(
			"没有找到二维码canvas id或者实列!") : console.warn("没有找到二维码code")
	},
	RepaintCanvas = function(t, e, i, r, o, s) {
		var n = GETSIZE[e.source || "none"] ? GETSIZE[e.source || "none"](e.size) : UNIT_CONVERSION(e.size),
			h = GETSIZE[e.source || "none"] ? GETSIZE[e.source || "none"](e.size) : UNIT_CONVERSION(e.size),
			a = GETSIZE[e.source || "none"] ? GETSIZE[e.source || "none"](e.size) : UNIT_CONVERSION(e.size),
			l = (UNIT_CONVERSION(e.padding || 0) || 0) + (e.border ? e.border.lineWidth || 5 : 0),
			c = Math.round(n / (o + l)),
			d = Math.floor((n - c * o) / 2);
		i.clearRect(0, 0, h, a), i.setFillStyle(e.bgColor || "#FFFFFF"), i.fillRect(0, 0, h, a), e.src && i.drawImage(e.src,
			0, 0, n, n), e.color ? SetColorCode(i, h, a, e.color) : i.setFillStyle("#000000");
		for (var f = 0; f < o; f++)
			for (var u = 0; u < o; u++) r[u * o + f] && (SetCodeType[e.type || "none"], SetCodeType[e.type || "none"](e
				.bgColor, i, c * f + d, c * u + d, c, c, e.source));
		e.img && (SetImageType[(null === (l = e.img) || void 0 === l ? void 0 : l.type) || "none"] ? SetImageType[(null ===
					(l = e.img) || void 0 === l ? void 0 : l.type) || "none"](i, n, e.img, e.source || "none") : SetImageType
				.none(i, n, e.img, e.source || "none")), e.text && SetTextCode(i, h, a, e.text, e.source || "none"), e.border &&
			SetBorderCode(i, h, a, e.border, e.source || "none"), i.restore(), starDraw(i, e, t, s)
	},
	starDraw = function(t, s, n, h) {
		var e = this;
		setTimeout(function() {
			t.draw(!1, function(o) {
				return __awaiter(e, void 0, void 0, function() {
					var e, i, r;
					return __generator(this, function(t) {
						switch (t.label) {
							case 0:
								return h ? (e = h, i = [__assign({}, o)], r = {
									createTime: getTimeDate(),
									takeUpTime: (new Date).getTime() - n
								}, [4, SaveCodeImg({
									width: s.size,
									height: s.size,
									id: s.id,
									source: s.source,
									ctx: s.ctx || null
								})]) : [3, 2];
							case 1:
								return e.apply(void 0, [__assign.apply(void 0, i.concat([(r.img = t.sent(), r.source = s
									.source, r.model = getPixelRatio("model"), r.system = getPixelRatio(
										"system"), r.platform = getPixelRatio("platform"), r.code = s.code, r
									.size = UNIT_CONVERSION(s.size), r.id = "[object String]" == Object
									.prototype.toString.call(s.id) ? s.id : "nvue", r)]))]), [3, 3];
							case 2:
								t.label = 3;
							case 3:
								return [2]
						}
					})
				})
			})
		}, 300)
	},
	SetCodeType = {
		none: function(t, e, i, r, o, s, n) {
			e.fillRect(i, r, o, s)
		},
		starry: function(t, e, i, r, o, s, n) {
			e.drawImage("", i, r, o, s)
		},
		dots: function(t, e, i, r, o, s, n) {
			void 0 === t && (t = "#ffffff"), e.save(), e.beginPath(), e.arc(i, r, o / 2, 0, 2 * Math.PI), e.closePath(), e
				.fill(), e.setLineWidth(1), e.setStrokeStyle(t), e.stroke(), e.clip(), e.restore()
		},
		square: function(t, e, i, r, o, s, n) {
			void 0 === t && (t = "#ffffff"), "MP-BAIDU" != n ? (e.save(), e.beginPath(), e.moveTo(i, r), e.arcTo(i + o, r,
					i + o, r + s, 0), e.arcTo(i + o, r + s, i, r + s, 0), e.arcTo(i, r + s, i, r, 0), e.arcTo(i, r, i + o, r,
					0), e.fill(), e.closePath(), e.setLineWidth(1), e.setStrokeStyle(t), e.stroke(), e.clip(), e.restore()) : e
				.fillRect(i, r, o, s)
		},
		custom: function(t, e, i, r, o, s, n) {
			e.drawImage("", i, r, o, s)
		}
	},
	SetColorCode = function(t, e, i, r) {
		r = SetGradient(t, e, i, r);
		t.setFillStyle(r)
	},
	SetImageType = {
		none: function(t, e, i, r) {
			r = GETSIZE[r](i.size || 30), e = Number(((e - r) / 2).toFixed(2));
			t.save(), t.drawImage(i.src, e, e, r, r)
		},
		circle: function(t, e, i, r) {
			var o = GETSIZE[r](i.size || 30),
				s = 2 * o,
				n = e / 2 - o,
				h = e / 2 - o,
				a = n + o,
				e = h + o;
			t.save(), t.beginPath(), t.arc(a, e, o, 0, 2 * Math.PI), t.closePath(), t.setLineWidth(GETSIZE[r](i.width ||
				5)), t.setStrokeStyle(i.color || "#FFFFFF"), t.stroke(), t.clip(), t.drawImage(i.src, n, h, s, s)
		},
		round: function(t, e, i, r) {
			if ("MP-BAIDU" == r) {
				var o = GETSIZE[r](i.size || 30),
					s = 2 * o,
					n = e / 2 - o,
					h = e / 2 - o,
					a = n + o,
					l = h + o;
				return t.save(), t.beginPath(), t.arc(a, l, o, 0, 2 * Math.PI), t.closePath(), t.setLineWidth(GETSIZE[r](i
					.width || 5)), t.setStrokeStyle(i.color || "#FFFFFF"), t.stroke(), t.clip(), void t.drawImage(i.src, n, h,
					s, s)
			}
			l = i.degree || 5, o = GETSIZE[r](i.size || 30), n = o, h = o, s = e / 2 - o / 2, o = e / 2 - o / 2;
			h < 2 * (l = n < 2 * l ? n / 2 : l) && (l = h / 2), t.save(), t.beginPath(), t.moveTo(s + l, o), t.arcTo(s + n,
					o, s + n, o + h, l), t.arcTo(s + n, o + h, s, o + h, l), t.arcTo(s, o + h, s, o, l), t.arcTo(s, o, s + n, o,
					l), t.closePath(), t.setLineWidth(GETSIZE[r](i.width || 5)), t.setStrokeStyle(i.color || "#FFFFFF"), t
				.stroke(), t.clip(), t.drawImage(i.src, s, o, n, n)
		}
	},
	SetBorderCode = function(t, e, i, r, o) {
		var s = (null == r ? void 0 : r.color) || ["#000000"],
			n = (null == r ? void 0 : r.degree) || 5,
			s = SetGradient(t, e, i, s);
		t.restore(), t.setGlobalAlpha((null == r ? void 0 : r.opacity) || 1), "MP-BAIDU" == o ? (t.setLineWidth((null == r ?
			void 0 : r.lineWidth) || 5), t.setStrokeStyle(s), t.strokeRect(0, 0, e, i)) : (t.beginPath(), t.moveTo(0 + n,
			0), t.arcTo(0 + e, 0, 0 + e, 0 + i, n), t.arcTo(0 + e, 0 + i, 0, 0 + i, n), t.arcTo(0, 0 + i, 0, 0, n), t.arcTo(
				0, 0, 0 + e, 0, n), t.closePath(), t.setLineWidth((null == r ? void 0 : r.lineWidth) || 5), t.setStrokeStyle(
				s), t.stroke(), t.clip()), t.setGlobalAlpha(1)
	},
	SetTextCode = function(t, e, i, r, o) {
		var s = r.color || ["#FFFFFF"],
			i = SetGradient(t, e, i, s);
		t.restore(), t.setGlobalAlpha((null == r ? void 0 : r.opacity) || 1), t.setTextAlign("center"), t.setTextBaseline(
				"middle"), t.font = (null == r ? void 0 : r.font) || "normal 20px system-ui", "H5" == o ? t.setFillStyle(i) : t
			.setFillStyle(s[0]), t.fillText(r.content, e / 2, e / 2), t.setGlobalAlpha(1)
	},
	BarCode = OperationCode,
	QRCode = WidgetCode,
	GetImg = SaveCodeImg,
	GetPixelRatio = getPixelRatio,
	GetUtF16TO8 = UtF16TO8,
	GetPx = UNIT_CONVERSION;
export {
	BarCode,
	GetImg,
	GetPixelRatio,
	GetPx,
	GetUtF16TO8,
	QRCode
};