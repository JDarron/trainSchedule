
$(document).ready(function () {

    const log = console.log;
    // Initialize Firebase
    const config = {
        apiKey: "AIzaSyC8RqAG06CQb24h6XWo9x4TVkwk672bmhY",
        authDomain: "train-schedule-8fc98.firebaseapp.com",
        databaseURL: "https://train-schedule-8fc98.firebaseio.com",
        projectId: "train-schedule-8fc98",
        storageBucket: "",
        messagingSenderId: "904206211698"
    };

    firebase.initializeApp(config);

    const db = firebase.database().ref();

    const getNewTrainDataFromForm = () => {
        return {
            name: $("#train-name").val().trim(),
            destination: $("#train-destination").val().trim(),
            firstTime: $("#train-firstTime").val().trim(),
            frequency: $("#train-frequency").val().trim()
        };
    };

    const handleNewTrainSubmit = event => {
        event.preventDefault();
        $('#add-train').modal('hide');
        const newTrain = getNewTrainDataFromForm();
        $("#train-form").trigger("reset");
        db.push(newTrain);
    };

    const convertTrainTime = (time) => {
        const firstTime = time.firstTime;
        const tFrequency = time.frequency;
        const firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "years");
        const diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        const tRemainder = diffTime % tFrequency;
        const tMinutesTillTrain = tFrequency - tRemainder;
        const nextTrain = moment().add(tMinutesTillTrain, "minutes");
        return {
            nextArival: moment(nextTrain).format("HH:mm"),
            minutesAway: tMinutesTillTrain
        }
    };

    const appendTrainDataToTable = train => {
        for (var propertyName in train) {
            const convertedTrainTimes = convertTrainTime(train[propertyName]);
            const row = $("<tr>");
            const trainTableData = [
                $("<td>").text(train[propertyName].name),
                $("<td>").text(train[propertyName].destination),
                $("<td>").text(train[propertyName].frequency),
                $("<td>").text(convertedTrainTimes.nextArival),
                $("<td>").text(convertedTrainTimes.minutesAway)
            ];
            row.append(trainTableData);
            $(".train-table").append(row);
        };
    };

    const handleFirebaseValueChange = snap => {
        $(".train-table").empty();
        appendTrainDataToTable(snap.val());
    };

    $(".submit").click(handleNewTrainSubmit);

    db.on("value",
        handleFirebaseValueChange,
        errorObject => log("Errors handled: " + errorObject.code)
    );
});



