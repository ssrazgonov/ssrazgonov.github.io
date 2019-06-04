"use strict";

const game = document.getElementById("game").getContext("2d");
// intro

let intro = "2374 год, цивилизация планеты земля расширила свои границы в освоении космоса и начала колонизировать прото планеты с приемлимыми условиями проживания во избежание перенаселения колыбели человечества. Ты старшый научный сотрудник компании UCC (utited company colonization) Джек Катнер который поддерживает функционирование работы коробля в пределах своей смены равной одной недели...после выполнения обязанностей ты вернешься в капсулу, а твое место займет твой коллега и так до окончания пути к Эгиде 3, но Джек и понятия не имел что ожидало его в эту смену.";
game.fillStyle = '#3ea76e';
game.font = "16pt Calibri";
game.textAlign = "left";
game.textBaseline = "top";

function wrapText(context, text, marginLeft, marginTop, maxWidth, lineHeight)
{
    var words = text.split(" ");

    var countWords = words.length;

    var line = "";

    for (var n = 0; n < countWords; n++) {

        var testLine = line + words[n] + " ";

        var testWidth = context.measureText(testLine).width;

        if (testWidth + 3 > maxWidth) {

            context.fillText(line, marginLeft, marginTop);

            line = words[n] + " ";

            marginTop += lineHeight;
        }

        else {
            line = testLine;
        }
    }
    
    context.fillText(line, marginLeft, marginTop);
}

wrapText(game, intro, 10, 20, 1000, 15);
