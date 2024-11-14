const TFEBlock = (num = Variable(0)) => Widget.Box({
    child: Widget.Label({
        label: num.bind().as(n => n == 0 ? "" : n.toString()),
        hexpand: true,
        justification: "center"
    }),
    className: num.bind().as(n => {
        let color = "";
        if (n >= 4096) {
            color = "tfe-massive";
        } else if (n >= 128) {
            color = "tfe-big";
        } else if (n >= 8) {
            color = "tfe-medium";
        } else if (n >= 2) {
            color = "tfe-low";
        }

        return "tfe-block " + color;
    }),
    attribute: { num }
});

function addRandomBlock(numbers) {
    let num;
    let foundEmpty = false;
    let maxNumTries = 50;
    let i = 0;

    do {
        // exit out of func if no open slots can be found
        if (i >= maxNumTries) {
            return;
        }

        // pick a random number in the 4x4 grid
        let x = Math.floor(Math.random() * 4);
        let y = Math.floor(Math.random() * 4);
        num = numbers[y * 4 + x];
        foundEmpty = num.value == 0;

        i++;

    } while (!foundEmpty);


    let valueRand = Math.random();
    let value = valueRand <= 0.1 ? 4 : 2;

    num.value = value;
}

// moves all 2048 numbers in a 2d array of number ags variables to the left
function moveLeft(numbers) {
    let anythingMoved = false;

    // iterate 4 total times to ensure blocks can move as much as possible
    for (let i = 0; i < 4; i++) {
        for (let x = 1; x < 4; x++) {
            for (let y = 0; y < 4; y++) {
                let num = numbers[y * 4 + x];
                let numLeft = numbers[y * 4 + x - 1];

                // if other block is a zero, then swap 
                //   current and left numbers
                if (numLeft.value == 0) {
                    anythingMoved = true;
                    numLeft.value = num.value;
                    num.value = 0;
                } else if (numLeft.value == num.value) {
                    anythingMoved = true;
                    numLeft.value *= 2;
                    num.value = 0;
                }
            }
        }
    }

    if (anythingMoved) {
        addRandomBlock(numbers);
    }
}

// moves all 2048 numbers in a 2d array of number ags variables to the right
function moveRight(numbers) {
    let anythingMoved = false;

    // iterate 4 total times to ensure blocks can move as much as possible
    for (let i = 0; i < 4; i++) {
        for (let x = 2; x >= 0; x--) {
            for (let y = 0; y < 4; y++) {
                let num = numbers[y * 4 + x];
                let numRight = numbers[y * 4 + x + 1];

                // if other block is a zero, then swap 
                //   current and other number
                if (numRight.value == 0) {
                    anythingMoved = true;
                    numRight.value = num.value;
                    num.value = 0;
                } else if (numRight.value == num.value) {
                    anythingMoved = true;
                    numRight.value *= 2;
                    num.value = 0;
                }
            }
        }
    }

    if (anythingMoved) {
        addRandomBlock(numbers);
    }
}


// moves all 2048 numbers in a 2d array of number ags variables down
function moveDown(numbers) {
    let anythingMoved = false;

    // iterate 4 total times to ensure blocks can move as much as possible
    for (let i = 0; i < 4; i++) {
        for (let x = 0; x < 4; x++) {
            for (let y = 2; y >= 0; y--) {
                let num = numbers[y * 4 + x];
                let numBelow = numbers[(y + 1) * 4 + x];

                // if other block is a zero, then swap 
                //   current and other number
                if (numBelow.value == 0) {
                    anythingMoved = true;
                    numBelow.value = num.value;
                    num.value = 0;
                } else if (numBelow.value == num.value) {
                    anythingMoved = true;
                    numBelow.value *= 2;
                    num.value = 0;
                }
            }
        }
    }

    if (anythingMoved) {
        addRandomBlock(numbers);
    }
}

// moves all 2048 numbers in a 2d array of number ags variables up
function moveUp(numbers) {
    let anythingMoved = false;

    // iterate 4 total times to ensure blocks can move as much as possible
    for (let i = 0; i < 4; i++) {
        for (let x = 0; x < 4; x++) {
            for (let y = 1; y < 4; y++) {
                let num = numbers[y * 4 + x];
                let numAbove = numbers[(y - 1) * 4 + x];

                // if other block is a zero, then swap 
                //   current and other number
                if (numAbove.value == 0) {
                    anythingMoved = true;
                    numAbove.value = num.value;
                    num.value = 0;
                } else if (numAbove.value == num.value) {
                    anythingMoved = true;
                    numAbove.value *= 2;
                    num.value = 0;
                }
            }
        }
    }

    if (anythingMoved) {
        addRandomBlock(numbers);
    }
}

export const TwentyFourtyEight = (spacing = 10) => {
    //* 4x4 2d array of ags variables holding references to 
    //*   the TFEBlock numbers, is filled in below loop
    const numbers = Array(4 * 4);

    //* 4x4 grid of 2048 blocks all set to number zero
    const gridChildren = [];
    for (let y = 0; y < 4; y++) {
        const row = [];
        for (let x = 0; x < 4; x++) {
            const block = TFEBlock();
            row.push(block);
            numbers[y * 4 + x] = block.attribute.num
        }
        gridChildren.push(Widget.Box({
            vertical: false,
            spacing,
            homogeneous: true,
            hexpand: true,
            children: row
        }));
    }

    addRandomBlock(numbers);
    addRandomBlock(numbers);

    const grid = Widget.Box({
        vertical: true,
        spacing,
        homogeneous: true,
        children: gridChildren
    });

    return Widget.Button({
        className: "desktop-widget tfe",
        child: grid
    })
        .keybind("Left", () => moveLeft(numbers))
        .keybind("Right", () => moveRight(numbers))
        .keybind("Up", () => moveUp(numbers))
        .keybind("Down", () => moveDown(numbers));
}
