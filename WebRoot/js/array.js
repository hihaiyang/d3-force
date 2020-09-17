/**
 * 移除元素
 * @param indexs 下标集合
 */
Array.prototype.remove = function(indexs) {
	if (undefined == indexs || indexs.length<1) {
		return;
	}
	var self = this;
	var arr = indexs.sort(function(m,n){return m-n;}).reverse();
	arr.forEach(function(index){
		self.splice(index, 1);
	});
}

/**
 * 排序-倒序
 */
Array.prototype.sortDesc = function() {
	var self = this;
	return self.sort().reverse();
}

/**
 * 放大/缩小
 * @param double 倍数
 * @returns {Array}
 */
Array.prototype.shrink = function(double) {
	if (undefined == double || typeof(double)!='number') {
		return this;
	}
	var self = this;
	self.forEach(function(item, index){
		self[index] = item * double;
	});
	return self;
}