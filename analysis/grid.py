import numpy as np, librosa
f = np.load('analysis/feat.npz'); bt = f['bt']; times=f['times']; low=f['low']; mid=f['mid']; high=f['high']; rms=f['rms']; oenv=f['oenv']
idx = np.arange(len(bt))
# robust linear fit
A = np.vstack([idx, np.ones_like(idx)]).T
per, off = np.linalg.lstsq(A, bt, rcond=None)[0]
res = bt - (idx*per+off)
print('period', per, 'bpm', 60/per, 'off', off, 'resid std', res.std(), 'max', np.abs(res).max())
# check drift in windows
for s in range(0, len(bt)-40, 40):
    p,o = np.polyfit(idx[s:s+40], bt[s:s+40], 1); print(s, round(60/p,2), round(bt[s],3))
# refine: onset envelope comb alignment for phase
def score(P, O):
    ts = O + P*np.arange(0, int((158-O)/P))
    fr = librosa.time_to_frames(ts, sr=22050, hop_length=512)
    fr = fr[fr<len(oenv)]
    return oenv[fr].mean()
best = max(((score(P,O),P,O) for P in np.linspace(per*0.997, per*1.003, 61) for O in np.linspace(off-0.06, off+0.06, 121)))
print('best comb', best, 'bpm', 60/best[1])
np.save('analysis/grid.npy', np.array([best[1], best[2]]))
