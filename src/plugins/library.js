( function(Dataflow) {

  var Library = Dataflow.prototype.plugin("library");

  Library.initialize = function(dataflow){
 
    var library = $('<ul class="dataflow-plugin-library" style="list-style:none; padding-left:0" />');

    var addNode = function(node, x, y) {
      return function(){
        // Deselect others
        dataflow.currentGraph.view.$(".node").removeClass("ui-selected");
        // Find vacant id
        var id = 1;
        while (dataflow.currentGraph.nodes.get(id)){
          id++;
        }
        // Position if button clicked
        x = x===undefined ? 200 : x;
        y = y===undefined ? 200 : y;
        // Add node
        var newNode = new node.Model({
          id: id,
          x: x,
          y: y,
          parentGraph: dataflow.currentGraph
        });
        dataflow.currentGraph.nodes.add(newNode);
        // Select and bring to top
        newNode.view.select();
      };
    };

    var update = function(options){
      options = options ? options : {};
      options.exclude = options.exclude ? options.exclude : ["base", "base-resizable"];

      library.empty();
      _.each(dataflow.nodes, function(node, index){
        if (options.exclude.indexOf(index) === -1) {
          var addButton = $('<a class="button">+</a>')
            .attr("title", "click or drag")
            .draggable({
              helper: function(){
                return $('<div class="node helper" style="width:100px; height:100px">'+index+'</div>');
              },
              stop: function(event, ui) {
                addNode(node, ui.position.left, ui.position.top).call();
              }
            })
            .click(addNode(node));
          var item = $("<li />")
            .append(addButton)
            .append(index);
            // .append(drag);
          library.append(item);
        }
      });
    };
    update();

    dataflow.addPlugin("library", library);

    Library.update = update;

  };

}(Dataflow) );
