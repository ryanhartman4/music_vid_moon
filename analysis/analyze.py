import librosa, numpy as np, json, sys
y, sr = librosa.load('assets/moon_src.mp3', sr=22050, mono=True)
dur = len(y)/sr
hop = 512
# tempo & beats
oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
tempo, beats = librosa.beat.beat_track(onset_envelope=oenv, sr=sr, hop_length=hop, start_bpm=174, tightness=400)
bt = librosa.frames_to_time(beats, sr=sr, hop_length=hop)
print('dur', dur, 'tempo', tempo, 'nbeats', len(bt))
d = np.diff(bt); print('beat interval median', np.median(d), 'min', d.min(), 'max', d.max())
# alt tempo estimate
t2 = librosa.feature.tempo(onset_envelope=oenv, sr=sr, hop_length=hop, aggregate=None)
print('tempo hist', np.percentile(t2,[10,50,90]))
# band energies
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop))
freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
def band(lo, hi): return S[(freqs>=lo)&(freqs<hi)].sum(0)
low, mid, high = band(30,150), band(150,2000), band(2000,11000)
rms = librosa.feature.rms(y=y, hop_length=hop)[0]
times = librosa.frames_to_time(np.arange(S.shape[1]), sr=sr, hop_length=hop)
# per-second summary
for s in range(0, int(dur)+1, 2):
    m = (times>=s)&(times<s+2)
    print(f"{s:4d}s rms {rms[m].mean():.3f} low {low[m].mean():7.1f} mid {mid[m].mean():7.1f} high {high[m].mean():7.1f}")
np.savez('analysis/feat.npz', times=times, rms=rms, low=low, mid=mid, high=high, oenv=oenv, bt=bt)
