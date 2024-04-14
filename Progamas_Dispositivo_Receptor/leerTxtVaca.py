import time
from math import *
import sqlite3

from libs.archivo import Archivo

#from libs.archivo import Archivo

'''
    Este skecth se ejecutará cada 30 minutos, para obtener el valor de temperatura corporal
    que en ese momento se encuentre en el archivo txt dispositivo1.gtag
    despues de obtener este valor lo ingresa en la tabla >>reportTemp<<
    por el momento graba tambien en >>dispositivo<<
'''

archivo = Archivo()

datosVacas = [0,0,0,0,0,0,0]




def insertDataBaseVacas(datos,indice):
    try:
        dtg=time.strftime('%Y-%m-%d %H:%M:%S',time.localtime())
        db = sqlite3.connect('/home/pi/tesis/tesisDataBase.db')
        cursor = db.cursor()
        #Leer longitud y latitud -> calcular distancia con el punto central
        p1 = [-78.537574,-0.407238] #longitud y latitud del punto [0,0] 
        lon1 = radians(p1[0])
        lat1 = radians(p1[1])
        #longitud y latitud del punto dispositivo1.gtag
        lon2 = radians(float(datos[2]))
        lat2 = radians(float(datos[3]))

        R = 6378 #Radio de la tierra Recuatorial 6378km // Rpolar 6357   //Requivol 6371
        Dlat = lat2 - lat1
        Dlon = lon2 - lon1

        #HAVERSINE
        a = (sin(Dlat/2)**2)+(cos(lat1)*cos(lat2)*sin(Dlon/2)**2)
        c = 2*asin(sqrt(a))
        d= int(R*c*1000) #Distancia en metros

        #cursor.execute('''DELETE FROM dispositivo''' + indice)

        instruccion = '''INSERT INTO dispositivo''' + indice + ''' (dtg,id,temp,bat,lon,lat,rssi,snr,dist) VALUES (?,?,?,?,?,?,?,?,?)'''
        #'''INSERT INTO dispositivo1 (dtg,id,temp,bat,lon,lat,rssi,snr) VALUES (?,?,?,?,?,?,?,?)'''
        cursor.execute(instruccion,(dtg,datos[4],datos[0],datos[1],datos[2],datos[3],datos[5],datos[6],d))

        #print(cursor.execute('''SELECT * FROM dispositivo1''').fetchall())
        db.commit()
        # Catch any exception
    except Exception as e:
        # Roll back any change if something goes horribly wrong
        db.rollback()
        raise e
    finally:
            # Close the db connection
        db.close()


def insertDataBaseTemp(datos):
    try:
        db = sqlite3.connect('/home/pi/tesis/tesisDataBase.db')
        cursor = db.cursor()
        #cursor.execute('''DELETE FROM dispositivo''' + indice)
        #'''INSERT INTO dispositivo1 (dtg,id,temp,bat,lon,lat,rssi,snr) VALUES (?,?,?,?,?,?,?,?)'''
        cursor.execute('''INSERT INTO reportTemp (temp) VALUES (?)''',(datos,))

        #print(cursor.execute('''SELECT * FROM reportTemp''').fetchall())
        db.commit()
        # Catch any exception
    except Exception as e:
        # Roll back any change if something goes horribly wrong
        db.rollback()
        raise e
    finally:
            # Close the db connection
        db.close()


#datosVacas = archivo.read_file("dispositivo0.gtag")
#insertDataBaseVacas(datosVacas,'0')
datosVacas = archivo.read_file("dispositivo1.gtag")
insertDataBaseVacas(datosVacas,'1')
insertDataBaseTemp(datosVacas[0])
#print(type('''INSERT INTO dispositivo1 (dtg,id,temp,bat,lon,lat,rssi,snr) VALUES (?,?,?,?,?,?,?,?)'''))