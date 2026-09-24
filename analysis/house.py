import librosa, numpy as np
y, sr = librosa.load('assets/house_src.mp3', sr=22050, mono=True)
dur=len(y)/sr; hop=512
oenv=librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
tempo, beats = librosa.beat.beat_track(onset_envelope=oenv, sr=sr, hop_length=hop)
bt=librosa.frames_to_time(beats, sr=sr, hop_length=hop)
print('dur %.1f tempo'%dur, tempo, 'beats', len(bt), 'median ibi', np.median(np.diff(bt)))
print('tempo alt', librosa.feature.tempo(onset_envelope=oenv, sr=sr, hop_length=hop, start_bpm=120))
rms=librosa.feature.rms(y=y, hop_length=hop)[0]; t=librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop)
S=np.abs(librosa.stft(y,n_fft=2048,hop_length=hop)); fq=librosa.fft_frequencies(sr=sr,n_fft=2048); low=S[(fq>30)&(fq<150)].sum(0)
for s in range(0,int(dur),6):
    m=(t>=s)&(t<s+6); print(f"{s:4d}s rms {rms[m].mean():.3f} low {low[m].mean():6.0f}")
