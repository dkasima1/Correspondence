//---------------------------------- Some Annoying but Necessary Global Variables ----------------------------------//

/* Load List */
var load = [1, 2, 3, 4, 5, 6, 7]

/* Color List */
var colors = ['red', 'blue', 'green', 'orange', 'yellow', 'pink', 'gray', 'purple']

/* Present/Absent Condition */
var present_absent = ['yes', 'no']

/* Trial List */
var trial_list = create_trial_database(load, present_absent);
shuffle(trial_list);

/* Total Trials depending on number of conditions. */
var numTrials = trial_list.length;

/* Make sure we don't collect information in between Trials. */
var response_acceptable = false;

/* Current Trial Number */
var curr = 0;

/* Stimuli List for Left Side */
var stimuliListLeft = [];

/* Stimuli List for Right Side */
var stimuliListRight = [];

/* Stores Trial Data */
var trial_data = [];

/* Measures reaction time. */
var rt = 0;

/* Start time */
var start = 0;
//---------------------------------- Functions for Direct Trial Handling ----------------------------------//

/* Creates the Trial_list based on conditions. */
function create_trial_database(load, present_absent) {
    var trial_list = [];
    for (let i = 0; i < load.length; i++) {
        for (let j = 0; j < present_absent.length; j++) {
            trial_list.push([load[i], present_absent[j]]); 
        }
    }
    var tempList = [];
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < trial_list.length; j++) {
            tempList.push(trial_list[j]);
        }
    }
    trial_list = tempList;
    return trial_list;
}

/* Hides the instruction screen and calls start_trial to begin the first trial.
 */
function startExperiment() {
    $("h2").hide();
    $("h4").hide();
    $("img").hide();
    $("button").hide();
    $(".outline").show();
    $("#borders").show();
    start_trial(curr, numTrials, trial_list);
}

/* Starts a trial by checking if the total number of trials hasn't been met.
 * Calls draw_stimuli. 
 */
function start_trial(curr, numTrials, trial_list) {
    if (curr < numTrials) {
        drawStimuli(trial_list[curr], stimuliListLeft, stimuliListRight);
        response_acceptable = true;
    } else {
        $(".outline").hide();
        $("#borders").hide();
        $("#final_instructions").show();
        var subj = randomString();
        document.write("Please email this code to dkasima1@jhu.edu to receive credit: " + subj);
        var dataString = JSON.stringify(trial_data);
        $.post("logTrial.py", {
            subjectID: subj,
            dataString: dataString
        });
    }
}

function randomString() {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 6;
    var randomstring = '';
    for (var i=0; i<string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum,rnum+1);
    }
    return randomstring;
}

// Get Subject ID
function getSubjectID(){
    var paramstr = window.location.search.substring(1);
    var parampairs = paramstr.split("&");
    for (i in parampairs){
        var pair = parampairs[i].split("=");
        if(pair[0] == "workerId")
            return pair[1];
    }
    return 'noSubjectId'
}

/* Creates the correct number of stimuli and draws onto the screen.
 * Makes use of various helper functions.
 */
function drawStimuli(trial, stimuliListLeft, stimuliListRight) {
    shuffle(colors);
    for (let i = 0; i < trial[0]; i++) {
        stimuliListLeft.push(document.createElement('div'));
        stimuliListRight.push(document.createElement('div'));
    }
    positionList = generatePositions(trial[0]);
    for (let i = 0; i < trial[0]; i++) {
        stimuliListLeft[i].className = "square";
        stimuliListLeft[i].style.left = positionList[i][0] +'px';
        stimuliListLeft[i].style.top = positionList[i][1] + 'px';
        stimuliListLeft[i].style.backgroundColor = colors[i];
        document.getElementsByTagName("body")[0].appendChild(stimuliListLeft[i]);
        stimuliListRight[i].className = "square";
        stimuliListRight[i].style.left = positionList[i][0] + 587 + 'px';
        stimuliListRight[i].style.top = positionList[i][1] + 'px';
        stimuliListRight[i].style.backgroundColor = stimuliListLeft[i].style.backgroundColor;
        document.getElementsByTagName("body")[0].appendChild(stimuliListRight[i]);
    }
    if (trial[1] == 'yes') {
        var randomNum = Math.floor(getRandomArbitrary(0, trial[0]));
        stimuliListRight[randomNum].style.backgroundColor = colors[7];
    }
    start = Date.now();
}

