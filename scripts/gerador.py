"""
Script para picotar um mp3
Configurar: arquivo de entrada e arquivo de saida
Importante: Eh necessario ter o ffpmeg no PATH
"""
import os
import re
from typing import Tuple

from pydub import AudioSegment

ROOT = os.path.dirname(os.path.abspath(__file__))

OUT_PATH, IN_PATH= f'{ROOT}/out', f'{ROOT}/in'

def slice_file(in_file_name: str,
               start_time: Tuple[float, float],
               stop_time: Tuple[float, float],
               suffix: str = "_",
               extension: str = "mp3") -> None:

    if extension == "mp3":
        sbin = AudioSegment.from_mp3(f"{IN_PATH}/{in_file_name}")
    elif extension == "opus" or extension == "ogg":
        sbin = AudioSegment.from_ogg(f"{IN_PATH}/{in_file_name}")
    else:
        raise Exception(f"Extension {extension} not supported")

    _start_min, _start_sec = start_time
    _end_min, _end_sec = stop_time
    _start = _start_min * 60 * 1000 + _start_sec * 1000
    _end  = _end_min * 60 * 1000 + _end_sec * 1000
    extract = sbin[_start:_end]

    out_file = re.sub(r"." + extension, "", in_file_name) + "_" + suffix
    extract.export(f"{OUT_PATH}/{out_file}.{extension}", format=extension)

if __name__ == "__main__":
    in_file = "rafael_lokasso.opus"

    to_do = [
        {
            "suffix": "melhor_confraternizacao",
            "start_time": (0, 10),
            "stop_time": (0, 13),
        },
        {
            "suffix": "deixa_ele_ficar",
            "start_time": (0, 20),
            "stop_time": (0, 23),
        },
        {
            "suffix": "melhor_equipe",
            "start_time": (0, 15),
            "stop_time": (0, 17),
        },
        {
            "suffix": "o_nerdao_da_area",
            "start_time": (0, 23),
            "stop_time": (0, 28),
        },
        {
            "suffix": "por_favorzinho",
            "start_time": (0, 42),
            "stop_time": (0, 45),
        },
    ]

    for new_sound in to_do:
        slice_file(in_file_name=in_file, extension="opus", **new_sound)
