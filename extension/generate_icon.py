import zlib
import struct

def make_png(width, height):
    # PNG Header
    header = b'\x89PNG\r\n\x1a\n'
    
    # IHDR Chunk
    ihdr_data = struct.pack('!IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff
    ihdr = struct.pack('!I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('!I', ihdr_crc)
    
    # IDAT Chunk (RGB data, all black)
    # Each scanline is (1 byte filter type + width * 3 bytes RGB)
    line_size = 1 + width * 3
    raw_data = b'\x00' + b'\x00\xff\x00' * width # Green color
    compressed_data = zlib.compress(raw_data * height)
    
    idat_crc = zlib.crc32(b'IDAT' + compressed_data) & 0xffffffff
    idat = struct.pack('!I', len(compressed_data)) + b'IDAT' + compressed_data + struct.pack('!I', idat_crc)
    
    # IEND Chunk
    iend_data = b''
    iend_crc = zlib.crc32(b'IEND' + iend_data) & 0xffffffff
    iend = struct.pack('!I', len(iend_data)) + b'IEND' + iend_data + struct.pack('!I', iend_crc)
    
    return header + ihdr + idat + iend

with open('assets/icon.png', 'wb') as f:
    f.write(make_png(512, 512))
    
print("Icon generated successfully")
