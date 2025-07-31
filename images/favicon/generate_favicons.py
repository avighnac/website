from PIL import Image
import cairosvg

svg_filename = "favicon.svg"
sizes = [16, 32, 48, 64, 128]

png_files = []
for size in sizes:
    png_name = f"favicon_{size}x{size}.png"
    cairosvg.svg2png(url=svg_filename, write_to=png_name, output_width=size, output_height=size)
    png_files.append(png_name)
    print(f"Generated {png_name}")
    
ico_name = "favicon.ico"
images = [Image.open(png) for png in png_files]
images[0].save(ico_name, format='ICO', sizes=[(s, s) for s in sizes])
print(f"Generated {ico_name}")
