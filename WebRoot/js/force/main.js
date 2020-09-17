/**
 * 
 */
require.config({
	baseUrl: "",
	urlArgs: 'vid='+_vid,
	paths: {
		"css": "js/css.min",
		"hoverInfo": "js/force/hoverInfo",
		"array": "js/array"
	},
	shim:{
		"hoverInfo":["css!js/css/hoverInfo"]
	}
});

var canvasPaper;
require(["hoverInfo", "array"], function(hoverInfo) {
	//document.querySelector('#board').style.background="url('.../../img/starbg.png')";
	canvasPaper = new CanvasPaper();
	d3.json(geo.getWebRoot()+"/data/demo.json?vid="+_vid).then(function(data) {
		console.info("init data",data)
		canvasPaper.addNodes(data.nodes);
		canvasPaper.addLinks(data.links);
		canvasPaper.render();
	})
	window.onresize = function(){
		canvasPaper.resize();
	}
});