var log = null;
var str = null;
var mFftsize=16384;
var L10=Math.log(10);

var audioContext=null;
var audiosource_t=null;
var node=null;
var myArrayBuffer=null;
var sampleRate=mFftsize*32;

var fdg1 = null;
var fdg2 = null;

var myDataArray	= null;
var mDataBuf = null;		//for Average
var mytimeDataArray	= null;
var mFrequencyBinCount=0;
var mRingBuf=null;
var RingBufSize=65536;
var mXlength=16384

var mWp=0;
var mTriglev=0.25;
var mTrigpos=0;
var mTrigSw=true;
var mAvr=1;
var mCnt=0;

var onoff_flag=0;
var timerId=null;

var canvasbkg;
var canvaspw1;

var ix10,ix11,iy10,iy11;
var ix20,ix21,iy20,iy21;
var fn;
var fsz;
var ptx;

var mFontSizeTable=[
	"12px 'Times New Roman'",
	"13px 'Times New Roman'",
	"14px 'Times New Roman'",
	"15px 'Times New Roman'",
	"16px 'Times New Roman'",
	"17px 'Times New Roman'",
	"18px 'Times New Roman'",
];

// constraints
var mConstraints = {
	video: false,
	audio: true		//{ echoCancellation: false }  // �G�R�[�L�����Z��������
};

// constraints (Chrome)
if (window.chrome) {
	mConstraints = {
		video: false,
		audio: {mandatory: {echoCancellation : false, googEchoCancellation: false}}  
	};
}

window.onload = function(){

	$('#vgofft').click(function() {
		if(onoff_flag==0){
//			document.getElementById("gofft").innerHTML = "�}�C�N";
			onoff_flag=1;
			console.log(onoff_flag);
			if(audioContext==null) gofft();
			else {
				audiosource_t.connect(node);
				node.onaudioprocess=process_t;
			}
			gotimer();
			this.value="Start";
			this.style.backgroundColor="#f9edce";
		} else {
			onoff_flag=0;
			clearInterval(timerId);
			this.value="Stop";
			this.style.backgroundColor="#cde8fa";
		}
	});
	
	
	$('#vtrigger').click(function(){
		if(mTrigSw){
			mTrigSw=false;
			this.value="Trigger OFF";
			this.style.backgroundColor="#f9edce";
		} else {
			mTrigSw=true;
			this.value="Trigger ON";
			this.style.backgroundColor="#cde8fa";
		}
	});


	$('#fftleng').change(function() {
		console.log($(this).val());
		var x=$(this).val();
		mFftsize = Math.pow(2, x);
	});

	$('#tglevel').change(function() {
		mTriglev=parseInt($(this).val())/100;
	});

	$('#tpos').change(function() {
		mTrigpos=Math.floor(mFftsize*parseInt($(this).val())/100);
	});

	$('#wyaxis').change(function() {
		var val=parseInt($(this).val());
		RedrawWaveView(val);
	});

	$('#wxaxis').change(function() {
		var val=parseInt($(this).val());
		mXlength = 16384>>val;
		console.log(mXlength);
	});

	$('#wypower').change(function() {
		var valp=parseInt($(this).val());
		var valr=parseInt($('#wyrange').val());
		RedrawPowerView(valp,valr);
	});

	$('#wyrange').change(function() {
		var valp=parseInt($('#wypower').val());
		var valr=parseInt($(this).val());
		RedrawPowerView(valp,valr);
	});

	$('#linlog').change(function() {
		mLinLog=parseInt($(this).val());
		var valp=parseInt($('#wypower').val());
		var valr=parseInt($('#wyrange').val());
		RedrawPowerView(valp,valr);
	});

	$('#average').change(function(){
		mAvr=parseInt($(this).val());
		mCnt=mAvr;
		if(mDataBuf!=null){
			for(var i=0; i<mFrequencyBinCount; i++) mDataBuf[i]=0.;
		}
	});

	// Initial Parameter
	mTriglev=parseInt($('#tglevel').val())/100;
	mTrigpos=Math.floor(mFftsize*parseInt($('#tpos').val())/100);

	// FFT Preparation
	mFrequencyBinCount=mFftsize/2;
	mytimeDataArray = new Float32Array(mFftsize);
	myDataArray = new Float32Array(mFrequencyBinCount);
	mDataBuf = new Float32Array(mFrequencyBinCount);
	mRingBuf = new Float32Array(RingBufSize);

	for(var i=0; i<mFrequencyBinCount; i++) mDataBuf[i]=0.;

/* canvas �ݒ� */
	canvaspw1 = document.getElementById( 'pw1' ) ;
	canvasbkg = document.getElementById( 'bkg' ) ;

/* �`��̈�̏����� */
	fdg1 = new DrawGraph(0,100,0,100);
	fdg1.fSetCanvas(canvasbkg);
	fdg1.fResize();
	fdg1.ctx.globalAlpha=0.6;

	fdg2 = new DrawGraph(0,100,0,100);
	fdg2.fSetCanvas(canvaspw1);
	fdg2.fResize();
	fdg2.ctx.globalAlpha=0.6;

/* ViewPort/ Window �̐ݒ� */
	ix10 = window.innerWidth*0.1;
	ix11 = window.innerWidth*0.9;
	iy10 = window.innerHeight*0.1;
	iy11 = window.innerHeight*0.45;

	fdg1.fSetWindowXY(ix10,ix11,iy10,iy11);
	fdg1.fSetViewPort(0,100,0,100);
	fdg1.fVLine(0,0,100,100);
	fdg1.fStrokeRect();

	ix20 = window.innerWidth*0.1;
	ix21 = window.innerWidth*0.9;
	iy20 = window.innerHeight*0.55;
	iy21 = window.innerHeight*0.9;

	fdg2.fSetWindowXY(ix20,ix21,iy20,iy21);
	fdg2.fSetViewPort(0,100,0,100);
	fdg2.fVLine(0,0,100,100);
	fdg2.fStrokeRect();

/* �`��̈�̏����� */
	var lwidth=window.innerWidth;
	lwidth=Math.min(1200,Math.max(480,lwidth));
	fn=getFontSize(lwidth);
	fsz=mFontSizeTable[fn];
	ptx=Math.floor(42./fdg1.fAx+fn*0.5);

	/* X�� */
	fdg1.ctx.font = fsz;
	fdg1.fVWriteText("+1.0", -ptx, 0);
	fdg1.fVWriteText(" 0.0", -ptx, 50);
	fdg1.fVWriteText("-1.0", -ptx, 100);

	ptx=Math.floor(48./fdg1.fAx+fn*0.5);
	fdg2.ctx.font = fsz; 	//"12px 'Times New Roman'";
	fdg2.fVWriteText("   0dB", -ptx, 95);
	fdg2.fVWriteText(" -50dB", -ptx, 50);
	fdg2.fVWriteText("-100dB", -ptx, 5);

	/* Y�� */
	iy21 = window.innerHeight*0.940;
	fdg2.fSetWindowXY(ix20,ix21,iy20,iy21);
	fdg2.fSetViewPort(0,100,0,100);
	fdg2.fVWriteText("5kHz" , 20, 0);
	fdg2.fVWriteText("10kHz", 45, 0);
	fdg2.fVWriteText("15kHz", 70, 0);
	fdg2.fVWriteText("20kHz", 95, 0);

// ---------------------------------------------------------------------------
	log=document.getElementById("log");

	iy21 = window.innerHeight*0.9;
	fdg2.fSetWindowXY(ix20,ix21,iy20,iy21);
	fdg2.fSetViewPort(0,100,0,100);

// ---------------------------------------------------------------------------
	fdg1.fSetViewPort(0,1024,-1,1);
	initXAixs();

}


