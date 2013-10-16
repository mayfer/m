function SoundGenerator() {
    if(window.AudioContext) {
        this.AudioContext = new AudioContext();
    }
    if(this.AudioContext==null) {
        if( window.webkitAudioContext) {
            this.AudioContext = new webkitAudioContext();
        }
    }
    if(this.AudioContext==null) {
        message = "This demo requires a WebAudio-enabled browser.";
        alert(message);
    }
    this.mSampleRate = 44100;
    this.mNumNotes = 88 + 12*2;
    this.mSamples = new Array(this.mNumNotes);
    this.mSLen = 1*this.mSampleRate;
    this.mBuffer = null;
    this.mOctave = 1;
    this.mVolume = 100;

    this.mBuffer = new Array( 8 );
    this.mActiveNote = new Array( 8 );
    for( j=0; j<8; j++ )
    {
        //this.mBuffer[j] = this.mAudioContext.createBuffer( 1, this.mSLen, 44100 );
        this.mBuffer[j] = this.AudioContext.createBuffer( 1, this.mSLen, this.mSampleRate );
        this.mActiveNote[j] = { mNote:666, mTo:0.0 };
    }

    for( j=0; j<this.mNumNotes; j++ )
    {
        this.mSamples[j] = new Float32Array(this.mSLen);
    }

    this.mId = 0;

    var me = this;
}

SoundGenerator.prototype.playNote = function( note )
{
    var id = this.mId;

    note += this.mOctave*12;

    this.mId = (this.mId+1) % 8;

    // copy data
    var dbuf = this.mBuffer[id].getChannelData(0);
    var num = this.mSLen;
    var sbuf = this.mSamples[note];
    for( i=0; i<num; i++ )
    {
        dbuf[i] = sbuf[i];
    }

    var node = this.AudioContext.createBufferSource();
    node.buffer = this.mBuffer[id];
    node.gain.value = 0.5 * this.mVolume/100.0;
    node.connect(this.AudioContext.destination);
    node.noteOn(0);

    this.mActiveNote[id].mNote = note;
    this.mActiveNote[id].mTo = new Date().getTime();
}

SoundGenerator.prototype.playChord = function( notes ) {
    function noteFunction(i) {
      return function() {
          sound.playNote(i);
      };
    }

    for(var noteIndex = 0; noteIndex < notes.length; noteIndex++) {
      setTimeout(noteFunction(notes[noteIndex]), noteIndex*50)
    }
}
SoundGenerator.prototype.playChordProgression = function( chords ) {
    function noteFunction(i) {
      return function() {
          sound.playChord(i);
      };
    }

    for(var chordIndex = 0; chordIndex < chords.length; chordIndex++) {
      setTimeout(noteFunction(chords[chordIndex]), chordIndex*1000);
    }
}

function fmod(x,y)
{
    return x%y;
}

function sign(x)
{
    if( x>0.0 ) x=1.0; else x=-1.0;
    return x;
}
function smoothstep(a,b,x)
{
    if( x<a ) return 0.0;
    if( x>b ) return 1.0;
    var y = (x-a)/(b-a);
    return y*y*(3.0-2.0*y);
}
function clamp(x,a,b)
{
    if( x<a ) return a;
    if( x>b ) return b;
    return x;
}
function step(a,x)
{
    if( x<a ) return 0.0;
    else      return 1.0;
}
function mix(a,b,x)
{
    return a + (b-a)*Math.min(Math.max(x,0.0),1.0);
}
function over(x,y)
{
    return 1.0 - (1.0-x)*(1.0-y);
}
function tri(a,x)
{
    x = x / (2.0*Math.PI);
    x = x % 1.0;
    if( x<0.0 ) x = 1.0+x;
    if(x<a) x=x/a; else x=1.0-(x-a)/(1.0-a);
    return -1.0+2.0*x;
}

function saw(x,a)
{
    var f = x % 1.0;

    if( f<a )
        f = f/a;
    else
        f = 1.0 - (f-a)/(1.0-a);
    return f;
}

function sqr(a,x)
{
    if( Math.sin(x)>a ) x=1.0; else x=-1.0;
    return x;
}
function grad(n, x)
{
    n = (n << 13) ^ n;
    n = (n * (n * n * 15731 + 789221) + 1376312589);
    var res = x;
    if( n & 0x20000000 ) res = -x;
    return res;
}

function noise(x)
{
    var i = Math.floor(x);
    var f = x - i;
    var w = f*f*f*(f*(f*6.0-15.0)+10.0);
    var a = grad( i+0, f+0.0 );
    var b = grad( i+1, f-1.0 );
    return a + (b-a)*w;
}

function cellnoise(x)
{
    var n = Math.floor(x);
    n = (n << 13) ^ n;
    n = (n * (n * n * 15731 + 789221) + 1376312589);
    n = (n>>14) & 65535;
    return n/65535.0;
}
function frac(x)
{
//    return x - Math.floor(x);
    return x % 1.0;
}

