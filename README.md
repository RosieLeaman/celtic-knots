# celtic-knots
Draws celtic knots in the browser (using d3.js)

Draws simple celtic knots (such as can be seen on the wikipedia page https://en.wikipedia.org/wiki/Celtic_knot ) 
using an underlying grid to create the woven effect. Try it here https://rosieleaman.github.io/celtic-knots/page.html .

Not all grid sizes produce a single unbroken knot, some require multiple knots to fill all the available space (for example
try a 6x6 grid). When multiple knots are required each knot is coloured a different colour (cycling blue-red-black). 
The original purpose of this drawing system was to investigate which sizes produced a single unbroken knot.

You can specify the number of squares in the underlying grid, which controls how many times the knot will weave under and over itself and 
the size of the grid squares, which controls how large the knot appears. 

After altering either of these values you must press the "Make knot!" button to re-calculate the new knot.

Additionally, if you press the "Show underlying grid" button the grid used will be displayed. This then reveals an "Edit grid" button.

Pressing the "Edit grid" button puts the grid into edit mode. Clicking on any grid square in this mode will "delete" that grid square,
preventing the knot from entering the square. The knot will automatically re-calculate itself to avoid this square. Press "Stop editing"
to leave this mode.

Pressing "Make knot!" will remove any edits made in edit mode, all squares will be included again.


