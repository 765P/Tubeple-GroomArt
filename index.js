javascript: (function () {

    if ($("#dropbox").length > 0) {
        $("#dropbox").remove();
        console.log('remove already loaded')
    };

    $("body").append(`
        <div id='dropbox' style='
        position: absolute;
        left: calc(50% - 150px);
        bottom: 100px;
        width: 300px;
        height: 150px;
        z-index: 9999999;
        background-color: #20639B;
        border-radius: 25px;
        padding: 15px;
        opacity: 0.9;
        color: white;
        text-align: center;
        align-items: center;
        line-height: 105px;
        '>Drop it<canvas id='asciiCanvas' style='visibility: hidden'></canvas></div>`);
    console.log('init');

    const toGrayScale = (r, g, b) => 0.21 * r + 0.72 * g + 0.07 * b;

    const convertToGrayScales = (context, width, height) => {
        const imageData = context.getImageData(0, 0, width, height);

        const grayScales = [];

        for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];

            const grayScale = toGrayScale(r, g, b);
            imageData.data[i] = imageData.data[i + 1] = imageData.data[
            i + 2
            ] = grayScale;

            grayScales.push(grayScale);
        }

        context.putImageData(imageData, 0, 0);

        return grayScales;
    };

    const MAXIMUM_WIDTH = 100;
    const MAXIMUM_HEIGHT = 100;

    const clampDimensions = (width, height) => {
        if (height > width) {
            const reducedWidth = Math.floor((width * MAXIMUM_HEIGHT) / height);
            return [reducedWidth, MAXIMUM_HEIGHT];
        }

        if (width >= height) {
            const reducedHeight = Math.floor((height * MAXIMUM_WIDTH) / width);
            return [MAXIMUM_WIDTH, reducedHeight];
        }

        return [width, height];
    };

    const grayRamp = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/|()1{}[]?-_+~<>i!lI;:,"^`\'. ';
    const rampLength = grayRamp.length;

    const getCharacterForGrayScale = grayScale => grayRamp[Math.ceil((rampLength - 1) * grayScale / 255)];

    const drawAscii = (grayScales, width) => {
        const ascii = grayScales.reduce((asciiImage, grayScale, index) => {
            let nextChars = getCharacterForGrayScale(grayScale);
            if ((index + 1) % width === 0) {
                nextChars += '\n';
            }

            return asciiImage + nextChars;
        }, '');

        console.log('ascii\n', ascii);
        return ascii;
    };

    const reqCloud = (data) => new Promise((resolve, reject) => {
        $.ajax({  
            type: "POST" 
           ,url: "/aj/cloud_comments"
           ,data: data
           ,success:function(res){
               resolve(res);
           }
           ,error:function(err){
               reject(err);
           }
        });
    });

    const delay = (duration) => new Promise((resolve, reject) => {
        setTimeout(function(){
            resolve();
        }, duration);
    });

    const makeCloud = (videoID, videoTime, hash, asciiArt) => {
        console.log(`${videoID} / ${videoTime} / ${hash}`);

        const asciiRows = asciiArt.split('\n');
        console.log(asciiRows);
        asciiRows.forEach(async (asciiCols, row, array) => {
            for(var i = 0; i < asciiCols.length; i ++) {
                try {
                    const result = await reqCloud({
                            video_id: videoID,
                            text: asciiCols.charAt(i),
                            location_x: i,
                            location_y: row,
                            currentTime: videoTime,
                            hash: hash
                        });
                    console.log(`${row}, ${i} : ${JSON.stringify(result)}`);
                    await delay(1000);
                }
                catch (e) {
                    console.error(`${row}, ${i} : ${JSON.stringify(e)}`);
                }
            }
        })
    };
    
    $("#dropbox").on("dragover", (ev) => {
        ev.preventDefault();
        console.log('dragover-event', ev);
    });

    $("#dropbox").on("drop", (ev) => {
        ev.preventDefault();
        const canvas = document.getElementById("asciiCanvas");
        const context = canvas.getContext("2d");

        console.log('drop-event', ev);
        if (ev.originalEvent.dataTransfer.files && ev.originalEvent.dataTransfer.files.length > 0) {
            const file = ev.originalEvent.dataTransfer.files[0];
            console.log('file', file);

            const reader = new FileReader();
            reader.onload = event => {
                const image = new Image();
                image.onload = () => {

                    const [width, height] = clampDimensions(image.width, image.height);
                    canvas.width = width;
                    canvas.height = height;
                    console.log('current img: ', width, height);

                    context.drawImage(image, 0, 0, width, height);
                    console.log('image drawed');
                    const grayScales = convertToGrayScales(context, width, height);
                    console.log('grayscales', grayScales);

                    const ascii = drawAscii(grayScales, width);
                    canvas.width = 0;
                    canvas.height = 0;

                    makeCloud($('#video-id').val(), 
                        document.querySelector("#my-video_from_mejs").player.currentTime, 
                        $('.main_session').val(),
                        ascii);
                };
                image.src = event.target.result;
            };
            reader.readAsDataURL(file);
          }
    });
 }());



/*

            for(var i = 0; i < asciiCols.length; i ++) {
                try {
                    const result = await reqCloud({
                            video_id: videoID,
                            text: asciiCols.charAt(i),
                            location_x: i,
                            location_y: row,
                            currentTime: videoTime,
                            hash: hash
                        });
                    console.log(`${row}, ${i} : ${result}`);
                }
                catch (e) {
                    console.error(`${row}, ${i} : ${e}`);
                }



            try {
                const result = await reqCloud({
                        video_id: videoID,
                        text: asciiCols,
                        location_x: 0,
                        location_y: row,
                        currentTime: videoTime,
                        hash: hash
                    });
                console.log(`0, ${row} : ${JSON.stringify(result)}`);
            }
            catch (e) {
                console.error(`0, ${row} : ${JSON.stringify(e)}`);
            }
            }*/