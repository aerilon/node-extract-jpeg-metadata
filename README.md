# node-exif

With _node-extract-metadata_ you can extract metadata segment from JPEG files.

## Table of Contents

 * [Installation](#installation)
 * [Usage](#usage)
 * [ToDo / Ideas](#todo--ideas)
 * [License](#license)

## Installation

Installing using npm (node package manager):

    npm install extract-jpeg-metadata
    
If you don't have npm installed or don't want to use it:

    cd ~/.node_libraries
    git clone git://github.com/aerilon/node-extract-jpeg-metadata.git extract-jpeg-metadata

## Usage

Easy. Just require _node-extract-jpeg-metadata_ and throw a JPEG image at it. _node-extract-jpeg-metadata_ extracts SOI, APP1 and COM segments and either returns an object with the segments found. If an error occurs you will receive an error message.

```javascript
var ExtractJPEGMetadata = require('extract-jpeg-metadata').ExtractJPEGMetadata;

try {
    new ExtractJPEGMetadata(input, function (error, buf) {
        if (error)
            console.log(error.stack);

        // Do something with 'buf'
	});
} catch (error) {
    console.log(error.stack);
}

```

Instead of providing a filename of an image in your filesystem you can also directly pass a Buffer.

For more information about the Exif standard please refer to the specification found on [http://www.exif.org](http://www.exif.org). A comprehensive list of available Exif attributes and their meaning can be found on [http://www.sno.phy.queensu.ca/~phil/exiftool/TagNames/](http://www.sno.phy.queensu.ca/~phil/exiftool/TagNames/).

## ToDo / Ideas

There are a lot of things still to be done and to be made better. If you have any special requests please open an issue with a feature request.
   
## License

_node-extract-jpeg-metadata_ is licensed under the ISC License. (See LICENSE.md) 
