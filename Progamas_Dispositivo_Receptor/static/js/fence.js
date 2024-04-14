
    
    const source = new ol.source.Vector({wrapX: false});
    
    const vector = new ol.layer.Vector({
      source: source,
    });
    
    
    const typeSelect = 'Box'; //document.getElementById('type');
    
    var draw; // global so we can remove it later
    function addInteraction() {
      var value = typeSelect;
      if (value !== 'None') {
        /*
        var geometryFunction, maxPoints;
        if(value === 'Box'){
          value = 'LineString';
          maxPoints = 2;
          geometryFunction = function(coordinates, geometry){
            if(!geometry){
              geometry = new ol.geom.Polygon(null);
            }
            var start = coordinates[0];
            var end = coordinates[1];

            geometry.setCoordinates([
              [start, [start[0], end[1]], end, [end[0], start[1]], start]
            ]);

            return geometry;
          };
        }
        */

        /*
         var geometryFunction = function(coordinates, geometry){
          if(!geometry){
            geometry = new ol.geom.Polygon(null);
          }
          var start = coordinates[0];
          var end = coordinates[1];

          geometry.setCoordinates([
            [start, [start[0], end[1]], end, [end[0], start[1]], start]
          ]);
         }
         */
        draw = new ol.interaction.Draw({
          source: source,
          type: 'LineString',
          //type: /** @type {ol.geom.GeometryType} */ (value),
          //geometryFunction: geometryFunction,
          maxPoints: 2,
        });
        
        draw.on('drawend',function(e){
          var polygonString =e.feature.getGeometry().getCoordinates();
         console.log(polygonString);
        });

        map.addInteraction(draw);
      }
    }
    
    /**
     * Handle change event.
     */
    //typeSelect.onchange = function () {
    //  map.removeInteraction(draw);
    //  addInteraction();
    //};
    
    //document.getElementById('undo').addEventListener('click', function () {
    //  draw.removeLastPoint();
    //});
    
    addInteraction();
    map.addLayer(vector);







    var source = new ol.source.Vector({wrapX: false});


    vector = new ol.layer.Vector({
        source: source,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(0, 12, 0, 0.3)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            }),
            image: new ol.style.Circle({
                radius: 7,
                fill: new ol.style.Fill({
                color: '#ffcc33'
                })
            })
        })      
    });
    
    
    
    var draw; // global so we can remove it later
    function addInteraction() 
    {
      var value = 'LineString';
      var maxPoints = 2;
      var geometryFunction = function(coordinates, geometry)
      {
          if (!geometry) 
          {
              geometry = new ol.geom.Polygon([]);
          }
          var start = coordinates[0];
          var end = coordinates[1];
          //console.log(start);
          //console.log(end);
          //geometry.setCoordinates([[start, [start[0], end[1]], end, [end[0], start[1]], start]]);
          geometry.setCoordinates([[p1,[p1[0],p3[1]],p3,[p3[0],p1[1]],p1]]);
          //geometry.setCoordinates([p1,p2,p3,p4,p1]);
          return geometry;
      };
            
    
      draw = new ol.interaction.Draw({
          source: source,
          type: /** @type {ol.geom.GeometryType} */ (value),
          geometryFunction: geometryFunction,
          maxPoints: maxPoints            
      });
    
      map.addInteraction(draw);
      map.addLayer(vector);
    
      /*
      draw.on('drawend',function(e){
        var polygonString =e.feature.getGeometry().transform('EPSG:3857', 'EPSG:4326');
        console.log(polygonString.getCoordinates());
      });
      */            
    }
    
    addInteraction();
    
    
    function actualizarCerca(){
      addInteraction();
    }
      
    
    function borrarCerca(){
      map.removeLayer(vector);
    }
    
    