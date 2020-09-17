define(["module"], function(module){
	
	var init = function() {
		var ht = ' \
			<div class="triangle"> \
				<div class="triangle-title"></div> \
				<div class="triangle-content"></div> \
			</dvi> \
			';
		$('body').append(ht);
	}
	
	var render = function() {
		
	}
	
	module.exports = {
		init:init(),
		render:render
	};
});