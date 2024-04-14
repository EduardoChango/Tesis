import sqlite3
import time





#import adafruit_dht
import Adafruit_DHT
import busio
from digitalio import DigitalInOut, Direction, Pull
import board
#sensorAmbiente = adafruit_dht.DHT22(board.D4)



sensorAmbiente = Adafruit_DHT.AM2302

'''

    Este skecth  se ejecuta cada hora y se encargara de obtener los datos del sensor de temperatura 
    DTH22; despues hará lo siguiente:
    
    1. Obtener la cantidad de datos que tiene la tabla >>entorno<< (no puede haber mas de 24 datos)
    2. Si la cantidad de datos es superior o igual a 24 se borrara la primera de la tabla
        La tabla tendra siempre los datos de las ultimas 24 horas, y tendra una estructura de stack FIFO
        es decir el primero que entra es lo primero que sale.
        Para poder realizar esto, se requiere de asignarle a cada fila un ID
        2.1 Actualizar todos los ID, puesto que el id "1" se borraria junto con la fila
    3. Asignarle el ID correspondiente al dato que va a ser insertado en la tabla
    4. Insertar el dato en la tabla
'''


def insertDataBaseEntorno(datos,base):
    try:
        dtg=time.strftime('%Y-%m-%d %H:%M:%S',time.localtime())
        db = sqlite3.connect(base)
        cursor = db.cursor()
        cursor.execute('''INSERT INTO entorno (id,dtg,temp,hum) VALUES (?,?,?,?)''',(datos[0],dtg,datos[1],datos[2]))
        db.commit()
        # Catch any exception
    except Exception as e:
        # Roll back any change if something goes horribly wrong
        db.rollback()
        raise e
    finally:
            # Close the db connection
        db.close()

def contarDataBaseEntorno(base):
    try:
        db = sqlite3.connect(base)
        cursor = db.cursor()
        numeroDatos = cursor.execute('''SELECT COUNT(*) FROM entorno''').fetchone()
        db.commit()
        
        # Catch any exception
    except Exception as e:
        # Roll back any change if something goes horribly wrong
        db.rollback()
        raise e
    finally:
            # Close the db connection
        db.close()
        return numeroDatos[0]


#Por editar
def borrarDato(base):
    try:
        db = sqlite3.connect(base)
        cursor = db.cursor()
        #Borrar el primer dato y actualizar el "id" de todos los datos en la base
        cursor.execute('''DELETE FROM entorno WHERE id = (SELECT min(id) FROM entorno);''')
        cursor.execute('''UPDATE entorno SET id = id-1;''')
        db.commit()
        # Catch any exception
    except Exception as e:
        # Roll back any change if something goes horribly wrong
        db.rollback()
        raise e
    finally:
            # Close the db connection
        db.close()


def leerDataBaseEntorno(base):
    try:
        db = sqlite3.connect(base)
        cursor = db.cursor()
        #indice = cursor.execute('''SELECT indice FROM vaca01''').fetchall()
        id = cursor.execute('''SELECT id FROM entorno''').fetchall()
        dtg = cursor.execute('''SELECT dtg FROM entorno''').fetchall()
        temp = cursor.execute('''SELECT temp FROM entorno''').fetchall()
        hum = cursor.execute('''SELECT hum FROM entorno''').fetchall()
        matrix = [id,dtg,temp,hum]
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()
        return matrix


humAmbienteLeida, tempAmbienteLeida = Adafruit_DHT.read_retry(sensorAmbiente,4)

#tempAmbienteLeida = 11.3#sensorAmbiente.temperature
#humAmbienteLeida = 9.2 #sensorAmbiente.humidity
'''
print(tempAmbienteLeida)
print(humAmbienteLeida)
#print(leerDataBaseEntorno('/home/pi/tesis/tesisDataBase.db'))
'''

#Obtener la cantidad de datos disponible
numeroDatos = contarDataBaseEntorno('/home/pi/tesis/tesisDataBase.db')
#Si la cantidad de datos es mayor a igual a los que deberia haber en la base de datos
#Borrar el primer dato y actualizar el "id" de todos los datos en la base
if(numeroDatos>=24):
    borrarDato('/home/pi/tesis/tesisDataBase.db')
else:
    numeroDatos = numeroDatos + 1
#Ingresar los nuevos datos, [id, temperatura, humedad]
datos = [numeroDatos,tempAmbienteLeida,humAmbienteLeida]
insertDataBaseEntorno(datos,'/home/pi/tesis/tesisDataBase.db')
#print(leerDataBaseEntorno('/home/pi/tesis/tesisDataBase.db'))