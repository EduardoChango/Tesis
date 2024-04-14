class Archivo():

    def __init__(self):
        self.path = "/home/pi/tesis/"
    
    def set_path(self, new_path):
        self.path = new_path
    
    def get_path(self):
        return self.path

    def read_file(self, file):
        retorno = []
        archivo = open(self.path + file, "r")
        for linea in archivo.readlines():
            retorno = linea.split('/')
        archivo.close()

        return retorno

    def write_file(self, file, data):
        cadena = ""

        for x in range(len(data)):
            cadena += str(data[x])
            if((x+1) < (len(data))):
                cadena += "/"

        if (cadena != ""):
            archivo = open(self.path + file, "w")
            archivo.write(cadena)
            archivo.close()