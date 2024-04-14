/*

    Indice del programa
      
      0. Función principal (inicia en cuanto el documento esta listo)
      1. Funciones de los modales
      2. CODIGO PARA LOS MAPAS
      3. Leer Base
      4. Leer Sensores
      5. Leer/ Escribir Raspberry
      6. Funciones de limite de la cerca
      7. Funciones de apagado y reinicio de la Raspberry 
      8. Código para los gráficos


*/

//Declaracion de variable para el inicio y el apagado
var raspberry = {
  reinicio: 0,
  apagado: 0,
}

//Relacionar el elemento de audio declarado en HTML
var x = document.getElementById("myAudio");

//************************* 0. Función principal (inicia en cuanto el documento esta listo) ***********************/
$(document).ready(function(){
  
  setTimeout(() => {
    $("#cargando").fadeOut(350)
    $("#reseteo_valve").css({
        'display': 'flex'
    })
  }, 4000)
  
  leer_LimCerca(); // Actualizar las dimensiones de la cerca en el mapa
  //x.play();
  // Función de actualización de los datos internos de la raspberry
  setInterval(function(){
    Leer_Raspberry(); //Funcion para obtener los datos de la Raspberry, HORA, Temperatura Nucleo
    Leer_Ambiente(); //Funcion para obtener los datos leido del DHT22
    Leer_Sensores(); //Funcion para obtener datos de temperatura corporal, rssi, snr, nivel de bateria
    Leer_GPS(); //Funcion para obtener datos de GPS
    updateCoordinate(item); // Actualizar los datos obtenidos en el mapa
  },1000); //Actualización cada segundo
});


//************************* 1. FUNCION PARA LOS MODALES *************************************//

//* 1.1. Modal de reinicio */
        //Traer el modal
        var modalReinicio = document.getElementById("modalReiniciar");
        //Definir el boton que despliega el modal
        var opcionReinicio = document.getElementById("reiniciar");
        //Definir el boton(es) que cierra el modal
        var opcionCancelarReinicio = document.getElementById("cancelarReinicio");
        var opcionCancelarApagado = document.getElementById("cancelarApagado");
        //Abrir el modal
        opcionReinicio.onclick = function(){
          modalReinicio.style.display="block";
        }
        //Cerrar el modal
        opcionCancelarReinicio.onclick = function(){
          modalReinicio.style.display="none";
        }

        opcionCancelarApagado.onclick = function(){
          modalReinicio.style.display="none";
        }

        
        function reiniciarFuncion(){
          $('#apagado_reinicio .titulo').html("El equipo se reiniciará en 5 segundos...");
          $('#apagado_reinicio').fadeIn(350); 
          raspberry.reinicio = 1;
          powerRaspberry();
        }

        function apagarFuncion(){
          $('#apagado_reinicio .titulo').html("El equipo se apagará en 5 segundos...");
          $('#apagado_reinicio').fadeIn(350); 
          raspberry.apagado = 1;
          powerRaspberry();
        }

        

//* 1.2. Modal de configuracion de la cerca virtual */
        //Traer el modal
        var modalLimCerca = document.getElementById("modalConfCerca");
        //Definir el boton que despliega el modal
        var opcionLimCerca = document.getElementById("limiteCerca");
        //Definir el boton que cierra el modal
        var opcionCerrarLimCerca = document.getElementsByClassName("cerrar")[0];
        //Abrir el modal
        opcionLimCerca.onclick = function(){
            modalLimCerca.style.display="block";
            leer_LimCerca();
        }
        //Cerrar el modal
        opcionCerrarLimCerca.onclick = function(){
            modalLimCerca.style.display="none";
        }

//* 1.3. Modal de información sobre el THI */
        //Traer el modal
        var modalTHI= document.getElementById("modalTHI");
        //Definir el boton que despliega el modal
        var opcionTHI = document.getElementById("opTHI");
        //Definir el boton que cierra el modal
        var opcionCerrarTHI = document.getElementsByClassName("cerrar")[1];
        //Abrir el modal
        opcionTHI.onclick = function(){
            modalTHI.style.display="block";
            leer_DataBase();
        }
        //Cerrar modal
        opcionCerrarTHI.onclick = function(){
            modalTHI.style.display="none";
        }

