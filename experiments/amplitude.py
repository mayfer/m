import math
import struct
import wave
import sys

w = wave.open(sys.argv[1], 'rb')
# We assume 44.1k @ 16-bit, can test with getframerate() and getsampwidth().
sum = 0
value = 0;
delta = 0;
amps = [ ]

for i in xrange(0, w.getnframes()):
	# Assume stereo, mix the channels.
	data = struct.unpack('<hh', w.readframes(1))
	sum += (data[0]*data[0] + data[1]*data[1]) / 2
	# 44100 / 30 = 1470
	if (i != 0 and (i % 1470) == 0):
		value = int(math.sqrt(sum / 1470.0) / 10)
		amps.append(value - delta)
		delta = value
		sum = 0

print amps
