1. Instalar sistema operativo raspbian lite: https://www.raspberrypi.com/software/operating-systems/

2. Flashear la imagen mediante balena etcher y un adaptador para tarjetas micro sd

3. Conectar la raspberry a un monitor, teclado y mouse, para configurar:
	- Red Wifi: /etc/wpa_supplicant/wpa_supplicant.conf (no olvidar las identaciones en ssid y psk)

		network = {
			ssid = “nombredelared”
			psk = “clave”
		}
 
	- Ip fija: /etc/dhcpcd.conf, depende de la direccion del router/ y la que se desee asignar
		interface wlan0
		static ip_address = 192.168.1.229/24
		static routers = 192.168.1.1 
		static domain_name_servers = 192.168.0.1 8.8.8.8

	- Activar SSHH/I2C/SPI: raspi-config/interface-options	
	
	- Activar el inicio automatico: raspi-config/system-options/s5 boot/ op2

	- Revisar si esta bloqueado el wifi: rfkill
		rfkill unblock all

	- Reiniciar

	- Si no esta conectada a internet, debemos actualizar la hora
		sudo date -s 04200945  dos digitos, mes, dia, hora, min
4. Mediante  WINSCP, conectarse utilizando SSHH a la raspberry,  copiar la carpeta
   tesis al directorio /home/pi/

5. Instalar las librerias
	
	Nota: Las librerias se almacenan en: /usr/local/lib/python3.7/dist-packages/

	5.1 PIP: https://www.pantechsolutions.net/installing-library-packages-in-raspberry-pi
		sudo apt-get install python-pip
		sudo apt-get install python3-pip
	5.2 Flask: https://flask.palletsprojects.com/en/2.0.x/installation/   (todo se va a trabajar con python3)
		sudo pip3 install flask
	5.3 adafruit_dht: https://learn.adafruit.com/dht-humidity-sensing-on-raspberry-pi-with-gdocs-logging/python-setup
		sudo pip3 install adafruit-circuitpython-dht
		sudo apt-get install libgpiod2
	5.4 adafruit_rfm9x: https://learn.adafruit.com/lora-and-lorawan-radio-for-raspberry-pi/rfm9x-raspberry-pi-setup
		sudo pip3 install adafruit-circuitpython-rfm9x
	5.5 numpy: https://numpy.org/install/
		sudo pip3 install numpy
	5.6 SQLite: https://pimylifeup.com/raspberry-pi-sqlite/
		sudo apt install sqlite3

6. Ejecutar el archivo app.py, al iniciar el dispositivo.
	sudo nano /etc/rc.local (antes de exit 0)
	- adentro de rc.local: sudo python3 /home/pi/tesis/app.py &

7. Establecer el horario de ejecucion de los sketch de python, mediante crontab -e
	agregar: * * * * * sudo python3 /home/pi/tesis/"nombredelarchivo".py &
		 ¦ ¦ ¦ ¦ ¦_____  dia de la semana (0-6) 0=domingo
		 ¦ ¦ ¦ ¦_______  mes (1-12)
		 ¦ ¦ ¦_________  dia (1-31)
		 ¦ ¦___________  hora (0-23)
                 ¦_____________  min (0-59)

	Si solo usa * significa "cualquiera", por ej * en mes, activa el comando todos los meses	
	
	7.1 leerTxtVaca.py: para pruebas se habilita cada minuto, en la practica lo hace cada 10 minutos
		* * * * * sudo python3 /home/pi/tesis/leerTxtVaca.py &	

	7.2 grabarEntorno.py: cada hora
	7.3 reportDiario.py: para pruebas cada 6 horas, en la practica cada 24 horas
