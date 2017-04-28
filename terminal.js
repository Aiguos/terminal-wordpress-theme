/* This code is based off code by Atul Bhats, you can see the original at http://atulbhats.com/terminal */
/* However there are a lot of changes and cleanups to make this work with wordpress with dynamic commands */
/* Allowing you to hopefully use Wordpress as you feel like it and this should dynamically work with it */
/* TODO: Remove all traces of JQuery as it'd be one less dependency */
/* TODO: Theming? */
/* TODO: Setup posts to be a directory */
/* Maybe make this DOS themed? */

var $history = new Array();

var $commands = [
  {cmd: 'help',   hidden: false,    clear: false,   type: 'function',   output: show_available_commands,    help: 'Lists all available commands'},
  {cmd: 'cls',    hidden: false,    clear: true,    type: 'print',      output: '',                         help: 'Clear the screen'},
  {cmd: 'dir',    hidden: false,    clear: false,   type: 'print',      output: '',                         help: 'Show directories or files in current directory'},
  {cmd: 'date',   hidden: false,    clear: false,   type: 'print',      output: '',                         help: 'Display the current date and time'},
  {cmd: 'type',   hidden: false,    clear: false,   type: 'print',      output: '',                         help: 'Display a given file'},
  {cmd: 'xyzzy',  hidden: true,     clear: false,   type: 'print',      output: 'Nothing happens',          help: 'Nothing happens'}
];

function hidedefault() {
  $('#defaultline').hide();
}

function showdefault() {
  $('#defaultline').show();
}

function find_tab_completed_command(command) {
  if (!command)
    return command;

  /* Loop through the list of commands and find if there is enough information for a single match */
  var results = [];
  for (var i = 0; i < $commands.length; i ++) {
    cmd = $commands[i];
    if (cmd.cmd.startsWith(command) && cmd.hidden == false) {
      results.push(cmd.cmd);
    }
  }

  return {command: command, results: results};
}

function print_parameters(parameters) {
  return parameters.join("&#09;");
}

function show_available_commands(parameters) {
  var print = "<div class='help'>";

  for (var i = 0; i < $commands.length; i ++) {
    cmd = $commands[i];
    if (cmd.hidden == false) {
      print += "<div><b>" + cmd.cmd + "</b>" + cmd.help + "</div>";
    }
  }

  print += "</div>";
  return print;
}

function outputText(outputText) {
  $('#defaultline').before('<div class="line" id="line'+$l+'"></div>');
  $('#line'+$l).html(outputText);
  $('#commandcontainer').text("");
  $('#actualinput').val("");
  $l++;
  if($clr==1){
    $l=0;
    $('.line').remove();
    $('.commandline').remove();
    $clr=0;
  }
  $('#actualinput').focus();
  $(document).scrollTop($(document).height());
}

function runcommand($command) {
  unnull();
  $command = $command.toLowerCase();

  $command2=$command;
  rehistory($command);
  $history[$z]=$command;
  $z++;
  $x=$z;
  // }
  $('#defaultline').before('<div class="commandline" id="commandline'+$l+'"><span class="defaulttext">C:\\> </span>'+$command2+'</div>');

  var given_commands = $command.split(" ");
  var command = given_commands[0];
  var parameters = [];
  if (given_commands.length > 1) {
    parameters = given_commands.slice(1, given_commands.length);
  }

  var found_command = false;

  for (var i = 0; i < $commands.length; i ++) {
    cmd = $commands[i];
    if (cmd.cmd == command) {
      found_command = true;
      // Found a matching command, lets action it.
      if (cmd.type == 'function') {
        var fn = cmd.output;
        $html = fn(parameters);
      } else if (cmd.type == 'print') {
        $html = cmd.output;
      }

      $clr = 0;
      if (cmd.clear) {
        $clr = 1;
      }
    }
  }

  if (!found_command) {
    $html="\'"+$command+"\' Is not a known Command. But that might change the next time you are here. Use '<b>help</b>' for the list of available commands";
  }

  outputText($html);
}

function unnull(){
  for($i=0;$i<$history.length;$i++){
    if($history[$i]=="" || $history[$i]==null || $history[$i]==undefined ){
      for($j=$i;$j<$history.length;$j++){
        $history[$j]=$history[$j+1];
      }
      $z--;
    }
  }
  $z=$history.length;
}

function rehistory($cmd){
  if($history.indexOf($cmd)>=0){
    for($i=$history.indexOf($cmd);$i<$history.length;$i++){
      $history[$i]=$history[$i+1];
    }
    $z--;
  }
} 


$(document).ready(function() {

  $('#introdiv').html('');

  $z=0;
  $x=0;
  $('#actualinput').focus();
  hidedefault();
  $('.cursor').css('background','rgb(238, 238, 238)');  
  $link="";
  $sendact=0;
  $clr=0;
  $save=0;

  $('#introdiv').html(frontpage + "<br />Start with <b>help</b> to learn the commands.");
  showdefault();

  setInterval(function(){
          blinkcursor();
        },560);

  function blinkcursor(){
    $bg=$('.cursor').css('background-color');
    if($bg=='rgb(238, 238, 238)'){
      
      $('.cursor').css('background-color','transparent'); 
    }
    else $('.cursor').css('background-color','rgb(238, 238, 238)');
  }

  $l=0;  

  $(document).bind('keyup', function(e) {
    $existing=$('#commandcontainer').text();

    if(e.which==38){
      if($x>0){
        $('#actualinput').val($history[$x-1]);
        $('#commandcontainer').text($history[$x-1]);
        $x--;
        if($x<0)
          $x=0; 
      }
      if($x<0){
        return false;
      }
      
    }
    else if(e.which==40){
      if($x>=0){
        $('#commandcontainer').text($history[$x+1]);
        $('#actualinput').val($history[$x+1]);
        $x++;
      }
      if($x>$z){
        return false;
      }
    }
    if(e.which==13){
      runcommand($existing);
      $('#actualinput').focus();
    }
    else{
      $type=true;
    }
  });

  $(document).bind('keydown', function(e) {
    var existing = $('#commandcontainer').text();
    var code = e.keyCode || e.which;
    if (code == '9') {
      var results = find_tab_completed_command(existing);
      if (results.results.length > 1) {
        $('#defaultline').before('<div class="commandline" id="commandline'+$l+'"><span class="defaulttext">C:\\> </span>'+results.command+'</div>');
        outputText(results.results.join("&#09;"));
      } else {
        $('#actualinput').val(results.command);
        if (results.results.length == 1) {
          $('#actualinput').val(results.results[0]);
        }
      }

      return false;
    }
  });

  $('#actualinput').keyup(function(e){
    if(e.which==8){
        $exist=$('#commandcontainer').text();
        /*delete pressed */
        e.preventDefault();
        /*alert('del');*/
        $c=$exist.length-1;
        $('#commandcontainer').text($exist.slice(0,$c));
    }
      else{
        /*alert("pressed : "+e.which);*/
      $('#commandcontainer').text($(this).val());
    }
  });

  $('body').click(function(){
    $('body').scrollTop($(window).height());
  });

  $(document).on("tap", function(e) {
    $('#actualinput').focus();
  });

  $(document).keydown(function(e) {
    $('#actualinput').focus();
  });  
});