//
// ��ʂ�width����AY���̐����\���̃}�[�W�������߂�
function getNumericMargin(x)
{
//	return Math.floor(0.0417*x-8.0)
	return Math.floor(0.08*x - 8.0)
}

//
// ��ʂ�width����A�t�H���g�T�C�Y�����߂�
function getFontSize(x)
{
	return Math.floor(0.0083*x - 3)
}

function gofft()
{
// ---------------------------------------------------------------------------
	//Audio Initialize
	audioContext = new AudioContext();
	node = audioContext.createScriptProcessor(mFftsize, 2, 2);
	sampleRate = audioContext.sampleRate;
	myArrayBuffer = audioContext.createBuffer(2, mFftsize, audioContext.sampleRate);

// ---------------------------------------------------------------------------
	//Get Usermedia
    navigator.getUserMedia = navigator.getUserMedia ||
                              navigator.webkitGetUserMedia ||
                              navigator.mozGetUserMedia;

	if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
		log.innerText += "Navi OK\n"
	}

/*
	navigator.getUserMedia(
		mConstraints,
		function(stream){
			log.innerText += "OK\n"
			audiosource_t = audioContext.createMediaStreamSource(stream);
			audiosource_t.connect(node);
		},
		function(e) {	// I can't use getUserMedia
			log.innerText += "NG\n"
			console.log(e);
		}
	);
*/

	navigator.mediaDevices.getUserMedia(mConstraints).then(function(stream){
			log.innerText += "OK\n"
			audiosource_t = audioContext.createMediaStreamSource(stream);
			audiosource_t.connect(node);
		}).catch(function(err) {
			log.innerText += err
			log.innerText += "NG\n"
			console.log (err);
	});


// ---------------------------------------------------------------------------
	// Audio Node Connection
	audiosource = audioContext.createBufferSource();
	audiosource.buffer = myArrayBuffer;
	node.connect(audioContext.destination);

