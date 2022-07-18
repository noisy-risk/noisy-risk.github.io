import datetime as dt
import pandas as pd
import matplotlib.pyplot as plt
from os import listdir

logdir = r'U:\DEPTO\DTVM RISCO\CONTROLES\SONS\MISC.SOUNDS\logs'
htmldir = r'U:\DEPTO\DTVM RISCO\CONTROLES\SONS\noisy-risk.github.io'

ip2id = {'192.168.36.206': 'LY',
         '192.168.36.198': 'LG',
         '192.168.36.197': 'LG',
         '192.168.37.15': 'CT',
         '192.168.37.60': 'JP',
         '192.168.37.151': 'CT',
         '192.168.39.23': 'GB',
         '192.168.36.248': 'ED',
         '192.168.37.11': 'LS',
         '192.168.37.141': 'CR7',
         '192.168.36.254': 'RR',
         '192.168.37.95': 'TG',
         '192.168.36.202': 'IR',
         '192.168.37.117': 'RS',
         '192.168.36.205': 'CT',
         '192.168.36.243': 'YR'}

# Map: mp3 -> button
mp32button = dict()
with open('\\'.join((htmldir, 'data.js')), encoding='utf8') as bf:
    dss = ''.join(bf.readlines())
    dss = dss[dss.find('SoundData'):]
    # Clean up
    dss = dss.replace('\n', '')
    dss = dss.replace('null', '"null"')
    dss = dss.replace('true', '"true"')
    f_idx = dss.find('"func"')
    while f_idx >= 0:
        s_idx = f_idx + dss[f_idx:].find('()')
        end_idx = f_idx + dss[f_idx:].find('}') + 1
        dss = dss.replace(dss[s_idx:end_idx], '"null"')
        f_idx = end_idx + \
            dss[end_idx:].find('"func"') if dss[end_idx:].find(
                '"func"') >= 0 else -1
    # Completamente inseguro, isso eh (deveria ser) provisorio!!
    exec(dss)

    for cat in SoundData:
        snds = cat['sounds']
        for sound in snds:
            mp3 = sound['file'].split('.mp3')[0].strip()
            btn = sound['name'].strip()
            mp32button[mp3] = btn

logs = listdir(logdir)
rows = []
for i, lf in enumerate(logs, start=1):
    if i > 30:
        break
    with open('\\'.join((logdir, lf)), encoding='utf8') as f:
        for l in f:
            sp = l.split('|')
            t = dt.datetime.fromisoformat(sp[0].rstrip().replace(',', '.'))
            a = sp[-1].split('/')[-1].split('.mp3')[0].strip()
            origin = sp[1].strip() if sp[1].strip().split('.')[
                0] == '192' else 'NULL'
            rows.append([t.date(), t.hour, t.minute,
                        ip2id.get(origin, origin), mp32button.get(a, a)])

# Raw DataFrame -- last 30 days of log
df_raw = pd.DataFrame(
    rows, columns=['DATA', 'HORA', 'MINUTO', 'ORIGEM', 'BOTAO'])

# Top 10 por dia (últimos 4 dias)
ult_data = dt.date.fromisoformat(logs[-3].split('.')[-1])
df_data = df_raw[df_raw.DATA >= ult_data][['DATA', 'BOTAO']].reset_index().groupby(
    ['DATA', 'BOTAO']).count().reset_index()
df_data.columns = ['DATA', 'BOTAO', 'count']
datas = df_data[['DATA']].sort_values('DATA', ascending=False)[
    'DATA'].unique()[:5]
maxcount = df_data['count'].max()
stride = max(maxcount // 16, 2)
ticks = list(range(0, maxcount+2, stride))
fig, axes = plt.subplots(2, 2)
cnt = 0
for d in datas:
    if cnt > 3:
        break
    rankdf = df_data[df_data.DATA == d].sort_values(
        by='count', ascending=False).head(10).sort_values(by='count')
    j = cnt % 2
    i = (cnt - j) // 2
    a = axes[i, j]
    rankdf.plot.barh(x='BOTAO', y='count', ax=a, xlabel='')
    a.set_title(d.isoformat())
    a.set_xlim(1, maxcount)
    a.set_xticks(ticks)
    a.set_xlabel('CONTAGEM')
    a.legend_.remove()
    a.grid(True, axis='x', color='grey', alpha=0.3)
    cnt += 1

fig.set_size_inches(12, 6)
plt.tight_layout()
plt.subplots_adjust()

fig, axes = plt.subplots(1, 2)
# Total 'button push' por dia
dax = axes[0]
df_raw.groupby('DATA').count().reset_index().plot.bar(
    x='DATA', y='BOTAO', xlabel='', ax=dax)
dax.set_ylabel('TOTAL COUNT')
dax.set_xlabel('DATA')
xlabels = [lb.get_text() for lb in dax.get_xticklabels()]
for i in range(len(xlabels)):
    xlabels[i] = dt.date.fromisoformat(xlabels[i]).strftime('%b-%d')
dax.set_xticklabels(xlabels, rotation=45)
dax.legend_.remove()

# Total 'button push' por hora
hax = axes[1]
bns = list(range(6, 22))
df_raw[['HORA', 'BOTAO']].plot.hist(
    by='HORA', bins=bns, density=True, rwidth=0.7, align='left', ax=hax, xlabel='')
hax.set_ylabel('FREQUENCIA (DENSIDADE)')
hax.set_xlabel('HORA DO DIA')
hax.set_xticks(list(range(6, 22)))
hax.legend_.remove()

fig.set_size_inches(10, 5)
plt.tight_layout()
plt.subplots_adjust()

# Relatório X9 !!!    q>| >| (Top 10)
df_ori = df_raw[(df_raw.DATA >= ult_data) & (df_raw.ORIGEM != 'NULL')][[
    'DATA', 'ORIGEM']].reset_index().groupby(['DATA', 'ORIGEM']).count().reset_index()
df_ori.columns = ['DATA', 'ORIGEM', 'count']
datas = df_ori[['DATA']].sort_values('DATA', ascending=False)[
    'DATA'].unique()[:5]
maxcount = df_ori['count'].max()
stride = max(maxcount // 16, 2)
ticks = list(range(0, maxcount+2, stride))
fig, axes = plt.subplots(2, 2)
cnt = 0
for d in datas:
    if cnt > 3:
        break
    rankdf = df_ori[df_ori.DATA == d].sort_values(
        by='count', ascending=False).head(10).sort_values(by='count')
    j = cnt % 2
    i = (cnt - j) // 2
    a = axes[i, j]
    rankdf.plot.barh(x='ORIGEM', y='count', ax=a, xlabel='')
    a.set_title(d.isoformat())
    a.set_xlim(1, maxcount)
    a.set_xticks(ticks)
    a.set_xlabel('CONTAGEM')
    a.legend_.remove()
    a.grid(True, axis='x', color='grey', alpha=0.3)
    cnt += 1

fig.set_size_inches(12, 6)
plt.tight_layout()
plt.subplots_adjust()

plt.show()