/* Waits for keyboard input.
 * Calls clearTrial. 
 */
document.addEventListener("keypress", function(key) {
    var bod = document.getElementsByTagName("body")[0];
    if (response_acceptable) {
        if (key.keyCode == 100 || key.keyCode == 115) {
            rt = Date.now() - start;
            let keyPress = String.fromCharCode(key.keyCode);
            let ans;
            if (keyPress == 's') {
                ans = 'no';
            } else {
                ans = 'yes';
            }
            clearTrial(keyPress, ans, rt);
        }
    }
});

/* Erases previous on screen stimuli and calls start_trial. */
function clearTrial(keyPress, ans, rt) {
    var bod = document.getElementsByTagName("body")[0];
    var correct = 0;
    if (ans == trial_list[curr][1]) {
        correct = 1;
    }
    let left_pos_color = {};
    let right_pos_color = {};
    for (let i = 0; i < trial_list[curr][0]; i++) {
        left_pos_color[stimuliListLeft[i].style.backgroundColor] = [stimuliListLeft[i].style.left, stimuliListLeft[i].style.top];
        right_pos_color[stimuliListRight[i].style.backgroundColor] = [stimuliListRight[i].style.left, stimuliListRight[i].style.top];
        bod.removeChild(stimuliListRight[i]);
        bod.removeChild(stimuliListLeft[i]);
        if (i == trial_list[curr][0] - 1) {
            response_acceptable = false;
            trial_data.push({'trial_id': curr, 'load': trial_list[curr][0], 'present_absent': trial_list[curr][1],
            'reaction_time': rt, 'resp': keyPress, 'correct': correct, 'left_pos_color': left_pos_color, 'right_pos_color': right_pos_color});
            console.log(trial_data);
            curr++;
            break;
        }
    }
    setTimeout(function(){start_trial(curr, numTrials, trial_list)}, 250);
}

//---------------------------------- A BUNCH OF HELPER FUNCTIONS ----------------------------------//


/* Generates random X position within the correct pixel boundry. */
function randomNumLeftX() {
    return getRandomArbitrary(95, 545); // 28, 478
}

/* Generates random Y position within the correct pixel boundry. */
function randomNumLeftY() {
    return getRandomArbitrary(107, 557); // 40, 490
}

/* Generate a random number between min (inclusive) and max (exclusive). */
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

/* Shuffles the arrays. */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
      [array[i], array[j]] = [array[j], array[i]]; // swap elements
    }
}

/* Generates and returns the Position list. */
function generatePositions(load) {
    var posList = [];
    var tempList = [0, 0];
    for (let i = 0; i < load; i++) {
        posList.push(tempList);
    }
    var positionX = 0;
    var positionY = 0;
    for (let i = 0; i < load; i++) {
        positionX = randomNumLeftX();
        positionY = randomNumLeftY();
        while (tooClose(posList, positionX, positionY)) {
            positionX = randomNumLeftX();
            positionY = randomNumLeftY();
        }
        posList[i] = [positionX, positionY];
    }
    return posList;
}

/* Checks if the square positions are too close. */
function tooClose(positionList, positionX, positionY) {
    for (var i = 0; i < positionList.length; i++) {
        if (Math.abs(positionList[i][0] - positionX) < 55 && Math.abs(positionList[i][1] - positionY) < 55) {
            return true;
        } 
    }
    return false;
} 
