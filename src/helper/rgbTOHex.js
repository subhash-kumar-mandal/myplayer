
function rgbToHex(rgb) {
    return (
        "#" +
        rgb
            .map(v => Math.round(v).toString(16).padStart(2, "0"))
            .join("")
    );
}


module.exports= rgbToHex;