//* 1.4. Modal de información sobre la Temperatura Corporal */
        //Traer el modal
        var modalTempCorporal= document.getElementById("modalTempCorporal");
        //Definir el boton que despliega el modal
        var opcionTempCorporal = document.getElementById("opTempCorporal");
        //Definir el boton que cierra el modal
        var opcionCerrarTempCorporal = document.getElementsByClassName("cerrar")[2];
        //Abrir el modal
        opcionTempCorporal.onclick = function(){
            modalTempCorporal.style.display="block";
            leer_DataBaseTemp();
        }
        //Cerrar modal
        opcionCerrarTempCorporal.onclick = function(){
            modalTempCorporal.style.display="none";
        }

//* 1.5. Modal de información sobre el sistema, Manual de Usuario */
        //Traer el modal
        var modalManualUsuario= document.getElementById("modalManualUsuario");
        //Definir el boton que despliega el modal
        var opcionManualUsuario = document.getElementById("about");
        //Definir el boton que cierra el modal
        var opcionCerrarManualUsuario = document.getElementsByClassName("cerrar")[3];
        //Abrir el modal
        opcionManualUsuario.onclick = function(){
            modalManualUsuario.style.display="block";
            //leer_DataBaseTemp();
        }
        //Cerrar modal
        opcionCerrarManualUsuario.onclick = function(){
            modalManualUsuario.style.display="none";
        }


//************************* 2. CODIGO PARA LOS MAPAS *************************************//

    //Latitud si el numero aumenta se va hacia el este, si disminuye hacia el oeste
    //Longitud si el numero aumenta se va hacia el sur, si disminuye hacia el norte
    //Tambillo
    //var longitud= -78.537574;
    //var latitud= -0.407238;

    //Casa
    //var longitud = -78.512724
    //var latitud = -0.274338

    //Oficina
    //var longitud= -78.537574;
    //var latitud= -0.407238;

    //EPN
    var longitud= -78.489526;
    var latitud= -0.209524;

    //Obtener elementos desde el archivo "index.html", para el cuadro de dialogo que muestra latitud y longitud
    var container=document.getElementById("popupId");
    var content=document.getElementById("popupContentId");
    var closer=document.getElementById("popupCloserId");

    //Se crea el mapa base, descargado desde OpenLayers, para trabajar OFFLINE, si se dispone de conexión a internet

    //Para pruebas se puede usar el mapa de ARCGIS
      //'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
    
    //Para pruebas en windows se direcciona a los directorios que contiene el tile de esta manera
      //'file:///C%3A/Users/eduar/Documents/Tesis/Mapas/CasaQuito/{z}/{x}/{y}.png'
      //'file:///C%3A/Users/eduar/Documents/Tesis/Mapas/HaciendaTambillo/{z}/{x}/{y}.png'
    
    //Para pruebas en Raspbian se direcciona a los directorios que contiene el tile de esta manera
    //'../static/img/CasaQuito/{z}/{x}/{y}.png'
    //'../static/img/HaciendaTambilloArc/{z}/{x}/{y}.png'
    //'../static/img/EPN/{z}/{x}/{y}.png'

//* 2.1. Creacion del mapa */

    //Se crea el objeto "map", que se dibujara en la division 'mapaId'
    var map= new ol.Map({
      target: 'mapaId',//aqui se va a mostrar el mapa
      renderer: 'canvas', // El tipo de renderizado
      layers: [
        new ol.layer.Tile({
          source: new ol.source.XYZ({
            url: '../static/img/EPN/{z}/{x}/{y}.png',
          })
        })
      ],//La unica capa que tendrá sera la baseMapLayer creada arriba
      view: new ol.View({
        center: ol.proj.fromLonLat([longitud,latitud]),//Donde se va a centrar el mapa, por conveniencia dependera de la geoubicacion de la raspberry
        zoom: 18,//El unico zoom para este proyecto por motivos de almacenamiento sera de 16, para trabajos online se puede tener un mayor rango de zoom
        maxZoom: 20,
        minZoom: 16
      }),
    });

