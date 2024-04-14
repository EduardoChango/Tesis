'''
    Escuela Politécnica Nacional

    PROGRAMA PRINCIPAL DISPOSITIVO RECEPTOR
    > Este programa se ejecuta al inicio/ reinicio de la Raspberry Pi, configurado en el archivo rc.local

    El programa se encarga de:
      >leer el sensor DHT22
      >leer los datos recibidos por el RFM95W
      >gestionar las peticiones realizadas por la interfaz de usuario
      >ingresar los datos a los archivos txt y actualizarlos
'''


'''
    1. Inclusion de librerias
'''

from flask import Flask, render_template, request, Response
import multiprocessing as mp
import json
import Adafruit_DHT
import adafruit_rfm9x
import busio
from digitalio import DigitalInOut, Direction, Pull
import board
import numpy
import time


from libs.setup import Setup
from libs.archivo import Archivo

'''
    2. Declaracion de pines y configuracion de variables
'''

# Configurar pines para el chip LoRa
CS = DigitalInOut(board.CE1)
RESET = DigitalInOut(board.D25)
spi = busio.SPI(board.SCK, MOSI=board.MOSI, MISO=board.MISO)
prev_packet = None

sensorAmbiente = Adafruit_DHT.AM2302

setup=Setup()
archivo = Archivo()

DHT_PIN = 4

#Inicializar variables

dirPath="/home/pi/tesis"
#temp,bat,lon,lat,id,rssi
datos=mp.Array('d',[0,0,0,0,0,0,0]) #datos de los sensores
datosLon=mp.Array('d',[0,0]) #lon lat
datosLat=mp.Array('d',[0,0]) #lon lat
datosAmbiente=mp.Array('d',[0,0]) #temperatura,humedadrelativa
datosCerca = [0,0,0] #limites de la cerca virtual




app = Flask(__name__)

'''
    3. Gestion de peticiones
'''
#Definir la ruta del html que se mostrara al ingresar la ip en el browser
@app.route('/')
def index():
    return render_template('index.html')

#Enviar los datos de hora y temp de la raspberr
@app.route('/Raspberry', methods = ['GET'])
def raspberry():
    return json.dumps({'status': True, 'horaRaspberry': setup.get_time(), 'tempRaspberry': setup.temperature()})

#Enviar los datos del DHT22
@app.route('/Ambiente', methods = ['GET'])
def ambiente():
    return json.dumps({'status': True, 'tempAmb': datosAmbiente[0], 'hrAmb': datosAmbiente[1]})

#Enviar info del nodo final (GPS) desde el archivo txt
@app.route('/GPS', methods = ['GET'])
def ubicacion():
    datosTXT = archivo.read_file("dispositivo1.gtag")
    return json.dumps({'status': True, 'id': datosTXT[4], 'longitud': datosTXT[2], 'latitud': datosTXT[3]})

#Enviar informacion del nodo final desde el archivo txt que se actualiza constantemente
@app.route('/INFO', methods = ['GET'])
def info():
    datosTXT = archivo.read_file("dispositivo1.gtag")
    return json.dumps({'status': True, 'temperatura': datosTXT[0], 'bateria': datosTXT[1], 'id': datosTXT[4], 'rssi': datosTXT[5], 'snr': datosTXT[6],})

#Enviar los datos almacenados en la base de datos a la interfaz
@app.route('/LeerDataBaseEntorno', methods = ['GET'])
def getEntorno():
    entorno = setup.leerDataBaseEntorno('/home/pi/tesis/tesisDataBase.db')
    entorno = numpy.array(entorno)
    dtgVector = entorno[:][0].ravel().tolist()
    tempVector = entorno[:][1].ravel().tolist()
    humVector = entorno[:][2].ravel().tolist()
    return json.dumps({'status': True, 'dtg': dtgVector, 'temp': tempVector, 'hum': humVector})

#Enviar los datos almacenados en la base de datos a la interfaz
@app.route('/LeerDataBaseTempCorporal', methods = ['GET'])
def getTCorporal():
    temperaturaCorporal = setup.leerDataBaseReportDiario('/home/pi/tesis/tesisDataBase.db')
    temperaturaCorporal = numpy.array(temperaturaCorporal)
    dtgVector = temperaturaCorporal[:][1].ravel().tolist()
    minVector = temperaturaCorporal[:][2].ravel().tolist()
    avgVector = temperaturaCorporal[:][3].ravel().tolist()
    maxVector = temperaturaCorporal[:][4].ravel().tolist()
    return json.dumps({'status': True, 'dtg': dtgVector, 'tmin': minVector, 'tavg': avgVector, 'tmax': maxVector})

#Enviar los limites de la cerca a la interfaz
@app.route('/LeerLim', methods = ['GET'])
def getfence():
    limites = archivo.read_file("fence.gtag")
    return json.dumps({'status': True, 'latCenter': limites[0], 'lonCenter': limites[1], 'radius': limites[2]})

