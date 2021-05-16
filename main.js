//Gets document and canvas from HTML
c = document.getElementById("canvas");
ctx = c.getContext("2d");

function run() {
    c.width = document.getElementById("side_length").value
    c.height = document.getElementById("side_length").value
    type_of_fractal = document.getElementById("type_of_fractal").value
    max_iterations = document.getElementById("max_iterations").value
    max_colors = document.getElementById("max_colors").value
    color_type = document.getElementById("color_type").value
    julia_c_re = document.getElementById("julia_c_re").value
    julia_c_im = document.getElementById("julia_c_im").value
    julia_c = math.complex(julia_c_re, julia_c_im)

    //Creates ImageData, id, to manipulate individual pixels
    id=ctx.createImageData(c.width,c.height);
    d = id.data

    //Gets event handlers from canvas and document
    c.onmousemove = mousemove
    c.onmousedown = mousedown
    document.onmouseup = mouseup

    button = document.getElementById("button")

    //Finds canvas' offset from (0, 0) on website
    canvas_boundary = c.getBoundingClientRect()

    //Disables right click menu in canvas
    canvas.addEventListener('contextmenu', event => event.preventDefault());

    down_coords = {
        x: 0,
        y: 0
    }
    boundary = {
        x: {
            start: -2,
            finish: 2
        },
        y: {
            start: 2,
            finish: -2
        }
    }
    old_boundary = boundary

    //Creates empty array of width*height length
    complex_pairs = []
    for (let i = 0; i < c.width*c.height; i++) {
        complex_pairs.push([0,0])
    }

    //Converts an xy-coordinate to a complex number
    function coord_to_complex_number(number, type) { //this??
        if(type == "x") {
            return number/canvas.width*old_boundary.x.finish+(canvas.width-number)/canvas.width*old_boundary.x.start
        }
        if(type == "y") {
            return (number/canvas.width*old_boundary.y.finish+(canvas.width-number)/canvas.width*old_boundary.y.start)
        }
    }

    //Converts pixel coordinates to complex pairs
    function pixels_to_complex_numbers () {
        for (let i = 0; i < c.width*c.height; i++) {
            let x = i % c.width
            let y = Math.floor(i / c.width)
            complex_pairs[i][0] = coord_to_complex_number(x, "x")
            complex_pairs[i][1] = coord_to_complex_number(y, "y")
        }
    }
    pixels_to_complex_numbers()

    //Calculates whether or not all values from complex_pairs belong to the mandelbrot set
    function iterate_mandelbrot(a,b) {
        let n = 0
        let c = math.complex(a,b)
        let z = [math.complex(0,0)]
        //mens c's længde forbliver under 2. 2 er ikke præcist, men grunden til at man kan skrive 2, er fordi intet mandelbrottal har en længde på mere end 2 pga. et matematisk bevis.
        while (n < max_iterations && math.add(Math.abs(math.re(z[z.length-1])), Math.abs(math.im(z[z.length-1]))) <= 2) {
            z.push(math.add(math.multiply(z[z.length-1],z[z.length-1]),c))
            n += 1
        }
        return n
    }

    //Calculates whether or not all values from complex_pairs belong to a julia set
    function iterate_julia(a,b) {
        let n = 0
        let c = julia_c
        let z = [math.complex(a,b)]
        while (n < max_iterations && math.add(Math.abs(math.re(z[z.length-1])),
                Math.abs(math.im(z[z.length-1]))) <= 2000) {
            z.push(math.add(math.multiply(z[z.length-1],z[z.length-1]),c))
            n += 1
        }
        return n
    }

    //The color range is defined
    function generate_colors (amount_of_colors, type = "blue") {
        let color = []
        if (type == "random") {
            for (let i = 0; i < amount_of_colors; i++) {
                color.push([Math.floor(Math.random()*255), Math.floor(Math.random()*255), Math.floor(Math.random()*255)])
            }
            return color
        }
        if (type == "blue") {
            for (let i = amount_of_colors - 1; i > 0; i--) {
                let hue = i * 255/(max_colors - 1)
                color.push([hue,hue,120])
            }
            color.reverse()
            color.push([0,0,0])
            return color
        }
    }
    color = []
    color = generate_colors(max_colors, color_type)


    function generate_fractal () {
        for (i = 0; i < d.length; i += 4) {
            d[i+0] = 0;
            d[i+1] = 0;
            d[i+2] = 120;
            d[i+3] = 255;
        }
        for (let i = 0; i < d.length; i += 4) {
            x = ((i / 4) % c.width)
            y = (Math.floor((i / 4) / c.width))
            if(type_of_fractal == "Mandelbrot") {
                for (let j = max_iterations - max_colors; j < max_iterations; j++) {
                    // == j + 1 fordi z skal itereres mindst én gang for at bedømmes converging eller ikke
                    if(iterate_mandelbrot(complex_pairs[Math.floor(i/4)][0],complex_pairs[Math.floor(i/4)][1]) == j + 1) {
                        d[i] = color[Math.floor(j-(max_iterations - max_colors))][0]
                        d[i+1] = color[Math.floor(j-(max_iterations - max_colors))][1]
                        d[i+2] = color[Math.floor(j-(max_iterations - max_colors))][2]
                        d[i+3] = 255
                    }
                }
            }
            if(type_of_fractal == "Julia") {
                for (let j = max_iterations - max_colors; j < max_iterations; j++) {
                    // == j + 1 fordi z skal itereres mindst én gang for at bedømmes converging eller ikke
                    if(iterate_julia(complex_pairs[Math.floor(i/4)][0],complex_pairs[Math.floor(i/4)][1]) == j + 1) {
                        d[i] = color[Math.floor(j-(max_iterations - max_colors))][0]
                        d[i+1] = color[Math.floor(j-(max_iterations - max_colors))][1]
                        d[i+2] = color[Math.floor(j-(max_iterations - max_colors))][2]
                        d[i+3] = 255
                    }
                }
            }
        }
    }
    generate_fractal()

    //Event handlers:
    mouse_down = false
    function mousemove(event) {
        if((event.x - down_coords.x) > (event.y - down_coords.y)) {
            box_size = event.x - down_coords.x
        }
        else {
            box_size = event.y - down_coords.y
        }
        update()
        ctx.fillStyle = "white"
        ctx.font = "10px Arial";
        ctx.fillText(coord_to_complex_number(event.x - canvas_boundary.left, "x").toFixed(4) + ", " + coord_to_complex_number(event.y - canvas_boundary.top, "y").toFixed(4) + "i", event.x, event.y - 10);
        if(mouse_down) {
            ctx.beginPath();
            ctx.strokeStyle = "white"
            ctx.rect(down_coords.x - canvas_boundary.left, down_coords.y - canvas_boundary.top, box_size, box_size);
            ctx.stroke();
        }
    }

    function mousedown(event) {
        mouse_down = true
        down_coords.x = event.x
        down_coords.y = event.y
    }

    function mouseup(event) {
        let x1 = 0
        let x2 = 0
        let y1 = 0
        let y2 = 0
        if(mouse_down) {
            if(event.x > down_coords.x) {
                x1 = down_coords.x - canvas_boundary.left
                x2 = x1 + box_size
            }
            else {
                x2 = down_coords.x - canvas_boundary.left
                x1 = x2 + box_size
            }
            if(event.y > down_coords.y) {
                y1 = down_coords.y - canvas_boundary.top
                y2 = y1 + box_size
            }
            else {
                y2 = down_coords.y - canvas_boundary.top
                y1 = y2 + box_size
            }
            boundary.x.start = complex_pairs[x1][0]
            boundary.x.finish = complex_pairs[x2][0]
            boundary.y.start = complex_pairs[canvas.width*y1 + x1][1]
            boundary.y.finish = complex_pairs[canvas.width*y2 + x2][1]
            old_boundary = boundary
            pixels_to_complex_numbers()
            generate_fractal()
            update()
        }
        mouse_down = false
    }

    //The update function updates the visuals of the canvas
    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "blue"
        ctx.beginPath()
        ctx.rect(0, 0, c.width, c.height)
        ctx.fill()
        ctx.putImageData(id, 0, 0)
        if(type_of_fractal == "Julia") {
            ctx.font = '20px Courier New'
            ctx.fillStyle = "white"
            ctx.fillText(math.re(julia_c).toFixed(4) + ", " + math.im(julia_c).toFixed(4) + "i", canvas.width / 50, canvas.height / 50 + 15)
        }
    }
    update()
}