//* 2.2. Creacion del marcador */

    //Agregar el mapa en el punto con multiples marcadores
    //for(var i = 0; i < places.length; i++){

      //Definir el marcador
      var marker= new ol.Feature({
        geometry: new ol.geom.Point(
          //ol.proj.fromLonLat([places[i][0],places[i][1]])
          ol.proj.fromLonLat([longitud,latitud])
        ),
        id: 'marcador1'
      });      

      //Aqui se crea el marcador como un vector de construccion
      //el cual tiene un vector fuente con las caracteristicas de este como posicion (latitud y longitud)
      var markerVectorLayer = new ol.layer.Vector({
        //Crear un vector fuente que contiene las caracteristicas definidas en la seccion de construccion del marcador
        source: new ol.source.Vector({
          features: [marker]
        }),
        //Configurar un icono que representara el movimiento del animalito sobre el mapa
        //El icono se encuentra almacenado en la tarjeta
        style: new ol.style.Style({
          image: new ol.style.Icon({
            anchor: [41, 62],
            anchorXUnits: 'pixels',
            anchorYUnits: 'pixels',
            src: '../static/img/cow41x62.png',
            scale: [0.5,0.5]
          })
        }),
      })

      //Agregar el marcador como una capa sobre el mapa
      map.addLayer(markerVectorLayer);
    //}

    //Crear una caja de dialogo con cierta informacion sobre el marcador de la vaca dentro del mapa
    var overlay = new ol.Overlay({
      element: container, //reference to container var that was declared on html file
      autoPan: true,
      autoPanAnimation:{
        duration: 250
      }
    });

    //Agregar la caja de dialogo, la cual solo aparecer al dar click sobre el marcador
    map.addOverlay(overlay);

    
    closer.onclick = function(){
      overlay.setPosition(undefined);
      closer.blur();
      return false;
    };

    //funcion para mostrar la caja de dialogo
    map.on('singleclick',function(event){
      if(map.hasFeatureAtPixel(event.pixel)===true){
        var coordinate=event.coordinate;
        content.innerHTML=('<b>Hola'+'<br/>Longitud: ' + item.Coordinate.Longitude1 + '<br/>Latitud:' +item.Coordinate.Latitude1);
        overlay.setPosition(coordinate);
      }else{
        overlay.setPosition(undefined);
        closer.blur;
      }
    });

//* 2.3. Creacion de la cerca virtual */
    //*********************Aqui se dibuja los limites del mapa de aquellos que no debe salir*/
    //Crear un circulo
    var circle = new ol.geom.Circle(ol.proj.fromLonLat([longitud,latitud]),80);

    //Ingresar las caracteristicas del circulo definidas en la seccion superior
    var circleFeature = new ol.Feature(circle);
    
    //Definir el estilo de la cerca, relleno y borde
    var circleStyle = new ol.style.Style({
      fill: new ol.style.Fill({
          color: 'rgba(20, 10, 24, 0.2)'
      }),
      stroke: new ol.style.Stroke({
          width: 3,
          color: 'rgba(240, 100, 20, 1)'
      }),
    });
    // Fuente y capa del vector   
    var circleVectorSource = new ol.source.Vector({
      projection: 'EPSG:4326'
    });
    //Agregar todas las caracteristicas del vector
    circleVectorSource.addFeature(circleFeature);
    //Constrir el vector, con fuente y estilo
    var circleVectorLayer = new ol.layer.Vector({
        source: circleVectorSource,
        style: circleStyle
    });
    //Agregar la cerca como una capa sobre el mapa
    map.addLayer(circleVectorLayer);


//* 2.4. Actualizacion del marcador con las coordenadas recibidas*/

    //Making the marker moves around the map
    function updateCoordinate(item) { 

      var coord1 = ol.proj.fromLonLat([item.Coordinate.Longitude2, item.Coordinate.Latitude2]);
      //var coord2 = ol.proj.fromLonLat([item1.Coordinate.Longitude2, item1.Coordinate.Latitude2]);
      marker.getGeometry().setCoordinates(coord1);
      
      //Disapear the dialog box each refresh time
      overlay.setPosition(undefined);
      closer.blur;
      
      
      
      var distancia = ol.sphere.getDistance([longitud,latitud],[item.Coordinate.Longitude2,item.Coordinate.Latitude2]);
      //Evaluar si la vaca salio o no de la cerca
      console.log(distancia);
      console.log(document.getElementById('radiusId'));

      if(distancia > document.getElementById('radiusId').value){
        console.log('La vaquita escapo');
        document.getElementById("mensaje1Id").innerHTML="Se escapo";
        //document.getElementById("alarmaId").style.backgroundColor="rgba(255,255,255,0)";
        x.play();
        document.getElementById("miAlarma").style.display = "block"
      }else{
        console.log('Vaquita dentro');
        document.getElementById("mensaje1Id").innerHTML="Dentro";
        //document.getElementById("alarmaId").style.backgroundColor="rgb(201,23,23)";
        x.pause();
        document.getElementById("miAlarma").style.display = "none"
      }            
    }
    
    var item = {};
    item.id = marker.getId;
    item.Coordinate = {};



