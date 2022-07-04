import datetime as dt
import pandas as pd
import matplotlib.pyplot as plt
from os import listdir
from bs4 import BeautifulSoup as bs

logdir = r'U:\DEPTO\DTVM RISCO\CONTROLES\SONS\MISC.SOUNDS\logs'
htmldir = r'U:\DEPTO\DTVM RISCO\CONTROLES\SONS\noisy-risk.github.io'

# Map: mp3 -> button
mp32button = dict()
with open('\\'.join((htmldir, 'index.html')), encoding='utf8') as hf:
    html = bs(hf, 'html.parser')
    for b in html.find_all('button'):
        if not 'onclick' in b.attrs:
            continue
        if b['onclick'].find('mp3') == -1:
            continue
        ini_idx = b['onclick'].rfind('/') + 1
        end_idx = b['onclick'].find('mp3') - 1
        for s in b.find_all('span'):
            if s['class'][0] == 'front' and s.contents:
                mp32button[b['onclick'][ini_idx:end_idx]
                           ] = s.contents[0].strip()


logs = listdir(logdir)
rows = []
for i, lf in enumerate(logs, start=1):
    if i > 6:
        break
    with open('\\'.join((logdir, lf))) as f:
        for l in f:
            sp = l.split('|')
            t = dt.datetime.fromisoformat(sp[0].rstrip().replace(',', '.'))
            a = sp[-1].split('/')[-1].split('.')[0]
            rows.append([t.date(), t.hour, t.minute, mp32button.get(a, a)])

# Raw DataFrame -- all data
df_raw = pd.DataFrame(rows, columns=['DATA', 'HORA', 'MINUTO', 'BOTAO'])

# Top 10 por dia (últimos 4 dias)
df_data = df_raw[['DATA', 'BOTAO']].reset_index().groupby(
    ['DATA', 'BOTAO']).count().reset_index()
df_data.columns = ['DATA', 'BOTAO', 'count']
datas = df_data.sort_values(by='DATA', ascending=False)['DATA'].unique()[:5]
maxcount = df_data[df_data.DATA >= datas.min()]['count'].max()
stride = max(maxcount // 16, 2)
ticks = list(range(0, maxcount+2, stride))
fig, axes = plt.subplots(2, 2)
cnt = 0
for d in datas:
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
 
fig, axes = plt.subplots(1,2)
# Total 'button push' por dia
dax = axes[0]
df_raw.groupby('DATA').count().reset_index().plot.bar(x='DATA', y='BOTAO', xlabel='', ax=dax)
dax.set_ylabel('TOTAL COUNT')
dax.set_xlabel('DATA')
xlabels = [lb.get_text() for lb in dax.get_xticklabels()]
for i in range(len(xlabels)):
    xlabels[i] = dt.date.fromisoformat(xlabels[i]).strftime('%b-%d')
dax.set_xticklabels(xlabels, rotation=45)
dax.legend_.remove()

# Total 'button push' por hora
hax = axes[1]
bns = list(range(6,22))
df_raw[['HORA','BOTAO']].plot.hist(by='HORA', bins=bns, density=True, rwidth=0.7, align='left', ax=hax, xlabel='')
hax.set_ylabel('FREQUENCIA')
hax.set_xlabel('HORA DO DIA')
hax.set_xticks(list(range(6,22)))
hax.legend_.remove()

fig.set_size_inches(10,5)
plt.tight_layout()
plt.show()
