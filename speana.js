var log = null;
var str = null;
var mFftsize=2048;
var L10=Math.log(10);

var audioContext=null;
var audiosource_t=null;
var node=null;
var myArrayBuffer=null;
var sampleRate=0;

var fdg1 = null;
var fdg2 = null;

var myDataArray	= null;
var mytimeDataArray	= null;
var mFrequencyBinCount=0;
var mRingBuf=null;
var RingBufSize=65536;

var mWp=0;
var mTriglev=0.25;
var mTrigpos=0;
var mTrigSw=true;

var onoff_flag=0;
var timerId=null;

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
	audio: { echoCancellation: false }  // エコーキャンセラ無効化
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
//			document.getElementById("gofft").innerHTML = "マイク";
			onoff_flag=1;
			console.log(onoff_flag);
			if(audioContext==null) gofft();
			else {
				audiosource_t.connect(node);
				node.onaudioprocess=process_t;
			}
			gotimer();
		}
	});

	$('#fftleng').change(function() {
		console.log($(this).val());
		var x=$(this).val();
		mFftsize = Math.pow(2, x);
	});

	$('#vtrigger').click(function(){
		var r = $(this).prop('checked');
		if(r){
			mTrigSw=true;
		} else {
			mTrigSw=false;
		}
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

	// Initial Parameter
	mTriglev=parseInt($('#tglevel').val())/100;
	mTrigpos=Math.floor(mFftsize*parseInt($('#tpos').val())/100);

	// FFT Preparation
	mFrequencyBinCount=mFftsize/2;
	mytimeDataArray = new Float32Array(mFftsize);
	myDataArray = new Float32Array(mFrequencyBinCount);
	mRingBuf = new Float32Array(RingBufSize);

	/* 描画領域の初期化 */
	var canvas = document.getElementById( 'bkg' ) ;
	
	var lwidth=document.documentElement.clientWidth;
	lwidth=Math.min(1200,Math.max(480,lwidth));
	var cwidth=Math.floor(2.*lwidth/3.);
	var chight=canvas.clientHeight;
	var lmg=getNumericMargin(lwidth);
	var fsz=mFontSizeTable[getFontSize(lwidth)];

	console.log(getFontSize(1200));
	console.log(getFontSize(480));

	canvas.width = cwidth;
	fdg1 = new DrawGraph(0,cwidth,0,chight);
	fdg1.fSetCanvas(canvas);

	fdg1.fSetViewPort(0,cwidth,0,chight);
//	fdg1.fStrokeRect();

//	fdg1.fVRect(105,20,cwidth-20,chight-20);
	fdg1.ctx.font =fsz; //"12px 'Times New Roman'";
	fdg1.fWriteText("+1.0", lmg, 20);
	fdg1.fWriteText(" 0.0", lmg, 115);
	fdg1.fWriteText("-1.0", lmg, 210);

	fdg1.fSetWindowXY(lmg+43,cwidth-20,20,chight-20);
	fdg1.fStrokeRect();
	fdg1.fSetViewPort(0,1024,-1,1);

	/* 描画領域の初期化 */
	canvas = document.getElementById( 'pw1' ) ;
	canvas.width = cwidth;
	chight=canvas.clientHeight;
	fdg2 = new DrawGraph(0,cwidth,0,chight);
	fdg2.fSetCanvas(canvas);

	fdg2.fSetViewPort(0,cwidth,0,chight);
//	fdg2.fStrokeRect();

//	fdg2.fVRect(105,20,cwidth-20,chight-20);
	fdg2.ctx.font =fsz; //"12px 'Times New Roman'";
	fdg2.fWriteText("   0dB", lmg-20, 20);
	fdg2.fWriteText(" -50dB", lmg-20, 155);
	fdg2.fWriteText("-100dB", lmg-20, 290);

	var px0=lmg+43;
	var px1=cwidth-20;
	var len01=(px1-px0)/4;

	fdg2.fWriteText("5kHz" , px0+len01  -32, chight);
	fdg2.fWriteText("10kHz", px0+len01*2-32, chight);
	fdg2.fWriteText("15kHz", px0+len01*3-32, chight);
	fdg2.fWriteText("20kHz", px0+len01*4-32, chight);

	fdg2.fSetWindowXY(px0,px1,20,chight-20);
	fdg2.fStrokeRect();
	fdg2.fSetViewPort(0,1024,-80,20);
}


//
// 画面のwidthから、Y軸の数字表示のマージンを求める
function getNumericMargin(x)
{
	return Math.floor(0.0417*x-8.0)
}

//
// 画面のwidthから、フォントサイズを求める
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
	navigator.getUserMedia(
		mConstraints,
		function(stream){
			audiosource_t = audioContext.createMediaStreamSource(stream);
			audiosource_t.connect(node);
		},
		function(e) {	// I can't use getUserMedia
			console.log(e);
		}
	);

// ---------------------------------------------------------------------------
	// Audio Node Connection
	audiosource = audioContext.createBufferSource();
	audiosource.buffer = myArrayBuffer;
	node.connect(audioContext.destination);

// ---------------------------------------------------------------------------
	//Set Process
	node.onaudioprocess=process_t;

// ---------------------------------------------------------------------------
	initXAixs();	//Power Groupの準備

// ---------------------------------------------------------------------------
	gotimer();

// ---------------------------------------------------------------------------
	log=document.getElementById("log");
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

		for(var i=0; i<mFrequencyBinCount; i++){
			myDataArray[i]=10.*Math.log(mRel[i]*mRel[i]+mImg[i]*mImg[i])/L10;
		}

		mAxdata(myDataArray,mFrequencyBinCount);

		log.innerHTML = "Peak";
		log.innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp';
		log.innerHTML += Math.floor(mRmax*100)/100.;
		log.innerHTML += "dB";
		log.innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp';
		log.innerHTML += mJ*sampleRate/mFftsize*2;
		log.innerHTML += "Hz"

		fdg1.fClearWindowInside();
		fdg1.fDrawLine(mytimeDataArray);

		Drawpowergraph();

	}, 500 );
}

