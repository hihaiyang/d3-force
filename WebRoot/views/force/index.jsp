<%@ page language="java" import="java.util.*" pageEncoding="UTF-8"%>
<%
String path = request.getContextPath();
String basePath = request.getScheme()+"://"+request.getServerName()+":"+request.getServerPort()+path+"/";
request.setAttribute("vid", ";vid="+new Date().getTime());
%>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">
<html>
  <head>
    <title>三国人物关系网</title>
	<meta http-equiv="pragma" content="no-cache">
	<meta http-equiv="cache-control" content="no-cache">
	<meta http-equiv="expires" content="0">    
	<meta http-equiv="keywords" content="keyword1,keyword2,keyword3">
	<meta http-equiv="description" content="This is my page">
	<link rel="stylesheet" type="text/css" href="<%=path %>/css/core.css">
	<script>_vid = new Date().getTime();</script>
	<script src="<%=path %>/js/jquery.js"></script>
	<script src="<%=path %>/js/d3.js${vid}"></script>
  </head>
  
<body style="height:100%;overflow:hidden;">
<div class="force-view container" style="padding:0;width:100%;">
	<div id="board"></div>
</div>
</body>
<script src="<%=path %>/js/force/force.util.js${vid}"></script>
<script src="<%=path %>/js/force/bind.js${vid}"></script>
<script src="<%=path %>/js/require.js" data-main="<%=path %>/js/force/main" defer async="true"></script>
</html>