//************************* 3. Leer Base *************************************//

//* 3.1. Leer la base de datos, que contiene temperatura y humedad relativa */

    //Obtencion de datos a partir de la base de datos tesisDataBase
    function leer_DataBase(){
      arrayData=[]; //vaciar el vector de datos de temperatura ambiente
      arrayDataH=[]; //vaciar el vector de datos de humedad relativa
      $.ajax({
        url: '/LeerDataBaseEntorno', //Enviar la instruccion de lectura al programa principal
        type: 'GET',
        success: function(response){
          const respuesta = JSON.parse(response);
          //ingresar los datos a los vectores
          respuesta.temp.forEach(element => arrayData.push(parseFloat(element)));
          respuesta.hum.forEach(element => arrayDataH.push(parseFloat(element)));
          respuesta.dtg.forEach(element => arrayDate.push(element));
          //ingresar los vectores al grafico
          chartT.series[0].setData(arrayData);
          chartT.series[1].setData(arrayDataH);
        },
        error: function(error){
          console.log(error);
        }
      });
    }

//* 3.2. Leer la base de datos, que contiene temperatura corporal*/

    function leer_DataBaseTemp(){

      //vaciar los vectores
      arrayMinTemp = [];
      arrayAvgTemp = [];
      arrayMaxTemp = [];

      $.ajax({
        url: '/LeerDataBaseTempCorporal',
        type: 'GET',
        success: function(response){
          const respuesta = JSON.parse(response);
          //ingresar cada elemento al vector correspondiente
          respuesta.tmin.forEach(element => arrayMinTemp.push(parseFloat(element)));
          respuesta.tavg.forEach(element => arrayAvgTemp.push(parseFloat(element)));
          respuesta.tmax.forEach(element => arrayMaxTemp.push(parseFloat(element)));
          respuesta.dtg.forEach(element => arrayDateTemp.push(element));
          //ingresar los vectores al grafico
          chartD.series[0].setData(arrayMinTemp);
          chartD.series[1].setData(arrayAvgTemp);
          chartD.series[2].setData(arrayMaxTemp);
        },
        error: function(error){
          console.log(error);
        }
      });
    }

//************************* 4. Leer Sensores *************************************//

//* 4.1. Funcion para leer los sensores de temperatura, nivel de bateria y el snr y rssi*/
    function Leer_Sensores(){
      $.ajax({
        url: '/INFO',
        type: 'GET',
        success: function(response){
          const respuesta = JSON.parse(response);
          
          //Actualizar los elementos al relacionarlos con los definidos en el HTML
          document.getElementById('VacaId1').innerHTML = respuesta.id;
          document.getElementById('tempVacaId1').innerHTML = parseFloat(respuesta.temperatura).toFixed(2)+" &deg;C";
          document.getElementById('rssiVacaId1').innerHTML = respuesta.rssi;
          document.getElementById('snrVacaId1').innerHTML = respuesta.snr;
          document.getElementById('batVacaId1').innerHTML = respuesta.bateria;
        
        },
        error: function(error){
          console.log(error);
        }
      });
    }

//* 4.3. Funcion para leer los datos de GPS*/
    function Leer_GPS(){
      $.ajax({
        url: '/GPS',
        type: 'GET',
        success: function(response){
          const respuesta = JSON.parse(response);
          console.log(respuesta.longitud)
          console.log(respuesta.latitud)
          //Actualizar la latitud y la longitud
          item.Coordinate.Longitude2=parseFloat(respuesta.longitud).toFixed(7);
          item.Coordinate.Latitude2=parseFloat(respuesta.latitud).toFixed(7);
        },
        error: function(error){
          console.log(error);
        }
      });
    }



