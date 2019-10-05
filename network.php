<!DOCTYPE html>
<meta charset="utf-8">
<title>Network Analysis</title>
<link rel="icon" href="network.jpeg">

<style>
#wrap{
    width:100%;
    margin:0 auto;
}
.box1{
    float:left;
    width:63%;
    height:100%;
}
.box2{
    float:left;
    width:33%;
    height:100%;
}
</style>

<script src="d3.v4.min.js"></script>

<script type="text/javascript" src="network.js"></script>


<script type="text/javascript">
d3.json('<? echo $_POST['formVar'];?>', function(error, data) {
  if (error) throw error;
  force_directed_graph(data);
});
</script>
    

<link rel="stylesheet" type="text/css" href="networkGraph.css" /> 
<link rel="stylesheet" type="text/css" href="centralityTable.css" /> 

<div id="#wrap">
<div id="networkGraph" class="box1"></div>

<div id="centralityTable" class="box2">
<h1 style="line-height:5px"><a href="https://en.wikipedia.org/wiki/Centrality">Centrality</a></h1>
<p style="line-height:1px">1. Click the table header to sort data according to that column</p>
<p style="line-height:1px">2. Mouse-over the table row to hightlight the network neighbors</p>
<p style="line-height:1px">3. Mouse-down the table row to filter the network neighbors</p>
</div>

</div>



</html>