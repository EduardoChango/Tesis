import numpy
import sqlite3
import time

'''
    Este sketch se ejecutara cada 6 horas para la etapa de pruebas
    en el final se ejecutara cada 24 horas, mediante crontab e-
    Al ejecutarse, leera los datos acumulados en la tabla >>reportTemp<<
    posteriormente sacará un PROMEDIO de todos estos datos y
    almacenará los datos maximo, minimo y el promedio en la tabla >>reportDiario<<
    finalmente eliminara todos los datos existentes en la tabla >>reportTemp<<
'''



try:
    datos = [0,0,0]
    db = sqlite3.connect('/home/pi/tesis/tesisDataBase.db')
    cursor = db.cursor()
    #obtener los datos de temperatura existentes en la base de datos.
    temp = cursor.execute('''SELECT temp FROM reportTemp''').fetchall()
    #Pasar los datos a un vector de manera que los pueda manipular.
    tempArray = numpy.array(temp)
    tempVector = tempArray.ravel().tolist()
    tempVectorFloat = numpy.float_(tempVector)
    print(tempVectorFloat)
    #Obtener el valor minimo "min"
    datos[0] = numpy.min(tempVectorFloat)
    #Obtener el valor máximo "max"
    datos[2] = numpy.max(tempVectorFloat)
    #Obtener el valor promedio "avg"
    datos[1] = numpy.mean(tempVectorFloat)
    
    #Obtener el numero de datos para actualizar el id
    Nid = cursor.execute('''SELECT COUNT(*) FROM reportDiario''').fetchone()
    id = Nid[0] + 1
    #print(id)
    #Insertar en la base de datos que tiene el informe diario de las vacas
    dtg=time.strftime('%Y-%m-%d',time.localtime())
    cursor.execute('''INSERT INTO reportDiario (id,dtg,min,avg,max) VALUES (?,?,?,?,?)''',(id,dtg,datos[0],datos[1],datos[2]))
    
    #eliminar los datos en el reportTemp
    cursor.execute('''DELETE FROM reportTemp''')

    #print (cursor.execute('''SELECT * FROM reportDiario''').fetchall())
    db.commit()
except Exception as e:
    db.rollback()
    raise e
finally:
    db.close()