//************************* 5. Leer/Escribir Raspberry *************************************//

//* 5.1. Funcion para obtener la hora, y temperatura del nucleo de la raspberry*/
    function Leer_Raspberry(){
      $.ajax({
        url: '/Raspberry',
        type: 'GET',
        success: function(response){
          const respuesta = JSON.parse(response);
          //console.log('Rpi')
          document.getElementById('tempRaspberry').innerHTML = parseFloat(respuesta.tempRaspberry).toFixed(2)+" &deg;C";
          document.getElementById('horaRaspberry').innerHTML = respuesta.horaRaspberry;
        },
        error: function(error){
          console.log(error);
        }
      });
    }

//* 5.2. Funcion para leer los datos del DHT22*/
    function Leer_Ambiente(){
      $.ajax({
        url: '/Ambiente',
        type: 'GET',
        success: function(response){
          const respuesta = JSON.parse(response);
          //console.log('Ambiente')
          //Actualizar las variables de temperatura y humedad relativa al relacionarlos
          //con los datos definidos en el archivo HTML
          T1= parseFloat(respuesta.tempAmb).toFixed(2)
          RH1= parseFloat(respuesta.hrAmb).toFixed(2)
          document.getElementById('tempAmbId').innerHTML = T1 +" &deg;C";
          document.getElementById('hrAmbId').innerHTML = RH1 +" %";
          document.getElementById('thiAmbId').innerHTML = (0.8*T1 + RH1*0.01*(T1-14.4) + 46.4).toFixed(2)
        },
        error: function(error){
          console.log(error);
        }
      });  
    }

//************************* 6. Funciones de limite de la cerca *************************************//
//* 6.1. Funcion para leer el limite de la cerca desde el archivo "fence.gtag", a través del prg principal*/
    function leer_LimCerca(){
      $.ajax({
        url: '/LeerLim',
        type: 'GET',
        success: function(response){
          const respuesta = JSON.parse(response);
          console.log(respuesta);
          //Actualizar estos datos definidos en uno el modal configuracion cerca definido en el HTML
          document.getElementById("latCenterId").value = respuesta.latCenter; //longitud + 1
          document.getElementById("lonCenterId").value = respuesta.lonCenter; //longitud - 1
          document.getElementById("radiusId").value = respuesta.radius; //latitud + 1
          
          //Actualizar el dato leido, definir el punto centro y el radio
          circle.setCenterAndRadius(ol.proj.fromLonLat([parseFloat(respuesta.lonCenter),parseFloat(respuesta.latCenter)]),parseFloat(respuesta.radius));
          
        },
        error: function(error){
          console.log(error);
        }
      });
    }


//* 6.2. Funcion de configuracion de la cerca virtual*/
    function conf_LimCerca (){
      //Obtener datos ingresados en el modal de latitud, longitud y radio
      var campos = {
        latitudeCenter: document.getElementById("latCenterId").value,
        longitudeCenter: document.getElementById("lonCenterId").value,
        fenceRadius: document.getElementById("radiusId").value,
      }
      //Solicitar el ingreso de los datos de la cerca
      $.post('/SetFence', campos, function(datos){
        console.log(datos);
      });
      //Actualizar el limite de la cerca
      leer_LimCerca();
    }

//******************** 7. Funciones de apagado y reinicio de la Raspberry ********************************//

    function powerRaspberry(){
      $.post('/powerRaspberry', raspberry, function(datos){
        console.log(datos);
      });
    }




//********************* 8. Código para los gráficos ****************************//

//Obtener del html la div donde quiero dibujar el plot chart de temperatura
var divTemperatura=document.getElementById("temperaturaId");

//Declarar los vectores para temperatura, humedad relativa ambiente, y la hora a la que fueron tomadas
var arrayData=[];
var arrayDataH=[];
var arrayDate=[];

