// ==UserScript==
// @name         Dragons Chat Script
// @namespace    http://tampermonkey.net/
// @version      0.11
// @description  try to take over the world!
// @author       Mohnki
// @match        https://w11.crownofthegods.com/*
// @grant        none
// @require      https://cdnjs.cloudflare.com/ajax/libs/socket.io/1.3.5/socket.io.min.js
// ==/UserScript==

(function() {
    var content = $('#chatDisplaya');
    var share_button = '<button id="c_a_share" class="greenb tooltip tooltipstered">C-A Share</button>';
    const messages = document.getElementById('chatDisplaya');

    $('body').append(share_button);
    $("#c_a_share").insertBefore("#sharereportcode");

    $('#c_a_share').click(function() {
        var share_id = $("#sharereportcode span").attr('data');
        var report = '<span class="replink gFrep" style="color:#7979FF !important" data="'+share_id+'">Report: '+share_id+'</span>';
        addMessage(cotg.player.name(), report, "", "");
        connection.send(report);
    });

    function discord_post(message) {
        var url = "https://discordapp.com/api/webhooks/429888688521084929/WMkmbUurNzzk0Xl-e9DJLijndniE4tAfwr85QEUD-fKAzLF3xqk1mfNrOE3bAeOWdje_";
        var request = new XMLHttpRequest();
        var params = "content=["+cotg.player.alliance()+"] "+cotg.player.name()+": " + message;
        request.open('POST', url, true);
        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        request.send(params);
    }

    cotgsubscribe.subscribe( "chat", function( data ) {
        if(data.type=='alliance' && data.player == cotg.player.name()) {
            connection.send(data.message);
            discord_post(data.message);
        }
        return data;
    }, 2 );

    function addMessage(author, message, color, dt, alliance) {
        content.append('<div style="overflow:hidden;"><span style="color:white">#</span><span style="color:#78b042">['+alliance+'] </span><span style="color:#78b042"><span class="playerlink" data="'+author+'">'+author+'</span>: '+message+'</span><br></div>');
        messages.scrollTop = messages.scrollHeight;
    }

    window.WebSocket = window.WebSocket || window.MozWebSocket;

    var connection = new WebSocket('wss://www.firehawk.co.za/cotg_chat/');

    connection.onopen = function () {
        connection.send(cotg.player.name() + "-" + cotg.player.alliance());
    };

    connection.onerror = function (error) {
        console.log(error);
    };

    connection.onmessage = function (message) {
        try {
            var json = JSON.parse(message.data);
            //console.log(json);
            if(json.type === 'message'){
                if(json.data.alliance != cotg.player.alliance()){
                    addMessage(json.data.author, json.data.text,
                               json.data.color, new Date(json.data.time),
                               json.data.alliance);
                }
            } else if (json.type === 'history') { // entire message history
                // insert every single message to the chat window
                for (var i=0; i < json.data.length; i++) {
                    //console.log(json.data[i]);
                    addMessage(json.data[i].author, json.data[i].text,
                               json.data[i].color, new Date(json.data[i].time),
                               json.data[i].alliance);
                }

            }
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ',
                        message.data);
            return;
        }
    };

    setInterval(function(){
        connection.send('KEEPALIVE');
    }, 10000);

    //cotg.chat.connect();
    //cotg.chat.alliance(' has come online');
})();