// ---------------------------------------------------------------------------
	//Set Process
	node.onaudioprocess=process_t;

// ---------------------------------------------------------------------------
	initXAixs();	//Power Group�̏���

// ---------------------------------------------------------------------------
	gotimer();

// ---------------------------------------------------------------------------
//	log=document.getElementById("log");
}

// ---------------------------------------------------------------------------
// Function for Buffer full
var cnt=-1;
function process_t(data){
	var outputL=data.outputBuffer.getChannelData(0);
	var outputR=data.outputBuffer.getChannelData(1);
	var inputL =data.inputBuffer.getChannelData(0);
	var inputR =data.inputBuffer.getChannelData(1);
	var procsize = data.inputBuffer.length;

	for(var i=0; i<procsize; i++){
		outputL[i]=0.;
		outputR[i]=0.;
//		mRingBuf[mWp++]=0.4*Math.sin(cnt*Math.PI);
		mRingBuf[mWp++]=inputL[i];
		mWp%=RingBufSize;
//		mytimeDataArray[i]=inputL[i];
//		mytimeDataArray[i]=0.4*Math.sin(cnt*Math.PI);
		cnt+=0.01;
		if(cnt>1.0) cnt=cnt-2.0;
	}
}

//-------------------------------------------------------------------------
function setStr()
{
	str ="sampling frequency=";
	str += sampleRate;
	str +="\n";
	str +="mAnalyser:\n";

	str +="  mFftsize=";
	str +=mFftsize;
	str +="\n";

	str +="  frequencyBinCount=";
	str +=mAnalyser.frequencyBinCount;
	str +="\n";

	str +="  minDecibels=";
	str +=mAnalyser.minDecibels;
	str +="\n";
	str +="  maxDecibels=";
	str +=mAnalyser.maxDecibels;
	str +="\n";
	str +="  smoothingTimeConstant=";
	str +=mAnalyser.smoothingTimeConstant;
	str +="\n";
}


//-------------------------------------------------------------------------
// Function Get Max Value	
var mRmax, mJ;
function mAxdata(data,size){
	mRmax=-1000;
	mJ=0;
	for(var i=0; i<size; i++){
		if(mRmax<data[i]){
			mRmax=data[i];
			mJ=i;
		}
	}
}

//-------------------------------------------------------------------------
function gotimer(){

	timerId=setInterval(function(){

		var mRel=new Array(mFftsize);
		var mImg=new Array(mFftsize);
		var iRp=-1;
		var j;
		var len;

		if(mTrigSw){
			j= (mWp+1)%RingBufSize;
			for(i=0; i<RingBufSize; i++){
				if(Math.abs(mRingBuf[j])>mTriglev){
					iRp=j;  break;
				}
				j++;
				j=j%RingBufSize;
			}

			if(iRp==-1) return;
	
			iRp-=mTrigpos;
			if(iRp<0) iRp+=RingBufSize;
			len=mWp-iRp;
			if(len<0) len+=RingBufSize;
			if(len<mFftsize) return;
		} else {
			iRp=mWp+1;
			iRp%=RingBufSize;
		}

		for(var i=0; i<mFftsize; i++){
			mRel[i]=mRingBuf[(iRp++)%RingBufSize];
			mytimeDataArray[i]=mRel[i];
			mImg[i]=0;
		}

		blackman( mRel );
		FFT( mRel, mImg, mFftsize, 0 );

		if(mAvr==1){
			for(var i=0; i<mFrequencyBinCount; i++){
				myDataArray[i]=10.*Math.log(mRel[i]*mRel[i]+mImg[i]*mImg[i])/L10;
			}
		} else {
			for(var i=0; i<mFrequencyBinCount; i++){
				mDataBuf[i]+=10.*Math.log(mRel[i]*mRel[i]+mImg[i]*mImg[i])/L10;
			}
			mCnt--;
			if(mCnt==0){
				for(var i=0; i<mFrequencyBinCount; i++){
					myDataArray[i]=mDataBuf[i]/mAvr;
				}
				mCnt=mAvr;
				for(var i=0; i<mFrequencyBinCount; i++)
					mDataBuf[i]=0.;
			}
		}

		mAxdata(myDataArray,mFrequencyBinCount);

		log.innerHTML = "Peak";
		log.innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp';
		log.innerHTML += Math.floor(mRmax*100)/100.;
		log.innerHTML += "dB";
		log.innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp';
		log.innerHTML += mJ*sampleRate/mFftsize*2;
		log.innerHTML += "Hz"
		
		log.innerHTML += "&nbsp;&nbsp;"
		log.innerHTML += "Count=";
		log.innerHTML += mCnt+1;
		log.innerHTML += "/";
		log.innerHTML += mAvr;

		fdg1.fClearWindowInside();
		fdg1.fDrawLineSize(mytimeDataArray,mXlength);

		Drawpowergraph();

	}, 500 );
}

