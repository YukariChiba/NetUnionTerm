var terminal_list = []

$.ajaxSetup({
    timeout: 3000
});

function add_terminal() {
    if(terminal_list && terminal_list.length){
        var term_index = Math.max.apply(Math, terminal_list.map(function(o) { return o.term_id; })) + 1;
    } else{
        var term_index = 0;
    }
    var new_term = new terminal_window(term_index)
    new_term.create()
    terminal_list.push(new_term)
}

function close_terminal(term_id_in) {
    terminal_list.find( ({ term_id }) => term_id === term_id_in ).close()
    terminal_list = terminal_list.filter(item => item.term_id !== term_id_in)
}

function terminal_window(term_id) {
    this.term_id = term_id
    this.terminal = null;
}

terminal_window.prototype.create = function () {
    $('#window-container').append('<div class="window" id="term-' + this.term_id + '"><div class="handle" id="handle-term-' + this.term_id + '"><div class="buttons"><button class="close"></button><button class="minimize"></button><button class="maximize"></button></div><span class="title"></span></div><div class="terminal"></div></div>')
    $("#term-" + this.term_id + " .title").text(this.term_id + ". charles@js-fakepc: ~ (js)");
    var date = new Date().toString();
    date = date.substr(0, date.indexOf("GMT") - 1);
    this.terminal = $(".terminal").terminal(terminal_command,
        {
            greetings: "Last login: " + date + " on ttys000\n",
            name: "term-" + this.term_id,
            height: 200,
            prompt: "[charles@js ~]$ "
        }
    );
    $("#term-" + this.term_id).draggable({handle: "#handle-term-" + this.term_id, containment: "body", scroll: false, stack: "div",  opacity: 0.5});
    $("#term-" + this.term_id).resizable({animate: true, containment: "body"});
    $("#term-" + this.term_id).on("click", ".handle .buttons .close", () => close_terminal(this.term_id))
}

terminal_window.prototype.close = function () {
    this.terminal.destroy()
    $("#term-" + this.term_id).remove()
}

function terminal_command(command, term) {
    if (command !== "") {
        try {
            var result = window.eval(command);
            if (result !== undefined) {
                this.echo(new String(result));
            }
        } catch (e) {
            term.pause();
            $.get('https://shell.recruit.netunion.ondev.cn/run', data= {cmd: command}).then(function(response) {
                term.echo(response).resume();
            }).fail(function() {
                term.error("Server timed-out").resume();
            });
        }
    } else {
        this.echo("");
    }
}