var chartT = new Highcharts.Chart({
  chart:{ //Caracteristicas del chart
    renderTo : divTemperatura.id, //en que container estoy graficando
    backgroundColor: 'rgb(255,255,255)',//color de la grafica //de que color es el fondo del chart
    width: 850, //ancho del chart
    height: 350, //altura
    borderWidth: 1, //ancho del borde
    borderRadius: 20,//para hacer border redondeados
    borderColor: '#111111', //color del borde
    type: 'line' //tipo de
  },

  title: { //Caracteristicas del Title
      text: 'Temperatura y Humedad Relativa Ambiente' 
  },


  xAxis: { 
    gridLineWidth: 1, //revisar si salen las lineas
    type: 'datetime',
    categories: arrayDate,
    labels:{
      style: {
        fontSize: '4pt',
        }
    }
  },

  yAxis: [{
    gridLineWidth: 1,
    title: { text: 'Temperatura [°C]',
      style: {
        fontWeight: 'bold',
        color: Highcharts.getOptions().colors[1]}
    },
    labels: {
      format: '{value} °C',
      style: {
        fontWeight: 'bold',
        color: Highcharts.getOptions().colors[1]}
    },
    min: 0,
    max: 35,
  },{
    gridLineWidth: 1,
    title: { text: 'Hum Relativa [%]',
      style: {
        fontWeight: 'bold',
        color: Highcharts.getOptions().colors[3]}
    },
    labels: {
      format: '{value} %',
      style: {
        fontWeight: 'bold',
        color: Highcharts.getOptions().colors[3]}
    },
    min: 40,
    max: 100,
    opposite: true,
  }],

  plotOptions: {
    line: {
      animation: true,
      dataLabels: { enabled: false }
    },
  },

  series: [{
    name: 'Grados celsius',
    data:[],
    yAxis: 0,
    color: Highcharts.getOptions().colors[1],
  },{
    name: 'Porcentaje',
    data:[],
    yAxis: 1,
    color: Highcharts.getOptions().colors[3],
  }],
  credits: { enabled: true }
});



//***************GRAFICO DE BARRAS PARA EL DESPLAZAMIENTO**************** */

//Relacionar el container declarado en HTML
var divDesplazamiento=document.getElementById("desplazamientoId");

//Declarar los vectores que componen el gráfico, inicialmente esta vacio
var arrayDateTemp = [];
var arrayMinTemp = [];
var arrayAvgTemp = [];
var arrayMaxTemp = [];

var chartD = new Highcharts.Chart({
    chart:{ //Caracteristicas del chart
      renderTo : divDesplazamiento.id, //en que container estoy graficando
      backgroundColor: 'rgb(255,255,255)',//color de la grafica //de que color es el fondo del chart
      width: 850, //ancho del chart
      height:350, //altura
      borderWidth: 1, //ancho del borde
      borderRadius: 20,//para hacer border redondeados
      borderColor: '#111111', //color del borde
      type: 'column' //tipo de
    },

    title: { //Caracteristicas del Title
        text: 'Temperatura Corporal Diaria' 
    },

    series: [{//Series permite: 
      showInLegend: false,
      data: []
    }],

    plotOptions: {
        line: { animation: false,
        dataLabels: { enabled: false }
        },
        series: { color: '#059e8a' }
    },


    xAxis: { 
      gridLineWidth: 1, //Habilitar cuadriculas
      type: 'datetime', //El eje x es de tiempo
      categories: arrayDateTemp,
      labels:{
        style: {
          fontSize: '4pt',
          }
      }
    },

    yAxis: {
      gridLineWidth: 3, //Habilitar cuadriculas
      title: { text: 'Temperatura Corporal [°C]' },
      min: 2,
      max: 40
    },

    //Permite que al mover el cursor sobre las columnas aparece en un solo grafico
    //maximo, min , y average 
    // Tomado de: https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/column-basic
    tooltip: {
      headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
      pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
          '<td style="padding:0"><b>{point.y:.1f} °C</b></td></tr>',
      footerFormat: '</table>',
      shared: true,
      useHTML: true
    },

    plotOptions: {
      series: {
          label: {
              connectorAllowed: false
          },
          pointStart: 1
      }
    },

    series: [{
      name: 'min',
      data: []

    }, {
      name: 'avg',
      data: []

    }, {
      name: 'max',
      data: []

    }],

    credits: { enabled: true }
});
