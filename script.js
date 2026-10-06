let heldDice = [false, false, false, false, false];
let rollCount = 0;

// Your actual Azure Node.js REST API
const API_BASE_URL = "https://dice-roller-tan-node-h2d7a7b7dthgdnbg.centralus-01.azurewebsites.net";

async function wakeServerAndStart() {
    try {
        const response = await fetch(`${API_BASE_URL}/wake`);

        if (!response.ok) {
            throw new Error(`Wake API returned HTTP ${response.status}`);
        }

        await rollDice();

    } catch (error) {
        console.error("Could not wake the Dice Roller server:", error);
        console.error("Check that the Azure API is running and CORS is configured.");
    }
}

async function getRemoteRoll() {
    const response = await fetch(`${API_BASE_URL}/roll`);

    if (!response.ok) {
        throw new Error(`Roll API returned HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!Number.isInteger(data.roll) || data.roll < 1 || data.roll > 6) {
        throw new Error("The server returned an invalid die value.");
    }

    return data.roll;
}

async function rollDice() {

    rollCount++;

    const rollPromises = [];

    for (let i = 0; i < 5; i++) {

        if (heldDice[i] === false) {

            rollPromises.push(
                getRemoteRoll().then(roll => {
                    document.getElementById("die" + (i + 1)).value = roll;
                })
            );
        }
    }

    try {

        await Promise.all(rollPromises);

        document.getElementById("rollCount").textContent =
            "Rolls: " + rollCount;

    } catch (error) {

        rollCount--;

        console.error("Could not roll the dice:", error);
    }
}

function toggleHold(dieNumber) {

    let index = dieNumber - 1;

    heldDice[index] = !heldDice[index];

    let die = document.getElementById("dieContainer" + dieNumber);
    let holdText = document.getElementById("hold" + dieNumber);

    if (heldDice[index]) {

        die.classList.add("held");
        holdText.textContent = "HELD";

    } else {

        die.classList.remove("held");
        holdText.textContent = "Click to Hold";
    }
}

async function newTurn() {

    heldDice = [false, false, false, false, false];
    rollCount = 0;

    for (let i = 1; i <= 5; i++) {

        document.getElementById("dieContainer" + i)
            .classList.remove("held");

        document.getElementById("hold" + i).textContent =
            "Click to Hold";

        document.getElementById("die" + i).value = "";
    }

    await rollDice();

    document.getElementById("rollButton").focus();
}