#Configurar los limites de la cerca, con los ingresados en el modal de la interfaz, estos datos se encuentran en el archivo txt
@app.route('/SetFence', methods = ['POST'])
def setfence():
    datosCerca[0] = float(request.form['latitudeCenter']) #latitud del punto central de la cerca
    datosCerca[1] = float(request.form['longitudeCenter']) #longitud del punto central de la cerca
    datosCerca[2] = float(request.form['fenceRadius']) #Radio de la cerca en metros 
    archivo.write_file("fence.gtag",datosCerca)
    print("[INFO] Actualización del límite de la cerca")
    return json.dumps({'status': True})

#Gestionar una solicitud de apagado o reinicio desde la interfaz de usuario
@app.route('/powerRaspberry', methods = ['POST'])
def powerRaspberry():
    if(int(request.form['apagado']) == 1):
        setup.poweroff()
    elif(int(request.form['reinicio']) == 1):
        setup.reboot()
    
    print("[INFO] Apagado o reinicio del sistema")
    return json.dumps({'status': True})


'''
    4. Proceso principal
'''

def proceso(datos, datosLon, datosLat):

    #incializar el RFM95W
    rfm9x = adafruit_rfm9x.RFM9x(spi, CS, RESET, 915.0)
    rfm9x.set_Sync_Word(0x12)
    rfm9x.tx_power = 23
    
    proceso = True
    while proceso:
        

        try:
            #Incializar con un valor no relevante
            data1=["1","100","100","-0.2675","-0.7245","1234"]
            #print('RasPi LoRa')

            # check for packet rx
            data = rfm9x.receive()
            rssi = rfm9x.rssi
            snr = rfm9x.snr

            if data is None:
                #Si no hay datos esperar un segundo
                print('- Waiting for PKT -')
                #data1=["1","100","100","-0.2675","-0.7245","1234"]
                #print("SPREADING FACTOR DEFAULT")
                #print(rfm9x.spreading_factor)
            else:
                try:
                    # Obtener el mensaje desde el RFM95W
                    prev_packet = data
                    packet_text = str(prev_packet, "utf-8")
                    data1 = packet_text.split(',')


                    if (len(data1)>1):
                        datos[0] = float(data1[0]) #temperatura
                        datos[1] = float(data1[1]) #bateria
                        datos[2] = float(data1[2])# + (datos[1]/(datos[1]+15))#long
                        datos[3] = float(data1[3])# - (datos[1]/(datos[1]+10)) #lat
                        datos[4] = int(data1[4]) #id
                        datos[5] = int(rssi) #rssi
                        datos[6] = int(snr) #snr
                        print("temp: " + str(datos[0]) + " bat: " + str(datos[1]) + " lon: " + str(datos[2]) + " lat: " + str(datos[3]) + " id: " + str(datos[4]) + " rssi: " + str(datos[5]) + " snr: " + str(datos[6]))
                        
                        #Ingresar lo datos al archivo de texto dispositivoX.gtag
                        #Fue realizado asi en caso de incrementar el numero de nodos finales
                        if(datos[4]<3 and datos[2] != 0 and datos[3] != 0):
                            datosLon[int(datos[4]-1)] = datos[2] 
                            datosLat[int(datos[4]-1)] = datos[3]
                            archivoTexto = "dispositivo" + str(int(datos[4]-1)) + ".gtag"
                            archivo.write_file(archivoTexto,datos)




                    else:
                        print("algo pasa") #Fallos en la lectura de los datos, una longitud no esperada del mensaje
                        #print(data)

                except Exception as errAct: #No hay un msg valido recibido desde el nodo final
                    print(errAct)
                    print('No decode')
            
            time.sleep(1.0) #Esperar un segundo
            
        except Exception as err:
                print("fallo en el prog principal")
                print(err)
#https://github.com/loraflow-net/loraflow/blob/master/loraflow.py


'''
    5. Proceso de lectura de datos del DHT22, funciona en paralelo
'''

def leerAmbiente(datosAmbiente):
    proceso = True
    while proceso:
        humAmbienteLeida, tempAmbienteLeida = Adafruit_DHT.read_retry(sensorAmbiente,4)
        #Si existe un valor valido de temp y hum rel, almacenarlos en la variable, caso contrario almacenar 0
        if humAmbienteLeida is not None and tempAmbienteLeida is not None:
                    datosAmbiente[0] = tempAmbienteLeida + 3.0
                    datosAmbiente[1] = humAmbienteLeida
                    #print(time.localtime().tm_min)
                    #setup.insertDataBaseEntorno(datosAmbiente)
                    #print("Temp={0:0.1f}*C Hum={1:0.1f}%".format(tempAmbienteLeida, humAmbienteLeida))
        else:
                    datosAmbiente[0] = 0
                    datosAmbiente[1] = 0
                    #print("Fallo")

        time.sleep(1.0) # Esperar 1 segundo para una nueva lectura

'''
    8. Inicio de los procesos
'''

if __name__ == '__main__':
    procesar = mp.Process(target=proceso, args=(datos, datosLon, datosLat,)) #Asociar al proceso las variables
    leer = mp.Process(target=leerAmbiente, args=(datosAmbiente,)) #Asociar al proceso las variables
    procesar.start() # Iniciar el proceso principal
    leer.start()   # Iniciar el proceso de lectura del DHT22
    app.run(debug=True, host='0.0.0.0')  #Correr la aplicacion, con el puerto 5000

    
    
