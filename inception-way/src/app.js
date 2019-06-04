$(document).ready(function(){
    
    let state = localStorage.getItem('state') ? localStorage.getItem('state') : "intro";

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
        $('.day1').show();
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