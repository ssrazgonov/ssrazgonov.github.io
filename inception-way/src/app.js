$(document).ready(function(){
    
    let state = localStorage.getItem('state') ? localStorage.getItem('state') : "day1";

    saveState(state);

    showState(state);

    function showState (state) {
        switch (state) {
            case 'intro':
                intro ();
                break;
            case 'day1':
                day1();
                break;
            default:
                break;
        }
    }

    function intro () {
        $('.intro').show();
        $('.introBtn').on('click', function(){
            nextState('.intro', 'day1');
        });
    }

    function day1 () {

        let find = false;
        let nextPhase = function () {
            alert('NEXT PHASE');
        };

        $('.day1').show();
        $('.chooseClearSignal').on('click', function(){
            $('.chooseClearSignalUl').show();
        });

        $('.chooseClear1').on('click', function(){
            let text = $('.terminal').text();
            text = text.replace(/#/, '');
            $('.terminal').text(text);
        });

        $('.chooseClear2').on('click', function(){
            let text = $('.terminal').text();
            text = text.replace(/%/, '');
            $('.terminal').text(text);
        });

        $('.chooseInputSignal').on('click', function(){
            if (find) {
                return false;
            }

            if ($('.terminal').text().trim() == 'Частота 187.535') {
                $(this).text('Сигнал найден');
                find = true;
                setTimeout(function(){
                    nextPhase();
                }, 500);
            }else {
                
                $(this).text('Частота не найдена');

                setTimeout(function(){
                    $('.chooseInputSignal').text('Ввести сигнал в поиск');
                }, 500);
            }
            return false;
        });
    }

    function nextState (currState, nextState) {
        closeState(currState);
        showState(nextState);
        saveState(nextState);
    }

    function saveState (sate) {
        // localStorage.setItem('state', state);
    }

    function closeState (state) {
        $(state).hide();
    }

});