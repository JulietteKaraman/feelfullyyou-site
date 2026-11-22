# Designed reader copy

Build: from this folder run `python3 -I build.py`. It reads the chapter files in `book/` (it drops review notes, draft lines and design notes), sets them in Cormorant Garamond and Poppins on 6x9in pages, and writes `book/reader-copy/Where-Did-the-Touch-Go-designed.pdf`.

- `build.py`: the chapter list, epigraphs, pull quotes, photo bands and practice boxes.
- `book.css`: page layout (colours Black #070707, Off-white #fefcfa, Deep Green #0D3535, Ochre #A88538).
- `img/`: duotone photos made from the site's own images. `fonts/`: Cormorant Garamond and Poppins (Google Fonts, open licence). Install the fonts (`cp fonts/*.ttf ~/.fonts && fc-cache -f`) before building.
- Needs: `pip install weasyprint`, `pandoc`.
