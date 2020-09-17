function CanvasPaper() {
	this.id = "#board";
	this.size = {
			width: document.documentElement.clientWidth,
			height: document.documentElement.clientHeight,
			rectWidth: document.documentElement.clientWidth*10,
			rectHeight: document.documentElement.clientHeight*10
	};
	this.color = {
			node_master: "#FCD209", //主节点
			node_comm: "#2E89FB", //1
			node_girl: "#EEB8DB", //2
			node_module: "#C8C8C8", //模型节点
			bg: "white", //背景
			nodetext: "#666666", //节点文字
			linetext: "#999999", //线上文字
			line: "#9CC7D8", //线
			line_other: "#F3AF4F", //线-其他
			line_checked: "red", //线-选中
			colors: d3.scaleOrdinal().domain(d3.range(10)).range(d3.schemeCategory10)
	};
	this.node = {
			main: 39,
			r: 20,
			icon: 18,
			distance: 120,
			iconpath: geo.getWebRoot()+'/img/icons/'
	};
	this.node['border'] = (this.node.r-this.node.icon)*2;
	this.enable = {
			highlight: false, //高亮
			nodetext: true, //节点文字
			relationship: true, //关系
			score: true, //分值
			nodetag: true, //标签
	};
	this.scaleExtent = [0.2, 6]; //缩放最小最大范围
	this.scale = 1; //缩放比例
	this.translate = [0, 0]; //平移坐标
	this.ctrlKey;
	this.shiftKey;
	
	/**画布*/
	this.paper; 
	/**force容器*/
	this.svg;
	this.simulation;
	this.nodes = [];
	this.links = [];
	this._links_container;
	this._nodes_container;
	this.init();
	this.renderForceSimulation();
}

/**
 * 初始svg
 */
CanvasPaper.prototype.init = function(){
	this.paper = d3.select(this.id)
			//.attr("tabindex", 1)
			//.on("keydown.brush", this.keydown)
			//.on("keyup.brush", this.keyup)
			//.each(function(){ this.focus(); })
			.append("svg")
			.attr("id", "svg")
			.attr("pointer-events", "all")
			.attr("xmlns", "http://www.w3.org/2000/svg")
			.attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
			.attr("width", this.size.width)
			.attr("height", this.size.height);
	this.createDefs();
	this.createRect();
	this.createContainer();
}
CanvasPaper.prototype.createDefs = function() {
	//五角星
	this.paper.append("symbol").append("path")
		.attr("id", "zdry_")
		.attr("class", "starpath")
		.attr("stroke", "none")
		.attr("d", "M25,-25 L19,-7 L35,-18 L15,-18 L31,-7 z");
	//箭头
	this.paper.append("defs").selectAll(".marker")
		.data([this.color.line, this.color.line_checked, this.color.line_other])
		.enter()
		.append("marker")
		.attr("class", "marker")
		.attr("id", function(d,i){return "arrow"+i;})
		.attr("markerUnits", "strokeWidth") //设置为strokeWidth箭头会随着线的粗细发生变化
		//.attr("markerUnits", "userSpaceOnUse")
		.attr("markerWidth", "12")
		.attr("markerHeight", "12")
		.attr("refX", "50")
		.attr("refY", "6")
		.attr("orient", "auto") //绘制方向，可设定为：auto（自动方向）和角度值
		.append("path")
		.attr("fill", function(d,i){return d;})
		.attr("d", "M2,2 L10,6 L2,10 L6,6 L2,2"); //箭头路径
}
/**
 * 画布缩放平移
 */
CanvasPaper.prototype.createRect = function() {
	var that = this;
	this.paper.append("g").attr("class","g-rect")
		.call(d3.zoom().scaleExtent(this.scaleExtent).on("zoom", function(){
			that.transform(d3.event.transform.k, [d3.event.transform.x, d3.event.transform.y]);
		}))
		.on("dblclick.zoom", null)
		.append("rect")
		.attr("width", this.size.rectWidth)
		.attr("height", this.size.rectHeight)
		.attr("x", -this.size.rectWidth/2)
		.attr("y", -this.size.rectHeight/2)
		.attr("opacity", 0);
}
/**
 * 图容器
 */
