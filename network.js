function force_directed_graph(graph){

  var highlight_color = "red";
  var highlight_trans = 0.1;

  
  var default_link_color = "#999";
  var focus_node = null;
  var highlight_node = null;
  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var outline = false;
  var towhite = "stroke";

  var width=document.documentElement.clientWidth;
  var height=document.documentElement.clientHeight;

  var svg = d3.select("#networkGraph")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .call(d3.zoom().on("zoom", function () {
            svg.attr("transform", d3.event.transform)
            }))
            .append("g");

  var link = svg.append("g")
            .attr("class", "links")
            .selectAll(".line")
            .data(graph.links)
            .enter().append("line")
            .attr("stroke-width", function(d) { return d.value*0.05; });  //link width

  var node = svg.append("g")
            .attr("class", "nodes")
            .selectAll(".node")
            .data(graph.nodes)
            .enter().append("g");

  var linkedByIndex = {};
  graph.links.forEach(function(d) {
    var sourceNode = graph.nodes.filter(function(n) {
    return n.ID === d.source;
    })[0],
    targetNode = graph.nodes.filter(function(n) {
    return n.ID === d.target;
    })[0];
    linkedByIndex[sourceNode.ID + "," + targetNode.ID] = true;
  });

  var circle=node.append("circle")
    // .attr("r", 5)
    // .attr("r", function(d) {return d.NodeSize*0.3})
    .attr("r", function(d) {return Math.pow(d.NodeSize,1/2)*2.0})  //radius
    // .attr("fill", function(d) { return color(d.Group); })
    .attr("fill", function(d) { 
      if ('color' in d)
        return d.color;
      else
        return color(d.Group); 
    })
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
        .on("end", dragended)
        );

  var textLable = node.append("text")
            .text(function(d) {
            return d.ID;
            })
            .attr('x', 3)
            .attr('y', 3);

  var simulation=d3.forceSimulation();

  createForceDirectedGraph();
  createTable();

  /*----------------------------------------------table------------------------------------------------------------------*/
  function createTable() {

    var sortAscending = false;

    var titles = ['ID','Group','Degree','Eigenvec','Btwness','Clsness','Katz']// d3.keys(graph.nodes[0]);

    var outerTable = d3.select('#centralityTable').append("table")
    outerTable.append("table").attr("class","tableH")
    .append("thead").append('tr').selectAll("th").data(titles).enter()
    .append("th").text(function (column) {  return column; })
    .on("click", function (d) {
      // document.write(d)
      if(d==='ID'){
        if (sortAscending) {
          rows.sort(function(a, b) { return b[d] - a[d]; });
          sortAscending = false;
        } else {
          rows.sort(function(a, b) { return a[d] - b[d]; });
          sortAscending = true;
        }
        // if (sortAscending) {
        //   rows.sort(function(a, b) { return (b[d][0].charCodeAt(0)+parseInt(b[d].substr(2, b[d].length),10)) - (a[d][0].charCodeAt(0)+parseInt(a[d].substr(2,a[d].length),10)); }); 
        //   sortAscending = false;
        // } else {
        //   rows.sort(function(a, b) { return (a[d][0].charCodeAt(0)+parseInt(a[d].substr(2,a[d].length),10)) - (b[d][0].charCodeAt(0)+parseInt(b[d].substr(2, b[d].length),10)); });
        //   sortAscending = true;
        // }
      }else{

        if(d==="Group" || d==="NodeSize"){
            if (sortAscending) {
              rows.sort(function(a, b) { return b[d] - a[d]; });
              sortAscending = false;
            } else {
              rows.sort(function(a, b) { return a[d] - b[d]; });
              sortAscending = true;
            }

        }else{

          if (sortAscending) {
            rows.sort(function(a, b) { return b["Centrality"][d] - a["Centrality"][d]; });
            sortAscending = false;
          } else {
            rows.sort(function(a, b) { return a["Centrality"][d] - b["Centrality"][d]; });
            sortAscending = true;
          }

        }

        
      }
    });

    var inner = outerTable
    .append("div").attr("id","scrollit").attr("style", "height:" + String(height-160)+"px" + ";")
    .append("table").attr("class", "tableB");

    var rows=inner.append('tbody').selectAll('tr')
    .data(graph.nodes).enter()
    .append('tr')
    .on("mouseover", function(d) {
      if (focus_node!==null)
      {
      }else{
      highlightTableRow(d);
      set_highlight(d);
      }
    }) 
    .on("mouseout", function(d) {
      if (focus_node!==null)  
      {
      }else{
        exit_highlight();
        highlightTableRow(null);
      }
    })
    .on("mousedown", function(d) { 
      d3.event.stopPropagation();
      focus_node = d;
      set_focus(d);
      highlightTableRow(d);
    })
    .on("click", function(d) {
      if (focus_node!==null)
      {
      }else{
      highlightTableRow(d);
      set_highlight(d);
      }
    }) 

    var cells=rows.selectAll('td')
    .data(function (d) {
      return titles.map(function (column) {
        if(column==="ID" || column==="Group" || column==="NodeSize"){
          return {column: column, value: d[column]};
        }else{
          return {column: column, value: d["Centrality"][column]};
        }
      });
    })
    .enter()
    .append('td')
    // .attr('data-th', function (d) {
    //   return d.column;
    // })
    .text(function (d) {
      if(d.column!=="Group"){
        return d.value;}
    })

    rows.selectAll("td")
        .append("svg")
          .attr("width", function(d) { 
            if (d.column==="Group") {return "100%";}else{return 0;}})  //0 for other columns
          .attr("height", function(d) { 
            if (d.column==="Group") {return "100%";}else{return 0;}})  //0 for other columns
          .append("circle")
          .attr("cx", "50%")
          .attr("cy", "50%")
          .attr("r",5)
          .style('fill', function(d) { 
              if (d.column==="Group") {
                return color(d.value);
              }
          })

  }//end of table part
  /*----------------------------------------------------network-------------------------------------------------------------------*/
  function createForceDirectedGraph() {

    simulation
    .force("link", d3.forceLink().id(function(d) { return d.ID; }).strength(0.05).iterations(20)) // for id string index
    // .force("link", d3.forceLink())  // for id num index
    .force("collide",d3.forceCollide().radius(25).strength(0.01).iterations(20))
    // .force("x", d3.forceX())
    // .force("y", d3.forceY())
     .force("charge", d3.forceManyBody())
   .force("charge", d3.forceManyBody().strength(-50).distanceMin(10).distanceMax(20))  // clusters spreadness, too big (-10) may cover some nodes
    .force("center", d3.forceCenter(width/3, height/3))
    //.alphaDecay(0.01);  //(0.001,1) controls how quickly the simulation cools; 0-forever moving 

    simulation
    .nodes(graph.nodes)
    .on("tick", ticked);

    simulation.force("link")
    .links(graph.links);

    node.on("mouseover", function(d) {
      if (focus_node!==null)
      {
      }else{

        set_highlight(d);

        var elements = d3.selectAll("tbody tr");
        var i=0,r=0;
        if (d) elements.each(function(node) { 
          i=i+1;
          if(d.ID===node.ID){
            r=i;
          }
        });
        
        // document.write(i);
        // document.write("***");
        // document.write(r);

        //((r-1)/i)*1500  -- i=81
        //((r-1)/i)*7000  -- i=275
        d3.select("#scrollit").transition()
            .tween("scrolltoElement", function() {
              var nde=this;
              return function(t) { nde.scrollTop =((r-1)/i)*24*i; };
           }
        );

        highlightTableRow(d);
      }
    })
    .on("mousedown", function(d) { 
      d3.event.stopPropagation();
      focus_node = d;
      set_focus(d);
      highlightTableRow(d);
    })
    .on("mouseout", function(d) {
      if (focus_node!==null)
      {
      }else{
        exit_highlight();
        highlightTableRow(null);
      }
    })
    
    d3.select(window)
    .on("mouseup",  function() {
      if (focus_node!==null)
      {
        focus_node = null;
        if (highlight_trans<1)
        {
          circle.style("opacity", 1);
          textLable.style("opacity", 1);
          link.style("opacity", 1);
        }
      }
      if (highlight_node === null){
        exit_highlight();
        highlightTableRow(null);
      }
    });

    function ticked() {
      link
      .attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

      node
      .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")";});
    }


  }//end of network part

  function isConnected(a, b) {
    return linkedByIndex[a.ID + "," + b.ID] || linkedByIndex[b.ID + "," + a.ID] || a.index == b.index;
  }

  function set_focus(d)
  { 
    if (highlight_trans<1)  {
      circle.style("opacity", function(o) {
        return isConnected(d, o) ? 1 : highlight_trans;
      });
      textLable.style("opacity", function(o) {
        return isConnected(d, o) ? 1 : highlight_trans;
      });
      link.style("opacity", function(o) {
        return o.source.index == d.index || o.target.index == d.index ? 1 : highlight_trans;
      });   
    }
  }

  function set_highlight(d)
  {
    svg.style("cursor","pointer");
    if (focus_node!==null) d = focus_node;
    highlight_node = d;

    if (highlight_color!="white"){
      circle.style(towhite, function(o) {
        return isConnected(d, o) ? highlight_color : "white";
      });
      textLable.style("font-weight", function(o) {
        return isConnected(d, o) ? "bold" : "normal";});
      link.style("stroke", function(o) {
        return o.source.index == d.index || o.target.index == d.index ? highlight_color : default_link_color;
      });
    }
  }

  function exit_highlight(){
    highlight_node = null;
    if (focus_node===null){
      svg.style("cursor","move");
      if (highlight_color!="white"){
        circle.style(towhite, "white");
        textLable.style("font-weight", "normal");
        link.style("stroke", default_link_color);
      }
    }
  }

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.005).restart(); 
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  function highlightTableRow(node) {
    highlightElement("tbody tr", node);
  }

  function highlightElement(selector, node) {
    var elements = d3.selectAll(selector);
    elements.classed("highlight", false);
    if (node) elements.classed("highlight", function(d) { 
      return d.ID === node.ID; 
    });
  }

}