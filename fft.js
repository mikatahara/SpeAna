//
// http://www.natural-science.or.jp/article/20160920215800.php
//
function FFT( an, bn, N, Inverse ){
/////////////////////////////////////////
//参考：Javaで学ぶシミュレーションの基礎
/////////////////////////////////////////
// 入力
// N  ： 項数（2のべき乗）
// an : 実数配列（順変換：実数空間データを項数Nで指定、逆変換：展開係数a(n)）
// bn : 実数配列（順変換：虚数空間データを項数Nで指定、逆変換：展開係数b(n)）
// Inverse : 逆変換の場合に true
/////////////////////////////////////////
// 出力
// an : 実数配列（順変換：展開係数a(n)、逆変換：実数空間データ）
// bn : 実数配列（順変換：展開係数b(n)、逆変換：虚数空間データ）
/////////////////////////////////////////
	var ff = Inverse ? 1 : -1;
	var rot = new Array(N);
	for( var i = 0; i < rot.length; i++ ) rot[ i ] = 0;
	var nhalf = N/2, num = N/2;
	var sc = 2 * Math.PI / N;
	while( num >= 1 ){
		for(var j = 0; j < N; j += 2 * num ){
			var phi = rot[j] / 2;
			var phi0 = phi + nhalf;
			var c = Math.cos( sc * phi );
			var s = Math.sin( sc * phi * ff );
			for( var k = j; k < j + num; k++ ){
				var k1 = k + num;
				var a0 = an[ k1 ] * c - bn[ k1 ] *s;
				var b0 = an[ k1 ] * s + bn[ k1 ] *c;
				an[ k1 ] = an[ k ] - a0;
				bn[ k1 ] = bn[ k ] - b0;
				an[ k ] = an[ k ] + a0;
				bn[ k ] = bn[ k ] + b0;
				rot[ k ] = phi;
				rot[ k1 ] = phi0;
			}
		}
		num = num / 2;
	}

	for( var i = 0; i < N ; i++ ){
		var j = rot[ i ]; 
		if( j > i ){
			var tmp = an[ i ];
			an[ i ] = an[ j ];
			an[ j ] = tmp;
			var tmp = bn[ i ];
			bn[ i ] = bn[ j ];
			bn[ j ] = tmp;  
		}
	}
	for( var i = 0; i < N ; i++ ){
		an[ i ] = an[ i ] / Math.sqrt(N);
		bn[ i ] = bn[ i ] / Math.sqrt(N);
	}
}

function blackman(rd)
{
	var size = rd.length;
	var rx = Math.PI/size;
	var window=0;
	for(var i=0; i<size; i++){
		window = 0.42-0.5*Math.cos(2*i*rx)+0.08*Math.cos(4*i*rx);
		rd[i]*=window;
	}
}