CanvasPaper.prototype.createContainer = function() {
	this.svg = this.paper.append("g")
		.attr("class", "g-container")
		.attr("transform", "translate(0,0)");
	this._links_container = this.svg.append("g").attr("class", "links-container");
	this._nodes_container = this.svg.append("g").attr("class", "nodes-container");
}
/**
 * 力导向图
 */
CanvasPaper.prototype.renderForceSimulation = function() {
	var self = this;
	self.simulation = d3.forceSimulation()
		.force("link", d3.forceLink().distance(function(){return self.node.distance;}))
		.force("charge", d3.forceManyBody().strength(-800))
		.force("center", d3.forceCenter().x(this.size.width/2).y(this.size.height/2))
		;
}
/**
 * 渲染
 */
CanvasPaper.prototype.render = function() {
	this.simulation.nodes(this.nodes).on("tick", this.ticked);
	this.simulation.force("link").links(this.links);
	this.bindData();
}
/**
 * 监听
 */
CanvasPaper.prototype.ticked = function(){
	canvasPaper.svg.selectAll(".nodes")
		.attr('transform', function(d) {
			return 'translate(' + d.x + ',' + d.y + ')'
		});
	canvasPaper.svg.selectAll("path.link")
		.attr("d", function(d,i){
			var m = [d.source.x, d.source.y];
			var l = [d.target.x, d.target.y];
			return "M"+m.join(",")+" L"+l.join(",");
		});
	canvasPaper.svg.selectAll(".linktext")
		.attr("dy", "-6")
		.attr("dx", function(d) {
			return geo.calcPosRange(d.source.x, d.source.y, d.target.x, d.target.y)/2;
		});
}
/**
 * 绑定数据
 */
