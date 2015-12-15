var app = angular.module("app", []);

app.controller("TodoCtrl", function($scope) {
  $scope.todos = [
    { text: "Task Done", done:true}
    , {text: "Todo Task", done:false}
  ]

  $scope.remaining = function () {
    var done = 0;
    for(i = 0; i < $scope.todos.length; i++) {
      if($scope.todos[i].done)
        done++;
    }
    return done;
  }

  $scope.addTodo = function () {
    $scope.todos.push({text:$scope.todoText, done:false});
    $scope.todoText = '';
  }

  // Remove checked tasks
  $scope.archive = function()  {
    var oldTodos = $scope.todos;
    $scope.todos = [];

    for(i = 0; i < oldTodos.length; i++) {
      if(!oldTodos[i].done)
        $scope.todos.push(oldTodos[i]);
    }

  }
});

app.controller("TimerCtrl", ['$scope', '$interval', function($scope, $interval) {
  $scope.timerDuration = 5;
  $scope.showTimeLeft = false;
  $scope.timerStarted = false;
  $scope.timeLeft = -1; // Display "Timer Expired" when = 0
  $scope.timerHistory = [];

  var timerPromise;
  var startTime = 0;

  $scope.startTimer = function () {
    $scope.showTimeLeft = true;
    $scope.timerStarted = true;
    startTime = new Date().getTime();
    $scope.timeLeft = $scope.timerDuration * 60 * 1000;

    // Add new timer history
    $scope.timerHistory.unshift({start : startTime, end : '- - -'});

    timerDurationMs = $scope.timerDuration * 60 *  1000;

    timerPromise = $interval(function() {
      $scope.timeLeft = timerDurationMs - (new Date().getTime() - startTime);
      if($scope.timeLeft <= 0) {
        $scope.timeOut();
        $scope.stopTimer();
      }
    }, 1000);
  }

  $scope.stopTimer = function () {
    $scope.timerStarted = false;
    $scope.timeLeft = 0;
    $scope.timerHistory[0].end = new Date().getTime();
    $interval.cancel(timerPromise);
  }

  // Play sound on timer timeout
  $scope.timeOut = function () {
    $('#notification').html(
      "<audio autoplay='autoplay'> \
      <source src='resources/notification.mp3' type='audio/mpeg' /> \
      </audio>");
    }
  }]);
