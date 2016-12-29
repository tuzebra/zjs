;(function(zjs){
	
	var TiffTags = {
        0x0112 : "Orientation"
    },

    findEXIFinJPEG = function(file){
        var dataView = new DataView(file);

        if((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8))
            return false; // not a valid jpeg

        var offset = 2,
            length = file.byteLength,
            marker;

        while(offset < length) {
            if(dataView.getUint8(offset) != 0xFF)
                return false; // not a valid marker, something is wrong

            marker = dataView.getUint8(offset + 1);

            // we could implement handling for other markers here,
            // but we're only looking for 0xFFE1 for EXIF data

            if(marker == 225)
                return readEXIFData(dataView, offset + 4, dataView.getUint16(offset + 2) - 2);
                // offset += 2 + file.getShortAt(offset+2, true);
            else  
                offset += 2 + dataView.getUint16(offset+2);

        }

    },

    readTags = function(file, tiffStart, dirStart, strings, bigEnd) {
        var entries = file.getUint16(dirStart, !bigEnd),
            tags = {},
            entryOffset, tag,
            i;

        for (i=0;i<entries;i++) {
            entryOffset = dirStart + i*12 + 2;
            tag = strings[file.getUint16(entryOffset, !bigEnd)];
            if(tag)
                tags[tag] = readTagValue(file, entryOffset, tiffStart, dirStart, bigEnd);
        }
        return tags;
    },


    readTagValue = function(file, entryOffset, tiffStart, dirStart, bigEnd) {
        var type = file.getUint16(entryOffset+2, !bigEnd),
            numValues = file.getUint32(entryOffset+4, !bigEnd),
            valueOffset = file.getUint32(entryOffset+8, !bigEnd) + tiffStart,
            offset,
            vals, val, n,
            numerator, denominator;

        switch (type) {
            case 1: // byte, 8-bit unsigned int
            case 7: // undefined, 8-bit byte, value depending on field
                if (numValues == 1) {
                    return file.getUint8(entryOffset + 8, !bigEnd);
                }else{
                    offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getUint8(offset + n);
                    }
                    return vals;
                }

            case 2: // ascii, 8-bit byte
                offset = numValues > 4 ? valueOffset : (entryOffset + 8);
                return getStringFromDB(file, offset, numValues-1);

            case 3: // short, 16 bit int
                if (numValues == 1) {
                    return file.getUint16(entryOffset + 8, !bigEnd);
                } else {
                    offset = numValues > 2 ? valueOffset : (entryOffset + 8);
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getUint16(offset + 2*n, !bigEnd);
                    }
                    return vals;
                }

            case 4: // long, 32 bit int
                if (numValues == 1) {
                    return file.getUint32(entryOffset + 8, !bigEnd);
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getUint32(valueOffset + 4*n, !bigEnd);
                    }
                    return vals;
                }

            case 5:    // rational = two long values, first is numerator, second is denominator
                if (numValues == 1) {
                    numerator = file.getUint32(valueOffset, !bigEnd);
                    denominator = file.getUint32(valueOffset+4, !bigEnd);
                    val = new Number(numerator / denominator);
                    val.numerator = numerator;
                    val.denominator = denominator;
                    return val;
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        numerator = file.getUint32(valueOffset + 8*n, !bigEnd);
                        denominator = file.getUint32(valueOffset+4 + 8*n, !bigEnd);
                        vals[n] = new Number(numerator / denominator);
                        vals[n].numerator = numerator;
                        vals[n].denominator = denominator;
                    }
                    return vals;
                }

            case 9: // slong, 32 bit signed int
                if (numValues == 1) {
                    return file.getInt32(entryOffset + 8, !bigEnd);
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getInt32(valueOffset + 4*n, !bigEnd);
                    }
                    return vals;
                }

            case 10: // signed rational, two slongs, first is numerator, second is denominator
                if (numValues == 1) {
                    return file.getInt32(valueOffset, !bigEnd) / file.getInt32(valueOffset+4, !bigEnd);
                } else {
                    vals = [];
                    for (n=0;n<numValues;n++) {
                        vals[n] = file.getInt32(valueOffset + 8*n, !bigEnd) / file.getInt32(valueOffset+4 + 8*n, !bigEnd);
                    }
                    return vals;
                }
        }
    },

    getStringFromDB = function(buffer, start, length) {
        var outstr = "";
        for(n = start; n < start+length; n++)
            outstr += String.fromCharCode(buffer.getUint8(n));
        return outstr;
    },

    readEXIFData = function(file, start) {
        if(getStringFromDB(file, start, 4) != "Exif")
            return false; // Not valid EXIF data! 

        var bigEnd,
            tiffOffset = start + 6;

        // test for TIFF validity and endianness
        if(file.getUint16(tiffOffset) == 0x4949)
            bigEnd = false;
        else if(file.getUint16(tiffOffset) == 0x4D4D)
            bigEnd = true;
        else 
            return false; // Not valid TIFF data! (no 0x4949 or 0x4D4D)

        if(file.getUint16(tiffOffset+2, !bigEnd) != 0x002A)
            return false; // Not valid TIFF data! (no 0x002A)

        var firstIFDOffset = file.getUint32(tiffOffset+4, !bigEnd);

        if(firstIFDOffset < 0x00000008)
            return false; // Not valid TIFF data! (First offset less than 8)

        var dirStart = tiffOffset + firstIFDOffset,
        	entries = file.getUint16(dirStart, !bigEnd),
            tags = {},
            entryOffset, tag,
            i;

        for (i=0;i<entries;i++) {
            entryOffset = dirStart + i*12 + 2;
            tag = TiffTags[file.getUint16(entryOffset, !bigEnd)];
            if(tag)
                tags[tag] = readTagValue(file, entryOffset, tiffOffset, dirStart, bigEnd);
        }
        return tags;
    };

	// Extend to zjs core
	zjs.extendCore({
		readEXIFFromBase64: function(base64){
	        base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
	        var binary = atob(base64);
	        var len = binary.length;
	        var buffer = new ArrayBuffer(len);
	        var view = new Uint8Array(buffer);
	        for (var i = 0; i < len; i++)
	            view[i] = binary.charCodeAt(i);
	        var data = findEXIFinJPEG(buffer);
	        var exifdata = data || {};
	        return exifdata;
	    }
	});

	// register module name
	zjs.required('exif');
	
})(zjs);