CanvasPaper.prototype.bindData = function() {
	var that = this;
	//线
	var linksUpdate = that._links_container.selectAll("path.link").data(that.links, function(d){
		return "path_"+d.source.id+"_"+d.target.id;
	});
	linksUpdate.enter().insert("path", "g.nodes")
		.attr("id", function(d){
			return "path_"+d.source.id+"_"+d.target.id;
		})
		.attr("class", "link")
		.attr("stroke-width", 1)
		.attr("stroke", function(d,i){
			return that.color.line;
		})
		.attr("fill", "none")
		.attr("marker-end", function(d){
			return "url(#arrow0)";
		})
		.on("mouseover", function(d,i){
			that.setTipsInfo(d.source.text+"--"+d.target.text, "角色："+d.relation+"，信任度："+d.value);
		})
		.on("mouseout", function(d,i){
			that.setTipsInfo();
		});
	linksUpdate.exit().remove();
	
	//线上文字
	var linktextUpdate = that._links_container.selectAll("text.linktext").data(that.links, function(d){
		return "pathtext_"+d.source.id+"_"+d.target.id;
	});
	linktextUpdate.enter().append("text")
		.attr("id", function(d){
			return "pathtext_"+d.source.id+"_"+d.target.id;
		})
		.attr("class", "linktext")
		//.attr("text-anchor", "middle")
		.attr("fill", that.color.linetext)
		.append("textPath")
		.attr("xlink:href", function(d){
			return "#path_"+d.source.id+"_"+d.target.id;
		})
		.text(function(d){
			if (!d.value || !that.enable.relationship) {
				return '';
			}
			return d.relation;
		})
		.append("tspan")
		.attr("fill", function(d,i){
			return that.color.colors(d.value);
		})
		.text(function(d){
			if (!d.value || !that.enable.score) {
				return '';
			}
			return d.value;
		});
	linktextUpdate.exit().remove();
	
	//节点
	var nodesUpdate = that._nodes_container.selectAll("g.nodes").data(that.nodes, function(d,i){
		return d.id;
	});
	var nodesEnterG = nodesUpdate.enter().append("g")
		.attr("class", function(d,i){
			return "nodes g_"+d.id;
		})
		.attr("cursor", "default")
		.attr("transform", "translate(0,0)")
		.call(d3.drag().on("start", function(d,i){
            if (!d3.event.active) {
                //设置衰减系数，对节点位置移动过程的模拟，数值越高移动越快，数值范围[0,1]
            	that.simulation.alphaTarget(0.8).restart();
            }
            d.fx = d.x;
            d.fy = d.y;
		}).on("drag", function(d,i){
			d.fx = d3.event.x;
            d.fy = d3.event.y;
		}).on("end", function(d,i){
			//that.simulation.stop();
			that.simulation.alphaTarget(0);
		}))
		.on("click", function(d,i){
			d3.selectAll("g>circle").attr("stroke","none");
			d3.select("g.g_"+d.id+">circle").attr("stroke","#2E89FB").attr("stroke-width",6).attr("stroke-opacity","0.3")
		})
		.on("dblclick", function(d,i){
			if (!d.hasOwnProperty('open') || !d.open) {
				d.open = 1;
				that.randomGenerateForce(d);
			} else {
				d.open = 0;
				//d.fx = null,d.fy = null;//解除锁定
				that.collapseChilds(d.id);
			}
		})
		.on("mouseover", function(d,i){
			that.setTipsInfo(d.text, "姓名："+d.text+"，ID："+d.id);
			if (that.enable.highlight) {
				var ids = [];
				d3.selectAll(".link").transition().duration(0).attr("opacity", function(link){
					if (link.source.id==d.id || link.target.id==d.id) {
						ids.push(link.source.id);
						ids.push(link.target.id);
						return 1;
					}
					return 0.2;
				});
				d3.selectAll(".nodes").transition().duration(0).attr("opacity", function(item){
					return ids.indexOf(item.id) > -1 ? 1 : 0.2;
				});
			}
		})
		.on("mouseout", function(d,i){
			that.setTipsInfo();
			if (that.enable.highlight) {
				d3.selectAll(".link").transition().duration(0).attr("opacity", 1);
				d3.selectAll(".nodes").transition().duration(0).attr("opacity", 1);
			}
		});
	nodesEnterG.append("use").attr("xlink:href", "#zdry_")
		.attr("fill", "red")
		.attr("opacity", function(d,i){
			var ids = ['sanguo', 'caocao', 'liubei', 'sunquan', 'liuxie'];
			return ids.indexOf(d.id)>-1 ? 1 : 0;
		});
	nodesEnterG.append("circle")
		.attr("r", function(d,i){
			d.weight = that.links.filter(function(link){
				return link.source.index==i || link.target.index==i;
			}).length;
			return that.node.r;
		})
		.attr("fill", function(d,i){
			var ids = [
	           'sunshangxiang', 'daqiao', 'xiaoqiao', 'diaochan', 
	           'caifuren', 'jingzhu',
	           'wangmeiren', 'fuhuanghou', 'dongguiren', 'caojie', 'caoxian', 'caohua'
			];
			return ids.indexOf(d.id)>-1 ? that.color.node_girl : that.color.node_comm;
		});
	nodesEnterG.append("image")
		.attr("xlink:href", function(d,i){
			return that.node.iconpath+d.icon;
		})
		.attr("width", function(d,i){
			return that.node.icon*2;
		})
		.attr("height", function(d,i){
			return that.node.icon*2;
		})
		.attr("x", function(d,i){
			return -that.node.icon;
		})
		.attr("y", function(d,i){
			return -that.node.icon;
		});
	nodesEnterG.append("text")
		.attr("x", -14)
		.attr("y", -10)
		.attr("dy", 45)
		.attr("fill", this.color.nodetext)
		.text(function(d,i){
			if (!d.text || !that.enable.nodetext) {
				return '';
			}
			if (i==0) {
				d.fx = that.size.width/2;
				d.fy = that.size.height/2;
			}
			return d.text;
		});
	nodesUpdate.exit().remove();
}
/**
 * 解除锁定
 * @param id
 */
CanvasPaper.prototype.unlock = function(id) {
	this.nodes.filter(function(n){
		if (geo.isNullStr(id)) {
			return n.index != 0;
		}
		return n.id = id;
	}).forEach(function(n){
		n.fx = null;
		n.fy = null;
	});
}
/**
 * 添加节点
 * @param nodes
 */
CanvasPaper.prototype.addNodes = function(nodes) {
	var self = this;
	var type = Object.prototype.toString.call(nodes);
	if (type=='[object Array]') {
		nodes.forEach(function(node,i){
			self.nodes.push(node);
		});
		return;
	}
	if (type=='[object Object]') {
		self.nodes.push(nodes);
		return;
	}
}
/**
 * 添加关系
 * @param links
 */