SoundGenerator.prototype.instruments = {
    'Piano': "y  = 0.6*sin(1.0*w*t)*exp(-0.0008*w*t);\n\
        y += 0.3*sin(2.0*w*t)*exp(-0.0010*w*t);\n\
        y += 0.1*sin(4.0*w*t)*exp(-0.0015*w*t);\n\
        y += 0.2*y*y*y;\n\
        y *= 0.9 + 0.1*cos(70.0*t);\n\
        y = 2.0*y*exp(-22.0*t) + y;",
    'Guitar': "f = cos(0.251*w*t);\n\
        y  = 0.5*cos(1.0*w*t+3.14*f)*exp(-0.0007*w*t);\n\
        y += 0.2*cos(2.0*w*t+3.14*f)*exp(-0.0009*w*t);\n\
        y += 0.2*cos(4.0*w*t+3.14*f)*exp(-0.0016*w*t);\n\
        y += 0.1*cos(8.0*w*t+3.14*f)*exp(-0.0020*w*t);\n\
        y *= 0.9 + 0.1*cos(70.0*t);\n\
        y = 2.0*y*exp(-22.0*t) + y;",
    'Organ': "y  = .6*cos(w*t)*exp(-4*t);\n\
        y += .4*cos(2*w*t)*exp(-3*t);\n\
        y += .01*cos(4*w*t)*exp(-1*t);\n\
        y = y*y*y + y*y*y*y*y + y*y;\n\
        a = .5+.5*cos(8*t); y = sin(y*a*3.14);\n\
        y *= 30*t*exp(-.1*t);",
    'Space Piano': "tt= 1-t;\n\
        a= sin(t*w*.5)*log(t+0.3)*tt;\n\
        b= sin(t*w)*t*.4;\n\
        c= fmod(tt,.075)*cos(pow(tt,3)*w)*t*2;\n\
        y= (a+b+c)*tt;",
    'Flute': "y  = 6.0*t*exp( -2*t )*sin( w*t );\n\
        y *= .8+.2*cos(16*t);",
    'Bell': "y  = 0.100*exp( -t/1.000 )*sin( 0.56*w*t );\n\
        y += 0.067*exp( -t/0.900 )*sin( 0.56*w*t );\n\
        y += 0.100*exp( -t/0.650 )*sin( 0.92*w*t );\n\
        y += 0.180*exp( -t/0.550 )*sin( 0.92*w*t );\n\
        y += 0.267*exp( -t/0.325 )*sin( 1.19*w*t );\n\
        y += 0.167*exp( -t/0.350 )*sin( 1.70*w*t );\n\
        y += 0.146*exp( -t/0.250 )*sin( 2.00*w*t );\n\
        y += 0.133*exp( -t/0.200 )*sin( 2.74*w*t );\n\
        y += 0.133*exp( -t/0.150 )*sin( 3.00*w*t );\n\
        y += 0.100*exp( -t/0.100 )*sin( 3.76*w*t );\n\
        y += 0.133*exp( -t/0.075 )*sin( 4.07*w*t );"
}

SoundGenerator.prototype.loadSound = function(formula)
{
    $('#progress').show();
    $('#status').html('Loading sound...');

    if (!formula) {
        formula = this.instruments['Piano'];
    }

    var message = "Compiled correctly";
    try
    {

      var f2 = new String(formula);
      f2 = f2.replace( /sin/gi, "Math.sin" );
      f2 = f2.replace( /cos/gi, "Math.cos" );
      f2 = f2.replace( /tan/gi, "Math.tan" );
      f2 = f2.replace( /asin/gi, "Math.asin" );
      f2 = f2.replace( /acos/gi, "Math.acos" );
      f2 = f2.replace( /exp/gi, "Math.exp" );
      f2 = f2.replace( /pow/gi, "Math.pow" );
      f2 = f2.replace( /sqrt/gi, "Math.sqrt" );
      f2 = f2.replace( /log/gi, "Math.log" );
      f2 = f2.replace( /abs/gi, "Math.abs" );
      f2 = f2.replace( /min/gi, "Math.min" );
      f2 = f2.replace( /max/gi, "Math.max" );
      f2 = f2.replace( /round/gi, "Math.round" );
      f2 = f2.replace( /floor/gi, "Math.floor" );
      f2 = f2.replace( /ceil/gi, "Math.ceil" );
      f2 = f2.replace( /random/gi, "Math.random" );

      var func = new Function( "w", "num", "buf", "var isr = 1.0/44100.0; for( i=0; i<num; i++ ) { var t = i*isr; var y=0.0; " + f2 + "; buf[i] = y; }" );



      var me = 0;
      var sid = 0;
      function calcSample()
      {
          if( sid >= me.mNumNotes ) return;

          var progress = Math.floor(100.0*sid/(me.mNumNotes-1));
          $('#progress').attr('value', progress);
          if(progress == 100) {
              $('#status').html("ready");
              $('#progress').hide();
          }
          // var f = 440.0*Math.pow( 2.0, (sid-9-12)/12.0 );
          var f = 27.5*Math.pow( 2.0, sid/12.0 );
          var w = 2.0*Math.PI*f;
          func(w, me.mSLen, me.mSamples[sid]);

          sid = sid + 1;

          setTimeout( calcSample, 2 );
      }
      me = this;
      sid = 0;
      calcSample();

      // this.drawGraph();
    }
    catch( e )
    {
      message = e;
    }

    this.mForceFrame = true;
}

SoundGenerator.prototype.setOctave = function(o)
{
    this.mOctave = o;
}

SoundGenerator.prototype.setVolume = function()
{
    var v = document.getElementById("myVolume").value;
    if( v<  0 ) { v=  0; document.getElementById("myVolume").value =   0; }
    if( v>100 ) { v=100; document.getElementById("myVolume").value = 100; }
    this.mVolume = v;
}

