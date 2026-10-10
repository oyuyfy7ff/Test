# Makes the 5 reminder sounds (WAV) into www/sounds and android/app/src/main/res/raw.
# Run from the repo root: python3 tools/make_sounds.py   (the build workflow runs it too)
import os
for _d in ("www/sounds", "android/app/src/main/res/raw"):
    os.makedirs(_d, exist_ok=True)
import wave, struct, math
SR = 22050
def tone(f, dur, amp=1.0, decay=4.0, attack=0.005, partials=((1,1.0),)):
    n = int(SR*dur); out = []
    for i in range(n):
        t = i/SR
        env = min(1.0, t/attack) * math.exp(-decay*t)
        v = sum(a*math.sin(2*math.pi*f*m*t) for m,a in partials)
        out.append(amp*env*v)
    return out
def mix(parts, total):
    n = int(SR*total); buf = [0.0]*n
    for start, samples in parts:
        s0 = int(SR*start)
        for i,v in enumerate(samples):
            if s0+i < n: buf[s0+i] += v
    return buf
def save(name, buf):
    peak = max(abs(x) for x in buf) or 1
    # fade last 20 ms to avoid click
    f = int(SR*0.02)
    for i in range(f): buf[-1-i] *= i/f
    data = b"".join(struct.pack("<h", int(max(-1,min(1,x/peak*0.85))*32767)) for x in buf)
    for d in ("www/sounds", "android/app/src/main/res/raw"):
        with wave.open(f"{d}/{name}.wav","wb") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(data)
# chime: C6 E6 G6 arpeggio
save("chime", mix([(0.0, tone(1047,1.4,decay=3.5,partials=((1,1),(2,0.2)))),
                   (0.18, tone(1319,1.3,decay=3.5,partials=((1,1),(2,0.2)))),
                   (0.36, tone(1568,1.5,decay=3.0,partials=((1,1),(2,0.2))))], 1.9))
# bell: inharmonic partials
bp = ((1,1.0),(2.76,0.6),(5.4,0.35),(8.93,0.2))
save("bell", mix([(0.0, tone(660,2.2,decay=2.2,partials=bp)),(0.9, tone(660,1.4,decay=3.0,amp=0.6,partials=bp))], 2.3))
# beep: two short beeps
def beep(): 
    s = tone(1000,0.16,decay=0.0,attack=0.01); 
    n=len(s); return [v*(1 if i<n-int(SR*0.02) else (n-i)/(SR*0.02)) for i,v in enumerate(s)]
save("beep", mix([(0.0, beep()),(0.28, beep())], 0.5))
# melody: C5 E5 G5 C6
notes=[523,659,784,1047]
save("melody", mix([(i*0.22, tone(f,0.7,decay=5.0,partials=((1,1),(2,0.3),(3,0.1)))) for i,f in enumerate(notes)], 1.7))
# drop: falling sine
n=int(SR*0.5); drop=[]; ph=0.0
for i in range(n):
    t=i/SR; f=1400*math.exp(-6*t)+450; ph+=2*math.pi*f/SR
    drop.append(math.sin(ph)*math.exp(-7*t)*min(1,t/0.003))
save("drop", mix([(0.0,drop),(0.55,[x*0.6 for x in drop])], 1.1))
