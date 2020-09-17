/**
 * 
 */
(function(){
	
	if (typeof geo == 'undefined') {
		geo = {};
	}
	
	geo.getWebRoot = function() {
		var contextPath = document.location.pathname;
		var end = contextPath.substr(1).indexOf('/') + 1;
		return contextPath.substr(0, end);
	}
	
	/**
	 * 计算两个坐标点位的直线距离
	 */
	geo.calcPosRange = function(x1, y1, x2, y2) {
		return Math.sqrt(Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2));
	}
	
	/**
	 * 是否空字符串
	 */
	geo.isNullStr = function(str) {
		if (undefined==str 
				|| str.trim().length==0 
				|| str.trim().toLowerCase()=='null') {
			return true;
		}
		return false;
	}
	
})();