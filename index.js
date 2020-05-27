javascript: (function () {

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
        '>Drop it</div>`);
    
    $("#dropbox").on("dragover", (ev) => {
        ev.preventDefault();
        console.log('dragover-event', ev);
    });

    $("#dropbox").on("drop", (ev) => {
        ev.preventDefault();
        console.log('drop-event', ev);
        if (ev.originalEvent.dataTransfer.files && ev.originalEvent.dataTransfer.files.length > 0) {
            const file = ev.originalEvent.dataTransfer.files[0];
            console.log('file', file);

            const reader = new FileReader();
            reader.onload = event => {
                const image = new Image();
                image.onload = () => {
                    console.log('current img: ', image.width, image.height);
                };
                image.src = event.target.result;
            };
            reader.readAsDataURL(file);
          }
    });
 }());



