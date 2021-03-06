(function(Dataflow) {

  var Graph = Dataflow.prototype.module("graph");

  // Dependencies
  var Node = Dataflow.prototype.module("node");
  var Edge = Dataflow.prototype.module("edge");
 
  var template = 
    '<div class="edges">'+
      '<svg class="svg-edges" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" width="800" height="800">'+
        // '<defs>'+  
        //   '<filter id="drop-shadow" >'+ // FIXME Crops the edge when there is no slope
        //     '<feOffset in="SourceAlpha" result="the-shadow" dx="1" dy="1"/>'+
        //     '<feBlend in="SourceGraphic" in2="the-shadow" mode="normal" />'+
        //   '</filter>'+
        // '</defs>'+
      '</svg>'+
    '</div>'+
    '<div class="nodes" />'+
    '<div class="graph-controls" />';

  Graph.View = Backbone.View.extend({
    template: _.template(template),
    className: "graph",
    initialize: function() {
      // Graph container
      this.$el.html(this.template(this.model.toJSON()));

      var nodes = this.model.get("nodes");
      var edges = this.model.get("edges");

      // Initialize nodes
      this.nodes = nodes.view = {};
      this.model.nodes.each(this.addNode, this);
      this.model.nodes.on("add", this.addNode, this);
      this.model.nodes.on("remove", this.removeNode, this);
      // Initialize edges
      this.edges = edges.view = {};
      this.model.edges.each(this.addEdge, this);
      this.model.edges.on("add", this.addEdge, this);
      this.model.edges.on("remove", this.removeEdge, this);

      // For subgraphs only: breadcrumbs to navigate up
      var parentNode = this.model.get("parentNode");
      if (parentNode){
        // This subgraph's label
        this.$(".graph-controls")
          .text( parentNode.get("label") );

        var self = this;

        // Buttons up
        var parentGraph, upButton, upLabel;
        var showGraph = function(graph) {
          return function () {
            self.model.dataflow.showGraph(graph);
            return false;
          };
        };
        while(parentNode){
          parentGraph = parentNode.get("parentGraph");
          parentNode = parentGraph.get("parentNode");
          if (parentNode) {
            upLabel = parentNode.get("label");
          } else {
            upLabel = "main";
          }
          upButton = $('<a href="#">')
            .text( upLabel )
            .click( showGraph(parentGraph) );
          this.$(".graph-controls")
            .prepend(" / ")
            .prepend(upButton);
        }
      }
    },
    render: function() {
      // HACK to get them to show correct positions on load
      var self = this;
      _.defer(function(){
        self.rerenderEdges();
      }, this);

      return this;
    },
    addNode: function(node){
      // Initialize
      var CustomType = this.model.dataflow.nodes[node.type];
      if (CustomType && CustomType.View) {
        node.view = new CustomType.View({model:node});
      } else {
        var BaseNode = this.model.dataflow.node("base");
        node.view = new BaseNode.View({model:node});
      }
      // Save to local collection
      this.nodes[node.id] = node.view;
      // Render
      node.view.render();
      this.$(".nodes").append(node.view.el);
    },
    removeNode: function(node){
      node.view.remove();
      this.nodes[node.id] = null;
      delete this.nodes[node.id];
    },
    addEdge: function(edge){
      // Initialize
      edge.view = new Edge.View({model:edge});
      // Save to local collection
      this.edges[edge.id] = edge.view;
      // Render
      edge.view.render();
      this.$('.svg-edges')[0].appendChild(edge.view.el);
    },
    removeEdge: function(edge){
      edge.view.remove();
      this.edges[edge.id] = null;
      delete this.edges[edge.id];
    },
    rerenderEdges: function(){
      _.each(this.edges, function(edgeView){
        edgeView.render();
      }, this);
    },
    sizeSVG: function(){
      // TODO timeout to not do this with many edge resizes at once
      try{
        var svg = this.$('.svg-edges')[0];
        var rect = svg.getBBox();
        svg.setAttribute("width", Math.round(rect.x+rect.width+50));
        svg.setAttribute("height", Math.round(rect.y+rect.height+50));
      } catch (error) {}
    }
  });

}(Dataflow) );
