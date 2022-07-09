var mLogData=null;
var mLinData=null;
var mMaxLogFreq;
var mMinLogFreq;
var mMaxLinFreq;
var mAxisLogFreq=[5,1,2,3,4,5,12,3,4,5,10];
var mLinLog=0;
var mdBMin=-100;
var mdBMax=0;

var yaxisstr=[
	"+1.0","-1.0",
	"+0.5","-0.5",
	"+0.25","-0.25",
	"+0.125","-0.125",
	"+0.0625","-0.0625",
];
var yaxispow=[
	"-100dB"," -90dB"," -80dB"," -70dB"," -60dB",
	" -50dB"," -40dB"," -30dB"," -20dB"," -10dB",
	"   0dB","  10dB","  20dB","  30dB","  40dB",
	"  50dB","  60dB","  70dB","  80dB","  90dB",
];
var yaxisvalue=[
	-100, -90, -80, -70, -60,
	 -50, -40, -30, -20, -10,
	   0,  10,  20,  30,  40,
	  50,  60,  70,  80,  90,
];

function initXAixs()
{
	mLogData=new Array(mFrequencyBinCount);
	mLinData=new Array(mFrequencyBinCount);

	for(var i=0; i<mFrequencyBinCount; i++){
		mLogData[i]=new Array(2);
		mLinData[i]=new Array(2);
		mLinData[i][0]=sampleRate/mFftsize*i;
	}
	for(var i=1; i<mFrequencyBinCount; i++){
		mLogData[i][0]=Math.log(mLinData[i][0]);
	}
	mMinLogFreq = mLogData[0][0]=mLogData[1][0];
	mMaxLogFreq = mLogData[mFrequencyBinCount-1][0];
	mMaxLinFreq = mLinData[mFrequencyBinCount-1][0];

	mAxisLogFreq[0]=Math.log(50);
	mAxisLogFreq[1]=Math.log(100);
	mAxisLogFreq[2]=Math.log(200);
	mAxisLogFreq[3]=Math.log(300);
	mAxisLogFreq[4]=Math.log(400);
	mAxisLogFreq[5]=Math.log(500);
	mAxisLogFreq[6]=Math.log(1000);
	mAxisLogFreq[7]=Math.log(2000);
	mAxisLogFreq[8]=Math.log(3000);
	mAxisLogFreq[9]=Math.log(4000);
	mAxisLogFreq[10]=Math.log(5000);
	mAxisLogFreq[11]=Math.log(10000);
}

function RedrawWaveView(n)
{

	ix10 = 0;
	ix11 = window.innerWidth*1.0;
	iy10 = window.innerHeight*0.05;
	iy11 = window.innerHeight*0.940;
	fdg1.fSetWindowXY(ix10,ix11,iy10,iy11);
	fdg1.fClearWindowAll();


	ix10 = window.innerWidth*0.1;
	ix11 = window.innerWidth*0.9;
	iy10 = window.innerHeight*0.1;
	iy11 = window.innerHeight*0.45;

	fdg1.fSetWindowXY(ix10,ix11,iy10,iy11);
	fdg1.fSetViewPort(0,100,0,100);
	fdg1.fVLine(0,0,100,100);
	fdg1.fStrokeRect();

	/* XŽ² */
	fdg1.ctx.font = fsz;
	fdg1.fVWriteText(yaxisstr[2*n], -ptx, 0);
	fdg1.fVWriteText(" 0.0", -ptx, 50);
	fdg1.fVWriteText(yaxisstr[2*n+1], -ptx, 100);
}

function RedrawPowerView(n,m)
{
	ix20 = 0;
	ix21 = window.innerWidth*1.0;
	iy21 = window.innerHeight*0.940;
	fdg2.fSetWindowXY(ix20,ix21,iy20,iy21);
	fdg2.fClearWindowAll();

	ix20 = window.innerWidth*0.1;
	ix21 = window.innerWidth*0.9;
	iy21 = window.innerHeight*0.940;
	fdg2.fSetWindowXY(ix20,ix21,iy20,iy21);

	if(mLinLog==0){
		var dMoj=100;
		fdg2.fSetViewPort(0,mMaxLinFreq,0,1);
		fdg2.fVWriteText("5kHz" , 5000-dMoj, 0);
		fdg2.fVWriteText("10kHz", 10000-dMoj, 0);
		fdg2.fVWriteText("15kHz", 15000-dMoj, 0);
		fdg2.fVWriteText("20kHz", 20000-dMoj, 0);
	} else {
		var dMoj=0.1;
		fdg2.fSetViewPort(mMinLogFreq,mMaxLogFreq,0,100);
		fdg2.fVWriteText("100Hz", mAxisLogFreq[1]-dMoj , 0);
		fdg2.fVWriteText("500Hz", mAxisLogFreq[5]-dMoj , 0);
		fdg2.fVWriteText("1kHz" , mAxisLogFreq[6]-dMoj , 0);
		fdg2.fVWriteText("5kHz" , mAxisLogFreq[10]-dMoj, 0);
		fdg2.fVWriteText("10kHz", mAxisLogFreq[11]-dMoj, 0);
	}

	ix20 = window.innerWidth*0.1;
	ix21 = window.innerWidth*0.9;
	iy20 = window.innerHeight*0.55;
	iy21 = window.innerHeight*0.9;

	fdg2.fSetWindowXY(ix20,ix21,iy20,iy21);
	fdg2.fSetViewPort(0,100,0,100)
	fdg2.fStrokeRect();
	fdg2.fVLine(0,0,100,100);

	fdg2.ctx.font = fsz; 	//"12px 'Times New Roman'";

	var top=n+(10-m);
	if(top>19) top=19;
	fdg2.fVWriteText(yaxispow[top], -ptx, 95);
	fdg2.fVWriteText(yaxispow[((top-n)>>1)+n],-ptx, 50);
	fdg2.fVWriteText(yaxispow[n], -ptx, 5);

	mdBMax=yaxisvalue[top];
	mdBMin=yaxisvalue[n];

	Drawpowergraph();

}

function Drawpowergraph(){
	fdg2.fClearWindowInside();
	if(mLinLog==1){
		for(i=0; i<mFrequencyBinCount; i++){ 
			mLogData[i][1]=myDataArray[i];
		}
		fdg2.fSetViewPort(mMinLogFreq,mMaxLogFreq,0,1);
		for(var i=0; i<12; i++){
			fdg2.fVStrokeDottedLine(mAxisLogFreq[i],0,mAxisLogFreq[i],1);
		}
		fdg2.fSetViewPort(mMinLogFreq,mMaxLogFreq,mdBMin,mdBMax);
		fdg2.fDrawLineXY(mLogData,mFrequencyBinCount);
	} else {
		fdg2.fSetViewPort(0,mMaxLinFreq,0,1);
		for(var i=1; i<21; i++){
			var freq = i*1000;
			fdg2.fVStrokeDottedLine(freq,0,freq,1);
		}
		for(i=0; i<mFrequencyBinCount; i++){ 
			mLinData[i][1]=myDataArray[i];
		}
		fdg2.fSetViewPort(0,mMaxLinFreq,mdBMin,mdBMax);
		fdg2.fDrawLineXY(mLinData,mFrequencyBinCount);
	}
}

