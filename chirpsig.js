// chirpsig.jp
// Chirp Signal Generetor
// This project is licensed under the MIT License, see the LICENSE.txt file for details
// Copyright 2025 MikataHara All Rights Reserved.

var mLocalAudioBuffer= null;
var mAudioContext = null;
var mLoadFlag=false;
var mChirpGain=0.25;

function initAudioBuffer()
{
    mAudioContext = new AudioContext();
}

function loadDogSound(url) {
    if(mLoadFlag) return;

    var request = new XMLHttpRequest();

	request.open('GET', url, true);
	request.responseType = 'arraybuffer';

// Decode asynchronously
	request.onload = function() {
            mAudioContext.decodeAudioData(request.response, function(buffer) {
            mLocalAudioBuffer=buffer;
			mLoadFlag=true;
		}, function(){ alert('Error'); } );
	}
	request.send();
}

function playSound()
{
	var audioSource = null;	// creates a sound source
    var gain = mAudioContext.createGain();
    gain.gain.value = mChirpGain;
	audioSource = mAudioContext.createBufferSource();	// creates a sound source
	audioSource.buffer = mLocalAudioBuffer;
    audioSource.connect(gain);			    // tell the source which sound to play
	gain.connect(mAudioContext.destination);
	audioSource.playbackRate.value = 1.0;
	audioSource.start(0);								// play the source now
}