CanvasPaper.prototype.addLinks = function(links) {
	var self = this;
	var type = Object.prototype.toString.call(links);
	if (type=='[object Array]') {
		links.forEach(function(link,i){
			self.links.push(link);
		});
		return;
	}
	if (type=='[object Object]') {
		self.links.push(links);
		return;
	}
}
/**
 * 平移缩放
 * @param __scale 缩放比例
 * @param __translate 平移位置数组
 */
CanvasPaper.prototype.transform = function(__scale, __translate) {
	this.scale = __scale || 1;
	this.translate = __translate || [0,0];
	var __transform = "translate("+this.translate+") scale("+this.scale+")";
	d3.select('.g-container').transition().duration(0).attr("transform", __transform);
	if (this.scale<0.35) {
		d3.selectAll(".linktext").transition().duration(0).attr("opacity", 0);
		d3.selectAll("g.nodes>image").transition(500).duration(0).attr("opacity", 0);
		d3.selectAll("g.nodes>text").transition().duration(0).attr("opacity", 0);
	} else {
		d3.selectAll(".linktext").transition().duration(0).attr("opacity", 1);
		d3.selectAll("g.nodes>image").transition(500).duration(0).attr("opacity", 1);
		d3.selectAll("g.nodes>text").transition().duration(0).attr("opacity", 1);
	}
}
/**
 * 自动画布大小
 */
CanvasPaper.prototype.resize = function() {
	this.paper
		.attr("width", document.documentElement.clientWidth)
		.attr("height", document.documentElement.clientHeight);
}
/**
 * 随机生成小兵数据
 */
CanvasPaper.prototype.randomGenerateForce = function(d) {
	var self = this;
	var max = 7, min = 2;
	var random = Math.floor(Math.random()*(max-min+1))+min;
	var zs = self.nodes.length;
	for (var j=0;j<random;j++) {
		var _xh = (zs+j+1);
		var _id = "xiaobing_"+_xh;
		var node = {"id":_id, "text":"小兵"+_xh, "icon":"i_daqiao.png"};
		var link = {"source": _id, "target":d.id, "value":"", "relation":""};
		self.addNodes(node);
		self.addLinks(link);
	}
	self.render();
}
/**
 * 节点收起
 * @param id
 */
CanvasPaper.prototype.collapseChilds = function(id) {
	var self = this;
	var nodeIdArr = [], linkIdArr = [];
	var nodeIndexArr = [], linkIndexArr = [];
	self.links.filter(function(link,i){
		var __typeof = typeof(link.source);
		if (__typeof != 'object') {
			return link.source==id || link.target==id;
		} else {
			return link.source.id==id || link.target.id==id;
		}
	}).forEach(function(link,i){
		var __id;
		var __index;
		if (link.source.id==id) {
			__id = link.target.id;
			__index = link.target.index;
		} else {
			__id = link.source.id;
			__index = link.source.index;
		}
		var __links = self.links.filter(function(l){
			return (l.source.id==__id || l.target.id==__id);
		});
		if (__links.length>1) return;
		nodeIdArr.push(__id);
		nodeIndexArr.push(__index);
		linkIdArr.push(__links[0].source.id+'_'+__links[0].target.id);
		linkIndexArr.push(__links[0].index);
	});
	self.nodes.remove(nodeIndexArr);
	self.links.remove(linkIndexArr);
	self.render();
}
/**
 * 详情-显示
 * @param title
 * @param content
 */
CanvasPaper.prototype.setTipsInfo = function(title, content) {
	var __title = d3.select(".triangle>.triangle-title");
	var __content = d3.select(".triangle>.triangle-content");
	var __wrap = d3.select(".triangle");
	if (typeof(title)=='undefined') {
		__title.text('');
		__content.text('');
		__wrap.style("display","none").style("left",0).style("top",0);
	} else {
		__title.text(title);
		__content.text(content);
		__wrap.style("display","block")
			.style("left",(d3.event.clientX-10)+"px")
			.style("top",(d3.event.clientY+30)+"px");
	}
}