import os
import time
import vlc

logs = f"C:/Users/{os.getlogin()}/AppData/Roaming/Microsoft/Teams/logs.txt"
sound = "U:/DEPTO/DTVM RISCO/CONTROLES/SONS/noisy-risk.github.io/audios/uma-bicha-foi-detectada.mp3"
regex_on = 'Setting the taskbar overlay icon - Available'
regex_off = 'Setting the taskbar overlay icon - Away'

def xD():
    check = True
    while True:
        with open(logs, "r") as file:
            tail = file.readlines()[-10:]
            tocar = any([regex_on in x for x in tail])
            tocar = tocar and check
            if tocar:
                p = vlc.MediaPlayer(sound)
                p.play()
                #print('Tocando')
                check = False
            if any([regex_off in x for x in tail]):
                check = True
        time.sleep(1)

if __name__ == '__main__':
    xD()