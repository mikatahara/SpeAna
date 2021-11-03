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
	var canvas = fdg1.cv;
	
	var lwidth=document.documentElement.clientWidth;
	lwidth=Math.min(1200,Math.max(480,lwidth));

	var cwidth=Math.floor(2.*lwidth/3.);
	var chight=canvas.clientHeight;
	var lmg=getNumericMargin(lwidth);
	var fsz=mFontSizeTable[getFontSize(lwidth)];

	fdg1.fSetWindowXY(0,cwidth,0,chight);
	fdg1.fClearWindowInside();

	fdg1.ctx.font =fsz;
	fdg1.ctx.fillStyle = '#222222';

	fdg1.fWriteText(yaxisstr[2*n], lmg, 20);
	fdg1.fWriteText(" 0.0", lmg, 115);
	fdg1.fWriteText(yaxisstr[2*n+1], lmg, 210);

	fdg1.fSetWindowXY(lmg+43,cwidth-20,20,chight-20);
	fdg1.fStrokeRect();
	fdg1.fSetViewPort(0,1024,parseFloat(yaxisstr[2*n+1]),parseFloat(yaxisstr[2*n]));
	fdg1.fDrawLine(mytimeDataArray);
}

function RedrawPowerView(n,m)
{
	var canvas = fdg2.cv;
	
	var lwidth=document.documentElement.clientWidth;
	lwidth=Math.min(1200,Math.max(480,lwidth));

	var cwidth=Math.floor(2.*lwidth/3.);
	var chight=canvas.clientHeight;
	var lmg=getNumericMargin(lwidth);
	var fsz=mFontSizeTable[getFontSize(lwidth)];

	fdg2.fSetWindowXY(0,cwidth,0,chight);
	fdg2.fClearWindowAll();

	fdg2.ctx.font =fsz;
	fdg2.ctx.fillStyle = '#222222';

	var top=n+(10-m);
	if(top>19) top=19;
	fdg2.fWriteText(yaxispow[top], lmg-20, 20);
	fdg2.fWriteText(yaxispow[((top-n)>>1)+n], lmg-20, 155);
	fdg2.fWriteText(yaxispow[n], lmg-20, 290);

	var px0=lmg+43;
	var px1=cwidth-20;
	var len01=(px1-px0)/4;

	if(mLinLog==0){
		fdg2.fWriteText("5kHz" , px0+len01*20000/24000, chight);
		fdg2.fWriteText("10kHz", px0+len01*20000/24000*2, chight);
		fdg2.fWriteText("15kHz", px0+len01*20000/24000*3, chight);
		fdg2.fWriteText("20kHz", px0+len01*20000/24000*4, chight);
	} else {
		fdg2.fSetWindowXY(px0,px1,0,chight);
		fdg2.fSetViewPort(mMinLogFreq,mMaxLogFreq,0,chight);
		fdg2.fVWriteText("100Hz", mAxisLogFreq[1] , 0);
		fdg2.fVWriteText("500Hz", mAxisLogFreq[5] , 0);
		fdg2.fVWriteText("1kHz" , mAxisLogFreq[6] , 0);
		fdg2.fVWriteText("5kHz" , mAxisLogFreq[10], 0);
		fdg2.fVWriteText("10kHz", mAxisLogFreq[11], 0);
	}


	fdg2.fSetWindowXY(px0,px1,20,chight-20);
	fdg2.fStrokeRect();

	mdBMin = n*10-100;
	mdBMax = mdBMin + (10-m)*10;

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

