import numpy as np, librosa, json
y, sr = librosa.load('assets/moon_src.mp3', sr=22050, mono=True)
P, O = np.load('analysis/grid.npy'); P = 60/175
hop=256
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop))
fq = librosa.fft_frequencies(sr=sr, n_fft=2048)
def flux(lo,hi):
    B = S[(fq>=lo)&(fq<hi)]
    B = np.log1p(B*10)
    d = np.maximum(0, np.diff(B, axis=1, prepend=B[:, :1])).sum(0)
    return d/ (np.percentile(d, 99)+1e-9)
kick = flux(35, 120); snare = flux(1500, 5000); hat = flux(7000, 11000)
bass_e = S[(fq>=30)&(fq<120)].sum(0); bass_e/=np.percentile(bass_e,95)
ft = librosa.frames_to_time(np.arange(S.shape[1]), sr=sr, hop_length=hop)
def at(sig, t, w=0.035):
    m=(ft>=t-w)&(ft<=t+w); return float(sig[m].max()) if m.any() else 0
# 16th grid
n16 = int((158.8 - O%P)/(P/4))+8
t0 = O - P*int(O/P)  # first grid beat near 0
print('t0', t0)
rows=[]
for i in range(int((158.8-t0)/(P/4))):
    t = t0 + i*P/4
    rows.append((t, at(kick,t), at(snare,t), at(hat,t)))
R=np.array(rows)
# bar phase: snare on beats 2 & 4 (i.e. beat index mod 4 in {1,3}) or half-time on 3
beats = R[::4]
for ph in range(4):
    s = [beats[(np.arange(len(beats))%4)==((ph+k)%4),2].mean() for k in range(4)]
    k_ = [beats[(np.arange(len(beats))%4)==((ph+k)%4),1].mean() for k in range(4)]
    print('phase',ph,'snare per beat-in-bar',np.round(s,3),'kick',np.round(k_,3))
np.save('analysis/r16.npy', R)
# save bass energy per beat
be = np.array([float(bass_e[(ft>=t)&(ft<t+P)].mean()) for t in beats[:,0]])
np.save('analysis/bass_beat.npy', be)
