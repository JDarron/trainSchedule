
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
        };
    };

    const createDeleteButton = childId => {
        const deleteBtn = $("<button>");
        const deleteImg = $("<img>");
        deleteImg.attr("src", "./assets/images/trash.ico");
        deleteImg.attr("height", "20");
        deleteBtn.html(deleteImg);
        deleteBtn.addClass("btn btn-danger");
        deleteBtn.attr("value", childId);
        deleteBtn.attr("data-toggle", "modal");
        deleteBtn.attr("data-target", "#delete-train");
        return deleteBtn;
    };

    const appendTrainDataToTable = train => {
        for (var propertyName in train) {
            const convertedTrainTimes = convertTrainTime(train[propertyName]);
            const deleteBtn = createDeleteButton(propertyName);
            const row = $("<tr>");
            const trainTableData = [
                $("<td>").text(train[propertyName].name),
                $("<td>").text(train[propertyName].destination),
                $("<td>").text(train[propertyName].frequency),
                $("<td>").text(convertedTrainTimes.nextArival),
                $("<td>").text(convertedTrainTimes.minutesAway),
                $("<td>").html(deleteBtn)
            ];
            row.append(trainTableData);
            $(".train-table").append(row);
        };
    };

    $('#delete-train').on('show.bs.modal', e => {
        const train = $(e.relatedTarget).val();
        $(".delete").attr("value", train);
    });

    const handleFirebaseValueChange = snap => {
        $(".train-table").empty();
        appendTrainDataToTable(snap.val());
    };

    $(".delete").click(function () {
        $('#delete-train').modal('hide');
        db.child($(this).val()).remove();
    });

    $(".submit").click(handleNewTrainSubmit);

    db.on("value",
        handleFirebaseValueChange,
        errorObject => log("Errors handled: " + errorObject.code)
    );
});



