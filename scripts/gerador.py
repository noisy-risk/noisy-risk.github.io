"""
Script para picotar um mp3
Configurar: arquivo de entrada e arquivo de saida
Importante: Eh necessario ter o ffpmeg no PATH
"""
from pydub import AudioSegment

ROOT = r'U:\\DEPTO\\DTVM RISCO\\CONTROLES\\SONS\\noisy-risk.github.io\\scripts'

OUT_PATH, IN_PATH= f'{ROOT}/out', f'{ROOT}/in'

source_sound = AudioSegment.from_mp3(f"{IN_PATH}/respira_6Uw8mbj.mp3")

_start_min, _start_sec = 0, 2.3
_end_min, _end_sec = 0, 4

_start = _start_min * 60 * 1000 + _start_sec * 1000
_end  = _end_min * 60 * 1000 + _end_sec * 1000

extract = source_sound[_start:_end]

out_file = 'heheheh'

extract.export(f"{OUT_PATH}/{out_file}.mp3", format="mp3")
