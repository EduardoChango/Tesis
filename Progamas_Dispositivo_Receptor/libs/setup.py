import os, json, threading, time, socket
from datetime import datetime
import sqlite3

class Setup():

    def __init__(self, name_file="setup.conf", name_module = "control"):
        self._path= os.getcwd()+"/"
        self._file = name_file
        self._max_time_connection = 30   
        self._module = name_module
        self._data = None

        print("[INFO] Iniciando aplicacion.")
        time.sleep(1.5)
        self.__initialize()
    
    def set_path(self, new_path):
        self._path = new_path
    
    def get_path(self):
        return self._path
    
    def set_file(self, new_file):
        self._file = new_file
    
    def get_file(self):
        return self._file
    
    def set_max_time_connection(self, new_time):
        self._max_time_connection = new_time
    
    def get_max_time_connection(self):
        return self._max_time_connection
    
    def __get_init_conf(self):
        data = {}
        data[self._module] = []
        data[self._module].append({
            'temp': 0,
            'bat': 0,
            'lon': 0,
            'lat': 0,
            'id': 0,
            'rssi': 0,
        })        
        return data
    
    def __get_conf_from_file(self):
        with open(self._path+self._file) as json_file:
            data = json.load(json_file)
            return data
    
    def __initialize(self):
        if (os.path.isfile(self._path+self._file)==False):
            print("[INFO] Iniciando valores por defecto.")
            self._data = self.__get_init_conf()
            with open(self._path+self._file, 'w') as outfile:
                json.dump(self._data, outfile)
        else:
            print("[INFO] Obteniendo valores de configuracion.")
            self._data = self.__get_conf_from_file()

    def __update_file(self):
        with open(self._path+self._file, 'w') as outfile:
                json.dump(self._data, outfile)

       
            
    # funciones de control de placa raspberry

    def ip_address(self):
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            return s.getsockname()[0]
            s.close()            
        except:
            return "127.0.0.1"
    
    def get_time(self):
        now = datetime.now() 
        return now.strftime("%d-%m-%Y %H:%M:%S")
        
    def temperature(self):
        try:
            tFile = open('/sys/class/thermal/thermal_zone0/temp')
            temp = float(tFile.read())
            temp = temp/1000
        except:
            temp = 100

        return temp

    def reboot(self, delay=5):
        try:
            print("[INFO] Reinicio en "+str(delay)+" segundos...")
            time.sleep(delay)
            os.system("sudo reboot")
        except Exception as e:
            print("[ERROR] "+str(e))
    
    def poweroff(self, delay=5):
        try:
            print("[INFO] Apagado en "+str(delay)+" segundos...")
            time.sleep(delay)
            os.system("sudo shutdown -h now")
        except Exception as e:
            print("[ERROR] "+str(e))
    
    



    
    def leerDataBase(self,base):
        try:
            db = sqlite3.connect(base)
            cursor = db.cursor()
            indice = cursor.execute('''SELECT indice FROM vaca01''').fetchall()
            dtg = cursor.execute('''SELECT dtg FROM report''').fetchall()
            lon = cursor.execute('''SELECT lon FROM report''').fetchall()
            lat = cursor.execute('''SELECT lat FROM report''').fetchall()
            rssi = cursor.execute('''SELECT rssi FROM report''').fetchall()
            matrix = [indice,dtg,lon,lat,rssi]
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
            return matrix
    


    #insertar en la base de datos
    def insertDataBase(self,datos,base):
        try:
            dtg=time.strftime('%Y-%m-%d %H:%M:%S',time.localtime())
            db = sqlite3.connect(base)
            cursor = db.cursor()
            #datos[6]= [temp,bateria,lon,lat,id,rssi]
            cursor.execute('''INSERT INTO report (dtg,lon,lat,rssi) VALUES (?,?,?,?)''',(dtg,datos[0],datos[1],datos[2]))
            db.commit()
        # Catch any exception
        except Exception as e:
            # Roll back any change if something goes horribly wrong
            db.rollback()
            raise e
        finally:
            # Close the db connection
            db.close()

    def leerDataBaseEntorno(self,base):
        try:
            db = sqlite3.connect(base)
            cursor = db.cursor()
            #indice = cursor.execute('''SELECT indice FROM vaca01''').fetchall()
            id = cursor.execute('''SELECT id FROM entorno''').fetchall()
            dtg = cursor.execute('''SELECT dtg FROM entorno''').fetchall()
            temp = cursor.execute('''SELECT temp FROM entorno''').fetchall()
            hum = cursor.execute('''SELECT hum FROM entorno''').fetchall()
            matrix = [dtg,temp,hum]
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
            return matrix

    def leerDataBaseReportDiario(self,base):
        try:
            db = sqlite3.connect(base)
            cursor = db.cursor()
            #indice = cursor.execute('''SELECT indice FROM vaca01''').fetchall()
            id = cursor.execute('''SELECT id FROM reportDiario''').fetchall()
            dtg = cursor.execute('''SELECT dtg FROM reportDiario''').fetchall()
            min = cursor.execute('''SELECT min FROM reportDiario''').fetchall()
            avg = cursor.execute('''SELECT avg FROM reportDiario''').fetchall()
            max = cursor.execute('''SELECT max FROM reportDiario''').fetchall()
            matrix = [id,dtg,min,avg,max]
        except Exception as e:
            db.rollback()
            raise e
        finally:
            db.close()
            return matrix
 