# Spectrum Analizer using Web Audio API

The Web Audio API created this application. Using the API, FFT analyzes audio data and then converts it to Spectrum.

https://mikatahara.github.io/SpeAna/

This application is compatible with iPhones and PC Web Browser
<br>

<img src="https://www.webmidiaudio.com/jpeg/IMG_4807.png" height="640">

|Status|Button|
|--|--|
|Data collection and conversion stopped|<img src="https://www.webmidiaudio.com/jpeg/speana/start2.jpg">|
|Start the Web Audio API and start calculating the spectrum. Click to change the operating state.|<img src="https://www.webmidiaudio.com/jpeg/speana/start3.jpg">|
| When the trigger is ON, spectrum analysis starts when a loud sound is input. Click to change the operating state.|<img src="https://www.webmidiaudio.com/jpeg/speana/trigger2.jpg">|
| Triger is OFF | <img src="https://www.webmidiaudio.com/jpeg/speana/trigger3.jpg">|
|Triger Position<br>Determine the trigger position.|<img src="https://www.webmidiaudio.com/jpeg/speana/position.jpg">|
|<img src="https://www.webmidiaudio.com/jpeg/speana/pos50.jpg">|At 50%, calculations are made so that the loud sound is in the middle of the time axis.|
|<img src="https://www.webmidiaudio.com/jpeg/speana/pos25.jpg">|At 25%, the loud sound is calculated to be one quarter of the time axis.|
|Triger Level<br>Determine the trigger level. If the value is small, it will react to small sounds, and if the value is large, it will not react to small sounds.|<img src="https://www.webmidiaudio.com/jpeg/speana/level.jpg">|
|Y-Axis Zoom<br>Extends the size of the waveform's amplitude (Y-axis)|<img src="https://www.webmidiaudio.com/jpeg/speana/yzoom.jpg">|
|Y-Bottom<br>Determine the lower limit (dB) of the Y-axis|<img src="https://www.webmidiaudio.com/jpeg/speana/ybottom.jpg">|
|Y-Range<br>Determine the Y-axis range (dB)|<img src="https://www.webmidiaudio.com/jpeg/speana/yrange.jpg">|
|LIN/LOG<br>Switch the X axis between linear and log|<img src="https://www.webmidiaudio.com/jpeg/speana/xaxis.jpg">|
|Average<br>The spectrum is averaged and displayed the number of times shown here.|<img src="https://www.webmidiaudio.com/jpeg/speana/average.jpg">|
<br>
Click the Start button to launch the Web Audio API. You may be asked if you can use your computer's microphone. Please OK. Then, clap your hands into your computer's microphone and watch. The waveform and spectrum will be displayed.
<br>
Index page is [Index.html](https://mikatahara.github.io/)<br>
My Web site is [WebMidiAudio](https://webmidiaudio.com/)<br>

